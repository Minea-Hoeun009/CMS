/* ========================================================= 
   CMS AUTHENTICATION SYSTEM (Google Apps Script + Google Sheets)
   Database: Google Sheets (CMS_Authentication)
   Providers: Google ID Token + Telegram Login Widget (HMAC)
   Roles: Admin / Teacher
   Status: Pending / Approved / Suspended
   Bot: @classmsbot (9197469089:AAGmv6S5HANBW-6USnZ10U8uGZXKQadaYNw)
========================================================= */

const CFG = {
  USERS: 'Users',
  PROVIDERS: 'Providers',
  REQUESTS: 'LoginRequests',
  LOGS: 'AuditLogs',
  USER_HEADERS: [
    'UserID', 'Name', 'Role', 'Status', 'CreatedAt',
    'ApprovedAt', 'ApprovedBy', 'UpdatedAt'
  ],
  PROVIDER_HEADERS: [
    'ProviderID', 'UserID', 'Provider', 'ExternalID',
    'Email', 'DisplayName', 'VerifiedAt'
  ],
  REQUEST_HEADERS: [
    'RequestID', 'Provider', 'ExternalID', 'Email',
    'DisplayName', 'Status', 'RequestedAt',
    'ReviewedAt', 'ReviewedBy'
  ],
  LOG_HEADERS: [
    'Timestamp', 'ActorUserID', 'Action', 'Target', 'Details'
  ]
};

function prop_(key) {
  return PropertiesService.getScriptProperties().getProperty(key) || '';
}

function db_() {
  const id = prop_('SPREADSHEET_ID');
  if (!id) {
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
    throw new Error('SPREADSHEET_ID is not configured in Script Properties.');
  }
  return SpreadsheetApp.openById(id);
}

function sheet_(name) {
  const sh = db_().getSheetByName(name);
  if (!sh) throw new Error('Missing sheet: ' + name);
  return sh;
}

/**
 * រៀបចំតារាង Sheets ទាំង ៤ និងបង្កើតគណនី Admin ដំបូង
 */
function setupAuth() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Bind this script to a Google Spreadsheet.');

  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', ss.getId());

  const definitions = [
    [CFG.USERS, CFG.USER_HEADERS],
    [CFG.PROVIDERS, CFG.PROVIDER_HEADERS],
    [CFG.REQUESTS, CFG.REQUEST_HEADERS],
    [CFG.LOGS, CFG.LOG_HEADERS]
  ];

  definitions.forEach(([name, headers]) => {
    let sh = ss.getSheetByName(name);
    if (!sh) sh = ss.insertSheet(name);
    if (sh.getLastRow() === 0) {
      sh.getRange(1, 1, 1, headers.length).setValues([headers]);
      sh.setFrozenRows(1);
    } else {
      const existing = sh.getRange(1, 1, 1, headers.length).getDisplayValues()[0];
      if (headers.some((h, i) => existing[i] !== h)) {
        throw new Error('Incorrect headers in sheet: ' + name);
      }
    }
  });

  const adminEmail = prop_('INITIAL_ADMIN_EMAIL').trim().toLowerCase();
  const adminGoogleSub = prop_('INITIAL_ADMIN_GOOGLE_SUB').trim();

  if (adminEmail && adminGoogleSub) {
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const existing = findProvider_('Google', adminGoogleSub);
      if (!existing) {
        const userId = Utilities.getUuid();
        const now = new Date();
        sheet_(CFG.USERS).appendRow([
          userId, 'System Administrator', 'Admin', 'Approved', now, now, adminEmail, now
        ]);
        sheet_(CFG.PROVIDERS).appendRow([
          Utilities.getUuid(), userId, 'Google', adminGoogleSub, adminEmail, 'System Administrator', now
        ]);
      }
    } finally {
      lock.releaseLock();
    }
  }

  return 'Authentication sheets initialized successfully.';
}

