# ISSUES

## E2E Test Failures - Admin Features

The following E2E tests in `tests/e2e/admin.spec.ts` are failing and need to be fixed:

### Current blocker

- [x] Reproduced baseline failure in isolation (`should display users page for super user`).
- [x] Confirmed login fails in `beforeEach` (`/login` -> stays on `/login`).
- [x] Verified root cause: demo super user is missing in current DB (`admin@example.com` not found).
- [x] Re-seed the test database used by the running app on port `3005`.
- [ ] Stabilize `beforeEach` auth (added retry-based credential login helper; pending full verification run).
- [ ] RESEND not configured: keep email-delivery-dependent assertions as low priority.

### Chunked fix order

1. **Environment/auth baseline**: ensure demo users exist and `beforeEach` login passes.
2. **User Management**: fix create/invite success assertions.
3. **Field Configuration**: fix strict-mode and card/button locators.
4. **Audit Logs**: fix select interaction and details-dialog selectors.
5. **Access Control**: fix logout/login flow for non-super-user path.
6. **Final pass**: run full `admin` grep suite and close checklist.

### Deferred / low priority (until RESEND keys are configured)

- [x] `should invite a user` moved to low priority in test suite (`test.skip` when `RESEND_API_KEY` missing).

### User Management

- [x] `should create a new user`: Timeout waiting for "User created successfully".
- [ ] `should invite a user`: Timeout waiting for "Invitation Sent Successfully". _(low priority for now)_

### Field Configuration

- [ ] `should display fields page`: Strict mode violation for "Project Types".
- [ ] `should add a new field value`: Timeout clicking "Add" button.
- [ ] `should edit a field value`: Timeout clicking "Edit" button.
- [ ] `should delete a field value`: Timeout clicking "Add" button.

### Audit Logs

- [ ] `should filter audit logs by action`: Timeout clicking "USER_CREATED".
- [ ] `should view audit log details`: Strict mode violation for "Action".

### Access Control

- [ ] `should deny access to non-super users`: `net::ERR_ABORTED` during navigation to `/login`.

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
