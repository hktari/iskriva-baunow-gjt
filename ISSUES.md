# ISSUES

## login performance profiling in production

Login actions are taking several seconds in E2E tests, suggesting potential performance bottlenecks in production authentication flows.

### Proposed Plan

1.  **Instrument Server-side Auth**:
    - Add timing logs to `src/server/auth` (NextAuth callbacks and providers).
    - Measure database query times for user lookup and session creation.
2.  **Client-side Monitoring**:
    - Use Sentry or similar to capture `PerformanceNavigationTiming` for the `/login` to `/` transition.
    - Track duration from "Login" button click to session validation.
3.  **Database Optimization**:
    - Check indexing on `User` and `Account` tables in `prisma/schema.prisma`.
    - Review connection pooling settings (especially relevant for Neon/Serverless).
4.  **E2E Performance Benchmarking**:
    - Create a dedicated Playwright smoke test that fails if login exceeds a specific threshold (e.g., 3s).

## dev server db connection breaks during runtime

Unsure when this happens

```bash
prisma:error Error in PostgreSQL connection: Error { kind: Db, cause: Some(DbError { severity: "FATAL", parsed_severity: Some(Fatal), code: SqlState(E57P01), message: "terminating connection due to administrator command", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("postgres.c"), line: Some(3318), routine: Some("ProcessInterrupts") }) }
prisma:error Error in PostgreSQL connection: Error { kind: Db, cause: Some(DbError { severity: "FATAL", parsed_severity: Some(Fatal), code: SqlState(E57P01), message: "terminating connection due to administrator command", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("postgres.c"), line: Some(3318), routine: Some("ProcessInterrupts") }) }
```
