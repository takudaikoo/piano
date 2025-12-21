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
