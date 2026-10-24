const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function createTeacherWorkspaceContext() {
  const localStorageStore = {};
  const elements = {};

  const makeElement = (id) => {
    const classListSet = new Set();
    const el = {
      id,
      classList: {
        add: (...cls) => cls.forEach(c => classListSet.add(c)),
        remove: (...cls) => cls.forEach(c => classListSet.delete(c)),
        contains: (c) => classListSet.has(c),
        toggle: (c) => {
          if (classListSet.has(c)) classListSet.delete(c);
          else classListSet.add(c);
        }
      },
      style: {},
      innerHTML: '',
      textContent: '',
      value: '',
      checked: false,
      setAttribute: () => {},
      getAttribute: () => null,
      appendChild: () => {},
      addEventListener: () => {}
    };
    elements[id] = el;
    return el;
  };

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
      getElementById: (id) => elements[id] || makeElement(id),
      querySelector: (sel) => null,
      querySelectorAll: (sel) => [],
      createElement: (tag) => makeElement(`elem_${Math.random()}`),
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
      body: {
        appendChild: () => {},
        insertAdjacentHTML: () => {}
      }
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {}
  };
  context.window = context;

  // Load config.js
  const configCode = fs.readFileSync(path.resolve(__dirname, '../js/config.js'), 'utf8');
  vm.runInNewContext(configCode, context);

  // Load settings.js
  const settingsCode = fs.readFileSync(path.resolve(__dirname, '../js/settings.js'), 'utf8');
  vm.runInNewContext(settingsCode, context);

  return { context, localStorageStore, elements };
}

describe('Teacher Personal Workspace & Authentication Preferences Tests', () => {

  test('1. getTeacherPersonalSettings returns defaults and isolates per teacher ID', () => {
    const { context, localStorageStore } = createTeacherWorkspaceContext();
    assert.equal(typeof context.getTeacherPersonalSettings, 'function');

    // Default settings for teacher T-001
    const def = context.getTeacherPersonalSettings('T-001');
    assert.equal(def.teacher_level, 'ថ្នាក់ទី ១');
    assert.equal(def.teacher_room, '«ក»');
    assert.equal(def.features.attendance, true);
    assert.equal(def.features.scores, true);
    assert.equal(def.features.library, true);

    // Save custom settings for T-001
    const customT1 = {
      teacher_name: 'អ្នកគ្រូ កុសល',
      teacher_level: 'ថ្នាក់ទី ៥',
      teacher_room: '«ខ»',
      features: {
        attendance: true,
        scores: true,
        library: false,
        parent_portal: true
      }
    };
    context.saveTeacherPersonalSettings('T-001', customT1);

    // Verify T-001 has custom settings
    const loadedT1 = context.getTeacherPersonalSettings('T-001');
    assert.equal(loadedT1.teacher_name, 'អ្នកគ្រូ កុសល');
    assert.equal(loadedT1.teacher_level, 'ថ្នាក់ទី ៥');
    assert.equal(loadedT1.teacher_room, '«ខ»');
    assert.equal(loadedT1.features.library, false);
    assert.equal(loadedT1.features.parent_portal, true);

    // Verify T-002 is isolated and still gets defaults
    const loadedT2 = context.getTeacherPersonalSettings('T-002');
    assert.equal(loadedT2.teacher_level, 'ថ្នាក់ទី ១');
    assert.equal(loadedT2.features.library, true);
  });

  test('2. applyTeacherFeatureVisibility dynamically toggles sidebar navigation elements', () => {
    const { context, elements } = createTeacherWorkspaceContext();
    assert.equal(typeof context.applyTeacherFeatureVisibility, 'function');

    // Create nav elements
    const navAttendance = context.document.getElementById('nav-attendance');
    const navScores = context.document.getElementById('nav-scores');
    const navLibrary = context.document.getElementById('nav-library');
    const navTimetable = context.document.getElementById('nav-timetable-homework');

    // Case A: Library and Timetable disabled
    context.applyTeacherFeatureVisibility({
      attendance: true,
      scores: true,
      library: false,
      timetable_homework: false
    });

    assert.equal(navAttendance.classList.contains('hidden'), false);
    assert.equal(navScores.classList.contains('hidden'), false);
    assert.equal(navLibrary.classList.contains('hidden'), true);
    assert.equal(navTimetable.classList.contains('hidden'), true);

    // Case B: Re-enable Library
    context.applyTeacherFeatureVisibility({
      attendance: true,
      scores: true,
      library: true,
      timetable_homework: false
    });
    assert.equal(navLibrary.classList.contains('hidden'), false);
    assert.equal(navTimetable.classList.contains('hidden'), true);
  });

  test('3. loadAndApplyTeacherSettings sets classroom and applies feature toggles', () => {
    const { context, localStorageStore } = createTeacherWorkspaceContext();
    assert.equal(typeof context.loadAndApplyTeacherSettings, 'function');

    context.saveTeacherPersonalSettings('T-999', {
      teacher_name: 'លោកគ្រូ សុវណ្ណ',
      teacher_level: 'ថ្នាក់ទី ៦',
      teacher_room: '«គ»',
      features: {
        attendance: true,
        scores: false,
        library: false
      }
    });

    const applied = context.loadAndApplyTeacherSettings('T-999');
    assert.equal(applied.teacher_name, 'លោកគ្រូ សុវណ្ណ');
    assert.equal(context.getCurrentSelectedClass().full, 'ថ្នាក់ទី ៦ «គ»');
    assert.equal(localStorageStore['auth_teacher_grade'], 'ថ្នាក់ទី ៦');
    assert.equal(localStorageStore['auth_teacher_room'], '«គ»');
  });

  test('4. renderPersonalSettingsBadges updates Gmail and Telegram connection badges', () => {
    const { context, elements } = createTeacherWorkspaceContext();
    assert.equal(typeof context.renderPersonalSettingsBadges, 'function');

    const badgeGoogle = context.document.getElementById('badge_gmail_status');
    const badgeTelegram = context.document.getElementById('badge_telegram_status');

    // Connected state
    context.renderPersonalSettingsBadges({
      teacher_email: 'teacher@school.edu.kh',
      telegram_username: 'kheang_teacher',
      telegram_id: '123456789'
    });

    assert.equal(badgeGoogle.innerHTML.includes('teacher@school.edu.kh'), true);
    assert.equal(badgeTelegram.innerHTML.includes('@kheang_teacher'), true);

    // Disconnected state
    context.renderPersonalSettingsBadges({
      teacher_email: '',
      telegram_username: '',
      telegram_id: ''
    });

    assert.equal(badgeGoogle.innerHTML.includes('មិនទាន់ភ្ជាប់'), true);
    assert.equal(badgeTelegram.innerHTML.includes('មិនទាន់ភ្ជាប់'), true);
  });

  test('5. switchSettingsTab switches to personal tab and displays content', () => {
    const { context, elements } = createTeacherWorkspaceContext();
    assert.equal(typeof context.switchSettingsTab, 'function');

    const btnPersonal = context.document.getElementById('tabBtn_personal');
    const contentPersonal = context.document.getElementById('tabContent_personal');
    const contentSchool = context.document.getElementById('tabContent_school');

    context.switchSettingsTab('personal');

    assert.equal(context.currentSettingsTab, 'personal');
    assert.equal(btnPersonal.classList.contains('bg-white'), true);
    assert.equal(contentPersonal.classList.contains('hidden'), false);
    assert.equal(contentSchool.classList.contains('hidden'), true);
  });
});
