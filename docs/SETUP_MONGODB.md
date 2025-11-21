# MongoDB Backend Setup Guide

This guide will help you set up the MongoDB backend for the Foodie Dash application.

> **🌐 For Global/Long-term Use**: We recommend using **MongoDB Atlas** (cloud database) instead of local MongoDB. 
> See [MONGODB_ATLAS_SETUP.md](./MONGODB_ATLAS_SETUP.md) for cloud database setup guide.

## Prerequisites

- Node.js (v18 or higher)
- MongoDB installed locally OR MongoDB Atlas account
- npm or yarn

## Backend Setup

### 1. Navigate to Server Directory

```bash
cd server
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `server` directory (copy from `.env.example`):

```env
# MongoDB Connection (choose one)
# Local MongoDB:
MONGODB_URI=mongodb://localhost:27017/foodie-dash

# OR MongoDB Atlas:
# MONGODB_URI=mongodb+srv://):
# username:password@cluster.mongodb.net/foodie-dash?retryWrites=true&w=majority

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret (change this in production!)
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### 4. Start MongoDB

**If using local MongoDB:**
```bash
# On Windows (if installed as a service, it should start automatically)
# Or manually start:
mongod

# On macOS/Linux:
sudo systemctl start mongod
# OR
brew services start mongodb-community
```

**If using MongoDB Atlas:**
- Create an account at https://www.mongodb.com/cloud/atlas
- Create a new cluster (free tier available)
- Get your connection string
- Add your IP address to the whitelist
- Update `MONGODB_URI` in `.env` file

### 5. Start the Backend Server

```bash
# Development mode (with auto-reload):
npm run dev

# Production mode:
npm run build
npm start
```

The server should start on `http://localhost:5000`

## Frontend Setup

### 1. Configure Environment Variables

Create or update `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:5000/api
```

### 2. Start Frontend

```bash
# From root directory
npm run dev
```

## Initialize Database

After starting the backend, you can initialize default categories by:

1. Opening Postman or making a POST request to: `http://localhost:5000/api/categories/initialize`
2. Or use the admin panel - go to "Manage Menu" and click "Initialize Categories"

## API Endpoints

All endpoints are prefixed with `/api`:

- **Food Items**: `/api/food-items`
- **Categories**: `/api/categories`
- **Orders**: `/api/orders`
- **Restaurants**: `/api/restaurants`
- **Auth**: `/api/auth/register`, `/api/auth/login`
- **Users**: `/api/users`

## Testing the Setup

1. Start the backend: `cd server && npm run dev`
2. Start the frontend: `npm run dev`
3. Open browser: `http://localhost:5173`
4. Go to Admin Panel → Manage Menu
5. Click "Initialize Categories" if needed
6. Add some food items

## Troubleshooting

### MongoDB Connection Issues

- Check if MongoDB is running: `mongosh` (should connect)
- Verify connection string in `.env`
- Check firewall settings
- For Atlas: verify IP whitelist and credentials

### CORS Errors

- Update `FRONTEND_URL` in server `.env` to match your frontend URL
- Check browser console for specific CORS error messages

### Port Already in Use

- Change `PORT` in server `.env` file
- Update `VITE_API_URL` in frontend `.env` accordingly

## Next Steps

- Remove mock data from frontend (mockData.ts, foodStore.ts, categoryStore.ts)
- Update all components to use API calls instead of localStorage
- Add authentication/authorization as needed
- Implement image upload to cloud storage (optional)

