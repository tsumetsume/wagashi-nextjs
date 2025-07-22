"use client"

import React from "react"
import { AlertTriangle, Clock, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface MaintenanceModeProps {
  message?: string
  estimatedEndTime?: string | null
  onRefresh?: () => void
}

export default function MaintenanceMode({ 
  message = "システムメンテナンス中です。しばらくお待ちください。",
  estimatedEndTime,
  onRefresh
}: MaintenanceModeProps) {
  const formatEstimatedTime = (timeString: string) => {
    try {
      const date = new Date(timeString)
      return date.toLocaleString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return timeString
    }
  }

  return (
    <div className="min-h-screen washi-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-[var(--color-gold)] border-2">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 w-16 h-16 bg-[var(--color-gold)] rounded-full flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-xl font-medium text-[var(--color-indigo)]">
              メンテナンス中
            </CardTitle>
            <CardDescription className="text-base">
              {message}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {estimatedEndTime && (
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                <Clock className="h-4 w-4" />
                <span>
                  予定終了時刻: {formatEstimatedTime(estimatedEndTime)}
                </span>
              </div>
            )}
            
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                ご不便をおかけして申し訳ございません。<br />
                メンテナンス完了まで今しばらくお待ちください。
              </p>
              
              {onRefresh && (
                <Button 
                  variant="outline" 
                  onClick={onRefresh}
                  className="w-full border-[var(--color-indigo)] text-[var(--color-indigo)] hover:bg-[var(--color-indigo)] hover:text-white"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  再読み込み
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            和菓子詰め合わせシミュレーター
          </p>
        </div>
      </div>
    </div>
  )
}