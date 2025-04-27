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
  CircularProgress,
  Rating,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Restaurant as RestaurantIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { restaurantService } from '../../services/restaurantService';

const RestaurantDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await restaurantService.getMyRestaurants();
        setRestaurants(data);
      } catch (err) {
        setError('Failed to load restaurants.');
        setRestaurants([]);
      }
      setLoading(false);
    };
    fetchRestaurants();
  }, []);

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
        {/* Restaurant Management Section */}
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">
              My Restaurants
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/add-restaurant')}
            >
              Add New Restaurant
            </Button>
          </Box>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={3}>
            {restaurants.length === 0 && !error && (
              <Grid item xs={12}>
                <Typography variant="body1" color="text.secondary">
                  No restaurants found.
                </Typography>
              </Grid>
            )}
            {restaurants.map((restaurant) => (
              <Grid item xs={12} sm={6} md={4} key={restaurant._id || restaurant.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: 6
                    }
                  }}
                  onClick={() => navigate(`/restaurant-dashboard/${restaurant._id || restaurant.id}`)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <RestaurantIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6" component="div">
                        {restaurant.name}
                      </Typography>
                    </Box>
                    <Typography color="text.secondary" gutterBottom>
                      {Array.isArray(restaurant.cuisine) ? restaurant.cuisine.join(', ') : restaurant.cuisine}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {restaurant.address && typeof restaurant.address === 'object'
                        ? [restaurant.address.street, restaurant.address.city, restaurant.address.zip].filter(Boolean).join(', ')
                        : restaurant.address}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Rating value={restaurant.rating || 0} precision={0.5} size="small" readOnly />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        {restaurant.rating || 'N/A'}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>
    </Layout>
  );
};

export default RestaurantDashboard; 