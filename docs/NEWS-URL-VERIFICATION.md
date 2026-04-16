# News Article URL Verification Report

**Date:** April 16, 2026  
**Status:** ✅ VERIFIED - RSS feeds provide article detail URLs correctly

## Summary

The RSS feed implementation is **working correctly**. The feeds provide individual article detail URLs, and the code properly extracts and stores them. ✅ **Fixed:** Seed data has been updated to use realistic article detail URLs.

## RSS Feed Analysis

### Feeds Configured

1. **EU DG Energy**: `https://energy.ec.europa.eu/node/2/rss_en`
2. **CINEA Clean Energy**: `https://cinea.ec.europa.eu/node/2/rss_en`
3. **EU Parliament**: `https://www.europarl.europa.eu/rss/doc/press-releases/EN.xml`

### Sample Article URLs from Live Feeds

#### EU DG Energy

```
https://energy.ec.europa.eu/news/european-sustainable-energy-week-2026-opens-registration-2026-04-14_en
```

#### CINEA Clean Energy

```
https://energy.ec.europa.eu/news/european-sustainable-energy-week-2026-opens-registration-2026-04-14_en
```

#### EU Parliament

```
https://www.europarl.europa.eu/news/en/press-room/20260414IPR40819/
```

### RSS Feed Structure

Each RSS item provides:

- `guid`: Unique identifier (often the article URL)
- `link`: **Article detail URL** (this is what we need)
- `title`: Article title
- `content` / `contentSnippet`: Article summary
- `pubDate` / `isoDate`: Publication date
- `categories`: Metadata about the article

## Code Implementation Review

### ✅ Correct Implementation

**File:** `src/server/services/news-fetcher.ts`

```typescript
// Line 73-74: Correctly extracts article URL from RSS item
const guid = item.guid ?? item.link;
const url = item.link; // ✅ This gets the article detail URL
```

The code correctly:

1. Uses `item.link` which contains the article detail URL
2. Falls back to `item.link` for `guid` if no explicit GUID is provided
3. Stores the URL in the database via the upsert operation

### ✅ Seed Data Fixed

**File:** `prisma/seed.ts` (lines 377-428)

The seed data now contains **realistic article detail URLs**:

```typescript
{
  guid: 'seed-eu-energy-001',
  title: 'EU accelerates renewable energy deployment...',
  url: 'https://energy.ec.europa.eu/news/eu-accelerates-renewable-energy-deployment-2025-03-15_en',  // ✅ Article detail URL
  // ...
}
```

These follow the same URL pattern as real RSS feed articles.

## Database Verification

Database now contains seed data with **article detail URLs**:

- `https://energy.ec.europa.eu/news/eu-accelerates-renewable-energy-deployment-2025-03-15_en`
- `https://cinea.ec.europa.eu/news/cinea-launches-clean-energy-transition-call-2025-03-10_en`
- `https://www.europarl.europa.eu/news/en/press-room/20250228IPR12345`
- `https://energy.ec.europa.eu/news/record-solar-power-generation-q1-2025-02-20_en`
- `https://cinea.ec.europa.eu/news/innovation-fund-awards-renewable-hydrogen-2025-02-12_en`

These follow the same URL pattern as real RSS feed articles.

## Frontend Implementation

**File:** `src/app/(app)/news/page.tsx`

The frontend correctly uses `article.url` to link to articles:

```tsx
<a href={article.url} target="_blank" rel="noopener noreferrer" className="...">
  {article.title}
</a>
```

## Recommendations

### 1. ✅ Code Working Correctly

The RSS feed fetcher and storage logic are working correctly. No changes are required.

### 2. ✅ Seed Data Fixed

Seed data has been updated with realistic article detail URLs that follow the same pattern as real RSS feed articles.

### 3. Run News Refresh (Optional)

To populate the database with real article URLs from RSS feeds:

**As Super User:**

1. Log in to the application
2. Navigate to `/news`
3. Click "Refresh feed" button

**Or via API:**

```bash
curl -X GET http://localhost:3000/api/news/refresh \
  -H "Authorization: Bearer $CRON_SECRET"
```

**Or via cron job:**
The endpoint is designed to be called by a cron job with the `CRON_SECRET` authorization header.

## Testing

### Manual Test Script

Run the RSS feed inspection script:

```bash
npx tsx scripts/test-rss-feed.ts
```

This will fetch and display the structure of all configured RSS feeds.

### Database Check Script

Run the database URL check script:

```bash
npx tsx scripts/check-news-urls.ts
```

This will display the current URLs stored in the database.

## Conclusion

✅ **RSS feeds provide article detail URLs**  
✅ **Code correctly extracts and stores them**  
✅ **Seed data now has realistic article detail URLs**  
✅ **Frontend correctly displays article links**

**Issue resolved** - all components are working correctly. The seed data now contains realistic article detail URLs that follow the same pattern as real RSS feed articles.
