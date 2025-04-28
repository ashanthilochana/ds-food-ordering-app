import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Box, 
  Rating, 
  Chip, 
  TextField, 
  InputAdornment, 
  CircularProgress,
  Container,
  Paper,
  Button,
  Divider
} from '@mui/material';
import { 
  Search as SearchIcon, 
  History as HistoryIcon,
  ShoppingCart as CartIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import authService from '../../services/auth.service';
import restaurantService from '../../services/restaurant.service';  // ✅ Add restaurant service import

const Restaurants = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);

        const restaurantData = await restaurantService.getRestaurants();
        setRestaurants(restaurantData);

        // Optional: You can load real recent orders and cart items here if needed.
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getTotalCartAmount = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredRestaurants = restaurants.filter((restaurant) => {
    return (
      restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (restaurant.cuisine && restaurant.cuisine.join(',').toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <Layout>
      <Container>
        {user && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Recent Order</Typography>
                  <Button startIcon={<HistoryIcon />} onClick={() => navigate('/dashboard')}>View All Orders</Button>
                </Box>
                {recentOrders.length > 0 ? (
                  <Box>
                    <Typography variant="subtitle1">{recentOrders[0].restaurant}</Typography>
                    <Typography variant="body2" color="text.secondary">{recentOrders[0].items.join(', ')}</Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>Total: ${recentOrders[0].total.toFixed(2)}</Typography>
                    <Button size="small" sx={{ mt: 1 }} onClick={() => navigate(`/track-order/${recentOrders[0].id}`)}>Track Order</Button>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">No recent orders</Typography>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Your Cart</Typography>
                  <Button startIcon={<CartIcon />} onClick={() => navigate('/cart')}>View Cart</Button>
                </Box>
                {cartItems.length > 0 ? (
                  <Box>
                    {cartItems.map((item) => (
                      <Typography key={item.id} variant="body2">{item.quantity}x {item.name}</Typography>
                    ))}
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle1">Total: ${getTotalCartAmount().toFixed(2)}</Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">Your cart is empty</Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        )}

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>Restaurants</Typography>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search for restaurants, cuisines, or food..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredRestaurants.map((restaurant) => (
              <Grid item xs={12} sm={6} md={4} key={restaurant._id}>
                <Card
                  component={Link}
                  to={`/restaurant/${restaurant._id}`}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    textDecoration: 'none',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 6,
                    }
                  }}
                >
                  <CardMedia
                    component="img"
                    height="160"
                    image={restaurant.images && restaurant.images.length > 0 ? restaurant.images[0].url : 'https://source.unsplash.com/random/300x200/?restaurant'}
                    alt={restaurant.name}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="h2">{restaurant.name}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating value={restaurant.rating || 0} precision={0.5} size="small" readOnly />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        {restaurant.rating || 'No rating'}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {restaurant.cuisine?.join(', ')}
                    </Typography>
                    {restaurant.priceRange && (
                      <Chip label={restaurant.priceRange} size="small" sx={{ mt: 1 }} />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Layout>
  );
};

export default Restaurants;
