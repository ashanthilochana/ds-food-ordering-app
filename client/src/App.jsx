import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context';

// Auth pages
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';
import Profile from './pages/auth/Profile';

// Layout components
import DashboardRouter from './components/layout/DashboardRouter';

// Public pages
import PaymentSuccess from './pages/public/PaymentSuccess';

// Customer routes
import Restaurants from './pages/customer/Restaurants';
import RestaurantDetail from './pages/customer/RestaurantDetail';
import Cart from './pages/customer/Cart';
import TrackOrder from './pages/customer/TrackOrder';
import Orders from './pages/customer/Orders';

// Restaurant admin routes
import MenuManagement from './pages/restaurant/MenuManagement';
import OrderManagement from './pages/restaurant/OrderManagement';
import AddRestaurant from './pages/restaurant/AddRestaurant';
import RestaurantDetailDashboard from './pages/restaurant/RestaurantDetailDashboard';

// New imports
import CustomerDashboard from './pages/dashboards/CustomerDashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          
          {/* Protected Routes */}
          <Route path="/" element={<Navigate to="/restaurants" replace />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard/*" element={<DashboardRouter />} />
          
          {/* Customer Routes */}
          <Route path="/restaurants" element={<Restaurants />} />
          <Route path="/restaurant/:id" element={<RestaurantDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/track-order/:orderId" element={<TrackOrder />} />
          <Route path="/orders" element={<Orders />} />
          
          {/* Restaurant Admin Routes */}
          <Route path="/menu-management" element={<MenuManagement />} />
          <Route path="/restaurant-orders" element={<OrderManagement />} />
          <Route path="/add-restaurant" element={<AddRestaurant />} />
          <Route path="/restaurant-dashboard/:restaurantId" element={<RestaurantDetailDashboard />} />

          {/* New routes */}
          <Route path="/customer-dashboard" element={<CustomerDashboard />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
