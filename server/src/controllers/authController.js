const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const prisma = require('../config/db');
const { sendVerificationEmail } = require('../utils/email');
const { ALLOWED_PROFESSOR_EMAILS } = require('../config/whitelist');

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, department } = req.body;

    // Check for valid .edu domain
    if (!email.endsWith('.edu')) {
      return res.status(400).json({ error: 'Only university (.edu) email addresses are accepted.' });
    }

    // Check whitelist
    if (!ALLOWED_PROFESSOR_EMAILS.includes(email.toLowerCase())) {
      return res.status(403).json({ error: 'This email is not authorized to register.' });
    }

    // Check if account exists
    const existing = await prisma.professor.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Hash password and create verification token
    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = uuidv4();
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const professor = await prisma.professor.create({
      data: {
        name,
        email,
        passwordHash,
        department,
        verificationToken,
        tokenExpiresAt,
      },
    });

    // Send verification email (non-blocking)
    sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      message: 'Account created. Please check your email to verify your account.',
      professorId: professor.id,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/verify/:token
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    const professor = await prisma.professor.findFirst({
      where: {
        verificationToken: token,
        tokenExpiresAt: { gt: new Date() },
      },
    });

    if (!professor) {
      return res.status(400).json({ error: 'Invalid or expired verification token.' });
    }

    await prisma.professor.update({
      where: { id: professor.id },
      data: {
        isVerified: true,
        verificationToken: null,
        tokenExpiresAt: null,
      },
    });

    res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check whitelist before hitting the database
    if (!ALLOWED_PROFESSOR_EMAILS.includes(email.toLowerCase())) {
      return res.status(403).json({ error: 'This email is not authorized to access the platform.' });
    }

    const professor = await prisma.professor.findUnique({ where: { email } });

    // Generic error to prevent account enumeration
    if (!professor) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (!professor.isVerified) {
      return res.status(403).json({ error: 'Please verify your email before logging in.' });
    }

    const validPassword = await bcrypt.compare(password, professor.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: professor.id, email: professor.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      token,
      professor: {
        id: professor.id,
        name: professor.name,
        email: professor.email,
        department: professor.department,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const professor = await prisma.professor.findUnique({
      where: { id: req.professorId },
      select: { id: true, name: true, email: true, department: true },
    });

    if (!professor) {
      return res.status(404).json({ error: 'Professor not found.' });
    }

    res.json(professor);
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/resend-verification
const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const professor = await prisma.professor.findUnique({ where: { email } });

    // Generic success message to prevent account enumeration
    // (don't reveal whether the email exists)
    if (!professor) {
      return res.json({
        message: 'If an unverified account exists for this email, a new verification link has been sent.',
      });
    }

    if (professor.isVerified) {
      return res.status(400).json({
        error: 'This account is already verified. You can log in directly.',
      });
    }

    // Generate a new token and invalidate the old one
    const verificationToken = uuidv4();
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.professor.update({
      where: { id: professor.id },
      data: { verificationToken, tokenExpiresAt },
    });

    sendVerificationEmail(email, verificationToken);

    res.json({
      message: 'A new verification link has been sent to your email. Please check your inbox.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, verifyEmail, login, getMe, resendVerification };
