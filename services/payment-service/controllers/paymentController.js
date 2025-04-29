const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const processPayment = async (req, res) => {
    try {
        const { amount, currency, paymentMethodId } = req.body;
        const userId = req.user.id; // From auth middleware

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            payment_method: paymentMethodId,
            confirm: true,
            return_url: process.env.PAYMENT_RETURN_URL,
        });

        // Save payment record to database (implement this based on your database schema)
        // const paymentRecord = await Payment.create({
        //     userId,
        //     amount,
        //     currency,
        //     paymentIntentId: paymentIntent.id,
        //     status: paymentIntent.status
        // });

        res.json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            status: paymentIntent.status
        });
    } catch (error) {
        console.error('Payment processing error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

const getPaymentHistory = async (req, res) => {
    try {
        const userId = req.user.id; // From auth middleware

        // Fetch payment history from database (implement this based on your database schema)
        // const payments = await Payment.find({ userId }).sort({ createdAt: -1 });

        // For now, return mock data
        const payments = [
            {
                id: 'pi_123',
                amount: 1000,
                currency: 'usd',
                status: 'succeeded',
                createdAt: new Date()
            }
        ];

        res.json({
            success: true,
            payments
        });
    } catch (error) {
        console.error('Error fetching payment history:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = {
    processPayment,
    getPaymentHistory
}; 