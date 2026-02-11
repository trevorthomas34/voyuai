'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getScope, getIntakeResponses, type SavedScope } from '@/lib/data/intake'
import { getOrganizationControls, type ControlWithStatus } from '@/lib/data/controls'
import { getSoARecords, type SoARecordWithControl } from '@/lib/data/soa'
import { getRisks, type RiskWithAsset } from '@/lib/data/risks'
import { getAssets, type Asset } from '@/lib/data/assets'
import { getEvidence, type EvidenceWithDetails } from '@/lib/data/evidence'
import { implementationStatusConfig, controlThemeLabels } from '@/lib/controls-data'
import { createClient } from '@/lib/supabase/client'
import type { DraftISMSScope } from '@/lib/agents/intake-agent'
import type { ControlTheme } from '@/types/database'

interface ReportData {
  orgName: string
  scope: SavedScope
  controls: ControlWithStatus[]
  soaRecords: SoARecordWithControl[]
  risks: RiskWithAsset[]
  assets: Asset[]
  evidence: EvidenceWithDetails[]
  intake: Record<string, unknown>
}

export default function ReportPage() {
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [noScope, setNoScope] = useState(false)

  useEffect(() => {
    async function fetchAll() {
      try {
        const supabase = createClient()

        const [scope, controls, soaRecords, risks, assets, evidence, intakeResponses, orgResult] = await Promise.all([
          getScope(),
          getOrganizationControls(),
          getSoARecords().catch(() => [] as SoARecordWithControl[]),
          getRisks(),
          getAssets(),
          getEvidence().catch(() => [] as EvidenceWithDetails[]),
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

        setData({ orgName, scope, controls, soaRecords, risks, assets, evidence, intake: intakeResponses })
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

  const { orgName, scope, controls, soaRecords, risks, assets, evidence, intake } = data

  // Parse intake context for dynamic content
  const industry = (intake.industry as string) ?? 'technology services'
  const headcount = (intake.headcount as string) ?? ''
  const geography = (intake.geography as string[]) ?? []
  const dataTypes = (intake.data_types as string[]) ?? []
  const cloudProviders = (intake.cloud_providers as string[]) ?? []
  const remoteWork = (intake.remote_work as string) ?? ''
  const customerTypes = (intake.customer_types as string[]) ?? []
  const existingCerts = (intake.existing_certifications as string[]) ?? []
  const certTimeline = (intake.certification_timeline as string) ?? ''

  // Parse scope fields
  const scopeRow = scope.scope
  const boundaries = (scopeRow.boundaries ?? { physical: [], logical: [], organizational: [] }) as DraftISMSScope['boundaries']
  const exclusions: string[] = scopeRow.exclusions
    ? (typeof scopeRow.exclusions === 'string' ? scopeRow.exclusions.split('\n').filter(Boolean) : scopeRow.exclusions) as string[]
    : []
  const interestedParties = (scopeRow.interested_parties ?? []) as unknown as DraftISMSScope['interestedParties']
  const regulatoryRequirements = (scopeRow.regulatory_requirements ?? []) as unknown as DraftISMSScope['regulatoryRequirements']

  // SoA stats
  const applicableControls = controls.filter(c => c.applicable)
  const soaStats = {
    total: controls.length,
    applicable: applicableControls.length,
    notApplicable: controls.length - applicableControls.length,
    implemented: applicableControls.filter(c => c.implementation_status === 'implemented').length,
    partial: applicableControls.filter(c => c.implementation_status === 'partial').length,
    gap: applicableControls.filter(c => c.implementation_status === 'gap').length,
  }

  // Risk stats
  const riskStats = {
    total: risks.length,
    high: risks.filter(r => r.risk_level === 'high').length,
    medium: risks.filter(r => r.risk_level === 'medium').length,
    low: risks.filter(r => r.risk_level === 'low').length,
    approved: risks.filter(r => r.status === 'approved').length,
  }

  // Asset stats
  const assetStats = {
    total: assets.length,
    inScope: assets.filter(a => a.in_scope).length,
    critical: assets.filter(a => a.criticality === 'critical').length,
    high: assets.filter(a => a.criticality === 'high').length,
  }

  // Evidence stats
  const evidenceStats = {
    total: evidence.length,
    stage1: evidence.filter(e => e.stage_acceptable === 'stage_1' || e.stage_acceptable === 'both').length,
    stage2: evidence.filter(e => e.stage_acceptable === 'stage_2' || e.stage_acceptable === 'both').length,
  }

  // Controls by theme
  const themes: ControlTheme[] = ['organizational', 'people', 'physical', 'technological']
  const controlsByTheme = themes.map(theme => {
    const themeControls = controls.filter(c => c.theme === theme)
    const applicable = themeControls.filter(c => c.applicable)
    return {
      theme,
      label: controlThemeLabels[theme],
      controls: themeControls,
      stats: {
        total: themeControls.length,
        applicable: applicable.length,
        implemented: applicable.filter(c => c.implementation_status === 'implemented').length,
        partial: applicable.filter(c => c.implementation_status === 'partial').length,
        gap: applicable.filter(c => c.implementation_status === 'gap').length,
      }
    }
  })

  // Build SoA table data — prefer SoA records, fall back to controls
  const soaMap = new Map(soaRecords.map(r => [r.control_id, r]))

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
          <h1 className="text-4xl font-bold mb-2">{orgName}</h1>
          <h2 className="text-2xl text-gray-600 mb-2">Information Security Management System</h2>
          <h3 className="text-xl text-gray-500 mb-8">(ISMS) Manual</h3>
          <div className="text-sm text-gray-500 space-y-1 mb-12">
            <p>In conformance with ISO/IEC 27001:2022</p>
            <p>Generated {generatedDate}</p>
          </div>

          {/* Document Control */}
          <div className="w-full max-w-md text-left">
            <table className="w-full text-sm border-collapse border">
              <tbody>
                <tr><td className="border px-3 py-1.5 font-medium bg-gray-50 w-40">Organization</td><td className="border px-3 py-1.5">{orgName}</td></tr>
                <tr><td className="border px-3 py-1.5 font-medium bg-gray-50">Standard</td><td className="border px-3 py-1.5">ISO/IEC 27001:2022</td></tr>
                <tr><td className="border px-3 py-1.5 font-medium bg-gray-50">Document Owner</td><td className="border px-3 py-1.5">ISMS Manager</td></tr>
                <tr><td className="border px-3 py-1.5 font-medium bg-gray-50">Approval Authority</td><td className="border px-3 py-1.5">Executive Management</td></tr>
                <tr><td className="border px-3 py-1.5 font-medium bg-gray-50">Classification</td><td className="border px-3 py-1.5">Internal / Confidential</td></tr>
                <tr><td className="border px-3 py-1.5 font-medium bg-gray-50">Version</td><td className="border px-3 py-1.5">1.0 (Draft)</td></tr>
                <tr><td className="border px-3 py-1.5 font-medium bg-gray-50">Date</td><td className="border px-3 py-1.5">{generatedDate}</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ===== TABLE OF CONTENTS ===== */}
        <section className="print:break-before-page pt-12 pb-8">
          <h2 className="text-2xl font-bold mb-6 border-b pb-2">Table of Contents</h2>
          <div className="space-y-2 text-sm">
            <TocEntry num="1" title="Purpose & Scope of This Document" />
            <TocEntry num="2" title="Organization Overview" />
            <div className="pt-2 pb-1"><p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">ISO 27001 Clauses</p></div>
            <TocEntry num="4" title="Context of the Organization" indent>
              <TocEntry num="4.1" title="Understanding the Organization and its Context" />
              <TocEntry num="4.2" title="Interested Parties" />
              <TocEntry num="4.3" title="Scope of the ISMS" />
              <TocEntry num="4.4" title="Information Security Management System" />
            </TocEntry>
            <TocEntry num="5" title="Leadership" indent>
              <TocEntry num="5.1" title="Leadership and Commitment" />
              <TocEntry num="5.2" title="Information Security Policy" />
              <TocEntry num="5.3" title="Organizational Roles, Responsibilities and Authorities" />
            </TocEntry>
            <TocEntry num="6" title="Planning" indent>
              <TocEntry num="6.1" title="Actions to Address Risks and Opportunities" />
              <TocEntry num="6.2" title="Information Security Objectives" />
            </TocEntry>
            <TocEntry num="7" title="Support" indent>
              <TocEntry num="7.1" title="Resources" />
              <TocEntry num="7.2" title="Competence" />
              <TocEntry num="7.3" title="Awareness" />
              <TocEntry num="7.4" title="Communication" />
              <TocEntry num="7.5" title="Documented Information" />
            </TocEntry>
            <TocEntry num="8" title="Operation" indent>
              <TocEntry num="8.1" title="Operational Planning and Control" />
              <TocEntry num="8.2" title="Information Security Risk Assessment" />
              <TocEntry num="8.3" title="Information Security Risk Treatment" />
            </TocEntry>
            <TocEntry num="9" title="Performance Evaluation" indent>
              <TocEntry num="9.1" title="Monitoring, Measurement, Analysis and Evaluation" />
              <TocEntry num="9.2" title="Internal Audit" />
              <TocEntry num="9.3" title="Management Review" />
            </TocEntry>
            <TocEntry num="10" title="Improvement" indent>
              <TocEntry num="10.1" title="Continual Improvement" />
              <TocEntry num="10.2" title="Nonconformity and Corrective Action" />
            </TocEntry>
            <div className="pt-2 pb-1"><p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Schedules</p></div>
            <TocEntry num="A" title="Risk Register" />
            <TocEntry num="B" title="Asset Register" />
            <TocEntry num="C" title="Statement of Applicability" />
            <TocEntry num="D" title="Evidence Register" />
          </div>
        </section>

        {/* ===== 1. PURPOSE ===== */}
        <section className="print:break-before-page pt-12">
          <h2 className="text-2xl font-bold mb-6 border-b pb-2">1. Purpose &amp; Scope of This Document</h2>
          <p className="text-sm leading-relaxed mb-4">
            This document constitutes the Information Security Management System (ISMS) Manual for {orgName}.
            It defines how the organization establishes, implements, maintains, and continually improves its
            ISMS in conformance with ISO/IEC 27001:2022.
          </p>
          <p className="text-sm leading-relaxed mb-4">
            The ISMS protects the confidentiality, integrity, and availability of information assets processed,
            stored, or transmitted as part of {orgName}&apos;s operations and service delivery. This manual serves
            as the primary reference for auditors, management, and operational staff.
          </p>
          <p className="text-sm leading-relaxed mb-4">
            This document consolidates:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-sm mb-4">
            <li>ISMS context analysis, scope definition, and boundary determination (Clause 4)</li>
            <li>Policy statements, leadership commitments, and role assignments (Clause 5)</li>
            <li>Risk assessment methodology, treatment approach, and security objectives (Clause 6)</li>
            <li>Resource, competence, awareness, communication, and documentation requirements (Clause 7)</li>
            <li>Operational controls and risk assessment/treatment execution (Clause 8)</li>
            <li>Performance monitoring, internal audit, and management review processes (Clause 9)</li>
            <li>Continual improvement and corrective action procedures (Clause 10)</li>
            <li>Supporting schedules: Risk Register, Asset Register, Statement of Applicability, and Evidence Register</li>
          </ul>
          <p className="text-sm leading-relaxed">
            This manual is reviewed at least annually and whenever significant changes occur to the organization,
            its context, or the threat landscape. All changes are subject to formal document control and approval
            by executive management.
          </p>
        </section>

        {/* ===== 2. ORGANIZATION OVERVIEW ===== */}
        <section className="pt-12">
          <h2 className="text-2xl font-bold mb-6 border-b pb-2">2. Organization Overview</h2>
          <p className="text-sm leading-relaxed mb-4">
            {orgName} operates in the <strong>{industry}</strong> sector
            {headcount && <>, with approximately <strong>{headcount}</strong> personnel</>}
            {geography.length > 0 && <>, operating across <strong>{geography.join(', ')}</strong></>}.
            {customerTypes.length > 0 && <> The organization serves <strong>{customerTypes.join(', ')}</strong> customers.</>}
          </p>

          {dataTypes.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Information assets under protection include:</p>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                {dataTypes.map((dt, i) => <li key={i} className="capitalize">{dt.replace(/_/g, ' ')}</li>)}
              </ul>
            </div>
          )}

          {cloudProviders.length > 0 && (
            <p className="text-sm leading-relaxed mb-4">
              Primary technology infrastructure is hosted on <strong>{cloudProviders.join(', ')}</strong>.
              {remoteWork && <> The workforce model is <strong>{remoteWork.replace(/_/g, ' ')}</strong>.</>}
            </p>
          )}

          {existingCerts.length > 0 && (
            <p className="text-sm leading-relaxed mb-4">
              Existing certifications and frameworks: <strong>{existingCerts.join(', ')}</strong>.
              {certTimeline && <> Target certification timeline: <strong>{certTimeline.replace(/_/g, ' ')}</strong>.</>}
            </p>
          )}

          <p className="text-sm leading-relaxed">
            The ISMS applies to all people, processes, systems, and information assets used to design, deliver,
            operate, and support {orgName}&apos;s services within the defined scope.
          </p>
        </section>

        {/* ================================================================ */}
        {/*  ISO 27001 CLAUSES                                               */}
        {/* ================================================================ */}

        {/* ===== CLAUSE 4: CONTEXT OF THE ORGANIZATION ===== */}
        <section className="print:break-before-page pt-12">
          <h2 className="text-2xl font-bold mb-6 border-b pb-2">4. Context of the Organization</h2>

          <p className="text-sm leading-relaxed mb-6">
            {orgName} has determined the external and internal issues, interested parties, and requirements
            that are relevant to its purpose and that affect its ability to achieve the intended outcomes
            of the ISMS. These factors inform the scope, risk assessment, and control selection.
          </p>

          {/* 4.1 Understanding the Organization */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">4.1 Understanding the Organization and its Context</h3>
            <p className="text-sm leading-relaxed mb-4">
              {orgName} monitors internal and external issues on an ongoing basis to ensure the ISMS remains
              aligned with the organization&apos;s strategic direction and operating environment. These issues
              are reviewed during management reviews and whenever significant changes occur.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="text-sm font-semibold mb-2">External Issues</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Evolving cyber threat landscape and attack vectors</li>
                  <li>Legal, regulatory, and contractual obligations{regulatoryRequirements.length > 0 && ` (${regulatoryRequirements.filter(r => r.applicable).map(r => r.regulation).join(', ')})`}</li>
                  <li>Industry-specific security standards and expectations</li>
                  <li>Customer and partner security requirements</li>
                  <li>Technological changes affecting infrastructure and services</li>
                  <li>Geopolitical factors and supply chain dependencies</li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2">Internal Issues</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Organizational structure, roles, and governance model</li>
                  <li>Business objectives, growth strategy, and risk appetite</li>
                  <li>IT infrastructure, cloud services, and development practices</li>
                  <li>Staff competence, awareness, and security culture</li>
                  <li>Existing policies, processes, and operational procedures</li>
                  <li>Resource availability and budget constraints</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 4.2 Interested Parties */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">4.2 Understanding the Needs and Expectations of Interested Parties</h3>
            <p className="text-sm leading-relaxed mb-4">
              The following interested parties have been identified as relevant to the ISMS. Their expectations
              and requirements are considered when defining the ISMS scope and selecting controls.
            </p>
            {interestedParties.length > 0 ? (
              <table className="w-full text-xs border-collapse border">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border px-3 py-2 text-left font-medium">Interested Party</th>
                    <th className="border px-3 py-2 text-left font-medium w-20">Type</th>
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
            ) : (
              <p className="text-sm text-gray-500 italic">Interested parties have not yet been defined.</p>
            )}
          </div>

          {/* Regulatory Requirements */}
          {regulatoryRequirements.length > 0 && (
            <div className="mb-8">
              <h4 className="text-sm font-semibold mb-3">Regulatory, Legal &amp; Contractual Requirements</h4>
              <p className="text-sm leading-relaxed mb-3">
                The following regulatory and legal requirements have been assessed for applicability. Applicable
                requirements are incorporated into the ISMS through control selection and policy statements.
              </p>
              <table className="w-full text-xs border-collapse border">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border px-3 py-2 text-left font-medium">Regulation / Framework</th>
                    <th className="border px-3 py-2 text-left font-medium">Description</th>
                    <th className="border px-3 py-2 text-left font-medium w-16">Applicable</th>
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

          {/* 4.3 Scope */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">4.3 Determining the Scope of the ISMS</h3>
            <p className="text-sm leading-relaxed mb-4">
              The ISMS scope has been determined considering the external and internal issues (4.1),
              the requirements of interested parties (4.2), and the interfaces and dependencies between
              activities performed by the organization and those performed by other organizations.
            </p>

            <div className="bg-gray-50 border rounded p-4 mb-4">
              <h4 className="text-sm font-semibold mb-2">Scope Statement</h4>
              <p className="text-sm leading-relaxed italic">{scopeRow.scope_statement}</p>
            </div>

            <h4 className="text-sm font-semibold mb-2">Scope Boundaries</h4>
            <p className="text-sm leading-relaxed mb-3">
              The following boundaries define what is included within the ISMS:
            </p>

            {(boundaries.physical ?? []).length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Physical Boundaries</p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  {(boundaries.physical ?? []).map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            )}

            {(boundaries.logical ?? []).length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Logical Boundaries</p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  {(boundaries.logical ?? []).map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            )}

            {(boundaries.organizational ?? []).length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Organizational Boundaries</p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  {(boundaries.organizational ?? []).map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            )}

            {exclusions.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-2">Exclusions</h4>
                <p className="text-sm mb-2">The following have been excluded from the ISMS scope with justification:</p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  {exclusions.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            )}
          </div>

          {/* 4.4 ISMS */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">4.4 Information Security Management System</h3>
            <p className="text-sm leading-relaxed mb-3">
              {orgName} has established, implemented, and maintains an ISMS that includes the processes and
              their interactions needed to continually improve information security in accordance with ISO/IEC 27001:2022.
              The ISMS follows the Plan-Do-Check-Act (PDCA) cycle:
            </p>
            <table className="w-full text-xs border-collapse border mb-4">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border px-3 py-2 text-left font-medium w-24">Phase</th>
                  <th className="border px-3 py-2 text-left font-medium">Activities</th>
                  <th className="border px-3 py-2 text-left font-medium w-28">ISO Clauses</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-3 py-2 font-medium">Plan</td>
                  <td className="border px-3 py-2">Establish context, assess risks, define scope, select controls, set objectives</td>
                  <td className="border px-3 py-2">4, 5, 6, 7</td>
                </tr>
                <tr>
                  <td className="border px-3 py-2 font-medium">Do</td>
                  <td className="border px-3 py-2">Implement risk treatment plans, deploy controls, execute operational processes</td>
                  <td className="border px-3 py-2">8</td>
                </tr>
                <tr>
                  <td className="border px-3 py-2 font-medium">Check</td>
                  <td className="border px-3 py-2">Monitor performance, conduct internal audits, perform management reviews</td>
                  <td className="border px-3 py-2">9</td>
                </tr>
                <tr>
                  <td className="border px-3 py-2 font-medium">Act</td>
                  <td className="border px-3 py-2">Address nonconformities, implement corrective actions, drive continual improvement</td>
                  <td className="border px-3 py-2">10</td>
                </tr>
              </tbody>
            </table>
            <p className="text-sm leading-relaxed">
              The ISMS addresses {controls.length} Annex A controls across four themes (Organizational, People,
              Physical, Technological), of which {soaStats.applicable} have been determined applicable to {orgName}&apos;s
              context. The Statement of Applicability is maintained in Schedule C.
            </p>
          </div>
        </section>

        {/* ===== CLAUSE 5: LEADERSHIP ===== */}
        <section className="print:break-before-page pt-12">
          <h2 className="text-2xl font-bold mb-6 border-b pb-2">5. Leadership</h2>

          {/* 5.1 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">5.1 Leadership and Commitment</h3>
            <p className="text-sm leading-relaxed mb-3">
              Top management demonstrates leadership and commitment with respect to the ISMS by:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-sm mb-3">
              <li>Ensuring the information security policy and objectives are established and compatible with the strategic direction of {orgName}</li>
              <li>Ensuring the integration of ISMS requirements into {orgName}&apos;s business processes</li>
              <li>Ensuring that the resources needed for the ISMS are available</li>
              <li>Communicating the importance of effective information security management and of conforming to ISMS requirements</li>
              <li>Ensuring that the ISMS achieves its intended outcomes</li>
              <li>Directing and supporting persons to contribute to the effectiveness of the ISMS</li>
              <li>Promoting continual improvement</li>
              <li>Supporting other relevant management roles to demonstrate their leadership in their areas of responsibility</li>
            </ul>
            <p className="text-sm leading-relaxed">
              Leadership commitment is evidenced through participation in management reviews, approval of the information
              security policy and risk treatment plans, allocation of adequate resources, and regular communication of
              security expectations to all personnel.
            </p>
          </div>

          {/* 5.2 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">5.2 Information Security Policy</h3>
            <p className="text-sm leading-relaxed mb-3">
              Top management has established an Information Security Policy that:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-sm mb-4">
              <li>Is appropriate to the purpose of {orgName}</li>
              <li>Includes information security objectives or provides the framework for setting them</li>
              <li>Includes a commitment to satisfy applicable requirements related to information security</li>
              <li>Includes a commitment to continual improvement of the ISMS</li>
            </ul>

            <div className="bg-gray-50 border rounded p-4 mb-4">
              <h4 className="text-sm font-semibold mb-3">Policy Statement</h4>
              <p className="text-sm leading-relaxed mb-3">
                {orgName} is committed to protecting the confidentiality, integrity, and availability of all
                information assets. This commitment extends to information owned by {orgName}, entrusted to it
                by customers, partners, and other stakeholders, and information processed by third parties on its behalf.
              </p>
              <p className="text-sm leading-relaxed mb-2">{orgName} shall:</p>
              <ol className="list-decimal pl-6 space-y-1 text-sm">
                <li>Protect information against unauthorized access, disclosure, modification, destruction, or loss</li>
                <li>Identify, assess, and treat information security risks through a systematic risk management process</li>
                <li>Comply with all applicable legal, regulatory, contractual, and professional obligations</li>
                <li>Ensure that all personnel understand their information security responsibilities through awareness and training</li>
                <li>Report and investigate all actual or suspected information security incidents</li>
                <li>Maintain business continuity by protecting critical information processes against major failures and disasters</li>
                <li>Continually improve the suitability, adequacy, and effectiveness of the ISMS</li>
              </ol>
            </div>

            <p className="text-sm leading-relaxed">
              The Information Security Policy is communicated to all employees and made available to relevant interested
              parties as appropriate. It is reviewed at planned intervals (at least annually) and whenever significant
              changes occur to ensure its continuing suitability, adequacy, and effectiveness.
            </p>
          </div>

          {/* 5.3 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">5.3 Organizational Roles, Responsibilities and Authorities</h3>
            <p className="text-sm leading-relaxed mb-4">
              Top management ensures that the responsibilities and authorities for roles relevant to information security
              are assigned and communicated within the organization. The following key roles have been established:
            </p>
            <table className="w-full text-xs border-collapse border">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border px-3 py-2 text-left font-medium w-44">Role</th>
                  <th className="border px-3 py-2 text-left font-medium">Responsibilities</th>
                  <th className="border px-3 py-2 text-left font-medium w-32">Accountability</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-3 py-2 font-medium">Executive Management</td>
                  <td className="border px-3 py-2">Overall accountability for the ISMS; approve policy, scope, and risk acceptance criteria; allocate resources; champion information security culture</td>
                  <td className="border px-3 py-2">Board / CEO</td>
                </tr>
                <tr>
                  <td className="border px-3 py-2 font-medium">ISMS Manager</td>
                  <td className="border px-3 py-2">Day-to-day management of the ISMS; coordinate risk assessments and treatment plans; manage internal audits; maintain documentation; report ISMS performance to top management</td>
                  <td className="border px-3 py-2">Executive Management</td>
                </tr>
                <tr>
                  <td className="border px-3 py-2 font-medium">Risk Owners</td>
                  <td className="border px-3 py-2">Accept or treat assigned risks; ensure treatment actions are implemented within agreed timelines; monitor control effectiveness for owned risks; escalate unacceptable residual risk</td>
                  <td className="border px-3 py-2">ISMS Manager</td>
                </tr>
                <tr>
                  <td className="border px-3 py-2 font-medium">Asset Owners</td>
                  <td className="border px-3 py-2">Classify and label information assets; define access requirements; ensure appropriate controls are applied; participate in risk assessments for owned assets</td>
                  <td className="border px-3 py-2">ISMS Manager</td>
                </tr>
                <tr>
                  <td className="border px-3 py-2 font-medium">System Administrators</td>
                  <td className="border px-3 py-2">Implement and maintain technical controls; manage access provisioning; apply security configurations and patches; support incident investigation</td>
                  <td className="border px-3 py-2">Asset Owners</td>
                </tr>
                <tr>
                  <td className="border px-3 py-2 font-medium">Internal Auditor</td>
                  <td className="border px-3 py-2">Plan and execute ISMS internal audits; report findings objectively; verify corrective action effectiveness; maintain auditor independence</td>
                  <td className="border px-3 py-2">Executive Management</td>
                </tr>
                <tr>
                  <td className="border px-3 py-2 font-medium">All Personnel</td>
                  <td className="border px-3 py-2">Comply with ISMS policies and procedures; protect information assets in their custody; complete required security training; report security events and suspected incidents promptly</td>
                  <td className="border px-3 py-2">Line Management</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ===== CLAUSE 6: PLANNING ===== */}
        <section className="print:break-before-page pt-12">
          <h2 className="text-2xl font-bold mb-6 border-b pb-2">6. Planning</h2>

          {/* 6.1 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">6.1 Actions to Address Risks and Opportunities</h3>

            <p className="text-sm leading-relaxed mb-4">
              When planning for the ISMS, {orgName} considers the issues referred to in 4.1 and the requirements
              referred to in 4.2 to determine the risks and opportunities that need to be addressed to ensure the
              ISMS can achieve its intended outcomes, prevent or reduce undesired effects, and achieve continual improvement.
            </p>

            {/* 6.1.1 General */}
            <h4 className="text-sm font-semibold mb-2">6.1.1 General</h4>
            <p className="text-sm leading-relaxed mb-4">
              {orgName} has planned actions to address risks and opportunities, how to integrate and implement these
              actions into its ISMS processes, and how to evaluate the effectiveness of these actions. Risk assessment
              and treatment are performed at planned intervals, upon significant changes to the organization or its
              context, and when security incidents indicate a need for reassessment.
            </p>

            {/* 6.1.2 Risk Assessment */}
            <h4 className="text-sm font-semibold mb-2">6.1.2 Information Security Risk Assessment</h4>
            <p className="text-sm leading-relaxed mb-3">
              {orgName} maintains an asset-based risk assessment process that produces consistent, valid, and
              comparable results. The methodology includes:
            </p>

            <p className="text-xs font-semibold text-gray-600 mb-2">Risk Identification</p>
            <ul className="list-disc pl-6 space-y-1 text-sm mb-4">
              <li>Identify information assets within the ISMS scope and assign asset owners (see Schedule B)</li>
              <li>Identify threats to each asset (e.g. unauthorized access, malware, data loss, service disruption)</li>
              <li>Identify vulnerabilities that could be exploited by identified threats</li>
              <li>Determine potential impacts to confidentiality, integrity, and availability</li>
            </ul>

            <p className="text-xs font-semibold text-gray-600 mb-2">Risk Analysis &amp; Evaluation</p>
            <p className="text-sm leading-relaxed mb-3">
              Each risk is analyzed by assessing the likelihood of occurrence and the potential impact.
              Risks are evaluated against acceptance criteria to determine treatment priority.
            </p>

            <table className="w-full text-xs border-collapse border mb-4">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border px-2 py-1.5 text-left font-medium" rowSpan={2}>Likelihood &darr;</th>
                  <th className="border px-2 py-1.5 text-center font-medium" colSpan={3}>Impact &rarr;</th>
                </tr>
                <tr className="bg-gray-50">
                  <th className="border px-2 py-1.5 text-center font-medium w-24">Low</th>
                  <th className="border px-2 py-1.5 text-center font-medium w-24">Medium</th>
                  <th className="border px-2 py-1.5 text-center font-medium w-24">High</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-2 py-1.5 font-medium">High</td>
                  <td className="border px-2 py-1.5 text-center text-yellow-700 font-medium">Medium</td>
                  <td className="border px-2 py-1.5 text-center text-red-700 font-medium">High</td>
                  <td className="border px-2 py-1.5 text-center text-red-700 font-medium">High</td>
                </tr>
                <tr>
                  <td className="border px-2 py-1.5 font-medium">Medium</td>
                  <td className="border px-2 py-1.5 text-center text-green-700 font-medium">Low</td>
                  <td className="border px-2 py-1.5 text-center text-yellow-700 font-medium">Medium</td>
                  <td className="border px-2 py-1.5 text-center text-red-700 font-medium">High</td>
                </tr>
                <tr>
                  <td className="border px-2 py-1.5 font-medium">Low</td>
                  <td className="border px-2 py-1.5 text-center text-green-700 font-medium">Low</td>
                  <td className="border px-2 py-1.5 text-center text-green-700 font-medium">Low</td>
                  <td className="border px-2 py-1.5 text-center text-yellow-700 font-medium">Medium</td>
                </tr>
              </tbody>
            </table>

            <table className="w-full text-xs border-collapse border mb-4">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border px-2 py-1.5 text-left font-medium w-20">Risk Level</th>
                  <th className="border px-2 py-1.5 text-left font-medium">Criteria</th>
                  <th className="border px-2 py-1.5 text-left font-medium">Required Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-2 py-1.5 font-medium text-red-700">High</td>
                  <td className="border px-2 py-1.5">Unacceptable risk requiring priority treatment</td>
                  <td className="border px-2 py-1.5">Must be treated; risk treatment plan required with defined timeline and owner</td>
                </tr>
                <tr>
                  <td className="border px-2 py-1.5 font-medium text-yellow-700">Medium</td>
                  <td className="border px-2 py-1.5">Risk requiring management attention</td>
                  <td className="border px-2 py-1.5">Treatment recommended; may be accepted with documented justification and management approval</td>
                </tr>
                <tr>
                  <td className="border px-2 py-1.5 font-medium text-green-700">Low</td>
                  <td className="border px-2 py-1.5">Acceptable risk within tolerance</td>
                  <td className="border px-2 py-1.5">May be accepted; monitored during periodic risk reviews</td>
                </tr>
              </tbody>
            </table>

            <p className="text-sm text-gray-600">
              The full risk register is maintained in Schedule A. Currently {riskStats.total} risks have been identified,
              with {riskStats.high} rated high, {riskStats.medium} rated medium, and {riskStats.low} rated low.
            </p>

            {/* 6.1.3 Risk Treatment */}
            <h4 className="text-sm font-semibold mt-6 mb-2">6.1.3 Information Security Risk Treatment</h4>
            <p className="text-sm leading-relaxed mb-3">
              For each risk requiring treatment, {orgName} selects one or more of the following treatment options
              and determines all controls necessary to implement the chosen option(s):
            </p>
            <table className="w-full text-xs border-collapse border mb-4">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border px-3 py-2 text-left font-medium w-24">Treatment</th>
                  <th className="border px-3 py-2 text-left font-medium">Description</th>
                  <th className="border px-3 py-2 text-left font-medium">When Applied</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-3 py-2 font-medium">Mitigate</td>
                  <td className="border px-3 py-2">Apply controls to reduce risk likelihood or impact to an acceptable level</td>
                  <td className="border px-3 py-2">Effective controls are available and cost-justified</td>
                </tr>
                <tr>
                  <td className="border px-3 py-2 font-medium">Transfer</td>
                  <td className="border px-3 py-2">Transfer risk through insurance, outsourcing, or contractual arrangements</td>
                  <td className="border px-3 py-2">Specialized third party can manage risk more effectively</td>
                </tr>
                <tr>
                  <td className="border px-3 py-2 font-medium">Avoid</td>
                  <td className="border px-3 py-2">Eliminate the risk by discontinuing or modifying the activity</td>
                  <td className="border px-3 py-2">Risk outweighs the business benefit of the activity</td>
                </tr>
                <tr>
                  <td className="border px-3 py-2 font-medium">Accept</td>
                  <td className="border px-3 py-2">Acknowledge and retain the risk with informed management approval</td>
                  <td className="border px-3 py-2">Residual risk is within tolerance and treatment is not cost-effective</td>
                </tr>
              </tbody>
            </table>
            <p className="text-sm leading-relaxed mb-3">
              Controls selected for risk treatment are compared against Annex A of ISO/IEC 27001:2022 to verify that
              no necessary controls have been overlooked. The Statement of Applicability (Schedule C) documents all
              93 Annex A controls with applicability determinations and justifications.
            </p>
            <p className="text-sm leading-relaxed">
              Risk owners formally accept residual risk after treatment. Acceptance decisions are documented, and
              residual risk levels are reviewed during periodic risk assessments and management reviews.
            </p>
          </div>

          {/* 6.2 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">6.2 Information Security Objectives and Planning to Achieve Them</h3>
            <p className="text-sm leading-relaxed mb-4">
              {orgName} establishes information security objectives at relevant functions and levels. Objectives are
              consistent with the information security policy, measurable, and take into account applicable requirements
              and risk assessment results. For each objective, the organization determines what will be done, what
              resources are required, who will be responsible, when it will be completed, and how results will be evaluated.
            </p>
            <table className="w-full text-xs border-collapse border">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border px-3 py-2 text-left font-medium">Objective</th>
                  <th className="border px-3 py-2 text-left font-medium">Measure / KPI</th>
                  <th className="border px-3 py-2 text-left font-medium w-24">Target</th>
                  <th className="border px-3 py-2 text-left font-medium w-28">Owner</th>
                  <th className="border px-3 py-2 text-left font-medium w-20">Frequency</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-3 py-2">Protect customer and organizational data from unauthorized disclosure</td>
                  <td className="border px-3 py-2">Confirmed data breaches resulting in unauthorized disclosure</td>
                  <td className="border px-3 py-2">Zero reportable</td>
                  <td className="border px-3 py-2">ISMS Manager</td>
                  <td className="border px-3 py-2">Quarterly</td>
                </tr>
                <tr>
                  <td className="border px-3 py-2">Enforce strong authentication across all systems</td>
                  <td className="border px-3 py-2">Percentage of users with MFA enabled</td>
                  <td className="border px-3 py-2">100%</td>
                  <td className="border px-3 py-2">System Admins</td>
                  <td className="border px-3 py-2">Monthly</td>
                </tr>
                <tr>
                  <td className="border px-3 py-2">Maintain information security awareness across all personnel</td>
                  <td className="border px-3 py-2">Security awareness training completion rate</td>
                  <td className="border px-3 py-2">100% annually</td>
                  <td className="border px-3 py-2">ISMS Manager</td>
                  <td className="border px-3 py-2">Annual</td>
                </tr>
                <tr>
                  <td className="border px-3 py-2">Ensure timely treatment of identified risks</td>
                  <td className="border px-3 py-2">High-rated risks without active treatment plan</td>
                  <td className="border px-3 py-2">Zero overdue</td>
                  <td className="border px-3 py-2">Risk Owners</td>
                  <td className="border px-3 py-2">Quarterly</td>
                </tr>
                <tr>
                  <td className="border px-3 py-2">Maintain service availability within agreed levels</td>
                  <td className="border px-3 py-2">Security-related unplanned downtime</td>
                  <td className="border px-3 py-2">&lt; SLA threshold</td>
                  <td className="border px-3 py-2">System Admins</td>
                  <td className="border px-3 py-2">Monthly</td>
                </tr>
                <tr>
                  <td className="border px-3 py-2">Respond to security incidents promptly</td>
                  <td className="border px-3 py-2">Mean time to acknowledge security incidents</td>
                  <td className="border px-3 py-2">&lt; 4 hours</td>
                  <td className="border px-3 py-2">ISMS Manager</td>
                  <td className="border px-3 py-2">Per incident</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ===== CLAUSE 7: SUPPORT ===== */}
        <section className="print:break-before-page pt-12">
          <h2 className="text-2xl font-bold mb-6 border-b pb-2">7. Support</h2>

          {/* 7.1 Resources */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">7.1 Resources</h3>
            <p className="text-sm leading-relaxed mb-3">
              {orgName} determines and provides the resources needed for the establishment, implementation,
              maintenance, and continual improvement of the ISMS. Resources include:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-sm mb-3">
              <li><strong>Personnel</strong> &mdash; Dedicated ISMS Manager role with allocated time from executive management, asset owners, and system administrators for security-related activities</li>
              <li><strong>Technology</strong> &mdash; Security tools and platforms for monitoring, access management, vulnerability scanning, endpoint protection, and ISMS documentation management</li>
              <li><strong>Budget</strong> &mdash; Annual information security budget covering tooling, training, external assessments, and certification audit costs</li>
              <li><strong>External expertise</strong> &mdash; Engagement of qualified consultants and auditors where internal capabilities are insufficient</li>
            </ul>
            <p className="text-sm leading-relaxed">
              Resource adequacy is assessed during management reviews and adjusted based on changes to the
              organization, its risk profile, or the scope of the ISMS.
            </p>
          </div>

          {/* 7.2 Competence */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">7.2 Competence</h3>
            <p className="text-sm leading-relaxed mb-3">
              {orgName} determines the necessary competence of persons doing work under its control that affects
              information security performance. The organization ensures that these persons are competent on the
              basis of appropriate education, training, or experience.
            </p>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              <li>Competence requirements are defined for each ISMS role (see 5.3)</li>
              <li>Where gaps exist, actions are taken to acquire the necessary competence (training, mentoring, hiring, or external engagement)</li>
              <li>The effectiveness of actions taken is evaluated</li>
              <li>Evidence of competence is retained (certifications, training records, qualifications)</li>
            </ul>
          </div>

          {/* 7.3 Awareness */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">7.3 Awareness</h3>
            <p className="text-sm leading-relaxed mb-3">
              All persons doing work under {orgName}&apos;s control are made aware of:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-sm mb-3">
              <li>The information security policy</li>
              <li>Their contribution to the effectiveness of the ISMS, including the benefits of improved performance</li>
              <li>The implications of not conforming with ISMS requirements</li>
              <li>How to identify and report information security events and incidents</li>
            </ul>
            <p className="text-sm leading-relaxed">
              Awareness is delivered through onboarding induction, annual security awareness training, targeted
              communications (e.g. phishing awareness campaigns), and ad-hoc notifications for emerging threats
              or policy changes. Completion rates are tracked as an ISMS performance metric.
            </p>
          </div>

          {/* 7.4 Communication */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">7.4 Communication</h3>
            <p className="text-sm leading-relaxed mb-3">
              {orgName} has determined the need for internal and external communications relevant to the ISMS:
            </p>
            <table className="w-full text-xs border-collapse border">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border px-3 py-2 text-left font-medium">What</th>
                  <th className="border px-3 py-2 text-left font-medium w-24">When</th>
                  <th className="border px-3 py-2 text-left font-medium w-32">From</th>
                  <th className="border px-3 py-2 text-left font-medium w-32">To</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-3 py-2">Information Security Policy updates</td>
                  <td className="border px-3 py-2">On change</td>
                  <td className="border px-3 py-2">ISMS Manager</td>
                  <td className="border px-3 py-2">All personnel</td>
                </tr>
                <tr>
                  <td className="border px-3 py-2">Security incident notifications</td>
                  <td className="border px-3 py-2">As needed</td>
                  <td className="border px-3 py-2">ISMS Manager</td>
                  <td className="border px-3 py-2">Affected parties</td>
                </tr>
                <tr>
                  <td className="border px-3 py-2">ISMS performance &amp; audit results</td>
                  <td className="border px-3 py-2">Quarterly</td>
                  <td className="border px-3 py-2">ISMS Manager</td>
                  <td className="border px-3 py-2">Executive Management</td>
                </tr>
                <tr>
                  <td className="border px-3 py-2">Security awareness reminders</td>
                  <td className="border px-3 py-2">Monthly</td>
                  <td className="border px-3 py-2">ISMS Manager</td>
                  <td className="border px-3 py-2">All personnel</td>
                </tr>
                <tr>
                  <td className="border px-3 py-2">Customer security inquiries / questionnaires</td>
                  <td className="border px-3 py-2">On request</td>
                  <td className="border px-3 py-2">ISMS Manager</td>
                  <td className="border px-3 py-2">Customers / prospects</td>
                </tr>
                <tr>
                  <td className="border px-3 py-2">Regulatory notifications and breach disclosures</td>
                  <td className="border px-3 py-2">As required</td>
                  <td className="border px-3 py-2">Executive Management</td>
                  <td className="border px-3 py-2">Regulators</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 7.5 Documented Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">7.5 Documented Information</h3>
            <p className="text-sm leading-relaxed mb-3">
              {orgName}&apos;s ISMS includes documented information required by ISO/IEC 27001:2022 and
              determined by the organization as necessary for the effectiveness of the ISMS.
            </p>

            <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Creating and Updating</h4>
            <p className="text-sm leading-relaxed mb-3">
              When creating and updating documented information, {orgName} ensures appropriate identification
              (title, date, author, version), format (consistent templates), and review and approval
              by authorized personnel before publication.
            </p>

            <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Control of Documented Information</h4>
            <ul className="list-disc pl-6 space-y-1 text-sm mb-3">
              <li><strong>Availability</strong> &mdash; Documents are stored in a controlled repository accessible to authorized personnel</li>
              <li><strong>Protection</strong> &mdash; Access controls prevent unauthorized modification or deletion; documents are classified according to their sensitivity</li>
              <li><strong>Version control</strong> &mdash; All ISMS documents maintain version history with change descriptions</li>
              <li><strong>Retention</strong> &mdash; Documents are retained for the period required by legal, regulatory, or contractual obligations (minimum 3 years for audit evidence)</li>
              <li><strong>Disposition</strong> &mdash; Obsolete documents are archived or securely destroyed to prevent unintended use</li>
            </ul>

            <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Key ISMS Documents</h4>
            <table className="w-full text-xs border-collapse border">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border px-3 py-2 text-left font-medium">Document</th>
                  <th className="border px-3 py-2 text-left font-medium w-28">Owner</th>
                  <th className="border px-3 py-2 text-left font-medium w-24">Review Cycle</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="border px-3 py-2">ISMS Manual (this document)</td><td className="border px-3 py-2">ISMS Manager</td><td className="border px-3 py-2">Annual</td></tr>
                <tr><td className="border px-3 py-2">Information Security Policy</td><td className="border px-3 py-2">Executive Mgmt</td><td className="border px-3 py-2">Annual</td></tr>
                <tr><td className="border px-3 py-2">Risk Assessment &amp; Treatment Report</td><td className="border px-3 py-2">ISMS Manager</td><td className="border px-3 py-2">Annual</td></tr>
                <tr><td className="border px-3 py-2">Statement of Applicability</td><td className="border px-3 py-2">ISMS Manager</td><td className="border px-3 py-2">Annual</td></tr>
                <tr><td className="border px-3 py-2">Risk Treatment Plan</td><td className="border px-3 py-2">Risk Owners</td><td className="border px-3 py-2">Quarterly</td></tr>
                <tr><td className="border px-3 py-2">Internal Audit Program &amp; Reports</td><td className="border px-3 py-2">Internal Auditor</td><td className="border px-3 py-2">Per audit</td></tr>
                <tr><td className="border px-3 py-2">Management Review Minutes</td><td className="border px-3 py-2">ISMS Manager</td><td className="border px-3 py-2">Per review</td></tr>
                <tr><td className="border px-3 py-2">Incident Response Procedure</td><td className="border px-3 py-2">ISMS Manager</td><td className="border px-3 py-2">Annual</td></tr>
                <tr><td className="border px-3 py-2">Business Continuity Plan</td><td className="border px-3 py-2">Executive Mgmt</td><td className="border px-3 py-2">Annual</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ===== CLAUSE 8: OPERATION ===== */}
        <section className="print:break-before-page pt-12">
          <h2 className="text-2xl font-bold mb-6 border-b pb-2">8. Operation</h2>

          {/* 8.1 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">8.1 Operational Planning and Control</h3>
            <p className="text-sm leading-relaxed mb-3">
              {orgName} plans, implements, and controls the processes needed to meet information security
              requirements and to implement the actions determined in Clause 6. This includes:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-sm mb-3">
              <li><strong>Change management</strong> &mdash; Planned changes to the ISMS, infrastructure, or business processes are assessed for their information security impact before implementation. Unintended changes are reviewed and actions taken to mitigate adverse effects.</li>
              <li><strong>Outsourced processes</strong> &mdash; Processes relevant to the ISMS that are outsourced (e.g. cloud hosting, managed security services, software development) are identified and controlled through contractual security requirements, service level agreements, and periodic supplier assessments.</li>
              <li><strong>Operational procedures</strong> &mdash; Documented procedures exist for security-critical operations including access provisioning, system configuration, backup and recovery, patch management, and incident response.</li>
            </ul>
            <p className="text-sm leading-relaxed">
              {orgName} retains documented information to the extent necessary to have confidence that processes
              have been carried out as planned.
            </p>
          </div>

          {/* 8.2 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">8.2 Information Security Risk Assessment</h3>
            <p className="text-sm leading-relaxed mb-3">
              {orgName} performs information security risk assessments at planned intervals or when significant
              changes are proposed or occur. The risk assessment process follows the methodology defined in 6.1.2.
            </p>
            <p className="text-sm leading-relaxed mb-3">
              Risk assessments are triggered by:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-sm mb-3">
              <li>Scheduled annual review cycle</li>
              <li>Significant changes to the organization, its processes, or information systems</li>
              <li>Changes to the external threat landscape or regulatory environment</li>
              <li>Findings from security incidents, audits, or management reviews</li>
              <li>Introduction of new information assets, services, or third-party relationships</li>
            </ul>
            <p className="text-sm leading-relaxed">
              Risk assessment results are documented in the Risk Register (Schedule A) and communicated to
              relevant risk owners. Currently {riskStats.total} risks are tracked, with {riskStats.approved} having
              received formal management approval for their treatment decisions.
            </p>
          </div>

          {/* 8.3 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">8.3 Information Security Risk Treatment</h3>
            <p className="text-sm leading-relaxed mb-3">
              {orgName} implements the risk treatment plan determined in 6.1.3. For each risk requiring treatment:
            </p>
            <ol className="list-decimal pl-6 space-y-1 text-sm mb-3">
              <li>The appropriate treatment option is selected (mitigate, transfer, avoid, or accept)</li>
              <li>Controls necessary to implement the treatment are determined, considering Annex A</li>
              <li>A risk treatment plan is produced documenting actions, owners, timelines, and expected outcomes</li>
              <li>Risk owners formally approve residual risk levels after treatment</li>
              <li>Treatment effectiveness is monitored and reassessed at planned intervals</li>
            </ol>
            <p className="text-sm leading-relaxed">
              The Statement of Applicability (Schedule C) documents all controls determined as necessary,
              whether from Annex A or additional sources. Of {soaStats.applicable} applicable controls,
              {soaStats.implemented} are fully implemented, {soaStats.partial} are partially implemented,
              and {soaStats.gap} represent current gaps under active treatment.
            </p>
          </div>
        </section>

        {/* ===== CLAUSE 9: PERFORMANCE EVALUATION ===== */}
        <section className="print:break-before-page pt-12">
          <h2 className="text-2xl font-bold mb-6 border-b pb-2">9. Performance Evaluation</h2>

          {/* 9.1 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">9.1 Monitoring, Measurement, Analysis and Evaluation</h3>
            <p className="text-sm leading-relaxed mb-3">
              {orgName} determines what needs to be monitored and measured, the methods for monitoring and measurement,
              when monitoring and measurement shall be performed, who shall perform them, and when results shall be
              analyzed and evaluated. The following key performance indicators are tracked:
            </p>
            <table className="w-full text-xs border-collapse border mb-4">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border px-3 py-2 text-left font-medium">Metric</th>
                  <th className="border px-3 py-2 text-left font-medium w-20">Frequency</th>
                  <th className="border px-3 py-2 text-left font-medium w-28">Responsible</th>
                  <th className="border px-3 py-2 text-left font-medium w-28">Reported To</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-3 py-2">Risk register status (open/treated/accepted)</td>
                  <td className="border px-3 py-2">Quarterly</td>
                  <td className="border px-3 py-2">ISMS Manager</td>
                  <td className="border px-3 py-2">Executive Mgmt</td>
                </tr>
                <tr>
                  <td className="border px-3 py-2">Control implementation progress (implemented/partial/gap)</td>
                  <td className="border px-3 py-2">Monthly</td>
                  <td className="border px-3 py-2">ISMS Manager</td>
                  <td className="border px-3 py-2">Executive Mgmt</td>
                </tr>
                <tr>
                  <td className="border px-3 py-2">Security incident count and severity trends</td>
                  <td className="border px-3 py-2">Monthly</td>
                  <td className="border px-3 py-2">ISMS Manager</td>
                  <td className="border px-3 py-2">Executive Mgmt</td>
                </tr>
                <tr>
                  <td className="border px-3 py-2">Security awareness training completion rate</td>
                  <td className="border px-3 py-2">Quarterly</td>
                  <td className="border px-3 py-2">ISMS Manager</td>
                  <td className="border px-3 py-2">Executive Mgmt</td>
                </tr>
                <tr>
                  <td className="border px-3 py-2">Vulnerability scan findings and remediation timelines</td>
                  <td className="border px-3 py-2">Monthly</td>
                  <td className="border px-3 py-2">System Admins</td>
                  <td className="border px-3 py-2">ISMS Manager</td>
                </tr>
                <tr>
                  <td className="border px-3 py-2">Internal audit findings (open/closed/overdue)</td>
                  <td className="border px-3 py-2">Per audit</td>
                  <td className="border px-3 py-2">Internal Auditor</td>
                  <td className="border px-3 py-2">Executive Mgmt</td>
                </tr>
                <tr>
                  <td className="border px-3 py-2">Corrective action completion rate</td>
                  <td className="border px-3 py-2">Quarterly</td>
                  <td className="border px-3 py-2">ISMS Manager</td>
                  <td className="border px-3 py-2">Executive Mgmt</td>
                </tr>
              </tbody>
            </table>
            <p className="text-sm leading-relaxed">
              Results are evaluated to determine the suitability, adequacy, and effectiveness of the ISMS.
              Performance data is retained as documented information and provided as input to management reviews.
            </p>
          </div>

          {/* 9.2 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">9.2 Internal Audit</h3>
            <p className="text-sm leading-relaxed mb-3">
              {orgName} conducts internal audits at planned intervals to provide information on whether the ISMS
              conforms to the organization&apos;s own requirements and the requirements of ISO/IEC 27001:2022,
              and is effectively implemented and maintained.
            </p>

            <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Audit Program</h4>
            <ul className="list-disc pl-6 space-y-1 text-sm mb-3">
              <li>The audit program considers the importance of the processes concerned, results of previous audits, and changes affecting the organization</li>
              <li>All ISMS clauses (4&ndash;10) and applicable Annex A controls are covered within a defined audit cycle (typically 12 months)</li>
              <li>Audit criteria, scope, frequency, and methods are defined for each audit</li>
              <li>Auditors are selected to ensure objectivity and impartiality &mdash; auditors do not audit their own work</li>
            </ul>

            <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Audit Process</h4>
            <ol className="list-decimal pl-6 space-y-1 text-sm mb-3">
              <li><strong>Planning</strong> &mdash; Define audit scope, criteria, and schedule; notify relevant stakeholders</li>
              <li><strong>Execution</strong> &mdash; Conduct document review and interviews; gather objective evidence; assess conformity</li>
              <li><strong>Reporting</strong> &mdash; Document findings as conformities, observations, or nonconformities; present results to management</li>
              <li><strong>Follow-up</strong> &mdash; Track corrective actions to resolution; verify effectiveness of implemented corrections</li>
            </ol>
            <p className="text-sm leading-relaxed">
              Audit results are retained as documented information and provided as input to management reviews.
              Identified nonconformities trigger the corrective action process described in 10.2.
            </p>
          </div>

          {/* 9.3 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">9.3 Management Review</h3>
            <p className="text-sm leading-relaxed mb-3">
              Top management reviews the ISMS at planned intervals (at least annually) to ensure its
              continuing suitability, adequacy, and effectiveness. Additional reviews may be triggered
              by significant security incidents, major organizational changes, or audit findings.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Review Inputs</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Status of actions from previous management reviews</li>
                  <li>Changes in external and internal issues relevant to the ISMS</li>
                  <li>Changes in needs and expectations of interested parties</li>
                  <li>Nonconformities and corrective action status</li>
                  <li>Monitoring and measurement results</li>
                  <li>Internal and external audit results</li>
                  <li>Information security incident trends</li>
                  <li>Risk assessment and treatment status</li>
                  <li>Feedback from interested parties</li>
                  <li>Opportunities for continual improvement</li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Review Outputs</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Decisions related to continual improvement opportunities</li>
                  <li>Any needs for changes to the ISMS (scope, policy, objectives, controls)</li>
                  <li>Resource requirements and allocation decisions</li>
                  <li>Risk acceptance decisions requiring management approval</li>
                  <li>Updates to information security objectives and KPIs</li>
                  <li>Action items with assigned owners and deadlines</li>
                </ul>
              </div>
            </div>

            <p className="text-sm leading-relaxed">
              Management review minutes are retained as documented information, including decisions made
              and actions assigned. Action items are tracked to completion and their status is reported
              at subsequent reviews.
            </p>
          </div>
        </section>

        {/* ===== CLAUSE 10: IMPROVEMENT ===== */}
        <section className="print:break-before-page pt-12">
          <h2 className="text-2xl font-bold mb-6 border-b pb-2">10. Improvement</h2>

          {/* 10.1 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">10.1 Continual Improvement</h3>
            <p className="text-sm leading-relaxed mb-3">
              {orgName} continually improves the suitability, adequacy, and effectiveness of the ISMS.
              Continual improvement is driven by multiple inputs:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-sm mb-3">
              <li>Management review decisions and action items</li>
              <li>Internal and external audit findings and recommendations</li>
              <li>Analysis of security incidents and near-misses</li>
              <li>Changes in the threat landscape and emerging risks</li>
              <li>Performance measurement trends and KPI analysis</li>
              <li>Feedback from interested parties and benchmarking</li>
              <li>Results of risk reassessments</li>
            </ul>
            <p className="text-sm leading-relaxed">
              Improvement actions are documented, assigned to owners, given target completion dates, and
              tracked through regular status reviews. The effectiveness of implemented improvements is
              evaluated to ensure they achieve the intended outcomes.
            </p>
          </div>

          {/* 10.2 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">10.2 Nonconformity and Corrective Action</h3>
            <p className="text-sm leading-relaxed mb-3">
              When a nonconformity is identified (through audits, incidents, monitoring, or other means),
              {orgName} follows a structured corrective action process:
            </p>
            <ol className="list-decimal pl-6 space-y-2 text-sm mb-4">
              <li><strong>React to the nonconformity</strong> &mdash; Take immediate action to control and correct the nonconformity and deal with its consequences</li>
              <li><strong>Evaluate the need for corrective action</strong> &mdash; Determine whether the nonconformity could recur or whether similar nonconformities could occur elsewhere by reviewing the nonconformity, determining its root cause(s), and assessing scope</li>
              <li><strong>Implement corrective action</strong> &mdash; Implement actions needed to eliminate root causes, proportionate to the severity and impact of the nonconformity</li>
              <li><strong>Review effectiveness</strong> &mdash; Evaluate whether the corrective action has eliminated the root cause and whether the nonconformity has recurred</li>
              <li><strong>Update the ISMS</strong> &mdash; Make changes to the ISMS if necessary based on the corrective action outcomes (e.g. update risk assessments, modify controls, revise procedures)</li>
            </ol>
            <p className="text-sm leading-relaxed">
              {orgName} retains documented information as evidence of the nature of the nonconformities, actions
              taken, and the results of corrective actions. Corrective action records include: description of the
              nonconformity, root cause analysis, actions implemented, owner, timeline, and effectiveness verification.
            </p>
          </div>
        </section>

        {/* ================================================================ */}
        {/*  SCHEDULES                                                       */}
        {/* ================================================================ */}

        {/* ===== SCHEDULE A: RISK REGISTER ===== */}
        <section className="print:break-before-page pt-12">
          <h2 className="text-2xl font-bold mb-6 border-b pb-2">Schedule A &mdash; Risk Register</h2>

          <p className="text-sm leading-relaxed mb-4">
            The following risk register documents all identified information security risks within the ISMS scope.
            Risks are assessed using the methodology described in Clause 6.1.2 and treated in accordance with 6.1.3.
          </p>

          <div className="mb-6 grid grid-cols-5 gap-4 text-center">
            <StatBox value={riskStats.total} label="Total Risks" />
            <StatBox value={riskStats.high} label="High" className="text-red-700" />
            <StatBox value={riskStats.medium} label="Medium" className="text-yellow-700" />
            <StatBox value={riskStats.low} label="Low" className="text-green-700" />
            <StatBox value={riskStats.approved} label="Approved" className="text-green-700" />
          </div>

          {risks.length > 0 ? (
            <table className="w-full text-xs border-collapse border">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border px-2 py-1.5 text-left font-medium">Asset</th>
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
                    <td className="border px-2 py-1 text-gray-600">{risk.asset_name ?? '-'}</td>
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
            <p className="text-sm text-gray-500 italic">No risks have been recorded. Risk assessment is pending.</p>
          )}
        </section>

        {/* ===== SCHEDULE B: ASSET REGISTER ===== */}
        <section className="print:break-before-page pt-12">
          <h2 className="text-2xl font-bold mb-6 border-b pb-2">Schedule B &mdash; Asset Register</h2>

          <p className="text-sm leading-relaxed mb-4">
            The following register documents information assets within the ISMS scope. Assets are classified by type
            and criticality, and serve as the basis for the risk assessment process described in Clause 6.1.2.
          </p>

          <div className="mb-6 grid grid-cols-4 gap-4 text-center">
            <StatBox value={assetStats.total} label="Total Assets" />
            <StatBox value={assetStats.inScope} label="In Scope" />
            <StatBox value={assetStats.critical} label="Critical" className="text-red-700" />
            <StatBox value={assetStats.high} label="High" className="text-red-600" />
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
            <p className="text-sm text-gray-500 italic">No assets have been recorded. Asset identification is pending.</p>
          )}
        </section>

        {/* ===== SCHEDULE C: STATEMENT OF APPLICABILITY ===== */}
        <section className="print:break-before-page pt-12">
          <h2 className="text-2xl font-bold mb-6 border-b pb-2">Schedule C &mdash; Statement of Applicability</h2>

          <p className="text-sm leading-relaxed mb-4">
            The Statement of Applicability (SoA) documents the applicability and implementation status of each
            ISO/IEC 27001:2022 Annex A control. For each control, the SoA provides a justification for inclusion
            or exclusion based on the risk assessment results and organizational requirements. Controls are organized
            by the four themes defined in the 2022 edition of the standard.
          </p>

          {/* Overall Summary */}
          <div className="mb-8 grid grid-cols-6 gap-3 text-center">
            <StatBox value={soaStats.total} label="Total" />
            <StatBox value={soaStats.applicable} label="Applicable" />
            <StatBox value={soaStats.notApplicable} label="Not Applicable" />
            <StatBox value={soaStats.implemented} label="Implemented" className="text-green-700" />
            <StatBox value={soaStats.partial} label="Partial" className="text-yellow-700" />
            <StatBox value={soaStats.gap} label="Gap" className="text-red-700" />
          </div>

          {/* Controls by Theme */}
          {controlsByTheme.map((group, groupIdx) => (
            <div key={group.theme} className={groupIdx > 0 ? 'print:break-before-page pt-8' : ''}>
              <h3 className="text-lg font-semibold mb-2">{group.label}</h3>
              <p className="text-xs text-gray-500 mb-3">
                {group.stats.total} controls &mdash; {group.stats.applicable} applicable,{' '}
                {group.stats.implemented} implemented, {group.stats.partial} partial, {group.stats.gap} gap
              </p>
              <table className="w-full text-xs border-collapse border mb-6">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border px-2 py-1.5 text-left font-medium w-14">ID</th>
                    <th className="border px-2 py-1.5 text-left font-medium">Control</th>
                    <th className="border px-2 py-1.5 text-left font-medium w-12">Appl.</th>
                    <th className="border px-2 py-1.5 text-left font-medium">Justification</th>
                    <th className="border px-2 py-1.5 text-left font-medium w-20">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {group.controls.map(c => {
                    const soaRec = soaMap.get(c.id)
                    return (
                      <tr key={c.id}>
                        <td className="border px-2 py-1 font-mono">{soaRec?.control_code ?? c.control_id}</td>
                        <td className="border px-2 py-1">{soaRec?.control_name ?? c.name}</td>
                        <td className="border px-2 py-1">{c.applicable ? 'Yes' : 'No'}</td>
                        <td className="border px-2 py-1 text-gray-600">{c.justification ?? (soaRec?.justification || '-')}</td>
                        <td className={`border px-2 py-1 font-medium ${statusColor(c.implementation_status)}`}>
                          {implementationStatusConfig[c.implementation_status].label}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </section>

        {/* ===== SCHEDULE D: EVIDENCE REGISTER ===== */}
        <section className="print:break-before-page pt-12 pb-16">
          <h2 className="text-2xl font-bold mb-6 border-b pb-2">Schedule D &mdash; Evidence Register</h2>

          <p className="text-sm leading-relaxed mb-4">
            The following register documents evidence artifacts collected to demonstrate control implementation
            and ISMS conformity. Evidence is classified by audit stage readiness to support both Stage 1
            (documentation review) and Stage 2 (implementation assessment) certification audits.
          </p>

          <div className="mb-6 grid grid-cols-3 gap-4 text-center">
            <StatBox value={evidenceStats.total} label="Total Evidence" />
            <StatBox value={evidenceStats.stage1} label="Stage 1 Ready" />
            <StatBox value={evidenceStats.stage2} label="Stage 2 Ready" />
          </div>

          {evidence.length > 0 ? (
            <table className="w-full text-xs border-collapse border">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border px-2 py-1.5 text-left font-medium">Title</th>
                  <th className="border px-2 py-1.5 text-left font-medium">Control</th>
                  <th className="border px-2 py-1.5 text-left font-medium w-20">Type</th>
                  <th className="border px-2 py-1.5 text-left font-medium w-16">Stage</th>
                  <th className="border px-2 py-1.5 text-left font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                {evidence.map(e => (
                  <tr key={e.id}>
                    <td className="border px-2 py-1 font-medium">{e.title}</td>
                    <td className="border px-2 py-1">{e.control_name ?? '-'}</td>
                    <td className="border px-2 py-1 capitalize">{e.evidence_type}</td>
                    <td className="border px-2 py-1 capitalize text-xs">
                      {e.stage_acceptable === 'both' ? 'Stage 1 & 2' : e.stage_acceptable === 'stage_1' ? 'Stage 1' : 'Stage 2'}
                    </td>
                    <td className="border px-2 py-1 text-gray-600">{e.description ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-gray-500 italic">No evidence has been uploaded yet. Evidence collection is pending.</p>
          )}
        </section>
      </div>
    </div>
  )
}

/* ===== Helper Components ===== */

function StatBox({ value, label, className }: { value: number; label: string; className?: string }) {
  return (
    <div className="border rounded p-3">
      <div className={`text-2xl font-bold ${className ?? ''}`}>{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  )
}

function TocEntry({ num, title, indent, children }: {
  num: string
  title: string
  indent?: boolean
  children?: React.ReactNode
}) {
  return (
    <div>
      <div className={`flex items-baseline gap-2 ${/^\d+\./.test(num) ? 'pl-6' : ''}`}>
        <span className="font-mono text-gray-500 w-8 shrink-0">{num}</span>
        <span className="font-medium">{title}</span>
      </div>
      {indent && children && (
        <div className="mt-1 space-y-1">{children}</div>
      )}
    </div>
  )
}

/* ===== Helper Functions ===== */

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
