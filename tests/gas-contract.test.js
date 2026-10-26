const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

test('Google Apps Script Contract & Security Tests', async (t) => {
  const codeGsPath = path.join(__dirname, '..', 'google-apps-script', 'Code.gs');
  const codeGsContent = fs.readFileSync(codeGsPath, 'utf8');

  await t.test('1. Code.gs defines all 8 standard relational schemas', () => {
    const requiredSheets = [
      'STUDENTS', 'TEACHERS', 'CLASSES', 'ATTENDANCE',
      'SCORES', 'LIBRARY', 'SETTINGS', 'AUDIT_LOGS'
    ];
    for (const sheet of requiredSheets) {
      assert.ok(codeGsContent.includes(`${sheet}:`), `Missing sheet constant ${sheet}`);
    }
  });

  await t.test('2. LockService concurrency lock is enforced on write operations', () => {
    assert.ok(
      codeGsContent.includes('LockService.getScriptLock()'),
      'doPost must obtain LockService.getScriptLock()'
    );
    assert.ok(
      codeGsContent.includes('lock.releaseLock()'),
      'doPost must release lock in finally block'
    );
  });

  await t.test('3. getTeachers sanitizes passwords, password_hash, and salt', () => {
    assert.ok(codeGsContent.includes('delete copy.password_hash;'), 'Must remove password_hash');
    assert.ok(codeGsContent.includes('delete copy.salt;'), 'Must remove salt');
    assert.ok(codeGsContent.includes('delete copy.password;'), 'Must remove password');
  });

  await t.test('4. setupSheets has protection mechanism for unauthorized execution', () => {
    assert.ok(
      codeGsContent.includes('ADMIN_SETUP_TOKEN'),
      'setupSheets action must have token check mechanism'
    );
  });

  await t.test('5. Primary keys exist for all upsert operations', () => {
    assert.ok(codeGsContent.includes("upsertRecords(SHEETS.STUDENTS, [student], 'id')") || codeGsContent.includes("SHEETS.STUDENTS, studentsList, 'id'"));
    assert.ok(codeGsContent.includes("SHEETS.SCORES, scoresList, 'score_id'"));
    assert.ok(codeGsContent.includes("SHEETS.ATTENDANCE, attList, 'record_id'"));
  });

  await t.test('6. Reports and Timetables sheets and sync actions are defined', () => {
    assert.ok(codeGsContent.includes("REPORTS: 'Reports'"), 'Must define REPORTS sheet name');
    assert.ok(codeGsContent.includes("TIMETABLES: 'Timetables'"), 'Must define TIMETABLES sheet name');
    assert.ok(codeGsContent.includes("[SHEETS.REPORTS]: [") || codeGsContent.includes("[SHEETS.REPORTS] = ["), 'Must define schema for Reports');
    assert.ok(codeGsContent.includes("'saveReport'"), 'Must handle saveReport in doPost');
    assert.ok(codeGsContent.includes("'saveReportsBatch'"), 'Must handle saveReportsBatch in doPost');
    assert.ok(codeGsContent.includes("syncAll"), 'Must handle syncAll');
  });
});
