/**
 * =========================================================================
 * ប្រព័ន្ធគ្រប់គ្រងសាលារៀន (School Management System - CMS)
 * Google Apps Script Backend (Standard Relational Edition)
 * Version: 2.0 (Relational Architecture & High-Performance Batch Engine)
 * =========================================================================
 * 
 * រចនាសម្ព័ន្ធតារាងស្តង់ដារ (Relational Tables Schema):
 * 1. Students   : [PK: id]          - ព័ត៌មានលម្អិតសិស្ស
 * 2. Teachers   : [PK: teacher_id]  - គណនី និងព័ត៌មានគ្រូបង្រៀន/បុគ្គលិក
 * 3. Classes    : [PK: class_id]    - កម្រិតថ្នាក់ បន្ទប់ និងគ្រូទទួលបន្ទុក
 * 4. Attendance : [PK: record_id]   - កំណត់ត្រាវត្តមានសិស្ស
 * 5. Scores     : [PK: score_id]    - កំណត់ត្រាពិន្ទុ និងចំណាត់ថ្នាក់
 * 6. Library    : [PK: transaction_id] - កំណត់ត្រាខ្ចី-សងសៀវភៅ
 * 7. Settings   : [PK: setting_key] - ការកំណត់ទូទៅរបស់សាលារៀន
 * 8. AuditLogs  : [PK: log_id]      - កំណត់ត្រាសកម្មភាពសុវត្ថិភាព
 * =========================================================================
 */

// កំណត់ឈ្មោះសន្លឹកកិច្ចការស្តង់ដារ (Sheet Names Configuration)
const SHEETS = {
  STUDENTS: 'Students',
  TEACHERS: 'Teachers',
  CLASSES: 'Classes',
  ATTENDANCE: 'Attendance',
  SCORES: 'Scores',
  LIBRARY: 'Library',
  SETTINGS: 'Settings',
  AUDIT_LOGS: 'AuditLogs'
};

// កំណត់ក្បាលជួរឈរស្តង់ដារសម្រាប់តារាងនីមួយៗ (Standard Column Definitions)
const SCHEMAS = {
  [SHEETS.STUDENTS]: [
    'id', 'name', 'gender', 'dob', 'grade', 'room', 'academic_year', 
    'teacher_id', 'photo', 'phone', 'parent_name', 'status', 'poor_id', 
    'scholarship', 'address', 'created_at', 'updated_at'
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
    'log_id', 'timestamp', 'action', 'entity_type', 'user_id', 'details'
  ]
};

// =========================================================================
// ១. MENU បញ្ជាផ្ទាល់លើ GOOGLE SPREADSHEET (User Interface Menu)
// =========================================================================
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🏫 CMS ប្រព័ន្ធគ្រប់គ្រងសាលា')
    .addItem('🛠️ បង្កើត/រៀបចំតារាងស្តង់ដារទាំងអស់', 'setupDatabaseSheets')
    .addItem('🔍 ពិនិត្យសុពលភាពទិន្នន័យ (Validation)', 'validateDatabaseIntegrity')
    .addItem('📊 បង្ហាញស្ថិតិនៃតារាងទិន្នន័យ', 'showDatabaseStatistics')
    .addSeparator()
    .addItem('❓ ការណែនាំ និងជំនួយ', 'showHelpDialog')
    .addToUi();
}

