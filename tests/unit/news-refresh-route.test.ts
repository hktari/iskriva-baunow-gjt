import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockDb, resetMockDb } from '../helpers/mock-db';

vi.mock('@/shared/lib/db', () => ({ db: mockDb }));

vi.mock('@/server/services/news-fetcher', () => ({
  fetchAllFeeds: vi.fn(),
}));

vi.mock('@/server/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/shared/lib/logger', () => ({
  createChildLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

import { auth } from '@/server/auth';
import { fetchAllFeeds } from '@/server/services/news-fetcher';
import { GET, POST } from '@/app/api/news/refresh/route';
import { NextRequest } from 'next/server';

const mockAuth = auth as ReturnType<typeof vi.fn>;
const mockFetchAllFeeds = fetchAllFeeds as ReturnType<typeof vi.fn>;

function makeRequest(method: string, authHeader?: string): NextRequest {
  return new NextRequest('http://localhost/api/news/refresh', {
    method,
    headers: authHeader ? { authorization: authHeader } : {},
  });
}

const sampleFeedResult = {
  articles: [
    {
      guid: 'https://example.com/a1',
      title: 'Test Article',
      summary: 'Summary',
      url: 'https://example.com/a1',
      source: 'EU DG Energy',
      category: 'ENERGY',
      publishedAt: new Date('2025-01-15'),
    },
  ],
  errors: [],
};

beforeEach(() => {
  resetMockDb();
  vi.stubEnv('CRON_SECRET', 'test-secret-123');
  mockDb.newsArticle.upsert.mockResolvedValue({});
});

describe('POST /api/news/refresh (cron)', () => {
  it('returns 401 when Authorization header is missing', async () => {
    const res = await POST(makeRequest('POST'));
    expect(res.status).toBe(401);
  });

  it('returns 401 when bearer token is wrong', async () => {
    const res = await POST(makeRequest('POST', 'Bearer wrong-secret'));
    expect(res.status).toBe(401);
  });

  it('returns 401 when CRON_SECRET is not set', async () => {
    vi.stubEnv('CRON_SECRET', '');
    const res = await POST(makeRequest('POST', 'Bearer test-secret-123'));
    expect(res.status).toBe(401);
  });

  it('runs refresh and returns upserted count with valid token', async () => {
    mockFetchAllFeeds.mockResolvedValue(sampleFeedResult);

    const res = await POST(makeRequest('POST', 'Bearer test-secret-123'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.upserted).toBe(1);
    expect(body.errors).toHaveLength(0);
    expect(mockDb.newsArticle.upsert).toHaveBeenCalledOnce();
  });

  it('includes feed errors in response without failing', async () => {
    mockFetchAllFeeds.mockResolvedValue({
      articles: [],
      errors: [{ feed: 'CINEA Clean Energy', error: 'Timeout' }],
    });

    const res = await POST(makeRequest('POST', 'Bearer test-secret-123'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.errors).toHaveLength(1);
    expect(body.upserted).toBe(0);
  });
});

describe('GET /api/news/refresh (manual, super_user only)', () => {
  it('returns 403 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null);
    const res = await GET(makeRequest('GET'));
    expect(res.status).toBe(403);
  });

  it('returns 403 for non-super-user roles', async () => {
    mockAuth.mockResolvedValue({ user: { id: '1', role: 'EDITOR' } });
    const res = await GET(makeRequest('GET'));
    expect(res.status).toBe(403);
  });

  it('runs refresh for super_user and returns result', async () => {
    mockAuth.mockResolvedValue({ user: { id: '1', role: 'SUPER_USER' } });
    mockFetchAllFeeds.mockResolvedValue(sampleFeedResult);

    const res = await GET(makeRequest('GET'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.upserted).toBe(1);
  });
});
