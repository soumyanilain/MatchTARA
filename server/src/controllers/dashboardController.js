const prisma = require('../config/db');

// GET /api/dashboard/my-positions — Professor's positions with app counts
const getMyPositions = async (req, res, next) => {
  try {
    const positions = await prisma.position.findMany({
      where: { professorId: req.professorId },
      include: {
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Summary stats
    const totalPositions = positions.length;
    const openPositions = positions.filter(p => p.status === 'OPEN').length;
    const closedPositions = positions.filter(p => p.status === 'CLOSED').length;
    const totalApplications = positions.reduce((sum, p) => sum + p._count.applications, 0);

    res.json({
      positions,
      stats: {
        totalPositions,
        openPositions,
        closedPositions,
        totalApplications,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/dashboard/recent-applications — Latest apps across all positions
const getRecentApplications = async (req, res, next) => {
  try {
    const applications = await prisma.application.findMany({
      where: {
        position: { professorId: req.professorId },
      },
      include: {
        position: { select: { title: true, type: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    res.json(applications);
  } catch (err) {
    next(err);
  }
};

module.exports = { getMyPositions, getRecentApplications };
