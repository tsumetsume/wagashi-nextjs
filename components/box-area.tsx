"use client"

import type React from "react"

// 既存のインポート
import { useState, useRef, useEffect, useCallback } from "react"
import { useDrop } from "react-dnd"
import type { BoxSize, PlacedItem, DragItem, SweetItem } from "@/types/types"
import PlacedItemComponent from "./placed-item"
import ContextMenu from "./context-menu"
import DividerResizeModal from "./divider-resize-modal"
import ImageViewerModal from "./image-viewer-modal"
import { generateId } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { InfoDisplaySettings } from "@/components/info-settings-modal"
import PrintModal from "./print-modal"
import ErrorModalComponent from "./error-modal"
import { fetchSweets } from "@/services/api-service"

// BoxAreaProps インターフェースに printRef を追加
interface BoxAreaProps {
  boxSize: BoxSize
  placedItems: PlacedItem[]
  setPlacedItems: React.Dispatch<React.SetStateAction<PlacedItem[]>>
  infoSettings: InfoDisplaySettings
  contextMenuRef?: React.RefObject<HTMLDivElement>
  productInfoRef?: React.RefObject<HTMLDivElement>
  autoDividerRef?: React.RefObject<HTMLDivElement>
  printRef?: React.RefObject<HTMLDivElement>
  selectedStoreId: string
}

