import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export default function ProtectedRoute({ children, requireAuth = true }: ProtectedRouteProps) {
  // TEMPORARY: Bypass authentication for testing
  const ENABLE_AUTH = false; // Set to true to enable Clerk auth
  
  if (!ENABLE_AUTH && requireAuth) {
    // Allow access without authentication (for development/testing)
    return <>{children}</>;
  }
  
  const { isSignedIn, isLoaded } = useAuth();
  
  // Show loading state while Clerk is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (requireAuth && !isSignedIn) {
    return <Navigate to="/admin/login" replace />;
  }
  
  if (!requireAuth && isSignedIn) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  return <>{children}</>;
}
