// Mock data for development without Supabase
// Replace with real database calls once Supabase is configured

import type { AssetType, Criticality, RiskLevel, TreatmentType, StatusType, ImplementationStatus, ControlTheme } from '@/types/database'

export interface MockAsset {
  id: string
  name: string
  asset_type: AssetType
  description: string | null
  owner_id: string | null
  owner_name?: string
  criticality: Criticality
  in_scope: boolean
  created_at: string
  updated_at: string
}

export interface MockRisk {
  id: string
  asset_id: string | null
  asset_name?: string
  threat: string
  vulnerability: string | null
  impact: RiskLevel
  likelihood: RiskLevel
  risk_level: RiskLevel
  treatment: TreatmentType
  treatment_plan: string | null
  status: StatusType
  owner_id: string | null
  owner_name?: string
  approved_by: string | null
  approved_at: string | null
  created_at: string
  updated_at: string
}

export interface MockControl {
  id: string
  control_id: string
  name: string
  intent: string
  theme: ControlTheme
  guidance: string | null
  // Organization-specific fields
  applicable: boolean
  justification: string | null
  implementation_status: ImplementationStatus
  owner_name?: string
}

export const mockAssets: MockAsset[] = [
  {
    id: '1',
    name: 'Production Database Server',
    asset_type: 'hardware',
    description: 'Primary PostgreSQL database hosting customer data',
    owner_id: '1',
    owner_name: 'John Smith',
    criticality: 'critical',
    in_scope: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Customer Data',
    asset_type: 'data',
    description: 'PII and account information for all customers',
    owner_id: '1',
    owner_name: 'John Smith',
    criticality: 'critical',
    in_scope: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '3',
    name: 'Google Workspace',
    asset_type: 'service',
    description: 'Email, documents, and collaboration platform',
    owner_id: '2',
    owner_name: 'Jane Doe',
    criticality: 'high',
    in_scope: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '4',
    name: 'Employee Laptops',
    asset_type: 'hardware',
    description: 'MacBook Pro devices issued to all employees',
    owner_id: '2',
    owner_name: 'Jane Doe',
    criticality: 'medium',
    in_scope: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '5',
    name: 'Development Team',
    asset_type: 'people',
    description: 'Software engineering team with access to source code',
    owner_id: '1',
    owner_name: 'John Smith',
    criticality: 'high',
    in_scope: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  }
]

export const mockRisks: MockRisk[] = [
  {
    id: '1',
    asset_id: '1',
    asset_name: 'Production Database Server',
    threat: 'Unauthorized access to database',
    vulnerability: 'Weak access controls and password policies',
    impact: 'high',
    likelihood: 'medium',
    risk_level: 'high',
    treatment: 'mitigate',
    treatment_plan: 'Implement MFA, rotate credentials, enable audit logging',
    status: 'approved',
    owner_id: '1',
    owner_name: 'John Smith',
    approved_by: '1',
    approved_at: '2024-01-20T14:00:00Z',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-20T14:00:00Z'
  },
  {
    id: '2',
    asset_id: '2',
    asset_name: 'Customer Data',
    threat: 'Data breach exposing customer PII',
    vulnerability: 'Insufficient encryption at rest',
    impact: 'high',
    likelihood: 'low',
    risk_level: 'medium',
    treatment: 'mitigate',
    treatment_plan: 'Enable encryption at rest, implement DLP controls',
    status: 'draft',
    owner_id: '1',
    owner_name: 'John Smith',
    approved_by: null,
    approved_at: null,
    created_at: '2024-01-16T10:00:00Z',
    updated_at: '2024-01-16T10:00:00Z'
  },
  {
    id: '3',
    asset_id: '4',
    asset_name: 'Employee Laptops',
    threat: 'Malware infection via phishing',
    vulnerability: 'Lack of endpoint protection',
    impact: 'medium',
    likelihood: 'high',
    risk_level: 'high',
    treatment: 'mitigate',
    treatment_plan: 'Deploy EDR solution, security awareness training',
    status: 'draft',
    owner_id: '2',
    owner_name: 'Jane Doe',
    approved_by: null,
    approved_at: null,
    created_at: '2024-01-17T10:00:00Z',
    updated_at: '2024-01-17T10:00:00Z'
  },
  {
    id: '4',
    asset_id: '3',
    asset_name: 'Google Workspace',
    threat: 'Account takeover',
    vulnerability: 'No MFA enforcement',
    impact: 'high',
    likelihood: 'medium',
    risk_level: 'high',
    treatment: 'mitigate',
    treatment_plan: 'Enforce MFA for all users, implement conditional access',
    status: 'approved',
    owner_id: '2',
    owner_name: 'Jane Doe',
    approved_by: '1',
    approved_at: '2024-01-22T09:00:00Z',
    created_at: '2024-01-18T10:00:00Z',
    updated_at: '2024-01-22T09:00:00Z'
  }
]

