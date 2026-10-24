const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Mock a lightweight browser environment to load auth.js and config.js
function createAuthContext() {
  const localStorageStore = {};
  const context = {
    window: {},
    console,
    localStorage: {
      getItem: (k) => localStorageStore[k] || null,
      setItem: (k, v) => { localStorageStore[k] = String(v); },
      removeItem: (k) => { delete localStorageStore[k]; },
      clear: () => { Object.keys(localStorageStore).forEach(k => delete localStorageStore[k]); }
    },
    document: {
      getElementById: () => null,
      querySelectorAll: () => [],
      body: { insertAdjacentHTML: () => {} },
      addEventListener: () => {},
      removeEventListener: () => {}
    },
    navigator: { userAgent: 'NodeTestRunner' },
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
    CustomEvent: class CustomEvent { constructor(type, detail) { this.type = type; this.detail = detail; } }
  };
  context.window = context;
  context.window.document = context.document;
  context.window.addEventListener = () => {};
  context.window.removeEventListener = () => {};
  context.window.dispatchEvent = () => {};

  // Load config.js
  const configCode = fs.readFileSync(path.resolve(__dirname, '../js/config.js'), 'utf8');
  vm.runInNewContext(configCode, context);

  // Load auth.js
  const authCode = fs.readFileSync(path.resolve(__dirname, '../js/auth.js'), 'utf8');
  vm.runInNewContext(authCode, context);

  return context;
}

describe('Role-Based Access Control (RBAC) Matrix Tests', () => {

  test('1. System Admin has full unrestricted access', () => {
    const ctx = createAuthContext();
    ctx.AppAuth.state = {
      isLoggedIn: true,
      teacherId: 'TCH-SYSADMIN',
      name: 'System Admin',
      username: 'admin',
      role: 'system_admin',
      roles: ['system_admin', 'school_admin'],
      assigned_grade: 'all',
      assigned_room: 'all',
      school_id: 'SCH-001',
      status: 'active'
    };

    assert.equal(ctx.isSystemAdmin(), true);
    assert.equal(ctx.isSchoolAdmin(), true);
    assert.equal(ctx.canEditRecords(), true);

    const scope = ctx.getAssignedScope();
    assert.equal(scope.grade, 'all');
    assert.equal(scope.room, 'all');

    // DataServiceGuard permission assertions
    assert.equal(ctx.DataServiceGuard.can('edit_student', { grade: 'ថ្នាក់ទី ១', room: '«ក»' }), true);
    assert.equal(ctx.DataServiceGuard.can('edit_student', { grade: 'ថ្នាក់ទី ១២', room: '«ខ»' }), true);
    assert.equal(ctx.DataServiceGuard.can('enter_scores', { grade: 'ថ្នាក់ទី ៧', room: '«ក»' }), true);
    assert.equal(ctx.DataServiceGuard.can('record_attendance', { grade: 'ថ្នាក់ទី ៥', room: '«ក»' }), true);
    assert.equal(ctx.DataServiceGuard.can('manage_users', {}), true);
  });

  test('2. School Admin access is bounded by school', () => {
    const ctx = createAuthContext();
    ctx.AppAuth.state = {
      isLoggedIn: true,
      teacherId: 'TCH-SCHADMIN',
      name: 'School Principal',
      username: 'schooladmin',
      role: 'school_admin',
      roles: ['school_admin'],
      assigned_grade: 'all',
      assigned_room: 'all',
      school_id: 'SCH-001',
      status: 'active'
    };

    assert.equal(ctx.isSystemAdmin(), false);
    assert.equal(ctx.isSchoolAdmin(), true);
    assert.equal(ctx.canEditRecords(), true);

    // Can edit within their school across all grades
    assert.equal(ctx.DataServiceGuard.can('edit_student', { grade: 'ថ្នាក់ទី ១' }), true);
    assert.equal(ctx.DataServiceGuard.can('edit_student', { grade: 'ថ្នាក់ទី ៩' }), true);
    assert.equal(ctx.DataServiceGuard.can('record_attendance', { grade: 'ថ្នាក់ទី ៣' }), true);
  });

  test('3. Teacher is restricted to assigned grade and room', () => {
    const ctx = createAuthContext();
    ctx.AppAuth.state = {
      isLoggedIn: true,
      teacherId: 'TCH-001',
      name: 'Teacher Sok',
      username: 'teacher',
      role: 'teacher',
      roles: ['teacher'],
      assigned_grade: 'ថ្នាក់ទី ១',
      assigned_room: '«ក»',
      school_id: 'SCH-001',
      status: 'active'
    };

    assert.equal(ctx.isSystemAdmin(), false);
    assert.equal(ctx.isSchoolAdmin(), false);
    assert.equal(ctx.isTeacher(), true);
    assert.equal(ctx.isReportViewer(), false);

    // Allowed within assigned scope (Grade 1 Room A)
    assert.equal(ctx.DataServiceGuard.can('edit_student', { grade: 'ថ្នាក់ទី ១', room: '«ក»' }), true);
    assert.equal(ctx.DataServiceGuard.can('record_attendance', { grade: 'ថ្នាក់ទី ១', room: '«ក»' }), true);
    assert.equal(ctx.DataServiceGuard.can('enter_scores', { grade: 'ថ្នាក់ទី ១', room: '«ក»' }), true);

    // DENIED outside assigned scope (Grade 2 or Room B)
    assert.equal(ctx.DataServiceGuard.can('edit_student', { grade: 'ថ្នាក់ទី ២', room: '«ក»' }), false);
    assert.equal(ctx.DataServiceGuard.can('edit_student', { grade: 'ថ្នាក់ទី ១', room: '«ខ»' }), false);
    assert.equal(ctx.DataServiceGuard.can('record_attendance', { grade: 'ថ្នាក់ទី ៥', room: '«ក»' }), false);
    assert.equal(ctx.DataServiceGuard.can('manage_users', {}), false);
  });

  test('4. Report Viewer has strictly read-only access (all writes denied)', () => {
    const ctx = createAuthContext();
    ctx.AppAuth.state = {
      isLoggedIn: true,
      teacherId: 'TCH-VIEWER',
      name: 'Viewer',
      username: 'viewer',
      role: 'report_viewer',
      roles: ['report_viewer'],
      assigned_grade: 'all',
      assigned_room: 'all',
      school_id: 'SCH-001',
      status: 'active'
    };

    assert.equal(ctx.isSystemAdmin(), false);
    assert.equal(ctx.isSchoolAdmin(), false);
    assert.equal(ctx.isTeacher(), false);
    assert.equal(ctx.isReportViewer(), true);
    assert.equal(ctx.canEditRecords(), false);

    // All modification actions must be denied
    assert.equal(ctx.DataServiceGuard.can('edit_student', { grade: 'ថ្នាក់ទី ១' }), false);
    assert.equal(ctx.DataServiceGuard.can('record_attendance', { grade: 'ថ្នាក់ទី ១' }), false);
    assert.equal(ctx.DataServiceGuard.can('enter_scores', { grade: 'ថ្នាក់ទី ១' }), false);
    assert.equal(ctx.DataServiceGuard.can('delete_record', {}), false);
    assert.equal(ctx.DataServiceGuard.can('manage_users', {}), false);
  });

});
