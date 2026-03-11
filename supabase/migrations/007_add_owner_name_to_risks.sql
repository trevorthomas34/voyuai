-- Add owner_name text column to risks for free-text risk owner entry
ALTER TABLE risks ADD COLUMN IF NOT EXISTS owner_name TEXT;
