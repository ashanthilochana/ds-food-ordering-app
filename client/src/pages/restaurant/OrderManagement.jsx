import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Tabs,
  Tab,
  List,
  ListItem,
  Divider,
  Chip,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Badge,
  Stack,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  RestaurantMenu as RestaurantIcon,
  Motorcycle as DeliveryIcon,
  Receipt as ReceiptIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';
import Layout from '../../components/layout/Layout';

// Mock data for orders
const mockOrders = [
  {
    id: '12345',
    status: 'new',
    orderTime: '2023-09-15T10:30:00Z',
    customer: {
      name: 'John Doe',
      phone: '+1 234-567-8900',
      address: '123 Main St, Apt 4B, Cityville',
      notes: 'Please include extra napkins'
    },
    items: [
      { name: 'Margherita Pizza', quantity: 2, price: 12.99, options: { Size: 'Medium', Crust: 'Thin' } },
      { name: 'Garlic Bread', quantity: 1, price: 4.99, options: { 'Add-ons': 'Cheese' } }
    ],
    totalAmount: 30.97,
    paymentMethod: 'Credit Card'
  },
  {
    id: '12346',
    status: 'preparing',
    orderTime: '2023-09-15T10:15:00Z',
    customer: {
      name: 'Jane Smith',
      phone: '+1 234-567-8901',
      address: '456 Oak Ave, Cityville',
      notes: ''
    },
    items: [
      { name: 'Pepperoni Pizza', quantity: 1, price: 14.99, options: { Size: 'Large', Crust: 'Thick' } },
      { name: 'Caesar Salad', quantity: 1, price: 6.99, options: { Size: 'Regular' } },
      { name: 'Soda', quantity: 2, price: 1.99, options: { Type: 'Cola' } }
    ],
    totalAmount: 25.96,
    paymentMethod: 'Cash on Delivery'
  },
  {
    id: '12347',
    status: 'ready',
    orderTime: '2023-09-15T10:00:00Z',
    customer: {
      name: 'Mike Johnson',
      phone: '+1 234-567-8902',
      address: '789 Pine Rd, Cityville',
      notes: 'Call upon arrival'
    },
    items: [
      { name: 'Vegetarian Pizza', quantity: 1, price: 13.99, options: { Size: 'Medium', Crust: 'Thin' } },
      { name: 'Cheesy Bread', quantity: 1, price: 5.99, options: {} }
    ],
    totalAmount: 19.98,
    paymentMethod: 'Online Payment'
  },
  {
    id: '12348',
    status: 'in_transit',
    orderTime: '2023-09-15T09:45:00Z',
    customer: {
      name: 'Sarah Williams',
      phone: '+1 234-567-8903',
      address: '101 Maple St, Cityville',
      notes: ''
    },
    items: [
      { name: 'Supreme Pizza', quantity: 1, price: 16.99, options: { Size: 'Large', Crust: 'Stuffed' } },
      { name: 'Hot Wings', quantity: 10, price: 0.99, options: { Sauce: 'Spicy' } },
      { name: 'Bottled Water', quantity: 2, price: 1.49, options: {} }
    ],
    totalAmount: 28.38,
    paymentMethod: 'Credit Card'
  },
  {
    id: '12349',
    status: 'delivered',
    orderTime: '2023-09-15T09:30:00Z',
    customer: {
      name: 'David Brown',
      phone: '+1 234-567-8904',
      address: '202 Elm St, Cityville',
      notes: 'Leave at the door'
    },
    items: [
      { name: 'Hawaiian Pizza', quantity: 1, price: 15.99, options: { Size: 'Medium', Crust: 'Thin' } },
      { name: 'Fries', quantity: 1, price: 3.99, options: { Size: 'Large' } }
    ],
    totalAmount: 19.98,
    paymentMethod: 'Online Payment'
  },
  {
    id: '12350',
    status: 'cancelled',
    orderTime: '2023-09-15T09:15:00Z',
    customer: {
      name: 'Emily Davis',
      phone: '+1 234-567-8905',
      address: '303 Birch Dr, Cityville',
      notes: ''
    },
    items: [
      { name: 'Meat Lovers Pizza', quantity: 1, price: 17.99, options: { Size: 'Large', Crust: 'Thick' } }
    ],
    totalAmount: 17.99,
    paymentMethod: 'Credit Card'
  }
];