/**
 * បង្កើតសន្លឹកកិច្ចការ និងក្បាលតារាងស្តង់ដារដោយស្វ័យប្រវត្តិ
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
    
    // បង្កើត Headers ប្រសិនបើតារាងនៅទទេ
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // រចនា Header អោយស្អាត និងច្បាស់
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#1e293b'); // Dark Slate
      headerRange.setFontColor('#ffffff');
      headerRange.setFontWeight('bold');
      headerRange.setHorizontalAlignment('center');
      sheet.setFrozenRows(1);
    }
  }

  // លុប Sheet1 លំនាំដើម ប្រសិនបើមានតារាង CMS រួច
  const defaultSheet = ss.getSheetByName('Sheet1') || ss.getSheetByName('សន្លឹក១');
  if (defaultSheet && ss.getSheets().length > 1) {
    try { ss.deleteSheet(defaultSheet); } catch (e) {}
  }

  return {
    status: 'success',
    message: 'បានរៀបចំតារាងស្តង់ដារទាំងអស់ដោយជោគជ័យ!',
    createdSheets: createdSheets
  };
}

// =========================================================================
// ២. API GATEWAY: DOGET (ទាញយកទិន្នន័យ / READ OPERATIONS)
// =========================================================================
function doGet(e) {
  const lock = LockService.getScriptLock();
  try {
    const params = (e && e.parameter) ? e.parameter : {};
    const action = params.action || 'ping';

    // ១. Health Check / Ping
    if (action === 'ping' || action === 'testConnection') {
      return createJsonResponse({
        status: 'success',
        message: 'Google Apps Script CMS API ដំណើរការប្រក្រតី!',
        timestamp: new Date().toISOString(),
        version: '2.0-relational'
      });
    }

    // ២. Setup Sheets តាមរយៈ URL (អាចការពារដោយ ADMIN_SETUP_TOKEN ក្នុង Script Properties)
    if (action === 'setupSheets') {
      const adminToken = params.token || params.key || '';
      try {
        const scriptPropToken = PropertiesService.getScriptProperties().getProperty('ADMIN_SETUP_TOKEN');
        if (scriptPropToken && adminToken !== scriptPropToken) {
          return createJsonResponse({ status: 'error', message: 'គ្មានសិទ្ធិដំណើរការ setupSheets (Unauthorized)' });
        }
      } catch (e) {
        // ប្រសិនបើគ្មាន ScriptProperties API context (ឧ. unit test) ទុកជាធម្មតា
      }
      const res = setupDatabaseSheets();
      return createJsonResponse(res);
    }

    // ៣. Schema Info
    if (action === 'getSchemaInfo') {
      return createJsonResponse({
        status: 'success',
        data: getDatabaseSummary()
      });
    }

    // ៤. Get Settings
    if (action === 'getSettings') {
      return createJsonResponse({
        status: 'success',
        data: getSettingsMap()
      });
    }

    // ៥. Get Students (ចម្រាញ់តាម Academic Year, Grade, Room, Teacher, Status)
    if (action === 'getStudents') {
      const students = queryTable(SHEETS.STUDENTS, {
        academic_year: params.academic_year,
        grade: params.grade,
        room: params.room,
        teacher_id: params.teacher_id,
        status: params.status
      });
      return createJsonResponse({ status: 'success', data: students });
    }

    // ៦. Get Scores
    if (action === 'getScores') {
      const scores = queryTable(SHEETS.SCORES, {
        academic_year: params.academic_year,
        grade: params.grade,
        room: params.room,
        month: params.month,
        teacher_id: params.teacher_id
      });
      return createJsonResponse({ status: 'success', data: scores });
    }

    // ៧. Get Attendance
    if (action === 'getAttendance') {
      const attendance = queryTable(SHEETS.ATTENDANCE, {
        academic_year: params.academic_year,
        grade: params.grade,
        room: params.room,
        month: params.month,
        date: params.date,
        teacher_id: params.teacher_id
      });
      return createJsonResponse({ status: 'success', data: attendance });
    }

    // ៨. Get Library
    if (action === 'getLibrary') {
      const library = queryTable(SHEETS.LIBRARY, {
        academic_year: params.academic_year,
        status: params.status
      });
      return createJsonResponse({ status: 'success', data: library });
    }

    // ៩. Get Teachers
    if (action === 'getTeachers') {
      const teachers = queryTable(SHEETS.TEACHERS, {});
      // សម្អាត Password, Hash, Salt ដើម្បីសុវត្ថិភាពខ្ពស់បំផុត
      const safeTeachers = teachers.map(t => {
        const copy = { ...t };
        delete copy.password;
        delete copy.password_hash;
        delete copy.salt;
        return copy;
      });
      return createJsonResponse({ status: 'success', data: safeTeachers });
    }

    // ១០. Get Classes
    if (action === 'getClasses') {
      const classes = queryTable(SHEETS.CLASSES, {
        academic_year: params.academic_year
      });
      return createJsonResponse({ status: 'success', data: classes });
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
// ៣. API GATEWAY: DOPOST (រក្សាទុក / WRITE & BATCH OPERATIONS)
// =========================================================================
function doPost(e) {
  // ប្រើប្រាស់ ScriptLock ដើម្បីការពារការសរសេរជាន់គ្នា (Race Conditions)
  const lock = LockService.getScriptLock();
  const hasLock = lock.tryLock(15000); // រង់ចាំអតិបរមា 15 វិនាទី
  
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
    const teacherId = payload.teacher_id || '';
    const academicYear = payload.academic_year || '';
    const data = payload.data || payload;

    // ១. Save Single Student
    if (action === 'saveStudent') {
      const student = data;
      if (!student.id) throw new Error('សិស្សត្រូវតែមានលេខសម្គាល់ (id)');
      if (teacherId && !student.teacher_id) student.teacher_id = teacherId;
      if (academicYear && !student.academic_year) student.academic_year = academicYear;
      student.updated_at = new Date().toISOString();
      if (!student.created_at) student.created_at = student.updated_at;

      upsertRecords(SHEETS.STUDENTS, [student], 'id');
      return createJsonResponse({ status: 'success', message: 'បានរក្សាទុកសិស្សជោគជ័យ' });
    }

    // ២. Save Batch Students
    if (action === 'saveStudentsBatch') {
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
      return createJsonResponse({
        status: 'success',
        message: `បានធ្វើបច្ចុប្បន្នភាពសិស្សសរុប ${studentsList.length} នាក់ជោគជ័យ`
      });
    }

    // ៣. Delete Student (Soft Delete or Hard Delete)
    if (action === 'deleteStudent') {
      const studentId = payload.id || (data && data.id);
      if (!studentId) throw new Error('បាត់លេខសម្គាល់សិស្ស (id)');

      // Soft delete: update status to 'Withdrawn'
      const updated = updateSingleField(SHEETS.STUDENTS, 'id', studentId, {
        status: 'Withdrawn',
        updated_at: new Date().toISOString()
      });

      return createJsonResponse({
        status: 'success',
        message: updated ? 'បានកំណត់សិស្សជា Withdrawn រួចរាល់' : 'រកមិនឃើញសិស្សដើម្បីលុប'
      });
    }

    // ៤. Save Scores Batch
    if (action === 'saveScoresBatch') {
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
      return createJsonResponse({
        status: 'success',
        message: `បានកត់ត្រាពិន្ទុសរុប ${scoresList.length} ជោគជ័យ`
      });
    }

    // ៥. Save Attendance Batch
    if (action === 'saveAttendanceBatch') {
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
      return createJsonResponse({
        status: 'success',
        message: `បានកត់ត្រាវត្តមានសរុប ${attList.length} ជោគជ័យ`
      });
    }

    // ៦. Save Library
    if (action === 'saveLibrary') {
      const libList = Array.isArray(data) ? data : (data.library || data.data || []);
      if (Array.isArray(libList) && libList.length > 0) {
        libList.forEach(item => {
          if (!item.transaction_id) item.transaction_id = item.id || `TX-${Date.now()}-${Math.floor(Math.random()*1000)}`;
          item.updated_at = new Date().toISOString();
        });
        upsertRecords(SHEETS.LIBRARY, libList, 'transaction_id');
      }
      return createJsonResponse({ status: 'success', message: 'បានកត់ត្រាទិន្នន័យបណ្ណាល័យជោគជ័យ' });
    }

    // ៧. Save Settings
    if (action === 'saveSettings') {
      const settingsObj = data;
      const settingsRecords = [];
      const nowIso = new Date().toISOString();
      
      for (const [key, value] of Object.entries(settingsObj)) {
        settingsRecords.push({
          setting_key: key,
          setting_value: typeof value === 'object' ? JSON.stringify(value) : String(value),
          updated_at: nowIso
        });
      }

      upsertRecords(SHEETS.SETTINGS, settingsRecords, 'setting_key');
      return createJsonResponse({ status: 'success', message: 'បានកត់ត្រាការកំណត់សាលារៀនជោគជ័យ' });
    }

    // ៨. User Login (Legacy Auth Support)
    if (action === 'loginUser') {
      const username = String(payload.username || data.username || '').trim();
      const password = String(payload.password || data.password || '').trim();
      
      const teachers = queryTable(SHEETS.TEACHERS, {});
      const matched = teachers.find(t => String(t.username).toLowerCase() === username.toLowerCase());
      
      if (!matched) {
        return createJsonResponse({ status: 'error', message: 'ឈ្មោះគណនីមិនត្រឹមត្រូវ' });
      }

      // Check simple or hash
      if (matched.password_hash) {
        // If hashed in sheets, verify or return teacher record for client hash verify
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

    // ៩. Register / Update Teacher
    if (action === 'registerUser') {
      const teacher = data;
      if (!teacher.teacher_id) teacher.teacher_id = `TCH-${Date.now()}`;
      teacher.updated_at = new Date().toISOString();
      if (!teacher.created_at) teacher.created_at = teacher.updated_at;

      upsertRecords(SHEETS.TEACHERS, [teacher], 'teacher_id');
      return createJsonResponse({ status: 'success', message: 'បានចុះឈ្មោះគ្រូជោគជ័យ', teacher_id: teacher.teacher_id });
    }

    // ១០. Log Audit
    if (action === 'logAudit') {
      const audit = {
        log_id: `LOG-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: payload.log_action || data.action || 'INFO',
        entity_type: payload.entity_type || data.entity_type || 'SYSTEM',
        user_id: payload.user_id || teacherId || 'SYSTEM',
        details: typeof data === 'object' ? JSON.stringify(data) : String(data)
      };
      upsertRecords(SHEETS.AUDIT_LOGS, [audit], 'log_id');
      return createJsonResponse({ status: 'success' });
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
// ៤. ម៉ាស៊ីនទិន្នន័យជំនួយកម្រិតខ្ពស់ (High-Performance Relational Engine)
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
      record[headers[c]] = row[c];
    }

    // អនុវត្ត Filter
    let matches = true;
    for (const [key, val] of Object.entries(filters)) {
      if (val !== undefined && val !== null && String(val).trim() !== '' && String(val).toLowerCase() !== 'all') {
        const rowVal = record[key];
        if (rowVal === undefined || String(rowVal).trim().toLowerCase() !== String(val).trim().toLowerCase()) {
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
 * ប្រើ 2D Array ទាំងមូលដើម្បីល្បឿនលឿនបំផុត ជៀសវាង Call API ក្នុង Loop
 */
