"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"
import StockCheckModal from "@/components/stock-check-modal"

interface UnavailableItem {
  id: string
  itemId: string
  name: string
  reason: string
}

export default function CustomerCodePage() {
  const router = useRouter()
  const [customerCode, setCustomerCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  // 在庫チェック関連の状態
  const [isStockCheckModalOpen, setIsStockCheckModalOpen] = useState(false)
  const [unavailableItems, setUnavailableItems] = useState<UnavailableItem[]>([])
  const [layoutData, setLayoutData] = useState<any>(null)

  const handleLoadLayout = async () => {
    if (!customerCode.trim()) {
      toast.error("カスタマーコードを入力してください")
      return
    }

    setIsLoading(true)
    try {
      // レイアウトデータを読み込み
      const response = await fetch("/api/layouts/load", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ customerCode: customerCode.trim() }),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || "読み込みに失敗しました")
        return
      }

      // 在庫チェックを実行
      await checkStockAndProceed(result.data)

    } catch (error) {
      console.error("Load error:", error)
      toast.error("読み込みに失敗しました")
    } finally {
      setIsLoading(false)
    }
  }

  // 在庫チェックを実行する関数
  const checkStockAndProceed = async (data: any) => {
    try {
      const stockResponse = await fetch("/api/layouts/check-stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storeId: data.storeId,
          placedItems: data.placedItems,
        }),
      })

      const stockResult = await stockResponse.json()

      if (!stockResponse.ok) {
        toast.error(stockResult.error || "在庫チェックに失敗しました")
        return
      }

      // 在庫不足商品がある場合
      if (stockResult.hasUnavailableItems) {
        setLayoutData(data)
        setUnavailableItems(stockResult.unavailableItems)
        setIsStockCheckModalOpen(true)
      } else {
        // 在庫に問題がない場合は直接進む
        proceedWithLayout(data)
      }

    } catch (error) {
      console.error("Stock check error:", error)
      toast.error("在庫チェックに失敗しました")
    }
  }

  // レイアウトを適用してシミュレーター画面に遷移
  const proceedWithLayout = (data: any) => {
    localStorage.setItem("loadedLayout", JSON.stringify(data))
    localStorage.setItem("selectedStoreId", data.storeId)
    toast.success("レイアウトを読み込みました")
    router.push("/simulator")
  }

  // 在庫不足商品を削除してレイアウトを適用
  const handleConfirmStockCheck = async () => {
    if (!layoutData) return

    try {
      // 在庫チェックを再実行して利用可能な商品のみを取得
      const stockResponse = await fetch("/api/layouts/check-stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storeId: layoutData.storeId,
          placedItems: layoutData.placedItems,
        }),
      })

      const stockResult = await stockResponse.json()

      if (stockResponse.ok) {
        // 利用可能な商品のみでレイアウトデータを更新
        const updatedLayoutData = {
          ...layoutData,
          placedItems: stockResult.availableItems
        }

        proceedWithLayout(updatedLayoutData)
        
        if (stockResult.unavailableItems.length > 0) {
          toast.success(`${stockResult.unavailableItems.length}個の在庫不足商品を削除しました`)
        }
      } else {
        toast.error("在庫チェックに失敗しました")
      }
    } catch (error) {
      console.error("Stock check error:", error)
      toast.error("在庫チェックに失敗しました")
    }

    setIsStockCheckModalOpen(false)
    setLayoutData(null)
    setUnavailableItems([])
  }

  // 在庫チェックモーダルをキャンセル
  const handleCancelStockCheck = () => {
    setIsStockCheckModalOpen(false)
    setLayoutData(null)
    setUnavailableItems([])
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLoadLayout()
    }
  }

  return (
    <div className="min-h-screen washi-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-[var(--color-indigo)]">
              カスタマーコード入力
            </CardTitle>
            <CardDescription>
              保存されたレイアウトを読み込むためのカスタマーコードを入力してください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="customerCode" className="text-sm font-medium">
                カスタマーコード
              </label>
              <Input
                id="customerCode"
                type="text"
                placeholder="例: ABC12345"
                value={customerCode}
                onChange={(e) => setCustomerCode(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                className="text-center text-lg font-mono tracking-wider"
                maxLength={8}
              />
              <p className="text-xs text-gray-500 text-center">
                8文字の英数字コードを入力してください
              </p>
            </div>

            <Button
              onClick={handleLoadLayout}
              disabled={isLoading || !customerCode.trim()}
              className="w-full bg-[var(--color-indigo)] hover:bg-[var(--color-indigo-dark)]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  読み込み中...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  レイアウトを読み込む
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push("/store-selection")}
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              店舗選択に戻る
            </Button>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>カスタマーコードは30日間有効です</p>
          <p>コードをお忘れの場合は店舗スタッフにお尋ねください</p>
        </div>
      </div>

      {/* 在庫チェックモーダル */}
      <StockCheckModal
        isOpen={isStockCheckModalOpen}
        onClose={handleCancelStockCheck}
        onConfirm={handleConfirmStockCheck}
        unavailableItems={unavailableItems}
      />
    </div>
  )
}