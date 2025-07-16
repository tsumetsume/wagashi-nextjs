'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Save, Package, Search } from 'lucide-react'

interface Category {
  id: string
  name: string
}

interface Stock {
  id: string
  productId: string
  quantity: number
  product: {
    id: string
    name: string
    categoryId: string
    category: {
      id: string
      name: string
    }
  }
}

export default function StockPage() {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [updatingStocks, setUpdatingStocks] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [stocksRes, categoriesRes] = await Promise.all([
        fetch('/api/admin/stock'),
        fetch('/api/admin/categories')
      ])
      
      if (!stocksRes.ok || !categoriesRes.ok) {
        throw new Error('データの取得に失敗しました')
      }
      
      const [stocksData, categoriesData] = await Promise.all([
        stocksRes.json(),
        categoriesRes.json()
      ])
      
      setStocks(stocksData)
      setCategories(categoriesData)
    } catch (error) {
      setError('データの取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuantityChange = (stockId: string, newQuantity: number) => {
    setStocks(prev => prev.map(stock => 
      stock.id === stockId 
        ? { ...stock, quantity: newQuantity }
        : stock
    ))
  }

  const handleSaveStock = async (stock: Stock) => {
    setUpdatingStocks(prev => new Set(prev).add(stock.id))
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/admin/stock', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: stock.productId,
          quantity: stock.quantity
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '在庫の更新に失敗しました')
      }

      setSuccess('在庫を更新しました')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError(error instanceof Error ? error.message : '在庫の更新に失敗しました')
    } finally {
      setUpdatingStocks(prev => {
        const newSet = new Set(prev)
        newSet.delete(stock.id)
        return newSet
      })
    }
  }

  // フィルタリングされた在庫を取得
  const filteredStocks = stocks.filter(stock => {
    const matchesSearch = stock.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         stock.product.category.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || stock.product.categoryId === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  // カテゴリー別に在庫をグループ化
  const stocksByCategory = categories.reduce((acc, category) => {
    const categoryStocks = filteredStocks.filter(stock => stock.product.categoryId === category.id)
    if (categoryStocks.length > 0) {
      acc[category.id] = categoryStocks
    }
    return acc
  }, {} as Record<string, Stock[]>)

  if (isLoading) {
    return <div className="flex justify-center p-8">読み込み中...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">在庫管理</h1>
        <div className="flex items-center space-x-2">
          <Package className="h-5 w-5 text-gray-500" />
          <span className="text-sm text-gray-600">
            商品数: {stocks.length}
          </span>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* 検索機能 */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="商品名、カテゴリーで検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-4"
          />
        </div>
      </div>

      {/* カテゴリータブ */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="flex w-full overflow-x-auto">
          <TabsTrigger value="all" className="whitespace-nowrap">すべて</TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="whitespace-nowrap">
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid gap-4">
            {filteredStocks.map((stock) => (
              <Card key={stock.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <h3 className="font-semibold">{stock.product.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{stock.product.category.name}</Badge>
                        <span className="text-sm text-gray-600">
                          在庫数: {stock.quantity}個
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={`quantity-${stock.id}`} className="text-sm">
                          在庫数:
                        </Label>
                        <Input
                          id={`quantity-${stock.id}`}
                          type="number"
                          min="0"
                          value={stock.quantity}
                          onChange={(e) => handleQuantityChange(stock.id, parseInt(e.target.value) || 0)}
                          className="w-20"
                        />
                      </div>
                      
                      <Button
                        size="sm"
                        onClick={() => handleSaveStock(stock)}
                        disabled={updatingStocks.has(stock.id)}
                      >
                        {updatingStocks.has(stock.id) ? (
                          '更新中...'
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-1" />
                            保存
                          </>
                        )}
                      </Button>
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
              {stocksByCategory[category.id]?.map((stock) => (
                <Card key={stock.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <h3 className="font-semibold">{stock.product.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">{stock.product.category.name}</Badge>
                          <span className="text-sm text-gray-600">
                            在庫数: {stock.quantity}個
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Label htmlFor={`quantity-${stock.id}`} className="text-sm">
                            在庫数:
                          </Label>
                          <Input
                            id={`quantity-${stock.id}`}
                            type="number"
                            min="0"
                            value={stock.quantity}
                            onChange={(e) => handleQuantityChange(stock.id, parseInt(e.target.value) || 0)}
                            className="w-20"
                          />
                        </div>
                        
                        <Button
                          size="sm"
                          onClick={() => handleSaveStock(stock)}
                          disabled={updatingStocks.has(stock.id)}
                        >
                          {updatingStocks.has(stock.id) ? (
                            '更新中...'
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-1" />
                              保存
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {filteredStocks.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery || selectedCategory !== 'all' ? '検索結果がありません' : '在庫データがありません'}
            </h3>
            <p className="text-gray-600">
              {searchQuery || selectedCategory !== 'all' 
                ? '検索条件を変更してください。'
                : '商品を登録すると、ここに在庫管理が表示されます。'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 