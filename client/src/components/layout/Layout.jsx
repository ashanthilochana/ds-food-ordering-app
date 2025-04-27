import React from 'react';
import { Container, Box } from '@mui/material';
import Navbar from './Navbar';
import { useLocation } from 'react-router-dom';

const Layout = ({ children, cartItems }) => {
  const location = useLocation();
  
  // Determine user role based on URL path
  const getUserRole = () => {
    const path = location.pathname;
    if (path.includes('restaurant-')) {
      return 'restaurant';
    } else if (path.includes('delivery-')) {
      return 'delivery';
    } else if (path.includes('login') || path === '/') {
      return 'guest';
    } else {
      return 'customer';
    }
  };

  const userRole = getUserRole();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar cartItems={cartItems} userRole={userRole} />
      <Container component="main" sx={{ flexGrow: 1, py: 3 }}>
        {children}
      </Container>
      <Box component="footer" sx={{ py: 3, bgcolor: 'background.paper', mt: 'auto' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            © {new Date().getFullYear()} Food Delivery App. All rights reserved.
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout; 