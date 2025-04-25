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
import Layout from '../../components/layout/Layout';

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
    // Fetch cart items from localStorage or context
    const savedCartItems = localStorage.getItem('cartItems');
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
          total: (newQuantity > 0 ? newQuantity : 1) * (item.price)
        };
      }
      return item;
    });
    
    setCartItems(updatedCartItems);
    localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
  };

  const handleRemoveItem = (itemId) => {
    const updatedCartItems = cartItems.filter(item => item.id !== itemId);
    setCartItems(updatedCartItems);
    localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
    
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

  const handlePlaceOrder = () => {
    // Simulate payment processing
    setIsProcessingPayment(true);
    
    setTimeout(() => {
      setIsProcessingPayment(false);
      setOrderSuccess(true);
      
      // Generate fake order details
      const orderId = Math.floor(100000 + Math.random() * 900000);
      const estimatedDeliveryTime = new Date();
      estimatedDeliveryTime.setMinutes(estimatedDeliveryTime.getMinutes() + 45);
      
      setOrderDetails({
        orderId: orderId,
        estimatedDelivery: estimatedDeliveryTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        restaurant: 'Pizza Palace',
        total: calculateTotal(),
        deliveryAddress: `${deliveryAddress.street}, ${deliveryAddress.city}, ${deliveryAddress.state} ${deliveryAddress.zip}`
      });
      
      // Clear cart
      localStorage.removeItem('cartItems');
    }, 2000);
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
    <Layout>
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
                          <Grid container spacing={2}>
                            <Grid item xs={12}>
                              <TextField
                                required
                                id="cc-number"
                                label="Card Number"
                                fullWidth
                                placeholder="1234 5678 9012 3456"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                required
                                id="cc-exp"
                                label="Expiry Date"
                                fullWidth
                                placeholder="MM/YY"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                required
                                id="cc-cvv"
                                label="CVV"
                                fullWidth
                                placeholder="123"
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <TextField
                                required
                                id="cc-name"
                                label="Name on Card"
                                fullWidth
                              />
                            </Grid>
                          </Grid>
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
                  >
                    Place Order
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
                  <Typography variant="h6">Processing your payment...</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Please don't close this page.
                  </Typography>
                </Box>
              ) : orderSuccess ? (
                <Box sx={{ textAlign: 'center', my: 4 }}>
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
                  
                  <Card sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
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
                          {orderDetails?.restaurant}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Total
                        </Typography>
                        <Typography variant="body1">
                          ${orderDetails?.total.toFixed(2)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Delivery Address
                        </Typography>
                        <Typography variant="body1" align="right" sx={{ maxWidth: '60%' }}>
                          {orderDetails?.deliveryAddress}
                        </Typography>
                      </Box>
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
              ) : null}
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