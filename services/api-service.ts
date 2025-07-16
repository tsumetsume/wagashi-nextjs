import type { SweetItem, DividerItem } from "@/types/types"
import { sweets as fallbackSweets, dividers as fallbackDividers } from "@/data/items"

// APIのベースURL
const API_BASE_URL = "/api"

// 和菓子データを取得する関数
export async function fetchSweets(): Promise<SweetItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/sweets`)
    if (!response.ok) {
      console.warn(`API returned status: ${response.status}. Using fallback data.`)
      return fallbackSweets
    }
    return await response.json()
  } catch (error) {
    console.warn("Failed to fetch sweets, using fallback data:", error)
    // エラー時はデータファイルから直接読み込む
    return fallbackSweets
  }
}

// 仕切りデータを取得する関数
export async function fetchDividers(): Promise<DividerItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/dividers`)
    if (!response.ok) {
      console.warn(`API returned status: ${response.status}. Using fallback data.`)
      return fallbackDividers
    }
    return await response.json()
  } catch (error) {
    console.warn("Failed to fetch dividers, using fallback data:", error)
    // エラー時はデータファイルから直接読み込む
    return fallbackDividers
  }
}
