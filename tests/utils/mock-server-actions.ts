/**
 * Mock utilities for Server Actions in tests
 */
import { vi } from 'vitest';

/**
 * Creates a mock server action that returns a success response
 */
export const createMockServerAction = <T = any>(returnValue: T) => {
  return vi.fn().mockResolvedValue({
    success: true,
    data: returnValue,
  });
};

/**
 * Creates a mock server action that returns an error response
 */
export const createMockServerActionError = (errorMessage: string) => {
  return vi.fn().mockResolvedValue({
    success: false,
    error: errorMessage,
  });
};

/**
 * Creates a mock server action that throws an error
 */
export const createMockServerActionThrow = (error: Error) => {
  return vi.fn().mockRejectedValue(error);
};

/**
 * Mock for revalidatePath
 */
export const mockRevalidatePath = vi.fn();

/**
 * Mock for redirect
 */
export const mockRedirect = vi.fn();

/**
 * Setup common Next.js mocks
 */
export const setupNextMocks = () => {
  vi.mock('next/navigation', () => ({
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      refresh: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
    }),
    usePathname: () => '/test-path',
    useSearchParams: () => new URLSearchParams(),
    redirect: mockRedirect,
  }));

  vi.mock('next/cache', () => ({
    revalidatePath: mockRevalidatePath,
    revalidateTag: vi.fn(),
  }));
};
