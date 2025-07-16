// 箱のサイズタイプ
export type BoxSize = "10x10" | "15x15" | "20x20"

// 和菓子のカテゴリタイプ
export type SweetCategory =
  | "焼き菓子"
  | "餅菓子"
  | "水菓子"
  | "干菓子"
  | "蒸し菓子"
  | "季節限定"
  | "伝統菓子"
  | "仕切り"

// 和菓子アイテムの型
export interface SweetItem {
  id: string
  name: string
  category: SweetCategory
  width: number
  height: number
  price: number
  imageUrl: string
  placedImageUrl: string
  allergies?: string[] // Add allergies field
  calories?: number // Add calories field
  description?: string // Add description field
  inStock: boolean // 在庫状態を追加
}

// 仕切りアイテムの型
export interface DividerItem {
  id: string
  name: string
  category: "divider"
  orientation: "horizontal" | "vertical"
  length: number
  imageUrl: string
}

// 配置済みアイテムの型
export interface PlacedItem {
  id: string
  itemId: string
  type: "sweet" | "divider"
  x: number
  y: number
  width: number
  height: number
  rotation: 0 | 90 | 180 | 270
  isLocked: boolean
  imageUrl: string
  name: string
  price?: number
  orientation?: "horizontal" | "vertical"
  isDeleting?: boolean
  // 仕切り用の追加プロパティ
  isGridLine?: boolean // グリッドライン上に配置されるかどうか
  linePosition?: number // グリッドライン上の位置
}

// ドラッグアイテムの型
export interface DragItem {
  type: string
  id: string
  item: SweetItem | DividerItem
  width: number
  height: number
}

// 配置済みアイテムのドラッグ型
export interface PlacedDragItem {
  type: "placedItem"
  id: string
}
