const router = require('express').Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const path = require('path');
const {
  submitApplication,
  getApplicationsByPosition,
  getApplicationById,
  updateApplicationStatus,
} = require('../controllers/applicationController');
const prisma = require('../config/db');

// Public — submit application with resume upload
router.post('/', upload.single('resume'), submitApplication);

// Protected — professor only
router.get('/position/:positionId', auth, getApplicationsByPosition);

// Protected — download resume (MUST come before /:id to avoid route conflict)
router.get('/:id/resume', auth, async (req, res, next) => {
  try {
    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: { position: { select: { professorId: true } } },
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found.' });
    }
    if (application.position.professorId !== req.professorId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const filePath = path.join(__dirname, '../../uploads', application.resumeUrl);
    const downloadName = `${application.studentName.replace(/[^a-z0-9]/gi, '_')}_resume.pdf`;

    res.download(filePath, downloadName, (err) => {
      if (err) {
        console.error('Download error:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed to download resume.' });
        }
      }
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', auth, getApplicationById);
router.patch('/:id/status', auth, updateApplicationStatus);

module.exports = router;