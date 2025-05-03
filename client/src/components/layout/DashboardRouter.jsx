import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import CustomerDashboard from '../../pages/dashboards/CustomerDashboard';
import RestaurantDashboard from '../../pages/restaurant/RestaurantDashboard';
import DeliveryDashboard from '../../pages/delivery/DeliveryDashboard';
import authService from '../../services/auth.service';

const DashboardRouter = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const user = await authService.getCurrentUser();
      console.log('DashboardRouter: getCurrentUser() returned:', user);
      if (!user) {
        navigate('/login');
        return;
      }
      setUserRole(user.role);
      setLoading(false);
    };
    checkUser();
  }, [navigate]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  switch (userRole) {
    case 'customer':
      return <CustomerDashboard />;
    case 'restaurant_admin':
      return <RestaurantDashboard />;
    case 'delivery_person':
      return <DeliveryDashboard />;
    default:
      navigate('/login');
      return null;
  }
};

export default DashboardRouter; 