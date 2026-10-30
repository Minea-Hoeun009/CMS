const { test, describe, before, beforeEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

describe('MoEYS Sikha-karik Booklet & Centralized Reports Suite', () => {
    let context;

    before(() => {
        const configCode = fs.readFileSync(path.join(__dirname, '../js/config.js'), 'utf8');
        const scoresCode = fs.readFileSync(path.join(__dirname, '../js/scores.js'), 'utf8');
        const reportsCode = fs.readFileSync(path.join(__dirname, '../js/reports.js'), 'utf8');
        const trackingCode = fs.readFileSync(path.join(__dirname, '../js/tracking-book.js'), 'utf8');

        const mockLocalStorage = {
            store: {
                'school_settings': JSON.stringify({
                    school_name: 'សាលាបឋមសិក្សា អនុវត្ត',
                    academic_year: '២០២៦-២០២៧',
                    province: 'ភ្នំពេញ',
                    district: 'ដូនពេញ',
                    commune: 'ផ្សារថ្មី',
                    principal_name: 'ម៉ម សុវណ្ណ',
                    teacher_name: 'ហួន មិនា',
                    teacher_level: 'ថ្នាក់ទី ៤',
                    teacher_room: '«ក»'
                }),
                'academic_students': JSON.stringify([
                    {
                        id: 'STU-001',
                        student_id: 'STU-001',
                        name: 'សុខ ចាន់ដារ៉ា',
                        gender: 'ប្រុស',
                        dob: '១៥/០៥/២០១៤',
                        pob: 'ភ្នំពេញ',
                        father_name: 'សុខ គឹមហុង',
                        father_job: 'គ្រូបង្រៀន',
                        mother_name: 'អ៊ុំ ស្រីមុំ',
                        mother_job: 'មេផ្ទះ',
                        address: 'ផ្ទះលេខ ១២ សង្កាត់ផ្សារថ្មី ខណ្ឌដូនពេញ',
                        grade: 'ថ្នាក់ទី ៤',
                        room: '«ក»'
                    },
                    {
                        id: 'STU-002',
                        student_id: 'STU-002',
                        name: 'កែវ ធីតា',
                        gender: 'ស្រី',
                        dob: '២០/០៨/២០១៤',
                        pob: 'កណ្តាល',
                        grade: 'ថ្នាក់ទី ៤',
                        room: '«ក»'
                    }
                ]),
                'academic_scores': JSON.stringify([
                    { student_id: 'STU-001', name: 'សុខ ចាន់ដារ៉ា', subject: 'គណិតវិទ្យា', semester: '1', score: 9.5, rank: 1 },
                    { student_id: 'STU-001', name: 'សុខ ចាន់ដារ៉ា', subject: 'តែងសេចក្តី', semester: '1', score: 8.0, rank: 2 }
                ])
            },
            getItem(key) { return this.store[key] || null; },
            setItem(key, val) { this.store[key] = String(val); },
            removeItem(key) { delete this.store[key]; }
        };

        const mockElements = {};
        const getOrCreateElement = (id) => {
            if (!mockElements[id]) {
                mockElements[id] = {
                    id,
                    innerHTML: '',
                    value: '',
                    classList: {
                        add: () => {},
                        remove: () => {},
                        contains: () => false
                    },
                    setAttribute: () => {},
                    removeAttribute: () => {},
                    style: {}
                };
            }
            return mockElements[id];
        };

        const sandbox = {
            window: {},
            document: {
                getElementById: (id) => getOrCreateElement(id),
                createElement: (tag) => ({
                    tagName: tag.toUpperCase(),
                    style: {},
                    classList: { add: () => {}, remove: () => {} },
                    appendChild: () => {},
                    remove: () => {}
                }),
                body: { appendChild: () => {}, querySelectorAll: () => [] },
                title: 'CMS Test',
                addEventListener: () => {},
                removeEventListener: () => {}
            },
            localStorage: mockLocalStorage,
            sessionStorage: { getItem: () => null, setItem: () => {} },
            console: console,
            setTimeout: (fn) => fn(),
            clearTimeout: () => {},
            setInterval: () => 1,
            clearInterval: () => {},
            alert: () => {},
            confirm: () => true,
            addEventListener: () => {},
            removeEventListener: () => {}
        };
        sandbox.window = sandbox;

        context = vm.createContext(sandbox);
        vm.runInContext(configCode, context);
        vm.runInContext(scoresCode, context);
        vm.runInContext(reportsCode, context);
        vm.runInContext(trackingCode, context);
    });

    test('1. window.renderSikhaKarikBooklet is defined and renders full MoEYS standard booklet', () => {
        assert.strictEqual(typeof context.window.renderSikhaKarikBooklet, 'function');
        const container = { innerHTML: '' };
        context.window.renderSikhaKarikBooklet(container, 'ថ្នាក់ទី ៤', '«ក»', 'STU-001', 'all');

        const html = container.innerHTML;
        // Verify Kingdom header and Ministry
        assert.ok(html.includes('ព្រះរាជាណាចក្រកម្ពុជា'), 'Should contain Kingdom header');
        assert.ok(html.includes('ក្រសួងអប់រំ យុវជន និងកីឡា'), 'Should contain Ministry title');
        assert.ok(html.includes('សៀវភៅសិក្ខាគារិក'), 'Should contain booklet title');
        assert.ok(html.includes('សុខ ចាន់ដារ៉ា'), 'Should contain student name');
        assert.ok(html.includes('✿'), 'Should contain corner floral decorations');

        // Verify 7 Instructions
        assert.ok(html.includes('សេចក្តីណែនាំ'), 'Should contain instructions title');
        assert.ok(html.includes('ចាប់ពីថ្នាក់ទី៣ ឡើងទៅ'), 'Should contain directive 1');
        assert.ok(html.includes('មធ្យមភាគឆមាសទី១ + ( មធ្យមភាគឆមាសទី ២ × ២ )'), 'Should contain semester average formula');

        // Verify Student Profile & Academic History
        assert.ok(html.includes('រូបថត'), 'Should contain photo box');
        assert.ok(html.includes('៤ × ៦'), 'Should contain 4x6 dimensions');
        assert.ok(html.includes('ឆ្នាំសិក្សា'), 'Should contain academic history header');
        assert.ok(html.includes('គ្រឹះស្ថានសិក្សា'), 'Should contain school institution header');

        // Verify Official 12 Subjects in Results table
        const officialSubjects = [
            'សុជីវធម៌ និងពលរដ្ឋវិជ្ជា',
            'រៀនអាន និងមេសូត្រ',
            'គណិតវិទ្យា',
            'អក្សរផ្ចង់',
            'គំនូរ និង ហត្ថកម្ម',
            'សរសេរតាមអាន និងសំណួរ',
            'តែងសេចក្តី',
            'វិទ្យាសាស្ត្រអនុវត្ត',
            'ភូមិវិទ្យា',
            'ប្រវត្តិវិទ្យា',
            'អប់រំកាយ និងកីឡា',
            'ភាសាបរទេស'
        ];
        officialSubjects.forEach(sub => {
            assert.ok(html.includes(sub), `Should contain official subject: ${sub}`);
        });

        // Verify Absences, Evaluations, Outcome, and Signatures
        assert.ok(html.includes('ខ- ចំនួនពេលអវត្តមាន'), 'Should contain absences section');
        assert.ok(html.includes('គ- វាយតម្លៃសិស្សលើការសិក្សា'), 'Should contain evaluation section');
        assert.ok(html.includes('ឃ- លទ្ធផលប្រចាំឆ្នាំ'), 'Should contain annual outcome section');
        assert.ok(html.includes('ត្រូវបានឡើងថ្នាក់ទី'), 'Should contain grade promotion text');
        assert.ok(html.includes('ង- ការសរសើរ និងកែលម្អ'), 'Should contain praise & improvement section');
        assert.ok(html.includes('ច- មូលវិចាររបស់នាយកសាលា'), 'Should contain principal remarks section');
        assert.ok(html.includes('គ្រូបន្ទុកថ្នាក់'), 'Should contain homeroom teacher signature');
        assert.ok(html.includes('នាយកសាលា'), 'Should contain principal signature');
    });

    test('2. Page mode filtering allows rendering specific page spreads', () => {
        const container = { innerHTML: '' };
        
        // Cover only
        context.window.renderSikhaKarikBooklet(container, 'ថ្នាក់ទី ៤', '«ក»', 'STU-001', 'cover');
        assert.ok(container.innerHTML.includes('ក្រសួងអប់រំ យុវជន និងកីឡា'));
        assert.ok(!container.innerHTML.includes('ក- លទ្ធផលនៃការប្រឡងឆមាស'));

        // Scores only
        context.window.renderSikhaKarikBooklet(container, 'ថ្នាក់ទី ៤', '«ក»', 'STU-001', 'scores_eval');
        assert.ok(container.innerHTML.includes('ក- លទ្ធផលនៃការប្រឡងឆមាស'));
        assert.ok(!container.innerHTML.includes('នាយកសាលាត្រូវចេញ និងគ្រប់គ្រងសៀវភៅសិក្ខាគារិក'));
    });

    test('3. Reports View includes cards for Sikha-karik, unified Tracking Book, and Honor Board', () => {
        const reportsContainer = context.document.getElementById('reportsContainer');
        context.window.loadReportsView();
        const html = reportsContainer.innerHTML;

        assert.ok(html.includes('sikhakarik'), 'Reports view should contain Sikha-karik card');
        assert.ok(html.includes('openTrackingBookModal') || html.includes('loadTrackingBookView'), 'Reports view should contain unified Tracking Book trigger');
        assert.ok(html.includes('report_kha') || html.includes('openHonorBoardModal'), 'Reports view should contain Honor Board trigger');
        // Verified: redundant separate reportcards card was merged into tracking book as requested
        assert.ok(!html.includes('openReportCardsModal'), 'Redundant separate report cards card should not be present in reports view');
        assert.ok(html.includes('btnSyncReportsGAS') && html.includes('រក្សាទុកក្នុង Sheets'), 'Main reports dashboard should contain the single outer Save to Sheets button');
    });

    test('4. window.openHonorBoardModal and window.openReportCardsModal exist globally', () => {
        assert.strictEqual(typeof context.window.openHonorBoardModal, 'function');
        assert.strictEqual(typeof context.window.openReportCardsModal, 'function');
        assert.strictEqual(typeof context.window.openTrackingBookModal, 'function');
    });

    test('5. Tracking Book renders fully populated demographics, place of birth, parents, absences, paper adjustment controls, and Khmer font styles', () => {
        assert.strictEqual(typeof context.window.openTrackingBookModal, 'function');
        assert.strictEqual(typeof context.window.renderTrackingBookPreview, 'function');
        assert.strictEqual(typeof context.window.applyTbPaperSettings, 'function');

        context.window.openTrackingBookModal();
        const modal = context.document.getElementById('trackingBookModal');
        assert.ok(modal, 'trackingBookModal should exist in DOM');

        const studentSelect = context.document.getElementById('tbStudentSelect');
        studentSelect.value = 'STU-001';
        studentSelect.options = [{ text: 'សុខ ចាន់ដារ៉ា (ប្រុស)', value: 'STU-001' }];
        studentSelect.selectedIndex = 0;

        const periodSelect = context.document.getElementById('tbPeriodSelect');
        if (periodSelect) periodSelect.value = 'ខែ មករា';

        const previewContainer = context.document.getElementById('tbPreviewContainer');
        context.window.renderTrackingBookPreview();

        const previewHtml = previewContainer.innerHTML;

        // 1. Demographics & Place of Birth
        assert.ok(previewHtml.includes('សុខ ចាន់ដារ៉ា'), 'Should contain student name');
        assert.ok(previewHtml.includes('សុខ គឹមហុង'), 'Should contain father name');
        assert.ok(previewHtml.includes('អ៊ុំ ស្រីមុំ'), 'Should contain mother name');
        assert.ok(previewHtml.includes('សៀវភៅតាមដានការសិក្សា'), 'Should contain Tracking Book title');
        assert.ok(previewHtml.includes('ភ្នំពេញ'), 'Should contain place of birth info');
        assert.ok(previewHtml.includes('ផ្សារថ្មី'), 'Should contain address commune info');
        assert.ok(previewHtml.includes('ដូនពេញ'), 'Should contain address district info');

        // 2. Results & Absences & Signatures
        assert.ok(previewHtml.includes('អវត្តមានមានច្បាប់'), 'Should contain excused absence field');
        assert.ok(previewHtml.includes('អត់ច្បាប់'), 'Should contain unexcused absence field');
        assert.ok(previewHtml.includes('បានឃើញ និងឯកភាព'), 'Should contain principal endorsement');
        assert.ok(previewHtml.includes('គ្រូបន្ទុកថ្នាក់'), 'Should contain teacher signature label');
        assert.ok(previewHtml.includes('មតិមាតាបិតា'), 'Should contain parent feedback section');

        // 3. Paper adjustment & fonts
        const paperSelect = context.document.getElementById('tbPaperSize');
        const orientSelect = context.document.getElementById('tbOrientation');
        assert.ok(paperSelect, 'Paper size selector should exist');
        assert.ok(orientSelect, 'Orientation selector should exist');

        assert.ok(previewHtml.includes('font-moul'), 'Should preserve Moul font styling');
        assert.ok(previewHtml.includes('font-siemreap'), 'Should preserve Siemreap font styling');
    });

    test('6. Academic Results report supports 3 distinct modes: monthly, semester, and annual', () => {
        assert.strictEqual(typeof context.window.renderAcademicResultsReport, 'function');
        assert.strictEqual(typeof context.window.renderAcademicReportControls, 'function');

        const controlsContainer = { innerHTML: '' };
        context.window.renderAcademicReportControls(controlsContainer, 'ថ្នាក់ទី ៤', '«ក»');
        assert.ok(controlsContainer.innerHTML.includes('ប្រចាំខែ'), 'Controls should include Monthly mode button');
        assert.ok(controlsContainer.innerHTML.includes('ប្រចាំឆមាស'), 'Controls should include Semester mode button');
        assert.ok(controlsContainer.innerHTML.includes('ប្រចាំឆ្នាំ'), 'Controls should include Annual mode button');

        const paperArea = { innerHTML: '' };

        // Test Monthly Mode
        context.window.currentAcademicReportMonth = 'មករា';
        context.window.renderAcademicResultsReport(paperArea, 'ថ្នាក់ទី ៤', '«ក»', 'monthly');
        const monthlyHtml = paperArea.innerHTML;
        assert.ok(monthlyHtml.includes('របាយការណ៍លទ្ធផលនៃការសិក្សាប្រចាំខែ មករា'), 'Should render monthly title');
        assert.ok(monthlyHtml.includes('ពិន្ទុសរុប'), 'Should contain total score column');
        assert.ok(monthlyHtml.includes('មធ្យមភាគ'), 'Should contain average column');
        assert.ok(monthlyHtml.includes('សិស្សសរុបក្នុងថ្នាក់'), 'Should contain summary stats box');

        // Test Semester Mode
        context.window.currentAcademicReportSemester = 'ឆមាសទី១';
        context.window.renderAcademicResultsReport(paperArea, 'ថ្នាក់ទី ៤', '«ក»', 'semester');
        const semesterHtml = paperArea.innerHTML;
        assert.ok(semesterHtml.includes('របាយការណ៍លទ្ធផលនៃការសិក្សាប្រចាំ ឆមាសទី1') || semesterHtml.includes('របាយការណ៍លទ្ធផលនៃការសិក្សាប្រចាំ ឆមាសទី១'), 'Should render semester title');
        assert.ok(semesterHtml.includes('មធ្យមភាគប្រឡង') || semesterHtml.includes('ម.ប្រឡង') || semesterHtml.includes('មធ្យមភាគឆមាស') || semesterHtml.includes('ម.ប្រចាំឆមាស'), 'Should contain semester exam / avg columns');

        // Test Annual Mode
        context.window.renderAcademicResultsReport(paperArea, 'ថ្នាក់ទី ៤', '«ក»', 'annual');
        const annualHtml = paperArea.innerHTML;
        assert.ok(annualHtml.includes('សេចក្តីសម្រេចលទ្ធផលសិក្សាប្រចាំឆ្នាំ'), 'Should render annual decision title');
        assert.ok(annualHtml.includes('ឡើងថ្នាក់') || annualHtml.includes('ត្រួតថ្នាក់'), 'Should contain promotion outcome');
        assert.ok(annualHtml.includes('សិស្សឡើងថ្នាក់'), 'Should contain promoted students stats');
    });

    test('7. Semester month configuration is dynamically loaded from Score List settings', () => {
        assert.strictEqual(typeof context.window.getSemesterMonthConfig, 'function');

        // Configure custom months in localStorage for class
        const customConfig = {
            sem1: ["វិច្ឆិកា", "ធ្នូ", "មករា"],
            sem2: ["កុម្ភៈ", "មីនា", "មេសា", "ឧសភា"]
        };
        context.localStorage.setItem('semester_month_config_ថ្នាក់ទី ៤ «ក»', JSON.stringify(customConfig));

        const cfg = context.window.getSemesterMonthConfig('ថ្នាក់ទី ៤', '«ក»');
        assert.deepStrictEqual([...cfg.sem1], ["វិច្ឆិកា", "ធ្នូ", "មករា"]);
        assert.deepStrictEqual([...cfg.sem2], ["កុម្ភៈ", "មីនា", "មេសា", "ឧសភា"]);

        // Verify subcontrols display clean ឆមាសទី១ and ឆមាសទី២ without months in selector
        const controlsContainer = { innerHTML: '' };
        context.window.currentAcademicReportMode = 'semester';
        context.window.renderAcademicReportControls(controlsContainer, 'ថ្នាក់ទី ៤', '«ក»');
        assert.ok(controlsContainer.innerHTML.includes('ឆមាសទី១'), 'Controls should display ឆមាសទី១');
        assert.ok(controlsContainer.innerHTML.includes('ឆមាសទី២'), 'Controls should display ឆមាសទី២');
        assert.ok(!controlsContainer.innerHTML.includes('វិច្ឆិកា, ធ្នូ'), 'Controls should not show month list in semester selector');

        // Verify title displays clean semester title without month string
        const paperArea = { innerHTML: '' };
        context.window.currentAcademicReportSemester = 'ឆមាសទី១';
        context.window.renderAcademicResultsReport(paperArea, 'ថ្នាក់ទី ៤', '«ក»', 'semester');
        const sem1Html = paperArea.innerHTML;
        assert.ok(sem1Html.includes('របាយការណ៍លទ្ធផលនៃការសិក្សាប្រចាំ ឆមាសទី១'), 'Table should contain clean title ឆមាសទី១');
        assert.ok(!sem1Html.includes('ខែគិតក្នុងឆមាស'), 'Title should not contain month string');

        // Switch to sem2
        context.window.currentAcademicReportSemester = 'ឆមាសទី២';
        context.window.renderAcademicResultsReport(paperArea, 'ថ្នាក់ទី ៤', '«ក»', 'semester');
        const sem2Html = paperArea.innerHTML;
        assert.ok(sem2Html.includes('របាយការណ៍លទ្ធផលនៃការសិក្សាប្រចាំ ឆមាសទី២'), 'Table should contain clean title ឆមាសទី២');
        assert.ok(!sem2Html.includes('ខែគិតក្នុងឆមាស'), 'Title should not contain month string');
    });

    test('8. Academic Results report sorts students by rank (Sort for rank) by default', () => {
        assert.strictEqual(typeof context.window.switchAcademicReportSort, 'function');
        assert.strictEqual(context.window.currentAcademicReportSort, 'rank');

        // Setup test students with scores in academic_scores
        context.window.allStudents = [
            { id: 'STU-B', name: 'កែវ ធីតា', gender: 'ស្រី', grade: 'ថ្នាក់ទី ៤', room: '«ក»' },
            { id: 'STU-A', name: 'ចាន់ ឧត្តម', gender: 'ប្រុស', grade: 'ថ្នាក់ទី ៤', room: '«ក»' },
            { id: 'STU-C', name: 'ស៊ន វិបុល', gender: 'ប្រុស', grade: 'ថ្នាក់ទី ៤', room: '«ក»' }
        ];

        // Give STU-A top rank/score, STU-B 2nd, STU-C 3rd
        const testScores = [
            { student_id: 'STU-A', month: 'មករា', average: '9.20', totalScore: '920', rank: 1, grade: 'ថ្នាក់ទី ៤ «ក»' },
            { student_id: 'STU-B', month: 'មករា', average: '8.40', totalScore: '840', rank: 2, grade: 'ថ្នាក់ទី ៤ «ក»' },
            { student_id: 'STU-C', month: 'មករា', average: '6.50', totalScore: '650', rank: 3, grade: 'ថ្នាក់ទី ៤ «ក»' }
        ];
        context.localStorage.setItem('academic_scores', JSON.stringify(testScores));

        const paperArea = { innerHTML: '' };
        context.window.currentAcademicReportMonth = 'មករា';
        context.window.currentAcademicReportSort = 'rank';
        context.window.renderAcademicResultsReport(paperArea, 'ថ្នាក់ទី ៤', '«ក»', 'monthly');

        const html = paperArea.innerHTML;
        // Verify STU-A (Rank 1: ចាន់ ឧត្តម) appears before STU-B (Rank 2: កែវ ធីតា) in HTML output
        const idxA = html.indexOf('ចាន់ ឧត្តម');
        const idxB = html.indexOf('កែវ ធីតា');
        const idxC = html.indexOf('ស៊ន វិបុល');

        assert.ok(idxA !== -1 && idxB !== -1 && idxC !== -1, 'All students should be in table');
        assert.ok(idxA < idxB, 'Rank 1 student (ចាន់ ឧត្តម) should appear before Rank 2 (កែវ ធីតា)');
        assert.ok(idxB < idxC, 'Rank 2 student (កែវ ធីតា) should appear before Rank 3 (ស៊ន វិបុល)');

        // Now switch sort to 'name' and verify alphabetical order (ក < ច < ស)
        context.window.currentAcademicReportSort = 'name';
        context.window.renderAcademicResultsReport(paperArea, 'ថ្នាក់ទី ៤', '«ក»', 'monthly');
        const htmlByName = paperArea.innerHTML;
        const nameIdxB = htmlByName.indexOf('កែវ ធីតា');
        const nameIdxA = htmlByName.indexOf('ចាន់ ឧត្តម');
        const nameIdxC = htmlByName.indexOf('ស៊ន វិបុល');

        assert.ok(nameIdxB < nameIdxA, 'In name sort, កែវ ធីតា should precede ចាន់ ឧត្តម');
        assert.ok(nameIdxA < nameIdxC, 'In name sort, ចាន់ ឧត្តម should precede ស៊ន វិបុល');
    });

    test('9. Academic Results report displays all numbers using Universal numerals (លេខសកល: 0-9)', () => {
        assert.strictEqual(typeof context.window.toUniversalNum, 'function');
        assert.strictEqual(context.window.toUniversalNum('២០២៦-២០២៧'), '2026-2027');
        assert.strictEqual(context.window.toUniversalNum('ចំណាត់ថ្នាក់លេខ ១'), 'ចំណាត់ថ្នាក់លេខ 1');

        const paperArea = { innerHTML: '' };
        context.window.currentAcademicReportMonth = 'មករា';
        context.window.currentAcademicReportSort = 'rank';
        context.window.renderAcademicResultsReport(paperArea, 'ថ្នាក់ទី ៤', '«ក»', 'monthly');

        const html = paperArea.innerHTML;
        // Verify stats section uses plain dashes and universal numbers (5.00)
        assert.ok(html.includes('- <span class="font-bold">សិស្សសរុបក្នុងថ្នាក់៖</span>') || html.includes('សិស្សសរុបក្នុងថ្នាក់៖'), 'Stats should display total students with dash');
        assert.ok(html.includes('សិស្សជាប់មធ្យមភាគ (≥ 5.00)៖'), 'Stats should use 5.00 in universal numbers');
        assert.ok(html.includes('សិស្សធ្លាក់មធ្យមភាគ (< 5.00)៖'), 'Stats should use 5.00 in universal numbers');
        assert.ok(!html.includes('border-slate-300 rounded-xl'), 'Stats section should not have outer container box');

        // Verify ranks are rendered as universal digits (e.g. 1, 2, 3)
        assert.ok(html.includes('>1<') || html.includes('1</td>'), 'Rank should be rendered as universal numeral 1');
    });

    test('10. Academic Results report provides paper sizing, zoom controls, streamlined semester table, and Khmer date numerals', () => {
        // 1. Verify paper settings object and functions exist
        assert.ok(context.window.academicReportPaperSettings, 'academicReportPaperSettings should exist');
        assert.strictEqual(typeof context.window.setAcademicReportPaperSize, 'function');
        assert.strictEqual(typeof context.window.setAcademicReportOrientation, 'function');
        assert.strictEqual(typeof context.window.changeAcademicReportScale, 'function');
        assert.strictEqual(typeof context.window.setAcademicReportScale, 'function');
        assert.strictEqual(typeof context.window.printAcademicReportCleanly, 'function');

        // Test changing paper size, orientation, and scale
        context.window.setAcademicReportPaperSize('A3');
        assert.strictEqual(context.window.academicReportPaperSettings.paperSize, 'A3');

        context.window.setAcademicReportOrientation('portrait');
        assert.strictEqual(context.window.academicReportPaperSettings.orientation, 'portrait');

        context.window.setAcademicReportScale(110);
        assert.strictEqual(context.window.academicReportPaperSettings.scale, 110);

        context.window.changeAcademicReportScale(-10);
        assert.strictEqual(context.window.academicReportPaperSettings.scale, 100);

        // 2. Verify extra controls does NOT duplicate paper controls (only 1 toolbar in print config bar)
        const controlsContainer = { innerHTML: '' };
        context.window.renderAcademicReportControls(controlsContainer, 'ថ្នាក់ទី ៤', '«ក»');
        const cHtml = controlsContainer.innerHTML;
        assert.ok(!cHtml.includes('acadReportPaperSizeSelect'), 'Controls should not duplicate paper settings because dedicated CMS toolbar exists');
        assert.ok(!cHtml.includes('acadReportOrientationSelect'), 'Controls should not duplicate orientation select');

        // 3. Verify Semester Mode table has single "មធ្យមភាគខែ" column instead of separate monthly columns
        const paperArea = { innerHTML: '', style: {} };
        context.window.currentAcademicReportSemester = 'ឆមាសទី១';
        context.window.renderAcademicResultsReport(paperArea, 'ថ្នាក់ទី ៤', '«ក»', 'semester');
        const semHtml = paperArea.innerHTML;

        assert.ok(semHtml.includes('មធ្យមភាគខែ'), 'Table header should contain streamlined មធ្យមភាគខែ');
        assert.ok(semHtml.includes('មធ្យមភាគប្រឡង'), 'Table header should contain មធ្យមភាគប្រឡង');
        assert.ok(semHtml.includes('មធ្យមភាគឆមាស'), 'Table header should contain មធ្យមភាគឆមាស');
        // Ensure the table thead does NOT contain separate month headers
        assert.ok(!semHtml.includes('<th class="border border-slate-400 p-2 w-14">ខែ'), 'Table thead should not have separate monthly columns');

        // 4. Verify dates use Khmer numerals as requested
        assert.ok(semHtml.includes('២០២៦') || semHtml.includes('២៥៧០') || semHtml.includes('ធ្វើនៅ'), 'Date should be formatted with Khmer numerals');
    });

    test('11. Academic Results report excludes absence column and styles table headers with Khmer OS Muol Light', () => {
        const paperArea = { innerHTML: '', style: {} };

        // 1. Monthly Mode
        context.window.currentAcademicReportMonth = 'មករា';
        context.window.renderAcademicResultsReport(paperArea, 'ថ្នាក់ទី ៤', '«ក»', 'monthly');
        const mHtml = paperArea.innerHTML;

        // Ensure "អវត្តមាន" column is NOT present in table header or student row
        assert.ok(!mHtml.includes('<th class="border border-slate-400 p-2 w-28">អវត្តមាន</th>'), 'Monthly table should not have absence column header');
        assert.ok(!mHtml.includes('ច:') && !mHtml.includes('ឥត:'), 'Monthly table student rows should not have absence counters');

        // Verify thead font-family uses Khmer OS Muol Light / font-moul
        assert.ok(mHtml.includes('Khmer OS Muol Light'), 'Monthly table thead should have Khmer OS Muol Light font');
        assert.ok(mHtml.includes('font-moul'), 'Monthly table thead should have font-moul class');

        // 2. Semester Mode
        context.window.currentAcademicReportSemester = 'ឆមាសទី១';
        context.window.renderAcademicResultsReport(paperArea, 'ថ្នាក់ទី ៤', '«ក»', 'semester');
        const sHtml = paperArea.innerHTML;
        assert.ok(!sHtml.includes('>អវត្តមាន<'), 'Semester table should not contain absence column');
        assert.ok(sHtml.includes('Khmer OS Muol Light'), 'Semester table thead should have Khmer OS Muol Light font');
        assert.ok(sHtml.includes('font-moul'), 'Semester table thead should have font-moul class');

        // 3. Annual Mode
        context.window.renderAcademicResultsReport(paperArea, 'ថ្នាក់ទី ៤', '«ក»', 'annual');
        const aHtml = paperArea.innerHTML;
        assert.ok(!aHtml.includes('>អវត្តមាន<'), 'Annual table should not contain absence column');
        assert.ok(aHtml.includes('Khmer OS Muol Light'), 'Annual table thead should have Khmer OS Muol Light font');
        assert.ok(aHtml.includes('font-moul'), 'Annual table thead should have font-moul class');

        // 4. Verify individual section does not duplicate Save to Sheet
        const detailContainer = context.document.getElementById('reportDetailContent');
        if (detailContainer) {
            assert.ok(!detailContainer.innerHTML.includes('saveCurrentReportToGoogleSheets'), 'Individual report detail toolbar should not contain redundant save to sheets button');
        }
    });

    test('12. All report sections display in a unified Pop-up Modal matching Honor Board styling', () => {
        const reportsContainer = context.document.getElementById('reportsContainer');
        context.window.loadReportsView();
        const html = reportsContainer.innerHTML;

        assert.ok(html.includes('id="reportDetailContent"'), 'reportDetailContent pop-up modal should exist in HTML');
        assert.ok(html.includes('fixed inset-0') && html.includes('z-[2000]'), 'Modal should have fixed inset-0 full screen positioning and high z-index overlay');
        assert.ok(html.includes('id="reportDetailModalContainer"'), 'reportDetailModalContainer should exist in HTML');
        assert.ok(html.includes('rounded-2xl md:rounded-[2.5rem]'), 'Modal container should have large rounded corners');
        assert.ok(html.includes('shadow-2xl'), 'Modal container should have shadow-2xl');

        // Test opening and closing report detail modal functions
        assert.strictEqual(typeof context.window.openReportDetail, 'function');
        assert.strictEqual(typeof context.window.closeReportDetail, 'function');

        context.window.openReportDetail('report_ko_kho');
        const modal = context.document.getElementById('reportDetailContent');
        assert.ok(modal, 'Modal element should exist');

        context.window.closeReportDetail();
    });

    test('13. Absence report calculates and displays bottom summary statistics and total absence row', () => {
        const typeSelect = context.document.getElementById('attReportType');
        typeSelect.value = 'monthly';

        const valSelect = context.document.getElementById('attReportValue');
        valSelect.value = 'តុលា';

        // Render attendance content
        context.window.renderAttendanceContent();
        const html = context.document.getElementById('attendancePrintWrapper').innerHTML;

        assert.ok(html.includes('សរុបអវត្តមាន'), 'Must contain total absence row in table');
        assert.ok(html.includes('បញ្ឈប់បញ្ជី'), 'Must contain list end note');
        assert.ok(html.includes('ពេលសិស្សត្រូវមករៀនសរុប'), 'Must contain total sessions required calculation');
        assert.ok(html.includes('ពេលអវត្តមានសរុប'), 'Must contain total absent sessions calculation');
        assert.ok(html.includes('ពេលដែលសិស្សមករៀនពិតប្រាកដ'), 'Must contain actual attended sessions calculation');
        assert.ok(html.includes('ភាគរយអវត្តមាន'), 'Must contain absence percentage calculation');
    });

    test('14. Sikhakarik booklet populates Semester 1 and Semester 2 exam scores and summary rows', () => {
        context.window.allStudents = [
            {
                id: 'STU-001',
                student_id: 'STU-001',
                name: 'សុខ ចាន់ដារ៉ា',
                gender: 'ប្រុស',
                dob: '១៥/០៥/២០១៤',
                pob: 'ភ្នំពេញ',
                grade: 'ថ្នាក់ទី ៤',
                room: '«ក»'
            }
        ];

        const sampleScores = [
            {
                student_id: 'STU-001',
                name: 'សុខ ចាន់ដារ៉ា',
                grade: 'ថ្នាក់ទី ៤ «ក»',
                period_type: 'semester',
                month: 'ឆមាសទី១',
                math: 9.5,
                k_write: 8.5,
                total_exam: 18.0,
                avg_exam: 9.0,
                monthly_avg: 8.5,
                average: 8.75,
                rank: 1,
                grade_letter: 'ល្អណាស់'
            },
            {
                student_id: 'STU-001',
                name: 'សុខ ចាន់ដារ៉ា',
                grade: 'ថ្នាក់ទី ៤ «ក»',
                period_type: 'semester',
                month: 'ឆមាសទី២',
                math: 9.0,
                k_write: 9.0,
                total_exam: 18.0,
                avg_exam: 9.0,
                monthly_avg: 9.0,
                average: 9.0,
                rank: 1,
                grade_letter: 'ល្អណាស់'
            }
        ];
        context.localStorage.setItem('academic_scores', JSON.stringify(sampleScores));

        const container = { innerHTML: '' };
        context.window.renderSikhaKarikBooklet(container, 'ថ្នាក់ទី ៤', '«ក»', 'STU-001', 'scores_eval');
        const html = container.innerHTML;

        assert.ok(html.includes('៩.៥') || html.includes('9.5'), 'Should display semester 1 math score');
        assert.ok(html.includes('៨.៧៥') || html.includes('8.75'), 'Should display semester 1 overall average');
        assert.ok(html.includes('៩') || html.includes('9'), 'Should display semester 2 score/average');
        assert.ok(html.includes('សរុបពិន្ទុ'), 'Should display total score row');
        assert.ok(html.includes('មធ្យមភាគប្រចាំឆមាស'), 'Should display semester average row');
        assert.ok(html.includes('លទ្ធផលដំណាច់ឆ្នាំ'), 'Should display annual result row');
    });

    test('15. Upgraded Tracking Book matches user model: modern cover, 9 rules, demographics, 16 subjects, and instructions', () => {
        context.window.allStudents = [
            {
                id: 'STU-001',
                student_id: 'STU-001',
                name: 'សុខ ចាន់ដារ៉ា',
                gender: 'ប្រុស',
                dob: '១៥/០៥/២០១៤',
                pob: 'ភ្នំពេញ',
                father_name: 'សុខ គឹមហុង',
                father_job: 'គ្រូបង្រៀន',
                mother_name: 'អ៊ុំ ស្រីមុំ',
                mother_job: 'មេផ្ទះ',
                grade: 'ថ្នាក់ទី ៤',
                room: '«ក»'
            }
        ];

        context.window.openTrackingBookModal();
        const studentSelect = context.document.getElementById('tbStudentSelect');
        studentSelect.value = 'STU-001';

        const periodSelect = context.document.getElementById('tbPeriodSelect');
        periodSelect.value = 'ខែ មករា';

        const pageSelect = context.document.getElementById('tbPageSelect');
        pageSelect.value = 'all';

        context.window.renderTrackingBookPreview();
        const html = context.document.getElementById('tbPreviewContainer').innerHTML;

        // 1. Modern Front Cover Elements
        assert.ok(html.includes('សៀវភៅតាមដានការសិក្សា'), 'Cover must contain booklet title');
        assert.ok(html.includes('រូបថត') && html.includes('៤ × ៦'), 'Cover must contain modern photo frame');
        assert.ok(html.includes('សុខ ចាន់ដារ៉ា'), 'Cover must contain student name');
        assert.ok(html.includes('ថ្នាក់ទី ៤ «ក»'), 'Cover must contain grade and room');
        assert.ok(html.includes('ទូរសព្ទសាលា'), 'Cover must contain school phone');

        // 2. 9 Internal Rules
        assert.ok(html.includes('ចំណុចសំខាន់ៗនៃបទបញ្ជាផ្ទៃក្នុង'), 'Must contain internal rules header');
        assert.ok(html.includes('សិស្សត្រូវអនុវត្តតាមអង្គការវិន័យ'), 'Must contain rule 1');
        assert.ok(html.includes('សិស្សត្រូវស្អាតជានិច្ច'), 'Must contain rule 2');
        assert.ok(html.includes('ហាមផ្ដាច់មិនឱ្យកោសលប់ ឬសរសេរបន្ថែម'), 'Must contain rule 9');
        assert.ok(html.includes('មតិមាតាបិតាសិស្ស'), 'Must contain parent feedback area');

        // 3. 16 Official Subjects in Table
        const expectedSubjects = [
            'រៀនអាន', 'តែងសេចក្ដី', 'សរសេរតាមអាន', 'មេសូត្រ', 'អក្សរផ្ចង់',
            'គណិតវិទ្យា', 'វិទ្យាសាស្ត្រអនុវត្ត', 'ប្រវត្តិវិទ្យា', 'ភូមិវិទ្យា',
            'សិលធម៌-ពលរដ្ឋវិទ្យា', 'គំនូរ', 'អង់គ្លេស-បារាំង', 'ហត្ថកម្ម',
            'អប់រំកាយ-កីឡា', 'សីលធម៌រស់នៅ', 'សុខភាព-អនាម័យ'
        ];
        expectedSubjects.forEach(sub => {
            assert.ok(html.includes(sub), `Table must include subject: ${sub}`);
        });

        // 4. Mention Thresholds and Columns
        assert.ok(html.includes('ល្អ'), 'Table must contain Good mention');
        assert.ok(html.includes('ល្អបង្គួរ'), 'Table must contain Very Good mention');
        assert.ok(html.includes('មធ្យម'), 'Table must contain Medium mention');
        assert.ok(html.includes('ខ្សោយ'), 'Table must contain Weak mention');
        assert.ok(html.includes('ចំណុចដែលត្រូវជួយ'), 'Table must contain reinforcement points');

        // 5. Official Instructions
        assert.ok(html.includes('សេចក្ដីណែនាំ'), 'Must contain official instructions');
        assert.ok(html.includes('ខ្ទង់និទ្ទេសៈ'), 'Must contain mention instruction');
        assert.ok(html.includes('ខ្ទង់ចំណុចដែលត្រូវពង្រឹងបន្ថែមៈ'), 'Must contain reinforcement instruction');
    });

    test('16. Five New Classroom Administration Reports (Inventory, Internal Rules, Class Principles, Cleaning Schedule, Branch Committee)', () => {
        const dummyContainer = { innerHTML: '' };

        // Test 1: បញ្ជីសារពើភ័ណ្ឌ (Inventory List)
        assert.strictEqual(typeof context.window.renderClassInventoryReport, 'function', 'renderClassInventoryReport must be globally exported');
        context.window.renderClassInventoryReport(dummyContainer, 'ថ្នាក់ទី ៤', '«ក»');
        const invHtml = dummyContainer.innerHTML;
        assert.ok(invHtml.includes('បញ្ជីសារពើភ័ណ្ឌសម្ភារក្នុងថ្នាក់រៀន'), 'Inventory must contain title');
        assert.ok(invHtml.includes('តុគ្រូ'), 'Inventory must contain តុគ្រូ');
        assert.ok(invHtml.includes('តុសិស្ស'), 'Inventory must contain តុសិស្ស');
        assert.ok(invHtml.includes('ក្ដារខៀន'), 'Inventory must contain ក្ដារខៀន');
        assert.ok(invHtml.includes('នាឡិកាជញ្ជាំង'), 'Inventory must contain នាឡិកាជញ្ជាំង');
        assert.ok(invHtml.includes('គោលការណ៍ថ្នាក់រៀន'), 'Inventory must contain គោលការណ៍ថ្នាក់រៀន');
        assert.ok(invHtml.includes('សរុបរួមទាំងពីរផ្នែក'), 'Inventory must contain grand total row');
        assert.ok(invHtml.includes('ការិយាល័យ អប់រំ យុវជននិងកីឡានៃរដ្ឋបាលស្រុក') && invHtml.includes('ព្រះរាជាណាចក្រកម្ពុជា'), 'Inventory must contain official dual header');
        assert.ok(invHtml.includes('header-flourish-symbol'), 'Inventory must contain official flourish ornament');
        assert.ok(invHtml.includes('នាយិកាសាលា') && invHtml.includes('គ្រូបន្ទុកថ្នាក់'), 'Inventory must have signature block with នាយិកាសាលា');
        assert.ok(!invHtml.includes('${principalName}'), 'Inventory must not include principal placeholder name');
        assert.ok(invHtml.includes('a4-page') && invHtml.includes('flex-col'), 'Inventory must use full-sheet a4-page frame');
        assert.ok(invHtml.includes('ឆ្នាំសិក្សា ២០២៦-២០២៧'), 'Inventory must contain academic year 2026-2027 below title');

        // Test 2: បទបញ្ជាផ្ទៃក្នុង (Internal Rules - 12 Articles)
        assert.strictEqual(typeof context.window.renderInternalRulesReport, 'function', 'renderInternalRulesReport must be globally exported');
        context.window.renderInternalRulesReport(dummyContainer, 'ថ្នាក់ទី ៤', '«ក»');
        const rulesHtml = dummyContainer.innerHTML;
        assert.ok(rulesHtml.includes('បទបញ្ជាផ្ទៃក្នុងក្នុងថ្នាក់រៀន'), 'Internal rules must contain title');
        assert.ok(rulesHtml.includes('ការិយាល័យ អប់រំ យុវជននិងកីឡានៃរដ្ឋបាលស្រុក') && rulesHtml.includes('ព្រះរាជាណាចក្រកម្ពុជា'), 'Internal rules must contain official dual header');
        assert.ok(rulesHtml.includes('header-flourish-symbol'), 'Internal rules must contain official flourish ornament');
        assert.ok(rulesHtml.includes('ដើម្បីលើកកម្ពស់វិន័យ សីលធម៌'), 'Internal rules must contain preamble');
        for (let i = 1; i <= 12; i++) {
            const khmerNums = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩', '១០', '១១', '១២'];
            assert.ok(rulesHtml.includes(`ប្រការ ${khmerNums[i]}`), `Internal rules must contain Article ${i}`);
        }
        assert.ok(rulesHtml.includes('បទបញ្ជាផ្ទៃក្នុងនេះ មានសុពលភាពអនុវត្ត'), 'Internal rules must have closing clause');
        assert.ok(rulesHtml.includes('នាយិកាសាលា') && rulesHtml.includes('គ្រូបន្ទុកថ្នាក់'), 'Internal rules must have signatures with នាយិកាសាលា');
        assert.ok(!rulesHtml.includes('${principalName}'), 'Internal rules must not include principal placeholder name');
        assert.ok(rulesHtml.includes('ឆ្នាំសិក្សា ២០២៦-២០២៧'), 'Internal rules must contain academic year 2026-2027 below title');

        // Test 3: គោលការណ៍ថ្នាក់រៀន (Class Principles - 16 Rules)
        assert.strictEqual(typeof context.window.renderClassPrinciplesReport, 'function', 'renderClassPrinciplesReport must be globally exported');
        context.window.renderClassPrinciplesReport(dummyContainer, 'ថ្នាក់ទី ៤', '«ក»');
        const princHtml = dummyContainer.innerHTML;
        assert.ok(princHtml.includes('គោលការណ៍ថ្នាក់រៀន'), 'Principles must contain title');
        assert.ok(princHtml.includes('វិន័យនាំមកនូវសេចក្តីថ្លៃថ្នូរ'), 'Principles must contain motto banner');
        assert.ok(princHtml.includes('មកឱ្យទាន់ពេលវេលា'), 'Principles must contain principle 1');
        assert.ok(princHtml.includes('ស្លៀកពាក់ស្អាតបាត និងសមរម្យ'), 'Principles must contain principle 2');
        assert.ok(princHtml.includes('សុំច្បាប់ពេលឈប់សម្រាក'), 'Principles must contain principle 16');
        assert.ok(princHtml.includes('តំណាងសិស្ស / ប្រធានថ្នាក់'), 'Principles must have monitor signature');
        assert.ok(princHtml.includes('ឆ្នាំសិក្សា ២០២៦-២០២៧'), 'Principles must contain academic year 2026-2027 below title');

        // Test 4: វេនសម្អាតប្រចាំសប្ដាហ៍ (Cleaning Schedule)
        assert.strictEqual(typeof context.window.renderCleaningScheduleReport, 'function', 'renderCleaningScheduleReport must be globally exported');
        context.window.renderCleaningScheduleReport(dummyContainer, 'ថ្នាក់ទី ៤', '«ក»');
        const cleanHtml = dummyContainer.innerHTML;
        assert.ok(cleanHtml.includes('តារាងវេនសម្អាតប្រចាំសប្ដាហ៍'), 'Cleaning schedule must contain title');
        assert.ok(cleanHtml.includes('ប្រធានថ្នាក់ (ត្រួតពិនិត្យរួម)'), 'Cleaning schedule must contain monitor banner');
        assert.ok(cleanHtml.includes('ថ្ងៃចន្ទ') && cleanHtml.includes('ថ្ងៃសៅរ៍'), 'Cleaning schedule must include days Mon-Sat');
        assert.ok(cleanHtml.includes('ភារកិច្ចវេនសម្អាត'), 'Cleaning schedule must contain duty scope note');
        assert.ok(!cleanHtml.includes('${principalName}'), 'Cleaning schedule must not include principal placeholder name');
        assert.ok(cleanHtml.includes('ឆ្នាំសិក្សា ២០២៦-២០២៧'), 'Cleaning schedule must contain academic year 2026-2027 below title');

        // Test 5: គណៈកម្មការសាខា & ក្រុមប្រឹក្សាកុមារ (Branch Committee)
        assert.strictEqual(typeof context.window.renderBranchCommitteeReport, 'function', 'renderBranchCommitteeReport must be globally exported');
        context.window.renderBranchCommitteeReport(dummyContainer, 'ថ្នាក់ទី ៤', '«ក»');
        const branchHtml = dummyContainer.innerHTML;
        assert.ok(branchHtml.includes('រចនាសម្ព័ន្ធគណៈកម្មការសាខា'), 'Branch committee must contain title');
        assert.ok(branchHtml.includes('ទីប្រឹក្សាថ្នាក់រៀន') && branchHtml.includes('ប្រធានថ្នាក់រួម'), 'Branch committee must have Level 1 tree');
        assert.ok(branchHtml.includes('អនុប្រធានទី ១') && branchHtml.includes('អនុប្រធានទី ២'), 'Branch committee must have Level 2 tree');
        assert.ok(branchHtml.includes('សមាជិកទី ១') && branchHtml.includes('សមាជិកទី ៤'), 'Branch committee must have Level 3 tree');
        assert.ok(branchHtml.includes('តារាងបែងចែកសិស្សតាមអនុសាខាទាំង ៦'), 'Branch committee must have Sub-branches table');
        assert.ok(branchHtml.includes('អនុសាខាទី ១') && branchHtml.includes('អនុសាខាទី ៦'), 'Sub-branches 1 to 6 must be listed');
        assert.ok(!branchHtml.includes('${principalName}'), 'Branch committee must not include principal placeholder name');
        assert.ok(branchHtml.includes('ឆ្នាំសិក្សា ២០២៦-២០២៧'), 'Branch committee must contain academic year 2026-2027 below title');

        // Test 6: Verify Reports List Dashboard includes all 5 new cards
        const dashContainer = { innerHTML: '' };
        context.document.getElementById = (id) => {
            if (id === 'reportsContainer') return dashContainer;
            return null;
        };
        context.window.loadReportsView();
        const dashHtml = dashContainer.innerHTML;
        assert.ok(dashHtml.includes("openReportDetail('inventory')"), 'Dashboard must have inventory card');
        assert.ok(dashHtml.includes("openReportDetail('internal_rules')"), 'Dashboard must have internal_rules card');
        assert.ok(dashHtml.includes("openReportDetail('class_principles')"), 'Dashboard must have class_principles card');
        assert.ok(dashHtml.includes("openReportDetail('cleaning_schedule')"), 'Dashboard must have cleaning_schedule card');
        assert.ok(dashHtml.includes("openReportDetail('branch_committee')"), 'Dashboard must have branch_committee card');
    });

    test('17. Custom Report Border Manager and Borderless Default with Compact Signature Placement', async () => {
        const dummyContainer = { innerHTML: '' };
        context.window.renderClassInventoryReport(dummyContainer, 'ថ្នាក់ទី ៤', '«ក»');
        const invHtml = dummyContainer.innerHTML;

        // Verify hardcoded double borders are removed
        assert.ok(!invHtml.includes('border-[3px]'), 'Inventory report must not have hardcoded border-[3px]');
        assert.ok(!invHtml.includes('border-amber-500'), 'Inventory report must not have hardcoded border-amber-500');

        // Verify signatures are moved up close to the table (mt-4 pt-2 instead of mt-auto)
        assert.ok(invHtml.includes('mt-4 pt-2'), 'Signatures must use compact spacing mt-4 pt-2 right under the table');
        assert.ok(!invHtml.includes('mt-auto pt-4'), 'Signatures must not be pushed to bottom with mt-auto');

        // Verify Border Manager Methods exist
        assert.strictEqual(typeof context.window.getReportBorderLayerHtml, 'function', 'getReportBorderLayerHtml must exist');
        assert.strictEqual(typeof context.window.openReportBorderModal, 'function', 'openReportBorderModal must exist');
        assert.strictEqual(typeof context.window.closeReportBorderModal, 'function', 'closeReportBorderModal must exist');
        assert.strictEqual(typeof context.window.selectReportBorderPreset, 'function', 'selectReportBorderPreset must exist');
        assert.strictEqual(typeof context.window.saveReportBorderSettings, 'function', 'saveReportBorderSettings must exist');
        assert.strictEqual(typeof context.window.removeAllReportBorders, 'function', 'removeAllReportBorders must exist');

        // Verify default mode is 'none' (returns empty string)
        context.localStorage.setItem('cms_report_border_mode', 'none');
        assert.strictEqual(context.window.getReportBorderLayerHtml(), '', 'Default mode none must return empty border HTML');

        // Verify custom image mode renders overlay div
        context.localStorage.setItem('cms_report_border_mode', 'custom');
        context.localStorage.setItem('cms_report_border_custom_img', 'data:image/png;base64,mockCustomBorder');
        const customBorderHtml = context.window.getReportBorderLayerHtml();
        assert.ok(customBorderHtml.includes('cms-report-border-layer'), 'Custom border must include cms-report-border-layer');
        assert.ok(customBorderHtml.includes('data:image/png;base64,mockCustomBorder'), 'Custom border must include uploaded image URL');

        // Verify remove all borders resets mode
        context.window.removeAllReportBorders();
        assert.strictEqual(context.localStorage.getItem('cms_report_border_mode'), 'none', 'removeAllReportBorders must set mode to none');
    });

    test('18. Timetable periods exclude teacher and room, and report pages match Honor Board standard sizing', () => {
        const timetableCode = fs.readFileSync(path.join(__dirname, '../js/timetable-homework.js'), 'utf8');
        vm.runInContext(timetableCode, context);

        // Slots in timetable must not render teacher-name or room door icons
        assert.ok(!timetableCode.includes('class="teacher-name"'), 'Timetable code must exclude teacher-name inside period slots');
        assert.ok(!timetableCode.includes('fa-door-open'), 'Timetable code must exclude room door icon inside period slots');

        // Verify Class Principles report matches Honor Board standard A4 dimensions
        const dummyContainer = { innerHTML: '' };
        context.window.renderClassPrinciplesReport(dummyContainer, 'ថ្នាក់ទី ៤', '«ក»');
        const html = dummyContainer.innerHTML;
        assert.ok(html.includes('a4-page'), 'Class principles must contain a4-page');
        assert.ok(html.includes('w-[794px]') || html.includes('210mm'), 'Class principles must define standard A4 width');
        assert.ok(html.includes('min-h-[1123px]') || html.includes('297mm'), 'Class principles must define standard A4 height');
        assert.ok(html.includes('justify-between'), 'Class principles must use justify-between like Honor Board');
    });
    test('19. Dynamic Academic Year Switching across Reports View, Executive Header, Tracking Book, and Booklets', () => {
        assert.strictEqual(typeof context.window.getReportAcademicYear, 'function');
        assert.strictEqual(typeof context.window.handleReportYearChange, 'function');

        // 1. Initial State
        context.localStorage.setItem('selected_academic_year', '2027-2028');
        assert.strictEqual(context.window.getReportAcademicYear(), '2027-2028');

        // 2. Switch Academic Year via handleReportYearChange
        context.window.handleReportYearChange('2028-2029');
        assert.strictEqual(context.localStorage.getItem('selected_academic_year'), '2028-2029');
        assert.strictEqual(context.localStorage.getItem('academic_year'), '2028-2029');
        assert.strictEqual(context.window.getReportAcademicYear(), '2028-2029');

        // 3. Verify loadReportsView renders academic year selector with new year selected
        const mockElements = {};
        const getOrCreateEl = (id) => {
            if (!mockElements[id]) {
                mockElements[id] = { id, innerHTML: '', value: '', classList: { add: () => {}, remove: () => {}, contains: () => false }, style: {}, setAttribute: () => {}, removeAttribute: () => {} };
            }
            return mockElements[id];
        };
        const container = { innerHTML: '' };
        context.document.getElementById = (id) => {
            if (id === 'reportsContainer') return container;
            return getOrCreateEl(id);
        };
        context.window.loadReportsView();
        assert.ok(container.innerHTML.includes('id="reportAcademicYearSelect"'), 'Must render reportAcademicYearSelect');
        assert.ok(container.innerHTML.includes('value="2028-2029" selected'), 'Must select active academic year 2028-2029');
        assert.ok(container.innerHTML.includes('២០២៨-២០២៩') || container.innerHTML.includes('2028-2029'), 'Must format year options');

        // 4. Verify Academic Results Report reflects switched year
        const paperArea = { innerHTML: '' };
        context.window.currentAcademicReportMonth = 'មករា';
        context.window.renderAcademicResultsReport(paperArea, 'ថ្នាក់ទី ៤', '«ក»', 'monthly');
        assert.ok(paperArea.innerHTML.includes('2028-2029') || paperArea.innerHTML.includes('២០២៨-២០២៩'), 'Academic Results Report must reflect active year');

        // 5. Verify Tracking Book reflects switched year
        context.document.body.insertAdjacentHTML = () => {};
        context.window.openTrackingBookModal();
        const studentSelect = context.document.getElementById('tbStudentSelect');
        if (studentSelect) {
            studentSelect.value = 'STU-001';
            studentSelect.options = [{ text: 'សុខ ចាន់ដារ៉ា (ប្រុស)', value: 'STU-001' }];
            studentSelect.selectedIndex = 0;
        }
        const previewContainer = context.document.getElementById('tbPreviewContainer');
        context.window.renderTrackingBookPreview();
        assert.ok(previewContainer && (previewContainer.innerHTML.includes('២៨') || previewContainer.innerHTML.includes('2028')), 'Tracking book must display updated academic year');
    });
});
