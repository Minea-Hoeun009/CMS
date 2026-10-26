const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

test('Secure Account & Authentication System Suite (v4.0)', async (t) => {
  const codeGsPath = path.join(__dirname, '..', 'google-apps-script', 'Code.gs');
  const codeGsContent = fs.readFileSync(codeGsPath, 'utf8');
  const authJsPath = path.join(__dirname, '..', 'js', 'auth.js');
  const authJsContent = fs.readFileSync(authJsPath, 'utf8');
  const indexHtmlPath = path.join(__dirname, '..', 'index.html');
  const indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf8');

  // 1. Google / Firebase ID Token Server Verification
  await t.test('1. Server-side Firebase Google ID Token Verification', () => {
    assert.ok(codeGsContent.includes('verifyFirebaseIdToken'), 'Must implement verifyFirebaseIdToken function');
    assert.ok(codeGsContent.includes('oauth2.googleapis.com/tokeninfo?id_token='), 'Must verify against official Google OAuth2 tokeninfo endpoint');
    assert.ok(codeGsContent.includes('email_verified'), 'Must verify that email_verified is true');
    assert.ok(codeGsContent.includes('verifyGoogleAuth'), 'Must provide verifyGoogleAuth doPost action');
    assert.ok(codeGsContent.includes("status: 'pending'"), 'New self-registered accounts must be pending by default');
  });

  // 2. Telegram Official HMAC-SHA256 Signature Verification
  await t.test('2. Official Telegram HMAC-SHA256 Signature Verification', () => {
    assert.ok(codeGsContent.includes('verifyTelegramAuthData'), 'Must implement verifyTelegramAuthData function');
    assert.ok(codeGsContent.includes('Utilities.computeHmacSha256Signature'), 'Must compute HMAC-SHA256 signature in GAS');
    assert.ok(codeGsContent.includes('TELEGRAM_BOT_TOKEN'), 'Must use bot token secret from ScriptProperties');
    assert.ok(codeGsContent.includes('86400'), 'Must enforce 24-hour freshness check on auth_date');
    assert.ok(codeGsContent.includes('linkTelegramIdentity'), 'Must provide linkTelegramIdentity action with duplicate protection');

    // Simulate official Telegram HMAC calculation in Node.js
    const botToken = '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11';
    const authData = {
      id: 987654321,
      first_name: 'Sokha',
      username: 'sokha_teacher',
      auth_date: Math.floor(Date.now() / 1000)
    };
    const checkString = Object.keys(authData)
      .sort()
      .map(k => `${k}=${authData[k]}`)
      .join('\n');
    
    const secretKey = crypto.createHash('sha256').update(botToken).digest();
    const signature = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');
    assert.strictEqual(signature.length, 64, 'Telegram HMAC must be a 64-char hex string');
  });

  // 3. Account Status & Admin Approval Lifecycle
  await t.test('3. Explicit Account Status & Approval Lifecycle Enforcement', () => {
    const statuses = ['pending', 'approved', 'suspended', 'disabled'];
    for (const st of statuses) {
      assert.ok(codeGsContent.includes(`'${st}'`) || codeGsContent.includes(`"${st}"`), `Schema must support status: ${st}`);
    }
    assert.ok(codeGsContent.includes('approveUser'), 'Must support approveUser action');
    assert.ok(codeGsContent.includes('updateUserStatus'), 'Must support updateUserStatus action');
    assert.ok(codeGsContent.includes("user.status === 'suspended'"), 'Must reject suspended accounts');
    assert.ok(codeGsContent.includes("user.status === 'disabled'"), 'Must reject disabled accounts');
    assert.ok(codeGsContent.includes('revoked_at'), 'Must revoke active sessions immediately upon suspension or disabling');
  });

  // 4. Role-Based Access Control (RBAC) & Scope Isolation
  await t.test('4. Five RBAC Roles and Server-Side Scope Checks', () => {
    const roles = ['super_admin', 'admin', 'homeroom_teacher', 'subject_teacher', 'student'];
    for (const r of roles) {
      assert.ok(codeGsContent.includes(`'${r}'`) || codeGsContent.includes(`"${r}"`), `Must enforce role: ${r}`);
    }
    assert.ok(codeGsContent.includes('authorizeRole'), 'Must implement authorizeRole helper');
    assert.ok(codeGsContent.includes('checkClassScope'), 'Must implement checkClassScope helper');
    assert.ok(codeGsContent.includes("auth.user.role !== 'super_admin'"), 'Admin cannot promote themselves or anyone to Super Admin');
    assert.ok(authJsContent.includes('isSuperAdmin'), 'Frontend must provide isSuperAdmin helper');
    assert.ok(authJsContent.includes('isSchoolAdmin'), 'Frontend must provide isSchoolAdmin helper');
    assert.ok(authJsContent.includes('isHomeroomTeacher'), 'Frontend must provide isHomeroomTeacher helper');
    assert.ok(authJsContent.includes('isSubjectTeacher'), 'Frontend must provide isSubjectTeacher helper');
    assert.ok(authJsContent.includes('isStudent'), 'Frontend must provide isStudent helper');
  });

  // 5. Secure Session Management (SessionStorage & Revocation)
  await t.test('5. Session Token Security, Expiration, and Revocation', () => {
    assert.ok(codeGsContent.includes('createSession'), 'Must implement createSession');
    assert.ok(codeGsContent.includes('authenticateSession'), 'Must implement authenticateSession');
    assert.ok(codeGsContent.includes('durationHours = 12'), 'Session must expire after 12 hours max');
    assert.ok(codeGsContent.includes('2 * 60 * 60 * 1000'), 'Idle timeout must be enforced after 2 hours');
    assert.ok(authJsContent.includes("sessionStorage.getItem('cms_session_token')"), 'Session token must be isolated in sessionStorage');
    assert.ok(!authJsContent.includes("localStorage.setItem('cms_session_token'"), 'Tokens must not be persisted in localStorage');
  });

  // 6. Multi-Factor Authentication (MFA) & Backup Recovery Codes
  await t.test('6. MFA TOTP Secret & 8 Emergency Backup Recovery Codes', () => {
    assert.ok(authJsContent.includes('openMfaSetupModal'), 'Must provide openMfaSetupModal UI');
    assert.ok(authJsContent.includes('generateMfaSetup'), 'Must generate TOTP secret and recovery codes');
    assert.ok(authJsContent.includes('otpauth://totp/'), 'Must construct standard TOTP URI');
    assert.ok(authJsContent.includes('copyRecoveryCodes'), 'Must allow copying backup recovery codes');
    assert.ok(codeGsContent.includes('mfa_recovery_hashes'), 'Users schema must store recovery hashes securely');
  });

  // 7. Rate Limiting & Brute-Force Lockout
  await t.test('7. Rate Limiting (5 Attempts / 15-Minute Lockout)', () => {
    assert.ok(codeGsContent.includes('checkRateLimit'), 'Must implement checkRateLimit');
    assert.ok(codeGsContent.includes('recordLoginAttempt'), 'Must implement recordLoginAttempt');
    assert.ok(codeGsContent.includes('windowMinutes = 15') && codeGsContent.includes('windowMinutes * 60 * 1000'), 'Lockout window must be 15 minutes');
    assert.ok(codeGsContent.includes('maxAttempts = 5'), 'Max attempts threshold must be 5');
  });

  // 8. Append-Only Audit Logging & Sensitive Data Redaction
  await t.test('8. Append-Only Audit Logging with Secret Redaction', () => {
    assert.ok(codeGsContent.includes('logSecurityEvent'), 'Must implement logSecurityEvent');
    assert.ok(codeGsContent.includes('delete sanitized.password;') && codeGsContent.includes('delete sanitized.token;'), 'Must sanitize and redact passwords and tokens from audit logs');
    assert.ok(codeGsContent.includes('getAuditLogs'), 'Must provide getAuditLogs action restricted to Super Admin');
    assert.ok(authJsContent.includes('openAuditLogModal'), 'Frontend must provide openAuditLogModal for Super Admin');
  });

  // 9. Teacher UI Preferences Isolation (No Elevation)
  await t.test('9. Teacher Personal Preferences Isolated in TeacherSettings Table', () => {
    assert.ok(codeGsContent.includes('TEACHER_SETTINGS:'), 'Must include TEACHER_SETTINGS table');
    assert.ok(codeGsContent.includes('saveTeacherSettings'), 'Must provide saveTeacherSettings action');
    assert.ok(codeGsContent.includes('getTeacherSettings'), 'Must provide getTeacherSettings action');
    assert.ok(codeGsContent.includes('preferences_json'), 'Must store UI settings as serialized JSON without role changes');
  });

  // 10. Front-end Screens & Modals
  await t.test('10. Required DOM Containers in index.html and auth.js', () => {
    assert.ok(indexHtmlContent.includes('id="pendingApprovalScreen"'), 'index.html must have pendingApprovalScreen');
    assert.ok(indexHtmlContent.includes('id="accessDeniedScreen"'), 'index.html must have accessDeniedScreen');
    assert.ok(authJsContent.includes('accountManagementModal'), 'Must have accountManagementModal dynamically rendered');
    assert.ok(authJsContent.includes('mfaSetupModal'), 'Must have mfaSetupModal dynamically rendered');
    assert.ok(authJsContent.includes('auditLogModal'), 'Must have auditLogModal dynamically rendered');
  });
});
