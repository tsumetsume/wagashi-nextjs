import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// 箱タイプ詳細取得
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const boxType = await prisma.boxType.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!boxType) {
      return NextResponse.json(
        { error: "箱タイプが見つかりません" },
        { status: 404 }
      )
    }

    return NextResponse.json(boxType)
  } catch (error) {
    console.error("Error fetching box type:", error)
    return NextResponse.json(
      { error: "箱タイプの取得に失敗しました" },
      { status: 500 }
    )
  }
}

// 箱タイプ更新
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { name, price, description, isActive } = await request.json()

    const boxType = await prisma.boxType.update({
      where: {
        id: params.id,
      },
      data: {
        name,
        price: price !== undefined ? parseInt(price) : undefined,
        description,
        isActive,
      },
    })

    return NextResponse.json(boxType)
  } catch (error) {
    console.error("Error updating box type:", error)
    return NextResponse.json(
      { error: "箱タイプの更新に失敗しました" },
      { status: 500 }
    )
  }
}

// 箱タイプ削除
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.boxType.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ message: "箱タイプを削除しました" })
  } catch (error) {
    console.error("Error deleting box type:", error)
    return NextResponse.json(
      { error: "箱タイプの削除に失敗しました" },
      { status: 500 }
    )
  }
}