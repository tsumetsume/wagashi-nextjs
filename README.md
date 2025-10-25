# 和菓子シミュレーター

和菓子の配置シミュレーションアプリケーションです。

## 機能

- 和菓子の配置シミュレーション
- 管理画面（商品・カテゴリー・在庫管理）
- 管理者認証システム

## 技術スタック

- **フロントエンド**: Next.js 15, React 19, TypeScript
- **バックエンド**: Next.js API Routes
- **データベース**: Supabase PostgreSQL
- **ORM**: Prisma
- **認証**: NextAuth.js
- **ファイルストレージ**: Supabase Storage
- **スタイリング**: Tailwind CSS
- **開発環境**: Docker

## セットアップ

**重要**: このアプリケーションはSupabaseが必須です。Docker buildを実行する前に、必ずSupabaseの設定を完了してください。

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd wagashi
```

### 2. Supabaseプロジェクトの作成（必須）

1. [Supabase](https://supabase.com)にアクセスしてアカウントを作成
2. 新しいプロジェクトを作成
3. データベースのパスワードを設定（強力なパスワードを推奨）
4. プロジェクトの設定から以下の情報を取得：
   - Project URL
   - API Keys（anon public key と service_role key）
   - Database URL（Settings > Database > Connection string > URI）

### 3. ストレージバケットの作成

1. Supabaseダッシュボードで「Storage」に移動
2. 「Create a new bucket」をクリック
3. バケット名を「images」に設定
4. 「Public bucket」にチェックを入れる
5. 「Create bucket」をクリック

### 4. RLS（Row Level Security）ポリシーの設定

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

### 5. 環境変数の設定

```bash
cp env.example .env
```

`.env`ファイルを編集して、Supabaseの設定情報を追加：

```env
# Database (Supabase PostgreSQL)
# Connect to Supabase via connection pooling
DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
# Direct connection to the database. Used for migrations
DIRECT_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"

# Supabase（必須）
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_PROJECT_ID=your-supabase-project-id

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key-here-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

**重要**: 
- `[YOUR-PASSWORD]`をSupabaseプロジェクト作成時に設定したデータベースパスワードに置き換え
- `[YOUR-PROJECT-REF]`をプロジェクトリファレンスに置き換え
- **すべての値を実際の値に置き換えてから次のステップに進んでください**

**接続方式の説明**:
- `DATABASE_URL`: 接続プール経由（通常のアプリケーション処理用）
- `DIRECT_URL`: 直接接続（マイグレーションやスキーマ変更用）

### 6. 開発環境のセットアップ

**注意**: 環境変数の設定が完了してから実行してください。

#### 方法A: Dockerを使用（推奨）

```bash
# Docker Composeでビルドと起動
docker compose up --build
```

#### 方法B: セットアップスクリプトを使用

```bash
docker compose run --rm app sh ./setup.sh
```

#### 方法C: 手動セットアップ

```bash
# 依存関係のインストール
pnpm install

# Prismaクライアントの生成
pnpm db:generate

# データベースのマイグレーション
pnpm db:push

# シードデータの投入
pnpm db:seed

# 開発サーバーの起動
pnpm dev
```

### 7. データベーススキーマの作成

Supabaseデータベースにテーブルを作成：

```bash
# Prismaクライアントの生成
pnpm db:generate

# Supabaseデータベースにスキーマを適用
pnpm db:push

# 初期データの投入
pnpm db:seed
```

### 8. 既存データの移行（オプション）

既存のローカルデータベースからSupabaseに移行する場合：

```bash
# 移行スクリプトの実行
SOURCE_DATABASE_URL="postgresql://wagashi_user:wagashi_password@localhost:5432/wagashi_simulator" \
DATABASE_URL="your-supabase-database-url" \
tsx scripts/migrate-to-supabase.ts
```

### 9. アプリケーションにアクセス

- メインアプリ: http://localhost:3000
- 管理画面: http://localhost:3000/admin

## 環境変数が未設定の場合のエラー対処

もし`docker compose build`時に以下のようなエラーが発生した場合：

```
Error: supabaseUrl is required.
```

これはSupabaseの環境変数が設定されていないことが原因です。以下の手順で解決してください：

1. **環境変数の確認**: `.env`ファイルにSupabaseの設定がすべて記載されているか確認
2. **値の設定**: 空の値（`""`）ではなく、実際のSupabaseプロジェクトの値を設定
3. **再ビルド**: 環境変数を設定後、`docker compose up --build`を再実行

### 最小限の環境変数設定例

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_PROJECT_ID=your-project-id
DATABASE_URL=postgresql://postgres.your-project:password@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.your-project:password@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

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
pnpm types:generate # Supabase型定義の生成
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

# Supabase型定義を再生成
pnpm types:generate
```

### Docker Build エラー

#### `Error: supabaseUrl is required.` エラー

このエラーはビルド時にSupabaseの環境変数が設定されていない場合に発生します。

**解決方法**:
1. `.env`ファイルが存在し、すべてのSupabase環境変数が設定されていることを確認
2. 環境変数の値が空文字列（`""`）ではなく、実際の値が設定されていることを確認
3. 以下のコマンドで環境変数を確認：
   ```bash
   cat .env | grep SUPABASE
   ```
4. 環境変数を正しく設定後、コンテナを再ビルド：
   ```bash
   docker compose down
   docker compose up --build
   ```

### Supabase関連のエラー

#### 画像アップロードエラー

1. **環境変数の確認**
   ```bash
   # .envファイルでSupabase設定を確認
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
