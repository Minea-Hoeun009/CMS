// =========================================================================
// ឯកសារ js/i18n.js - ប្រព័ន្ធភាសាទ្វេភាគី (Bilingual Internationalization: Khmer & English)
// CMS Enterprise Architecture v4.2
// =========================================================================

(function() {
    const translations = {
        km: {
            appName: "Classroom CMS",
            appSubtitle: "ប្រព័ន្ធគ្រប់គ្រងថ្នាក់រៀន",
            dashboard: "ទំព័រដើម",
            students: "គ្រប់គ្រងសិស្ស",
            teachers: "គ្រូ",
            classes: "ថ្នាក់រៀន",
            attendance: "កត់វត្តមាន",
            grades: "ពិន្ទុ និងលទ្ធផល",
            timetable: "កាលវិភាគសិក្សា",
            homework: "កិច្ចការផ្ទះ",
            library: "បណ្ណាល័យ",
            reports: "របាយការណ៍ផ្សេងៗ",
            accounts: "គណនី",
            settings: "ការកំណត់",
            sloganTitle: "អប់រំដើម្បីអនាគតកាន់តែភ្លឺស្វាង",
            sloganSub: "Better Education, Brighter Future",
            welcomeTitle: "សូមស្វាគមន៍មកកាន់ប្រព័ន្ធគ្រប់គ្រងថ្នាក់រៀន!",
            welcomeSub: "Welcome to Classroom Management System!",
            totalStudents: "សិស្សសរុប",
            totalTeachers: "គ្រូសរុប",
            totalClasses: "ថ្នាក់សរុប",
            todayAttendance: "វត្តមានថ្ងៃនេះ",
            fromLastMonth: "ពីខែមុន",
            fromYesterday: "ពីម្សិលមិញ",
            studentCountByYear: "ចំនួនសិស្សតាមឆ្នាំសិក្សា",
            attendanceStats: "ស្ថិតិវត្តមាន",
            recentActivities: "សកម្មភាពចុងក្រោយ",
            viewAll: "មើលទាំងអស់",
            dailyStatus: "ស្ថានភាពប្រចាំថ្ងៃ",
            dailyStatusNote: "សូមត្រួតពិនិត្យវត្តមាន និងកិច្ចការប្រឡងសិស្ស! គ្រប់យ៉ាងដំណើរការល្អប្រសើរ",
            quickShortcuts: "តំណភ្ជាប់រហ័ស",
            searchPlaceholder: "ស្វែងរក... (សិស្ស, គ្រូ, ថ្នាក់)",
            academicYear: "ឆ្នាំសិក្សា",
            present: "វត្តមាន",
            absent: "អវត្តមាន",
            late: "យឺត",
            excused: "លើកលែង",
            shortcutStudents: "សិស្ស (បញ្ជីសិស្សថ្មី)",
            shortcutGradesSummary: "ប័ណ្ណពិន្ទុសង្ខេប",
            shortcutAllClasses: "ថ្នាក់រៀនទាំងអស់",
            shortcutEnterGrades: "ចូលកត់ពិន្ទុ (Mathematics)",
            shortcutTimetable: "កាលវិភាគបង្រៀន",
            shortcutNotifications: "សារជូនដំណឹងថ្មី",
            logout: "ចាកចេញ",
            superAdmin: "Super Admin",
            homeroomTeacher: "គ្រូបន្ទុកថ្នាក់"
        },
        en: {
            appName: "Classroom CMS",
            appSubtitle: "Classroom Management System",
            dashboard: "Dashboard",
            students: "Student Management",
            teachers: "Teachers",
            classes: "Classes",
            attendance: "Attendance Tracker",
            grades: "Scores & Results",
            timetable: "Study Timetable",
            homework: "Homework",
            library: "Library",
            reports: "General Reports",
            accounts: "Accounts",
            settings: "Settings",
            sloganTitle: "Better Education, Brighter Future",
            sloganSub: "Empowering Next Generation",
            welcomeTitle: "Welcome to Classroom Management System!",
            welcomeSub: "Manage your school, classes, attendance, and grades efficiently",
            totalStudents: "Total Students",
            totalTeachers: "Total Teachers",
            totalClasses: "Total Classes",
            todayAttendance: "Today Attendance",
            fromLastMonth: "from last month",
            fromYesterday: "from yesterday",
            studentCountByYear: "Student Count by Academic Year",
            attendanceStats: "Attendance Statistics",
            recentActivities: "Recent Activities",
            viewAll: "View All",
            dailyStatus: "Daily Status",
            dailyStatusNote: "Please review attendance and examinations. All systems operational.",
            quickShortcuts: "Quick Shortcuts",
            searchPlaceholder: "Search... (students, teachers, classes)",
            academicYear: "Academic Year",
            present: "Present",
            absent: "Absent",
            late: "Late",
            excused: "Excused",
            shortcutStudents: "Students (New List)",
            shortcutGradesSummary: "Grade Summary Cards",
            shortcutAllClasses: "All Classrooms",
            shortcutEnterGrades: "Enter Grades (Math)",
            shortcutTimetable: "Teaching Schedule",
            shortcutNotifications: "Recent Notifications",
            logout: "Logout",
            superAdmin: "Super Admin",
            homeroomTeacher: "Homeroom Teacher"
        }
    };

    window.CMS_I18N = {
        currentLang: localStorage.getItem('cms_lang') || 'km',

        t: function(key) {
            const lang = this.currentLang;
            if (translations[lang] && translations[lang][key]) {
                return translations[lang][key];
            }
            if (translations.km && translations.km[key]) {
                return translations.km[key];
            }
            return key;
        },

        switchLanguage: function(newLang) {
            if (newLang !== 'km' && newLang !== 'en') return;
            this.currentLang = newLang;
            localStorage.setItem('cms_lang', newLang);
            this.applyLanguageToDOM();
            if (typeof window.loadDashboard === 'function' && (window.currentActiveView === 'dashboard' || !window.currentActiveView)) {
                window.loadDashboard();
            }
        },

        applyLanguageToDOM: function() {
            const lang = this.currentLang;
            document.documentElement.lang = lang;

            // Toggle active pill buttons
            const btnKm = document.getElementById('btnLangKm');
            const btnEn = document.getElementById('btnLangEn');
            if (btnKm && btnEn) {
                if (lang === 'km') {
                    btnKm.className = "px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold shadow-sm transition";
                    btnEn.className = "px-2.5 py-1 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 font-bold transition";
                } else {
                    btnKm.className = "px-2.5 py-1 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 font-bold transition";
                    btnEn.className = "px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold shadow-sm transition";
                }
            }

            // Update all elements with data-i18n
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                const val = this.t(key);
                if (val) el.textContent = val;
            });

            // Update placeholders with data-i18n-placeholder
            document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
                const key = el.getAttribute('data-i18n-placeholder');
                const val = this.t(key);
                if (val) el.setAttribute('placeholder', val);
            });
        }
    };

    // Global shortcut
    window.switchLanguage = function(lang) {
        window.CMS_I18N.switchLanguage(lang);
    };

    // Auto-init on load
    document.addEventListener("DOMContentLoaded", function() {
        window.CMS_I18N.applyLanguageToDOM();
    });
})();
