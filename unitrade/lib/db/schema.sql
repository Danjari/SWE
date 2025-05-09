-- Create chats table
CREATE TABLE public.chats (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL,
  buyer_id uuid NOT NULL,
  seller_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NULL,
  deleted_at timestamp with time zone NULL,
  CONSTRAINT chats_pkey PRIMARY KEY (id),
  CONSTRAINT chats_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id),
  CONSTRAINT chats_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.users(id),
  CONSTRAINT chats_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id)
);
CREATE INDEX IF NOT EXISTS idx_chats_listing_id ON public.chats USING btree (listing_id);
CREATE INDEX IF NOT EXISTS idx_chats_buyer_id ON public.chats USING btree (buyer_id);
CREATE INDEX IF NOT EXISTS idx_chats_seller_id ON public.chats USING btree (seller_id);

-- Create messages table
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  chat_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  read_at timestamp with time zone NULL,
  deleted_at timestamp with time zone NULL,
  purchase_request_id uuid NULL,
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.chats(id),
  CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id),
  CONSTRAINT messages_purchase_request_id_fkey FOREIGN KEY (purchase_request_id) REFERENCES public.purchase_requests(id)
);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON public.messages USING btree (chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages USING btree (sender_id);

-- Create listings table
CREATE TABLE public.listings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  price numeric(10,2) NOT NULL,
  category text NOT NULL,
  condition text NOT NULL,
  image_url text NOT NULL DEFAULT ''::text,
  status text NOT NULL DEFAULT 'active',
  contact_email text NOT NULL,
  contact_phone text NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NULL,
  deleted_at timestamp with time zone NULL,
  CONSTRAINT listings_pkey PRIMARY KEY (id),
  CONSTRAINT listings_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id)
);
CREATE INDEX IF NOT EXISTS idx_listings_seller_id ON public.listings USING btree (seller_id);

-- Create purchase_requests table
CREATE TABLE public.purchase_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL,
  buyer_id uuid NOT NULL,
  message text NOT NULL,
  contact_info text NOT NULL,
  pickup_time timestamp with time zone NOT NULL,
  pickup_location text NOT NULL,
  payment_method text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NULL,
  CONSTRAINT purchase_requests_pkey PRIMARY KEY (id),
  CONSTRAINT purchase_requests_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id),
  CONSTRAINT purchase_requests_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.users(id)
);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_listing_id ON public.purchase_requests USING btree (listing_id);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_buyer_id ON public.purchase_requests USING btree (buyer_id);