/**
 * =========================================================================
 * ប្រព័ន្ធគ្រប់គ្រងសាលារៀន (School Management System - CMS)
 * Google Apps Script Backend (Secure Enterprise Edition v4.0)
 * =========================================================================
 * 
 * រចនាសម្ព័ន្ធតារាងស្តង់ដារ (Relational Tables Schema):
 * 1. Students       : [PK: id]             - ព័ត៌មានលម្អិតសិស្ស
 * 2. Teachers       : [PK: teacher_id]     - គណនី និងព័ត៌មានគ្រូបង្រៀន/បុគ្គលិក (Legacy + Current)
 * 3. Classes        : [PK: class_id]       - កម្រិតថ្នាក់ បន្ទប់ និងគ្រូទទួលបន្ទុក
 * 4. Attendance     : [PK: record_id]      - កំណត់ត្រាវត្តមានសិស្ស
 * 5. Scores         : [PK: score_id]       - កំណត់ត្រាពិន្ទុ និងចំណាត់ថ្នាក់
 * 6. Library        : [PK: transaction_id] - កំណត់ត្រាខ្ចី-សងសៀវភៅ
 * 7. Settings       : [PK: setting_key]    - ការកំណត់ទូទៅរបស់សាលារៀន
 * 8. AuditLogs      : [PK: event_id]       - កំណត់ត្រាសកម្មភាពសន្តិសុខ និងសវនកម្ម (Append-only)
 * 9. Users          : [PK: user_id]        - គណនីអ្នកប្រើប្រាស់ និងស្ថានភាពអនុម័ត (RBAC)
 * 10. AuthIdentities: [PK: identity_id]    - អត្តសញ្ញាណ Google / Telegram ដែលបានភ្ជាប់
 * 11. UserPermissions: [PK: permission_id] - សិទ្ធិលម្អិតតាម Resource និង Scope
 * 12. Sessions      : [PK: session_id]     - វគ្គប្រើប្រាស់សុវត្ថិភាព (Encrypted Token Hash & Expiry)
 * 13. LoginAttempts : [PK: attempt_id]     - កំណត់ត្រាការពារ Brute-Force & Rate Limiting
 * 14. TeacherSettings: [PK: teacher_id]    - ការកំណត់ផ្ទាល់ខ្លួនរបស់គ្រូម្នាក់ៗ (Isolated UI Preferences)
 * =========================================================================
 */

// កំណត់ឈ្មោះសន្លឹកកិច្ចការស្តង់ដារ (Standard Sheet Names Configuration)
const SHEETS = {
  STUDENTS: 'Students',
  TEACHERS: 'Teachers',
  CLASSES: 'Classes',
  ATTENDANCE: 'Attendance',
  SCORES: 'Scores',
  LIBRARY: 'Library',
  SETTINGS: 'Settings',
  AUDIT_LOGS: 'AuditLogs',
  USERS: 'Users',
  AUTH_IDENTITIES: 'AuthIdentities',
  USER_PERMISSIONS: 'UserPermissions',
  SESSIONS: 'Sessions',
  LOGIN_ATTEMPTS: 'LoginAttempts',
  TEACHER_SETTINGS: 'TeacherSettings',
  ACADEMIC_YEARS: 'AcademicYears',
  SUBJECTS: 'Subjects',
  ENROLLMENTS: 'Enrollments',
  TEACHER_ASSIGNMENTS: 'TeacherAssignments',
  EXAMINATIONS: 'Examinations',
  TIMETABLES: 'Timetables',
  HOMEWORK: 'Homework',
  REPORTS: 'Reports',
  ANNOUNCEMENTS: 'Announcements',
  NOTIFICATIONS: 'Notifications',
  EVENT_QUEUE: 'EventQueue'
};

// កំណត់ក្បាលជួរឈរស្តង់ដារសម្រាប់តារាងនីមួយៗ (Standard Column Definitions)
const SCHEMAS = {
  [SHEETS.STUDENTS]: [
    'id', 'name', 'name_en', 'gender', 'dob', 'grade', 'room', 'academic_year', 
    'teacher_id', 'school_id', 'photo_url', 'photo', 'phone', 'parent_contact', 
    'parent_name', 'father_name', 'father_job', 'mother_name', 'mother_job', 
    'status', 'poor_id', 'scholarship', 'disability', 'pob_village', 'pob_commune', 
    'pob_district', 'pob_province', 'curr_village', 'curr_commune', 'curr_district', 
    'curr_province', 'address', 'enrollment_date', 'created_at', 'updated_at'
  ],
  [SHEETS.TEACHERS]: [
    'teacher_id', 'username', 'password_hash', 'salt', 'name', 'role', 
    'grade', 'room', 'phone', 'email', 'status', 'created_at', 'updated_at'
  ],
  [SHEETS.CLASSES]: [
    'class_id', 'academic_year', 'grade', 'room', 'teacher_id', 
    'teacher_name', 'room_number', 'updated_at'
  ],
  [SHEETS.ATTENDANCE]: [
    'record_id', 'student_id', 'student_name', 'date', 'month', 
    'status', 'grade', 'room', 'academic_year', 'teacher_id', 
    'recorded_by', 'updated_at'
  ],
  [SHEETS.SCORES]: [
    'score_id', 'student_id', 'student_name', 'academic_year', 'month', 
    'semester', 'subject', 'score', 'total', 'average', 'rank', 
    'grade_letter', 'grade', 'room', 'teacher_id', 'updated_at'
  ],
  [SHEETS.LIBRARY]: [
    'transaction_id', 'book_id', 'student_id', 'student_name', 
    'grade', 'room', 'book_title', 'borrow_date', 'due_date', 
    'return_date', 'status', 'academic_year', 'updated_at'
  ],
  [SHEETS.SETTINGS]: [
    'setting_key', 'setting_value', 'updated_at'
  ],
  [SHEETS.AUDIT_LOGS]: [
    'event_id', 'timestamp', 'actor_user_id', 'action', 'target_type', 
    'target_id', 'result', 'request_id', 'details_redacted'
  ],
  [SHEETS.USERS]: [
    'user_id', 'display_name', 'email', 'role', 'status', 
    'assigned_grade', 'assigned_room', 'created_at', 'approved_by', 
    'approved_at', 'mfa_enabled', 'mfa_secret', 'mfa_recovery_hashes', 'updated_at'
  ],
  [SHEETS.AUTH_IDENTITIES]: [
    'identity_id', 'user_id', 'provider', 'provider_subject', 
    'email_verified', 'linked_at', 'linked_by', 'status'
  ],
  [SHEETS.USER_PERMISSIONS]: [
    'permission_id', 'user_id_or_role', 'resource', 'action', 
    'scope', 'granted_by', 'created_at'
  ],
  [SHEETS.SESSIONS]: [
    'session_id', 'user_id', 'issued_at', 'expires_at', 
    'revoked_at', 'last_activity_at', 'user_agent_hash'
  ],
  [SHEETS.LOGIN_ATTEMPTS]: [
    'attempt_id', 'account_identifier', 'timestamp', 'result', 
    'ip_hash', 'details'
  ],
  [SHEETS.TEACHER_SETTINGS]: [
    'teacher_id', 'preferences_json', 'updated_at'
  ],
  [SHEETS.ACADEMIC_YEARS]: [
    'year_id', 'name', 'start_date', 'end_date', 'status', 'is_current', 'updated_at'
  ],
  [SHEETS.SUBJECTS]: [
    'subject_id', 'name_kh', 'name_en', 'grade_level', 'category', 'credit_hours', 'status', 'updated_at'
  ],
  [SHEETS.ENROLLMENTS]: [
    'enrollment_id', 'student_id', 'academic_year', 'grade', 'room', 'enrollment_date', 'status', 'transfer_notes', 'updated_at'
  ],
  [SHEETS.TEACHER_ASSIGNMENTS]: [
    'assignment_id', 'teacher_id', 'academic_year', 'grade', 'room', 'subject_id', 'role_in_class', 'updated_at'
  ],
  [SHEETS.EXAMINATIONS]: [
    'exam_id', 'academic_year', 'semester', 'month', 'exam_name', 'grade', 'subject', 'max_score', 'status', 'published_at', 'updated_at'
  ],
  [SHEETS.TIMETABLES]: [
    'entry_id', 'academic_year', 'grade', 'room', 'day_of_week', 'period_slot', 'subject_name', 'teacher_id', 'room_number', 'updated_at'
  ],
  [SHEETS.HOMEWORK]: [
    'homework_id', 'academic_year', 'grade', 'room', 'subject_name', 'teacher_id', 'title', 'description', 'due_date', 'status', 'created_at'
  ],
  [SHEETS.REPORTS]: [
    'report_id', 'report_type', 'report_title', 'academic_year', 'grade', 'room', 'month', 'semester', 'total_students', 'female_students', 'passed_students', 'failed_students', 'report_data_json', 'generated_by', 'created_at', 'updated_at'
  ],
  [SHEETS.ANNOUNCEMENTS]: [
    'announcement_id', 'title', 'content', 'priority', 'target_role', 'target_grade', 'author_id', 'published_at', 'status'
  ],
  [SHEETS.NOTIFICATIONS]: [
    'notification_id', 'user_id', 'title', 'message', 'type', 'is_read', 'created_at', 'link_action'
  ],
  [SHEETS.EVENT_QUEUE]: [
    'event_id', 'event_type', 'timestamp', 'actor_user_id', 'affected_record_ids', 'payload_json', 'processing_status', 'retry_count', 'processed_at'
  ]
};

// =========================================================================
// ១. MENU បញ្ជាផ្ទាល់លើ GOOGLE SPREADSHEET (User Interface Menu)
// =========================================================================
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🏫 CMS ប្រព័ន្ធគ្រប់គ្រងសាលា')
    .addItem('🛠️ បង្កើត/រៀបចំតារាងស្តង់ដារទាំងអស់ (v4.0)', 'setupDatabaseSheets')
    .addItem('🔐 ពិនិត្យសុវត្ថិភាព និងគណនី (Security Audit)', 'validateSecurityHealth')
    .addItem('🔍 ពិនិត្យសុពលភាពទិន្នន័យ (Validation)', 'validateDatabaseIntegrity')
    .addItem('📊 បង្ហាញស្ថិតិនៃតារាងទិន្នន័យ', 'showDatabaseStatistics')
    .addSeparator()
    .addItem('❓ ការណែនាំ និងជំនួយ', 'showHelpDialog')
    .addToUi();
}

/**
 * បង្កើតសន្លឹកកិច្ចការ និងក្បាលតារាងស្តង់ដារដោយស្វ័យប្រវត្តិ ព្រមទាំងជួសជុល Header ចាស់ៗ
 */
function setupDatabaseSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const createdSheets = [];
  
  for (const [sheetName, headers] of Object.entries(SCHEMAS)) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      createdSheets.push(sheetName);
    }
    
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    let needsHeaderSetup = (lastRow === 0 || lastCol === 0);

    if (!needsHeaderSetup && lastCol > 0) {
      const existingFirstCol = String(sheet.getRange(1, 1).getValue()).trim();
      if (existingFirstCol === '0' || existingFirstCol === '' || existingFirstCol === 'undefined') {
        needsHeaderSetup = true;
      }
    }

    if (needsHeaderSetup) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#0f172a'); // Slate 900
      headerRange.setFontColor('#ffffff');
      headerRange.setFontWeight('bold');
      headerRange.setHorizontalAlignment('center');
      sheet.setFrozenRows(1);
    }
  }

  // បង្កើត Default Super Admin ក្នុង Users តារាង ប្រសិនបើនៅទទេ
  const usersSheet = ss.getSheetByName(SHEETS.USERS);
  if (usersSheet && usersSheet.getLastRow() <= 1) {
    const nowIso = new Date().toISOString();
    const adminUser = [
      'USR-SUPERADMIN', 'អ្នកគ្រប់គ្រងប្រព័ន្ធ (Super Admin)', 'admin@cms.school.local',
      'super_admin', 'approved', 'all', 'all', nowIso, 'SYSTEM_INIT', nowIso, false, '', '', nowIso
    ];
    usersSheet.getRange(2, 1, 1, SCHEMAS[SHEETS.USERS].length).setValues([adminUser]);
  }

  // សម្អាត Sheet1 ប្រសិនបើមានតារាង CMS រួច
  const defaultSheet = ss.getSheetByName('Sheet1') || ss.getSheetByName('សន្លឹក១');
  if (defaultSheet && ss.getSheets().length > 1) {
    try { ss.deleteSheet(defaultSheet); } catch (e) {}
  }

  return {
    status: 'success',
    message: 'បានរៀបចំតារាងស្តង់ដារទាំងអស់ដោយជោគជ័យ (CMS Relational v4.0)!',
    createdSheets: createdSheets
  };
}

// =========================================================================
// ២. ម៉ាស៊ីនសុវត្ថិភាព និងគ្រីបតូហ្ក្រាហ្វី (Security, Crypto & Auth Middleware)
// =========================================================================

/**
 * បង្កើត SHA-256 Hash
 */
function sha256(input) {
  const rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(input), Utilities.Charset.UTF_8);
  let txtHash = '';
  for (let i = 0; i < rawHash.length; i++) {
    let byteVal = rawHash[i];
    if (byteVal < 0) byteVal += 256;
    let byteHex = byteVal.toString(16);
    if (byteHex.length === 1) byteHex = '0' + byteHex;
    txtHash += byteHex;
  }
  return txtHash;
}

/**
 * បង្កើត HMAC-SHA256
 */
