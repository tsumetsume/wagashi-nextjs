"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { InfoDisplaySettings } from "@/components/info-settings-modal"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import type { BoxSize, PlacedItem } from "@/types/types"
import saveAs from "file-saver"
import { TutorialProvider } from "@/contexts/tutorial-context"
import WagashiSimulatorContent from "@/components/wagashi-simulator-content"
import MaintenanceMode from "@/components/maintenance-mode"
import { useMaintenanceMode } from "@/hooks/use-maintenance-mode"
import CustomerCodeModal from "@/components/customer-code-modal"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Store } from "lucide-react"
import { toast } from "sonner"

export default function WagashiSimulator() {
  const router = useRouter()
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null)
  const [storeName, setStoreName] = useState<string>("")

  // メンテナンスモードの状態を取得
  const { 
    isMaintenanceMode, 
    maintenanceMessage, 
    estimatedEndTime, 
    isLoading: isMaintenanceLoading,
    refetch: refetchMaintenanceStatus 
  } = useMaintenanceMode()

  const [boxSize, setBoxSize] = useState<BoxSize>("10x10")
  const [placedItems, setPlacedItems] = useState<PlacedItem[]>([])
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  
  // カスタマーコードモーダルの状態
  const [isCustomerCodeModalOpen, setIsCustomerCodeModalOpen] = useState(false)
  const [customerCode, setCustomerCode] = useState("")
  const [expiresAt, setExpiresAt] = useState("")

  // 商品情報表示設定の初期値
  const [infoSettings, setInfoSettings] = useState<InfoDisplaySettings>({
    showName: true,
    showPrice: true,
    showSize: true,
    showImage: true,
    showCategory: false,
    showAllergies: true,
    showCalories: true,
    showDescription: true,
    showIngredients: false,
    showNutritionInfo: false,
    showShelfLife: false,
    showStorageMethod: false,
  })

  useEffect(() => {
    // 選択された店舗IDを取得
    const storeId = localStorage.getItem("selectedStoreId")
    if (!storeId) {
      // 店舗が選択されていない場合は店舗選択画面に戻る
      router.push("/store-selection")
      return
    }
    setSelectedStoreId(storeId)
    
    // 店舗名を取得
    fetchStoreName(storeId)
    
    // 読み込まれたレイアウトがあるかチェック
    const loadedLayout = localStorage.getItem("loadedLayout")
    if (loadedLayout) {
      try {
        const data = JSON.parse(loadedLayout)
        setBoxSize(data.boxSize)
        setPlacedItems(data.placedItems)
        setInfoSettings(data.infoSettings || infoSettings)
        localStorage.removeItem("loadedLayout") // 使用後は削除
        toast.success("保存されたレイアウトを読み込みました")
      } catch (error) {
        console.error("Failed to load saved layout:", error)
      }
    }
  }, [router])

  const fetchStoreName = async (storeId: string) => {
    try {
      const response = await fetch(`/api/stores/${storeId}`)
      if (response.ok) {
        const store = await response.json()
        setStoreName(store.name)
      }
    } catch (error) {
      console.error("Error fetching store name:", error)
    }
  }

  const handleBackToStoreSelection = () => {
    localStorage.removeItem("selectedStoreId")
    router.push("/store-selection")
  }

  const handleSaveLayout = () => {
    const data = JSON.stringify({ boxSize, placedItems, infoSettings, storeId: selectedStoreId }, null, 2)
    const blob = new Blob([data], { type: "application/json" })
    saveAs(blob, `wagashi-layout-${storeName || 'store'}.json`)
  }

  // カスタマーコードで保存する関数
  const handleSaveWithCustomerCode = async () => {
    if (!selectedStoreId || placedItems.length === 0) {
      toast.error("保存するレイアウトがありません")
      return
    }

    try {
      const response = await fetch("/api/layouts/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storeId: selectedStoreId,
          storeName,
          boxSize,
          placedItems,
          infoSettings,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || "保存に失敗しました")
        return
      }

      setCustomerCode(result.customerCode)
      setExpiresAt(result.expiresAt)
      setIsCustomerCodeModalOpen(true)
      toast.success("カスタマーコードで保存しました")

    } catch (error) {
      console.error("Save error:", error)
      toast.error("保存に失敗しました")
    }
  }

  const handleLoadLayout = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string)
        if (data.boxSize && data.placedItems) {
          setBoxSize(data.boxSize)
          setPlacedItems(data.placedItems)
          if (data.infoSettings) {
            setInfoSettings(data.infoSettings)
          }
        }
      } catch (error) {
        console.error("Invalid file format", error)
      }
    }
    reader.readAsText(file)
  }

  const handleClearLayout = () => {
    if (confirm("詰め合わせをクリアしますか？")) {
      setPlacedItems([])
    }
  }

  const handleSaveSettings = (newSettings: InfoDisplaySettings) => {
    setInfoSettings(newSettings)
  }

  // 店舗が選択されていない場合は何も表示しない
  if (!selectedStoreId) {
    return null
  }

  // メンテナンスモードが有効で、読み込み完了後の場合はメンテナンス画面を表示
  if (!isMaintenanceLoading && isMaintenanceMode) {
    return (
      <MaintenanceMode
        message={maintenanceMessage}
        estimatedEndTime={estimatedEndTime}
        onRefresh={refetchMaintenanceStatus}
      />
    )
  }

  // 通常のシミュレーター画面を表示（読み込み中も含む）
  return (
    <DndProvider backend={HTML5Backend}>
      <TutorialProvider>
        <div className="relative">
          {/* 店舗情報とナビゲーション */}
          <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToStoreSelection}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                店舗選択に戻る
              </Button>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Store className="h-4 w-4" />
                <span className="font-medium">{storeName}</span>
              </div>
            </div>
          </div>

          <WagashiSimulatorContent
            boxSize={boxSize}
            setBoxSize={setBoxSize}
            placedItems={placedItems}
            setPlacedItems={setPlacedItems}
            isHelpOpen={isHelpOpen}
            setIsHelpOpen={setIsHelpOpen}
            isSettingsOpen={isSettingsOpen}
            setIsSettingsOpen={setIsSettingsOpen}
            infoSettings={infoSettings}
            handleSaveLayout={handleSaveLayout}
            handleSaveWithCustomerCode={handleSaveWithCustomerCode}
            handleLoadLayout={handleLoadLayout}
            handleClearLayout={handleClearLayout}
            handleSaveSettings={handleSaveSettings}
            selectedStoreId={selectedStoreId}
          />

          {/* カスタマーコードモーダル */}
          <CustomerCodeModal
            isOpen={isCustomerCodeModalOpen}
            onClose={() => setIsCustomerCodeModalOpen(false)}
            customerCode={customerCode}
            expiresAt={expiresAt}
          />
        </div>
      </TutorialProvider>
    </DndProvider>
  )
}