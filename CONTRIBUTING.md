# 🤝 貢献ガイドライン (CONTRIBUTING)

Sougou Dashboard (`sougou-all`) プロジェクトへの貢献をお考えいただきありがとうございます！  
本ドキュメントは、プロジェクトのセットアップ、コーディング規約、テストの実施方法、およびプルリクエストの作成手順について説明します。

---

## 🛠 開発環境のセットアップ

### 1. 前提要件
* **Node.js**: `v20` 以上を推奨
* **npm**: `v10` 以上を推奨

### 2. 環境構築手順
リポジトリをクローン後、依存パッケージのインストールとローカル環境変数のセットアップを行います。

```bash
# 依存関係のインストール
npm install

# ローカル環境変数ファイルの作成
cp .env.example .env.local  # 存在しない場合は新規作成
```

`.env.local` にご自身の GitHub OAuth 開発用アプリの Client ID および Client Secret を設定してください。
```env
VITE_GITHUB_CLIENT_ID=あなたのGitHubクライアントID
GITHUB_CLIENT_SECRET=あなたのGitHubクライアントシークレット
```

### 3. ローカル開発サーバーの起動
以下のコマンドでローカルサーバーを立ち上げます。
```bash
npm run dev
```
ブラウザで [http://localhost:5173/](http://localhost:5173/) を開いて動作を確認します。

---

## 📐 コーディング規約と検証ツール

本プロジェクトでは、コード品質と型安全性を維持するため、コミット前にローカルでの静的解析およびビルド確認を必須としています。

### 1. 静的コード解析 (Linter)
コードの構文チェックやルール違反の検知には高速な `oxlint` を使用しています。
```bash
npm run lint
```
> [!NOTE]
> React Fast Refresh の動作を最適化するため、コンポーネントファイル (`.tsx`) にフック定義やコンテキストインスタンスを混在させることは避け、それぞれ独立したファイル（`src/hooks/` や `src/context/`）に分離してください。

### 2. コンパイル & ビルドチェック
TypeScript の型エラーおよび Vite のバンドルエラーを検知するため、ビルドチェックを行います。
```bash
npm run build
```

---

## 🧪 テスト方針とカバレッジ

新機能の追加やリファクタリングを行う際は、デグレーションを防ぐために対応するテストコードを必ず追加してください。

### 1. テストの作成ルール
* テストファイルは対象ファイルと同じ階層に、`.test.ts` または `.test.tsx` の拡張子で配置します。
* テストランナーには **Vitest**、DOMシミュレーションには **jsdom** および **React Testing Library** を使用します。

### 2. テストの実行
```bash
# すべてのテストを1回実行
npm run test

# 変更を監視してテストを自動再実行 (ウォッチモード)
npm run test:watch
```

### 3. テストカバレッジの測定
本プロジェクトでは、リファクタリングを安全に行うため、**全体のカバレッジ 80% 以上（特に主要ロジック、カスタムフック、サービス層は 90% 以上）**を目標値として定めています。
```bash
# カバレッジ測定を実行
npm run test:coverage
```

---

## 🌿 Git ワークフロー

### 1. ブランチ命名規則
* 新機能追加: `feature/xxx`
* バグ修正: `bugfix/xxx`
* ドキュメント修正: `docs/xxx`
* リファクタリング: `refactor/xxx`

### 2. コミットメッセージ規約
[Conventional Commits](https://www.conventionalcommits.org/) に準拠したメッセージを心がけてください。
* 例: `feat: add GitLab integration strategy`
* 例: `fix: resolve crash in RepoCard during undefined language`
* 例: `test: add unit tests for LoginScreen`

### 3. プルリクエスト (PR) と CI/CD
1. ローカルで `npm run lint`、`npm run build`、`npm run test` がすべてエラーなしで通過することを確認します。
2. ブランチを GitHub にプッシュし、PR を作成します。
3. GitHub Actions により、**CI（Continuous Integration）** ワークフロー (`ci.yml`) が自動起動し、Lint・ビルド・テストカバレッジの自動チェックが走ります。
4. PR がマージされ、`main`（または `master`）ブランチにコードが取り込まれると、**自動デプロイワークフロー** (`deploy.yml`) が作動し、Cloudflare Pages へ最新コードが自動リリースされます。