// BoxArea 関数の引数に printRef を追加
export default function BoxArea({
  boxSize,
  placedItems,
  setPlacedItems,
  infoSettings,
  contextMenuRef,
  productInfoRef,
  autoDividerRef,
  printRef,
  selectedStoreId,
}: BoxAreaProps) {
  // 既存のステート定義は省略...
  const [gridSize, setGridSize] = useState({ width: 10, height: 10 })
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean
    x: number
    y: number
    item: PlacedItem | null
  }>({
    visible: false,
    x: 0,
    y: 0,
    item: null,
  })

  // sweetsデータを状態として管理
  const [sweets, setSweets] = useState<SweetItem[]>([])

  // 印刷モーダル用の状態を追加
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)

  // 仕切り長さ調整用の状態
  const [resizingDivider, setResizingDivider] = useState<PlacedItem | null>(null)

  // セルサイズを定義
  const cellSize = 40

  // 新しく追加されたアイテムのIDを追跡
  const [newItemIds, setNewItemIds] = useState<Set<string>>(new Set())

  // ドラッグ中のアイテムのプレビュー位置を追跡
  const [previewPosition, setPreviewPosition] = useState<{
    x: number
    y: number
    width: number
    height: number
    isValid: boolean
    visible: boolean
    isGridLine?: boolean
    orientation?: "horizontal" | "vertical"
    isSnapped?: boolean // スナップされているかどうかのフラグを追加
  }>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    isValid: false,
    visible: false,
  })

  // BoxAreaコンポーネントの状態に商品情報モーダル用の状態を追加
  const [infoModalItem, setInfoModalItem] = useState<PlacedItem | null>(null)

  // 画像拡大表示用の状態を追加
  const [imageViewerItem, setImageViewerItem] = useState<PlacedItem | null>(null)

  // エラーモーダル用の状態
  const [errorModal, setErrorModal] = useState<{
    visible: boolean
    title: string
    message: string
  }>({
    visible: false,
    title: "",
    message: "",
  })

  // スナップ機能の閾値（セル単位）
  const snapThreshold = 0.3

  const boxRef = useRef<HTMLDivElement>(null)

  // sweetsデータを取得
  useEffect(() => {
    const loadSweets = async () => {
      try {
        const sweetsData = await fetchSweets(selectedStoreId)
        setSweets(sweetsData)
      } catch (error) {
        console.error("Failed to load sweets:", error)
        // エラー時は空の配列を設定
        setSweets([])
      }
    }
    loadSweets()
  }, [selectedStoreId])

  useEffect(() => {
    // 箱サイズの設定
    const [width, height] = boxSize.split("x").map(Number)
    setGridSize({ width, height })
  }, [boxSize])

  // 削除された商品をチェックする関数
  const checkDeletedItems = useCallback(async () => {
    try {
      const sweetsData = await fetchSweets(selectedStoreId)
      setSweets(sweetsData)
      
      // 削除された商品が配置されているかチェック
      const deletedItems = placedItems.filter(placedItem => {
        if (placedItem.type === 'sweet') {
          return !sweetsData.find(sweet => sweet.id === placedItem.itemId)
        }
        return false
      })
      
      if (deletedItems.length > 0) {
        // 削除された商品を配置済みアイテムから削除
        setPlacedItems(prev => prev.filter(item => 
          !deletedItems.some(deleted => deleted.id === item.id)
        ))
        
        // エラーモーダルで削除された商品を通知
        setErrorModal({
          visible: true,
          title: "商品が削除されました",
          message: `${deletedItems.length}個の商品が管理画面で削除されたため、配置から削除されました。`
        })
      }
    } catch (error) {
      console.error("Failed to load sweets:", error)
      // エラー時は空の配列を設定
      setSweets([])
    }
  }, [placedItems, setPlacedItems, selectedStoreId])



  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: ["sweet", "divider", "placedItem"],
      hover: (
        item:
          | DragItem
          | {
              id: string
              type: "placedItem"
              isGridLine?: boolean
              orientation?: string
              offsetX?: number
              offsetY?: number
            },
        monitor,
      ) => {
        const boxRect = boxRef.current?.getBoundingClientRect()
        if (!boxRect) return

        const clientOffset = monitor.getClientOffset()
        if (!clientOffset) return

        // オフセットを取得（ドラッグ要素内でのクリック位置）
        const offsetX = "offsetX" in item ? item.offsetX || 0 : 0
        const offsetY = "offsetY" in item ? item.offsetY || 0 : 0

        // ホバー位置の計算（オフセットを考慮）
        let x = Math.floor((clientOffset.x - boxRect.left - offsetX) / cellSize)
        let y = Math.floor((clientOffset.y - boxRect.top - offsetY) / cellSize)

        // グリッド範囲内に収める
        x = Math.max(0, x)
        y = Math.max(0, y)

        // グリッドライン上の仕切りの場合
        if (
          ("isGridLine" in item && item.isGridLine) ||
          ("type" in item && item.type === "divider" && "isGridLine" in item && item.isGridLine)
        ) {
          // グリッドライン上の位置を計算
          const orientation =
            "item" in item && item.item && "orientation" in item.item
              ? item.item.orientation
              : "orientation" in item
                ? (item.orientation as "horizontal" | "vertical")
                : "horizontal"

          if (orientation === "horizontal") {
            // 水平仕切りの場合、行間に配置
            y = Math.round((clientOffset.y - boxRect.top - offsetY) / cellSize)

            // スナップ位置を計算
            const snapPosition = findHorizontalSnapPosition(
              x,
              y,
              item.width || 1,
              "type" in item && item.type === "placedItem" ? item.id : undefined,
            )

            // スナップ位置が見つかった場合
            if (snapPosition) {
              y = snapPosition.y

              // 配置可能かチェック
              const isValidPlacement = checkValidGridLinePlacement(
                x,
                y,
                item.width || 1,
                "horizontal",
                "type" in item && item.type === "placedItem" ? item.id : undefined,
              )

              const isValidIntersection = checkDividerSweetIntersection(
                x,
                y,
                "horizontal",
                item.width || 1,
                "type" in item && item.type === "placedItem" ? item.id : undefined,
              )

              setPreviewPosition({
                x,
                y,
                width: item.width || 1,
                height: 0, // 高さは実質0（線）
                isValid: isValidPlacement && isValidIntersection,
                visible: true,
                isGridLine: true,
                orientation: "horizontal",
                isSnapped: true,
              })
              return
            }

            // 通常の配置可能性チェック
            const isValidPlacement = checkValidGridLinePlacement(
              x,
              y,
              item.width || 1,
              "horizontal",
              "type" in item && item.type === "placedItem" ? item.id : undefined,
            )

            const isValidIntersection = checkDividerSweetIntersection(
              x,
              y,
              "horizontal",
              item.width || 1,
              "type" in item && item.type === "placedItem" ? item.id : undefined,
            )

            setPreviewPosition({
              x,
              y,
              width: item.width || 1,
              height: 0, // 高さは実質0（線）
              isValid: isValidPlacement && isValidIntersection,
              visible: true,
              isGridLine: true,
              orientation: "horizontal",
              isSnapped: false,
            })
          } else {
            // 垂直仕切りの場合、列間に配置
            x = Math.round((clientOffset.x - boxRect.left - offsetX) / cellSize)

            // スナップ位置を計算
            const snapPosition = findVerticalSnapPosition(
              x,
              y,
              item.height || 1,
              "type" in item && item.type === "placedItem" ? item.id : undefined,
            )

            // スナップ位置が見つかった場合
            if (snapPosition) {
              x = snapPosition.x

              // 配置可能かチェック
              const isValidPlacement = checkValidGridLinePlacement(
                x,
                y,
                item.height || 1,
                "vertical",
                "type" in item && item.type === "placedItem" ? item.id : undefined,
              )

              const isValidIntersection = checkDividerSweetIntersection(
                x,
                y,
                "vertical",
                item.height || 1,
                "type" in item && item.type === "placedItem" ? item.id : undefined,
              )

              setPreviewPosition({
                x,
                y,
                width: 0, // 幅は実質0（線）
                height: item.height || 1,
                isValid: isValidPlacement && isValidIntersection,
                visible: true,
                isGridLine: true,
                orientation: "vertical",
                isSnapped: true,
              })
              return
            }

            // 通常の配置可能性チェック
            const isValidPlacement = checkValidGridLinePlacement(
              x,
              y,
              item.height || 1,
              "vertical",
              "type" in item && item.type === "placedItem" ? item.id : undefined,
            )

            const isValidIntersection = checkDividerSweetIntersection(
              x,
              y,
              "vertical",
              item.height || 1,
              "type" in item && item.type === "placedItem" ? item.id : undefined,
            )

            setPreviewPosition({
              x,
              y,
              width: 0, // 幅は実質0（線）
              height: item.height || 1,
              isValid: isValidPlacement && isValidIntersection,
              visible: true,
              isGridLine: true,
              orientation: "vertical",
              isSnapped: false,
            })
          }
          return
        }

        // 通常のアイテム（和菓子または従来の仕切り）の場合
        // placedItemの場合
        if ("type" in item && item.type === "placedItem") {
          const draggedItem = placedItems.find((i) => i.id === item.id)
          if (!draggedItem) return

          // 配置可能かチェック
          const isValid = checkValidPlacement(x, y, draggedItem.width, draggedItem.height, item.id)

          setPreviewPosition({
            x,
            y,
            width: draggedItem.width,
            height: draggedItem.height,
            isValid,
            visible: true,
          })
          return
        }

        // 新規アイテムの場合
        if ("width" in item && "height" in item) {
          // 配置可能かチェック
          const isValid = checkValidPlacement(x, y, item.width, item.height)

          setPreviewPosition({
            x,
            y,
            width: item.width,
            height: item.height,
            isValid,
            visible: true,
          })
        }
      },
      drop: (
        item:
          | DragItem
          | {
              id: string
              type: "placedItem"
              isGridLine?: boolean
              orientation?: string
              offsetX?: number
              offsetY?: number
            },
        monitor,
      ) => {
        const boxRect = boxRef.current?.getBoundingClientRect()
        if (!boxRect) return

        const clientOffset = monitor.getClientOffset()
        if (!clientOffset) return

        // オフセットを取得（ドラッグ要素内でのクリック位置）
        const offsetX = "offsetX" in item ? item.offsetX || 0 : 0
        const offsetY = "offsetY" in item ? item.offsetY || 0 : 0

        // ドロップ位置の計算（オフセットを考慮）
        let x = Math.floor((clientOffset.x - boxRect.left - offsetX) / cellSize)
        let y = Math.floor((clientOffset.y - boxRect.top - offsetY) / cellSize)

        // グリッド範囲内に収める
        x = Math.max(0, x)
        y = Math.max(0, y)

        // グリッドライン上の仕切りの場合
        if (
          ("isGridLine" in item && item.isGridLine) ||
          ("type" in item && item.type === "divider" && "isGridLine" in item && item.isGridLine)
        ) {
          const orientation =
            "item" in item && item.item && "orientation" in item.item
              ? item.item.orientation
              : "orientation" in item
                ? (item.orientation as "horizontal" | "vertical")
                : "horizontal"

          // プレビュー位置がスナップされている場合、その位置を使用
          if (previewPosition.isSnapped) {
            x = previewPosition.x
            y = previewPosition.y
          } else {
            if (orientation === "horizontal") {
              // 水平仕切りの場合、行間に配置
              y = Math.round((clientOffset.y - boxRect.top - offsetY) / cellSize)

              // スナップ位置を確認
              const snapPosition = findHorizontalSnapPosition(
                x,
                y,
                item.width || 1,
                "type" in item && item.type === "placedItem" ? item.id : undefined,
              )
              if (snapPosition) {
                y = snapPosition.y
              }
            } else {
              // 垂直仕切りの場合、列間に配置
              x = Math.round((clientOffset.x - boxRect.left - offsetX) / cellSize)

              // スナップ位置を確認
              const snapPosition = findVerticalSnapPosition(
                x,
                y,
                item.height || 1,
                "type" in item && item.type === "placedItem" ? item.id : undefined,
              )
              if (snapPosition) {
                x = snapPosition.x
              }
            }
          }

          // 配置可能かチェック
          if (orientation === "horizontal") {
            if (
              !checkValidGridLinePlacement(
                x,
                y,
                item.width || 1,
                "horizontal",
                "type" in item && item.type === "placedItem" ? item.id : undefined,
              ) ||
              !checkDividerSweetIntersection(
                x,
                y,
                "horizontal",
                item.width || 1,
                "type" in item && item.type === "placedItem" ? item.id : undefined,
              )
            ) {
              setPreviewPosition((prev) => ({ ...prev, visible: false }))
              return
            }
          } else {
            if (
              !checkValidGridLinePlacement(
                x,
                y,
                item.height || 1,
                "vertical",
                "type" in item && item.type === "placedItem" ? item.id : undefined,
              ) ||
              !checkDividerSweetIntersection(
                x,
                y,
                "vertical",
                item.height || 1,
                "type" in item && item.type === "placedItem" ? item.id : undefined,
              )
            ) {
              setPreviewPosition((prev) => ({ ...prev, visible: false }))
              return
            }
          }

          // placedItem の場合は移動処理
          if ("type" in item && item.type === "placedItem") {
            setPlacedItems((prev) =>
              prev.map((placedItem) => (placedItem.id === item.id ? { ...placedItem, x, y } : placedItem)),
            )
            setPreviewPosition((prev) => ({ ...prev, visible: false }))
            return
          }

          // 新しい仕切りを追加
          const newItemId = generateId()
          const newItem: PlacedItem = {
            id: newItemId,
            itemId: "item" in item ? item.id : "",
            type: "divider",
            x,
            y,
            width: orientation === "horizontal" ? item.width || 1 : 0,
            height: orientation === "vertical" ? item.height || 1 : 0,
            rotation: 0,
            isLocked: false,
            imageUrl: "item" in item && item.item ? item.item.imageUrl : "",
            name: "item" in item && item.item ? item.item.name : "仕切り",
            orientation,
            isGridLine: true,
          }

          // 新しいアイテムのIDを追跡
          setNewItemIds((prev) => new Set(prev).add(newItemId))
          setTimeout(() => {
            setNewItemIds((prev) => {
              const updated = new Set(prev)
              updated.delete(newItemId)
              return updated
            })
          }, 500)

          setPlacedItems((prev) => [...prev, newItem])
          setPreviewPosition((prev) => ({ ...prev, visible: false }))
          return
        }

        // 通常のアイテム（和菓子）の場合
        // placedItem の場合は移動処理
        if ("type" in item && item.type === "placedItem") {
          const draggedItem = placedItems.find((i) => i.id === item.id)
          if (!draggedItem) return

          // 配置可能かチェック（回転も考慮）
          if (!checkValidPlacement(x, y, draggedItem.width, draggedItem.height, item.id)) {
            return
          }

          setPlacedItems((prev) =>
            prev.map((placedItem) => (placedItem.id === item.id ? { ...placedItem, x, y } : placedItem)),
          )
          setPreviewPosition((prev) => ({ ...prev, visible: false }))
          return
        }

        // 以下は既存のコード（新規アイテムの配置処理）
        // 配置可能かチェック
        if (!("width" in item) || !("height" in item) || !checkValidPlacement(x, y, item.width, item.height)) {
          setPreviewPosition((prev) => ({ ...prev, visible: false }))
          return
        }

        // 新しいアイテムのIDを生成
        const newItemId = generateId()

        // 新しいアイテムを追加
        const newItem: PlacedItem = {
          id: newItemId,
          itemId: item.id,
          type: item.type as "sweet" | "divider",
          x,
          y,
          width: item.width,
          height: item.height,
          rotation: 0,
          isLocked: false,
          imageUrl: item.item?.placedImageUrl || item.item?.imageUrl || "",
          name: item.item?.name || "",
          price: "item" in item && item.item && "price" in item.item ? item.item.price : undefined,
          orientation: "item" in item && item.item && "orientation" in item.item ? item.item.orientation : undefined,
        }

        // 新しいアイテムのIDを追跡
        setNewItemIds((prev) => new Set(prev).add(newItemId))

        // 一定時間後に新しいアイテムのフラグをクリア
        setTimeout(() => {
          setNewItemIds((prev) => {
            const updated = new Set(prev)
            updated.delete(newItemId)
            return updated
          })
        }, 500)

        setPlacedItems((prev) => [...prev, newItem])
        setPreviewPosition((prev) => ({ ...prev, visible: false }))
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
        canDrop: !!monitor.canDrop(),
      }),
    }),
    [gridSize, newItemIds, previewPosition.isSnapped],
  )

  // ドラッグが終了したらプレビューを非表示にする
  useEffect(() => {
    if (!isOver) {
      setPreviewPosition((prev) => ({ ...prev, visible: false }))
    }
  }, [isOver])

  // 水平仕切りのスナップ位置を見つける関数
  const findHorizontalSnapPosition = (x: number, y: number, length: number, excludeId?: string) => {
    // 和菓子のみをフィルタリング
    const sweets = placedItems.filter((item) => item.type === "sweet" && (excludeId ? item.id !== excludeId : true))

    // スナップ候補位置
    const snapCandidates: { y: number; distance: number }[] = []

    // 各和菓子の上端と下端をスナップ候補として追加
    sweets.forEach((sweet) => {
      const topEdge = sweet.y
      const bottomEdge = sweet.y + sweet.height

      // 仕切りの範囲と和菓子の水平範囲が重なるかチェック
      const dividerLeft = x
      const dividerRight = x + length
      const sweetLeft = sweet.x
      const sweetRight = sweet.x + sweet.width

      // 水平方向の重なりがある場合のみスナップ候補に追加
      if (!(dividerRight <= sweetLeft || dividerLeft >= sweetRight)) {
        // 上端へのスナップ
        const topDistance = Math.abs(y - topEdge)
        if (topDistance <= snapThreshold) {
          snapCandidates.push({ y: topEdge, distance: topDistance })
        }

        // 下端へのスナップ
        const bottomDistance = Math.abs(y - bottomEdge)
        if (bottomDistance <= snapThreshold) {
          snapCandidates.push({ y: bottomEdge, distance: bottomDistance })
        }
      }
    })

    // 最も近いスナップ位置を返す
    if (snapCandidates.length > 0) {
      snapCandidates.sort((a, b) => a.distance - b.distance)
      return snapCandidates[0]
    }

    return null
  }

  // 垂直仕切りのスナップ位置を見つける関数
  const findVerticalSnapPosition = (x: number, y: number, length: number, excludeId?: string) => {
    // 和菓子のみをフィルタリング
    const sweets = placedItems.filter((item) => item.type === "sweet" && (excludeId ? item.id !== excludeId : true))

    // スナップ候補位置
    const snapCandidates: { x: number; distance: number }[] = []

    // 各和菓子の左端と右端をスナップ候補として追加
    sweets.forEach((sweet) => {
      const leftEdge = sweet.x
      const rightEdge = sweet.x + sweet.width

      // 仕切りの範囲と和菓子の垂直範囲が重なるかチェック
      const dividerTop = y
      const dividerBottom = y + length
      const sweetTop = sweet.y
      const sweetBottom = sweet.y + sweet.height

      // 垂直方向の重なりがある場合のみスナップ候補に追加
      if (!(dividerBottom <= sweetTop || dividerTop >= sweetBottom)) {
        // 左端へのスナップ
        const leftDistance = Math.abs(x - leftEdge)
        if (leftDistance <= snapThreshold) {
          snapCandidates.push({ x: leftEdge, distance: leftDistance })
        }

        // 右端へのスナップ
        const rightDistance = Math.abs(x - rightEdge)
        if (rightDistance <= snapThreshold) {
          snapCandidates.push({ x: rightEdge, distance: rightDistance })
        }
      }
    })

    // 最も近いスナップ位置を返す
    if (snapCandidates.length > 0) {
      snapCandidates.sort((a, b) => a.distance - b.distance)
      return snapCandidates[0]
    }

    return null
  }

  // グリッドライン上の仕切りの配置可能性をチェックする関数
  const checkValidGridLinePlacement = (
    x: number,
    y: number,
    length: number,
    orientation: "horizontal" | "vertical",
    excludeId?: string,
  ) => {
    // グリッド外への配置をチェック
    if (orientation === "horizontal") {
      // 水平仕切りの場合
      if (x < 0 || y < 0 || y > gridSize.height || x + length > gridSize.width) {
        return false
      }
    } else {
      // 垂直仕切りの場合
      if (x < 0 || y < 0 || x > gridSize.width || y + length > gridSize.height) {
        return false
      }
    }

    // 既存の仕切りとの重複チェック
    const isOverlapping = placedItems.some((placedItem) => {
      // 自分自身との重複はチェックしない
      if (excludeId && placedItem.id === excludeId) {
        return false
      }

      if (placedItem.type !== "divider" || !placedItem.isGridLine) {
        return false
      }

      if (placedItem.orientation === orientation) {
        // 同じ向きの仕切り同士
        if (orientation === "horizontal") {
          // 水平仕切り
          if (placedItem.y === y) {
            // 同じ行にある場合、X方向の重なりをチェック
            const itemRight = placedItem.x + placedItem.width
            const newItemRight = x + length
            return !(itemRight <= x || placedItem.x >= newItemRight)
          }
        } else {
          // 垂直仕切り
          if (placedItem.x === x) {
            // 同じ列にある場合、Y方向の重なりをチェック
            const itemBottom = placedItem.y + placedItem.height
            const newItemBottom = y + length
            return !(itemBottom <= y || placedItem.y >= newItemBottom)
          }
        }
      }
      return false
    })

    return !isOverlapping
  }

  // 配置可能かどうかをチェックする関数
  const checkValidPlacement = (x: number, y: number, width: number, height: number, excludeId?: string) => {
    // グリッド外への配置をチェック
    if (x < 0 || y < 0 || x + width > gridSize.width || y + height > gridSize.height) {
      return false
    }

    // 他のアイテムとの重複チェック
    const isOverlapping = placedItems.some((placedItem) => {
      // 自分自身との重複はチェックしない
      if (excludeId && placedItem.id === excludeId) {
        return false
      }

      // グリッドライン上の仕切りはここではチェックしない
      if (placedItem.type === "divider" && placedItem.isGridLine) {
        return false
      }

      // 通常のアイテム同士の重複チェック（仕切り以外）
      if (placedItem.type !== "divider") {
        const itemRight = placedItem.x + placedItem.width
        const itemBottom = placedItem.y + placedItem.height
        const newItemRight = x + width
        const newItemBottom = y + height

        return !(itemRight <= x || placedItem.x >= newItemRight || itemBottom <= y || placedItem.y >= newItemBottom)
      }

      return false
    })

    if (isOverlapping) {
      return false
    }

    // グリッドライン上の仕切りとの交差チェック
    const gridLineDividers = placedItems.filter((item) => item.type === "divider" && item.isGridLine)

    // 和菓子の領域を表す矩形
    const sweetRect = {
      left: x,
      right: x + width,
      top: y,
      bottom: y + height,
    }

    // 仕切りとの交差をチェック
    for (const divider of gridLineDividers) {
      if (divider.orientation === "horizontal") {
        // 水平仕切りの場合
        const dividerY = divider.y
        const dividerLeft = divider.x
        const dividerRight = divider.x + divider.width

        // 和菓子が仕切りをまたいでいるかチェック
        if (sweetRect.top < dividerY && sweetRect.bottom > dividerY) {
          // 水平方向の重なりをチェック
          if (
            (sweetRect.left >= dividerLeft && sweetRect.left < dividerRight) ||
            (sweetRect.right > dividerLeft && sweetRect.right <= dividerRight) ||
            (sweetRect.left <= dividerLeft && sweetRect.right >= dividerRight)
          ) {
            return false
          }
        }
      } else {
        // 垂直仕切りの場合
        const dividerX = divider.x
        const dividerTop = divider.y
        const dividerBottom = divider.y + divider.height

        // 和菓子が仕切りをまたいでいるかチェック
        if (sweetRect.left < dividerX && sweetRect.right > dividerX) {
          // 垂直方向の重なりをチェック
          if (
            (sweetRect.top >= dividerTop && sweetRect.top < dividerBottom) ||
            (sweetRect.bottom > dividerTop && sweetRect.bottom <= dividerBottom) ||
            (sweetRect.top <= dividerTop && sweetRect.bottom >= dividerBottom)
          ) {
            return false
          }
        }
      }
    }

    return true
  }

  // 仕切りの長さ調整が可能かチェックする関数
  const checkValidDividerResize = (divider: PlacedItem, newLength: number) => {
    if (divider.orientation === "horizontal") {
      // 水平仕切りの場合
      if (divider.x + newLength > gridSize.width) {
        return false
      }

      // 他の仕切りとの重複チェック
      return checkValidGridLinePlacement(divider.x, divider.y, newLength, "horizontal", divider.id)
    } else {
      // 垂直仕切りの場合
      if (divider.y + newLength > gridSize.height) {
        return false
      }

      // 他の仕切りとの重複チェック
      return checkValidGridLinePlacement(divider.x, divider.y, newLength, "vertical", divider.id)
    }
  }

  // 仕切りとお菓子の交差をチェックする関数
  const checkDividerSweetIntersection = (
    x: number,
    y: number,
    orientation: "horizontal" | "vertical",
    length: number,
    excludeId?: string,
  ) => {
    // お菓子のみをフィルタリング
    const sweets = placedItems.filter((item) => item.type === "sweet")

    // 仕切りの領域を定義
    const dividerRect = {
      left: x,
      right: orientation === "horizontal" ? x + length : x,
      top: y,
      bottom: orientation === "vertical" ? y + length : y,
    }

    // お菓子との交差をチェック
    for (const sweet of sweets) {
      const sweetRect = {
        left: sweet.x,
        right: sweet.x + sweet.width,
        top: sweet.y,
        bottom: sweet.y + sweet.height,
      }

      if (orientation === "horizontal") {
        // 水平仕切りの場合
        // お菓子が仕切りをまたいでいるかチェック - 接触は許可する
        if (sweetRect.top < y && sweetRect.bottom > y) {
          // 水平方向の重なりをチェック
          if (
            (sweetRect.left < dividerRect.right && sweetRect.right > dividerRect.left) ||
            (sweetRect.left < dividerRect.right && sweetRect.right > dividerRect.left) ||
            (sweetRect.left < dividerRect.left && sweetRect.right > dividerRect.right)
          ) {
            return false
          }
        }

        // 接触のケースを許可する（お菓子の下端が仕切りの上端に接触、または上端が仕切りの下端に接触）
        if (
          (sweetRect.bottom === y || sweetRect.top === y + 1) &&
          !(sweetRect.right <= dividerRect.left || sweetRect.left >= dividerRect.right)
        ) {
          // 接触は許可するので、falseを返さない
          continue
        }
      } else {
        // 垂直仕切りの場合
        // お菓子が仕切りをまたいでいるかチェック - 接触は許可する
        if (sweetRect.left < x && sweetRect.right > x) {
          // 垂直方向の重なりをチェック
          if (
            (sweetRect.top < dividerRect.bottom && sweetRect.bottom > dividerRect.top) ||
            (sweetRect.top < dividerRect.bottom && sweetRect.bottom > dividerRect.top) ||
            (sweetRect.top < dividerRect.top && sweetRect.bottom > dividerRect.bottom)
          ) {
            return false
          }
        }

        // 接触のケースを許可する（お菓子の右端が仕切りの左端に接触、または左端が仕切りの右端に接触）
        if (
          (sweetRect.right === x || sweetRect.left === x + 1) &&
          !(sweetRect.bottom <= dividerRect.top || sweetRect.top >= dividerRect.bottom)
        ) {
          // 接触は許可するので、falseを返さない
          continue
        }
      }
    }

    return true
  }

  // 仕切りの長さを調整する関数
  const handleResizeDivider = (id: string, newLength: number) => {
    const divider = placedItems.find((item) => item.id === id)
    if (!divider || divider.type !== "divider") return

    // 長さ調整が可能かチェック
    if (!checkValidDividerResize(divider, newLength)) {
      alert("この長さに調整できません。他のアイテムと重なるか、グリッド外になります。")
      return
    }

    // 仕切りの長さを更新
    setPlacedItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (item.orientation === "horizontal") {
            return { ...item, width: newLength }
          } else {
            return { ...item, height: newLength }
          }
        }
        return item
      }),
    )
  }

  // 合計金額を計算する関数
  const calculateTotalPrice = () => {
    return placedItems
      .filter((item) => item.type === "sweet" && item.price)
      .reduce((total, item) => total + (item.price || 0), 0)
  }

  const handleContextMenu = (e: React.MouseEvent, item: PlacedItem) => {
    e.preventDefault()
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      item,
    })
  }

  // handleContextMenuの定義の近くに以下の関数を追加

  const handleShowItemInfo = (item: PlacedItem) => {
    setInfoModalItem(item)
    handleCloseContextMenu()
  }

  // 画像拡大表示用の関数を追加
  const handleShowImageViewer = (item: PlacedItem) => {
    setImageViewerItem(item)
  }

  const handleCloseContextMenu = () => {
    setContextMenu((prev) => ({ ...prev, visible: false }))
  }

  const handleDeleteItem = (id: string) => {
    // アニメーション付きで削除するため、まずはフラグを設定
    setPlacedItems((prev) => prev.map((item) => (item.id === id ? { ...item, isDeleting: true } : item)))

    // アニメーション完了後に実際に削除
    setTimeout(() => {
      setPlacedItems((prev) => prev.filter((item) => item.id !== id))
    }, 300)

    handleCloseContextMenu()
  }

  const handleToggleLock = (id: string) => {
    setPlacedItems((prev) => prev.map((item) => (item.id === id ? { ...item, isLocked: !item.isLocked } : item)))
    handleCloseContextMenu()
  }

  const handleRotateItem = (id: string) => {
    setPlacedItems((prev) =>
      prev.map((item) => {
        if (item.id === id && item.type === "sweet") {
          // 回転角度を更新（90度ずつ回転）
          const newRotation = ((item.rotation + 90) % 360) as 0 | 90 | 180 | 270

          // 回転が90度または270度の場合は幅と高さを入れ替え
          const shouldSwap = newRotation === 90 || newRotation === 270
          const newWidth = shouldSwap ? item.height : item.width
          const newHeight = shouldSwap ? item.width : item.height

          // グリッド範囲外にはみ出さないか確認
          if (item.x + newWidth > gridSize.width || item.y + newHeight > gridSize.height) {
            // エラーモーダルを表示
            setErrorModal({
              visible: true,
              title: "回転エラー",
              message: "回転するとグリッド範囲外にはみ出してしまいます。位置を調整してから回転してください。",
            })
            // 元の状態を維持
            return item
          }

          // 他のアイテムとの衝突をチェック
          const wouldCollide = placedItems.some((otherItem) => {
            // 自分自身とは衝突判定しない
            if (otherItem.id === id) return false

            // グリッドライン上の仕切りは無視
            if (otherItem.type === "divider" && otherItem.isGridLine) return false

            // 通常の衝突判定
            const itemRight = item.x + newWidth
            const itemBottom = item.y + newHeight
            const otherRight = otherItem.x + otherItem.width
            const otherBottom = otherItem.y + otherItem.height

            return !(
              itemRight <= otherItem.x ||
              item.x >= otherRight ||
              itemBottom <= otherItem.y ||
              item.y >= otherBottom
            )
          })

          if (wouldCollide) {
            // エラーモーダルを表示
            setErrorModal({
              visible: true,
              title: "回転エラー",
              message: "回転すると他のアイテムと重なってしまいます。位置を調整してから回転してください。",
            })
            // 元の状態を維持
            return item
          }

          // 全てのチェックをパスしたら回転を適用
          return {
            ...item,
            rotation: 0,//newRotation,  回転させるとずれる
            width: newWidth,
            height: newHeight,
          }
        }
        return item
      }),
    )
    handleCloseContextMenu()
  }

  // handleRotateItem関数の後に以下の関数を追加してください

  // 仕切りの自動配置機能
  const handleAutoPlaceDividers = () => {
    // 現在配置されている和菓子を取得
    const sweets = placedItems.filter((item) => item.type === "sweet")

    if (sweets.length < 2) {
      alert("仕切りを自動配置するには、2つ以上の和菓子が必要です。")
      return
    }

    // 既存の仕切りを削除するか確認
    const existingDividers = placedItems.filter((item) => item.type === "divider")
    if (existingDividers.length > 0) {
      if (!confirm("既存の仕切りを削除して新しく配置しますか？")) {
        return
      }
      // 既存の仕切りを削除
      setPlacedItems((prev) => prev.filter((item) => item.type !== "divider"))
    }

    // 新しい仕切りを配置
    const newDividers: PlacedItem[] = []

    // 水平方向の仕切りを配置
    const horizontalDividers = findOptimalHorizontalDividers(sweets, gridSize.width)
    newDividers.push(...horizontalDividers)

    // 垂直方向の仕切りを配置
    const verticalDividers = findOptimalVerticalDividers(sweets, gridSize.height)
    newDividers.push(...verticalDividers)

    if (newDividers.length === 0) {
      alert("適切な仕切りの配置場所が見つかりませんでした。")
      return
    }

    // 新しい仕切りを追加
    setPlacedItems((prev) => [...prev.filter((item) => item.type !== "divider"), ...newDividers])

    // 成功メッセージ
    alert(`${newDividers.length}個の仕切りを自動配置しました。`)
  }

  // 水平方向の最適な仕切りを見つける関数
  const findOptimalHorizontalDividers = (sweets: PlacedItem[], maxWidth: number): PlacedItem[] => {
    const dividers: PlacedItem[] = []

    // 和菓子を上端のY座標でグループ化
    const sweetsByBottomEdge = new Map<number, PlacedItem[]>()
    const sweetsByTopEdge = new Map<number, PlacedItem[]>()

    sweets.forEach((sweet) => {
      const bottom = sweet.y + sweet.height
      const top = sweet.y

      if (!sweetsByBottomEdge.has(bottom)) {
        sweetsByBottomEdge.set(bottom, [])
      }
      sweetsByBottomEdge.get(bottom)!.push(sweet)

      if (!sweetsByTopEdge.has(top)) {
        sweetsByTopEdge.set(top, [])
      }
      sweetsByTopEdge.get(top)!.push(sweet)
    })

    // 各行について、下端と上端が一致する場所を探す
    const potentialDividerPositions = new Set<number>()

    sweetsByBottomEdge.forEach((bottomSweets, bottomY) => {
      sweetsByTopEdge.forEach((topSweets, topY) => {
        // 下端と上端が隣接している場合（間に1マスの隙間がある場合）
        if (topY === bottomY) {
          potentialDividerPositions.add(bottomY)
        }
      })
    })

    // 各行について、和菓子がない列の範囲を見つける
    potentialDividerPositions.forEach((y) => {
      // その行に接している和菓子を取得
      const touchingSweets = [...(sweetsByBottomEdge.get(y) || []), ...(sweetsByTopEdge.get(y) || [])]

      // 各和菓子の水平範囲を取得
      const occupiedRanges: { start: number; end: number }[] = touchingSweets.map((sweet) => ({
        start: sweet.x,
        end: sweet.x + sweet.width,
      }))

      // 範囲をソート
      occupiedRanges.sort((a, b) => a.start - b.start)

      // 重複する範囲をマージ
      const mergedRanges: { start: number; end: number }[] = []
      occupiedRanges.forEach((range) => {
        const lastRange = mergedRanges[mergedRanges.length - 1]
        if (!lastRange || range.start > lastRange.end) {
          mergedRanges.push(range)
        } else if (range.end > lastRange.end) {
          lastRange.end = range.end
        }
      })

      // 各マージされた範囲の間に仕切りを配置
      for (let i = 0; i < mergedRanges.length - 1; i++) {
        const start = mergedRanges[i].end
        const end = mergedRanges[i + 1].start

        if (end > start) {
          // 仕切りの長さと開始位置を計算
          const length = end - start
          const x = start

          // 仕切りが配置可能か確認
          if (checkDividerSweetIntersection(x, y, "horizontal", length)) {
            // 新しい仕切りを作成
            const newDivider: PlacedItem = {
              id: generateId(),
              itemId: `auto-h-${x}-${y}`,
              type: "divider",
              x,
              y,
              width: length,
              height: 0,
              rotation: 0,
              isLocked: false,
              imageUrl: "",
              name: "自動配置仕切り（横）",
              orientation: "horizontal",
              isGridLine: true,
            }

            dividers.push(newDivider)
          }
        }
      }

      // 左端に仕切りを配置
      if (mergedRanges.length > 0 && mergedRanges[0].start > 0) {
        const length = mergedRanges[0].start
        const x = 0

        if (checkDividerSweetIntersection(x, y, "horizontal", length)) {
          const newDivider: PlacedItem = {
            id: generateId(),
            itemId: `auto-h-${x}-${y}`,
            type: "divider",
            x,
            y,
            width: length,
            height: 0,
            rotation: 0,
            isLocked: false,
            imageUrl: "",
            name: "自動配置仕切り（横）",
            orientation: "horizontal",
            isGridLine: true,
          }

          dividers.push(newDivider)
        }
      }

      // 右端に仕切りを配置
      if (mergedRanges.length > 0 && mergedRanges[mergedRanges.length - 1].end < maxWidth) {
        const start = mergedRanges[mergedRanges.length - 1].end
        const length = maxWidth - start

        if (checkDividerSweetIntersection(start, y, "horizontal", length)) {
          const newDivider: PlacedItem = {
            id: generateId(),
            itemId: `auto-h-${start}-${y}`,
            type: "divider",
            x: start,
            y,
            width: length,
            height: 0,
            rotation: 0,
            isLocked: false,
            imageUrl: "",
            name: "自動配置仕切り（横）",
            orientation: "horizontal",
            isGridLine: true,
          }

          dividers.push(newDivider)
        }
      }
    })

    return dividers
  }

  // 垂直方向の最適な仕切りを見つける関数
  const findOptimalVerticalDividers = (sweets: PlacedItem[], maxHeight: number): PlacedItem[] => {
    const dividers: PlacedItem[] = []

    // 和菓子を左端と右端のX座標でグループ化
    const sweetsByRightEdge = new Map<number, PlacedItem[]>()
    const sweetsByLeftEdge = new Map<number, PlacedItem[]>()

    sweets.forEach((sweet) => {
      const right = sweet.x + sweet.width
      const left = sweet.x

      if (!sweetsByRightEdge.has(right)) {
        sweetsByRightEdge.set(right, [])
      }
      sweetsByRightEdge.get(right)!.push(sweet)

      if (!sweetsByLeftEdge.has(left)) {
        sweetsByLeftEdge.set(left, [])
      }
      sweetsByLeftEdge.get(left)!.push(sweet)
    })

    // 各列について、右端と左端が一致する場所を探す
    const potentialDividerPositions = new Set<number>()

    sweetsByRightEdge.forEach((rightSweets, rightX) => {
      sweetsByLeftEdge.forEach((leftSweets, leftX) => {
        // 右端と左端が隣接している場合
        if (leftX === rightX) {
          potentialDividerPositions.add(rightX)
        }
      })
    })

    // 各列について、和菓子がない行の範囲を見つける
    potentialDividerPositions.forEach((x) => {
      // その列に接している和菓子を取得
      const touchingSweets = [...(sweetsByRightEdge.get(x) || []), ...(sweetsByLeftEdge.get(x) || [])]

      // 各和菓子の垂直範囲を取得
      const occupiedRanges: { start: number; end: number }[] = touchingSweets.map((sweet) => ({
        start: sweet.y,
        end: sweet.y + sweet.height,
      }))

      // 範囲をソート
      occupiedRanges.sort((a, b) => a.start - b.start)

      // 重複する範囲をマージ
      const mergedRanges: { start: number; end: number }[] = []
      occupiedRanges.forEach((range) => {
        const lastRange = mergedRanges[mergedRanges.length - 1]
        if (!lastRange || range.start > lastRange.end) {
          mergedRanges.push(range)
        } else if (range.end > lastRange.end) {
          lastRange.end = range.end
        }
      })

      // 各マージされた範囲の間に仕切りを配置
      for (let i = 0; i < mergedRanges.length - 1; i++) {
        const start = mergedRanges[i].end
        const end = mergedRanges[i + 1].start

        if (end > start) {
          // 仕切りの長さと開始位置を計算
          const length = end - start
          const y = start

          // 仕切りが配置可能か確認
          if (checkDividerSweetIntersection(x, y, "vertical", length)) {
            // 新しい仕切りを作成
            const newDivider: PlacedItem = {
              id: generateId(),
              itemId: `auto-v-${x}-${y}`,
              type: "divider",
              x,
              y,
              width: 0,
              height: length,
              rotation: 0,
              isLocked: false,
              imageUrl: "",
              name: "自動配置仕切り（縦）",
              orientation: "vertical",
              isGridLine: true,
            }

            dividers.push(newDivider)
          }
        }
      }

      // 上端に仕切りを配置
      if (mergedRanges.length > 0 && mergedRanges[0].start > 0) {
        const length = mergedRanges[0].start
        const y = 0

        if (checkDividerSweetIntersection(x, y, "vertical", length)) {
          const newDivider: PlacedItem = {
            id: generateId(),
            itemId: `auto-v-${x}-${y}`,
            type: "divider",
            x,
            y,
            width: 0,
            height: length,
            rotation: 0,
            isLocked: false,
            imageUrl: "",
            name: "自動配置仕切り（縦）",
            orientation: "vertical",
            isGridLine: true,
          }

          dividers.push(newDivider)
        }
      }

      // 下端に仕切りを配置
      if (mergedRanges.length > 0 && mergedRanges[mergedRanges.length - 1].end < maxHeight) {
        const start = mergedRanges[mergedRanges.length - 1].end
        const length = maxHeight - start

        if (checkDividerSweetIntersection(x, start, "vertical", length)) {
          const newDivider: PlacedItem = {
            id: generateId(),
            itemId: `auto-v-${x}-${start}`,
            type: "divider",
            x,
            y: start,
            width: 0,
            height: length,
            rotation: 0,
            isLocked: false,
            imageUrl: "",
            name: "自動配置仕切り（縦）",
            orientation: "vertical",
            isGridLine: true,
          }

          dividers.push(newDivider)
        }
      }
    })

    return dividers
  }

  // 仕切りの長さ調整モーダルを表示する関数
  const handleOpenResizeModal = (id: string) => {
    const divider = placedItems.find((item) => item.id === id)
    if (divider && divider.type === "divider") {
      setResizingDivider(divider)
    }
    handleCloseContextMenu()
  }

  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu.visible) {
        handleCloseContextMenu()
      }
    }

    document.addEventListener("click", handleClickOutside)
    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, [contextMenu.visible])

  return (
    <div className="flex-1">
      <h2 className="text-xl font-medium mb-4 text-[var(--color-indigo)] tracking-wide flex items-center">
        <span className="inline-block w-1 h-6 bg-[var(--color-indigo)] mr-2"></span>
        詰め合わせ箱
      </h2>
      <div
        ref={(node) => {
          boxRef.current = node
          drop(node)
        }}
        className={`relative border-4 border-[var(--color-indigo)] bg-[var(--color-beige-dark)] ${
          isOver && canDrop ? "drag-over" : ""
        } rounded-sm shadow-md`}
        style={{
          width: gridSize.width * cellSize + 8, // 右側の枠線のために8px追加（border-4の両側で8px）
          height: gridSize.height * cellSize + 8, // 下側の枠線のために8px追加（border-4の両側で8px）
          display: "grid",
          gridTemplateColumns: `repeat(${gridSize.width}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${gridSize.height}, ${cellSize}px)`,
          paddingRight: 4, // 右側の内側の余白を追加
          paddingBottom: 4, // 下側の内側の余白を追加
        }}
      >
        {/* グリッド線 */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: gridSize.width + 1 }).map((_, i) => (
            <div
              key={`v-${i}`}
              className="absolute top-0 bottom-0 border-r border-[var(--color-beige)]"
              style={{ left: `${i * cellSize}px` }}
            />
          ))}
          {Array.from({ length: gridSize.height + 1 }).map((_, i) => (
            <div
              key={`h-${i}`}
              className="absolute left-0 right-0 border-b border-[var(--color-beige)]"
              style={{ top: `${i * cellSize}px` }}
            />
          ))}
        </div>

        {/* 配置プレビュー */}
        {previewPosition.visible && (
          <div
            className={`absolute pointer-events-none border-2 ${
              previewPosition.isValid
                ? previewPosition.isSnapped
                  ? "border-[var(--color-gold)] bg-[var(--color-beige)]/70" // スナップ時のスタイル
                  : "border-[var(--color-green)] bg-[var(--color-beige-dark)]/50" // 通常の有効時のスタイル
                : "border-[var(--color-red)] bg-[var(--color-beige-dark)]/50" // 無効時のスタイル
            }`}
            style={
              previewPosition.isGridLine
                ? {
                    left:
                      previewPosition.orientation === "vertical"
                        ? previewPosition.x * cellSize - 2
                        : previewPosition.x * cellSize,
                    top:
                      previewPosition.orientation === "horizontal"
                        ? previewPosition.y * cellSize - 2
                        : previewPosition.y * cellSize,
                    width: previewPosition.orientation === "vertical" ? 4 : previewPosition.width * cellSize,
                    height: previewPosition.orientation === "horizontal" ? 4 : previewPosition.height * cellSize,
                    zIndex: 30,
                    // スナップ時のアニメーション効果
                    boxShadow: previewPosition.isSnapped ? "0 0 8px rgba(191, 155, 48, 0.7)" : "none",
                    transition: "box-shadow 0.2s ease",
                  }
                : {
                    left: previewPosition.x * cellSize,
                    top: previewPosition.y * cellSize,
                    width: previewPosition.width * cellSize,
                    height: previewPosition.height * cellSize,
                    zIndex: 30,
                  }
            }
          />
        )}

        {/* 配置済みアイテム */}
        {placedItems.map((item) => (
          <PlacedItemComponent
            key={item.id}
            item={item}
            onContextMenu={(e) => handleContextMenu(e, item)}
            setPlacedItems={setPlacedItems}
            isNew={newItemIds.has(item.id)}
            cellSize={cellSize}
            onDoubleClick={handleShowItemInfo}
          />
        ))}
      </div>

      {/* 合計金額表示 */}
      <div className="mt-4 p-3 bg-white rounded-sm border border-[var(--color-indigo-light)] shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-lg font-medium text-[var(--color-indigo)]">合計金額:</span>
            <span className="text-xl font-medium text-[var(--color-indigo)]">
              {calculateTotalPrice().toLocaleString()}円
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              ref={printRef}
              onClick={() => setIsPrintModalOpen(true)}
              className="px-3 py-1.5 bg-[var(--color-indigo)] hover:bg-[var(--color-indigo-light)] text-white rounded-sm text-sm font-medium transition-colors flex items-center gap-1.5 relative overflow-hidden group"
            >
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--color-gold)] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              印刷
            </button>
            <button
              ref={autoDividerRef}
              onClick={handleAutoPlaceDividers}
              className="px-3 py-1.5 bg-[var(--color-indigo)] hover:bg-[var(--color-indigo-light)] text-white rounded-sm text-sm font-medium transition-colors flex items-center gap-1.5 relative overflow-hidden group"
            >
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--color-gold)] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <line x1="12" y1="3" x2="12" y2="21" />
              </svg>
              仕切り自動配置
            </button>
          </div>
        </div>
      </div>

      {/* 印刷モーダル */}
      {isPrintModalOpen && (
        <PrintModal
          placedItems={placedItems}
          boxSize={boxSize}
          infoSettings={infoSettings}
          onClose={() => setIsPrintModalOpen(false)}
          selectedStoreId={selectedStoreId}
        />
      )}

      {/* コンテキストメニュー */}
      {contextMenu.visible && contextMenu.item && (
        <div ref={contextMenuRef}>
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            item={contextMenu.item}
            onDelete={handleDeleteItem}
            onToggleLock={handleToggleLock}
            onRotate={handleRotateItem}
            onResize={handleOpenResizeModal}
            onShowInfo={handleShowItemInfo}
            onClose={handleCloseContextMenu}
          />
        </div>
      )}

      {/* 仕切り長さ調整モーダル */}
      {resizingDivider && (
        <DividerResizeModal
          divider={resizingDivider}
          onResize={handleResizeDivider}
          onClose={() => setResizingDivider(null)}
          maxLength={
            resizingDivider.orientation === "horizontal"
              ? gridSize.width - resizingDivider.x
              : gridSize.height - resizingDivider.y
          }
        />
      )}

      {/* 商品情報モーダル */}
      {infoModalItem && (
        <div ref={productInfoRef}>
          <Dialog open={true} onOpenChange={(open) => !open && setInfoModalItem(null)}>
            <DialogContent className="sm:max-w-md bg-[var(--color-beige)] max-h-[80vh] overflow-y-auto !bg-opacity-100 border border-[var(--color-indigo-light)]">
              <DialogHeader>
                <DialogTitle className="text-[var(--color-indigo)] border-b border-[var(--color-gray-light)] pb-2">
                  {infoSettings.showName ? infoModalItem.name : "商品情報"}
                </DialogTitle>
              </DialogHeader>
              <div className="flex gap-4">
                {infoSettings.showImage && (
                  <div
                    className="w-24 h-24 relative overflow-hidden rounded-sm border border-[var(--color-indigo-light)] cursor-zoom-in hover:opacity-90 transition-opacity group bg-white"
                    onClick={() => handleShowImageViewer(infoModalItem)}
                  >
                    <img
                      src={getEnlargedImageUrl(infoModalItem.itemId) || infoModalItem.imageUrl || "/placeholder.svg"}
                      alt={infoModalItem.name}
                      className="w-full h-full"
                      style={{ objectFit: "contain" }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white/90 rounded-full p-1.5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-[var(--color-indigo)]"
                        >
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                          <line x1="11" y1="8" x2="11" y2="14" />
                          <line x1="8" y1="11" x2="14" y2="11" />
                        </svg>
                      </div>
                    </div>
                    <span className="absolute bottom-0 left-0 right-0 text-center text-xs bg-white/80 py-0.5 text-[var(--color-indigo)]">
                      クリックで拡大
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  {infoSettings.showName && (
                    <p className="mb-2">
                      <span className="font-medium text-[var(--color-indigo)]">商品名:</span> {infoModalItem.name}
                    </p>
                  )}
                  {infoSettings.showPrice && infoModalItem.price && (
                    <p className="mb-2">
                      <span className="font-medium text-[var(--color-indigo)]">価格:</span> {infoModalItem.price}円
                    </p>
                  )}
                  {infoSettings.showSize && (
                    <p className="mb-2">
                      <span className="font-medium text-[var(--color-indigo)]">サイズ:</span> {infoModalItem.width}×
                      {infoModalItem.height}
                    </p>
                  )}
                  {infoSettings.showCategory && infoModalItem.type === "sweet" && (
                    <p className="mb-2">
                      <span className="font-medium text-[var(--color-indigo)]">カテゴリ:</span>{" "}
                      {getCategoryName(infoModalItem.itemId)}
                    </p>
                  )}
                  {infoSettings.showCalories && infoModalItem.type === "sweet" && (
                    <p className="mb-2">
                      <span className="font-medium text-[var(--color-indigo)]">カロリー:</span>{" "}
                      {getCalories(infoModalItem.itemId)}kcal
                    </p>
                  )}
                  {infoSettings.showAllergies && infoModalItem.type === "sweet" && (
                    <div className="mb-2">
                      <span className="font-medium text-[var(--color-indigo)]">アレルギー:</span>{" "}
                      {getAllergies(infoModalItem.itemId).length > 0 ? (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {getAllergies(infoModalItem.itemId).map((allergy, index) => (
                            <span
                              key={index}
                              className="inline-block px-2 py-0.5 bg-[var(--color-red)] text-white text-xs rounded-sm"
                            >
                              {allergy}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">なし</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 詳細説明 */}
              {infoSettings.showDescription && infoModalItem.type === "sweet" && (
                <div className="mt-4 pt-4 border-t border-[var(--color-gray-light)]">
                  <h4 className="font-medium text-[var(--color-indigo)] mb-2 border-l-2 border-[var(--color-indigo)] pl-2">
                    詳細説明
                  </h4>
                  <p className="text-sm text-[var(--color-black)] whitespace-pre-line">
                    {getDescription(infoModalItem.itemId)}
                  </p>
                </div>
              )}

              {/* 原材料情報 */}
              {infoSettings.showIngredients && infoModalItem.type === "sweet" && (
                <div className="mt-4 pt-4 border-t border-[var(--color-gray-light)]">
                  <h4 className="font-medium text-[var(--color-indigo)] mb-2 border-l-2 border-[var(--color-indigo)] pl-2">
                    原材料
                  </h4>
                  <p className="text-sm text-[var(--color-black)] whitespace-pre-line">
                    {getIngredients(infoModalItem.itemId)}
                  </p>
                </div>
              )}

              {/* 栄養成分情報 */}
              {infoSettings.showNutritionInfo && infoModalItem.type === "sweet" && (
                <div className="mt-4 pt-4 border-t border-[var(--color-gray-light)]">
                  <h4 className="font-medium text-[var(--color-indigo)] mb-2 border-l-2 border-[var(--color-indigo)] pl-2">
                    栄養成分
                  </h4>
                  <p className="text-sm text-[var(--color-black)] whitespace-pre-line">
                    {getNutritionInfo(infoModalItem.itemId)}
                  </p>
                </div>
              )}

              {/* 日持ち情報 */}
              {infoSettings.showShelfLife && infoModalItem.type === "sweet" && (
                <div className="mt-4 pt-4 border-t border-[var(--color-gray-light)]">
                  <h4 className="font-medium text-[var(--color-indigo)] mb-2 border-l-2 border-[var(--color-indigo)] pl-2">
                    日持ち
                  </h4>
                  <p className="text-sm text-[var(--color-black)] whitespace-pre-line">
                    {getShelfLife(infoModalItem.itemId)}
                  </p>
                </div>
              )}

              {/* 保存方法情報 */}
              {infoSettings.showStorageMethod && infoModalItem.type === "sweet" && (
                <div className="mt-4 pt-4 border-t border-[var(--color-gray-light)]">
                  <h4 className="font-medium text-[var(--color-indigo)] mb-2 border-l-2 border-[var(--color-indigo)] pl-2">
                    保存方法
                  </h4>
                  <p className="text-sm text-[var(--color-black)] whitespace-pre-line">
                    {getStorageMethod(infoModalItem.itemId)}
                  </p>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* 画像拡大表示モーダル */}
      {imageViewerItem && (
        <ImageViewerModal
          imageUrl={getEnlargedImageUrl(imageViewerItem.itemId) || imageViewerItem.imageUrl}
          altText={imageViewerItem.name}
          onClose={() => setImageViewerItem(null)}
        />
      )}

      {/* エラーモーダル */}
      {errorModal.visible && (
        <ErrorModalComponent
          title={errorModal.title}
          message={errorModal.message}
          onClose={() => setErrorModal((prev) => ({ ...prev, visible: false }))}
        />
      )}
    </div>
  )

  // カテゴリ名を取得する関数
  function getCategoryName(itemId: string): string {
    const sweet = sweets.find((s) => s.id === itemId)
    return sweet ? sweet.category : "不明"
  }

  // カロリーを取得する関数
  function getCalories(itemId: string): number {
    const sweet = sweets.find((s) => s.id === itemId)
    return sweet?.calories || 0
  }

  // アレルギー情報を取得する関数
  function getAllergies(itemId: string): string[] {
    const sweet = sweets.find((s) => s.id === itemId)
    return sweet?.allergies || []
  }

  // 詳細説明を取得する関数
  function getDescription(itemId: string): string {
    const sweet = sweets.find((s) => s.id === itemId)
    return sweet?.description || "詳細情報はありません。"
  }

  // 原材料情報を取得する関数
  function getIngredients(itemId: string): string {
    const sweet = sweets.find((s) => s.id === itemId)
    return sweet?.ingredients || "原材料情報はありません。"
  }

  // 栄養成分情報を取得する関数
  function getNutritionInfo(itemId: string): string {
    const sweet = sweets.find((s) => s.id === itemId)
    return sweet?.nutritionInfo || "栄養成分情報はありません。"
  }

  // 日持ち情報を取得する関数
  function getShelfLife(itemId: string): string {
    const sweet = sweets.find((s) => s.id === itemId)
    return sweet?.shelfLife || "日持ち情報はありません。"
  }

  // 保存方法情報を取得する関数
  function getStorageMethod(itemId: string): string {
    const sweet = sweets.find((s) => s.id === itemId)
    return sweet?.storageMethod || "保存方法情報はありません。"
  }

  // 拡大用画像URLを取得する関数
  function getEnlargedImageUrl(itemId: string): string | null {
    const sweet = sweets.find((s) => s.id === itemId)
    return sweet?.enlargedImagePath || null
  }
}
