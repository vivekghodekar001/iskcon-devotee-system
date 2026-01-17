-- COMPREHENSIVE DATABASE FIX SCRIPT
-- Run this in the Supabase SQL Editor to fix all missing column errors.

-- 1. FIX SESSIONS TABLE
ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'Upcoming',
ADD COLUMN IF NOT EXISTS type text DEFAULT 'Regular',
ADD COLUMN IF NOT EXISTS attendee_ids text[] DEFAULT '{}';

-- 2. FIX HOMEWORK TABLE
ALTER TABLE homework 
ADD COLUMN IF NOT EXISTS file_url text;

-- 3. FIX PROFILES TABLE (Important for Devotee Management)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS spiritual_name text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS photo_url text,
ADD COLUMN IF NOT EXISTS dob text,
ADD COLUMN IF NOT EXISTS native_place text,
ADD COLUMN IF NOT EXISTS current_address text,
ADD COLUMN IF NOT EXISTS branch text,
ADD COLUMN IF NOT EXISTS year_of_study text,
ADD COLUMN IF NOT EXISTS intro_video_url text,
ADD COLUMN IF NOT EXISTS hobbies text[],
ADD COLUMN IF NOT EXISTS skills text[],
ADD COLUMN IF NOT EXISTS goals text,
ADD COLUMN IF NOT EXISTS interests text[],
ADD COLUMN IF NOT EXISTS role text DEFAULT 'student',
ADD COLUMN IF NOT EXISTS category text DEFAULT 'Regular';

-- 4. Force schema cache reload
NOTIFY pgrst, 'reload config';
