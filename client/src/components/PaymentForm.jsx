import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import paymentService from '../services/payment.service';
import { useNavigate } from 'react-router-dom';

// Load Stripe outside of component to avoid recreating Stripe object on every render
const stripePromise = loadStripe('pk_test_51RIwgR4bmLkJuViK9uTGTNjshP1Aq53jwMe0OWHL4eLxB9PlbHOnCwOlc14GvOfwjaLiLGfPD1eLpzD3phFqTGZU00NKo1uVsq');

const PaymentForm = ({ orderId, amount, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentId, setPaymentId] = useState(null);

  useEffect(() => {
    // Create payment intent when component mounts
    const createPaymentIntent = async () => {
      try {
        setLoading(true);
        const response = await paymentService.createPaymentIntent(orderId, 'card');
        setClientSecret(response.clientSecret);
        setPaymentId(response.paymentId);
      } catch (err) {
        setError(err.message || 'Failed to create payment intent');
        if (onError) onError(err);
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, [orderId, onError]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            // Add billing details if needed
          },
        },
      });

      if (stripeError) {
        setError(stripeError.message);
        if (onError) onError(stripeError);
      } else if (paymentIntent.status === 'succeeded') {
        // Confirm payment on our backend
        await paymentService.confirmPayment(paymentIntent.id, orderId);
        
        if (onSuccess) {
          onSuccess(paymentIntent);
        } else {
          // Default success behavior
          navigate('/payment-success', { 
            state: { 
              orderId, 
              paymentId,
              amount 
            } 
          });
        }
      }
    } catch (err) {
      setError(err.message || 'Payment failed');
      if (onError) onError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-form">
      <h2>Payment Details</h2>
      <p>Amount to pay: ${amount.toFixed(2)}</p>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="card-element-container">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={!stripe || loading || !clientSecret}
          className="payment-button"
        >
          {loading ? 'Processing...' : 'Pay Now'}
        </button>
      </form>
    </div>
  );
};

// Wrapper component that provides Stripe context
const PaymentFormWrapper = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  );
};

export default PaymentFormWrapper; 