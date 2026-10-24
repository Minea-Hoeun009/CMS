const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function createClassContext() {
  const localStorageStore = {};
  const context = {
    window: {},
    console,
    localStorage: {
      getItem: (key) => localStorageStore[key] || null,
      setItem: (key, val) => { localStorageStore[key] = String(val); },
      removeItem: (key) => { delete localStorageStore[key]; },
      clear: () => { Object.keys(localStorageStore).forEach(k => delete localStorageStore[k]); }
    },
    document: {
      getElementById: (id) => null,
      querySelector: (sel) => null,
      querySelectorAll: (sel) => [],
      createElement: () => ({ style: {}, classList: { add: () => {}, remove: () => {} }, setAttribute: () => {}, appendChild: () => {} }),
      body: { appendChild: () => {}, insertAdjacentHTML: () => {} }
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {}
  };
  context.window = context;

  // Load config.js
  const configCode = fs.readFileSync(path.resolve(__dirname, '../js/config.js'), 'utf8');
  vm.runInNewContext(configCode, context);

  return { context, localStorageStore };
}

describe('Class & Grade Consistency Across System Modules', () => {

  const { context, localStorageStore } = createClassContext();

  test('1. normalizeGrade handles Khmer, Arabic numbers, and inconsistent formats', () => {
    assert.equal(typeof context.normalizeGrade, 'function');
    assert.equal(context.normalizeGrade('ថ្នាក់ទី 1'), 'ថ្នាក់ទី ១');
    assert.equal(context.normalizeGrade('ថ្នាក់ទី ៤'), 'ថ្នាក់ទី ៤');
    assert.equal(context.normalizeGrade('12'), 'ថ្នាក់ទី ១២');
    assert.equal(context.normalizeGrade('ថ្នាក់ទី ៧'), 'ថ្នាក់ទី ៧');
    assert.equal(context.normalizeGrade('all'), '');
  });

  test('2. getAllGradesList returns complete grade progression (Grades 1 to 12)', () => {
    assert.equal(typeof context.getAllGradesList, 'function');
    const grades = context.getAllGradesList();
    assert.ok(Array.isArray(grades));
    assert.ok(grades.includes('ថ្នាក់ទី ១'));
    assert.ok(grades.includes('ថ្នាក់ទី ៦'));
    assert.ok(grades.includes('ថ្នាក់ទី ១២'));
  });

  test('3. getAllRoomsList returns standard Khmer classroom rooms («ក», «ខ», «គ», «ឃ», «ង»)', () => {
    assert.equal(typeof context.getAllRoomsList, 'function');
    const rooms = context.getAllRoomsList();
    assert.ok(Array.isArray(rooms));
    assert.ok(rooms.includes('«ក»'));
    assert.ok(rooms.includes('«ខ»'));
    assert.ok(rooms.includes('«គ»'));
  });

  test('4. getStudentsForClass strictly isolates students by normalized Grade and Room', () => {
    const mockStudents = [
      { id: 'STU-001', name: 'សុខ សាន្ត', grade: 'ថ្នាក់ទី ៤', room: '«ក»', status: 'Active' },
      { id: 'STU-002', name: 'ចាន់ ធារ៉ា', grade: 'ថ្នាក់ទី 4', room: 'ក', status: 'Active' }, // Arabic 4, unquoted room
      { id: 'STU-003', name: 'កែវ វិបុល', grade: 'ថ្នាក់ទី ៤', room: '«ខ»', status: 'Active' }, // Room B
      { id: 'STU-004', name: 'ម៉ៅ សុផល', grade: 'ថ្នាក់ទី ៥', room: '«ក»', status: 'Active' }, // Grade 5
      { id: 'STU-005', name: 'ឈិន ម៉ាលី', grade: 'ថ្នាក់ទី ៤', room: '«ក»', status: 'Dropped' } // Dropped
    ];
    context.window.allStudents = mockStudents;

    // Query Grade 4 Room A
    const grade4A = context.getStudentsForClass('ថ្នាក់ទី ៤', '«ក»');
    assert.equal(grade4A.length, 2);
    assert.ok(grade4A.some(s => s.id === 'STU-001'));
    assert.ok(grade4A.some(s => s.id === 'STU-002'), 'STU-002 with Arabic 4 and unquoted room must match');
    assert.ok(!grade4A.some(s => s.id === 'STU-003'), 'Room B must be excluded');
    assert.ok(!grade4A.some(s => s.id === 'STU-004'), 'Grade 5 must be excluded');
    assert.ok(!grade4A.some(s => s.id === 'STU-005'), 'Dropped student must be excluded');

    // Query Grade 4 Room B
    const grade4B = context.getStudentsForClass('ថ្នាក់ទី ៤', '«ខ»');
    assert.equal(grade4B.length, 1);
    assert.equal(grade4B[0].id, 'STU-003');

    // Query Grade 5 Room A
    const grade5A = context.getStudentsForClass('ថ្នាក់ទី ៥', '«ក»');
    assert.equal(grade5A.length, 1);
    assert.equal(grade5A[0].id, 'STU-004');
  });

  test('5. getCurrentSelectedClass and setSelectedClass synchronize global active class', () => {
    assert.equal(typeof context.getCurrentSelectedClass, 'function');
    assert.equal(typeof context.setSelectedClass, 'function');

    context.setSelectedClass('ថ្នាក់ទី ៣', '«ខ»');
    const selected = context.getCurrentSelectedClass();
    assert.equal(selected.level, 'ថ្នាក់ទី ៣');
    assert.equal(selected.room, '«ខ»');
    assert.equal(selected.full, 'ថ្នាក់ទី ៣ «ខ»');
  });

  test('6. KrouDigital Report Kha isolates Top 5 rankings to the specific class', () => {
    // Setup 2 different classes with scores
    const students = [
      { id: 'G4-1', name: 'សិស្ស ថ្នាក់៤ លេខ១', grade: 'ថ្នាក់ទី ៤', room: '«ក»', status: 'Active' },
      { id: 'G4-2', name: 'សិស្ស ថ្នាក់៤ លេខ២', grade: 'ថ្នាក់ទី ៤', room: '«ក»', status: 'Active' },
      { id: 'G5-1', name: 'សិស្ស ថ្នាក់៥ លេខ១', grade: 'ថ្នាក់ទី ៥', room: '«ក»', status: 'Active' }
    ];
    context.window.allStudents = students;

    const scores = [
      { student_id: 'G4-1', month: 'មករា', avg: 8.5, total_score: 42.5 },
      { student_id: 'G4-2', month: 'មករា', avg: 7.0, total_score: 35.0 },
      { student_id: 'G5-1', month: 'មករា', avg: 9.8, total_score: 49.0 } // High score in G5
    ];
    localStorageStore['academic_scores'] = JSON.stringify(scores);

    // Filtered students for Grade 4 Room A must NOT include G5-1
    const g4Students = context.getStudentsForClass('ថ្នាក់ទី ៤', '«ក»');
    assert.equal(g4Students.length, 2);
    assert.ok(!g4Students.some(s => s.id === 'G5-1'), 'Grade 5 top student must not leak into Grade 4 Top 5');
  });
});
