"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function CustomerCodePage() {
  const router = useRouter()
  const [customerCode, setCustomerCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLoadLayout = async () => {
    if (!customerCode.trim()) {
      toast.error("カスタマーコードを入力してください")
      return
    }

    setIsLoading(true)
    try {
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

      // レイアウトデータをローカルストレージに保存
      localStorage.setItem("loadedLayout", JSON.stringify(result.data))
      localStorage.setItem("selectedStoreId", result.data.storeId)
      
      toast.success("レイアウトを読み込みました")
      
      // シミュレーター画面に遷移
      router.push("/simulator")

    } catch (error) {
      console.error("Load error:", error)
      toast.error("読み込みに失敗しました")
    } finally {
      setIsLoading(false)
    }
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
    </div>
  )
}