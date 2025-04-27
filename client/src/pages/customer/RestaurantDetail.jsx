import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Divider,
  Chip,
  Button,
  Rating,
  Tabs,
  Tab,
  CircularProgress,
  List,
  ListItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  Snackbar,
  Alert
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  DeliveryDining as DeliveryIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as CartIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Cookies from 'js-cookie';
import restaurantService from '../../services/restaurant.service';

const CART_COOKIE_NAME = 'cartItems';
const CART_EXPIRY_DAYS = 7;

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemCount, setItemCount] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [cartItems, setCartItems] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    fetchRestaurant();
  }, [id]);

  const fetchRestaurant = async () => {
    try {
      setLoading(true);
      const data = await restaurantService.getRestaurantById(id);
      setRestaurant(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch restaurant details. Please try again later.');
      console.error('Error fetching restaurant:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const openItemDialog = (item) => {
    setSelectedItem(item);
    const initialOptions = {};
    if (item.options) {
      item.options.forEach(option => {
        initialOptions[option.name] = option.choices[0];
      });
    }
    setSelectedOptions(initialOptions);
    setItemCount(1);
  };

  const closeItemDialog = () => {
    setSelectedItem(null);
  };

  const handleOptionChange = (optionName, value) => {
    setSelectedOptions({
      ...selectedOptions,
      [optionName]: value
    });
  };

  const increaseItemCount = () => {
    setItemCount(itemCount + 1);
  };

  const decreaseItemCount = () => {
    if (itemCount > 1) {
      setItemCount(itemCount - 1);
    }
  };

  const addToCart = () => {
    const newItem = {
      id: `${selectedItem.id}-${Date.now()}`,
      menuItemId: selectedItem.id,
      name: selectedItem.name,
      price: selectedItem.price,
      quantity: itemCount,
      options: selectedOptions,
      total: calculateItemTotal()
    };
    
    const updatedCartItems = [...cartItems, newItem];
    setCartItems(updatedCartItems);
    
    // Save to cookie
    Cookies.set(CART_COOKIE_NAME, JSON.stringify(updatedCartItems), {
      expires: CART_EXPIRY_DAYS,
      path: '/'
    });
    
    setSnackbarOpen(true);
    closeItemDialog();
  };

  const calculateItemTotal = () => {
    if (!selectedItem) return 0;
    
    let total = selectedItem.price * itemCount;
    
    // Add option prices (simplistic implementation)
    Object.values(selectedOptions).forEach(option => {
      const priceMatch = option.match(/\+\$(\d+(\.\d+)?)\)/);
      if (priceMatch) {
        total += parseFloat(priceMatch[1]) * itemCount;
      }
    });
    
    return total;
  };

  const goToCart = () => {
    // Save the cart to cookie
    Cookies.set(CART_COOKIE_NAME, JSON.stringify(cartItems), {
      expires: CART_EXPIRY_DAYS,
      path: '/'
    });
    
    // Save restaurant ID to cookie
    Cookies.set('restaurantId', restaurant._id, {
      expires: CART_EXPIRY_DAYS,
      path: '/'
    });
    
    navigate('/cart');
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const calculateCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.total, 0).toFixed(2);
  };

  const formatOpeningHours = (hours) => {
    if (!hours) return 'Hours not available';
    
    const days = Object.entries(hours).map(([day, time]) => {
      const formattedDay = day.charAt(0).toUpperCase() + day.slice(1);
      return `${formattedDay}: ${time.open} - ${time.close}`;
    });
    
    return days.join('\n');
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
            <Button variant="contained" onClick={fetchRestaurant} sx={{ mt: 2 }}>
              Retry
            </Button>
          </Paper>
        </Container>
      </Layout>
    );
  }

  if (!restaurant) {
    return (
      <Layout>
        <Container>
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography>Restaurant not found</Typography>
            <Button variant="contained" onClick={() => navigate('/restaurants')} sx={{ mt: 2 }}>
              Back to Restaurants
            </Button>
          </Paper>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout cartItems={cartItems}>
      <Box>
        {/* Restaurant Header with Image */}
        <Box sx={{ position: 'relative', width: '100%', height: { xs: '200px', md: '400px' }, overflow: 'hidden' }}>
          <Box
            component="img"
            src={restaurant.images?.[0]?.url || 'https://source.unsplash.com/random/1200x400/?restaurant'}
            alt={restaurant.images?.[0]?.alt || restaurant.name}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0.7))',
              p: 3,
              color: 'white'
            }}
          >
            <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
              {restaurant.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Rating value={restaurant.rating} precision={0.5} readOnly size="small" sx={{ color: 'white' }} />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  {restaurant.rating} ({restaurant.totalReviews || 0} reviews)
                </Typography>
              </Box>
              <Typography variant="body2">•</Typography>
              <Typography variant="body2">{restaurant.cuisine.join(', ')}</Typography>
              <Typography variant="body2">•</Typography>
              <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                {restaurant.priceRange}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Container>
          {/* Restaurant Info Cards */}
          <Grid container spacing={3} sx={{ mt: -4, position: 'relative', zIndex: 1 }}>
            {/* Main Info Card */}
            <Grid item xs={12} md={8}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    About
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    {restaurant.description}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {restaurant.cuisine.map((tag) => (
                      <Chip 
                        key={tag} 
                        label={tag} 
                        size="small"
                        sx={{ 
                          backgroundColor: 'primary.light',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: 'primary.main'
                          }
                        }}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Contact Info Card */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Contact & Hours
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Address
                      </Typography>
                      <Typography variant="body2">
                        {restaurant.address.street}
                      </Typography>
                      <Typography variant="body2">
                        {restaurant.address.city}, {restaurant.address.state} {restaurant.address.zipCode}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Contact
                      </Typography>
                      <Typography variant="body2">
                        {restaurant.contactInfo.phone}
                      </Typography>
                      <Typography variant="body2">
                        {restaurant.contactInfo.email}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Opening Hours
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                        {formatOpeningHours(restaurant.openingHours)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Menu Section */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
              Menu
            </Typography>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ 
                mb: 3,
                '& .MuiTab-root': {
                  fontSize: '1.1rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  minWidth: 120
                }
              }}
            >
              {restaurant.menuCategories?.map((category, index) => (
                <Tab label={category.name} key={index} />
              ))}
            </Tabs>

            {/* Menu Items */}
            <Box sx={{ mb: 4 }}>
              {restaurant.menuCategories?.map((category, index) => (
                <Box
                  key={category.id}
                  role="tabpanel"
                  hidden={activeTab !== index}
                  id={`tabpanel-${index}`}
                >
                  {activeTab === index && (
                    <Grid container spacing={3}>
                      {category.items.map((item) => (
                        <Grid item xs={12} sm={6} md={4} key={item.id}>
                          <Card 
                            onClick={() => openItemDialog(item)}
                            sx={{ 
                              cursor: 'pointer',
                              height: '100%',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-8px)',
                                boxShadow: 6
                              }
                            }}
                          >
                            <CardMedia
                              component="img"
                              height="200"
                              image={item.image || 'https://source.unsplash.com/random/300x200/?food'}
                              alt={item.name}
                            />
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Typography variant="h6" component="h3">
                                  {item.name}
                                  {item.popular && (
                                    <Chip 
                                      label="Popular" 
                                      size="small" 
                                      color="primary" 
                                      sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} 
                                    />
                                  )}
                                </Typography>
                                <Typography variant="h6" color="primary" fontWeight="bold">
                                  ${item.price.toFixed(2)}
                                </Typography>
                              </Box>
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                {item.description}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Floating cart button */}
      {cartItems.length > 0 && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000
          }}
        >
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<CartIcon />}
            onClick={goToCart}
            sx={{ 
              px: 4, 
              py: 1.5, 
              borderRadius: 50,
              boxShadow: 4,
              '&:hover': {
                boxShadow: 6
              }
            }}
          >
            View Cart • ${calculateCartTotal()} • {cartItems.reduce((total, item) => total + item.quantity, 0)} items
          </Button>
        </Box>
      )}

      {/* Item Detail Dialog */}
      <Dialog 
        open={Boolean(selectedItem)} 
        onClose={closeItemDialog}
        maxWidth="sm"
        fullWidth
      >
        {selectedItem && (
          <>
            <Box sx={{ position: 'relative' }}>
              <CardMedia
                component="img"
                height="200"
                image={selectedItem.image || 'https://source.unsplash.com/random/300x200/?food'}
                alt={selectedItem.name}
              />
              <IconButton
                sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.3)' }}
                onClick={closeItemDialog}
              >
                <CloseIcon sx={{ color: 'white' }} />
              </IconButton>
            </Box>
            <DialogTitle>
              {selectedItem.name}
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" gutterBottom>
                {selectedItem.description}
              </Typography>
              <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                ${selectedItem.price.toFixed(2)}
              </Typography>

              {selectedItem.options && selectedItem.options.map((option, index) => (
                <Box key={index} sx={{ my: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {option.name}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {option.choices.map((choice, i) => (
                      <Chip
                        key={i}
                        label={choice}
                        onClick={() => handleOptionChange(option.name, choice)}
                        clickable
                        color={selectedOptions[option.name] === choice ? 'primary' : 'default'}
                        variant={selectedOptions[option.name] === choice ? 'filled' : 'outlined'}
                      />
                    ))}
                  </Box>
                </Box>
              ))}

              <Box sx={{ display: 'flex', alignItems: 'center', my: 3 }}>
                <Typography variant="subtitle1" sx={{ mr: 2 }}>
                  Quantity:
                </Typography>
                <IconButton onClick={decreaseItemCount} disabled={itemCount <= 1} size="small">
                  <RemoveIcon />
                </IconButton>
                <TextField
                  value={itemCount}
                  inputProps={{ min: 1, style: { textAlign: 'center' } }}
                  variant="outlined"
                  size="small"
                  sx={{ width: 60, mx: 1 }}
                  disabled
                />
                <IconButton onClick={increaseItemCount} size="small">
                  <AddIcon />
                </IconButton>
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button 
                variant="contained" 
                onClick={addToCart} 
                fullWidth
                size="large"
              >
                Add to Cart - ${calculateItemTotal().toFixed(2)}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Snackbar for cart confirmation */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Item added to cart!
        </Alert>
      </Snackbar>
    </Layout>
  );
};

export default RestaurantDetail; 