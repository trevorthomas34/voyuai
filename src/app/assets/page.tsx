'use client'

import { useState, useEffect } from 'react'
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
import { AssetTable } from '@/components/assets/asset-table'
import { AssetForm } from '@/components/assets/asset-form'
import { assetTypeLabels } from '@/lib/mock-data'
import { getAssets, createAsset, updateAsset, deleteAsset as deleteAssetApi, type Asset } from '@/lib/data/assets'
import type { AssetType } from '@/types/database'

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<AssetType | 'all'>('all')
  const [scopeFilter, setScopeFilter] = useState<'all' | 'in_scope' | 'out_of_scope'>('all')

  const [formOpen, setFormOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [deletingAsset, setDeletingAsset] = useState<Asset | null>(null)

  // Fetch assets on mount
  useEffect(() => {
    getAssets()
      .then(setAssets)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Filter assets
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || asset.asset_type === typeFilter
    const matchesScope = scopeFilter === 'all' ||
      (scopeFilter === 'in_scope' && asset.in_scope) ||
      (scopeFilter === 'out_of_scope' && !asset.in_scope)
    return matchesSearch && matchesType && matchesScope
  })

  const handleAddAsset = () => {
    setEditingAsset(null)
    setFormOpen(true)
  }

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset)
    setFormOpen(true)
  }

  const handleSaveAsset = async (assetData: Partial<Asset>) => {
    try {
      if (assetData.id) {
        // Update existing
        const updated = await updateAsset(assetData.id, assetData)
        setAssets(prev => prev.map(a => a.id === updated.id ? updated : a))
      } else {
        // Add new
        const created = await createAsset({
          name: assetData.name || '',
          asset_type: assetData.asset_type || 'hardware',
          description: assetData.description || null,
          criticality: assetData.criticality || 'medium',
          in_scope: assetData.in_scope ?? true
        })
        setAssets(prev => [created, ...prev])
      }
      setFormOpen(false)
    } catch (error) {
      console.error('Failed to save asset:', error)
    }
  }

  const handleDeleteAsset = (asset: Asset) => {
    setDeletingAsset(asset)
  }

  const confirmDelete = async () => {
    if (deletingAsset) {
      try {
        await deleteAssetApi(deletingAsset.id)
        setAssets(prev => prev.filter(a => a.id !== deletingAsset.id))
        setDeletingAsset(null)
      } catch (error) {
        console.error('Failed to delete asset:', error)
      }
    }
  }

  // Stats
  const totalAssets = assets.length
  const inScopeAssets = assets.filter(a => a.in_scope).length
  const criticalAssets = assets.filter(a => a.criticality === 'critical').length

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Voyu</h1>
              <p className="text-sm text-muted-foreground">Asset Register</p>
            </div>
            <nav className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-sm hover:underline">Dashboard</Link>
              <Link href="/assets" className="text-sm font-medium">Assets</Link>
              <Link href="/risks" className="text-sm hover:underline">Risks</Link>
              <Link href="/controls" className="text-sm hover:underline">Controls</Link>
              <Link href="/soa" className="text-sm hover:underline">SoA</Link>
            </nav>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading assets...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Voyu</h1>
            <p className="text-sm text-muted-foreground">Asset Register</p>
          </div>
          <nav className="flex items-center space-x-4">
            <Link href="/dashboard" className="text-sm hover:underline">Dashboard</Link>
            <Link href="/assets" className="text-sm font-medium">Assets</Link>
            <Link href="/risks" className="text-sm hover:underline">Risks</Link>
            <Link href="/controls" className="text-sm hover:underline">Controls</Link>
            <Link href="/soa" className="text-sm hover:underline">SoA</Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Assets</CardDescription>
              <CardTitle className="text-3xl">{totalAssets}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>In Scope</CardDescription>
              <CardTitle className="text-3xl">{inScopeAssets}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Critical Assets</CardDescription>
              <CardTitle className="text-3xl text-red-600">{criticalAssets}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="flex flex-col md:flex-row gap-4">
                <Input
                  placeholder="Search assets..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="md:w-64"
                />
                <Select value={typeFilter} onValueChange={v => setTypeFilter(v as AssetType | 'all')}>
                  <SelectTrigger className="md:w-40">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {Object.entries(assetTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={scopeFilter} onValueChange={v => setScopeFilter(v as 'all' | 'in_scope' | 'out_of_scope')}>
                  <SelectTrigger className="md:w-40">
                    <SelectValue placeholder="Filter by scope" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="in_scope">In Scope</SelectItem>
                    <SelectItem value="out_of_scope">Out of Scope</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddAsset}>+ Add Asset</Button>
            </div>
          </CardContent>
        </Card>

        {/* Asset Table */}
        <Card>
          <CardHeader>
            <CardTitle>Asset Register</CardTitle>
            <CardDescription>
              Information assets within the ISMS scope (ISO 27001 Clause A.5.9)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {assets.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No assets yet. Add your first asset to get started.</p>
                <Button onClick={handleAddAsset}>+ Add Asset</Button>
              </div>
            ) : (
              <AssetTable
                assets={filteredAssets}
                onEdit={handleEditAsset}
                onDelete={handleDeleteAsset}
              />
            )}
          </CardContent>
        </Card>
      </main>

      {/* Add/Edit Form Dialog */}
      <AssetForm
        open={formOpen}
        onOpenChange={setFormOpen}
        asset={editingAsset}
        onSave={handleSaveAsset}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingAsset} onOpenChange={() => setDeletingAsset(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Asset</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deletingAsset?.name}&quot;? This action cannot be undone.
              Any risks linked to this asset will need to be updated.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingAsset(null)}>
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
