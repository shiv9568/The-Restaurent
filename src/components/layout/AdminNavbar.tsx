import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, LogOut } from 'lucide-react';

interface AdminNavbarProps {
  onMenuToggle: () => void;
}

export default function AdminNavbar({ onMenuToggle }: AdminNavbarProps) {
  const handleLogout = () => {
    // Check if tokens are the same before removing
    const adminToken = localStorage.getItem('adminToken');
    const token = localStorage.getItem('token');
    const isSameToken = adminToken === token;
    
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    
    // Remove regular token if it's the same as admin token
    if (isSameToken) {
      localStorage.removeItem('token');
    }
    
    window.location.href = '/admin/login';
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Restaurant Admin</h1>
            <p className="text-sm text-gray-500">Control what customers see</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
