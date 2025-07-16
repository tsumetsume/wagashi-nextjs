import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// 在庫一覧取得
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const stocks = await prisma.stock.findMany({
      include: {
        product: {
          include: {
            category: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json(stocks)
  } catch (error) {
    return NextResponse.json({ error: '在庫の取得に失敗しました' }, { status: 500 })
  }
}

// 在庫更新
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const body = await request.json()
    const { productId, quantity } = body

    if (!productId || quantity === undefined) {
      return NextResponse.json({ error: '商品IDと在庫数は必須です' }, { status: 400 })
    }

    if (quantity < 0) {
      return NextResponse.json({ error: '在庫数は0以上である必要があります' }, { status: 400 })
    }

    const stock = await prisma.stock.upsert({
      where: { productId },
      update: { quantity },
      create: {
        productId,
        quantity
      },
      include: {
        product: {
          include: {
            category: true
          }
        }
      }
    })

    return NextResponse.json(stock)
  } catch (error) {
    return NextResponse.json({ error: '在庫の更新に失敗しました' }, { status: 500 })
  }
} 