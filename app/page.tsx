"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // メインページにアクセスした場合は店舗選択画面にリダイレクト
    router.push("/store-selection")
  }, [router])

  return null
}