const OrderManagement = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailOpen, setOrderDetailOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Simulating API call to fetch orders
    setTimeout(() => {
      setOrders(mockOrders);
      setLoading(false);
    }, 1000);
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      // In a real app, you'd refresh the data from the server
      setRefreshing(false);
      setSnackbar({
        open: true,
        message: 'Orders refreshed',
        severity: 'success'
      });
    }, 1000);
  };

  const handleOpenOrderDetail = (order) => {
    setSelectedOrder(order);
    setOrderDetailOpen(true);
  };

  const handleCloseOrderDetail = () => {
    setOrderDetailOpen(false);
  };

  const handleOpenRejectDialog = (order) => {
    setSelectedOrder(order);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  const handleCloseRejectDialog = () => {
    setRejectDialogOpen(false);
  };

  const handleRejectOrder = () => {
    // Update order status to "cancelled"
    const updatedOrders = orders.map(order => 
      order.id === selectedOrder.id 
        ? { ...order, status: 'cancelled', rejectionReason } 
        : order
    );
    setOrders(updatedOrders);
    setRejectDialogOpen(false);
    setSnackbar({
      open: true,
      message: 'Order rejected',
      severity: 'info'
    });
  };

  const handleAcceptOrder = (orderId) => {
    // Update order status to "preparing"
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, status: 'preparing' } : order
    );
    setOrders(updatedOrders);
    setSnackbar({
      open: true,
      message: 'Order accepted',
      severity: 'success'
    });
  };

  const handleMarkReady = (orderId) => {
    // Update order status to "ready"
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, status: 'ready' } : order
    );
    setOrders(updatedOrders);
    setSnackbar({
      open: true,
      message: 'Order marked as ready for pickup',
      severity: 'success'
    });
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'new': return 'New Order';
      case 'preparing': return 'Preparing';
      case 'ready': return 'Ready for Pickup';
      case 'in_transit': return 'Out for Delivery';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'primary';
      case 'preparing': return 'warning';
      case 'ready': return 'success';
      case 'in_transit': return 'info';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getTabOrders = () => {
    switch (tabValue) {
      case 0: // All
        return orders;
      case 1: // New
        return orders.filter(order => order.status === 'new');
      case 2: // Preparing
        return orders.filter(order => order.status === 'preparing');
      case 3: // Ready
        return orders.filter(order => order.status === 'ready');
      case 4: // Completed
        return orders.filter(order => ['in_transit', 'delivered'].includes(order.status));
      case 5: // Cancelled
        return orders.filter(order => order.status === 'cancelled');
      default:
        return orders;
    }
  };

  const formatOrderTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const calculateTimeAgo = (dateString) => {
    const orderTime = new Date(dateString);
    const now = new Date();
    const diffMs = now - orderTime;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    return `${diffHours} hours ago`;
  };

  const getOrderItemsText = (items) => {
    if (items.length === 1) {
      return `${items[0].quantity}x ${items[0].name}`;
    }
    return `${items[0].quantity}x ${items[0].name} + ${items.length - 1} more`;
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

  return (
    <Layout>
      <Container>
        <Box sx={{ my: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1">
              Order Management
            </Typography>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={refreshing}
            >
              Refresh
            </Button>
          </Box>

          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="All Orders" />
              <Tab 
                label={
                  <Badge 
                    badgeContent={orders.filter(order => order.status === 'new').length} 
                    color="primary"
                    showZero={false}
                  >
                    New
                  </Badge>
                } 
              />
              <Tab 
                label={
                  <Badge 
                    badgeContent={orders.filter(order => order.status === 'preparing').length} 
                    color="warning"
                    showZero={false}
                  >
                    Preparing
                  </Badge>
                } 
              />
              <Tab 
                label={
                  <Badge 
                    badgeContent={orders.filter(order => order.status === 'ready').length} 
                    color="success"
                    showZero={false}
                  >
                    Ready
                  </Badge>
                } 
              />
              <Tab label="Completed" />
              <Tab label="Cancelled" />
            </Tabs>
          </Paper>

          <Grid container spacing={3}>
            {getTabOrders().length === 0 ? (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <ReceiptIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    No orders found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {tabValue === 0 
                      ? "You don't have any orders yet." 
                      : `You don't have any ${tabValue === 1 
                          ? 'new' 
                          : tabValue === 2 
                            ? 'preparing' 
                            : tabValue === 3 
                              ? 'ready' 
                              : tabValue === 4 
                                ? 'completed' 
                                : 'cancelled'} orders.`
                    }
                  </Typography>
                </Box>
              </Grid>
            ) : (
              getTabOrders().map((order) => (
                <Grid item xs={12} md={6} lg={4} key={order.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 3
                      }
                    }}
                    onClick={() => handleOpenOrderDetail(order)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6">
                          Order #{order.id}
                        </Typography>
                        <Chip 
                          label={getStatusText(order.status)} 
                          color={getStatusColor(order.status)}
                          size="small"
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <TimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {formatOrderTime(order.orderTime)} ({calculateTimeAgo(order.orderTime)})
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {order.customer.name}
                        </Typography>
                      </Box>
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" fontWeight="bold">
                          {getOrderItemsText(order.items)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {order.items.length} items • ${order.totalAmount.toFixed(2)} • {order.paymentMethod}
                        </Typography>
                      </Box>

                      {order.status === 'new' && (
                        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            startIcon={<CheckIcon />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAcceptOrder(order.id);
                            }}
                            sx={{ flex: 1 }}
                          >
                            Accept
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<CloseIcon />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenRejectDialog(order);
                            }}
                            sx={{ flex: 1 }}
                          >
                            Reject
                          </Button>
                        </Box>
                      )}

                      {order.status === 'preparing' && (
                        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            startIcon={<CheckIcon />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkReady(order.id);
                            }}
                            sx={{ flex: 1 }}
                          >
                            Mark Ready
                          </Button>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </Box>
      </Container>

      {/* Order Detail Dialog */}
      <Dialog
        open={orderDetailOpen}
        onClose={handleCloseOrderDetail}
        maxWidth="md"
        fullWidth
      >
        {selectedOrder && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  Order #{selectedOrder.id}
                </Typography>
                <Chip 
                  label={getStatusText(selectedOrder.status)} 
                  color={getStatusColor(selectedOrder.status)}
                />
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Order Information
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Order Time:
                    </Typography>
                    <Typography variant="body1">
                      {new Date(selectedOrder.orderTime).toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Payment Method:
                    </Typography>
                    <Typography variant="body1">
                      {selectedOrder.paymentMethod}
                    </Typography>
                  </Box>
                  {selectedOrder.status === 'cancelled' && selectedOrder.rejectionReason && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Cancellation Reason:
                      </Typography>
                      <Typography variant="body1" color="error.main">
                        {selectedOrder.rejectionReason}
                      </Typography>
                    </Box>
                  )}
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Customer Information
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Name:
                    </Typography>
                    <Typography variant="body1">
                      {selectedOrder.customer.name}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Phone:
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ mr: 1 }}>
                        {selectedOrder.customer.phone}
                      </Typography>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => { window.location.href = `tel:${selectedOrder.customer.phone}`; }}
                      >
                        <PhoneIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Delivery Address:
                    </Typography>
                    <Typography variant="body1">
                      {selectedOrder.customer.address}
                    </Typography>
                  </Box>
                  {selectedOrder.customer.notes && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Notes:
                      </Typography>
                      <Typography variant="body1">
                        {selectedOrder.customer.notes}
                      </Typography>
                    </Box>
                  )}
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Order Items
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <List sx={{ width: '100%' }}>
                      {selectedOrder.items.map((item, index) => (
                        <React.Fragment key={index}>
                          <ListItem sx={{ py: 1, px: 0 }}>
                            <Grid container spacing={2}>
                              <Grid item xs={6}>
                                <Typography variant="body1">
                                  {item.quantity}x {item.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {Object.entries(item.options || {}).map(([key, value]) => (
                                    `${key}: ${value}`
                                  )).join(' • ')}
                                </Typography>
                              </Grid>
                              <Grid item xs={6} sx={{ textAlign: 'right' }}>
                                <Typography variant="body1">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </Typography>
                              </Grid>
                            </Grid>
                          </ListItem>
                          {index < selectedOrder.items.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Typography variant="subtitle1">Total</Typography>
                      <Typography variant="subtitle1">${selectedOrder.totalAmount.toFixed(2)}</Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseOrderDetail}>Close</Button>
              
              {selectedOrder.status === 'new' && (
                <>
                  <Button 
                    variant="outlined" 
                    color="error" 
                    onClick={() => {
                      handleCloseOrderDetail();
                      handleOpenRejectDialog(selectedOrder);
                    }}
                  >
                    Reject Order
                  </Button>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={() => {
                      handleAcceptOrder(selectedOrder.id);
                      handleCloseOrderDetail();
                    }}
                  >
                    Accept Order
                  </Button>
                </>
              )}
              
              {selectedOrder.status === 'preparing' && (
                <Button 
                  variant="contained" 
                  color="success" 
                  onClick={() => {
                    handleMarkReady(selectedOrder.id);
                    handleCloseOrderDetail();
                  }}
                >
                  Mark as Ready
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Reject Order Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={handleCloseRejectDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reject Order</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Are you sure you want to reject this order? This action cannot be undone.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for Rejection"
            fullWidth
            multiline
            rows={3}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Please provide a reason for rejecting this order"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRejectDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleRejectOrder}
            disabled={!rejectionReason.trim()}
          >
            Reject Order
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
};

export default OrderManagement; 