"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertTriangle } from "lucide-react"

interface ProductUpdateModalProps {
  isOpen: boolean
  onClose: () => void
  onReload: () => void
  message?: string
}

export default function ProductUpdateModal({ 
  isOpen, 
  onClose, 
  onReload, 
  message = "商品情報が変更されました" 
}: ProductUpdateModalProps) {
  const handleReload = () => {
    onReload()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[var(--color-indigo)]">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            商品情報の更新
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-700 mb-4">
            {message}
          </p>
          <p className="text-xs text-gray-500">
            最新の商品情報を表示するには、ページを再読み込みしてください。
          </p>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            後で
          </Button>
          <Button onClick={handleReload} className="bg-[var(--color-indigo)] hover:bg-[var(--color-indigo-light)]">
            <RefreshCw className="h-4 w-4 mr-2" />
            再読み込み
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 