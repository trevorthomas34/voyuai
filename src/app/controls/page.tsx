'use client'

import { useState } from 'react'
import Link from 'next/link'
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
  annexAControls,
  controlThemeLabels,
  controlThemeDescriptions,
  implementationStatusConfig,
  getControlsByTheme,
  getControlStats,
  type ControlData
} from '@/lib/controls-data'
import type { ControlTheme, ImplementationStatus } from '@/types/database'

export default function ControlsPage() {
  const [controls, setControls] = useState<ControlData[]>(annexAControls)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<ImplementationStatus | 'all'>('all')
  const [applicableFilter, setApplicableFilter] = useState<'all' | 'applicable' | 'not_applicable'>('all')
  const [editingControl, setEditingControl] = useState<ControlData | null>(null)

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

  const stats = getControlStats(controls)
  const implementedPercentage = stats.applicable > 0
    ? Math.round((stats.implemented / stats.applicable) * 100)
    : 0

  const handleUpdateControl = (updatedControl: ControlData) => {
    setControls(prev => prev.map(c =>
      c.id === updatedControl.id ? updatedControl : c
    ))
    setEditingControl(null)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Voyu</h1>
            <p className="text-sm text-muted-foreground">Annex A Controls</p>
          </div>
          <nav className="flex items-center space-x-4">
            <Link href="/dashboard" className="text-sm hover:underline">Dashboard</Link>
            <Link href="/assets" className="text-sm hover:underline">Assets</Link>
            <Link href="/risks" className="text-sm hover:underline">Risks</Link>
            <Link href="/controls" className="text-sm font-medium">Controls</Link>
            <Link href="/soa" className="text-sm hover:underline">SoA</Link>
          </nav>
        </div>
      </header>

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
    </div>
  )
}

function ControlCard({ control, onEdit }: { control: ControlData; onEdit: () => void }) {
  return (
    <div
      className={`p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
        !control.applicable ? 'opacity-60' : ''
      }`}
      onClick={onEdit}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
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
        <div className="flex items-center gap-2">
          {!control.applicable && (
            <Badge variant="outline">N/A</Badge>
          )}
          <Badge className={implementationStatusConfig[control.implementation_status].color}>
            {implementationStatusConfig[control.implementation_status].label}
          </Badge>
        </div>
      </div>
    </div>
  )
}

function ControlEditDialog({
  control,
  onOpenChange,
  onSave
}: {
  control: ControlData | null
  onOpenChange: () => void
  onSave: (control: ControlData) => void
}) {
  const [applicable, setApplicable] = useState(control?.applicable ?? true)
  const [justification, setJustification] = useState(control?.justification || '')
  const [status, setStatus] = useState<ImplementationStatus>(control?.implementation_status || 'gap')

  // Update local state when control changes
  if (control && (applicable !== control.applicable || status !== control.implementation_status)) {
    // Only reset if control changed
  }

  const handleSave = () => {
    if (!control) return
    onSave({
      ...control,
      applicable,
      justification: justification || null,
      implementation_status: applicable ? status : 'not_applicable'
    })
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
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
