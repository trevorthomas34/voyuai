-- Voyu ISMS Database Schema
-- ISO 27001:2022 Compliance Management System
--
-- This migration creates all core tables for the ISMS with:
-- - Multi-tenant organization structure
-- - Row-level security (RLS) for data isolation
-- - Audit trail via approval_logs
-- - Immutable approval fields protected by triggers

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- ENUM TYPES
-- =============================================================================

CREATE TYPE user_role AS ENUM ('admin', 'contributor', 'voyu_consultant', 'auditor');
CREATE TYPE asset_type AS ENUM ('hardware', 'software', 'data', 'service', 'people');
CREATE TYPE criticality AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE treatment_type AS ENUM ('accept', 'mitigate', 'transfer', 'avoid');
CREATE TYPE status_type AS ENUM ('draft', 'approved');
CREATE TYPE implementation_status AS ENUM ('implemented', 'partial', 'gap', 'not_applicable');
CREATE TYPE audit_stage AS ENUM ('stage_1', 'stage_2', 'both');
CREATE TYPE corrective_action_source AS ENUM ('audit', 'incident', 'review');
CREATE TYPE approval_object_type AS ENUM ('risk', 'scope', 'policy', 'soa', 'control');
CREATE TYPE control_theme AS ENUM ('organizational', 'people', 'physical', 'technological');

-- =============================================================================
-- CORE TABLES
-- =============================================================================

-- Organizations (tenant boundary)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    industry TEXT,
    headcount INTEGER,
    geography TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Users (linked to Supabase Auth)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID NOT NULL UNIQUE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role user_role NOT NULL DEFAULT 'contributor',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX idx_users_organization_id ON users(organization_id);

-- ISMS Scope
CREATE TABLE isms_scopes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    scope_statement TEXT NOT NULL,
    boundaries JSONB, -- { physical: [], logical: [], organizational: [] }
    exclusions TEXT,
    interested_parties JSONB, -- [{ name, expectations, requirements }]
    regulatory_requirements JSONB, -- [{ regulation, description, applicable }]
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id) -- One scope per organization
);

-- Assets (first-class entity)
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    asset_type asset_type NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES users(id),
    criticality criticality NOT NULL DEFAULT 'medium',
    in_scope BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_assets_organization_id ON assets(organization_id);

-- Risks
CREATE TABLE risks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
    threat TEXT NOT NULL,
    vulnerability TEXT,
    impact risk_level NOT NULL,
    likelihood risk_level NOT NULL,
    risk_level risk_level NOT NULL,
    treatment treatment_type NOT NULL DEFAULT 'mitigate',
    treatment_plan TEXT,
    status status_type NOT NULL DEFAULT 'draft',
    owner_id UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_risks_organization_id ON risks(organization_id);
CREATE INDEX idx_risks_asset_id ON risks(asset_id);

-- Controls (ISO 27001:2022 Annex A - shared across all organizations)
CREATE TABLE controls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    control_id TEXT NOT NULL UNIQUE, -- e.g., "A.5.1"
    name TEXT NOT NULL,
    intent TEXT NOT NULL, -- Control objective/purpose
    theme control_theme NOT NULL,
    guidance TEXT, -- Implementation guidance
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_controls_control_id ON controls(control_id);
CREATE INDEX idx_controls_theme ON controls(theme);

-- Organization-specific control configurations
CREATE TABLE organization_controls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    control_id UUID NOT NULL REFERENCES controls(id) ON DELETE CASCADE,
    applicable BOOLEAN NOT NULL DEFAULT true,
    justification TEXT, -- Why applicable or not
    implementation_status implementation_status NOT NULL DEFAULT 'gap',
    owner_id UUID REFERENCES users(id),
    last_reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, control_id)
);

CREATE INDEX idx_org_controls_organization_id ON organization_controls(organization_id);

-- Risk to Control mappings (many-to-many)
CREATE TABLE risk_control_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    risk_id UUID NOT NULL REFERENCES risks(id) ON DELETE CASCADE,
    control_id UUID NOT NULL REFERENCES controls(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(risk_id, control_id)
);

-- Policies
CREATE TABLE policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    version TEXT NOT NULL DEFAULT '1.0',
    content TEXT, -- Policy content if stored locally
    google_doc_url TEXT, -- Link to Google Doc
    status status_type NOT NULL DEFAULT 'draft',
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_policies_organization_id ON policies(organization_id);

-- Policy to Control mappings (many-to-many)
CREATE TABLE policy_control_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    control_id UUID NOT NULL REFERENCES controls(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(policy_id, control_id)
);

-- Evidence
CREATE TABLE evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    control_id UUID NOT NULL REFERENCES controls(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    evidence_type TEXT NOT NULL, -- screenshot, document, log, etc.
    evidence_url TEXT NOT NULL, -- Google Drive URL
    stage_acceptable audit_stage NOT NULL DEFAULT 'both',
    uploaded_by UUID NOT NULL REFERENCES users(id),
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_evidence_organization_id ON evidence(organization_id);
CREATE INDEX idx_evidence_control_id ON evidence(control_id);

-- Statement of Applicability records
CREATE TABLE soa_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    control_id UUID NOT NULL REFERENCES controls(id) ON DELETE CASCADE,
    applicable BOOLEAN NOT NULL DEFAULT true,
    justification TEXT NOT NULL,
    linked_risks UUID[], -- Array of risk IDs
    linked_evidence UUID[], -- Array of evidence IDs
    locked_for_audit BOOLEAN NOT NULL DEFAULT false,
    locked_by UUID REFERENCES users(id),
    locked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, control_id)
);

