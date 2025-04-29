import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import paymentService from '../services/payment.service';

const PaymentSuccess = () => {
  const location = useLocation();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { orderId, paymentId, amount } = location.state || {};

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      if (!paymentId) return;
      
      try {
        setLoading(true);
        const paymentData = await paymentService.getPaymentById(paymentId);
        setPayment(paymentData);
      } catch (err) {
        setError(err.message || 'Failed to fetch payment details');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [paymentId]);

  if (!orderId || !paymentId) {
    return (
      <div className="payment-success-container">
        <h2>Invalid Payment Information</h2>
        <p>We couldn't find the payment information. Please contact support if you believe this is an error.</p>
        <Link to="/" className="btn btn-primary">Return to Home</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="payment-success-container">
        <h2>Loading payment details...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-success-container">
        <h2>Error</h2>
        <p>{error}</p>
        <Link to="/" className="btn btn-primary">Return to Home</Link>
      </div>
    );
  }

  return (
    <div className="payment-success-container">
      <div className="success-icon">
        <FaCheckCircle size={64} color="#4CAF50" />
      </div>
      
      <h2>Payment Successful!</h2>
      <p>Thank you for your payment of ${amount.toFixed(2)}</p>
      
      {payment && (
        <div className="payment-details">
          <h3>Payment Details</h3>
          <p><strong>Order ID:</strong> {orderId}</p>
          <p><strong>Payment ID:</strong> {paymentId}</p>
          <p><strong>Status:</strong> {payment.status}</p>
          <p><strong>Date:</strong> {new Date(payment.createdAt).toLocaleString()}</p>
        </div>
      )}
      
      <div className="next-steps">
        <p>Your order has been confirmed and will be processed shortly.</p>
        <p>You will receive an email confirmation with your order details.</p>
      </div>
      
      <div className="actions">
        <Link to="/orders" className="btn btn-primary">View My Orders</Link>
        <Link to="/" className="btn btn-secondary">Return to Home</Link>
      </div>
    </div>
  );
};

export default PaymentSuccess; 