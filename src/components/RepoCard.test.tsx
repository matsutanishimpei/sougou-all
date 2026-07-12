import { render, screen, fireEvent } from '@testing-library/react';
import RepoCard from './RepoCard';
import type { Repository } from '../types';
import { describe, it, expect, vi } from 'vitest';


const mockRepoPublic: Repository = {
  name: 'sougou-portal',
  description: 'Main landing portal',
  html_url: 'https://github.com/user/sougou-portal',
  homepage: 'https://sougou-portal.pages.dev',
  language: 'TypeScript',
  updated_at: '2026-07-12',
  deploy_type: 'cloudflare',
  release_url: '',
  release_tag: '',
  open_issues_count: 0,
  visibility: 'public',
};

const mockRepoPrivate: Repository = {
  name: 'sougou-secret-db',
  description: 'Confidential keys database',
  html_url: 'https://github.com/user/sougou-secret-db',
  homepage: '',
  language: 'Rust',
  updated_at: '2026-07-10',
  deploy_type: 'none',
  release_url: '',
  release_tag: '',
  open_issues_count: 0,
  visibility: 'private',
};

describe('RepoCard component', () => {
  it('should render public repository card with Cloudflare badge', () => {
    const handleTogglePin = vi.fn();
    render(<RepoCard repo={mockRepoPublic} isPinned={false} onTogglePin={handleTogglePin} />);

    // Check title link
    const titleLink = screen.getByRole('link', { name: 'sougou-portal' });
    expect(titleLink).toBeInTheDocument();
    expect(titleLink).toHaveAttribute('href', 'https://github.com/user/sougou-portal');

    // Check Cloudflare badge
    expect(screen.getByText('Cloudflare')).toBeInTheDocument();

    // Check buttons
    expect(screen.getByRole('link', { name: 'Visit Site' })).toHaveAttribute('href', 'https://sougou-portal.pages.dev');
    expect(screen.getByRole('link', { name: 'View Code' })).toHaveAttribute('href', 'https://github.com/user/sougou-portal');

    // Check language
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('2026-07-12')).toBeInTheDocument();
  });

  it('should render private repository card with Lock icon and no homepage buttons', () => {
    const handleTogglePin = vi.fn();
    render(<RepoCard repo={mockRepoPrivate} isPinned={true} onTogglePin={handleTogglePin} />);

    // Private indicator
    expect(screen.getByText('Private')).toBeInTheDocument();

    // No visit site button
    expect(screen.queryByRole('link', { name: 'Visit Site' })).not.toBeInTheDocument();

    // View Code is still present
    expect(screen.getByRole('link', { name: 'View Code' })).toHaveAttribute('href', 'https://github.com/user/sougou-secret-db');

    // Rust language tag
    expect(screen.getByText('Rust')).toBeInTheDocument();
  });

  it('should call onTogglePin when pin button is clicked', () => {
    const handleTogglePin = vi.fn();
    render(<RepoCard repo={mockRepoPublic} isPinned={false} onTogglePin={handleTogglePin} />);

    const pinButton = screen.getByRole('button', { name: 'Pin repository' });
    fireEvent.click(pinButton);

    expect(handleTogglePin).toHaveBeenCalledTimes(1);
  });
});
