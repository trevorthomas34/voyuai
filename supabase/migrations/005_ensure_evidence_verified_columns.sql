-- Ensure verified_by and verified_at columns exist on evidence table
-- This is a safe no-op if columns already exist from migration 004
ALTER TABLE evidence
  ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- Ensure get_current_user_role function exists
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT role
        FROM users
        WHERE auth_user_id = auth.uid()
    );
END;
$$ language 'plpgsql' SECURITY DEFINER;
