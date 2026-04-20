const cron = require('node-cron');
const prisma = require('../config/db');

const autoClosePositions = async () => {
  try {
    const now = new Date();
    const result = await prisma.position.updateMany({
      where: {
        status: 'OPEN',
        deadline: { lt: now },
      },
      data: { status: 'CLOSED' },
    });

    if (result.count > 0) {
      console.log(`[Cron] Auto-closed ${result.count} expired position(s)`);
    }
  } catch (err) {
    console.error('[Cron] Auto-close failed:', err.message);
  }
};

const startCronJobs = () => {
  // Run every hour at minute 0
  cron.schedule('0 * * * *', autoClosePositions);

  // Also run once immediately on server startup
  autoClosePositions();

  console.log('Cron jobs scheduled');
};

module.exports = { startCronJobs };