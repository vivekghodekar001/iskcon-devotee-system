-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Devotees Table
create table if not exists devotees (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  spiritual_name text,
  email text,
  phone text,
  photo text,
  status text check (status in ('Shelter', 'Aspirant', 'First Initiated', 'Second Initiated', 'Uninitiated')),
  joined_at timestamp with time zone default now(),
  hobbies text,
  daily_malas int default 0
);

-- Sessions Table
create table if not exists sessions (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  date timestamp with time zone not null,
  location text,
  facilitator text,
  attendee_ids text[] default '{}'
);

-- Notifications Table
create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  message text,
  timestamp timestamp with time zone default now(),
  is_read boolean default false,
  type text check (type in ('quote', 'system'))
);

-- Kitchen Inventory Table
create table if not exists kitchen_inventory (
  id uuid primary key default uuid_generate_v4(),
  item_name text not null,
  quantity float default 0,
  unit text not null,
  min_threshold float default 0,
  category text,
  last_updated timestamp with time zone default now()
);

-- Meal Plans Table
create table if not exists meal_plans (
  id uuid primary key default uuid_generate_v4(),
  date date not null,
  meal_type text check (meal_type in ('Breakfast', 'Lunch', 'Dinner')),
  items text[] default '{}',
  chef_name text
);

-- Account Transactions Table (Treasury)
create table if not exists account_transactions (
  id uuid primary key default uuid_generate_v4(),
  date timestamp with time zone default now(),
  type text check (type in ('income', 'expense')),
  category text,
  amount float not null,
  description text,
  payment_method text
);

-- SAFETY: Disable RLS on all tables to prevent "Authorization Failed" errors for now.
-- You can enable these later when you have proper auth policies set up.
alter table devotees disable row level security;
alter table sessions disable row level security;
alter table notifications disable row level security;
alter table kitchen_inventory disable row level security;
alter table meal_plans disable row level security;
alter table account_transactions disable row level security;
