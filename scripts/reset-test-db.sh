#!/bin/bash

# テスト用データベースリセットスクリプト
echo "🔄 テスト用データベースをリセットしています..."

# Docker内で実行されているかチェック
if [ -f /.dockerenv ]; then
    echo "📦 Docker環境で実行中..."
    # Docker内では直接コマンドを実行
    pnpm db:push --force-reset
    pnpm db:seed
else
    echo "🖥️  ローカル環境で実行中..."
    # ローカル環境ではDocker Composeを使用
    docker compose -f compose.local.yml run app pnpm db:push --force-reset
    docker compose -f compose.local.yml run app pnpm db:seed
fi

echo "✅ テスト用データベースのリセットが完了しました"
echo "📋 固定ID情報:"
echo "  店舗ID: test-store-001 (新宿店)"
echo "  商品ID: test-product-001 (桜餅)"
echo "  商品ID: test-product-002 (どら焼き)"