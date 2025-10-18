import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseAdmin } from '@/lib/supabase'

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

    // URLからファイルパスを抽出
    const url = new URL(imageUrl)
    const pathParts = url.pathname.split('/')
    const fileName = pathParts[pathParts.length - 1]
    const filePath = `products/${fileName}`

    // Supabaseストレージから削除
    const { error } = await supabaseAdmin.storage
      .from('images')
      .remove([filePath])

    if (error) {
      console.error('Supabase delete error:', error)
      return NextResponse.json({ error: 'ファイルの削除に失敗しました' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'ファイルの削除に失敗しました' }, { status: 500 })
  }
}