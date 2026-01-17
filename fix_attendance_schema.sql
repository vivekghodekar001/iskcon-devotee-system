
-- FIX ATTENDANCE SCHEMA
-- Ensure attendee_ids exists and is an ARRAY of TEXT (UUIDs)

ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS attendee_ids TEXT[] DEFAULT '{}';

-- In case it exists but with wrong type (optional safety, might fail if data exists but usually safe for text)
-- ALTER TABLE sessions ALTER COLUMN attendee_ids TYPE TEXT[] USING attendee_ids::TEXT[];

-- Ensure RLS allows updates to sessions
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;

-- Grant permissions again just to be safe
GRANT ALL ON TABLE sessions TO postgres, anon, authenticated;
