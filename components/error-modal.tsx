"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface ErrorModalProps {
  title: string
  message: string
  onClose: () => void
}

export default function ErrorModal({ title, message, onClose }: ErrorModalProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-red-600">
            <AlertTriangle className="h-5 w-5 mr-2" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-gray-700">{message}</p>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>閉じる</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
