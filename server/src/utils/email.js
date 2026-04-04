const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendVerificationEmail = async (email, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify/${token}`;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'MatchTARA - Verify Your Email',
      html: `
        <h2>Welcome to MatchTARA!</h2>
        <p>Click the link below to verify your email address:</p>
        <a href="${verifyUrl}">${verifyUrl}</a>
        <p>This link expires in 24 hours.</p>
      `,
    });
    console.log(`Verification email sent to ${email}`);
  } catch (err) {
    console.error(`Failed to send verification email to ${email}:`, err.message);
    // Don't throw — registration should still succeed
  }
};

const sendApplicationNotification = async (professorEmail, positionTitle, studentName) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: professorEmail,
      subject: `MatchTARA - New Application for ${positionTitle}`,
      html: `
        <h2>New Application Received</h2>
        <p><strong>${studentName}</strong> has applied for your position: <strong>${positionTitle}</strong>.</p>
        <p>Log in to your MatchTARA dashboard to review the application.</p>
      `,
    });
    console.log(`Notification email sent to ${professorEmail}`);
  } catch (err) {
    console.error(`Failed to send notification to ${professorEmail}:`, err.message);
  }
};

module.exports = { sendVerificationEmail, sendApplicationNotification };
