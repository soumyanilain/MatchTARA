const router = require('express').Router();
const { register, verifyEmail, login, getMe, resendVerification } = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/register', register);
router.get('/verify/:token', verifyEmail);
router.post('/login', login);
router.post('/resend-verification', resendVerification);
router.get('/me', auth, getMe);

module.exports = router;