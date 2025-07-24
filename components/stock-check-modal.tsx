"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Package, X } from "lucide-react"

interface UnavailableItem {
  id: string
  itemId: string
  name: string
  reason: string
}

interface StockCheckModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  unavailableItems: UnavailableItem[]
}

export default function StockCheckModal({
  isOpen,
  onClose,
  onConfirm,
  unavailableItems
}: StockCheckModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            在庫不足の商品があります
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            以下の商品は在庫がないため、レイアウトから削除されます：
          </p>
          
          <div className="max-h-48 overflow-y-auto space-y-2">
            {unavailableItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <Package className="h-4 w-4 text-red-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-red-800 truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-red-600">
                    {item.reason}
                  </p>
                </div>
                <X className="h-4 w-4 text-red-400" />
              </div>
            ))}
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>削除される商品数:</strong> {unavailableItems.length}個
            </p>
            <p className="text-xs text-blue-600 mt-1">
              残りの商品でレイアウトを復元します
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            キャンセル
          </Button>
          <Button
            onClick={onConfirm}
            className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700"
          >
            削除して続行
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}