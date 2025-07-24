import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// 商品一覧取得
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      console.error('認証エラー: セッションが見つかりません')
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    console.log('認証成功:', session.user?.email)

    const products = await prisma.product.findMany({
      include: {
        category: true,
        stocks: true
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log(`商品データ取得成功: ${products.length}件`)
    return NextResponse.json(products)
  } catch (error) {
    console.error('商品取得エラー:', error)
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
      afterImagePath,
      enlargedImagePath,
      ingredients,
      nutritionInfo,
      shelfLife,
      storageMethod
    } = body

    if (!name || !price || !categoryId || !size) {
      return NextResponse.json(
        { error: '商品名、価格、カテゴリー、サイズは必須です' },
        { status: 400 }
      )
    }

    // サイズのバリデーション
    const sizeMatch = size.match(/^(\d+)x(\d+)$/)
    if (!sizeMatch) {
      return NextResponse.json(
        { error: 'サイズは「幅x高さ」の形式で入力してください（例: 3x4）' },
        { status: 400 }
      )
    }

    const width = parseInt(sizeMatch[1])
    const height = parseInt(sizeMatch[2])

    if (width < 1 || width > 10 || height < 1 || height > 10) {
      return NextResponse.json(
        { error: 'サイズは1×1から10×10の範囲で入力してください' },
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
        afterImagePath,
        enlargedImagePath,
        ingredients,
        nutritionInfo,
        shelfLife,
        storageMethod
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

    // シミュレーション画面のキャッシュクリアを通知
    try {
      await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/sweets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    } catch (error) {
      console.error('Failed to notify cache clear:', error)
    }

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: '商品の作成に失敗しました' }, { status: 500 })
  }
} 