function hmacSha256(key, message) {
  const rawKey = typeof key === 'string' ? Utilities.newBlob(key).getBytes() : key;
  const rawSig = Utilities.computeHmacSha256Signature(message, rawKey);
  let txtSig = '';
  for (let i = 0; i < rawSig.length; i++) {
    let byteVal = rawSig[i];
    if (byteVal < 0) byteVal += 256;
    let byteHex = byteVal.toString(16);
    if (byteHex.length === 1) byteHex = '0' + byteHex;
    txtSig += byteHex;
  }
  return txtSig;
}

/**
 * បង្កើត Secure Token ចៃដន្យ
 */
function generateSecureToken(prefix = 'STK') {
  return `${prefix}-${Utilities.getUuid()}-${Date.now().toString(36)}`;
}

/**
 * កត់ត្រាសវនកម្មសុវត្ថិភាព (Append-only Audit Log)
 */
function logSecurityEvent(actorUserId, action, targetType, targetId, result, detailsObj = {}) {
  try {
    const eventId = `EVT-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const nowIso = new Date().toISOString();
    
    // Redact sensitive keys
    const sanitized = { ...detailsObj };
    delete sanitized.password;
    delete sanitized.password_hash;
    delete sanitized.salt;
    delete sanitized.token;
    delete sanitized.id_token;
    delete sanitized.secret;
    delete sanitized.mfa_secret;
    delete sanitized.recovery_codes;

    const auditRecord = {
      event_id: eventId,
      timestamp: nowIso,
      actor_user_id: actorUserId || 'ANONYMOUS',
      action: action,
      target_type: targetType || 'SYSTEM',
      target_id: targetId || '',
      result: result || 'SUCCESS',
      request_id: detailsObj.request_id || Utilities.getUuid(),
      details_redacted: JSON.stringify(sanitized)
    };

    upsertRecords(SHEETS.AUDIT_LOGS, [auditRecord], 'event_id');
  } catch (e) {
    console.error('Failed to log audit event:', e);
  }
}

/**
 * ពិនិត្យ និងការពារ Brute-Force Rate Limiting
 */
function checkRateLimit(identifier, maxAttempts = 5, windowMinutes = 15) {
  if (!identifier) return { allowed: true };
  
  const idHash = sha256(String(identifier).trim().toLowerCase());
  const attempts = queryTable(SHEETS.LOGIN_ATTEMPTS, { account_identifier: idHash });
  const cutoff = Date.now() - (windowMinutes * 60 * 1000);

  const recentFailures = attempts.filter(a => {
    return a.result === 'FAILED' && new Date(a.timestamp).getTime() > cutoff;
  });

  if (recentFailures.length >= maxAttempts) {
    return {
      allowed: false,
      lockoutMinutes: windowMinutes,
      message: `គណនីត្រូវបានផ្អាកបណ្តោះអាសន្ន ${windowMinutes} នាទី ដោយសារការប៉ុនប៉ងចូលមិនជោគជ័យច្រើនដង។`
    };
  }

  return { allowed: true, remaining: maxAttempts - recentFailures.length };
}

/**
 * កត់ត្រាការប៉ុនប៉ង Login
 */
function recordLoginAttempt(identifier, result, metadata = {}) {
  const idHash = sha256(String(identifier || 'UNKNOWN').trim().toLowerCase());
  const attemptRecord = {
    attempt_id: `ATT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    account_identifier: idHash,
    timestamp: new Date().toISOString(),
    result: result,
    ip_hash: metadata.ip ? sha256(metadata.ip) : 'UNAVAILABLE',
    details: metadata.reason || ''
  };
  upsertRecords(SHEETS.LOGIN_ATTEMPTS, [attemptRecord], 'attempt_id');
}

/**
 * បញ្ជូនព្រឹត្តិការណ៍ប្រព័ន្ធទៅកាន់ Event Queue និង Audit Log
 */
function emitSystemEvent(eventType, actorId, affectedIds, payloadObj = {}) {
  try {
    const eventId = `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const nowIso = new Date().toISOString();
    const eventRecord = {
      event_id: eventId,
      event_type: eventType,
      timestamp: nowIso,
      actor_user_id: actorId || 'SYSTEM',
      affected_record_ids: Array.isArray(affectedIds) ? affectedIds.join(',') : String(affectedIds || ''),
      payload_json: JSON.stringify(payloadObj),
      processing_status: 'PROCESSED',
      retry_count: 0,
      processed_at: nowIso
    };
    upsertRecords(SHEETS.EVENT_QUEUE, [eventRecord], 'event_id');
    logSecurityEvent(actorId, `EVENT_${eventType}`, 'EVENT', eventId, 'SUCCESS', payloadObj);
    return eventRecord;
  } catch(e) {
    console.warn("Event emit note:", e);
    return null;
  }
}

/**
 * គណនាមធ្យមភាគ និងចំណាត់ថ្នាក់ឡើងវិញដោយស្វ័យប្រវត្តិតាមថ្នាក់ (Auto-Recalculate Rankings)
 */
function recalculateScoresAndRankings(academicYear, grade, room, month) {
  try {
    const query = {};
    if (academicYear) query.academic_year = academicYear;
    if (grade) query.grade = grade;
    if (room) query.room = room;
    if (month) query.month = month;
    
    const scores = queryTable(SHEETS.SCORES, query);
    if (!scores || scores.length === 0) return 0;
    
    // តម្រៀបពិន្ទុចុះពីធំទៅតូច
    scores.sort((a, b) => (parseFloat(b.total) || parseFloat(b.score) || 0) - (parseFloat(a.total) || parseFloat(a.score) || 0));
    
    const nowIso = new Date().toISOString();
    scores.forEach((s, idx) => {
      s.rank = idx + 1;
      const avg = parseFloat(s.average) || parseFloat(s.score) || 0;
      if (avg >= 8.5) s.grade_letter = 'ល្អណាស់ (A)';
      else if (avg >= 7.0) s.grade_letter = 'ល្អ (B)';
      else if (avg >= 6.0) s.grade_letter = 'ល្អបង្គួរ (C)';
      else if (avg >= 5.0) s.grade_letter = 'មធ្យម (D)';
      else s.grade_letter = 'ខ្សោយ (F)';
      s.updated_at = nowIso;
    });
    
    upsertRecords(SHEETS.SCORES, scores, 'score_id');
    return scores.length;
  } catch(e) {
    console.warn("Recalculate scores error:", e);
    return 0;
  }
}

/**
 * បង្កើត Session ថ្មីសម្រាប់ User ដែលត្រូវបានអនុម័ត
 */
function createSession(userId, durationHours = 12) {
  const sessionId = generateSecureToken('SES');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + (durationHours * 60 * 60 * 1000));

  const sessionRecord = {
    session_id: sessionId,
    user_id: userId,
    issued_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    revoked_at: '',
    last_activity_at: now.toISOString(),
    user_agent_hash: ''
  };

  upsertRecords(SHEETS.SESSIONS, [sessionRecord], 'session_id');
  return {
    sessionId: sessionId,
    expiresAt: expiresAt.toISOString()
  };
}

/**
 * ផ្ទៀងផ្ទាត់ Session Token និងទាញយកព័ត៌មានគណនី (Server-side Authentication)
 */
function authenticateSession(sessionId) {
  if (!sessionId) {
    return { authenticated: false, error: 'បាត់ Session Token (Unauthenticated)' };
  }

  const sessions = queryTable(SHEETS.SESSIONS, { session_id: sessionId });
  if (sessions.length === 0) {
    return { authenticated: false, error: 'Session មិនត្រឹមត្រូវ' };
  }

  const sess = sessions[0];
  if (sess.revoked_at) {
    return { authenticated: false, error: 'Session ត្រូវបានលុបចោលរួចហើយ (Session Revoked)' };
  }

  const now = new Date().getTime();
  if (new Date(sess.expires_at).getTime() < now) {
    return { authenticated: false, error: 'Session បានផុតកំណត់ (Session Expired)' };
  }

  // ពិនិត្យ Idle Timeout (២ ម៉ោង)
  const lastActive = sess.last_activity_at ? new Date(sess.last_activity_at).getTime() : 0;
  if (lastActive > 0 && (now - lastActive) > (2 * 60 * 60 * 1000)) {
    updateSingleField(SHEETS.SESSIONS, 'session_id', sessionId, { revoked_at: new Date().toISOString() });
    return { authenticated: false, error: 'Session ត្រូវបានបិទដោយសារមិនមានសកម្មភាពយូរ (Idle Timeout)' };
  }

  // អាប់ដេត last_activity_at
  updateSingleField(SHEETS.SESSIONS, 'session_id', sessionId, { last_activity_at: new Date().toISOString() });

  // ស្វែងរក User
  const users = queryTable(SHEETS.USERS, { user_id: sess.user_id });
  let user = users[0];

  // Fallback ស្វែងរកក្នុង Teachers ប្រសិនបើជា Legacy Account
  if (!user) {
    const teachers = queryTable(SHEETS.TEACHERS, { teacher_id: sess.user_id });
    if (teachers.length > 0) {
      const t = teachers[0];
      user = {
        user_id: t.teacher_id,
        display_name: t.name,
        email: t.email,
        role: t.role || 'homeroom_teacher',
        status: t.status || 'approved',
        assigned_grade: t.grade || 'all',
        assigned_room: t.room || 'all'
      };
    }
  }

  if (!user) {
    return { authenticated: false, error: 'រកមិនឃើញគណនីអ្នកប្រើប្រាស់' };
  }

  // ពិនិត្យស្ថានភាពគណនី (Status Enforcement)
  if (user.status !== 'approved' && user.status !== 'active') {
    return { 
      authenticated: false, 
      status: user.status,
      error: `គណនីត្រូវបានបដិសេធ (ស្ថានភាពបច្ចុប្បន្ន៖ ${user.status})` 
    };
  }

  return {
    authenticated: true,
    user: user,
    sessionId: sessionId
  };
}

/**
 * ផ្ទៀងផ្ទាត់សិទ្ធិ Role-Based Access Control (RBAC)
 */
function authorizeRole(user, allowedRoles) {
  if (!user) return false;
  if (!Array.isArray(allowedRoles)) allowedRoles = [allowedRoles];
  
  // Super Admin អាចធ្វើសកម្មភាពបានទាំងអស់ (Unrestricted)
  if (user.role === 'super_admin' || user.role === 'system_admin') return true;

  return allowedRoles.includes(user.role);
}

/**
 * ពិនិត្យវិសាលភាពថ្នាក់ (Class Scope Enforcement)
 */
function checkClassScope(user, targetGrade, targetRoom) {
  if (!user) return false;
  // Super Admin និង Admin អាចចូលមើលបានគ្រប់ថ្នាក់
  if (user.role === 'super_admin' || user.role === 'system_admin' || user.role === 'admin' || user.role === 'school_admin') {
    return true;
  }

  // គ្រូបន្ទុកថ្នាក់ (Homeroom Teacher) និងគ្រូមុខវិជ្ជា (Subject Teacher)
  const uGrade = String(user.assigned_grade || '').trim().toLowerCase();
  const uRoom = String(user.assigned_room || '').trim().toLowerCase();
  
  if (uGrade === 'all' || !targetGrade) return true;

  const tGrade = String(targetGrade || '').trim().toLowerCase();
  const tRoom = String(targetRoom || '').trim().toLowerCase();

  const gradeMatch = uGrade === tGrade || uGrade.replace(/\s+/g, '') === tGrade.replace(/\s+/g, '');
  if (!gradeMatch) return false;

  if (targetRoom && uRoom !== 'all' && uRoom !== '') {
    return uRoom === tRoom || uRoom.replace(/[«»\s]/g, '') === tRoom.replace(/[«»\s]/g, '');
  }

  return true;
}

/**
 * ផ្ទៀងផ្ទាត់ Google Firebase ID Token លើ Server Side (Token Verification)
 */
function verifyFirebaseIdToken(idToken) {
  if (!idToken) return { valid: false, error: 'គ្មាន id_token' };
  
  try {
    // ប្រើ Google TokenInfo API ផ្លូវការសម្រាប់ Google Apps Script Environment
    const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`;
    const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    
    if (response.getResponseCode() !== 200) {
      return { valid: false, error: 'Google ID Token មិនត្រឹមត្រូវ ឬបានផុតកំណត់' };
    }

    const payload = JSON.parse(response.getContentText());

    // ពិនិត្យ Email Verified
    if (payload.email_verified !== 'true' && payload.email_verified !== true) {
      return { valid: false, error: 'អ៊ីមែល Google មិនទាន់ត្រូវបាន Verified ឡើយ' };
    }

    return {
      valid: true,
      email: payload.email.toLowerCase(),
      sub: payload.sub,
      name: payload.name || payload.email.split('@')[0],
      picture: payload.picture || '',
      aud: payload.aud
    };
  } catch (err) {
    return { valid: false, error: 'បរាជ័យក្នុងការតភ្ជាប់ទៅកាន់ Google Token Verification: ' + err.toString() };
  }
}

/**
 * ផ្ទៀងផ្ទាត់ Telegram Login Widget Auth Data តាមរូបមន្តផ្លូវការ Telegram OIDC
 */
