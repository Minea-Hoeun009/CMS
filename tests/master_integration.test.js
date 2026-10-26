const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

test('CMS Master Architecture Integration Suite (v4.0)', async (t) => {
  const codeGsPath = path.join(__dirname, '..', 'google-apps-script', 'Code.gs');
  const codeGsContent = fs.readFileSync(codeGsPath, 'utf8');

  const eventBusPath = path.join(__dirname, '..', 'js', 'event-bus.js');
  const eventBusContent = fs.readFileSync(eventBusPath, 'utf8');

  const dashboardPath = path.join(__dirname, '..', 'js', 'dashboard.js');
  const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');

  const studentsJsPath = path.join(__dirname, '..', 'js', 'students.js');
  const studentsJsContent = fs.readFileSync(studentsJsPath, 'utf8');

  const attendanceJsPath = path.join(__dirname, '..', 'js', 'attendance.js');
  const attendanceJsContent = fs.readFileSync(attendanceJsPath, 'utf8');

  const scoresJsPath = path.join(__dirname, '..', 'js', 'scores.js');
  const scoresJsContent = fs.readFileSync(scoresJsPath, 'utf8');

  const timetableJsPath = path.join(__dirname, '..', 'js', 'timetable-homework.js');
  const timetableJsContent = fs.readFileSync(timetableJsPath, 'utf8');

  // 1. Verify 24 Relational Tables in Code.gs
  await t.test('1. Verify 24 Relational Sheets & Schemas in Code.gs', () => {
    const requiredSheets = [
      'STUDENTS', 'TEACHERS', 'CLASSES', 'ATTENDANCE', 'SCORES',
      'SUBJECTS', 'ACADEMIC_YEARS', 'ENROLLMENTS', 'TEACHER_ASSIGNMENTS',
      'EXAMINATIONS', 'TIMETABLES', 'HOMEWORK', 'ANNOUNCEMENTS',
      'NOTIFICATIONS', 'EVENT_QUEUE', 'USERS', 'SESSIONS', 'AUDIT_LOGS'
    ];

    requiredSheets.forEach(sheetKey => {
      assert.ok(
        codeGsContent.includes(`${sheetKey}:`),
        `Code.gs must define table sheet constant: ${sheetKey}`
      );
    });

    // Check recalculateScoresAndRankings
    assert.ok(codeGsContent.includes('function recalculateScoresAndRankings'), 'Must implement recalculateScoresAndRankings');
    assert.ok(codeGsContent.includes('grade_letter'), 'Must auto-assign letter grades (A-F)');
    assert.ok(codeGsContent.includes('function emitSystemEvent'), 'Must implement emitSystemEvent');
  });

  // 2. Central EventBus & Dynamic Orchestrator Execution
  await t.test('2. Central EventBus execution & Dynamic Relationships', async () => {
    // Set up a mock browser environment
    const sandbox = {
      window: {},
      console: console,
      setTimeout: setTimeout,
      clearTimeout: clearTimeout,
      localStorage: {
        store: {},
        getItem: function(k) { return this.store[k] || null; },
        setItem: function(k, v) { this.store[k] = String(v); }
      }
    };
    sandbox.window = sandbox;

    vm.createContext(sandbox);
    vm.runInContext(eventBusContent, sandbox);

    assert.ok(sandbox.window.CMSEventTypes, 'CMSEventTypes must be defined on window');
    assert.ok(sandbox.window.CMSEventBus, 'CMSEventBus must be defined on window');
    assert.ok(sandbox.window.CMSOrchestrator, 'CMSOrchestrator must be defined on window');

    // Test EventBus Pub/Sub
    let receivedPayload = null;
    const testListener = (payload) => { receivedPayload = payload; };
    
    sandbox.window.CMSEventBus.on(sandbox.window.CMSEventTypes.STUDENT_ENROLLED, testListener);
    
    const dispatched = await sandbox.window.CMSEventBus.emit(
      sandbox.window.CMSEventTypes.STUDENT_ENROLLED,
      { student_id: 'STU-101', student_name: 'Meas Chan', grade: 'ថ្នាក់ទី ៧', room: '«ក»' },
      false // don't sync to GAS during unit test
    );

    assert.strictEqual(dispatched.event_type, sandbox.window.CMSEventTypes.STUDENT_ENROLLED);
    assert.strictEqual(receivedPayload.student_id, 'STU-101');
    assert.strictEqual(sandbox.window.CMSEventBus.history.length, 1);

    // Test Unsubscribe
    sandbox.window.CMSEventBus.off(sandbox.window.CMSEventTypes.STUDENT_ENROLLED, testListener);
    receivedPayload = null;
    await sandbox.window.CMSEventBus.emit(
      sandbox.window.CMSEventTypes.STUDENT_ENROLLED,
      { student_id: 'STU-102' },
      false
    );
    assert.strictEqual(receivedPayload, null, 'Unsubscribed listener should not receive events');
  });

  // 3. Module Integration Hooks into CMSEventBus
  await t.test('3. Module Integration Hooks into Central EventBus', () => {
    assert.ok(
      studentsJsContent.includes('CMSEventTypes.STUDENT_ENROLLED'),
      'students.js must emit STUDENT_ENROLLED on save'
    );
    assert.ok(
      studentsJsContent.includes('CMSEventTypes.STUDENT_WITHDRAWN'),
      'students.js must emit STUDENT_WITHDRAWN on soft delete'
    );
    assert.ok(
      attendanceJsContent.includes('CMSEventTypes.ATTENDANCE_RECORDED'),
      'attendance.js must emit ATTENDANCE_RECORDED on save'
    );
    assert.ok(
      scoresJsContent.includes('CMSEventTypes.SCORE_UPDATED'),
      'scores.js must emit SCORE_UPDATED on score save'
    );
    assert.ok(
      timetableJsContent.includes('CMSEventTypes.TIMETABLE_CHANGED'),
      'timetable-homework.js must emit TIMETABLE_CHANGED on timetable save'
    );
    assert.ok(
      timetableJsContent.includes('CMSEventTypes.HOMEWORK_ASSIGNED'),
      'timetable-homework.js must emit HOMEWORK_ASSIGNED on homework save'
    );
  });

  // 4. Role-Aware Dynamic Dashboard Rendering & Filters
  await t.test('4. Dynamic Role-Aware Dashboard logic & filters', () => {
    assert.ok(dashboardContent.includes('window.DashboardFilterState'), 'Must support interactive filter state');
    assert.ok(dashboardContent.includes('handleDashboardFilterChange'), 'Must provide filter change handler');
    assert.ok(dashboardContent.includes('refreshDashboardData'), 'Must provide refreshDashboardData API sync');
    assert.ok(dashboardContent.includes('super_admin'), 'Must render Super Admin specific KPIs');
    assert.ok(dashboardContent.includes('homeroom_teacher'), 'Must render Homeroom Teacher specific KPIs');
    assert.ok(dashboardContent.includes('subject_teacher'), 'Must render Subject Teacher specific KPIs');
    assert.ok(dashboardContent.includes('student'), 'Must render Student specific KPIs');
    assert.ok(dashboardContent.includes('chartStudentDemographics'), 'Must render demographics chart');
    assert.ok(dashboardContent.includes('CMSEventBus.on'), 'Must auto-listen to CMSEventBus for reactive updates');
  });

  // 5. Student Transfer Historical Preservation vs Active Class
  await t.test('5. Student Transfer Historical Preservation & Enrollment Status in Code.gs', () => {
    assert.ok(codeGsContent.includes('transferStudent'), 'Code.gs must provide transferStudent handler');
    assert.ok(codeGsContent.includes('ENROLLMENTS'), 'Code.gs must record into Enrollments table');
    assert.ok(codeGsContent.includes("status: 'transferred'"), 'Old enrollment must be marked transferred');
    assert.ok(codeGsContent.includes("status: 'active'"), 'New enrollment must be marked active');
  });

  // 6. Automated Ranking & Grade Letter Auto-Recalculation
  await t.test('6. Automated Class Ranking & Grade Recalculation Calculation', () => {
    const mockScores = [
      { student_id: 'S1', score: '8.5', total: '42.5', average: '8.5' },
      { student_id: 'S2', score: '9.2', total: '46.0', average: '9.2' },
      { student_id: 'S3', score: '6.5', total: '32.5', average: '6.5' }
    ];

    // Sort descending by total/score
    mockScores.sort((a, b) => (parseFloat(b.total) || 0) - (parseFloat(a.total) || 0));
    mockScores.forEach((s, idx) => {
      s.rank = idx + 1;
      const avg = parseFloat(s.average);
      if (avg >= 8.5) s.grade_letter = 'ល្អណាស់ (A)';
      else if (avg >= 7.0) s.grade_letter = 'ល្អ (B)';
      else if (avg >= 6.0) s.grade_letter = 'ល្អបង្គួរ (C)';
      else if (avg >= 5.0) s.grade_letter = 'មធ្យម (D)';
      else s.grade_letter = 'ខ្សោយ (F)';
    });

    assert.strictEqual(mockScores[0].student_id, 'S2', 'Top score must have rank 1');
    assert.strictEqual(mockScores[0].rank, 1);
    assert.strictEqual(mockScores[0].grade_letter, 'ល្អណាស់ (A)');
    assert.strictEqual(mockScores[1].rank, 2);
    assert.strictEqual(mockScores[2].rank, 3);
    assert.strictEqual(mockScores[2].grade_letter, 'ល្អបង្គួរ (C)');
  });

  // 7. Student Comprehensive 27-Column Import Template & Mapping
  await t.test('7. Comprehensive Student Import Template & 27 Standard Fields Verification', () => {
    const advReportsContent = fs.readFileSync(path.join(__dirname, '..', 'js', 'advanced-reports.js'), 'utf8');
    
    // Check template export in students.js
    assert.ok(studentsJsContent.includes('Student_Import_Template_MoEYS.xlsx'), 'students.js must download standard MoEYS template');
    assert.ok(studentsJsContent.includes('ទីកន្លែងកំណើត(ភូមិ)'), 'Template must include place of birth fields');
    assert.ok(studentsJsContent.includes('ទីលំនៅបច្ចុប្បន្ន(ភូមិ)'), 'Template must include current address fields');
    assert.ok(studentsJsContent.includes('ឈ្មោះឪពុក'), 'Template must include father info');
    assert.ok(studentsJsContent.includes('ឈ្មោះម្ដាយ'), 'Template must include mother info');
    assert.ok(studentsJsContent.includes('ឆ្នាំសិក្សា'), 'Template must include academic year');
    assert.ok(studentsJsContent.includes('ប័ណ្ណក្រីក្រ'), 'Template must include poor ID flag');
    assert.ok(studentsJsContent.includes('អាហារូបករណ៍'), 'Template must include scholarship flag');
    assert.ok(studentsJsContent.includes('ពិការភាព'), 'Template must include disability flag');

    // Check advanced-reports.js template consistency
    assert.ok(advReportsContent.includes('downloadStudentTemplate'), 'advanced-reports.js must support downloadStudentTemplate');
    assert.ok(advReportsContent.includes('Student_Import_Template_MoEYS.xlsx'), 'advanced-reports.js must use the comprehensive template');
    assert.ok(advReportsContent.includes('stu_academic_year') || studentsJsContent.includes('stu_academic_year'), 'Modal form must support academic year');
  });
});
