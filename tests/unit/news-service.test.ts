import { NewsCategory } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockDb, resetMockDb } from '../helpers/mock-db';

vi.mock('@/shared/lib/db', () => ({ db: mockDb }));

import { getLastFetchedAt, getNewsArticles } from '@/server/services/news-service';

const makeArticle = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 'article-1',
  guid: 'https://example.com/1',
  title: 'Test Article',
  summary: 'Test summary.',
  url: 'https://example.com/1',
  source: 'EU DG Energy',
  category: NewsCategory.ENERGY,
  publishedAt: new Date('2025-01-15'),
  fetchedAt: new Date('2025-01-15'),
  ...overrides,
});

beforeEach(() => resetMockDb());

describe('getNewsArticles', () => {
  it('returns paginated articles with total count', async () => {
    const articles = [
      makeArticle(),
      makeArticle({ id: 'article-2', guid: 'https://example.com/2' }),
    ];
    mockDb.newsArticle.findMany.mockResolvedValue(articles);
    mockDb.newsArticle.count.mockResolvedValue(2);

    const result = await getNewsArticles({ page: 1, limit: 10 });

    expect(result.articles).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it('filters by category', async () => {
    mockDb.newsArticle.findMany.mockResolvedValue([]);
    mockDb.newsArticle.count.mockResolvedValue(0);

    await getNewsArticles({ category: NewsCategory.FUNDING });

    expect(mockDb.newsArticle.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ category: NewsCategory.FUNDING }),
      })
    );
  });

  it('filters by search term', async () => {
    mockDb.newsArticle.findMany.mockResolvedValue([]);
    mockDb.newsArticle.count.mockResolvedValue(0);

    await getNewsArticles({ search: 'hydrogen' });

    expect(mockDb.newsArticle.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ OR: expect.any(Array) }),
      })
    );
  });

  it('calculates correct pagination offset', async () => {
    mockDb.newsArticle.findMany.mockResolvedValue([]);
    mockDb.newsArticle.count.mockResolvedValue(50);

    const result = await getNewsArticles({ page: 3, limit: 10 });

    expect(mockDb.newsArticle.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 20, take: 10 })
    );
    expect(result.totalPages).toBe(5);
  });

  it('returns no filters when called with no arguments', async () => {
    mockDb.newsArticle.findMany.mockResolvedValue([]);
    mockDb.newsArticle.count.mockResolvedValue(0);

    await getNewsArticles();

    expect(mockDb.newsArticle.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: {} })
    );
  });
});

describe('getLastFetchedAt', () => {
  it('returns the fetchedAt date of the most recent article', async () => {
    const date = new Date('2025-03-01T10:00:00Z');
    mockDb.newsArticle.findFirst.mockResolvedValue({ fetchedAt: date });

    const result = await getLastFetchedAt();

    expect(result).toEqual(date);
    expect(mockDb.newsArticle.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { fetchedAt: 'desc' } })
    );
  });

  it('returns null when no articles exist', async () => {
    mockDb.newsArticle.findFirst.mockResolvedValue(null);

    const result = await getLastFetchedAt();

    expect(result).toBeNull();
  });
});
