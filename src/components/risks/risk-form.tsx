'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { RiskMatrix } from './risk-matrix'
import { calculateRiskLevel, type MockRisk, type MockAsset, treatmentLabels } from '@/lib/mock-data'
import type { RiskLevel, TreatmentType } from '@/types/database'

interface RiskFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  risk?: MockRisk | null
  assets: MockAsset[]
  onSave: (risk: Partial<MockRisk>) => void
}

export function RiskForm({ open, onOpenChange, risk, assets, onSave }: RiskFormProps) {
  const [assetId, setAssetId] = useState<string | null>(risk?.asset_id || null)
  const [threat, setThreat] = useState(risk?.threat || '')
  const [vulnerability, setVulnerability] = useState(risk?.vulnerability || '')
  const [impact, setImpact] = useState<RiskLevel>(risk?.impact || 'medium')
  const [likelihood, setLikelihood] = useState<RiskLevel>(risk?.likelihood || 'medium')
  const [treatment, setTreatment] = useState<TreatmentType>(risk?.treatment || 'mitigate')
  const [treatmentPlan, setTreatmentPlan] = useState(risk?.treatment_plan || '')

  const isEdit = !!risk
  const riskLevel = calculateRiskLevel(impact, likelihood)

  // Reset form when risk changes
  useEffect(() => {
    if (risk) {
      setAssetId(risk.asset_id)
      setThreat(risk.threat)
      setVulnerability(risk.vulnerability || '')
      setImpact(risk.impact)
      setLikelihood(risk.likelihood)
      setTreatment(risk.treatment)
      setTreatmentPlan(risk.treatment_plan || '')
    } else {
      setAssetId(null)
      setThreat('')
      setVulnerability('')
      setImpact('medium')
      setLikelihood('medium')
      setTreatment('mitigate')
      setTreatmentPlan('')
    }
  }, [risk])

  const handleMatrixSelect = (i: RiskLevel, l: RiskLevel) => {
    setImpact(i)
    setLikelihood(l)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const selectedAsset = assets.find(a => a.id === assetId)
    onSave({
      id: risk?.id,
      asset_id: assetId,
      asset_name: selectedAsset?.name,
      threat,
      vulnerability: vulnerability || null,
      impact,
      likelihood,
      risk_level: riskLevel,
      treatment,
      treatment_plan: treatmentPlan || null,
      status: 'draft' // New/edited risks always start as draft
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit Risk' : 'Add New Risk'}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? 'Update the risk assessment details.'
                : 'Identify a threat to an asset and assess its risk level.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Asset Selection */}
            <div className="space-y-2">
              <Label htmlFor="asset">Related Asset</Label>
              <Select value={assetId || ''} onValueChange={v => setAssetId(v || null)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an asset (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No specific asset</SelectItem>
                  {assets.filter(a => a.in_scope).map(asset => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Threat */}
            <div className="space-y-2">
              <Label htmlFor="threat">Threat *</Label>
              <Input
                id="threat"
                value={threat}
                onChange={e => setThreat(e.target.value)}
                placeholder="e.g., Unauthorized access to customer data"
                required
              />
            </div>

            {/* Vulnerability */}
            <div className="space-y-2">
              <Label htmlFor="vulnerability">Vulnerability</Label>
              <Textarea
                id="vulnerability"
                value={vulnerability}
                onChange={e => setVulnerability(e.target.value)}
                placeholder="e.g., Weak password policies, lack of MFA"
                rows={2}
              />
            </div>

            {/* Risk Matrix */}
            <div className="space-y-2">
              <Label>Risk Assessment (Impact x Likelihood)</Label>
              <div className="flex items-start gap-6">
                <RiskMatrix
                  impact={impact}
                  likelihood={likelihood}
                  onSelect={handleMatrixSelect}
                />
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Impact:</span>{' '}
                    <span className="font-medium capitalize">{impact}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Likelihood:</span>{' '}
                    <span className="font-medium capitalize">{likelihood}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Risk Level:</span>{' '}
                    <span className={`font-bold capitalize ${
                      riskLevel === 'high' ? 'text-red-600' :
                      riskLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {riskLevel}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Treatment */}
            <div className="space-y-2">
              <Label htmlFor="treatment">Risk Treatment *</Label>
              <Select value={treatment} onValueChange={v => setTreatment(v as TreatmentType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(treatmentLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Treatment Plan */}
            {treatment !== 'accept' && (
              <div className="space-y-2">
                <Label htmlFor="treatmentPlan">Treatment Plan</Label>
                <Textarea
                  id="treatmentPlan"
                  value={treatmentPlan}
                  onChange={e => setTreatmentPlan(e.target.value)}
                  placeholder="Describe the planned actions to address this risk..."
                  rows={3}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{isEdit ? 'Save Changes' : 'Add Risk'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
