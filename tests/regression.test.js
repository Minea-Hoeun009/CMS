const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function createAppContext() {
  const context = {
    window: {},
    console,
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {}
  };
  context.window = context;
  context.window.addEventListener = () => {};
  context.window.removeEventListener = () => {};
  context.window.dispatchEvent = () => {};

  const configCode = fs.readFileSync(path.resolve(__dirname, '../js/config.js'), 'utf8');
  vm.runInNewContext(configCode, context);

  return context;
}

describe('Functional Regression Tests (Core Business Logic)', () => {

  const ctx = createAppContext();

  test('1. escapeHtml sanitizes malicious XSS injection payloads', () => {
    assert.equal(typeof ctx.escapeHtml, 'function');

    const rawXss = '<script>alert("XSS")</script>';
    const sanitized = ctx.escapeHtml(rawXss);
    assert.equal(sanitized.includes('<script>'), false);
    assert.equal(sanitized.includes('&lt;script&gt;'), true);

    const attrXss = '"><img src=x onerror=alert(1)>';
    const sanitizedAttr = ctx.escapeHtml(attrXss);
    assert.equal(sanitizedAttr.includes('"'), false);
    assert.equal(sanitizedAttr.includes('&quot;'), true);
  });

  test('2. CMSValidator.validateStudent validates required fields and duplicates', () => {
    assert.ok(ctx.CMSValidator);
    assert.equal(typeof ctx.CMSValidator.validateStudent, 'function');

    const existingStudents = [
      { id: 'STU-001', name: 'សុខ សាន្ត', grade: 'ថ្នាក់ទី ១', room: '«ក»', academic_year: '2026-2027' }
    ];

    // Valid student payload (including required dob and academic_year)
    const valid = ctx.CMSValidator.validateStudent({
      id: 'STU-002',
      name: 'ចាន់ ធារ៉ា',
      dob: '2015-05-12',
      gender: 'ស្រី',
      grade: 'ថ្នាក់ទី ១',
      room: '«ក»',
      academic_year: '2026-2027',
      contact: '012345678'
    }, false, existingStudents);
    assert.equal(valid.isValid, true);
    assert.equal(valid.errors.length, 0);

    // Missing required fields
    const missingFields = ctx.CMSValidator.validateStudent({
      id: '',
      name: '',
      dob: '',
      grade: '',
      room: '',
      academic_year: ''
    }, false, existingStudents);
    assert.equal(missingFields.isValid, false);
    assert.ok(missingFields.errors.length >= 3);

    // Duplicate ID detection on create
    const duplicate = ctx.CMSValidator.validateStudent({
      id: 'STU-001',
      name: 'សិស្ស ស្ទួន',
      dob: '2015-01-01',
      grade: 'ថ្នាក់ទី ១',
      room: '«ក»',
      academic_year: '2026-2027'
    }, false, existingStudents);
    assert.equal(duplicate.isValid, false);
    assert.ok(duplicate.errors.some(e => e.includes('STU-001') || e.includes('ស្ទួន') || e.includes('មានរួចហើយ')));
  });

  test('3. CMSValidator.validateScore checks score bounds and numerical validity', () => {
    assert.equal(typeof ctx.CMSValidator.validateScore, 'function');

    // Valid scores
    assert.equal(ctx.CMSValidator.validateScore(8.5, 10).isValid, true);
    assert.equal(ctx.CMSValidator.validateScore(0, 10).isValid, true);
    assert.equal(ctx.CMSValidator.validateScore(10, 10).isValid, true);

    // Negative score
    const negative = ctx.CMSValidator.validateScore(-1, 10);
    assert.equal(negative.isValid, false);

    // Score exceeding max
    const overMax = ctx.CMSValidator.validateScore(12, 10);
    assert.equal(overMax.isValid, false);

    // Non-numeric score
    const nanScore = ctx.CMSValidator.validateScore('abc', 10);
    assert.equal(nanScore.isValid, false);
  });

  test('4. CMSValidator.validateAttendanceStatus checks valid presence codes', () => {
    assert.equal(typeof ctx.CMSValidator.validateAttendanceStatus, 'function');

    // Valid attendance statuses
    assert.equal(ctx.CMSValidator.validateAttendanceStatus('present'), true);
    assert.equal(ctx.CMSValidator.validateAttendanceStatus('permission'), true);
    assert.equal(ctx.CMSValidator.validateAttendanceStatus('វត្តមាន'), true);
    assert.equal(ctx.CMSValidator.validateAttendanceStatus('ច្បាប់'), true);
    assert.equal(ctx.CMSValidator.validateAttendanceStatus('1'), true);

    // Invalid status
    assert.equal(ctx.CMSValidator.validateAttendanceStatus('invalid_status_xyz'), false);
  });

  test('5. CMSValidator.validateAcademicYear validates year format', () => {
    assert.equal(typeof ctx.CMSValidator.validateAcademicYear, 'function');

    assert.equal(ctx.CMSValidator.validateAcademicYear('2026-2027'), true);
    assert.equal(ctx.CMSValidator.validateAcademicYear('២០២៦-២០២៧'), true);
    assert.equal(ctx.CMSValidator.validateAcademicYear('invalid-year'), false);
    assert.equal(ctx.CMSValidator.validateAcademicYear(''), false);
  });

  test('6. Welcome & Authentication Portal contains critical DOM elements and functions', () => {
    const indexHtml = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');

    // Welcome Screen container and sections
    assert.ok(indexHtml.includes('id="landing-screen"'), 'Must have landing-screen element');
    assert.ok(indexHtml.includes('id="welcome-hero"'), 'Must have welcome-hero section');
    assert.ok(indexHtml.includes('id="welcome-features"'), 'Must have welcome-features section');

    // Login and Register boxes
    assert.ok(indexHtml.includes('id="authLoginBox"'), 'Must preserve authLoginBox');
    assert.ok(indexHtml.includes('id="authRegisterBox"'), 'Must preserve authRegisterBox');
    assert.ok(indexHtml.includes('id="authHelpBox"'), 'Must have authHelpBox');

    // Authentication inputs and buttons
    assert.ok(indexHtml.includes('id="usernameOrPhone"'), 'Must preserve usernameOrPhone input');
    assert.ok(indexHtml.includes('id="password"'), 'Must preserve password input');
    assert.ok(indexHtml.includes('id="btnLogin"'), 'Must preserve btnLogin');
    assert.ok(indexHtml.includes('id="btnGoogleLogin"'), 'Must preserve btnGoogleLogin');
    assert.ok(indexHtml.includes('id="btnTelegramLogin"'), 'Must preserve btnTelegramLogin');
    assert.ok(indexHtml.includes('quickLoginAsAdmin'), 'Must provide quickLoginAsAdmin');
    assert.ok(indexHtml.includes('loginAsGuest'), 'Must provide loginAsGuest');
  });

});
