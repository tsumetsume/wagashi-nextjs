import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

// 商品更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
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

    const product = await prisma.product.update({
      where: { id: params.id },
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

    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json({ error: '商品の更新に失敗しました' }, { status: 500 })
  }
}

// 商品削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    // 在庫レコードも削除（CASCADE設定により自動削除される）
    await prisma.product.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: '商品を削除しました' })
  } catch (error) {
    return NextResponse.json({ error: '商品の削除に失敗しました' }, { status: 500 })
  }
} 