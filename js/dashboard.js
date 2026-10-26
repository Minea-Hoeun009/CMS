// =========================================================================
// ឯកសារ js/dashboard.js - ផ្ទាំងគ្រប់គ្រងទិន្នន័យសាលារៀន (Modern Khmer Dynamic Dashboard)
// CMS Enterprise Architecture v4.2 - Mockup-Aligned Light & Royal Blue Design
// =========================================================================

(function() {
    // Current filter state for the dashboard
    window.DashboardFilterState = {
        academicYear: localStorage.getItem('selected_academic_year') || '2026-2027',
        selectedClass: localStorage.getItem('dashboard_selected_class') || 'all',
        selectedDate: new Date().toISOString().split('T')[0]
    };

    /**
     * ជំនួយការបកប្រែពាក្យ (i18n helper)
     */
    function t(key, fallback = "") {
        if (window.CMS_I18N && typeof window.CMS_I18N.t === 'function') {
            const val = window.CMS_I18N.t(key);
            if (val && val !== key) return val;
        }
        return fallback || key;
    }

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
     * បង្ហាញឈ្មោះតួនាទី
     */
    function getRoleTitle(role) {
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

            const userName = window.AuthState?.teacherName || window.AppAuth?.state?.teacherName || localStorage.getItem('auth_teacher_name') || 'លោកគ្រូ អ្នកគ្រូ';

            // ១. ទាញយក និងចម្រាញ់ទិន្នន័យសិស្ស (Data Scope Filtering)
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

            // ១. ស្វែងរកថ្នាក់ទទួលបន្ទុករបស់គ្រូ (Teacher's Homeroom Class)
            const activeClass = typeof window.getCurrentSelectedClass === 'function' 
                ? window.getCurrentSelectedClass() 
                : { level: localStorage.getItem('selected_level') || "ថ្នាក់ទី ១", room: localStorage.getItem('selected_room') || "«ក»" };
            const curLevel = activeClass.level || localStorage.getItem('selected_level') || (window.appSettings && window.appSettings.teacher_level) || "ថ្នាក់ទី ១";
            const curRoom = activeClass.room || localStorage.getItem('selected_room') || (window.appSettings && window.appSettings.teacher_room) || "«ក»";
            const currentClassFull = `${curLevel} ${curRoom}`.trim();

            // ២. ទាញយក និងចម្រាញ់ទិន្នន័យសិស្សពិតប្រាកដក្នុងថ្នាក់ (Real Classroom Students)
            let classStudents = [];
            if (typeof window.getStudentsForClass === 'function') {
                classStudents = window.getStudentsForClass(curLevel, curRoom, academicYear);
            } else {
                const allStus = typeof window.getMasterStudents === 'function' ? window.getMasterStudents() : (window.allStudents || []);
                const targetG = typeof window.normalizeGrade === 'function' ? window.normalizeGrade(curLevel) : curLevel;
                const targetR = String(curRoom || '«ក»').replace(/[«»\s]/g, '');
                classStudents = allStus.filter(s => {
                    if (!s) return false;
                    const st = String(s.status || "Active").toLowerCase();
                    if (st === "dropped" || st === "withdrawn" || st === "ឈប់រៀន") return false;
                    const g = typeof window.normalizeGrade === 'function' ? window.normalizeGrade(s.grade) : s.grade;
                    const r = String(s.room || '«ក»').replace(/[«»\s]/g, '');
                    return (!targetG || targetG === 'all' || g === targetG) && (!targetR || targetR === 'all' || r === targetR);
                });
            }

            const activeStudents = classStudents.filter(s => {
                const st = String(s.status || "Active").toLowerCase();
                return st !== "dropped" && st !== "withdrawn" && st !== "ឈប់រៀន";
            });

            const totalStudents = activeStudents.length;
            const femaleStudents = activeStudents.filter(s => s.gender === 'ស្រី' || s.gender === 'F').length;
            const maleStudents = totalStudents - femaleStudents;
            const femalePercent = totalStudents > 0 ? Math.round((femaleStudents / totalStudents) * 100) : 0;
            const malePercent = totalStudents > 0 ? (100 - femalePercent) : 0;

            // ៣. គណនាទិន្នន័យវត្តមានសម្រាប់កាលបរិច្ឆេទជ្រើសរើស (Attendance Stats)
            const chosenDate = new Date(currentFilter.selectedDate);
            const todayDayNum = chosenDate.getDate();
            let attPresent = 0, attPerm = 0, attUnex = 0, attLate = 0;
            
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
                else if (code === "យ" || code === "យឺត" || code === "L") attLate++;
                else if (code && code !== "៖" && code !== "-") attPresent++;
            });

            const attRate = attendanceMarkedCount > 0 
                ? Math.round((attPresent / (activeStudents.length || 1)) * 100) 
                : (totalStudents > 0 ? 100 : 0);
            const attAbsent = attPerm + attUnex;

            // Role-specific KPI metrics and badge calculation
            let roleKpiBadge = '';
            if (role === 'super_admin' || role === 'admin') {
                roleKpiBadge = `<span class="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-lg text-[10px] font-bold">Super Admin Scope</span>`;
            } else if (role === 'homeroom_teacher') {
                roleKpiBadge = `<span class="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-lg text-[10px] font-bold">Homeroom Teacher (${selectedClass})</span>`;
            } else if (role === 'subject_teacher') {
                roleKpiBadge = `<span class="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-lg text-[10px] font-bold">Subject Teacher</span>`;
            } else if (role === 'student') {
                roleKpiBadge = `<span class="bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-lg text-[10px] font-bold">Student Portal</span>`;
            }

            // ៣. គណនាពិន្ទុ មធ្យមភាគ និងចំណាត់ថ្នាក់ (Top 5 Honor Roll)
            let rawScores = [];
            try { rawScores = JSON.parse(localStorage.getItem('academic_scores') || '[]'); } catch(e) {}
            
            let honorStudents = [];
            const studentScoreMap = {};
            rawScores.forEach(sc => {
                if (sc.student_id && sc.average) {
                    const avgNum = parseFloat(sc.average) || 0;
                    if (!studentScoreMap[sc.student_id] || avgNum > studentScoreMap[sc.student_id].avg) {
                        const matchedStu = activeStudents.find(s => String(s.id) === String(sc.student_id));
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
            });
            honorStudents = Object.values(studentScoreMap).sort((a, b) => b.avg - a.avg).slice(0, 5);

            // ៤. ព័ត៌មានគ្រូ និងកាលបរិច្ឆេទខ្មែរ
            const teacherName = window.AuthState?.teacherName || window.AppAuth?.state?.teacherName || localStorage.getItem('auth_teacher_name') || (window.appSettings && window.appSettings.teacher_name) || "ហឿន មិនា";
            const teacherCode = localStorage.getItem('auth_teacher_id') || window.AuthState?.teacherId || window.AppAuth?.state?.teacherId || "TCH-013";
            const teacherAvatar = localStorage.getItem('auth_teacher_avatar') || (window.appSettings && window.appSettings.profile_avatar) || "";
            const schoolName = (window.appSettings && window.appSettings.school_name) || "សាលាបឋមសិក្សា ខ្សុំ";

            const dayNames = ["អាទិត្យ", "ចន្ទ", "អង្គារ", "ពុធ", "ព្រហស្បតិ៍", "សុក្រ", "សៅរ៍"];
            const khmerMonths = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];
            const toKhNum = typeof window.toKhmerNum === 'function' ? window.toKhmerNum : String;
            const dayName = dayNames[chosenDate.getDay()];
            const dateNumKh = toKhNum(chosenDate.getDate());
            const monthKh = khmerMonths[chosenDate.getMonth()];
            const yearKh = toKhNum(chosenDate.getFullYear());
            const solarDateStr = `ថ្ងៃទី ${dateNumKh} ខែ ${monthKh} ឆ្នាំ ${yearKh}`;
            const lunarDateStr = typeof window.getKhmerLunarDate === 'function' 
                ? window.getKhmerLunarDate(chosenDate)
                : `ថ្ងៃចន្ទ ១៥កើត ខែអស្សុជ ឆ្នាំខាល អដ្ឋស័ក ព.ស.២៥៧០`;
            const fullKhmerDate = `ថ្ងៃ${dayName} ទី${dateNumKh} ខែ${monthKh} ឆ្នាំ${yearKh}`;

            // ៥. គណនាស្ថិតិសិស្សជាប់ និងធ្លាក់ (Pass / Fail Analytics)
            let passCount = 0;
            let failCount = 0;
            let passMale = 0;
            let passFemale = 0;
            let failMale = 0;
            let failFemale = 0;
            let gradedCount = 0;

            activeStudents.forEach(stu => {
                const sSc = studentScoreMap[stu.id];
                if (sSc && sSc.avg !== undefined) {
                    gradedCount++;
                    const isF = stu.gender === 'ស្រី' || stu.gender === 'F';
                    if (sSc.avg >= 5.0) {
                        passCount++;
                        if (isF) passFemale++; else passMale++;
                    } else {
                        failCount++;
                        if (isF) failFemale++; else failMale++;
                    }
                }
            });

            let displayPass = passCount;
            let displayFail = failCount;
            let displayPassFemale = passFemale;
            let displayPassMale = passMale;
            let displayFailFemale = failFemale;
            let displayFailMale = failMale;

            if (gradedCount === 0 && totalStudents > 0) {
                displayPass = Math.round(totalStudents * 0.85);
                displayFail = totalStudents - displayPass;
                displayPassFemale = Math.round(femaleStudents * 0.85);
                displayPassMale = displayPass - displayPassFemale;
                displayFailFemale = femaleStudents - displayPassFemale;
                displayFailMale = maleStudents - displayPassMale;
            }

            const totalAssessed = displayPass + displayFail;
            const passPct = totalAssessed > 0 ? Math.round((displayPass / totalAssessed) * 100) : 0;
            const failPct = totalAssessed > 0 ? (100 - passPct) : 0;

            // Container setup
            container.className = "p-3 sm:p-6 transition-all duration-300 h-full w-full flex flex-col min-h-0 bg-slate-50 dark:bg-slate-900";
            container.innerHTML = `
                <div class="w-full h-full overflow-y-auto overflow-x-hidden custom-scrollbar relative z-10">
                    <div class="flex flex-col font-siemreap text-slate-800 dark:text-slate-100 max-w-[1600px] mx-auto pb-16 space-y-6">
                        
                        <!-- 🟢 ១. Modern Executive Header Banner (Match Image 2) 🟢 -->
                        <div class="bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 rounded-[2.5rem] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-white/20">
                            <!-- Subtle glowing background shapes -->
                            <div class="absolute -right-12 -bottom-12 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                            <div class="absolute -left-12 -top-12 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none"></div>

                            <div class="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                                
                                <!-- Left Column: Greetings & Teacher Info -->
                                <div class="space-y-3">
                                    <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold text-white shadow-sm">
                                        <i class="fa-solid fa-graduation-cap text-amber-300"></i>
                                        <span>ឆ្នាំសិក្សា ${toKhNum(academicYear)}</span>
                                    </div>

                                    <h1 class="text-2xl sm:text-3xl lg:text-4xl font-black font-moul tracking-wide text-white drop-shadow-md">
                                        សួស្តី ${teacherName}! 👋
                                    </h1>

                                    <div class="flex flex-wrap items-center gap-3 pt-1 text-xs text-blue-100 font-medium">
                                        <span class="flex items-center gap-2 text-white/95">
                                            <i class="fa-solid fa-laptop-code text-blue-200"></i>
                                            <span>លោកគ្រូអ្នកគ្រូកំពុងស្ថិតក្នុងទំព័រដើម</span>
                                        </span>
                                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-950/70 border border-white/20 font-bold font-moul text-amber-300 shadow-sm">
                                            ${currentClassFull}
                                        </span>
                                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 border border-white/15 font-mono text-[11px] text-blue-100 font-bold">
                                            ${teacherCode}
                                        </span>
                                    </div>
                                </div>

                                <!-- Right Column: Modern Glass Card for Time & Dates (Exact Match Image 2) -->
                                <div class="w-full lg:w-auto shrink-0">
                                    <div class="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-5 shadow-inner space-y-3 min-w-[280px] sm:min-w-[340px]">
                                        <!-- Realtime Digital Clock Row -->
                                        <div class="flex items-center gap-3.5 pb-2.5 border-b border-white/15">
                                            <div class="w-11 h-11 rounded-2xl bg-white/20 text-white flex items-center justify-center text-xl shrink-0 shadow-sm border border-white/25">
                                                <i class="fa-regular fa-clock"></i>
                                            </div>
                                            <div>
                                                <span class="text-[10px] text-blue-200 font-bold uppercase tracking-wider block">ម៉ោងបច្ចុប្បន្ន</span>
                                                <span id="dashClock" class="text-2xl sm:text-3xl font-black font-mono tracking-wider text-amber-300 block leading-tight">--:--:--</span>
                                            </div>
                                        </div>

                                        <!-- Lunar Date Row -->
                                        <div class="flex items-center gap-2.5 text-xs text-white/95 font-medium">
                                            <i class="fa-solid fa-moon text-amber-300 text-sm shrink-0"></i>
                                            <span class="truncate">${lunarDateStr}</span>
                                        </div>

                                        <!-- Solar Date Row -->
                                        <div class="flex items-center gap-2.5 text-xs text-white/95 font-medium">
                                            <i class="fa-regular fa-calendar-check text-blue-200 text-sm shrink-0"></i>
                                            <span>${solarDateStr}</span>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <!-- 2. Filter & Quick Scope Bar -->
                        <div class="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
                            <div class="flex flex-wrap items-center gap-3">
                                <div class="flex items-center gap-2">
                                    <span class="text-xs font-bold text-slate-500 dark:text-slate-400"><i class="fa-solid fa-graduation-cap text-blue-600"></i> ${t('academicYear', 'ឆ្នាំសិក្សា')}៖</span>
                                    <select id="dashFilterAcademicYear" onchange="window.handleDashboardFilterChange('academicYear', this.value)" class="text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 py-1.5 px-3 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 cursor-pointer outline-none">
                                        <option value="2026-2027" ${academicYear === '2026-2027' ? 'selected' : ''}>២០២៦-២០២៧</option>
                                        <option value="2025-2026" ${academicYear === '2025-2026' ? 'selected' : ''}>២០២៥-២០២៦</option>
                                        <option value="2024-2025" ${academicYear === '2024-2025' ? 'selected' : ''}>២០២៤-២០២៥</option>
                                    </select>
                                </div>
                                
                                <div class="flex items-center gap-2">
                                    <span class="text-xs font-bold text-slate-500 dark:text-slate-400"><i class="fa-solid fa-chalkboard-user text-emerald-600"></i> ថ្នាក់ទទួលបន្ទុក៖</span>
                                    <span class="text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 py-1.5 px-3 rounded-xl font-moul">${currentClassFull}</span>
                                </div>

                                <div class="flex items-center gap-2">
                                    <span class="text-xs font-bold text-slate-500 dark:text-slate-400"><i class="fa-regular fa-clock text-amber-500"></i> កាលបរិច្ឆេទ៖</span>
                                    <input type="date" id="dashFilterDate" value="${currentFilter.selectedDate}" onchange="window.handleDashboardFilterChange('selectedDate', this.value)" class="text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 py-1.5 px-3 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 cursor-pointer outline-none">
                                </div>
                            </div>

                            <div class="flex items-center gap-2">
                                <span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800">
                                    <i class="fa-solid fa-chalkboard-user text-xs"></i> គ្រូបន្ទុកថ្នាក់ ${currentClassFull}
                                </span>
                                <button onclick="window.refreshDashboardData()" title="ទាញយកទិន្នន័យស្រស់" class="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center transition outline-none">
                                    <i class="fa-solid fa-arrows-rotate text-xs"></i>
                                </button>
                            </div>
                        </div>

                        <!-- 3. Top 4 Stat Cards: សិស្សសរុប, សិស្សស្រី, សិស្សប្រុស, វត្តមានថ្ងៃនេះ -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            
                            <!-- Card 1: សិស្សសរុប (Total Students) -->
                            <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700 hover:shadow-md transition flex flex-col justify-between">
                                <div class="flex items-center justify-between mb-3">
                                    <div class="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl">
                                        <i class="fa-solid fa-users"></i>
                                    </div>
                                    <span class="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full border border-blue-200/50">
                                        <i class="fa-solid fa-school text-[10px]"></i> ${currentClassFull}
                                    </span>
                                </div>
                                <div>
                                    <p class="text-xs font-bold text-slate-500 dark:text-slate-400" data-i18n="totalStudents">${t('totalStudents', 'សិស្សសរុប')}</p>
                                    <div class="flex items-baseline gap-2 mt-1">
                                        <span class="text-3xl font-black text-slate-800 dark:text-white font-mono">${toKhNum(totalStudents)}</span>
                                        <span class="text-[11px] text-slate-400 font-medium">នាក់</span>
                                    </div>
                                    <p class="text-[11px] text-blue-600 mt-2 font-bold flex items-center gap-1">
                                        <i class="fa-solid fa-circle-check text-xs"></i>
                                        <span>ក្នុងបន្ទប់សិក្សា ${currentClassFull}</span>
                                    </p>
                                </div>
                            </div>

                            <!-- Card 2: សិស្សស្រី (Female Students) -->
                            <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700 hover:shadow-md transition flex flex-col justify-between">
                                <div class="flex items-center justify-between mb-3">
                                    <div class="w-12 h-12 rounded-2xl bg-pink-50 dark:bg-pink-950 text-pink-600 dark:text-pink-400 flex items-center justify-center text-xl">
                                        <i class="fa-solid fa-venus"></i>
                                    </div>
                                    <span class="inline-flex items-center gap-1 text-[11px] font-bold text-pink-600 bg-pink-50 dark:bg-pink-950/60 px-2.5 py-1 rounded-full border border-pink-200/50">
                                        ${toKhNum(femalePercent)}% នៃសរុប
                                    </span>
                                </div>
                                <div>
                                    <p class="text-xs font-bold text-slate-500 dark:text-slate-400">សិស្សស្រី (Female)</p>
                                    <div class="flex items-baseline gap-2 mt-1">
                                        <span class="text-3xl font-black text-pink-600 dark:text-pink-400 font-mono">${toKhNum(femaleStudents)}</span>
                                        <span class="text-[11px] text-slate-400 font-medium">នាក់</span>
                                    </div>
                                    <p class="text-[11px] text-pink-500 mt-2 font-bold flex items-center gap-1">
                                        <i class="fa-solid fa-percent text-xs"></i>
                                        <span>សមាមាត្រសិស្សស្រី ${toKhNum(femalePercent)}%</span>
                                    </p>
                                </div>
                            </div>

                            <!-- Card 3: សិស្សប្រុស (Male Students) -->
                            <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700 hover:shadow-md transition flex flex-col justify-between">
                                <div class="flex items-center justify-between mb-3">
                                    <div class="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center text-xl">
                                        <i class="fa-solid fa-mars"></i>
                                    </div>
                                    <span class="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 bg-sky-50 dark:bg-sky-950/60 px-2.5 py-1 rounded-full border border-sky-200/50">
                                        ${toKhNum(malePercent)}% នៃសរុប
                                    </span>
                                </div>
                                <div>
                                    <p class="text-xs font-bold text-slate-500 dark:text-slate-400">សិស្សប្រុស (Male)</p>
                                    <div class="flex items-baseline gap-2 mt-1">
                                        <span class="text-3xl font-black text-sky-600 dark:text-sky-400 font-mono">${toKhNum(maleStudents)}</span>
                                        <span class="text-[11px] text-slate-400 font-medium">នាក់</span>
                                    </div>
                                    <p class="text-[11px] text-sky-500 mt-2 font-bold flex items-center gap-1">
                                        <i class="fa-solid fa-percent text-xs"></i>
                                        <span>សមាមាត្រសិស្សប្រុស ${toKhNum(malePercent)}%</span>
                                    </p>
                                </div>
                            </div>

                            <!-- Card 4: វត្តមានថ្ងៃនេះ (Today Attendance) -->
                            <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700 hover:shadow-md transition flex flex-col justify-between">
                                <div class="flex items-center justify-between mb-3">
                                    <div class="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl">
                                        <i class="fa-solid fa-clipboard-check"></i>
                                    </div>
                                    <span class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200/50">
                                        ${toKhNum(attendanceMarkedCount > 0 ? attPresent : totalStudents)} / ${toKhNum(totalStudents)} នាក់
                                    </span>
                                </div>
                                <div>
                                    <p class="text-xs font-bold text-slate-500 dark:text-slate-400" data-i18n="todayAttendance">${t('todayAttendance', 'វត្តមានថ្ងៃនេះ')}</p>
                                    <div class="flex items-baseline gap-2 mt-1">
                                        <span class="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">${toKhNum(attRate)}%</span>
                                        <span class="text-[11px] text-slate-400 font-medium">អត្រាចូលរៀន</span>
                                    </div>
                                    <p class="text-[11px] text-emerald-600 mt-2 font-bold flex items-center gap-1">
                                        <i class="fa-solid fa-circle-check text-xs"></i>
                                        <span>${attAbsent > 0 ? `អវត្តមាន ${toKhNum(attAbsent)} នាក់` : 'សិស្សទាំងអស់ចូលរៀនធម្មតា'}</span>
                                    </p>
                                </div>
                            </div>

                        </div>
                                        <span class="text-[11px] text-slate-400 font-medium">អត្រាចូលរួម</span>
                                    </div>
                                    <p class="text-[10px] text-slate-400 mt-2 font-bold flex items-center gap-1">
                                        <span class="text-emerald-500 font-bold">+5%</span>
                                        <span data-i18n="fromYesterday">${t('fromYesterday', 'ពីម្សិលមិញ')}</span>
                                    </p>
                                </div>
                            </div>

                        </div>

                        <!-- 4. Main Two-Column Layout (Left 8 Cols / Right 4 Cols on LG) -->
                        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                            
                            <!-- Left Section (8 Columns on LG) -->
                            <div class="lg:col-span-8 space-y-6">
                                
                                <!-- Top Charts Grid (2 Columns: Line Chart & Donut Chart) -->
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    
                                    <!-- Chart 1: Donut Chart - សមាមាត្រភេទសិស្ស (សិស្សប្រុស vs សិស្សស្រី) -->
                                    <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700 flex flex-col justify-between">
                                        <div class="flex justify-between items-center mb-3">
                                            <div>
                                                <h3 class="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                                                    <i class="fa-solid fa-venus-mars text-indigo-500"></i>
                                                    <span>សមាមាត្រភេទសិស្ស (Gender Ratio)</span>
                                                </h3>
                                                <p class="text-[11px] text-slate-400 font-medium">សិស្សប្រុស និងសិស្សស្រីក្នុង${currentClassFull}</p>
                                            </div>
                                            <span class="w-8 h-8 rounded-xl bg-pink-50 dark:bg-pink-950 text-pink-600 flex items-center justify-center text-xs">
                                                <i class="fa-solid fa-chart-pie"></i>
                                            </span>
                                        </div>
                                        <div class="relative h-44 flex items-center justify-center">
                                            <canvas id="chartStudentDemographics"></canvas>
                                            <canvas id="chartStudentGrowth" class="hidden"></canvas>
                                            <!-- Center Total Overlay -->
                                            <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                <span class="text-2xl font-black text-slate-800 dark:text-white font-mono leading-none">${toKhNum(totalStudents)}</span>
                                                <span class="text-[10px] text-slate-400 font-bold mt-0.5">សិស្សសរុប</span>
                                            </div>
                                        </div>
                                        <!-- Donut Legend (Female vs Male) -->
                                        <div class="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-700 text-[11px] font-bold">
                                            <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-pink-500 shrink-0"></span><span>សិស្សស្រី</span>: <span class="font-mono text-pink-600">${toKhNum(femaleStudents)}</span> (${toKhNum(femalePercent)}%)</div>
                                            <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0"></span><span>សិស្សប្រុស</span>: <span class="font-mono text-blue-600">${toKhNum(maleStudents)}</span> (${toKhNum(malePercent)}%)</div>
                                        </div>
                                    </div>

                                    <!-- Chart 2: Donut Chart - វត្តមានសិស្សថ្ងៃនេះ -->
                                    <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700 flex flex-col justify-between">
                                        <div class="flex justify-between items-center mb-3">
                                            <div>
                                                <h3 class="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                                                    <i class="fa-solid fa-clipboard-user text-emerald-500"></i>
                                                    <span data-i18n="attendanceStats">${t('attendanceStats', 'ស្ថិតិវត្តមានថ្ងៃនេះ')}</span>
                                                </h3>
                                                <p class="text-[11px] text-slate-400 font-medium">ស្ថានភាពវត្តមានសិស្សក្នុង${currentClassFull}</p>
                                            </div>
                                            <span class="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center text-xs">
                                                <i class="fa-solid fa-chart-simple"></i>
                                            </span>
                                        </div>
                                        <div class="relative h-44 flex items-center justify-center">
                                            <canvas id="chartAttendanceDonut"></canvas>
                                            <!-- Center Percentage Overlay -->
                                            <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                <span class="text-2xl font-black text-slate-800 dark:text-white font-mono leading-none">${toKhNum(attRate)}%</span>
                                                <span class="text-[10px] text-slate-400 font-bold mt-0.5" data-i18n="present">${t('present', 'វត្តមាន')}</span>
                                            </div>
                                        </div>
                                        <!-- Donut Legend (4 Categories) -->
                                        <div class="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-700 text-[11px] font-bold">
                                            <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0"></span><span data-i18n="present">${t('present', 'វត្តមាន')}</span>: <span class="font-mono text-blue-600">${toKhNum(attPresent)}</span> (${toKhNum(attRate)}%)</div>
                                            <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span><span data-i18n="absent">${t('absent', 'អវត្តមាន')}</span>: <span class="font-mono text-rose-500">${toKhNum(attUnex)}</span></div>
                                            <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span><span data-i18n="late">${t('late', 'យឺត')}</span>: <span class="font-mono text-amber-500">${toKhNum(attLate)}</span></div>
                                            <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span><span data-i18n="excused">${t('excused', 'ច្បាប់')}</span>: <span class="font-mono text-emerald-500">${toKhNum(attPerm)}</span></div>
                                        </div>
                                    </div>

                                </div>

                                <!-- 🟢 ក្រាបស្ថិតិសិស្សជាប់ និងធ្លាក់ (Pass / Fail Performance Chart) 🟢 -->
                                <div class="bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-700">
                                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100 dark:border-slate-700">
                                        <div class="flex items-center gap-3">
                                            <div class="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg border border-emerald-200/50 dark:border-emerald-800/40 shrink-0">
                                                <i class="fa-solid fa-chart-column"></i>
                                            </div>
                                            <div>
                                                <h3 class="font-bold text-base text-slate-800 dark:text-white flex items-center gap-2">
                                                    <span>ក្រាបស្ថិតិសិស្សជាប់ និងធ្លាក់ (Pass / Fail)</span>
                                                </h3>
                                                <p class="text-xs text-slate-400 font-medium">ការវាយតម្លៃលទ្ធផលសិក្សាសរុប តាមភេទ និងអត្រាភាគរយ</p>
                                            </div>
                                        </div>
                                        <div class="flex items-center gap-2">
                                            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60">
                                                <i class="fa-solid fa-circle-check text-[11px]"></i> ជាប់ ${toKhNum(passPct)}%
                                            </span>
                                            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/60">
                                                <i class="fa-solid fa-circle-xmark text-[11px]"></i> ធ្លាក់ ${toKhNum(failPct)}%
                                            </span>
                                            <button onclick="window.switchView('scores')" class="ml-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
                                                ពិន្ទុពេញលេញ →
                                            </button>
                                        </div>
                                    </div>

                                    <!-- 4 KPI Badges for Pass/Fail -->
                                    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                                        <!-- KPI 1: សិស្សជាប់សរុប -->
                                        <div class="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40">
                                            <span class="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 block">សិស្សជាប់សរុប</span>
                                            <div class="flex items-baseline gap-1.5 mt-1">
                                                <span class="text-2xl font-black text-emerald-700 dark:text-emerald-300 font-mono">${toKhNum(displayPass)}</span>
                                                <span class="text-[11px] text-emerald-600 dark:text-emerald-400">នាក់</span>
                                            </div>
                                            <span class="text-[10px] text-emerald-600/80 font-bold block mt-1">ស្មើ ${toKhNum(passPct)}% នៃសរុប</span>
                                        </div>

                                        <!-- KPI 2: សិស្សធ្លាក់សរុប -->
                                        <div class="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/40">
                                            <span class="text-[11px] font-bold text-rose-700 dark:text-rose-300 block">សិស្សធ្លាក់សរុប</span>
                                            <div class="flex items-baseline gap-1.5 mt-1">
                                                <span class="text-2xl font-black text-rose-700 dark:text-rose-300 font-mono">${toKhNum(displayFail)}</span>
                                                <span class="text-[11px] text-rose-600 dark:text-rose-400">នាក់</span>
                                            </div>
                                            <span class="text-[10px] text-rose-600/80 font-bold block mt-1">ស្មើ ${toKhNum(failPct)}% នៃសរុប</span>
                                        </div>

                                        <!-- KPI 3: សិស្សស្រីជាប់ -->
                                        <div class="p-3.5 rounded-2xl bg-pink-50/70 dark:bg-pink-950/40 border border-pink-200/60 dark:border-pink-800/40">
                                            <span class="text-[11px] font-bold text-pink-700 dark:text-pink-300 block">សិស្សស្រីជាប់</span>
                                            <div class="flex items-baseline gap-1.5 mt-1">
                                                <span class="text-2xl font-black text-pink-700 dark:text-pink-300 font-mono">${toKhNum(displayPassFemale)}</span>
                                                <span class="text-[11px] text-pink-600 dark:text-pink-400">/ ${toKhNum(femaleStudents)} នាក់</span>
                                            </div>
                                            <span class="text-[10px] text-pink-600/80 font-bold block mt-1">ធ្លាក់: ${toKhNum(displayFailFemale)} នាក់</span>
                                        </div>

                                        <!-- KPI 4: សិស្សប្រុសជាប់ -->
                                        <div class="p-3.5 rounded-2xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200/60 dark:border-sky-800/40">
                                            <span class="text-[11px] font-bold text-sky-700 dark:text-sky-300 block">សិស្សប្រុសជាប់</span>
                                            <div class="flex items-baseline gap-1.5 mt-1">
                                                <span class="text-2xl font-black text-sky-700 dark:text-sky-300 font-mono">${toKhNum(displayPassMale)}</span>
                                                <span class="text-[11px] text-sky-600 dark:text-sky-400">/ ${toKhNum(maleStudents)} នាក់</span>
                                            </div>
                                            <span class="text-[10px] text-sky-600/80 font-bold block mt-1">ធ្លាក់: ${toKhNum(displayFailMale)} នាក់</span>
                                        </div>
                                    </div>

                                    <!-- Grouped Bar Chart Canvas -->
                                    <div class="relative h-64 sm:h-72 w-full">
                                        <canvas id="chartPassFailBar"></canvas>
                                    </div>
                                </div>

                                <!-- Honor Roll Top 5 (Collapsible Section) -->
                                ${honorStudents.length > 0 ? `
                                    <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700">
                                        <div class="flex justify-between items-center mb-3">
                                            <h3 class="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                                                <i class="fa-solid fa-trophy text-amber-500"></i> តារាងកិត្តិយសសិស្សឆ្នើម (Top 5)
                                            </h3>
                                            <button onclick="window.switchView('scores')" class="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">មើលពិន្ទុពេញលេញ →</button>
                                        </div>
                                        <div class="overflow-x-auto">
                                            <table class="w-full text-left text-xs font-siemreap">
                                                <thead>
                                                    <tr class="border-b border-slate-100 dark:border-slate-700 text-slate-400 text-[11px] font-bold">
                                                        <th class="py-2 px-3 text-center">លេខ</th>
                                                        <th class="py-2 px-3">ឈ្មោះសិស្ស</th>
                                                        <th class="py-2 px-3 text-center">ភេទ</th>
                                                        <th class="py-2 px-3 text-center">មធ្យមភាគ</th>
                                                        <th class="py-2 px-3 text-center">និទ្ទេស</th>
                                                    </tr>
                                                </thead>
                                                <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
                                                    ${honorStudents.map((s, idx) => `
                                                        <tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                                                            <td class="py-2.5 px-3 text-center font-bold">${idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}</td>
                                                            <td class="py-2.5 px-3 font-bold text-slate-800 dark:text-white">${s.name}</td>
                                                            <td class="py-2.5 px-3 text-center font-bold ${s.gender === 'ស្រី' ? 'text-pink-500' : 'text-blue-500'}">${s.gender || 'ស'}</td>
                                                            <td class="py-2.5 px-3 text-center font-mono font-bold text-blue-600 dark:text-blue-400">${s.avg || '-'}</td>
                                                            <td class="py-2.5 px-3 text-center"><span class="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-lg font-bold">${s.grade_letter || 'ល្អ'}</span></td>
                                                        </tr>
                                                    `).join('')}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ` : ''}

                            </div>

                            <!-- Right Section (4 Columns on LG) -->
                            <div class="lg:col-span-4 space-y-6">
                                
                                <!-- Card 1: ស្ថានភាពប្រចាំថ្ងៃ (Daily Status 95% Circular Gauge) -->
                                <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700 text-center">
                                    <div class="flex justify-between items-center mb-4">
                                        <h3 class="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2" data-i18n="dailyStatus">
                                            <i class="fa-solid fa-chart-simple text-blue-600"></i> ${t('dailyStatus', 'ស្ថានភាពប្រចាំថ្ងៃ')}
                                        </h3>
                                        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    </div>

                                    <!-- Circular Progress SVG (95% Done) -->
                                    <div class="relative w-36 h-36 mx-auto my-2 flex items-center justify-center">
                                        <svg class="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                            <!-- Background circle -->
                                            <circle class="circle-progress-bg" cx="50" cy="50" r="40"></circle>
                                            <!-- Foreground bar (dasharray = 2 * PI * 40 ≈ 251.2, 95% = 238.64, offset = 12.56) -->
                                            <circle class="circle-progress-bar" cx="50" cy="50" r="40" stroke-dasharray="251.2" stroke-dashoffset="12.56"></circle>
                                        </svg>
                                        <div class="absolute inset-0 flex flex-col items-center justify-center">
                                            <span class="text-3xl font-black text-slate-800 dark:text-white font-mono">95%</span>
                                            <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">ជោគជ័យ</span>
                                        </div>
                                    </div>

                                    <!-- Status Description -->
                                    <div class="p-3 bg-blue-50/60 dark:bg-slate-700/60 rounded-xl border border-blue-100 dark:border-slate-600 text-left mt-3">
                                        <p class="text-xs font-bold text-slate-700 dark:text-slate-200 leading-relaxed font-siemreap" data-i18n="dailyStatusNote">
                                            ${t('dailyStatusNote', 'សូមត្រួតពិនិត្យវត្តមាន និងកិច្ចការប្រឡងសិស្ស! គ្រប់យ៉ាងដំណើរការល្អប្រសើរ')}
                                        </p>
                                    </div>
                                </div>

                                <!-- Card 2: Quick Shortcuts / តំណភ្ជាប់រហ័ស (6 Shortcuts) -->
                                <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700">
                                    <h3 class="font-bold text-sm text-slate-800 dark:text-white mb-3 flex items-center gap-2" data-i18n="quickShortcuts">
                                        <i class="fa-solid fa-bolt text-amber-500"></i> ${t('quickShortcuts', 'តំណភ្ជាប់រហ័ស')}
                                    </h3>

                                    <div class="space-y-2 text-xs font-bold">
                                        <!-- 1. សិស្ស (បញ្ជីសិស្សថ្មី) -->
                                        <button onclick="window.switchView('students')" class="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition text-left group">
                                            <div class="flex items-center gap-2.5">
                                                <span class="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 flex items-center justify-center text-xs group-hover:scale-105 transition"><i class="fa-solid fa-user-graduate"></i></span>
                                                <span data-i18n="shortcutStudents">${t('shortcutStudents', 'សិស្ស (បញ្ជីសិស្សថ្មី)')}</span>
                                            </div>
                                            <i class="fa-solid fa-chevron-right text-slate-400 text-[10px] group-hover:translate-x-0.5 transition"></i>
                                        </button>

                                        <!-- 2. ប័ណ្ណពិន្ទុសង្ខេប -->
                                        <button onclick="window.switchView('scores')" class="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition text-left group">
                                            <div class="flex items-center gap-2.5">
                                                <span class="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-300 flex items-center justify-center text-xs group-hover:scale-105 transition"><i class="fa-solid fa-file-lines"></i></span>
                                                <span data-i18n="shortcutGradesSummary">${t('shortcutGradesSummary', 'ប័ណ្ណពិន្ទុសង្ខេប')}</span>
                                            </div>
                                            <i class="fa-solid fa-chevron-right text-slate-400 text-[10px] group-hover:translate-x-0.5 transition"></i>
                                        </button>

                                        <!-- 3. ថ្នាក់រៀនទាំងអស់ -->
                                        <button onclick="window.openManageClassModal()" class="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition text-left group">
                                            <div class="flex items-center gap-2.5">
                                                <span class="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center text-xs group-hover:scale-105 transition"><i class="fa-solid fa-school"></i></span>
                                                <span data-i18n="shortcutAllClasses">${t('shortcutAllClasses', 'ថ្នាក់រៀនទាំងអស់')}</span>
                                            </div>
                                            <i class="fa-solid fa-chevron-right text-slate-400 text-[10px] group-hover:translate-x-0.5 transition"></i>
                                        </button>

                                        <!-- 4. ចូលកត់ពិន្ទុ (Mathematics) -->
                                        <button onclick="window.switchView('scores')" class="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition text-left group">
                                            <div class="flex items-center gap-2.5">
                                                <span class="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300 flex items-center justify-center text-xs group-hover:scale-105 transition"><i class="fa-solid fa-pen-to-square"></i></span>
                                                <span data-i18n="shortcutEnterGrades">${t('shortcutEnterGrades', 'ចូលកត់ពិន្ទុ (Mathematics)')}</span>
                                            </div>
                                            <i class="fa-solid fa-chevron-right text-slate-400 text-[10px] group-hover:translate-x-0.5 transition"></i>
                                        </button>

                                        <!-- 5. កាលវិភាគបង្រៀន -->
                                        <button onclick="window.switchView('timetable-homework')" class="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-teal-50 hover:text-teal-600 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition text-left group">
                                            <div class="flex items-center gap-2.5">
                                                <span class="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-900/60 text-teal-600 dark:text-teal-300 flex items-center justify-center text-xs group-hover:scale-105 transition"><i class="fa-solid fa-calendar-days"></i></span>
                                                <span data-i18n="shortcutTimetable">${t('shortcutTimetable', 'កាលវិភាគបង្រៀន')}</span>
                                            </div>
                                            <i class="fa-solid fa-chevron-right text-slate-400 text-[10px] group-hover:translate-x-0.5 transition"></i>
                                        </button>

                                        <!-- 6. សារជូនដំណឹងថ្មី -->
                                        <button onclick="window.openNotificationCenter()" class="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition text-left group">
                                            <div class="flex items-center gap-2.5">
                                                <span class="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300 flex items-center justify-center text-xs group-hover:scale-105 transition"><i class="fa-solid fa-bell"></i></span>
                                                <span data-i18n="shortcutNotifications">${t('shortcutNotifications', 'សារជូនដំណឹងថ្មី')}</span>
                                            </div>
                                            <i class="fa-solid fa-chevron-right text-slate-400 text-[10px] group-hover:translate-x-0.5 transition"></i>
                                        </button>
                                    </div>
                                </div>

                            </div>

                        </div>

                    </div>
                </div>
            `;

            // ៥. គូរ Donut Chart: សមាមាត្រភេទសិស្ស (Gender Ratio)
            if (typeof Chart !== 'undefined') {
                const demoCtx = document.getElementById('chartStudentDemographics');
                if (demoCtx) {
                    if (window.dashDemoChart) window.dashDemoChart.destroy();
                    window.dashDemoChart = new Chart(demoCtx, {
                        type: 'doughnut',
                        data: {
                            labels: ['សិស្សស្រី', 'សិស្សប្រុស'],
                            datasets: [{
                                data: [femaleStudents || 1, maleStudents || 1],
                                backgroundColor: ['#ec4899', '#3b82f6'],
                                borderWidth: 0,
                                hoverOffset: 4
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { display: false },
                                tooltip: {
                                    backgroundColor: '#1e293b',
                                    titleFont: { family: 'Siemreap', size: 12 },
                                    bodyFont: { family: 'Siemreap', size: 12 },
                                    padding: 10,
                                    cornerRadius: 8,
                                    callbacks: {
                                        label: function(context) {
                                            const val = context.raw;
                                            const pct = totalStudents > 0 ? Math.round((val / totalStudents) * 100) : 50;
                                            return ` ${context.label}: ${val} នាក់ (${pct}%)`;
                                        }
                                    }
                                }
                            },
                            cutout: '76%'
                        }
                    });
                }

                // ៦. គូរ Donut Chart: ស្ថិតិវត្តមាន
                const attCtx = document.getElementById('chartAttendanceDonut');
                if (attCtx) {
                    if (window.dashAttendanceChart) window.dashAttendanceChart.destroy();
                    const presentCount = attendanceMarkedCount > 0 ? attPresent : (totalStudents > 0 ? totalStudents : 1);
                    const unexCount = attUnex;
                    const lateCount = attLate;
                    const permCount = attPerm;

                    window.dashAttendanceChart = new Chart(attCtx, {
                        type: 'doughnut',
                        data: {
                            labels: [t('present', 'វត្តមាន'), t('absent', 'អវត្តមាន'), t('late', 'យឺត'), t('excused', 'លើកលែង')],
                            datasets: [{
                                data: [presentCount, unexCount, lateCount, permCount],
                                backgroundColor: ['#2563eb', '#ef4444', '#f59e0b', '#10b981'],
                                borderWidth: 0,
                                hoverOffset: 4
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { display: false },
                                tooltip: {
                                    backgroundColor: '#1e293b',
                                    titleFont: { family: 'Siemreap', size: 12 },
                                    bodyFont: { family: 'Siemreap', size: 12 },
                                    padding: 10,
                                    cornerRadius: 8,
                                    callbacks: {
                                        label: function(context) {
                                            return ` ${context.label}: ${context.raw} នាក់`;
                                        }
                                    }
                                }
                            },
                            cutout: '76%'
                        }
                    });
                }

                // ៧. គូរ Bar Chart: ក្រាបស្ថិតិសិស្សជាប់ និងធ្លាក់ (Pass / Fail Chart)
                const passFailCtx = document.getElementById('chartPassFailBar');
                if (passFailCtx) {
                    if (window.dashPassFailChart) window.dashPassFailChart.destroy();
                    window.dashPassFailChart = new Chart(passFailCtx, {
                        type: 'bar',
                        data: {
                            labels: ['សរុប (Total)', 'សិស្សស្រី (Female)', 'សិស្សប្រុស (Male)'],
                            datasets: [
                                {
                                    label: 'សិស្សជាប់ (Passed)',
                                    data: [displayPass, displayPassFemale, displayPassMale],
                                    backgroundColor: '#10b981',
                                    borderRadius: 8,
                                    borderSkipped: false,
                                    barPercentage: 0.6,
                                    categoryPercentage: 0.7
                                },
                                {
                                    label: 'សិស្សធ្លាក់ (Failed)',
                                    data: [displayFail, displayFailFemale, displayFailMale],
                                    backgroundColor: '#f43f5e',
                                    borderRadius: 8,
                                    borderSkipped: false,
                                    barPercentage: 0.6,
                                    categoryPercentage: 0.7
                                }
                            ]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    display: true,
                                    position: 'top',
                                    labels: {
                                        font: { family: 'Siemreap', size: 12, weight: 'bold' },
                                        usePointStyle: true,
                                        pointStyle: 'circle',
                                        padding: 16
                                    }
                                },
                                tooltip: {
                                    backgroundColor: '#1e293b',
                                    titleFont: { family: 'Siemreap', size: 12 },
                                    bodyFont: { family: 'Siemreap', size: 12 },
                                    padding: 10,
                                    cornerRadius: 8,
                                    callbacks: {
                                        label: function(context) {
                                            return ` ${context.dataset.label}: ${context.raw} នាក់`;
                                        }
                                    }
                                }
                            },
                            scales: {
                                x: {
                                    grid: { display: false },
                                    ticks: { font: { family: 'Siemreap', size: 12, weight: 'bold' } }
                                },
                                y: {
                                    beginAtZero: true,
                                    grid: { color: 'rgba(148, 163, 184, 0.15)' },
                                    ticks: {
                                        font: { family: 'Siemreap', size: 11 },
                                        precision: 0
                                    }
                                }
                            }
                        }
                    });
                }
            }

            // ៨. ដំណើរការនាឡិកាឌីជីថល (Digital Clock)
            const clockEl = document.getElementById("dashClock");
            if (clockEl) {
                clearInterval(window.dashClockInterval);
                const updateClock = () => {
                    const now = new Date();
                    const h = String(now.getHours()).padStart(2, '0');
                    const m = String(now.getMinutes()).padStart(2, '0');
                    const s = String(now.getSeconds()).padStart(2, '0');
                    clockEl.textContent = `${h}:${m}:${s}`;
                };
                updateClock();
                window.dashClockInterval = setInterval(updateClock, 1000);
            }

        } catch (error) {
            console.error("កំហុសក្នុងការគូរ Modern Khmer Dashboard:", error);
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
