import { NextRequest, NextResponse } from 'next/server'

// メンテナンスモードの状態を管理する簡易的なストレージ
// 実際のアプリケーションではデータベースを使用してください
let maintenanceSettings = {
  maintenanceMode: false,
  maintenanceMessage: 'システムメンテナンス中です。しばらくお待ちください。',
  estimatedEndTime: null as string | null
}

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: maintenanceSettings
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch maintenance settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // メンテナンスモード設定を更新
    if (typeof body.maintenanceMode === 'boolean') {
      maintenanceSettings.maintenanceMode = body.maintenanceMode
    }
    
    if (body.maintenanceMessage) {
      maintenanceSettings.maintenanceMessage = body.maintenanceMessage
    }
    
    if (body.estimatedEndTime !== undefined) {
      maintenanceSettings.estimatedEndTime = body.estimatedEndTime
    }

    return NextResponse.json({
      success: true,
      data: maintenanceSettings
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update maintenance settings' },
      { status: 500 }
    )
  }
}