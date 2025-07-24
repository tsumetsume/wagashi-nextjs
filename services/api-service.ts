import type { SweetItem, DividerItem } from "@/types/types"

// APIのベースURL
const API_BASE_URL = "/api"

// 和菓子データを取得する関数
export async function fetchSweets(storeId?: string): Promise<SweetItem[]> {
  try {
    const url = storeId 
      ? `${API_BASE_URL}/sweets?storeId=${encodeURIComponent(storeId)}`
      : `${API_BASE_URL}/sweets`
    
    const response = await fetch(url)
    if (!response.ok) {
      console.error(`API returned status: ${response.status}.`)
      throw new Error(`API returned status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error("Failed to fetch sweets:", error)
    throw error
  }
}

// 仕切りデータを取得する関数
export async function fetchDividers(): Promise<DividerItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/dividers`)
    if (!response.ok) {
      console.error(`API returned status: ${response.status}.`)
      throw new Error(`API returned status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error("Failed to fetch dividers:", error)
    throw error
  }
}
