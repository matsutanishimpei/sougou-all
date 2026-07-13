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
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useRepositoryManager } from '../hooks/useRepositoryManager';
import RepoCard from './RepoCard';
import type { FilterType, SortType } from '../types';

// ── Component ───────────────────────────────────────────────────────

export default function Dashboard() {
  const { user, logout, isAuthenticated } = useAuth();
  const defaultUser = import.meta.env.VITE_DEFAULT_GITHUB_USER || 'matsutanishimpei';

  const {
    repos,
    isLoadingRepos,
    dataSource,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    sortBy,
    setSortBy,
    pinnedRepos,
    handleTogglePin,
    handleResetFilters,
    filterCounts,
    stats,
    sortedAndFilteredRepos,
    pinnedList,
    chunkedGroups,
  } = useRepositoryManager();

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

  return (
    <div className="dashboard-container">
      <div className="dashboard-layout">
        
        {/* ── Sidebar Pane (Primary Control Zone, Gutenberg Top-Left) ── */}
        <aside className="dashboard-sidebar">
          
          {/* User profile details */}
          <div className="profile-area">
            <div className="avatar-wrapper">
              <img
                src={user?.photoURL || `https://github.com/${defaultUser}.png`}
                alt={user?.displayName || defaultUser}
                className="profile-avatar"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    `https://github.com/identicons/${defaultUser}.png`;
                }}
              />
              <span className="status-indicator" />
            </div>
            <div className="profile-info">
              <div className="username-wrapper">
                <h1>{user?.displayName || defaultUser}</h1>
                {isAuthenticated && <Lock size={12} style={{ color: 'var(--private-color)', marginLeft: '4px' }} />}
              </div>
              <div className="profile-actions">
                <a
                  href={`https://github.com/${defaultUser}`}
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

          {/* Fallback Warning Banner if static data is being displayed */}
          {dataSource === 'static_fallback' && (
            <div className="fallback-banner" role="alert">
              <AlertTriangle className="fallback-banner-icon" size={16} />
              <div className="fallback-banner-text">
                <strong>静的デモデータ表示中:</strong> GitHub APIの取得制限に達したか、オフラインのためデモデータを表示しています。
                {!isAuthenticated && ' サインインするとプライベートリポジトリを含めたリアルタイムなデータを表示できます。'}
              </div>
            </div>
          )}

          {/* Filter Status Alert summary banner */}
          {(activeFilter !== 'all' || searchQuery) && (
            <div className="filter-summary">
              <p>
                フィルター: <strong>{getFilterLabel(activeFilter)}</strong>
                {searchQuery && (
                  <> &bull; 検索: &quot;<strong>{searchQuery}</strong>&quot;</>
                )}
                {' '}({sortedAndFilteredRepos.length} / {repos.length} 件を表示)
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
