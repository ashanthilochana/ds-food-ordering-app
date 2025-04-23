import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  Chip,
  Alert,
  Button,
} from '@mui/material';
import authService from '../services/auth.service';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  const getRoleColor = (role) => {
    const colors = {
      admin: 'error',
      restaurant_admin: 'primary',
      customer: 'success',
      delivery_person: 'warning'
    };
    return colors[role] || 'default';
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Alert severity="success" sx={{ mb: 4 }}>
        Successfully logged in!
      </Alert>
      
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Avatar
            sx={{
              width: 100,
              height: 100,
              bgcolor: (theme) => theme.palette[getRoleColor(user.user.role)].main,
              fontSize: '2rem',
            }}
          >
            {user.user.name.charAt(0)}
          </Avatar>

          <Typography variant="h4" component="h1" gutterBottom>
            Welcome, {user.user.name}!
          </Typography>

          <Chip
            label={user.user.role.replace('_', ' ').toUpperCase()}
            color={getRoleColor(user.user.role)}
            sx={{ mb: 2 }}
          />

          <Box sx={{ textAlign: 'left', width: '100%', mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              <strong>Email:</strong> {user.user.email}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Account Created:</strong>{' '}
              {new Date(user.user.createdAt).toLocaleDateString()}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Last Updated:</strong>{' '}
              {new Date(user.user.updatedAt).toLocaleDateString()}
            </Typography>
          </Box>

          <Button
            variant="contained"
            color="error"
            onClick={handleLogout}
            sx={{ mt: 4 }}
          >
            Logout
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
