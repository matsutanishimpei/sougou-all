/**
 * Dashboard - Main repository hub redesigned using ergonomics and HCI principles.
 * 
 * Ergonomic features:
 *  - Dual-pane layout: Navigation/Controls on the Left (reading gravity entry), Content on the Right.
 *  - Fitts's Law compliant click targets: Minimum 48px height for all control elements.
 *  - Feedforward badges: Showing item counts in each filter before user clicks.
 *  - Cognitive chunking: Repositories are grouped by deployment category under clear headers.
 *  - Direct visual indicators for status and profile.
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
  Loader2,
  Folder,
  Pin,
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

  // Pinned repositories state
  const [pinnedRepos, setPinnedRepos] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('pinned_repos') || '[]');
    } catch {
      return [];
    }
  });

  // Persist pinned repos to localStorage
  useEffect(() => {
    localStorage.setItem('pinned_repos', JSON.stringify(pinnedRepos));
  }, [pinnedRepos]);

  const handleTogglePin = (name: string) => {
    setPinnedRepos((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

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

  // ── Feedforward Counts for Filter Sidebar ──
  const filterCounts = useMemo(() => {
    const counts = {
      all: allRepos.length,
      cloudflare: allRepos.filter((r) => r.deploy_type === 'cloudflare').length,
      other: allRepos.filter((r) => r.deploy_type === 'other').length,
      none: allRepos.filter((r) => r.deploy_type === 'none').length,
      private: allRepos.filter((r) => r.visibility === 'private').length,
    };
    return counts;
  }, [allRepos]);

  // ── Stats Summary Metrics ──
  const stats = useMemo(() => {
    const total = allRepos.length;
    const cloudflare = filterCounts.cloudflare;
    const other = filterCounts.other;
    const privateCount = filterCounts.private;
    const languages = new Set<string>();
    allRepos.forEach((r) => {
      if (r.language && r.language !== 'N/A' && r.language !== 'null') {
        languages.add(r.language);
      }
    });
    return { total, cloudflare, other, privateCount, languagesCount: languages.size };
  }, [allRepos, filterCounts]);

  // ── Filter + Sort ──
  const sortedAndFilteredRepos = useMemo(() => {
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

  const pinnedList = useMemo(() => {
    return sortedAndFilteredRepos.filter((repo) => pinnedRepos.includes(repo.name));
  }, [sortedAndFilteredRepos, pinnedRepos]);

  // ── Cognitive Chunking Groups ──
  const chunkedGroups = useMemo(() => {
    const groups = {
      cloudflare: [] as Repository[],
      other: [] as Repository[],
      none: [] as Repository[],
    };

    // Filter out pinned ones so they only show in the Pinned section
    const nonPinned = sortedAndFilteredRepos.filter((repo) => !pinnedRepos.includes(repo.name));

    nonPinned.forEach((repo) => {
      if (repo.deploy_type === 'cloudflare') {
        groups.cloudflare.push(repo);
      } else if (repo.deploy_type === 'other') {
        groups.other.push(repo);
      } else {
        groups.none.push(repo);
      }
    });

    return groups;
  }, [sortedAndFilteredRepos, pinnedRepos]);

  const getFilterLabel = (f: FilterType): string => {
    const names: Record<FilterType, string> = {
      all: 'すべて',
      cloudflare: 'Cloudflare',
      other: '他デプロイ',
      none: 'ツール他',
      private: '非公開',
    };
    return names[f];
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveFilter('all');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-layout">
        
        {/* ── Sidebar Pane (Primary Control Zone, Gutenberg Top-Left) ── */}
        <aside className="dashboard-sidebar">
          
          {/* User profile details */}
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
                {isAuthenticated && <Lock size={12} style={{ color: 'var(--private-color)', marginLeft: '4px' }} />}
              </div>
              <div className="profile-actions">
                <a
                  href="https://github.com/matsutanishimpei"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="profile-action-link"
                >
                  GitHub
                </a>
                {isAuthenticated && (
                  <button onClick={logout} className="profile-action-link logout-btn" type="button">
                    ログアウト
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Controls: Search */}
          <div className="sidebar-section">
            <h2 className="sidebar-section-title">リポジトリ検索</h2>
            <div className="search-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="名称や言語で検索..."
                aria-label="Search Repositories"
                id="search-input"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="clear-btn" aria-label="Clear Search" type="button">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Controls: Category Filter (Hick's Law / Fitts's Law 48px) */}
          <div className="sidebar-section">
            <h2 className="sidebar-section-title">カテゴリー</h2>
            <nav className="sidebar-filter-list" aria-label="Repository categories">
              {(['all', 'cloudflare', 'other', 'none'] as FilterType[]).map((f) => (
                <button
                  key={f}
                  className={`sidebar-filter-btn ${activeFilter === f ? 'active' : ''}`}
                  onClick={() => setActiveFilter(f)}
                  type="button"
                >
                  <span className="filter-label-text">{getFilterLabel(f)}</span>
                  <span className="filter-count-badge">{filterCounts[f]}</span>
                </button>
              ))}
              {isAuthenticated && (
                <button
                  className={`sidebar-filter-btn sidebar-filter-btn--private ${activeFilter === 'private' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('private')}
                  type="button"
                >
                  <span className="filter-label-text">{getFilterLabel('private')}</span>
                  <span className="filter-count-badge">{filterCounts.private}</span>
                </button>
              )}
            </nav>
          </div>

          {/* Controls: Sort Dropdown */}
          <div className="sidebar-section">
            <h2 className="sidebar-section-title">並べ替え</h2>
            <div className="sort-select-wrapper">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortType)}
                className="sort-select"
                aria-label="Sort repositories"
              >
                <option value="updated">最終更新順</option>
                <option value="name">アルファベット順</option>
                <option value="deploy">デプロイ優先</option>
              </select>
            </div>
          </div>

        </aside>

        {/* ── Content Pane (Gutenberg Center / Right Panel) ── */}
        <main className="dashboard-content">
          
          {/* Quick Metrics Strip */}
          <section className="metrics-strip" aria-label="Quick metrics">
            <div className="metric-card">
              <div className="metric-icon-box total"><GitBranch size={20} /></div>
              <div className="metric-details">
                <span className="metric-value">{stats.total}</span>
                <span className="metric-title">全リポジトリ</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon-box cloudflare"><Cloud size={20} /></div>
              <div className="metric-details">
                <span className="metric-value">{stats.cloudflare}</span>
                <span className="metric-title">Cloudflare</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon-box other"><Globe size={20} /></div>
              <div className="metric-details">
                <span className="metric-value">{stats.other}</span>
                <span className="metric-title">他デプロイ</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon-box languages"><Laptop size={20} /></div>
              <div className="metric-details">
                <span className="metric-value">{stats.languagesCount}</span>
                <span className="metric-title">使用言語</span>
              </div>
            </div>
          </section>

          {/* Filter Status Alert summary banner */}
          {(activeFilter !== 'all' || searchQuery) && (
            <div className="filter-summary">
              <p>
                フィルター: <strong>{getFilterLabel(activeFilter)}</strong>
                {searchQuery && (
                  <> &bull; 検索: &quot;<strong>{searchQuery}</strong>&quot;</>
                )}
                {' '}({sortedAndFilteredRepos.length} / {allRepos.length} 件を表示)
              </p>
              <button onClick={handleResetFilters} className="reset-btn" type="button">
                すべてリセット
              </button>
            </div>
          )}

          {/* Grid display with loading, empty state, or cognitive chunking */}
          {isLoadingRepos ? (
            <div className="empty-state">
              <Loader2 className="repo-loading-spinner" size={48} />
              <p>GitHubからデータを読み込んでいます...</p>
            </div>
          ) : sortedAndFilteredRepos.length === 0 ? (
            <div className="empty-state">
              <Search size={48} />
              <h3>リポジトリが見つかりません</h3>
              <p>検索条件やフィルターを変更して再度お試しください。</p>
            </div>
          ) : (
            <>
              {/* Cognitive Chunking Groups: display folders under separated visual sections if 'all' filter is active */}
              {activeFilter === 'all' ? (
                <>
                  {pinnedList.length > 0 && (
                    <section className="chunk-section">
                      <div className="chunk-header">
                        <h3 className="chunk-title"><Pin size={18} fill="currentColor" /> ピン留め済</h3>
                        <span className="chunk-badge">{pinnedList.length}件</span>
                      </div>
                      <div className="repos-grid">
                        {pinnedList.map((repo) => (
                          <RepoCard
                            key={repo.name}
                            repo={repo}
                            isPinned={true}
                            onTogglePin={() => handleTogglePin(repo.name)}
                          />
                        ))}
                      </div>
                    </section>
                  )}

                  {chunkedGroups.cloudflare.length > 0 && (
                    <section className="chunk-section">
                      <div className="chunk-header">
                        <h3 className="chunk-title"><Cloud size={18} /> Cloudflare デプロイ済</h3>
                        <span className="chunk-badge">{chunkedGroups.cloudflare.length}件</span>
                      </div>
                      <div className="repos-grid">
                        {chunkedGroups.cloudflare.map((repo) => (
                          <RepoCard
                            key={repo.name}
                            repo={repo}
                            isPinned={false}
                            onTogglePin={() => handleTogglePin(repo.name)}
                          />
                        ))}
                      </div>
                    </section>
                  )}

                  {chunkedGroups.other.length > 0 && (
                    <section className="chunk-section">
                      <div className="chunk-header">
                        <h3 className="chunk-title"><Globe size={18} /> その他プラットフォーム デプロイ済</h3>
                        <span className="chunk-badge">{chunkedGroups.other.length}件</span>
                      </div>
                      <div className="repos-grid">
                        {chunkedGroups.other.map((repo) => (
                          <RepoCard
                            key={repo.name}
                            repo={repo}
                            isPinned={false}
                            onTogglePin={() => handleTogglePin(repo.name)}
                          />
                        ))}
                      </div>
                    </section>
                  )}

                  {chunkedGroups.none.length > 0 && (
                    <section className="chunk-section">
                      <div className="chunk-header">
                        <h3 className="chunk-title"><Folder size={18} /> 開発ツール / 未デプロイ</h3>
                        <span className="chunk-badge">{chunkedGroups.none.length}件</span>
                      </div>
                      <div className="repos-grid">
                        {chunkedGroups.none.map((repo) => (
                          <RepoCard
                            key={repo.name}
                            repo={repo}
                            isPinned={false}
                            onTogglePin={() => handleTogglePin(repo.name)}
                          />
                        ))}
                      </div>
                    </section>
                  )}
                </>
              ) : (
                /* Flat grid when specific filter is active, keeping target focus */
                <section className="repos-grid">
                  {sortedAndFilteredRepos.map((repo) => (
                    <RepoCard
                      key={repo.name}
                      repo={repo}
                      isPinned={pinnedRepos.includes(repo.name)}
                      onTogglePin={() => handleTogglePin(repo.name)}
                    />
                  ))}
                </section>
              )}
            </>
          )}

        </main>
      </div>
    </div>
  );
}
