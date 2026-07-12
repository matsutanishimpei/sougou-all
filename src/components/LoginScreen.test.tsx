import { render, screen, fireEvent } from '@testing-library/react';
import LoginScreen from './LoginScreen';
import { useAuth } from '../hooks/useAuth';
import { describe, it, expect, vi, beforeEach } from 'vitest';


vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

describe('LoginScreen component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should render login card details and button', () => {
    const loginWithGitHub = vi.fn();
    vi.mocked(useAuth).mockReturnValue({
      loginWithGitHub,
      isLoading: false,
      user: null,
      isAuthenticated: false,
      accessToken: null,
      logout: vi.fn(),
    });

    render(<LoginScreen />);

    expect(screen.getByText('Sougou Dashboard')).toBeInTheDocument();
    expect(screen.getByText('リポジトリ・デプロイ状況を一元管理')).toBeInTheDocument();

    const loginButton = screen.getByRole('button', { name: 'GitHubでサインイン' });
    expect(loginButton).toBeInTheDocument();
    expect(loginButton).not.toBeDisabled();

    fireEvent.click(loginButton);
    expect(loginWithGitHub).toHaveBeenCalledTimes(1);
  });

  it('should render loading spinner and disabled state when loading', () => {
    vi.mocked(useAuth).mockReturnValue({
      loginWithGitHub: vi.fn(),
      isLoading: true,
      user: null,
      isAuthenticated: false,
      accessToken: null,
      logout: vi.fn(),
    });

    render(<LoginScreen />);

    const loadingButton = screen.getByRole('button', { name: 'サインイン中...' });
    expect(loadingButton).toBeInTheDocument();
    expect(loadingButton).toBeDisabled();
  });
});
