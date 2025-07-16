'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Save, Package } from 'lucide-react'

interface Stock {
  id: string
  productId: string
  quantity: number
  product: {
    id: string
    name: string
    category: {
      name: string
    }
  }
}

export default function StockPage() {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [updatingStocks, setUpdatingStocks] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchStocks()
  }, [])

  const fetchStocks = async () => {
    try {
      const response = await fetch('/api/admin/stock')
      if (!response.ok) throw new Error('在庫の取得に失敗しました')
      const data = await response.json()
      setStocks(data)
    } catch (error) {
      setError('在庫の取得に失敗しました')
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

      <div className="grid gap-4">
        {stocks.map((stock) => (
          <Card key={stock.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <h3 className="font-semibold">{stock.product.name}</h3>
                  <p className="text-sm text-gray-600">
                    {stock.product.category.name}
                  </p>
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

      {stocks.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              在庫データがありません
            </h3>
            <p className="text-gray-600">
              商品を登録すると、ここに在庫管理が表示されます。
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 