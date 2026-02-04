export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Enum types
export type UserRole = 'admin' | 'contributor' | 'voyu_consultant' | 'auditor'
export type AssetType = 'hardware' | 'software' | 'data' | 'service' | 'people'
export type Criticality = 'low' | 'medium' | 'high' | 'critical'
export type RiskLevel = 'low' | 'medium' | 'high'
export type TreatmentType = 'accept' | 'mitigate' | 'transfer' | 'avoid'
export type StatusType = 'draft' | 'approved'
export type ImplementationStatus = 'implemented' | 'partial' | 'gap' | 'not_applicable'
export type AuditStage = 'stage_1' | 'stage_2' | 'both'
export type CorrectiveActionSource = 'audit' | 'incident' | 'review'
export type ApprovalObjectType = 'risk' | 'scope' | 'policy' | 'soa' | 'control'
export type ControlTheme = 'organizational' | 'people' | 'physical' | 'technological'

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          industry: string | null
          headcount: number | null
          geography: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          industry?: string | null
          headcount?: number | null
          geography?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          industry?: string | null
          headcount?: number | null
          geography?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          auth_user_id: string
          organization_id: string
          email: string
          full_name: string | null
          role: UserRole
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth_user_id: string
          organization_id: string
          email: string
          full_name?: string | null
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auth_user_id?: string
          organization_id?: string
          email?: string
          full_name?: string | null
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
      }
      isms_scopes: {
        Row: {
          id: string
          organization_id: string
          scope_statement: string
          boundaries: Json | null
          exclusions: string | null
          interested_parties: Json | null
          regulatory_requirements: Json | null
          approved_by: string | null
          approved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          scope_statement: string
          boundaries?: Json | null
          exclusions?: string | null
          interested_parties?: Json | null
          regulatory_requirements?: Json | null
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          scope_statement?: string
          boundaries?: Json | null
          exclusions?: string | null
          interested_parties?: Json | null
          regulatory_requirements?: Json | null
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      assets: {
        Row: {
          id: string
          organization_id: string
          name: string
          asset_type: AssetType
          description: string | null
          owner_id: string | null
          criticality: Criticality
          in_scope: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          asset_type: AssetType
          description?: string | null
          owner_id?: string | null
          criticality?: Criticality
          in_scope?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          asset_type?: AssetType
          description?: string | null
          owner_id?: string | null
          criticality?: Criticality
          in_scope?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      risks: {
        Row: {
          id: string
          organization_id: string
          asset_id: string | null
          threat: string
          vulnerability: string | null
          impact: RiskLevel
          likelihood: RiskLevel
          risk_level: RiskLevel
          treatment: TreatmentType
          treatment_plan: string | null
          status: StatusType
          owner_id: string | null
          approved_by: string | null
          approved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          asset_id?: string | null
          threat: string
          vulnerability?: string | null
          impact: RiskLevel
          likelihood: RiskLevel
          risk_level: RiskLevel
          treatment?: TreatmentType
          treatment_plan?: string | null
          status?: StatusType
          owner_id?: string | null
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          asset_id?: string | null
          threat?: string
          vulnerability?: string | null
          impact?: RiskLevel
          likelihood?: RiskLevel
          risk_level?: RiskLevel
          treatment?: TreatmentType
          treatment_plan?: string | null
          status?: StatusType
          owner_id?: string | null
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      controls: {
        Row: {
          id: string
          control_id: string
          name: string
          intent: string
          theme: ControlTheme
          guidance: string | null
          created_at: string
        }
        Insert: {
          id?: string
          control_id: string
          name: string
          intent: string
          theme: ControlTheme
          guidance?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          control_id?: string
          name?: string
          intent?: string
          theme?: ControlTheme
          guidance?: string | null
          created_at?: string
        }
      }
      organization_controls: {
        Row: {
          id: string
          organization_id: string
          control_id: string
          applicable: boolean
          justification: string | null
          implementation_status: ImplementationStatus
          owner_id: string | null
          last_reviewed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          control_id: string
          applicable?: boolean
          justification?: string | null
          implementation_status?: ImplementationStatus
          owner_id?: string | null
          last_reviewed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          control_id?: string
          applicable?: boolean
          justification?: string | null
          implementation_status?: ImplementationStatus
          owner_id?: string | null
          last_reviewed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      risk_control_mappings: {
        Row: {
          id: string
          risk_id: string
          control_id: string
          created_at: string
        }
        Insert: {
          id?: string
          risk_id: string
          control_id: string
          created_at?: string
        }
        Update: {
          id?: string
          risk_id?: string
          control_id?: string
          created_at?: string
        }
      }
      policies: {
        Row: {
          id: string
          organization_id: string
          title: string
          version: string
          content: string | null
          google_doc_url: string | null
          status: StatusType
          approved_by: string | null
          approved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          title: string
          version?: string
          content?: string | null
          google_doc_url?: string | null
          status?: StatusType
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          title?: string
          version?: string
          content?: string | null
          google_doc_url?: string | null
          status?: StatusType
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      policy_control_mappings: {
        Row: {
          id: string
          policy_id: string
          control_id: string
          created_at: string
        }
        Insert: {
          id?: string
          policy_id: string
          control_id: string
          created_at?: string
        }
        Update: {
          id?: string
          policy_id?: string
          control_id?: string
          created_at?: string
        }
      }
      evidence: {
        Row: {
          id: string
          organization_id: string
          control_id: string
          title: string
          description: string | null
          evidence_type: string
          evidence_url: string
          stage_acceptable: AuditStage
          uploaded_by: string
          uploaded_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          control_id: string
          title: string
          description?: string | null
          evidence_type: string
          evidence_url: string
          stage_acceptable?: AuditStage
          uploaded_by: string
          uploaded_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          control_id?: string
          title?: string
          description?: string | null
          evidence_type?: string
          evidence_url?: string
          stage_acceptable?: AuditStage
          uploaded_by?: string
          uploaded_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      soa_records: {
        Row: {
          id: string
          organization_id: string
          control_id: string
          applicable: boolean
          justification: string
          linked_risks: string[] | null
          linked_evidence: string[] | null
          locked_for_audit: boolean
          locked_by: string | null
          locked_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          control_id: string
          applicable?: boolean
          justification: string
          linked_risks?: string[] | null
          linked_evidence?: string[] | null
          locked_for_audit?: boolean
          locked_by?: string | null
          locked_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          control_id?: string
          applicable?: boolean
          justification?: string
          linked_risks?: string[] | null
          linked_evidence?: string[] | null
          locked_for_audit?: boolean
          locked_by?: string | null
          locked_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      corrective_actions: {
        Row: {
          id: string
          organization_id: string
          source: CorrectiveActionSource
          finding: string
          root_cause: string | null
          action: string
          owner_id: string | null
          due_date: string | null
          status: StatusType
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          source: CorrectiveActionSource
          finding: string
          root_cause?: string | null
          action: string
          owner_id?: string | null
          due_date?: string | null
          status?: StatusType
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          source?: CorrectiveActionSource
          finding?: string
          root_cause?: string | null
          action?: string
          owner_id?: string | null
          due_date?: string | null
          status?: StatusType
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      approval_logs: {
        Row: {
          id: string
          organization_id: string
          object_type: ApprovalObjectType
          object_id: string
          action: string
          approved_by: string
          approved_at: string
          comment: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          organization_id: string
          object_type: ApprovalObjectType
          object_id: string
          action: string
          approved_by: string
          approved_at?: string
          comment?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          organization_id?: string
          object_type?: ApprovalObjectType
          object_id?: string
          action?: string
          approved_by?: string
          approved_at?: string
          comment?: string | null
          metadata?: Json | null
        }
      }
      intake_responses: {
        Row: {
          id: string
          organization_id: string
          question_key: string
          response: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          question_key: string
          response: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          question_key?: string
          response?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: UserRole
      asset_type: AssetType
      criticality: Criticality
      risk_level: RiskLevel
      treatment_type: TreatmentType
      status_type: StatusType
      implementation_status: ImplementationStatus
      audit_stage: AuditStage
      corrective_action_source: CorrectiveActionSource
      approval_object_type: ApprovalObjectType
      control_theme: ControlTheme
    }
  }
}

// Helper types for easier usage
export type Organization = Database['public']['Tables']['organizations']['Row']
export type User = Database['public']['Tables']['users']['Row']
export type ISMSScope = Database['public']['Tables']['isms_scopes']['Row']
export type Asset = Database['public']['Tables']['assets']['Row']
export type Risk = Database['public']['Tables']['risks']['Row']
export type Control = Database['public']['Tables']['controls']['Row']
export type OrganizationControl = Database['public']['Tables']['organization_controls']['Row']
export type Policy = Database['public']['Tables']['policies']['Row']
export type Evidence = Database['public']['Tables']['evidence']['Row']
export type SoARecord = Database['public']['Tables']['soa_records']['Row']
export type CorrectiveAction = Database['public']['Tables']['corrective_actions']['Row']
export type ApprovalLog = Database['public']['Tables']['approval_logs']['Row']
export type IntakeResponse = Database['public']['Tables']['intake_responses']['Row']

// Insert types
export type OrganizationInsert = Database['public']['Tables']['organizations']['Insert']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type ISMSScopeInsert = Database['public']['Tables']['isms_scopes']['Insert']
export type AssetInsert = Database['public']['Tables']['assets']['Insert']
export type RiskInsert = Database['public']['Tables']['risks']['Insert']
export type ControlInsert = Database['public']['Tables']['controls']['Insert']
export type OrganizationControlInsert = Database['public']['Tables']['organization_controls']['Insert']
export type PolicyInsert = Database['public']['Tables']['policies']['Insert']
export type EvidenceInsert = Database['public']['Tables']['evidence']['Insert']
export type SoARecordInsert = Database['public']['Tables']['soa_records']['Insert']
export type CorrectiveActionInsert = Database['public']['Tables']['corrective_actions']['Insert']
export type ApprovalLogInsert = Database['public']['Tables']['approval_logs']['Insert']
export type IntakeResponseInsert = Database['public']['Tables']['intake_responses']['Insert']
