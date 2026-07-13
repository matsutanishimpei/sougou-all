# Sougou Dashboard (sougou-all)

Cloudflare Pages / Workers にデプロイされた自作リポジトリの稼働状況や、GitHub の公開・非公開プロジェクトを一元的に閲覧できるポートフォリオ・ダッシュボードポータル。

## 🔗 公開 URL
- **Live URL**: [https://sougou-all.pages.dev/](https://sougou-all.pages.dev/)

---

## 📖 ご利用ガイド (一般ユーザー向け)

本ダッシュボードは、一般公開されているパブリックリポジトリやデプロイ先を自由に閲覧できるほか、アカウント認証によって非公開プロジェクトも含めて一元管理できるパーソナルポータルです。

### 1. 閲覧モードについて
* **一般ゲストモード（未サインイン）**:
  - `browser-sensors` や `family-shopper` などのパブリック（一般公開）リポジトリおよびそのデプロイ状況をすべて閲覧できます。
  - 各カードの **「Visit Site」** から実際の稼働デモサイトへ、**「View Code」** から GitHub のソースコードへ直接アクセスできます。
* **管理者・開発者認証モード（GitHub サインイン）**:
  - 画面左下の「GitHubでサインイン」から連携ログインすると、ログインユーザーが所有・コラボレートしている**非公開（プライベート）リポジトリ**もリストに自動追加されます。

### 2. 便利機能の使い方
* **リポジトリの検索**:
  - 左メニューの検索ボックスから「TypeScript」「Rust」などの言語名や、キーワードを入力するだけでリアルタイムに絞り込めます。
* **カテゴリー分類によるフィルタ**:
  - `Cloudflare`（Pages/Workersへのデプロイ）、`他デプロイ`（GitHub Pagesなど）、`ツール他`（ライブラリや未デプロイのリポジトリ）など、目的のプラットフォームごとにワンクリックで分類できます。
* **ピン留め機能 (Pin)**:
  - 各リポジトリカードの右上にある **「ピン留め（ピンマーク）」** をクリックすると、最上部の専用セクションに固定表示されます。よく閲覧するサイトのブックマークとして便利です（ブラウザの LocalStorage に保存されます）。

### 3. カードバッジの意味
各リポジトリカードの上部には、以下の状況を示すバッジが表示されます。
* <span style="color: #f97316;">◆ Cloudflare</span>: Cloudflare Pages または Workers にホストされた Web サービス。
* <span style="color: #06b6d4;">◆ Deployed</span>: GitHub Pages やその他のホスティングにデプロイされた Web サービス。
* <span style="color: #64748b;">◆ Repository</span>: デプロイされていないパッケージ、ライブラリ、またはコマンドラインツール。
* <span style="color: #f59e0b;">🔒 Private</span>: 非公開（認証中のみ表示されるプロジェクト）。

---

## 🛠 開発者向けセットアップ / Contribution

本プロジェクトのローカル開発、テスト、およびデプロイ設計に関する情報です。

### 1. ローカル開発環境の起動
```bash
# 依存関係のインストール
npm install

# ローカル開発サーバー起動
npm run dev
```

### 2. 環境変数の設定 (`.env.local`)
開発用の認証情報およびデフォルトのターゲットユーザーを設定するため、ルートディレクトリに以下を作成します。
```env
VITE_GITHUB_CLIENT_ID=あなたのGitHubクライアントID
GITHUB_CLIENT_SECRET=あなたのGitHubクライアントシークレット

# ゲストモードで表示するデフォルトの GitHub ユーザー名（任意）
VITE_DEFAULT_GITHUB_USER=matsutanishimpei
```


### 3. 検証コマンド
```bash
# 静的コード解析 (Linter)
npm run lint

# ビルド・タイプチェック
npm run build

# テスト実行 & カバレッジ測定
npm run test
npm run test:coverage
```

### 4. CI/CD および自動デプロイ
* **CI (GitHub Actions)**: すべてのプッシュ・PR で `Lint` -> `Build` -> `Vitest` が自動実行されます。
* **CD (Cloudflare Pages)**: `main` ブランチへのプッシュで自動的に本番ビルドが行われ、[https://sougou-all.pages.dev/](https://sougou-all.pages.dev/) へ自動デプロイされます。
* テスト設計やアーキテクチャの詳細は [CONTRIBUTING.md](file:///d:/dev/sougou-all/CONTRIBUTING.md) および [distribution.md](file:///d:/dev/sougou-all/distribution.md) を参照してください。
