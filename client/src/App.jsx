import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';

// Customer routes
import Restaurants from './pages/customer/Restaurants';
import RestaurantDetail from './pages/customer/RestaurantDetail';
import Cart from './pages/customer/Cart';
import TrackOrder from './pages/customer/TrackOrder';

// Restaurant admin routes
import MenuManagement from './pages/restaurant/MenuManagement';
import OrderManagement from './pages/restaurant/OrderManagement';

// Delivery personnel routes
import DeliveryDashboard from './pages/delivery/DeliveryDashboard';

function App() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/" element={<Restaurants />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      
      {/* Customer Routes */}
      <Route path="/restaurants" element={<Restaurants />} />
      <Route path="/restaurant/:id" element={<RestaurantDetail />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/track-order/:orderId" element={<TrackOrder />} />
      <Route path="/my-orders" element={<Dashboard />} />
      
      {/* Restaurant Admin Routes */}
      <Route path="/restaurant-dashboard" element={<Dashboard />} />
      <Route path="/menu-management" element={<MenuManagement />} />
      <Route path="/restaurant-orders" element={<OrderManagement />} />

      {/* Delivery Personnel Routes */}
      <Route path="/delivery-dashboard" element={<Dashboard />} />
      <Route path="/my-deliveries" element={<DeliveryDashboard />} />
    </Routes>
  );
}

export default App;
