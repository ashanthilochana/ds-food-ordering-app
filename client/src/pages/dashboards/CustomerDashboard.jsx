import React from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
} from '@mui/material';
import {
  ShoppingCart,
  RestaurantMenu,
  History,
  LocationOn,
} from '@mui/icons-material';

export default function CustomerDashboard({ user }) {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Welcome Message */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h4" gutterBottom>
              Welcome back, {user.name}!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              What would you like to eat today?
            </Typography>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Button
                  variant="contained"
                  startIcon={<RestaurantMenu />}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  Browse Restaurants
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  variant="contained"
                  startIcon={<ShoppingCart />}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  View Cart
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  variant="outlined"
                  startIcon={<History />}
                  fullWidth
                >
                  Order History
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  variant="outlined"
                  startIcon={<LocationOn />}
                  fullWidth
                >
                  Saved Addresses
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Recent Orders */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Orders
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Order #12345
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pizza Hut - 2 items
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Status: Delivered
                  </Typography>
                </CardContent>
                <Divider />
                <CardActions>
                  <Button size="small">View Details</Button>
                  <Button size="small">Reorder</Button>
                </CardActions>
              </Card>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
