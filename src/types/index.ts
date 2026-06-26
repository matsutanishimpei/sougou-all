/**
 * Core type definitions for the Sougou-All portal application.
 * Centralizing types ensures consistency and makes future schema changes easy.
 */

/** Repository visibility - determines display behavior. */
export type RepoVisibility = 'public' | 'private';

/** Deploy target platform - determines badge style and link behavior. */
export type DeployType = 'cloudflare' | 'other' | 'none';

/** Core repository data structure (matches ref/sougou data schema). */
export interface Repository {
  name: string;
  description: string;
  html_url: string;
  homepage: string;
  language: string;
  updated_at: string;
  deploy_type: DeployType;
  release_url: string;
  release_tag: string;
  open_issues_count: number;
  /** Extended field: visibility flag for auth-gated content. */
  visibility: RepoVisibility;
}

/** Authenticated user profile from Google OAuth. */
export interface UserProfile {
  displayName: string;
  email: string;
  photoURL: string;
}

/** Filter options for the dashboard. */
export type FilterType = 'all' | 'cloudflare' | 'other' | 'none' | 'private';

/** Sort options for the dashboard. */
export type SortType = 'updated' | 'name' | 'deploy';
