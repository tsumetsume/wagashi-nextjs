import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // データベース接続テスト
    await prisma.$connect()
    
    // 簡単なクエリでテスト
    const categoryCount = await prisma.category.count()
    const productCount = await prisma.product.count()
    
    return NextResponse.json({
      status: 'success',
      message: 'データベース接続成功',
      data: {
        categories: categoryCount,
        products: productCount
      }
    })
  } catch (error) {
    console.error('データベース接続エラー:', error)
    return NextResponse.json({
      status: 'error',
      message: 'データベース接続に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}