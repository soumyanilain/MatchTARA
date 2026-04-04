const router = require('express').Router();
const auth = require('../middleware/auth');
const { getMyPositions, getRecentApplications } = require('../controllers/dashboardController');

router.get('/my-positions', auth, getMyPositions);
router.get('/recent-applications', auth, getRecentApplications);

module.exports = router;
