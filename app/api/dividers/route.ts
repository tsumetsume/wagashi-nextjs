import { NextResponse } from "next/server"
import { dividers } from "@/data/items"
import type { DividerItem } from "@/types/types"

export async function GET() {
  try {
    // 現在は静的なデータを使用
    // 将来的にデータベースで管理する場合は、以下のような実装に変更可能
    /*
    const dividers = await prisma.divider.findMany({
      where: {
        isActive: true
      },
      orderBy: { createdAt: 'desc' }
    })
    */

    return NextResponse.json(dividers)
  } catch (error) {
    console.error("Error in dividers API route:", error)
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