// Helper to calculate risk level from impact and likelihood
export function calculateRiskLevel(impact: RiskLevel, likelihood: RiskLevel): RiskLevel {
  const matrix: Record<RiskLevel, Record<RiskLevel, RiskLevel>> = {
    low: { low: 'low', medium: 'low', high: 'medium' },
    medium: { low: 'low', medium: 'medium', high: 'high' },
    high: { low: 'medium', medium: 'high', high: 'high' }
  }
  return matrix[impact][likelihood]
}

// Asset type labels
export const assetTypeLabels: Record<AssetType, string> = {
  hardware: 'Hardware',
  software: 'Software',
  data: 'Data',
  service: 'Service',
  people: 'People'
}

// Criticality labels and colors
export const criticalityConfig: Record<Criticality, { label: string; color: string }> = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-800' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-800' },
  critical: { label: 'Critical', color: 'bg-red-100 text-red-800' }
}

// Risk level labels and colors
export const riskLevelConfig: Record<RiskLevel, { label: string; color: string }> = {
  low: { label: 'Low', color: 'bg-green-100 text-green-800' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  high: { label: 'High', color: 'bg-red-100 text-red-800' }
}

// Treatment type labels
export const treatmentLabels: Record<TreatmentType, string> = {
  accept: 'Accept',
  mitigate: 'Mitigate',
  transfer: 'Transfer',
  avoid: 'Avoid'
}

// Status labels and colors
export const statusConfig: Record<StatusType, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800' }
}

// Evidence types
export type EvidenceType = 'policy' | 'procedure' | 'screenshot' | 'log' | 'report' | 'configuration' | 'certificate' | 'other'

export interface MockEvidence {
  id: string
  control_id: string
  control_name: string
  name: string
  description: string | null
  evidence_type: EvidenceType
  file_url: string | null
  stage_acceptable: 'stage_1' | 'stage_2' | 'both'
  uploaded_by: string
  uploaded_at: string
  verified: boolean
}

export const evidenceTypeLabels: Record<EvidenceType, string> = {
  policy: 'Policy Document',
  procedure: 'Procedure',
  screenshot: 'Screenshot',
  log: 'System Log',
  report: 'Report',
  configuration: 'Configuration',
  certificate: 'Certificate',
  other: 'Other'
}

export const evidenceTypeConfig: Record<EvidenceType, { label: string; color: string }> = {
  policy: { label: 'Policy', color: 'bg-blue-100 text-blue-800' },
  procedure: { label: 'Procedure', color: 'bg-purple-100 text-purple-800' },
  screenshot: { label: 'Screenshot', color: 'bg-cyan-100 text-cyan-800' },
  log: { label: 'Log', color: 'bg-gray-100 text-gray-800' },
  report: { label: 'Report', color: 'bg-green-100 text-green-800' },
  configuration: { label: 'Config', color: 'bg-orange-100 text-orange-800' },
  certificate: { label: 'Certificate', color: 'bg-yellow-100 text-yellow-800' },
  other: { label: 'Other', color: 'bg-gray-100 text-gray-800' }
}

