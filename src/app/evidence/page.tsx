'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  mockEvidence,
  evidenceTypeConfig,
  stageConfig,
  type MockEvidence,
  type EvidenceType
} from '@/lib/mock-data'
import { annexAControls, getControlStats } from '@/lib/controls-data'

export default function EvidencePage() {
  const [evidence, setEvidence] = useState<MockEvidence[]>(mockEvidence)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<EvidenceType | 'all'>('all')
  const [stageFilter, setStageFilter] = useState<'all' | 'stage_1' | 'stage_2' | 'both'>('all')
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [selectedEvidence, setSelectedEvidence] = useState<MockEvidence | null>(null)

  // Filter evidence
  const filteredEvidence = evidence.filter(e => {
    const matchesSearch =
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.control_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.control_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || e.evidence_type === typeFilter
    const matchesStage = stageFilter === 'all' || e.stage_acceptable === stageFilter || e.stage_acceptable === 'both'
    return matchesSearch && matchesType && matchesStage
  })

  // Calculate stats
  const controlStats = getControlStats(annexAControls)
  const controlsWithEvidence = new Set(evidence.map(e => e.control_id))
  const applicableControls = annexAControls.filter(c => c.applicable)
  const implementedControls = applicableControls.filter(c => c.implementation_status === 'implemented')

  const gapControls = applicableControls.filter(c =>
    c.implementation_status === 'implemented' && !controlsWithEvidence.has(c.control_id)
  )

  const stage1Evidence = evidence.filter(e => e.stage_acceptable === 'stage_1' || e.stage_acceptable === 'both')
  const stage2Evidence = evidence.filter(e => e.stage_acceptable === 'stage_2' || e.stage_acceptable === 'both')

  const coveragePercent = implementedControls.length > 0
    ? Math.round((controlsWithEvidence.size / implementedControls.length) * 100)
    : 0

  const handleUpload = (data: Partial<MockEvidence>) => {
    const newEvidence: MockEvidence = {
      id: String(Date.now()),
      control_id: data.control_id || '',
      control_name: annexAControls.find(c => c.control_id === data.control_id)?.name || '',
      name: data.name || '',
      description: data.description || null,
      evidence_type: data.evidence_type || 'other',
      file_url: null, // Would be set by actual upload
      stage_acceptable: data.stage_acceptable || 'stage_2',
      uploaded_by: 'Current User',
      uploaded_at: new Date().toISOString(),
      verified: false
    }
    setEvidence(prev => [...prev, newEvidence])
    setUploadDialogOpen(false)
  }

  const handleVerify = (evidenceId: string) => {
    setEvidence(prev => prev.map(e =>
      e.id === evidenceId ? { ...e, verified: true } : e
    ))
    setSelectedEvidence(null)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Voyu</h1>
            <p className="text-sm text-muted-foreground">Evidence Management</p>
          </div>
          <nav className="flex items-center space-x-4">
            <Link href="/dashboard" className="text-sm hover:underline">Dashboard</Link>
            <Link href="/assets" className="text-sm hover:underline">Assets</Link>
            <Link href="/risks" className="text-sm hover:underline">Risks</Link>
            <Link href="/controls" className="text-sm hover:underline">Controls</Link>
            <Link href="/evidence" className="text-sm font-medium">Evidence</Link>
            <Link href="/soa" className="text-sm hover:underline">SoA</Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Evidence</CardDescription>
              <CardTitle className="text-3xl">{evidence.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Controls Covered</CardDescription>
              <CardTitle className="text-3xl">{controlsWithEvidence.size}/{implementedControls.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Evidence Gaps</CardDescription>
              <CardTitle className="text-3xl text-red-600">{gapControls.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Verified</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {evidence.filter(e => e.verified).length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Coverage Progress */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-1">
                <h3 className="font-medium">Evidence Coverage</h3>
                <p className="text-sm text-muted-foreground">
                  {controlsWithEvidence.size} of {implementedControls.length} implemented controls have evidence
                </p>
              </div>
              <Button onClick={() => setUploadDialogOpen(true)}>+ Upload Evidence</Button>
            </div>
            <Progress value={coveragePercent} className="h-3" />
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                placeholder="Search evidence or controls..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="md:w-64"
              />
              <Select value={typeFilter} onValueChange={v => setTypeFilter(v as EvidenceType | 'all')}>
                <SelectTrigger className="md:w-40">
                  <SelectValue placeholder="Evidence type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(evidenceTypeConfig).map(([value, config]) => (
                    <SelectItem key={value} value={value}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={stageFilter} onValueChange={v => setStageFilter(v as 'all' | 'stage_1' | 'stage_2' | 'both')}>
                <SelectTrigger className="md:w-40">
                  <SelectValue placeholder="Audit stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  <SelectItem value="stage_1">Stage 1</SelectItem>
                  <SelectItem value="stage_2">Stage 2</SelectItem>
                  <SelectItem value="both">Both Stages</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Evidence Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Evidence ({evidence.length})</TabsTrigger>
            <TabsTrigger value="gaps">Gaps ({gapControls.length})</TabsTrigger>
            <TabsTrigger value="stage1">Stage 1 ({stage1Evidence.length})</TabsTrigger>
            <TabsTrigger value="stage2">Stage 2 ({stage2Evidence.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <EvidenceTable
              evidence={filteredEvidence}
              onSelect={setSelectedEvidence}
            />
          </TabsContent>

          <TabsContent value="gaps">
            <Card>
              <CardHeader>
                <CardTitle>Evidence Gaps</CardTitle>
                <CardDescription>
                  Implemented controls that need supporting evidence
                </CardDescription>
              </CardHeader>
              <CardContent>
                {gapControls.length > 0 ? (
                  <div className="space-y-3">
                    {gapControls.map(control => (
                      <div
                        key={control.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <span className="font-mono text-sm mr-2">{control.control_id}</span>
                          <span className="font-medium">{control.name}</span>
                          <p className="text-sm text-muted-foreground">{control.intent}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            setUploadDialogOpen(true)
                          }}
                        >
                          Upload
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    All implemented controls have evidence.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stage1">
            <Card>
              <CardHeader>
                <CardTitle>Stage 1 Evidence</CardTitle>
                <CardDescription>
                  Documentation review evidence (policies, procedures, ISMS documentation)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EvidenceTable
                  evidence={stage1Evidence}
                  onSelect={setSelectedEvidence}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stage2">
            <Card>
              <CardHeader>
                <CardTitle>Stage 2 Evidence</CardTitle>
                <CardDescription>
                  Implementation evidence (screenshots, logs, configurations, reports)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EvidenceTable
                  evidence={stage2Evidence}
                  onSelect={setSelectedEvidence}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Upload Dialog */}
      <UploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        controls={applicableControls}
        onUpload={handleUpload}
      />

      {/* Evidence Detail Dialog */}
      <Dialog open={!!selectedEvidence} onOpenChange={() => setSelectedEvidence(null)}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedEvidence && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedEvidence.name}</DialogTitle>
                <DialogDescription>
                  Evidence for {selectedEvidence.control_id} - {selectedEvidence.control_name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Type</Label>
                    <Badge className={evidenceTypeConfig[selectedEvidence.evidence_type].color}>
                      {evidenceTypeConfig[selectedEvidence.evidence_type].label}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Stage</Label>
                    <Badge className={stageConfig[selectedEvidence.stage_acceptable].color}>
                      {stageConfig[selectedEvidence.stage_acceptable].label}
                    </Badge>
                  </div>
                </div>
                {selectedEvidence.description && (
                  <div>
                    <Label className="text-muted-foreground">Description</Label>
                    <p className="text-sm mt-1">{selectedEvidence.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Uploaded By</Label>
                    <p className="text-sm">{selectedEvidence.uploaded_by}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Uploaded</Label>
                    <p className="text-sm">
                      {new Date(selectedEvidence.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Verification Status</Label>
                  <div className="mt-1">
                    {selectedEvidence.verified ? (
                      <Badge className="bg-green-100 text-green-800">Verified</Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800">Pending Verification</Badge>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedEvidence(null)}>
                  Close
                </Button>
                {!selectedEvidence.verified && (
                  <Button onClick={() => handleVerify(selectedEvidence.id)}>
                    Mark as Verified
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function EvidenceTable({
  evidence,
  onSelect
}: {
  evidence: MockEvidence[]
  onSelect: (e: MockEvidence) => void
}) {
  if (evidence.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No evidence found.
      </p>
    )
  }

  return (
    <div className="border rounded-lg overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-24">Control</TableHead>
            <TableHead>Evidence Name</TableHead>
            <TableHead className="w-28">Type</TableHead>
            <TableHead className="w-24">Stage</TableHead>
            <TableHead className="w-24">Status</TableHead>
            <TableHead className="w-28">Uploaded</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {evidence.map(e => (
            <TableRow
              key={e.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onSelect(e)}
            >
              <TableCell className="font-mono text-sm">{e.control_id}</TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{e.name}</div>
                  {e.description && (
                    <div className="text-xs text-muted-foreground truncate max-w-xs">
                      {e.description}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge className={evidenceTypeConfig[e.evidence_type].color}>
                  {evidenceTypeConfig[e.evidence_type].label}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={stageConfig[e.stage_acceptable].color}>
                  {stageConfig[e.stage_acceptable].label}
                </Badge>
              </TableCell>
              <TableCell>
                {e.verified ? (
                  <Badge className="bg-green-100 text-green-800">Verified</Badge>
                ) : (
                  <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(e.uploaded_at).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function UploadDialog({
  open,
  onOpenChange,
  controls,
  onUpload
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  controls: { control_id: string; name: string }[]
  onUpload: (data: Partial<MockEvidence>) => void
}) {
  const [formData, setFormData] = useState<Partial<MockEvidence>>({
    evidence_type: 'policy',
    stage_acceptable: 'stage_2'
  })

  const handleSubmit = () => {
    if (!formData.control_id || !formData.name) return
    onUpload(formData)
    setFormData({ evidence_type: 'policy', stage_acceptable: 'stage_2' })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Evidence</DialogTitle>
          <DialogDescription>
            Add evidence to support control implementation
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="control">Control *</Label>
            <Select
              value={formData.control_id}
              onValueChange={v => setFormData(prev => ({ ...prev, control_id: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select control" />
              </SelectTrigger>
              <SelectContent>
                {controls.map(c => (
                  <SelectItem key={c.control_id} value={c.control_id}>
                    {c.control_id} - {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Evidence Name *</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Access Control Policy v2.0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of this evidence..."
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Evidence Type</Label>
              <Select
                value={formData.evidence_type}
                onValueChange={v => setFormData(prev => ({ ...prev, evidence_type: v as EvidenceType }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(evidenceTypeConfig).map(([value, config]) => (
                    <SelectItem key={value} value={value}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Audit Stage</Label>
              <Select
                value={formData.stage_acceptable}
                onValueChange={v => setFormData(prev => ({ ...prev, stage_acceptable: v as MockEvidence['stage_acceptable'] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stage_1">Stage 1 (Documentation)</SelectItem>
                  <SelectItem value="stage_2">Stage 2 (Implementation)</SelectItem>
                  <SelectItem value="both">Both Stages</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>File Upload</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Drag and drop a file here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                (File upload will connect to Google Drive in production)
              </p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formData.control_id || !formData.name}
          >
            Upload Evidence
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
