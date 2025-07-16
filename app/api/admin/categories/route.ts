import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// カテゴリー一覧取得
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const categories = await prisma.category.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(categories)
  } catch (error) {
    return NextResponse.json({ error: 'カテゴリーの取得に失敗しました' }, { status: 500 })
  }
}

// カテゴリー作成
export async function POST(request: NextRequest) {
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

    const existingCategory = await prisma.category.findUnique({
      where: { name }
    })

    if (existingCategory) {
      return NextResponse.json({ error: 'このカテゴリー名は既に存在します' }, { status: 400 })
    }

    const category = await prisma.category.create({
      data: {
        name,
        description
      }
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'カテゴリーの作成に失敗しました' }, { status: 500 })
  }
} 