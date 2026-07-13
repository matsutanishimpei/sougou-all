import { renderHook, act } from '@testing-library/react';
import { useRepositoryManager } from './useRepositoryManager';
import { getRepositories } from '../services/repoService';
import { useAuth } from './useAuth';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Repository } from '../types';

vi.mock('../services/repoService', () => ({
  getRepositories: vi.fn(),
}));

vi.mock('./useAuth', () => ({
  useAuth: vi.fn(),
}));

const mockRepos: Repository[] = [
  {
    name: 'repo-cf',
    description: 'Cloudflare pages deploy',
    html_url: 'https://github.com/user/repo-cf',
    homepage: 'https://cf.pages.dev',
    language: 'TypeScript',
    updated_at: '2026-07-10',
    deploy_type: 'cloudflare',
    release_url: '',
    release_tag: '',
    open_issues_count: 0,
    visibility: 'public',
  },
  {
    name: 'repo-other',
    description: 'Other deployment',
    html_url: 'https://github.com/user/repo-other',
    homepage: 'https://example.com',
    language: 'JavaScript',
    updated_at: '2026-07-08',
    deploy_type: 'other',
    release_url: '',
    release_tag: '',
    open_issues_count: 2,
    visibility: 'public',
  },
  {
    name: 'repo-none-private',
    description: 'Private backend utility',
    html_url: 'https://github.com/user/repo-none-private',
    homepage: '',
    language: 'Rust',
    updated_at: '2026-07-12',
    deploy_type: 'none',
    release_url: '',
    release_tag: '',
    open_issues_count: 0,
    visibility: 'private',
  }
];

describe('useRepositoryManager hook', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    
    vi.mocked(useAuth).mockReturnValue({
      accessToken: 'test-token',
      isAuthenticated: true,
      user: { displayName: 'tester', email: 'test@example.com', photoURL: '' },
      isLoading: false,
      loginWithGitHub: vi.fn(),
      logout: vi.fn(),
      loginAsGuest: vi.fn(),
    });

    vi.mocked(getRepositories).mockResolvedValue({
      repos: mockRepos,
      dataSource: 'api',
    });
  });

  it('should initialize and fetch repositories', async () => {
    const { result } = renderHook(() => useRepositoryManager());

    // Initially loading
    expect(result.current.isLoadingRepos).toBe(true);

    // Wait for resolution
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.isLoadingRepos).toBe(false);
    expect(result.current.repos).toEqual(mockRepos);
    expect(result.current.dataSource).toBe('api');
  });

  it('should filter repositories by category', async () => {
    const { result } = renderHook(() => useRepositoryManager());
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); });

    // Filter cloudflare
    act(() => {
      result.current.setActiveFilter('cloudflare');
    });
    expect(result.current.sortedAndFilteredRepos).toHaveLength(1);
    expect(result.current.sortedAndFilteredRepos[0].name).toBe('repo-cf');

    // Filter private
    act(() => {
      result.current.setActiveFilter('private');
    });
    expect(result.current.sortedAndFilteredRepos).toHaveLength(1);
    expect(result.current.sortedAndFilteredRepos[0].name).toBe('repo-none-private');
  });

  it('should search repositories by name, language, or description', async () => {
    const { result } = renderHook(() => useRepositoryManager());
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); });

    act(() => {
      result.current.setSearchQuery('Rust');
    });
    expect(result.current.sortedAndFilteredRepos).toHaveLength(1);
    expect(result.current.sortedAndFilteredRepos[0].name).toBe('repo-none-private');

    act(() => {
      result.current.setSearchQuery('deployment');
    });
    expect(result.current.sortedAndFilteredRepos).toHaveLength(1);
    expect(result.current.sortedAndFilteredRepos[0].name).toBe('repo-other');
  });

  it('should sort repositories correctly', async () => {
    const { result } = renderHook(() => useRepositoryManager());
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); });

    // Default sorting (updated_at desc)
    expect(result.current.sortedAndFilteredRepos[0].name).toBe('repo-none-private'); // 2026-07-12
    expect(result.current.sortedAndFilteredRepos[1].name).toBe('repo-cf');           // 2026-07-10
    expect(result.current.sortedAndFilteredRepos[2].name).toBe('repo-other');        // 2026-07-08

    // Sort by name
    act(() => {
      result.current.setSortBy('name');
    });
    expect(result.current.sortedAndFilteredRepos[0].name).toBe('repo-cf');
    expect(result.current.sortedAndFilteredRepos[1].name).toBe('repo-none-private');
    expect(result.current.sortedAndFilteredRepos[2].name).toBe('repo-other');
  });

  it('should handle toggle pin and save to localStorage', async () => {
    const { result } = renderHook(() => useRepositoryManager());
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); });

    expect(result.current.pinnedRepos).toHaveLength(0);

    // Pin repo
    act(() => {
      result.current.handleTogglePin('repo-cf');
    });
    expect(result.current.pinnedRepos).toEqual(['repo-cf']);
    expect(result.current.pinnedList).toHaveLength(1);
    expect(result.current.pinnedList[0].name).toBe('repo-cf');
    expect(localStorage.getItem('pinned_repos')).toBe(JSON.stringify(['repo-cf']));

    // Unpin repo
    act(() => {
      result.current.handleTogglePin('repo-cf');
    });
    expect(result.current.pinnedRepos).toHaveLength(0);
    expect(result.current.pinnedList).toHaveLength(0);
  });

  it('should compute category counts and general stats', async () => {
    const { result } = renderHook(() => useRepositoryManager());
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); });

    expect(result.current.filterCounts).toEqual({
      all: 3,
      cloudflare: 1,
      other: 1,
      none: 1,
      private: 1,
    });

    expect(result.current.stats).toEqual({
      total: 3,
      cloudflare: 1,
      other: 1,
      privateCount: 1,
      languagesCount: 3, // TS, JS, Rust
    });
  });

  it('should reset filters properly', async () => {
    const { result } = renderHook(() => useRepositoryManager());
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); });

    act(() => {
      result.current.setSearchQuery('testing');
      result.current.setActiveFilter('cloudflare');
    });

    expect(result.current.searchQuery).toBe('testing');
    expect(result.current.activeFilter).toBe('cloudflare');

    act(() => {
      result.current.handleResetFilters();
    });

    expect(result.current.searchQuery).toBe('');
    expect(result.current.activeFilter).toBe('all');
  });
});
