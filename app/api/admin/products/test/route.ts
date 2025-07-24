import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 認証なしで商品データを取得するテストエンドポイント
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        stocks: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      status: 'success',
      count: products.length,
      products
    })
  } catch (error) {
    console.error('商品取得エラー:', error)
    return NextResponse.json({
      status: 'error',
      message: '商品の取得に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}