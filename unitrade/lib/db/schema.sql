-- Users table (managed by Supabase Auth but extended with our custom fields)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  username TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Listings table for products
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT,
  condition TEXT,
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active',
  contact_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Purchase requests table
CREATE TABLE IF NOT EXISTS purchase_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  buyer_message TEXT,
  buyer_contact TEXT,
  pickup_time TIMESTAMP WITH TIME ZONE,
  pickup_location TEXT,
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email notifications table
CREATE TABLE IF NOT EXISTS email_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users
CREATE POLICY "Public users are viewable by everyone" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own record" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for listings
CREATE POLICY "Listings are viewable by everyone" ON listings
  FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "Users can create their own listings" ON listings
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update their own listings" ON listings
  FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Users can delete their own listings" ON listings
  FOR DELETE USING (auth.uid() = seller_id);

-- Create RLS policies for purchase requests
CREATE POLICY "Users can view purchase requests they are involved in" ON purchase_requests
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can create purchase requests" ON purchase_requests
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS listings_seller_id_idx ON listings(seller_id);
CREATE INDEX IF NOT EXISTS purchase_requests_listing_id_idx ON purchase_requests(listing_id);
CREATE INDEX IF NOT EXISTS purchase_requests_buyer_id_idx ON purchase_requests(buyer_id);
CREATE INDEX IF NOT EXISTS purchase_requests_seller_id_idx ON purchase_requests(seller_id); 