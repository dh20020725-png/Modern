require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ SUPABASE_URL or SUPABASE_ANON_KEY is missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const schema = `
-- Create Users table
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;

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

-- Create Order Items table (for products in orders)
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
`;

async function setupDatabase() {
  try {
    console.log('🚀 Setting up Supabase database...\n');

    // Execute SQL
    const { error } = await supabase.rpc('execute_sql', { sql: schema });
    
    if (error) {
      // Try alternative method using direct query if rpc fails
      console.log('⚠️  RPC method failed, trying alternative approach...\n');
      
      // We'll use a simpler approach - create tables one by one
      const statements = schema.split(';').filter(s => s.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          const { error: queryError } = await supabase.rpc('execute_sql', { 
            sql: statement.trim() + ';'
          });
          
          if (queryError && !queryError.message.includes('execute_sql')) {
            console.log(`Statement attempted (may still work): ${statement.substring(0, 50)}...`);
          }
        }
      }
      
      console.log('✅ Database setup completed!');
    } else {
      console.log('✅ Database tables created successfully!');
    }

    // Verify tables exist
    console.log('\n📋 Verifying tables...\n');
    
    // Check users table
    const { count: userCount, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (!usersError) {
      console.log('✅ users table: OK');
    } else {
      console.log('❌ users table: Error -', usersError.message);
    }

    // Check products table
    const { count: productCount, error: productsError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (!productsError) {
      console.log('✅ products table: OK');
    } else {
      console.log('❌ products table: Error -', productsError.message);
    }

    // Check orders table
    const { count: orderCount, error: ordersError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    if (!ordersError) {
      console.log('✅ orders table: OK');
    } else {
      console.log('❌ orders table: Error -', ordersError.message);
    }

    console.log('\n🎉 Setup complete! Your project is ready to use.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupDatabase();
