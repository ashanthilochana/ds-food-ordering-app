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
  Container
} from '@mui/material';
import { Search as SearchIcon, Restaurant as RestaurantIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';

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
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState('');

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setRestaurants(mockRestaurants);
      setLoading(false);
    }, 1000);
    
    // Actual API call would be something like:
    // const fetchRestaurants = async () => {
    //   try {
    //     const response = await axios.get('/api/restaurants');
    //     setRestaurants(response.data);
    //     setLoading(false);
    //   } catch (error) {
    //     console.error('Error fetching restaurants:', error);
    //     setLoading(false);
    //   }
    // };
    // fetchRestaurants();
  }, []);

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