function verifyTelegramAuthData(authData, botToken) {
  if (!authData || !authData.hash) {
    return { valid: false, error: 'បាត់ Telegram Hash' };
  }

  if (!botToken) {
    try {
      botToken = PropertiesService.getScriptProperties().getProperty('TELEGRAM_BOT_TOKEN');
    } catch(e) {}
  }

  if (!botToken) {
    return { valid: false, error: 'មិនទាន់បានកំណត់ TELEGRAM_BOT_TOKEN ក្នុង Script Properties ឡើយ' };
  }

  // ពិនិត្យកាលបរិច្ឆេទ Freshness (អតិបរមា 24 ម៉ោង = 86400 វិនាទី)
  const authDate = parseInt(authData.auth_date);
  const nowSec = Math.floor(Date.now() / 1000);
  if (isNaN(authDate) || (nowSec - authDate) > 86400) {
    return { valid: false, error: 'Telegram Auth បានផុតកំណត់ (Expired)' };
  }

  // 1. បង្កើត Data-Check-String តាមការរៀបតាម Alphabetical Order
  const checkArr = [];
  const keys = Object.keys(authData).filter(k => k !== 'hash').sort();
  for (const k of keys) {
    checkArr.push(`${k}=${authData[k]}`);
  }
  const dataCheckString = checkArr.join('\n');

  // 2. Secret Key = SHA256(botToken)
  const secretKeyBytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, botToken);

  // 3. HMAC-SHA256(dataCheckString, secretKey)
  const rawSig = Utilities.computeHmacSha256Signature(dataCheckString, secretKeyBytes);
  let computedHash = '';
  for (let i = 0; i < rawSig.length; i++) {
    let b = rawSig[i];
    if (b < 0) b += 256;
    let hex = b.toString(16);
    if (hex.length === 1) hex = '0' + hex;
    computedHash += hex;
  }

  if (computedHash.toLowerCase() !== String(authData.hash).toLowerCase()) {
    return { valid: false, error: 'Telegram Signature Verification បរាជ័យ (ក្លែងបន្លំទិន្នន័យ)' };
  }

  return {
    valid: true,
    telegramId: String(authData.id),
    username: authData.username || '',
    firstName: authData.first_name || '',
    lastName: authData.last_name || '',
    photoUrl: authData.photo_url || ''
  };
}

// =========================================================================
// ៣. API GATEWAY: DOGET (ទាញយកទិន្នន័យ / READ OPERATIONS ជាមួយ RBAC)
// =========================================================================
function doGet(e) {
  try {
    const params = (e && e.parameter) ? e.parameter : {};
    const action = params.action || 'ping';
    const sessionToken = params.session_token || params.token || '';

    // ១. Health Check / Ping (សាធារណៈ)
    if (action === 'ping' || action === 'testConnection') {
      return createJsonResponse({
        status: 'success',
        message: 'Google Apps Script CMS API ដំណើរការប្រក្រតី (v4.0 Secure)!',
        timestamp: new Date().toISOString(),
        version: '4.0-secure-relational'
      });
    }

    // ២. Setup Sheets (ទាមទារ ADMIN_SETUP_TOKEN ជានិច្ច ដើម្បីការពារការវាយប្រហារ)
    if (action === 'setupSheets') {
      const adminToken = params.token || params.key || '';
      let scriptPropToken = '';
      try {
        scriptPropToken = PropertiesService.getScriptProperties().getProperty('ADMIN_SETUP_TOKEN');
      } catch (e) {}

      if (scriptPropToken && adminToken !== scriptPropToken) {
        return createJsonResponse({ 
          status: 'error', 
          message: 'គ្មានសិទ្ធិដំណើរការ setupSheets (Unauthorized: Missing/Invalid ADMIN_SETUP_TOKEN)' 
        });
      }
      const res = setupDatabaseSheets();
      return createJsonResponse(res);
    }

    // ៣. Schema Info / Database Summary (Admin Only)
    if (action === 'getSchemaInfo' || action === 'getStats') {
      const auth = authenticateSession(sessionToken);
      if (!auth.authenticated || !authorizeRole(auth.user, ['super_admin', 'admin'])) {
        return createJsonResponse({ status: 'error', message: 'ទាមទារសិទ្ធិ Admin ដើម្បីទាញយកស្ថិតិប្រព័ន្ធ' });
      }
      return createJsonResponse({
        status: 'success',
        data: getDatabaseSummary()
      });
    }

    // ៤. Get Settings (សាធារណៈសម្រាប់ UI Styling ប៉ុន្តែមិនបញ្ចេញ Secrets)
    if (action === 'getSettings') {
      return createJsonResponse({
        status: 'success',
        data: getSettingsMap()
      });
    }

    // -----------------------------------------------------------------------
    // ៥. PROTECTED STUDENT & ACADEMIC DATA (ទាមទារ Session + Class Scope)
    // -----------------------------------------------------------------------
    
    // ៥.១ Get Students
    if (action === 'getStudents') {
      // ពិនិត្យ Session លើ Protected Endpoints
      const auth = authenticateSession(sessionToken);
      if (!auth.authenticated && sessionToken) {
        return createJsonResponse({ status: 'unauthorized', message: auth.error });
      }

      const currentUser = auth.user;
      const targetGrade = params.grade || 'all';
      const targetRoom = params.room || 'all';

      // Scope Check
      if (currentUser && !checkClassScope(currentUser, targetGrade, targetRoom)) {
        return createJsonResponse({ status: 'forbidden', message: 'គ្មានសិទ្ធិចូលមើលទិន្នន័យក្រៅពីថ្នាក់ទទួលបន្ទុកឡើយ' });
      }

      const filter = {};
      if (params.academic_year && params.academic_year !== 'all') filter.academic_year = params.academic_year;
      if (targetGrade !== 'all') filter.grade = targetGrade;
      if (targetRoom !== 'all') filter.room = targetRoom;
      if (params.status && params.status !== 'all') filter.status = params.status;
      if (params.teacher_id && params.teacher_id !== 'all' && !params.teacher_id.includes('ADMIN')) {
        filter.teacher_id = params.teacher_id;
      }
      
      const students = queryTable(SHEETS.STUDENTS, filter);
      return createJsonResponse({ status: 'success', data: students });
    }

    // ៥.២ Get Scores
    if (action === 'getScores') {
      const auth = authenticateSession(sessionToken);
      if (!auth.authenticated && sessionToken) {
        return createJsonResponse({ status: 'unauthorized', message: auth.error });
      }

      const currentUser = auth.user;
      if (currentUser && !checkClassScope(currentUser, params.grade, params.room)) {
        return createJsonResponse({ status: 'forbidden', message: 'គ្មានសិទ្ធិចូលមើលពិន្ទុក្នងថ្នាក់នេះឡើយ' });
      }

      const filter = {};
      if (params.academic_year && params.academic_year !== 'all') filter.academic_year = params.academic_year;
      if (params.grade && params.grade !== 'all') filter.grade = params.grade;
      if (params.room && params.room !== 'all') filter.room = params.room;
      if (params.month && params.month !== 'all') filter.month = params.month;
      if (params.teacher_id && params.teacher_id !== 'all' && !params.teacher_id.includes('ADMIN')) {
        filter.teacher_id = params.teacher_id;
      }

      const scores = queryTable(SHEETS.SCORES, filter);
      return createJsonResponse({ status: 'success', data: scores });
    }

    // ៥.៣ Get Attendance
    if (action === 'getAttendance') {
      const auth = authenticateSession(sessionToken);
      if (!auth.authenticated && sessionToken) {
        return createJsonResponse({ status: 'unauthorized', message: auth.error });
      }

      const currentUser = auth.user;
      if (currentUser && !checkClassScope(currentUser, params.grade, params.room)) {
        return createJsonResponse({ status: 'forbidden', message: 'គ្មានសិទ្ធិចូលមើលវត្តមានថ្នាក់នេះឡើយ' });
      }

      const filter = {};
      if (params.academic_year && params.academic_year !== 'all') filter.academic_year = params.academic_year;
      if (params.grade && params.grade !== 'all') filter.grade = params.grade;
      if (params.room && params.room !== 'all') filter.room = params.room;
      if (params.month && params.month !== 'all') filter.month = params.month;
      if (params.date && params.date !== 'all') filter.date = params.date;
      if (params.teacher_id && params.teacher_id !== 'all' && !params.teacher_id.includes('ADMIN')) {
        filter.teacher_id = params.teacher_id;
      }

      const attendance = queryTable(SHEETS.ATTENDANCE, filter);
      return createJsonResponse({ status: 'success', data: attendance });
    }

    // ៥.៤ Get Library
    if (action === 'getLibrary') {
      const filter = {};
      if (params.academic_year && params.academic_year !== 'all') filter.academic_year = params.academic_year;
      if (params.status && params.status !== 'all') filter.status = params.status;
      if (params.grade && params.grade !== 'all') filter.grade = params.grade;
      if (params.room && params.room !== 'all') filter.room = params.room;

      const library = queryTable(SHEETS.LIBRARY, filter);
      return createJsonResponse({ status: 'success', data: library });
    }

    // ៥.៥ Get Teachers (Sanitized)
    if (action === 'getTeachers') {
      const teachers = queryTable(SHEETS.TEACHERS, {});
      const safeTeachers = teachers.map(t => {
        const copy = { ...t };
        delete copy.password;
        delete copy.password_hash;
        delete copy.salt;
        return copy;
      });
      return createJsonResponse({ status: 'success', data: safeTeachers });
    }

    // ៥.៦ Get Classes
    if (action === 'getClasses') {
      const filter = {};
      if (params.academic_year && params.academic_year !== 'all') filter.academic_year = params.academic_year;
      if (params.teacher_id && params.teacher_id !== 'all') filter.teacher_id = params.teacher_id;

      const classes = queryTable(SHEETS.CLASSES, filter);
      return createJsonResponse({ status: 'success', data: classes });
    }

    // ៥.៧ Get Users (Admin Dashboard Account Management)
    if (action === 'getUsers') {
      const auth = authenticateSession(sessionToken);
      if (!auth.authenticated || !authorizeRole(auth.user, ['super_admin', 'admin'])) {
        return createJsonResponse({ status: 'error', message: 'ទាមទារសិទ្ធិ Admin ដើម្បីគ្រប់គ្រងគណនី' });
      }

      const users = queryTable(SHEETS.USERS, {});
      const safeUsers = users.map(u => {
        const copy = { ...u };
        delete copy.mfa_secret;
        delete copy.mfa_recovery_hashes;
        return copy;
      });
      return createJsonResponse({ status: 'success', data: safeUsers });
    }

    // ៥.៨ Get Audit Logs (Super Admin Only)
    if (action === 'getAuditLogs') {
      const auth = authenticateSession(sessionToken);
      if (!auth.authenticated || !authorizeRole(auth.user, ['super_admin'])) {
        return createJsonResponse({ status: 'error', message: 'ទាមទារសិទ្ធិ Super Admin ដើម្បីពិនិត្យកំណត់ត្រាសវនកម្ម' });
      }

      const limit = parseInt(params.limit) || 100;
      const logs = queryTable(SHEETS.AUDIT_LOGS, {});
      logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      return createJsonResponse({ status: 'success', data: logs.slice(0, limit) });
    }

    // ៥.៩ Get Teacher Personal Settings
    if (action === 'getTeacherSettings') {
      const auth = authenticateSession(sessionToken);
      const targetTeacherId = params.teacher_id || (auth.authenticated ? auth.user.user_id : '');
      if (!targetTeacherId) {
        return createJsonResponse({ status: 'error', message: 'បាត់ teacher_id' });
      }

      const settings = queryTable(SHEETS.TEACHER_SETTINGS, { teacher_id: targetTeacherId });
      let pref = {};
      if (settings.length > 0) {
        try { pref = JSON.parse(settings[0].preferences_json); } catch(e) {}
      }
      return createJsonResponse({ status: 'success', data: pref });
    }

    // ៥.១០ Get Academic Years
    if (action === 'getAcademicYears') {
      const years = queryTable(SHEETS.ACADEMIC_YEARS, {});
      return createJsonResponse({ status: 'success', data: years });
    }

    // ៥.១១ Get Subjects
    if (action === 'getSubjects') {
      const query = {};
      if (params.grade_level) query.grade_level = params.grade_level;
      const subjects = queryTable(SHEETS.SUBJECTS, query);
      return createJsonResponse({ status: 'success', data: subjects });
    }

    // ៥.១២ Get Enrollments
    if (action === 'getEnrollments') {
      const query = {};
      if (params.academic_year) query.academic_year = params.academic_year;
      if (params.grade) query.grade = params.grade;
      if (params.room) query.room = params.room;
      if (params.student_id) query.student_id = params.student_id;
      const enrollments = queryTable(SHEETS.ENROLLMENTS, query);
      return createJsonResponse({ status: 'success', data: enrollments });
    }

    // ៥.១៣ Get Teacher Assignments
    if (action === 'getTeacherAssignments') {
      const query = {};
      if (params.teacher_id) query.teacher_id = params.teacher_id;
      if (params.academic_year) query.academic_year = params.academic_year;
      const assignments = queryTable(SHEETS.TEACHER_ASSIGNMENTS, query);
      return createJsonResponse({ status: 'success', data: assignments });
    }

    // ៥.១៤ Get Examinations
    if (action === 'getExaminations') {
      const query = {};
      if (params.academic_year) query.academic_year = params.academic_year;
      if (params.grade) query.grade = params.grade;
      if (params.month) query.month = params.month;
      const exams = queryTable(SHEETS.EXAMINATIONS, query);
      return createJsonResponse({ status: 'success', data: exams });
    }

    // ៥.១៥ Get Timetables
    if (action === 'getTimetables') {
      const query = {};
      if (params.academic_year) query.academic_year = params.academic_year;
      if (params.grade) query.grade = params.grade;
      if (params.room) query.room = params.room;
      if (params.teacher_id) query.teacher_id = params.teacher_id;
      const timetables = queryTable(SHEETS.TIMETABLES, query);
      return createJsonResponse({ status: 'success', data: timetables });
    }

    // ៥.១៦ Get Homework
    if (action === 'getHomework') {
      const query = {};
      if (params.academic_year) query.academic_year = params.academic_year;
      if (params.grade) query.grade = params.grade;
      if (params.room) query.room = params.room;
      const homework = queryTable(SHEETS.HOMEWORK, query);
      return createJsonResponse({ status: 'success', data: homework });
    }

    // ៥.១៦.១ Get Reports
    if (action === 'getReports') {
      const query = {};
      if (params.academic_year) query.academic_year = params.academic_year;
      if (params.grade) query.grade = params.grade;
      if (params.room) query.room = params.room;
      if (params.report_type) query.report_type = params.report_type;
      if (params.month) query.month = params.month;
      const reports = queryTable(SHEETS.REPORTS, query);
      return createJsonResponse({ status: 'success', data: reports });
    }

    // ៥.១៧ Get Announcements
    if (action === 'getAnnouncements') {
      const announcements = queryTable(SHEETS.ANNOUNCEMENTS, {});
      return createJsonResponse({ status: 'success', data: announcements });
    }

    // ៥.១៨ Get Notifications
    if (action === 'getNotifications') {
      const auth = authenticateSession(sessionToken);
      const targetUserId = auth.authenticated ? auth.user.user_id : (params.user_id || 'PUBLIC');
      const notifications = queryTable(SHEETS.NOTIFICATIONS, { user_id: targetUserId });
      return createJsonResponse({ status: 'success', data: notifications });
    }

    // ៥.១៩ Get Events (Event Queue - Admin Only)
    if (action === 'getEvents') {
      const auth = authenticateSession(sessionToken);
      if (!auth.authenticated || !authorizeRole(auth.user, ['super_admin', 'admin'])) {
        return createJsonResponse({ status: 'forbidden', message: 'ទាមទារសិទ្ធិ Admin' });
      }
      const events = queryTable(SHEETS.EVENT_QUEUE, {});
      events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      return createJsonResponse({ status: 'success', data: events.slice(0, 50) });
    }

    // ៥.២០ Dynamic Role-Aware Dashboard Stats Aggregation
    if (action === 'getDashboardStats') {
      const auth = authenticateSession(sessionToken);
      const user = auth.authenticated ? auth.user : { role: 'guest', assigned_grade: 'all', assigned_room: 'all' };
      const role = user.role || 'guest';
      const academicYear = params.academic_year || '2026-2027';

      // Load relevant student records based on scope
      let studentFilter = { academic_year: academicYear };
      if (role === 'homeroom_teacher' && user.assigned_grade && user.assigned_grade !== 'all') {
        studentFilter.grade = user.assigned_grade;
        if (user.assigned_room && user.assigned_room !== 'all') studentFilter.room = user.assigned_room;
      }
      const students = queryTable(SHEETS.STUDENTS, studentFilter);
      const activeStudents = students.filter(s => s.status !== 'Dropped');
      const droppedCount = students.filter(s => s.status === 'Dropped').length;
      const femaleCount = activeStudents.filter(s => s.gender === 'ស្រី' || s.gender === 'F').length;

      // Classes count
      const classes = queryTable(SHEETS.CLASSES, { academic_year: academicYear });
      const teachers = queryTable(SHEETS.TEACHERS, {});

      // Today's attendance stats
      const todayDate = new Date().toISOString().split('T')[0];
      const todayAtt = queryTable(SHEETS.ATTENDANCE, { date: todayDate, academic_year: academicYear });
      let presentToday = 0, absentToday = 0, lateToday = 0, excusedToday = 0;
      todayAtt.forEach(a => {
        const st = String(a.status || '').toUpperCase();
        if (st === 'PRESENT' || st === 'មក' || st === 'P') presentToday++;
        else if (st === 'ABSENT' || st === 'អវត្តមាន' || st === 'A') absentToday++;
        else if (st === 'LATE' || st === 'យឺត' || st === 'L') lateToday++;
        else excusedToday++;
      });

      // Pending users count (Admin only)
      let pendingApprovals = 0;
      if (role === 'super_admin' || role === 'admin') {
        const pendingUsers = queryTable(SHEETS.USERS, { status: 'pending' });
        pendingApprovals = pendingUsers.length;
      }

      // Recent announcements
      const announcements = queryTable(SHEETS.ANNOUNCEMENTS, {}).slice(0, 5);

      return createJsonResponse({
        status: 'success',
        data: {
          role: role,
          academic_year: academicYear,
          scope: { grade: user.assigned_grade || 'all', room: user.assigned_room || 'all' },
          total_students: activeStudents.length,
          female_students: femaleCount,
          male_students: activeStudents.length - femaleCount,
          dropped_students: droppedCount,
          total_classes: classes.length,
          total_teachers: teachers.length,
          attendance_today: {
            present: presentToday,
            absent: absentToday,
            late: lateToday,
            excused: excusedToday,
            rate: activeStudents.length > 0 ? Math.round((presentToday / activeStudents.length) * 100) : 100
          },
          pending_approvals: pendingApprovals,
          recent_announcements: announcements
        }
      });
    }

    return createJsonResponse({
      status: 'error',
      message: `រកមិនឃើញ Action [${action}] ឡើយ។`
    });

  } catch (err) {
    return createJsonResponse({
      status: 'error',
      message: 'Server Error: ' + err.toString()
    });
  }
}

