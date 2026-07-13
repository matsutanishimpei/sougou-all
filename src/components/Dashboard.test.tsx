import { render, screen, fireEvent } from '@testing-library/react';
import Dashboard from './Dashboard';
import { useRepositoryManager } from '../hooks/useRepositoryManager';
import { useAuth } from '../hooks/useAuth';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Repository } from '../types';

vi.mock('../hooks/useRepositoryManager', () => ({
  useRepositoryManager: vi.fn(),
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

const mockRepo1: Repository = {
  name: 'portal-app',
  description: 'First app',
  html_url: 'https://github.com/user/portal-app',
  homepage: 'https://portal-app.pages.dev',
  language: 'TypeScript',
  updated_at: '2026-07-12',
  deploy_type: 'cloudflare',
  release_url: '',
  release_tag: '',
  open_issues_count: 0,
  visibility: 'public',
};

const defaultHookMock = {
  repos: [mockRepo1],
  isLoadingRepos: false,
  dataSource: 'api' as const,
  searchQuery: '',
  setSearchQuery: vi.fn(),
  activeFilter: 'all' as const,
  setActiveFilter: vi.fn(),
  sortBy: 'updated' as const,
  setSortBy: vi.fn(),
  pinnedRepos: [],
  handleTogglePin: vi.fn(),
  handleResetFilters: vi.fn(),
  filterCounts: { all: 1, cloudflare: 1, other: 0, none: 0, private: 0 },
  stats: { total: 1, cloudflare: 1, other: 0, privateCount: 0, languagesCount: 1 },
  sortedAndFilteredRepos: [mockRepo1],
  pinnedList: [],
  chunkedGroups: { cloudflare: [mockRepo1], other: [], none: [] },
};

describe('Dashboard component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    vi.mocked(useAuth).mockReturnValue({
      user: { displayName: 'matsutanishimpei', email: '', photoURL: '' },
      logout: vi.fn(),
      isAuthenticated: false,
      accessToken: null,
      isLoading: false,
      loginWithGitHub: vi.fn(),
      loginAsGuest: vi.fn(),
    });

    vi.mocked(useRepositoryManager).mockReturnValue(defaultHookMock);
  });

  it('should render dashboard layout and repo cards', () => {
    render(<Dashboard />);

    // Sidebar items
    expect(screen.getByText('matsutanishimpei')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('名称や言語で検索...')).toBeInTheDocument();
    expect(screen.getByText('すべて')).toBeInTheDocument();

    // Metrics panel
    expect(screen.getByText('全リポジトリ')).toBeInTheDocument();
    expect(screen.getAllByText('Cloudflare').length).toBeGreaterThan(0);

    // Repo card rendering
    expect(screen.getByText('portal-app')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument(); // No fallback banner
  });

  it('should render loading state spinner when loading repositories', () => {
    vi.mocked(useRepositoryManager).mockReturnValue({
      ...defaultHookMock,
      isLoadingRepos: true,
      repos: [],
      sortedAndFilteredRepos: [],
    });

    render(<Dashboard />);
    expect(screen.getByText('GitHubからデータを読み込んでいます...')).toBeInTheDocument();
  });

  it('should render empty state when no repositories match filters', () => {
    vi.mocked(useRepositoryManager).mockReturnValue({
      ...defaultHookMock,
      repos: [],
      sortedAndFilteredRepos: [],
    });

    render(<Dashboard />);
    expect(screen.getByText('リポジトリが見つかりません')).toBeInTheDocument();
  });

  it('should show fallback warning banner when using static mock data', () => {
    vi.mocked(useRepositoryManager).mockReturnValue({
      ...defaultHookMock,
      dataSource: 'static_fallback',
    });

    render(<Dashboard />);
    
    const banner = screen.getByRole('alert');
    expect(banner).toBeInTheDocument();
    expect(banner).toHaveTextContent('静的デモデータ表示中:');
  });

  it('should call setSearchQuery when typing in the search box', () => {
    const setSearchQuery = vi.fn();
    vi.mocked(useRepositoryManager).mockReturnValue({
      ...defaultHookMock,
      setSearchQuery,
    });

    render(<Dashboard />);

    const searchInput = screen.getByPlaceholderText('名称や言語で検索...');
    fireEvent.change(searchInput, { target: { value: 'TypeScript' } });

    expect(setSearchQuery).toHaveBeenCalledWith('TypeScript');
  });

  it('should call setActiveFilter when clicking category filter buttons', () => {
    const setActiveFilter = vi.fn();
    vi.mocked(useRepositoryManager).mockReturnValue({
      ...defaultHookMock,
      setActiveFilter,
    });

    render(<Dashboard />);

    const cloudflareFilterBtn = screen.getByRole('button', { name: 'Cloudflare 1' });
    fireEvent.click(cloudflareFilterBtn);

    expect(setActiveFilter).toHaveBeenCalledWith('cloudflare');
  });
});
