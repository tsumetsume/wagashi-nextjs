#!/bin/bash

# Docker環境でのE2Eテスト実行スクリプト

echo "🐳 Docker環境でE2Eテストを実行します..."

# 開発サーバーがバックグラウンドで起動していることを確認
echo "📡 開発サーバーの起動を確認中..."
if ! curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "⚠️  開発サーバーが起動していません。バックグラウンドで起動します..."
    pnpm dev &
    DEV_SERVER_PID=$!
    
    # サーバーの起動を待機
    echo "⏳ サーバーの起動を待機中..."
    for i in {1..30}; do
        if curl -f http://localhost:3000 > /dev/null 2>&1; then
            echo "✅ 開発サーバーが起動しました"
            break
        fi
        echo "   待機中... ($i/30)"
        sleep 2
    done
    
    if ! curl -f http://localhost:3000 > /dev/null 2>&1; then
        echo "❌ 開発サーバーの起動に失敗しました"
        exit 1
    fi
else
    echo "✅ 開発サーバーは既に起動しています"
fi

# データベースのリセット
echo "🔄 テスト用データベースをリセット中..."
pnpm db:push --force-reset
pnpm db:seed

# Playwrightブラウザの確認
echo "🌐 Playwrightブラウザの確認中..."
pnpm exec playwright install --with-deps chromium

# E2Eテストの実行
echo "🧪 E2Eテストを実行中..."
PLAYWRIGHT_BASE_URL=http://localhost:3000 pnpm exec playwright test --config=playwright.docker.config.ts

TEST_EXIT_CODE=$?

# バックグラウンドで起動したサーバーを終了
if [ ! -z "$DEV_SERVER_PID" ]; then
    echo "🛑 開発サーバーを終了中..."
    kill $DEV_SERVER_PID 2>/dev/null || true
fi

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "✅ すべてのテストが成功しました"
else
    echo "❌ テストが失敗しました (終了コード: $TEST_EXIT_CODE)"
fi

exit $TEST_EXIT_CODE