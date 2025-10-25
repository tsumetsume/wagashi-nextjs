# プロジェクト構造

## ルートディレクトリレイアウト

```
wagashi-simulator/
├── app/                    # Next.js App Router (ページ & API ルート)
├── components/             # React コンポーネント
├── lib/                    # ユーティリティ & 設定
├── types/                  # TypeScript 型定義
├── prisma/                 # データベーススキーマ & マイグレーション
├── public/                 # 静的アセット
├── hooks/                  # カスタム React フック
├── services/               # API サービス層
├── data/                   # 静的データファイル
└── documents/              # ドキュメント & ガイド
```

## App ディレクトリ (Next.js App Router)

```
app/
├── layout.tsx              # プロバイダー付きルートレイアウト
├── page.tsx                # ホームページ (store-selection にリダイレクト)
├── globals.css             # グローバルスタイル
├── admin/                  # 管理者ダッシュボードページ
│   ├── layout.tsx          # サイドバー付き管理者レイアウト
│   ├── page.tsx            # 管理者ダッシュボード
│   ├── accounts/           # ユーザー管理
│   ├── categories/         # カテゴリ管理
│   ├── products/           # 商品管理
│   ├── stock/              # 在庫管理
│   └── stores/             # 店舗管理
├── api/                    # API ルート
│   ├── admin/              # 管理者 API エンドポイント
│   ├── auth/               # 認証エンドポイント
│   ├── box-types/          # ボックスタイプ管理
│   ├── stores/             # 店舗操作
│   └── sweets/             # 商品操作
├── customer-code/          # お客様コード検索
├── login/                  # 認証ページ
├── simulator/              # メインシミュレーターインターフェース
└── store-selection/        # 店舗選択ページ
```

## コンポーネント構成

```
components/
├── ui/                     # 再利用可能な UI コンポーネント (shadcn/ui)
├── admin/                  # 管理者専用コンポーネント
├── providers.tsx           # コンテキストプロバイダーラッパー
├── theme-provider.tsx      # テーマ管理
├── wagashi-simulator-content.tsx  # メインシミュレーターロジック
├── box-area.tsx            # ドラッグ&ドロップボックスインターフェース
├── selection-area.tsx      # 商品選択パネル
├── placed-item.tsx         # 個別配置アイテム
├── sweet-item.tsx          # ドラッグ可能な商品アイテム
└── [feature]-modal.tsx     # 各種モーダルコンポーネント
```

## データベーススキーマ (Prisma)

```
prisma/
├── schema.prisma           # データベーススキーマ定義
├── seed.ts                 # 初期データシーディング
└── migrations/             # データベースマイグレーションファイル
```

### 主要モデル
- **AdminUser**: 管理者認証 & ロール
- **Store**: マルチロケーション店舗管理
- **Category**: 商品カテゴリ化
- **Product**: 画像 & 詳細付き和菓子アイテム
- **Stock**: 店舗固有の在庫追跡
- **BoxType**: 利用可能なボックスサイズ & 価格
- **SavedLayout**: お客様レイアウト永続化

## ライブラリ構造

```
lib/
├── prisma.ts               # Prisma クライアント設定
├── supabase.ts             # Supabase クライアントセットアップ
├── supabase-helpers.ts     # Supabase ユーティリティ関数
├── database.types.ts       # 生成された Supabase 型
└── utils.ts                # 一般的なユーティリティ (cn など)
```

## 型定義

```
types/
├── types.ts                # コアアプリケーション型
└── next-auth.d.ts          # NextAuth 型拡張
```

## 命名規則

- **ファイル**: kebab-case (`box-selection-modal.tsx`)
- **コンポーネント**: PascalCase (`BoxSelectionModal`)
- **変数/関数**: camelCase (`handleSaveLayout`)
- **データベース**: snake_case (`admin_users`, `box_types`)
- **API ルート**: kebab-case (`/api/box-types`)

## インポートパターン

- すべての内部インポートに `@/` パスエイリアスを使用
- インポートをグループ化: 外部ライブラリを最初に、次に内部モジュール
- ユーティリティではデフォルトエクスポートよりも名前付きエクスポートを優先
- TypeScript専用インポートには `type` インポートを使用

## ファイル構成原則

- **機能ベースのグループ化**: 関連機能をまとめて配置
- **関心の分離**: UI コンポーネントとビジネスロジックを分離
- **再利用可能なコンポーネント**: 汎用 UI コンポーネントは `components/ui/` に配置
- **ドメイン固有のコンポーネント**: 機能コンポーネントはコンポーネントルートレベルに配置