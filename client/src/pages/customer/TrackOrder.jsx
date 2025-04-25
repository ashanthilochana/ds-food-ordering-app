import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  Grid,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Card,
  CardContent,
  Avatar,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  RestaurantMenu as RestaurantIcon,
  Delivery as DeliveryIcon,
  DirectionsBike as BikeIcon,
  Home as HomeIcon,
  AccessTime as TimeIcon,
  Phone as PhoneIcon,
  Message as MessageIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';

// Mock order data - replace with API call
const mockOrderData = {
  id: '123456',
  status: 'in_transit', // 'confirmed', 'preparing', 'in_transit', 'delivered'
  items: [
    { name: 'Margherita Pizza', quantity: 1, price: 12.99, options: { Size: 'Medium (+$2)', Crust: 'Thin' } },
    { name: 'Garlic Bread', quantity: 1, price: 4.99, options: { 'Add-ons': 'Cheese (+$1)' } },
    { name: 'Soda', quantity: 2, price: 1.99, options: { Size: 'Medium (+$0.5)', Type: 'Cola' } }
  ],
  restaurant: {
    name: 'Pizza Palace',
    address: '123 Main Street, Cityville',
    phone: '+1 234-567-8900',
    image: 'https://source.unsplash.com/random/100x100/?pizza-logo'
  },
  delivery: {
    address: '456 Oak Avenue, Apt 7B, Cityville, NY 10001',
    instructions: 'Please leave at the door',
    estimatedTime: '7:30 PM',
    driver: {
      name: 'John Doe',
      phone: '+1 234-567-8901',
      image: 'https://source.unsplash.com/random/100x100/?person',
      rating: 4.8
    },
    currentLocation: 'Near Central Park, 2.5 miles away',
    eta: '15 minutes'
  },
  payment: {
    method: 'Credit Card',
    total: 23.96,
    subtotal: 20.97,
    deliveryFee: 2.99,
    date: '2023-09-15T18:30:00Z'
  },
  timeline: [
    { status: 'Order Placed', time: '6:30 PM', completed: true },
    { status: 'Order Confirmed', time: '6:35 PM', completed: true },
    { status: 'Preparing Your Food', time: '6:40 PM', completed: true },
    { status: 'Out for Delivery', time: '7:05 PM', completed: true },
    { status: 'Arriving Soon', time: '7:25 PM', completed: false },
    { status: 'Delivered', time: '7:30 PM', completed: false }
  ]
};

