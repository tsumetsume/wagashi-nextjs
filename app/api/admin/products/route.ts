import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// 商品一覧取得
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const products = await prisma.product.findMany({
      include: {
        category: true,
        stock: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json({ error: '商品の取得に失敗しました' }, { status: 500 })
  }
}

// 商品作成
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      price,
      categoryId,
      description,
      allergyInfo,
      calories,
      size,
      beforeImagePath,
      afterImagePath
    } = body

    if (!name || !price || !categoryId || !size) {
      return NextResponse.json(
        { error: '商品名、価格、カテゴリー、サイズは必須です' },
        { status: 400 }
      )
    }

    // カテゴリーの存在確認
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    })

    if (!category) {
      return NextResponse.json({ error: '指定されたカテゴリーが存在しません' }, { status: 400 })
    }

    const product = await prisma.product.create({
      data: {
        name,
        price: parseInt(price),
        categoryId,
        description,
        allergyInfo,
        calories: calories ? parseInt(calories) : null,
        size,
        beforeImagePath,
        afterImagePath
      },
      include: {
        category: true
      }
    })

    // 在庫レコードも作成
    await prisma.stock.create({
      data: {
        productId: product.id,
        quantity: 0
      }
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: '商品の作成に失敗しました' }, { status: 500 })
  }
} 