/**
 * Test helper utilities for common testing patterns
 */
import { waitFor } from '@testing-library/react';
import { vi } from 'vitest';

/**
 * Wait for an element to be removed from the DOM
 */
export const waitForElementToBeRemoved = async (
  callback: () => HTMLElement | null,
  options?: { timeout?: number }
) => {
  await waitFor(() => {
    const element = callback();
    if (element !== null) {
      throw new Error('Element is still in the document');
    }
  }, options);
};

/**
 * Simulate async operation delay
 */
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Create a deferred promise for testing async flows
 */
export const createDeferred = <T = void>() => {
  let resolve: (value: T) => void;
  let reject: (reason?: any) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve: resolve!, reject: reject! };
};

/**
 * Assert that a function throws an error with a specific message
 */
export const expectToThrow = async (fn: () => Promise<any> | any, expectedMessage?: string) => {
  let error: Error | null = null;
  try {
    await fn();
  } catch (e) {
    error = e as Error;
  }

  if (!error) {
    throw new Error('Expected function to throw an error');
  }

  if (expectedMessage && !error.message.includes(expectedMessage)) {
    throw new Error(
      `Expected error message to include "${expectedMessage}", but got "${error.message}"`
    );
  }

  return error;
};

/**
 * Mock console methods for testing
 */
export const mockConsole = () => {
  const originalConsole = { ...console };
  const mocks = {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  };

  Object.assign(console, mocks);

  return {
    mocks,
    restore: () => Object.assign(console, originalConsole),
  };
};

/**
 * Create a mock file for testing file uploads
 */
export const createMockFile = (
  name: string = 'test.txt',
  content: string = 'test content',
  type: string = 'text/plain'
) => {
  const blob = new Blob([content], { type });
  return new File([blob], name, { type });
};
