'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { RiskMatrix } from './risk-matrix'
import { type MockRisk, riskLevelConfig, treatmentLabels } from '@/lib/mock-data'

interface ApprovalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  risk: MockRisk | null
  onApprove: (riskId: string, comment: string) => void
}

export function ApprovalDialog({ open, onOpenChange, risk, onApprove }: ApprovalDialogProps) {
  const [comment, setComment] = useState('')

  if (!risk) return null

  const handleApprove = () => {
    onApprove(risk.id, comment)
    setComment('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Approve Risk Assessment</DialogTitle>
          <DialogDescription>
            Review and approve this risk assessment. This action will be recorded in the audit log.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Risk Summary */}
          <div className="bg-muted p-4 rounded-lg space-y-3">
            <div>
              <Label className="text-muted-foreground">Threat</Label>
              <p className="font-medium">{risk.threat}</p>
            </div>

            {risk.asset_name && (
              <div>
                <Label className="text-muted-foreground">Related Asset</Label>
                <p>{risk.asset_name}</p>
              </div>
            )}

            {risk.vulnerability && (
              <div>
                <Label className="text-muted-foreground">Vulnerability</Label>
                <p className="text-sm">{risk.vulnerability}</p>
              </div>
            )}

            <div className="flex gap-6 items-start">
              <RiskMatrix
                impact={risk.impact}
                likelihood={risk.likelihood}
                readonly
              />
              <div className="space-y-2">
                <div>
                  <Label className="text-muted-foreground">Risk Level</Label>
                  <div>
                    <Badge className={riskLevelConfig[risk.risk_level].color}>
                      {riskLevelConfig[risk.risk_level].label}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Treatment</Label>
                  <p>{treatmentLabels[risk.treatment]}</p>
                </div>
              </div>
            </div>

            {risk.treatment_plan && (
              <div>
                <Label className="text-muted-foreground">Treatment Plan</Label>
                <p className="text-sm">{risk.treatment_plan}</p>
              </div>
            )}
          </div>

          {/* Approval Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Approval Comment (optional)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Add any notes about this approval..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleApprove}>
            Approve Risk
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
