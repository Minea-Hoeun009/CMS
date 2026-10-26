const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');

test('CMS Standardized Smoke Tests (v2 Standards Verification)', async (t) => {
  await t.test('1. Required core modules exist in workspace', () => {
    const requiredFiles = [
      'index.html',
      'js/auth.js',
      'js/students.js',
      'js/attendance.js',
      'js/scores.js',
      'js/reports.js',
      'js/dashboard.js',
      'js/cms-analytics.js'
    ];
    for (const f of requiredFiles) {
      assert.ok(fs.existsSync(path.join(root, f)), `Missing required file: ${f}`);
    }
  });

  await t.test('2. index.html references core modules', () => {
    const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
    const requiredScripts = [
      'js/auth.js',
      'js/students.js',
      'js/attendance.js',
      'js/scores.js',
      'js/reports.js',
      'js/dashboard.js'
    ];
    for (const f of requiredScripts) {
      assert.ok(html.includes(f), `index.html must load ${f}`);
    }
  });

  await t.test('3. Module entry points and functions exist', () => {
    const checks = [
      ['js/auth.js', /login/],
      ['js/students.js', /loadStudentsView|filterStudents/],
      ['js/attendance.js', /loadAttendanceView|fetchMonthlyAttendance/],
      ['js/scores.js', /loadScoresView|fetchStudentsForScores/],
      ['js/reports.js', /loadReportsView/],
      ['js/dashboard.js', /loadDashboard/]
    ];
    for (const [file, re] of checks) {
      const content = fs.readFileSync(path.join(root, file), 'utf8');
      assert.ok(re.test(content), `Module entry point check failed in ${file}`);
    }
  });

  await t.test('4. CMSAnalytics snapshot aggregation with synthetic data', () => {
    const store = {
      academic_students: JSON.stringify([
        { id: 's1', name: 'A', teacher_id: 't1', academic_year: '2026-2027' },
        { id: 's2', name: 'B', teacher_id: 't1', academic_year: '2026-2027' },
        { id: 's3', name: 'C', teacher_id: 't1', academic_year: '2026-2027', status: 'Dropped' }
      ]),
      academic_attendance: JSON.stringify([
        { student_id: 's1', status: 'P' },
        { student_id: 's2', status: 'A' },
        { student_id: 's1', status: 'C' }
      ]),
      academic_scores: JSON.stringify([
        { student_id: 's1', period_type: 'monthly', month: 'មករា', average: '8.5', grade_letter: 'B' },
        { student_id: 's2', period_type: 'monthly', month: 'មករា', average: '4', grade_letter: 'F' }
      ]),
      auth_teacher_id: 't1',
      selected_academic_year: '2026-2027'
    };

    const context = {
      window: {},
      localStorage: { getItem: (k) => store[k] ?? null },
      document: { getElementById: () => null },
      console,
      Set,
      Map,
      Number,
      String,
      Array,
      Object,
      Math
    };
    context.window.window = context.window;

    const analyticsCode = fs.readFileSync(path.join(root, 'js/cms-analytics.js'), 'utf8');
    vm.runInNewContext(analyticsCode, context);

    assert.ok(context.window.CMSAnalytics, 'CMSAnalytics must be defined on window');
    const result = context.window.CMSAnalytics.snapshot();

    assert.equal(result.studentCount, 2, 'Must count 2 active students');
    assert.equal(result.attendance.recorded, 3, 'Must record 3 attendance entries');
    assert.equal(result.attendance.present, 1, 'Must count 1 present');
    assert.equal(result.attendance.absent, 1, 'Must count 1 absent');
    assert.equal(result.attendance.excused, 1, 'Must count 1 excused');
    assert.equal(result.scores.studentsWithScores, 2, 'Must record 2 students with scores');
    assert.equal(result.scores.lowScoreAlerts, 1, 'Must trigger 1 low score alert (F)');
    assert.equal(result.scores.missingScores, 0, 'Must have 0 missing scores');
  });

  await t.test('5. Service worker and PWA assets exist', () => {
    assert.ok(fs.existsSync(path.join(root, 'service-worker.js')), 'service-worker.js must exist');
    assert.ok(fs.existsSync(path.join(root, 'manifest.json')), 'manifest.json must exist');
    assert.ok(fs.existsSync(path.join(root, 'assets/cms-icon.svg')), 'assets/cms-icon.svg must exist');
  });
});
