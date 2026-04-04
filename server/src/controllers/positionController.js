const prisma = require('../config/db');

// GET /api/positions — Public, list all open positions
const getPositions = async (req, res, next) => {
  try {
    const { type, search, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { status: 'OPEN' };

    if (type && ['TA', 'RA'].includes(type)) {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { courseNumber: { contains: search, mode: 'insensitive' } },
        { researchArea: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [positions, total] = await Promise.all([
      prisma.position.findMany({
        where,
        include: {
          professor: { select: { name: true, department: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.position.count({ where }),
    ]);

    res.json({
      positions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/positions/:id — Public, single position details
const getPositionById = async (req, res, next) => {
  try {
    const position = await prisma.position.findUnique({
      where: { id: req.params.id },
      include: {
        professor: { select: { name: true, email: true, department: true } },
      },
    });

    if (!position) {
      return res.status(404).json({ error: 'Position not found.' });
    }

    res.json(position);
  } catch (err) {
    next(err);
  }
};

// POST /api/positions — Professor only, create position
const createPosition = async (req, res, next) => {
  try {
    const { title, type, courseNumber, researchArea, description, requirements, hoursPerWeek, compensation, deadline } = req.body;

    const position = await prisma.position.create({
      data: {
        professorId: req.professorId,
        title,
        type,
        courseNumber: courseNumber || null,
        researchArea: researchArea || null,
        description,
        requirements,
        hoursPerWeek: parseInt(hoursPerWeek),
        compensation,
        deadline: new Date(deadline),
      },
    });

    res.status(201).json(position);
  } catch (err) {
    next(err);
  }
};

// PUT /api/positions/:id — Professor only, update own position
const updatePosition = async (req, res, next) => {
  try {
    const position = await prisma.position.findUnique({ where: { id: req.params.id } });

    if (!position) {
      return res.status(404).json({ error: 'Position not found.' });
    }
    if (position.professorId !== req.professorId) {
      return res.status(403).json({ error: 'You can only edit your own positions.' });
    }

    const updated = await prisma.position.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/positions/:id/close — Professor only, close position
const closePosition = async (req, res, next) => {
  try {
    const position = await prisma.position.findUnique({ where: { id: req.params.id } });

    if (!position) {
      return res.status(404).json({ error: 'Position not found.' });
    }
    if (position.professorId !== req.professorId) {
      return res.status(403).json({ error: 'You can only close your own positions.' });
    }
    if (position.status === 'CLOSED') {
      return res.status(400).json({ error: 'Position is already closed.' });
    }

    const closed = await prisma.position.update({
      where: { id: req.params.id },
      data: { status: 'CLOSED' },
    });

    res.json({ message: 'Position closed successfully.', position: closed });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/positions/:id — Professor only, permanently delete
const deletePosition = async (req, res, next) => {
  try {
    const position = await prisma.position.findUnique({ where: { id: req.params.id } });

    if (!position) {
      return res.status(404).json({ error: 'Position not found.' });
    }
    if (position.professorId !== req.professorId) {
      return res.status(403).json({ error: 'You can only delete your own positions.' });
    }

    // Cascade delete handled by Prisma schema
    await prisma.position.delete({ where: { id: req.params.id } });

    res.json({ message: 'Position and all associated applications permanently deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPositions,
  getPositionById,
  createPosition,
  updatePosition,
  closePosition,
  deletePosition,
};
