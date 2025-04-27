import React, { useState, useEffect } from 'react';
import { Container, Box } from '@mui/material';
import Navbar from './Navbar';
import { useLocation } from 'react-router-dom';
import authService from '../../services/auth.service';

const Layout = ({ children, cartItems }) => {
  const location = useLocation();
  const [userRole, setUserRole] = useState('guest');
  
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user && user.user && user.user.role) {
      setUserRole(user.user.role);
    } else {
      setUserRole('guest');
    }
  }, [location.pathname]);

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