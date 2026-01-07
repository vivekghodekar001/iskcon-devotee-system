-- Enable UUID extension
create extension if not exists "uuid-ossp";



-- Student Profiles (Extended)
create table if not exists profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid, -- Link to auth.users if we use Supabase Auth later
  name text not null,
  spiritual_name text,
  email text,
  phone text,
  photo_url text,
  
  -- Personal Info
  dob date,
  native_place text,
  current_address text,
  branch text, -- e.g. Pune, Mumbai
  year_of_study text, -- e.g. FE, SE, TE, BE
  
  -- Spiritual Info
  intro_video_url text,
  hobbies text[],
  skills text[],
  goals text,
  interests text[],
  
  -- System Info
  role text default 'student' check (role in ('student', 'admin', 'mentor')),
  category text default 'Regular' check (category in ('Favourite', 'Regular', 'Sankalpa', 'Guest', 'Volunteer', 'Advanced seeker')),
  mentor_id uuid references profiles(id),
  
  created_at timestamp with time zone default now()
);

-- Notifications Table (Keep existing)
create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  message text,
  timestamp timestamp with time zone default now(),
  is_read boolean default false,
  type text check (type in ('quote', 'system'))
);

-- Sessions Table (Updated for ERP)
create table if not exists sessions (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  date timestamp with time zone not null,
  location text,
  facilitator text,
  type text default 'Regular' check (type in ('Regular', 'Camp', 'Event', 'Special')),
  status text default 'Upcoming' check (status in ('Upcoming', 'Ongoing', 'Completed')),
  attendee_ids text[] default '{}' 
);

-- Homework & Assignments
create table if not exists homework (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references sessions(id),
  title text not null,
  description text,
  file_url text, -- PDF/Doc link
  due_date timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Student Submissions
create table if not exists submissions (
  id uuid primary key default uuid_generate_v4(),
  homework_id uuid references homework(id),
  student_id uuid references profiles(id),
  file_url text,
  status text default 'Pending' check (status in ('Pending', 'Submitted', 'Graded')),
  marks int,
  feedback text,
  submitted_at timestamp with time zone default now()
);

-- Resources / Gallery
create table if not exists resources (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  type text check (type in ('book', 'photo', 'video', 'lecture')),
  category text, -- e.g. 'Scripture', 'Event 2024'
  url text not null,
  thumbnail_url text,
  created_at timestamp with time zone default now()
);

-- Mentorship Requests
create table if not exists mentorship_requests (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references profiles(id),
  mentor_id uuid references profiles(id),
  status text default 'Pending' check (status in ('Pending', 'Accepted', 'Rejected')),
  message text,
  created_at timestamp with time zone default now()
);

-- SAFETY: Disable RLS for now to avoid permission issues during dev
alter table profiles disable row level security;
alter table sessions disable row level security;
alter table notifications disable row level security;
alter table homework disable row level security;
alter table submissions disable row level security;
alter table resources disable row level security;
alter table mentorship_requests disable row level security;
