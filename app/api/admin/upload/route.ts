import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseAdmin } from '@/lib/supabase'

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

    // Supabaseストレージにアップロード
    const { data, error } = await supabaseAdmin.storage
      .from('images') // バケット名
      .upload(`products/${fileName}`, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (error) {
      console.error('Supabase upload error:', error)
      return NextResponse.json({ error: 'ファイルのアップロードに失敗しました' }, { status: 500 })
    }

    // 公開URLの取得
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('images')
      .getPublicUrl(`products/${fileName}`)

    const imageUrl = publicUrl

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