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
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Restaurant as RestaurantIcon,
  ShoppingCart as CartIcon,
  History as HistoryIcon,
  FilterList as FilterIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  LocalShipping as ShippingIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import restaurantService from '../../services/restaurant.service';

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [currentOrders, setCurrentOrders] = useState([
    {
      id: 'ORD001',
      restaurant: 'Pizza Palace',
      items: ['2x Margherita Pizza', '1x Garlic Bread'],
      total: 42.98,
      status: 'preparing',
      time: '10 mins ago'
    },
    {
      id: 'ORD002',
      restaurant: 'Burger King',
      items: ['1x Whopper', '2x Fries'],
      total: 28.97,
      status: 'ready',
      time: '15 mins ago'
    }
  ]);

  const [pastOrders, setPastOrders] = useState([
    {
      id: 'ORD003',
      restaurant: 'Sushi Master',
      items: ['California Roll', 'Miso Soup'],
      total: 35.50,
      status: 'delivered',
      time: '2 hours ago'
    },
    {
      id: 'ORD004',
      restaurant: 'Taco Bell',
      items: ['Crunchwrap Supreme', 'Nachos'],
      total: 22.99,
      status: 'delivered',
      time: '1 day ago'
    }
  ]);
  const navigate = useNavigate();

  // Get unique cuisines from restaurants
  const cuisines = [...new Set(restaurants.flatMap(r => r.cuisine))];

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const data = await restaurantService.getRestaurants();
      setRestaurants(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch restaurants. Please try again later.');
      console.error('Error fetching restaurants:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleCuisineChange = (event) => {
    setSelectedCuisine(event.target.value);
  };

  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  const handleRatingChange = (event, newValue) => {
    setRatingFilter(newValue);
  };

  const clearFilters = () => {
    setSelectedCuisine('');
    setPriceRange([0, 100]);
    setRatingFilter(0);
    setSearchQuery('');
  };

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         restaurant.cuisine.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCuisine = !selectedCuisine || restaurant.cuisine.includes(selectedCuisine);
    const matchesRating = restaurant.rating >= ratingFilter;
    // Note: You might need to adjust this based on your actual price data structure
    const matchesPrice = true; // Add price filtering logic when available

    return matchesSearch && matchesCuisine && matchesRating && matchesPrice;
  });

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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'preparing':
        return <TimeIcon />;
      case 'ready':
        return <ShippingIcon />;
      case 'delivered':
        return <CheckCircleIcon />;
      case 'cancelled':
        return <CancelIcon />;
      default:
        return <TimeIcon />;
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

  if (error) {
    return (
      <Layout>
        <Container>
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography color="error">{error}</Typography>
            <Button variant="contained" onClick={fetchRestaurants} sx={{ mt: 2 }}>
              Retry
            </Button>
          </Paper>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container>
        <Box sx={{ my: 4 }}>
          {/* Banner Section */}
          <Box 
            sx={{ 
              position: 'relative',
              height: '300px',
              mb: 4,
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            <Box
              component="img"
              src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
              alt="Food Banner"
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.7))',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white',
                textAlign: 'center',
                p: 3
              }}
            >
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                Discover Amazing Restaurants
              </Typography>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Order from your favorite local restaurants
              </Typography>
              <Button 
                variant="contained" 
                size="large"
                startIcon={<SearchIcon />}
                onClick={() => document.getElementById('search-field').focus()}
                sx={{ 
                  backgroundColor: 'white',
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'grey.100'
                  }
                }}
              >
                Start Ordering
              </Button>
            </Box>
          </Box>

          {/* Orders Summary Section */}
          <Box sx={{ mb: 4 }}>
            <Grid container spacing={3}>
              {/* Current Orders */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Current Orders</Typography>
                    <Button 
                      variant="text" 
                      startIcon={<CartIcon />}
                      onClick={() => navigate('/orders')}
                    >
                      View All
                    </Button>
                  </Box>
                  <List>
                    {currentOrders.map((order, index) => (
                      <React.Fragment key={order.id}>
                        <ListItem
                          sx={{ px: 0, py: 2 }}
                          secondaryAction={
                            <Chip 
                              label={order.status}
                              color={getStatusColor(order.status)}
                              size="small"
                              icon={getStatusIcon(order.status)}
                            />
                          }
                        >
                          <ListItemText
                            primary={
                              <Typography variant="subtitle2">
                                {order.restaurant}
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
                        {index < currentOrders.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </Paper>
              </Grid>

              {/* Past Orders */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Past Orders</Typography>
                    <Button 
                      variant="text" 
                      startIcon={<HistoryIcon />}
                      onClick={() => navigate('/orders/history')}
                    >
                      View All
                    </Button>
                  </Box>
                  <List>
                    {pastOrders.map((order, index) => (
                      <React.Fragment key={order.id}>
                        <ListItem
                          sx={{ px: 0, py: 2 }}
                          secondaryAction={
                            <Chip 
                              label={order.status}
                              color={getStatusColor(order.status)}
                              size="small"
                              icon={getStatusIcon(order.status)}
                            />
                          }
                        >
                          <ListItemText
                            primary={
                              <Typography variant="subtitle2">
                                {order.restaurant}
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
                        {index < pastOrders.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </Paper>
              </Grid>
            </Grid>
          </Box>

          {/* Restaurant Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              Restaurants
            </Typography>
            
            <Box sx={{ mb: 4 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={10}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search restaurants by name or cuisine..."
                    value={searchQuery}
                    onChange={handleSearch}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button
                    variant="outlined"
                    startIcon={<FilterIcon />}
                    onClick={() => setShowFilters(!showFilters)}
                    fullWidth
                    sx={{ 
                      height: '56px', // Match Material-UI TextField default height
                      minHeight: '56px'
                    }}
                  >
                    {showFilters ? 'Hide' : 'Filters'}
                  </Button>
                </Grid>
              </Grid>

              {showFilters && (
                <Paper sx={{ p: 2, mt: 2 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Cuisine</InputLabel>
                        <Select
                          value={selectedCuisine}
                          label="Cuisine"
                          onChange={handleCuisineChange}
                        >
                          <MenuItem value="">All Cuisines</MenuItem>
                          {cuisines.map((cuisine) => (
                            <MenuItem key={cuisine} value={cuisine}>
                              {cuisine}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography gutterBottom>Price Range</Typography>
                      <Slider
                        value={priceRange}
                        onChange={handlePriceChange}
                        valueLabelDisplay="auto"
                        min={0}
                        max={100}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography gutterBottom>Minimum Rating</Typography>
                      <Slider
                        value={ratingFilter}
                        onChange={handleRatingChange}
                        valueLabelDisplay="auto"
                        min={0}
                        max={5}
                        step={0.5}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button variant="outlined" onClick={clearFilters}>
                        Clear Filters
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              )}
            </Box>

            <Box sx={{ mb: 3 }}>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {cuisines.map((cuisine) => (
                  <Chip
                    key={cuisine}
                    label={cuisine}
                    onClick={() => setSelectedCuisine(cuisine)}
                    color={selectedCuisine === cuisine ? 'primary' : 'default'}
                    clickable
                  />
                ))}
              </Stack>
            </Box>

            <Grid container spacing={3}>
              {filteredRestaurants.map((restaurant) => (
                <Grid item xs={12} sm={6} md={4} key={restaurant._id}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: 6
                      }
                    }}
                    onClick={() => navigate(`/restaurant/${restaurant._id}`)}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={restaurant.images?.[0]?.url || 'https://source.unsplash.com/random/300x200/?restaurant'}
                      alt={restaurant.name}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h6" component="div">
                        {restaurant.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Rating value={restaurant.rating} precision={0.5} readOnly size="small" />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          ({restaurant.rating})
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {restaurant.cuisine.join(', ')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {restaurant.address.city}, {restaurant.address.state}
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        {restaurant.cuisine.map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      </Container>
    </Layout>
  );
};

export default Restaurants; 