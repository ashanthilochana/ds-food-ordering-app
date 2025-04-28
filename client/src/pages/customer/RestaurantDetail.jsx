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
  Alert,
  Paper
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  DeliveryDining as DeliveryIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as CartIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Schedule as ScheduleIcon,
  Restaurant as RestaurantIcon,
  Info as InfoIcon,
  AttachMoney as AttachMoneyIcon
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
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemCount, setItemCount] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [cartItems, setCartItems] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        setLoading(true);
        const resData = await restaurantService.getRestaurantById(id);
        const menuData = await restaurantService.getRestaurantMenuItems(id);
        setRestaurant(resData);
        setMenuItems(menuData);
        setError(null);
      } catch (err) {
        setError('Failed to fetch restaurant details. Please try again later.');
        console.error('Error fetching restaurant data:', err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchRestaurantData();
  }, [id]);
  
  useEffect(() => {
    // Load cart items from cookie when component mounts
    const savedCartItems = Cookies.get(CART_COOKIE_NAME);
    if (savedCartItems) {
      setCartItems(JSON.parse(savedCartItems));
    }
  }, []);

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
    if (!selectedItem) return;

    const newItem = {
      id: `${selectedItem._id}-${Date.now()}`,
      menuItemId: selectedItem._id,
      name: selectedItem.name,
      price: selectedItem.price,
      quantity: itemCount,
      options: selectedOptions,
      total: calculateItemTotal(),
      restaurantId: id,
      restaurantName: restaurant.name
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
    
    // Add option prices if any
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
    Cookies.set('restaurantId', id, {
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

  // Add this function to group menu items by category
  const getMenuItemsByCategory = () => {
    const categories = {};
    menuItems.forEach(item => {
      if (!categories[item.category]) {
        categories[item.category] = [];
      }
      categories[item.category].push(item);
    });
    return categories;
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
            <Button variant="contained" onClick={() => window.location.reload()} sx={{ mt: 2 }}>
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

  const menuCategories = getMenuItemsByCategory();

  return (
    <Layout cartItems={cartItems}>
      <Box>
        {/* Restaurant Header with Image */}
        <Box sx={{ position: 'relative', width: '100%', height: { xs: '200px', md: '400px' }, overflow: 'hidden' }}>
          <Box
            component="img"
            src={restaurant.image?.url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"}
            alt={restaurant.name}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'brightness(0.8)'
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
            {/* Menu Section */}
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="h4" gutterBottom sx={{ mt: 4 }}>
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
                  {Object.keys(menuCategories).map((category, index) => (
                    <Tab label={category} key={index} />
                  ))}
                </Tabs>

                {/* Menu Items */}
                <Box sx={{ mb: 4 }}>
                  {Object.entries(menuCategories).map(([category, items], index) => (
                    <Box
                      key={category}
                      role="tabpanel"
                      hidden={activeTab !== index}
                      id={`tabpanel-${index}`}
                    >
                      {activeTab === index && (
                        <List>
                          {items.map((item) => (
                            <React.Fragment key={item._id}>
                              <ListItem 
                                onClick={() => openItemDialog(item)}
                                sx={{ 
                                  cursor: 'pointer',
                                  '&:hover': {
                                    backgroundColor: 'action.hover'
                                  }
                                }}
                              >
                                <Box sx={{ display: 'flex', width: '100%', gap: 2 }}>
                                  {/* Item Image */}
                                  <Box sx={{ width: 100, height: 100, flexShrink: 0 }}>
                                    <CardMedia
                                      component="img"
                                      height="100"
                                      image={item.image?.url || 'https://source.unsplash.com/random/100x100/?food'}
                                      alt={item.name}
                                      sx={{ borderRadius: 1 }}
                                    />
                                  </Box>
                                  
                                  {/* Item Details */}
                                  <Box sx={{ flexGrow: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                      <Typography variant="h6" component="h3">
                                        {item.name}
                                        {item.isPopular && (
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
                                    {item.preparationTime && (
                                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                        <TimeIcon color="action" sx={{ fontSize: '1rem', mr: 0.5 }} />
                                        <Typography variant="body2" color="text.secondary">
                                          {item.preparationTime} mins
                                        </Typography>
                                      </Box>
                                    )}
                                    {item.isVegetarian && (
                                      <Chip 
                                        label="Vegetarian" 
                                        size="small" 
                                        color="success" 
                                        sx={{ mt: 1, mr: 1 }} 
                                      />
                                    )}
                                    {item.isVegan && (
                                      <Chip 
                                        label="Vegan" 
                                        size="small" 
                                        color="success" 
                                        sx={{ mt: 1 }} 
                                      />
                                    )}
                                  </Box>
                                </Box>
                              </ListItem>
                              <Divider />
                            </React.Fragment>
                          ))}
                        </List>
                      )}
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>

            {/* Details Section */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* About Card */}
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <RestaurantIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6">
                        About Us
                      </Typography>
                    </Box>
                    <Box sx={{ pl: 4 }}>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        {restaurant.description}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
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
                    </Box>
                  </CardContent>
                </Card>

                {/* Additional Info Card */}
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <InfoIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6">
                        Additional Information
                      </Typography>
                    </Box>
                    <Box sx={{ pl: 4 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Rating value={restaurant.rating} precision={0.5} size="small" readOnly />
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              {restaurant.rating} ({restaurant.totalReviews || 0} reviews)
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AttachMoneyIcon color="action" sx={{ mr: 1 }} />
                            <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                              {restaurant.priceRange}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  </CardContent>
                </Card>

                {/* Address Card */}
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LocationIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6">
                        Location
                      </Typography>
                    </Box>
                    <Box sx={{ pl: 4 }}>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        {restaurant.address.street}
                      </Typography>
                      <Typography variant="body1">
                        {restaurant.address.city}, {restaurant.address.state} {restaurant.address.zipCode}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>

                {/* Contact Card */}
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <PhoneIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6">
                        Contact
                      </Typography>
                    </Box>
                    <Box sx={{ pl: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PhoneIcon color="action" sx={{ mr: 1, fontSize: '1.2rem' }} />
                        <Typography variant="body1">
                          {restaurant.contactInfo.phone}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <EmailIcon color="action" sx={{ mr: 1, fontSize: '1.2rem' }} />
                        <Typography variant="body1">
                          {restaurant.contactInfo.email}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                {/* Hours Card */}
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <ScheduleIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6">
                        Opening Hours
                      </Typography>
                    </Box>
                    <Box sx={{ pl: 4 }}>
                      {Object.entries(restaurant.openingHours || {}).map(([day, time]) => (
                        <Box 
                          key={day} 
                          sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 1,
                            '&:last-child': { mb: 0 }
                          }}
                        >
                          <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                            {day}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TimeIcon color="action" sx={{ mr: 0.5, fontSize: '1.2rem' }} />
                            <Typography variant="body1">
                              {time.open} - {time.close}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          </Grid>
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
            View Cart • ${cartItems.reduce((total, item) => total + item.total, 0).toFixed(2)} • {cartItems.reduce((total, item) => total + item.quantity, 0)} items
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