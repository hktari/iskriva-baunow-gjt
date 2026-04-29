import { NewsCategory } from '@prisma/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('rss-parser', () => {
  const Parser = vi.fn(() => ({ parseURL: vi.fn() }));
  return { default: Parser };
});

import { FEED_CONFIGS, fetchAllFeeds, fetchFeed } from '@/server/services/news-fetcher';
import Parser from 'rss-parser';

const mockParseURL = vi.fn();

beforeEach(() => {
  (Parser as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
    parseURL: mockParseURL,
  }));
});

afterEach(() => vi.clearAllMocks());

const energyFeed = FEED_CONFIGS.find(f => f.category === NewsCategory.ENERGY)!;

describe('fetchFeed', () => {
  it('returns normalized articles from a valid feed', async () => {
    mockParseURL.mockResolvedValue({
      items: [
        {
          guid: 'https://example.com/article-1',
          link: 'https://example.com/article-1',
          title: 'Renewable Energy Milestone',
          contentSnippet: 'EU reaches record renewable energy production.',
          pubDate: 'Mon, 15 Jan 2025 10:00:00 GMT',
        },
      ],
    });

    const result = await fetchFeed(energyFeed);

    expect(result.error).toBeUndefined();
    expect(result.articles).toHaveLength(1);
    expect(result.articles[0]).toMatchObject({
      guid: 'https://example.com/article-1',
      title: 'Renewable Energy Milestone',
      category: NewsCategory.ENERGY,
      source: energyFeed.name,
    });
    expect(result.articles[0].publishedAt).toBeInstanceOf(Date);
  });

  it('falls back to link when guid is absent', async () => {
    mockParseURL.mockResolvedValue({
      items: [
        {
          link: 'https://example.com/no-guid',
          title: 'No GUID article',
          contentSnippet: 'Summary.',
          pubDate: 'Tue, 16 Jan 2025 08:00:00 GMT',
        },
      ],
    });

    const result = await fetchFeed(energyFeed);
    expect(result.articles[0].guid).toBe('https://example.com/no-guid');
  });

  it('strips HTML tags from summary', async () => {
    mockParseURL.mockResolvedValue({
      items: [
        {
          guid: 'https://example.com/html',
          link: 'https://example.com/html',
          title: 'HTML Article',
          content: '<p>This is <strong>bold</strong> &amp; important.</p>',
          pubDate: 'Wed, 17 Jan 2025 09:00:00 GMT',
        },
      ],
    });

    const result = await fetchFeed(energyFeed);
    expect(result.articles[0].summary).toBe('This is bold & important.');
  });

  it('skips items missing both guid and link', async () => {
    mockParseURL.mockResolvedValue({
      items: [{ title: 'No URL article', contentSnippet: 'Summary.' }],
    });

    const result = await fetchFeed(energyFeed);
    expect(result.articles).toHaveLength(0);
  });

  it('returns error and empty articles when fetch fails', async () => {
    mockParseURL.mockRejectedValue(new Error('Network timeout'));

    const result = await fetchFeed(energyFeed);
    expect(result.articles).toHaveLength(0);
    expect(result.error).toBe('Network timeout');
  });
});

describe('fetchAllFeeds', () => {
  it('aggregates articles from all feeds', async () => {
    mockParseURL.mockResolvedValue({
      items: [
        {
          guid: 'https://example.com/item',
          link: 'https://example.com/item',
          title: 'Test Article',
          contentSnippet: 'Summary.',
          pubDate: 'Mon, 15 Jan 2025 10:00:00 GMT',
        },
      ],
    });

    const result = await fetchAllFeeds();
    expect(result.articles.length).toBe(FEED_CONFIGS.length);
    expect(result.errors).toHaveLength(0);
  });

  it('isolates per-feed errors and still returns articles from healthy feeds', async () => {
    mockParseURL.mockRejectedValueOnce(new Error('Feed 1 down')).mockResolvedValue({
      items: [
        {
          guid: 'https://example.com/ok',
          link: 'https://example.com/ok',
          title: 'OK Article',
          contentSnippet: 'Summary.',
          pubDate: 'Mon, 15 Jan 2025 10:00:00 GMT',
        },
      ],
    });

    const result = await fetchAllFeeds();
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].error).toBe('Feed 1 down');
    expect(result.articles.length).toBe(FEED_CONFIGS.length - 1);
  });
});
