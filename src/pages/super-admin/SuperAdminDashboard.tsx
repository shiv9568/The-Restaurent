import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import SuperAdminLogin from './SuperAdminLogin';
import Dashboard from './Dashboard';
import FoodManagement from './FoodManagement';
import SuperAdminLayout from '@/components/layout/SuperAdminLayout';

export default function SuperAdminDashboard() {
  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          <SuperAdminLogin />
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          <Dashboard />
        } 
      />
      <Route 
        path="/food-management" 
        element={
          <FoodManagement />
        } 
      />
      <Route path="/" element={<Navigate to="/super-admin/dashboard" replace />} />
    </Routes>
  );
}