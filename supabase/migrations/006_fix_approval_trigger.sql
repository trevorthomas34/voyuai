-- Fix protect_approval_fields trigger to allow server-side (service_role) approvals.
-- Server-side API routes use the admin/service_role client and are always human-initiated
-- (triggered by the user clicking Approve in the UI). The previous check only allowed
-- the app.is_human_action session variable, which cannot be set reliably across
-- stateless REST API calls.

CREATE OR REPLACE FUNCTION protect_approval_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- Allow if explicitly flagged as a human action OR if called via service_role
    -- (service_role = admin client used by server-side API routes, always human-initiated)
    IF current_setting('app.is_human_action', true) IS DISTINCT FROM 'true'
        AND auth.role() IS DISTINCT FROM 'service_role' THEN
        -- Prevent setting approved_by if not set before
        IF OLD.approved_by IS NULL AND NEW.approved_by IS NOT NULL THEN
            RAISE EXCEPTION 'Approval fields can only be set through human action';
        END IF;
        -- Prevent changing approved_at if not set before
        IF OLD.approved_at IS NULL AND NEW.approved_at IS NOT NULL THEN
            RAISE EXCEPTION 'Approval fields can only be set through human action';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';
