-- FINAL DB FIX: ENSURE HOMEWORK TABLE IS COMPLETE
-- Run this in Supabase SQL Editor

-- 1. FIX HOMEWORK TABLE (Crucial for Assignment Creation)
-- Adding created_at because the app tries to Sort by it (causes errors if missing)
ALTER TABLE homework 
ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS file_url text;

-- 2. FIX SESSIONS (Just in case)
ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS status text DEFAULT 'Upcoming';

-- 3. RELOAD
NOTIFY pgrst, 'reload config';
