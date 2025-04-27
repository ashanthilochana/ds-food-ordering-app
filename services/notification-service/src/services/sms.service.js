// Mock SMS service for testing
exports.sendSMS = async (to, message) => {
  console.log('Mock SMS sent:', { to, message });
  return { success: true, messageId: `mock_${Date.now()}` };
};
