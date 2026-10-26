// =========================================================================
// ឯកសារ js/dashboard.js - ផ្ទាំងគ្រប់គ្រងទិន្នន័យសាលារៀន (Pro Dynamic & Role-Aware Dashboard)
// CMS Enterprise Architecture v4.0
// =========================================================================

(function() {
    // Current filter state for the dashboard
    window.DashboardFilterState = {
        academicYear: localStorage.getItem('selected_academic_year') || '2026-2027',
        selectedClass: localStorage.getItem('dashboard_selected_class') || 'all',
        selectedDate: new Date().toISOString().split('T')[0]
    };

    /**
     * កំណត់តួនាទីរបស់អ្នកប្រើប្រាស់បច្ចុប្បន្ន (Resolve User Role)
     */
    function resolveUserRole() {
        if (window.AppAuth?.state?.role) return window.AppAuth.state.role;
        if (window.AuthState?.role) return window.AuthState.role;
        const localRole = localStorage.getItem('auth_teacher_role') || localStorage.getItem('user_role');
        if (localRole) return localRole;
        if (typeof window.isSuperAdmin === 'function' && window.isSuperAdmin()) return 'super_admin';
        if (typeof window.isSchoolAdmin === 'function' && window.isSchoolAdmin()) return 'admin';
        return 'homeroom_teacher';
    }

    /**
     * បង្ហាញឈ្មោះតួនាទីជាភាសាខ្មែរ
     */
    function getRoleTitleKhmer(role) {
        switch (role) {
            case 'super_admin': return 'អ្នកគ្រប់គ្រងប្រព័ន្ធជាន់ខ្ពស់ (Super Admin)';
            case 'admin': return 'រដ្ឋបាលសាលារៀន (School Admin)';
            case 'homeroom_teacher': return 'គ្រូបន្ទុកថ្នាក់ (Homeroom Teacher)';
            case 'subject_teacher': return 'គ្រូបង្រៀនតាមមុខវិជ្ជា (Subject Teacher)';
            case 'student': return 'សិស្សានុសិស្ស (Student)';
            default: return 'បុគ្គលិកអប់រំ (Staff)';
        }
    }

    /**
     * មេមុខងារគូរ Dashboard ទាំងមូល
     */
    window.loadDashboard = function() {
        try {
            const container = document.getElementById("dashboardView") || document.getElementById("mainContentArea") || document.getElementById("appView");
            if (!container) return;

            const role = resolveUserRole();
            const currentFilter = window.DashboardFilterState;
            const academicYear = currentFilter.academicYear;
            const selectedClass = currentFilter.selectedClass;

            // ១. ទាញយកការកំណត់សាលា
            let sInfo = {};
            try {
                if (typeof appSettings !== 'undefined' && appSettings) sInfo = appSettings;
                else {
                    const localSet = localStorage.getItem('school_settings');
                    if (localSet && localSet !== "undefined" && localSet !== "null") sInfo = JSON.parse(localSet);
                }
            } catch (e) { sInfo = {}; }

            const userName = window.AuthState?.teacherName || window.AppAuth?.state?.teacherName || localStorage.getItem('auth_teacher_name') || 'លោកគ្រូ អ្នកគ្រូ';

            // ២. ទាញយក និងចម្រាញ់ទិន្នន័យសិស្ស (Data Scope Filtering)
            let rawStudents = [];
            try {
                if (typeof window.getMasterStudents === 'function') {
                    rawStudents = window.getMasterStudents();
                } else if (window.allStudents && Array.isArray(window.allStudents) && window.allStudents.length > 0) {
                    rawStudents = window.allStudents;
                } else {
                    const localStus = localStorage.getItem('academic_students');
                    if (localStus && localStus !== "undefined") rawStudents = JSON.parse(localStus) || [];
                }
            } catch (e) { rawStudents = []; }

            // ចម្រាញ់តាមឆ្នាំសិក្សា
            let yearStudents = rawStudents.filter(s => {
                if (!s) return false;
                if (s.academic_year && s.academic_year !== academicYear) return false;
                return true;
            });
            if (yearStudents.length === 0) yearStudents = rawStudents; // Fallback

            // ចម្រាញ់តាមថ្នាក់ដែលបានជ្រើស
            let scopedStudents = yearStudents;
            if (selectedClass && selectedClass !== 'all') {
                scopedStudents = yearStudents.filter(s => {
                    const sClass = `${s.grade || ''} ${s.room || ''}`.trim();
                    return sClass === selectedClass.trim();
                });
            }

            const activeStudents = scopedStudents.filter(s => s.status !== "Dropped" && s.status !== "Withdrawn");
            const dropCount = scopedStudents.filter(s => s.status === "Dropped" || s.status === "Withdrawn").length;
            const totalStudents = activeStudents.length;
            const femaleStudents = activeStudents.filter(s => s.gender === 'ស្រី' || s.gender === 'F').length;
            const maleStudents = totalStudents - femaleStudents;
            const poorStudents = activeStudents.filter(s => s.poor_id && String(s.poor_id) !== "false" && String(s.poor_id).trim() !== "").length;
            const scholarStudents = activeStudents.filter(s => s.scholarship === true || s.scholarship === "true" || s.scholarship === "បាទ/ចាស").length;

            // រាប់ចំនួនថ្នាក់រៀន
            const classSet = new Set(yearStudents.map(s => `${s.grade || 'ថ្នាក់ទី ១'} ${s.room || '«ក»'}`.trim()));
            const availableClasses = Array.from(classSet);
            const totalClassesCount = availableClasses.length || 1;

            // ៣. គណនាទិន្នន័យវត្តមានសម្រាប់កាលបរិច្ឆេទជ្រើសរើស (Attendance Stats)
            const chosenDate = new Date(currentFilter.selectedDate);
            const todayDayNum = chosenDate.getDate();
            let attPresent = 0, attPerm = 0, attUnex = 0, attSick = 0;
            
            let monthAtt = window.monthlyAttendanceData || {};
            if (Object.keys(monthAtt).length === 0) {
                try { monthAtt = JSON.parse(localStorage.getItem('academic_monthly_attendance') || '{}'); } catch(e) {}
            }

            let attendanceMarkedCount = 0;
            activeStudents.forEach(s => {
                const stuAtt = monthAtt[s.id] || {};
                const code = (stuAtt[todayDayNum] || "").trim().toUpperCase();
                if (code) attendanceMarkedCount++;
                if (code === "ច" || code === "ច្ប" || code === "C") attPerm++;
                else if (code === "អ" || code === "អច្ប" || code === "A") attUnex++;
                else if (code === "ឈ" || code === "S") attSick++;
                else if (code && code !== "៖" && code !== "-") attPresent++;
            });

            const totalAbsent = attPerm + attUnex + attSick;
            const attRate = totalStudents > 0 ? Math.round((attPresent / totalStudents) * 100) : 100;
            const hasAttendanceRecorded = attendanceMarkedCount > 0;

            // ៤. គណនាពិន្ទុ មធ្យមភាគ និងចំណាត់ថ្នាក់ (Scores & Rankings)
            let rawScores = [];
            try { rawScores = JSON.parse(localStorage.getItem('academic_scores') || '[]'); } catch(e) {}
            
            let honorStudents = [];
            const studentScoreMap = {};
            rawScores.forEach(sc => {
                if (sc.student_id && sc.average) {
                    const avgNum = parseFloat(sc.average) || 0;
                    if (!studentScoreMap[sc.student_id] || avgNum > studentScoreMap[sc.student_id].avg) {
                        const matchedStu = activeStudents.find(s => String(s.id) === String(sc.student_id));
                        if (matchedStu || selectedClass === 'all') {
                            studentScoreMap[sc.student_id] = {
                                id: sc.student_id,
                                name: matchedStu ? matchedStu.name : sc.student_name || "សិស្ស",
                                gender: matchedStu ? matchedStu.gender : "ស",
                                avg: avgNum,
                                total: sc.total_score || (avgNum * 5).toFixed(1),
                                grade_letter: sc.grade_letter || (avgNum >= 8 ? 'ល្អណាស់' : avgNum >= 6.5 ? 'ល្អ' : 'មធ្យម')
                            };
                        }
                    }
                }
            });
            honorStudents = Object.values(studentScoreMap).sort((a, b) => b.avg - a.avg).slice(0, 5);

            const classAvg = honorStudents.length > 0 
                ? (honorStudents.reduce((sum, s) => sum + (parseFloat(s.avg) || 0), 0) / honorStudents.length).toFixed(2)
                : "0.00";

            // ៥. ទាញយកកិច្ចការផ្ទះ និងកាលវិភាគ
            let homeworkList = [];
            try {
                const hwKey = `homework_${selectedClass !== 'all' ? selectedClass : 'all'}`;
                const localHw = localStorage.getItem(hwKey) || localStorage.getItem('homework_all');
                if (localHw) homeworkList = JSON.parse(localHw) || [];
            } catch(e) {}

            // ៦. Audit Logs & System Health
            const recentLogs = typeof window.AuditBackup !== 'undefined' ? window.AuditBackup.getLogs().slice(0, 5) : [];
            const pendingApprovalsCount = (window.AppAuth?.state?.pendingAccountsCount) || 0;

            // ៧. កាលបរិច្ឆេទខ្មែរ
            const khmerMonths = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];
            const toKhNum = typeof window.toKhmerNum === 'function' ? window.toKhmerNum : String;
            const dateStrKh = `ថ្ងៃទី ${toKhNum(chosenDate.getDate())} ខែ ${khmerMonths[chosenDate.getMonth()]} ឆ្នាំ ${toKhNum(chosenDate.getFullYear())}`;

            // Header filter bar component
            const filterBarHtml = `
                <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div class="flex flex-wrap items-center gap-3">
                        <div class="flex items-center gap-2">
                            <span class="text-xs font-bold text-slate-500 dark:text-slate-400"><i class="fa-solid fa-calendar-days text-indigo-500"></i> ឆ្នាំសិក្សា៖</span>
                            <select id="dashFilterAcademicYear" onchange="window.handleDashboardFilterChange('academicYear', this.value)" class="text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 py-1.5 px-3 rounded-xl border-0 focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                                <option value="2026-2027" ${academicYear === '2026-2027' ? 'selected' : ''}>២០២៦-២០២៧</option>
                                <option value="2025-2026" ${academicYear === '2025-2026' ? 'selected' : ''}>២០២៥-២០២៦</option>
                                <option value="2024-2025" ${academicYear === '2024-2025' ? 'selected' : ''}>២០២៤-២០២៥</option>
                            </select>
                        </div>
                        
                        <div class="flex items-center gap-2">
                            <span class="text-xs font-bold text-slate-500 dark:text-slate-400"><i class="fa-solid fa-chalkboard text-emerald-500"></i> ថ្នាក់រៀន៖</span>
                            <select id="dashFilterClass" onchange="window.handleDashboardFilterChange('selectedClass', this.value)" class="text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 py-1.5 px-3 rounded-xl border-0 focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                                <option value="all" ${selectedClass === 'all' ? 'selected' : ''}>ថ្នាក់ទាំងអស់ (${totalClassesCount} ថ្នាក់)</option>
                                ${availableClasses.map(c => `<option value="${c}" ${selectedClass === c ? 'selected' : ''}>${c}</option>`).join('')}
                            </select>
                        </div>

                        <div class="flex items-center gap-2">
                            <span class="text-xs font-bold text-slate-500 dark:text-slate-400"><i class="fa-regular fa-clock text-amber-500"></i> កាលបរិច្ឆេទ៖</span>
                            <input type="date" id="dashFilterDate" value="${currentFilter.selectedDate}" onchange="window.handleDashboardFilterChange('selectedDate', this.value)" class="text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 py-1.5 px-3 rounded-xl border-0 focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                        </div>
                    </div>

                    <div class="flex items-center gap-2">
                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800">
                            <i class="fa-solid fa-shield-halved text-xs"></i> ${getRoleTitleKhmer(role)}
                        </span>
                        <button onclick="window.refreshDashboardData()" title="ទាញយកទិន្នន័យស្រស់" class="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 flex items-center justify-center transition">
                            <i class="fa-solid fa-arrows-rotate text-xs"></i>
                        </button>
                    </div>
                </div>
            `;

            // Role specific KPI Counters
            let kpiCountersHtml = '';
            if (role === 'super_admin' || role === 'admin') {
                kpiCountersHtml = `
                    <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                        <div class="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition">
                            <div class="flex justify-between items-start mb-3">
                                <div class="w-10 h-10 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center text-lg"><i class="fa-solid fa-users"></i></div>
                                <span class="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-lg text-[10px] font-bold">សរុប</span>
                            </div>
                            <p class="text-slate-400 text-[11px] font-bold uppercase tracking-wider">សិស្សសរុបទូទាំងសាលា</p>
                            <p class="text-3xl font-black text-slate-800 dark:text-white mt-1">${totalStudents} <span class="text-xs font-normal text-slate-400">នាក់</span></p>
                        </div>
                        <div class="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition">
                            <div class="flex justify-between items-start mb-3">
                                <div class="w-10 h-10 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-xl flex items-center justify-center text-lg"><i class="fa-solid fa-chalkboard-user"></i></div>
                                <span class="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-lg text-[10px] font-bold">សកម្ម</span>
                            </div>
                            <p class="text-slate-400 text-[11px] font-bold uppercase tracking-wider">ថ្នាក់រៀនសរុប</p>
                            <p class="text-3xl font-black text-emerald-600 mt-1">${totalClassesCount} <span class="text-xs font-normal text-slate-400">ថ្នាក់</span></p>
                        </div>
                        <div class="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition">
                            <div class="flex justify-between items-start mb-3">
                                <div class="w-10 h-10 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 rounded-xl flex items-center justify-center text-lg"><i class="fa-solid fa-user-check"></i></div>
                                <span class="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-lg text-[10px] font-bold">${attRate}%</span>
                            </div>
                            <p class="text-slate-400 text-[11px] font-bold uppercase tracking-wider">អត្រាវត្តមានថ្ងៃនេះ</p>
                            <p class="text-3xl font-black text-indigo-600 mt-1">${attPresent} <span class="text-xs text-slate-400">មក</span></p>
                        </div>
                        <div class="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition">
                            <div class="flex justify-between items-start mb-3">
                                <div class="w-10 h-10 bg-rose-50 dark:bg-rose-950 text-rose-500 rounded-xl flex items-center justify-center text-lg"><i class="fa-solid fa-user-xmark"></i></div>
                                <span class="bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-lg text-[10px] font-bold">អវត្តមាន</span>
                            </div>
                            <p class="text-slate-400 text-[11px] font-bold uppercase tracking-wider">អវត្តមានថ្ងៃនេះ</p>
                            <p class="text-3xl font-black text-rose-600 mt-1">${totalAbsent} <span class="text-xs text-slate-400">(ច្បាប់ ${attPerm})</span></p>
                        </div>
                        <div class="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition">
                            <div class="flex justify-between items-start mb-3">
                                <div class="w-10 h-10 bg-amber-50 dark:bg-amber-950 text-amber-500 rounded-xl flex items-center justify-center text-lg"><i class="fa-solid fa-user-clock"></i></div>
                                <span class="bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-lg text-[10px] font-bold">រង់ចាំ</span>
                            </div>
                            <p class="text-slate-400 text-[11px] font-bold uppercase tracking-wider">គណនីរង់ចាំអនុម័ត</p>
                            <p class="text-3xl font-black text-amber-600 mt-1">${pendingApprovalsCount} <span class="text-xs font-normal text-slate-400">នាក់</span></p>
                        </div>
                        <div class="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition">
                            <div class="flex justify-between items-start mb-3">
                                <div class="w-10 h-10 bg-purple-50 dark:bg-purple-950 text-purple-600 rounded-xl flex items-center justify-center text-lg"><i class="fa-solid fa-shield-halved"></i></div>
                                <span class="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-lg text-[10px] font-bold">សុវត្ថិភាព</span>
                            </div>
                            <p class="text-slate-400 text-[11px] font-bold uppercase tracking-wider">ស្ថានភាពប្រព័ន្ធ</p>
                            <p class="text-2xl font-black text-purple-600 mt-1">ធម្មតា <span class="text-xs font-normal text-slate-400">(100%)</span></p>
                        </div>
                    </div>
                `;
            } else if (role === 'homeroom_teacher') {
                kpiCountersHtml = `
                    <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                        <div class="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition">
                            <div class="flex justify-between items-start mb-3">
                                <div class="w-10 h-10 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center text-lg"><i class="fa-solid fa-users"></i></div>
                                <span class="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-lg text-[10px] font-bold">ក្នុងបន្ទុក</span>
                            </div>
                            <p class="text-slate-400 text-[11px] font-bold uppercase tracking-wider">សិស្សក្នុងថ្នាក់ខ្ញុំ</p>
                            <p class="text-3xl font-black text-slate-800 dark:text-white mt-1">${totalStudents} <span class="text-xs font-normal text-slate-400">នាក់</span></p>
                        </div>
                        <div class="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition">
                            <div class="flex justify-between items-start mb-3">
                                <div class="w-10 h-10 bg-pink-50 dark:bg-pink-950 text-pink-500 rounded-xl flex items-center justify-center text-lg"><i class="fa-solid fa-venus-mars"></i></div>
                                <span class="bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300 px-2 py-0.5 rounded-lg text-[10px] font-bold">សមាមាត្រ</span>
                            </div>
                            <p class="text-slate-400 text-[11px] font-bold uppercase tracking-wider">ស្រី / ប្រុស</p>
                            <p class="text-2xl font-black text-slate-800 dark:text-white mt-1">${femaleStudents} <span class="text-xs text-slate-400 font-bold">ស្រី</span> / ${maleStudents} <span class="text-xs text-slate-400 font-bold">ប្រុស</span></p>
                        </div>
                        <div class="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition">
                            <div class="flex justify-between items-start mb-3">
                                <div class="w-10 h-10 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-xl flex items-center justify-center text-lg"><i class="fa-solid fa-user-check"></i></div>
                                <span class="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-lg text-[10px] font-bold">${attRate}%</span>
                            </div>
                            <p class="text-slate-400 text-[11px] font-bold uppercase tracking-wider">វត្តមានថ្ងៃនេះ</p>
                            <p class="text-3xl font-black text-emerald-600 mt-1">${attPresent} <span class="text-xs text-slate-400">មក</span></p>
                        </div>
                        <div class="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition">
                            <div class="flex justify-between items-start mb-3">
                                <div class="w-10 h-10 bg-rose-50 dark:bg-rose-950 text-rose-500 rounded-xl flex items-center justify-center text-lg"><i class="fa-solid fa-user-xmark"></i></div>
                                <span class="bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-lg text-[10px] font-bold">អវត្តមាន</span>
                            </div>
                            <p class="text-slate-400 text-[11px] font-bold uppercase tracking-wider">អវត្តមានថ្ងៃនេះ</p>
                            <p class="text-3xl font-black text-rose-600 mt-1">${totalAbsent} <span class="text-xs text-slate-400">(ច្បាប់ ${attPerm})</span></p>
                        </div>
                        <div class="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition">
                            <div class="flex justify-between items-start mb-3">
                                <div class="w-10 h-10 bg-amber-50 dark:bg-amber-950 text-amber-500 rounded-xl flex items-center justify-center text-lg"><i class="fa-solid fa-chart-line"></i></div>
                                <span class="bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-lg text-[10px] font-bold">ពិន្ទុ</span>
                            </div>
                            <p class="text-slate-400 text-[11px] font-bold uppercase tracking-wider">មធ្យមភាគថ្នាក់</p>
                            <p class="text-3xl font-black text-amber-600 mt-1">${classAvg} <span class="text-xs text-slate-400">/10</span></p>
                        </div>
                        <div class="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition">
                            <div class="flex justify-between items-start mb-3">
                                <div class="w-10 h-10 ${hasAttendanceRecorded ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500 animate-pulse'} rounded-xl flex items-center justify-center text-lg">
                                    <i class="fa-solid ${hasAttendanceRecorded ? 'fa-circle-check' : 'fa-triangle-exclamation'}"></i>
                                </div>
                                <span class="${hasAttendanceRecorded ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'} px-2 py-0.5 rounded-lg text-[10px] font-bold">${hasAttendanceRecorded ? 'កត់រួច' : 'មិនទាន់កត់'}</span>
                            </div>
                            <p class="text-slate-400 text-[11px] font-bold uppercase tracking-wider">កត់វត្តមានថ្ងៃនេះ</p>
                            <p class="text-2xl font-black ${hasAttendanceRecorded ? 'text-emerald-600' : 'text-rose-600'} mt-1">${hasAttendanceRecorded ? 'រួចរាល់' : 'នៅខ្វះ'}</p>
                        </div>
                    </div>
                `;
            } else if (role === 'subject_teacher') {
                kpiCountersHtml = `
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div class="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition">
                            <div class="flex justify-between items-start mb-3">
                                <div class="w-10 h-10 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 rounded-xl flex items-center justify-center text-lg"><i class="fa-solid fa-chalkboard"></i></div>
                                <span class="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-lg text-[10px] font-bold">ទទួលខុសត្រូវ</span>
                            </div>
                            <p class="text-slate-400 text-[11px] font-bold uppercase tracking-wider">ថ្នាក់បង្រៀនសរុប</p>
                            <p class="text-3xl font-black text-indigo-600 mt-1">${totalClassesCount} <span class="text-xs text-slate-400">ថ្នាក់</span></p>
                        </div>
                        <div class="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition">
                            <div class="flex justify-between items-start mb-3">
                                <div class="w-10 h-10 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-xl flex items-center justify-center text-lg"><i class="fa-solid fa-book-open"></i></div>
                                <span class="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-lg text-[10px] font-bold">សកម្ម</span>
                            </div>
                            <p class="text-slate-400 text-[11px] font-bold uppercase tracking-wider">កិច្ចការផ្ទះបានដាក់</p>
                            <p class="text-3xl font-black text-blue-600 mt-1">${homeworkList.length} <span class="text-xs text-slate-400">មេរៀន</span></p>
                        </div>
                        <div class="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition">
                            <div class="flex justify-between items-start mb-3">
                                <div class="w-10 h-10 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-xl flex items-center justify-center text-lg"><i class="fa-solid fa-clock"></i></div>
                                <span class="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-lg text-[10px] font-bold">ថ្ងៃនេះ</span>
                            </div>
                            <p class="text-slate-400 text-[11px] font-bold uppercase tracking-wider">ម៉ោងបង្រៀនថ្ងៃនេះ</p>
                            <p class="text-3xl font-black text-emerald-600 mt-1">៤ <span class="text-xs text-slate-400">ម៉ោង</span></p>
                        </div>
                        <div class="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition">
                            <div class="flex justify-between items-start mb-3">
                                <div class="w-10 h-10 bg-amber-50 dark:bg-amber-950 text-amber-500 rounded-xl flex items-center justify-center text-lg"><i class="fa-solid fa-pen-nib"></i></div>
                                <span class="bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-lg text-[10px] font-bold">ពិន្ទុ</span>
                            </div>
                            <p class="text-slate-400 text-[11px] font-bold uppercase tracking-wider">បញ្ចូលពិន្ទុខែនេះ</p>
                            <p class="text-2xl font-black text-amber-600 mt-1">រួចរាល់ ៨០%</p>
                        </div>
                    </div>
                `;
            } else if (role === 'student') {
                kpiCountersHtml = `
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div class="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition">
                            <div class="flex justify-between items-start mb-3">
                                <div class="w-10 h-10 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-xl flex items-center justify-center text-lg"><i class="fa-solid fa-user-check"></i></div>
                                <span class="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-lg text-[10px] font-bold">${attRate}%</span>
                            </div>
                            <p class="text-slate-400 text-[11px] font-bold uppercase tracking-wider">អត្រាវត្តមានផ្ទាល់ខ្លួន</p>
                            <p class="text-3xl font-black text-emerald-600 mt-1">${attRate}%</p>
                        </div>
                        <div class="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition">
                            <div class="flex justify-between items-start mb-3">
                                <div class="w-10 h-10 bg-amber-50 dark:bg-amber-950 text-amber-500 rounded-xl flex items-center justify-center text-lg"><i class="fa-solid fa-trophy"></i></div>
                                <span class="bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-lg text-[10px] font-bold">ចំណាត់ថ្នាក់</span>
                            </div>
                            <p class="text-slate-400 text-[11px] font-bold uppercase tracking-wider">ចំណាត់ថ្នាក់ក្នុងថ្នាក់</p>
                            <p class="text-3xl font-black text-amber-600 mt-1">លេខ ១ <span class="text-xs text-slate-400">(${classAvg} ពិន្ទុ)</span></p>
                        </div>
                        <div class="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition">
                            <div class="flex justify-between items-start mb-3">
                                <div class="w-10 h-10 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-xl flex items-center justify-center text-lg"><i class="fa-solid fa-book"></i></div>
                                <span class="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-lg text-[10px] font-bold">កិច្ចការ</span>
                            </div>
                            <p class="text-slate-400 text-[11px] font-bold uppercase tracking-wider">កិច្ចការផ្ទះត្រូវប្រគល់</p>
                            <p class="text-3xl font-black text-blue-600 mt-1">${homeworkList.length} <span class="text-xs text-slate-400">មេរៀន</span></p>
                        </div>
                        <div class="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition">
                            <div class="flex justify-between items-start mb-3">
                                <div class="w-10 h-10 bg-purple-50 dark:bg-purple-950 text-purple-600 rounded-xl flex items-center justify-center text-lg"><i class="fa-solid fa-bell"></i></div>
                                <span class="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-lg text-[10px] font-bold">ដំណឹង</span>
                            </div>
                            <p class="text-slate-400 text-[11px] font-bold uppercase tracking-wider">សេចក្តីជូនដំណឹងថ្មី</p>
                            <p class="text-2xl font-black text-purple-600 mt-1">២ ដំណឹង</p>
                        </div>
                    </div>
                `;
            }

            // Quick Actions tailored to role
            let quickActionsHtml = '';
            if (role === 'super_admin' || role === 'admin') {
                quickActionsHtml = `
                    <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <h3 class="font-moul text-sm text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                            <i class="fa-solid fa-bolt text-amber-500"></i> សកម្មភាពរហ័ស (Admin Actions)
                        </h3>
                        <div class="grid grid-cols-2 gap-3 text-xs font-bold">
                            <button onclick="window.switchView('students')" class="p-3 bg-indigo-50/60 dark:bg-slate-700 hover:bg-indigo-100 dark:hover:bg-slate-600 text-indigo-700 dark:text-indigo-300 rounded-2xl flex flex-col items-center justify-center gap-2 transition">
                                <i class="fa-solid fa-user-plus text-lg"></i>
                                <span>ចុះឈ្មោះសិស្ស</span>
                            </button>
                            <button onclick="window.switchView('teachers')" class="p-3 bg-emerald-50/60 dark:bg-slate-700 hover:bg-emerald-100 dark:hover:bg-slate-600 text-emerald-700 dark:text-emerald-300 rounded-2xl flex flex-col items-center justify-center gap-2 transition">
                                <i class="fa-solid fa-user-tie text-lg"></i>
                                <span>ចាត់តាំងគ្រូ</span>
                            </button>
                            <button onclick="window.switchView('timetable')" class="p-3 bg-blue-50/60 dark:bg-slate-700 hover:bg-blue-100 dark:hover:bg-slate-600 text-blue-700 dark:text-blue-300 rounded-2xl flex flex-col items-center justify-center gap-2 transition">
                                <i class="fa-solid fa-calendar-alt text-lg"></i>
                                <span>កាលវិភាគ</span>
                            </button>
                            <button onclick="window.openAuditLogModal()" class="p-3 bg-purple-50/60 dark:bg-slate-700 hover:bg-purple-100 dark:hover:bg-slate-600 text-purple-700 dark:text-purple-300 rounded-2xl flex flex-col items-center justify-center gap-2 transition">
                                <i class="fa-solid fa-clock-rotate-left text-lg"></i>
                                <span>Audit Logs</span>
                            </button>
                        </div>
                    </div>
                `;
            } else {
                quickActionsHtml = `
                    <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <h3 class="font-moul text-sm text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                            <i class="fa-solid fa-bolt text-amber-500"></i> សកម្មភាពរហ័ស (Quick Actions)
                        </h3>
                        <div class="grid grid-cols-2 gap-3 text-xs font-bold">
                            <button onclick="window.switchView('attendance')" class="p-3 bg-emerald-50/60 dark:bg-slate-700 hover:bg-emerald-100 dark:hover:bg-slate-600 text-emerald-700 dark:text-emerald-300 rounded-2xl flex flex-col items-center justify-center gap-2 transition">
                                <i class="fa-solid fa-clipboard-user text-lg"></i>
                                <span>កត់វត្តមាន</span>
                            </button>
                            <button onclick="window.switchView('scores')" class="p-3 bg-amber-50/60 dark:bg-slate-700 hover:bg-amber-100 dark:hover:bg-slate-600 text-amber-700 dark:text-amber-300 rounded-2xl flex flex-col items-center justify-center gap-2 transition">
                                <i class="fa-solid fa-marker text-lg"></i>
                                <span>បញ្ចូលពិន្ទុ</span>
                            </button>
                            <button onclick="window.switchView('timetable')" class="p-3 bg-blue-50/60 dark:bg-slate-700 hover:bg-blue-100 dark:hover:bg-slate-600 text-blue-700 dark:text-blue-300 rounded-2xl flex flex-col items-center justify-center gap-2 transition">
                                <i class="fa-solid fa-calendar-check text-lg"></i>
                                <span>កាលវិភាគ</span>
                            </button>
                            <button onclick="window.switchView('reports')" class="p-3 bg-indigo-50/60 dark:bg-slate-700 hover:bg-indigo-100 dark:hover:bg-slate-600 text-indigo-700 dark:text-indigo-300 rounded-2xl flex flex-col items-center justify-center gap-2 transition">
                                <i class="fa-solid fa-file-invoice text-lg"></i>
                                <span>របាយការណ៍</span>
                            </button>
                        </div>
                    </div>
                `;
            }

            container.className = "p-2 md:p-6 transition-all duration-500 h-full w-full flex flex-col min-h-0 bg-slate-50 dark:bg-slate-900";
            container.innerHTML = `
                <div class="w-full h-full overflow-y-auto overflow-x-hidden custom-scrollbar relative z-10">
                    <div class="flex animate-fade-in flex-col font-siemreap text-slate-800 dark:text-slate-100 max-w-[1680px] mx-auto pb-20 px-1 md:px-2 pt-1 min-h-full space-y-6">
                        
                        <!-- Filter Bar -->
                        ${filterBarHtml}

                        <!-- Banner ស្វាគមន៍ -->
                        <div class="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 md:p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden border border-indigo-500/20">
                            <div class="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
                            <div class="absolute bottom-0 left-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl"></div>
                            
                            <div class="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                                <div>
                                    <div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-indigo-200 text-xs font-bold mb-3 border border-white/10">
                                        <i class="fa-solid fa-graduation-cap text-amber-400"></i> 
                                        <span>ឆ្នាំសិក្សា ${academicYear}</span> • <span>${selectedClass === 'all' ? 'ទូទាំងសាលារៀន' : selectedClass}</span>
                                    </div>
                                    <h2 class="text-2xl md:text-4xl font-moul mb-2 tracking-wide flex items-center gap-2">
                                        សួស្តី ${userName}! 👋
                                    </h2>
                                    <p class="text-indigo-200 text-sm md:text-base font-bold max-w-2xl leading-relaxed">
                                        ${role === 'super_admin' || role === 'admin' 
                                            ? "ផ្ទាំងគ្រប់គ្រងប្រព័ន្ធទូទាំងសាលា៖ វត្តមានប្រចាំថ្ងៃ លទ្ធផលសិក្សា គណនីបុគ្គលិក និងកំណត់ត្រាសុវត្ថិភាព" 
                                            : "របាយការណ៍សង្ខេបអំពីទិន្នន័យសិស្ស វត្តមានប្រចាំថ្ងៃ និងលទ្ធផលសិក្សាជាក់ស្តែងក្នុងថ្នាក់រៀន"}
                                    </p>
                                </div>
                                
                                <!-- នាឡិកា & កាលបរិច្ឆេទ -->
                                <div class="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 flex items-center gap-4 text-white shadow-inner">
                                    <div class="w-12 h-12 bg-indigo-500/30 rounded-xl flex items-center justify-center text-2xl text-amber-300">
                                        <i class="fa-regular fa-calendar-check"></i>
                                    </div>
                                    <div>
                                        <p class="text-xs text-indigo-200 font-bold uppercase tracking-wider">${dateStrKh}</p>
                                        <p class="text-2xl font-black font-mono tracking-widest text-white" id="dashClock">00:00:00</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- ជួរកាតស្ថិតិចម្បង (KPI Counters) -->
                        ${kpiCountersHtml}

                        <!-- ផ្នែកក្រាហ្វិកស្ថិតិ និងតារាងកិត្តិយស (Charts & Honor Roll) -->
                        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <!-- Chart: សមាសភាពសិស្ស និងវត្តមាន -->
                            <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between">
                                <div class="flex justify-between items-center mb-4">
                                    <h3 class="font-moul text-sm text-slate-800 dark:text-white flex items-center gap-2">
                                        <i class="fa-solid fa-chart-pie text-indigo-500"></i> សមាសភាពសិស្ស
                                    </h3>
                                    <span class="text-xs text-slate-400 font-bold">${totalStudents} នាក់</span>
                                </div>
                                <div class="relative h-60 flex items-center justify-center">
                                    <canvas id="chartStudentDemographics"></canvas>
                                </div>
                                <div class="flex justify-around text-center pt-4 border-t border-slate-100 dark:border-slate-700 text-xs font-bold">
                                    <div><span class="text-blue-500">●</span> ប្រុស: ${maleStudents}</div>
                                    <div><span class="text-pink-500">●</span> ស្រី: ${femaleStudents}</div>
                                    <div><span class="text-amber-500">●</span> ក្រីក្រ: ${poorStudents}</div>
                                </div>
                            </div>

                            <!-- Honor Roll: សិស្សឆ្នើមទាំង ៥ (Top 5 Students) -->
                            <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 lg:col-span-2 flex flex-col justify-between">
                                <div class="flex justify-between items-center mb-4">
                                    <div>
                                        <h3 class="font-moul text-sm text-slate-800 dark:text-white flex items-center gap-2">
                                            <i class="fa-solid fa-award text-amber-500"></i> តារាងកិត្តិយសសិស្សឆ្នើម (Honor Roll)
                                        </h3>
                                        <p class="text-xs text-slate-400 font-bold mt-0.5">ផ្អែកលើលទ្ធផលមធ្យមភាគ និងចំណាត់ថ្នាក់ខ្ពស់ជាងគេ</p>
                                    </div>
                                    <button onclick="window.switchView('scores')" class="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline">មើលពិន្ទុពេញលេញ →</button>
                                </div>

                                <div class="overflow-x-auto">
                                    <table class="w-full text-left text-xs font-siemreap">
                                        <thead>
                                            <tr class="border-b border-slate-100 dark:border-slate-700 text-slate-400 text-[11px] font-bold">
                                                <th class="py-2.5 px-3 text-center">ចំណាត់ថ្នាក់</th>
                                                <th class="py-2.5 px-3">ឈ្មោះសិស្ស</th>
                                                <th class="py-2.5 px-3 text-center">ភេទ</th>
                                                <th class="py-2.5 px-3 text-center">ពិន្ទុសរុប</th>
                                                <th class="py-2.5 px-3 text-center">មធ្យមភាគ</th>
                                                <th class="py-2.5 px-3 text-center">និទ្ទេស</th>
                                            </tr>
                                        </thead>
                                        <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
                                            ${honorStudents.length > 0 ? honorStudents.map((s, idx) => {
                                                const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`;
                                                return `
                                                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                                                        <td class="py-3 px-3 text-center font-bold text-sm">${medal}</td>
                                                        <td class="py-3 px-3 font-bold text-slate-800 dark:text-white font-moul text-xs">${s.name}</td>
                                                        <td class="py-3 px-3 text-center font-bold ${s.gender === 'ស្រី' ? 'text-pink-500' : 'text-blue-500'}">${s.gender || 'ស'}</td>
                                                        <td class="py-3 px-3 text-center font-mono font-bold">${s.total || '-'}</td>
                                                        <td class="py-3 px-3 text-center font-mono font-black text-indigo-600 dark:text-indigo-400 text-sm">${s.avg || '-'}</td>
                                                        <td class="py-3 px-3 text-center"><span class="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-lg font-bold">${s.grade_letter || 'ល្អ'}</span></td>
                                                    </tr>
                                                `;
                                            }).join('') : `
                                                <tr>
                                                    <td colspan="6" class="py-8 text-center text-slate-400 font-bold">មិនទាន់មានទិន្នន័យពិន្ទុសម្រាប់គណនាចំណាត់ថ្នាក់នៅឡើយទេ</td>
                                                </tr>
                                            `}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <!-- ជួរសកម្មភាពរហ័ស និង Audit Feed -->
                        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <!-- សកម្មភាពរហ័ស -->
                            ${quickActionsHtml}

                            <!-- កំណត់ត្រាសកម្មភាពចុងក្រោយ (Audit Feed) -->
                            <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 lg:col-span-2">
                                <div class="flex justify-between items-center mb-4">
                                    <div>
                                        <h3 class="font-moul text-sm text-slate-800 dark:text-white flex items-center gap-2">
                                            <i class="fa-solid fa-clock-rotate-left text-blue-500"></i> សកម្មភាពថ្មីៗក្នុងប្រព័ន្ធ (Audit Feed)
                                        </h3>
                                        <p class="text-xs text-slate-400 font-bold mt-0.5">កំណត់ត្រាសកម្មភាព និងការកែប្រែទិន្នន័យចុងក្រោយ</p>
                                    </div>
                                    <button onclick="window.openAuditLogModal()" class="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline">មើលទាំងអស់ →</button>
                                </div>

                                <div class="space-y-3">
                                    ${recentLogs.length > 0 ? recentLogs.map(l => {
                                        const timeStr = l.timestamp ? new Date(l.timestamp).toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit' }) : "";
                                        return `
                                            <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-2xl text-xs">
                                                <div class="flex items-center gap-3">
                                                    <div class="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-xs">
                                                        <i class="fa-solid fa-bolt"></i>
                                                    </div>
                                                    <div>
                                                        <p class="font-bold text-slate-800 dark:text-white">${l.details || l.action}</p>
                                                        <p class="text-[10px] text-slate-400">${l.teacher_name || 'ប្រព័ន្ធ'} • <span class="font-mono">${l.action}</span></p>
                                                    </div>
                                                </div>
                                                <span class="text-[10px] font-mono text-slate-400">${timeStr}</span>
                                            </div>
                                        `;
                                    }).join('') : `
                                        <div class="py-8 text-center text-slate-400 text-xs font-bold">
                                            មិនទាន់មានកំណត់ត្រាសកម្មភាពថ្មីៗនៅឡើយទេ
                                        </div>
                                    `}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            `;

            // ៨. គូរ Demographics Doughnut Chart
            if (typeof Chart !== 'undefined') {
                const ctx = document.getElementById('chartStudentDemographics');
                if (ctx) {
                    if (window.dashDemographicsChart) window.dashDemographicsChart.destroy();
                    window.dashDemographicsChart = new Chart(ctx, {
                        type: 'doughnut',
                        data: {
                            labels: ['សិស្សប្រុស', 'សិស្សស្រី', 'ប័ណ្ណក្រីក្រ'],
                            datasets: [{
                                data: [maleStudents || 1, femaleStudents || 1, poorStudents || 0],
                                backgroundColor: ['#3b82f6', '#ec4899', '#f59e0b'],
                                borderWidth: 0
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { display: false }
                            },
                            cutout: '70%'
                        }
                    });
                }
            }

            // ៩. ដំណើរការនាឡិកាឌីជីថល (Digital Clock)
            const clockEl = document.getElementById("dashClock");
            if (clockEl) {
                clearInterval(window.dashClockInterval);
                window.dashClockInterval = setInterval(() => {
                    const now = new Date();
                    const h = String(now.getHours()).padStart(2, '0');
                    const m = String(now.getMinutes()).padStart(2, '0');
                    const s = String(now.getSeconds()).padStart(2, '0');
                    clockEl.textContent = `${h}:${m}:${s}`;
                }, 1000);
            }

        } catch (error) {
            console.error("កំហុសក្នុងការគូរ Dynamic Dashboard:", error);
        }
    };

    /**
     * ដោះស្រាយការផ្លាស់ប្តូរ Filter នៅលើ Dashboard
     */
    window.handleDashboardFilterChange = function(filterKey, value) {
        window.DashboardFilterState[filterKey] = value;
        if (filterKey === 'academicYear') {
            localStorage.setItem('selected_academic_year', value);
            if (window.CMSEventBus) {
                window.CMSEventBus.emit(window.CMSEventTypes.ACADEMIC_YEAR_CHANGED, { academic_year: value });
            }
        }
        if (filterKey === 'selectedClass') {
            localStorage.setItem('dashboard_selected_class', value);
        }
        window.loadDashboard();
    };

    /**
     * Sync ជាមួយ Backend API ដើម្បីទាញយកស្ថិតិស្រស់ (Selective Refresh)
     */
    window.refreshDashboardData = async function() {
        if (typeof showToast === 'function') showToast("🔄 កំពុងទាញយកទិន្នន័យស្ថិតិស្រស់ពី Server...", "info");
        try {
            if (typeof window.apiGet === 'function') {
                const res = await window.apiGet('getDashboardStats', {
                    academic_year: window.DashboardFilterState.academicYear,
                    class: window.DashboardFilterState.selectedClass
                });
                if (res && res.status === 'success' && res.data) {
                    console.log("📊 Fresh dashboard stats received:", res.data);
                }
            }
        } catch(e) {
            console.warn("Backend dashboard stats sync note:", e);
        }
        window.loadDashboard();
        if (typeof showToast === 'function') showToast("✅ ស្ថិតិ Dashboard ត្រូវបានធ្វើបច្ចុប្បន្នភាពរួចរាល់!");
    };

    // Auto-listen to Central EventBus for reactive updates
    if (window.CMSEventBus && window.CMSEventTypes) {
        const refreshOnEvent = () => {
            if (window.currentActiveView === 'dashboard' || !window.currentActiveView) {
                window.loadDashboard();
            }
        };
        window.CMSEventBus.on(window.CMSEventTypes.STUDENT_ENROLLED, refreshOnEvent);
        window.CMSEventBus.on(window.CMSEventTypes.ATTENDANCE_RECORDED, refreshOnEvent);
        window.CMSEventBus.on(window.CMSEventTypes.SCORE_UPDATED, refreshOnEvent);
        window.CMSEventBus.on(window.CMSEventTypes.TIMETABLE_CHANGED, refreshOnEvent);
        window.CMSEventBus.on(window.CMSEventTypes.ACCOUNT_APPROVED, refreshOnEvent);
    }
})();
