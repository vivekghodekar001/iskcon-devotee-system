-- FIX PERMISSIONS (RLS)
-- If Row Level Security is enabled, it might block you from creating profiles/sessions if you are not the "owner".
-- For this app to work simply as an Admin System, we will disable RLS for now.

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE homework DISABLE ROW LEVEL SECURITY;
ALTER TABLE resources DISABLE ROW LEVEL SECURITY;

-- Also ensuring the ID column in profiles is not strictly tied to Auth (Foreign Key)
-- so you can manually add devotees without them logging in.
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

NOTIFY pgrst, 'reload config';
