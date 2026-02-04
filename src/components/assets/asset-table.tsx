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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type MockAsset, assetTypeLabels, criticalityConfig } from '@/lib/mock-data'

interface AssetTableProps {
  assets: MockAsset[]
  onEdit: (asset: MockAsset) => void
  onDelete: (asset: MockAsset) => void
}

export function AssetTable({ assets, onEdit, onDelete }: AssetTableProps) {
  if (assets.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No assets found. Add your first asset to get started.
      </div>
    )
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Criticality</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>In Scope</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.map(asset => (
            <TableRow key={asset.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{asset.name}</div>
                  {asset.description && (
                    <div className="text-sm text-muted-foreground truncate max-w-xs">
                      {asset.description}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{assetTypeLabels[asset.asset_type]}</Badge>
              </TableCell>
              <TableCell>
                <Badge className={criticalityConfig[asset.criticality].color}>
                  {criticalityConfig[asset.criticality].label}
                </Badge>
              </TableCell>
              <TableCell>{asset.owner_name || '-'}</TableCell>
              <TableCell>
                {asset.in_scope ? (
                  <Badge variant="default">Yes</Badge>
                ) : (
                  <Badge variant="secondary">No</Badge>
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
                    <DropdownMenuItem onClick={() => onEdit(asset)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(asset)}
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
