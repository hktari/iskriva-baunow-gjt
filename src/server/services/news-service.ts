import { db } from '@/shared/lib/db';
import { NewsCategory } from '@prisma/enums';

export interface NewsFilters {
  category?: NewsCategory;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedNewsResult {
  articles: Array<{
    id: string;
    guid: string;
    title: string;
    summary: string;
    url: string;
    source: string;
    category: NewsCategory;
    publishedAt: Date;
    fetchedAt: Date;
  }>;
  total: number;
  page: number;
  totalPages: number;
}

export async function getNewsArticles(filters: NewsFilters = {}): Promise<PaginatedNewsResult> {
  const { category, search, page = 1, limit = 20 } = filters;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (category) {
    where.category = category;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { summary: { contains: search, mode: 'insensitive' } },
      { source: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [articles, total] = await Promise.all([
    db.newsArticle.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip,
      take: limit,
    }),
    db.newsArticle.count({ where }),
  ]);

  return {
    articles,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getLastFetchedAt(): Promise<Date | null> {
  const latest = await db.newsArticle.findFirst({
    orderBy: { fetchedAt: 'desc' },
    select: { fetchedAt: true },
  });
  return latest?.fetchedAt ?? null;
}
