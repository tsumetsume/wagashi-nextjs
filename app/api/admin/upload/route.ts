import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

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

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // ファイル名の生成
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const fileName = `${timestamp}.${extension}`

    // アップロードディレクトリの作成
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // ファイルの保存
    const filePath = join(uploadDir, fileName)
    await writeFile(filePath, buffer)

    const imageUrl = `/uploads/${fileName}`

    return NextResponse.json({ 
      success: true, 
      imageUrl,
      fileName 
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'ファイルのアップロードに失敗しました' }, { status: 500 })
  }
} 