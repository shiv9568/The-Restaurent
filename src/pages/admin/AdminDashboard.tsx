import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLogin from './AdminLogin';
import AdminSignUp from './AdminSignUp';
import Dashboard from './Dashboard';
import MenuManagement from './MenuManagement';
import OrdersManagement from './OrdersManagement';
import OffersManagement from './OffersManagement';
import DeliveryZonesManagement from './DeliveryZonesManagement';
import FoodManagement from './FoodManagement';
import Settings from './Settings';
import RestaurantSettings from './RestaurantSettings';

export default function AdminDashboard() {
  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          <ProtectedRoute requireAuth={false}>
            <AdminLogin />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/sign-up" 
        element={
          <ProtectedRoute requireAuth={false}>
            <AdminSignUp />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/menu" 
        element={
          <ProtectedRoute>
            <MenuManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/food-management" 
        element={
          <ProtectedRoute>
            <FoodManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/orders" 
        element={
          <ProtectedRoute>
            <OrdersManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/offers" 
        element={
          <ProtectedRoute>
            <OffersManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/delivery-zones" 
        element={
          <ProtectedRoute>
            <DeliveryZonesManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/restaurant-settings" 
        element={
          <ProtectedRoute>
            <RestaurantSettings />
          </ProtectedRoute>
        } 
      />
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
}
