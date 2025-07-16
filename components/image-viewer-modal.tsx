"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { X } from "lucide-react"
import { useState } from "react"

interface ImageViewerModalProps {
  imageUrl: string
  altText: string
  onClose: () => void
}

export default function ImageViewerModal({ imageUrl, altText, onClose }: ImageViewerModalProps) {
  const [scale, setScale] = useState(1)

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5))
  }

  const handleReset = () => {
    setScale(1)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] p-0 overflow-hidden bg-gray-100 !bg-opacity-100 dialog-content">
        <DialogHeader className="sr-only">
          <DialogTitle>{altText || "画像プレビュー"}</DialogTitle>
        </DialogHeader>
        <div className="relative w-full h-full">
          {/* 閉じるボタン */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 z-10 bg-white/80 rounded-full p-1.5 hover:bg-white transition-colors shadow-sm"
            aria-label="閉じる"
          >
            <X className="h-6 w-6 text-gray-700" />
          </button>

          {/* ズームコントロール */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-white/90 rounded-full px-4 py-2 flex items-center space-x-4 shadow-sm">
            <button
              onClick={handleZoomOut}
              className="text-gray-700 hover:text-amber-800 disabled:opacity-50"
              disabled={scale <= 0.5}
              aria-label="縮小"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </button>
            <button onClick={handleReset} className="text-gray-700 hover:text-amber-800 text-sm font-medium">
              {Math.round(scale * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              className="text-gray-700 hover:text-amber-800 disabled:opacity-50"
              disabled={scale >= 3}
              aria-label="拡大"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="11" y1="8" x2="11" y2="14" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </button>
          </div>

          {/* 画像表示エリア */}
          <div className="w-full h-full overflow-auto p-8 flex items-center justify-center bg-gray-100 bg-opacity-80 bg-grid-pattern">
            <img
              src={imageUrl || "/placeholder.svg"}
              alt={altText}
              className="transition-transform duration-200 ease-in-out shadow-lg"
              style={{
                transform: `scale(${scale})`,
                maxWidth: "100%",
                maxHeight: "70vh",
                objectFit: "contain",
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
