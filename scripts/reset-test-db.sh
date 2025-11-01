#!/bin/bash

# テスト用データベースリセットスクリプト
echo "🔄 テスト用データベースをリセットしています..."

# データベースをリセット
docker compose -f compose.local.yml run app pnpm db:push --force-reset

# 固定IDでシードデータを投入
docker compose -f compose.local.yml run app pnpm db:seed

echo "✅ テスト用データベースのリセットが完了しました"
echo "📋 固定ID情報:"
echo "  店舗ID: test-store-001 (新宿店)"
echo "  商品ID: test-product-001 (桜餅)"
echo "  商品ID: test-product-002 (どら焼き)"