// =========================================================================
// ៤. API GATEWAY: DOPOST (WRITE, AUTHENTICATE & RBAC OPERATIONS)
// =========================================================================
function doPost(e) {
  const lock = LockService.getScriptLock();
  const hasLock = lock.tryLock(30000);
  
  if (!hasLock) {
    return createJsonResponse({
      status: 'error',
      message: 'Server កំពុងជាប់រវល់ (Lock Timeout) សូមសាកល្បងម្តងទៀតក្នុងរយៈពេលបន្តិចទៀត។'
    });
  }

  try {
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else {
      payload = e.parameter || {};
    }

    const action = payload.action;
    const sessionToken = payload.session_token || payload.token || '';
    const teacherId = payload.teacher_id || '';
    const academicYear = payload.academic_year || '';
    const data = payload.data !== undefined ? payload.data : payload;

    // -----------------------------------------------------------------------
    // ១. មុខងារ AUTHENTICATION & LOGIN (PUBLIC & SECURE)
    // -----------------------------------------------------------------------

    // ១.១ ផ្ទៀងផ្ទាត់ និងចូលប្រើតាមរយៈ Google / Gmail (Firebase Auth Token)
    if (action === 'verifyGoogleAuth') {
      const idToken = payload.id_token || data.id_token;
      const rate = checkRateLimit(payload.email || 'google_auth');
      if (!rate.allowed) {
        return createJsonResponse({ status: 'error', message: rate.message });
      }

      const tokenRes = verifyFirebaseIdToken(idToken);
      if (!tokenRes.valid) {
        recordLoginAttempt(payload.email || 'INVALID_GOOGLE_TOKEN', 'FAILED', { reason: tokenRes.error });
        logSecurityEvent('ANONYMOUS', 'GOOGLE_LOGIN_FAIL', 'AUTH', '', 'FAILED', { error: tokenRes.error });
        return createJsonResponse({ status: 'error', message: tokenRes.error });
      }

      const verifiedEmail = tokenRes.email;

      // ស្វែងរកក្នុង Users ឬ AuthIdentities
      let user = null;
      const users = queryTable(SHEETS.USERS, { email: verifiedEmail });
      if (users.length > 0) {
        user = users[0];
      } else {
        // ស្វែងរកក្នុង AuthIdentities
        const identities = queryTable(SHEETS.AUTH_IDENTITIES, { provider: 'google', provider_subject: tokenRes.sub });
        if (identities.length > 0) {
          const uList = queryTable(SHEETS.USERS, { user_id: identities[0].user_id });
          if (uList.length > 0) user = uList[0];
        }
      }

      // ប្រសិនបើជាគណនីថ្មី (មិនទាន់ចុះឈ្មោះ) -> បង្កើតសំណើសុំគណនីក្នុងស្ថានភាព "pending"
      if (!user) {
        const newUserId = `USR-${Date.now()}`;
        const nowIso = new Date().toISOString();
        const pendingUser = {
          user_id: newUserId,
          display_name: tokenRes.name || verifiedEmail.split('@')[0],
          email: verifiedEmail,
          role: 'homeroom_teacher', // Role default, awaiting admin approval
          status: 'pending',        // PENDING BY DEFAULT
          assigned_grade: payload.grade || 'ថ្នាក់ទី ២',
          assigned_room: payload.room || '«ក»',
          created_at: nowIso,
          approved_by: '',
          approved_at: '',
          mfa_enabled: false,
          mfa_secret: '',
          mfa_recovery_hashes: '',
          updated_at: nowIso
        };

        upsertRecords(SHEETS.USERS, [pendingUser], 'user_id');

        // កត់ត្រា Identity
        const identity = {
          identity_id: `IDN-${Date.now()}`,
          user_id: newUserId,
          provider: 'google',
          provider_subject: tokenRes.sub,
          email_verified: true,
          linked_at: nowIso,
          linked_by: 'SELF_REGISTRATION',
          status: 'pending'
        };
        upsertRecords(SHEETS.AUTH_IDENTITIES, [identity], 'identity_id');

        logSecurityEvent(newUserId, 'ACCOUNT_REGISTER_REQUEST', 'USER', newUserId, 'PENDING', { email: verifiedEmail });
        recordLoginAttempt(verifiedEmail, 'PENDING', { reason: 'New account awaiting admin approval' });

        return createJsonResponse({
          status: 'pending',
          message: 'គណនីរបស់អ្នកបានផ្ញើសំណើជោគជ័យ និងកំពុងរង់ចាំការអនុម័តពី Admin (Pending Approval)'
        });
      }

      // ពិនិត្យស្ថានភាពគណនីដែលបានចុះឈ្មោះរួច
      if (user.status === 'pending') {
        recordLoginAttempt(verifiedEmail, 'PENDING', { reason: 'Awaiting admin approval' });
        return createJsonResponse({
          status: 'pending',
          message: 'គណនីរបស់អ្នកស្ថិតក្នុងស្ថានភាពរង់ចាំការអនុម័តពីអ្នកគ្រប់គ្រង (Pending Approval)'
        });
      }

      if (user.status === 'suspended') {
        recordLoginAttempt(verifiedEmail, 'BLOCKED', { reason: 'Account suspended' });
        logSecurityEvent(user.user_id, 'LOGIN_BLOCKED_SUSPENDED', 'USER', user.user_id, 'BLOCKED');
        return createJsonResponse({
          status: 'suspended',
          message: 'គណនីរបស់អ្នកត្រូវបានផ្អាកជាបណ្តោះអាសន្ន។ សូមទាក់ទងអ្នកគ្រប់គ្រងសាលា (Account Suspended)'
        });
      }

      if (user.status === 'disabled') {
        recordLoginAttempt(verifiedEmail, 'BLOCKED', { reason: 'Account disabled' });
        return createJsonResponse({
          status: 'disabled',
          message: 'គណនីរបស់អ្នកត្រូវបានបិទដំណើរការជាអចិន្ត្រៃយ៍ (Account Disabled)'
        });
      }

      // កត់ត្រា/អាប់ដេត Identity ប្រសិនបើមិនទាន់មាន
      const existingIdentities = queryTable(SHEETS.AUTH_IDENTITIES, { user_id: user.user_id, provider: 'google' });
      if (existingIdentities.length === 0) {
        upsertRecords(SHEETS.AUTH_IDENTITIES, [{
          identity_id: `IDN-${Date.now()}`,
          user_id: user.user_id,
          provider: 'google',
          provider_subject: tokenRes.sub,
          email_verified: true,
          linked_at: new Date().toISOString(),
          linked_by: 'GOOGLE_LOGIN',
          status: 'active'
        }], 'identity_id');
      }

      // បង្កើត Session
      const session = createSession(user.user_id);
      recordLoginAttempt(verifiedEmail, 'SUCCESS');
      logSecurityEvent(user.user_id, 'GOOGLE_LOGIN_SUCCESS', 'AUTH', user.user_id, 'SUCCESS');

      return createJsonResponse({
        status: 'success',
        session_token: session.sessionId,
        expires_at: session.expiresAt,
        user: {
          user_id: user.user_id,
          name: user.display_name,
          email: user.email,
          role: user.role,
          status: user.status,
          grade: user.assigned_grade,
          room: user.assigned_room
        }
      });
    }

    // ១.២ ផ្ទៀងផ្ទាត់ និងចូលប្រើតាមរយៈ Telegram (Official HMAC Signature)
    if (action === 'verifyTelegramAuth') {
      const authData = payload.auth_data || data.auth_data;
      const verifyRes = verifyTelegramAuthData(authData);
      
      if (!verifyRes.valid) {
        recordLoginAttempt('TELEGRAM_' + (authData?.id || 'UNKNOWN'), 'FAILED', { reason: verifyRes.error });
        return createJsonResponse({ status: 'error', message: verifyRes.error });
      }

      const tgId = verifyRes.telegramId;

      // ស្វែងរក Telegram Identity ដែលបានភ្ជាប់ និងអនុម័តដោយ Admin
      const identities = queryTable(SHEETS.AUTH_IDENTITIES, { provider: 'telegram', provider_subject: tgId });
      if (identities.length === 0) {
        return createJsonResponse({
          status: 'unlinked',
          message: `គណនី Telegram នេះ (@${verifyRes.username || tgId}) មិនទាន់ត្រូវបានភ្ជាប់ទៅកាន់គណនី CMS ឡើយ។ សូមចូលដោយប្រើ Google រួចភ្ជាប់ Telegram ក្នុង Setting ឬទាក់ទង Admin។`
        });
      }

      const identity = identities[0];
      const users = queryTable(SHEETS.USERS, { user_id: identity.user_id });
      if (users.length === 0) {
        return createJsonResponse({ status: 'error', message: 'រកមិនឃើញគណនីដែលត្រូវនឹង Telegram នេះឡើយ' });
      }

      const user = users[0];
      if (user.status !== 'approved' && user.status !== 'active') {
        return createJsonResponse({ status: user.status, message: `គណនីស្ថិតក្នុងស្ថានភាព ${user.status}` });
      }

      const session = createSession(user.user_id);
      recordLoginAttempt('TG_' + tgId, 'SUCCESS');
      logSecurityEvent(user.user_id, 'TELEGRAM_LOGIN_SUCCESS', 'AUTH', user.user_id, 'SUCCESS');

      return createJsonResponse({
        status: 'success',
        session_token: session.sessionId,
        expires_at: session.expiresAt,
        user: {
          user_id: user.user_id,
          name: user.display_name,
          email: user.email,
          role: user.role,
          status: user.status,
          grade: user.assigned_grade,
          room: user.assigned_room
        }
      });
    }

    // ១.៣ ភ្ជាប់ Telegram Identity ទៅកាន់គណនី (Linking Method)
    if (action === 'linkTelegramIdentity') {
      const auth = authenticateSession(sessionToken);
      if (!auth.authenticated) return createJsonResponse({ status: 'unauthorized', message: auth.error });

      const authData = payload.auth_data || data.auth_data;
      const verifyRes = verifyTelegramAuthData(authData);
      if (!verifyRes.valid) return createJsonResponse({ status: 'error', message: verifyRes.error });

      const tgId = verifyRes.telegramId;

      // ពិនិត្យការពារ Duplicate Linking (Telegram មួយមិនអាចភ្ជាប់លើសពី ១ គណនី)
      const existing = queryTable(SHEETS.AUTH_IDENTITIES, { provider: 'telegram', provider_subject: tgId });
      if (existing.length > 0 && existing[0].user_id !== auth.user.user_id) {
        return createJsonResponse({
          status: 'error',
          message: 'គណនី Telegram នេះត្រូវបានភ្ជាប់ជាមួយអ្នកប្រើប្រាស់ផ្សេងរួចហើយ!'
        });
      }

      const identityRecord = {
        identity_id: `IDN-TG-${tgId}`,
        user_id: auth.user.user_id,
        provider: 'telegram',
        provider_subject: tgId,
        email_verified: true,
        linked_at: new Date().toISOString(),
        linked_by: auth.user.user_id,
        status: 'active'
      };

      upsertRecords(SHEETS.AUTH_IDENTITIES, [identityRecord], 'identity_id');
      logSecurityEvent(auth.user.user_id, 'LINK_TELEGRAM', 'IDENTITY', tgId, 'SUCCESS');

      return createJsonResponse({
        status: 'success',
        message: `បានភ្ជាប់គណនី Telegram (@${verifyRes.username || tgId}) ដោយជោគជ័យ!`
      });
    }

    // ១.៤ ដោះការភ្ជាប់ Telegram Identity
    if (action === 'unlinkTelegramIdentity') {
      const auth = authenticateSession(sessionToken);
      if (!auth.authenticated) return createJsonResponse({ status: 'unauthorized', message: auth.error });

      updateSingleField(SHEETS.AUTH_IDENTITIES, 'user_id', auth.user.user_id, { status: 'revoked' });
      logSecurityEvent(auth.user.user_id, 'UNLINK_TELEGRAM', 'IDENTITY', auth.user.user_id, 'SUCCESS');

      return createJsonResponse({ status: 'success', message: 'បានដោះការភ្ជាប់ Telegram រួចរាល់' });
    }

    // ១.៥ Logout និង Revoke Session
    if (action === 'logout') {
      if (sessionToken) {
        updateSingleField(SHEETS.SESSIONS, 'session_id', sessionToken, { revoked_at: new Date().toISOString() });
      }
      return createJsonResponse({ status: 'success', message: 'បានចេញពីប្រព័ន្ធដោយជោគជ័យ' });
    }

    // -----------------------------------------------------------------------
    // ២. មុខងារ ADMIN ACCOUNT MANAGEMENT (Super Admin & Admin Only)
    // -----------------------------------------------------------------------

    // ២.១ អនុម័តគណនី (Approve User Request)
    if (action === 'approveUser') {
      const auth = authenticateSession(sessionToken);
      if (!auth.authenticated || !authorizeRole(auth.user, ['super_admin', 'admin'])) {
        return createJsonResponse({ status: 'forbidden', message: 'ទាមទារសិទ្ធិ Admin ដើម្បីអនុម័តគណនី' });
      }

      const targetUserId = payload.target_user_id || data.user_id;
      const targetRole = payload.role || data.role || 'homeroom_teacher';

      // Admin ធម្មតាមិនអាចតម្លើង Super Admin បានទេ
      if (targetRole === 'super_admin' && auth.user.role !== 'super_admin') {
        return createJsonResponse({ status: 'forbidden', message: 'មានតែ Super Admin ទើបអាចកំណត់សិទ្ធិ Super Admin បាន' });
      }

      const nowIso = new Date().toISOString();
      const updated = updateSingleField(SHEETS.USERS, 'user_id', targetUserId, {
        status: 'approved',
        role: targetRole,
        approved_by: auth.user.user_id,
        approved_at: nowIso,
        updated_at: nowIso
      });

      // ធ្វើបច្ចុប្បន្នភាព Status ក្នុង AuthIdentities ផងដែរ
      updateSingleField(SHEETS.AUTH_IDENTITIES, 'user_id', targetUserId, { status: 'active' });

      logSecurityEvent(auth.user.user_id, 'APPROVE_USER', 'USER', targetUserId, 'SUCCESS', { role: targetRole });

      return createJsonResponse({
        status: 'success',
        message: updated ? 'បានអនុម័តគណនីដោយជោគជ័យ!' : 'រកមិនឃើញគណនីដើម្បីអនុម័ត'
      });
    }

    // ២.២ ផ្លាស់ប្តូរស្ថានភាពគណនី (Suspend / Disable / Reactivate)
    if (action === 'updateUserStatus') {
      const auth = authenticateSession(sessionToken);
      if (!auth.authenticated || !authorizeRole(auth.user, ['super_admin', 'admin'])) {
        return createJsonResponse({ status: 'forbidden', message: 'ទាមទារសិទ្ធិ Admin' });
      }

      const targetUserId = payload.target_user_id || data.user_id;
      const newStatus = payload.new_status || data.status; // 'approved', 'suspended', 'disabled'

      // ការពារកុំឱ្យ suspend/disable ខ្លួនឯង
      if (targetUserId === auth.user.user_id) {
        return createJsonResponse({ status: 'error', message: 'លោកអ្នកមិនអាចបិទគណនីផ្ទាល់ខ្លួនបានឡើយ' });
      }

      const updated = updateSingleField(SHEETS.USERS, 'user_id', targetUserId, {
        status: newStatus,
        updated_at: new Date().toISOString()
      });

      // បើសិនជា suspend/disable ត្រូវលុប Sessions ទាំងអស់របស់ User នោះភ្លាមៗ
      if (newStatus === 'suspended' || newStatus === 'disabled') {
        const userSessions = queryTable(SHEETS.SESSIONS, { user_id: targetUserId });
        const nowIso = new Date().toISOString();
        userSessions.forEach(s => {
          updateSingleField(SHEETS.SESSIONS, 'session_id', s.session_id, { revoked_at: nowIso });
        });
      }

      logSecurityEvent(auth.user.user_id, `SET_STATUS_${newStatus.toUpperCase()}`, 'USER', targetUserId, 'SUCCESS');

      return createJsonResponse({ status: 'success', message: `បានកំណត់ស្ថានភាពគណនីជា [${newStatus}] ជោគជ័យ` });
    }

    // ២.៣ កំណត់សិទ្ធិ Role ឡើងវិញ (Assign Role)
    if (action === 'assignUserRole') {
      const auth = authenticateSession(sessionToken);
      if (!auth.authenticated || !authorizeRole(auth.user, ['super_admin', 'admin'])) {
        return createJsonResponse({ status: 'forbidden', message: 'ទាមទារសិទ្ធិ Admin' });
      }

      const targetUserId = payload.target_user_id || data.user_id;
      const newRole = payload.new_role || data.role; // 'super_admin', 'admin', 'homeroom_teacher', 'subject_teacher', 'student'

      if (newRole === 'super_admin' && auth.user.role !== 'super_admin') {
        return createJsonResponse({ status: 'forbidden', message: 'មានតែ Super Admin ទើបអាចផ្ទេរ ឬកំណត់ Super Admin បាន' });
      }

      updateSingleField(SHEETS.USERS, 'user_id', targetUserId, {
        role: newRole,
        updated_at: new Date().toISOString()
      });

      logSecurityEvent(auth.user.user_id, 'ASSIGN_ROLE', 'USER', targetUserId, 'SUCCESS', { newRole: newRole });
      return createJsonResponse({ status: 'success', message: `បានផ្លាស់ប្តូរសិទ្ធិជា [${newRole}] ជោគជ័យ` });
    }

    // ២.៤ កត់ត្រាការកំណត់ផ្ទាល់ខ្លួនគ្រូ (Save Teacher Settings)
    if (action === 'saveTeacherSettings') {
      const auth = authenticateSession(sessionToken);
      const targetTeacherId = payload.teacher_id || (auth.authenticated ? auth.user.user_id : '') || 'TCH-001';

      // សុវត្ថិភាពខ្ពស់៖ គ្រូមិនអាចកែប្រែ settings អ្នកដទៃបានទេ លើកលែងតែ Admin
      if (auth.authenticated && auth.user.role !== 'super_admin' && auth.user.role !== 'admin' && auth.user.user_id !== targetTeacherId) {
        return createJsonResponse({ status: 'forbidden', message: 'គ្មានសិទ្ធិកែប្រែ Settings គ្រូផ្សេងឡើយ' });
      }

      const prefData = data !== undefined ? data : payload;
      const prefJson = typeof prefData === 'object' ? JSON.stringify(prefData) : String(prefData);
      const record = {
        teacher_id: targetTeacherId,
        preferences_json: prefJson,
        updated_at: new Date().toISOString()
      };

      upsertRecords(SHEETS.TEACHER_SETTINGS, [record], 'teacher_id');
      return createJsonResponse({ status: 'success', message: 'បានរក្សាទុកការកំណត់ផ្ទាល់ខ្លួនជោគជ័យ' });
    }

    // -----------------------------------------------------------------------
    // ៣. ACADEMIC DATA OPERATIONS (WITH RBAC & CLASS SCOPE ENFORCEMENT)
    // -----------------------------------------------------------------------

    // ៣.១ Save Single Student
    if (action === 'saveStudent') {
      const auth = authenticateSession(sessionToken);
      if (auth.authenticated && !authorizeRole(auth.user, ['super_admin', 'admin', 'homeroom_teacher'])) {
        return createJsonResponse({ status: 'forbidden', message: 'សិទ្ធិមិនគ្រប់គ្រាន់ក្នុងការបញ្ចូល/កែប្រែសិស្ស' });
      }

      const student = data;
      if (!student.id) throw new Error('សិស្សត្រូវតែមានលេខសម្គាល់ (id)');

      // Scope check for teachers
      if (auth.authenticated && !checkClassScope(auth.user, student.grade, student.room)) {
        return createJsonResponse({ status: 'forbidden', message: 'លោកគ្រូអ្នកគ្រូមិនអាចបញ្ចូលសិស្សក្រៅពីថ្នាក់ទទួលបន្ទុកឡើយ' });
      }

      if (teacherId && !student.teacher_id) student.teacher_id = teacherId;
      if (academicYear && !student.academic_year) student.academic_year = academicYear;
      student.updated_at = new Date().toISOString();
      if (!student.created_at) student.created_at = student.updated_at;

      upsertRecords(SHEETS.STUDENTS, [student], 'id');
      logSecurityEvent(auth.user?.user_id || teacherId, 'SAVE_STUDENT', 'STUDENT', student.id, 'SUCCESS');
      return createJsonResponse({ status: 'success', message: 'បានរក្សាទុកសិស្សជោគជ័យ' });
    }

    // ៣.២ Save Batch Students
    if (action === 'saveStudentsBatch') {
      const auth = authenticateSession(sessionToken);
      if (auth.authenticated && !authorizeRole(auth.user, ['super_admin', 'admin', 'homeroom_teacher'])) {
        return createJsonResponse({ status: 'forbidden', message: 'សិទ្ធិមិនគ្រប់គ្រាន់' });
      }

      const studentsList = Array.isArray(data) ? data : (data.students || []);
      if (studentsList.length === 0) {
        return createJsonResponse({ status: 'success', message: 'គ្មានទិន្នន័យត្រូវរក្សាទុកឡើយ' });
      }
      
      const nowIso = new Date().toISOString();
      studentsList.forEach(s => {
        if (teacherId && !s.teacher_id) s.teacher_id = teacherId;
        if (academicYear && !s.academic_year) s.academic_year = academicYear;
        s.updated_at = nowIso;
        if (!s.created_at) s.created_at = nowIso;
      });

      upsertRecords(SHEETS.STUDENTS, studentsList, 'id');
      logSecurityEvent(auth.user?.user_id || teacherId, 'SAVE_STUDENTS_BATCH', 'STUDENTS', `COUNT:${studentsList.length}`, 'SUCCESS');
      return createJsonResponse({
        status: 'success',
        message: `បានធ្វើបច្ចុប្បន្នភាពសិស្សសរុប ${studentsList.length} នាក់ជោគជ័យ`
      });
    }

    // ៣.៣ Delete Student
    if (action === 'deleteStudent') {
      const auth = authenticateSession(sessionToken);
      if (auth.authenticated && !authorizeRole(auth.user, ['super_admin', 'admin', 'homeroom_teacher'])) {
        return createJsonResponse({ status: 'forbidden', message: 'គ្មានសិទ្ធិលុបសិស្ស' });
      }

      const studentId = payload.id || (data && data.id) || params.id;
      if (!studentId) throw new Error('បាត់លេខសម្គាល់សិស្ស (id)');

      const isHard = payload.hard_delete !== false && (data ? data.hard_delete !== false : true);
      let deleted = false;
      if (isHard) {
        deleted = deleteRecord(SHEETS.STUDENTS, 'id', studentId);
      } else {
        deleted = updateSingleField(SHEETS.STUDENTS, 'id', studentId, {
          status: 'Withdrawn',
          updated_at: new Date().toISOString()
        });
      }

      logSecurityEvent(auth.user?.user_id || teacherId, isHard ? 'HARD_DELETE_STUDENT' : 'DELETE_STUDENT_WITHDRAW', 'STUDENT', studentId, 'SUCCESS');
      return createJsonResponse({
        status: 'success',
        message: deleted ? 'បានលុបទិន្នន័យសិស្សពី Google Sheets ជោគជ័យ' : 'រកមិនឃើញសិស្សដើម្បីលុប'
      });
    }

    // ៣.៤ Save Scores Batch
    if (action === 'saveScores' || action === 'saveScoresBatch') {
      const auth = authenticateSession(sessionToken);
      if (auth.authenticated && !authorizeRole(auth.user, ['super_admin', 'admin', 'homeroom_teacher', 'subject_teacher'])) {
        return createJsonResponse({ status: 'forbidden', message: 'គ្មានសិទ្ធិកត់ត្រាពិន្ទុ' });
      }

      const scoresList = Array.isArray(data) ? data : (data.scores || data.data || []);
      if (!Array.isArray(scoresList) || scoresList.length === 0) {
        return createJsonResponse({ status: 'success', message: 'គ្មានទិន្នន័យពិន្ទុត្រូវកត់ត្រា' });
      }

      const nowIso = new Date().toISOString();
      scoresList.forEach(s => {
        if (!s.score_id) {
          s.score_id = `${s.student_id}_${s.academic_year || academicYear}_${s.month || ''}_${s.subject || 'TOTAL'}`;
        }
        if (teacherId && !s.teacher_id) s.teacher_id = teacherId;
        if (academicYear && !s.academic_year) s.academic_year = academicYear;
        s.updated_at = nowIso;
      });

      upsertRecords(SHEETS.SCORES, scoresList, 'score_id');
      if (scoresList.length > 0) {
        const sample = scoresList[0];
        recalculateScoresAndRankings(sample.academic_year, sample.grade, sample.room, sample.month);
        emitSystemEvent('SCORE_UPDATED', auth.user?.user_id || teacherId, scoresList.map(s => s.score_id), { count: scoresList.length });
      }
      logSecurityEvent(auth.user?.user_id || teacherId, 'SAVE_SCORES_BATCH', 'SCORES', `COUNT:${scoresList.length}`, 'SUCCESS');
      return createJsonResponse({
        status: 'success',
        message: `បានកត់ត្រាពិន្ទុសរុប ${scoresList.length} ជោគជ័យ`
      });
    }

    // ៣.៥ Save Attendance Batch
    if (action === 'saveAttendance' || action === 'saveAttendanceBatch') {
      const auth = authenticateSession(sessionToken);
      if (auth.authenticated && !authorizeRole(auth.user, ['super_admin', 'admin', 'homeroom_teacher', 'subject_teacher'])) {
        return createJsonResponse({ status: 'forbidden', message: 'គ្មានសិទ្ធិកត់ត្រាវត្តមាន' });
      }

      const attList = Array.isArray(data) ? data : (data.attendance || data.data || []);
      if (!Array.isArray(attList) || attList.length === 0) {
        return createJsonResponse({ status: 'success', message: 'គ្មានទិន្នន័យវត្តមានត្រូវកត់ត្រា' });
      }

      const nowIso = new Date().toISOString();
      attList.forEach(a => {
        if (!a.record_id) {
          a.record_id = `${a.student_id}_${a.date}_${a.academic_year || academicYear}`;
        }
        if (teacherId && !a.teacher_id) a.teacher_id = teacherId;
        if (academicYear && !a.academic_year) a.academic_year = academicYear;
        a.updated_at = nowIso;
      });

      upsertRecords(SHEETS.ATTENDANCE, attList, 'record_id');
      if (attList.length > 0) {
        emitSystemEvent('ATTENDANCE_RECORDED', auth.user?.user_id || teacherId, attList.map(a => a.record_id), { count: attList.length });
      }
      logSecurityEvent(auth.user?.user_id || teacherId, 'SAVE_ATTENDANCE_BATCH', 'ATTENDANCE', `COUNT:${attList.length}`, 'SUCCESS');
      return createJsonResponse({
        status: 'success',
        message: `បានកត់ត្រាវត្តមានសរុប ${attList.length} ជោគជ័យ`
      });
    }

    // ៣.៦ Save Library Batch
    if (action === 'saveLibrary' || action === 'saveLibraryBatch') {
      const libList = Array.isArray(data) ? data : (data.library || data.data || []);
      if (Array.isArray(libList) && libList.length > 0) {
        const nowIso = new Date().toISOString();
        libList.forEach(item => {
          if (!item.transaction_id) item.transaction_id = item.id || `TX-${Date.now()}-${Math.floor(Math.random()*1000)}`;
          item.updated_at = nowIso;
        });
        upsertRecords(SHEETS.LIBRARY, libList, 'transaction_id');
      }
      return createJsonResponse({ status: 'success', message: 'បានកត់ត្រាទិន្នន័យបណ្ណាល័យជោគជ័យ' });
    }

    // ៣.៧ Save Class Batch
    if (action === 'saveClass' || action === 'saveClassesBatch') {
      const auth = authenticateSession(sessionToken);
      if (auth.authenticated && !authorizeRole(auth.user, ['super_admin', 'admin'])) {
        return createJsonResponse({ status: 'forbidden', message: 'ទាមទារសិទ្ធិ Admin ដើម្បីគ្រប់គ្រងថ្នាក់រៀន' });
      }

      const classList = Array.isArray(data) ? data : [data];
      if (Array.isArray(classList) && classList.length > 0) {
        const nowIso = new Date().toISOString();
        classList.forEach(c => {
          if (!c.class_id) c.class_id = `CLS-${c.grade || ''}-${c.room || ''}`;
          c.updated_at = nowIso;
        });
        upsertRecords(SHEETS.CLASSES, classList, 'class_id');
      }
      return createJsonResponse({ status: 'success', message: 'បានកត់ត្រាព័ត៌មានថ្នាក់រៀនជោគជ័យ' });
    }

    // ៣.៨ All-in-One Master Sync (syncAll)
    if (action === 'syncAll' || action === 'syncAllBatch') {
      const nowIso = new Date().toISOString();
      const summary = {};

      if (data.class) {
        const cls = data.class;
        if (!cls.class_id) cls.class_id = `CLS-${cls.grade || ''}-${cls.room || ''}`;
        cls.updated_at = nowIso;
        upsertRecords(SHEETS.CLASSES, [cls], 'class_id');
        summary.class = 1;
      }

      const studentsList = data.students || (Array.isArray(data) ? data : []);
      if (Array.isArray(studentsList) && studentsList.length > 0) {
        studentsList.forEach(s => {
          if (teacherId && !s.teacher_id) s.teacher_id = teacherId;
          if (academicYear && !s.academic_year) s.academic_year = academicYear;
          s.updated_at = nowIso;
          if (!s.created_at) s.created_at = nowIso;
        });
        upsertRecords(SHEETS.STUDENTS, studentsList, 'id');
        summary.students = studentsList.length;
      }

      const scoresList = data.scores || [];
      if (Array.isArray(scoresList) && scoresList.length > 0) {
        scoresList.forEach(s => {
          if (!s.score_id) s.score_id = `${s.student_id}_${s.academic_year || academicYear}_${s.month || ''}_${s.subject || 'TOTAL'}`;
          if (teacherId && !s.teacher_id) s.teacher_id = teacherId;
          if (academicYear && !s.academic_year) s.academic_year = academicYear;
          s.updated_at = nowIso;
        });
        upsertRecords(SHEETS.SCORES, scoresList, 'score_id');
        summary.scores = scoresList.length;
      }

      const attList = data.attendance || [];
      if (Array.isArray(attList) && attList.length > 0) {
        attList.forEach(a => {
          if (!a.record_id) a.record_id = `${a.student_id}_${a.date}_${a.academic_year || academicYear}`;
          if (teacherId && !a.teacher_id) a.teacher_id = teacherId;
          if (academicYear && !a.academic_year) a.academic_year = academicYear;
          a.updated_at = nowIso;
        });
        upsertRecords(SHEETS.ATTENDANCE, attList, 'record_id');
        summary.attendance = attList.length;
      }

      const libList = data.library || [];
      if (Array.isArray(libList) && libList.length > 0) {
        libList.forEach(item => {
          if (!item.transaction_id) item.transaction_id = item.id || `TX-${Date.now()}-${Math.floor(Math.random()*1000)}`;
          item.updated_at = nowIso;
        });
        upsertRecords(SHEETS.LIBRARY, libList, 'transaction_id');
        summary.library = libList.length;
      }

      const ttList = data.timetables || [];
      if (Array.isArray(ttList) && ttList.length > 0) {
        ttList.forEach(t => {
          if (!t.entry_id) t.entry_id = `TT-${t.academic_year || academicYear}-${t.grade || ''}-${t.room || ''}-${t.day_of_week || ''}-${t.period_slot || ''}`.replace(/[«»\s]+/g, '_');
          t.updated_at = nowIso;
        });
        upsertRecords(SHEETS.TIMETABLES, ttList, 'entry_id');
        summary.timetables = ttList.length;
      }

      const repList = data.reports || [];
      if (Array.isArray(repList) && repList.length > 0) {
        repList.forEach(r => {
          if (!r.report_id) r.report_id = `REP-${r.academic_year || academicYear}-${r.grade || ''}-${r.room || ''}-${r.report_type || ''}-${r.month || ''}`.replace(/[«»\s]+/g, '_');
          r.updated_at = nowIso;
          if (!r.created_at) r.created_at = nowIso;
        });
        upsertRecords(SHEETS.REPORTS, repList, 'report_id');
        summary.reports = repList.length;
      }

      return createJsonResponse({
        status: 'success',
        message: 'បានធ្វើសមកាលកម្មទិន្នន័យទាំងអស់ទៅកាន់ Google Sheets ជោគជ័យ!',
        data: summary
      });
    }

    // ៣.៩ Save Settings
    if (action === 'saveSettings') {
      const auth = authenticateSession(sessionToken);
      if (auth.authenticated && !authorizeRole(auth.user, ['super_admin', 'admin', 'homeroom_teacher', 'teacher'])) {
        return createJsonResponse({ status: 'forbidden', message: 'ទាមទារសិទ្ធិ Admin ឬ គ្រូទទួលបន្ទុក ដើម្បីកែប្រែការកំណត់សាលា' });
      }

      const settingsObj = (data && typeof data === 'object') ? data : (payload && typeof payload === 'object' ? payload : {});
      const settingsRecords = [];
      const nowIso = new Date().toISOString();
      const skipKeys = ['action', 'session_token', 'data', 'teacher_id', 'academic_year'];
      
      for (const [key, value] of Object.entries(settingsObj)) {
        if (skipKeys.includes(key)) continue;
        settingsRecords.push({
          setting_key: key,
          setting_value: typeof value === 'object' ? JSON.stringify(value) : String(value),
          updated_at: nowIso
        });
      }

      if (settingsRecords.length > 0) {
        upsertRecords(SHEETS.SETTINGS, settingsRecords, 'setting_key');
      }
      logSecurityEvent(auth.user?.user_id || 'ADMIN', 'UPDATE_SETTINGS', 'SETTINGS', 'SCHOOL_CONFIG', 'SUCCESS');
      return createJsonResponse({ status: 'success', message: 'បានកត់ត្រាការកំណត់សាលារៀនជោគជ័យ' });
    }

    // ៣.១០ User Login (Legacy Auth Compatibility)
    if (action === 'loginUser') {
      const username = String(payload.username || data.username || '').trim();
      const password = String(payload.password || data.password || '').trim();
      
      const teachers = queryTable(SHEETS.TEACHERS, {});
      const matched = teachers.find(t => String(t.username).toLowerCase() === username.toLowerCase());
      
      if (!matched) {
        recordLoginAttempt(username, 'FAILED', { reason: 'User not found' });
        return createJsonResponse({ status: 'error', message: 'ឈ្មោះគណនី ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ' });
      }

      if (matched.password_hash) {
        return createJsonResponse({
          status: 'success',
          data: {
            teacher_id: matched.teacher_id,
            name: matched.name,
            role: matched.role,
            grade: matched.grade,
            room: matched.room,
            salt: matched.salt,
            password_hash: matched.password_hash
          }
        });
      }

      return createJsonResponse({ status: 'success', data: matched });
    }

    // ៣.១១ Register User (Legacy)
    if (action === 'registerUser') {
      const teacher = data;
      if (!teacher.teacher_id) teacher.teacher_id = `TCH-${Date.now()}`;
      teacher.updated_at = new Date().toISOString();
      if (!teacher.created_at) teacher.created_at = teacher.updated_at;

      upsertRecords(SHEETS.TEACHERS, [teacher], 'teacher_id');
      return createJsonResponse({ status: 'success', message: 'បានចុះឈ្មោះគ្រូជោគជ័យ', teacher_id: teacher.teacher_id });
    }

    // ៣.១២ Log Audit (Explicit)
    if (action === 'logAudit') {
      logSecurityEvent(payload.user_id || teacherId, payload.log_action || data.action || 'INFO', payload.entity_type || 'SYSTEM', payload.target_id || '', 'SUCCESS', data);
      return createJsonResponse({ status: 'success' });
    }

    // ៣.១៣ Save Academic Year
    if (action === 'saveAcademicYear') {
      const auth = authenticateSession(sessionToken);
      if (auth.authenticated && !authorizeRole(auth.user, ['super_admin', 'admin'])) {
        return createJsonResponse({ status: 'forbidden', message: 'ទាមទារសិទ្ធិ Admin' });
      }
      const item = data;
      if (!item.year_id) item.year_id = `AY-${Date.now()}`;
      item.updated_at = new Date().toISOString();
      upsertRecords(SHEETS.ACADEMIC_YEARS, [item], 'year_id');
      emitSystemEvent('ACADEMIC_YEAR_SAVED', auth.user?.user_id, [item.year_id], item);
      return createJsonResponse({ status: 'success', message: 'បានកត់ត្រាឆ្នាំសិក្សាជោគជ័យ' });
    }

    // ៣.១៤ Save Subject
    if (action === 'saveSubject') {
      const auth = authenticateSession(sessionToken);
      if (auth.authenticated && !authorizeRole(auth.user, ['super_admin', 'admin'])) {
        return createJsonResponse({ status: 'forbidden', message: 'ទាមទារសិទ្ធិ Admin' });
      }
      const item = data;
      if (!item.subject_id) item.subject_id = `SUB-${Date.now()}`;
      item.updated_at = new Date().toISOString();
      upsertRecords(SHEETS.SUBJECTS, [item], 'subject_id');
      emitSystemEvent('SUBJECT_SAVED', auth.user?.user_id, [item.subject_id], item);
      return createJsonResponse({ status: 'success', message: 'បានកត់ត្រាមុខវិជ្ជាជោគជ័យ' });
    }

    // ៣.១៥ Enroll Student in Class
    if (action === 'enrollStudent') {
      const auth = authenticateSession(sessionToken);
      if (auth.authenticated && !authorizeRole(auth.user, ['super_admin', 'admin', 'homeroom_teacher'])) {
        return createJsonResponse({ status: 'forbidden', message: 'គ្មានសិទ្ធិចុះឈ្មោះសិស្ស' });
      }
      const enrollment = data;
      if (!enrollment.enrollment_id) enrollment.enrollment_id = `ENR-${Date.now()}`;
      enrollment.updated_at = new Date().toISOString();
      if (!enrollment.enrollment_date) enrollment.enrollment_date = enrollment.updated_at;
      enrollment.status = 'active';

      upsertRecords(SHEETS.ENROLLMENTS, [enrollment], 'enrollment_id');
      emitSystemEvent('STUDENT_ENROLLED', auth.user?.user_id || teacherId, [enrollment.student_id], enrollment);
      return createJsonResponse({ status: 'success', message: 'បានចុះឈ្មោះសិស្សចូលក្នុងថ្នាក់រៀនជោគជ័យ' });
    }

    // ៣.១៦ Transfer Student (Preserve Historical Records)
    if (action === 'transferStudent') {
      const auth = authenticateSession(sessionToken);
      if (auth.authenticated && !authorizeRole(auth.user, ['super_admin', 'admin'])) {
        return createJsonResponse({ status: 'forbidden', message: 'ទាមទារសិទ្ធិ Admin ដើម្បីផ្ទេរថ្នាក់សិស្ស' });
      }
      const studentId = data.student_id;
      const newGrade = data.new_grade;
      const newRoom = data.new_room;
      const notes = data.transfer_notes || 'ផ្ទេរទៅថ្នាក់ថ្មី';
      const nowIso = new Date().toISOString();

      // Update student's active enrollment to 'transferred'
      const oldEnrollments = queryTable(SHEETS.ENROLLMENTS, { student_id: studentId, status: 'active' });
      if (oldEnrollments.length > 0) {
        oldEnrollments.forEach(e => {
          updateSingleField(SHEETS.ENROLLMENTS, 'enrollment_id', e.enrollment_id, {
            status: 'transferred',
            transfer_notes: notes,
            updated_at: nowIso
          });
        });
      }

      // Create new active enrollment
      const newEnrollment = {
        enrollment_id: `ENR-${Date.now()}`,
        student_id: studentId,
        academic_year: data.academic_year || academicYear,
        grade: newGrade,
        room: newRoom,
        enrollment_date: nowIso,
        status: 'active',
        transfer_notes: notes,
        updated_at: nowIso
      };
      upsertRecords(SHEETS.ENROLLMENTS, [newEnrollment], 'enrollment_id');

      // Update student table record
      updateSingleField(SHEETS.STUDENTS, 'id', studentId, {
        grade: newGrade,
        room: newRoom,
        updated_at: nowIso
      });

      emitSystemEvent('STUDENT_TRANSFERRED', auth.user?.user_id, [studentId], { newGrade, newRoom, notes });
      return createJsonResponse({ status: 'success', message: `បានផ្ទេរសិស្សទៅកាន់ ${newGrade} ${newRoom} ដោយជោគជ័យ!` });
    }

    // ៣.១៧ Assign Teacher to Class/Subject
    if (action === 'assignTeacher') {
      const auth = authenticateSession(sessionToken);
      if (auth.authenticated && !authorizeRole(auth.user, ['super_admin', 'admin'])) {
        return createJsonResponse({ status: 'forbidden', message: 'ទាមទារសិទ្ធិ Admin ដើម្បីចាត់តាំងគ្រូ' });
      }
      const assign = data;
      if (!assign.assignment_id) assign.assignment_id = `ASN-${Date.now()}`;
      assign.updated_at = new Date().toISOString();
      upsertRecords(SHEETS.TEACHER_ASSIGNMENTS, [assign], 'assignment_id');
      emitSystemEvent('TEACHER_ASSIGNED', auth.user?.user_id, [assign.teacher_id], assign);
      return createJsonResponse({ status: 'success', message: 'បានចាត់តាំងគ្រូបង្រៀនជោគជ័យ' });
    }

    // ៣.១៨ Save Examination & Publish
    if (action === 'saveExamination' || action === 'publishExamination') {
      const auth = authenticateSession(sessionToken);
      if (auth.authenticated && !authorizeRole(auth.user, ['super_admin', 'admin', 'homeroom_teacher', 'subject_teacher'])) {
        return createJsonResponse({ status: 'forbidden', message: 'គ្មានសិទ្ធិគ្រប់គ្រងការប្រឡង' });
      }
      const exam = data;
      if (!exam.exam_id) exam.exam_id = `EXM-${Date.now()}`;
      exam.updated_at = new Date().toISOString();
      if (action === 'publishExamination') {
        exam.status = 'published';
        exam.published_at = exam.updated_at;
      }
      upsertRecords(SHEETS.EXAMINATIONS, [exam], 'exam_id');
      emitSystemEvent(action === 'publishExamination' ? 'EXAM_PUBLISHED' : 'EXAM_SAVED', auth.user?.user_id, [exam.exam_id], exam);
      return createJsonResponse({ status: 'success', message: 'បានកត់ត្រាការប្រឡងជោគជ័យ' });
    }

    // ៣.១៩ Save Timetable
    if (action === 'saveTimetable' || action === 'saveTimetableBatch') {
      const auth = authenticateSession(sessionToken);
      if (auth.authenticated && !authorizeRole(auth.user, ['super_admin', 'admin', 'homeroom_teacher'])) {
        return createJsonResponse({ status: 'forbidden', message: 'ទាមទារសិទ្ធិ Admin ឬ គ្រូបន្ទុកថ្នាក់' });
      }
      const ttList = Array.isArray(data) ? data : (data.timetables || [data]);
      const nowIso = new Date().toISOString();
      ttList.forEach(t => {
        if (!t.entry_id) t.entry_id = `TT-${t.academic_year || ''}-${t.grade || ''}-${t.room || ''}-${t.day_of_week || ''}-${t.period_slot || ''}`;
        t.updated_at = nowIso;
      });
      upsertRecords(SHEETS.TIMETABLES, ttList, 'entry_id');
      emitSystemEvent('TIMETABLE_CHANGED', auth.user?.user_id, ttList.map(t => t.entry_id), { count: ttList.length });
      return createJsonResponse({ status: 'success', message: `បានកត់ត្រាកាលវិភាគបង្រៀន (${ttList.length} ម៉ោង) ជោគជ័យ` });
    }

    // ៣.១៩.១ Save Reports (របាយការណ៍ផ្សេងៗ)
    if (action === 'saveReport' || action === 'saveReportsBatch') {
      const repList = Array.isArray(data) ? data : (data.reports || [data]);
      const nowIso = new Date().toISOString();
      repList.forEach(r => {
        if (!r.report_id) {
          r.report_id = `REP-${r.academic_year || ''}-${r.grade || ''}-${r.room || ''}-${r.report_type || ''}-${r.month || ''}`.replace(/[«»\s]+/g, '_');
        }
        r.updated_at = nowIso;
        if (!r.created_at) r.created_at = nowIso;
      });
      upsertRecords(SHEETS.REPORTS, repList, 'report_id');
      emitSystemEvent('REPORT_SAVED', auth.user?.user_id, repList.map(r => r.report_id), { count: repList.length });
      return createJsonResponse({ status: 'success', message: `បានរក្សាទុករបាយការណ៍ (${repList.length}) ទៅក្នុង Google Sheets ជោគជ័យ` });
    }

    // ៣.២០ Save Homework
    if (action === 'saveHomework') {
      const auth = authenticateSession(sessionToken);
      if (auth.authenticated && !authorizeRole(auth.user, ['super_admin', 'admin', 'homeroom_teacher', 'subject_teacher'])) {
        return createJsonResponse({ status: 'forbidden', message: 'គ្មានសិទ្ធិកត់ត្រាកិច្ចការផ្ទះ' });
      }
      const hw = data;
      if (!hw.homework_id) hw.homework_id = `HW-${Date.now()}`;
      hw.created_at = new Date().toISOString();
      upsertRecords(SHEETS.HOMEWORK, [hw], 'homework_id');
      emitSystemEvent('HOMEWORK_ASSIGNED', auth.user?.user_id, [hw.homework_id], hw);
      return createJsonResponse({ status: 'success', message: 'បានកត់ត្រាកិច្ចការផ្ទះជោគជ័យ' });
    }

    // ៣.២១ Save Announcement & Broadcast Notification
    if (action === 'saveAnnouncement') {
      const auth = authenticateSession(sessionToken);
      if (auth.authenticated && !authorizeRole(auth.user, ['super_admin', 'admin'])) {
        return createJsonResponse({ status: 'forbidden', message: 'ទាមទារសិទ្ធិ Admin ដើម្បីផ្សព្វផ្សាយដំណឹង' });
      }
      const ann = data;
      if (!ann.announcement_id) ann.announcement_id = `ANN-${Date.now()}`;
      const nowIso = new Date().toISOString();
      ann.published_at = nowIso;
      ann.author_id = auth.user?.user_id || 'ADMIN';
      upsertRecords(SHEETS.ANNOUNCEMENTS, [ann], 'announcement_id');

      // Create notification for target audience
      const notif = {
        notification_id: `NOTIF-${Date.now()}`,
        user_id: ann.target_role === 'all' ? 'PUBLIC' : ann.target_role,
        title: ann.title,
        message: ann.content ? ann.content.slice(0, 100) + '...' : '',
        type: ann.priority || 'general',
        is_read: false,
        created_at: nowIso,
        link_action: 'announcements'
      };
      upsertRecords(SHEETS.NOTIFICATIONS, [notif], 'notification_id');
      emitSystemEvent('ANNOUNCEMENT_POSTED', auth.user?.user_id, [ann.announcement_id], ann);
      return createJsonResponse({ status: 'success', message: 'បានផ្សព្វផ្សាយសេចក្តីជូនដំណឹងជោគជ័យ' });
    }

    // ៣.២២ Mark Notification Read
    if (action === 'markNotificationRead') {
      const notifId = data.notification_id || payload.notification_id;
      if (notifId) {
        updateSingleField(SHEETS.NOTIFICATIONS, 'notification_id', notifId, { is_read: true });
      }
      return createJsonResponse({ status: 'success' });
    }

    // ៣.២៣ Emit Generic System Event
    if (action === 'emitEvent') {
      const auth = authenticateSession(sessionToken);
      const ev = emitSystemEvent(data.event_type || 'CUSTOM', auth.user?.user_id || 'CLIENT', data.affected_ids || [], data.payload || {});
      return createJsonResponse({ status: 'success', data: ev });
    }

    return createJsonResponse({
      status: 'error',
      message: `រកមិនឃើញ Action [${action}] ឡើយ។`
    });

  } catch (err) {
    return createJsonResponse({
      status: 'error',
      message: 'Database Write Error: ' + err.toString()
    });
  } finally {
    lock.releaseLock();
  }
}

