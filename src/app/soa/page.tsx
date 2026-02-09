'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AppHeader } from '@/components/layout/app-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  annexAControls,
  implementationStatusConfig,
  controlThemeLabels,
  type ControlData
} from '@/lib/controls-data'
import { getRisks, type RiskWithAsset } from '@/lib/data/risks'
import { getOrganizationControls, type ControlWithStatus } from '@/lib/data/controls'
import { getSoARecords, lockSoAForAudit, type SoARecordWithControl } from '@/lib/data/soa'
import type { ControlTheme } from '@/types/database'

interface SoARecord extends ControlData {
  linkedRisks: string[]
  linkedEvidence: string[]
  lockedForAudit: boolean
}

export default function SoAPage() {
  const [records, setRecords] = useState<SoARecord[]>([])
  const [risks, setRisks] = useState<RiskWithAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [themeFilter, setThemeFilter] = useState<ControlTheme | 'all'>('all')
  const [applicableFilter, setApplicableFilter] = useState<'all' | 'applicable' | 'not_applicable'>('all')
  const [lockDialogOpen, setLockDialogOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<SoARecord | null>(null)

  // Fetch data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [controlsData, risksData, soaRecordsData] = await Promise.all([
          getOrganizationControls(),
          getRisks(),
          getSoARecords().catch(() => [] as SoARecordWithControl[]) // Handle case where no SoA records exist yet
        ])

        // Create a map of SoA records by control ID
        const soaMap = new Map(soaRecordsData.map(r => [r.control_id, r]))

        // Create a map of organization controls by ID for status lookup
        const controlStatusMap = new Map(controlsData.map(c => [c.id, c]))

        // Merge Annex A controls with organization-specific data and SoA records
        const mergedRecords: SoARecord[] = annexAControls.map(control => {
          const orgControl = controlStatusMap.get(control.id)
          const soaRecord = soaMap.get(control.id)

          return {
            ...control,
            applicable: orgControl?.applicable ?? control.applicable,
            justification: orgControl?.justification ?? control.justification,
            implementation_status: orgControl?.implementation_status ?? control.implementation_status,
            linkedRisks: soaRecord?.linked_risks ?? [],
            linkedEvidence: soaRecord?.linked_evidence ?? [],
            lockedForAudit: soaRecord?.locked_for_audit ?? false
          }
        })

        setRecords(mergedRecords)
        setRisks(risksData)
      } catch (error) {
        console.error('Failed to fetch SoA data:', error)
        // Fall back to mock data from annexAControls
        setRecords(annexAControls.map(control => ({
          ...control,
          linkedRisks: [],
          linkedEvidence: [],
          lockedForAudit: false
        })))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter records
  const filteredRecords = records.filter(record => {
    const matchesSearch =
      record.control_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTheme = themeFilter === 'all' || record.theme === themeFilter
    const matchesApplicable =
      applicableFilter === 'all' ||
      (applicableFilter === 'applicable' && record.applicable) ||
      (applicableFilter === 'not_applicable' && !record.applicable)
    return matchesSearch && matchesTheme && matchesApplicable
  })

  // Calculate stats
  const applicable = records.filter(c => c.applicable)
  const stats = {
    total: records.length,
    applicable: applicable.length,
    notApplicable: records.length - applicable.length,
    implemented: applicable.filter(c => c.implementation_status === 'implemented').length,
    partial: applicable.filter(c => c.implementation_status === 'partial').length,
    gap: applicable.filter(c => c.implementation_status === 'gap').length
  }

  const completeness = stats.applicable > 0
    ? Math.round(((stats.implemented + stats.partial) / stats.applicable) * 100)
    : 0

  const lockedCount = records.filter(r => r.lockedForAudit).length
  const isFullyLocked = lockedCount === records.length

  const handleLockForAudit = async () => {
    try {
      await lockSoAForAudit()
      setRecords(prev => prev.map(r => ({ ...r, lockedForAudit: true })))
      setLockDialogOpen(false)
    } catch (error) {
      console.error('Failed to lock SoA:', error)
      // Fall back to local state update
      setRecords(prev => prev.map(r => ({ ...r, lockedForAudit: true })))
      setLockDialogOpen(false)
    }
  }

  const handleUnlock = (recordId: string) => {
    setRecords(prev => prev.map(r =>
      r.id === recordId ? { ...r, lockedForAudit: false } : r
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader subtitle="Statement of Applicability" currentPage="soa" />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading SoA...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader subtitle="Statement of Applicability" currentPage="soa" />

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
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
              <CardDescription>Not Applicable</CardDescription>
              <CardTitle className="text-3xl">{stats.notApplicable}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Locked for Audit</CardDescription>
              <CardTitle className="text-3xl">{lockedCount}/{stats.total}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* SoA Completeness */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-1">
                <h3 className="font-medium">SoA Completeness</h3>
                <p className="text-sm text-muted-foreground">
                  {stats.implemented} implemented + {stats.partial} partial of {stats.applicable} applicable controls
                </p>
              </div>
              <Button
                onClick={() => setLockDialogOpen(true)}
                disabled={isFullyLocked}
                variant={isFullyLocked ? 'secondary' : 'default'}
              >
                {isFullyLocked ? 'Locked for Audit' : 'Lock SoA for Audit'}
              </Button>
            </div>
            <Progress value={completeness} className="h-3" />
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
              <Select value={themeFilter} onValueChange={v => setThemeFilter(v as ControlTheme | 'all')}>
                <SelectTrigger className="md:w-48">
                  <SelectValue placeholder="Theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Themes</SelectItem>
                  {Object.entries(controlThemeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
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
              <Button variant="outline" className="ml-auto">
                Export to CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* SoA Table */}
        <Card>
          <CardHeader>
            <CardTitle>Statement of Applicability</CardTitle>
            <CardDescription>
              ISO 27001:2022 Annex A control applicability with risk and evidence traceability
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">Control</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="w-24">Applicable</TableHead>
                    <TableHead>Justification</TableHead>
                    <TableHead className="w-28">Status</TableHead>
                    <TableHead className="w-24">Risks</TableHead>
                    <TableHead className="w-24">Evidence</TableHead>
                    <TableHead className="w-20">Locked</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map(record => (
                    <TableRow
                      key={record.id}
                      className={`cursor-pointer hover:bg-muted/50 ${!record.applicable ? 'opacity-60' : ''}`}
                      onClick={() => setSelectedRecord(record)}
                    >
                      <TableCell className="font-mono text-sm">{record.control_id}</TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <div className="font-medium truncate">{record.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {record.applicable ? (
                          <Badge variant="default">Yes</Badge>
                        ) : (
                          <Badge variant="secondary">No</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs text-sm text-muted-foreground truncate">
                          {record.justification || (record.applicable ? '-' : 'Required')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={implementationStatusConfig[record.implementation_status].color}>
                          {implementationStatusConfig[record.implementation_status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {record.linkedRisks.length > 0 ? (
                          <Badge variant="outline">{record.linkedRisks.length}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {record.linkedEvidence.length > 0 ? (
                          <Badge variant="outline">{record.linkedEvidence.length}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {record.lockedForAudit ? (
                          <Badge className="bg-blue-100 text-blue-800">Locked</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {filteredRecords.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No controls match your filters.
              </p>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Lock Confirmation Dialog */}
      <Dialog open={lockDialogOpen} onOpenChange={setLockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lock SoA for Audit</DialogTitle>
            <DialogDescription>
              Locking the Statement of Applicability will prevent further changes until unlocked.
              This action will be recorded in the audit log.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Controls:</span>
                <span className="font-medium">{stats.total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Applicable:</span>
                <span className="font-medium">{stats.applicable}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Implemented:</span>
                <span className="font-medium text-green-600">{stats.implemented}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Gaps:</span>
                <span className="font-medium text-red-600">{stats.gap}</span>
              </div>
            </div>
            {stats.gap > 0 && (
              <p className="text-sm text-yellow-600">
                Warning: There are {stats.gap} control gaps that should be addressed before the audit.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLockDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleLockForAudit}>
              Lock for Audit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Detail Dialog */}
      <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedRecord && (
            <>
              <DialogHeader>
                <DialogTitle>
                  <span className="font-mono">{selectedRecord.control_id}</span> - {selectedRecord.name}
                </DialogTitle>
                <DialogDescription>
                  {selectedRecord.intent}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Applicable</Label>
                    <p className="font-medium">{selectedRecord.applicable ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Implementation Status</Label>
                    <Badge className={implementationStatusConfig[selectedRecord.implementation_status].color}>
                      {implementationStatusConfig[selectedRecord.implementation_status].label}
                    </Badge>
                  </div>
                </div>

                {selectedRecord.justification && (
                  <div>
                    <Label className="text-muted-foreground">Justification</Label>
                    <p className="text-sm mt-1">{selectedRecord.justification}</p>
                  </div>
                )}

                <div>
                  <Label className="text-muted-foreground">Linked Risks</Label>
                  {selectedRecord.linkedRisks.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedRecord.linkedRisks.map(riskId => {
                        const risk = risks.find(r => r.id === riskId)
                        return (
                          <Badge key={riskId} variant="outline">
                            {risk?.threat.substring(0, 30)}...
                          </Badge>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No linked risks</p>
                  )}
                </div>

                <div>
                  <Label className="text-muted-foreground">Linked Evidence</Label>
                  {selectedRecord.linkedEvidence.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedRecord.linkedEvidence.map(evidenceId => (
                        <Badge key={evidenceId} variant="outline">
                          Evidence #{evidenceId}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No linked evidence</p>
                  )}
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="locked"
                    checked={selectedRecord.lockedForAudit}
                    disabled
                  />
                  <Label htmlFor="locked" className="font-normal">
                    Locked for audit
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedRecord(null)}>
                  Close
                </Button>
                <Link href="/controls">
                  <Button>Edit in Controls</Button>
                </Link>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
