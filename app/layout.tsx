import type React from "react"
import type { Metadata } from "next"
import { Inter, Noto_Sans_JP, Noto_Serif_JP } from "next/font/google"
import "./globals.css"

// Noto Sans JPフォントの設定
const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-noto-sans-jp",
  display: "swap",
})

// Noto Serif JPフォントの設定
const notoSerifJP = Noto_Serif_JP({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-serif-jp",
  display: "swap",
})

// フォールバック用のInterフォント
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "和菓子詰め合わせシミュレーター",
  description: "和菓子の詰め合わせをシミュレーションできるWebアプリケーション",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} ${notoSerifJP.variable} ${inter.variable}`}>
      <body className="washi-bg">{children}</body>
    </html>
  )
}
