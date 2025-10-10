"use client"

import type React from "react"

import BoxArea from "@/components/box-area"
import SelectionArea from "@/components/selection-area"
import HelpModal from "@/components/help-modal"
import InfoSettingsModal, { type InfoDisplaySettings } from "@/components/info-settings-modal"
import InventorySettingsModal from "@/components/inventory-settings-modal"
import ProductUpdateModal from "@/components/product-update-modal"
import PrintModal from "@/components/print-modal"
import BoxSelectionModal from "@/components/box-selection-modal"
import type { BoxSize, PlacedItem, SweetItem, BoxType } from "@/types/types"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { PlusCircle, Save, Upload, HelpCircle, Settings, Package, Cloud, Printer } from "lucide-react"
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
  selectedBoxType?: BoxType | null
  onBoxTypeChange?: (boxType: BoxType | null) => void
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
  selectedBoxType,
  onBoxTypeChange,
}: WagashiSimulatorContentProps) {
  // 在庫管理モーダルの状態
  const [isInventoryOpen, setIsInventoryOpen] = useState(false)
  // 在庫データの状態
  const [inventoryData, setInventoryData] = useState<SweetItem[]>([])
  // 商品変更通知モーダルの状態
  const [isProductUpdateModalOpen, setIsProductUpdateModalOpen] = useState(false)
  const [productUpdateMessage, setProductUpdateMessage] = useState("商品情報が変更されました")
  // 印刷モーダルの状態
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  // 箱選択モーダルの状態
  const [isBoxSelectionOpen, setIsBoxSelectionOpen] = useState(false)

  // チュートリアルのターゲット要素の参照
  const selectionAreaRef = useTutorialTarget("select-sweet")
  const boxAreaRef = useTutorialTarget("drag-drop")
  const contextMenuRef = useTutorialTarget("context-menu")
  const productInfoRef = useTutorialTarget("product-info")
  const settingsRef = useTutorialTarget("settings")
  const saveLoadRef = useTutorialTarget("save-load")
  const customerCodeSaveRef = useTutorialTarget("customer-code-save")

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

  // 箱選択のハンドラー
  const handleBoxSelection = (newBoxSize: BoxSize, boxType: BoxType) => {
    setBoxSize(newBoxSize)
    onBoxTypeChange?.(boxType)
  }

  // 和菓子が配置されているかチェック
  const hasPlacedItems = placedItems.length > 0
  const isCustomerCodeSaveDisabled = isSavingCustomerCode || !hasPlacedItems

  // 合計金額を計算する関数
  const calculateTotalPrice = () => {
    const sweetsTotal = placedItems
      .filter((item) => item.type === "sweet" && item.price)
      .reduce((total, item) => total + (item.price || 0), 0)
    
    const boxPrice = selectedBoxType?.price || 0
    return sweetsTotal + boxPrice
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen washi-bg">
        <header className="bg-[var(--color-indigo)] text-white shadow-md relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[url('/pattern-japanese.svg')] bg-repeat"></div>
          </div>
          <div className="container mx-auto relative z-10">
            {/* モバイル用のヘッダー */}
            <div className="lg:hidden p-3">
              {/* 第1行: 箱サイズとメインアクション */}
              <div className="flex items-center justify-between mb-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-[var(--color-indigo-light)] hover:bg-[var(--color-indigo)] border-[var(--color-indigo-dark)] text-white px-2 relative"
                      onClick={() => setIsBoxSelectionOpen(true)}
                    >
                      <Package className="h-3 w-3 mr-1" />
                      <span className="text-xs">
                        {selectedBoxType ? selectedBoxType.name : boxSize}
                      </span>
                      <svg className="h-2 w-2 ml-1 opacity-70" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>箱のサイズを変更</p>
                  </TooltipContent>
                </Tooltip>
                
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-[var(--color-indigo-light)] hover:bg-[var(--color-indigo)] border-[var(--color-indigo-dark)] text-white px-2"
                    onClick={handleClearLayout}
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-[var(--color-indigo-light)] hover:bg-[var(--color-indigo)] border-[var(--color-indigo-dark)] text-white px-2"
                    onClick={handleSaveLayout}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                  <label className="cursor-pointer">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-[var(--color-indigo-light)] hover:bg-[var(--color-indigo)] border-[var(--color-indigo-dark)] text-white px-2"
                      onClick={() => document.getElementById("file-upload")?.click()}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                    <input id="file-upload" type="file" accept=".json" className="hidden" onChange={handleLoadLayout} />
                  </label>
                </div>
              </div>

              {/* 第2行: カスタマーコード保存とその他のアクション */}
              <div className="flex items-center justify-between">
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
                          保存中
                        </>
                      ) : (
                        <>
                          <Cloud className="h-4 w-4 mr-1" />
                          コード保存
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

                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-[var(--color-indigo-light)] px-2"
                    onClick={() => setIsPrintModalOpen(true)}
                    ref={printRef as unknown as React.RefObject<HTMLButtonElement>}
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-[var(--color-indigo-light)] px-2"
                    onClick={() => setIsInventoryOpen(true)}
                  >
                    <Package className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-[var(--color-indigo-light)] px-2"
                    onClick={() => setIsSettingsOpen(true)}
                    ref={settingsRef as unknown as React.RefObject<HTMLButtonElement>}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <TutorialButton />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-[var(--color-indigo-light)] px-2"
                    onClick={() => setIsHelpOpen(true)}
                  >
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* デスクトップ用のヘッダー */}
            <div className="hidden lg:flex justify-center items-center p-4">
              <div className="flex items-center gap-2">
                <div className="flex gap-2" ref={saveLoadRef}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-[var(--color-indigo-light)] hover:bg-[var(--color-indigo)] border-[var(--color-indigo-dark)] text-white relative"
                        onClick={() => setIsBoxSelectionOpen(true)}
                      >
                        <Package className="h-4 w-4 mr-2" />
                        <span>
                          {selectedBoxType ? selectedBoxType.name : boxSize}
                        </span>
                        <svg className="h-3 w-3 ml-2 opacity-70" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>箱のサイズを変更（クリックして選択）</p>
                    </TooltipContent>
                  </Tooltip>
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
                            <span className="hidden xl:inline">保存中...</span>
                            <span className="xl:hidden">保存中</span>
                          </>
                        ) : (
                          <>
                            <Cloud className="h-4 w-4 mr-1" />
                            <span className="hidden xl:inline">カスタマーコード保存</span>
                            <span className="xl:hidden">コード保存</span>
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
                  onClick={() => setIsPrintModalOpen(true)}
                  ref={printRef as unknown as React.RefObject<HTMLButtonElement>}
                >
                  <Printer className="h-5 w-5" />
                  <span className="hidden xl:inline ml-1">印刷</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-[var(--color-indigo-light)]"
                  onClick={() => setIsInventoryOpen(true)}
                >
                  <Package className="h-5 w-5" />
                  <span className="hidden xl:inline ml-1">在庫管理</span>
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
          </div>
        </header>

        <main className="container mx-auto p-1 sm:p-2 lg:p-4">
          {/* モバイル用のレイアウト */}
          <div className="lg:hidden space-y-4">
            {/* 合計金額表示（モバイル） */}
            <div className="p-3 bg-white rounded-sm border border-[var(--color-indigo-light)] shadow-sm">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">和菓子:</span>
                  <span>
                    {placedItems
                      .filter((item) => item.type === "sweet" && item.price)
                      .reduce((total, item) => total + (item.price || 0), 0)
                      .toLocaleString()}円
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">箱代:</span>
                  <span>{selectedBoxType ? selectedBoxType.price.toLocaleString() : 0}円</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="text-lg font-medium text-[var(--color-indigo)]">合計:</span>
                  <span className="text-xl font-bold text-[var(--color-indigo)]">
                    {calculateTotalPrice().toLocaleString()}円
                  </span>
                </div>
              </div>
            </div>
            
            {/* 和菓子選択エリア（モバイルでは上部に配置） */}
            <div ref={selectionAreaRef} className="w-full">
              <SelectionArea
                placedItems={placedItems}
                setPlacedItems={setPlacedItems}
                inventoryData={inventoryData}
                selectedStoreId={selectedStoreId}
              />
            </div>
            
            {/* 詰め合わせエリア */}
            <div ref={boxAreaRef} className="w-full flex justify-center">
              <BoxArea
                boxSize={boxSize}
                placedItems={placedItems}
                setPlacedItems={setPlacedItems}
                infoSettings={infoSettings}
                contextMenuRef={contextMenuRef as React.RefObject<HTMLDivElement>}
                productInfoRef={productInfoRef as React.RefObject<HTMLDivElement>}
                selectedStoreId={selectedStoreId}
              />
            </div>
          </div>

          {/* デスクトップ用のレイアウト */}
          <div className="hidden lg:flex gap-4">
            <div ref={boxAreaRef} className="flex-1 overflow-visible max-w-none">
              <BoxArea
                boxSize={boxSize}
                placedItems={placedItems}
                setPlacedItems={setPlacedItems}
                infoSettings={infoSettings}
                contextMenuRef={contextMenuRef as React.RefObject<HTMLDivElement>}
                productInfoRef={productInfoRef as React.RefObject<HTMLDivElement>}
                selectedStoreId={selectedStoreId}
              />
            </div>
            <div className="flex flex-col min-h-[calc(100vh-140px)] w-80 flex-shrink-0">
              {/* 合計金額表示（デスクトップ） */}
              <div className="mb-4 p-4 bg-white rounded-sm border border-[var(--color-indigo-light)] shadow-sm">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">和菓子:</span>
                    <span>
                      {placedItems
                        .filter((item) => item.type === "sweet" && item.price)
                        .reduce((total, item) => total + (item.price || 0), 0)
                        .toLocaleString()}円
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">箱代 ({selectedBoxType ? selectedBoxType.name : boxSize}):</span>
                    <span>{selectedBoxType ? selectedBoxType.price.toLocaleString() : 0}円</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="text-lg font-medium text-[var(--color-indigo)]">合計:</span>
                    <span className="text-xl font-bold text-[var(--color-indigo)]">
                      {calculateTotalPrice().toLocaleString()}円
                    </span>
                  </div>
                </div>
              </div>
              
              <div ref={selectionAreaRef} className="flex-1">
                <SelectionArea
                  placedItems={placedItems}
                  setPlacedItems={setPlacedItems}
                  inventoryData={inventoryData}
                  selectedStoreId={selectedStoreId}
                />
              </div>
            </div>
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
        {isPrintModalOpen && (
          <PrintModal
            placedItems={placedItems}
            boxSize={boxSize}
            infoSettings={infoSettings}
            onClose={() => setIsPrintModalOpen(false)}
            selectedStoreId={selectedStoreId}
          />
        )}

        {/* 箱選択モーダル */}
        <BoxSelectionModal
          isOpen={isBoxSelectionOpen}
          onClose={() => setIsBoxSelectionOpen(false)}
          onSelect={handleBoxSelection}
          currentBoxSize={boxSize}
          currentBoxType={selectedBoxType}
        />

        <TutorialOverlay />
      </div>
    </TooltipProvider>
  )
}
