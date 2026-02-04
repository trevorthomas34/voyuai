'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  type MockRisk,
  riskLevelConfig,
  treatmentLabels,
  statusConfig
} from '@/lib/mock-data'

interface RiskTableProps {
  risks: MockRisk[]
  onEdit: (risk: MockRisk) => void
  onDelete: (risk: MockRisk) => void
  onApprove: (risk: MockRisk) => void
}

export function RiskTable({ risks, onEdit, onDelete, onApprove }: RiskTableProps) {
  if (risks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No risks found. Add your first risk assessment to get started.
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Threat</TableHead>
            <TableHead>Asset</TableHead>
            <TableHead>Risk Level</TableHead>
            <TableHead>Treatment</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {risks.map(risk => (
            <TableRow key={risk.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{risk.threat}</div>
                  {risk.vulnerability && (
                    <div className="text-sm text-muted-foreground truncate max-w-xs">
                      {risk.vulnerability}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {risk.asset_name || <span className="text-muted-foreground">-</span>}
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <Badge className={riskLevelConfig[risk.risk_level].color}>
                    {riskLevelConfig[risk.risk_level].label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    I:{risk.impact[0].toUpperCase()} / L:{risk.likelihood[0].toUpperCase()}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="text-sm">{treatmentLabels[risk.treatment]}</div>
                  {risk.treatment_plan && (
                    <div className="text-xs text-muted-foreground truncate max-w-xs">
                      {risk.treatment_plan}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>{risk.owner_name || '-'}</TableCell>
              <TableCell>
                <Badge className={statusConfig[risk.status].color}>
                  {statusConfig[risk.status].label}
                </Badge>
                {risk.approved_at && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(risk.approved_at).toLocaleDateString()}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      •••
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(risk)}>
                      Edit
                    </DropdownMenuItem>
                    {risk.status === 'draft' && (
                      <DropdownMenuItem onClick={() => onApprove(risk)}>
                        Approve Risk
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(risk)}
                      className="text-red-600"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
