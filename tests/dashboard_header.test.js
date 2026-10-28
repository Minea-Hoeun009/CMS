// =========================================================================
// Tests: Dashboard Executive Header Consistency & DOM Validation
// =========================================================================

const { test, describe } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const vm = require('vm');

describe('Dashboard Executive Header Consistency Tests', () => {
    test('1. loadDashboard renders standardized Royal Blue Executive Header', () => {
        const configCode = fs.readFileSync('js/config.js', 'utf8');
        const dashCode = fs.readFileSync('js/dashboard.js', 'utf8');

        const containerMock = { className: '', innerHTML: '' };
        const sandbox = {
            window: {},
            document: {
                getElementById: (id) => id === 'dashboardContainer' ? containerMock : null,
                querySelectorAll: () => []
            },
            localStorage: {
                getItem: (k) => k === 'auth_teacher_name' ? 'ហឿន មិនា' : (k === 'auth_teacher_id' ? 'TCH-013' : null),
                setItem: () => {}
            },
            navigator: { userAgent: 'test' },
            setTimeout: (fn) => {},
            setInterval: () => 1,
            clearInterval: () => {},
            addEventListener: () => {},
            Chart: function() { return { destroy: () => {} }; },
            console: console
        };
        sandbox.window = sandbox;

        vm.createContext(sandbox);
        vm.runInContext(configCode, sandbox);
        vm.runInContext(dashCode, sandbox);

        sandbox.window.loadDashboard();

        const html = containerMock.innerHTML;
        assert.ok(html.includes('ទំព័រដើម'), 'Must contain title ទំព័រដើម');
        assert.ok(html.includes('ហឿន មិនា'), 'Must contain teacher name ហឿន មិនា');
        assert.ok(html.includes('TCH-013'), 'Must contain teacher ID TCH-013');
        assert.ok(html.includes('dashClock'), 'Must contain clock dashClock');
        assert.ok(html.includes('from-blue-600 via-blue-600 to-indigo-600'), 'Must contain Royal Blue executive gradient banner');
        assert.ok(html.includes('refreshDashboardData()'), 'Must contain fresh sync action button');
    });

    test('2. index.html defines dashboardContainer and cache-busting version on all script tags', () => {
        const indexHtml = fs.readFileSync('index.html', 'utf8');
        assert.ok(indexHtml.includes('id="dashboardContainer"'), 'index.html must have dashboardContainer');
        assert.ok(indexHtml.includes('js/dashboard.js?v='), 'dashboard.js must have cache busting version parameter');
        assert.ok(indexHtml.includes('js/config.js?v='), 'config.js must have cache busting version parameter');
    });

    test('3. Welcome Screen displays digital classroom title and creator attribution', () => {
        const indexHtml = fs.readFileSync('index.html', 'utf8');
        assert.ok(indexHtml.includes('ប្រព័ន្ធគ្រប់គ្រងថ្នាក់រៀនឌីជីថល'), 'Must display grand title ប្រព័ន្ធគ្រប់គ្រងថ្នាក់រៀនឌីជីថល');
        assert.ok(indexHtml.includes('ប្រព័ន្ធនេះបង្កើតដោយ៖ ហឿន មិនា | ICT Teacher'), 'Must display creator attribution');
    });

    test('4. Timetable module does not have class dropdown selector', () => {
        const timetableCode = fs.readFileSync('js/timetable-homework.js', 'utf8');
        assert.ok(!timetableCode.includes('<option value="${c}" ${c === this.currentGrade'), 'Must not contain class selection dropdown options in timetable toolbar');
    });

    test('5. Quick shortcuts section does not contain All Classes or Grade Summary shortcuts', () => {
        const dashCode = fs.readFileSync('js/dashboard.js', 'utf8');
        assert.ok(!dashCode.includes('shortcutAllClasses'), 'Must not contain shortcutAllClasses in quick shortcuts');
        assert.ok(!dashCode.includes('shortcutGradesSummary'), 'Must not contain shortcutGradesSummary in quick shortcuts');
        assert.ok(!dashCode.includes('window.openManageClassModal()'), 'Must not contain openManageClassModal in dashboard quick shortcuts');
    });
});
