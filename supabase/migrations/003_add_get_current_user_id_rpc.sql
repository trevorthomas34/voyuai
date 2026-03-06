-- Helper function to get current user's internal ID from the users table
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT id
        FROM users
        WHERE auth_user_id = auth.uid()
    );
END;
$$ language 'plpgsql' SECURITY DEFINER;
