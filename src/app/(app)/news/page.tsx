import { NewsCategory } from '@/generated/prisma/client';
import { auth } from '@/server/auth';
import { getLastFetchedAt, getNewsArticles } from '@/server/services/news-service';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { Calendar, ExternalLink, Newspaper, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { NewsSearchForm } from './_components/news-search-form';
import { RefreshButton } from './_components/refresh-button';

const CATEGORIES: { label: string; value: NewsCategory | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Energy', value: NewsCategory.ENERGY },
  { label: 'Funding', value: NewsCategory.FUNDING },
  { label: 'Policy', value: NewsCategory.POLICY },
];

const CATEGORY_COLORS: Record<NewsCategory, string> = {
  ENERGY: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  FUNDING: 'bg-green-100 text-green-800 border-green-200',
  POLICY: 'bg-blue-100 text-blue-800 border-blue-200',
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

interface NewsPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    page?: string;
  }>;
}

export const metadata = {
  title: 'News | EU Project Manager',
  description: 'Aggregated EU energy, funding, and policy news',
};

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const params = await searchParams;
  const session = await auth();
  const isSuperUser = session?.user?.role === 'SUPER_USER';

  const rawCategory = params.category?.toUpperCase();
  const category =
    rawCategory &&
    rawCategory !== 'ALL' &&
    Object.values(NewsCategory).includes(rawCategory as NewsCategory)
      ? (rawCategory as NewsCategory)
      : undefined;

  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1);
  const search = params.search;

  const [{ articles, total, totalPages }, lastFetchedAt] = await Promise.all([
    getNewsArticles({ category, search, page, limit: 15 }),
    getLastFetchedAt(),
  ]);

  const activeCategory = params.category?.toUpperCase() ?? 'ALL';

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Newspaper className="h-6 w-6 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold">EU Energy News</h1>
            </div>
            <p className="text-muted-foreground">
              Aggregated news from EU DG Energy, CINEA, and EU Parliament covering energy
              transition, clean energy funding, and policy developments.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {isSuperUser ? <RefreshButton /> : null}
            {lastFetchedAt ? (
              <p className="text-xs text-muted-foreground">
                Last updated: {formatDate(lastFetchedAt)}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          {CATEGORIES.map(cat => {
            const isActive = activeCategory === cat.value;
            const href: any =
              cat.value === 'ALL'
                ? `/news${search ? `?search=${encodeURIComponent(search)}` : ''}`
                : `/news?category=${cat.value.toLowerCase()}${search ? `&search=${encodeURIComponent(search)}` : ''}`;
            return (
              <Link key={cat.value} href={href}>
                <Button
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-full"
                >
                  {cat.label}
                </Button>
              </Link>
            );
          })}
        </div>
        <div className="ml-auto">
          <Suspense>
            <NewsSearchForm />
          </Suspense>
        </div>
      </div>

      {/* Results count */}
      {total > 0 && (
        <p className="text-sm text-muted-foreground mb-4">
          Showing {(page - 1) * 15 + 1}–{Math.min(page * 15, total)} of {total} articles
        </p>
      )}

      {/* Article list */}
      {articles.length === 0 ? (
        <EmptyState hasSearch={!!search} isSuperUser={isSuperUser} />
      ) : (
        <div className="flex flex-col gap-4">
          {articles.map(article => (
            <Card key={article.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge
                        variant="outline"
                        className={`text-xs ${CATEGORY_COLORS[article.category]}`}
                      >
                        {article.category.charAt(0) + article.category.slice(1).toLowerCase()}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {article.source}
                      </Badge>
                    </div>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-semibold leading-snug hover:text-blue-600 transition-colors line-clamp-2"
                    >
                      {article.title}
                    </a>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-3">
                  {article.summary}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatDate(article.publishedAt)}</span>
                  </div>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Read article
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          {page > 1 && (
            <Link href={buildPageHref(page - 1, category, search)}>
              <Button variant="outline" size="sm">
                Previous
              </Button>
            </Link>
          )}
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link href={buildPageHref(page + 1, category, search)}>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function buildPageHref(
  page: number,
  category: NewsCategory | undefined,
  search: string | undefined
): any {
  const params = new URLSearchParams();
  if (category) params.set('category', category.toLowerCase());
  if (search) params.set('search', search);
  params.set('page', String(page));
  return `/news?${params.toString()}`;
}

function EmptyState({ hasSearch, isSuperUser }: { hasSearch: boolean; isSuperUser: boolean }) {
  return (
    <Card className="py-16">
      <CardContent className="flex flex-col items-center text-center gap-4">
        <div className="p-4 bg-muted rounded-full">
          <Newspaper className="h-8 w-8 text-muted-foreground" />
        </div>
        {hasSearch ? (
          <>
            <h3 className="text-lg font-semibold">No articles found</h3>
            <p className="text-muted-foreground max-w-sm">
              No articles match your search. Try different keywords or clear the search.
            </p>
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold">No news articles yet</h3>
            <p className="text-muted-foreground max-w-sm">
              The news feed hasn&apos;t been populated yet.
              {isSuperUser
                ? ' Use the "Refresh feed" button to fetch the latest articles from EU sources.'
                : ' Articles will appear once the feed is refreshed.'}
            </p>
            {isSuperUser ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <RefreshCw className="h-4 w-4" />
                <span>Click &quot;Refresh feed&quot; above to get started</span>
              </div>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
