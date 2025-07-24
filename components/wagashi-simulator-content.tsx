"use client"

import type React from "react"

import BoxArea from "@/components/box-area"
import SelectionArea from "@/components/selection-area"
import HelpModal from "@/components/help-modal"
import InfoSettingsModal, { type InfoDisplaySettings } from "@/components/info-settings-modal"
import InventorySettingsModal from "@/components/inventory-settings-modal"
import ProductUpdateModal from "@/components/product-update-modal"
import type { BoxSize, PlacedItem, SweetItem } from "@/types/types"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { PlusCircle, Save, Upload, HelpCircle, Settings, Package, Cloud } from "lucide-react"
import TutorialOverlay from "@/components/tutorial-overlay"
import TutorialButton from "@/components/tutorial-button"
import { useTutorialTarget } from "@/hooks/use-tutorial-target"
import { useState, useEffect } from "react"

interface WagashiSimulatorContentProps {
  boxSize: BoxSize
  setBoxSize: React.Dispatch<React.SetStateAction<BoxSize>>
  placedItems: PlacedItem[]
  setPlacedItems: React.Dispatch<React.SetStateAction<PlacedItem[]>>
  isHelpOpen: boolean
  setIsHelpOpen: React.Dispatch<React.SetStateAction<boolean>>
  isSettingsOpen: boolean
  setIsSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>
  infoSettings: InfoDisplaySettings
  handleSaveLayout: () => void
  handleSaveWithCustomerCode: () => void
  handleLoadLayout: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleClearLayout: () => void
  handleSaveSettings: (newSettings: InfoDisplaySettings) => void
  selectedStoreId: string
  isSavingCustomerCode: boolean
}

