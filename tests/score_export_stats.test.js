const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

describe('Score Export Summary Statistics Tests', () => {
  function createScoreExportContext() {
    let lastBlob = null;
    let lastWb = null;

    class MockBlob {
      constructor(parts, options) {
        this.content = parts.join('');
        this.type = options?.type;
        lastBlob = this;
      }
    }

    const mockURL = {
      createObjectURL: (b) => {
        lastBlob = b;
        return 'blob:mock-url';
      },
      revokeObjectURL: () => {}
    };

    const mockXLSX = {
      utils: {
        book_new: () => ({ SheetNames: [], Sheets: {} }),
        aoa_to_sheet: (data) => ({ '!data': data }),
        book_append_sheet: (wb, ws, name) => {
          wb.SheetNames.push(name);
          wb.Sheets[name] = ws;
        }
      },
      writeFile: (wb) => { lastWb = wb; }
    };

    const context = {
      Blob: MockBlob,
      URL: mockURL,
      XLSX: mockXLSX,
      console,
      setTimeout,
      clearTimeout,
      document: {
        getElementById: (id) => {
          if (id === 'globalPeriodType') return { value: 'monthly' };
          if (id === 'globalPeriodValue') return { value: 'មករា' };
          if (id === 'globalAcademicYear') return { value: '2026-2027' };
          return null;
        },
        createElement: (tag) => ({
          tagName: tag.toUpperCase(),
          style: {},
          click: function() { this.clicked = true; }
        }),
        body: {
          appendChild: () => {},
          removeChild: () => {}
        }
      },
      localStorage: {
        getItem: (k) => {
          if (k === 'school_settings') return JSON.stringify({ district: 'កៀនស្វាយ', school_name: 'សាលាបឋមសិក្សា' });
          return null;
        },
        setItem: () => {}
      },
      alert: () => {},
      getLastBlob: () => lastBlob,
      getLastWb: () => lastWb
    };

    const mockStudents = [
      { id: '1', name: 'សុខ ចាន់ណា', gender: 'ស្រី', avg: 7.5, total_score: 75, rank: 1, gradeLetter: 'B' },
      { id: '2', name: 'កែវ វិបុល', gender: 'ប្រុស', avg: 6.0, total_score: 60, rank: 2, gradeLetter: 'C' },
      { id: '3', name: 'ឡុង ធីតា', gender: 'ស្រី', avg: 4.5, total_score: 45, rank: 3, gradeLetter: 'E' },
      { id: '4', name: 'មាស សុខា', gender: 'ប្រុស', avg: 3.5, total_score: 35, rank: 4, gradeLetter: 'F' }
    ];

    context.window = context;
    context.window.allStudents = mockStudents;
    context.window.rankingsDataList = mockStudents;
    context.window.activeSchema = [
      { group: 'ភាសាខ្មែរ', key: 'khmer', subs: [{ name: 'តែងសេចក្តី', key: 'kh_writing' }] },
      { group: 'គណិតវិទ្យា', key: 'math', subs: [{ name: 'លេខនព្វន្ត', key: 'math_num' }] }
    ];
    context.window.schemaMaxMap = { kh_writing: 10, math_num: 10 };

    return context;
  }

  test('1. exportScoreEntryToExcel exports summary statistics table with total, female, male, pass, and fail breakdown', () => {
    const ctx = createScoreExportContext();
    const scoresCode = fs.readFileSync(path.join(__dirname, '../js/scores.js'), 'utf8');
    vm.createContext(ctx);
    vm.runInContext(scoresCode, ctx);

    // Set rankingsDataList after scores.js initializes it to empty array
    ctx.window.rankingsDataList = [
      { id: '1', name: 'សុខ ចាន់ណា', gender: 'ស្រី', avg: 7.5, total_score: 75, rank: 1, gradeLetter: 'B' },
      { id: '2', name: 'កែវ វិបុល', gender: 'ប្រុស', avg: 6.0, total_score: 60, rank: 2, gradeLetter: 'C' },
      { id: '3', name: 'ឡុង ធីតា', gender: 'ស្រី', avg: 4.5, total_score: 45, rank: 3, gradeLetter: 'E' },
      { id: '4', name: 'មាស សុខា', gender: 'ប្រុស', avg: 3.5, total_score: 35, rank: 4, gradeLetter: 'F' }
    ];

    assert.equal(typeof ctx.window.exportScoreEntryToExcel, 'function');
    ctx.window.exportScoreEntryToExcel();

    const blob = ctx.getLastBlob();
    assert.ok(blob, 'Blob was generated');
    const html = blob.content;

    // Check summary statistics presence
    assert.ok(html.includes('ស្ថិតិសង្ខេបលទ្ធផល'), 'Includes Khmer summary title');
    assert.ok(html.includes('សិស្សសរុប ៖') || html.includes('សិស្សសរុប'), 'Includes total students summary');
    assert.ok(html.includes('សិស្សជាប់មធ្យមភាគ'), 'Includes passed students summary');
    assert.ok(html.includes('សិស្សធ្លាក់មធ្យមភាគ'), 'Includes failed students summary');
    assert.ok(html.includes('4</b> នាក់') || html.includes('4 នាក់'), 'Shows 4 total students');
    assert.ok(html.includes('2</b> នាក់') || html.includes('2 នាក់'), 'Shows female count');
    assert.ok(html.includes('ភាគរយ'), 'Includes percentage indicators');
  });

  test('2. exportRankingsToExcel is defined and includes summary statistics', () => {
    const ctx = createScoreExportContext();
    const scoresCode = fs.readFileSync(path.join(__dirname, '../js/scores.js'), 'utf8');
    vm.createContext(ctx);
    vm.runInContext(scoresCode, ctx);

    // Set rankingsDataList after scores.js initializes it to empty array
    ctx.window.rankingsDataList = [
      { id: '1', name: 'សុខ ចាន់ណា', gender: 'ស្រី', avg: 7.5, total_score: 75, rank: 1, gradeLetter: 'B' },
      { id: '2', name: 'កែវ វិបុល', gender: 'ប្រុស', avg: 6.0, total_score: 60, rank: 2, gradeLetter: 'C' },
      { id: '3', name: 'ឡុង ធីតា', gender: 'ស្រី', avg: 4.5, total_score: 45, rank: 3, gradeLetter: 'E' },
      { id: '4', name: 'មាស សុខា', gender: 'ប្រុស', avg: 3.5, total_score: 35, rank: 4, gradeLetter: 'F' }
    ];

    assert.equal(typeof ctx.window.exportRankingsToExcel, 'function');
    ctx.window.exportRankingsToExcel();

    const blob = ctx.getLastBlob();
    assert.ok(blob, 'Blob was generated');
    const html = blob.content;
    assert.ok(html.includes('តារាងចំណាត់ថ្នាក់'), 'Includes rankings title');
    assert.ok(html.includes('ស្ថិតិសង្ខេបលទ្ធផល'), 'Includes summary statistics in rankings export');
    assert.ok(html.includes('សិស្សជាប់មធ្យមភាគ'), 'Includes pass statistics');
    assert.ok(html.includes('សិស្សធ្លាក់មធ្យមភាគ'), 'Includes fail statistics');
  });

  test('3. AdvancedReports.executeMultiSheetExport includes summary statistics in Score Sheet and Rankings Sheet', () => {
    const ctx = createScoreExportContext();
    const advCode = fs.readFileSync(path.join(__dirname, '../js/advanced-reports.js'), 'utf8');
    vm.createContext(ctx);
    vm.runInContext(advCode, ctx);

    assert.equal(typeof ctx.window.AdvancedReports.executeMultiSheetExport, 'function');
    ctx.window.AdvancedReports.executeMultiSheetExport('xlsx');

    const exportedWb = ctx.getLastWb();
    assert.ok(exportedWb, 'Workbook was exported');
    const scoreSheet = exportedWb.Sheets['២. តារាងស្រង់ពិន្ទុ'];
    assert.ok(scoreSheet, 'Score sheet exists');
    const flatScoreData = JSON.stringify(scoreSheet['!data']);
    assert.ok(flatScoreData.includes('ស្ថិតិសង្ខេបលទ្ធផល'), 'Score sheet contains summary statistics');
    assert.ok(flatScoreData.includes('សិស្សជាប់មធ្យមភាគ'), 'Score sheet contains pass statistics');
    assert.ok(flatScoreData.includes('សិស្សធ្លាក់មធ្យមភាគ'), 'Score sheet contains fail statistics');
  });
});
