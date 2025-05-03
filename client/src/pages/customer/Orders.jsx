import React from 'react';
import Layout from '../../components/layout/Layout';
import { Typography, Container } from '@mui/material';

const Orders = () => (
  <Layout>
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Orders
      </Typography>
      <Typography>
        This is where your order history will appear.
      </Typography>
    </Container>
  </Layout>
);

export default Orders; 