import { NextResponse } from "next/server"
import { sweets } from "@/data/items"

export async function GET() {
  try {
    // 実際のAPIサーバーからデータを取得する場合は、ここでfetchを使用します
    // この例では、既存のダミーデータを返します

    // APIレスポンスを遅延させてローディング状態をテストする（実際の実装では削除可）
    await new Promise((resolve) => setTimeout(resolve, 800))

    return NextResponse.json(sweets)
  } catch (error) {
    console.error("Error in sweets API route:", error)
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
