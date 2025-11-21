import express from 'express';
import dns from 'dns';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectAndTest } from './db/client.js';
import { initSchema } from './db/schema.js';
import supabaseRoutes from './routes/supabase.js';
import { isSupabaseConfigured, testSupabaseConnection } from './db/supabaseClient.js';
import foodItemsRoutes from './routes/foodItems.js';
import categoriesRoutes from './routes/categories.js';
import ordersRoutes from './routes/orders.js';
import restaurantsRoutes from './routes/restaurants.js';
import usersRoutes from './routes/users.js';
import authRoutes from './routes/auth.js';
import offersRoutes from './routes/offers.js';
import deliveryZonesRoutes from './routes/deliveryZones.js';
import restaurantBrandRoutes from './routes/restaurantBrand.js';
import adminRoutes from './routes/admin.js';
import { query } from './db/client.js';

dotenv.config();
// Prefer IPv6 first to handle cases where only AAAA records exist (e.g., Supabase DB)
try {
  // @ts-ignore - Node 18+ supports setDefaultResultOrder
  dns.setDefaultResultOrder?.('ipv6first');
} catch { }

const app = express();
const PORT = process.env.PORT || 5000;
const POSTGRES_URL = process.env.POSTGRES_URL || process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/foodie_dash';


// Middleware
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',')
  : ['http://localhost:5173', 'http://localhost:8080'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins in development
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/food-items', foodItemsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/restaurants', restaurantsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/offers', offersRoutes);
app.use('/api/delivery-zones', deliveryZonesRoutes);
app.use('/api/restaurant-brand', restaurantBrandRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/supabase', supabaseRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Seed default admin user in Postgres
async function seedAdminUser() {
  try {
    const adminEmail = 'admin@gmail.com';
    const existing = await query<{ id: string }>('SELECT id FROM users WHERE email=$1', [adminEmail]);
    if (existing.rows.length === 0) {
      const id = `usr_${Math.random().toString(36).slice(2, 10)}`;
      const hashed = await bcrypt.hash('admin123', 12);
      await query(
        `INSERT INTO users (id, name, email, password, role) VALUES ($1, $2, $3, $4, $5)`,
        [id, 'Admin User', adminEmail, hashed, 'admin']
      );
      console.log('✅ Default admin user created');
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: admin123`);
    } else {
      console.log('ℹ️  Admin user already exists');
    }
  } catch (error: any) {
    console.error('⚠️  Error seeding admin user:', error.message);
  }
}

// Connect to MongoDB with improved connection options
async function start() {
  const allowServerWithoutDb = (process.env.ALLOW_SERVER_WITHOUT_DB ?? 'false').toLowerCase() === 'true';
  try {
    const useSupabaseApi = (process.env.USE_SUPABASE_API ?? 'false').toLowerCase() === 'true';
    if (useSupabaseApi && isSupabaseConfigured) {
      console.log('🔌 Connecting to Supabase (API key)...');
      await testSupabaseConnection();
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`🔑 Using Supabase HTTP API for data`);
      });
      return;
    }

    console.log('🔌 Connecting to Postgres...');
    await connectAndTest();
    console.log('🧱 Initializing database schema...');
    await initSchema();
    await seedAdminUser();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📦 Postgres URL: ${POSTGRES_URL}`);
    });
  } catch (error: any) {
    console.error('❌ Postgres initialization error:', error);
    console.error('💡 Tip: Check your POSTGRES_URL or DATABASE_URL in .env file');
    if (allowServerWithoutDb) {
      console.warn('⚠️  Starting server without DB connection due to ALLOW_SERVER_WITHOUT_DB=true');
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT} (DB disconnected)`);
      });
    } else {
      process.exit(1);
    }
  }
}

// Only start the server if running directly (not imported as a module)
// This prevents Vercel from trying to start the server on import
if (import.meta.url === `file://${process.argv[1]}`) {
  start();
}


export default app;

