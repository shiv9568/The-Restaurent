# Restaurant Admin Dashboard

A modern React admin dashboard for restaurant owners to manage their business operations.

## Features

### 🏠 Dashboard
- Overview of key metrics (total orders, revenue, pending orders)
- Top selling items
- Recent orders
- Revenue charts (placeholder for chart integration)

### 🍽️ Menu Management
- CRUD operations for menu items
- Category management
- Search and filter functionality
- Vegetarian/Non-vegetarian indicators
- Price management

### 📦 Order Management
- View all orders with customer details
- Order status management (Accept, Reject, Mark Delivered)
- Payment status tracking
- Order filtering and search
- Real-time order updates

### 🎯 Offers Management
- Create and manage promotional offers
- Percentage and fixed amount discounts
- Validity period management
- Minimum order amount requirements
- Offer activation/deactivation

### 🗺️ Delivery Zones
- Define delivery areas
- Set delivery fees and minimum order amounts
- Estimated delivery times
- Zone activation/deactivation
- Map integration (placeholder)

### ⚙️ Settings
- Restaurant information management
- Contact details
- Business hours
- Logo upload
- Cuisine type selection

## Tech Stack

- **React 18** with TypeScript
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Shadcn/ui** components
- **Lucide React** for icons
- **React Query** for data fetching (ready for integration)

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd foodie-dash-front
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
   - Main app: `http://localhost:5173`
   - Admin dashboard: `http://localhost:5173/admin`

### Admin Authentication

The admin dashboard uses Clerk for authentication. You'll need to:

1. Set up a Clerk account at [clerk.com](https://clerk.com)
2. Get your publishable key from the Clerk dashboard
3. Create a `.env` file with your key:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
   ```

See [CLERK_SETUP.md](./CLERK_SETUP.md) for detailed setup instructions.

## Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── AdminLayout.tsx      # Main admin layout wrapper
│   │   ├── AdminNavbar.tsx      # Admin navigation bar
│   │   └── AdminSidebar.tsx     # Admin sidebar navigation
│   └── ProtectedRoute.tsx       # Authentication protection
├── pages/
│   └── admin/
│       ├── AdminDashboard.tsx   # Admin route configuration
│       ├── AdminLogin.tsx       # Admin login page
│       ├── Dashboard.tsx        # Dashboard overview
│       ├── MenuManagement.tsx   # Menu CRUD operations
│       ├── OrdersManagement.tsx # Order management
│       ├── OffersManagement.tsx # Offers management
│       ├── DeliveryZonesManagement.tsx # Delivery zones
│       └── Settings.tsx         # Restaurant settings
├── types/
│   └── index.ts                 # TypeScript type definitions
└── utils/
    └── adminApi.ts              # Mock API functions
```

## API Integration

The dashboard is ready for backend integration. Mock API functions are provided in `src/utils/adminApi.ts` for:

- Dashboard statistics
- Menu item management
- Order management
- Offers management
- Delivery zones
- Restaurant settings

### Backend Endpoints Expected

```
GET    /api/admin/dashboard/stats
GET    /api/admin/menu/items
POST   /api/admin/menu/items
PUT    /api/admin/menu/items/:id
DELETE /api/admin/menu/items/:id
GET    /api/admin/orders
PUT    /api/admin/orders/:id/status
GET    /api/admin/offers
POST   /api/admin/offers
PUT    /api/admin/offers/:id
DELETE /api/admin/offers/:id
GET    /api/admin/delivery-zones
POST   /api/admin/delivery-zones
PUT    /api/admin/delivery-zones/:id
DELETE /api/admin/delivery-zones/:id
GET    /api/admin/restaurant/settings
PUT    /api/admin/restaurant/settings
```

## Features in Detail

### Responsive Design
- Mobile-first approach
- Collapsible sidebar on mobile
- Responsive tables and forms
- Touch-friendly interface

### Authentication
- Protected routes
- Login/logout functionality
- Token-based authentication
- Automatic redirects

### Data Management
- Real-time updates
- Optimistic UI updates
- Error handling
- Loading states

### User Experience
- Intuitive navigation
- Search and filtering
- Modal dialogs for forms
- Toast notifications
- Confirmation dialogs

## Customization

### Styling
The dashboard uses Tailwind CSS with a custom design system. You can customize:
- Color scheme in `tailwind.config.ts`
- Component styles in individual files
- Global styles in `src/index.css`

### Components
All components are built with Shadcn/ui and can be customized:
- Modify component props
- Override default styles
- Add new components

### API Integration
Replace mock functions in `adminApi.ts` with actual API calls:
- Use fetch or axios
- Add error handling
- Implement loading states
- Add authentication headers

## Future Enhancements

- [ ] Real-time notifications
- [ ] Advanced analytics and reporting
- [ ] Inventory management
- [ ] Staff management
- [ ] Customer management
- [ ] Integration with payment gateways
- [ ] Mobile app support
- [ ] Multi-restaurant support
- [ ] Advanced charting library integration
- [ ] Map integration for delivery zones

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