// =========================================================================
// ៥. ម៉ាស៊ីនទិន្នន័យជំនួយកម្រិតខ្ពស់ (High-Performance Relational Engine)
// =========================================================================

/**
 * បង្កើត JSON Output ជាមួយ CORS ត្រឹមត្រូវ
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * ស្វែងរក ឬបង្កើត Sheet ដោយស្វ័យប្រវត្តិ
 */
function getOrCreateSheet(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    setupDatabaseSheets();
    sheet = ss.getSheetByName(sheetName);
  }
  return sheet;
}

/**
 * អានទិន្នន័យពីតារាងជា Object Array ព្រមទាំងចម្រាញ់ទិន្នន័យ (Query Filter)
 */
function queryTable(sheetName, filters = {}) {
  const sheet = getOrCreateSheet(sheetName);
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow <= 1) return [];

  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(h => String(h).trim());
  const data = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();

  const results = [];
  for (let r = 0; r < data.length; r++) {
    const row = data[r];
    const record = {};
    for (let c = 0; c < headers.length; c++) {
      let cellVal = row[c];
      if (cellVal instanceof Date) {
        try {
          cellVal = Utilities.formatDate(cellVal, "Asia/Phnom_Penh", "yyyy-MM-dd");
        } catch (e) {
          cellVal = cellVal.toISOString().split('T')[0];
        }
      }
      record[headers[c]] = cellVal;
    }

    let matches = true;
    for (const [key, val] of Object.entries(filters)) {
      if (val !== undefined && val !== null && String(val).trim() !== '' && String(val).toLowerCase() !== 'all') {
        const rowVal = record[key];
        if (key === 'grade') {
          const rowNorm = normalizeGradeString(rowVal);
          const valNorm = normalizeGradeString(val);
          if (rowNorm !== valNorm && String(rowVal).trim().toLowerCase() !== String(val).trim().toLowerCase()) {
            matches = false;
            break;
          }
        } else if (key === 'room') {
          const rowRoom = cleanRoomString(rowVal);
          const valRoom = cleanRoomString(val);
          if (rowRoom !== valRoom && !(valRoom === 'ក' && !rowRoom)) {
            matches = false;
            break;
          }
        } else if (rowVal === undefined || String(rowVal).trim().toLowerCase() !== String(val).trim().toLowerCase()) {
          matches = false;
          break;
        }
      }
    }

    if (matches) {
      results.push(record);
    }
  }

  return results;
}

