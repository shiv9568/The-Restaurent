# Foodie Dash Backend API

MongoDB-based REST API server for the Foodie Dash application.

> **🌐 Recommended for Production**: Use **MongoDB Atlas** (free cloud database) for global access and long-term reliability.
> See [MONGODB_ATLAS_SETUP.md](../MONGODB_ATLAS_SETUP.md) for detailed setup instructions.

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example` in the server directory):

**For MongoDB Atlas (Recommended):**
```bash
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/foodie-dash?retryWrites=true&w=majority
PORT=5000
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173
```

**For Local MongoDB:**
```bash
MONGODB_URI=mongodb://localhost:27017/foodie-dash
PORT=5000
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173
```

3. Start MongoDB:
```bash
# For local MongoDB:
# Make sure MongoDB is installed and running

# For MongoDB Atlas:
# No local installation needed - just use the connection string above
# Follow: ../MONGODB_ATLAS_SETUP.md
```

4. Run the server:
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## API Endpoints

### Food Items
- `GET /api/food-items` - Get all food items
- `GET /api/food-items/:id` - Get single food item
- `POST /api/food-items` - Create food item
- `PUT /api/food-items/:id` - Update food item
- `DELETE /api/food-items/:id` - Delete food item

### Categories
- `GET /api/categories` - Get all categories with items
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category
- `POST /api/categories/initialize` - Initialize default categories

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order

### Restaurants
- `GET /api/restaurants` - Get all restaurants
- `GET /api/restaurants/:id` - Get single restaurant
- `POST /api/restaurants` - Create restaurant
- `PUT /api/restaurants/:id` - Update restaurant
- `DELETE /api/restaurants/:id` - Delete restaurant

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user

## MongoDB Connection

You can use either:
- Local MongoDB: `mongodb://localhost:27017/foodie-dash`
- MongoDB Atlas: `mongodb+srv://username:password@cluster.mongodb.net/foodie-dash`

