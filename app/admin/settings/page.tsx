'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { LoadingOverlay } from '@/components/ui/loading-overlay'
import { 
  Settings, 
  Bell, 
  Shield, 
  Globe, 
  Database, 
  Save,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function SettingsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState('')
  const [isMounted, setIsMounted] = useState(false)
  
  // 基本設定
  const [siteSettings, setSiteSettings] = useState({
    siteName: '和菓子シミュレーター',
    siteDescription: '美しい和菓子の配置シミュレーター',
    contactEmail: 'admin@example.com',
    maintenanceMode: false
  })

  // メンテナンス設定
  const [maintenanceMessage, setMaintenanceMessage] = useState('システムメンテナンス中です。しばらくお待ちください。')
  const [estimatedEndTime, setEstimatedEndTime] = useState('')

  // クライアントサイドマウント状態の管理
  useEffect(() => {
    setIsMounted(true)
    setCurrentTime(new Date().toLocaleString('ja-JP'))
  }, [])

  // 初期データの読み込み
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings')
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            setSiteSettings(prev => ({
              ...prev,
              maintenanceMode: result.data.maintenanceMode
            }))
            setMaintenanceMessage(result.data.maintenanceMessage)
            setEstimatedEndTime(result.data.estimatedEndTime || '')
          }
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error)
      }
    }

    fetchSettings()
  }, [])

  // 通知設定
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    stockAlerts: true,
    orderNotifications: true,
    marketingEmails: false
  })

  // セキュリティ設定
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: '8',
    passwordPolicy: 'strong'
  })

  const handleSave = async (section: string) => {
    setIsLoading(true)
    
    try {
      if (section === '基本設定') {
        // メンテナンス設定をAPIに保存
        const response = await fetch('/api/admin/settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            maintenanceMode: siteSettings.maintenanceMode,
            maintenanceMessage,
            estimatedEndTime: estimatedEndTime || null,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to save settings')
        }
      } else {
        // 他の設定の場合は従来通りシミュレート
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
      toast({
        title: "設定を保存しました",
        description: `${section}の設定が正常に更新されました。`,
      })
    } catch (error) {
      toast({
        title: "エラー",
        description: "設定の保存に失敗しました。",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSiteSettingsChange = (field: string, value: string | boolean) => {
    setSiteSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleNotificationSettingsChange = (field: string, value: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleSecuritySettingsChange = (field: string, value: string | boolean) => {
    setSecuritySettings(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <LoadingOverlay isLoading={isLoading} message="設定を保存中..." />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">設定</h1>
          <p className="text-muted-foreground">
            サイトの設定を管理します
          </p>
        </div>
      </div>

      {/* 基本設定 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            基本設定
          </CardTitle>
          <CardDescription>
            サイトの基本情報と表示設定を管理します
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">サイト名</Label>
              <Input
                id="siteName"
                value={siteSettings.siteName}
                onChange={(e) => handleSiteSettingsChange('siteName', e.target.value)}
                placeholder="サイト名を入力"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">連絡先メールアドレス</Label>
              <Input
                id="contactEmail"
                type="email"
                value={siteSettings.contactEmail}
                onChange={(e) => handleSiteSettingsChange('contactEmail', e.target.value)}
                placeholder="admin@example.com"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="siteDescription">サイト説明</Label>
            <Textarea
              id="siteDescription"
              value={siteSettings.siteDescription}
              onChange={(e) => handleSiteSettingsChange('siteDescription', e.target.value)}
              placeholder="サイトの説明を入力"
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="maintenanceMode"
                checked={siteSettings.maintenanceMode}
                onCheckedChange={(checked) => handleSiteSettingsChange('maintenanceMode', checked)}
              />
              <Label htmlFor="maintenanceMode">メンテナンスモード</Label>
              {siteSettings.maintenanceMode && (
                <Badge variant="destructive">メンテナンス中</Badge>
              )}
            </div>

            {siteSettings.maintenanceMode && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <div className="space-y-2">
                  <Label htmlFor="maintenanceMessage">メンテナンスメッセージ</Label>
                  <Textarea
                    id="maintenanceMessage"
                    value={maintenanceMessage}
                    onChange={(e) => setMaintenanceMessage(e.target.value)}
                    placeholder="ユーザーに表示するメッセージを入力"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="estimatedEndTime">予定終了時刻（任意）</Label>
                  <Input
                    id="estimatedEndTime"
                    type="datetime-local"
                    value={estimatedEndTime}
                    onChange={(e) => setEstimatedEndTime(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    メンテナンス終了予定時刻を設定すると、ユーザーに表示されます
                  </p>
                </div>
              </div>
            )}
          </div>

          <Button 
            onClick={() => handleSave('基本設定')}
            disabled={isLoading}
            className="w-full md:w-auto"
          >
            <Save className="mr-2 h-4 w-4" />
            基本設定を保存
          </Button>
        </CardContent>
      </Card>

      {/* 通知設定 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            通知設定
          </CardTitle>
          <CardDescription>
            メール通知とアラートの設定を管理します
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>メール通知</Label>
                <p className="text-sm text-muted-foreground">
                  重要な更新や変更に関するメール通知を受け取る
                </p>
              </div>
              <Switch
                checked={notificationSettings.emailNotifications}
                onCheckedChange={(checked) => handleNotificationSettingsChange('emailNotifications', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>在庫アラート</Label>
                <p className="text-sm text-muted-foreground">
                  在庫が不足した際のアラート通知
                </p>
              </div>
              <Switch
                checked={notificationSettings.stockAlerts}
                onCheckedChange={(checked) => handleNotificationSettingsChange('stockAlerts', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>注文通知</Label>
                <p className="text-sm text-muted-foreground">
                  新しい注文があった際の通知
                </p>
              </div>
              <Switch
                checked={notificationSettings.orderNotifications}
                onCheckedChange={(checked) => handleNotificationSettingsChange('orderNotifications', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>マーケティングメール</Label>
                <p className="text-sm text-muted-foreground">
                  プロモーションやニュースレターの配信
                </p>
              </div>
              <Switch
                checked={notificationSettings.marketingEmails}
                onCheckedChange={(checked) => handleNotificationSettingsChange('marketingEmails', checked)}
              />
            </div>
          </div>

          <Button 
            onClick={() => handleSave('通知設定')}
            disabled={isLoading}
            className="w-full md:w-auto"
          >
            <Save className="mr-2 h-4 w-4" />
            通知設定を保存
          </Button>
        </CardContent>
      </Card>

      {/* セキュリティ設定 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            セキュリティ設定
          </CardTitle>
          <CardDescription>
            アカウントのセキュリティとプライバシー設定を管理します
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>二段階認証</Label>
                <p className="text-sm text-muted-foreground">
                  アカウントのセキュリティを強化する
                </p>
              </div>
              <Switch
                checked={securitySettings.twoFactorAuth}
                onCheckedChange={(checked) => handleSecuritySettingsChange('twoFactorAuth', checked)}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">セッションタイムアウト</Label>
              <Select
                value={securitySettings.sessionTimeout}
                onValueChange={(value) => handleSecuritySettingsChange('sessionTimeout', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="セッションタイムアウトを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1時間</SelectItem>
                  <SelectItem value="4">4時間</SelectItem>
                  <SelectItem value="8">8時間</SelectItem>
                  <SelectItem value="24">24時間</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="passwordPolicy">パスワードポリシー</Label>
              <Select
                value={securitySettings.passwordPolicy}
                onValueChange={(value) => handleSecuritySettingsChange('passwordPolicy', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="パスワードポリシーを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">基本（8文字以上）</SelectItem>
                  <SelectItem value="medium">中程度（8文字以上、英数字）</SelectItem>
                  <SelectItem value="strong">強固（12文字以上、英数字記号）</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={() => handleSave('セキュリティ設定')}
            disabled={isLoading}
            className="w-full md:w-auto"
          >
            <Save className="mr-2 h-4 w-4" />
            セキュリティ設定を保存
          </Button>
        </CardContent>
      </Card>

      {/* システム情報 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            システム情報
          </CardTitle>
          <CardDescription>
            システムの状態とバージョン情報
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>アプリケーションバージョン</Label>
              <p className="text-sm text-muted-foreground">v1.0.0</p>
            </div>
            <div className="space-y-2">
              <Label>データベース状態</Label>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">正常</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>最終更新</Label>
              <p className="text-sm text-muted-foreground">
                {isMounted ? currentTime : '読み込み中...'}
              </p>
            </div>
            <div className="space-y-2">
              <Label>システム状態</Label>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">稼働中</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 