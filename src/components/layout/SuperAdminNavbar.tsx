import React from 'react';
import { Menu, Bell, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SuperAdminNavbarProps {
  onMenuToggle: () => void;
}

export default function SuperAdminNavbar({ onMenuToggle }: SuperAdminNavbarProps) {
  const superAdminEmail = localStorage.getItem('superAdminEmail') || 'superadmin@foodexpress.com';

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 lg:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-red-600" />
            <h1 className="text-lg font-semibold text-gray-900">
              Super Admin Portal
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              5
            </Badge>
          </Button>

          {/* Super Admin Info */}
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <Shield className="h-4 w-4 text-red-600" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900">Super Admin</p>
              <p className="text-xs text-gray-500">{superAdminEmail}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
