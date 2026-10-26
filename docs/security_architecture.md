# 🏛️ Security Architecture & Authentication Specification (v4.0)
**Classroom Management System (CMS) — Enterprise Secure Edition**

---

## 1. Executive Summary & Threat Model

The Classroom Management System (CMS) handles sensitive student records, personal teacher identities, grades, attendance, and disciplinary information. The system utilizes a hybrid, high-resilience architecture:
- **Frontend Client:** Single Page Application (HTML5, Tailwind CSS, ES6 JavaScript) hosted on Firebase Hosting.
- **Identity Providers:** Firebase Authentication (Google Sign-In) & Telegram OpenID / Login Widget.
- **Application Server & Relational Engine:** Google Apps Script (GAS) Web App backed by Google Sheets relational tables.
- **Real-Time Client Cache:** Cloud Firestore with offline fallback.

### Threat Model & Countermeasures
| Threat Category | Potential Vector | Architectural Countermeasure |
| :--- | :--- | :--- |
| **Identity Spoofing** | Forging Google email or Telegram username in client requests | Server-side validation of Firebase ID tokens via Google OAuth2 tokeninfo; Cryptographic HMAC-SHA256 verification of Telegram widget auth data. |
| **Privilege Escalation** | Client tampering with `role` in localStorage / payload | Server-side RBAC validation (`authorizeRole`). Database-driven roles stored in the protected `Users` sheet; users cannot modify their own roles. |
| **Cross-Class Tampering** | Teacher modifying grades or attendance of another class | Server-side class scope enforcement (`checkClassScope`) matching `assigned_grade` and `assigned_room`. |
| **Session Hijacking / Replay** | Stealing cached tokens on shared school computers | Cryptographically random session tokens stored in `sessionStorage` (cleared on browser/tab close). Server-side idle timeout (2h) and max lifespan (12h). Immediate revocation upon status change or logout. |
| **Brute-Force & Credential Stuffing** | Rapid automated login attempts | IP/identifier-based rate limiting (5 failed attempts per 15-minute window) logged in `LoginAttempts` table with concurrency locks. |
| **Insider Tampering & Non-Repudiation** | Unauthorized administrative changes without a trace | Immutable append-only `AuditLogs` table logging actor, action, target, timestamp, and sanitized details with automatic secret redaction. |

---

## 2. Authentication Protocols

### 2.1 Google / Gmail Authentication Flow
```
[User Browser]
      │
      │ 1. firebase.auth().signInWithPopup(GoogleAuthProvider)
      ▼
[Google Accounts / Firebase Auth]
      │
      │ 2. Issues Firebase JWT ID Token
      ▼
[User Browser]
      │
      │ 3. POST /exec { action: 'verifyGoogleAuth', id_token: ID_TOKEN }
      ▼
[Google Apps Script Server]
      │
      │ 4. GET https://oauth2.googleapis.com/tokeninfo?id_token=...
      ▼
[Google OAuth2 Verification API]
      │
      │ 5. Returns verified payload: { email, email_verified: true, sub, exp, aud }
      ▼
[Google Apps Script Server]
      │
      │ 6. Verify: aud === FIREBASE_CLIENT_ID && email_verified === 'true'
      │ 7. Query 'Users' table by verified email or provider_subject
      │ 8. Check Status:
      │    ├── 'pending'   -> Return status: 'pending' (Blocked from data)
      │    ├── 'suspended' -> Return status: 'suspended' (Access Denied)
      │    ├── 'disabled'  -> Return status: 'disabled' (Access Denied)
      │    └── 'approved'  -> Generate cryptographically random session token
      │                       Record issued session in 'Sessions' sheet
      │                       Return { status: 'success', session_token, user, permissions }
      ▼
[User Browser]
      │ Stores session_token in sessionStorage (never localStorage)
      │ Grants workspace access according to server-validated role
```

### 2.2 Telegram Login Verification Flow
Telegram Login authenticates users via the official Telegram Login Widget (`auth.telegram.org`):
1. **Payload Generation:** When the user approves in Telegram, Telegram provides:
   `{ id, first_name, last_name, username, photo_url, auth_date, hash }`
2. **Freshness Verification:** The server checks `Date.now()/1000 - auth_date < 86400` (within 24 hours) to prevent replay attacks.
3. **Cryptographic Signature Verification:**
   - Construct `data_check_string` by sorting all keys alphabetically except `hash`, joined by `\n` in `key=value` format.
   - Compute `secret_key = SHA-256(TELEGRAM_BOT_TOKEN)`.
   - Compute `calculated_hash = HMAC-SHA-256(data_check_string, secret_key)`.
   - Verify `calculated_hash === hash`.