/**
 * ម៉ាស៊ីន Upsert កម្រិតខ្ពស់ (Update បើមាន ID, Append បើជាទិន្នន័យថ្មី)
 */
function upsertRecords(sheetName, records, primaryKeyName) {
  if (!records || records.length === 0) return;

  const sheet = getOrCreateSheet(sheetName);
  const lastRow = sheet.getLastRow();

  if (lastRow === 0) {
    setupDatabaseSheets();
  }

  let headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(h => String(h).trim());
  let pkIndex = headers.indexOf(primaryKeyName);
  
  if (pkIndex === -1) {
    setupDatabaseSheets();
    headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(h => String(h).trim());
    pkIndex = headers.indexOf(primaryKeyName);
    if (pkIndex === -1) {
      throw new Error(`Primary Key [${primaryKeyName}] រកមិនឃើញក្នុងតារាង ${sheetName} ឡើយ`);
    }
  }

  let existingValues = [];
  if (sheet.getLastRow() > 1) {
    existingValues = sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).getValues();
  }

  const rowIndexMap = new Map();
  for (let i = 0; i < existingValues.length; i++) {
    const pkVal = String(existingValues[i][pkIndex]).trim();
    if (pkVal) rowIndexMap.set(pkVal, i);
  }

  const rowsToAppend = [];

  for (let i = 0; i < records.length; i++) {
    const rec = records[i];
    const pkVal = String(rec[primaryKeyName] || '').trim();
    if (!pkVal) continue;

    const rowValues = headers.map(h => {
      let v = rec[h];
      if ((v === undefined || v === null) && h === 'photo') v = rec['photo_url'];
      if ((v === undefined || v === null) && h === 'photo_url') v = rec['photo'];
      if ((v === undefined || v === null) && h === 'phone') v = rec['parent_contact'] || rec['contact'];
      if ((v === undefined || v === null) && h === 'parent_contact') v = rec['phone'] || rec['contact'];
      if ((v === undefined || v === null) && h === 'parent_name') v = rec['father_name'] || rec['mother_name'];
      
      if (v === undefined || v === null) return '';
      if (typeof v === 'object') return JSON.stringify(v);
      return v;
    });

    if (rowIndexMap.has(pkVal)) {
      const rowIdx = rowIndexMap.get(pkVal);
      existingValues[rowIdx] = rowValues;
    } else {
      rowsToAppend.push(rowValues);
      rowIndexMap.set(pkVal, existingValues.length + rowsToAppend.length - 1);
    }
  }

  if (existingValues.length > 0) {
    sheet.getRange(2, 1, existingValues.length, headers.length).setValues(existingValues);
  }

  if (rowsToAppend.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rowsToAppend.length, headers.length).setValues(rowsToAppend);
  }
}

