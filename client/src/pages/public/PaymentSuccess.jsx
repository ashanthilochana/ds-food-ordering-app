import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Layout from '../../components/layout/Layout';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    // Simulate loading state
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleContinueShopping = () => {
    navigate('/restaurants');
  };

  const handleViewOrders = () => {
    navigate('/orders');
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
      <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircleOutlineIcon
            sx={{
              fontSize: 80,
              color: 'success.main',
              mb: 2
            }}
          />
          <Typography variant="h4" component="h1" gutterBottom>
            Payment Successful!
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Thank you for your order. Your payment has been processed successfully.
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            You will receive an email confirmation shortly with your order details.
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              onClick={handleContinueShopping}
            >
              Continue Shopping
            </Button>
            <Button
              variant="contained"
              onClick={handleViewOrders}
            >
              View Orders
            </Button>
          </Box>
        </Paper>
      </Container>
    </Layout>
  );
};

export default PaymentSuccess; 