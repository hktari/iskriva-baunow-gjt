---
trigger: always_on
---

- When running e2e tests be efficient. Start small, first run single test, if it passes, then run whole file. Then continue to next file. Don't run all tests at once. This is slow and inefficient, especially for e2e tests. Run tests in parallel if possible.
- you must always fix linter errors
- if you fix a failing test, always rerun the test to validate your fix