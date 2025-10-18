import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// クライアント側用（匿名キー）
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// サーバー側用（サービスロールキー）
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

// 型エクスポート
export type { Database } from './database.types'
export type { Tables, TablesInsert, TablesUpdate } from './database.types'