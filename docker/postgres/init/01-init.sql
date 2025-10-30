-- PostgreSQL初期化スクリプト
-- データベースとユーザーは環境変数で作成されるため、追加の設定のみ記述

-- 必要に応じて拡張機能を有効化
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- データベースの文字エンコーディングを確認
SELECT current_setting('server_encoding');

-- タイムゾーンを設定
SET timezone = 'Asia/Tokyo';

-- ログ出力
\echo 'PostgreSQL database initialized successfully'