import { auth } from '@/server/auth';
import { fetchAllFeeds } from '@/server/services/news-fetcher';
import { db } from '@/shared/lib/db';
import { createChildLogger } from '@/shared/lib/logger';
import { NextRequest, NextResponse } from 'next/server';

const logger = createChildLogger({ scope: 'news-refresh' });

function isCronAuthorized(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${cronSecret}`;
}

async function runRefresh(): Promise<NextResponse> {
  logger.info('Starting news feed refresh');

  const { articles, errors } = await fetchAllFeeds();

  if (errors.length > 0) {
    for (const err of errors) {
      logger.warn({ feed: err.feed, error: err.error }, 'Feed fetch error');
    }
  }

  let upserted = 0;

  for (const article of articles) {
    await db.newsArticle.upsert({
      where: { guid: article.guid },
      update: {
        title: article.title,
        summary: article.summary,
        url: article.url,
        source: article.source,
        category: article.category,
        publishedAt: article.publishedAt,
        fetchedAt: new Date(),
      },
      create: {
        guid: article.guid,
        title: article.title,
        summary: article.summary,
        url: article.url,
        source: article.source,
        category: article.category,
        publishedAt: article.publishedAt,
      },
    });
    upserted++;
  }

  logger.info({ upserted, errors: errors.length }, 'News feed refresh complete');

  return NextResponse.json({
    success: true,
    upserted,
    errors: errors.map(e => ({ feed: e.feed, error: e.error })),
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return runRefresh();
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  void request;
  const session = await auth();
  if (!session?.user || session?.user?.role !== 'SUPER_USER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return runRefresh();
}
