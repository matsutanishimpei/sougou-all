/**
 * LoginScreen - Premium GitHub Sign-In page.
 *
 * Features:
 *  - Glassmorphism card with animated gradient background
 *  - GitHub-branded sign-in button
 *  - Loading spinner during simulated auth
 *  - Fully responsive
 */
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function LoginScreen() {
  const { loginWithGitHub, isLoading } = useAuth();

  return (
    <div className="login-page">
      {/* Animated background orbs */}
      <div className="login-bg-orb login-bg-orb--1" />
      <div className="login-bg-orb login-bg-orb--2" />
      <div className="login-bg-orb login-bg-orb--3" />

      <div className="login-card">
        {/* Logo / Branding */}
        <div className="login-logo">
          <div className="login-logo-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
          </div>
          <h1 className="login-title">Sougou Dashboard</h1>
          <p className="login-subtitle">
            リポジトリ・デプロイ状況を一元管理
          </p>
        </div>

        {/* Divider */}
        <div className="login-divider" />

        {/* Sign-in section */}
        <div className="login-action">
          <p className="login-prompt">
            GitHubアカウントでサインインすると、<br />
            <span className="login-highlight">プライベートリポジトリ</span>も表示されます。
          </p>

          <button
            className="login-github-btn"
            onClick={loginWithGitHub}
            disabled={isLoading}
            type="button"
          >
            {isLoading ? (
              <Loader2 className="login-spinner" size={20} />
            ) : (
              <svg className="login-github-icon" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
            )}
            <span>
              {isLoading ? 'サインイン中...' : 'GitHubでサインイン'}
            </span>
          </button>
        </div>

        {/* Footer */}
        <p className="login-footer">
          © 2026 matsutanishimpei — Cloudflare Pages / Workers Hub
        </p>
      </div>
    </div>
  );
}
