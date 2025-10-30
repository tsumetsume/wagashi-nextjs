import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { uploadImage, generateFileName, getStorageType } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'ファイルが選択されていません' }, { status: 400 })
    }

    // ファイルタイプの検証
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: '画像ファイルのみアップロード可能です' }, { status: 400 })
    }

    // ファイルサイズの検証（5MB以下）
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'ファイルサイズは5MB以下にしてください' }, { status: 400 })
    }

    // ファイル名の生成
    const fileName = generateFileName(file.name)

    // ストレージにアップロード（ローカル or Supabase）
    const result = await uploadImage(file, fileName)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      imageUrl: result.imageUrl,
      fileName,
      storageType: getStorageType()
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'ファイルのアップロードに失敗しました' }, { status: 500 })
  }
} 