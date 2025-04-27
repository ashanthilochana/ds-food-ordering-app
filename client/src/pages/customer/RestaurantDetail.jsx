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

const CART_COOKIE_NAME = 'cartItems';
const CART_EXPIRY_DAYS = 7;

// Mock data - replace with API call
const mockRestaurant = {
  id: 1,
  name: 'Pizza Palace',
  image: 'https://source.unsplash.com/random/1200x400/?pizza-restaurant',
  cuisine: 'Italian',
  rating: 4.5,
  totalReviews: 248,
  deliveryTime: '30-45 min',
  deliveryFee: '$2.99',
  minOrder: '$10',
  address: '123 Main Street, Cityville',
  description: 'Authentic Italian pizza made with fresh ingredients and traditional recipes.',
  tags: ['Pizza', 'Pasta', 'Italian'],
  openingHours: '10:00 AM - 10:00 PM',
  menuCategories: [
    {
      id: 1,
      name: 'Pizza',
      items: [
        {
          id: 101,
          name: 'Margherita Pizza',
          description: 'Classic pizza with tomato sauce, mozzarella, and basil',
          price: 12.99,
          image: 'https://source.unsplash.com/random/300x200/?margherita-pizza',
          popular: true,
          options: [
            { name: 'Size', choices: ['Small (+$0)', 'Medium (+$2)', 'Large (+$4)'] },
            { name: 'Crust', choices: ['Thin', 'Thick', 'Stuffed (+$3)'] }
          ]
        },
        {
          id: 102,
          name: 'Pepperoni Pizza',
          description: 'Pizza with tomato sauce, mozzarella and pepperoni',
          price: 14.99,
          image: 'https://source.unsplash.com/random/300x200/?pepperoni-pizza',
          popular: true,
          options: [
            { name: 'Size', choices: ['Small (+$0)', 'Medium (+$2)', 'Large (+$4)'] },
            { name: 'Crust', choices: ['Thin', 'Thick', 'Stuffed (+$3)'] }
          ]
        },
        {
          id: 103,
          name: 'Vegetarian Pizza',
          description: 'Fresh vegetables, tomato sauce, and mozzarella',
          price: 13.99,
          image: 'https://source.unsplash.com/random/300x200/?vegetarian-pizza',
          options: [
            { name: 'Size', choices: ['Small (+$0)', 'Medium (+$2)', 'Large (+$4)'] },
            { name: 'Crust', choices: ['Thin', 'Thick', 'Stuffed (+$3)'] }
          ]
        }
      ]
    },
    {
      id: 2,
      name: 'Pasta',
      items: [
        {
          id: 201,
          name: 'Spaghetti Bolognese',
          description: 'Spaghetti with rich meat sauce and parmesan',
          price: 10.99,
          image: 'https://source.unsplash.com/random/300x200/?spaghetti',
          popular: true,
          options: [
            { name: 'Size', choices: ['Regular', 'Large (+$3)'] },
            { name: 'Add-ons', choices: ['Extra Cheese (+$1)', 'Extra Sauce (+$0.5)'] }
          ]
        },
        {
          id: 202,
          name: 'Fettuccine Alfredo',
          description: 'Fettuccine pasta with creamy Alfredo sauce',
          price: 11.99,
          image: 'https://source.unsplash.com/random/300x200/?fettuccine-alfredo',
          options: [
            { name: 'Size', choices: ['Regular', 'Large (+$3)'] },
            { name: 'Add-ons', choices: ['Chicken (+$2.5)', 'Broccoli (+$1)', 'Extra Cheese (+$1)'] }
          ]
        }
      ]
    },
    {
      id: 3,
      name: 'Sides',
      items: [
        {
          id: 301,
          name: 'Garlic Bread',
          description: 'Toasted bread with garlic butter and herbs',
          price: 4.99,
          image: 'https://source.unsplash.com/random/300x200/?garlic-bread',
          options: [
            { name: 'Add-ons', choices: ['Cheese (+$1)'] }
          ]
        },
        {
          id: 302,
          name: 'Caesar Salad',
          description: 'Fresh romaine lettuce, croutons, parmesan and Caesar dressing',
          price: 6.99,
          image: 'https://source.unsplash.com/random/300x200/?caesar-salad',
          options: [
            { name: 'Size', choices: ['Small', 'Regular (+$2)'] },
            { name: 'Add-ons', choices: ['Chicken (+$2.5)', 'Extra Dressing (+$0.5)'] }
          ]
        }
      ]
    },
    {
      id: 4,
      name: 'Drinks',
      items: [
        {
          id: 401,
          name: 'Soda',
          description: 'Cola, Sprite, or Fanta',
          price: 1.99,
          image: 'https://source.unsplash.com/random/300x200/?soda',
          options: [
            { name: 'Size', choices: ['Small', 'Medium (+$0.5)', 'Large (+$1)'] },
            { name: 'Type', choices: ['Cola', 'Sprite', 'Fanta'] }
          ]
        },
        {
          id: 402,
          name: 'Bottled Water',
          description: 'Still or sparkling water',
          price: 1.49,
          image: 'https://source.unsplash.com/random/300x200/?water-bottle',
          options: [
            { name: 'Type', choices: ['Still', 'Sparkling (+$0.5)'] }
          ]
        }
      ]
    }
  ]
};

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemCount, setItemCount] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [cartItems, setCartItems] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setRestaurant(mockRestaurant);
      setLoading(false);
    }, 1000);
    
    // Actual API call would be:
    // const fetchRestaurant = async () => {
    //   try {
    //     const response = await axios.get(`/api/restaurants/${id}`);
    //     setRestaurant(response.data);
    //     setLoading(false);
    //   } catch (error) {
    //     console.error('Error fetching restaurant:', error);
    //     setLoading(false);
    //   }
    // };
    // fetchRestaurant();
  }, [id]);

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
    Cookies.set('restaurantId', restaurant.id, {
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
    <Layout cartItems={cartItems}>
      <Box>
        {/* Restaurant Header with Image */}
        <Box sx={{ position: 'relative', width: '100%', height: { xs: '150px', md: '250px' }, overflow: 'hidden' }}>
          <Box
            component="img"
            src={restaurant.image}
            alt={restaurant.name}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </Box>

        <Container>
          {/* Restaurant Info */}
          <Card sx={{ mt: -4, position: 'relative', zIndex: 1, mb: 3 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <Typography variant="h4" component="h1" gutterBottom>
                    {restaurant.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flexWrap: 'wrap' }}>
                    <Rating value={restaurant.rating} precision={0.5} readOnly size="small" />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {restaurant.rating} ({restaurant.totalReviews} reviews)
                    </Typography>
                    <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                    <Typography variant="body2">{restaurant.cuisine}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {restaurant.description}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {restaurant.tags.map((tag, index) => (
                      <Chip key={index} label={tag} size="small" />
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TimeIcon fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {restaurant.deliveryTime} delivery time
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <DeliveryIcon fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {restaurant.deliveryFee} delivery fee
                      </Typography>
                    </Box>
                    <Typography variant="body2">
                      Min. order: {restaurant.minOrder}
                    </Typography>
                    <Typography variant="body2">
                      Hours: {restaurant.openingHours}
                    </Typography>
                    <Typography variant="body2">
                      {restaurant.address}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Menu Tabs */}
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 2 }}
          >
            {restaurant.menuCategories.map((category, index) => (
              <Tab label={category.name} key={index} />
            ))}
          </Tabs>

          {/* Menu Items */}
          <Box sx={{ mb: 4 }}>
            {restaurant.menuCategories.map((category, index) => (
              <Box
                key={category.id}
                role="tabpanel"
                hidden={activeTab !== index}
                id={`tabpanel-${index}`}
              >
                {activeTab === index && (
                  <Grid container spacing={2}>
                    {category.items.map((item) => (
                      <Grid item xs={12} sm={6} md={4} key={item.id}>
                        <Card 
                          onClick={() => openItemDialog(item)}
                          sx={{ 
                            cursor: 'pointer',
                            height: '100%',
                            transition: 'transform 0.2s',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: 3
                            }
                          }}
                        >
                          <CardMedia
                            component="img"
                            height="140"
                            image={item.image}
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
                              <Typography variant="subtitle1" fontWeight="bold">
                                ${item.price.toFixed(2)}
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
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
            sx={{ px: 4, py: 1.5, borderRadius: 50 }}
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
                image={selectedItem.image}
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