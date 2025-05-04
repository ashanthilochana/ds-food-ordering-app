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
  Chip,
  OutlinedInput
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import restaurantService from '../../services/restaurant.service';

const CUISINE_OPTIONS = [
  'Italian',
  'Chinese',
  'Japanese',
  'Indian',
  'Mexican',
  'Thai',
  'American',
  'Mediterranean',
  'Korean',
  'Vietnamese',
  'French',
  'Greek',
  'Spanish',
  'Middle Eastern',
  'Caribbean',
  'African',
  'German',
  'British',
  'Russian',
  'Brazilian'
];

const AddRestaurant = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    cuisine: [],
    priceRange: 'moderate',
    contactInfo: {
      email: '',
      phone: ''
    },
    openingHours: '',
    tags: []
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Restaurant name is required';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!formData.address.street.trim()) {
      errors['address.street'] = 'Street address is required';
    }
    
    if (!formData.address.city.trim()) {
      errors['address.city'] = 'City is required';
    }
    
    if (!formData.address.country.trim()) {
      errors['address.country'] = 'Country is required';
    }
    
    if (!formData.cuisine || formData.cuisine.length === 0) {
      errors.cuisine = 'At least one cuisine type is required';
    }
    
    if (!['budget', 'moderate', 'expensive', 'luxury'].includes(formData.priceRange)) {
      errors.priceRange = 'Invalid price range';
    }
    
    if (!formData.contactInfo.email) {
      errors['contactInfo.email'] = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.contactInfo.email)) {
      errors['contactInfo.email'] = 'Invalid email format';
    }
    
    if (formData.contactInfo.phone && !/^\+?[\d\s-]+$/.test(formData.contactInfo.phone)) {
      errors['contactInfo.phone'] = 'Invalid phone number format';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    // Clear validation error when field is edited
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleCuisineChange = (event) => {
    const {
      target: { value },
    } = event;
    setFormData(prev => ({
      ...prev,
      cuisine: typeof value === 'string' ? value.split(',') : value,
    }));
    // Clear validation error when cuisine is selected
    setValidationErrors(prev => ({
      ...prev,
      cuisine: undefined
    }));
  };

  const handleRemoveCuisine = (cuisineToRemove) => {
    setFormData(prev => ({
      ...prev,
      cuisine: prev.cuisine.filter(cuisine => cuisine !== cuisineToRemove)
    }));
    // Only show validation error if there are no cuisines left
    if (formData.cuisine.length <= 1) {
      setValidationErrors(prev => ({
        ...prev,
        cuisine: 'At least one cuisine type is required'
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      const response = await restaurantService.createRestaurant(formData);
      console.log('Restaurant data:', formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to add restaurant. Please try again.');
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
                  error={!!validationErrors.name}
                  helperText={validationErrors.name}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  error={!!validationErrors.description}
                  helperText={validationErrors.description}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Street Address"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  error={!!validationErrors['address.street']}
                  helperText={validationErrors['address.street']}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="City"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  error={!!validationErrors['address.city']}
                  helperText={validationErrors['address.city']}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="State/Province"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  error={!!validationErrors['address.state']}
                  helperText={validationErrors['address.state']}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="ZIP/Postal Code"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleChange}
                  error={!!validationErrors['address.zipCode']}
                  helperText={validationErrors['address.zipCode']}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Country"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleChange}
                  error={!!validationErrors['address.country']}
                  helperText={validationErrors['address.country']}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required error={!!validationErrors.cuisine}>
                  <InputLabel>Cuisine Types</InputLabel>
                  <Select
                    multiple
                    value={formData.cuisine}
                    onChange={handleCuisineChange}
                    input={<OutlinedInput label="Cuisine Types" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip
                            key={value}
                            label={value}
                            onDelete={() => handleRemoveCuisine(value)}
                            color="primary"
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {CUISINE_OPTIONS.map((cuisine) => (
                      <MenuItem key={cuisine} value={cuisine}>
                        {cuisine}
                      </MenuItem>
                    ))}
                  </Select>
                  {validationErrors.cuisine && (
                    <Typography color="error" variant="caption">
                      {validationErrors.cuisine}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!!validationErrors.priceRange}>
                  <InputLabel>Price Range</InputLabel>
                  <Select
                    name="priceRange"
                    value={formData.priceRange}
                    onChange={handleChange}
                    label="Price Range"
                  >
                    <MenuItem value="budget">Budget</MenuItem>
                    <MenuItem value="moderate">Moderate</MenuItem>
                    <MenuItem value="expensive">Expensive</MenuItem>
                    <MenuItem value="luxury">Luxury</MenuItem>
                  </Select>
                  {validationErrors.priceRange && (
                    <Typography color="error" variant="caption">
                      {validationErrors.priceRange}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Email"
                  name="contactInfo.email"
                  type="email"
                  value={formData.contactInfo.email}
                  onChange={handleChange}
                  error={!!validationErrors['contactInfo.email']}
                  helperText={validationErrors['contactInfo.email']}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="contactInfo.phone"
                  value={formData.contactInfo.phone}
                  onChange={handleChange}
                  error={!!validationErrors['contactInfo.phone']}
                  helperText={validationErrors['contactInfo.phone']}
                  placeholder="+1234567890"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Opening Hours"
                  name="openingHours"
                  value={formData.openingHours}
                  onChange={handleChange}
                  placeholder="e.g., 9:00 AM - 10:00 PM"
                />
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