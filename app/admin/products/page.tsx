'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Upload, Search, Image as ImageIcon } from 'lucide-react'

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
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
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

  // フィルタリングされた商品を取得
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.category.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  // カテゴリー別に商品をグループ化
  const productsByCategory = categories.reduce((acc, category) => {
    const categoryProducts = filteredProducts.filter(product => product.categoryId === category.id)
    if (categoryProducts.length > 0) {
      acc[category.id] = categoryProducts
    }
    return acc
  }, {} as Record<string, Product[]>)

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

      {/* 検索機能 */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="商品名、説明、カテゴリーで検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-4"
          />
        </div>
      </div>

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
                  <div className="flex items-center space-x-2">
                    <Input
                      id="size-width"
                      type="number"
                      min="1"
                      max="10"
                      placeholder="幅"
                      value={formData.size.split('x')[0] || ''}
                      onChange={(e) => {
                        const width = e.target.value
                        const height = formData.size.split('x')[1] || ''
                        setFormData({ ...formData, size: `${width}x${height}` })
                      }}
                      className="w-20"
                      required
                    />
                    <span className="text-gray-500">×</span>
                    <Input
                      id="size-height"
                      type="number"
                      min="1"
                      max="10"
                      placeholder="高さ"
                      value={formData.size.split('x')[1] || ''}
                      onChange={(e) => {
                        const width = formData.size.split('x')[0] || ''
                        const height = e.target.value
                        setFormData({ ...formData, size: `${width}x${height}` })
                      }}
                      className="w-20"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500">サイズは1×1から10×10の範囲で入力してください</p>
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

      {/* カテゴリータブ */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <div className="overflow-x-auto">
          <TabsList className="inline-flex min-w-full">
            <TabsTrigger value="all" className="whitespace-nowrap">すべて ({filteredProducts.length})</TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="whitespace-nowrap">
                {category.name} ({productsByCategory[category.id]?.length || 0})
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="all" className="mt-6">
          <div className="grid gap-4">
            {filteredProducts.map((product) => (
              <Card key={product.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* 商品画像 */}
                    <div className="flex-shrink-0">
                      {product.beforeImagePath ? (
                        <img
                          src={product.beforeImagePath}
                          alt={product.name}
                          className="w-20 h-20 object-cover rounded-lg border"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-100 rounded-lg border flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    {/* 商品情報 */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{product.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary">{product.category.name}</Badge>
                            <Badge variant="outline">{product.size}</Badge>
                            <span className="text-lg font-semibold text-green-600">
                              ¥{product.price.toLocaleString()}
                            </span>
                          </div>
                          {product.description && (
                            <p className="text-sm text-gray-600 mt-2">{product.description}</p>
                          )}
                          <div className="flex gap-4 mt-2 text-sm text-gray-500">
                            {product.calories && (
                              <span>カロリー: {product.calories}kcal</span>
                            )}
                            {product.allergyInfo && (
                              <span>アレルギー: {product.allergyInfo}</span>
                            )}
                            {product.stock && (
                              <span>在庫: {product.stock.quantity}個</span>
                            )}
                          </div>
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
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="mt-6">
            <div className="grid gap-4">
              {productsByCategory[category.id]?.map((product) => (
                <Card key={product.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* 商品画像 */}
                      <div className="flex-shrink-0">
                        {product.beforeImagePath ? (
                          <img
                            src={product.beforeImagePath}
                            alt={product.name}
                            className="w-20 h-20 object-cover rounded-lg border"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gray-100 rounded-lg border flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      {/* 商品情報 */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{product.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary">{product.category.name}</Badge>
                              <Badge variant="outline">{product.size}</Badge>
                              <span className="text-lg font-semibold text-green-600">
                                ¥{product.price.toLocaleString()}
                              </span>
                            </div>
                            {product.description && (
                              <p className="text-sm text-gray-600 mt-2">{product.description}</p>
                            )}
                            <div className="flex gap-4 mt-2 text-sm text-gray-500">
                              {product.calories && (
                                <span>カロリー: {product.calories}kcal</span>
                              )}
                              {product.allergyInfo && (
                                <span>アレルギー: {product.allergyInfo}</span>
                              )}
                              {product.stock && (
                                <span>在庫: {product.stock.quantity}個</span>
                              )}
                            </div>
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
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
} 