import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Box, Typography, Card, CardMedia, CardContent,
  Divider, Chip, Button, Rating, Tabs, Tab, CircularProgress, Dialog,
  DialogTitle, DialogContent, DialogActions, IconButton, TextField, Snackbar, Alert
} from '@mui/material';
import {
  AccessTime as TimeIcon, DeliveryDining as DeliveryIcon,
  Close as CloseIcon, Add as AddIcon, Remove as RemoveIcon,
  ShoppingCart as CartIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';

const mockRestaurant = { /* your mock data here */ };

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemCount, setItemCount] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setRestaurant(mockRestaurant);
      setLoading(false);
    }, 1000);
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
    setSelectedOptions({ ...selectedOptions, [optionName]: value });
  };

  const increaseItemCount = () => {
    setItemCount(itemCount + 1);
  };

  const decreaseItemCount = () => {
    if (itemCount > 1) {
      setItemCount(itemCount - 1);
    }
  };

  const calculateItemTotal = () => {
    if (!selectedItem) return 0;
    let total = selectedItem.price * itemCount;
    Object.values(selectedOptions).forEach(option => {
      const priceMatch = option.match(/\+\$(\d+(\.\d+)?)/);
      if (priceMatch) {
        total += parseFloat(priceMatch[1]) * itemCount;
      }
    });
    return total;
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

    const existingCart = JSON.parse(localStorage.getItem('cartItems')) || [];
    const updatedCart = [...existingCart, newItem];
    localStorage.setItem('cartItems', JSON.stringify(updatedCart));
    localStorage.setItem('restaurantId', restaurant.id);

    setSnackbarOpen(true);
    closeItemDialog();
  };

  const goToCart = () => {
    navigate('/cart');
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
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
      <Box>
        {/* Header Image */}
        <Box sx={{ position: 'relative', width: '100%', height: { xs: '150px', md: '250px' }, overflow: 'hidden' }}>
          <Box component="img" src={restaurant.image} alt={restaurant.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </Box>

        <Container>
          {/* Restaurant Info */}
          <Card sx={{ mt: -4, position: 'relative', zIndex: 1, mb: 3 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <Typography variant="h4" gutterBottom>{restaurant.name}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating value={restaurant.rating} precision={0.5} readOnly size="small" />
                    <Typography variant="body2" sx={{ ml: 1 }}>{restaurant.rating}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>{restaurant.description}</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {restaurant.tags.map((tag, idx) => (
                      <Chip key={idx} label={tag} size="small" />
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2"><TimeIcon fontSize="small" /> {restaurant.deliveryTime} delivery</Typography>
                    <Typography variant="body2"><DeliveryIcon fontSize="small" /> {restaurant.deliveryFee} delivery fee</Typography>
                    <Typography variant="body2">Min order: {restaurant.minOrder}</Typography>
                    <Typography variant="body2">Hours: {restaurant.openingHours}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Menu */}
          <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" sx={{ mb: 2 }}>
            {restaurant.menuCategories.map((cat, idx) => (
              <Tab label={cat.name} key={idx} />
            ))}
          </Tabs>

          {restaurant.menuCategories.map((cat, idx) => (
            <Box key={cat.id} hidden={activeTab !== idx}>
              <Grid container spacing={2}>
                {cat.items.map(item => (
                  <Grid item xs={12} sm={6} md={4} key={item.id}>
                    <Card onClick={() => openItemDialog(item)} sx={{ cursor: 'pointer', transition: '0.2s', '&:hover': { transform: 'scale(1.03)' } }}>
                      <CardMedia component="img" height="140" image={item.image} alt={item.name} />
                      <CardContent>
                        <Typography variant="h6">{item.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{item.description}</Typography>
                        <Typography variant="subtitle1">${item.price.toFixed(2)}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        </Container>
      </Box>

      {/* Floating Cart Button */}
      {JSON.parse(localStorage.getItem('cartItems') || '[]').length > 0 && (
        <Box sx={{ position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 1000 }}>
          <Button variant="contained" color="primary" size="large" startIcon={<CartIcon />} onClick={goToCart}>
            View Cart
          </Button>
        </Box>
      )}

      {/* Item Dialog */}
      <Dialog open={Boolean(selectedItem)} onClose={closeItemDialog} maxWidth="sm" fullWidth>
        {selectedItem && (
          <>
            <Box sx={{ position: 'relative' }}>
              <CardMedia component="img" height="200" image={selectedItem.image} alt={selectedItem.name} />
              <IconButton onClick={closeItemDialog} sx={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <CloseIcon sx={{ color: 'white' }} />
              </IconButton>
            </Box>
            <DialogTitle>{selectedItem.name}</DialogTitle>
            <DialogContent>
              <Typography gutterBottom>{selectedItem.description}</Typography>
              {selectedItem.options && selectedItem.options.map((option, idx) => (
                <Box key={idx} sx={{ mt: 2 }}>
                  <Typography variant="subtitle1">{option.name}</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {option.choices.map((choice, i) => (
                      <Chip
                        key={i}
                        label={choice}
                        clickable
                        color={selectedOptions[option.name] === choice ? 'primary' : 'default'}
                        onClick={() => handleOptionChange(option.name, choice)}
                      />
                    ))}
                  </Box>
                </Box>
              ))}
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 3 }}>
                <Typography>Qty:</Typography>
                <IconButton onClick={decreaseItemCount}><RemoveIcon /></IconButton>
                <TextField value={itemCount} size="small" sx={{ width: 50, mx: 1 }} disabled />
                <IconButton onClick={increaseItemCount}><AddIcon /></IconButton>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button fullWidth variant="contained" onClick={addToCart}>
                Add to Cart - ${calculateItemTotal().toFixed(2)}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleCloseSnackbar}>
        <Alert severity="success" onClose={handleCloseSnackbar} sx={{ width: '100%' }}>
          Item added to cart!
        </Alert>
      </Snackbar>
    </Layout>
  );
};

export default RestaurantDetail;