import Parser from 'rss-parser';
import { NewsCategory } from '@prisma/client';

export interface FeedArticle {
  guid: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  category: NewsCategory;
  publishedAt: Date;
}

interface FeedConfig {
  url: string;
  name: string;
  category: NewsCategory;
}

export const FEED_CONFIGS: FeedConfig[] = [
  {
    url: 'https://energy.ec.europa.eu/node/2/rss_en',
    name: 'EU DG Energy',
    category: NewsCategory.ENERGY,
  },
  {
    url: 'https://cinea.ec.europa.eu/node/2/rss_en',
    name: 'CINEA Clean Energy',
    category: NewsCategory.FUNDING,
  },
  {
    url: 'https://www.europarl.europa.eu/rss/doc/press-releases/EN.xml',
    name: 'EU Parliament',
    category: NewsCategory.POLICY,
  },
];

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(text: string, maxLength = 400): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s+\S*$/, '') + '…';
}

export interface FetchFeedResult {
  articles: FeedArticle[];
  feedName: string;
  error?: string;
}

export async function fetchFeed(config: FeedConfig): Promise<FetchFeedResult> {
  const parser = new Parser({
    timeout: 10000,
    headers: { 'User-Agent': 'EU-Project-Manager-NewsAggregator/1.0' },
  });

  try {
    const feed = await parser.parseURL(config.url);
    const articles: FeedArticle[] = [];

    for (const item of feed.items ?? []) {
      const guid = item.guid ?? item.link;
      const url = item.link;
      const title = item.title;

      if (!guid || !url || !title) continue;

      const rawSummary = item.contentSnippet ?? item.content ?? item.summary ?? '';
      const summary = truncate(stripHtml(rawSummary));

      const pubDate = item.pubDate ?? item.isoDate;
      const publishedAt = pubDate ? new Date(pubDate) : new Date();

      if (isNaN(publishedAt.getTime())) continue;

      articles.push({
        guid,
        title: stripHtml(title).slice(0, 500),
        summary,
        url,
        source: config.name,
        category: config.category,
        publishedAt,
      });
    }

    return { articles, feedName: config.name };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { articles: [], feedName: config.name, error: message };
  }
}

export async function fetchAllFeeds(): Promise<{
  articles: FeedArticle[];
  errors: Array<{ feed: string; error: string }>;
}> {
  const results = await Promise.allSettled(FEED_CONFIGS.map(config => fetchFeed(config)));

  const articles: FeedArticle[] = [];
  const errors: Array<{ feed: string; error: string }> = [];

  for (const result of results) {
    if (result.status === 'fulfilled') {
      articles.push(...result.value.articles);
      if (result.value.error) {
        errors.push({ feed: result.value.feedName, error: result.value.error });
      }
    } else {
      errors.push({ feed: 'unknown', error: String(result.reason) });
    }
  }

  return { articles, errors };
}
