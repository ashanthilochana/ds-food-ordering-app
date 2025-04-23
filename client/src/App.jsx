import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/customer-dashboard" element={<Dashboard />} />
      <Route path="/restaurant-dashboard" element={<Dashboard />} />
      <Route path="/delivery-dashboard" element={<Dashboard />} />
      <Route path="/admin-dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
