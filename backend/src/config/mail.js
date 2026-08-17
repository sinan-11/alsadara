const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    html,
  });
};

const sendVerificationEmail = async (email, name, otp) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">Verify Your Account</h2>
      <p>Hello ${name},</p>
      <p>Your verification code is:</p>
      <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333; border-radius: 8px; margin: 20px 0;">
        ${otp}
      </div>
      <p>This code expires in <strong>10 minutes</strong>.</p>
      <p style="color: #888; font-size: 14px;">If you did not create this account, you can ignore this email.</p>
    </body>
    </html>
  `;
  await sendEmail({ to: email, subject: 'Verify your account', html });
};

const sendPasswordResetEmail = async (email, name, otp) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">Reset Your Password</h2>
      <p>Hello ${name},</p>
      <p>Your password reset code is:</p>
      <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333; border-radius: 8px; margin: 20px 0;">
        ${otp}
      </div>
      <p>This code expires in <strong>10 minutes</strong>.</p>
      <p style="color: #888; font-size: 14px;">If you did not request this password reset, you can ignore this email.</p>
    </body>
    </html>
  `;
  await sendEmail({ to: email, subject: 'Reset your password', html });
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
