import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const stores = await prisma.store.findMany({
      where: {
        isActive: true
      },
      orderBy: { name: 'asc' }
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