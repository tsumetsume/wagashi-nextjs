import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingOverlayProps {
  isLoading: boolean
  message?: string
  className?: string
}

export function LoadingOverlay({ 
  isLoading, 
  message = '処理中...', 
  className 
}: LoadingOverlayProps) {
  if (!isLoading) return null

  return (
    <div className={cn(
      "fixed inset-0 bg-black/50 flex items-center justify-center z-50",
      className
    )}>
      <div className="bg-white rounded-lg p-6 flex flex-col items-center space-y-4 shadow-lg">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-gray-700 font-medium">{message}</p>
      </div>
    </div>
  )
} 