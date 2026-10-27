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
            'អក្ខរាវិរុទ្ធ',
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

    test('3. Reports View includes cards for Sikha-karik, Tracking Book, Honor Board, and Report Cards', () => {
        const reportsContainer = context.document.getElementById('reportsContainer');
        context.window.loadReportsView();
        const html = reportsContainer.innerHTML;

        assert.ok(html.includes('sikhakarik'), 'Reports view should contain Sikha-karik card');
        assert.ok(html.includes('openTrackingBookModal'), 'Reports view should contain Tracking Book trigger');
        assert.ok(html.includes('openHonorBoardModal') || html.includes('modal-honorboard'), 'Reports view should contain Honor Board trigger');
        assert.ok(html.includes('openReportCardsModal') || html.includes('modal-reportcards'), 'Reports view should contain Report Cards trigger');
    });

    test('4. window.openHonorBoardModal and window.openReportCardsModal exist globally', () => {
        assert.strictEqual(typeof context.window.openHonorBoardModal, 'function');
        assert.strictEqual(typeof context.window.openReportCardsModal, 'function');
        assert.strictEqual(typeof context.window.openTrackingBookModal, 'function');
    });
});
