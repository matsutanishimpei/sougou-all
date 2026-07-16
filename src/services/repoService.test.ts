import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GitHubRepositoryProvider, getRepositories, processRepository } from './repoService';
import { PUBLIC_REPO_DATA } from '../data/publicRepos';
import { PRIVATE_REPO_DATA } from '../data/privateRepos';

describe('repoService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('GitHubRepositoryProvider', () => {
    it('should fetch and map repository details correctly', async () => {
      const mockRawResponse = [
        {
          name: 'project-a',
          description: 'A test project',
          html_url: 'https://github.com/user/project-a',
          homepage: 'https://project-a.pages.dev', // cloudflare
          language: 'TypeScript',
          updated_at: '2026-07-10T12:00:00Z',
          private: true,
          open_issues_count: 5,
        },
        {
          name: 'project-b',
          description: null,
          html_url: 'https://github.com/user/project-b',
          homepage: 'https://example.com', // other
          language: null,
          updated_at: '2026-07-09T12:00:00Z',
          private: false,
        }
      ];

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockRawResponse,
      });
      global.fetch = fetchMock;

      const provider = new GitHubRepositoryProvider();
      const result = await provider.fetchRepos('mock-token');

      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.github.com/user/repos?per_page=100&affiliation=owner,collaborator',
        {
          headers: {
            Accept: 'application/vnd.github+json',
            Authorization: 'Bearer mock-token',
          }
        }
      );

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        name: 'project-a',
        description: 'A test project',
        html_url: 'https://github.com/user/project-a',
        homepage: 'https://project-a.pages.dev',
        language: 'TypeScript',
        updated_at: '2026-07-10',
        deploy_type: 'cloudflare',
        release_url: '',
        release_tag: '',
        open_issues_count: 5,
        visibility: 'private',
      });

      expect(result[1]).toEqual({
        name: 'project-b',
        description: '説明なし',
        html_url: 'https://github.com/user/project-b',
        homepage: 'https://example.com',
        language: 'N/A',
        updated_at: '2026-07-09',
        deploy_type: 'other',
        release_url: '',
        release_tag: '',
        open_issues_count: 0,
        visibility: 'public',
      });
    });

    it('should throw error when api fetch fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
      });

      const provider = new GitHubRepositoryProvider();
      await expect(provider.fetchRepos()).rejects.toThrow('GitHub API returned HTTP status 403');
    });
  });

  describe('getRepositories wrapper', () => {
    it('should return API data on successful provider resolve', async () => {
      const mockRepos = [{ name: 'test', description: 'desc' } as any];
      const mockProvider = {
        fetchRepos: vi.fn().mockResolvedValue(mockRepos),
      };

      const result = await getRepositories('token', mockProvider);
      expect(result.repos).toEqual(mockRepos.map(processRepository));
      expect(result.dataSource).toBe('api');
      expect(mockProvider.fetchRepos).toHaveBeenCalledWith('token');
    });

    it('should fallback to static public repos if unauthenticated fetch fails', async () => {
      const mockProvider = {
        fetchRepos: vi.fn().mockRejectedValue(new Error('Fetch failed')),
      };

      const result = await getRepositories(null, mockProvider);
      expect(result.repos).toEqual(PUBLIC_REPO_DATA.map(processRepository));
      expect(result.dataSource).toBe('static_fallback');
    });

    it('should fallback to public + private repos if authenticated fetch fails', async () => {
      const mockProvider = {
        fetchRepos: vi.fn().mockRejectedValue(new Error('Fetch failed')),
      };
      const result = await getRepositories('some-token', mockProvider);
      expect(result.repos).toEqual([...PUBLIC_REPO_DATA, ...PRIVATE_REPO_DATA].map(processRepository));
      expect(result.dataSource).toBe('static_fallback');
    });
  });
});
