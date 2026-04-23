const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

transporter.verify((err, success) => {
  if (err) {
    console.error('SMTP connection error:', err.message);
  } else {
    console.log('SMTP ready to send emails');
  }
});

const sendVerificationEmail = async (email, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify/${token}`;
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'MatchTARA - Verify Your Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2C3E50;">Welcome to MatchTARA!</h2>
          <p>Thank you for registering. Please verify your email by clicking the button below:</p>
          <p style="margin: 24px 0;">
            <a href="${verifyUrl}" style="background: #4472C4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email</a>
          </p>
          <p style="color: #777; font-size: 14px;">Or copy this link: ${verifyUrl}</p>
          <p style="color: #777; font-size: 14px;">This link expires in 24 hours.</p>
        </div>
      `,
    });
    console.log(`Verification email sent to ${email}`);
  } catch (err) {
    console.error(`Failed to send verification email to ${email}:`, err.message);
  }
};

const sendApplicationNotification = async (professorEmail, positionTitle, studentName) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: professorEmail,
      subject: `MatchTARA - New Application for ${positionTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2C3E50;">New Application Received</h2>
          <p><strong>${studentName}</strong> has applied for your position:</p>
          <p style="font-size: 18px; color: #4472C4; padding: 12px; background: #F4F7FB; border-radius: 6px;">${positionTitle}</p>
          <p>Log in to your MatchTARA dashboard to review the application.</p>
          <p style="margin-top: 24px;">
            <a href="${process.env.CLIENT_URL}/dashboard" style="background: #4472C4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Go to Dashboard</a>
          </p>
        </div>
      `,
    });
    console.log(`Notification email sent to ${professorEmail}`);
  } catch (err) {
    console.error(`Failed to send notification to ${professorEmail}:`, err.message);
  }
};

const sendStatusUpdateEmail = async (studentEmail, studentName, positionTitle, newStatus) => {
  const statusMessages = {
    REVIEWED: {
      subject: 'Your application is being reviewed',
      color: '#3498DB',
      headline: 'Your application is being reviewed',
      body: `The professor has started reviewing your application for <strong>${positionTitle}</strong>. We'll notify you once a decision has been made.`,
    },
    ACCEPTED: {
      subject: 'Congratulations! Your application has been accepted',
      color: '#27AE60',
      headline: '🎉 Congratulations!',
      body: `Great news! Your application for <strong>${positionTitle}</strong> has been <strong style="color: #27AE60;">accepted</strong>. The professor will contact you shortly with next steps.`,
    },
    REJECTED: {
      subject: 'Update on your application',
      color: '#95A5A6',
      headline: 'Application Update',
      body: `Thank you for your interest in <strong>${positionTitle}</strong>. Unfortunately, the professor has decided to move forward with other candidates at this time. We wish you the best in your future applications.`,
    },
  };

  const msg = statusMessages[newStatus];
  if (!msg) return;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: studentEmail,
      subject: `MatchTARA - ${msg.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: ${msg.color};">${msg.headline}</h2>
          <p>Hello ${studentName},</p>
          <p>${msg.body}</p>
          <p style="margin-top: 24px; color: #777; font-size: 14px;">
            This is an automated message from MatchTARA. Please do not reply to this email.
          </p>
        </div>
      `,
    });
    console.log(`Status update email sent to ${studentEmail} (${newStatus})`);
  } catch (err) {
    console.error(`Failed to send status email to ${studentEmail}:`, err.message);
  }
};

const sendApplicationConfirmation = async (studentEmail, studentName, positionTitle, professorName) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: studentEmail,
      subject: `MatchTARA - Application Received for ${positionTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #27AE60;">✓ Application Received!</h2>
          <p>Hello ${studentName},</p>
          <p>Thank you for applying. Your application has been successfully submitted for:</p>
          <p style="font-size: 18px; color: #4472C4; padding: 12px; background: #F4F7FB; border-radius: 6px;">
            <strong>${positionTitle}</strong>
          </p>
          <p>Your application is now being reviewed by <strong>${professorName}</strong>. You will receive another email notification when your application status changes.</p>
          <div style="padding: 16px; background: #EBF5FB; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px;"><strong>What happens next?</strong></p>
            <ul style="font-size: 14px; margin: 8px 0;">
              <li>The professor will review your application and resume</li>
              <li>You'll receive an email when the status changes to Reviewed, Accepted, or Rejected</li>
              <li>If accepted, the professor will contact you directly with next steps</li>
            </ul>
          </div>
          <p style="color: #777; font-size: 14px; margin-top: 24px;">
            This is an automated confirmation from MatchTARA. Please do not reply to this email.
          </p>
        </div>
      `,
    });
    console.log(`Confirmation email sent to ${studentEmail}`);
  } catch (err) {
    console.error(`Failed to send confirmation to ${studentEmail}:`, err.message);
  }
};

module.exports = {
  sendVerificationEmail,
  sendApplicationNotification,
  sendStatusUpdateEmail,
  sendApplicationConfirmation,
};