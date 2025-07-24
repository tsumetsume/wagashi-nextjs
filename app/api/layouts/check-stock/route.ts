import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Prismaクライアントのクリーンアップ
if (process.env.NODE_ENV === "production") {
  process.on("beforeExit", async () => {
    await prisma.$disconnect()
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { storeId, placedItems } = body

    if (!storeId || !placedItems || !Array.isArray(placedItems)) {
      return NextResponse.json(
        { error: "必要なデータが不足しています" },
        { status: 400 }
      )
    }

    // 配置されている商品のIDを取得（重複を除く）
    const productIds = [...new Set(placedItems.map((item: any) => item.itemId))]

    // 該当店舗の在庫情報を取得
    const stocks = await (prisma as any).stock.findMany({
      where: {
        storeId: storeId,
        productId: { in: productIds }
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            isActive: true
          }
        }
      }
    })

    // 在庫がない、または非アクティブな商品を特定
    const unavailableItems: any[] = []
    const availableProductIds = new Set(
      stocks
        .filter(stock => stock.quantity > 0 && stock.product.isActive)
        .map(stock => stock.productId)
    )

    placedItems.forEach((item: any) => {
      if (!availableProductIds.has(item.itemId)) {
        // 商品情報を取得
        const stock = stocks.find(s => s.productId === item.itemId)
        const productName = stock?.product?.name || item.name || "不明な商品"
        
        unavailableItems.push({
          id: item.id,
          itemId: item.itemId,
          name: productName,
          reason: stock?.product?.isActive === false 
            ? "商品が販売停止中です" 
            : "在庫がありません"
        })
      }
    })

    // 利用可能な商品のみをフィルタリング
    const availableItems = placedItems.filter((item: any) => 
      availableProductIds.has(item.itemId)
    )

    return NextResponse.json({
      success: true,
      availableItems,
      unavailableItems,
      hasUnavailableItems: unavailableItems.length > 0
    })

  } catch (error) {
    console.error("Stock check error:", error)
    return NextResponse.json(
      { error: "在庫チェックに失敗しました" },
      { status: 500 }
    )
  }
}