import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { deleteImage, getStorageType } from '@/lib/storage'

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('imageUrl')

    if (!imageUrl) {
      return NextResponse.json({ error: '画像URLが指定されていません' }, { status: 400 })
    }

    // ストレージから削除（ローカル or Supabase）
    const result = await deleteImage(imageUrl)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      storageType: getStorageType()
    })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'ファイルの削除に失敗しました' }, { status: 500 })
  }
}