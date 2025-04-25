import React from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
  Chip,
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  RestaurantMenu as MenuIcon,
  History as HistoryIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';

const CustomerDashboard = () => {
  const navigate = useNavigate();

  // Mock recent orders - replace with API call
  const recentOrders = [
    {
      id: '12345',
      restaurant: 'Pizza Palace',
      items: ['2x Margherita Pizza', '1x Garlic Bread'],
      total: 42.98,
      status: 'delivered',
      date: '2024-02-20'
    },
    {
      id: '12346',
      restaurant: 'Burger Hub',
      items: ['1x Double Cheese Burger', '1x Fries'],
      total: 15.99,
      status: 'in_transit',
      date: '2024-02-19'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'success';
      case 'in_transit':
        return 'info';
      case 'preparing':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    return status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Welcome Message */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h4" gutterBottom>
                Welcome back!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                What would you like to eat today?
              </Typography>
            </Paper>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    variant="contained"
                    startIcon={<MenuIcon />}
                    fullWidth
                    sx={{ mb: 2 }}
                    onClick={() => navigate('/restaurants')}
                  >
                    Browse Restaurants
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="contained"
                    startIcon={<CartIcon />}
                    fullWidth
                    sx={{ mb: 2 }}
                    onClick={() => navigate('/cart')}
                  >
                    View Cart
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    startIcon={<HistoryIcon />}
                    fullWidth
                    onClick={() => navigate('/orders')}
                  >
                    Order History
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    startIcon={<LocationIcon />}
                    fullWidth
                    onClick={() => navigate('/addresses')}
                  >
                    Saved Addresses
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Recent Orders */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Recent Orders
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {recentOrders.map((order) => (
                  <Card key={order.id} variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1">
                          {order.restaurant}
                        </Typography>
                        <Chip
                          label={getStatusText(order.status)}
                          color={getStatusColor(order.status)}
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Order #{order.id} • {order.date}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {order.items.join(', ')}
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 1 }}>
                        Total: ${order.total.toFixed(2)}
                      </Typography>
                    </CardContent>
                    <Divider />
                    <CardActions>
                      <Button size="small" onClick={() => navigate(`/track-order/${order.id}`)}>
                        View Details
                      </Button>
                      <Button size="small" onClick={() => navigate(`/reorder/${order.id}`)}>
                        Reorder
                      </Button>
                    </CardActions>
                  </Card>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
};

export default CustomerDashboard;
