import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const USE_LOCAL_DB = process.env.USE_LOCAL_DB === 'true'

// Supabase設定（ローカルDB使用時は空文字列でも動作するようにする）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key'

// ローカルDB使用時の警告表示
if (USE_LOCAL_DB && process.env.NODE_ENV === 'development') {
  console.log('🔧 ローカルPostgreSQLを使用中 - Supabaseクライアントは無効化されています')
}

// クライアント側用（匿名キー）
export const supabase = USE_LOCAL_DB 
  ? null 
  : createClient<Database>(supabaseUrl, supabaseAnonKey)

// サーバー側用（サービスロールキー）
export const supabaseAdmin = USE_LOCAL_DB 
  ? null 
  : createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

// Supabaseが利用可能かチェック
export const isSupabaseEnabled = !USE_LOCAL_DB && 
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 型エクスポート
export type { Database } from './database.types'
export type { Tables, TablesInsert, TablesUpdate } from './database.types'