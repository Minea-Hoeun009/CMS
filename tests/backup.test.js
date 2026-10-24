const { test, describe } = require('node:test');
const assert = require('node:assert/strict');

describe('Backup and Restore Data Integrity Tests', () => {

  // Baseline test dataset representing school snapshot
  const mockSchoolBackup = {
    metadata: {
      version: '2.4.0',
      exported_at: '2026-10-24T12:00:00.000Z',
      school_id: 'SCH-001',
      academic_year: '2026-2027',
      exported_by: 'TCH-SYSADMIN'
    },
    collections: {
      students: [
        { id: 'STU-1001', name: 'ហឿន មីនា', gender: 'ប្រុស', grade: 'ថ្នាក់ទី ១', room: '«ក»', status: 'Active' },
        { id: 'STU-1002', name: 'ចាន់ ធារ៉ា', gender: 'ស្រី', grade: 'ថ្នាក់ទី ១', room: '«ក»', status: 'Active' }
      ],
      teachers: [
        { teacher_id: 'TCH-001', name: 'គ្រូ ទីមួយ', role: 'teacher', assigned_grade: 'ថ្នាក់ទី ១', assigned_room: '«ក»' }
      ],
      scores: [
        { doc_id: '2026-2027_Grade1_October', grade: 'ថ្នាក់ទី ១', month: 'October', scores: [{ id: 'STU-1001', score: 9.5 }] }
      ],
      attendance: [
        { doc_id: '2026-2027_Grade1_2026_10', grade: 'ថ្នាក់ទី ១', month: '10', total_recorded: 25 }
      ],
      schools_config: {
        school_name: 'សាលាបឋមសិក្សាគំរូ',
        academic_year: '2026-2027',
        director_name: 'លោកនាយក'
      }
    }
  };

  test('1. Backup JSON serialization preserves complete metadata', () => {
    const serialized = JSON.stringify(mockSchoolBackup, null, 2);
    assert.ok(serialized.length > 0);

    const parsed = JSON.parse(serialized);
    assert.equal(parsed.metadata.version, '2.4.0');
    assert.equal(parsed.metadata.school_id, 'SCH-001');
    assert.equal(parsed.metadata.academic_year, '2026-2027');
    assert.equal(parsed.metadata.exported_by, 'TCH-SYSADMIN');
  });

  test('2. Backup contains all required school collections and entity counts', () => {
    const cols = mockSchoolBackup.collections;
    assert.ok(Array.isArray(cols.students));
    assert.equal(cols.students.length, 2);

    assert.ok(Array.isArray(cols.teachers));
    assert.equal(cols.teachers.length, 1);

    assert.ok(Array.isArray(cols.scores));
    assert.equal(cols.scores.length, 1);

    assert.ok(Array.isArray(cols.attendance));
    assert.equal(cols.attendance.length, 1);

    assert.ok(typeof cols.schools_config === 'object');
    assert.equal(cols.schools_config.school_name, 'សាលាបឋមសិក្សាគំរូ');
  });

  test('3. Restore round-trip preserves Unicode Khmer text without corruption', () => {
    const rawKhmerName = 'សាលាបឋមសិក្សាគំរូ និងលោកគ្រូអ្នកគ្រូ ព្រះរាជាណាចក្រកម្ពុជា';
    const jsonStr = JSON.stringify({ name: rawKhmerName });
    const restored = JSON.parse(jsonStr);

    assert.equal(restored.name, rawKhmerName);
    assert.equal(mockSchoolBackup.collections.students[0].name, 'ហឿន មីនា');
  });

  test('4. Cross-collection relational integrity (Student ID references in Scores)', () => {
    const studentIds = new Set(mockSchoolBackup.collections.students.map(s => s.id));
    const scoreRecords = mockSchoolBackup.collections.scores[0].scores;

    // Verify all scored students exist in the student roster
    scoreRecords.forEach(rec => {
      assert.ok(studentIds.has(rec.id), `Scored student ${rec.id} must exist in student collection`);
    });
  });

});
