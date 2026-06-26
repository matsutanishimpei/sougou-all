/**
 * Dashboard - Main repository hub.
 *
 * Features:
 *  - Fetches latest public repos from GitHub API (with static fallback)
 *  - Merges in private repos when authenticated
 *  - Stats cards with click-to-filter
 *  - Search, sort, and filter controls
 *  - Filter summary bar
 *  - Responsive grid layout
 *  - User profile header with logout
 */
import { useState, useEffect, useMemo } from 'react';
import {
  Search,
  X,
  GitBranch,
  Cloud,
  Globe,
  Laptop,
  Lock,
  LogOut,
  SortDesc,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PUBLIC_REPO_DATA } from '../data/publicRepos';
import { PRIVATE_REPO_DATA } from '../data/privateRepos';
import RepoCard from './RepoCard';
import type { Repository, FilterType, SortType } from '../types';

// ── GitHub API fetch helper ─────────────────────────────────────────

async function fetchRepos(token?: string | null): Promise<Repository[]> {
  const url = token
    ? 'https://api.github.com/user/repos?per_page=100&affiliation=owner,collaborator'
    : 'https://api.github.com/users/matsutanishimpei/repos?per_page=100';

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  const raw: any[] = await res.json();

  return raw.map((r) => {
    const homepage: string = r.homepage || '';
    let deploy_type: Repository['deploy_type'] = 'none';
    if (homepage) {
      deploy_type =
        homepage.includes('workers.dev') || homepage.includes('pages.dev')
          ? 'cloudflare'
          : 'other';
    }
    return {
      name: r.name,
      description: r.description || '説明なし',
      html_url: r.html_url,
      homepage,
      language: r.language || 'N/A',
      updated_at: r.updated_at ? r.updated_at.substring(0, 10) : '',
      deploy_type,
      release_url: '',
      release_tag: '',
      open_issues_count: r.open_issues_count || 0,
      visibility: r.private ? ('private' as const) : ('public' as const),
    };
  });
}

// ── Component ───────────────────────────────────────────────────────

