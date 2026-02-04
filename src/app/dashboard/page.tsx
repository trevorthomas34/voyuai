import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'

// This would be fetched from the database in a real app
const mockProgress = {
  intake: { status: 'complete', progress: 100 },
  risks: { status: 'in_progress', progress: 45 },
  controls: { status: 'pending', progress: 0 },
  evidence: { status: 'pending', progress: 0 },
  soa: { status: 'pending', progress: 0 },
  audit: { status: 'pending', progress: 0 }
}

export default function DashboardPage() {
  const overallProgress = Math.round(
    Object.values(mockProgress).reduce((sum, p) => sum + p.progress, 0) / 6
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
            <Link href="/intake" className="text-sm hover:underline">Intake</Link>
            <Link href="/risks" className="text-sm hover:underline">Risks</Link>
            <Link href="/controls" className="text-sm hover:underline">Controls</Link>
            <Link href="/evidence" className="text-sm hover:underline">Evidence</Link>
            <Link href="/soa" className="text-sm hover:underline">SoA</Link>
            <Link href="/audit" className="text-sm hover:underline">Audit</Link>
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

        {/* Workflow Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <WorkflowCard
            title="Context Intake"
            description="Organization profile and ISMS scope"
            status={mockProgress.intake.status}
            progress={mockProgress.intake.progress}
            href="/intake"
            actionLabel="View Scope"
          />
          <WorkflowCard
            title="Risk Assessment"
            description="Assets, threats, and risk register"
            status={mockProgress.risks.status}
            progress={mockProgress.risks.progress}
            href="/risks"
            actionLabel="Continue Assessment"
          />
          <WorkflowCard
            title="Controls & Policies"
            description="Annex A controls and documentation"
            status={mockProgress.controls.status}
            progress={mockProgress.controls.progress}
            href="/controls"
            actionLabel="Start Controls"
          />
          <WorkflowCard
            title="Evidence Collection"
            description="Artifacts and gap analysis"
            status={mockProgress.evidence.status}
            progress={mockProgress.evidence.progress}
            href="/evidence"
            actionLabel="Collect Evidence"
          />
          <WorkflowCard
            title="Statement of Applicability"
            description="SoA with traceability"
            status={mockProgress.soa.status}
            progress={mockProgress.soa.progress}
            href="/soa"
            actionLabel="Build SoA"
          />
          <WorkflowCard
            title="Audit Readiness"
            description="Readiness score and preparation"
            status={mockProgress.audit.status}
            progress={mockProgress.audit.progress}
            href="/audit"
            actionLabel="Check Readiness"
          />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm">Add Asset</Button>
              <Button variant="outline" size="sm">Add Risk</Button>
              <Button variant="outline" size="sm">Upload Evidence</Button>
              <Button variant="outline" size="sm">View Approval Log</Button>
              <Button variant="outline" size="sm">Export Audit Pack</Button>
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
  status: string
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
          <Badge className={statusColors[status as keyof typeof statusColors]}>
            {statusLabels[status as keyof typeof statusLabels]}
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
