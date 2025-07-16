"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import type { PlacedItem } from "@/types/types"

interface DividerResizeModalProps {
  divider: PlacedItem
  onResize: (id: string, newLength: number) => void
  onClose: () => void
  maxLength: number
}

export default function DividerResizeModal({ divider, onResize, onClose, maxLength }: DividerResizeModalProps) {
  const [length, setLength] = useState<number>(divider.orientation === "horizontal" ? divider.width : divider.height)

  // dividerが変更されたときにlengthを更新
  useEffect(() => {
    setLength(divider.orientation === "horizontal" ? divider.width : divider.height)
  }, [divider])

  const handleResize = () => {
    onResize(divider.id, length)
    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>仕切りの長さを調整</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">
              {divider.orientation === "horizontal" ? "横" : "縦"}仕切り：{length}マス
            </span>
          </div>
          <Slider
            value={[length]}
            min={1}
            max={maxLength}
            step={1}
            onValueChange={(value) => setLength(value[0])}
            className="mb-4"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>1</span>
            <span>{maxLength}</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={handleResize}>適用</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
