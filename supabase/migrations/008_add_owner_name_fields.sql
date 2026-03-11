-- Add owner_name text column to assets, organization_controls, and corrective_actions
ALTER TABLE assets ADD COLUMN IF NOT EXISTS owner_name TEXT;
ALTER TABLE organization_controls ADD COLUMN IF NOT EXISTS owner_name TEXT;
ALTER TABLE corrective_actions ADD COLUMN IF NOT EXISTS owner_name TEXT;
