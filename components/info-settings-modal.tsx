"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useState } from "react"

export interface InfoDisplaySettings {
  showName: boolean
  showPrice: boolean
  showSize: boolean
  showImage: boolean
  showCategory: boolean
  showAllergies: boolean // Add allergies option
  showCalories: boolean // Add calories option
  showDescription: boolean // Add description option
}

interface InfoSettingsModalProps {
  settings: InfoDisplaySettings
  onSave: (settings: InfoDisplaySettings) => void
  onClose: () => void
}

export default function InfoSettingsModal({ settings, onSave, onClose }: InfoSettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<InfoDisplaySettings>({ ...settings })

  const handleSave = () => {
    onSave(localSettings)
    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>商品情報表示設定</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showName"
              checked={localSettings.showName}
              onCheckedChange={(checked) => setLocalSettings({ ...localSettings, showName: !!checked })}
            />
            <Label htmlFor="showName">商品名</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showPrice"
              checked={localSettings.showPrice}
              onCheckedChange={(checked) => setLocalSettings({ ...localSettings, showPrice: !!checked })}
            />
            <Label htmlFor="showPrice">価格</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showSize"
              checked={localSettings.showSize}
              onCheckedChange={(checked) => setLocalSettings({ ...localSettings, showSize: !!checked })}
            />
            <Label htmlFor="showSize">サイズ</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showImage"
              checked={localSettings.showImage}
              onCheckedChange={(checked) => setLocalSettings({ ...localSettings, showImage: !!checked })}
            />
            <Label htmlFor="showImage">画像</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showCategory"
              checked={localSettings.showCategory}
              onCheckedChange={(checked) => setLocalSettings({ ...localSettings, showCategory: !!checked })}
            />
            <Label htmlFor="showCategory">カテゴリ</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showAllergies"
              checked={localSettings.showAllergies}
              onCheckedChange={(checked) => setLocalSettings({ ...localSettings, showAllergies: !!checked })}
            />
            <Label htmlFor="showAllergies">アレルギー情報</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showCalories"
              checked={localSettings.showCalories}
              onCheckedChange={(checked) => setLocalSettings({ ...localSettings, showCalories: !!checked })}
            />
            <Label htmlFor="showCalories">カロリー</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showDescription"
              checked={localSettings.showDescription}
              onCheckedChange={(checked) => setLocalSettings({ ...localSettings, showDescription: !!checked })}
            />
            <Label htmlFor="showDescription">詳細説明</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={handleSave}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