function upsertRecords(sheetName, records, primaryKeyName) {
  if (!records || records.length === 0) return;

  const sheet = getOrCreateSheet(sheetName);
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();

  // បើគ្មានទិន្នន័យទាល់តែសោះ
  if (lastRow === 0) {
    setupDatabaseSheets();
  }

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(h => String(h).trim());
  const pkIndex = headers.indexOf(primaryKeyName);
  if (pkIndex === -1) {
    throw new Error(`Primary Key [${primaryKeyName}] រកមិនឃើញក្នុងតារាង ${sheetName} ឡើយ`);
  }

  // អានទិន្នន័យចាស់មកបង្កើត Index Map
  let existingValues = [];
  if (lastRow > 1) {
    existingValues = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
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

    // បង្កើតជួរដេកតាមលំដាប់ Header
    const rowValues = headers.map(h => {
      const v = rec[h];
      if (v === undefined || v === null) return '';
      if (typeof v === 'object') return JSON.stringify(v);
      return v;
    });

    if (rowIndexMap.has(pkVal)) {
      // ធ្វើបច្ចុប្បន្នភាពជួរចាស់ក្នុង Memory
      const rowIdx = rowIndexMap.get(pkVal);
      existingValues[rowIdx] = rowValues;
    } else {
      // បន្ថែមជួរថ្មី
      rowsToAppend.push(rowValues);
      rowIndexMap.set(pkVal, existingValues.length + rowsToAppend.length - 1);
    }
  }

  // សរសេរទិន្នន័យចាស់ដែលបានកែប្រែឡើងវិញ (Bulk Update)
  if (existingValues.length > 0) {
    sheet.getRange(2, 1, existingValues.length, headers.length).setValues(existingValues);
  }

  // សរសេរទិន្នន័យថ្មីដែលបានបន្ថែម (Bulk Append)
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
      <h3 style="color: #1e3a8a;">🏫 ការណែនាំអំពី Google Apps Script CMS</h3>
      <p>កូដនេះបម្រើជា API Server សម្រាប់ភ្ជាប់ Google Spreadsheet ជាមួយប្រព័ន្ធ Classroom Management System (CMS)។</p>
      <h4>ជំហានដាក់ឱ្យប្រើប្រាស់ (Deploy as Web App):</h4>
      <ol>
        <li>ចុចប៊ូតុងពណ៌ខៀវ <b>Deploy</b> (នៅខាងស្តាំលើ) &gt; <b>New deployment</b></li>
        <li>ជ្រើសរើសប្រភេទ <b>Web app</b></li>
        <li>កំណត់ <b>Execute as: Me</b></li>
        <li>កំណត់ <b>Who has access: Anyone</b> (សំខាន់បំផុត ដើម្បីឱ្យ CMS អាចបញ្ជូនទិន្នន័យបាន)</li>
        <li>ចុច <b>Deploy</b> រួច Copy យក <b>Web App URL</b></li>
        <li>យក URL ទៅបិទភ្ជាប់ក្នុងទំព័រ <b>Settings &gt; Google Sheets &amp; Apps Script</b> ក្នុងប្រព័ន្ធ CMS។</li>
      </ol>
    </div>
  `).setWidth(480).setHeight(360);
  ui.showModalDialog(html, 'ការណែនាំអំពីការភ្ជាប់ប្រព័ន្ធ');
}
