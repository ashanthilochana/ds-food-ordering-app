import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { restaurantService } from '../../services/restaurantService';

const AddRestaurant = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: { street: '', city: '', zip: '' },
    cuisine: [],
    priceRange: '',
    phone: '',
    openingHours: '',
    deliveryTime: '',
    deliveryFee: '',
    minOrder: '',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const handleTagInputKeyPress = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()]
        }));
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        cuisine: formData.cuisine,
        priceRange: formData.priceRange,
      };
      await restaurantService.addRestaurant(payload);
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError('Failed to add restaurant. Please try again.');
    }
  };

  return (
    <Layout>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Add New Restaurant
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Restaurant Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  required
                  fullWidth
                  label="Street"
                  name="street"
                  value={formData.address.street}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    address: { ...prev.address, street: e.target.value }
                  }))}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  required
                  fullWidth
                  label="City"
                  name="city"
                  value={formData.address.city}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    address: { ...prev.address, city: e.target.value }
                  }))}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  required
                  fullWidth
                  label="Zip"
                  name="zip"
                  value={formData.address.zip}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    address: { ...prev.address, zip: e.target.value }
                  }))}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Price Range</InputLabel>
                  <Select
                    name="priceRange"
                    value={formData.priceRange}
                    label="Price Range"
                    onChange={e => setFormData(prev => ({ ...prev, priceRange: e.target.value }))}
                  >
                    <MenuItem value="budget">Budget</MenuItem>
                    <MenuItem value="moderate">Moderate</MenuItem>
                    <MenuItem value="expensive">Expensive</MenuItem>
                    <MenuItem value="luxury">Luxury</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Cuisines (comma separated)"
                  name="cuisine"
                  value={formData.cuisine.join(', ')}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      cuisine: e.target.value.split(',').map(c => c.trim()).filter(Boolean)
                    }))
                  }
                  placeholder="e.g., Indian, Chinese"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Opening Hours"
                  name="openingHours"
                  value={formData.openingHours}
                  onChange={handleChange}
                  placeholder="e.g., 9:00 AM - 10:00 PM"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Delivery Time"
                  name="deliveryTime"
                  value={formData.deliveryTime}
                  onChange={handleChange}
                  placeholder="e.g., 30-45 min"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Delivery Fee"
                  name="deliveryFee"
                  value={formData.deliveryFee}
                  onChange={handleChange}
                  placeholder="e.g., $2.99"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Minimum Order"
                  name="minOrder"
                  value={formData.minOrder}
                  onChange={handleChange}
                  placeholder="e.g., $10"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Add Tags"
                  value={tagInput}
                  onChange={handleTagInputChange}
                  onKeyPress={handleTagInputKeyPress}
                  placeholder="Press Enter to add tags"
                />
                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      onDelete={() => handleRemoveTag(tag)}
                    />
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/dashboard')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                  >
                    Add Restaurant
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError('')}
        >
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        </Snackbar>
        <Snackbar
          open={success}
          autoHideDuration={2000}
          onClose={() => setSuccess(false)}
        >
          <Alert severity="success" onClose={() => setSuccess(false)}>
            Restaurant added successfully!
          </Alert>
        </Snackbar>
      </Container>
    </Layout>
  );
};

export default AddRestaurant; 