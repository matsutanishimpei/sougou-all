import { render, screen, fireEvent } from '@testing-library/react';
import LoginScreen from './LoginScreen';
import { useAuth } from '../hooks/useAuth';
import { describe, it, expect, vi, beforeEach } from 'vitest';


vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../context/ThemeContext', () => ({
  useTheme: () => ({
    theme: 'light',
    toggleTheme: vi.fn(),
  }),
}));

describe('LoginScreen component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should render login card details and buttons', () => {
    const loginWithGitHub = vi.fn();
    const loginAsGuest = vi.fn();
    vi.mocked(useAuth).mockReturnValue({
      loginWithGitHub,
      loginAsGuest,
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

    const guestButton = screen.getByRole('button', { name: 'ゲストとして閲覧する' });
    expect(guestButton).toBeInTheDocument();
    expect(guestButton).not.toBeDisabled();

    fireEvent.click(loginButton);
    expect(loginWithGitHub).toHaveBeenCalledTimes(1);

    fireEvent.click(guestButton);
    expect(loginAsGuest).toHaveBeenCalledTimes(1);
  });

  it('should render loading spinner and disabled state when loading', () => {
    vi.mocked(useAuth).mockReturnValue({
      loginWithGitHub: vi.fn(),
      loginAsGuest: vi.fn(),
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

    const guestButton = screen.getByRole('button', { name: 'ゲストとして閲覧する' });
    expect(guestButton).toBeDisabled();
  });
});
