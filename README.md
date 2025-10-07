# 和菓子シミュレーター

和菓子の配置シミュレーションアプリケーションです。

## 機能

- 和菓子の配置シミュレーション
- 管理画面（商品・カテゴリー・在庫管理）
- 管理者認証システム

## 技術スタック

- **フロントエンド**: Next.js 15, React 19, TypeScript
- **バックエンド**: Next.js API Routes
- **データベース**: postgresql
- **ORM**: Prisma
- **認証**: NextAuth.js
- **スタイリング**: Tailwind CSS
- **開発環境**: Docker

## セットアップ

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd wagashi
```

### 2. 環境変数の設定

```bash
cp env.example .env
```

`.env`ファイルを編集して、必要に応じて設定を変更してください。

### 3. 開発環境のセットアップ

#### 方法A: セットアップスクリプトを使用（推奨）

```bash
docker compose run --rm app sh ./setup.sh
```

#### 方法B: 手動セットアップ

```bash
# 依存関係のインストール
pnpm install

# Prismaクライアントの生成
pnpm db:generate

# データベースのマイグレーション
pnpm db:push

# シードデータの投入
pnpm db:seed
```

### 4. Docker Composeで起動

```bash
# コンテナの起動
docker-compose up -d
```

### 5. アプリケーションにアクセス

- メインアプリ: http://localhost:3000
- 管理画面: http://localhost:3000/admin

## 管理画面

### ログイン情報

初期管理者アカウント:
- メール: `admin@example.com`
- パスワード: `I9mJCaDrscR06kV`

### 機能

1. **ダッシュボード**
   - 統計情報の表示
   - クイックアクション

2. **カテゴリー管理**
   - カテゴリーの作成・編集・削除
   - カテゴリー名と説明の管理

3. **商品管理**
   - 商品の作成・編集・削除
   - 商品詳細情報の管理
   - 画像アップロード機能
   - サイズ設定（2x2, 2x3, 3x3, 3x4, 4x4）

4. **在庫管理**
   - 商品ごとの在庫数の表示・更新
   - リアルタイム在庫管理

5. **アカウント管理**
   - 管理者ユーザーの作成・削除
   - 権限管理（管理者・スーパー管理者）

## 開発

### 利用可能なスクリプト

```bash
# 開発サーバーの起動
pnpm dev

# ビルド
pnpm build

# 本番サーバーの起動
pnpm start

# データベース関連
pnpm db:generate    # Prismaクライアントの生成
pnpm db:push        # データベーススキーマの同期
pnpm db:migrate     # マイグレーションの実行
pnpm db:seed        # シードデータの投入
pnpm db:studio      # Prisma Studioの起動
```

### プロジェクト構造

```
wagashi-simulator/
├── app/                    # Next.js App Router
│   ├── admin/             # 管理画面
│   │   ├── login/         # ログインページ
│   │   ├── categories/    # カテゴリー管理
│   │   ├── products/      # 商品管理
│   │   ├── stock/         # 在庫管理
│   │   └── accounts/      # アカウント管理
│   └── api/               # API Routes
│       └── admin/         # 管理画面API
├── components/            # Reactコンポーネント
│   ├── admin/            # 管理画面用コンポーネント
│   └── ui/               # UIコンポーネント
├── lib/                  # ユーティリティ
├── prisma/               # Prisma設定
│   ├── schema.prisma     # データベーススキーマ
│   └── seed.ts           # シードデータ
└── public/               # 静的ファイル
    └── uploads/          # アップロードされた画像
```

## データベーススキーマ

### 主要テーブル

- **AdminUser**: 管理者ユーザー
- **Category**: 商品カテゴリー
- **Product**: 商品情報
- **Stock**: 在庫情報

## トラブルシューティング

### Prismaクライアントエラー

```bash
# Prismaクライアントを再生成
pnpm db:generate

# データベースを再同期
pnpm db:push
```

### ビルドエラー

```bash
# 依存関係を再インストール
rm -rf node_modules
pnpm install

# Prismaクライアントを再生成
pnpm db:generate
```

## デプロイ

### 本番環境での注意事項

1. **環境変数**
   - `NEXTAUTH_SECRET`を強力な値に変更
   - `DATABASE_URL`を本番用に設定
   - `NEXTAUTH_URL`を本番URLに設定

2. **セキュリティ**
   - 管理者パスワードの変更
   - HTTPSの設定
   - ファイアウォールの設定

3. **バックアップ**
   - データベースの定期バックアップ
   - アップロード画像のバックアップ

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。
