"use client"

import { useState, useEffect } from 'react'

interface MaintenanceSettings {
  maintenanceMode: boolean
  maintenanceMessage: string
  estimatedEndTime: string | null
}

export function useMaintenanceMode() {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false)
  const [maintenanceMessage, setMaintenanceMessage] = useState('')
  const [estimatedEndTime, setEstimatedEndTime] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  const fetchMaintenanceStatus = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/settings')
      
      if (!response.ok) {
        throw new Error('Failed to fetch maintenance status')
      }
      
      const result = await response.json()
      
      if (result.success && result.data) {
        const settings: MaintenanceSettings = result.data
        setIsMaintenanceMode(settings.maintenanceMode)
        setMaintenanceMessage(settings.maintenanceMessage)
        setEstimatedEndTime(settings.estimatedEndTime)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Error fetching maintenance status:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return
    
    fetchMaintenanceStatus()
    
    // 定期的にメンテナンス状態をチェック（30秒間隔）
    const interval = setInterval(fetchMaintenanceStatus, 30000)
    
    return () => clearInterval(interval)
  }, [isMounted])

  return {
    isMaintenanceMode: isMounted ? isMaintenanceMode : false,
    maintenanceMessage,
    estimatedEndTime,
    isLoading: !isMounted || isLoading,
    error,
    refetch: fetchMaintenanceStatus
  }
}