'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { RiskTable } from '@/components/risks/risk-table'
import { RiskForm } from '@/components/risks/risk-form'
import { ApprovalDialog } from '@/components/risks/approval-dialog'
import {
  mockRisks,
  mockAssets,
  type MockRisk,
  riskLevelConfig
} from '@/lib/mock-data'
import type { RiskLevel, StatusType } from '@/types/database'

export default function RisksPage() {
  const [risks, setRisks] = useState<MockRisk[]>(mockRisks)
  const [searchTerm, setSearchTerm] = useState('')
  const [levelFilter, setLevelFilter] = useState<RiskLevel | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<StatusType | 'all'>('all')

  const [formOpen, setFormOpen] = useState(false)
  const [editingRisk, setEditingRisk] = useState<MockRisk | null>(null)
  const [deleteRisk, setDeleteRisk] = useState<MockRisk | null>(null)
  const [approvingRisk, setApprovingRisk] = useState<MockRisk | null>(null)

  // Filter risks
  const filteredRisks = risks.filter(risk => {
    const matchesSearch =
      risk.threat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      risk.vulnerability?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      risk.asset_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLevel = levelFilter === 'all' || risk.risk_level === levelFilter
    const matchesStatus = statusFilter === 'all' || risk.status === statusFilter
    return matchesSearch && matchesLevel && matchesStatus
  })

  const handleAddRisk = () => {
    setEditingRisk(null)
    setFormOpen(true)
  }

  const handleEditRisk = (risk: MockRisk) => {
    setEditingRisk(risk)
    setFormOpen(true)
  }

  const handleSaveRisk = (riskData: Partial<MockRisk>) => {
    if (riskData.id) {
      // Update existing
      setRisks(prev => prev.map(r =>
        r.id === riskData.id
          ? { ...r, ...riskData, status: 'draft', approved_by: null, approved_at: null, updated_at: new Date().toISOString() }
          : r
      ))
    } else {
      // Add new
      const newRisk: MockRisk = {
        id: String(Date.now()),
        asset_id: riskData.asset_id || null,
        asset_name: riskData.asset_name,
        threat: riskData.threat || '',
        vulnerability: riskData.vulnerability || null,
        impact: riskData.impact || 'medium',
        likelihood: riskData.likelihood || 'medium',
        risk_level: riskData.risk_level || 'medium',
        treatment: riskData.treatment || 'mitigate',
        treatment_plan: riskData.treatment_plan || null,
        status: 'draft',
        owner_id: null,
        approved_by: null,
        approved_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      setRisks(prev => [...prev, newRisk])
    }
  }

  const handleDeleteRisk = (risk: MockRisk) => {
    setDeleteRisk(risk)
  }

  const confirmDelete = () => {
    if (deleteRisk) {
      setRisks(prev => prev.filter(r => r.id !== deleteRisk.id))
      setDeleteRisk(null)
    }
  }

  const handleApproveRisk = (risk: MockRisk) => {
    setApprovingRisk(risk)
  }

  const confirmApproval = (riskId: string, comment: string) => {
    setRisks(prev => prev.map(r =>
      r.id === riskId
        ? {
            ...r,
            status: 'approved' as const,
            approved_by: '1', // Would be current user
            approved_at: new Date().toISOString()
          }
        : r
    ))
    // In real app, this would also create an approval_log entry
    console.log('Approval logged:', { riskId, comment })
  }

  // Stats
  const totalRisks = risks.length
  const highRisks = risks.filter(r => r.risk_level === 'high').length
  const draftRisks = risks.filter(r => r.status === 'draft').length
  const approvedRisks = risks.filter(r => r.status === 'approved').length

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Voyu</h1>
            <p className="text-sm text-muted-foreground">Risk Register</p>
          </div>
          <nav className="flex items-center space-x-4">
            <Link href="/dashboard" className="text-sm hover:underline">Dashboard</Link>
            <Link href="/assets" className="text-sm hover:underline">Assets</Link>
            <Link href="/risks" className="text-sm font-medium">Risks</Link>
            <Link href="/controls" className="text-sm hover:underline">Controls</Link>
            <Link href="/soa" className="text-sm hover:underline">SoA</Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Risks</CardDescription>
              <CardTitle className="text-3xl">{totalRisks}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>High Risks</CardDescription>
              <CardTitle className="text-3xl text-red-600">{highRisks}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pending Approval</CardDescription>
              <CardTitle className="text-3xl text-yellow-600">{draftRisks}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Approved</CardDescription>
              <CardTitle className="text-3xl text-green-600">{approvedRisks}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="flex flex-col md:flex-row gap-4">
                <Input
                  placeholder="Search risks..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="md:w-64"
                />
                <Select value={levelFilter} onValueChange={v => setLevelFilter(v as RiskLevel | 'all')}>
                  <SelectTrigger className="md:w-40">
                    <SelectValue placeholder="Risk level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {Object.entries(riskLevelConfig).map(([value, config]) => (
                      <SelectItem key={value} value={value}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={v => setStatusFilter(v as StatusType | 'all')}>
                  <SelectTrigger className="md:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddRisk}>+ Add Risk</Button>
            </div>
          </CardContent>
        </Card>

        {/* Risk Table */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Register</CardTitle>
            <CardDescription>
              Information security risks and treatment plans (ISO 27001 Clause 6.1.2)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RiskTable
              risks={filteredRisks}
              onEdit={handleEditRisk}
              onDelete={handleDeleteRisk}
              onApprove={handleApproveRisk}
            />
          </CardContent>
        </Card>
      </main>

      {/* Add/Edit Form Dialog */}
      <RiskForm
        open={formOpen}
        onOpenChange={setFormOpen}
        risk={editingRisk}
        assets={mockAssets}
        onSave={handleSaveRisk}
      />

      {/* Approval Dialog */}
      <ApprovalDialog
        open={!!approvingRisk}
        onOpenChange={() => setApprovingRisk(null)}
        risk={approvingRisk}
        onApprove={confirmApproval}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteRisk} onOpenChange={() => setDeleteRisk(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Risk</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the risk &quot;{deleteRisk?.threat}&quot;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteRisk(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
