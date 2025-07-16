"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import type { SweetItem } from "@/types/types"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Search } from "lucide-react"
import { fetchSweets } from "@/services/api-service"

interface InventorySettingsModalProps {
  onClose: () => void
  onUpdateInventory: (updatedSweets: SweetItem[]) => void
}

export default function InventorySettingsModal({ onClose, onUpdateInventory }: InventorySettingsModalProps) {
  const [localSweets, setLocalSweets] = useState<SweetItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("すべて")

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
    setLocalSweets((prev) =>
      prev.map((sweet) => {
        if (sweet.id === id) {
          return { ...sweet, inStock: !sweet.inStock }
        }
        return sweet
      }),
    )
  }

  // すべての在庫状態を設定
  const setAllStock = (inStock: boolean) => {
    setLocalSweets((prev) =>
      prev.map((sweet) => {
        if (selectedCategory === "すべて" || sweet.category === selectedCategory) {
          return { ...sweet, inStock }
        }
        return sweet
      }),
    )
  }

  // 変更を保存
  const handleSave = () => {
    onUpdateInventory(localSweets)
    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>在庫管理</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
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

          {/* 在庫リスト */}
          <div className="border rounded-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
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

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={handleSave}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
