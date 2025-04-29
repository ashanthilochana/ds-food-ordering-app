import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  Divider,
  Button,
  IconButton,
  TextField,
  List,
  ListItem,
  ListItemText,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Step,
  Stepper,
  StepLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ShoppingCart as CartIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ExpandMore as ExpandMoreIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as BankIcon,
  Money as CashIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import Layout from '../../components/layout/Layout';
import Cookies from 'js-cookie';
import orderService from '../../services/order.service';
import paymentService from '../../services/payment.service';

// Initialize Stripe with the public key directly
const stripePromise = loadStripe('pk_test_51RIwgR4bmLkJuViK9uTGTNjshP1Aq53jwMe0OWHL4eLxB9PlbHOnCwOlc14GvOfwjaLiLGfPD1eLpzD3phFqTGZU00NKo1uVsq');

const CART_COOKIE_NAME = 'cartItems';

// Create a Stripe Checkout Session by calling your backend
const createStripeSession = async (orderData) => {
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    if (!response.ok) throw new Error('Failed to create Stripe session');
    return await response.json();
  } catch (error) {
    console.error('Error creating Stripe session:', error);
    throw error;
  }
};

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('creditCard');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
    instructions: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    // Load cart items from cookie
    const savedCartItems = Cookies.get(CART_COOKIE_NAME);
    if (savedCartItems) {
      setCartItems(JSON.parse(savedCartItems));
    }
  }, []);

  const handleQuantityChange = (itemId, change) => {
    const updatedCartItems = cartItems.map(item => {
      if (item.id === itemId) {
        const newQuantity = item.quantity + change;
        return {
          ...item,
          quantity: newQuantity > 0 ? newQuantity : 1,
          total: (newQuantity > 0 ? newQuantity : 1) * item.price
        };
      }
      return item;
    });
    
    setCartItems(updatedCartItems);
    Cookies.set(CART_COOKIE_NAME, JSON.stringify(updatedCartItems), {
      expires: 7,
      path: '/'
    });
  };

  const handleRemoveItem = (itemId) => {
    const updatedCartItems = cartItems.filter(item => item.id !== itemId);
    setCartItems(updatedCartItems);
    Cookies.set(CART_COOKIE_NAME, JSON.stringify(updatedCartItems), {
      expires: 7,
      path: '/'
    });
    
    if (updatedCartItems.length === 0) {
      setSnackbarMessage('Your cart is empty!');
      setSnackbarOpen(true);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.total, 0);
  };

  const calculateDeliveryFee = () => {
    // Could be calculated based on distance, etc.
    return 2.99;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateDeliveryFee();
  };

  const handleAddressChange = (event) => {
    const { name, value } = event.target;
    setDeliveryAddress({
      ...deliveryAddress,
      [name]: value
    });
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const validateDeliveryInfo = () => {
    const errors = {};
    if (!deliveryAddress.street.trim()) errors.street = 'Street address is required';
    if (!deliveryAddress.city.trim()) errors.city = 'City is required';
    if (!deliveryAddress.state.trim()) errors.state = 'State is required';
    if (!deliveryAddress.zip.trim()) errors.zip = 'ZIP code is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePaymentChange = (event) => {
    setPaymentMethod(event.target.value);
    // If cash on delivery is selected, automatically proceed to confirmation
    if (event.target.value === 'cashOnDelivery') {
      handleNext();
    }
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (cartItems.length === 0) {
        setSnackbarMessage('Your cart is empty!');
        setSnackbarOpen(true);
        return;
      }
    }
    
    if (activeStep === 1) {
      if (!validateDeliveryInfo()) {
        return;
      }
    }
    
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handlePlaceOrder = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      console.log('User from localStorage:', user);
      if (user && user.token) {
        paymentService.setAuthToken(user.token);
        console.log('Set auth token:', user.token);
      } else {
        console.warn('No user or token found!');
      }
      const restaurantId = Cookies.get('restaurantId');
  
      const orderData = {
        restaurant: {
          _id: restaurantId,
        },
        items: cartItems.map(item => ({
          menuItem: {
            _id: item.menuItemId,
            name: item.name,
            price: item.price,
          },
          quantity: item.quantity,
        })),
        paymentMethod: paymentMethod === 'cashOnDelivery' ? 'cash_on_delivery' : 'card',
        deliveryAddress: {
          street: deliveryAddress.street,
          city: deliveryAddress.city,
          state: deliveryAddress.state,
          zipCode: deliveryAddress.zip,
        },
        deliveryInstructions: deliveryAddress.instructions || '',
        total: calculateTotal(),
      };

      console.log('Order data for checkout:', orderData);

      if (paymentMethod === 'creditCard') {
        try {
          console.log('Calling createCheckoutSession...');
          const session = await paymentService.createCheckoutSession(
            orderData.items,
            `${window.location.origin}/order-success?session_id={CHECKOUT_SESSION_ID}`,
            `${window.location.origin}/cart`
          );
          console.log('Stripe session response:', session);
          const stripe = await stripePromise;
          const { error } = await stripe.redirectToCheckout({ sessionId: session.id });
          if (error) {
            setSnackbarMessage('Payment failed. Please try again.');
            setSnackbarOpen(true);
          }
          return;
        } catch (error) {
          console.error('Error in createCheckoutSession:', error);
          setSnackbarMessage('Payment failed. Please try again.');
          setSnackbarOpen(true);
          return;
        }
      }
  
      // For non-credit card payments (cash on delivery)
      console.log('Order Payload:', JSON.stringify(orderData, null, 2));
      const responseData = await orderService.placeOrder(orderData);
      console.log('Order placed successfully:', responseData);
  
      setOrderDetails(responseData.order);
      setOrderSuccess(true);
      setActiveStep(3);
  
    } catch (error) {
      console.error('Failed to place order:', error);
      setSnackbarMessage('Failed to place order. Please try again.');
      setSnackbarOpen(true);
    }
  };
  
  const goToHome = () => {
    navigate('/restaurants');
  };

  const goToOrderTracking = () => {
    navigate(`/track-order/${orderDetails.orderId}`);
  };

  const steps = ['Cart', 'Delivery', 'Payment', 'Confirmation'];

  if (cartItems.length === 0 && activeStep === 0) {
    return (
      <Layout>
        <Container>
          <Box sx={{ my: 4, textAlign: 'center' }}>
            <CartIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Your cart is empty
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Looks like you haven't added any items to your cart yet.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={goToHome}
              startIcon={<ArrowBackIcon />}
            >
              Browse Restaurants
            </Button>
          </Box>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout cartItems={cartItems}>
      <Container>
        <Box sx={{ my: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            {activeStep > 0 && (
              <IconButton onClick={handleBack} sx={{ mr: 1 }}>
                <ArrowBackIcon />
              </IconButton>
            )}
            <Typography variant="h4" component="h1">
              {activeStep === 3 ? 'Order' : steps[activeStep]}
            </Typography>
          </Box>

          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Cart Items */}
          {activeStep === 0 && (
            <>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Items in your cart
                    </Typography>
                    <List>
                      {cartItems.map((item) => (
                        <React.Fragment key={item.id}>
                          <ListItem 
                            sx={{ 
                              py: 2, 
                              display: 'flex', 
                              flexDirection: { xs: 'column', sm: 'row' },
                              alignItems: { xs: 'flex-start', sm: 'center' }
                            }}
                          >
                            <ListItemText
                              primary={item.name}
                              secondary={
                                <Box component="span">
                                  ${item.price.toFixed(2)}
                                  {Object.entries(item.options).map(([key, value]) => (
                                    <Typography key={key} variant="body2" color="text.secondary" component="span">
                                      {` • ${key}: ${value}`}
                                    </Typography>
                                  ))}
                                </Box>
                              }
                              sx={{ flex: '1 1 auto' }}
                            />
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: { xs: 2, sm: 0 } }}>
                              <IconButton 
                                size="small" 
                                onClick={() => handleQuantityChange(item.id, -1)}
                                disabled={item.quantity <= 1}
                              >
                                <RemoveIcon fontSize="small" />
                              </IconButton>
                              <Typography variant="body1" sx={{ mx: 1 }}>
                                {item.quantity}
                              </Typography>
                              <IconButton 
                                size="small" 
                                onClick={() => handleQuantityChange(item.id, 1)}
                              >
                                <AddIcon fontSize="small" />
                              </IconButton>
                              <Typography variant="body1" sx={{ mx: 2 }}>
                                ${item.total.toFixed(2)}
                              </Typography>
                              <IconButton 
                                edge="end" 
                                onClick={() => handleRemoveItem(item.id)}
                                color="error"
                                size="small"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </ListItem>
                          <Divider />
                        </React.Fragment>
                      ))}
                    </List>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Order Summary
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1">Subtotal</Typography>
                      <Typography variant="body1">${calculateSubtotal().toFixed(2)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1">Delivery Fee</Typography>
                      <Typography variant="body1">${calculateDeliveryFee().toFixed(2)}</Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6">Total</Typography>
                      <Typography variant="h6">${calculateTotal().toFixed(2)}</Typography>
                    </Box>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      fullWidth 
                      onClick={handleNext}
                    >
                      Continue to Delivery
                    </Button>
                  </Paper>
                </Grid>
              </Grid>
            </>
          )}

          {/* Delivery Information */}
          {activeStep === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Delivery Address
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        required
                        id="street"
                        name="street"
                        label="Street Address"
                        fullWidth
                        value={deliveryAddress.street}
                        onChange={handleAddressChange}
                        error={!!formErrors.street}
                        helperText={formErrors.street}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        id="city"
                        name="city"
                        label="City"
                        fullWidth
                        value={deliveryAddress.city}
                        onChange={handleAddressChange}
                        error={!!formErrors.city}
                        helperText={formErrors.city}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        id="state"
                        name="state"
                        label="State/Province/Region"
                        fullWidth
                        value={deliveryAddress.state}
                        onChange={handleAddressChange}
                        error={!!formErrors.state}
                        helperText={formErrors.state}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        id="zip"
                        name="zip"
                        label="ZIP / Postal code"
                        fullWidth
                        value={deliveryAddress.zip}
                        onChange={handleAddressChange}
                        error={!!formErrors.zip}
                        helperText={formErrors.zip}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        id="instructions"
                        name="instructions"
                        label="Delivery Instructions (Optional)"
                        fullWidth
                        multiline
                        rows={3}
                        value={deliveryAddress.instructions}
                        onChange={handleAddressChange}
                        placeholder="Add delivery instructions (e.g., gate code, landmark, etc.)"
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Order Summary
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} from Restaurant
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1">Subtotal</Typography>
                    <Typography variant="body1">${calculateSubtotal().toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1">Delivery Fee</Typography>
                    <Typography variant="body1">${calculateDeliveryFee().toFixed(2)}</Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">Total</Typography>
                    <Typography variant="h6">${calculateTotal().toFixed(2)}</Typography>
                  </Box>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth 
                    onClick={handleNext}
                  >
                    Continue to Payment
                  </Button>
                </Paper>
              </Grid>
            </Grid>
          )}

          {/* Payment Method */}
          {activeStep === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Payment Method
                  </Typography>
                  <FormControl component="fieldset">
                    <RadioGroup
                      aria-label="payment-method"
                      name="payment-method"
                      value={paymentMethod}
                      onChange={handlePaymentChange}
                    >
                      <FormControlLabel
                        value="creditCard"
                        control={<Radio />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CreditCardIcon sx={{ mr: 1 }} />
                            <Typography>Credit/Debit Card</Typography>
                          </Box>
                        }
                      />
                      <Accordion 
                        expanded={paymentMethod === 'creditCard'} 
                        sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}
                      >
                        <AccordionDetails>
                          <Alert severity="info">
                            You will be redirected to Stripe's secure payment gateway to complete your payment.
                          </Alert>
                        </AccordionDetails>
                      </Accordion>

                      <FormControlLabel
                        value="onlinePayment"
                        control={<Radio />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <BankIcon sx={{ mr: 1 }} />
                            <Typography>Online Payment (PayPal, etc.)</Typography>
                          </Box>
                        }
                      />
                      <Accordion 
                        expanded={paymentMethod === 'onlinePayment'} 
                        sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}
                      >
                        <AccordionDetails>
                          <Alert severity="info">
                            You will be redirected to a secure payment gateway to complete your payment.
                          </Alert>
                        </AccordionDetails>
                      </Accordion>

                      <FormControlLabel
                        value="cashOnDelivery"
                        control={<Radio />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CashIcon sx={{ mr: 1 }} />
                            <Typography>Cash on Delivery</Typography>
                          </Box>
                        }
                      />
                    </RadioGroup>
                  </FormControl>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Order Summary
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} from {cartItems[0]?.restaurantName || 'Restaurant'}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1">Subtotal</Typography>
                    <Typography variant="body1">${calculateSubtotal().toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1">Delivery Fee</Typography>
                    <Typography variant="body1">${calculateDeliveryFee().toFixed(2)}</Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">Total</Typography>
                    <Typography variant="h6">${calculateTotal().toFixed(2)}</Typography>
                  </Box>
                </Paper>

                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Delivery Details
                  </Typography>
                  <Typography variant="body2">
                    {deliveryAddress.street}, {deliveryAddress.city}, {deliveryAddress.state} {deliveryAddress.zip}
                  </Typography>
                  {deliveryAddress.instructions && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Instructions: {deliveryAddress.instructions}
                    </Typography>
                  )}
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth 
                    sx={{ mt: 2 }}
                    onClick={handlePlaceOrder}
                    disabled={false}
                  >
                    {paymentMethod === 'cashOnDelivery' ? 'Place Order' : 'Proceed to Payment'}
                  </Button>
                </Paper>
              </Grid>
            </Grid>
          )}

          {/* Order Confirmation */}
          {activeStep === 3 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {isProcessingPayment ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
                  <CircularProgress size={60} sx={{ mb: 2 }} />
                  <Typography variant="h6">Processing your order...</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Please don't close this page.
                  </Typography>
                </Box>
              ) : orderSuccess ? (
                <Box sx={{ textAlign: 'center', my: 4, maxWidth: 600, mx: 'auto' }}>
                  <Box 
                    sx={{ 
                      bgcolor: 'success.main', 
                      color: 'white', 
                      height: 80, 
                      width: 80, 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2
                    }}
                  >
                    <CheckIcon sx={{ fontSize: 40 }} />
                  </Box>
                  <Typography variant="h4" gutterBottom>
                    Order Confirmed!
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Your order has been placed and is being processed.
                  </Typography>
                  
                  <Card sx={{ mb: 4 }}>
                    <CardContent>
                      <Typography variant="h6" color="primary" gutterBottom>
                        Order #{orderDetails?.orderId}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Estimated Delivery
                        </Typography>
                        <Typography variant="body1">
                          {orderDetails?.estimatedDelivery}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Restaurant
                        </Typography>
                        <Typography variant="body1">
                          {orderDetails?.restaurant?.name || '-'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Payment Method
                        </Typography>
                        <Typography variant="body1">
                          {orderDetails?.paymentMethod === 'cashOnDelivery' ? 'Cash on Delivery' : 
                           orderDetails?.paymentMethod === 'creditCard' ? 'Credit Card' : 
                           'Online Payment'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Total Amount
                        </Typography>
                        <Typography variant="body1">
                          {orderDetails?.total !== undefined ? `$${orderDetails.total.toFixed(2)}` : '$0.00'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Delivery Address
                        </Typography>
                        {orderDetails?.deliveryAddress
                          ? `${orderDetails.deliveryAddress.street}, ${orderDetails.deliveryAddress.city}, ${orderDetails.deliveryAddress.state} ${orderDetails.deliveryAddress.zipCode}`
                          : '-'}
                      </Box>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle1" gutterBottom>
                        Order Items
                      </Typography>
                      {orderDetails?.items?.map((item, index) => (
                        <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">
                            {item.quantity}x {item.name}
                          </Typography>
                          <Typography variant="body2">
                            ${(item.price * item.quantity).toFixed(2)}
                          </Typography>
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                  
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button 
                      variant="outlined" 
                      onClick={goToHome}
                    >
                      Return to Home
                    </Button>
                    <Button 
                      variant="contained" 
                      onClick={goToOrderTracking}
                    >
                      Track Order
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', my: 4, maxWidth: 600, mx: 'auto' }}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Review Your Order
                    </Typography>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body1" gutterBottom>
                        Payment Method: {paymentMethod === 'cashOnDelivery' ? 'Cash on Delivery' : 
                                      paymentMethod === 'creditCard' ? 'Credit Card' : 
                                      'Online Payment'}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        Total Amount: ${calculateTotal().toFixed(2)}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        Delivery Address: {deliveryAddress.street}, {deliveryAddress.city}, {deliveryAddress.state} {deliveryAddress.zip}
                      </Typography>
                    </Box>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      fullWidth
                      onClick={handlePlaceOrder}
                    >
                      Place Order
                    </Button>
                  </Paper>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Container>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Layout>
  );
};

export default Cart; 