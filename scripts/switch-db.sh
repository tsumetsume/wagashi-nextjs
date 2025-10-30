#!/bin/bash

# データベース切り替えスクリプト
# 使用方法: ./scripts/switch-db.sh [local|supabase]

set -e

if [ $# -eq 0 ]; then
    echo "使用方法: $0 [local|supabase]"
    echo "  local    - ローカルPostgreSQLを使用"
    echo "  supabase - Supabaseを使用"
    exit 1
fi

DB_TYPE=$1

case $DB_TYPE in
    "local")
        echo "ローカルPostgreSQLに切り替えています..."
        sed -i 's/USE_LOCAL_DB=false/USE_LOCAL_DB=true/' .env.local
        echo "✅ ローカルPostgreSQLに切り替えました"
        echo "Lib install: docker compose -f compose.local.yml run --rm app pnpm install"
        echo "📝 compose.local.ymlを使用してください: docker compose -f compose.local.yml up"
        ;;
    "supabase")
        echo "Supabaseに切り替えています..."
        sed -i 's/USE_LOCAL_DB=true/USE_LOCAL_DB=false/' .env.local
        echo "✅ Supabaseに切り替えました"
        echo "📝 通常のcompose.ymlを使用してください: docker compose up"
        ;;
    *)
        echo "❌ 無効なオプション: $DB_TYPE"
        echo "使用方法: $0 [local|supabase]"
        exit 1
        ;;
esac

echo ""
echo "現在の設定:"
grep "USE_LOCAL_DB=" .env.local

echo ""
echo "次のステップ:"
echo "1. Prismaクライアントを再生成: pnpm db:generate"
echo "2. データベーススキーマを適用: pnpm db:push"
echo "3. 必要に応じてシードデータを投入: pnpm db:seed"