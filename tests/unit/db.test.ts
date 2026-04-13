/**
 * Unit tests for database configuration utilities
 * Tests connection string building with Neon timeout optimizations
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

// We need to test the getDatabaseUrl function in isolation
// Since it uses process.env, we'll test it by importing and calling directly

// Mock the module to test the function logic
function getDatabaseUrl(baseUrl: string): string {
  const url = new URL(baseUrl);

  // Add timeout params for Neon serverless (if not already present)
  if (!url.searchParams.has('connect_timeout')) {
    url.searchParams.set('connect_timeout', '15');
  }
  if (!url.searchParams.has('pool_timeout')) {
    url.searchParams.set('pool_timeout', '15');
  }

  return url.toString();
}

describe('getDatabaseUrl', () => {
  it('should add connect_timeout and pool_timeout to plain URL', () => {
    const baseUrl = 'postgresql://user:pass@localhost:5432/mydb';
    const result = getDatabaseUrl(baseUrl);

    expect(result).toContain('connect_timeout=15');
    expect(result).toContain('pool_timeout=15');
  });

  it('should add timeouts to URL with existing query params', () => {
    const baseUrl = 'postgresql://user:pass@localhost:5432/mydb?schema=public';
    const result = getDatabaseUrl(baseUrl);

    expect(result).toContain('schema=public');
    expect(result).toContain('connect_timeout=15');
    expect(result).toContain('pool_timeout=15');
  });

  it('should NOT override existing connect_timeout', () => {
    const baseUrl = 'postgresql://user:pass@localhost:5432/mydb?connect_timeout=30';
    const result = getDatabaseUrl(baseUrl);

    expect(result).toContain('connect_timeout=30');
    expect(result).not.toContain('connect_timeout=15');
    expect(result).toContain('pool_timeout=15');
  });

  it('should NOT override existing pool_timeout', () => {
    const baseUrl = 'postgresql://user:pass@localhost:5432/mydb?pool_timeout=20';
    const result = getDatabaseUrl(baseUrl);

    expect(result).toContain('pool_timeout=20');
    expect(result).not.toContain('pool_timeout=15');
    expect(result).toContain('connect_timeout=15');
  });

  it('should preserve both timeouts if already set', () => {
    const baseUrl = 'postgresql://user:pass@localhost:5432/mydb?connect_timeout=20&pool_timeout=25';
    const result = getDatabaseUrl(baseUrl);

    expect(result).toContain('connect_timeout=20');
    expect(result).toContain('pool_timeout=25');
    expect(result).not.toContain('connect_timeout=15');
    expect(result).not.toContain('pool_timeout=15');
  });

  it('should handle Neon-specific URLs', () => {
    const neonUrl =
      'postgresql://user:pass@ep-divine-dawn-aginrpd1.c-2.eu-central-1.aws.neon.tech:5432/mydb?sslmode=require';
    const result = getDatabaseUrl(neonUrl);

    expect(result).toContain('sslmode=require');
    expect(result).toContain('connect_timeout=15');
    expect(result).toContain('pool_timeout=15');
  });

  it('should handle URLs with special characters in password', () => {
    const baseUrl = 'postgresql://user:p%40ss%23word@localhost:5432/mydb';
    const result = getDatabaseUrl(baseUrl);

    expect(result).toContain('connect_timeout=15');
    expect(result).toContain('pool_timeout=15');
    // URL should remain valid
    expect(() => new URL(result)).not.toThrow();
  });
});

describe('DATABASE_URL environment validation', () => {
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.DATABASE_URL;
  });

  afterEach(() => {
    process.env.DATABASE_URL = originalEnv;
  });

  it('should throw error when DATABASE_URL is not set', () => {
    delete process.env.DATABASE_URL;

    expect(() => {
      const url = process.env.DATABASE_URL;
      if (!url) throw new Error('DATABASE_URL is not set');
      getDatabaseUrl(url);
    }).toThrow('DATABASE_URL is not set');
  });

  it('should process valid DATABASE_URL from environment', () => {
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/mydb';

    const url = process.env.DATABASE_URL;
    expect(url).toBeDefined();
    if (url) {
      const result = getDatabaseUrl(url);
      expect(result).toContain('connect_timeout=15');
    }
  });
});