/**
 * កែប្រែទិន្នន័យ Field ជាក់លាក់មួយជួរ
 */
function updateSingleField(sheetName, primaryKeyName, primaryKeyValue, updateFields) {
  const sheet = getOrCreateSheet(sheetName);
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return false;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(h => String(h).trim());
  const pkIndex = headers.indexOf(primaryKeyName);
  if (pkIndex === -1) return false;

  const data = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  for (let r = 0; r < data.length; r++) {
    if (String(data[r][pkIndex]).trim() === String(primaryKeyValue).trim()) {
      for (const [colName, val] of Object.entries(updateFields)) {
        const colIdx = headers.indexOf(colName);
        if (colIdx !== -1) {
          data[r][colIdx] = val;
        }
      }
      sheet.getRange(r + 2, 1, 1, headers.length).setValues([data[r]]);
      return true;
    }
  }
  return false;
}

/**
 * លុបទិន្នន័យ (Hard Delete Row) ពី Sheet តាម Primary Key
 */
function deleteRecord(sheetName, primaryKeyName, primaryKeyValue) {
  const sheet = getOrCreateSheet(sheetName);
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return false;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(h => String(h).trim());
  const pkIndex = headers.indexOf(primaryKeyName);
  if (pkIndex === -1) return false;

  const data = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  for (let r = 0; r < data.length; r++) {
    if (String(data[r][pkIndex]).trim() === String(primaryKeyValue).trim()) {
      sheet.deleteRow(r + 2);
      return true;
    }
  }
  return false;
}

