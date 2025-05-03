import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import paymentService from '../services/payment.service';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = useQuery();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Try to get from state first, fallback to query param
  const { orderId, paymentId, amount } = location.state || {};
  const sessionId = query.get('session_id');

  // Simulate fetching order/payment details
  // Replace with your actual fetching logic
  const [order, setOrder] = useState({
    restaurant: "Dilshan Pathum",
    paymentMethod: "Online Payment",
    total: amount || 0,
    deliveryAddress: "5th mile post, Padaviya, Mahasenpura, Anuradhapura, fgh 50574",
    items: [{ name: "Burger", quantity: 5, price: 2.5 }]
  });

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      setLoading(true);
      try {
        if (paymentId) {
          const paymentData = await paymentService.getPaymentById(paymentId);
          console.log(paymentData);
          setPayment(paymentData);
          // Optionally set orderId, amount, etc. from paymentData if needed
        } else if (sessionId) {
          // Fetch payment by sessionId
          const paymentData = await paymentService.getPaymentBySessionId(sessionId);
          console.log(paymentData);
          setPayment(paymentData);
          // Set orderId, paymentId, amount from paymentData
          setOrder({
            ...order,
            // update these fields as per your paymentData structure
            total: paymentData.amount,
            // etc.
          });
          // If paymentData contains orderId/paymentId, set them in state
          // setOrderId(paymentData.orderId);
          // setPaymentId(paymentData.paymentId);
        } else {
          setError('No payment information found.');
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch payment details');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [paymentId, sessionId]);

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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 60 }}>
      {(!orderId || !paymentId) && (
        <div style={{ color: 'red', marginBottom: 16 }}>
          Warning: Some order/payment information is missing.
        </div>
      )}
      <FaCheckCircle size={100} color="#4CAF50" style={{ marginBottom: 24 }} />
      <h1 style={{ fontWeight: 'bold' }}>Order Confirmed!</h1>
      <p>Your order has been placed and is being processed.</p>
      <div style={{
        background: '#fff', padding: 32, borderRadius: 16, margin: 24, minWidth: 350, maxWidth: 500, boxShadow: '0 2px 8px #eee'
      }}>
        <h2 style={{ color: '#ff5722', textAlign: 'center' }}>Order #{orderId}</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0' }}>
          <span>Restaurant</span><span>{order.restaurant}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0' }}>
          <span>Payment Method</span><span>{order.paymentMethod}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0' }}>
          <span>Total Amount</span><span>${order.total.toFixed(2)}</span>
        </div>
        <div style={{ margin: '8px 0' }}>
          <span>Delivery Address</span>
          <div style={{ fontWeight: 'bold' }}>{order.deliveryAddress}</div>
        </div>
        <hr />
        <h3 style={{ textAlign: 'center' }}>Order Items</h3>
        {order.items.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{item.quantity}x {item.name}</span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        <Link to="/"><button style={{ padding: '8px 24px', border: '1px solid #ff5722', background: '#fff', color: '#ff5722', borderRadius: 8 }}>Return to Home</button></Link>
        <button onClick={() => navigate(`/track-order/${orderId}`)} style={{ padding: '8px 24px', background: '#ff5722', color: '#fff', border: 'none', borderRadius: 8 }}>Track Order</button>
      </div>
    </div>
  );
};

export default PaymentSuccess; 