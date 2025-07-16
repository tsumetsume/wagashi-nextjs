import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// カテゴリー更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description } = body

    if (!name) {
      return NextResponse.json({ error: 'カテゴリー名は必須です' }, { status: 400 })
    }

    // 同じ名前のカテゴリーが他に存在するかチェック
    const existingCategory = await prisma.category.findFirst({
      where: {
        name,
        id: { not: params.id }
      }
    })

    if (existingCategory) {
      return NextResponse.json({ error: 'このカテゴリー名は既に存在します' }, { status: 400 })
    }

    const category = await prisma.category.update({
      where: { id: params.id },
      data: {
        name,
        description
      }
    })

    return NextResponse.json(category)
  } catch (error) {
    return NextResponse.json({ error: 'カテゴリーの更新に失敗しました' }, { status: 500 })
  }
}

// カテゴリー削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    // カテゴリーに関連する商品があるかチェック
    const productsCount = await prisma.product.count({
      where: { categoryId: params.id }
    })

    if (productsCount > 0) {
      return NextResponse.json(
        { error: 'このカテゴリーには商品が含まれているため削除できません' },
        { status: 400 }
      )
    }

    await prisma.category.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'カテゴリーを削除しました' })
  } catch (error) {
    return NextResponse.json({ error: 'カテゴリーの削除に失敗しました' }, { status: 500 })
  }
} 