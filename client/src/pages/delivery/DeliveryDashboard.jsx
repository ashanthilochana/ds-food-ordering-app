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
  Card,
  CardContent,
  Divider,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Snackbar,
  Alert,
  Badge
} from '@mui/material';
import {
  DirectionsBike as BikeIcon,
  LocalShipping as ShippingIcon,
  CheckCircleOutline as CompleteIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  DoneAll as DoneAllIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import Layout from '../../components/layout/Layout';

// Mock delivery data
const mockDeliveries = [
  {
    id: 'd1001',
    orderId: '12348',
    status: 'assigned', // 'assigned', 'picked_up', 'delivered', 'cancelled'
    restaurant: {
      name: 'Pizza Palace',
      address: '123 Main Street, Cityville',
      phone: '+1 234-567-8900',
      location: { lat: 40.7128, lng: -74.0060 }
    },
    customer: {
      name: 'Sarah Williams',
      address: '101 Maple St, Cityville',
      phone: '+1 234-567-8903',
      location: { lat: 40.7200, lng: -74.0100 },
      notes: ''
    },
    orderTime: '2023-09-15T09:45:00Z',
    estimatedDeliveryTime: '2023-09-15T10:30:00Z',
    items: [
      { name: 'Supreme Pizza', quantity: 1 },
      { name: 'Hot Wings', quantity: 10 },
      { name: 'Bottled Water', quantity: 2 }
    ],
    totalAmount: 28.38,
    paymentMethod: 'Credit Card'
  },
  {
    id: 'd1002',
    orderId: '12351',
    status: 'picked_up',
    restaurant: {
      name: 'Burger Hub',
      address: '456 Oak Avenue, Cityville',
      phone: '+1 234-567-8910',
      location: { lat: 40.7150, lng: -74.0070 }
    },
    customer: {
      name: 'Robert Johnson',
      address: '202 Pine St, Cityville',
      phone: '+1 234-567-8920',
      location: { lat: 40.7180, lng: -74.0090 },
      notes: 'Apartment 3B, ring the buzzer'
    },
    orderTime: '2023-09-15T10:00:00Z',
    estimatedDeliveryTime: '2023-09-15T10:45:00Z',
    items: [
      { name: 'Double Cheese Burger', quantity: 2 },
      { name: 'French Fries', quantity: 1 },
      { name: 'Milkshake', quantity: 2 }
    ],
    totalAmount: 32.95,
    paymentMethod: 'Cash on Delivery'
  },
  {
    id: 'd1003',
    orderId: '12352',
    status: 'delivered',
    restaurant: {
      name: 'Sushi Express',
      address: '789 Cherry Blvd, Cityville',
      phone: '+1 234-567-8930',
      location: { lat: 40.7160, lng: -74.0050 }
    },
    customer: {
      name: 'Alice Cooper',
      address: '303 Elm St, Cityville',
      phone: '+1 234-567-8940',
      location: { lat: 40.7210, lng: -74.0080 },
      notes: 'Leave at the door'
    },
    orderTime: '2023-09-15T09:15:00Z',
    estimatedDeliveryTime: '2023-09-15T10:00:00Z',
    deliveredTime: '2023-09-15T09:55:00Z',
    items: [
      { name: 'California Roll', quantity: 2 },
      { name: 'Miso Soup', quantity: 1 },
      { name: 'Green Tea', quantity: 1 }
    ],
    totalAmount: 24.50,
    paymentMethod: 'Online Payment'
  },
  {
    id: 'd1004',
    orderId: '12353',
    status: 'cancelled',
    restaurant: {
      name: 'Taco Town',
      address: '555 Sunset Drive, Cityville',
      phone: '+1 234-567-8950',
      location: { lat: 40.7140, lng: -74.0040 }
    },
    customer: {
      name: 'David Smith',
      address: '404 Birch Rd, Cityville',
      phone: '+1 234-567-8960',
      location: { lat: 40.7190, lng: -74.0110 },
      notes: ''
    },
    orderTime: '2023-09-15T08:30:00Z',
    estimatedDeliveryTime: '2023-09-15T09:15:00Z',
    cancelReason: 'Restaurant closed unexpectedly',
    items: [
      { name: 'Taco Combo', quantity: 1 },
      { name: 'Nachos', quantity: 1 },
      { name: 'Soda', quantity: 1 }
    ],
    totalAmount: 18.75,
    paymentMethod: 'Credit Card'
  }
];

const DeliveryDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [deliveries, setDeliveries] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [deliveryDetailOpen, setDeliveryDetailOpen] = useState(false);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Simulating API call to fetch deliveries
    setTimeout(() => {
      setDeliveries(mockDeliveries);
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
        message: 'Deliveries refreshed',
        severity: 'success'
      });
    }, 1000);
  };

  const handleOpenDeliveryDetail = (delivery) => {
    setSelectedDelivery(delivery);
    setDeliveryDetailOpen(true);
  };

  const handleCloseDeliveryDetail = () => {
    setDeliveryDetailOpen(false);
  };

  const handleOpenConfirmationDialog = (delivery, action) => {
    setSelectedDelivery(delivery);
    setConfirmationAction(action);
    setConfirmationDialogOpen(true);
  };

  const handleCloseConfirmationDialog = () => {
    setConfirmationDialogOpen(false);
  };

  const handleConfirmAction = () => {
    // Update delivery status based on the action
    const updatedDeliveries = deliveries.map(delivery => {
      if (delivery.id === selectedDelivery.id) {
        const updatedDelivery = { ...delivery };
        
        if (confirmationAction === 'pickup') {
          updatedDelivery.status = 'picked_up';
          updatedDelivery.pickedUpTime = new Date().toISOString();
        } else if (confirmationAction === 'deliver') {
          updatedDelivery.status = 'delivered';
          updatedDelivery.deliveredTime = new Date().toISOString();
        } else if (confirmationAction === 'cancel') {
          updatedDelivery.status = 'cancelled';
          updatedDelivery.cancelReason = 'Cancelled by delivery person';
        }
        
        return updatedDelivery;
      }
      return delivery;
    });
    
    setDeliveries(updatedDeliveries);
    setConfirmationDialogOpen(false);
    if (deliveryDetailOpen) {
      setDeliveryDetailOpen(false);
    }
    
    setSnackbar({
      open: true,
      message: confirmationAction === 'pickup' 
        ? 'Order picked up successfully' 
        : confirmationAction === 'deliver'
          ? 'Order delivered successfully'
          : 'Delivery cancelled',
      severity: confirmationAction === 'cancel' ? 'error' : 'success'
    });
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'assigned': return 'Pending Pickup';
      case 'picked_up': return 'Out for Delivery';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'assigned': return 'warning';
      case 'picked_up': return 'info';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getTabDeliveries = () => {
    switch (tabValue) {
      case 0: // All
        return deliveries;
      case 1: // Pending Pickup
        return deliveries.filter(delivery => delivery.status === 'assigned');
      case 2: // Out for Delivery
        return deliveries.filter(delivery => delivery.status === 'picked_up');
      case 3: // Completed
        return deliveries.filter(delivery => delivery.status === 'delivered');
      case 4: // Cancelled
        return deliveries.filter(delivery => delivery.status === 'cancelled');
      default:
        return deliveries;
    }
  };

  const formatTime = (dateString) => {
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

  const getDeliveryItemsText = (items) => {
    if (items.length === 1) {
      return `${items[0].quantity}x ${items[0].name}`;
    }
    return `${items[0].quantity}x ${items[0].name} + ${items.length - 1} more`;
  };

  const getConfirmationDialogContent = () => {
    if (!confirmationAction || !selectedDelivery) return '';
    
    switch (confirmationAction) {
      case 'pickup':
        return `Are you sure you want to confirm pickup of order #${selectedDelivery.orderId} from ${selectedDelivery.restaurant.name}?`;
      case 'deliver':
        return `Are you sure you want to mark order #${selectedDelivery.orderId} as delivered to ${selectedDelivery.customer.name}?`;
      case 'cancel':
        return `Are you sure you want to cancel the delivery of order #${selectedDelivery.orderId}? This action cannot be undone.`;
      default:
        return '';
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

  return (
    <Layout>
      <Container>
        <Box sx={{ my: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1">
              My Deliveries
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
              <Tab label="All Deliveries" />
              <Tab 
                label={
                  <Badge 
                    badgeContent={deliveries.filter(del => del.status === 'assigned').length} 
                    color="warning"
                    showZero={false}
                  >
                    Pending Pickup
                  </Badge>
                } 
              />
              <Tab 
                label={
                  <Badge 
                    badgeContent={deliveries.filter(del => del.status === 'picked_up').length} 
                    color="info"
                    showZero={false}
                  >
                    Out for Delivery
                  </Badge>
                } 
              />
              <Tab label="Completed" />
              <Tab label="Cancelled" />
            </Tabs>
          </Paper>

          <Grid container spacing={3}>
            {getTabDeliveries().length === 0 ? (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <BikeIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    No deliveries found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {tabValue === 0 
                      ? "You don't have any deliveries assigned yet." 
                      : `You don't have any ${tabValue === 1 
                          ? 'pending pickup' 
                          : tabValue === 2 
                            ? 'ongoing' 
                            : tabValue === 3 
                              ? 'completed' 
                              : 'cancelled'} deliveries.`
                    }
                  </Typography>
                </Box>
              </Grid>
            ) : (
              getTabDeliveries().map((delivery) => (
                <Grid item xs={12} md={6} lg={4} key={delivery.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 3
                      }
                    }}
                    onClick={() => handleOpenDeliveryDetail(delivery)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6">
                          Order #{delivery.orderId}
                        </Typography>
                        <Chip 
                          label={getStatusText(delivery.status)} 
                          color={getStatusColor(delivery.status)}
                          size="small"
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <TimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {formatTime(delivery.orderTime)} ({calculateTimeAgo(delivery.orderTime)})
                        </Typography>
                      </Box>
                      
                      <Divider sx={{ my: 1 }} />
                      
                      {/* Restaurant info */}
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" fontWeight="bold">
                          From: {delivery.restaurant.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {delivery.restaurant.address}
                        </Typography>
                      </Box>
                      
                      {/* Customer info */}
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" fontWeight="bold">
                          To: {delivery.customer.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {delivery.customer.address}
                        </Typography>
                      </Box>
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <Typography variant="body2" color="text.secondary">
                        {getDeliveryItemsText(delivery.items)}
                      </Typography>

                      {/* Action buttons based on status */}
                      {delivery.status === 'assigned' && (
                        <Button
                          variant="contained"
                          color="primary"
                          fullWidth
                          startIcon={<ShippingIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenConfirmationDialog(delivery, 'pickup');
                          }}
                          sx={{ mt: 2 }}
                        >
                          Confirm Pickup
                        </Button>
                      )}

                      {delivery.status === 'picked_up' && (
                        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenConfirmationDialog(delivery, 'cancel');
                            }}
                            sx={{ flex: 1 }}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            startIcon={<DoneAllIcon />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenConfirmationDialog(delivery, 'deliver');
                            }}
                            sx={{ flex: 1 }}
                          >
                            Delivered
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

      {/* Delivery Detail Dialog */}
      <Dialog
        open={deliveryDetailOpen}
        onClose={handleCloseDeliveryDetail}
        maxWidth="md"
        fullWidth
      >
        {selectedDelivery && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  Order #{selectedDelivery.orderId}
                </Typography>
                <Chip 
                  label={getStatusText(selectedDelivery.status)} 
                  color={getStatusColor(selectedDelivery.status)}
                />
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Restaurant Information
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <RestaurantIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={selectedDelivery.restaurant.name}
                          secondary={selectedDelivery.restaurant.address}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <PhoneIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={selectedDelivery.restaurant.phone}
                          secondary={
                            <Button 
                              variant="text" 
                              size="small" 
                              onClick={() => { window.location.href = `tel:${selectedDelivery.restaurant.phone}`; }}
                            >
                              Call Restaurant
                            </Button>
                          }
                        />
                      </ListItem>
                    </List>
                  </Paper>

                  <Typography variant="subtitle1" gutterBottom>
                    Customer Information
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <PersonIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={selectedDelivery.customer.name}
                          secondary={selectedDelivery.customer.address}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <PhoneIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={selectedDelivery.customer.phone}
                          secondary={
                            <Button 
                              variant="text" 
                              size="small" 
                              onClick={() => { window.location.href = `tel:${selectedDelivery.customer.phone}`; }}
                            >
                              Call Customer
                            </Button>
                          }
                        />
                      </ListItem>
                      {selectedDelivery.customer.notes && (
                        <ListItem>
                          <ListItemText
                            primary="Delivery Notes"
                            secondary={selectedDelivery.customer.notes}
                            primaryTypographyProps={{ color: 'primary' }}
                          />
                        </ListItem>
                      )}
                    </List>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Order Details
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="Ordered at"
                          secondary={new Date(selectedDelivery.orderTime).toLocaleString()}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Estimated Delivery"
                          secondary={new Date(selectedDelivery.estimatedDeliveryTime).toLocaleString()}
                        />
                      </ListItem>
                      {selectedDelivery.pickedUpTime && (
                        <ListItem>
                          <ListItemText
                            primary="Picked Up at"
                            secondary={new Date(selectedDelivery.pickedUpTime).toLocaleString()}
                          />
                        </ListItem>
                      )}
                      {selectedDelivery.deliveredTime && (
                        <ListItem>
                          <ListItemText
                            primary="Delivered at"
                            secondary={new Date(selectedDelivery.deliveredTime).toLocaleString()}
                          />
                        </ListItem>
                      )}
                      {selectedDelivery.cancelReason && (
                        <ListItem>
                          <ListItemText
                            primary="Cancellation Reason"
                            secondary={selectedDelivery.cancelReason}
                            primaryTypographyProps={{ color: 'error' }}
                            secondaryTypographyProps={{ color: 'error' }}
                          />
                        </ListItem>
                      )}
                      <ListItem>
                        <ListItemText
                          primary="Payment Method"
                          secondary={selectedDelivery.paymentMethod}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Total Amount"
                          secondary={`$${selectedDelivery.totalAmount.toFixed(2)}`}
                          primaryTypographyProps={{ fontWeight: 'bold' }}
                          secondaryTypographyProps={{ fontWeight: 'bold' }}
                        />
                      </ListItem>
                    </List>
                  </Paper>

                  <Typography variant="subtitle1" gutterBottom>
                    Order Items
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <List dense>
                      {selectedDelivery.items.map((item, index) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={`${item.quantity}x ${item.name}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDeliveryDetail}>Close</Button>
              
              {selectedDelivery.status === 'assigned' && (
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<ShippingIcon />}
                  onClick={() => {
                    handleCloseDeliveryDetail();
                    handleOpenConfirmationDialog(selectedDelivery, 'pickup');
                  }}
                >
                  Confirm Pickup
                </Button>
              )}
              
              {selectedDelivery.status === 'picked_up' && (
                <>
                  <Button 
                    variant="outlined" 
                    color="error" 
                    startIcon={<CancelIcon />}
                    onClick={() => {
                      handleCloseDeliveryDetail();
                      handleOpenConfirmationDialog(selectedDelivery, 'cancel');
                    }}
                  >
                    Cancel Delivery
                  </Button>
                  <Button 
                    variant="contained" 
                    color="success" 
                    startIcon={<DoneAllIcon />}
                    onClick={() => {
                      handleCloseDeliveryDetail();
                      handleOpenConfirmationDialog(selectedDelivery, 'deliver');
                    }}
                  >
                    Mark as Delivered
                  </Button>
                </>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmationDialogOpen}
        onClose={handleCloseConfirmationDialog}
      >
        <DialogTitle>
          {confirmationAction === 'pickup' 
            ? 'Confirm Pickup' 
            : confirmationAction === 'deliver' 
              ? 'Confirm Delivery' 
              : 'Cancel Delivery'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            {getConfirmationDialogContent()}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmationDialog}>
            No, Cancel
          </Button>
          <Button 
            variant="contained" 
            color={confirmationAction === 'cancel' ? 'error' : 'primary'} 
            onClick={handleConfirmAction}
          >
            Yes, Confirm
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

export default DeliveryDashboard; 