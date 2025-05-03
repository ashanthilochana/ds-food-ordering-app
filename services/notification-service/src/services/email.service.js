const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

/**
 * Send email using nodemailer
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - Email content in HTML format
 * @returns {Promise<object>} - Email send result
 */
exports.sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Food Ordering App" <noreply@foodapp.com>',
      to,
      subject,
      html
    });

    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
