// src/pages/restaurant/OrderManagement.jsx

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
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import orderService from '../../services/order.service';
import Layout from '../../components/layout/Layout';


const OrderManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const restaurantId = new URLSearchParams(location.search).get('restaurantId');

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchOrders();
  }, [restaurantId]);

  const fetchOrders = async () => {
    if (!restaurantId) {
      console.error('Restaurant ID missing in URL.');
      return;
    }
  
    try {
      setLoading(true);
      const orders = await orderService.getRestaurantOrders(restaurantId);
      setOrders(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  console.log('RestaurantId used for fetch:', restaurantId);

  
  

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      await orderService.updateOrderStatus(orderId, 'preparing');
      setOrders(prev => prev.map(order => order._id === orderId ? { ...order, status: 'preparing' } : order));
      setSnackbar({ open: true, message: 'Order accepted', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to accept order', severity: 'error' });
    }
  };

  const handleMarkReady = async (orderId) => {
    try {
      await orderService.updateOrderStatus(orderId, 'ready_for_pickup');
      setOrders(prev => prev.map(order => order._id === orderId ? { ...order, status: 'ready_for_pickup' } : order));
      setSnackbar({ open: true, message: 'Marked ready for pickup', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to mark ready', severity: 'error' });
    }
  };

  const handleRejectOrder = async () => {
    if (!selectedOrder) return;
    try {
      await orderService.updateOrderStatus(selectedOrder._id, 'cancelled', rejectionReason);
      setOrders(prev => prev.map(order => order._id === selectedOrder._id ? { ...order, status: 'cancelled' } : order));
      setRejectDialogOpen(false);
      setSnackbar({ open: true, message: 'Order rejected', severity: 'info' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to reject order', severity: 'error' });
    }
  };

  const getFilteredOrders = () => {
    switch (tabValue) {
      case 1: return orders.filter(order => order.status === 'new');
      case 2: return orders.filter(order => order.status === 'preparing');
      case 3: return orders.filter(order => order.status === 'ready_for_pickup');
      case 4: return orders.filter(order => ['delivered', 'out_for_delivery'].includes(order.status));
      case 5: return orders.filter(order => order.status === 'cancelled');
      default: return orders;
    }
  };

  if (loading) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
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
            <Button startIcon={<BackIcon />} onClick={() => navigate(`/restaurant-dashboard/${restaurantId}`)}>Back</Button>
            <Typography variant="h4">Order Management</Typography>
            <Button startIcon={<RefreshIcon />} onClick={fetchOrders}>Refresh</Button>
          </Box>

          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="All" />
              <Tab label="New" />
              <Tab label="Preparing" />
              <Tab label="Ready for Pickup" />
              <Tab label="Completed" />
              <Tab label="Cancelled" />
            </Tabs>
          </Paper>

          <Grid container spacing={2}>
            {getFilteredOrders().map((order) => (
              <Grid item xs={12} md={6} lg={4} key={order._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Order #{order._id.slice(-5)}</Typography>
                    <Typography variant="body2">{order.customer.name}</Typography>
                    <Typography variant="body2">Total: ${order.totalAmount.toFixed(2)}</Typography>
                    <Typography variant="body2">Status: {order.status.replace('_', ' ')}</Typography>

                    {order.status === 'new' && (
                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button variant="contained" color="primary" onClick={() => handleAcceptOrder(order._id)}>Accept</Button>
                        <Button variant="outlined" color="error" onClick={() => { setSelectedOrder(order); setRejectDialogOpen(true); }}>Reject</Button>
                      </Box>
                    )}

                    {order.status === 'preparing' && (
                      <Button sx={{ mt: 2 }} variant="contained" color="success" onClick={() => handleMarkReady(order._id)}>Mark Ready</Button>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

        </Box>

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)}>
          <DialogTitle>Reject Order</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Reason"
              fullWidth
              variant="outlined"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" color="error" onClick={handleRejectOrder} disabled={!rejectionReason.trim()}>Reject</Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Layout>
  );
};

export default OrderManagement;