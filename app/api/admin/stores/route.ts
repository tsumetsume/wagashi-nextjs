import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const stores = await prisma.store.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(stores)
  } catch (error) {
    console.error("Error fetching stores:", error)
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, address, phone, isActive } = body

    if (!name) {
      return new NextResponse(JSON.stringify({ error: "店舗名は必須です" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const store = await prisma.store.create({
      data: {
        name,
        description: description || null,
        address: address || null,
        phone: phone || null,
        isActive: isActive ?? true
      }
    })

    return NextResponse.json(store)
  } catch (error) {
    console.error("Error creating store:", error)
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}