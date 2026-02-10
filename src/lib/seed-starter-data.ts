import type { SupabaseClient } from '@supabase/supabase-js'
import type { DraftISMSScope, AnnexAAssumption } from '@/lib/agents/intake-agent'
import type { InsertTables } from '@/types/supabase'

interface UserData {
  id: string
  organization_id: string
}

// Human-friendly labels for cloud provider values from intake questions
const CLOUD_PROVIDER_LABELS: Record<string, string> = {
  aws: 'Amazon Web Services (AWS)',
  azure: 'Microsoft Azure',
  gcp: 'Google Cloud Platform',
  google_workspace: 'Google Workspace',
  microsoft_365: 'Microsoft 365',
  heroku: 'Heroku',
  vercel: 'Vercel',
  digitalocean: 'DigitalOcean',
  on_premise: 'On-premise Infrastructure',
  other: 'Other Cloud Services',
}

// Human-friendly labels for data type values from intake questions
const DATA_TYPE_LABELS: Record<string, string> = {
  pii: 'Customer PII',
  phi: 'Protected Health Information',
  financial: 'Financial & Payment Data',
  intellectual_property: 'Intellectual Property',
  customer_data: 'Customer Business Data',
  employee_data: 'Employee HR Data',
  authentication: 'Authentication Credentials',
}

// Primary workspace labels (used for deduplication with cloud_providers)
const WORKSPACE_LABELS: Record<string, string> = {
  google_workspace: 'Google Workspace',
  microsoft_365: 'Microsoft 365',
  slack_based: 'Slack',
  notion: 'Notion',
  other: 'Collaboration Platform',
}

// Workspace tools that overlap with cloud provider values (skip as asset if already added)
const WORKSPACE_CLOUD_OVERLAP = new Set(['google_workspace', 'microsoft_365'])

// Data criticality based on data type
const DATA_CRITICALITY: Record<string, InsertTables<'assets'>['criticality']> = {
  pii: 'high',
  phi: 'critical',
  financial: 'critical',
  intellectual_property: 'high',
  customer_data: 'high',
  employee_data: 'medium',
  authentication: 'critical',
}

// Default vulnerability descriptions for risk areas
function defaultVulnerability(riskArea: string): string {
  const lower = riskArea.toLowerCase()
  if (lower.includes('access') || lower.includes('authentication')) {
    return 'Insufficient access controls or authentication mechanisms'
  }
  if (lower.includes('data') || lower.includes('privacy')) {
    return 'Inadequate data protection or encryption controls'
  }
  if (lower.includes('vendor') || lower.includes('supply') || lower.includes('third')) {
    return 'Lack of vendor risk assessment and monitoring processes'
  }
  if (lower.includes('incident') || lower.includes('breach')) {
    return 'Insufficient incident detection and response capabilities'
  }
  if (lower.includes('compliance') || lower.includes('regulatory')) {
    return 'Gaps in regulatory compliance monitoring and documentation'
  }
  if (lower.includes('availability') || lower.includes('disaster') || lower.includes('continuity')) {
    return 'Insufficient business continuity and disaster recovery planning'
  }
  if (lower.includes('employee') || lower.includes('insider') || lower.includes('awareness')) {
    return 'Insufficient security awareness training and policy enforcement'
  }
  return 'Controls not yet assessed for this risk area'
}

function buildAssetRows(
  orgId: string,
  intakeResponses: Record<string, unknown>
): InsertTables<'assets'>[] {
  const assets: InsertTables<'assets'>[] = []
  const addedNames = new Set<string>()

  function addAsset(
    name: string,
    type: InsertTables<'assets'>['asset_type'],
    description: string,
    criticality: InsertTables<'assets'>['criticality'] = 'medium'
  ) {
    if (addedNames.has(name)) return
    addedNames.add(name)
    assets.push({
      organization_id: orgId,
      name,
      asset_type: type,
      description,
      criticality,
      in_scope: true,
    })
  }

  // Cloud providers -> Software assets
  const cloudProviders = intakeResponses.cloud_providers as string[] | undefined
  if (cloudProviders?.length) {
    for (const provider of cloudProviders) {
      const label = CLOUD_PROVIDER_LABELS[provider] ?? provider
      addAsset(label, 'software', `Cloud platform: ${label}`, 'high')
    }
  }

  // Primary workspace -> Software asset (skip if already added via cloud_providers)
  const workspace = intakeResponses.primary_workspace as string | undefined
  if (workspace && !WORKSPACE_CLOUD_OVERLAP.has(workspace) || (workspace && WORKSPACE_CLOUD_OVERLAP.has(workspace) && !cloudProviders?.includes(workspace))) {
    const label = WORKSPACE_LABELS[workspace] ?? workspace
    addAsset(label, 'software', `Primary collaboration and productivity platform`, 'high')
  }

  // Data types -> Data assets
  const dataTypes = intakeResponses.data_types as string[] | undefined
  if (dataTypes?.length) {
    for (const dt of dataTypes) {
      if (dt === 'none') continue
      const label = DATA_TYPE_LABELS[dt] ?? dt
      const crit = DATA_CRITICALITY[dt] ?? 'medium'
      addAsset(label, 'data', `Sensitive data: ${label}`, crit)
    }
  }

  // Standard assets every org needs
  addAsset('Employee Laptops', 'hardware', 'Company-issued or BYOD workstations used by employees', 'high')
  addAsset('Corporate Email', 'service', 'Organization email service for business communications', 'high')
  addAsset('Source Code Repository', 'software', 'Version control system hosting application source code', 'high')
  addAsset('Engineering Team', 'people', 'Software engineering and development personnel', 'high')
  addAsset('Operations Team', 'people', 'IT operations and infrastructure personnel', 'medium')

  return assets
}

