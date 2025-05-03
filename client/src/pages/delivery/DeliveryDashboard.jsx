import React, { useState, useEffect } from 'react';
import {
  Container, Box, Typography, Paper, Grid, Button, Tabs, Tab,
  Card, CardContent, Divider, Chip, CircularProgress, Snackbar, Alert, Badge
} from '@mui/material';
import {
  DirectionsBike as BikeIcon, Refresh as RefreshIcon, DoneAll as DoneAllIcon,
  Cancel as CancelIcon
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
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'picked_up': return 'info';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getTabDeliveries = () => {
    switch (tabValue) {
      case 0: return deliveries;
      case 1: return deliveries.filter(delivery => delivery.status === 'pending');
      case 2: return deliveries.filter(delivery => delivery.status === 'picked_up');
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

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await deliveryService.updateDeliveryStatus(id, newStatus);
      fetchDeliveries();
      setSnackbar({
        open: true,
        message: `Order marked as ${newStatus.replace('_', ' ')}`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Update error:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update status',
        severity: 'error'
      });
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
            <Typography variant="h4">My Deliveries</Typography>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleRefresh} disabled={refreshing}>
              Refresh
            </Button>
          </Box>

          <Paper sx={{ mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
              <Tab label="All Deliveries" />
              <Tab label={<Badge badgeContent={deliveries.filter(d => d.status === 'pending').length} color="warning">Pending Pickup</Badge>} />
              <Tab label={<Badge badgeContent={deliveries.filter(d => d.status === 'picked_up').length} color="info">Out for Delivery</Badge>} />
              <Tab label="Completed" />
              <Tab label="Cancelled" />
            </Tabs>
          </Paper>

          <Grid container spacing={3}>
            {getTabDeliveries().map((delivery) => (
              <Grid item xs={12} md={6} lg={4} key={delivery._id}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6">Order #{delivery._id.slice(-5).toUpperCase()}</Typography>
                      <Chip label={getStatusText(delivery.status)} color={getStatusColor(delivery.status)} size="small" />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {formatTime(delivery.createdAt)} ({calculateTimeAgo(delivery.createdAt)})
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2"><strong>From:</strong> {delivery.restaurant?.name}</Typography>
                    <Typography variant="body2"><strong>To:</strong> {delivery.customer?.name}</Typography>

                    {/* ACTION BUTTONS */}
                    {delivery.status === 'pending' && (
                      <Button
                        fullWidth
                        variant="contained"
                        color="warning"
                        startIcon={<BikeIcon />}
                        sx={{ mt: 2 }}
                        onClick={() => handleStatusUpdate(delivery._id, 'picked_up')}
                      >
                        Confirm Pickup
                      </Button>
                    )}

                    {delivery.status === 'picked_up' && (
                      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                        <Button
                          fullWidth
                          variant="outlined"
                          color="error"
                          startIcon={<CancelIcon />}
                          onClick={() => handleStatusUpdate(delivery._id, 'cancelled')}
                        >
                          Cancel
                        </Button>
                        <Button
                          fullWidth
                          variant="contained"
                          color="success"
                          startIcon={<DoneAllIcon />}
                          onClick={() => handleStatusUpdate(delivery._id, 'delivered')}
                        >
                          Delivered
                        </Button>
                      </Box>
                    )}
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
