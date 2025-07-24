import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const adminCount = await prisma.adminUser.count()
    const users = await prisma.adminUser.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })
    
    return NextResponse.json({
      status: 'success',
      adminCount,
      users
    })
  } catch (error) {
    console.error('管理者確認エラー:', error)
    return NextResponse.json({
      status: 'error',
      message: '管理者情報の取得に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}