CREATE INDEX idx_soa_records_organization_id ON soa_records(organization_id);

-- Corrective Actions
CREATE TABLE corrective_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    source corrective_action_source NOT NULL,
    finding TEXT NOT NULL,
    root_cause TEXT,
    action TEXT NOT NULL,
    owner_id UUID REFERENCES users(id),
    due_date DATE,
    status status_type NOT NULL DEFAULT 'draft',
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_corrective_actions_organization_id ON corrective_actions(organization_id);

-- Approval Log (immutable audit trail)
CREATE TABLE approval_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    object_type approval_object_type NOT NULL,
    object_id UUID NOT NULL,
    action TEXT NOT NULL, -- 'approved', 'rejected', 'locked', etc.
    approved_by UUID NOT NULL REFERENCES users(id),
    approved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    comment TEXT,
    metadata JSONB -- Additional context
);

CREATE INDEX idx_approval_logs_organization_id ON approval_logs(organization_id);
CREATE INDEX idx_approval_logs_object ON approval_logs(object_type, object_id);

-- Intake Responses (stores questionnaire answers)
CREATE TABLE intake_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    question_key TEXT NOT NULL,
    response JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, question_key)
);

CREATE INDEX idx_intake_responses_organization_id ON intake_responses(organization_id);

-- =============================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables with updated_at column
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_isms_scopes_updated_at BEFORE UPDATE ON isms_scopes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_risks_updated_at BEFORE UPDATE ON risks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organization_controls_updated_at BEFORE UPDATE ON organization_controls
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_policies_updated_at BEFORE UPDATE ON policies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evidence_updated_at BEFORE UPDATE ON evidence
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_soa_records_updated_at BEFORE UPDATE ON soa_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_corrective_actions_updated_at BEFORE UPDATE ON corrective_actions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_intake_responses_updated_at BEFORE UPDATE ON intake_responses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- PROTECTION TRIGGERS (AI cannot set approval fields)
-- =============================================================================

-- Function to prevent AI from setting approval fields
-- This enforces the "AI drafts, humans approve" guardrail
CREATE OR REPLACE FUNCTION protect_approval_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if this is an API call (not from a human session)
    -- The 'app.is_human_action' setting should be set by the app when a human approves
    IF current_setting('app.is_human_action', true) IS DISTINCT FROM 'true' THEN
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

-- Apply protection to tables with approval fields
CREATE TRIGGER protect_isms_scopes_approval BEFORE UPDATE ON isms_scopes
    FOR EACH ROW EXECUTE FUNCTION protect_approval_fields();

CREATE TRIGGER protect_risks_approval BEFORE UPDATE ON risks
    FOR EACH ROW EXECUTE FUNCTION protect_approval_fields();

CREATE TRIGGER protect_policies_approval BEFORE UPDATE ON policies
    FOR EACH ROW EXECUTE FUNCTION protect_approval_fields();

-- Protection for SoA lock fields
CREATE OR REPLACE FUNCTION protect_soa_lock_fields()
RETURNS TRIGGER AS $$
BEGIN
    IF current_setting('app.is_human_action', true) IS DISTINCT FROM 'true' THEN
        IF OLD.locked_for_audit = false AND NEW.locked_for_audit = true THEN
            RAISE EXCEPTION 'SoA can only be locked through human action';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER protect_soa_records_lock BEFORE UPDATE ON soa_records
    FOR EACH ROW EXECUTE FUNCTION protect_soa_lock_fields();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE isms_scopes ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_control_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_control_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE soa_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE corrective_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_responses ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's organization
CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT organization_id
        FROM users
        WHERE auth_user_id = auth.uid()
    );
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Organizations: Users can only see their own organization
CREATE POLICY "Users can view own organization" ON organizations
    FOR SELECT USING (id = get_user_organization_id());

CREATE POLICY "Admins can update own organization" ON organizations
    FOR UPDATE USING (
        id = get_user_organization_id()
        AND EXISTS (
            SELECT 1 FROM users
            WHERE auth_user_id = auth.uid()
            AND role IN ('admin', 'voyu_consultant')
        )
    );

-- Users: Can see users in same organization
CREATE POLICY "Users can view organization members" ON users
    FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage organization members" ON users
    FOR ALL USING (
        organization_id = get_user_organization_id()
        AND EXISTS (
            SELECT 1 FROM users
            WHERE auth_user_id = auth.uid()
            AND role IN ('admin', 'voyu_consultant')
        )
    );

-- Generic org-scoped policies for most tables
CREATE POLICY "Org members can view isms_scopes" ON isms_scopes
    FOR SELECT USING (organization_id = get_user_organization_id());
