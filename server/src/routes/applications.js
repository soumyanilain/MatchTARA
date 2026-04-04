const router = require('express').Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  submitApplication,
  getApplicationsByPosition,
  getApplicationById,
  updateApplicationStatus,
} = require('../controllers/applicationController');

// Public — submit application with resume upload
router.post('/', upload.single('resume'), submitApplication);

// Protected — professor only
router.get('/position/:positionId', auth, getApplicationsByPosition);
router.get('/:id', auth, getApplicationById);
router.patch('/:id/status', auth, updateApplicationStatus);

module.exports = router;
