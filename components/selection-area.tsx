"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { PlacedItem, SweetItem, DividerItem } from "@/types/types"
import SweetItemComponent from "./sweet-item"
import DividerItemComponent from "./divider-item"
import { fetchSweets, fetchDividers } from "@/services/api-service"
import { Loader2, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SelectionAreaProps {
  placedItems: PlacedItem[]
  setPlacedItems: React.Dispatch<React.SetStateAction<PlacedItem[]>>
  inventoryData?: SweetItem[] // 在庫データを受け取るプロパティを追加
}

export default function SelectionArea({ placedItems, setPlacedItems, inventoryData }: SelectionAreaProps) {
  const [activeTab, setActiveTab] = useState("焼き菓子")
  const [sweets, setSweets] = useState<SweetItem[]>([])
  const [dividers, setDividers] = useState<DividerItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const tabsListRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)

  // カテゴリーの配列
  const categories = ["焼き菓子", "餅菓子", "水菓子", "干菓子", "蒸し菓子", "季節限定", "伝統菓子", "仕切り"]

  // APIからデータを取得
  const loadData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [sweetsData, dividersData] = await Promise.all([fetchSweets(), fetchDividers()])

      // 在庫データが提供されている場合は、それを使用
      if (inventoryData) {
        setSweets(inventoryData)
      } else {
        setSweets(sweetsData)
      }

      setDividers(dividersData)
    } catch (err) {
      console.error("Failed to load data:", err)
      setError("データの読み込みに失敗しました。再読み込みしてください。")
    } finally {
      setIsLoading(false)
    }
  }

  // 初回マウント時にデータを読み込む
  useEffect(() => {
    loadData()
  }, [inventoryData])

  // 在庫更新イベントのリスナーを追加
  useEffect(() => {
    const handleInventoryUpdate = (event: CustomEvent) => {
      const updatedSweets = event.detail
      if (updatedSweets) {
        setSweets(updatedSweets)
      }
    }

    window.addEventListener("inventoryUpdated", handleInventoryUpdate as EventListener)

    return () => {
      window.removeEventListener("inventoryUpdated", handleInventoryUpdate as EventListener)
    }
  }, [])

  // グローバルに保存された在庫データを確認
  useEffect(() => {
    const globalUpdatedSweets = (window as any).updatedSweetsData
    if (globalUpdatedSweets) {
      setSweets(globalUpdatedSweets)
    }
  }, [])

  // タブのスクロール状態を確認する関数
  const checkScrollPosition = () => {
    if (tabsListRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsListRef.current
      setShowLeftArrow(scrollLeft > 0)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5) // 5pxの余裕を持たせる
    }
  }

  // コンポーネントマウント時とリサイズ時にスクロール状態を確認
  useEffect(() => {
    checkScrollPosition()
    window.addEventListener("resize", checkScrollPosition)
    return () => window.removeEventListener("resize", checkScrollPosition)
  }, [])

  // タブリストがレンダリングされた後にスクロール状態を確認
  useEffect(() => {
    checkScrollPosition()
  }, [tabsListRef.current])

  // 左にスクロールする関数
  const scrollLeft = () => {
    if (tabsListRef.current) {
      tabsListRef.current.scrollBy({ left: -100, behavior: "smooth" })
      setTimeout(checkScrollPosition, 300) // スクロールアニメーション後に状態を更新
    }
  }

  // 右にスクロールする関数
  const scrollRight = () => {
    if (tabsListRef.current) {
      tabsListRef.current.scrollBy({ left: 100, behavior: "smooth" })
      setTimeout(checkScrollPosition, 300) // スクロールアニメーション後に状態を更新
    }
  }

  const filteredSweets = sweets.filter((sweet) => sweet.category === activeTab)

  // 在庫切れの和菓子の数を取得
  const outOfStockCount = filteredSweets.filter((sweet) => !sweet.inStock).length
  const totalCount = filteredSweets.length

  return (
    <div className="w-full md:w-80 bg-white p-4 rounded-sm shadow-md flex flex-col h-full border border-[var(--color-indigo-light)]">
      <h2 className="text-xl font-medium mb-4 text-[var(--color-indigo)] tracking-wide flex items-center">
        <span className="inline-block w-1 h-6 bg-[var(--color-indigo)] mr-2"></span>
        和菓子選択
      </h2>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-[var(--color-indigo)] animate-spin" />
          <span className="ml-2 text-[var(--color-indigo)]">読み込み中...</span>
        </div>
      ) : error ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-[var(--color-red)] text-center mb-4">
            <p>{error}</p>
          </div>
          <Button
            onClick={loadData}
            className="px-4 py-2 bg-[var(--color-indigo)] text-white rounded-sm hover:bg-[var(--color-indigo-light)] transition-colors relative overflow-hidden group flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--color-gold)] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
            再読み込み
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="焼き菓子" onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="relative">
            {/* 左スクロールボタン */}
            {showLeftArrow && (
              <button
                onClick={scrollLeft}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-1 shadow-md hover:bg-white transition-colors"
                aria-label="左にスクロール"
              >
                <ChevronLeft className="h-5 w-5 text-[var(--color-indigo)]" />
              </button>
            )}

            {/* スクロール可能なタブリスト */}
            <div className="overflow-x-auto scrollbar-hide" ref={tabsListRef} onScroll={checkScrollPosition}>
              <TabsList className="flex min-w-max bg-[var(--color-beige)] p-1">
                {categories.map((category) => (
                  <TabsTrigger
                    key={category}
                    value={category}
                    className="px-3 py-1.5 whitespace-nowrap data-[state=active]:bg-[var(--color-indigo)] data-[state=active]:text-white"
                  >
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* 右スクロールボタン */}
            {showRightArrow && (
              <button
                onClick={scrollRight}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-1 shadow-md hover:bg-white transition-colors"
                aria-label="右にスクロール"
              >
                <ChevronRight className="h-5 w-5 text-[var(--color-indigo)]" />
              </button>
            )}
          </div>

          {/* 在庫状況の表示 */}
          {activeTab !== "仕切り" && (
            <div className="mt-2 mb-1 text-xs text-gray-500 flex justify-between items-center">
              <span>
                在庫あり: {totalCount - outOfStockCount}/{totalCount}
              </span>
              {outOfStockCount > 0 && <span className="text-red-500">在庫切れ: {outOfStockCount}種</span>}
            </div>
          )}

          <div className="flex-1 overflow-hidden mt-2">
            {categories
              .filter((category) => category !== "仕切り")
              .map((category) => (
                <TabsContent key={category} value={category} className="h-full overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4 pb-4 max-h-[60vh] overflow-y-auto">
                    {filteredSweets.length > 0 ? (
                      filteredSweets.map((sweet) => <SweetItemComponent key={sweet.id} item={sweet} />)
                    ) : (
                      <div className="col-span-2 text-center py-8 text-gray-500">このカテゴリの商品はありません</div>
                    )}
                  </div>
                </TabsContent>
              ))}

            <TabsContent value="仕切り" className="h-full overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4 pb-4 max-h-[60vh] overflow-y-auto">
                {dividers.length > 0 ? (
                  dividers.map((divider) => <DividerItemComponent key={divider.id} item={divider} />)
                ) : (
                  <div className="col-span-2 text-center py-8 text-gray-500">仕切りアイテムはありません</div>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      )}
    </div>
  )
}