CREATE POLICY "Org members can manage isms_scopes" ON isms_scopes
    FOR ALL USING (organization_id = get_user_organization_id());

CREATE POLICY "Org members can view assets" ON assets
    FOR SELECT USING (organization_id = get_user_organization_id());
CREATE POLICY "Org members can manage assets" ON assets
    FOR ALL USING (organization_id = get_user_organization_id());

CREATE POLICY "Org members can view risks" ON risks
    FOR SELECT USING (organization_id = get_user_organization_id());
CREATE POLICY "Org members can manage risks" ON risks
    FOR ALL USING (organization_id = get_user_organization_id());

-- Controls are global (shared across all orgs)
CREATE POLICY "Anyone can view controls" ON controls
    FOR SELECT USING (true);

CREATE POLICY "Only service role can manage controls" ON controls
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Org members can view organization_controls" ON organization_controls
    FOR SELECT USING (organization_id = get_user_organization_id());
CREATE POLICY "Org members can manage organization_controls" ON organization_controls
    FOR ALL USING (organization_id = get_user_organization_id());

CREATE POLICY "Org members can view risk_control_mappings" ON risk_control_mappings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM risks
            WHERE risks.id = risk_control_mappings.risk_id
            AND risks.organization_id = get_user_organization_id()
        )
    );
CREATE POLICY "Org members can manage risk_control_mappings" ON risk_control_mappings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM risks
            WHERE risks.id = risk_control_mappings.risk_id
            AND risks.organization_id = get_user_organization_id()
        )
    );

CREATE POLICY "Org members can view policies" ON policies
    FOR SELECT USING (organization_id = get_user_organization_id());
CREATE POLICY "Org members can manage policies" ON policies
    FOR ALL USING (organization_id = get_user_organization_id());

CREATE POLICY "Org members can view policy_control_mappings" ON policy_control_mappings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM policies
            WHERE policies.id = policy_control_mappings.policy_id
            AND policies.organization_id = get_user_organization_id()
        )
    );
CREATE POLICY "Org members can manage policy_control_mappings" ON policy_control_mappings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM policies
            WHERE policies.id = policy_control_mappings.policy_id
            AND policies.organization_id = get_user_organization_id()
        )
    );

CREATE POLICY "Org members can view evidence" ON evidence
    FOR SELECT USING (organization_id = get_user_organization_id());
CREATE POLICY "Org members can manage evidence" ON evidence
    FOR ALL USING (organization_id = get_user_organization_id());

CREATE POLICY "Org members can view soa_records" ON soa_records
    FOR SELECT USING (organization_id = get_user_organization_id());
CREATE POLICY "Org members can manage soa_records" ON soa_records
    FOR ALL USING (organization_id = get_user_organization_id());

CREATE POLICY "Org members can view corrective_actions" ON corrective_actions
    FOR SELECT USING (organization_id = get_user_organization_id());
CREATE POLICY "Org members can manage corrective_actions" ON corrective_actions
    FOR ALL USING (organization_id = get_user_organization_id());

CREATE POLICY "Org members can view approval_logs" ON approval_logs
    FOR SELECT USING (organization_id = get_user_organization_id());
CREATE POLICY "Org members can create approval_logs" ON approval_logs
    FOR INSERT WITH CHECK (organization_id = get_user_organization_id());
-- Approval logs should not be updated or deleted (immutable)

CREATE POLICY "Org members can view intake_responses" ON intake_responses
    FOR SELECT USING (organization_id = get_user_organization_id());
CREATE POLICY "Org members can manage intake_responses" ON intake_responses
    FOR ALL USING (organization_id = get_user_organization_id());

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE organizations IS 'Top-level tenant boundary. All objects roll up to an organization.';
COMMENT ON TABLE users IS 'Users linked to Supabase Auth with organization membership and roles.';
COMMENT ON TABLE isms_scopes IS 'ISMS scope statement and boundaries for an organization.';
COMMENT ON TABLE assets IS 'Information assets that are subject to risk assessment.';
COMMENT ON TABLE risks IS 'Risk register entries linked to assets with treatment decisions.';
COMMENT ON TABLE controls IS 'ISO 27001:2022 Annex A controls (shared reference data).';
COMMENT ON TABLE organization_controls IS 'Organization-specific control applicability and implementation status.';
COMMENT ON TABLE risk_control_mappings IS 'Maps risks to controls that mitigate them.';
COMMENT ON TABLE policies IS 'Policy documents with version tracking and approval workflow.';
COMMENT ON TABLE policy_control_mappings IS 'Maps policies to controls they address.';
COMMENT ON TABLE evidence IS 'Evidence artifacts linked to controls with audit stage classification.';
COMMENT ON TABLE soa_records IS 'Statement of Applicability records with traceability to risks and evidence.';
COMMENT ON TABLE corrective_actions IS 'Corrective action register for audit findings and incidents.';
COMMENT ON TABLE approval_logs IS 'Immutable audit trail of all approvals in the system.';
COMMENT ON TABLE intake_responses IS 'Stores responses from the intake questionnaire.';
