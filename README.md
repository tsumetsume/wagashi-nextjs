## 環境構築手順

1. **Dockerイメージのビルド**  
    以下のコマンドを実行して、Dockerイメージをビルドします:
    ```bash
    docker compose build
    ```

2. **依存関係のインストール**  
    ビルド後、以下のコマンドを実行して依存関係をインストールします:
    ```bash
    docker compose run --rm app pnpm install
    ```

3. **コンテナの起動**  
    環境を起動するには、以下のコマンドを実行します:
    ```bash
    docker compose up
    ```

以上で環境構築が完了します。