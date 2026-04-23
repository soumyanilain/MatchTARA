const prisma = require('../config/db');
const {
  sendApplicationNotification,
  sendStatusUpdateEmail,
  sendApplicationConfirmation,
} = require('../utils/email');

// POST /api/applications — Public, submit application
const submitApplication = async (req, res, next) => {
  try {
    const { positionId, studentName, studentEmail, statement } = req.body;

    // Validate student email is a university (.edu) email
    if (!studentEmail || !studentEmail.toLowerCase().trim().endsWith('.edu')) {
      return res.status(400).json({
        error: 'Only university (.edu) email addresses can apply. Please use your student email.'
      });
    }

    // Check position exists and is open
    const position = await prisma.position.findUnique({
      where: { id: positionId },
      include: { professor: { select: { email: true, name: true } } },
    });

    if (!position) {
      return res.status(404).json({ error: 'Position not found.' });
    }
    if (position.status !== 'OPEN') {
      return res.status(400).json({ error: 'This position is no longer accepting applications.' });
    }
    if (new Date(position.deadline) < new Date()) {
      return res.status(400).json({ error: 'The application deadline has passed.' });
    }

    // Check for duplicate
    const existing = await prisma.application.findUnique({
      where: {
        positionId_studentEmail: { positionId, studentEmail },
      },
    });
    if (existing) {
      return res.status(409).json({ error: 'You have already applied to this position.' });
    }

    // Handle resume file
    if (!req.file) {
      return res.status(400).json({ error: 'Resume (PDF) is required.' });
    }

    const application = await prisma.application.create({
      data: {
        positionId,
        studentName,
        studentEmail,
        statement,
        resumeUrl: req.file.filename,
      },
    });

    // Send notification to professor (non-blocking)
    sendApplicationNotification(position.professor.email, position.title, studentName);

    // Send confirmation email to the student (non-blocking)
    sendApplicationConfirmation(studentEmail, studentName, position.title, position.professor.name);

    res.status(201).json({
      message: 'Application submitted successfully!',
      application: {
        id: application.id,
        positionId: application.positionId,
        studentName: application.studentName,
        status: application.status,
        createdAt: application.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/applications/position/:positionId — Professor only
const getApplicationsByPosition = async (req, res, next) => {
  try {
    const { positionId } = req.params;
    const { status, sort = 'desc' } = req.query;

    const position = await prisma.position.findUnique({ where: { id: positionId } });
    if (!position) {
      return res.status(404).json({ error: 'Position not found.' });
    }
    if (position.professorId !== req.professorId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const where = { positionId };
    if (status && ['PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED'].includes(status)) {
      where.status = status;
    }

    const applications = await prisma.application.findMany({
      where,
      orderBy: { createdAt: sort === 'asc' ? 'asc' : 'desc' },
    });

    const counts = await prisma.application.groupBy({
      by: ['status'],
      where: { positionId },
      _count: true,
    });

    res.json({ applications, statusCounts: counts, total: applications.length });
  } catch (err) {
    next(err);
  }
};

// GET /api/applications/:id — Professor only, single application
const getApplicationById = async (req, res, next) => {
  try {
    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: { position: { select: { professorId: true, title: true } } },
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found.' });
    }
    if (application.position.professorId !== req.professorId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    res.json(application);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/applications/:id/status — Professor only
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value.' });
    }

    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: { position: { select: { professorId: true, title: true } } },
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found.' });
    }
    if (application.position.professorId !== req.professorId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const oldStatus = application.status;
    const updated = await prisma.application.update({
      where: { id: req.params.id },
      data: { status, statusUpdatedAt: new Date() },
    });

    if (oldStatus !== status) {
      sendStatusUpdateEmail(
        application.studentEmail,
        application.studentName,
        application.position.title,
        status
      );
    }

    res.json({ message: `Application status updated to ${status}.`, application: updated });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  submitApplication,
  getApplicationsByPosition,
  getApplicationById,
  updateApplicationStatus,
};