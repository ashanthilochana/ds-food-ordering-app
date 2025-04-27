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
  Rating
} from '@mui/material';
import {
  Add as AddIcon,
  Restaurant as RestaurantIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';

// Mock data - replace with API calls
const mockRestaurants = [
    {
    id: 1,
    name: 'Pizza Palace',
    cuisine: 'Italian',
    address: '123 Main St',
    rating: 4.5,
    status: 'active'
    },
    {
    id: 2,
    name: 'Burger Hub',
    cuisine: 'American',
    address: '456 Oak Ave',
    rating: 4.2,
    status: 'active'
  }
];

const RestaurantDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setRestaurants(mockRestaurants);
      setLoading(false);
    }, 1000);
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
        <Grid container spacing={3}>
            {restaurants.map((restaurant) => (
              <Grid item xs={12} sm={6} md={4} key={restaurant.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: 6
                    }
                  }}
                  onClick={() => navigate(`/restaurant-dashboard/${restaurant.id}`)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <RestaurantIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6" component="div">
                        {restaurant.name}
                      </Typography>
                    </Box>
                    <Typography color="text.secondary" gutterBottom>
                      {restaurant.cuisine}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {restaurant.address}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Rating value={restaurant.rating} precision={0.5} size="small" readOnly />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        {restaurant.rating}
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