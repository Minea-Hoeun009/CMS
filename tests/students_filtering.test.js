const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function createStudentsContext() {
  const localStorageStore = {};
  const elements = {};
  const context = {
    window: {},
    console,
    URL,
    setTimeout: (fn) => setTimeout(fn, 0),
    clearTimeout: (id) => clearTimeout(id),
    localStorage: {
      getItem: (key) => localStorageStore[key] || null,
      setItem: (key, val) => { localStorageStore[key] = String(val); },
      removeItem: (key) => { delete localStorageStore[key]; },
      clear: () => { Object.keys(localStorageStore).forEach(k => delete localStorageStore[k]); }
    },
    document: {
      getElementById: (id) => elements[id] || null,
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

  // Mock DOM elements for filtering
  elements['stuSearchInput'] = { value: '' };
  elements['stuFilterGrade'] = { value: 'all' };
  elements['stuFilterRoom'] = { value: 'all' };
  elements['stuFilterGender'] = { value: 'all' };
  elements['stuFilterStatus'] = { value: 'Active' };
  elements['hdrTotal'] = { innerText: '0' };
  elements['hdrActive'] = { innerText: '0' };
  elements['studentsTableBody'] = { innerHTML: '' };

  const configCode = fs.readFileSync(path.resolve(__dirname, '../js/config.js'), 'utf8');
  vm.runInNewContext(configCode, context);
  const studentsCode = fs.readFileSync(path.resolve(__dirname, '../js/students.js'), 'utf8');
  vm.runInNewContext(studentsCode, context);

  return { context, localStorageStore, elements };
}

describe('Student List Filtering & Single-Classroom UX Guard Tests', () => {

  test('1. filterStudents displays active students across Khmer/English status variants', () => {
    const { context, elements } = createStudentsContext();
    context.window.allStudents = [
      { id: 'STU-001', name: 'សុខ វិសាល', grade: 'ថ្នាក់ទី ៤', room: '«ក»', status: 'សកម្ម' },
      { id: 'STU-002', name: 'ចាន់ ធារ៉ា', grade: 'ថ្នាក់ទី ៤', room: 'ក', status: 'Active' },
      { id: 'STU-003', name: 'កែវ ពិសិដ្ឋ', grade: 'ថ្នាក់ទី ៤', room: '«ក»', status: 'កំពុងសិក្សា' },
      { id: 'STU-004', name: 'ឡុង ដារ៉ា', grade: 'ថ្នាក់ទី ៤', room: '«ក»', status: 'withdrawn' }
    ];

    elements['stuFilterStatus'].value = 'Active';
    context.window.filterStudents();

    assert.equal(context.window.filteredStudents.length, 3);
    assert.equal(context.window.filteredStudents.some(s => s.id === 'STU-001'), true);
    assert.equal(context.window.filteredStudents.some(s => s.id === 'STU-002'), true);
    assert.equal(context.window.filteredStudents.some(s => s.id === 'STU-003'), true);
    assert.equal(context.window.filteredStudents.some(s => s.id === 'STU-004'), false);
  });

  test('2. Room normalization matches with or without guillemets («ក» vs ក)', () => {
    const { context, elements } = createStudentsContext();
    context.window.allStudents = [
      { id: 'STU-001', name: 'សេង ហេង', grade: 'ថ្នាក់ទី ៤', room: 'ក', status: 'Active' },
      { id: 'STU-002', name: 'ឡី សុភា', grade: 'ថ្នាក់ទី ៤', room: '«ក»', status: 'Active' }
    ];

    elements['stuFilterRoom'].value = '«ក»';
    context.window.filterStudents();

    assert.equal(context.window.filteredStudents.length, 2);
  });

  test('3. Single-Classroom UX Guard guarantees students are never hidden on blank search', () => {
    const { context, elements } = createStudentsContext();
    // Simulate database having 2 students with mismatched format
    context.window.allStudents = [
      { id: 'STU-101', name: 'ម៉ៅ វុទ្ធី', grade: 'ថ្នាក់ទី 1', room: 'A', status: 'សកម្ម' },
      { id: 'STU-102', name: 'ស៊ុន ធីតា', grade: '4', room: '1', status: 'enrolled' }
    ];

    // Simulate filter set to standard grade 1
    elements['stuSearchInput'].value = '';
    elements['stuFilterGrade'].value = 'ថ្នាក់ទី ១';
    elements['stuFilterRoom'].value = '«ក»';
    elements['stuFilterGender'].value = 'all';
    elements['stuFilterStatus'].value = 'Active';

    context.window.filterStudents();

    // UX Guard triggers and shows active students instead of empty table
    assert.equal(context.window.filteredStudents.length, 2);
    assert.equal(String(elements['hdrActive'].innerText), '2');
  });

  test('4. resetStudentFilters resets filters to all and restores all active students', () => {
    const { context, elements } = createStudentsContext();
    context.window.allStudents = [
      { id: 'STU-001', name: 'ស៊ូ សំណាង', grade: 'ថ្នាក់ទី ៤', room: '«ក»', status: 'Active' },
      { id: 'STU-002', name: 'វណ្ណ ស្រីលក្ខណ៍', grade: 'ថ្នាក់ទី ៤', room: '«ក»', status: 'Active' }
    ];

    elements['stuSearchInput'].value = 'មិនមានឈ្មោះនេះ';
    context.window.filterStudents();
    assert.equal(context.window.filteredStudents.length, 0);

    context.window.resetStudentFilters();
    assert.equal(elements['stuSearchInput'].value, '');
    assert.equal(elements['stuFilterGrade'].value, 'all');
    assert.equal(elements['stuFilterRoom'].value, 'all');
    assert.equal(context.window.filteredStudents.length, 2);
  });

});