export default function Dashboard() {
  const { user, logout, isAuthenticated, accessToken } = useAuth();

  // Repository state
  const [repos, setRepos] = useState<Repository[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(true);

  // Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('updated');

  // Fetch live data on mount / auth state change
  useEffect(() => {
    setIsLoadingRepos(true);
    fetchRepos(accessToken)
      .then((data) => {
        setRepos(data);
        setIsLoadingRepos(false);
      })
      .catch((err) => {
        console.warn('GitHub API fetch failed, using static fallback:', err);
        const fallback = isAuthenticated
          ? [...PUBLIC_REPO_DATA, ...PRIVATE_REPO_DATA]
          : PUBLIC_REPO_DATA;
        setRepos(fallback);
        setIsLoadingRepos(false);
      });
  }, [accessToken, isAuthenticated]);

  const allRepos = repos;


  // ── Stats ──
  const stats = useMemo(() => {
    const total = allRepos.length;
    const cloudflare = allRepos.filter((r) => r.deploy_type === 'cloudflare').length;
    const other = allRepos.filter((r) => r.deploy_type === 'other').length;
    const privateCount = allRepos.filter((r) => r.visibility === 'private').length;
    const languages = new Set<string>();
    allRepos.forEach((r) => {
      if (r.language && r.language !== 'N/A' && r.language !== 'null') {
        languages.add(r.language);
      }
    });
    return { total, cloudflare, other, privateCount, languagesCount: languages.size };
  }, [allRepos]);

  // ── Filter + Sort ──
  const filteredRepos = useMemo(() => {
    let result = allRepos.filter((repo) => {
      // Category filter
      if (activeFilter === 'private') {
        if (repo.visibility !== 'private') return false;
      } else if (activeFilter !== 'all') {
        if (repo.deploy_type !== activeFilter) return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          repo.name.toLowerCase().includes(q) ||
          repo.description.toLowerCase().includes(q) ||
          (repo.language && repo.language.toLowerCase().includes(q))
        );
      }
      return true;
    });

    result.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'deploy') {
        const order = { cloudflare: 0, other: 1, none: 2 };
        const diff = order[a.deploy_type] - order[b.deploy_type];
        if (diff !== 0) return diff;
      }
      // Default: newest first
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

    return result;
  }, [allRepos, activeFilter, searchQuery, sortBy]);

  const getFilterName = (f: FilterType): string => {
    const names: Record<FilterType, string> = {
      all: 'すべて',
      cloudflare: 'Cloudflare デプロイ済',
      other: 'その他デプロイ済',
      none: '未デプロイ・ツール',
      private: 'プライベート',
    };
    return names[f];
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveFilter('all');
  };

  // ── Render ──
  return (
    <div className="dashboard-container">
      {/* ── Header ── */}
      <header className="dashboard-header">
        <div className="profile-area">
          <div className="avatar-wrapper">
            <img
              src={user?.photoURL || 'https://github.com/matsutanishimpei.png'}
              alt={user?.displayName || 'matsutanishimpei'}
              className="profile-avatar"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://github.com/identicons/matsutanishimpei.png';
              }}
            />
            <span className="status-indicator" />
          </div>
          <div className="profile-info">
            <div className="username-wrapper">
              <h1>{user?.displayName || 'matsutanishimpei'}</h1>
              <span className="verified-badge">✓ Developer</span>
              {isAuthenticated && (
                <span className="auth-badge">
                  <Lock size={11} /> Authenticated
                </span>
              )}
            </div>
            <p className="subtitle">Cloudflare Pages / Workers &amp; Web App Hub</p>
            <div className="profile-links">
              <a
                href="https://github.com/matsutanishimpei"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
                github.com/matsutanishimpei
              </a>
              {isAuthenticated && (
                <button onClick={logout} className="social-link logout-btn" type="button">
                  <LogOut size={14} /> ログアウト
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Stats ── */}
      <section className="stats-section" aria-label="Statistics">
        <div className="stat-card" onClick={() => setActiveFilter('all')}>
          <div className="stat-icon"><GitBranch size={22} /></div>
          <div className="stat-content">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Repositories</span>
          </div>
        </div>
        <div className="stat-card" onClick={() => setActiveFilter('cloudflare')}>
          <div className="stat-icon cloudflare-color"><Cloud size={22} /></div>
          <div className="stat-content">
            <span className="stat-value">{stats.cloudflare}</span>
            <span className="stat-label">Cloudflare Deployed</span>
          </div>
        </div>
        <div className="stat-card" onClick={() => setActiveFilter('other')}>
          <div className="stat-icon other-color"><Globe size={22} /></div>
          <div className="stat-content">
            <span className="stat-value">{stats.other}</span>
            <span className="stat-label">Other Deploys</span>
          </div>
        </div>
        {isAuthenticated && (
          <div className="stat-card" onClick={() => setActiveFilter('private')}>
            <div className="stat-icon private-color"><Lock size={22} /></div>
            <div className="stat-content">
              <span className="stat-value">{stats.privateCount}</span>
              <span className="stat-label">Private Repos</span>
            </div>
          </div>
        )}
        <div className="stat-card">
          <div className="stat-icon lang-color"><Laptop size={22} /></div>
          <div className="stat-content">
            <span className="stat-value">{stats.languagesCount}</span>
            <span className="stat-label">Languages Used</span>
          </div>
        </div>
      </section>

      {/* ── Controls ── */}
      <section className="controls-section" aria-label="Search and Filters">
        <div className="search-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="リポジトリ名、言語、説明で検索..."
            aria-label="Search Repositories"
            id="search-input"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="clear-btn" aria-label="Clear Search" type="button">
              <X size={14} />
            </button>
          )}
        </div>

        {activeFilter === 'all' && (
          <div className="sort-wrapper">
            <SortDesc size={14} />
            <span className="sort-label">並べ替え:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortType)}
              className="sort-select"
            >
              <option value="updated">更新順 (新しい順)</option>
              <option value="name">名前順 (A-Z)</option>
              <option value="deploy">デプロイ優先</option>
            </select>
          </div>
        )}

        <div className="filter-wrapper">
          {(['all', 'cloudflare', 'other', 'none'] as FilterType[]).map((f) => (
            <button
              key={f}
              className={`filter-btn ${activeFilter === f ? 'active' : ''}`}
              onClick={() => setActiveFilter(f)}
              type="button"
            >
              {f === 'all' ? 'All' : f === 'cloudflare' ? 'Cloudflare' : f === 'other' ? 'Other' : 'None'}
            </button>
          ))}
          {isAuthenticated && (
            <button
              className={`filter-btn filter-btn--private ${activeFilter === 'private' ? 'active' : ''}`}
              onClick={() => setActiveFilter('private')}
              type="button"
            >
              <Lock size={12} /> Private
            </button>
          )}
        </div>
      </section>

      {/* ── Filter Summary ── */}
      {(activeFilter !== 'all' || searchQuery) && (
        <div className="filter-summary">
          <p className="summary-text">
            フィルター: <strong>{getFilterName(activeFilter)}</strong>
            {searchQuery && (
              <> &bull; 検索ワード: &quot;<strong>{searchQuery}</strong>&quot;</>
            )}
            {' '}({filteredRepos.length} / {allRepos.length} 件を表示中)
          </p>
          <button onClick={handleResetFilters} className="reset-btn" type="button">
            リセット
          </button>
        </div>
      )}

      {/* ── Repository Grid ── */}
      <section className="repos-grid" aria-label="Repositories">
        {isLoadingRepos ? (
          <div className="empty-state">
            <Loader2 className="repo-loading-spinner" size={48} />
            <p>GitHubからデータを読み込んでいます...</p>
          </div>
        ) : filteredRepos.length === 0 ? (
          <div className="empty-state">
            <Search size={48} />
            <h3>リポジトリが見つかりません</h3>
            <p>検索条件やフィルターを変更して再度お試しください。</p>
          </div>
        ) : (
          filteredRepos.map((repo) => <RepoCard key={repo.name} repo={repo} />)
        )}
      </section>
    </div>
  );
}