export const stageConfig: Record<string, { label: string; color: string }> = {
  stage_1: { label: 'Stage 1', color: 'bg-blue-100 text-blue-800' },
  stage_2: { label: 'Stage 2', color: 'bg-purple-100 text-purple-800' },
  both: { label: 'Both Stages', color: 'bg-green-100 text-green-800' }
}

export const mockEvidence: MockEvidence[] = [
  {
    id: '1',
    control_id: 'A.5.1',
    control_name: 'Policies for information security',
    name: 'Information Security Policy v2.1',
    description: 'Master information security policy approved by management',
    evidence_type: 'policy',
    file_url: '/docs/information-security-policy.pdf',
    stage_acceptable: 'both',
    uploaded_by: 'John Smith',
    uploaded_at: '2024-01-10T09:00:00Z',
    verified: true
  },
  {
    id: '2',
    control_id: 'A.5.2',
    control_name: 'Information security roles and responsibilities',
    name: 'RACI Matrix - Security Roles',
    description: 'Responsibility assignment matrix for security functions',
    evidence_type: 'procedure',
    file_url: '/docs/security-raci.xlsx',
    stage_acceptable: 'stage_1',
    uploaded_by: 'Jane Doe',
    uploaded_at: '2024-01-12T14:30:00Z',
    verified: true
  },
  {
    id: '3',
    control_id: 'A.5.15',
    control_name: 'Access control',
    name: 'Access Control Policy',
    description: 'Policy governing access to information systems',
    evidence_type: 'policy',
    file_url: '/docs/access-control-policy.pdf',
    stage_acceptable: 'both',
    uploaded_by: 'John Smith',
    uploaded_at: '2024-01-15T10:00:00Z',
    verified: true
  },
  {
    id: '4',
    control_id: 'A.5.15',
    control_name: 'Access control',
    name: 'Google Workspace Admin Console - Access Settings',
    description: 'Screenshot showing MFA and access controls enabled',
    evidence_type: 'screenshot',
    file_url: '/evidence/gws-admin-settings.png',
    stage_acceptable: 'stage_2',
    uploaded_by: 'Jane Doe',
    uploaded_at: '2024-01-18T11:00:00Z',
    verified: false
  },
  {
    id: '5',
    control_id: 'A.6.1',
    control_name: 'Screening',
    name: 'Background Check Procedure',
    description: 'HR procedure for employee screening',
    evidence_type: 'procedure',
    file_url: '/docs/background-check-procedure.pdf',
    stage_acceptable: 'stage_1',
    uploaded_by: 'HR Team',
    uploaded_at: '2024-01-08T16:00:00Z',
    verified: true
  },
  {
    id: '6',
    control_id: 'A.8.5',
    control_name: 'Secure authentication',
    name: 'MFA Enforcement Report',
    description: 'Report showing 100% MFA enrollment',
    evidence_type: 'report',
    file_url: '/evidence/mfa-report.pdf',
    stage_acceptable: 'stage_2',
    uploaded_by: 'IT Team',
    uploaded_at: '2024-01-20T09:30:00Z',
    verified: true
  },
  {
    id: '7',
    control_id: 'A.8.13',
    control_name: 'Information backup',
    name: 'Backup Configuration - Production DB',
    description: 'AWS RDS automated backup configuration',
    evidence_type: 'configuration',
    file_url: '/evidence/rds-backup-config.json',
    stage_acceptable: 'stage_2',
    uploaded_by: 'DevOps',
    uploaded_at: '2024-01-22T08:00:00Z',
    verified: true
  },
  {
    id: '8',
    control_id: 'A.8.24',
    control_name: 'Use of cryptography',
    name: 'SSL Certificate - Production',
    description: 'TLS 1.3 certificate for production domain',
    evidence_type: 'certificate',
    file_url: '/evidence/ssl-cert.pem',
    stage_acceptable: 'stage_2',
    uploaded_by: 'DevOps',
    uploaded_at: '2024-01-25T10:00:00Z',
    verified: true
  }
]