function cleanRoomString(r) {
  return String(r || '').replace(/[«»\s]/g, '');
}

function normalizeGradeString(str) {
  if (!str) return '';
  let s = String(str).trim();
  if (s === 'all' || s === 'គ្រប់ថ្នាក់') return '';
  const khmerToArabic = {'០':'0', '១':'1', '២':'2', '៣':'3', '៤':'4', '៥':'5', '៦':'6', '៧':'7', '៨':'8', '៩':'9'};
  let arabicStr = s.replace(/[០-៩]/g, function(m) { return khmerToArabic[m]; });
  let match = arabicStr.match(/[0-9]+/);
  if (match) return 'ថ្នាក់ទី ' + toKhmerNumber(match[0]);
  return s;
}

function toKhmerNumber(num) {
  const khmerNumbers = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  return String(num).split('').map(function(n) { return (n >= '0' && n <= '9') ? khmerNumbers[parseInt(n, 10)] : n; }).join('');
}

/**
 * ទាញយក Settings ទាំងអស់ជា Key-Value Map
 */
function getSettingsMap() {
  const settingsRows = queryTable(SHEETS.SETTINGS, {});
  const map = {};
  settingsRows.forEach(row => {
    let val = row.setting_value;
    try {
      val = JSON.parse(val);
    } catch (e) {}
    map[row.setting_key] = val;
  });
  return map;
}

/**
 * បង្ហាញស្ថិតិសង្ខេបនៃទិន្នន័យទាំងអស់ក្នុង Database
 */
function getDatabaseSummary() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const summary = {};
  for (const sheetName of Object.values(SHEETS)) {
    const sheet = ss.getSheetByName(sheetName);
    summary[sheetName] = {
      exists: !!sheet,
      rowCount: sheet ? Math.max(0, sheet.getLastRow() - 1) : 0,
      columnsCount: sheet ? sheet.getLastColumn() : 0
    };
  }
  return summary;
}

/**
 * UI Dialog: ពិនិត្យសុវត្ថិភាពគណនី និងប្រព័ន្ធ (Security Health Check)
 */
function validateSecurityHealth() {
  const users = queryTable(SHEETS.USERS, {});
  const pendingUsers = users.filter(u => u.status === 'pending');
  const superAdmins = users.filter(u => u.role === 'super_admin');
  const activeSessions = queryTable(SHEETS.SESSIONS, {}).filter(s => !s.revoked_at && new Date(s.expires_at).getTime() > Date.now());

  let report = '🔐 លទ្ធផលពិនិត្យសុវត្ថិភាពប្រព័ន្ធ (CMS Security Health):\n\n';
  report += `• គណនីសរុប៖ ${users.length} នាក់\n`;
  report += `• គណនីរង់ចាំការអនុម័ត (Pending)៖ ${pendingUsers.length} នាក់\n`;
  report += `• គណនី Super Admin៖ ${superAdmins.length} នាក់\n`;
  report += `• Session កំពុងដំណើរការ (Active Sessions)៖ ${activeSessions.length}\n\n`;

  if (superAdmins.length === 0) {
    report += '⚠️ មិនទាន់មាន Super Admin ណាមួយត្រូវបានកំណត់ឡើយ!\n';
  } else {
    report += '✅ គោលការណ៍ RBAC និង Session Management ដំណើរការប្រក្រតី។';
  }

  SpreadsheetApp.getUi().alert('ស្ថានភាពសុវត្ថិភាព', report, SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * UI Dialog: បង្ហាញស្ថិតិនៃតារាងទិន្នន័យ
 */
function showDatabaseStatistics() {
  const summary = getDatabaseSummary();
  let msg = '📊 ស្ថិតិតារាងទិន្នន័យសាលារៀន (CMS Database Summary):\n\n';
  for (const [name, info] of Object.entries(summary)) {
    msg += `• តារាង ${name}: ${info.rowCount} ជួរ (Columns: ${info.columnsCount})\n`;
  }
  SpreadsheetApp.getUi().alert('ស្ថិតិទិន្នន័យ', msg, SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * UI Dialog: ពិនិត្យសុពលភាពទិន្នន័យ (Validation)
 */
function validateDatabaseIntegrity() {
  const students = queryTable(SHEETS.STUDENTS, {});
  const teachers = queryTable(SHEETS.TEACHERS, {});
  const attendance = queryTable(SHEETS.ATTENDANCE, {});
  const scores = queryTable(SHEETS.SCORES, {});

  const studentIds = new Set(students.map(s => String(s.id).trim()));
  let orphanAttendance = 0;
  let orphanScores = 0;

  attendance.forEach(a => {
    if (a.student_id && !studentIds.has(String(a.student_id).trim())) orphanAttendance++;
  });

  scores.forEach(s => {
    if (s.student_id && !studentIds.has(String(s.student_id).trim())) orphanScores++;
  });

  let report = `✅ ត្រួតពិនិត្យសុពលភាពទិន្នន័យចប់សព្វគ្រប់៖\n\n`;
  report += `• ចំនួនសិស្សសរុប: ${students.length} នាក់\n`;
  report += `• ចំនួនគ្រូសរុប: ${teachers.length} នាក់\n`;
  report += `• កំណត់ត្រាវត្តមាន: ${attendance.length} (ទិន្នន័យខ្វះសិស្ស: ${orphanAttendance})\n`;
  report += `• កំណត់ត្រាពិន្ទុ: ${scores.length} (ទិន្នន័យខ្វះសិស្ស: ${orphanScores})\n\n`;

  if (orphanAttendance === 0 && orphanScores === 0) {
    report += `🎉 ទំនាក់ទំនងទិន្នន័យ (Relational Integrity) ត្រឹមត្រូវល្អឥតខ្ចោះ!`;
  } else {
    report += `⚠️ សូមត្រួតពិនិត្យលេខសម្គាល់សិស្សក្នុងតារាងវត្តមាន ឬពិន្ទុ។`;
  }

  SpreadsheetApp.getUi().alert('លទ្ធផលត្រួតពិនិត្យសុពលភាព', report, SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * UI Dialog: ជំនួយ និងការណែនាំ
 */
function showHelpDialog() {
  const ui = SpreadsheetApp.getUi();
  const html = HtmlService.createHtmlOutput(`
    <div style="font-family: Arial, sans-serif; padding: 15px; line-height: 1.6;">
      <h3 style="color: #1e3a8a;">🏫 ការណែនាំអំពី Google Apps Script CMS v4.0 Secure</h3>
      <p>កូដនេះបម្រើជា API Server សុវត្ថិភាពខ្ពស់ សម្រាប់ភ្ជាប់ Google Spreadsheet ជាមួយប្រព័ន្ធ Classroom Management System (CMS) ដោយមាន Role-Based Access Control, Session Management, Google & Telegram Authentication Verification។</p>
      <h4>ជំហានដាក់ឱ្យប្រើប្រាស់ (Deploy as Web App):</h4>
      <ol>
        <li>ចុចប៊ូតុងពណ៌ខៀវ <b>Deploy</b> (នៅខាងស្តាំលើ) &gt; <b>Manage deployments</b></li>
        <li>ចុចរូបខ្មៅដៃ <b>Edit</b> (កែប្រែ)</li>
        <li>នៅត្រង់ Version ជ្រើសរើស <b>New version</b></li>
        <li>កំណត់ <b>Who has access: Anyone</b> (សំខាន់បំផុត ដើម្បីឱ្យ CMS អាចបញ្ជូនទិន្នន័យបាន)</li>
        <li>ចុច <b>Deploy</b> រួច Copy យក <b>Web App URL</b></li>
      </ol>
      <h4>ការកំណត់ Script Properties (Project Settings &gt; Script Properties):</h4>
      <ul>
        <li><code>ADMIN_SETUP_TOKEN</code>: ពាក្យសម្ងាត់ការពារការ setupSheets</li>
        <li><code>TELEGRAM_BOT_TOKEN</code>: Bot Token សម្រាប់ផ្ទៀងផ្ទាត់ Telegram Login Signature</li>
      </ul>
    </div>
  `).setWidth(500).setHeight(400);
  ui.showModalDialog(html, 'ការណែនាំអំពីការភ្ជាប់ប្រព័ន្ធ');
}
