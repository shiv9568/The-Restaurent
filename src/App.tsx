import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import AdminLayout from "./components/layout/AdminLayout";
import SuperAdminLayout from "./components/layout/SuperAdminLayout";
import Home from "./pages/Home";
import RestaurantDetails from "./pages/RestaurantDetails";
import Cart from "./pages/Cart";
import OrderTracking from "./pages/OrderTracking";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Dashboard from "./pages/admin/Dashboard";
import MenuManagement from "./pages/admin/MenuManagement";
import FoodManagement from "./pages/admin/FoodManagement";
import OrdersManagement from "./pages/admin/OrdersManagement";
import OffersManagement from "./pages/admin/OffersManagement";
import DeliveryZonesManagement from "./pages/admin/DeliveryZonesManagement";
import Settings from "./pages/admin/Settings";
import AdminLogin from "./pages/admin/AdminLogin";
import SuperAdminDashboard from "./pages/super-admin/SuperAdminDashboard";
import NotFound from "./pages/NotFound";
import UserHome from './pages/UserHome';
import MyOrders from './pages/MyOrders';
import Payment from './pages/Payment';
import Invoice from './pages/Invoice';
import CompleteProfile from './pages/CompleteProfile';
import { useAuth } from '@clerk/clerk-react';
import { useEffect } from 'react';

const queryClient = new QueryClient();

const App = () => {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  useEffect(() => {
    async function exchangeIfNeeded() {
      if (!isLoaded || !isSignedIn) return;
      const existing = window.localStorage.getItem('token');
      if (existing) return;
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const clerkToken = await getToken();
      const body = JSON.stringify({ token: clerkToken || '' });
      const headers = { 'Content-Type': 'application/json' } as const;
      try {
        const res = await fetch(`${API_BASE}/auth/clerk-verify`, { method: 'POST', headers, body });
        if (res.ok) {
          const data = await res.json();
          if (data?.token) {
            window.localStorage.setItem('token', data.token);
            if (data.user) window.localStorage.setItem('user', JSON.stringify(data.user));
          }
        }
      } catch {}
    }
    exchangeIfNeeded();
  }, [isLoaded, isSignedIn, getToken]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
          {/* Super Admin Routes */}
          <Route path="/super-admin/*" element={
            <SuperAdminLayout>
              <SuperAdminDashboard />
            </SuperAdminLayout>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="menu" element={<MenuManagement />} />
            <Route path="food" element={<FoodManagement />} />
            <Route path="orders" element={<OrdersManagement />} />
            <Route path="offers" element={<OffersManagement />} />
            <Route path="delivery-zones" element={<DeliveryZonesManagement />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* User Routes with Navbar/Footer layout */}
          <Route path="/*" element={
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<UserHome />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/payment" element={<Payment />} />
                  <Route path="/order-tracking/:orderId" element={<OrderTracking />} />
                  <Route path="/invoice/:orderId" element={<Invoice />} />
                  <Route path="/my-orders" element={<MyOrders />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/complete-profile" element={<CompleteProfile />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/restaurant/:id" element={<RestaurantDetails />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
          } />
        </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
