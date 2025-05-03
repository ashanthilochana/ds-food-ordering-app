const express = require('express');
const { sendEmail } = require('../services/email.service');
const router = express.Router();

router.post('/test-email', async (req, res) => {
  try {
    const { to, subject, html } = req.body;
    
    // If no body parameters provided, use defaults
    const emailTo = to || 'ashanthilochana98@gmail.com';
    const emailSubject = subject || 'Test Email from Food Ordering App';
    const emailHtml = html || `<h1>Test Email</h1>
       <p>This is a test email from your Food Ordering App.</p>
       <p>If you received this email, your email service is working correctly!</p>
       <p>Time sent: ${new Date().toLocaleString()}</p>`;

    const result = await sendEmail(
      emailTo,
      emailSubject,
      emailHtml
    );
    res.json({ success: true, result });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