export default function WagashiSimulatorContent({
  boxSize,
  setBoxSize,
  placedItems,
  setPlacedItems,
  isHelpOpen,
  setIsHelpOpen,
  isSettingsOpen,
  setIsSettingsOpen,
  infoSettings,
  handleSaveLayout,
  handleSaveWithCustomerCode,
  handleLoadLayout,
  handleClearLayout,
  handleSaveSettings,
  selectedStoreId,
  isSavingCustomerCode,
}: WagashiSimulatorContentProps) {
  // 在庫管理モーダルの状態
  const [isInventoryOpen, setIsInventoryOpen] = useState(false)
  // 在庫データの状態
  const [inventoryData, setInventoryData] = useState<SweetItem[]>([])
  // 商品変更通知モーダルの状態
  const [isProductUpdateModalOpen, setIsProductUpdateModalOpen] = useState(false)
  const [productUpdateMessage, setProductUpdateMessage] = useState("商品情報が変更されました")

  // チュートリアルのターゲット要素の参照
  const selectionAreaRef = useTutorialTarget("select-sweet")
  const boxAreaRef = useTutorialTarget("drag-drop")
  const contextMenuRef = useTutorialTarget("context-menu")
  const productInfoRef = useTutorialTarget("product-info")
  const settingsRef = useTutorialTarget("settings")
  const saveLoadRef = useTutorialTarget("save-load")
  const customerCodeSaveRef = useTutorialTarget("customer-code-save")
  const autoDividerRef = useTutorialTarget("auto-divider")
  const printRef = useTutorialTarget("print")

  // 商品変更通知を受け取る
  useEffect(() => {
    const handleProductUpdate = (event: CustomEvent) => {
      const message = event.detail?.message || "商品情報が変更されました"
      setProductUpdateMessage(message)
      setIsProductUpdateModalOpen(true)
    }

    window.addEventListener("productUpdate", handleProductUpdate as EventListener)

    return () => {
      window.removeEventListener("productUpdate", handleProductUpdate as EventListener)
    }
  }, [])

  // 在庫データを更新する関数
  const handleUpdateInventory = (updatedSweets: SweetItem[]) => {
    // グローバルな在庫データを更新
    // 注意: 実際のアプリケーションでは、この更新方法は適切ではありません
    // 本来はコンテキストやReduxなどの状態管理を使用するべきです
    ; (window as any).updatedSweetsData = updatedSweets
    setInventoryData(updatedSweets)

    // 選択エリアを更新するためにイベントを発火
    const event = new CustomEvent("inventoryUpdated", { detail: updatedSweets })
    window.dispatchEvent(event)
  }

  // 配置済みアイテムを削除する関数
  const handleRemovePlacedItems = (itemIds: string[]) => {
    setPlacedItems(prev => prev.filter(item => !itemIds.includes(item.id)))
  }

  // ページをリロードする関数
  const handleReload = () => {
    window.location.reload()
  }

  // 和菓子が配置されているかチェック
  const hasPlacedItems = placedItems.length > 0
  const isCustomerCodeSaveDisabled = isSavingCustomerCode || !hasPlacedItems

  return (
    <TooltipProvider>
      <div className="min-h-screen washi-bg">
        <header className="bg-[var(--color-indigo)] text-white p-4 shadow-md relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[url('/pattern-japanese.svg')] bg-repeat"></div>
          </div>
          <div className="container mx-auto flex justify-between items-center relative z-10">
            <h1 className="text-2xl font-medium tracking-wider">和菓子詰め合わせシミュレーター</h1>
            <div className="flex items-center gap-2">
              <div className="flex gap-2" ref={saveLoadRef}>
                <select
                  className="bg-[var(--color-indigo-light)] border border-[var(--color-indigo-dark)] rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)]"
                  value={boxSize}
                  onChange={(e) => setBoxSize(e.target.value as BoxSize)}
                >
                  <option value="10x10">10×10</option>
                  <option value="15x15">15×15</option>
                  <option value="20x20">20×20</option>
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-[var(--color-indigo-light)] hover:bg-[var(--color-indigo)] border-[var(--color-indigo-dark)] text-white"
                  onClick={handleClearLayout}
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  新規
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-[var(--color-indigo-light)] hover:bg-[var(--color-indigo)] border-[var(--color-indigo-dark)] text-white"
                  onClick={handleSaveLayout}
                >
                  <Save className="h-4 w-4 mr-1" />
                  保存
                </Button>
                <label className="cursor-pointer">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-[var(--color-indigo-light)] hover:bg-[var(--color-indigo)] border-[var(--color-indigo-dark)] text-white"
                    onClick={() => document.getElementById("file-upload")?.click()}
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    読込
                  </Button>
                  <input id="file-upload" type="file" accept=".json" className="hidden" onChange={handleLoadLayout} />
                </label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`bg-[var(--color-indigo-light)] hover:bg-[var(--color-indigo)] border-[var(--color-indigo-dark)] text-white disabled:opacity-50 disabled:cursor-not-allowed ${!hasPlacedItems && !isSavingCustomerCode ? 'opacity-60' : ''
                        }`}
                      onClick={handleSaveWithCustomerCode}
                      disabled={isCustomerCodeSaveDisabled}
                      ref={customerCodeSaveRef as unknown as React.RefObject<HTMLButtonElement>}
                    >
                      {isSavingCustomerCode ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                          <span className="hidden sm:inline">保存中...</span>
                          <span className="sm:hidden">保存中</span>
                        </>
                      ) : (
                        <>
                          <Cloud className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">カスタマーコード保存</span>
                          <span className="sm:hidden">コード保存</span>
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    {isSavingCustomerCode ? (
                      <p>カスタマーコードを生成中です...</p>
                    ) : !hasPlacedItems ? (
                      <p>和菓子を配置してから保存してください</p>
                    ) : (
                      <p>詰め合わせをカスタマーコードで保存します</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-[var(--color-indigo-light)]"
                onClick={() => setIsInventoryOpen(true)}
              >
                <Package className="h-5 w-5" />
                <span className="hidden sm:inline ml-1">在庫管理</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-[var(--color-indigo-light)]"
                onClick={() => setIsSettingsOpen(true)}
                ref={settingsRef as unknown as React.RefObject<HTMLButtonElement>}
              >
                <Settings className="h-5 w-5" />
              </Button>
              <TutorialButton />
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-[var(--color-indigo-light)]"
                onClick={() => setIsHelpOpen(true)}
              >
                <HelpCircle className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto p-4 flex flex-col md:flex-row gap-6 md:min-h-[calc(100vh-80px)]">
          <div ref={boxAreaRef} className="flex-1">
            <BoxArea
              boxSize={boxSize}
              placedItems={placedItems}
              setPlacedItems={setPlacedItems}
              infoSettings={infoSettings}
              contextMenuRef={contextMenuRef as React.RefObject<HTMLDivElement>}
              productInfoRef={productInfoRef as React.RefObject<HTMLDivElement>}
              autoDividerRef={autoDividerRef as React.RefObject<HTMLDivElement>}
              printRef={printRef as React.RefObject<HTMLDivElement>}
              selectedStoreId={selectedStoreId}
            />
          </div>
          <div ref={selectionAreaRef} className="md:h-[calc(100vh-100px)] flex">
            <SelectionArea
              placedItems={placedItems}
              setPlacedItems={setPlacedItems}
              inventoryData={inventoryData}
              selectedStoreId={selectedStoreId}
            />
          </div>
        </main>

        {isHelpOpen && <HelpModal onClose={() => setIsHelpOpen(false)} />}
        {isSettingsOpen && (
          <InfoSettingsModal
            settings={infoSettings}
            onSave={handleSaveSettings}
            onClose={() => setIsSettingsOpen(false)}
          />
        )}
        {isInventoryOpen && (
          <InventorySettingsModal
            onClose={() => setIsInventoryOpen(false)}
            onUpdateInventory={handleUpdateInventory}
            placedItems={placedItems}
            onRemovePlacedItems={handleRemovePlacedItems}
            selectedStoreId={selectedStoreId}
          />
        )}
        <ProductUpdateModal
          isOpen={isProductUpdateModalOpen}
          onClose={() => setIsProductUpdateModalOpen(false)}
          onReload={handleReload}
          message={productUpdateMessage}
        />
        <TutorialOverlay />
      </div>
    </TooltipProvider>
  )
}
