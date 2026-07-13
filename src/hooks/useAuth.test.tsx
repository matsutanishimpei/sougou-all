import { renderHook } from '@testing-library/react';
import { useAuth } from './useAuth';
import { AuthProvider } from '../context/AuthProvider';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

describe('useAuth hook', () => {
  it('should throw an error when used outside AuthProvider', () => {
    // Suppress console.error in vitest stdout since react will log rendering errors
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth must be used within an <AuthProvider>'
    );

    consoleSpy.mockRestore();
  });

  it('should return context state and callbacks when inside provider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current).toBeDefined();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(typeof result.current.loginWithGitHub).toBe('function');
    expect(typeof result.current.logout).toBe('function');
    expect(typeof result.current.loginAsGuest).toBe('function');
  });
});
