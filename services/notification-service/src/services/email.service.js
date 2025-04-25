// Mock email service for testing
exports.sendEmail = async (to, subject, html) => {
  console.log('Mock email sent:', { to, subject, html });
  return { success: true, messageId: `mock_${Date.now()}` };
};
