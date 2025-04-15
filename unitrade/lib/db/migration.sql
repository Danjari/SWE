-- Add new columns to purchase_requests table if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_requests' AND column_name = 'pickup_time') THEN
        ALTER TABLE purchase_requests ADD COLUMN pickup_time TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_requests' AND column_name = 'pickup_location') THEN
        ALTER TABLE purchase_requests ADD COLUMN pickup_location TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_requests' AND column_name = 'payment_method') THEN
        ALTER TABLE purchase_requests ADD COLUMN payment_method TEXT;
    END IF;
END $$;

-- Create email_notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS email_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE
); 