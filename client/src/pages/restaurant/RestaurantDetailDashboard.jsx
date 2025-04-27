import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  CircularProgress,
  Rating,
  LinearProgress
} from '@mui/material';
import {
  RestaurantMenu as MenuIcon,
  ShoppingCart as OrderIcon,
  TrendingUp as TrendingIcon,
  AttachMoney as RevenueIcon,
  Star as StarIcon,
  Schedule as TimeIcon,
  Refresh as RefreshIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';

// Mock data - replace with API calls
const getMockRestaurantData = (restaurantId) => ({
  restaurant: {
    id: restaurantId,
    name: 'Pizza Palace',
    cuisine: 'Italian',
    address: '123 Main St',
    rating: 4.5,
    status: 'active'
  },
  todayStats: {
    orders: 24,
    revenue: 856.50,
    avgOrderValue: 35.69,
    avgPrepTime: 22
  },
  recentOrders: [
    {
      id: '12345',
      customerName: 'John Doe',
      items: ['2x Margherita Pizza', '1x Garlic Bread'],
      total: 42.98,
      status: 'preparing',
      time: '10 mins ago'
    },
    {
      id: '12344',
      customerName: 'Jane Smith',
      items: ['1x Pepperoni Pizza', '2x Coke'],
      total: 28.97,
      status: 'ready',
      time: '15 mins ago'
    }
  ],
  popularItems: [
    { name: 'Margherita Pizza', orders: 158, rating: 4.8 },
    { name: 'Pepperoni Pizza', orders: 142, rating: 4.7 },
    { name: 'Garlic Bread', orders: 97, rating: 4.5 }
  ],
  ratings: {
    average: 4.6,
    total: 253,
    distribution: [
      { stars: 5, count: 150 },
      { stars: 4, count: 80 },
      { stars: 3, count: 15 },
      { stars: 2, count: 5 },
      { stars: 1, count: 3 }
    ]
  }
});

const RestaurantDetailDashboard = () => {
  const { restaurantId } = useParams();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setDashboardData(getMockRestaurantData(restaurantId));
      setLoading(false);
    }, 1000);
  }, [restaurantId]);

  const handleRefresh = () => {
    setLoading(true);
    // Simulate API refresh
    setTimeout(() => {
      setDashboardData(getMockRestaurantData(restaurantId));
      setLoading(false);
    }, 1000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'preparing':
        return 'warning';
      case 'ready':
        return 'info';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
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
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              startIcon={<BackIcon />}
              onClick={() => navigate('/dashboard')}
            >
              Back to Restaurants
            </Button>
            <Typography variant="h4" component="h1">
              {dashboardData.restaurant.name} Dashboard
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<OrderIcon />}
              onClick={() => navigate(`/restaurant-orders?restaurantId=${restaurantId}`)}
            >
              Manage Orders
            </Button>
            <Button
              variant="contained"
              startIcon={<MenuIcon />}
              onClick={() => navigate(`/menu-management?restaurantId=${restaurantId}`)}
            >
              Manage Menu
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
            >
              Refresh
            </Button>
          </Box>
        </Box>

        {/* Quick Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Today's Orders
                </Typography>
                <Typography variant="h4" component="div">
                  {dashboardData.todayStats.orders}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <OrderIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Active orders
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Today's Revenue
                </Typography>
                <Typography variant="h4" component="div">
                  ${dashboardData.todayStats.revenue.toFixed(2)}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <RevenueIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    ${dashboardData.todayStats.avgOrderValue.toFixed(2)} avg. order
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Avg. Prep Time
                </Typography>
                <Typography variant="h4" component="div">
                  {dashboardData.todayStats.avgPrepTime}m
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <TimeIcon color="warning" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Minutes per order
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Rating
                </Typography>
                <Typography variant="h4" component="div">
                  {dashboardData.ratings.average}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <StarIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {dashboardData.ratings.total} reviews
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Recent Orders */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Recent Orders</Typography>
                <Button 
                  variant="text" 
                  onClick={() => navigate(`/restaurant-orders?restaurantId=${restaurantId}`)}
                >
                  View All
                </Button>
              </Box>
              <List>
                {dashboardData.recentOrders.map((order, index) => (
                  <React.Fragment key={order.id}>
                    <ListItem
                      sx={{ px: 0, py: 2 }}
                      secondaryAction={
                        <Chip 
                          label={order.status}
                          color={getStatusColor(order.status)}
                          size="small"
                        />
                      }
                    >
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2">
                            Order #{order.id} - {order.customerName}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" color="text.secondary">
                              {order.items.join(', ')}
                            </Typography>
                            <Typography variant="body2">
                              ${order.total.toFixed(2)} • {order.time}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    {index < dashboardData.recentOrders.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Popular Items */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Popular Items</Typography>
                <Button 
                  variant="text" 
                  onClick={() => navigate(`/menu-management?restaurantId=${restaurantId}`)}
                >
                  Manage Menu
                </Button>
              </Box>
              <List>
                {dashboardData.popularItems.map((item, index) => (
                  <React.Fragment key={item.name}>
                    <ListItem sx={{ px: 0, py: 2 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle2">{item.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {item.orders} orders
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <Rating value={item.rating} precision={0.1} size="small" readOnly />
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                              {item.rating}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < dashboardData.popularItems.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Ratings Distribution */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Ratings Distribution
              </Typography>
              <Box sx={{ mt: 2 }}>
                {dashboardData.ratings.distribution.map((rating) => (
                  <Box key={rating.stars} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ minWidth: 45 }}>
                      <Typography variant="body2">
                        {rating.stars} stars
                      </Typography>
                    </Box>
                    <Box sx={{ width: '100%', mx: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={(rating.count / dashboardData.ratings.total) * 100}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                    <Box sx={{ minWidth: 35 }}>
                      <Typography variant="body2" color="text.secondary">
                        {rating.count}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
};

export default RestaurantDetailDashboard; 