# Sougou Dashboard (sougou-all)

Cloudflare Pages および Workers でデプロイされた自作リポジトリ・デプロイ状況を一元管理するダッシュボードポータル。

## 🔗 デプロイ先
- **Live URL**: [https://sougou-all.pages.dev/](https://sougou-all.pages.dev/)

---

## ✨ 主な機能

- **リポジトリ一元管理**: 
  - パブリック/プライベート（認証時）のリポジトリ情報を GitHub API 経由で取得し表示。
  - 最新のコミット日時や使用言語をタグで色分け表示。
- **インテリジェントなデータフェッチ & フォールバック**:
  - API制限やオフライン時は自動で静的デモデータへフォールバックし、バナー警告を表示する耐障害性設計。
- **フィルタとソート機能**:
  - デプロイ種別（Cloudflare / その他プラットフォーム / 未デプロイツール）やプライベート設定での素早い絞り込み。
  - 最終更新日順、アルファベット順、デプロイ優先でのソート。
- **ピン留め（Pin）機能**:
  - 頻繁にアクセスするリポジトリをグリッド最上部へ固定（`localStorage` にて永続化）。
- **セキュアな GitHub OAuth 認証**:
  - ローカル開発（Vite Dev Proxy）および本番環境（Cloudflare Pages Functions）に最適化されたセキュリティトークン交換方式。
- **人間工学（HCI/エルゴノミクス）UI**:
  - Hick's Law（ヒックの法則）に基づくカテゴリー分類。
  - Fitts's Law（フィッツの法則）に基づく 48px クリックターゲット。
  - 目に優しい流麗なダークモードテーマ。

---

## 🛠 テクノロジースタック

- **コア**: React 19, TypeScript 6, Vite 8
- **スタイリング**: Vanilla CSS (デザインシステム設計)
- **テスト**: Vitest, jsdom, React Testing Library (カバレッジ率 85% 以上)
- **CI/CD**: GitHub Actions (Lint, Type-check, test, deploy 完備)
- **バックエンド/プロキシ**: Cloudflare Pages Functions

---

## 🚀 開発セットアップ

### 1. 依存関係のインストール
```bash
npm install
```

### 2. 環境変数の設定
プロジェクトルートに `.env.local` を作成し、GitHub OAuth アプリケーションの認証情報を設定します。
```env
VITE_GITHUB_CLIENT_ID=あなたのGitHubクライアントID
GITHUB_CLIENT_SECRET=あなたのGitHubクライアントシークレット
```

### 3. ローカル開発サーバー起動
```bash
npm run dev
```

### 4. 静的コード解析（Linter）
```bash
npm run lint
```

### 5. ビルドおよびコンパイルチェック
```bash
npm run build
```

### 6. テスト実行 & カバレッジ確認
```bash
# テストの実行
npm run test

# カバレッジ測定
npm run test:coverage
```
