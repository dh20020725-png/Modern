# 🔧 FIX: Registration Not Working

## Problem ❌

The Supabase database tables haven't been created yet. Your database is connected but empty.

## Solution ✅

Follow these steps to create the database tables:

### Step 1: Go to Supabase Dashboard

1. Open https://app.supabase.com
2. Sign in to your account
3. Select your project: `howto-commerce`

### Step 2: Open SQL Editor

1. Click **SQL Editor** (left sidebar)
2. Click **New Query**

### Step 3: Copy & Paste SQL

Copy ALL of the SQL below and paste it into the query editor:

```sql
-- Drop existing tables if needed (OPTIONAL - only if corrupted)
-- DROP TABLE IF EXISTS order_items CASCADE;
-- DROP TABLE IF EXISTS orders CASCADE;
-- DROP TABLE IF EXISTS products CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- Create Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  image VARCHAR(500) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  shipping JSONB NOT NULL,
  delivery_status VARCHAR(50) DEFAULT 'pending',
  payment_status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Order Items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
```

### Step 4: Run the Query

1. Click the **Run** button (or press `Ctrl+Enter`)
2. Wait for the success message

### Step 5: Verify Everything

1. Go to **Table Editor** (left sidebar)
2. You should now see:
   - ✅ users
   - ✅ products
   - ✅ orders
   - ✅ order_items

### Step 6: Try Registering Again

Go back to http://localhost:3000 and try registering. It should work now! 🎉

---

## Still Having Issues? 🆘

Try these alternatives:

### Option A: Use REST API Directly

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Option B: Check Database Connection

```bash
cd server
npm run test-supabase
```

---

## Quick Checklist

- [ ] Supabase project created
- [ ] Project URL in `server/.env` ✅
- [ ] Anon key in `server/.env` ✅
- [ ] Tables created via SQL ⬅️ **DO THIS PART**
- [ ] Server restarted
- [ ] Try registering again
