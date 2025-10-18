# 和菓子シミュレーター

和菓子の配置シミュレーションアプリケーションです。

## 機能

- 和菓子の配置シミュレーション
- 管理画面（商品・カテゴリー・在庫管理）
- 管理者認証システム

## 技術スタック

- **フロントエンド**: Next.js 15, React 19, TypeScript
- **バックエンド**: Next.js API Routes
- **データベース**: PostgreSQL
- **ORM**: Prisma
- **認証**: NextAuth.js
- **ファイルストレージ**: Supabase Storage
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

### 4. Supabaseのセットアップ（画像ストレージ用）

#### 4.1 Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)にアクセスしてアカウントを作成
2. 新しいプロジェクトを作成
3. プロジェクトの設定から以下の情報を取得：
   - Project URL
   - API Keys（anon public key と service_role key）

#### 4.2 ストレージバケットの作成

1. Supabaseダッシュボードで「Storage」に移動
2. 「Create a new bucket」をクリック
3. バケット名を「images」に設定
4. 「Public bucket」にチェックを入れる
5. 「Create bucket」をクリック

#### 4.3 RLS（Row Level Security）ポリシーの設定

Supabaseダッシュボードの「SQL Editor」で以下のクエリを実行：

```sql
-- 画像の読み取りを全員に許可
CREATE POLICY "Public Access" ON storage.objects 
FOR SELECT USING (bucket_id = 'images');

-- 認証済みユーザーのみアップロード・削除を許可
CREATE POLICY "Authenticated users can upload" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete" ON storage.objects 
FOR DELETE USING (bucket_id = 'images' AND auth.role() = 'authenticated');
```

#### 4.4 環境変数の設定

`.env.local`ファイルに以下のSupabase設定を追加：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

**注意**: `your-supabase-project-url`、`your-supabase-anon-key`、`your-supabase-service-role-key`を実際の値に置き換えてください。

### 5. Docker Composeで起動

```bash
# コンテナの起動
docker-compose up -d
```

### 6. アプリケーションにアクセス

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
├── lib/                  # ユーティリティ
│   └── supabase.ts       # Supabaseクライアント設定
└── public/               # 静的ファイル
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

### Supabase関連のエラー

#### 画像アップロードエラー

1. **環境変数の確認**
   ```bash
   # .env.localファイルでSupabase設定を確認
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   ```

2. **バケットの確認**
   - Supabaseダッシュボードで「images」バケットが存在することを確認
   - バケットがpublicに設定されていることを確認

3. **RLSポリシーの確認**
   - Storage > Policies で適切なポリシーが設定されていることを確認

#### 接続エラー

```bash
# Supabaseクライアントの再インストール
pnpm remove @supabase/supabase-js
pnpm add @supabase/supabase-js
```

## デプロイ

### 本番環境での注意事項

1. **環境変数**
   - `NEXTAUTH_SECRET`を強力な値に変更
   - `DATABASE_URL`を本番用に設定
   - `NEXTAUTH_URL`を本番URLに設定
   - Supabase環境変数を本番用に設定

2. **セキュリティ**
   - 管理者パスワードの変更
   - HTTPSの設定
   - ファイアウォールの設定
   - SupabaseのRLSポリシーの確認

3. **バックアップ**
   - データベースの定期バックアップ
   - Supabaseストレージは自動でバックアップされます

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。
