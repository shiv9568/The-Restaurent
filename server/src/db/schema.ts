import { query } from './client';

export async function initSchema() {
  // Create enum-like constraints via CHECKs where useful, keep minimal to avoid migration complexity
  // Users
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT,
      phone TEXT,
      clerk_id TEXT UNIQUE,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS addresses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      label TEXT NOT NULL,
      street TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      pincode TEXT NOT NULL,
      is_default BOOLEAN NOT NULL DEFAULT FALSE
    );
  `);

  // Restaurants and brand (single row for brand info)
  await query(`
    CREATE TABLE IF NOT EXISTS restaurants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      logo TEXT,
      about TEXT,
      address TEXT,
      open_time TEXT,
      close_time TEXT,
      contact_number TEXT,
      is_closed BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS restaurant_brand (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      logo TEXT,
      about TEXT,
      address TEXT,
      open_time TEXT,
      close_time TEXT,
      contact_number TEXT,
      delivery_zones TEXT[],
      is_closed BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // Categories
  await query(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      icon TEXT,
      display_on_homepage BOOLEAN NOT NULL DEFAULT TRUE,
      restaurant_id TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // Food items
  await query(`
    CREATE TABLE IF NOT EXISTS food_items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price NUMERIC NOT NULL,
      image TEXT NOT NULL,
      category TEXT NOT NULL,
      category_id TEXT,
      is_veg BOOLEAN NOT NULL DEFAULT FALSE,
      is_available BOOLEAN NOT NULL DEFAULT TRUE,
      display_on_homepage BOOLEAN NOT NULL DEFAULT FALSE,
      rating NUMERIC NOT NULL DEFAULT 0,
      restaurant_id TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // Offers
  await query(`
    CREATE TABLE IF NOT EXISTS offers (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      discount_type TEXT NOT NULL,
      discount_value NUMERIC NOT NULL,
      min_order_amount NUMERIC,
      max_discount_amount NUMERIC,
      valid_from TIMESTAMPTZ NOT NULL,
      valid_until TIMESTAMPTZ NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      applicable_on TEXT NOT NULL DEFAULT 'all',
      item_ids TEXT[],
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // Orders
  await query(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      user_id TEXT,
      restaurant_id TEXT,
      restaurant_name TEXT NOT NULL,
      total NUMERIC NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      payment_method TEXT NOT NULL DEFAULT 'cash',
      payment_status TEXT NOT NULL DEFAULT 'pending',
      delivery_address TEXT,
      customer_name TEXT,
      customer_phone TEXT,
      customer_email TEXT,
      estimated_time TEXT,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      item_id TEXT NOT NULL,
      name TEXT NOT NULL,
      price NUMERIC NOT NULL,
      quantity INTEGER NOT NULL,
      image TEXT
    );
  `);

  // Delivery zones
  await query(`
    CREATE TABLE IF NOT EXISTS delivery_zones (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      delivery_fee NUMERIC NOT NULL,
      min_order_amount NUMERIC NOT NULL,
      estimated_time TEXT NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      coordinates JSONB NOT NULL DEFAULT '[]',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

