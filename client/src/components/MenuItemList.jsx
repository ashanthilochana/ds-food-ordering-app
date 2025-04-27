import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import MenuItem from './MenuItem';
import { menuItemService } from '../services/menuItemService';

const MenuItemList = ({ restaurantId, isOwner }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    isAvailable: '',
    search: ''
  });

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const data = await menuItemService.getAllMenuItems({
        ...filters,
        restaurant: restaurantId
      });
      setMenuItems(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch menu items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, [restaurantId, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMenuItems();
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-danger">{error}</div>;

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <Form onSubmit={handleSearch} className="d-flex gap-2">
            <Form.Group className="flex-grow-1">
              <Form.Control
                type="text"
                name="search"
                placeholder="Search menu items..."
                value={filters.search}
                onChange={handleFilterChange}
              />
            </Form.Group>
            <Form.Group>
              <Form.Select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
              >
                <option value="">All Categories</option>
                <option value="appetizer">Appetizers</option>
                <option value="main">Main Course</option>
                <option value="dessert">Desserts</option>
                <option value="beverage">Beverages</option>
              </Form.Select>
            </Form.Group>
            <Form.Group>
              <Form.Select
                name="isAvailable"
                value={filters.isAvailable}
                onChange={handleFilterChange}
              >
                <option value="">All Items</option>
                <option value="true">Available</option>
                <option value="false">Unavailable</option>
              </Form.Select>
            </Form.Group>
            <Button type="submit" variant="primary">
              Search
            </Button>
          </Form>
        </Col>
      </Row>

      <Row>
        {menuItems.length === 0 ? (
          <Col>
            <p className="text-center">No menu items found</p>
          </Col>
        ) : (
          menuItems.map(menuItem => (
            <Col key={menuItem._id} xs={12} md={6} lg={4}>
              <MenuItem
                menuItem={menuItem}
                onUpdate={fetchMenuItems}
                onDelete={fetchMenuItems}
                isOwner={isOwner}
              />
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
};

export default MenuItemList; 