'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { mockAssets, mockRisks, mockEvidence } from '@/lib/mock-data'
import { annexAControls, getControlStats } from '@/lib/controls-data'

export default function DashboardPage() {
  // Calculate real stats from mock data
  const controlStats = getControlStats(annexAControls)
  const assetStats = {
    total: mockAssets.length,
    inScope: mockAssets.filter(a => a.in_scope).length,
    critical: mockAssets.filter(a => a.criticality === 'critical').length
  }
  const riskStats = {
    total: mockRisks.length,
    high: mockRisks.filter(r => r.risk_level === 'high').length,
    approved: mockRisks.filter(r => r.status === 'approved').length,
    pending: mockRisks.filter(r => r.status === 'draft').length
  }
  const evidenceStats = {
    total: mockEvidence.length,
    verified: mockEvidence.filter(e => e.verified).length,
    controlsCovered: new Set(mockEvidence.map(e => e.control_id)).size
  }

  // Calculate phase progress
  const phases = {
    intake: { status: 'complete' as const, progress: 100 },
    assets: {
      status: assetStats.total > 0 ? 'complete' as const : 'pending' as const,
      progress: assetStats.total > 0 ? 100 : 0
    },
    risks: {
      status: riskStats.total > 0
        ? (riskStats.approved === riskStats.total ? 'complete' as const : 'in_progress' as const)
        : 'pending' as const,
      progress: riskStats.total > 0
        ? Math.round((riskStats.approved / riskStats.total) * 100)
        : 0
    },
    controls: {
      status: controlStats.implemented > 0
        ? (controlStats.gap === 0 ? 'complete' as const : 'in_progress' as const)
        : 'pending' as const,
      progress: controlStats.applicable > 0
        ? Math.round((controlStats.implemented / controlStats.applicable) * 100)
        : 0
    },
    evidence: {
      status: evidenceStats.total > 0
        ? (evidenceStats.controlsCovered >= controlStats.applicable ? 'complete' as const : 'in_progress' as const)
        : 'pending' as const,
      progress: controlStats.applicable > 0
        ? Math.round((evidenceStats.controlsCovered / controlStats.applicable) * 100)
        : 0
    },
    soa: {
      status: controlStats.gap === 0 ? 'complete' as const : 'in_progress' as const,
      progress: controlStats.applicable > 0
        ? Math.round(((controlStats.implemented + controlStats.partial) / controlStats.applicable) * 100)
        : 0
    }
  }

  const overallProgress = Math.round(
    Object.values(phases).reduce((sum, p) => sum + p.progress, 0) / Object.keys(phases).length
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Voyu</h1>
            <p className="text-sm text-muted-foreground">ISMS Dashboard</p>
          </div>
          <nav className="flex items-center space-x-4">
            <Link href="/dashboard" className="text-sm font-medium">Dashboard</Link>
            <Link href="/assets" className="text-sm hover:underline">Assets</Link>
            <Link href="/risks" className="text-sm hover:underline">Risks</Link>
            <Link href="/controls" className="text-sm hover:underline">Controls</Link>
            <Link href="/evidence" className="text-sm hover:underline">Evidence</Link>
            <Link href="/soa" className="text-sm hover:underline">SoA</Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Overall Progress */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>ISMS Implementation Progress</CardTitle>
            <CardDescription>Track your journey to ISO 27001 certification</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span className="font-medium">{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Key Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Assets in Scope</CardDescription>
              <CardTitle className="text-3xl">{assetStats.inScope}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {assetStats.critical} critical
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Risks Identified</CardDescription>
              <CardTitle className="text-3xl">{riskStats.total}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                <span className="text-red-600">{riskStats.high} high</span> · {riskStats.pending} pending approval
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Controls Implemented</CardDescription>
              <CardTitle className="text-3xl">{controlStats.implemented}/{controlStats.applicable}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {controlStats.partial} partial · <span className="text-red-600">{controlStats.gap} gaps</span>
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Evidence Collected</CardDescription>
              <CardTitle className="text-3xl">{evidenceStats.total}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {evidenceStats.verified} verified · {evidenceStats.controlsCovered} controls covered
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Workflow Steps */}
        <h2 className="text-lg font-semibold mb-4">Implementation Phases</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <WorkflowCard
            title="Context & Scope"
            description="Organization profile and ISMS scope definition"
            status={phases.intake.status}
            progress={phases.intake.progress}
            href="/intake"
            actionLabel="View Scope"
          />
          <WorkflowCard
            title="Asset Register"
            description="Information assets within scope"
            status={phases.assets.status}
            progress={phases.assets.progress}
            href="/assets"
            actionLabel={assetStats.total > 0 ? "Manage Assets" : "Add Assets"}
          />
          <WorkflowCard
            title="Risk Assessment"
            description="Threats, vulnerabilities, and risk treatment"
            status={phases.risks.status}
            progress={phases.risks.progress}
            href="/risks"
            actionLabel={riskStats.pending > 0 ? "Review Risks" : "Manage Risks"}
          />
          <WorkflowCard
            title="Controls"
            description="Annex A controls and implementation status"
            status={phases.controls.status}
            progress={phases.controls.progress}
            href="/controls"
            actionLabel={controlStats.gap > 0 ? "Address Gaps" : "View Controls"}
          />
          <WorkflowCard
            title="Evidence"
            description="Artifacts supporting control implementation"
            status={phases.evidence.status}
            progress={phases.evidence.progress}
            href="/evidence"
            actionLabel="Collect Evidence"
          />
          <WorkflowCard
            title="Statement of Applicability"
            description="SoA with full traceability"
            status={phases.soa.status}
            progress={phases.soa.progress}
            href="/soa"
            actionLabel="Review SoA"
          />
        </div>

        {/* Action Items */}
        <Card>
          <CardHeader>
            <CardTitle>Next Actions</CardTitle>
            <CardDescription>Recommended actions to progress your ISMS</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {riskStats.pending > 0 && (
                <ActionItem
                  priority="high"
                  title={`${riskStats.pending} risks awaiting approval`}
                  description="Review and approve draft risks to complete risk assessment"
                  href="/risks"
                  action="Review Risks"
                />
              )}
              {controlStats.gap > 0 && (
                <ActionItem
                  priority="high"
                  title={`${controlStats.gap} control gaps identified`}
                  description="Address implementation gaps for applicable controls"
                  href="/controls"
                  action="View Gaps"
                />
              )}
              {evidenceStats.controlsCovered < controlStats.implemented && (
                <ActionItem
                  priority="medium"
                  title="Evidence needed for implemented controls"
                  description={`${controlStats.implemented - evidenceStats.controlsCovered} implemented controls lack evidence`}
                  href="/evidence"
                  action="Upload Evidence"
                />
              )}
              {riskStats.pending === 0 && controlStats.gap === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  Great progress! Continue collecting evidence and preparing for audit.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

function WorkflowCard({
  title,
  description,
  status,
  progress,
  href,
  actionLabel
}: {
  title: string
  description: string
  status: 'complete' | 'in_progress' | 'pending'
  progress: number
  href: string
  actionLabel: string
}) {
  const statusColors = {
    complete: 'bg-green-100 text-green-800',
    in_progress: 'bg-blue-100 text-blue-800',
    pending: 'bg-gray-100 text-gray-800'
  }

  const statusLabels = {
    complete: 'Complete',
    in_progress: 'In Progress',
    pending: 'Not Started'
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Badge className={statusColors[status]}>
            {statusLabels[status]}
          </Badge>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Progress value={progress} className="h-2" />
          <Link href={href}>
            <Button variant="outline" size="sm" className="w-full">
              {actionLabel}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

function ActionItem({
  priority,
  title,
  description,
  href,
  action
}: {
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  href: string
  action: string
}) {
  const priorityColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-blue-100 text-blue-800'
  }

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-3">
        <Badge className={priorityColors[priority]} variant="secondary">
          {priority.charAt(0).toUpperCase() + priority.slice(1)}
        </Badge>
        <div>
          <p className="font-medium text-sm">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Link href={href}>
        <Button size="sm" variant="outline">{action}</Button>
      </Link>
    </div>
  )
}
