import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Profile from './pages/Profile';
import DashboardRouter from './components/DashboardRouter';

// Customer routes
import Restaurants from './pages/customer/Restaurants';
import RestaurantDetail from './pages/customer/RestaurantDetail';
import Cart from './pages/customer/Cart';
import TrackOrder from './pages/customer/TrackOrder';

// Restaurant admin routes
import MenuManagement from './pages/restaurant/MenuManagement';
import OrderManagement from './pages/restaurant/OrderManagement';
import AddRestaurant from './pages/restaurant/AddRestaurant';
import RestaurantDetailDashboard from './pages/restaurant/RestaurantDetailDashboard';

function App() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/" element={<Restaurants />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/profile" element={<Profile />} />
      
      {/* Dashboard Route - Handles role-based routing */}
      <Route path="/dashboard" element={<DashboardRouter />} />
      
      {/* Customer Routes */}
      <Route path="/restaurants" element={<Restaurants />} />
      <Route path="/restaurant/:id" element={<RestaurantDetail />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/track-order/:orderId" element={<TrackOrder />} />
      
      {/* Restaurant Admin Routes */}
      <Route path="/menu-management" element={<MenuManagement />} />
      <Route path="/restaurant-orders" element={<OrderManagement />} />
      <Route path="/add-restaurant" element={<AddRestaurant />} />
      <Route path="/restaurant-dashboard/:restaurantId" element={<RestaurantDetailDashboard />} />
    </Routes>
  );
}

export default App;
