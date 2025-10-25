# 技術スタック

## コアフレームワーク
- **Next.js 15** with App Router
- **React 19** with TypeScript
- **Node.js** ランタイム

## データベース & ORM
- **Supabase PostgreSQL** (プライマリデータベース)
- **Prisma ORM** データベース操作用
- **Supabase Storage** 画像/ファイルストレージ用

## 認証 & セキュリティ
- **NextAuth.js** 認証用
- **bcryptjs** パスワードハッシュ化用
- **Supabase RLS** (Row Level Security) データアクセス制御用

## UI & スタイリング
- **Tailwind CSS** スタイリング用
- **Radix UI** コンポーネントライブラリ
- **Lucide React** アイコン用
- **next-themes** テーマ管理用
- **日本語フォント**: Noto Sans JP, Noto Serif JP

## 主要ライブラリ
- **react-dnd** ドラッグ&ドロップ機能用
- **react-hook-form** + **zod** フォームバリデーション用
- **file-saver** ファイルダウンロード用
- **recharts** データ可視化用
- **sonner** トースト通知用

## 開発ツール
- **TypeScript** 型安全性用
- **pnpm** パッケージマネージャー
- **Docker** コンテナ化用
- **tsx** TypeScript実行用

## 共通コマンド

### 開発
```bash
pnpm dev              # 開発サーバー起動
pnpm build            # 本番用ビルド
pnpm start            # 本番サーバー起動
pnpm lint             # ESLint実行
```

### データベース操作
```bash
pnpm db:generate      # Prismaクライアント生成
pnpm db:push          # スキーマをデータベースにプッシュ
pnpm db:migrate       # マイグレーション実行
pnpm db:seed          # 初期データでデータベースをシード
pnpm db:studio        # Prisma Studio開く
```

### Supabase統合
```bash
pnpm types:generate   # Supabase TypeScript型生成
pnpm migrate:supabase # Supabaseにデータ移行
pnpm db:test          # データベース接続テスト
```

## ビルド設定
- **ESLint/TypeScriptエラーはビルド時に無視** 迅速な開発のため
- **画像最適化は無効** 互換性のため
- **パスエイリアス**: `@/*` はプロジェクトルートにマップ