import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';

// Automatically clean up mock interactions and local storage keys after each test runs
afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});
