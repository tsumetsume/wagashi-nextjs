"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Package } from "lucide-react"
import type { BoxType, BoxSize } from "@/types/types"

interface BoxSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (boxSize: BoxSize, boxType: BoxType) => void
  currentBoxSize: BoxSize
  currentBoxType?: BoxType | null
}

export default function BoxSelectionModal({
  isOpen,
  onClose,
  onSelect,
  currentBoxSize,
  currentBoxType,
}: BoxSelectionModalProps) {
  const [boxTypes, setBoxTypes] = useState<BoxType[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedBoxType, setSelectedBoxType] = useState<BoxType | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchBoxTypes()
    }
  }, [isOpen])

  const fetchBoxTypes = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/box-types")
      if (response.ok) {
        const data = await response.json()
        setBoxTypes(data)
        
        // 現在選択されている箱タイプを優先、なければサイズで検索
        if (currentBoxType) {
          const matchingBoxType = data.find((bt: BoxType) => bt.id === currentBoxType.id)
          if (matchingBoxType) {
            setSelectedBoxType(matchingBoxType)
          } else {
            // IDが見つからない場合はサイズで検索
            const sizeMatchBoxType = data.find((bt: BoxType) => bt.size === currentBoxSize)
            setSelectedBoxType(sizeMatchBoxType || null)
          }
        } else {
          // currentBoxTypeがない場合はサイズで検索
          const sizeMatchBoxType = data.find((bt: BoxType) => bt.size === currentBoxSize)
          setSelectedBoxType(sizeMatchBoxType || null)
        }
      }
    } catch (error) {
      console.error("Error fetching box types:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = () => {
    if (selectedBoxType) {
      onSelect(selectedBoxType.size, selectedBoxType)
      onClose()
    }
  }

  const getSizeLabel = (size: BoxSize) => {
    switch (size) {
      case "10x10":
        return "10×10cm"
      case "15x15":
        return "15×15cm"
      case "20x20":
        return "20×20cm"
      default:
        return size
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full mx-4 max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5" />
            詰め合わせ箱のサイズを選択
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-2">
            箱のサイズによって価格が異なります。お好みのサイズをお選びください。
          </p>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">箱タイプを読み込み中...</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-3 grid-cols-1">
              {boxTypes.map((boxType) => (
                <Card
                  key={boxType.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedBoxType?.id === boxType.id
                      ? "ring-2 ring-blue-500 bg-blue-50"
                      : ""
                  }`}
                  onClick={() => setSelectedBoxType(boxType)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Package className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{boxType.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {getSizeLabel(boxType.size)}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-blue-600">
                          ¥{boxType.price.toLocaleString()}
                        </div>
                        {selectedBoxType?.id === boxType.id && (
                          <Badge className="bg-blue-500 text-xs mt-1">選択中</Badge>
                        )}
                      </div>
                    </div>
                    {boxType.description && (
                      <p className="text-sm text-gray-600 mt-2">
                        {boxType.description}
                      </p>
                    )}
                    <div className="mt-3 pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        クリックして選択
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {boxTypes.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-500">
                <Package className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium mb-2">箱タイプがありません</p>
                <p className="text-sm">管理者に箱タイプの追加を依頼してください</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t mt-4">
              <Button variant="outline" onClick={onClose} className="px-6">
                キャンセル
              </Button>
              <Button
                onClick={handleSelect}
                disabled={!selectedBoxType}
                className="bg-blue-600 hover:bg-blue-700 px-6"
              >
                選択
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}