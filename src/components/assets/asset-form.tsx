'use client'

import { useState } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
import type { AssetType, Criticality } from '@/types/database'
import type { Tables } from '@/types/supabase'

type Asset = Tables<'assets'>

interface AssetFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  asset?: Asset | null
  onSave: (asset: Partial<Asset>) => void
}

const assetTypes: { value: AssetType; label: string }[] = [
  { value: 'hardware', label: 'Hardware' },
  { value: 'software', label: 'Software' },
  { value: 'data', label: 'Data' },
  { value: 'service', label: 'Service' },
  { value: 'people', label: 'People' }
]

const criticalityLevels: { value: Criticality; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' }
]

export function AssetForm({ open, onOpenChange, asset, onSave }: AssetFormProps) {
  const [name, setName] = useState(asset?.name || '')
  const [assetType, setAssetType] = useState<AssetType>(asset?.asset_type || 'hardware')
  const [description, setDescription] = useState(asset?.description || '')
  const [criticality, setCriticality] = useState<Criticality>(asset?.criticality || 'medium')
  const [inScope, setInScope] = useState(asset?.in_scope ?? true)

  const isEdit = !!asset

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      id: asset?.id,
      name,
      asset_type: assetType,
      description: description || null,
      criticality,
      in_scope: inScope
    })
    onOpenChange(false)
    // Reset form
    if (!isEdit) {
      setName('')
      setAssetType('hardware')
      setDescription('')
      setCriticality('medium')
      setInScope(true)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit Asset' : 'Add New Asset'}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? 'Update the asset information below.'
                : 'Enter the details of the information asset.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Asset Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g., Production Database Server"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Asset Type *</Label>
              <Select value={assetType} onValueChange={v => setAssetType(v as AssetType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {assetTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe the asset and its purpose..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="criticality">Criticality *</Label>
              <Select value={criticality} onValueChange={v => setCriticality(v as Criticality)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {criticalityLevels.map(level => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="inScope"
                checked={inScope}
                onCheckedChange={checked => setInScope(checked === true)}
              />
              <Label htmlFor="inScope" className="font-normal cursor-pointer">
                Include in ISMS scope
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{isEdit ? 'Save Changes' : 'Add Asset'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
