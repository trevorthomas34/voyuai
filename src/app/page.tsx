import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Voyu</h1>
            <p className="text-sm text-muted-foreground">ISO 27001 ISMS Platform</p>
          </div>
          <div className="space-x-4">
            <Link href="/login">
              <Button variant="outline">Log In</Button>
            </Link>
            <Link href="/intake">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center mb-16 bg-gradient-to-b from-purple-950/50 to-transparent rounded-3xl p-12">
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            AI-Powered ISO 27001 Certification
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Build your ISMS in days, not months. Voyu automates 70-80% of the consultant work
            while maintaining audit-defensible documentation.
          </p>
          <div className="space-x-4">
            <Link href="/intake">
              <Button size="lg">Start Your ISMS Journey</Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg">Learn More</Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div id="features" className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card>
            <CardHeader>
              <CardTitle>Context Intake</CardTitle>
              <CardDescription>15-question assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Our AI agent analyzes your organization profile to draft an ISMS scope,
                identify interested parties, and map regulatory requirements.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment</CardTitle>
              <CardDescription>Asset-based risk register</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Automatically identify assets, threats, and vulnerabilities.
                Map risks to ISO 27001 Annex A controls with AI-generated recommendations.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Policy Generation</CardTitle>
              <CardDescription>ISO-aligned documentation</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Generate policies and procedures from approved templates.
                Direct integration with Google Workspace for document management.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Evidence Management</CardTitle>
              <CardDescription>Stage 1 & 2 ready</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Track evidence requirements, identify gaps, and link artifacts
                to controls. Classify evidence by audit stage readiness.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statement of Applicability</CardTitle>
              <CardDescription>Auto-generated SoA</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Build your SoA with full traceability to risks and evidence.
                AI drafts justifications referencing your specific context.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Audit Readiness</CardTitle>
              <CardDescription>Pre-audit health check</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Our Audit Agent thinks like a grumpy auditor. Get readiness scores,
                predicted questions, and remediation punch lists.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Workflow Section */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8">How It Works</h3>
          <div className="grid md:grid-cols-5 gap-4 text-center">
            <WorkflowStep number={1} title="Intake" description="Answer questions about your organization" />
            <WorkflowStep number={2} title="Risks" description="Identify assets, threats, and risks" />
            <WorkflowStep number={3} title="Controls" description="Map controls and generate policies" />
            <WorkflowStep number={4} title="Evidence" description="Collect and link evidence" />
            <WorkflowStep number={5} title="Audit" description="Review readiness and prepare" />
          </div>
          <p className="text-center text-muted-foreground mt-8">
            <strong>Human approval required</strong> at each stage.
            AI drafts, you decide.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">Voyu</p>
              <p className="text-sm text-muted-foreground">ISO 27001 made simple</p>
            </div>
            <div className="text-sm text-muted-foreground">
              Built for cloud-first SMBs (40-200 people)
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function WorkflowStep({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold mb-3">
        {number}
      </div>
      <h4 className="font-medium mb-1">{title}</h4>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
