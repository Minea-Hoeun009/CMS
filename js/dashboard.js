// =========================================================================
// ឯកសារ js/dashboard.js - ផ្ទាំងគ្រប់គ្រងទិន្នន័យសាលារៀន (Pro Dynamic Dashboard)
// =========================================================================

window.loadDashboard = function() {
    try {
        const container = document.getElementById("dashboardView") || document.getElementById("mainContentArea") || document.getElementById("appView");
        if (!container) return;

        // ១. ទាញយកការកំណត់សាលា
        let sInfo = {};
        try {
            if (typeof appSettings !== 'undefined' && appSettings) sInfo = appSettings;
            else {
                const localSet = localStorage.getItem('school_settings');
                if (localSet && localSet !== "undefined" && localSet !== "null") sInfo = JSON.parse(localSet);
            }
        } catch (e) { sInfo = {}; }

        const teacherName = window.AuthState?.teacherName || localStorage.getItem('auth_teacher_name') || 'លោកគ្រូ អ្នកគ្រូ';
        const academicYear = document.getElementById("globalAcademicYear")?.value || localStorage.getItem('selected_academic_year') || sInfo.academic_year || "2026-2027";

        // ២. ទាញយក និងគណនាទិន្នន័យសិស្ស
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

        const students = rawStudents.filter(s => s && s.status !== "Dropped");
        const dropCount = rawStudents.filter(s => s && s.status === "Dropped").length;
        const totalStudents = students.length;
        const femaleStudents = students.filter(s => s.gender === 'ស្រី' || s.gender === 'F').length;
        const maleStudents = totalStudents - femaleStudents;
        const poorStudents = students.filter(s => s.poor_id && String(s.poor_id) !== "false" && String(s.poor_id).trim() !== "").length;
        const scholarStudents = students.filter(s => s.scholarship === true || s.scholarship === "true" || s.scholarship === "បាទ/ចាស").length;

        // រាប់ចំនួនថ្នាក់រៀនសរុប (Unique Classes)
        const uniqueClasses = new Set(students.map(s => `${s.grade || 'ថ្នាក់ទី ១'} ${s.room || '«ក»'}`.trim()));
        const totalClasses = uniqueClasses.size || 1;

        const isSchoolOrSysAdmin = typeof window.isSchoolAdmin === 'function' ? window.isSchoolAdmin() : false;
        let teacherGradeStr = "មិនទាន់កំណត់ថ្នាក់រៀន";
        if (isSchoolOrSysAdmin) {
            teacherGradeStr = `រដ្ឋបាលសាលារៀន (គ្រប់គ្រងគ្រប់កម្រិតថ្នាក់ - ${totalClasses} ថ្នាក់)`;
        } else if (students.length > 0) {
            let sGrade = String(students[0].grade || "ថ្នាក់ទី 1").trim();
            if (!sGrade.includes("ថ្នាក់ទី")) sGrade = "ថ្នាក់ទី " + sGrade;
            teacherGradeStr = `${sGrade} ${students[0].room || '«ក»'}`;
        } else {
            teacherGradeStr = `${sInfo.teacher_level || "ថ្នាក់ទី 1"} ${sInfo.teacher_room || "«ក»"}`;
        }

        // ៣. គណនាទិន្នន័យវត្តមានថ្ងៃនេះ (Today's Attendance Stats)
        const today = new Date();
        const todayDayNum = today.getDate();
        let attPresent = 0, attPerm = 0, attUnex = 0, attSick = 0;
        
        let monthAtt = window.monthlyAttendanceData || {};
        if (Object.keys(monthAtt).length === 0) {
            try { monthAtt = JSON.parse(localStorage.getItem('academic_monthly_attendance') || '{}'); } catch(e) {}
        }

        students.forEach(s => {
            const stuAtt = monthAtt[s.id] || {};
            const code = (stuAtt[todayDayNum] || "").trim().toUpperCase();
            if (code === "ច" || code === "ច្ប" || code === "C") attPerm++;
            else if (code === "អ" || code === "អច្ប" || code === "A") attUnex++;
            else if (code === "ឈ" || code === "S") attSick++;
            else if (code !== "៖" && code !== "-") attPresent++;
        });

        const totalAbsentToday = attPerm + attUnex + attSick;
        const attRate = totalStudents > 0 ? Math.round((attPresent / totalStudents) * 100) : 100;

        // ៤. គណនាពិន្ទុ មធ្យមភាគ និងចំណាត់ថ្នាក់សិស្ស (Scores & Ranking)
        let rawScores = [];
        try { rawScores = JSON.parse(localStorage.getItem('academic_scores') || '[]'); } catch(e) {}
        
        // ស្វែងរកកំពូលសិស្សឆ្នើម (Honor Roll - Top 5)
        let honorStudents = [];
        if (window.rankingsDataList && window.rankingsDataList.length > 0) {
            honorStudents = [...window.rankingsDataList].slice(0, 5);
        } else if (rawScores.length > 0) {
            // យកពិន្ទុចុងក្រោយបង្អស់មកតម្រៀប
            const studentScoreMap = {};
            rawScores.forEach(sc => {
                if (sc.student_id && sc.average) {
                    const avgNum = parseFloat(sc.average) || 0;
                    if (!studentScoreMap[sc.student_id] || avgNum > studentScoreMap[sc.student_id].avg) {
                        const matchedStu = students.find(s => String(s.id) === String(sc.student_id));
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
        }

        // គណនាមធ្យមភាគថ្នាក់រៀន
        const classAvg = honorStudents.length > 0 
            ? (honorStudents.reduce((sum, s) => sum + (parseFloat(s.avg) || 0), 0) / honorStudents.length).toFixed(2)
            : "0.00";

        // ៥. ទាញយក Audit Log ចុងក្រោយ ៥ ជួរ
        const recentLogs = typeof window.AuditBackup !== 'undefined' ? window.AuditBackup.getLogs().slice(0, 5) : [];

        // ៦. កាលបរិច្ឆេទ
        const khmerMonths = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];
        const toKhNum = typeof window.toKhmerNum === 'function' ? window.toKhmerNum : String;
        const todayStrKh = `ថ្ងៃទី ${toKhNum(today.getDate())} ខែ ${khmerMonths[today.getMonth()]} ឆ្នាំ ${toKhNum(today.getFullYear())}`;

        container.className = "p-2 md:p-6 transition-all duration-500 h-full w-full flex flex-col min-h-0 bg-slate-50 dark:bg-slate-900";
        container.innerHTML = `
            <div class="w-full h-full overflow-y-auto overflow-x-hidden custom-scrollbar relative z-10">
                <div class="flex animate-fade-in flex-col font-siemreap text-slate-800 dark:text-slate-100 max-w-[1680px] mx-auto pb-20 px-1 md:px-2 pt-1 min-h-full space-y-8">
                    
                    <!-- Banner ស្វាគមន៍ -->
                    <div class="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 md:p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden border border-indigo-500/20">
                        <div class="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
                        <div class="absolute bottom-0 left-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl"></div>
                        
                        <div class="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                            <div>
                                <div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-indigo-200 text-xs font-bold mb-3 border border-white/10">
                                    <i class="fa-solid fa-graduation-cap text-amber-400"></i> 
                                    <span>ឆ្នាំសិក្សា ${academicYear}</span> • <span>${teacherGradeStr}</span>
                                </div>
                                <h2 class="text-2xl md:text-4xl font-moul mb-2 tracking-wide flex items-center gap-2">
                                    សួស្តី ${teacherName}! 👋
                                </h2>
                                <p class="text-indigo-200 text-sm md:text-base font-bold max-w-2xl leading-relaxed">
                                    ${isSchoolOrSysAdmin ? "របាយការណ៍សង្ខេបអំពីទិន្នន័យសិស្ស វត្តមានប្រចាំថ្ងៃ និងលទ្ធផលសិក្សាទូទាំងសាលារៀន" : "របាយការណ៍សង្ខេបអំពីទិន្នន័យសិស្ស វត្តមានប្រចាំថ្ងៃ និងលទ្ធផលសិក្សាជាក់ស្តែងក្នុងថ្នាក់រៀន"}
                                </p>
                            </div>
                            
                            <!-- នាឡិកា & កាលបរិច្ឆេទ -->
                            <div class="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 flex items-center gap-4 text-white shadow-inner">
                                <div class="w-12 h-12 bg-indigo-500/30 rounded-xl flex items-center justify-center text-2xl text-amber-300">
                                    <i class="fa-regular fa-calendar-check"></i>
                                </div>
                                <div>
                                    <p class="text-xs text-indigo-200 font-bold uppercase tracking-wider">${todayStrKh}</p>
                                    <p class="text-2xl font-black font-mono tracking-widest text-white" id="dashClock">00:00:00</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- ជួរកាតស្ថិតិចម្បង (Main Counters) -->
                    <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                        <!-- សិស្សសរុប -->
                        <div class="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition">
                            <div class="flex justify-between items-start mb-3">
                                <div class="w-10 h-10 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center text-lg"><i class="fa-solid fa-users"></i></div>
                                <span class="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-lg text-[10px] font-bold">សរុប</span>
                            </div>
                            <p class="text-slate-400 text-[11px] font-bold uppercase tracking-wider">${isSchoolOrSysAdmin ? "សិស្សសរុបទូទាំងសាលា" : "សិស្សក្នុងបន្ទុក"}</p>
                            <p class="text-3xl font-black text-slate-800 dark:text-white mt-1">${totalStudents} <span class="text-xs font-normal text-slate-400">នាក់</span></p>
                        </div>

                        <!-- ស្រី / ប្រុស -->
                        <div class="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition">
                            <div class="flex justify-between items-start mb-3">
                                <div class="w-10 h-10 bg-pink-50 dark:bg-pink-950 text-pink-500 rounded-xl flex items-center justify-center text-lg"><i class="fa-solid fa-venus-mars"></i></div>
                                <span class="bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300 px-2 py-0.5 rounded-lg text-[10px] font-bold">ស្រី/ប្រុស</span>
                            </div>
                            <p class="text-slate-400 text-[11px] font-bold uppercase tracking-wider">សមាមាត្រភេទ</p>
                            <p class="text-2xl font-black text-slate-800 dark:text-white mt-1">${femaleStudents} <span class="text-xs text-slate-400 font-bold">ស្រី</span> / ${maleStudents} <span class="text-xs text-slate-400 font-bold">ប្រុស</span></p>
                        </div>

                        <!-- វត្តមានថ្ងៃនេះ -->
                        <div class="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition">
                            <div class="flex justify-between items-start mb-3">
                                <div class="w-10 h-10 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-xl flex items-center justify-center text-lg"><i class="fa-solid fa-user-check"></i></div>
                                <span class="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-lg text-[10px] font-bold">${attRate}%</span>
                            </div>
                            <p class="text-slate-400 text-[11px] font-bold uppercase tracking-wider">វត្តមានថ្ងៃនេះ</p>
                            <p class="text-3xl font-black text-emerald-600 mt-1">${attPresent} <span class="text-xs text-slate-400">មក</span></p>
                        </div>

                        <!-- អវត្តមានថ្ងៃនេះ -->
                        <div class="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition">
                            <div class="flex justify-between items-start mb-3">
                                <div class="w-10 h-10 bg-rose-50 dark:bg-rose-950 text-rose-500 rounded-xl flex items-center justify-center text-lg"><i class="fa-solid fa-user-xmark"></i></div>
                                <span class="bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-lg text-[10px] font-bold">អវត្តមាន</span>
                            </div>
                            <p class="text-slate-400 text-[11px] font-bold uppercase tracking-wider">អវត្តមានសរុប</p>
                            <p class="text-3xl font-black text-rose-600 mt-1">${totalAbsentToday} <span class="text-xs text-slate-400">(ច្បាប់ ${attPerm})</span></p>
                        </div>

                        <!-- មធ្យមភាគថ្នាក់ -->
                        <div class="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition">
                            <div class="flex justify-between items-start mb-3">
                                <div class="w-10 h-10 bg-amber-50 dark:bg-amber-950 text-amber-500 rounded-xl flex items-center justify-center text-lg"><i class="fa-solid fa-chart-line"></i></div>
                                <span class="bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-lg text-[10px] font-bold">ពិន្ទុ</span>
                            </div>
                            <p class="text-slate-400 text-[11px] font-bold uppercase tracking-wider">មធ្យមភាគកំពូល</p>
                            <p class="text-3xl font-black text-amber-600 mt-1">${classAvg} <span class="text-xs text-slate-400">/10</span></p>
                        </div>

                        <!-- ក្រីក្រ & អាហារូបករណ៍ -->
                        <div class="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition">
                            <div class="flex justify-between items-start mb-3">
                                <div class="w-10 h-10 bg-purple-50 dark:bg-purple-950 text-purple-600 rounded-xl flex items-center justify-center text-lg"><i class="fa-solid fa-hand-holding-heart"></i></div>
                                <span class="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-lg text-[10px] font-bold">គាំពារ</span>
                            </div>
                            <p class="text-slate-400 text-[11px] font-bold uppercase tracking-wider">ប័ណ្ណក្រីក្រ/អាហារូបករណ៍</p>
                            <p class="text-2xl font-black text-purple-600 mt-1">${poorStudents} / ${scholarStudents}</p>
                        </div>
                    </div>

                    <!-- ផ្នែកក្រាហ្វិកស្ថិតិ និងតារាងកិត្តិយស (Charts & Honor Roll) -->
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <!-- Chart: សមាសភាពសិស្ស និងវត្តមាន -->
                        <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between">
                            <div class="flex justify-between items-center mb-4">
                                <h3 class="font-moul text-sm text-slate-800 dark:text-white flex items-center gap-2">
                                    <i class="fa-solid fa-chart-pie text-indigo-500"></i> សមាសភាពសិស្សក្នុងថ្នាក់
                                </h3>
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

                    <!-- ជួរសកម្មភាពរហ័ស និង Audit Log ចុងក្រោយ -->
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <!-- សកម្មភាពរហ័ស (Quick Actions) -->
                        <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                            <h3 class="font-moul text-sm text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                <i class="fa-solid fa-bolt text-amber-500"></i> សកម្មភាពរហ័ស (Quick Actions)
                            </h3>
                            <div class="grid grid-cols-2 gap-3 text-xs font-bold">
                                <button onclick="window.switchView('students')" class="p-4 bg-indigo-50/60 dark:bg-slate-700 hover:bg-indigo-100 dark:hover:bg-slate-600 text-indigo-700 dark:text-indigo-300 rounded-2xl flex flex-col items-center justify-center gap-2 transition">
                                    <i class="fa-solid fa-user-plus text-xl"></i>
                                    <span>ចុះឈ្មោះសិស្ស</span>
                                </button>
                                <button onclick="window.switchView('attendance')" class="p-4 bg-emerald-50/60 dark:bg-slate-700 hover:bg-emerald-100 dark:hover:bg-slate-600 text-emerald-700 dark:text-emerald-300 rounded-2xl flex flex-col items-center justify-center gap-2 transition">
                                    <i class="fa-solid fa-clipboard-user text-xl"></i>
                                    <span>កត់វត្តមាន</span>
                                </button>
                                <button onclick="window.switchView('scores')" class="p-4 bg-amber-50/60 dark:bg-slate-700 hover:bg-amber-100 dark:hover:bg-slate-600 text-amber-700 dark:text-amber-300 rounded-2xl flex flex-col items-center justify-center gap-2 transition">
                                    <i class="fa-solid fa-marker text-xl"></i>
                                    <span>បញ្ចូលពិន្ទុ</span>
                                </button>
                                <button onclick="window.exportFullSystemBackup()" class="p-4 bg-purple-50/60 dark:bg-slate-700 hover:bg-purple-100 dark:hover:bg-slate-600 text-purple-700 dark:text-purple-300 rounded-2xl flex flex-col items-center justify-center gap-2 transition">
                                    <i class="fa-solid fa-cloud-arrow-down text-xl"></i>
                                    <span>Backup ទិន្នន័យ</span>
                                </button>
                            </div>
                        </div>

                        <!-- កំណត់ត្រាសកម្មភាពចុងក្រោយ (Recent Audit Activities) -->
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
                                                    <p class="text-[10px] text-slate-400">${l.teacher_name} • <span class="font-mono">${l.action}</span></p>
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

        // ៧. បង្កើត Chart ជាមួយ Chart.js
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

        // ៨. ដំណើរការនាឡិកាឌីជីថល (Digital Clock)
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
        console.error("កំហុសក្នុងការគូរ Dashboard:", error);
    }
};
