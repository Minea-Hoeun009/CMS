# Classroom Management System (CMS) - Production Security Checklist & Verification
**Version:** 4.0 Enterprise Architecture
**Audit Date:** 2026-10-26
**Compliance Level:** High (Enterprise / MoEYS Standard)

---

## 1. Authentication & Identity Checklist

| Check Item | Requirement | Verification Method | Status |
| :--- | :--- | :--- | :--- |
| **Server-Side Token Verification** | Google ID Token verified via official Google OAuth2 tokeninfo endpoint | Code inspection of `verifyFirebaseIdToken` in `Code.gs` | ✅ PASS |
| **Email Verification Enforcement** | `email_verified` must be `true` before granting any session | `verifyFirebaseIdToken` checks `json.email_verified === 'true'` | ✅ PASS |
| **Telegram HMAC Validation** | Authenticate via official Telegram SHA256 HMAC and bot token hash | `verifyTelegramAuthData` in `Code.gs` checks HMAC-SHA256 | ✅ PASS |
| **Telegram Freshness Window** | Reject auth data older than 24 hours (86,400s) | Checked against `auth_date` in `Code.gs` | ✅ PASS |
| **Default Pending Status** | New self-registered accounts default to `pending` | `verifyGoogleAuth` sets `status: 'pending'` | ✅ PASS |
| **Admin Approval Requirement** | No data access granted until admin explicitly approves account | Enforced on server before session issuance | ✅ PASS |
| **Session Lifetime & Storage** | Token stored in `sessionStorage` (not `localStorage`), 12h expiry | Enforced in `js/auth.js` and `createSession` | ✅ PASS |
| **Immediate Session Revocation** | When account status changed to `suspended` or `disabled`, revoke session | `updateUserStatus` updates `revoked_at` timestamp | ✅ PASS |
| **Multi-Factor Authentication** | TOTP RFC 6238 and 8 emergency single-use backup recovery codes | Tested in `tests/secure_auth_system.test.js` | ✅ PASS |
| **Brute-Force Rate Limiting** | Max 5 failed login attempts per 15-minute window per IP/email | `checkRateLimit` and `recordFailedLogin` in `Code.gs` | ✅ PASS |

---

## 2. Authorization & Role-Based Access Control (RBAC)

| Role | Scope | Permitted Capabilities | Restrictions |
| :--- | :--- | :--- | :--- |
| **Super Admin** | System-Wide | All operations, security settings, user role assignment, system backup, audit inspection | Cannot bypass audit logging |
| **Admin** | School-Wide | Student & teacher management, class assignments, timetables, reports, announcements | Cannot modify system core credentials or delete audit logs |
| **Homeroom Teacher** | Assigned Classroom | Class attendance, score entry for homeroom, student profile updates, class reports | Restricted to assigned grade and room; cannot edit other classes |
| **Subject Teacher** | Assigned Subjects | Score entry for assigned subjects, view timetable, assign homework | Cannot modify student profiles or homeroom attendance |
| **Student** | Personal | View own attendance, scores, ranking, timetable, homework, school notices | Strictly read-only to personal records |

---

## 3. Data Integrity & Concurrency Checklist

| Check Item | Requirement | Verification Method | Status |
| :--- | :--- | :--- | :--- |
| **Concurrency Locking** | High-contention write operations protected by `LockService` (30s) | `saveScores`, `saveAttendance`, `enrollStudent` acquire script lock | ✅ PASS |
| **Student Transfer History** | Historical scores and attendance must remain intact in source class | `transferStudent` marks old enrollment `transferred` and leaves past score records intact | ✅ PASS |
| **Safe Deletion (Soft Delete)** | Student deletion defaults to `Withdrawn` status to prevent orphan records | `deleteStudent` in `students.js` flags `status: "Withdrawn"` | ✅ PASS |
| **Automated Ranking Sync** | Score changes automatically recompute GPA, rankings (1..N) and letter grades | `recalculateScoresAndRankings` in `Code.gs` and `js/event-bus.js` | ✅ PASS |
| **Academic Year Isolation** | Data records scoped by academic year; switching year isolates active lists | All query routines accept and enforce `academic_year` filter | ✅ PASS |

---

## 4. Secret Protection & Privacy Checklist

| Check Item | Requirement | Verification Method | Status |
| :--- | :--- | :--- | :--- |
| **No Hardcoded Server Secrets** | Telegram bot tokens, API keys stored in `ScriptProperties` | `PropertiesService.getScriptProperties().getProperty(...)` | ✅ PASS |
| **Secret Redaction in Logs** | `password`, `token`, `secret`, `api_key` stripped from audit logs | `logSecurityEvent` strips sensitive keys before writing | ✅ PASS |
| **Input Sanitization** | All user inputs escaped to prevent Cross-Site Scripting (XSS) | `escapeHtml` utility applied across all DOM renderers | ✅ PASS |
| **Least Privilege Firestore Rules** | No open unauthenticated reads or writes permitted | `firestore.rules` verified in automated test suite | ✅ PASS |