function buildRiskRows(
  orgId: string,
  riskAreas: string[]
): InsertTables<'risks'>[] {
  return riskAreas.map((riskArea) => ({
    organization_id: orgId,
    threat: riskArea,
    vulnerability: defaultVulnerability(riskArea),
    impact: 'medium' as const,
    likelihood: 'medium' as const,
    risk_level: 'medium' as const,
    treatment: 'mitigate' as const,
    status: 'draft' as const,
  }))
}

function buildOrgControlRows(
  orgId: string,
  controlUUIDs: { id: string; control_id: string }[],
  assumptions: AnnexAAssumption[]
): InsertTables<'organization_controls'>[] {
  // Build lookup from control_id string (e.g. "A.5.1") to assumption
  const assumptionMap = new Map<string, AnnexAAssumption>()
  for (const a of assumptions) {
    assumptionMap.set(a.controlId, a)
  }

  return controlUUIDs.map((control) => {
    const assumption = assumptionMap.get(control.control_id)

    if (assumption?.applicability === 'likely_not_applicable') {
      return {
        organization_id: orgId,
        control_id: control.id,
        applicable: false,
        justification: assumption.reasoning || 'Determined not applicable based on organization context',
        implementation_status: 'not_applicable' as const,
      }
    }

    // likely_applicable, needs_review, or not mentioned — default to applicable + gap
    return {
      organization_id: orgId,
      control_id: control.id,
      applicable: true,
      justification: assumption?.reasoning ?? null,
      implementation_status: 'gap' as const,
    }
  })
}

function buildSoaRows(
  orgId: string,
  controlUUIDs: { id: string; control_id: string }[],
  assumptions: AnnexAAssumption[]
): InsertTables<'soa_records'>[] {
  const assumptionMap = new Map<string, AnnexAAssumption>()
  for (const a of assumptions) {
    assumptionMap.set(a.controlId, a)
  }

  return controlUUIDs.map((control) => {
    const assumption = assumptionMap.get(control.control_id)
    const applicable = assumption?.applicability !== 'likely_not_applicable'

    return {
      organization_id: orgId,
      control_id: control.id,
      applicable,
      justification: assumption?.reasoning || 'Applicability to be confirmed during risk assessment',
      locked_for_audit: false,
    }
  })
}

/**
 * Seeds starter data (assets, risks, organization controls, SoA records)
 * based on intake responses and the AI-generated draft scope.
 *
 * Called after scope approval. Idempotent — skips if assets already exist
 * for the org (meaning the user has already started customizing).
 */
export async function seedStarterData(
  admin: SupabaseClient,
  userData: UserData,
  draftScope: DraftISMSScope,
  intakeResponses: Record<string, unknown> | undefined
): Promise<void> {
  const orgId = userData.organization_id

  // Idempotency check: skip if assets already exist for this org
  const { count, error: countError } = await admin
    .from('assets')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', orgId)

  if (countError) {
    console.error('Error checking existing assets:', countError)
    return
  }

  if ((count ?? 0) > 0) {
    console.log('Starter data already exists for org, skipping seed')
    return
  }

  // --- 1. Seed Assets ---
  const assetRows = buildAssetRows(orgId, intakeResponses ?? {})
  if (assetRows.length > 0) {
    const { error: assetsError } = await admin
      .from('assets')
      .insert(assetRows as never[])

    if (assetsError) {
      console.error('Error seeding assets:', assetsError)
    }
  }

  // --- 2. Seed Risks ---
  const riskRows = buildRiskRows(orgId, draftScope.riskAreas ?? [])
  if (riskRows.length > 0) {
    const { error: risksError } = await admin
      .from('risks')
      .insert(riskRows as never[])

    if (risksError) {
      console.error('Error seeding risks:', risksError)
    }
  }

  // --- 3. Seed Organization Controls + SoA Records ---
  // Fetch all control UUIDs from the shared controls table
  const { data: allControls, error: controlsError } = await admin
    .from('controls')
    .select('id, control_id')
    .order('control_id', { ascending: true })

  if (controlsError || !allControls?.length) {
    console.error('Error fetching controls for seeding:', controlsError)
    return
  }

  const controlList = allControls as { id: string; control_id: string }[]
  const assumptions = draftScope.annexAAssumptions ?? []

  // Organization Controls
  const orgControlRows = buildOrgControlRows(orgId, controlList, assumptions)
  if (orgControlRows.length > 0) {
    const { error: orgControlsError } = await admin
      .from('organization_controls')
      .upsert(orgControlRows as never[], {
        onConflict: 'organization_id,control_id',
      })

    if (orgControlsError) {
      console.error('Error seeding organization controls:', orgControlsError)
    }
  }

  // SoA Records
  const soaRows = buildSoaRows(orgId, controlList, assumptions)
  if (soaRows.length > 0) {
    const { error: soaError } = await admin
      .from('soa_records')
      .upsert(soaRows as never[], {
        onConflict: 'organization_id,control_id',
      })

    if (soaError) {
      console.error('Error seeding SoA records:', soaError)
    }
  }

  console.log(
    `Seeded starter data for org ${orgId}: ${assetRows.length} assets, ` +
    `${riskRows.length} risks, ${orgControlRows.length} org controls, ${soaRows.length} SoA records`
  )
}
