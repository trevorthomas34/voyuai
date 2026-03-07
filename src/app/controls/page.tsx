'use client'

import { useState, useEffect } from 'react'
import { AppHeader } from '@/components/layout/app-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
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
  controlThemeLabels,
  controlThemeDescriptions,
  implementationStatusConfig,
} from '@/lib/controls-data'
import { getOrganizationControls, updateOrganizationControl, type ControlWithStatus } from '@/lib/data/controls'
import { createEvidence, getEvidence, type EvidenceWithDetails } from '@/lib/data/evidence'
import { evidenceTypeConfig } from '@/lib/mock-data'
import type { ControlTheme, ImplementationStatus } from '@/types/database'

export default function ControlsPage() {
  const [controls, setControls] = useState<ControlWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<ImplementationStatus | 'all'>('all')
  const [applicableFilter, setApplicableFilter] = useState<'all' | 'applicable' | 'not_applicable'>('all')
  const [editingControl, setEditingControl] = useState<ControlWithStatus | null>(null)
  const [evidenceControl, setEvidenceControl] = useState<ControlWithStatus | null>(null)
  const [viewingEvidenceControl, setViewingEvidenceControl] = useState<ControlWithStatus | null>(null)
  const [allEvidence, setAllEvidence] = useState<EvidenceWithDetails[]>([])

  useEffect(() => {
    Promise.allSettled([getOrganizationControls(), getEvidence()])
      .then(([controlsRes, evidenceRes]) => {
        if (controlsRes.status === 'fulfilled') setControls(controlsRes.value)
        else console.error('Failed to load controls:', controlsRes.reason)
        if (evidenceRes.status === 'fulfilled') setAllEvidence(evidenceRes.value)
        else console.error('Failed to load evidence:', evidenceRes.reason)
      })
      .finally(() => setLoading(false))
  }, [])

  // Filter controls
  const filteredControls = controls.filter(control => {
    const matchesSearch =
      control.control_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      control.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      control.intent.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || control.implementation_status === statusFilter
    const matchesApplicable =
      applicableFilter === 'all' ||
      (applicableFilter === 'applicable' && control.applicable) ||
      (applicableFilter === 'not_applicable' && !control.applicable)
    return matchesSearch && matchesStatus && matchesApplicable
  })

  const controlsByTheme = {
    organizational: filteredControls.filter(c => c.theme === 'organizational'),
    people: filteredControls.filter(c => c.theme === 'people'),
    physical: filteredControls.filter(c => c.theme === 'physical'),
    technological: filteredControls.filter(c => c.theme === 'technological')
  }

  const applicable = controls.filter(c => c.applicable)
  const stats = {
    total: controls.length,
    applicable: applicable.length,
    implemented: applicable.filter(c => c.implementation_status === 'implemented').length,
    partial: applicable.filter(c => c.implementation_status === 'partial').length,
    gap: applicable.filter(c => c.implementation_status === 'gap').length,
  }
  const implementedPercentage = stats.applicable > 0
    ? Math.round((stats.implemented / stats.applicable) * 100)
    : 0

  const handleUpdateControl = async (updatedControl: ControlWithStatus) => {
    try {
      await updateOrganizationControl(updatedControl.id, {
        applicable: updatedControl.applicable,
        justification: updatedControl.justification ?? undefined,
        implementation_status: updatedControl.implementation_status
      })
      setControls(prev => prev.map(c => c.id === updatedControl.id ? updatedControl : c))
      setEditingControl(null)
    } catch (error) {
      console.error('Failed to save control:', error)
    }
  }

  const handleOpenEvidence = (control: ControlWithStatus) => setEvidenceControl(control)
  const handleViewEvidence = (control: ControlWithStatus) => setViewingEvidenceControl(control)
  const getEvidenceForControl = (controlId: string) => allEvidence.filter(e => e.control_id === controlId)

  const handleSaveEvidence = async (data: { title: string; description?: string; evidence_type: string; stage_acceptable: 'stage_1' | 'stage_2' | 'both'; file?: File }) => {
    if (!evidenceControl) return
    try {
      let evidence_url = ''
      if (data.file) {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const ext = data.file.name.split('.').pop()
        const path = `${evidenceControl.id}/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage.from('Evidence').upload(path, data.file)
        if (uploadError) throw uploadError
        evidence_url = path
      }
      const created = await createEvidence({
        control_id: evidenceControl.id,
        title: data.title,
        description: data.description || null,
        evidence_type: data.evidence_type,
        evidence_url,
        stage_acceptable: data.stage_acceptable
      })
      setAllEvidence(prev => [{ ...created, verified: false }, ...prev])
      setEvidenceControl(null)
    } catch (error) {
      console.error('Failed to save evidence:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader subtitle="Annex A Controls" currentPage="controls" />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading controls...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader subtitle="Annex A Controls" currentPage="controls" />

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Controls</CardDescription>
              <CardTitle className="text-3xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Applicable</CardDescription>
              <CardTitle className="text-3xl">{stats.applicable}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Implemented</CardDescription>
              <CardTitle className="text-3xl text-green-600">{stats.implemented}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Partial</CardDescription>
              <CardTitle className="text-3xl text-yellow-600">{stats.partial}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Gaps</CardDescription>
              <CardTitle className="text-3xl text-red-600">{stats.gap}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Implementation Progress (applicable controls)</span>
                <span className="font-medium">{implementedPercentage}%</span>
              </div>
              <Progress value={implementedPercentage} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                placeholder="Search controls..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="md:w-64"
              />
              <Select value={statusFilter} onValueChange={v => setStatusFilter(v as ImplementationStatus | 'all')}>
                <SelectTrigger className="md:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(implementationStatusConfig).map(([value, config]) => (
                    <SelectItem key={value} value={value}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={applicableFilter} onValueChange={v => setApplicableFilter(v as 'all' | 'applicable' | 'not_applicable')}>
                <SelectTrigger className="md:w-40">
                  <SelectValue placeholder="Applicability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="applicable">Applicable</SelectItem>
                  <SelectItem value="not_applicable">Not Applicable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Controls by Theme */}
        <Tabs defaultValue="organizational" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            {(Object.keys(controlThemeLabels) as ControlTheme[]).map(theme => (
              <TabsTrigger key={theme} value={theme} className="text-xs">
                {theme.charAt(0).toUpperCase() + theme.slice(1, 4)}. ({controlsByTheme[theme].length})
              </TabsTrigger>
            ))}
          </TabsList>

          {(Object.keys(controlThemeLabels) as ControlTheme[]).map(theme => (
            <TabsContent key={theme} value={theme}>
              <Card>
                <CardHeader>
                  <CardTitle>{controlThemeLabels[theme]}</CardTitle>
                  <CardDescription>{controlThemeDescriptions[theme]}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {controlsByTheme[theme].map(control => (
                      <ControlCard
                        key={control.id}
                        control={control}
                        onEdit={() => setEditingControl(control)}
                        onAddEvidence={() => handleOpenEvidence(control)}
                        onViewEvidence={() => handleViewEvidence(control)}
                        evidenceCount={getEvidenceForControl(control.id).length}
                      />
                    ))}
                    {controlsByTheme[theme].length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No controls match your filters.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </main>

      {/* Edit Control Dialog */}
      <ControlEditDialog
        control={editingControl}
        onOpenChange={() => setEditingControl(null)}
        onSave={handleUpdateControl}
      />

      {/* View Evidence Dialog */}
      <ViewEvidenceDialog
        control={viewingEvidenceControl}
        evidence={viewingEvidenceControl ? getEvidenceForControl(viewingEvidenceControl.id) : []}
        onOpenChange={() => setViewingEvidenceControl(null)}
        onAddEvidence={() => { setEvidenceControl(viewingEvidenceControl); setViewingEvidenceControl(null) }}
      />

      {/* Add Evidence Dialog */}
      <ControlEvidenceDialog
        control={evidenceControl}
        onOpenChange={() => setEvidenceControl(null)}
        onSave={handleSaveEvidence}
      />
    </div>
  )
}

function ControlCard({ control, onEdit, onAddEvidence, onViewEvidence, evidenceCount }: { control: ControlWithStatus; onEdit: () => void; onAddEvidence: () => void; onViewEvidence: () => void; evidenceCount: number }) {
  return (
    <div
      className={`p-4 border rounded-lg hover:bg-muted/50 transition-colors ${
        !control.applicable ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 cursor-pointer" onClick={onEdit}>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-sm font-medium">{control.control_id}</span>
            <span className="font-medium">{control.name}</span>
          </div>
          <p className="text-sm text-muted-foreground">{control.intent}</p>
          {control.justification && (
            <p className="text-xs text-muted-foreground mt-1 italic">
              {control.justification}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!control.applicable && (
            <Badge variant="outline">N/A</Badge>
          )}
          <Badge className={implementationStatusConfig[control.implementation_status].color}>
            {implementationStatusConfig[control.implementation_status].label}
          </Badge>
          {control.applicable && (
            <>
              {evidenceCount > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={e => { e.stopPropagation(); onViewEvidence() }}
                >
                  Evidence ({evidenceCount})
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={e => { e.stopPropagation(); onAddEvidence() }}
              >
                + Evidence
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

async function openEvidenceFile(path: string) {
  const { createClient } = await import('@/lib/supabase/client')
  const supabase = createClient()
  const { data, error } = await supabase.storage.from('Evidence').createSignedUrl(path, 60 * 30)
  if (error || !data) { alert('Could not open file.'); return }
  window.open(data.signedUrl, '_blank')
}

function ViewEvidenceDialog({ control, evidence, onOpenChange, onAddEvidence }: {
  control: ControlWithStatus | null
  evidence: EvidenceWithDetails[]
  onOpenChange: () => void
  onAddEvidence: () => void
}) {
  if (!control) return null
  return (
    <Dialog open={!!control} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Evidence — {control.control_id}</DialogTitle>
          <DialogDescription>{control.name}</DialogDescription>
        </DialogHeader>
        <div className="py-2 space-y-2 max-h-80 overflow-y-auto">
          {evidence.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No evidence uploaded yet.</p>
          ) : (
            evidence.map(e => (
              <div key={e.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{e.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {e.evidence_type} · {e.stage_acceptable} · {new Date(e.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
                {e.evidence_url && (
                  <button
                    onClick={() => openEvidenceFile(e.evidence_url)}
                    className="text-xs text-primary underline ml-3 shrink-0"
                  >
                    View
                  </button>
                )}
              </div>
            ))
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onOpenChange}>Close</Button>
          <Button onClick={onAddEvidence}>+ Add Evidence</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ControlEvidenceDialog({
  control,
  onOpenChange,
  onSave
}: {
  control: ControlWithStatus | null
  onOpenChange: () => void
  onSave: (data: { title: string; description?: string; evidence_type: string; stage_acceptable: 'stage_1' | 'stage_2' | 'both'; file?: File }) => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [evidenceType, setEvidenceType] = useState('policy')
  const [stage, setStage] = useState<'stage_1' | 'stage_2' | 'both'>('stage_2')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleFile = (file: File) => {
    setSelectedFile(file)
    if (!title) setTitle(file.name.replace(/\.[^.]+$/, ''))
  }

  const handleSubmit = async () => {
    if (!title) return
    setSaving(true)
    await onSave({ title, description: description || undefined, evidence_type: evidenceType, stage_acceptable: stage, file: selectedFile ?? undefined })
    setSaving(false)
    setTitle(''); setDescription(''); setSelectedFile(null)
  }

  if (!control) return null

  return (
    <Dialog open={!!control} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Evidence</DialogTitle>
          <DialogDescription>
            <span className="font-mono">{control.control_id}</span> — {control.name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Evidence Name *</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Access Control Policy v2.0" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description..." rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Evidence Type</Label>
              <Select value={evidenceType} onValueChange={setEvidenceType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(evidenceTypeConfig).map(([value, config]) => (
                    <SelectItem key={value} value={value}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Audit Stage</Label>
              <Select value={stage} onValueChange={v => setStage(v as 'stage_1' | 'stage_2' | 'both')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="stage_1">Stage 1 (Documentation)</SelectItem>
                  <SelectItem value="stage_2">Stage 2 (Implementation)</SelectItem>
                  <SelectItem value="both">Both Stages</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>File (optional)</Label>
            <label
              className={`block border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${dragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/30 hover:border-primary/50'}`}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
            >
              <input type="file" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
              {selectedFile ? (
                <p className="text-sm font-medium">{selectedFile.name} <span className="text-muted-foreground">({(selectedFile.size / 1024).toFixed(1)} KB)</span></p>
              ) : (
                <p className="text-sm text-muted-foreground">Drag and drop or click to browse</p>
              )}
            </label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onOpenChange}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!title || saving}>
            {saving ? 'Saving...' : 'Add Evidence'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ControlEditDialog({
  control,
  onOpenChange,
  onSave
}: {
  control: ControlWithStatus | null
  onOpenChange: () => void
  onSave: (control: ControlWithStatus) => void
}) {
  const [applicable, setApplicable] = useState(control?.applicable ?? true)
  const [justification, setJustification] = useState(control?.justification || '')
  const [status, setStatus] = useState<ImplementationStatus>(control?.implementation_status || 'gap')

  // Update local state when control changes
  if (control && (applicable !== control.applicable || status !== control.implementation_status)) {
    // Only reset if control changed
  }

  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!control) return
    setSaving(true)
    await onSave({
      ...control,
      applicable,
      justification: justification || null,
      implementation_status: applicable ? status : 'not_applicable'
    })
    setSaving(false)
  }

  if (!control) return null

  return (
    <Dialog open={!!control} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            <span className="font-mono">{control.control_id}</span> - {control.name}
          </DialogTitle>
          <DialogDescription>
            {control.intent}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="applicable"
              checked={applicable}
              onCheckedChange={checked => setApplicable(checked === true)}
            />
            <Label htmlFor="applicable" className="font-normal cursor-pointer">
              This control is applicable to our organization
            </Label>
          </div>

          {!applicable && (
            <div className="space-y-2">
              <Label htmlFor="justification">Justification for exclusion *</Label>
              <Textarea
                id="justification"
                value={justification}
                onChange={e => setJustification(e.target.value)}
                placeholder="Explain why this control is not applicable..."
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Auditors will review this justification during the certification audit.
              </p>
            </div>
          )}

          {applicable && (
            <div className="space-y-2">
              <Label htmlFor="status">Implementation Status</Label>
              <Select value={status} onValueChange={v => setStatus(v as ImplementationStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="implemented">Implemented</SelectItem>
                  <SelectItem value="partial">Partially Implemented</SelectItem>
                  <SelectItem value="gap">Gap (Not Implemented)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {applicable && (
            <div className="space-y-2">
              <Label htmlFor="notes">Implementation Notes</Label>
              <Textarea
                id="notes"
                value={justification}
                onChange={e => setJustification(e.target.value)}
                placeholder="Add notes about how this control is implemented..."
                rows={3}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onOpenChange}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
