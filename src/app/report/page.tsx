'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getScope, getIntakeResponses, type SavedScope } from '@/lib/data/intake'
import { getOrganizationControls, type ControlWithStatus } from '@/lib/data/controls'
import { getSoARecords, type SoARecordWithControl } from '@/lib/data/soa'
import { getRisks, type RiskWithAsset } from '@/lib/data/risks'
import { getAssets, type Asset } from '@/lib/data/assets'
import { implementationStatusConfig } from '@/lib/controls-data'
import { createClient } from '@/lib/supabase/client'
import type { DraftISMSScope } from '@/lib/agents/intake-agent'

interface ReportData {
  orgName: string
  scope: SavedScope
  controls: ControlWithStatus[]
  soaRecords: SoARecordWithControl[]
  risks: RiskWithAsset[]
  assets: Asset[]
}

export default function ReportPage() {
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [noScope, setNoScope] = useState(false)

  useEffect(() => {
    async function fetchAll() {
      try {
        const supabase = createClient()

        const [scope, controls, soaRecords, risks, assets, intakeResponses, orgResult] = await Promise.all([
          getScope(),
          getOrganizationControls(),
          getSoARecords().catch(() => [] as SoARecordWithControl[]),
          getRisks(),
          getAssets(),
          getIntakeResponses(),
          supabase.from('organizations').select('name').limit(1).single()
        ])

        if (!scope) {
          setNoScope(true)
          setLoading(false)
          return
        }

        const orgData = orgResult.data as { name: string } | null
        const orgName = orgData?.name
          ?? (intakeResponses.org_name as string)
          ?? 'Organization'

        setData({ orgName, scope, controls, soaRecords, risks, assets })
      } catch (error) {
        console.error('Failed to load report data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Generating report...</p>
      </div>
    )
  }

  if (noScope || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">No ISMS scope has been defined yet.</p>
        <Link href="/intake">
          <Button>Go to Intake</Button>
        </Link>
      </div>
    )
  }

  const { orgName, scope, controls, soaRecords, risks, assets } = data

  // Parse scope fields
  const scopeRow = scope.scope
  const boundaries = (scopeRow.boundaries ?? { physical: [], logical: [], organizational: [] }) as DraftISMSScope['boundaries']
  const exclusions: string[] = scopeRow.exclusions
    ? (typeof scopeRow.exclusions === 'string' ? JSON.parse(scopeRow.exclusions) : scopeRow.exclusions) as string[]
    : []
  const interestedParties = (scopeRow.interested_parties ?? []) as unknown as DraftISMSScope['interestedParties']
  const regulatoryRequirements = (scopeRow.regulatory_requirements ?? []) as unknown as DraftISMSScope['regulatoryRequirements']

  // SoA stats
  const applicableControls = controls.filter(c => c.applicable)
  const soaStats = {
    total: controls.length,
    applicable: applicableControls.length,
    implemented: applicableControls.filter(c => c.implementation_status === 'implemented').length,
    partial: applicableControls.filter(c => c.implementation_status === 'partial').length,
    gap: applicableControls.filter(c => c.implementation_status === 'gap').length,
  }

  // Risk stats
  const riskStats = {
    total: risks.length,
    high: risks.filter(r => r.risk_level === 'high').length,
    approved: risks.filter(r => r.status === 'approved').length,
  }

  // Asset stats
  const assetStats = {
    total: assets.length,
    inScope: assets.filter(a => a.in_scope).length,
    critical: assets.filter(a => a.criticality === 'critical').length,
  }

  // Build SoA table data — prefer SoA records, fall back to controls
  const soaMap = new Map(soaRecords.map(r => [r.control_id, r]))
  const soaTableRows = controls.map(c => {
    const soaRec = soaMap.get(c.id)
    return {
      controlId: soaRec?.control_code ?? c.control_id,
      name: soaRec?.control_name ?? c.name,
      applicable: c.applicable,
      justification: c.justification ?? (soaRec?.justification || ''),
      status: c.implementation_status,
    }
  })

  const generatedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="bg-white text-black min-h-screen">
      {/* Screen-only toolbar */}
      <div className="print:hidden sticky top-0 z-50 bg-white border-b px-6 py-3 flex items-center justify-between">
        <Link href="/soa">
          <Button variant="outline" size="sm">Back to SoA</Button>
        </Link>
        <Button onClick={() => window.print()} size="sm">
          Download PDF
        </Button>
      </div>

      <div className="max-w-[210mm] mx-auto px-8 py-12 print:px-0 print:py-0">

        {/* ===== COVER PAGE ===== */}
        <section className="min-h-[90vh] print:min-h-[100vh] flex flex-col items-center justify-center text-center">
          <p className="text-sm tracking-widest text-gray-500 uppercase mb-8">Confidential</p>
          <h1 className="text-4xl font-bold mb-4">{orgName}</h1>
          <h2 className="text-2xl text-gray-600 mb-2">ISMS Documentation Package</h2>
          <p className="text-lg text-gray-500 mb-8">ISO 27001:2022</p>
          <p className="text-sm text-gray-400">Generated {generatedDate}</p>
        </section>

        {/* ===== SECTION 1: ISMS SCOPE ===== */}
        <section className="print:break-before-page pt-12">
          <h2 className="text-2xl font-bold mb-6 border-b pb-2">1. ISMS Scope</h2>

          {/* Scope Statement */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">1.1 Scope Statement</h3>
            <p className="text-base leading-relaxed">{scopeRow.scope_statement}</p>
          </div>

          {/* Boundaries */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">1.2 Scope Boundaries</h3>

            <div className="mb-4">
              <h4 className="font-medium mb-1">Physical Boundaries</h4>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                {(boundaries.physical ?? []).map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="mb-4">
              <h4 className="font-medium mb-1">Logical Boundaries</h4>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                {(boundaries.logical ?? []).map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="mb-4">
              <h4 className="font-medium mb-1">Organizational Boundaries</h4>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                {(boundaries.organizational ?? []).map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Exclusions */}
          {exclusions.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2">1.3 Exclusions</h3>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                {exclusions.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Interested Parties */}
          {interestedParties.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">
                {exclusions.length > 0 ? '1.4' : '1.3'} Interested Parties
              </h3>
              <table className="w-full text-sm border-collapse border">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border px-3 py-2 text-left font-medium">Party</th>
                    <th className="border px-3 py-2 text-left font-medium">Type</th>
                    <th className="border px-3 py-2 text-left font-medium">Expectations</th>
                    <th className="border px-3 py-2 text-left font-medium">Requirements</th>
                  </tr>
                </thead>
                <tbody>
                  {interestedParties.map((party, i) => (
                    <tr key={i}>
                      <td className="border px-3 py-2 font-medium">{party.name}</td>
                      <td className="border px-3 py-2 capitalize">{party.type}</td>
                      <td className="border px-3 py-2">
                        <ul className="list-disc pl-4">
                          {party.expectations.map((e, j) => <li key={j}>{e}</li>)}
                        </ul>
                      </td>
                      <td className="border px-3 py-2">
                        <ul className="list-disc pl-4">
                          {party.requirements.map((r, j) => <li key={j}>{r}</li>)}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Regulatory Requirements */}
          {regulatoryRequirements.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">
                {exclusions.length > 0 ? '1.5' : '1.4'} Regulatory &amp; Legal Requirements
              </h3>
              <table className="w-full text-sm border-collapse border">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border px-3 py-2 text-left font-medium">Regulation</th>
                    <th className="border px-3 py-2 text-left font-medium">Description</th>
                    <th className="border px-3 py-2 text-left font-medium">Applicable</th>
                    <th className="border px-3 py-2 text-left font-medium">Reasoning</th>
                  </tr>
                </thead>
                <tbody>
                  {regulatoryRequirements.map((reg, i) => (
                    <tr key={i}>
                      <td className="border px-3 py-2 font-medium">{reg.regulation}</td>
                      <td className="border px-3 py-2">{reg.description}</td>
                      <td className="border px-3 py-2">{reg.applicable ? 'Yes' : 'No'}</td>
                      <td className="border px-3 py-2">{reg.reasoning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ===== SECTION 2: STATEMENT OF APPLICABILITY ===== */}
        <section className="print:break-before-page pt-12">
          <h2 className="text-2xl font-bold mb-6 border-b pb-2">2. Statement of Applicability</h2>

          {/* Summary */}
          <div className="mb-6 grid grid-cols-5 gap-4 text-center">
            <div className="border rounded p-3">
              <div className="text-2xl font-bold">{soaStats.total}</div>
              <div className="text-xs text-gray-500">Total Controls</div>
            </div>
            <div className="border rounded p-3">
              <div className="text-2xl font-bold">{soaStats.applicable}</div>
              <div className="text-xs text-gray-500">Applicable</div>
            </div>
            <div className="border rounded p-3">
              <div className="text-2xl font-bold text-green-700">{soaStats.implemented}</div>
              <div className="text-xs text-gray-500">Implemented</div>
            </div>
            <div className="border rounded p-3">
              <div className="text-2xl font-bold text-yellow-700">{soaStats.partial}</div>
              <div className="text-xs text-gray-500">Partial</div>
            </div>
            <div className="border rounded p-3">
              <div className="text-2xl font-bold text-red-700">{soaStats.gap}</div>
              <div className="text-xs text-gray-500">Gap</div>
            </div>
          </div>

          {/* Full SoA table */}
          <table className="w-full text-xs border-collapse border">
            <thead>
              <tr className="bg-gray-50">
                <th className="border px-2 py-1.5 text-left font-medium w-16">Control</th>
                <th className="border px-2 py-1.5 text-left font-medium">Name</th>
                <th className="border px-2 py-1.5 text-left font-medium w-14">Appl.</th>
                <th className="border px-2 py-1.5 text-left font-medium">Justification</th>
                <th className="border px-2 py-1.5 text-left font-medium w-20">Status</th>
              </tr>
            </thead>
            <tbody>
              {soaTableRows.map((row, i) => (
                <tr key={i}>
                  <td className="border px-2 py-1 font-mono">{row.controlId}</td>
                  <td className="border px-2 py-1">{row.name}</td>
                  <td className="border px-2 py-1">{row.applicable ? 'Yes' : 'No'}</td>
                  <td className="border px-2 py-1 text-gray-600">{row.justification || '-'}</td>
                  <td className={`border px-2 py-1 font-medium ${statusColor(row.status)}`}>
                    {implementationStatusConfig[row.status].label}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* ===== SECTION 3: RISK REGISTER ===== */}
        <section className="print:break-before-page pt-12">
          <h2 className="text-2xl font-bold mb-6 border-b pb-2">3. Risk Register</h2>

          {/* Summary */}
          <div className="mb-6 grid grid-cols-3 gap-4 text-center">
            <div className="border rounded p-3">
              <div className="text-2xl font-bold">{riskStats.total}</div>
              <div className="text-xs text-gray-500">Total Risks</div>
            </div>
            <div className="border rounded p-3">
              <div className="text-2xl font-bold text-red-700">{riskStats.high}</div>
              <div className="text-xs text-gray-500">High Risk</div>
            </div>
            <div className="border rounded p-3">
              <div className="text-2xl font-bold text-green-700">{riskStats.approved}</div>
              <div className="text-xs text-gray-500">Approved</div>
            </div>
          </div>

          {risks.length > 0 ? (
            <table className="w-full text-xs border-collapse border">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border px-2 py-1.5 text-left font-medium">Threat</th>
                  <th className="border px-2 py-1.5 text-left font-medium">Vulnerability</th>
                  <th className="border px-2 py-1.5 text-left font-medium w-14">Impact</th>
                  <th className="border px-2 py-1.5 text-left font-medium w-16">Likelihood</th>
                  <th className="border px-2 py-1.5 text-left font-medium w-14">Risk</th>
                  <th className="border px-2 py-1.5 text-left font-medium w-16">Treatment</th>
                  <th className="border px-2 py-1.5 text-left font-medium w-16">Status</th>
                </tr>
              </thead>
              <tbody>
                {risks.map(risk => (
                  <tr key={risk.id}>
                    <td className="border px-2 py-1">{risk.threat}</td>
                    <td className="border px-2 py-1">{risk.vulnerability ?? '-'}</td>
                    <td className={`border px-2 py-1 capitalize ${riskLevelColor(risk.impact)}`}>{risk.impact}</td>
                    <td className={`border px-2 py-1 capitalize ${riskLevelColor(risk.likelihood)}`}>{risk.likelihood}</td>
                    <td className={`border px-2 py-1 capitalize font-medium ${riskLevelColor(risk.risk_level)}`}>{risk.risk_level}</td>
                    <td className="border px-2 py-1 capitalize">{risk.treatment}</td>
                    <td className="border px-2 py-1 capitalize">{risk.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-gray-500">No risks have been recorded.</p>
          )}
        </section>

        {/* ===== SECTION 4: ASSET REGISTER ===== */}
        <section className="print:break-before-page pt-12 pb-16">
          <h2 className="text-2xl font-bold mb-6 border-b pb-2">4. Asset Register</h2>

          {/* Summary */}
          <div className="mb-6 grid grid-cols-3 gap-4 text-center">
            <div className="border rounded p-3">
              <div className="text-2xl font-bold">{assetStats.total}</div>
              <div className="text-xs text-gray-500">Total Assets</div>
            </div>
            <div className="border rounded p-3">
              <div className="text-2xl font-bold">{assetStats.inScope}</div>
              <div className="text-xs text-gray-500">In Scope</div>
            </div>
            <div className="border rounded p-3">
              <div className="text-2xl font-bold text-red-700">{assetStats.critical}</div>
              <div className="text-xs text-gray-500">Critical</div>
            </div>
          </div>

          {assets.length > 0 ? (
            <table className="w-full text-xs border-collapse border">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border px-2 py-1.5 text-left font-medium">Name</th>
                  <th className="border px-2 py-1.5 text-left font-medium w-20">Type</th>
                  <th className="border px-2 py-1.5 text-left font-medium w-16">Criticality</th>
                  <th className="border px-2 py-1.5 text-left font-medium w-16">In Scope</th>
                  <th className="border px-2 py-1.5 text-left font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                {assets.map(asset => (
                  <tr key={asset.id}>
                    <td className="border px-2 py-1 font-medium">{asset.name}</td>
                    <td className="border px-2 py-1 capitalize">{asset.asset_type}</td>
                    <td className={`border px-2 py-1 capitalize ${criticalityColor(asset.criticality)}`}>{asset.criticality}</td>
                    <td className="border px-2 py-1">{asset.in_scope ? 'Yes' : 'No'}</td>
                    <td className="border px-2 py-1 text-gray-600">{asset.description ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-gray-500">No assets have been recorded.</p>
          )}
        </section>
      </div>
    </div>
  )
}

function statusColor(status: string): string {
  switch (status) {
    case 'implemented': return 'text-green-700'
    case 'partial': return 'text-yellow-700'
    case 'gap': return 'text-red-700'
    default: return 'text-gray-500'
  }
}

function riskLevelColor(level: string): string {
  switch (level) {
    case 'high': return 'text-red-700'
    case 'medium': return 'text-yellow-700'
    case 'low': return 'text-green-700'
    default: return ''
  }
}

function criticalityColor(level: string): string {
  switch (level) {
    case 'critical': return 'text-red-700 font-medium'
    case 'high': return 'text-red-600'
    case 'medium': return 'text-yellow-700'
    case 'low': return 'text-green-700'
    default: return ''
  }
}
