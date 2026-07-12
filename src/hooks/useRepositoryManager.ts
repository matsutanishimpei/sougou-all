import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Repository, FilterType, SortType } from '../types';
import { getRepositories } from '../services/repoService';
import { useAuth } from './useAuth';

export function useRepositoryManager() {
  const { accessToken } = useAuth();

  // Repository state
  const [repos, setRepos] = useState<Repository[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(true);
  const [dataSource, setDataSource] = useState<'api' | 'static_fallback'>('api');

  // Search & Filter controls
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

  // Fetch repositories from API service
  useEffect(() => {
    let active = true;
    setIsLoadingRepos(true);

    getRepositories(accessToken).then((result) => {
      if (!active) return;
      setRepos(result.repos);
      setDataSource(result.dataSource);
      setIsLoadingRepos(false);
    });

    return () => {
      active = false;
    };
  }, [accessToken]);

  // Persist pinned repos to localStorage
  useEffect(() => {
    localStorage.setItem('pinned_repos', JSON.stringify(pinnedRepos));
  }, [pinnedRepos]);

  // Pin / Unpin toggle handler
  const handleTogglePin = useCallback((name: string) => {
    setPinnedRepos((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  }, []);

  // Reset search and filter to initial state
  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setActiveFilter('all');
  }, []);

  // Compute feedforward counts for each category filter
  const filterCounts = useMemo(() => {
    return {
      all: repos.length,
      cloudflare: repos.filter((r) => r.deploy_type === 'cloudflare').length,
      other: repos.filter((r) => r.deploy_type === 'other').length,
      none: repos.filter((r) => r.deploy_type === 'none').length,
      private: repos.filter((r) => r.visibility === 'private').length,
    };
  }, [repos]);

  // Compute statistics summary metrics
  const stats = useMemo(() => {
    const total = repos.length;
    const cloudflare = filterCounts.cloudflare;
    const other = filterCounts.other;
    const privateCount = filterCounts.private;
    
    const languages = new Set<string>();
    repos.forEach((r) => {
      if (r.language && r.language !== 'N/A' && r.language !== 'null') {
        languages.add(r.language);
      }
    });

    return { total, cloudflare, other, privateCount, languagesCount: languages.size };
  }, [repos, filterCounts]);

  // Apply search filtering and sorting logic
  const sortedAndFilteredRepos = useMemo(() => {
    let result = repos.filter((repo) => {
      // Category filter
      if (activeFilter === 'private') {
        if (repo.visibility !== 'private') return false;
      } else if (activeFilter !== 'all') {
        if (repo.deploy_type !== activeFilter) return false;
      }

      // Search query filtering
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

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      
      if (sortBy === 'deploy') {
        const order = { cloudflare: 0, other: 1, none: 2 };
        const diff = order[a.deploy_type] - order[b.deploy_type];
        if (diff !== 0) return diff;
      }
      
      // Default: newest updated first
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

    return result;
  }, [repos, activeFilter, searchQuery, sortBy]);

  // Sub-list of pinned repos in the current search/filter view
  const pinnedList = useMemo(() => {
    return sortedAndFilteredRepos.filter((repo) => pinnedRepos.includes(repo.name));
  }, [sortedAndFilteredRepos, pinnedRepos]);

  // Sub-groups for Cognitive Chunking (only used when activeFilter is 'all')
  const chunkedGroups = useMemo(() => {
    const groups = {
      cloudflare: [] as Repository[],
      other: [] as Repository[],
      none: [] as Repository[],
    };

    // Filter out pinned repos so they aren't duplicated in the layout
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

  return {
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
  };
}
