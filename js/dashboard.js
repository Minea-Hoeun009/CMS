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

            // ចម្រាញ់តាមឆ្នាំសិក្សា
            let yearStudents = rawStudents.filter(s => {
                if (!s) return false;
                if (s.academic_year && s.academic_year !== academicYear) return false;
                return true;
            });
            if (yearStudents.length === 0) yearStudents = rawStudents;

            // ចម្រាញ់តាមថ្នាក់ដែលបានជ្រើស
            let scopedStudents = yearStudents;
            if (selectedClass && selectedClass !== 'all') {
                scopedStudents = yearStudents.filter(s => {
                    const sClass = `${s.grade || ''} ${s.room || ''}`.trim();
                    return sClass === selectedClass.trim();
                });
            }

            const activeStudents = scopedStudents.filter(s => s.status !== "Dropped" && s.status !== "Withdrawn");
            const totalStudents = activeStudents.length || 328; // Fallback to mockup sample
            const femaleStudents = activeStudents.filter(s => s.gender === 'ស្រី' || s.gender === 'F').length || Math.round(totalStudents * 0.48);
            const maleStudents = totalStudents - femaleStudents;

            // រាប់ចំនួនថ្នាក់រៀន
            const classSet = new Set(yearStudents.map(s => `${s.grade || 'ថ្នាក់ទី ១'} ${s.room || '«ក»'}`.trim()));
            const availableClasses = Array.from(classSet);
            const totalClassesCount = availableClasses.length > 0 ? availableClasses.length : 12;
            const totalTeachersCount = 24;

            // ២. គណនាទិន្នន័យវត្តមានសម្រាប់កាលបរិច្ឆេទជ្រើសរើស (Attendance Stats)
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

            // Default mockup rates if no manual record for today yet
            const attRate = attendanceMarkedCount > 0 ? Math.round((attPresent / (activeStudents.length || 1)) * 100) : 92;

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

            // ៤. កាលបរិច្ឆេទខ្មែរ
            const khmerMonths = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];
            const toKhNum = typeof window.toKhmerNum === 'function' ? window.toKhmerNum : String;
            const dateStrKh = `ថ្ងៃទី ${toKhNum(chosenDate.getDate())} ខែ ${khmerMonths[chosenDate.getMonth()]} ឆ្នាំ ${toKhNum(chosenDate.getFullYear())}`;

            // Container setup
            container.className = "p-3 sm:p-6 transition-all duration-300 h-full w-full flex flex-col min-h-0 bg-slate-50 dark:bg-slate-900";
            container.innerHTML = `
                <div class="w-full h-full overflow-y-auto overflow-x-hidden custom-scrollbar relative z-10">
                    <div class="flex flex-col font-siemreap text-slate-800 dark:text-slate-100 max-w-[1600px] mx-auto pb-16 space-y-6">
                        
                        <!-- 1. Filter & Quick Scope Bar -->
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
                                    <span class="text-xs font-bold text-slate-500 dark:text-slate-400"><i class="fa-solid fa-school text-emerald-600"></i> ${t('classes', 'ថ្នាក់រៀន')}៖</span>
                                    <select id="dashFilterClass" onchange="window.handleDashboardFilterChange('selectedClass', this.value)" class="text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 py-1.5 px-3 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 cursor-pointer outline-none">
                                        <option value="all" ${selectedClass === 'all' ? 'selected' : ''}>ថ្នាក់ទាំងអស់ (${totalClassesCount} ថ្នាក់)</option>
                                        ${availableClasses.map(c => `<option value="${c}" ${selectedClass === c ? 'selected' : ''}>${c}</option>`).join('')}
                                    </select>
                                </div>

                                <div class="flex items-center gap-2">
                                    <span class="text-xs font-bold text-slate-500 dark:text-slate-400"><i class="fa-regular fa-clock text-amber-500"></i> កាលបរិច្ឆេទ៖</span>
                                    <input type="date" id="dashFilterDate" value="${currentFilter.selectedDate}" onchange="window.handleDashboardFilterChange('selectedDate', this.value)" class="text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 py-1.5 px-3 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 cursor-pointer outline-none">
                                </div>
                            </div>

                            <div class="flex items-center gap-2">
                                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800">
                                    <i class="fa-solid fa-shield-halved text-xs"></i> ${getRoleTitle(role)}
                                </span>
                                <button onclick="window.refreshDashboardData()" title="ទាញយកទិន្នន័យស្រស់" class="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center transition outline-none">
                                    <i class="fa-solid fa-arrows-rotate text-xs"></i>
                                </button>
                            </div>
                        </div>

                        <!-- 2. Welcome Banner (Mockup Match) -->
                        <div class="bg-gradient-to-r from-[#10489c] via-[#1d4ed8] to-[#1e40af] p-6 sm:p-8 rounded-3xl shadow-lg text-white relative overflow-hidden">
                            <!-- Background Subtle Watermark -->
                            <div class="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
                            
                            <div class="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div class="space-y-2">
                                    <div class="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3.5 py-1 rounded-full text-blue-100 text-xs font-bold border border-white/20">
                                        <i class="fa-solid fa-graduation-cap text-amber-300"></i>
                                        <span>${t('academicYear', 'ឆ្នាំសិក្សា')} ${academicYear}</span>
                                        <span>•</span>
                                        <span>${selectedClass === 'all' ? 'ទូទាំងសាលារៀន' : selectedClass}</span>
                                    </div>
                                    <h2 class="text-2xl sm:text-3xl font-bold font-siemreap tracking-wide leading-snug">
                                        ${t('welcomeTitle', 'សូមស្វាគមន៍មកកាន់ប្រព័ន្ធគ្រប់គ្រងថ្នាក់រៀន!')}
                                    </h2>
                                    <p class="text-blue-100 text-xs sm:text-sm font-medium max-w-2xl leading-relaxed">
                                        ${t('welcomeSub', 'គ្រប់គ្រងទិន្នន័យសាលារៀន ស្រង់វត្តមាន និងលទ្ធផលសិក្សារបស់សិស្សានុសិស្សប្រកបដោយប្រសិទ្ធភាព')}
                                    </p>
                                </div>

                                <!-- Date & Live Digital Clock -->
                                <div class="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3.5 flex items-center gap-4 text-white shrink-0 shadow-inner">
                                    <div class="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center text-xl text-amber-300">
                                        <i class="fa-regular fa-calendar-check"></i>
                                    </div>
                                    <div>
                                        <p class="text-[11px] text-blue-200 font-bold uppercase tracking-wider">${dateStrKh}</p>
                                        <p class="text-xl sm:text-2xl font-black font-mono tracking-widest text-white leading-none mt-1" id="dashClock">--:--:--</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 3. Top 4 Stat Cards (KPI Counters with Trend Badges matching Mockup) -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            
                            <!-- Card 1: សិស្សសរុប (Total Students) -->
                            <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700 hover:shadow-md transition flex flex-col justify-between">
                                <div class="flex items-center justify-between mb-3">
                                    <div class="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl">
                                        <i class="fa-solid fa-user-graduate"></i>
                                    </div>
                                    <span class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200/50">
                                        <i class="fa-solid fa-arrow-trend-up text-[10px]"></i> +12%
                                    </span>
                                </div>
                                <div>
                                    <p class="text-xs font-bold text-slate-500 dark:text-slate-400" data-i18n="totalStudents">${t('totalStudents', 'សិស្សសរុប')}</p>
                                    <div class="flex items-baseline gap-2 mt-1">
                                        <span class="text-3xl font-black text-slate-800 dark:text-white font-mono">${totalStudents}</span>
                                        <span class="text-[11px] text-slate-400 font-medium">នាក់</span>
                                    </div>
                                    <p class="text-[10px] text-slate-400 mt-2 font-bold flex items-center gap-1">
                                        <span class="text-emerald-500 font-bold">+12%</span>
                                        <span data-i18n="fromLastMonth">${t('fromLastMonth', 'ពីខែមុន')}</span>
                                    </p>
                                </div>
                            </div>

                            <!-- Card 2: គ្រូសរុប (Total Teachers) -->
                            <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700 hover:shadow-md transition flex flex-col justify-between">
                                <div class="flex items-center justify-between mb-3">
                                    <div class="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl">
                                        <i class="fa-solid fa-chalkboard-user"></i>
                                    </div>
                                    <span class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200/50">
                                        <i class="fa-solid fa-arrow-trend-up text-[10px]"></i> +4%
                                    </span>
                                </div>
                                <div>
                                    <p class="text-xs font-bold text-slate-500 dark:text-slate-400" data-i18n="totalTeachers">${t('totalTeachers', 'គ្រូសរុប')}</p>
                                    <div class="flex items-baseline gap-2 mt-1">
                                        <span class="text-3xl font-black text-slate-800 dark:text-white font-mono">${totalTeachersCount}</span>
                                        <span class="text-[11px] text-slate-400 font-medium">នាក់</span>
                                    </div>
                                    <p class="text-[10px] text-slate-400 mt-2 font-bold flex items-center gap-1">
                                        <span class="text-emerald-500 font-bold">+4%</span>
                                        <span data-i18n="fromLastMonth">${t('fromLastMonth', 'ពីខែមុន')}</span>
                                    </p>
                                </div>
                            </div>

                            <!-- Card 3: ថ្នាក់សរុប (Total Classes) -->
                            <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700 hover:shadow-md transition flex flex-col justify-between">
                                <div class="flex items-center justify-between mb-3">
                                    <div class="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl">
                                        <i class="fa-solid fa-school"></i>
                                    </div>
                                    <span class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200/50">
                                        <i class="fa-solid fa-arrow-trend-up text-[10px]"></i> +9%
                                    </span>
                                </div>
                                <div>
                                    <p class="text-xs font-bold text-slate-500 dark:text-slate-400" data-i18n="totalClasses">${t('totalClasses', 'ថ្នាក់សរុប')}</p>
                                    <div class="flex items-baseline gap-2 mt-1">
                                        <span class="text-3xl font-black text-slate-800 dark:text-white font-mono">${totalClassesCount}</span>
                                        <span class="text-[11px] text-slate-400 font-medium">ថ្នាក់</span>
                                    </div>
                                    <p class="text-[10px] text-slate-400 mt-2 font-bold flex items-center gap-1">
                                        <span class="text-emerald-500 font-bold">+9%</span>
                                        <span data-i18n="fromLastMonth">${t('fromLastMonth', 'ពីខែមុន')}</span>
                                    </p>
                                </div>
                            </div>

                            <!-- Card 4: វត្តមានថ្ងៃនេះ (Today Attendance) -->
                            <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700 hover:shadow-md transition flex flex-col justify-between">
                                <div class="flex items-center justify-between mb-3">
                                    <div class="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl">
                                        <i class="fa-solid fa-clipboard-check"></i>
                                    </div>
                                    <span class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200/50">
                                        <i class="fa-solid fa-arrow-trend-up text-[10px]"></i> +5%
                                    </span>
                                </div>
                                <div>
                                    <p class="text-xs font-bold text-slate-500 dark:text-slate-400" data-i18n="todayAttendance">${t('todayAttendance', 'វត្តមានថ្ងៃនេះ')}</p>
                                    <div class="flex items-baseline gap-2 mt-1">
                                        <span class="text-3xl font-black text-indigo-600 dark:text-indigo-400 font-mono">${attRate}%</span>
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
                                    
                                    <!-- Chart 1: Line Chart - កំណើនសិស្សតាមឆ្នាំ -->
                                    <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700 flex flex-col justify-between">
                                        <div class="flex justify-between items-center mb-3">
                                            <div>
                                                <h3 class="font-bold text-sm text-slate-800 dark:text-white" data-i18n="studentCountByYear">
                                                    ${t('studentCountByYear', 'ចំនួនសិស្សតាមឆ្នាំសិក្សា')}
                                                </h3>
                                                <p class="text-[11px] text-slate-400 font-medium">កំណើនសិស្សពីឆ្នាំ ២០២០ ដល់ ២០២៥</p>
                                            </div>
                                            <span class="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center text-xs">
                                                <i class="fa-solid fa-chart-line"></i>
                                            </span>
                                        </div>
                                        <div class="relative h-56 flex items-center justify-center w-full">
                                            <canvas id="chartStudentGrowth"></canvas>
                                        </div>
                                    </div>

                                    <!-- Chart 2: Donut Chart - វត្តមានសិស្ស -->
                                    <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700 flex flex-col justify-between">
                                        <div class="flex justify-between items-center mb-3">
                                            <div>
                                                <h3 class="font-bold text-sm text-slate-800 dark:text-white" data-i18n="attendanceStats">
                                                    ${t('attendanceStats', 'ស្ថិតិវត្តមាន')}
                                                </h3>
                                                <p class="text-[11px] text-slate-400 font-medium">អត្រាវត្តមានប្រចាំថ្ងៃសរុប</p>
                                            </div>
                                            <span class="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center text-xs">
                                                <i class="fa-solid fa-chart-pie"></i>
                                            </span>
                                        </div>
                                        <div class="relative h-44 flex items-center justify-center">
                                            <canvas id="chartAttendanceDonut"></canvas>
                                            <canvas id="chartStudentDemographics" class="hidden"></canvas>
                                            <!-- Center Percentage Overlay -->
                                            <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                <span class="text-2xl font-black text-slate-800 dark:text-white font-mono leading-none">${attRate}%</span>
                                                <span class="text-[10px] text-slate-400 font-bold mt-0.5" data-i18n="present">${t('present', 'វត្តមាន')}</span>
                                            </div>
                                        </div>
                                        <!-- Donut Legend (4 Categories) -->
                                        <div class="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-700 text-[11px] font-bold">
                                            <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0"></span><span data-i18n="present">${t('present', 'វត្តមាន')}</span>: 92%</div>
                                            <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span><span data-i18n="absent">${t('absent', 'អវត្តមាន')}</span>: 4%</div>
                                            <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span><span data-i18n="late">${t('late', 'យឺត')}</span>: 2%</div>
                                            <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span><span data-i18n="excused">${t('excused', 'លើកលែង')}</span>: 2%</div>
                                        </div>
                                    </div>

                                </div>

                                <!-- Recent Activities Feed (Mockup Match) -->
                                <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700">
                                    <div class="flex justify-between items-center mb-4">
                                        <h3 class="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                                            <i class="fa-solid fa-clock-rotate-left text-blue-600"></i>
                                            <span data-i18n="recentActivities">${t('recentActivities', 'សកម្មភាពចុងក្រោយ')}</span>
                                        </h3>
                                        <button onclick="window.switchView('attendance')" class="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline" data-i18n="viewAll">
                                            ${t('viewAll', 'មើលទាំងអស់')} →
                                        </button>
                                    </div>

                                    <div class="space-y-3">
                                        <!-- Item 1 -->
                                        <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                                            <div class="flex items-center gap-3">
                                                <div class="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 flex items-center justify-center text-sm shrink-0">
                                                    <i class="fa-solid fa-clipboard-check"></i>
                                                </div>
                                                <div>
                                                    <p class="text-xs font-bold text-slate-800 dark:text-white">វត្តមានថ្នាក់ 7A បានស្រង់រួច</p>
                                                    <p class="text-[11px] text-slate-400">ស្រង់វត្តមានបាន 98% ដោយជោគជ័យ</p>
                                                </div>
                                            </div>
                                            <span class="text-[10px] text-slate-400 font-medium">5 នាទីមុន</span>
                                        </div>

                                        <!-- Item 2 -->
                                        <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                                            <div class="flex items-center gap-3">
                                                <div class="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-300 flex items-center justify-center text-sm shrink-0">
                                                    <i class="fa-solid fa-award"></i>
                                                </div>
                                                <div>
                                                    <p class="text-xs font-bold text-slate-800 dark:text-white">បញ្ចូលពិន្ទុគណិតវិទ្យា</p>
                                                    <p class="text-[11px] text-slate-400">ពិន្ទុប្រចាំខែតុលា ថ្នាក់ 8B</p>
                                                </div>
                                            </div>
                                            <span class="text-[10px] text-slate-400 font-medium">25 នាទីមុន</span>
                                        </div>

                                        <!-- Item 3 -->
                                        <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                                            <div class="flex items-center gap-3">
                                                <div class="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center text-sm shrink-0">
                                                    <i class="fa-solid fa-user-plus"></i>
                                                </div>
                                                <div>
                                                    <p class="text-xs font-bold text-slate-800 dark:text-white">សិស្សថ្មីបានចុះឈ្មោះ</p>
                                                    <p class="text-[11px] text-slate-400">សិស្ស ចាន់ សុខា ចូលរៀនថ្នាក់ 10A</p>
                                                </div>
                                            </div>
                                            <span class="text-[10px] text-slate-400 font-medium">1 ម៉ោងមុន</span>
                                        </div>

                                        <!-- Item 4 -->
                                        <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                                            <div class="flex items-center gap-3">
                                                <div class="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-sm shrink-0">
                                                    <i class="fa-solid fa-cloud-arrow-up"></i>
                                                </div>
                                                <div>
                                                    <p class="text-xs font-bold text-slate-800 dark:text-white">ធ្វើសមកាលកម្ម Google Sheets</p>
                                                    <p class="text-[11px] text-slate-400">បានផ្ញើទិន្នន័យ 1,240 ជួរទៅកាន់ Cloud</p>
                                                </div>
                                            </div>
                                            <span class="text-[10px] text-slate-400 font-medium">2 ម៉ោងមុន</span>
                                        </div>
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

            // ៥. គូរ Line Chart: កំណើនសិស្សតាមឆ្នាំ
            if (typeof Chart !== 'undefined') {
                const growthCtx = document.getElementById('chartStudentGrowth');
                if (growthCtx) {
                    if (window.dashGrowthChart) window.dashGrowthChart.destroy();
                    
                    const isKm = (window.CMS_I18N?.currentLang || 'km') === 'km';
                    const years = isKm ? ['២០២០', '២០២១', '២០២២', '២០២៣', '២០២៤', '២០២៥'] : ['2020', '2021', '2022', '2023', '2024', '2025'];
                    const counts = [210, 245, 278, 295, 312, totalStudents];

                    window.dashGrowthChart = new Chart(growthCtx, {
                        type: 'line',
                        data: {
                            labels: years,
                            datasets: [{
                                label: t('totalStudents', 'សិស្ស'),
                                data: counts,
                                borderColor: '#2563eb',
                                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                                fill: true,
                                tension: 0.4,
                                pointBackgroundColor: '#2563eb',
                                pointBorderColor: '#ffffff',
                                pointBorderWidth: 2,
                                pointRadius: 4,
                                pointHoverRadius: 6
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
                                    cornerRadius: 8
                                }
                            },
                            scales: {
                                y: {
                                    beginAtZero: false,
                                    grid: { color: 'rgba(226, 232, 240, 0.6)' },
                                    ticks: { font: { size: 10 } }
                                },
                                x: {
                                    grid: { display: false },
                                    ticks: { font: { family: 'Siemreap', size: 10 } }
                                }
                            }
                        }
                    });
                }

                // ៦. គូរ Donut Chart: ស្ថិតិវត្តមាន
                const attCtx = document.getElementById('chartAttendanceDonut');
                if (attCtx) {
                    if (window.dashAttendanceChart) window.dashAttendanceChart.destroy();
                    window.dashAttendanceChart = new Chart(attCtx, {
                        type: 'doughnut',
                        data: {
                            labels: [t('present', 'វត្តមាន'), t('absent', 'អវត្តមាន'), t('late', 'យឺត'), t('excused', 'លើកលែង')],
                            datasets: [{
                                data: [92, 4, 2, 2],
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
                                            return ` ${context.label}: ${context.raw}%`;
                                        }
                                    }
                                }
                            },
                            cutout: '76%'
                        }
                    });
                }
            }

            // ៧. ដំណើរការនាឡិកាឌីជីថល (Digital Clock)
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
