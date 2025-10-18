import { supabaseAdmin } from './supabase'
import type { Tables, TablesInsert, TablesUpdate } from './database.types'

// 型エイリアス
export type AdminUser = Tables<'admin_users'>
export type Category = Tables<'categories'>
export type Product = Tables<'products'>
export type Store = Tables<'stores'>
export type Stock = Tables<'stocks'>
export type BoxType = Tables<'box_types'>
export type SavedLayout = Tables<'saved_layouts'>

export type AdminUserInsert = TablesInsert<'admin_users'>
export type CategoryInsert = TablesInsert<'categories'>
export type ProductInsert = TablesInsert<'products'>
export type StoreInsert = TablesInsert<'stores'>
export type StockInsert = TablesInsert<'stocks'>
export type BoxTypeInsert = TablesInsert<'box_types'>
export type SavedLayoutInsert = TablesInsert<'saved_layouts'>

export type AdminUserUpdate = TablesUpdate<'admin_users'>
export type CategoryUpdate = TablesUpdate<'categories'>
export type ProductUpdate = TablesUpdate<'products'>
export type StoreUpdate = TablesUpdate<'stores'>
export type StockUpdate = TablesUpdate<'stocks'>
export type BoxTypeUpdate = TablesUpdate<'box_types'>
export type SavedLayoutUpdate = TablesUpdate<'saved_layouts'>

// ヘルパー関数の例
export class SupabaseService {
  // 商品関連
  static async getProducts(): Promise<Product[]> {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('is_active', true)
    
    if (error) throw error
    return data
  }

  static async createProduct(product: ProductInsert): Promise<Product> {
    const { data, error } = await supabaseAdmin
      .from('products')
      .insert(product)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async updateProduct(id: string, updates: ProductUpdate): Promise<Product> {
    const { data, error } = await supabaseAdmin
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // カテゴリー関連
  static async getCategories(): Promise<Category[]> {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .order('name')
    
    if (error) throw error
    return data
  }

  static async createCategory(category: CategoryInsert): Promise<Category> {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert(category)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // 在庫関連
  static async getStockByStore(storeId: string): Promise<(Stock & { product: Product })[]> {
    const { data, error } = await supabaseAdmin
      .from('stocks')
      .select(`
        *,
        product:products(*)
      `)
      .eq('store_id', storeId)
    
    if (error) throw error
    return data as (Stock & { product: Product })[]
  }

  // 管理者ユーザー関連
  static async getAdminUserByEmail(email: string): Promise<AdminUser | null> {
    const { data, error } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  }
}