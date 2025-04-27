import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  IconButton,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Card,
  CardContent,
  CircularProgress,
  Snackbar,
  Alert,
  Switch,
  FormControlLabel,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  ExpandMore as ExpandMoreIcon,
  AddCircle as AddCircleIcon,
  RemoveCircle as RemoveCircleIcon,
  Image as ImageIcon,
  FastfoodOutlined as FoodIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../../components/layout/Layout';

const MenuManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const restaurantId = new URLSearchParams(location.search).get('restaurantId');
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [openItemDialog, setOpenItemDialog] = useState(false);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [currentCategory, setCurrentCategory] = useState({ name: '', active: true });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchMenuData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/menu-items/restaurant/${restaurantId}`);
        if (!response.ok) throw new Error('Failed to fetch menu items');
        const items = await response.json();
        setMenuItems(items);

        // Build categories from items
        const categoriesMap = {};
        items.forEach(item => {
          if (!categoriesMap[item.category]) {
            categoriesMap[item.category] = {
              id: item.category,
              name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
              active: true,
              items: 1
            };
          } else {
            categoriesMap[item.category].items += 1;
          }
        });
        const categoriesArr = Object.values(categoriesMap);
        setCategories(categoriesArr);
        if (categoriesArr.length > 0) {
          setSelectedCategory(categoriesArr[0].id);
        }
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Failed to fetch menu data',
          severity: 'error'
        });
      }
      setLoading(false);
    };

    fetchMenuData();
  }, [restaurantId]);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleAddCategory = () => {
    setCurrentCategory({ name: '', active: true });
    setOpenCategoryDialog(true);
  };

  const handleEditCategory = (category) => {
    setCurrentCategory({ ...category });
    setOpenCategoryDialog(true);
  };

  const handleSaveCategory = () => {
    if (!currentCategory.name.trim()) {
      setSnackbar({
        open: true,
        message: 'Category name cannot be empty',
        severity: 'error'
      });
      return;
    }

    if (currentCategory.id) {
      // Update existing category
      const updatedCategories = categories.map(cat => 
        cat.id === currentCategory.id ? { ...currentCategory } : cat
      );
      setCategories(updatedCategories);
      setSnackbar({
        open: true,
        message: 'Category updated successfully',
        severity: 'success'
      });
    } else {
      // Add new category
      const newCategory = {
        ...currentCategory,
        id: Math.max(0, ...categories.map(c => c.id)) + 1,
        items: 0
      };
      setCategories([...categories, newCategory]);
      setSnackbar({
        open: true,
        message: 'Category added successfully',
        severity: 'success'
      });
    }
    setOpenCategoryDialog(false);
  };

  const handleDeleteCategory = (categoryId) => {
    // Check if category has items
    const categoryItems = menuItems.filter(item => item.categoryId === categoryId);
    if (categoryItems.length > 0) {
      setSnackbar({
        open: true,
        message: 'Cannot delete category with menu items',
        severity: 'error'
      });
      return;
    }

    const updatedCategories = categories.filter(cat => cat.id !== categoryId);
    setCategories(updatedCategories);
    
    if (selectedCategory === categoryId) {
      setSelectedCategory(updatedCategories.length > 0 ? updatedCategories[0].id : null);
    }
    
    setSnackbar({
      open: true,
      message: 'Category deleted successfully',
      severity: 'success'
    });
  };

  const handleAddItem = () => {
    const emptyItem = {
      name: '',
      description: '',
      price: 0,
      categoryId: selectedCategory,
      image: '',
      active: true,
      popular: false,
      options: []
    };
    setCurrentItem(emptyItem);
    setOpenItemDialog(true);
  };

  const handleEditItem = (item) => {
    setCurrentItem({ ...item });
    setOpenItemDialog(true);
  };

  const handleItemChange = (field, value) => {
    setCurrentItem({
      ...currentItem,
      [field]: value
    });
  };

  const handleAddOption = () => {
    const newOption = { name: '', choices: [''] };
    setCurrentItem({
      ...currentItem,
      options: [...currentItem.options, newOption]
    });
  };

  const handleRemoveOption = (optionIndex) => {
    const updatedOptions = currentItem.options.filter((_, index) => index !== optionIndex);
    setCurrentItem({
      ...currentItem,
      options: updatedOptions
    });
  };

  const handleOptionChange = (optionIndex, field, value) => {
    const updatedOptions = currentItem.options.map((option, index) => {
      if (index === optionIndex) {
        return { ...option, [field]: value };
      }
      return option;
    });
    
    setCurrentItem({
      ...currentItem,
      options: updatedOptions
    });
  };

  const handleAddChoice = (optionIndex) => {
    const updatedOptions = currentItem.options.map((option, index) => {
      if (index === optionIndex) {
        return { ...option, choices: [...option.choices, ''] };
      }
      return option;
    });
    
    setCurrentItem({
      ...currentItem,
      options: updatedOptions
    });
  };

  const handleRemoveChoice = (optionIndex, choiceIndex) => {
    const updatedOptions = currentItem.options.map((option, index) => {
      if (index === optionIndex) {
        const updatedChoices = option.choices.filter((_, idx) => idx !== choiceIndex);
        return { ...option, choices: updatedChoices };
      }
      return option;
    });
    
    setCurrentItem({
      ...currentItem,
      options: updatedOptions
    });
  };

  const handleChoiceChange = (optionIndex, choiceIndex, value) => {
    const updatedOptions = currentItem.options.map((option, index) => {
      if (index === optionIndex) {
        const updatedChoices = option.choices.map((choice, idx) => {
          if (idx === choiceIndex) {
            return value;
          }
          return choice;
        });
        return { ...option, choices: updatedChoices };
      }
      return option;
    });
    
    setCurrentItem({
      ...currentItem,
      options: updatedOptions
    });
  };

  const handleSaveItem = async () => {
    if (!currentItem.name.trim()) {
      setSnackbar({
        open: true,
        message: 'Item name cannot be empty',
        severity: 'error'
      });
      return;
    }

    if (currentItem.price <= 0) {
      setSnackbar({
        open: true,
        message: 'Price must be greater than zero',
        severity: 'error'
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      let response, data;
      if (currentItem.id) {
        // Update existing item
        response = await fetch(`/api/menu-items/${currentItem.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(currentItem)
        });
        if (!response.ok) throw new Error('Failed to update menu item');
        data = await response.json();
        setSnackbar({
          open: true,
          message: 'Menu item updated successfully',
          severity: 'success'
        });
      } else {
        // Add new item
        const itemToSend = {
          ...currentItem,
          restaurant: restaurantId,
          // You may need to map categoryId to category if your backend expects a string
          category: currentItem.categoryId || selectedCategory,
        };
        response = await fetch('/api/menu-items', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(itemToSend)
        });
        if (!response.ok) throw new Error('Failed to add menu item');
        data = await response.json();
        setSnackbar({
          open: true,
          message: 'Menu item added successfully',
          severity: 'success'
        });
      }
      setOpenItemDialog(false);
      // Refresh menu items from backend
      fetchMenuData();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to save menu item',
        severity: 'error'
      });
    }
  };

  const handleDeleteItem = (itemId) => {
    const itemToDelete = menuItems.find(item => item.id === itemId);
    const updatedItems = menuItems.filter(item => item.id !== itemId);
    setMenuItems(updatedItems);
    
    // Update category item count
    const updatedCategories = categories.map(cat => {
      if (cat.id === itemToDelete.categoryId) {
        return { ...cat, items: cat.items - 1 };
      }
      return cat;
    });
    setCategories(updatedCategories);
    
    setSnackbar({
      open: true,
      message: 'Menu item deleted successfully',
      severity: 'success'
    });
  };

  const handleToggleItemActive = (itemId, active) => {
    const updatedItems = menuItems.map(item => {
      if (item.id === itemId) {
        return { ...item, active };
      }
      return item;
    });
    setMenuItems(updatedItems);
    
    setSnackbar({
      open: true,
      message: `Menu item ${active ? 'activated' : 'deactivated'} successfully`,
      severity: 'success'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/menu-items/restaurant/${restaurantId}`);
      if (!response.ok) throw new Error('Failed to fetch menu items');
      const items = await response.json();
      setMenuItems(items);

      // Rebuild categories as above
      const categoriesMap = {};
      items.forEach(item => {
        if (!categoriesMap[item.category]) {
          categoriesMap[item.category] = {
            id: item.category,
            name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
            active: true,
            items: 1
          };
        } else {
          categoriesMap[item.category].items += 1;
        }
      });
      const categoriesArr = Object.values(categoriesMap);
      setCategories(categoriesArr);
      if (categoriesArr.length > 0) {
        setSelectedCategory(categoriesArr[0].id);
      }
      setSnackbar({
        open: true,
        message: 'Menu refreshed',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to refresh menu',
        severity: 'error'
      });
    }
    setLoading(false);
  };

  const filteredItems = menuItems.filter(item => item.categoryId === selectedCategory);

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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                startIcon={<BackIcon />}
                onClick={() => navigate(`/restaurant-dashboard/${restaurantId}`)}
              >
                Back to Dashboard
              </Button>
              <Typography variant="h4" component="h1">
                Menu Management
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddItem}
              disabled={!selectedCategory}
            >
              Add Menu Item
            </Button>
          </Box>

          <Grid container spacing={3}>
            {/* Categories */}
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Categories</Typography>
                  <IconButton color="primary" onClick={handleAddCategory}>
                    <AddIcon />
                  </IconButton>
                </Box>
                <List>
                  {categories.map((category) => (
                    <Card 
                      key={category.id} 
                      sx={{ 
                        mb: 1, 
                        cursor: 'pointer',
                        border: selectedCategory === category.id ? '2px solid' : '1px solid',
                        borderColor: selectedCategory === category.id ? 'primary.main' : 'grey.300'
                      }}
                      onClick={() => handleCategorySelect(category.id)}
                    >
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="subtitle1">
                              {category.name}
                              {!category.active && (
                                <Chip 
                                  label="Inactive" 
                                  size="small" 
                                  color="default" 
                                  sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} 
                                />
                              )}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {category.items} items
                            </Typography>
                          </Box>
                          <Box>
                            <IconButton 
                              size="small" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditCategory(category);
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="error" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCategory(category.id);
                              }}
                              disabled={category.items > 0}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </List>
              </Paper>
            </Grid>

            {/* Menu Items */}
            <Grid item xs={12} md={9}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {categories.find(c => c.id === selectedCategory)?.name || 'Select a category'} Items
                </Typography>
                
                {filteredItems.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Image</TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell>Price</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              {item.image ? (
                                <Box
                                  component="img"
                                  src={item.image}
                                  alt={item.name}
                                  sx={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 1 }}
                                />
                              ) : (
                                <Box
                                  sx={{ 
                                    width: 50, 
                                    height: 50, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    bgcolor: 'grey.200',
                                    borderRadius: 1
                                  }}
                                >
                                  <ImageIcon color="disabled" />
                                </Box>
                              )}
                            </TableCell>
                            <TableCell>
                              {item.name}
                              {item.popular && (
                                <Chip 
                                  label="Popular" 
                                  size="small" 
                                  color="primary" 
                                  sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} 
                                />
                              )}
                            </TableCell>
                            <TableCell>{item.description}</TableCell>
                            <TableCell>${item.price.toFixed(2)}</TableCell>
                            <TableCell>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={item.active}
                                    onChange={(e) => handleToggleItemActive(item.id, e.target.checked)}
                                    color="primary"
                                  />
                                }
                                label={item.active ? "Active" : "Inactive"}
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton 
                                size="small" 
                                onClick={() => handleEditItem(item)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                color="error" 
                                onClick={() => handleDeleteItem(item.id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ py: 3, textAlign: 'center' }}>
                    {selectedCategory ? (
                      <>
                        <FoodIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" gutterBottom>
                          No menu items in this category
                        </Typography>
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<AddIcon />}
                          onClick={handleAddItem}
                          sx={{ mt: 1 }}
                        >
                          Add Menu Item
                        </Button>
                      </>
                    ) : (
                      <Typography variant="body1" color="text.secondary">
                        Please select a category to view its menu items
                      </Typography>
                    )}
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>

      {/* Category Dialog */}
      <Dialog 
        open={openCategoryDialog} 
        onClose={() => setOpenCategoryDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {currentCategory.id ? 'Edit Category' : 'Add New Category'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Category Name"
              fullWidth
              value={currentCategory.name}
              onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={currentCategory.active}
                  onChange={(e) => setCurrentCategory({ ...currentCategory, active: e.target.checked })}
                  color="primary"
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCategoryDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveCategory} 
            variant="contained"
            startIcon={<SaveIcon />}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Menu Item Dialog */}
      <Dialog 
        open={openItemDialog} 
        onClose={() => setOpenItemDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {currentItem?.id ? 'Edit Menu Item' : 'Add New Menu Item'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoFocus
                  required
                  margin="dense"
                  label="Item Name"
                  fullWidth
                  value={currentItem?.name || ''}
                  onChange={(e) => handleItemChange('name', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  margin="dense"
                  label="Price"
                  type="number"
                  fullWidth
                  value={currentItem?.price || ''}
                  onChange={(e) => handleItemChange('price', parseFloat(e.target.value))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  margin="dense"
                  label="Description"
                  fullWidth
                  multiline
                  rows={2}
                  value={currentItem?.description || ''}
                  onChange={(e) => handleItemChange('description', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  margin="dense"
                  label="Image URL"
                  fullWidth
                  value={currentItem?.image || ''}
                  onChange={(e) => handleItemChange('image', e.target.value)}
                  helperText="Enter a URL for the item image"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={currentItem?.categoryId || ''}
                    onChange={(e) => handleItemChange('categoryId', e.target.value)}
                    label="Category"
                  >
                    {categories.filter(c => c.active).map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={currentItem?.active || false}
                      onChange={(e) => handleItemChange('active', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Active"
                  sx={{ mt: 2 }}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={currentItem?.popular || false}
                      onChange={(e) => handleItemChange('popular', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Popular"
                  sx={{ mt: 2 }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />
            
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Options</Typography>
              <Button 
                startIcon={<AddIcon />} 
                onClick={handleAddOption}
                variant="outlined"
                size="small"
              >
                Add Option
              </Button>
            </Box>

            {currentItem?.options?.map((option, optionIndex) => (
              <Accordion key={optionIndex} defaultExpanded sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                    <Typography>{option.name || 'New Option'}</Typography>
                    <IconButton 
                      size="small" 
                      color="error" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveOption(optionIndex);
                      }}
                    >
                      <RemoveCircleIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <TextField
                    label="Option Name"
                    fullWidth
                    value={option.name}
                    onChange={(e) => handleOptionChange(optionIndex, 'name', e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Choices
                  </Typography>
                  
                  {option.choices.map((choice, choiceIndex) => (
                    <Box key={choiceIndex} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <TextField
                        fullWidth
                        size="small"
                        value={choice}
                        onChange={(e) => handleChoiceChange(optionIndex, choiceIndex, e.target.value)}
                        placeholder={`Choice ${choiceIndex + 1}`}
                      />
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => handleRemoveChoice(optionIndex, choiceIndex)}
                        disabled={option.choices.length <= 1}
                      >
                        <RemoveCircleIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                  
                  <Button 
                    startIcon={<AddCircleIcon />} 
                    onClick={() => handleAddChoice(optionIndex)}
                    size="small"
                    sx={{ mt: 1 }}
                  >
                    Add Choice
                  </Button>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenItemDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveItem} 
            variant="contained"
            startIcon={<SaveIcon />}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
};

const List = ({ children }) => {
  return <Box>{children}</Box>;
};

export default MenuManagement; 