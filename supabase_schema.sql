-- ==========================================
-- Supabase Schema Definition (Reset & Cleaned)
-- ==========================================

-- 1. Profiles Table (Shipping Info & User Data)
-- This extends the auth.users table
create table profiles (
  id uuid references auth.users not null primary key,
  email text, -- Cached email for easier display (optional, sync via triggers is best usually)
  full_name text,
  nickname text,
  phone_number text,
  postal_code text,
  prefecture text,
  city text,
  address_line1 text,
  address_line2 text,
  updated_at timestamp with time zone
);

alter table profiles enable row level security;

create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);


-- 2. User Settings Table
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


-- 3. Products Table
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

alter table products enable row level security;

create policy "Public products are viewable by everyone" on products for select using (true);
create policy "Enable all access for all users (Admin)" on products for all using (true) with check (true);


-- 4. Cart Items Table
create table cart_items (
  user_id uuid references auth.users not null,
  product_id uuid references products(id) not null, -- FIXED: UUID & Relation
  quantity int default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, product_id)
);

alter table cart_items enable row level security;

create policy "Users can view own cart items" on cart_items for select using (auth.uid() = user_id);
create policy "Users can insert own cart items" on cart_items for insert with check (auth.uid() = user_id);
create policy "Users can update own cart items" on cart_items for update using (auth.uid() = user_id);
create policy "Users can delete own cart items" on cart_items for delete using (auth.uid() = user_id);


-- 5. Orders Table
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


-- 6. Order Items Table
create table order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) not null,
  product_id uuid references products(id), -- FIXED: UUID & Relation (Nullable if product deleted, but usually keep it)
  quantity integer not null,
  price_at_purchase integer not null
);

alter table order_items enable row level security;

-- Policy strictly allowing access via parent order ownership
create policy "Users can view own order items" on order_items for select
  using ( exists ( select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid() ) );

create policy "Users can insert order items" on order_items for insert with check (auth.role() = 'authenticated');


-- 7. Notifications Table
create table notifications (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  type text default 'info', -- 'info', 'alert', 'new_arrival'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table notifications enable row level security;

create policy "Public notifications are viewable by everyone" on notifications for select using (true);
create policy "Admin all access notifications" on notifications for all using (true) with check (true);
