"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import type { SweetItem, PlacedItem } from "@/types/types"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Search, ChevronDown, AlertTriangle } from "lucide-react"
import { fetchSweets } from "@/services/api-service"

interface InventorySettingsModalProps {
  onClose: () => void
  onUpdateInventory: (updatedSweets: SweetItem[]) => void
  placedItems?: PlacedItem[]
  onRemovePlacedItems?: (itemIds: string[]) => void
}

export default function InventorySettingsModal({ onClose, onUpdateInventory, placedItems, onRemovePlacedItems }: InventorySettingsModalProps) {
  const [localSweets, setLocalSweets] = useState<SweetItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("すべて")
  const [showRemovalConfirm, setShowRemovalConfirm] = useState(false)
  const [itemsToRemove, setItemsToRemove] = useState<{sweetId: string, sweetName: string, placedItemIds: string[]}[]>([])

  useEffect(() => {
    const loadSweets = async () => {
      try {
        const sweets = await fetchSweets()
        setLocalSweets(sweets)
      } catch (error) {
        console.error("Failed to fetch sweets:", error)
      }
    }
    loadSweets()
  }, [])

  // カテゴリーの一覧を取得
  const categories = ["すべて", ...Array.from(new Set(localSweets.map((sweet) => sweet.category)))]

  // 検索とフィルタリング
  const filteredSweets = localSweets.filter((sweet) => {
    const matchesSearch = sweet.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "すべて" || sweet.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // 在庫状態の切り替え
  const toggleStock = (id: string) => {
    const sweet = localSweets.find(s => s.id === id)
    if (!sweet) return

    // 在庫ありから在庫切れに変更する場合、配置済みアイテムをチェック
    if (sweet.inStock && placedItems && onRemovePlacedItems) {
      const placedItemsToRemove = placedItems.filter(item => 
        item.type === 'sweet' && item.itemId === id
      )
      
      if (placedItemsToRemove.length > 0) {
        setItemsToRemove([{
          sweetId: id,
          sweetName: sweet.name,
          placedItemIds: placedItemsToRemove.map(item => item.id)
        }])
        setShowRemovalConfirm(true)
        return
      }
    }

    // 配置済みアイテムがない場合は通常の切り替え
    setLocalSweets((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          return { ...s, inStock: !s.inStock }
        }
        return s
      }),
    )
  }

  // すべての在庫状態を設定
  const setAllStock = (inStock: boolean) => {
    // 在庫切れにする場合、配置済みアイテムをチェック
    if (!inStock && placedItems && onRemovePlacedItems) {
      const sweetsToUpdate = localSweets.filter(sweet => {
        const matchesCategory = selectedCategory === "すべて" || sweet.category === selectedCategory
        return matchesCategory && sweet.inStock
      })

      const itemsToRemoveList: {sweetId: string, sweetName: string, placedItemIds: string[]}[] = []
      
      sweetsToUpdate.forEach(sweet => {
        const placedItemsToRemove = placedItems.filter(item => 
          item.type === 'sweet' && item.itemId === sweet.id
        )
        
        if (placedItemsToRemove.length > 0) {
          itemsToRemoveList.push({
            sweetId: sweet.id,
            sweetName: sweet.name,
            placedItemIds: placedItemsToRemove.map(item => item.id)
          })
        }
      })

      if (itemsToRemoveList.length > 0) {
        setItemsToRemove(itemsToRemoveList)
        setShowRemovalConfirm(true)
        return
      }
    }

    // 配置済みアイテムがない場合は通常の処理
    setLocalSweets((prev) =>
      prev.map((sweet) => {
        if (selectedCategory === "すべて" || sweet.category === selectedCategory) {
          return { ...sweet, inStock }
        }
        return sweet
      }),
    )
  }

  // 削除確認の処理
  const handleConfirmRemoval = () => {
    if (onRemovePlacedItems) {
      const allPlacedItemIds = itemsToRemove.flatMap(item => item.placedItemIds)
      onRemovePlacedItems(allPlacedItemIds)
    }

    // 在庫状態を更新
    setLocalSweets((prev) =>
      prev.map((sweet) => {
        const itemToUpdate = itemsToRemove.find(item => item.sweetId === sweet.id)
        if (itemToUpdate) {
          return { ...sweet, inStock: false }
        }
        return sweet
      }),
    )

    setShowRemovalConfirm(false)
    setItemsToRemove([])
  }

  // 削除キャンセルの処理
  const handleCancelRemoval = () => {
    setShowRemovalConfirm(false)
    setItemsToRemove([])
  }

  // 変更を保存
  const handleSave = () => {
    onUpdateInventory(localSweets)
    onClose()
  }

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>在庫管理</DialogTitle>
          </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {/* 検索とフィルター */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="和菓子を検索..."
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-3 py-2 border border-gray-300 rounded-md"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* 一括操作ボタン */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" size="sm" onClick={() => setAllStock(true)}>
              すべて在庫あり
            </Button>
            <Button variant="outline" size="sm" onClick={() => setAllStock(false)}>
              すべて在庫切れ
            </Button>
          </div>

          {/* スクロールインジケーター */}
          {filteredSweets.length > 8 && (
            <div className="flex justify-center py-2">
              <div className="flex items-center text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                <ChevronDown className="h-4 w-4 mr-1 animate-bounce" />
                スクロールして商品を確認
              </div>
            </div>
          )}

          {/* 在庫リスト */}
          <div className="border rounded-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    商品名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    カテゴリ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    価格
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    在庫状態
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSweets.map((sweet) => (
                  <tr key={sweet.id} className={!sweet.inStock ? "bg-gray-50" : ""}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sweet.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sweet.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sweet.price}円</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`stock-${sweet.id}`}
                          checked={sweet.inStock}
                          onCheckedChange={() => toggleStock(sweet.id)}
                        />
                        <Label htmlFor={`stock-${sweet.id}`} className="cursor-pointer">
                          {sweet.inStock ? "在庫あり" : "在庫切れ"}
                        </Label>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 border-t bg-gray-50 px-6 py-4 -mx-6 -mb-6">
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={handleSave}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* 削除確認ダイアログ */}
    <Dialog open={showRemovalConfirm} onOpenChange={handleCancelRemoval}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-600">
            <AlertTriangle className="h-5 w-5" />
            配置済みアイテムの削除確認
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            以下の商品を在庫切れにすると、詰め合わせ箱に配置済みのアイテムが削除されます：
          </p>
          
          <div className="bg-gray-50 rounded-md p-3 max-h-40 overflow-y-auto">
            {itemsToRemove.map((item, index) => (
              <div key={item.sweetId} className="flex justify-between items-center py-1">
                <span className="text-sm font-medium">{item.sweetName}</span>
                <span className="text-xs text-gray-500">
                  {item.placedItemIds.length}個配置済み
                </span>
              </div>
            ))}
          </div>
          
          <p className="text-sm text-red-600 font-medium">
            この操作は元に戻せません。続行しますか？
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancelRemoval}>
            キャンセル
          </Button>
          <Button variant="destructive" onClick={handleConfirmRemoval}>
            削除して在庫切れにする
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}
