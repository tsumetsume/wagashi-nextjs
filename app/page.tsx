"use client"

import type React from "react"

import { useState } from "react"
import type { InfoDisplaySettings } from "@/components/info-settings-modal"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import type { BoxSize, PlacedItem } from "@/types/types"
import saveAs from "file-saver"
import { TutorialProvider } from "@/contexts/tutorial-context"
import WagashiSimulatorContent from "@/components/wagashi-simulator-content"

export default function WagashiSimulator() {
  const [boxSize, setBoxSize] = useState<BoxSize>("10x10")
  const [placedItems, setPlacedItems] = useState<PlacedItem[]>([])
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // 商品情報表示設定の初期値
  const [infoSettings, setInfoSettings] = useState<InfoDisplaySettings>({
    showName: true,
    showPrice: true,
    showSize: true,
    showImage: true,
    showCategory: false,
    showAllergies: true, // Add allergies option with default true
    showCalories: true, // Add calories option with default true
    showDescription: true, // Add description option with default true
  })

  const handleSaveLayout = () => {
    const data = JSON.stringify({ boxSize, placedItems, infoSettings }, null, 2)
    const blob = new Blob([data], { type: "application/json" })
    saveAs(blob, "wagashi-layout.json")
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
          // 設定も読み込む（存在する場合）
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

  return (
    <DndProvider backend={HTML5Backend}>
      <TutorialProvider>
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
          handleLoadLayout={handleLoadLayout}
          handleClearLayout={handleClearLayout}
          handleSaveSettings={handleSaveSettings}
        />
      </TutorialProvider>
    </DndProvider>
  )
}
