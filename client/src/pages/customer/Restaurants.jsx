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
  Restaurant as RestaurantIcon,
  ShoppingCart as CartIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import authService from '../../services/auth.service';

// Placeholder data - will be replaced with API call
const mockRestaurants = [
  {
    id: 1,
    name: 'Pizza Palace',
    image: 'https://source.unsplash.com/random/300x200/?pizza',
    cuisine: 'Italian',
    rating: 4.5,
    deliveryTime: '30-45 min',
    minOrder: '$10',
    tags: ['Pizza', 'Pasta', 'Italian']
  },
  {
    id: 2,
    name: 'Burger Hub',
    image: 'https://source.unsplash.com/random/300x200/?burger',
    cuisine: 'American',
    rating: 4.2,
    deliveryTime: '20-35 min',
    minOrder: '$12',
    tags: ['Burgers', 'Fast Food', 'American']
  },
  {
    id: 3,
    name: 'Sushi Express',
    image: 'https://source.unsplash.com/random/300x200/?sushi',
    cuisine: 'Japanese',
    rating: 4.7,
    deliveryTime: '40-55 min',
    minOrder: '$15',
    tags: ['Sushi', 'Japanese', 'Seafood']
  },
  {
    id: 4,
    name: 'Taco Town',
    image: 'https://source.unsplash.com/random/300x200/?taco',
    cuisine: 'Mexican',
    rating: 4.0,
    deliveryTime: '25-40 min',
    minOrder: '$8',
    tags: ['Tacos', 'Mexican', 'Burritos']
  },
  {
    id: 5,
    name: 'Curry House',
    image: 'https://source.unsplash.com/random/300x200/?curry',
    cuisine: 'Indian',
    rating: 4.6,
    deliveryTime: '35-50 min',
    minOrder: '$15',
    tags: ['Curry', 'Indian', 'Spicy']
  },
  {
    id: 6,
    name: 'Veggie Delight',
    image: 'https://source.unsplash.com/random/300x200/?vegetable',
    cuisine: 'Vegetarian',
    rating: 4.3,
    deliveryTime: '20-35 min',
    minOrder: '$10',
    tags: ['Vegetarian', 'Healthy', 'Salads']
  }
];

const Restaurants = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);
  const [recentOrders, setRecentOrders] = useState([
    {
      id: '12345',
      restaurant: 'Pizza Palace',
      items: ['2x Margherita Pizza', '1x Garlic Bread'],
      total: 42.98,
      status: 'delivered',
      date: '2024-02-20'
    }
  ]);
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Margherita Pizza',
      quantity: 2,
      price: 15.99
    }
  ]);

  useEffect(() => {
    // Check if user is logged in
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);

    // Load restaurants
    setTimeout(() => {
      setRestaurants(mockRestaurants);
      setLoading(false);
    }, 1000);

    // In production, you would fetch recent orders and cart items here
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
      restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <Layout>
      <Container>
        {user && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Recent Order Summary */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Recent Order
                  </Typography>
                  <Button
                    startIcon={<HistoryIcon />}
                    onClick={() => navigate('/dashboard')}
                  >
                    View All Orders
                  </Button>
                </Box>
                {recentOrders.length > 0 ? (
                  <Box>
                    <Typography variant="subtitle1">{recentOrders[0].restaurant}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {recentOrders[0].items.join(', ')}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Total: ${recentOrders[0].total.toFixed(2)}
                    </Typography>
                    <Button 
                      size="small" 
                      sx={{ mt: 1 }}
                      onClick={() => navigate(`/track-order/${recentOrders[0].id}`)}
                    >
                      Track Order
                    </Button>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No recent orders
                  </Typography>
                )}
              </Paper>
            </Grid>

            {/* Cart Summary */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Your Cart
                  </Typography>
                  <Button
                    startIcon={<CartIcon />}
                    onClick={() => navigate('/cart')}
                  >
                    View Cart
                  </Button>
                </Box>
                {cartItems.length > 0 ? (
                  <Box>
                    {cartItems.map((item) => (
                      <Box key={item.id} sx={{ mb: 1 }}>
                        <Typography variant="body2">
                          {item.quantity}x {item.name}
                        </Typography>
                      </Box>
                    ))}
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle1">
                      Total: ${getTotalCartAmount().toFixed(2)}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Your cart is empty
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        )}

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Restaurants
          </Typography>
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
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {['Italian', 'American', 'Japanese', 'Mexican', 'Indian', 'Vegetarian'].map((cuisine) => (
              <Chip
                key={cuisine}
                label={cuisine}
                onClick={() => setSearchTerm(cuisine)}
                clickable
                color={searchTerm === cuisine ? 'primary' : 'default'}
              />
            ))}
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredRestaurants.map((restaurant) => (
              <Grid item xs={12} sm={6} md={4} key={restaurant.id}>
                <Card 
                  component={Link} 
                  to={`/restaurant/${restaurant.id}`}
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
                    image={restaurant.image}
                    alt={restaurant.name}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="h2">
                      {restaurant.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating 
                        value={restaurant.rating} 
                        precision={0.5} 
                        size="small" 
                        readOnly 
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        {restaurant.rating}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {restaurant.cuisine} • {restaurant.deliveryTime} • Min {restaurant.minOrder}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                      {restaurant.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
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