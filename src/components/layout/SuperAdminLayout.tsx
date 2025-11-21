import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import SuperAdminSidebar from './SuperAdminSidebar';
import SuperAdminNavbar from './SuperAdminNavbar';

export default function SuperAdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Check if super admin is logged in
  const superAdminToken = localStorage.getItem('superAdminToken');
  if (!superAdminToken) {
    navigate('/super-admin/login');
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <SuperAdminSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <SuperAdminNavbar onMenuToggle={toggleSidebar} />
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
