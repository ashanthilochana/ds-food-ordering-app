import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Avatar, 
  Box, 
  useMediaQuery, 
  useTheme,
  Badge,
  Menu,
  MenuItem
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Restaurant as RestaurantIcon, 
  ShoppingCart as CartIcon, 
  Person as PersonIcon, 
  Logout as LogoutIcon, 
  Dashboard as DashboardIcon,
  LocalShipping as DeliveryIcon
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/auth.service';

const Navbar = ({ cartItems = [], userRole }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = authService.getCurrentUser();
    if (loggedInUser) {
      setUser(loggedInUser);
    }
  }, []);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleProfileMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    navigate('/login');
    handleClose();
  };

  const getNavLinks = () => {
    switch(userRole) {
      case 'customer':
        return [
          { text: 'Restaurants', icon: <RestaurantIcon />, path: '/restaurants' },
          { text: 'My Orders', icon: <DashboardIcon />, path: '/my-orders' },
        ];
      case 'restaurant':
        return [
          { text: 'Dashboard', icon: <DashboardIcon />, path: '/restaurant-dashboard' },
          { text: 'Menu', icon: <RestaurantIcon />, path: '/menu-management' },
          { text: 'Orders', icon: <CartIcon />, path: '/restaurant-orders' },
        ];
      case 'delivery':
        return [
          { text: 'My Deliveries', icon: <DeliveryIcon />, path: '/my-deliveries' },
          { text: 'Dashboard', icon: <DashboardIcon />, path: '/delivery-dashboard' },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  const drawer = (
    <div>
      <List>
        {navLinks.map((item, index) => (
          <ListItem 
            button 
            key={index} 
            component={Link} 
            to={item.path}
            onClick={handleDrawerToggle}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'white' }}>
            Food Delivery
          </Typography>

          {!isMobile && (
            <Box sx={{ display: 'flex' }}>
              {navLinks.map((item, index) => (
                <Button 
                  key={index} 
                  color="inherit" 
                  component={Link} 
                  to={item.path}
                  startIcon={item.icon}
                >
                  {item.text}
                </Button>
              ))}
            </Box>
          )}

          {userRole === 'customer' && (
            <IconButton 
              color="inherit" 
              component={Link} 
              to="/cart"
            >
              <Badge badgeContent={cartItems.length} color="error">
                <CartIcon />
              </Badge>
            </IconButton>
          )}

          {user ? (
            <Box>
              <IconButton
                onClick={handleProfileMenu}
                color="inherit"
              >
                <Avatar sx={{ width: 32, height: 32 }}>
                  {user.name?.charAt(0) || user.email?.charAt(0)}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem component={Link} to="/profile" onClick={handleClose}>Profile</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Box>
          ) : (
            <>
              <Button 
                color="inherit" 
                component={Link} 
                to="/login"
                startIcon={<PersonIcon />}
                sx={{ mr: 1 }}
              >
                Login
              </Button>
              <Button 
                color="inherit" 
                variant="outlined"
                component={Link} 
                to="/signup"
                sx={{ 
                  border: '1px solid white',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)'
                  }
                }}
              >
                Sign Up
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Navbar; 