#!/bin/bash

# NODE_ENVがproductionでない場合は処理を終了
if [ "$NODE_ENV" != "production" ]; then
    echo "⚠️ NODE_ENVがproductionではありません。セットアップをスキップします。"
    echo "現在のNODE_ENV: ${NODE_ENV:-未設定}"
    exec "$@"
fi

echo "🚀 和菓子シミュレーター開発環境のセットアップを開始します..."

# 依存関係のインストール
echo "📦 依存関係をインストールしています..."
pnpm install

# Prismaクライアントの生成
echo "🔧 Prismaクライアントを生成しています..."
pnpm db:generate

# データベースの削除
echo "�️ 既存のデスータベースを削除しています..."
rm -f prisma/dev.db prisma/dev.db-journal || echo "⚠️ データベースファイルが存在しないか、削除に失敗しました"

# データベースのリセット
echo "🔄 データベースをリセットしています..."
pnpm db:migrate

# データベースの同期
echo "🗄️ データベーススキーマを同期しています..."
pnpm db:push

# シードデータの投入
echo "🌱 シードデータを投入しています..."
pnpm db:seed

echo "✅ セットアップが完了しました！"
echo ""
echo "📧 管理者ログイン情報:"
echo "   メール: admin@example.com"
echo "   パスワード: I9mJCaDrscR06kV"
echo ""
echo "🌐 アクセスURL:"
echo "   メインアプリ: http://localhost:3000"
echo "   管理画面: http://localhost:3000/admin"
echo ""
echo "🚀 開発サーバーを起動するには:"
echo "   pnpm dev" 

exec "$@"