4. **Identity Linking & Approval:**
   - The verified `id` is queried against the `AuthIdentities` table.
   - If not linked, login is rejected with instructions to link while logged in or request Admin approval.
   - Once linked to an approved user account in `Users`, a session is issued.

---

## 3. Role-Based Access Control (RBAC) Specification

The system implements 5 standardized roles with least-privilege principles enforced on every protected server-side operation:

| Role Identifier | Role Name (Khmer) | Scope of Permissions | Class Scope Restrictions |
| :--- | :--- | :--- | :--- |
| `super_admin` | អ្នកគ្រប់គ្រងជាន់ខ្ពស់ | Full system access: manage admins, assign all roles, view audit logs, modify system settings, emergency access. | Unrestricted (`all`) |
| `admin` | អ្នកគ្រប់គ្រងសាលា | Manage ordinary teachers, students, classrooms, approve pending accounts, generate official school reports. Cannot promote to Super Admin. | School-wide (`all`) |
| `homeroom_teacher` | គ្រូប្រចាំថ្នាក់ | Manage student rosters, daily attendance, view scores, print grade transcripts for their assigned class. | Strictly isolated to assigned `grade` and `room` |
| `subject_teacher` | គ្រូបង្រៀនមុខវិជ្ជា | Record scores, assignments, homework, and subject notes for classes they teach. Cannot edit student general records. | Assigned classes and subjects |
| `student` | សិស្សានុសិស្ស | Read-only access to own profile, personal attendance, personal exam results, timetable, and announcements. Cannot view other students' records or modify grades. | Strictly own student ID |

### Server-Side Permission Guard Implementation
Every data-modifying endpoint (`saveStudent`, `saveScores`, `saveAttendance`, `approveUser`, etc.) executes:
1. `authenticateSession(sessionToken)`: validates token existence, expiration, idle timeout, and revocation status in the `Sessions` sheet.
2. `authorizeRole(user, allowedRoles)`: ensures the user's role is in the authorized whitelist.
3. `checkClassScope(user, targetGrade, targetRoom)`: verifies that homeroom/subject teachers only operate within their assigned class.

---

## 4. Session Management Lifecycle

- **Session Identifier:** 64-character hexadecimal cryptographically secure random string prefixed with `SES-`.
- **Storage Mechanism:** Client stores the session token exclusively in `sessionStorage`. When the user closes the browser or tab, the token is automatically wiped from browser memory.
- **Absolute Lifespan:** 12 hours from issuance (`expires_at = now + 12h`).
- **Idle Timeout:** 2 hours of inactivity (`last_activity_at + 2h`). Every authenticated request updates `last_activity_at`.
- **Revocation:**
  - Upon user logout: `revoked_at` is stamped in the `Sessions` table.
  - Upon user suspension or disabling: all active sessions for that `user_id` are revoked immediately, preventing any subsequent requests.

---

## 5. Multi-Factor Authentication (MFA)

- **Algorithm:** Time-Based One-Time Password (TOTP) RFC 6238 compliant.
- **Secret Encoding:** 160-bit cryptographically random seed encoded in Base32.
- **URI Format:** `otpauth://totp/CMS:{user_email}?secret={secret}&issuer=ClassroomManagementSystem`
- **Emergency Recovery:** Generates 8 single-use 8-character recovery codes (format `XXXX-XXXX`).
- **Storage:** Only salted cryptographic hashes of unused recovery codes are stored in the database (`mfa_recovery_hashes`).

---

## 6. Rate Limiting & Brute-Force Protection

- **Tracking Sheet:** `LoginAttempts` table records `attempt_id`, `account_identifier` (SHA-256 hash of identifier to preserve privacy), `ip_address_hash`, `timestamp`, `result`, and `failure_reason`.
- **Threshold:** Maximum 5 consecutive failed attempts per account within a sliding 15-minute window (`15 * 60 * 1000 ms`).
- **Lockout Action:** Server rejects login attempts immediately with HTTP 200 `{ status: 'error', message: '...' }` indicating remaining lockout duration.
- **Concurrency Safety:** Google Apps Script `LockService.getScriptLock()` prevents race conditions during rapid requests.

---

## 7. Append-Only Audit Logging

- **Table:** `AuditLogs`
- **Schema:** `event_id`, `timestamp`, `actor_user_id`, `action`, `target_type`, `target_id`, `result`, `ip_hash`, `user_agent_hash`, `details`
- **Redaction Rules:** The server automatically strips sensitive parameters before persisting:
  - `password`, `password_hash`, `salt`
  - `token`, `id_token`, `session_token`
  - `secret`, `mfa_secret`, `recovery_codes`
- **Immutability:** No API endpoint exists to update or delete records from `AuditLogs`. Restricted to read-only access for `super_admin`.