function rows_(name) {
  const sh = sheet_(name);
  if (sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues();
}

function findProvider_(provider, externalId) {
  const rows = rows_(CFG.PROVIDERS);
  const index = rows.findIndex(r => String(r[2]) === provider && String(r[3]) === String(externalId));
  if (index < 0) return null;
  return { row: index + 2, values: rows[index] };
}

function findUser_(userId) {
  const rows = rows_(CFG.USERS);
  const index = rows.findIndex(r => String(r[0]) === String(userId));
  if (index < 0) return null;
  return { row: index + 2, values: rows[index] };
}

function findRequest_(requestId) {
  const rows = rows_(CFG.REQUESTS);
  const index = rows.findIndex(r => String(r[0]) === requestId);
  if (index < 0) return null;
  return { row: index + 2, values: rows[index] };
}

function audit_(actor, action, target, details) {
  try {
    sheet_(CFG.LOGS).appendRow([
      new Date(), actor || 'SYSTEM', action, target || '', String(details || '').slice(0, 500)
    ]);
  } catch (e) {
    console.warn('Audit log write error:', e);
  }
}

/* ---------------- GOOGLE VERIFICATION ---------------- */
function verifyGoogle_(idToken) {
  if (typeof idToken !== 'string' || idToken.length < 100 || idToken.length > 10000) {
    throw new Error('Invalid Google credential token.');
  }

  const clientId = prop_('GOOGLE_CLIENT_ID');
  const response = UrlFetchApp.fetch(
    'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(idToken),
    { muteHttpExceptions: true }
  );

  if (response.getResponseCode() !== 200) {
    throw new Error('Google token verification failed.');
  }

  const data = JSON.parse(response.getContentText());
  const issuerValid = ['accounts.google.com', 'https://accounts.google.com'].includes(data.iss);

  if (clientId && data.aud !== clientId) {
    throw new Error('Google token client_id mismatch.');
  }

  if (!issuerValid || String(data.email_verified) !== 'true' || !data.sub || !data.email) {
    throw new Error('Invalid Google identity claims.');
  }

  if (Number(data.exp) <= Math.floor(Date.now() / 1000)) {
    throw new Error('Google token has expired.');
  }

  return {
    provider: 'Google',
    externalId: String(data.sub),
    email: String(data.email).trim().toLowerCase(),
    name: String(data.name || data.email)
  };
}

/* ---------------- TELEGRAM VERIFICATION ---------------- */
function verifyTelegram_(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Missing Telegram data.');
  }

  const botToken = prop_('TELEGRAM_BOT_TOKEN') || '9197469089:AAGmv6S5HANBW-6USnZ10U8uGZXKQadaYNw';
  if (!botToken) throw new Error('Missing TELEGRAM_BOT_TOKEN.');

  const hash = String(payload.hash || '');
  if (!/^[a-f0-9]{64}$/i.test(hash)) {
    throw new Error('Invalid Telegram hash format.');
  }

  const authDate = Number(payload.auth_date);
  const now = Math.floor(Date.now() / 1000);

  if (!authDate || authDate > now + 30 || now - authDate > 300) {
    throw new Error('Telegram login data has expired.');
  }

  const allowed = ['id', 'first_name', 'last_name', 'username', 'photo_url', 'auth_date'];
  const pairs = allowed
    .filter(key => payload[key] !== undefined && payload[key] !== null)
    .map(key => key + '=' + String(payload[key]))
    .sort();

  const dataCheckString = pairs.join('\n');
  const secretKey = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256, botToken, Utilities.Charset.UTF_8
  );

  const calculated = Utilities.computeHmacSha256Signature(dataCheckString, secretKey);
  const calculatedHex = calculated.map(byte => ('0' + ((byte + 256) % 256).toString(16)).slice(-2)).join('');

  if (calculatedHex.toLowerCase() !== hash.toLowerCase()) {
    throw new Error('Telegram signature verification failed.');
  }

  if (!payload.id) throw new Error('Telegram user ID is missing.');

  return {
    provider: 'Telegram',
    externalId: String(payload.id),
    email: '',
    name: [payload.first_name || '', payload.last_name || ''].join(' ').trim() || String(payload.username || 'Telegram User')
  };
}

