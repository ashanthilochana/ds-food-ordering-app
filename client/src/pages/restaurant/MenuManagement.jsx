import React, { useState, useEffect } from 'react';
import {
  Container, Box, Typography, Paper, Grid, Button, TextField, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Snackbar, Alert, MenuItem, Select, InputLabel, FormControl
} from '@mui/material';
import { Add as AddIcon, Save as SaveIcon, Edit as EditIcon, Delete as DeleteIcon, ArrowBack as BackIcon } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import restaurantService from '../../services/restaurant.service';

const MenuManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const restaurantId = new URLSearchParams(location.search).get('restaurantId');
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openItemDialog, setOpenItemDialog] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        const data = await restaurantService.getRestaurantMenuItems(restaurantId);
        setMenuItems(data);
        const uniqueCategories = [...new Set(data.map(item => item.category))];
        setCategories(uniqueCategories);
        setLoading(false);
      } catch (err) {
        setError('Failed to load menu items.');
        setLoading(false);
      }
    };

    if (restaurantId) fetchMenuItems();
    else setError('Restaurant ID is missing');
  }, [restaurantId]);

  const handleAddItem = () => {
    setCurrentItem({ name: '', description: '', price: 0, category: '', image: '' });
    setOpenItemDialog(true);
  };

  const handleEditItem = (item) => {
    setCurrentItem({ ...item });
    setOpenItemDialog(true);
  };

  const handleSaveItem = async () => {
    if (!currentItem.name.trim() || !currentItem.category.trim()) {
      setSnackbar({ open: true, message: 'Name and Category are required.', severity: 'error' });
      return;
    }
  
    try {
      if (currentItem._id) {
        // UPDATE existing menu item
        const updatedItem = await restaurantService.updateMenuItem(currentItem._id, currentItem);
        const updatedItems = menuItems.map(item => item._id === currentItem._id ? updatedItem : item);
        setMenuItems(updatedItems);
        setSnackbar({ open: true, message: 'Menu item updated.', severity: 'success' });
      } else {
        // CREATE new menu item
        const newItemPayload = {
          ...currentItem,
          restaurant: restaurantId,
          ingredients: [],
          preparationTime: 10
        };
        const newItem = await restaurantService.createMenuItem(newItemPayload);
        setMenuItems([...menuItems, newItem]);
        setSnackbar({ open: true, message: 'Menu item added.', severity: 'success' });
      }
      setOpenItemDialog(false);
    } catch (err) {
      console.error('Error saving menu item:', err);
      setSnackbar({ open: true, message: 'Failed to save menu item.', severity: 'error' });
    }
  };
  
  const handleDeleteItem = async (itemId) => {
    try {
      await restaurantService.deleteMenuItem(restaurantId, itemId);
      setMenuItems(menuItems.filter(item => item._id !== itemId));
      setSnackbar({ open: true, message: 'Menu item deleted.', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete item.', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const filteredItems = selectedCategory ? menuItems.filter(item => item.category === selectedCategory) : menuItems;

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
      <Container>
        <Box sx={{ my: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Button startIcon={<BackIcon />} onClick={() => navigate(`/restaurant-dashboard/${restaurantId}`)}>Back</Button>
            <Typography variant="h4">Menu Management</Typography>
            <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleAddItem}>Add Menu Item</Button>
          </Box>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Filter by Category</InputLabel>
            <Select
              value={selectedCategory}
              label="Filter by Category"
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((cat, idx) => (
                <MenuItem key={idx} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredItems.map(item => (
                  <TableRow key={item._id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>${item.price.toFixed(2)}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => handleEditItem(item)}><EditIcon fontSize="small" /></Button>
                      <Button size="small" color="error" onClick={() => handleDeleteItem(item._id)}><DeleteIcon fontSize="small" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Container>

      <Dialog open={openItemDialog} onClose={() => setOpenItemDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{currentItem?._id ? 'Edit Menu Item' : 'Add Menu Item'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Item Name"
            fullWidth
            value={currentItem?.name || ''}
            onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
            required
          />
          <TextField
            margin="dense"
            label="Price"
            type="number"
            fullWidth
            value={currentItem?.price || ''}
            onChange={(e) => setCurrentItem({ ...currentItem, price: parseFloat(e.target.value) })}
            required
          />
          <TextField
            margin="dense"
            label="Category"
            fullWidth
            value={currentItem?.category || ''}
            onChange={(e) => setCurrentItem({ ...currentItem, category: e.target.value })}
            required
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={2}
            value={currentItem?.description || ''}
            onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Image URL"
            fullWidth
            value={currentItem?.image || ''}
            onChange={(e) => setCurrentItem({ ...currentItem, image: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenItemDialog(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveItem}>Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
};

export default MenuManagement;
