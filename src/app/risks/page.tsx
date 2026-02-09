'use client'

import { useState, useEffect } from 'react'
import { AppHeader } from '@/components/layout/app-header'
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
import { riskLevelConfig } from '@/lib/mock-data'
import { getRisks, createRisk, updateRisk, deleteRisk as deleteRiskApi, approveRisk, type RiskWithAsset } from '@/lib/data/risks'
import { getAssets, type Asset } from '@/lib/data/assets'
import type { RiskLevel, StatusType } from '@/types/database'

export default function RisksPage() {
  const [risks, setRisks] = useState<RiskWithAsset[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [levelFilter, setLevelFilter] = useState<RiskLevel | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<StatusType | 'all'>('all')

  const [formOpen, setFormOpen] = useState(false)
  const [editingRisk, setEditingRisk] = useState<RiskWithAsset | null>(null)
  const [deletingRisk, setDeletingRisk] = useState<RiskWithAsset | null>(null)
  const [approvingRisk, setApprovingRisk] = useState<RiskWithAsset | null>(null)

  // Fetch data on mount
  useEffect(() => {
    Promise.all([getRisks(), getAssets()])
      .then(([risksData, assetsData]) => {
        setRisks(risksData)
        setAssets(assetsData)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

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

  const handleEditRisk = (risk: RiskWithAsset) => {
    setEditingRisk(risk)
    setFormOpen(true)
  }

  const handleSaveRisk = async (riskData: Partial<RiskWithAsset>) => {
    try {
      if (riskData.id) {
        // Update existing - revert to draft status
        const updated = await updateRisk(riskData.id, {
          ...riskData,
          status: 'draft',
          approved_by: null,
          approved_at: null
        })
        // Get asset name for display
        const asset = assets.find(a => a.id === updated.asset_id)
        setRisks(prev => prev.map(r =>
          r.id === updated.id ? { ...updated, asset_name: asset?.name } : r
        ))
      } else {
        // Add new
        const created = await createRisk({
          asset_id: riskData.asset_id || null,
          threat: riskData.threat || '',
          vulnerability: riskData.vulnerability || null,
          impact: riskData.impact || 'medium',
          likelihood: riskData.likelihood || 'medium',
          risk_level: riskData.risk_level || 'medium',
          treatment: riskData.treatment || 'mitigate',
          treatment_plan: riskData.treatment_plan || null
        })
        // Get asset name for display
        const asset = assets.find(a => a.id === created.asset_id)
        setRisks(prev => [{ ...created, asset_name: asset?.name }, ...prev])
      }
      setFormOpen(false)
    } catch (error) {
      console.error('Failed to save risk:', error)
    }
  }

  const handleDeleteRisk = (risk: RiskWithAsset) => {
    setDeletingRisk(risk)
  }

  const confirmDelete = async () => {
    if (deletingRisk) {
      try {
        await deleteRiskApi(deletingRisk.id)
        setRisks(prev => prev.filter(r => r.id !== deletingRisk.id))
        setDeletingRisk(null)
      } catch (error) {
        console.error('Failed to delete risk:', error)
      }
    }
  }

  const handleApproveRisk = (risk: RiskWithAsset) => {
    setApprovingRisk(risk)
  }

  const confirmApproval = async (riskId: string, comment: string) => {
    try {
      const approved = await approveRisk(riskId, comment)
      // Preserve asset_name
      const existingRisk = risks.find(r => r.id === riskId)
      setRisks(prev => prev.map(r =>
        r.id === riskId ? { ...approved, asset_name: existingRisk?.asset_name } : r
      ))
      setApprovingRisk(null)
    } catch (error) {
      console.error('Failed to approve risk:', error)
    }
  }

  // Stats
  const totalRisks = risks.length
  const highRisks = risks.filter(r => r.risk_level === 'high').length
  const draftRisks = risks.filter(r => r.status === 'draft').length
  const approvedRisks = risks.filter(r => r.status === 'approved').length

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader subtitle="Risk Register" currentPage="risks" />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading risks...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader subtitle="Risk Register" currentPage="risks" />

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
            {risks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No risks yet. Add your first risk assessment to get started.</p>
                <Button onClick={handleAddRisk}>+ Add Risk</Button>
              </div>
            ) : (
              <RiskTable
                risks={filteredRisks}
                onEdit={handleEditRisk}
                onDelete={handleDeleteRisk}
                onApprove={handleApproveRisk}
              />
            )}
          </CardContent>
        </Card>
      </main>

      {/* Add/Edit Form Dialog */}
      <RiskForm
        open={formOpen}
        onOpenChange={setFormOpen}
        risk={editingRisk}
        assets={assets}
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
      <Dialog open={!!deletingRisk} onOpenChange={() => setDeletingRisk(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Risk</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the risk &quot;{deletingRisk?.threat}&quot;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingRisk(null)}>
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
