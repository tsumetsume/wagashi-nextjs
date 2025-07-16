'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Edit, Trash2, Upload } from 'lucide-react'

interface Category {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  price: number
  categoryId: string
  description?: string
  allergyInfo?: string
  calories?: number
  size: string
  beforeImagePath?: string
  afterImagePath?: string
  isActive: boolean
  category: Category
  stock?: {
    quantity: number
  }
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    categoryId: '',
    description: '',
    allergyInfo: '',
    calories: '',
    size: '',
    beforeImagePath: '',
    afterImagePath: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/categories')
      ])
      
      if (!productsRes.ok || !categoriesRes.ok) {
        throw new Error('データの取得に失敗しました')
      }
      
      const [productsData, categoriesData] = await Promise.all([
        productsRes.json(),
        categoriesRes.json()
      ])
      
      setProducts(productsData)
      setCategories(categoriesData)
    } catch (error) {
      setError('データの取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = async (file: File, type: 'before' | 'after') => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('画像のアップロードに失敗しました')
      }
      
      const data = await response.json()
      setFormData(prev => ({
        ...prev,
        [`${type}ImagePath`]: data.imageUrl
      }))
    } catch (error) {
      setError('画像のアップロードに失敗しました')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingProduct 
        ? `/api/admin/products/${editingProduct.id}`
        : '/api/admin/products'
      
      const method = editingProduct ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '操作に失敗しました')
      }

      await fetchData()
      resetForm()
    } catch (error) {
      setError(error instanceof Error ? error.message : '操作に失敗しました')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('この商品を削除しますか？')) return

    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '削除に失敗しました')
      }

      await fetchData()
    } catch (error) {
      setError(error instanceof Error ? error.message : '削除に失敗しました')
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      price: product.price.toString(),
      categoryId: product.categoryId,
      description: product.description || '',
      allergyInfo: product.allergyInfo || '',
      calories: product.calories?.toString() || '',
      size: product.size,
      beforeImagePath: product.beforeImagePath || '',
      afterImagePath: product.afterImagePath || ''
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      categoryId: '',
      description: '',
      allergyInfo: '',
      calories: '',
      size: '',
      beforeImagePath: '',
      afterImagePath: ''
    })
    setEditingProduct(null)
    setShowForm(false)
    setError('')
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">読み込み中...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">商品管理</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          新規作成
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingProduct ? '商品編集' : '新規商品作成'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">商品名 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price">価格 (円) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="categoryId">カテゴリー *</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="カテゴリーを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="size">サイズ *</Label>
                  <Select
                    value={formData.size}
                    onValueChange={(value) => setFormData({ ...formData, size: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="サイズを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2x2">2x2</SelectItem>
                      <SelectItem value="2x3">2x3</SelectItem>
                      <SelectItem value="3x3">3x3</SelectItem>
                      <SelectItem value="3x4">3x4</SelectItem>
                      <SelectItem value="4x4">4x4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">商品詳細</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="allergyInfo">アレルギー情報</Label>
                  <Input
                    id="allergyInfo"
                    value={formData.allergyInfo}
                    onChange={(e) => setFormData({ ...formData, allergyInfo: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="calories">カロリー (kcal)</Label>
                  <Input
                    id="calories"
                    type="number"
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>配置前画像</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={formData.beforeImagePath}
                      onChange={(e) => setFormData({ ...formData, beforeImagePath: e.target.value })}
                      placeholder="画像URL"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(file, 'before')
                      }}
                      className="hidden"
                      id="before-image-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('before-image-upload')?.click()}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>配置後画像</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={formData.afterImagePath}
                      onChange={(e) => setFormData({ ...formData, afterImagePath: e.target.value })}
                      placeholder="画像URL"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(file, 'after')
                      }}
                      className="hidden"
                      id="after-image-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('after-image-upload')?.click()}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button type="submit">
                  {editingProduct ? '更新' : '作成'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  キャンセル
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {products.map((product) => (
          <Card key={product.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm text-gray-600">
                    {product.category.name} • ¥{product.price.toLocaleString()} • {product.size}
                  </p>
                  {product.description && (
                    <p className="text-sm text-gray-500 mt-1">{product.description}</p>
                  )}
                  {product.stock && (
                    <p className="text-sm text-gray-500">在庫: {product.stock.quantity}個</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(product)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 