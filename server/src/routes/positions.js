const router = require('express').Router();
const auth = require('../middleware/auth');
const {
  getPositions,
  getPositionById,
  createPosition,
  updatePosition,
  closePosition,
  deletePosition,
} = require('../controllers/positionController');

// Public routes
router.get('/', getPositions);
router.get('/:id', getPositionById);

// Protected routes (professor only)
router.post('/', auth, createPosition);
router.put('/:id', auth, updatePosition);
router.patch('/:id/close', auth, closePosition);
router.delete('/:id', auth, deletePosition);

module.exports = router;
