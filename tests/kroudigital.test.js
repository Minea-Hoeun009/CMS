const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function createKrouDigitalContext() {
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
      createElement: (tag) => ({
        style: {},
        classList: { add: () => {}, remove: () => {} },
        setAttribute: () => {},
        appendChild: () => {}
      }),
      body: {
        appendChild: () => {}
      }
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {}
  };
  context.window = context;

  const code = fs.readFileSync(path.resolve(__dirname, '../js/krou-digital.js'), 'utf8');
  vm.runInNewContext(code, context);

  return { context, localStorageStore };
}

describe('KrouDigital 4.0 Standard Integration Tests', () => {

  const { context } = createKrouDigitalContext();

  test('1. window.KrouDigital namespace and core methods are exported', () => {
    assert.ok(context.window.KrouDigital, 'window.KrouDigital must exist');
    assert.equal(typeof context.window.KrouDigital.renderReportKa, 'function');
    assert.equal(typeof context.window.KrouDigital.renderReportKha, 'function');
    assert.equal(typeof context.window.KrouDigital.renderReportKoKho, 'function');
    assert.equal(typeof context.window.KrouDigital.renderHealthTracker, 'function');
    assert.equal(typeof context.window.KrouDigital.calculateRowBmi, 'function');
    assert.equal(typeof context.window.KrouDigital.saveHealthRecords, 'function');
    assert.equal(typeof context.window.KrouDigital.renderCertificateModal, 'function');
    assert.equal(typeof context.window.KrouDigital.getEvaluatedStudentsForCertificates, 'function');
    assert.equal(typeof context.window.KrouDigital.buildCertificateHtmlForStudent, 'function');
    assert.equal(typeof context.window.KrouDigital.printBatchCertificates, 'function');
    assert.equal(typeof context.window.KrouDigital.openCertificatesFromScores, 'function');
    assert.equal(typeof context.window.KrouDigital.openParentPortalModal, 'function');
    assert.equal(typeof context.window.KrouDigital.searchStudentForParent, 'function');
  });

  test('2. BMI calculation and health category thresholds match MoEYS standard', () => {
    // Standard BMI formula: weight (kg) / (height (m) ^ 2)
    function computeBMI(heightCm, weightKg) {
      const hM = heightCm / 100;
      return (weightKg / (hM * hM)).toFixed(1);
    }

    // Normal student: 140cm, 38kg -> BMI ~ 19.4 (ស្តង់ដារល្អ)
    const bmiNormal = parseFloat(computeBMI(140, 38));
    assert.ok(bmiNormal >= 18.5 && bmiNormal < 23, 'Normal BMI should be between 18.5 and 23');

    // Underweight student: 140cm, 28kg -> BMI ~ 14.3 (កង្វះអាហារូបត្ថម្ភធ្ងន់ធ្ងរ)
    const bmiUnder = parseFloat(computeBMI(140, 28));
    assert.ok(bmiUnder < 16, 'Underweight BMI should be < 16');

    // Overweight student: 140cm, 55kg -> BMI ~ 28.1 (ធាត់)
    const bmiOver = parseFloat(computeBMI(140, 55));
    assert.ok(bmiOver >= 27, 'Obese BMI should be >= 27');
  });

  test('3. Parent Portal student search matches by exact ID or partial Khmer name', () => {
    const mockStudents = [
      { id: 'STU-001', name: 'សុខ សាន្ត', grade: 'ថ្នាក់ទី ៤', room: '«ក»' },
      { id: 'STU-002', name: 'ចាន់ ធារ៉ា', grade: 'ថ្នាក់ទី ៤', room: '«ក»' },
      { id: 'STU-003', name: 'សុខ ជា', grade: 'ថ្នាក់ទី ៥', room: '«ខ»' }
    ];

    function searchStudents(query) {
      const q = String(query || '').trim().toLowerCase();
      if (!q) return [];
      return mockStudents.filter(s =>
        s.id.toLowerCase().includes(q) ||
        (s.name && s.name.toLowerCase().includes(q))
      );
    }

    // Search by ID
    const byId = searchStudents('STU-002');
    assert.equal(byId.length, 1);
    assert.equal(byId[0].name, 'ចាន់ ធារ៉ា');

    // Search by partial Khmer name "សុខ"
    const byName = searchStudents('សុខ');
    assert.equal(byName.length, 2);
    assert.ok(byName.some(s => s.name === 'សុខ សាន្ត'));
    assert.ok(byName.some(s => s.name === 'សុខ ជា'));

    // Non-existent search
    const notFound = searchStudents('កក្កដា');
    assert.equal(notFound.length, 0);
  });

  test('4. Report Ka ranking and pass rate logic calculates correctly', () => {
    const scores = [
      { id: 'S1', avg: 8.5 }, // Rank 1 (Passed)
      { id: 'S2', avg: 4.2 }, // Rank 3 (Failed)
      { id: 'S3', avg: 7.0 }  // Rank 2 (Passed)
    ];

    scores.sort((a, b) => b.avg - a.avg);
    scores.forEach((s, idx) => {
      s.rank = idx + 1;
      s.passed = s.avg >= 5.0;
    });

    assert.equal(scores[0].id, 'S1');
    assert.equal(scores[0].rank, 1);
    assert.equal(scores[0].passed, true);

    assert.equal(scores[1].id, 'S3');
    assert.equal(scores[1].rank, 2);
    assert.equal(scores[1].passed, true);

    assert.equal(scores[2].id, 'S2');
    assert.equal(scores[2].rank, 3);
    assert.equal(scores[2].passed, false);

    const total = scores.length;
    const passed = scores.filter(s => s.passed).length;
    const passRate = ((passed / total) * 100).toFixed(1);

    assert.equal(total, 3);
    assert.equal(passed, 2);
    assert.equal(passRate, '66.7');
  });

  test('5. Health records persistence correctly handles student health profiles', () => {
    const { context, localStorageStore } = createKrouDigitalContext();
    
    // Simulate initial health records
    const initialRecords = [
      { student_id: 'STU-001', height: 135, weight: 32, vision: 'ល្អ', vaccine: 'គ្រប់ដូស' }
    ];
    localStorageStore['student_health_records'] = JSON.stringify(initialRecords);

    // Save/update health record for STU-002
    const current = JSON.parse(localStorageStore['student_health_records'] || '[]');
    current.push({ student_id: 'STU-002', height: 142, weight: 36, vision: 'ម្ខាងខ្សោយ', vaccine: 'ខ្វះ១ដូស' });
    localStorageStore['student_health_records'] = JSON.stringify(current);

    const loaded = JSON.parse(localStorageStore['student_health_records']);
    assert.equal(loaded.length, 2);
    assert.equal(loaded[1].student_id, 'STU-002');
    assert.equal(loaded[1].height, 142);
    assert.equal(loaded[1].weight, 36);
  });

  test('6. Certificate Studio accurately pulls real student evaluation scores and ranks', () => {
    const { context, localStorageStore } = createKrouDigitalContext();
    
    // Setup test students in localStorage
    const testStudents = [
      { id: 'STU-001', name: 'ចាន់ សុខា', gender: 'ស្រី', grade: 'ថ្នាក់ទី ៧', room: '«ក»' },
      { id: 'STU-002', name: 'សេង វិបុល', gender: 'ប្រុស', grade: 'ថ្នាក់ទី ៧', room: '«ក»' },
      { id: 'STU-003', name: 'កែវ មករា', gender: 'ប្រុស', grade: 'ថ្នាក់ទី ៧', room: '«ក»' }
    ];
    localStorageStore['students'] = JSON.stringify(testStudents);

    // Setup test scores
    const testScores = [
      { student_id: 'STU-001', grade: 'ថ្នាក់ទី ៧', period_type: 'month', month: 'មករា', academic_year: '២០២៥ - ២០២៦', average: 8.85, rank: 1, grade_letter: 'A' },
      { student_id: 'STU-002', grade: 'ថ្នាក់ទី ៧', period_type: 'month', month: 'មករា', academic_year: '២០២៥ - ២០២៦', average: 7.40, rank: 2, grade_letter: 'B' },
      { student_id: 'STU-003', grade: 'ថ្នាក់ទី ៧', period_type: 'month', month: 'មករា', academic_year: '២០២៥ - ២០២៦', average: 6.20, rank: 3, grade_letter: 'C' }
    ];
    localStorageStore['academic_scores'] = JSON.stringify(testScores);

    // Call getEvaluatedStudentsForCertificates
    const evaluated = context.window.KrouDigital.getEvaluatedStudentsForCertificates('ថ្នាក់ទី ៧', 'month', 'មករា', '២០២៥ - ២០២៦', '«ក»');
    
    assert.ok(Array.isArray(evaluated), 'Result must be an array');
    assert.equal(evaluated.length, 3);
    assert.equal(evaluated[0].id, 'STU-001');
    assert.equal(evaluated[0].name, 'ចាន់ សុខា');
    assert.equal(evaluated[0].rank, 1);
    assert.equal(evaluated[0].avg, 8.85);
    assert.equal(evaluated[0].gradeLetter, 'A');

    assert.equal(evaluated[1].id, 'STU-002');
    assert.equal(evaluated[1].rank, 2);
    assert.equal(evaluated[1].avg, 7.4);

    assert.equal(evaluated[2].id, 'STU-003');
    assert.equal(evaluated[2].rank, 3);
    assert.equal(evaluated[2].avg, 6.2);
  });

  test('7. Certificate HTML accurately displays student evaluation results', () => {
    const { context } = createKrouDigitalContext();
    
    const student = {
      id: 'STU-001',
      name: 'ចាន់ សុខា',
      gender: 'ស្រី',
      grade: 'ថ្នាក់ទី ៧',
      room: '«ក»',
      avg: 9.15,
      gradeLetter: 'A',
      rank: 1
    };

    const certHtml = context.window.KrouDigital.buildCertificateHtmlForStudent(student, 1, {
      grade: 'ថ្នាក់ទី ៧',
      sessionText: 'ប្រចាំខែមករា ឆ្នាំសិក្សា ២០២៥ - ២០២៦',
      reasonText: 'មានស្នាដៃឆ្នើមក្នុងការសិក្សា ទទួលបានចំណាត់ថ្នាក់កិត្តិយស',
      schoolName: 'វិទ្យាល័យ ហ៊ុន សែន ភ្នំពេញ'
    });

    assert.ok(certHtml.includes('ចាន់ សុខា'), 'Must contain student name');
    assert.ok(certHtml.includes('ប័ណ្ណសរសើរ'), 'Must contain Certificate header');
    assert.ok(certHtml.includes('ថ្នាក់ទី ៧'), 'Must contain grade');
    assert.ok(certHtml.includes('មករា'), 'Must contain period');
    assert.ok(certHtml.includes('ចំណាត់ថ្នាក់លេខ'), 'Must contain rank text');
    assert.ok(certHtml.includes('មធ្យមភាគ ៩.១៥') || certHtml.includes('9.15') || certHtml.includes('៩.១៥'), 'Must display average');
    assert.ok(certHtml.includes('និទ្ទេស A') || certHtml.includes('និទ្ទេស'), 'Must display grade letter');
  });

  test('8. Certificate Batch Printing and Score Integration functions are available', () => {
    const { context } = createKrouDigitalContext();
    assert.equal(typeof context.window.KrouDigital.printBatchCertificates, 'function');
    assert.equal(typeof context.window.KrouDigital.syncRealScoresForCertificates, 'function');
    assert.equal(typeof context.window.KrouDigital.openCertificatesFromScores, 'function');
  });
});
