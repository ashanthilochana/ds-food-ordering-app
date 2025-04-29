import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PaymentForm from '../../components/PaymentForm';
import orderService from '../../services/order.service';
import { useAuth } from '../../context/AuthContext';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');

  const orderId = location.state?.orderId;

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('No order ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const orderData = await orderService.getOrderById(orderId);
        setOrder(orderData);
      } catch (err) {
        setError(err.message || 'Failed to fetch order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handlePaymentSuccess = (paymentIntent) => {
    console.log('Payment successful:', paymentIntent);
    // The PaymentForm component will handle navigation to the success page
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    setError(error.message || 'Payment failed. Please try again.');
  };

  if (!orderId) {
    return (
      <div className="checkout-container">
        <h2>Checkout</h2>
        <p>No order selected. Please select an order to checkout.</p>
        <button onClick={() => navigate('/cart')} className="btn btn-primary">
          Go to Cart
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="checkout-container">
        <h2>Loading order details...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="checkout-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/cart')} className="btn btn-primary">
          Return to Cart
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="checkout-container">
        <h2>Order Not Found</h2>
        <p>The order you're trying to checkout doesn't exist or you don't have permission to view it.</p>
        <button onClick={() => navigate('/cart')} className="btn btn-primary">
          Return to Cart
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>
      
      <div className="order-summary">
        <h3>Order Summary</h3>
        <p><strong>Order ID:</strong> {order._id}</p>
        <p><strong>Restaurant:</strong> {order.restaurant.name}</p>
        <p><strong>Total Amount:</strong> ${order.totalAmount.toFixed(2)}</p>
        
        <div className="order-items">
          <h4>Items</h4>
          <ul>
            {order.items.map((item, index) => (
              <li key={index}>
                {item.quantity}x {item.name} - ${(item.price * item.quantity).toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="payment-section">
        <h3>Payment Method</h3>
        <div className="payment-methods">
          <label>
            <input
              type="radio"
              name="paymentMethod"
              value="card"
              checked={paymentMethod === 'card'}
              onChange={() => setPaymentMethod('card')}
            />
            Credit/Debit Card
          </label>
          <label>
            <input
              type="radio"
              name="paymentMethod"
              value="cash_on_delivery"
              checked={paymentMethod === 'cash_on_delivery'}
              onChange={() => setPaymentMethod('cash_on_delivery')}
            />
            Cash on Delivery
          </label>
        </div>
        
        {paymentMethod === 'card' ? (
          <PaymentForm
            orderId={order._id}
            amount={order.totalAmount}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        ) : (
          <div className="cash-on-delivery">
            <p>You will pay in cash when your order is delivered.</p>
            <button 
              className="btn btn-primary"
              onClick={async () => {
                try {
                  setLoading(true);
                  await orderService.updateOrderStatus(order._id, 'confirmed');
                  navigate('/payment-success', {
                    state: {
                      orderId: order._id,
                      amount: order.totalAmount
                    }
                  });
                } catch (err) {
                  setError(err.message || 'Failed to confirm order');
                } finally {
                  setLoading(false);
                }
              }}
            >
              Confirm Order
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout; 