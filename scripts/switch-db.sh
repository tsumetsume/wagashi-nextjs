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
ENV_FILE=".env.local"

# .env.localファイルが存在しない場合は作成
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ .env.localファイルが見つかりません"
    echo "env.exampleをコピーして.env.localを作成してください"
    exit 1
fi

case $DB_TYPE in
    "local")
        echo "ローカルPostgreSQLに切り替えています..."
        
        # USE_LOCAL_DBをtrueに設定
        sed -i 's/USE_LOCAL_DB=false/USE_LOCAL_DB=true/' "$ENV_FILE"
        
        # Supabase URLをコメントアウト（postgres.で始まる行）
        sed -i '/^DATABASE_URL="postgresql:\/\/postgres\./s/^/#/' "$ENV_FILE"
        sed -i '/^DIRECT_URL="postgresql:\/\/postgres\./s/^/#/' "$ENV_FILE"
        
        # ローカルDB用のURLのコメントアウトを解除（wagashi_userで始まる行）
        sed -i '/^#DATABASE_URL="postgresql:\/\/wagashi_user/s/^#//' "$ENV_FILE"
        sed -i '/^#DIRECT_URL="postgresql:\/\/wagashi_user/s/^#//' "$ENV_FILE"
        
        # ローカルDB用のURLが存在しない場合は追加
        if ! grep -q 'postgresql://wagashi_user' "$ENV_FILE"; then
            echo '' >> "$ENV_FILE"
            echo '# ローカルPostgreSQL設定（切り替え時に有効化）' >> "$ENV_FILE"
            echo 'DATABASE_URL="postgresql://wagashi_user:wagashi_password@postgres:5432/wagashi_simulator"' >> "$ENV_FILE"
            echo 'DIRECT_URL="postgresql://wagashi_user:wagashi_password@postgres:5432/wagashi_simulator"' >> "$ENV_FILE"
        fi
        
        echo "✅ ローカルPostgreSQLに切り替えました"
        echo "📝 ライブラリをインストールしてください: docker compose -f compose.local.yml run --rm app pnpm install"
        echo "📝 compose.local.ymlを使用してください: docker compose -f compose.local.yml up"
        ;;
    "supabase")
        echo "Supabaseに切り替えています..."
        
        # USE_LOCAL_DBをfalseに設定
        sed -i 's/USE_LOCAL_DB=true/USE_LOCAL_DB=false/' "$ENV_FILE"
        
        # ローカルDB用のURLをコメントアウト（wagashi_userで始まる行）
        sed -i '/^DATABASE_URL="postgresql:\/\/wagashi_user/s/^/#/' "$ENV_FILE"
        sed -i '/^DIRECT_URL="postgresql:\/\/wagashi_user/s/^/#/' "$ENV_FILE"
        
        # Supabase URLのコメントアウトを解除（postgres.で始まる行）
        sed -i '/^#DATABASE_URL="postgresql:\/\/postgres\./s/^#//' "$ENV_FILE"
        sed -i '/^#DIRECT_URL="postgresql:\/\/postgres\./s/^#//' "$ENV_FILE"
        
        echo "✅ Supabaseに切り替えました"
        echo "📝 ライブラリをインストールしてください: docker compose -f compose.local.yml run --rm app pnpm install"
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
echo "USE_LOCAL_DB: $(grep "^USE_LOCAL_DB=" "$ENV_FILE" | cut -d'=' -f2)"
echo "DATABASE_URL: $(grep "^DATABASE_URL=" "$ENV_FILE" | cut -d'=' -f2 | cut -c1-50)..."

echo ""
echo "次のステップ:"
echo "1. Prismaクライアントを再生成: pnpm db:generate"
echo "2. データベーススキーマを適用: pnpm db:push"
echo "3. 必要に応じてシードデータを投入: pnpm db:seed"