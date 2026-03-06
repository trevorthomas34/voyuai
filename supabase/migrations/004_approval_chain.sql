-- Add 'evidence' to approval_object_type enum
ALTER TYPE approval_object_type ADD VALUE IF NOT EXISTS 'evidence';

-- Add verification fields to evidence table
ALTER TABLE evidence
  ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- Helper function to get current user's role
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
