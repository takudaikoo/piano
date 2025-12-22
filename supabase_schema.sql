-- Create the products table
create table products (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  catch_copy text,
  price integer default 0,
  category text not null,
  image text,
  images text[],
  specs jsonb default '{}'::jsonb,
  target_audience text[],
  benefits text[],
  description text,
  how_to text,
  is_new boolean default false,
  is_popular boolean default false
);

-- Enable Row Level Security (RLS)
alter table products enable row level security;

-- Create a policy that allows anyone to view products
create policy "Public products are viewable by everyone"
  on products
  for select
  using (true);

-- Create a policy that allows anyone (anon) to insert/update/delete products
-- WARNING: In a real app, you would restrict this to authenticated users only.
-- Since we are doing a simple setup without auth for now (or assuming anon admin), we open it up.
-- If you want to secure it, you should implement Supabase Auth.
create policy "Enable all access for all users"
  on products
  for all
  using (true)
  with check (true);

-- Cart Items Table
create table cart_items (
  user_id uuid references auth.users not null,
  product_id text not null,
  quantity int default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, product_id)
);

alter table cart_items enable row level security;

create policy "Users can view their own cart items."
  on cart_items for select
  using (auth.uid() = user_id);

create policy "Users can insert their own cart items."
  on cart_items for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own cart items."
  on cart_items for update
  using (auth.uid() = user_id);

create policy "Users can delete their own cart items."
  on cart_items for delete
  using (auth.uid() = user_id);

-- Profiles Table (Shipping Info)
create table profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  postal_code text,
  prefecture text,
  city text,
  address_line1 text,
  address_line2 text,
  phone_number text,
  updated_at timestamp with time zone
);

alter table profiles enable row level security;

create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- Orders Table
create table orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  total_amount integer not null,
  status text default 'pending_payment', -- pending_payment, paid, shipped, cancelled
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table orders enable row level security;

create policy "Users can view own orders" on orders for select using (auth.uid() = user_id);
create policy "Users can insert own orders" on orders for insert with check (auth.uid() = user_id);

-- Order Items Table
create table order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders not null,
  product_id text not null, -- references products(id) physically or logically
  quantity integer not null,
  price_at_purchase integer not null
);

alter table order_items enable row level security;

create policy "Users can view own order items" on order_items for select
  using ( exists ( select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid() ) );

create policy "Users can insert order items" on order_items for insert with check (auth.role() = 'authenticated');

-- Notifications Table
create table notifications (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  type text default 'info', -- 'info', 'alert', 'new_arrival'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table notifications enable row level security;

-- Admin can do everything, users can only view
create policy "Public notifications are viewable by everyone"
  on notifications for select
  using (true);

-- Assuming we want only admins/service role to insert. 
-- For now, if we don't have distinct roles set up in this schema for admin, 
-- we can allow authenticated users to insert if we trust them (bad for prod) or just leave it to dashboard logic/RLS disabled for service role helper.
-- Let's stick to: "Users cannot insert". Admin Dashboard likely uses a logged-in user who *should* be admin.
-- Since the current app seems to use the same user table for admin, we might need a way to distinguish.
-- For this MVP/Phase, let's allow "Enable all access for all users" pattern seen above OR restrict.
-- Given the "Enable all access for all users" on products, I'll follow that pattern for ease of use but comment it.
create policy "Allow all access to notifications for now"
  on notifications for all
  using (true)
  with check (true);


-- User Settings Table
create table user_settings (
  user_id uuid references auth.users not null primary key,
  email_notification boolean default true,
  app_notification boolean default true,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table user_settings enable row level security;

create policy "Users can view own settings" on user_settings for select using (auth.uid() = user_id);
create policy "Users can update own settings" on user_settings for update using (auth.uid() = user_id);
create policy "Users can insert own settings" on user_settings for insert with check (auth.uid() = user_id);
