import { supabaseAdmin } from '@/lib/supabase'
import { writeFile, unlink, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

// ストレージ設定
const USE_LOCAL_STORAGE = process.env.USE_LOCAL_DB === 'true'
const LOCAL_UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'products')
const LOCAL_BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'

// ローカルストレージの初期化
async function ensureLocalStorageDir() {
    if (!existsSync(LOCAL_UPLOAD_DIR)) {
        await mkdir(LOCAL_UPLOAD_DIR, { recursive: true })
    }
}

// ファイルアップロード
export async function uploadImage(
    file: File,
    fileName: string
): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
    try {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        if (USE_LOCAL_STORAGE) {
            // ローカルファイルシステムに保存
            await ensureLocalStorageDir()
            const filePath = path.join(LOCAL_UPLOAD_DIR, fileName)
            await writeFile(filePath, buffer)

            const imageUrl = `${LOCAL_BASE_URL}/uploads/products/${fileName}`
            return { success: true, imageUrl }
        } else {
            // Supabaseストレージに保存
            if (!supabaseAdmin) {
                return { success: false, error: 'Supabaseクライアントが初期化されていません' }
            }

            const { data, error } = await supabaseAdmin.storage
                .from('images')
                .upload(`products/${fileName}`, buffer, {
                    contentType: file.type,
                    upsert: false
                })

            if (error) {
                console.error('Supabase upload error:', error)
                return { success: false, error: 'ファイルのアップロードに失敗しました' }
            }

            // 公開URLの取得
            const { data: { publicUrl } } = supabaseAdmin.storage
                .from('images')
                .getPublicUrl(`products/${fileName}`)

            return { success: true, imageUrl: publicUrl }
        }
    } catch (error) {
        console.error('Upload error:', error)
        return { success: false, error: 'ファイルのアップロードに失敗しました' }
    }
}

// ファイル削除
export async function deleteImage(
    imageUrl: string
): Promise<{ success: boolean; error?: string }> {
    try {
        if (USE_LOCAL_STORAGE) {
            // ローカルファイルシステムから削除
            const url = new URL(imageUrl)
            const fileName = path.basename(url.pathname)
            const filePath = path.join(LOCAL_UPLOAD_DIR, fileName)

            if (existsSync(filePath)) {
                await unlink(filePath)
            }

            return { success: true }
        } else {
            // Supabaseストレージから削除
            if (!supabaseAdmin) {
                return { success: false, error: 'Supabaseクライアントが初期化されていません' }
            }

            const url = new URL(imageUrl)
            const pathParts = url.pathname.split('/')
            const fileName = pathParts[pathParts.length - 1]
            const filePath = `products/${fileName}`

            const { error } = await supabaseAdmin.storage
                .from('images')
                .remove([filePath])

            if (error) {
                console.error('Supabase delete error:', error)
                return { success: false, error: 'ファイルの削除に失敗しました' }
            }

            return { success: true }
        }
    } catch (error) {
        console.error('Delete error:', error)
        return { success: false, error: 'ファイルの削除に失敗しました' }
    }
}

// ファイル名生成
export function generateFileName(originalName: string): string {
    const timestamp = Date.now()
    const extension = originalName.split('.').pop()
    return `${timestamp}.${extension}`
}

// ストレージタイプの取得
export function getStorageType(): 'local' | 'supabase' {
    return USE_LOCAL_STORAGE ? 'local' : 'supabase'
}

// ローカルストレージのベースURL取得
export function getLocalBaseUrl(): string {
    return LOCAL_BASE_URL
}