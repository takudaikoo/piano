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
