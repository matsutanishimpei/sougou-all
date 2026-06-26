/**
 * Private repository data.
 *
 * These repos are only displayed after the user successfully authenticates
 * with a Google account. In a production setup, this data would come from
 * the GitHub API using an authenticated token (scope: repo).
 *
 * To add / remove private repos, edit the array below.
 */
import type { Repository } from '../types';

export const PRIVATE_REPO_DATA: Repository[] = [
  {
    name: "internal-admin-panel",
    description: "内部管理者用ダッシュボード。ユーザー管理、アクセスログ閲覧、システム設定を一元管理するフルスタックアプリケーション。",
    html_url: "https://github.com/matsutanishimpei/internal-admin-panel",
    homepage: "https://admin.dear-old-days.workers.dev/",
    language: "TypeScript",
    updated_at: "2026-06-20",
    deploy_type: "cloudflare",
    release_url: "",
    release_tag: "",
    open_issues_count: 2,
    visibility: "private",
  },
  {
    name: "grade-analytics",
    description: "学生成績のリアルタイム分析・可視化ツール。クラス全体の傾向分析、個別フィードバック生成、成績推移グラフを提供。D1 + Hono で構築。",
    html_url: "https://github.com/matsutanishimpei/grade-analytics",
    homepage: "https://grade-analytics.pages.dev/",
    language: "TypeScript",
    updated_at: "2026-06-18",
    deploy_type: "cloudflare",
    release_url: "",
    release_tag: "",
    open_issues_count: 1,
    visibility: "private",
  },
  {
    name: "ai-curriculum-engine",
    description: "LLMを活用したカリキュラム自動生成エンジン。学習目標と前提知識を入力すると、最適な授業計画・演習問題をAIが設計。",
    html_url: "https://github.com/matsutanishimpei/ai-curriculum-engine",
    homepage: "",
    language: "Python",
    updated_at: "2026-06-12",
    deploy_type: "none",
    release_url: "",
    release_tag: "",
    open_issues_count: 5,
    visibility: "private",
  },
  {
    name: "student-portfolio-builder",
    description: "学生がドラッグ&ドロップで自分のポートフォリオサイトを構築できるノーコードツール。テンプレート選択、プロジェクト追加、PDF出力に対応。",
    html_url: "https://github.com/matsutanishimpei/student-portfolio-builder",
    homepage: "https://portfolio-builder.pages.dev/",
    language: "TypeScript",
    updated_at: "2026-05-28",
    deploy_type: "cloudflare",
    release_url: "",
    release_tag: "",
    open_issues_count: 0,
    visibility: "private",
  },
  {
    name: "infra-monitor",
    description: "Cloudflare Workers / Pages の稼働状況をリアルタイム監視するダッシュボード。アラート通知、レスポンスタイム計測、デプロイ履歴追跡。",
    html_url: "https://github.com/matsutanishimpei/infra-monitor",
    homepage: "",
    language: "Rust",
    updated_at: "2026-05-15",
    deploy_type: "none",
    release_url: "https://github.com/matsutanishimpei/infra-monitor/releases/tag/v0.9.0",
    release_tag: "v0.9.0",
    open_issues_count: 3,
    visibility: "private",
  },
];
