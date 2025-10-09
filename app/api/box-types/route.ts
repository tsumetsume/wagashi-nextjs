import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// 箱タイプ一覧取得
export async function GET() {
  try {
    const boxTypes = await prisma.boxType.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        size: "asc",
      },
    })

    return NextResponse.json(boxTypes)
  } catch (error) {
    console.error("Error fetching box types:", error)
    return NextResponse.json(
      { error: "箱タイプの取得に失敗しました" },
      { status: 500 }
    )
  }
}

// 箱タイプ作成
export async function POST(request: Request) {
  try {
    const { size, name, price, description } = await request.json()

    if (!size || !name || price === undefined) {
      return NextResponse.json(
        { error: "必須項目が不足しています" },
        { status: 400 }
      )
    }

    const boxType = await prisma.boxType.create({
      data: {
        size,
        name,
        price: parseInt(price),
        description,
      },
    })

    return NextResponse.json(boxType)
  } catch (error) {
    console.error("Error creating box type:", error)
    return NextResponse.json(
      { error: "箱タイプの作成に失敗しました" },
      { status: 500 }
    )
  }
}