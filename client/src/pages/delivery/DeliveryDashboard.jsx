// DeliveryDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Container, Box, Typography, Paper, Grid, Button, Tabs, Tab,
  Card, CardContent, Divider, Chip, CircularProgress, Snackbar, Alert, Badge
} from '@mui/material';
import {
  DirectionsBike as BikeIcon, Refresh as RefreshIcon, DoneAll as DoneAllIcon,
  Cancel as CancelIcon, LocalShipping as LocalShippingIcon
} from '@mui/icons-material';
import Layout from '../../components/layout/Layout';
import deliveryService from '../../services/delivery.service';

const DeliveryDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [deliveries, setDeliveries] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [refreshing, setRefreshing] = useState(false);
  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const response = await deliveryService.getAllDeliveries();
      setDeliveries(response);
    } catch (error) {
      console.error('Fetch error:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch deliveries',
        severity: 'error'
      });
    }
    setLoading(false);
  };


  useEffect(() => {
    fetchDeliveries();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleStatusUpdate = async (deliveryId, newStatus) => {
    try {
      await deliveryService.updateDeliveryStatus(deliveryId, newStatus);
      setSnackbar({
        open: true,
        message: `Status updated to ${getStatusText(newStatus)}`,
        severity: 'success'
      });
      fetchDeliveries(); // Refresh the list
    } catch (error) {
      console.error('Status update error:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update delivery status',
        severity: 'error'
      });
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDeliveries().then(() => {
      setRefreshing(false);
      setSnackbar({
        open: true,
        message: 'Deliveries refreshed',
        severity: 'success'
      });
    });
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending Pickup';
      case 'picked_up': return 'Out for Delivery';
      case 'in_transit': return 'In Transit';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'picked_up': return 'info';
      case 'in_transit': return 'info';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getTabDeliveries = () => {
    switch (tabValue) {
      case 0: return deliveries;
      case 1: return deliveries.filter(delivery => delivery.status === 'pending');
      case 2: return deliveries.filter(delivery => delivery.status === 'picked_up' || delivery.status === 'in_transit');
      case 3: return deliveries.filter(delivery => delivery.status === 'delivered');
      case 4: return deliveries.filter(delivery => delivery.status === 'cancelled');
      default: return deliveries;
    }
  };

  const formatTime = (dateString) => new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
            <Typography variant="h4">My Deliveries</Typography>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleRefresh} disabled={refreshing}>
              Refresh
            </Button>
          </Box>

          <Paper sx={{ mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
              <Tab label="All" />
              <Tab label={<Badge badgeContent={deliveries.filter(d => d.status === 'pending').length} color="warning">Pending</Badge>} />
              <Tab label={<Badge badgeContent={deliveries.filter(d => d.status === 'picked_up').length} color="info">Out</Badge>} />
              <Tab label="Delivered" />
              <Tab label="Cancelled" />
            </Tabs>
          </Paper>

          <Grid container spacing={3}>
            {getTabDeliveries().map((delivery) => (
              <Grid item xs={12} md={6} lg={4} key={delivery._id}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="h6">Order #{delivery._id.slice(-5)}</Typography>
                      <Chip label={getStatusText(delivery.status)} color={getStatusColor(delivery.status)} size="small" />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {formatTime(delivery.createdAt)} ({calculateTimeAgo(delivery.createdAt)})
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2"><strong>From:</strong> {delivery.restaurant?.name}</Typography>
                    <Typography variant="body2"><strong>To:</strong> {delivery.customer?.name}</Typography>
                    <Typography variant="body2"><strong>Total:</strong> Rs.{delivery.totalAmount}</Typography>
                    
                    {/* Action Buttons */}
                    <Box mt={2} display="flex" gap={1}>
                      {(delivery.status === 'pending' || delivery.status === 'assigned') && (
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<LocalShippingIcon />}
                          onClick={() => handleStatusUpdate(delivery._id, 'picked_up')}
                          fullWidth
                        >
                          Confirm Pickup
                        </Button>
                      )}
                      {(delivery.status === 'picked_up' || delivery.status === 'in_transit') && (
                        <>
                          <Button
                            variant="contained"
                            color="success"
                            startIcon={<DoneAllIcon />}
                            onClick={() => handleStatusUpdate(delivery._id, 'delivered')}
                            fullWidth
                          >
                            Mark as Delivered
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<CancelIcon />}
                            onClick={() => handleStatusUpdate(delivery._id, 'cancelled')}
                            fullWidth
                          >
                            Cancel Delivery
                          </Button>
                        </>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Layout>
  );
};

export default DeliveryDashboard;
