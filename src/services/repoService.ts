import type { Repository } from '../types';
import { PUBLIC_REPO_DATA } from '../data/publicRepos';
import { PRIVATE_REPO_DATA } from '../data/privateRepos';

export interface RepositoryFetchResult {
  repos: Repository[];
  dataSource: 'api' | 'static_fallback';
}

/**
 * Provider interface for extensible repository sources (e.g. GitLab, Gitea in the future).
 */
export interface RepositoryProvider {
  fetchRepos(token?: string | null): Promise<Repository[]>;
}

/**
 * GitHub implementation of the repository provider.
 */
export class GitHubRepositoryProvider implements RepositoryProvider {
  async fetchRepos(token?: string | null): Promise<Repository[]> {
    const defaultUser = import.meta.env.VITE_DEFAULT_GITHUB_USER || 'matsutanishimpei';
    const url = token
      ? 'https://api.github.com/user/repos?per_page=100&affiliation=owner,collaborator'
      : `https://api.github.com/users/${defaultUser}/repos?per_page=100`;

    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(url, { headers });
    if (!res.ok) {
      throw new Error(`GitHub API returned HTTP status ${res.status}`);
    }
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
}

/**
 * Processes a repository to extract backend_url from its description if present in [Backend: URL] format,
 * and strips it from the description for clean UI display.
 */
export function processRepository(repo: Repository): Repository {
  const rawDesc = repo.description || '説明なし';
  const backendMatch = rawDesc.match(/\[Backend:\s*(https?:\/\/[^\]\s]+)\]/);
  if (backendMatch) {
    return {
      ...repo,
      description: rawDesc.replace(/\[Backend:\s*(https?:\/\/[^\]\s]+)\]/, '').trim(),
      backend_url: repo.backend_url || backendMatch[1],
    };
  }
  return {
    ...repo,
    description: rawDesc,
  };
}

// Default provider instance
const defaultProvider = new GitHubRepositoryProvider();

/**
 * Fetches repositories using the provided token. Falls back to static data if the fetch fails.
 * 
 * @param token Optional access token for private repositories
 * @param provider Custom provider instance (defaults to GitHubRepositoryProvider)
 */
export async function getRepositories(
  token?: string | null,
  provider: RepositoryProvider = defaultProvider
): Promise<RepositoryFetchResult> {
  try {
    const rawRepos = await provider.fetchRepos(token);
    const repos = rawRepos.map(processRepository);
    return {
      repos,
      dataSource: 'api',
    };
  } catch (error) {
    console.warn('Repository service fetch failed, using static fallback:', error);
    
    // Determine fallback content based on auth state (token presence)
    const rawFallback = token
      ? [...PUBLIC_REPO_DATA, ...PRIVATE_REPO_DATA]
      : PUBLIC_REPO_DATA;
      
    const repos = rawFallback.map(processRepository);
      
    return {
      repos,
      dataSource: 'static_fallback',
    };
  }
}
