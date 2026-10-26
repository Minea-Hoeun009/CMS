const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function createPrintTestContext() {
  const localStorageStore = {};
  const createdElements = [];
  const context = {
    window: {},
    console,
    setTimeout,
    clearTimeout,
    localStorage: {
      getItem: (key) => localStorageStore[key] || null,
      setItem: (key, val) => { localStorageStore[key] = String(val); },
      removeItem: (key) => { delete localStorageStore[key]; },
      clear: () => {}
    },
    document: {
      title: 'តេស្តប្រព័ន្ធបោះពុម្ព',
      getElementById: (id) => {
        if (id === 'testPrintTarget') {
          return {
            id: 'testPrintTarget',
            cloneNode: () => ({
              querySelectorAll: () => [],
              innerHTML: '<div class="print-sheet"><h1>របាយការណ៍សាលារៀន</h1></div>'
            }),
            querySelectorAll: () => []
          };
        }
        return null;
      },
      createElement: (tag) => {
        const el = {
          tagName: tag.toUpperCase(),
          id: '',
          style: {},
          contentWindow: {
            document: {
              written: '',
              open: () => {},
              write: (html) => { el.contentWindow.document.written += html; },
              close: () => {}
            },
            focus: () => {},
            print: () => { el.contentWindow.printed = true; }
          },
          remove: () => {}
        };
        createdElements.push(el);
        return el;
      },
      body: {
        appendChild: () => {}
      }
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {}
  };
  context.window = context;

  const configCode = fs.readFileSync(path.resolve(__dirname, '../js/config.js'), 'utf8');
  vm.runInNewContext(configCode, context);

  return { context, createdElements };
}

describe('CMS Universal Print Manager & Paper Config Tests', () => {

  const { context, createdElements } = createPrintTestContext();

  test('1. CMSPrintManager exists and exposes print, renderToolbarHtml, and executePrintWithToolbar', () => {
    assert.ok(context.window.CMSPrintManager, 'CMSPrintManager must be defined on window');
    assert.equal(typeof context.window.CMSPrintManager.print, 'function');
    assert.equal(typeof context.window.CMSPrintManager.renderToolbarHtml, 'function');
    assert.equal(typeof context.window.CMSPrintManager.executePrintWithToolbar, 'function');
  });

  test('2. renderToolbarHtml outputs paper size, orientation, and scale controls', () => {
    const html = context.window.CMSPrintManager.renderToolbarHtml('testTarget', 'landscape', 'A4', 100);
    assert.ok(html.includes('id="print_paper_testTarget"'), 'Must have paper size select');
    assert.ok(html.includes('id="print_orient_testTarget"'), 'Must have orientation select');
    assert.ok(html.includes('id="print_scale_testTarget"'), 'Must have scale select');
    assert.ok(html.includes('A4'), 'Contains A4 option');
    assert.ok(html.includes('A3'), 'Contains A3 option');
    assert.ok(html.includes('Letter'), 'Contains Letter option');
    assert.ok(html.includes('Legal'), 'Contains Legal option');
    assert.ok(html.includes('landscape'), 'Contains landscape option');
    assert.ok(html.includes('portrait'), 'Contains portrait option');
    assert.ok(html.includes('100%'), 'Contains 100% option');
    assert.ok(html.includes('80%'), 'Contains 80% option');
  });

  test('3. print function configures @page size, orientation, and zoom/scale correctly', () => {
    context.window.CMSPrintManager.print('testPrintTarget', {
      paperSize: 'A3',
      orientation: 'landscape',
      scale: 85,
      margin: '10mm',
      title: 'របាយការណ៍ ក ថ្នាក់ទី ៤'
    });

    const iframe = createdElements.find(el => el.id === 'cms_print_frame_helper');
    assert.ok(iframe, 'Print iframe must be created');
    
    const writtenHtml = iframe.contentWindow.document.written;
    assert.ok(writtenHtml.includes('size: A3 landscape;'), 'Must inject correct @page size and orientation');
    assert.ok(writtenHtml.includes('margin: 10mm;'), 'Must inject correct margin');
    assert.ok(writtenHtml.includes('zoom: 0.85;'), 'Must set zoom scale 0.85 for 85%');
    assert.ok(writtenHtml.includes('transform: scale(0.85);'), 'Must set transform scale for fallback');
    assert.ok(writtenHtml.includes('របាយការណ៍ ក ថ្នាក់ទី ៤'), 'Must set document title');
  });

  test('4. Portrait A4 with 100% scale outputs standard document format', () => {
    context.window.CMSPrintManager.print('testPrintTarget', {
      paperSize: 'A4',
      orientation: 'portrait',
      scale: 100
    });

    const iframe = createdElements[createdElements.length - 1];
    const writtenHtml = iframe.contentWindow.document.written;
    assert.ok(writtenHtml.includes('size: A4 portrait;'));
    assert.ok(writtenHtml.includes('zoom: 1;'));
  });

  test('5. Backward-compatibility wrapper window.printSpecificSheet invokes CMSPrintManager', () => {
    assert.equal(typeof context.window.printSpecificSheet, 'function');
    context.window.printSpecificSheet('testPrintTarget', 'landscape');
    const iframe = createdElements[createdElements.length - 1];
    assert.ok(iframe.contentWindow.document.written.includes('landscape'));
  });

  test('6. getStandardContext, getHeaderHtml, getTitleHtml, and getFooterHtml render standard document structure', () => {
    const ctx = context.window.CMSPrintManager.getStandardContext({
      districtName: 'ស្រុកកៀនស្វាយ',
      schoolName: 'សាលាបឋមសិក្សា វត្តថ្មី',
      grade: 'ថ្នាក់ទី ២ "ក"',
      principalName: 'នាយក សុខ',
      teacherName: 'ហឿន មិនា',
      academicYear: '២០២៦-២០២៧'
    });

    assert.equal(ctx.districtName, 'កៀនស្វាយ');
    assert.equal(ctx.schoolName, 'សាលាបឋមសិក្សា វត្តថ្មី');
    assert.equal(ctx.grade, 'ថ្នាក់ទី ២ "ក"');

    const header = context.window.CMSPrintManager.getHeaderHtml(ctx);
    assert.ok(header.includes('ការិយាល័យ អប់រំ យុវជននិងកីឡានៃរដ្ឋបាលស្រុក កៀនស្វាយ'));
    assert.ok(header.includes('ព្រះរាជាណាចក្រកម្ពុជា'));
    assert.ok(header.includes('ជាតិ សាសនា ព្រះមហាក្សត្រ'));
    assert.ok(header.includes('៚ ❖ ៚'));

    const title = context.window.CMSPrintManager.getTitleHtml('បញ្ជីស្រង់ពិន្ទុប្រចាំខែមករា', ctx.academicYear, ctx.grade);
    assert.ok(title.includes('បញ្ជីស្រង់ពិន្ទុប្រចាំខែមករា'));
    assert.ok(title.includes('ឆ្នាំសិក្សា ២០២៦-២០២៧'));

    const footer = context.window.CMSPrintManager.getFooterHtml(ctx);
    assert.ok(footer.includes('បានឃើញ និងឯកភាព'));
    assert.ok(footer.includes('នាយក/នាយិកាសាលា'));
    assert.ok(footer.includes('គ្រូបន្ទុកថ្នាក់'));
    assert.ok(footer.includes('ហឿន មិនា'));
  });

  test('7. openUniversalPreview generates interactive print toolbar and responsive paper wrapper', () => {
    let openedDoc = '';
    context.window.open = () => ({
      document: {
        open: () => {},
        write: (html) => { openedDoc += html; },
        close: () => {}
      }
    });

    context.window.CMSPrintManager.openUniversalPreview({
      title: 'បញ្ជីស្រង់ពិន្ទុប្រចាំខែមករា',
      grade: 'ថ្នាក់ទី ២ "ក"',
      contentHtml: '<table class="test-table"><tr><td>ពិន្ទុ</td></tr></table>',
      paperSize: 'A4',
      orientation: 'landscape',
      defaultZoom: 1.0
    });

    assert.ok(openedDoc.includes('class="no-print print-toolbar font-siemreap"'));
    assert.ok(openedDoc.includes('id="paperSize"'));
    assert.ok(openedDoc.includes('id="paperOrientation"'));
    assert.ok(openedDoc.includes('id="zoomLevel"'));
    assert.ok(openedDoc.includes('ព្រីនឥឡូវនេះ'));
    assert.ok(openedDoc.includes('id="print-wrapper"'));
    assert.ok(openedDoc.includes('id="content-scaler"'));
  });
});
