# CMS QA Smoke Test Report — v2

## Scope
Static source checks and automated smoke tests were run against the provided project. No live Google Apps Script login or real school data was accessed or modified.

## Passed
- JavaScript syntax check: all root `.js` files and `tests/smoke-tests.js` pass `node --check`.
- HTML script references: core Login, Students, Attendance, Scores, Reports, Dashboard, and analytics modules are referenced by `Index.html`.
- Static module smoke checks: login endpoint call and required view entry points are present.
- Analytics unit smoke test with synthetic data: active-student filtering, present/absence/authorized-absence counts, average score aggregation, and explicit `F` alert work for the test fixture.
- Local data preservation: login/logout cleanup now removes only disposable `cache_*` entries and authentication state on logout; it does not intentionally delete `academic_students`, `academic_attendance`, `academic_scores`, or `syncQueue`.

## Not yet verified in a real browser/server
- Actual credentials and login response from Google Apps Script.
- Students CRUD, attendance save/load, scores save/load, report exports, and sync queue behavior against the live backend.
- Firebase connectivity/security rules.
- Khmer PDF rendering and PWA install/offline behavior on Android/iOS.
- Account isolation for legacy local records that do not contain `teacher_id` / `academic_year` fields.

## Important interpretation notes
- Attendance rate is calculated only over attendance records with a recognizable status; it is not a full school-day attendance rate unless all relevant student-days have been recorded.
- Score alerts only flag records explicitly marked with grade letter `F`. This avoids guessing a pass threshold while score scales are not fully standardized.
- Analytics are derived from local data available to the browser; they should not be treated as verified cloud totals until sync status and backend responses are validated.

## Recommended manual acceptance tests
1. Log in with a test teacher account; verify failed and successful login paths.
2. Add/edit a test student, reload, and verify the record remains.
3. Record attendance for a test date; reload and verify the same status is shown.
4. Save scores for a test month; reload and verify averages/ranks remain consistent.
5. Open Reports and export one test report to PDF/Excel.
6. Disconnect network, verify the UI reports offline state accurately, reconnect, and verify pending sync items are retained and reconciled.
7. Log out and log in as a second test account; confirm no first-account data is exposed. Do not use real student data for this test until isolation is verified.
