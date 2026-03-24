require('dotenv').config();
const supabase = require('../config/supabase');

async function initializeDatabase() {
  if (!supabase) {
    console.log('⚠️  Supabase not configured');
    return false;
  }

  try {
    console.log('🔍 Checking database tables...\n');

    // Try to verify if tables exist by querying them
    const { error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (usersError && usersError.code === 'PGRST116') {
      console.log('⚠️  Tables not found. Creating database schema...\n');

      // For Supabase, we need to use the management API or direct SQL
      // Since the client method is limited, we'll attempt to create tables
      // using the REST API approach
      
      const operations = [
        // Create users table
        {
          name: 'users',
          sql: `
            CREATE TABLE IF NOT EXISTS users (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              name VARCHAR(255) NOT NULL,
              email VARCHAR(255) UNIQUE NOT NULL,
              password VARCHAR(255) NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            
            CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
          `
        },
        // Create products table
        {
          name: 'products',
          sql: `
            CREATE TABLE IF NOT EXISTS products (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              name VARCHAR(255) NOT NULL,
              description TEXT NOT NULL,
              image VARCHAR(500) NOT NULL,
              category VARCHAR(100) NOT NULL,
              price DECIMAL(10, 2) NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            
            CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
          `
        },
        // Create orders table
        {
          name: 'orders',
          sql: `
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
            
            CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
          `
        },
        // Create order_items table
        {
          name: 'order_items',
          sql: `
            CREATE TABLE IF NOT EXISTS order_items (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
              product_id UUID REFERENCES products(id),
              quantity INTEGER DEFAULT 1,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            
            CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
          `
        }
      ];

      console.log('📌 IMPORTANT: You need to create the database tables manually in Supabase\n');
      console.log('Follow these steps:\n');
      console.log('1. Go to your Supabase Dashboard: https://app.supabase.com');
      console.log('2. Select your project');
      console.log('3. Go to SQL Editor');
      console.log('4. Create a new query');
      console.log('5. Copy and paste the following SQL:\n');
      
      console.log('------- START SQL -------\n');
      
      operations.forEach(op => {
        console.log(op.sql);
      });
      
      console.log('\n------- END SQL -------\n');
      
      console.log('6. Click "Run" button');
      console.log('7. Refresh and try registering again\n');
      
      return false;
    } else if (usersError) {
      throw usersError;
    }

    console.log('✅ users table: OK');

    // Check other tables
    const { error: productsError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (!productsError) {
      console.log('✅ products table: OK');
    } else if (productsError.code !== 'PGRST116') {
      console.warn('⚠️  products table: ', productsError.message);
    }

    const { error: ordersError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    if (!ordersError) {
      console.log('✅ orders table: OK');
    } else if (ordersError.code !== 'PGRST116') {
      console.warn('⚠️  orders table: ', ordersError.message);
    }

    console.log('✅ Database initialized successfully!\n');
    return true;

  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    return false;
  }
}

module.exports = initializeDatabase;
