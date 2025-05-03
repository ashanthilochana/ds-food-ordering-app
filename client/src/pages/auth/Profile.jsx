import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  TextField,
  Button,
  Grid,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import Layout from '../../components/layout/Layout';
import authService from '../../services/auth.service';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    role: ''
  });
  const [editData, setEditData] = useState({
    name: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }

    setUserData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      address: user.address || '',
      role: user.role
    });
    setEditData({
      name: user.name,
      phone: user.phone || '',
      address: user.address || ''
    });
    setLoading(false);
  }, [navigate]);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditData({
      name: userData.name,
      phone: userData.phone,
      address: userData.address
    });
    setEditing(false);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      // In a real app, you would make an API call here to update the user profile
      // await api.updateProfile(editData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUserData(prev => ({
        ...prev,
        ...editData
      }));
      setEditing(false);
      setSnackbar({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to update profile',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (event) => {
    setEditData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading || !userData || !userData.name) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
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
    <Layout>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
            <Typography variant="h4" component="h1">
              My Profile
            </Typography>
            {!editing ? (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={handleEdit}
              >
                Edit Profile
              </Button>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                >
                  Save
                </Button>
              </Box>
            )}
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    mb: 2,
                    bgcolor: theme => theme.palette[getRoleColor(userData?.role || 'customer')]?.main,
                    fontSize: '3rem'
                  }}
                >
                  {(userData?.name || 'U').charAt(0)}
                </Avatar>
                <Typography variant="h6" gutterBottom>
                  {userData?.name || 'Unknown User'}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    bgcolor: theme => theme.palette[getRoleColor(userData?.role || 'customer')]?.main,
                    color: 'white',
                    py: 0.5,
                    px: 2,
                    borderRadius: 1,
                    textTransform: 'uppercase'
                  }}
                >
                  {(userData?.role || 'customer').replace('_', ' ')}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={8}>
              <Card variant="outlined">
                <CardContent>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <PersonIcon />
                      </ListItemIcon>
                      {editing ? (
                        <TextField
                          fullWidth
                          label="Name"
                          value={editData.name}
                          onChange={handleChange('name')}
                        />
                      ) : (
                        <ListItemText
                          primary="Name"
                          secondary={userData?.name || 'Unknown'}
                        />
                      )}
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemIcon>
                        <EmailIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Email"
                        secondary={userData?.email || 'Unknown'}
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemIcon>
                        <PhoneIcon />
                      </ListItemIcon>
                      {editing ? (
                        <TextField
                          fullWidth
                          label="Phone"
                          value={editData.phone}
                          onChange={handleChange('phone')}
                        />
                      ) : (
                        <ListItemText
                          primary="Phone"
                          secondary={userData?.phone || 'Not provided'}
                        />
                      )}
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemIcon>
                        <LocationIcon />
                      </ListItemIcon>
                      {editing ? (
                        <TextField
                          fullWidth
                          label="Address"
                          value={editData.address}
                          onChange={handleChange('address')}
                          multiline
                          rows={2}
                        />
                      ) : (
                        <ListItemText
                          primary="Address"
                          secondary={userData?.address || 'Not provided'}
                        />
                      )}
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
};

export default Profile; 