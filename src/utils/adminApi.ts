// Mock API functions for admin dashboard
// In a real application, these would make actual HTTP requests to your backend

import { 
  DashboardStats, 
  MenuItem, 
  AdminOrder, 
  Offer, 
  DeliveryZone, 
  RestaurantOwner 
} from '@/types';

// Mock data
const mockDashboardStats: DashboardStats = {
  totalOrders: 1247,
  totalRevenue: 45680,
  pendingOrders: 23,
  completedOrders: 1204,
  averageOrderValue: 36.7,
  topSellingItems: [
    { id: '1', name: 'Chicken Biryani', quantity: 156, revenue: 4680 },
    { id: '2', name: 'Butter Chicken', quantity: 134, revenue: 4020 },
    { id: '3', name: 'Paneer Tikka', quantity: 98, revenue: 2940 },
    { id: '4', name: 'Dal Makhani', quantity: 87, revenue: 2610 },
  ],
  recentOrders: [],
  revenueChart: [
    { date: '2024-01-09', revenue: 1200, orders: 32 },
    { date: '2024-01-10', revenue: 1350, orders: 36 },
    { date: '2024-01-11', revenue: 1100, orders: 28 },
    { date: '2024-01-12', revenue: 1600, orders: 42 },
    { date: '2024-01-13', revenue: 1800, orders: 48 },
    { date: '2024-01-14', revenue: 1450, orders: 38 },
    { date: '2024-01-15', revenue: 1700, orders: 45 },
  ],
};

// Dashboard API
export const getDashboardStats = async (): Promise<DashboardStats> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockDashboardStats;
};

// Menu Management API
export const getMenuItems = async (): Promise<MenuItem[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [
    {
      id: '1',
      name: 'Chicken Biryani',
      description: 'Fragrant basmati rice with tender chicken and aromatic spices',
      price: 299,
      image: '/placeholder.svg',
      category: 'Main Course',
      isVeg: false,
      rating: 4.5,
    },
    {
      id: '2',
      name: 'Paneer Tikka',
      description: 'Grilled cottage cheese with spices and herbs',
      price: 249,
      image: '/placeholder.svg',
      category: 'Appetizer',
      isVeg: true,
      rating: 4.2,
    },
  ];
};

export const createMenuItem = async (item: Omit<MenuItem, 'id'>): Promise<MenuItem> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    ...item,
    id: Date.now().toString(),
  };
};

export const updateMenuItem = async (id: string, item: Partial<MenuItem>): Promise<MenuItem> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return { ...item, id } as MenuItem;
};

export const deleteMenuItem = async (id: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 300));
};

// Orders Management API
export const getOrders = async (): Promise<AdminOrder[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [
    {
      id: 'ORD-001',
      restaurantName: 'Tasty Bites',
      items: [],
      total: 450,
      status: 'pending',
      orderedAt: '2024-01-15T10:30:00Z',
      customerName: 'John Doe',
      customerPhone: '+1 234-567-8900',
      customerEmail: 'john@example.com',
      paymentMethod: 'card',
      paymentStatus: 'completed',
      deliveryAddress: '123 Main St, City, State 12345',
    },
  ];
};

export const updateOrderStatus = async (id: string, status: string): Promise<AdminOrder> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  // Return updated order
  return {
    id,
    restaurantName: 'Tasty Bites',
    items: [],
    total: 450,
    status: status as any,
    orderedAt: '2024-01-15T10:30:00Z',
    customerName: 'John Doe',
    customerPhone: '+1 234-567-8900',
    customerEmail: 'john@example.com',
    paymentMethod: 'card',
    paymentStatus: 'completed',
    deliveryAddress: '123 Main St, City, State 12345',
  };
};

// Offers Management API
export const getOffers = async (): Promise<Offer[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [
    {
      id: '1',
      title: 'Weekend Special',
      description: 'Get 20% off on all orders above $50',
      discountType: 'percentage',
      discountValue: 20,
      minOrderAmount: 50,
      maxDiscountAmount: 100,
      validFrom: '2024-01-15',
      validUntil: '2024-01-21',
      isActive: true,
      applicableOn: 'all',
    },
  ];
};

export const createOffer = async (offer: Omit<Offer, 'id'>): Promise<Offer> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    ...offer,
    id: Date.now().toString(),
  };
};

export const updateOffer = async (id: string, offer: Partial<Offer>): Promise<Offer> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return { ...offer, id } as Offer;
};

export const deleteOffer = async (id: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 300));
};

// Delivery Zones API
export const getDeliveryZones = async (): Promise<DeliveryZone[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [
    {
      id: '1',
      name: 'Downtown Area',
      description: 'Central business district and surrounding areas',
      deliveryFee: 5.99,
      minOrderAmount: 25,
      estimatedTime: '25-35 mins',
      isActive: true,
      coordinates: [
        { lat: 40.7128, lng: -74.0060 },
        { lat: 40.7589, lng: -73.9851 },
      ],
    },
  ];
};

export const createDeliveryZone = async (zone: Omit<DeliveryZone, 'id'>): Promise<DeliveryZone> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    ...zone,
    id: Date.now().toString(),
  };
};

export const updateDeliveryZone = async (id: string, zone: Partial<DeliveryZone>): Promise<DeliveryZone> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return { ...zone, id } as DeliveryZone;
};

export const deleteDeliveryZone = async (id: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 300));
};

// Settings API
export const getRestaurantSettings = async (): Promise<RestaurantOwner> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return {
    id: '1',
    name: 'John Smith',
    email: 'john@tastybites.com',
    phone: '+1 (555) 123-4567',
    restaurantId: 'rest-001',
    restaurantName: 'Tasty Bites',
    logo: '/placeholder.svg',
    address: '123 Main Street',
    city: 'New York',
    state: 'NY',
    pincode: '10001',
    cuisine: 'Indian',
    rating: 4.5,
    deliveryTime: '25-35 mins',
    priceForTwo: 45,
  };
};

export const updateRestaurantSettings = async (settings: Partial<RestaurantOwner>): Promise<RestaurantOwner> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return settings as RestaurantOwner;
};