/* ---------------- REGISTRATION REQUEST ---------------- */
function createRequest_(identity) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const existing = findProvider_(identity.provider, identity.externalId);
    if (existing) {
      const user = findUser_(existing.values[1]);
      if (user) {
        return { status: user.values[3], message: 'អត្តសញ្ញាណនេះមានគណនីរួចរាល់ហើយ។' };
      }
    }

    const requests = rows_(CFG.REQUESTS);
    const duplicate = requests.find(r => 
      String(r[1]) === identity.provider && 
      String(r[2]) === identity.externalId && 
      String(r[5]) === 'Pending'
    );

    if (duplicate) {
      return { status: 'Pending', message: 'សំណើចុះឈ្មោះរបស់អ្នកកំពុងរង់ចាំការអនុម័តពី Admin។' };
    }

    const requestId = Utilities.getUuid();
    sheet_(CFG.REQUESTS).appendRow([
      requestId, identity.provider, identity.externalId, identity.email,
      identity.name, 'Pending', new Date(), '', ''
    ]);

    audit_('SYSTEM', 'REGISTER_REQUEST', identity.provider + ':' + identity.externalId, 'New registration request');

    return { 
      status: 'Pending', 
      requestId: requestId, 
      message: 'បានបញ្ជូនសំណើចុះឈ្មោះជោគជ័យ! សូមរង់ចាំការអនុម័តពី Admin។' 
    };
  } finally {
    lock.releaseLock();
  }
}

function apiRegisterGoogle(idToken) {
  return createRequest_(verifyGoogle_(idToken));
}

function apiRegisterTelegram(payload) {
  return createRequest_(verifyTelegram_(payload));
}

/* ---------------- LOGIN & SESSION ---------------- */
function loginIdentity_(identity) {
  const provider = findProvider_(identity.provider, identity.externalId);
  if (!provider) {
    return { status: 'NOT_REGISTERED', message: 'មិនទាន់មានគណនីក្នុងប្រព័ន្ធទេ។ សូមចុចស្នើសុំចុះឈ្មោះថ្មី។' };
  }

  const user = findUser_(provider.values[1]);
  if (!user) throw new Error('User record is missing.');

  const u = user.values;
  if (u[3] === 'Pending') {
    return { status: 'Pending', message: 'គណនីរបស់អ្នកកំពុងរង់ចាំ Admin អនុម័ត។' };
  }
  if (u[3] === 'Suspended') {
    return { status: 'Suspended', message: 'គណនីរបស់អ្នកត្រូវបានផ្អាកបណ្តោះអាសន្ន (Suspended)។' };
  }
  if (u[3] !== 'Approved') {
    throw new Error('ស្ថានភាពគណនីមិនត្រឹមត្រូវ៖ ' + u[3]);
  }

  return {
    status: 'Approved',
    user: {
      userId: u[0],
      name: u[1],
      role: u[2],
      email: identity.email || provider.values[4]
    }
  };
}

function issueSession_(user) {
  const expires = Math.floor(Date.now() / 1000) + 3600; // 1 ម៉ោង
  const payload = JSON.stringify({
    uid: user.userId,
    role: user.role,
    exp: expires,
    nonce: Utilities.getUuid()
  });

  const encoded = Utilities.base64EncodeWebSafe(payload, Utilities.Charset.UTF_8).replace(/=+$/, '');
  const secret = prop_('SESSION_SECRET') || 'CMS_SECURE_AUTH_SESSION_SECRET_KEY_MIN_32_CHARS_2026';

  const signature = Utilities.computeHmacSha256Signature(encoded, secret, Utilities.Charset.UTF_8);
  const sig = Utilities.base64EncodeWebSafe(signature).replace(/=+$/, '');

  return encoded + '.' + sig;
}

function verifySession_(token) {
  if (typeof token !== 'string' || token.length > 2000) {
    throw new Error('Invalid session token.');
  }

  const parts = token.split('.');
  if (parts.length !== 2) throw new Error('Invalid session format.');

  const secret = prop_('SESSION_SECRET') || 'CMS_SECURE_AUTH_SESSION_SECRET_KEY_MIN_32_CHARS_2026';
  const expected = Utilities.computeHmacSha256Signature(parts[0], secret, Utilities.Charset.UTF_8);
  const expectedSig = Utilities.base64EncodeWebSafe(expected).replace(/=+$/, '');

  if (expectedSig !== parts[1]) {
    throw new Error('Session signature is invalid.');
  }

  const payload = JSON.parse(
    Utilities.newBlob(Utilities.base64DecodeWebSafe(parts[0])).getDataAsString()
  );

  if (Number(payload.exp) <= Math.floor(Date.now() / 1000)) {
    throw new Error('Session expired. Please sign in again.');
  }

  const user = findUser_(payload.uid);
  if (!user || user.values[3] !== 'Approved') {
    throw new Error('Account is not approved.');
  }

  return {
    userId: user.values[0],
    name: user.values[1],
    role: user.values[2]
  };
}

