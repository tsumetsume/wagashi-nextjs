"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Copy, Check, QrCode } from "lucide-react"
import { toast } from "sonner"

interface CustomerCodeModalProps {
  isOpen: boolean
  onClose: () => void
  customerCode: string
  expiresAt: string
}

export default function CustomerCodeModal({
  isOpen,
  onClose,
  customerCode,
  expiresAt
}: CustomerCodeModalProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(customerCode)
      setCopied(true)
      toast.success("カスタマーコードをコピーしました")
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error("コピーに失敗しました")
    }
  }

  const formatExpiryDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-[var(--color-indigo)]">
            保存完了
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <div className="mb-4">
              <QrCode className="h-16 w-16 mx-auto text-[var(--color-indigo)] mb-2" />
              <p className="text-sm text-gray-600">
                カスタマーコードが生成されました
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-3xl font-mono font-bold text-[var(--color-indigo)] tracking-wider mb-2">
                {customerCode}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    コピー済み
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    コピー
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <p className="font-medium">ご利用方法：</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>このコードをメモまたはコピーしてください</li>
              <li>店舗でカスタマーコード入力画面を開いてください</li>
              <li>コードを入力してレイアウトを復元してください</li>
            </ol>
          </div>

          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>有効期限：</strong>{formatExpiryDate(expiresAt)}
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              期限を過ぎるとコードは無効になります
            </p>
          </div>

          <Button
            onClick={onClose}
            className="w-full bg-[var(--color-indigo)] hover:bg-[var(--color-indigo-dark)]"
          >
            閉じる
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}