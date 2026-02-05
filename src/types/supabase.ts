// Generated types for Supabase database
// Based on schema in supabase/migrations/001_initial_schema.sql

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
          role: 'admin' | 'contributor' | 'voyu_consultant' | 'auditor'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth_user_id: string
          organization_id: string
          email: string
          full_name?: string | null
          role?: 'admin' | 'contributor' | 'voyu_consultant' | 'auditor'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auth_user_id?: string
          organization_id?: string
          email?: string
          full_name?: string | null
          role?: 'admin' | 'contributor' | 'voyu_consultant' | 'auditor'
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
          asset_type: 'hardware' | 'software' | 'data' | 'service' | 'people'
          description: string | null
          owner_id: string | null
          criticality: 'low' | 'medium' | 'high' | 'critical'
          in_scope: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          asset_type: 'hardware' | 'software' | 'data' | 'service' | 'people'
          description?: string | null
          owner_id?: string | null
          criticality?: 'low' | 'medium' | 'high' | 'critical'
          in_scope?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          asset_type?: 'hardware' | 'software' | 'data' | 'service' | 'people'
          description?: string | null
          owner_id?: string | null
          criticality?: 'low' | 'medium' | 'high' | 'critical'
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
          impact: 'low' | 'medium' | 'high'
          likelihood: 'low' | 'medium' | 'high'
          risk_level: 'low' | 'medium' | 'high'
          treatment: 'accept' | 'mitigate' | 'transfer' | 'avoid'
          treatment_plan: string | null
          status: 'draft' | 'approved'
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
          impact: 'low' | 'medium' | 'high'
          likelihood: 'low' | 'medium' | 'high'
          risk_level: 'low' | 'medium' | 'high'
          treatment?: 'accept' | 'mitigate' | 'transfer' | 'avoid'
          treatment_plan?: string | null
          status?: 'draft' | 'approved'
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
          impact?: 'low' | 'medium' | 'high'
          likelihood?: 'low' | 'medium' | 'high'
          risk_level?: 'low' | 'medium' | 'high'
          treatment?: 'accept' | 'mitigate' | 'transfer' | 'avoid'
          treatment_plan?: string | null
          status?: 'draft' | 'approved'
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
          theme: 'organizational' | 'people' | 'physical' | 'technological'
          guidance: string | null
          created_at: string
        }
        Insert: {
          id?: string
          control_id: string
          name: string
          intent: string
          theme: 'organizational' | 'people' | 'physical' | 'technological'
          guidance?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          control_id?: string
          name?: string
          intent?: string
          theme?: 'organizational' | 'people' | 'physical' | 'technological'
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
          implementation_status: 'implemented' | 'partial' | 'gap' | 'not_applicable'
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
          implementation_status?: 'implemented' | 'partial' | 'gap' | 'not_applicable'
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
          implementation_status?: 'implemented' | 'partial' | 'gap' | 'not_applicable'
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
          status: 'draft' | 'approved'
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
          status?: 'draft' | 'approved'
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
          status?: 'draft' | 'approved'
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
          stage_acceptable: 'stage_1' | 'stage_2' | 'both'
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
          stage_acceptable?: 'stage_1' | 'stage_2' | 'both'
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
          stage_acceptable?: 'stage_1' | 'stage_2' | 'both'
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
          source: 'audit' | 'incident' | 'review'
          finding: string
          root_cause: string | null
          action: string
          owner_id: string | null
          due_date: string | null
          status: 'draft' | 'approved'
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          source: 'audit' | 'incident' | 'review'
          finding: string
          root_cause?: string | null
          action: string
          owner_id?: string | null
          due_date?: string | null
          status?: 'draft' | 'approved'
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          source?: 'audit' | 'incident' | 'review'
          finding?: string
          root_cause?: string | null
          action?: string
          owner_id?: string | null
          due_date?: string | null
          status?: 'draft' | 'approved'
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      approval_logs: {
        Row: {
          id: string
          organization_id: string
          object_type: 'risk' | 'scope' | 'policy' | 'soa' | 'control'
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
          object_type: 'risk' | 'scope' | 'policy' | 'soa' | 'control'
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
          object_type?: 'risk' | 'scope' | 'policy' | 'soa' | 'control'
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
      get_user_organization_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      approval_object_type: 'risk' | 'scope' | 'policy' | 'soa' | 'control'
      asset_type: 'hardware' | 'software' | 'data' | 'service' | 'people'
      audit_stage: 'stage_1' | 'stage_2' | 'both'
      control_theme: 'organizational' | 'people' | 'physical' | 'technological'
      corrective_action_source: 'audit' | 'incident' | 'review'
      criticality: 'low' | 'medium' | 'high' | 'critical'
      implementation_status: 'implemented' | 'partial' | 'gap' | 'not_applicable'
      risk_level: 'low' | 'medium' | 'high'
      status_type: 'draft' | 'approved'
      treatment_type: 'accept' | 'mitigate' | 'transfer' | 'avoid'
      user_role: 'admin' | 'contributor' | 'voyu_consultant' | 'auditor'
    }
  }
}

// Helper types for easier usage
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Convenience type aliases
export type Organization = Tables<'organizations'>
export type User = Tables<'users'>
export type ISMSScope = Tables<'isms_scopes'>
export type Asset = Tables<'assets'>
export type Risk = Tables<'risks'>
export type Control = Tables<'controls'>
export type OrganizationControl = Tables<'organization_controls'>
export type Policy = Tables<'policies'>
export type Evidence = Tables<'evidence'>
export type SoARecord = Tables<'soa_records'>
export type CorrectiveAction = Tables<'corrective_actions'>
export type ApprovalLog = Tables<'approval_logs'>
export type IntakeResponse = Tables<'intake_responses'>