const TrackOrder = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setOrder(mockOrderData);
      
      // Set the active step based on order status
      const statusIndex = mockOrderData.timeline.findIndex(item => !item.completed);
      setActiveStep(statusIndex !== -1 ? statusIndex : mockOrderData.timeline.length - 1);
      
      setLoading(false);
    }, 1000);
    
    // In a real app, you would fetch the order data:
    // const fetchOrder = async () => {
    //   try {
    //     const response = await axios.get(`/api/orders/${orderId}`);
    //     setOrder(response.data);
    //     const statusIndex = response.data.timeline.findIndex(item => !item.completed);
    //     setActiveStep(statusIndex !== -1 ? statusIndex : response.data.timeline.length - 1);
    //     setLoading(false);
    //   } catch (error) {
    //     console.error('Error fetching order:', error);
    //     setLoading(false);
    //   }
    // };
    // fetchOrder();
    
    // Set up real-time updates (e.g., with WebSockets)
    // const socket = new WebSocket('wss://api.example.com/orders');
    // socket.onmessage = (event) => {
    //   const data = JSON.parse(event.data);
    //   if (data.orderId === orderId) {
    //     setOrder(prevOrder => ({ ...prevOrder, ...data }));
    //     const statusIndex = data.timeline.findIndex(item => !item.completed);
    //     setActiveStep(statusIndex !== -1 ? statusIndex : data.timeline.length - 1);
    //   }
    // };
    // return () => socket.close();
  }, [orderId]);

  const handleOpenMessageDialog = () => {
    setMessageDialogOpen(true);
  };

  const handleCloseMessageDialog = () => {
    setMessageDialogOpen(false);
  };

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const handleSendMessage = () => {
    // In a real app, you would send the message to the driver
    console.log(`Message to driver: ${message}`);
    setMessage('');
    setMessageDialogOpen(false);
    // You could show a success message here
  };

  const handleCallDriver = () => {
    // In a real app, this would initiate a phone call or show the number
    if (order?.delivery?.driver?.phone) {
      window.location.href = `tel:${order.delivery.driver.phone}`;
    }
  };

  if (loading) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <Container>
          <Box sx={{ my: 4, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              Order not found
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              We couldn't find the order you're looking for. Please check the order ID and try again.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/restaurants')}
            >
              Go to Restaurants
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
          <Typography variant="h4" component="h1" gutterBottom>
            Track Order #{order.id}
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              {/* Order Status Timeline */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Order Status
                </Typography>
                <Box sx={{ maxWidth: 600 }}>
                  <Stepper activeStep={activeStep} orientation="vertical">
                    {order.timeline.map((step, index) => (
                      <Step key={index} completed={step.completed}>
                        <StepLabel
                          StepIconProps={{
                            icon: step.completed ? <CheckCircleIcon color="success" /> : index + 1
                          }}
                        >
                          <Typography variant="subtitle1">
                            {step.status}
                          </Typography>
                        </StepLabel>
                        <StepContent>
                          <Typography variant="body2" color="text.secondary">
                            {step.time}
                          </Typography>
                          {index === activeStep && index === 3 && order.delivery.driver && (
                            <Box sx={{ mt: 2, mb: 1 }}>
                              <Typography variant="body2">
                                {order.delivery.currentLocation} • ETA: {order.delivery.eta}
                              </Typography>
                            </Box>
                          )}
                        </StepContent>
                      </Step>
                    ))}
                  </Stepper>
                </Box>
              </Paper>

              {/* Delivery Driver Info - Only show if order is in transit */}
              {order.status === 'in_transit' && order.delivery.driver && (
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Delivery Info
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      src={order.delivery.driver.image}
                      alt={order.delivery.driver.name}
                      sx={{ width: 60, height: 60, mr: 2 }}
                    />
                    <Box>
                      <Typography variant="subtitle1">
                        {order.delivery.driver.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Rating
                          value={order.delivery.driver.rating}
                          precision={0.1}
                          size="small"
                          readOnly
                        />
                        <Typography variant="body2" sx={{ ml: 0.5 }}>
                          ({order.delivery.driver.rating})
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {order.delivery.currentLocation} • ETA: {order.delivery.eta}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<PhoneIcon />}
                      onClick={handleCallDriver}
                    >
                      Call Driver
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<MessageIcon />}
                      onClick={handleOpenMessageDialog}
                    >
                      Message
                    </Button>
                  </Box>
                </Paper>
              )}

              {/* Order Details */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Order Details
                </Typography>
                <List>
                  {order.items.map((item, index) => (
                    <ListItem key={index} disablePadding sx={{ py: 1 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body1">
                              {item.quantity}x {item.name}
                            </Typography>
                            <Typography variant="body1">
                              ${(item.price * item.quantity).toFixed(2)}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box component="span">
                            {Object.entries(item.options).map(([key, value]) => (
                              <Typography key={key} variant="body2" color="text.secondary" component="span">
                                {`${key}: ${value} • `}
                              </Typography>
                            ))}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">Subtotal</Typography>
                  <Typography variant="body1">${order.payment.subtotal.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">Delivery Fee</Typography>
                  <Typography variant="body1">${order.payment.deliveryFee.toFixed(2)}</Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6">Total</Typography>
                  <Typography variant="h6">${order.payment.total.toFixed(2)}</Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              {/* Restaurant Info */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      src={order.restaurant.image}
                      alt={order.restaurant.name}
                      sx={{ width: 50, height: 50, mr: 2 }}
                    />
                    <Box>
                      <Typography variant="h6">
                        {order.restaurant.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {order.restaurant.address}
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<PhoneIcon />}
                    sx={{ mb: 1 }}
                    onClick={() => { window.location.href = `tel:${order.restaurant.phone}`; }}
                  >
                    Call Restaurant
                  </Button>
                </CardContent>
              </Card>

              {/* Delivery Info */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Delivery Information
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <HomeIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Delivery Address"
                        secondary={order.delivery.address}
                      />
                    </ListItem>
                    {order.delivery.instructions && (
                      <ListItem>
                        <ListItemIcon>
                          <MessageIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Instructions"
                          secondary={order.delivery.instructions}
                        />
                      </ListItem>
                    )}
                    <ListItem>
                      <ListItemIcon>
                        <TimeIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Estimated Delivery"
                        secondary={order.delivery.estimatedTime}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>

              {/* Payment Info */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Payment Information
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <ReceiptIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Payment Method"
                        secondary={order.payment.method}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <TimeIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Order Date"
                        secondary={new Date(order.payment.date).toLocaleString()}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>

      {/* Message Dialog */}
      <Dialog open={messageDialogOpen} onClose={handleCloseMessageDialog}>
        <DialogTitle>Message to Driver</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="message"
            label="Your message"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={message}
            onChange={handleMessageChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMessageDialog}>Cancel</Button>
          <Button onClick={handleSendMessage} variant="contained">Send</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default TrackOrder; 