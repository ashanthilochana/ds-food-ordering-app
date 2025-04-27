import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { menuItemService } from '../services/menuItemService';

const MenuItem = ({ menuItem, onUpdate, onDelete, isOwner }) => {
  const handleToggleAvailability = async () => {
    try {
      await menuItemService.toggleAvailability(menuItem._id);
      onUpdate(); // Refresh the menu items list
    } catch (error) {
      console.error('Error toggling availability:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        await menuItemService.deleteMenuItem(menuItem._id);
        onDelete(); // Refresh the menu items list
      } catch (error) {
        console.error('Error deleting menu item:', error);
      }
    }
  };

  return (
    <Card className="mb-3">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <Card.Title>{menuItem.name}</Card.Title>
            <Card.Subtitle className="mb-2 text-muted">
              {menuItem.category}
            </Card.Subtitle>
            <Card.Text>{menuItem.description}</Card.Text>
            <div className="d-flex align-items-center">
              <Badge bg={menuItem.isAvailable ? 'success' : 'danger'} className="me-2">
                {menuItem.isAvailable ? 'Available' : 'Unavailable'}
              </Badge>
              <span className="fw-bold">${menuItem.price.toFixed(2)}</span>
            </div>
          </div>
          {isOwner && (
            <div className="d-flex gap-2">
              <Button
                variant={menuItem.isAvailable ? 'warning' : 'success'}
                size="sm"
                onClick={handleToggleAvailability}
              >
                {menuItem.isAvailable ? 'Make Unavailable' : 'Make Available'}
              </Button>
              <Button variant="danger" size="sm" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default MenuItem; 