function apiCreateSession(provider, credential) {
  let result;
  if (provider === 'Google') {
    result = loginIdentity_(verifyGoogle_(credential));
  } else if (provider === 'Telegram') {
    result = loginIdentity_(verifyTelegram_(credential));
  } else {
    throw new Error('Unsupported provider: ' + provider);
  }

  if (result.status !== 'Approved') return result;

  return {
    status: 'Approved',
    session: issueSession_(result.user),
    user: result.user
  };
}

/* ---------------- ADMIN APPROVAL ---------------- */
function requireAdmin_(sessionToken) {
  const user = verifySession_(sessionToken);
  if (user.role !== 'Admin') {
    throw new Error('Admin permission required.');
  }
  return user;
}

function apiAdminListRequests(sessionToken) {
  requireAdmin_(sessionToken);
  return rows_(CFG.REQUESTS)
    .filter(r => r[5] === 'Pending')
    .map(r => ({
      requestId: r[0],
      provider: r[1],
      externalId: r[2],
      email: r[3],
      name: r[4],
      status: r[5],
      requestedAt: r[6]
    }));
}

function apiAdminReviewRequest(sessionToken, requestId, decision, role) {
  const admin = requireAdmin_(sessionToken);
  if (!['Approved', 'Rejected'].includes(decision)) {
    throw new Error('Invalid review decision.');
  }
  if (decision === 'Approved' && !['Admin', 'Teacher'].includes(role)) {
    throw new Error('Invalid role.');
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const req = findRequest_(String(requestId));
    if (!req) throw new Error('Request not found.');

    const r = req.values;
    if (r[5] !== 'Pending') {
      throw new Error('Request has already been reviewed.');
    }

    const now = new Date();
    if (decision === 'Rejected') {
      sheet_(CFG.REQUESTS).getRange(req.row, 6, 1, 4).setValues([['Rejected', now, admin.userId, '']]);
      audit_(admin.userId, 'REJECT_REQUEST', requestId, r[1]);
      return { success: true, status: 'Rejected' };
    }

    if (findProvider_(r[1], r[2])) {
      throw new Error('This provider identity is already linked.');
    }

    const userId = Utilities.getUuid();
    sheet_(CFG.USERS).appendRow([
      userId, r[4], role, 'Approved', now, now, admin.userId, now
    ]);
    sheet_(CFG.PROVIDERS).appendRow([
      Utilities.getUuid(), userId, r[1], r[2], r[3], r[4], now
    ]);
    sheet_(CFG.REQUESTS).getRange(req.row, 6, 1, 4).setValues([['Approved', now, admin.userId, '']]);

    audit_(admin.userId, 'APPROVE_REQUEST', requestId, 'Role: ' + role + '; Provider: ' + r[1]);

    return { success: true, status: 'Approved', userId: userId };
  } finally {
    lock.releaseLock();
  }
}

function apiAdminSetUserStatus(sessionToken, userId, status) {
  const admin = requireAdmin_(sessionToken);
  if (!['Approved', 'Suspended'].includes(status)) {
    throw new Error('Invalid status.');
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const target = findUser_(userId);
    if (!target) throw new Error('User not found.');

    const users = rows_(CFG.USERS);
    if (target.values[2] === 'Admin' && target.values[3] === 'Approved' && status !== 'Approved') {
      const activeAdmins = users.filter(r => r[2] === 'Admin' && r[3] === 'Approved');
      if (activeAdmins.length <= 1) {
        throw new Error('Cannot suspend the last approved Admin.');
      }
    }

    sheet_(CFG.USERS).getRange(target.row, 4).setValue(status);
    sheet_(CFG.USERS).getRange(target.row, 8).setValue(new Date());

    audit_(admin.userId, 'SET_USER_STATUS', userId, status);
    return { success: true };
  } finally {
    lock.releaseLock();
  }
}

function apiGetMyProfile(sessionToken) {
  return verifySession_(sessionToken);
}

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Classroom Management System - Authentication')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}
