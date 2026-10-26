// =========================================================================
// ឯកសារ js/krou-digital.js - ប្រព័ន្ធគ្រប់គ្រងរដ្ឋបាលគ្រូ និងសាលារៀនតាមស្តង់ដារ KrouDigital 4.0
// កំណែ: 2.4.0 (MoEYS Standard Reports, Health Tracker, Honor Certificates, Parent Portal)
// =========================================================================

window.KrouDigital = {

    // Helper: បង្កើតជម្រើសកម្រិតថ្នាក់ និងបន្ទប់ សម្រាប់របារបញ្ជា
    _getClassSelectorHtml: function(curLevel, curRoom, rerenderFnName) {
        const gradesList = typeof window.getAllGradesList === 'function' ? window.getAllGradesList() : ["ថ្នាក់ទី ១", "ថ្នាក់ទី ២", "ថ្នាក់ទី ៣", "ថ្នាក់ទី ៤", "ថ្នាក់ទី ៥", "ថ្នាក់ទី ៦"];
        const roomsList = typeof window.getAllRoomsList === 'function' ? window.getAllRoomsList() : ["«ក»", "«ខ»", "«គ»", "«ឃ»"];
        
        return `
            <div class="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 shadow-sm">
                <i class="fa-solid fa-graduation-cap text-indigo-600 text-xs"></i>
                <select onchange="window.setSelectedClass(this.value, '${curRoom}'); window.KrouDigital.${rerenderFnName}(document.getElementById('reportPaperArea'), this.value, '${curRoom}');" class="border-none bg-transparent text-xs font-bold text-indigo-700 dark:text-indigo-300 outline-none cursor-pointer font-siemreap py-0">
                    ${gradesList.map(g => `<option value="${g}" ${g === curLevel ? 'selected' : ''}>${g}</option>`).join('')}
                </select>
                <span class="text-slate-300">|</span>
                <select onchange="window.setSelectedClass('${curLevel}', this.value); window.KrouDigital.${rerenderFnName}(document.getElementById('reportPaperArea'), '${curLevel}', this.value);" class="border-none bg-transparent text-xs font-bold text-rose-600 dark:text-rose-400 outline-none cursor-pointer font-moul py-0">
                    ${roomsList.map(r => `<option value="${r}" ${r === curRoom ? 'selected' : ''}>${r}</option>`).join('')}
                </select>
            </div>
        `;
    },

    // =====================================================================
    // ១. របាយការណ៍ ក (Report Ka) - តារាងស្រង់ពិន្ទុ និងនិទ្ទេសប្រចាំខែ/ឆមាស
    // =====================================================================
    renderReportKa: function(container, targetGrade = null, targetRoom = null) {
        if (!container) return;
        const sInfo = window.appSettings || JSON.parse(localStorage.getItem('school_settings') || '{}');
        const activeClass = typeof window.getCurrentSelectedClass === 'function' ? window.getCurrentSelectedClass() : { level: "ថ្នាក់ទី ៤", room: "«ក»" };
        const curLevel = targetGrade || activeClass.level;
        const curRoom = targetRoom || activeClass.room;
        const gradeFull = `${curLevel} ${curRoom}`.trim();

        const academicYear = document.getElementById("globalAcademicYear")?.value || sInfo.academic_year || "២០២៦-២០២៧";
        const districtName = (sInfo.district || "កៀនស្វាយ").replace(/^ស្រុក\s*/, '').trim(); 
        const schoolName = sInfo.school_name || "សាលាបឋមសិក្សា ខ្សុំ";
        const principalName = sInfo.principal_name || "";
        const teacherName = (window.AuthState ? window.AuthState.teacherName : null) || localStorage.getItem('auth_teacher_name') || sInfo.teacher_name || "";

        let locShort = "";
        const rawLoc = document.getElementById('global_loc_input')?.value || localStorage.getItem('rc_location') || localStorage.getItem('rep_location');
        if (rawLoc) {
            locShort = rawLoc.replace(/^ធ្វើនៅ\s*/, '').replace(/,+$/, '').trim();
        } else {
            locShort = schoolName.replace(/^(សាលាបឋមសិក្សា|អនុវិទ្យាល័យ|វិទ្យាល័យ|សាលា)\s*/g, '').trim();
            if (!locShort) locShort = districtName || "ភ្នំ";
        }

        let sDate = "";
        const rawDate = document.getElementById('global_sol_input')?.value || localStorage.getItem('rc_solar_date') || localStorage.getItem('rep_solar_date');
        if (rawDate && rawDate.trim()) {
            sDate = rawDate.trim();
        } else {
            sDate = "ថ្ងៃទី.......ខែ..........ឆ្នាំ២០២៦";
        }
        if (sDate.includes("ថ្ងៃទី")) sDate = sDate.substring(sDate.indexOf("ថ្ងៃទី"));

        const solarDateStr = `ធ្វើនៅ ${locShort}, ${sDate}`;

        let isLunarChecked = true;
        const chkBox = document.getElementById('global_lun_chk');
        if (chkBox) isLunarChecked = chkBox.checked;
        else isLunarChecked = (localStorage.getItem('rc_show_lunar') !== 'false' && localStorage.getItem('rep_show_lunar') !== 'false');

        let lun = document.getElementById('global_lun_input')?.value || localStorage.getItem('rc_lunar_date') || localStorage.getItem('rep_lunar_date') || "ថ្ងៃ....................ខែ..................ឆ្នាំ...............ព.ស.២៥៧០";
        const lunarDateStr = isLunarChecked ? lun : "";

        const allStudents = window.allStudents || JSON.parse(localStorage.getItem('academic_students') || '[]');
        const allScores = JSON.parse(localStorage.getItem('academic_scores') || '[]');
        const selectedMonth = localStorage.getItem('selected_assessment_month') || "មករា";

        // ចម្រាញ់សិស្សក្នុងថ្នាក់ជាក់លាក់ដោយប្រើ Standardized Helper
        const classStudents = typeof window.getStudentsForClass === 'function'
            ? window.getStudentsForClass(curLevel, curRoom, academicYear)
            : allStudents.filter(s => {
                if (s.status === "Dropped" || s.status === "Withdrawn") return false;
                const sGrade = (s.grade || "").replace(/\s+/g, '');
                const sRoom = (s.room || "").replace(/[«»\s]/g, '');
                const tGrade = curLevel.replace(/\s+/g, '');
                const tRoom = curRoom.replace(/[«»\s]/g, '');
                return sGrade === tGrade && sRoom === tRoom;
            });

        const studentsWithScores = classStudents.map((stu, idx) => {
            const sc = allScores.find(item => String(item.student_id) === String(stu.id) && item.month === selectedMonth) || {};
            const khmer = parseFloat(sc.khmer || sc.score_khmer || 0) || 0;
            const math = parseFloat(sc.math || sc.score_math || 0) || 0;
            const science = parseFloat(sc.science || sc.score_science || 0) || 0;
            const social = parseFloat(sc.social || sc.score_social || 0) || 0;
            const english = parseFloat(sc.english || sc.score_english || 0) || 0;
            const total = parseFloat(sc.total_score || sc.total) || (khmer + math + science + social + english);
            const avg = parseFloat(sc.average || sc.avg) || (total / 5);
            
            let gradeLetter = "F";
            if (avg >= 8.5) gradeLetter = "A";
            else if (avg >= 8.0) gradeLetter = "B";
            else if (avg >= 7.0) gradeLetter = "C";
            else if (avg >= 6.0) gradeLetter = "D";
            else if (avg >= 5.0) gradeLetter = "E";

            return {
                ...stu,
                khmer, math, science, social, english, total, avg,
                gradeLetter,
                rank: sc.rank || (idx + 1),
                passed: avg >= 5.0
            };
        });

        // តម្រៀបតាមចំណាត់ថ្នាក់
        studentsWithScores.sort((a, b) => b.avg - a.avg);
        studentsWithScores.forEach((s, i) => s.rank = i + 1);

        const totalCount = studentsWithScores.length;
        const femaleCount = studentsWithScores.filter(s => s.gender === 'ស្រី' || s.gender === 'F').length;
        const passedList = studentsWithScores.filter(s => s.passed);
        const passedCount = passedList.length;
        const passedFemale = passedList.filter(s => s.gender === 'ស្រី' || s.gender === 'F').length;
        const failedCount = totalCount - passedCount;
        const failedFemale = femaleCount - passedFemale;
        const passRate = totalCount > 0 ? ((passedCount / totalCount) * 100).toFixed(1) : 0;

        const khmerMonths = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];

        container.innerHTML = `
            <div id="reportKaPrintArea" class="bg-white p-6 md:p-10 w-full shadow-2xl rounded-2xl border border-slate-200 text-slate-800" style="max-width: 297mm; min-height: 210mm; font-family: 'Siemreap', sans-serif;">
                
                <!-- Header តាមស្តង់ដារក្រសួង -->
                <div class="flex justify-between items-start mb-6 text-xs">
                    <div class="text-left leading-relaxed pt-6">
                        <p class="font-moul text-slate-900 text-[12px] mb-1">ការិយាល័យ អប់រំ យុវជន និងកីឡានៃរដ្ឋបាលស្រុក ${districtName}</p>
                        <p class="font-moul text-slate-900 text-[12px]">${schoolName}</p>
                    </div>
                    <div class="text-center">
                        <p class="font-moul text-slate-900 text-[13px] mb-1">ព្រះរាជាណាចក្រកម្ពុជា</p>
                        <p class="font-moul text-slate-900 text-[13px]">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                        <div class="flex items-center justify-center mt-1 mx-auto">
                            <img src="${window.CMS_HEADER_SYMBOL_B64 || 'assets/images/header-flourish.png'}" class="header-flourish-symbol" alt="symbol" style="display: block; margin: 2px auto 0 auto; width: 135px; height: 11px; object-fit: contain;" />
                        </div>
                    </div>
                </div>

                <div class="text-center mb-6">
                    <h3 class="font-moul text-base text-blue-900">តារាងស្រង់ពិន្ទុ និងការវាយតម្លៃលទ្ធផលសិក្សាសិស្ស</h3>
                    <h4 class="font-moul text-sm text-red-600 mt-1">${gradeFull} | ឆ្នាំសិក្សា ${academicYear} (ខែ ${selectedMonth})</h4>
                </div>

                <!-- តារាងពិន្ទុផ្លូវការ -->
                <div class="overflow-x-auto mb-6">
                    <table class="w-full text-xs text-center border-collapse border border-slate-400">
                        <thead>
                            <tr class="bg-indigo-50/80 font-bold text-slate-800">
                                <th rowspan="2" class="border border-slate-400 p-2 w-10">ល.រ</th>
                                <th rowspan="2" class="border border-slate-400 p-2 text-left min-w-[140px]">គោត្តនាម និងនាម</th>
                                <th rowspan="2" class="border border-slate-400 p-2 w-12">ភេទ</th>
                                <th rowspan="2" class="border border-slate-400 p-2 w-24">ថ្ងៃខែឆ្នាំកំណើត</th>
                                <th colspan="5" class="border border-slate-400 p-1.5 bg-blue-50/70">ពិន្ទុតាមមុខវិជ្ជា</th>
                                <th rowspan="2" class="border border-slate-400 p-2 w-16 bg-amber-50">ពិន្ទុសរុប</th>
                                <th rowspan="2" class="border border-slate-400 p-2 w-14 bg-indigo-50">មធ្យមភាគ</th>
                                <th rowspan="2" class="border border-slate-400 p-2 w-12 bg-rose-50">ចំណាត់ថ្នាក់</th>
                                <th rowspan="2" class="border border-slate-400 p-2 w-12 bg-emerald-50">និទ្ទេស</th>
                                <th rowspan="2" class="border border-slate-400 p-2 w-16">លទ្ធផល</th>
                            </tr>
                            <tr class="bg-slate-100 font-bold text-[11px] text-slate-700">
                                <th class="border border-slate-400 p-1.5 w-14">ភាសាខ្មែរ</th>
                                <th class="border border-slate-400 p-1.5 w-14">គណិតវិទ្យា</th>
                                <th class="border border-slate-400 p-1.5 w-14">វិទ្យាសាស្ត្រ</th>
                                <th class="border border-slate-400 p-1.5 w-14">សិក្សាសង្គម</th>
                                <th class="border border-slate-400 p-1.5 w-14">អង់គ្លេស</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${studentsWithScores.length === 0 ? `
                                <tr><td colspan="14" class="p-8 text-slate-400 font-bold">គ្មានទិន្នន័យសិស្សក្នុងថ្នាក់ ${gradeFull} ឡើយ</td></tr>
                            ` : studentsWithScores.map((stu, i) => `
                                <tr class="hover:bg-slate-50 ${i % 2 === 1 ? 'bg-slate-50/40' : ''}">
                                    <td class="border border-slate-300 p-1.5 font-mono">${i + 1}</td>
                                    <td class="border border-slate-300 p-1.5 text-left font-bold text-slate-900">${stu.name}</td>
                                    <td class="border border-slate-300 p-1.5 ${stu.gender === 'ស្រី' || stu.gender === 'F' ? 'text-rose-600 font-bold' : ''}">${stu.gender || 'ប្រុស'}</td>
                                    <td class="border border-slate-300 p-1.5 font-mono text-[11px]">${typeof window.formatDate === 'function' ? window.formatDate(stu.dob) : (stu.dob || '-')}</td>
                                    <td class="border border-slate-300 p-1.5 font-mono">${stu.khmer.toFixed(1)}</td>
                                    <td class="border border-slate-300 p-1.5 font-mono">${stu.math.toFixed(1)}</td>
                                    <td class="border border-slate-300 p-1.5 font-mono">${stu.science.toFixed(1)}</td>
                                    <td class="border border-slate-300 p-1.5 font-mono">${stu.social.toFixed(1)}</td>
                                    <td class="border border-slate-300 p-1.5 font-mono">${stu.english.toFixed(1)}</td>
                                    <td class="border border-slate-300 p-1.5 font-mono font-bold text-indigo-700 bg-amber-50/40">${stu.total.toFixed(1)}</td>
                                    <td class="border border-slate-300 p-1.5 font-mono font-bold text-slate-900 bg-indigo-50/40">${stu.avg.toFixed(2)}</td>
                                    <td class="border border-slate-300 p-1.5 font-bold ${stu.rank <= 3 ? 'text-amber-600 bg-amber-50' : 'text-slate-800'}">${stu.rank}</td>
                                    <td class="border border-slate-300 p-1.5 font-bold ${stu.gradeLetter === 'A' || stu.gradeLetter === 'B' ? 'text-emerald-600' : (stu.gradeLetter === 'F' ? 'text-rose-600' : 'text-slate-800')}">${stu.gradeLetter}</td>
                                    <td class="border border-slate-300 p-1.5 font-bold ${stu.passed ? 'text-emerald-700' : 'text-rose-600'}">${stu.passed ? 'ជាប់' : 'ធ្លាក់'}</td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                </div>

                <!-- ស្ថិតិសង្ខេបលទ្ធផលតាមស្តង់ដារក្រសួង -->
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 text-xs">
                    <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <span class="text-slate-500 font-bold block">សិស្សសរុប</span>
                        <strong class="font-mono text-base text-slate-800">${totalCount} នាក់</strong>
                        <span class="text-[10px] text-slate-400 block mt-0.5">(ស្រី ${femaleCount} នាក់)</span>
                    </div>
                    <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <span class="text-emerald-700 font-bold block">សិស្សជាប់ (មធ្យមភាគ ≥ ៥.០)</span>
                        <strong class="font-mono text-base text-emerald-700">${passedCount} នាក់</strong>
                        <span class="text-[10px] text-emerald-600 block mt-0.5">(ស្រី ${passedFemale} នាក់)</span>
                    </div>
                    <div class="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                        <span class="text-rose-700 font-bold block">សិស្សធ្លាក់ (មធ្យមភាគ < ៥.០)</span>
                        <strong class="font-mono text-base text-rose-700">${failedCount} នាក់</strong>
                        <span class="text-[10px] text-rose-600 block mt-0.5">(ស្រី ${failedFemale} នាក់)</span>
                    </div>
                    <div class="p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                        <span class="text-indigo-700 font-bold block">អត្រាជាប់សរុប</span>
                        <strong class="font-mono text-base text-indigo-700">${passRate}%</strong>
                        <span class="text-[10px] text-indigo-600 block mt-0.5">នៃចំនួនសិស្សក្នុងថ្នាក់</span>
                    </div>
                </div>

                <!-- ហត្ថលេខា និងកាលបរិច្ឆេទ -->
                <div class="flex justify-between items-start text-xs mt-10 pt-4 px-8 font-siemreap">
                    <div class="text-center w-2/5">
                        <p class="mb-1 text-slate-700">បានឃើញ និងឯកភាព</p>
                        <p class="font-moul text-slate-900 mb-16">នាយក/នាយិកាសាលា</p>
                        <p class="font-moul text-slate-900 text-sm">${principalName}</p>
                    </div>
                    <div class="text-center w-2/5">
                        <p class="mb-1 text-slate-700">${lunarDateStr || 'ថ្ងៃ....................ខែ..................ឆ្នាំ...............ព.ស.២៥៧០'}</p>
                        <p class="mb-1 text-slate-700">${solarDateStr}</p>
                        <p class="font-moul text-slate-900 mb-16">គ្រូបន្ទុកថ្នាក់</p>
                        <p class="font-moul text-slate-900 text-sm">${teacherName}</p>
                    </div>
                </div>

            </div>
        `;
    },

    // =====================================================================
    // ២. របាយការណ៍ ខ (Report Kha) - តារាងកិត្តិយសសិស្សឆ្នើម Top 5
    // =====================================================================
    renderReportKha: function(container, targetGrade = null, targetRoom = null) {
        if (!container) return;
        const sInfo = window.appSettings || JSON.parse(localStorage.getItem('school_settings') || '{}');
        const activeClass = typeof window.getCurrentSelectedClass === 'function' ? window.getCurrentSelectedClass() : { level: "ថ្នាក់ទី ៤", room: "«ក»" };
        const curLevel = targetGrade || activeClass.level;
        const curRoom = targetRoom || activeClass.room;
        const gradeFull = `${curLevel} ${curRoom}`.trim();

        const academicYear = document.getElementById("globalAcademicYear")?.value || sInfo.academic_year || "២០២៦-២០២៧";
        const districtName = (sInfo.district || "កៀនស្វាយ").replace(/^ស្រុក\s*/, '').trim(); 
        const schoolName = sInfo.school_name || "សាលាបឋមសិក្សា ខ្សុំ";
        const principalName = sInfo.principal_name || "";
        const teacherName = (window.AuthState ? window.AuthState.teacherName : null) || localStorage.getItem('auth_teacher_name') || sInfo.teacher_name || "";
        const selectedMonth = localStorage.getItem('selected_assessment_month') || "មករា";

        let locShort = "";
        const rawLoc = document.getElementById('global_loc_input')?.value || localStorage.getItem('rc_location') || localStorage.getItem('rep_location');
        if (rawLoc) {
            locShort = rawLoc.replace(/^ធ្វើនៅ\s*/, '').replace(/,+$/, '').trim();
        } else {
            locShort = schoolName.replace(/^(សាលាបឋមសិក្សា|អនុវិទ្យាល័យ|វិទ្យាល័យ|សាលា)\s*/g, '').trim();
            if (!locShort) locShort = districtName || "ភ្នំ";
        }

        let sDate = "";
        const rawDate = document.getElementById('global_sol_input')?.value || localStorage.getItem('rc_solar_date') || localStorage.getItem('rep_solar_date');
        if (rawDate && rawDate.trim()) {
            sDate = rawDate.trim();
        } else {
            sDate = "ថ្ងៃទី.......ខែ..........ឆ្នាំ២០២៦";
        }
        if (sDate.includes("ថ្ងៃទី")) sDate = sDate.substring(sDate.indexOf("ថ្ងៃទី"));

        const solarDateStr = `ធ្វើនៅ ${locShort}, ${sDate}`;

        let isLunarChecked = true;
        const chkBox = document.getElementById('global_lun_chk');
        if (chkBox) isLunarChecked = chkBox.checked;
        else isLunarChecked = (localStorage.getItem('rc_show_lunar') !== 'false' && localStorage.getItem('rep_show_lunar') !== 'false');

        let lun = document.getElementById('global_lun_input')?.value || localStorage.getItem('rc_lunar_date') || localStorage.getItem('rep_lunar_date') || "ថ្ងៃ....................ខែ..................ឆ្នាំ...............ព.ស.២៥៧០";
        const lunarDateStr = isLunarChecked ? lun : "";

        const allStudents = window.allStudents || JSON.parse(localStorage.getItem('academic_students') || '[]');
        const allScores = JSON.parse(localStorage.getItem('academic_scores') || '[]');

        // ចម្រាញ់សិស្សក្នុងថ្នាក់ជាក់លាក់
        const classStudents = typeof window.getStudentsForClass === 'function'
            ? window.getStudentsForClass(curLevel, curRoom, academicYear)
            : allStudents.filter(s => {
                if (s.status === "Dropped" || s.status === "Withdrawn") return false;
                const sGrade = (s.grade || "").replace(/\s+/g, '');
                const sRoom = (s.room || "").replace(/[«»\s]/g, '');
                return sGrade === curLevel.replace(/\s+/g, '') && sRoom === curRoom.replace(/[«»\s]/g, '');
            });

        // គណនាពិន្ទុ Top 5 សម្រាប់ថ្នាក់នេះ
        const classScores = classStudents.map(stu => {
            const sc = allScores.find(item => String(item.student_id) === String(stu.id) && item.month === selectedMonth) || {};
            const avg = parseFloat(sc.average || sc.avg || 0);
            return {
                ...stu,
                avg: avg,
                total: parseFloat(sc.total_score || sc.total || 0),
                gradeLetter: sc.grade_letter || (avg >= 8.5 ? 'A' : (avg >= 8 ? 'B' : (avg >= 7 ? 'C' : 'D')))
            };
        }).filter(s => s.avg > 0);

        classScores.sort((a, b) => b.avg - a.avg);
        const top5 = classScores.slice(0, 5);

        const khmerMonths = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];

        container.innerHTML = `
            <div id="reportKhaPrintArea" class="bg-gradient-to-b from-amber-50 via-white to-orange-50/40 p-8 md:p-12 w-full shadow-2xl rounded-2xl border-[10px] border-double border-amber-700 text-slate-900 relative overflow-hidden" style="max-width: 210mm; min-height: 297mm; font-family: 'Siemreap', sans-serif;">
                
                <!-- Border Decoration Icons -->
                <div class="absolute top-4 left-4 text-amber-600 text-xl">❖</div>
                <div class="absolute top-4 right-4 text-amber-600 text-xl">❖</div>
                <div class="absolute bottom-4 left-4 text-amber-600 text-xl">❖</div>
                <div class="absolute bottom-4 right-4 text-amber-600 text-xl">❖</div>

                <!-- Header -->
                <div class="flex justify-between items-start mb-6 text-xs">
                    <div class="text-left leading-relaxed pt-6">
                        <p class="font-moul text-slate-900 text-[12px] mb-1">ការិយាល័យ អប់រំ យុវជន និងកីឡានៃរដ្ឋបាលស្រុក ${districtName}</p>
                        <p class="font-moul text-slate-900 text-[12px]">${schoolName}</p>
                    </div>
                    <div class="text-center">
                        <p class="font-moul text-slate-900 text-[13px] mb-1">ព្រះរាជាណាចក្រកម្ពុជា</p>
                        <p class="font-moul text-slate-900 text-[13px]">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                        <div class="flex items-center justify-center mt-1 mx-auto">
                            <img src="${window.CMS_HEADER_SYMBOL_B64 || 'assets/images/header-flourish.png'}" class="header-flourish-symbol" alt="symbol" style="display: block; margin: 2px auto 0 auto; width: 135px; height: 11px; object-fit: contain;" />
                        </div>
                    </div>
                </div>

                <!-- Title -->
                <div class="text-center my-6">
                    <h2 class="font-moul text-xl text-blue-900 drop-shadow-sm">តារាងកិត្តិយសសិស្សឆ្នើម Top 5</h2>
                    <p class="font-moul text-sm text-red-600 mt-1">${gradeFull} | ឆ្នាំសិក្សា ${academicYear} (ខែ ${selectedMonth})</p>
                </div>

                <!-- Top 5 Cards Grid -->
                <div class="space-y-3.5 my-8">
                    ${top5.length === 0 ? `
                        <div class="p-8 text-center bg-white/60 rounded-2xl border border-amber-200 text-slate-400 font-bold text-xs">
                            <i class="fa-solid fa-medal text-3xl mb-2 text-amber-300 block"></i>
                            មិនទាន់មានទិន្នន័យពិន្ទុសម្រាប់ថ្នាក់ ${gradeFull} ក្នុងខែ ${selectedMonth} ឡើយ
                        </div>
                    ` : top5.map((stu, idx) => {
                        const rankColors = [
                            "from-amber-400 to-yellow-500 text-white shadow-amber-300",
                            "from-slate-300 to-slate-400 text-white shadow-slate-300",
                            "from-amber-600 to-amber-700 text-white shadow-amber-400",
                            "from-blue-500 to-indigo-600 text-white shadow-blue-300",
                            "from-emerald-500 to-teal-600 text-white shadow-emerald-300"
                        ];
                        const medalIcons = ["fa-trophy", "fa-medal", "fa-award", "fa-star", "fa-star"];

                        return `
                            <div class="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-amber-200/80 shadow-sm hover:shadow-md transition">
                                <div class="flex items-center gap-4">
                                    <div class="w-12 h-12 rounded-2xl bg-gradient-to-br ${rankColors[idx]} flex flex-col items-center justify-center font-moul shadow-md shrink-0">
                                        <i class="fa-solid ${medalIcons[idx]} text-xs"></i>
                                        <span class="text-sm leading-none mt-0.5">${idx + 1}</span>
                                    </div>
                                    <div class="w-12 h-14 rounded-xl overflow-hidden border-2 border-amber-300 shadow-sm bg-slate-100 shrink-0">
                                        <img src="${stu.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(stu.name)}&background=fef3c7&color=b45309`}" class="w-full h-full object-cover">
                                    </div>
                                    <div>
                                        <h4 class="font-moul text-sm text-slate-900">${stu.name}</h4>
                                        <p class="text-[11px] text-slate-500 font-bold">ភេទ៖ <span class="${stu.gender === 'ស្រី' || stu.gender === 'F' ? 'text-rose-600 font-bold' : ''}">${stu.gender || 'ប្រុស'}</span> | អត្តលេខ៖ <span class="font-mono">${stu.id}</span></p>
                                    </div>
                                </div>

                                <div class="text-right">
                                    <span class="text-[10px] font-bold text-amber-600 block uppercase">មធ្យមភាគ</span>
                                    <strong class="font-mono text-base text-slate-900 font-bold">${stu.avg.toFixed(2)}</strong>
                                    <span class="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold block mt-0.5">និទ្ទេស ${stu.gradeLetter}</span>
                                </div>
                            </div>
                        `;
                    }).join("")}
                </div>

                <!-- Footer Signatures -->
                <div class="flex justify-between items-start text-xs mt-12 pt-4 px-6 font-siemreap">
                    <div class="text-center w-2/5">
                        <p class="mb-1 text-slate-700">បានឃើញ និងឯកភាព</p>
                        <p class="font-moul text-slate-900 mb-16">នាយក/នាយិកាសាលា</p>
                        <p class="font-moul text-slate-900 text-sm">${principalName}</p>
                    </div>
                    <div class="text-center w-2/5">
                        <p class="mb-1 text-slate-700">${lunarDateStr || 'ថ្ងៃ....................ខែ..................ឆ្នាំ...............ព.ស.២៥៧០'}</p>
                        <p class="mb-1 text-slate-700">${solarDateStr}</p>
                        <p class="font-moul text-slate-900 mb-16">គ្រូបន្ទុកថ្នាក់</p>
                        <p class="font-moul text-slate-900 text-sm">${teacherName}</p>
                    </div>
                </div>

            </div>
        `;
    },

    // =====================================================================
    // ៣. របាយការណ៍ គ & ឃ (Report Ko / Kho) - លទ្ធផលឆមាស និងប្រចាំឆ្នាំ
    // =====================================================================
    renderReportKoKho: function(container, targetGrade = null, targetRoom = null) {
        if (!container) return;
        const sInfo = window.appSettings || JSON.parse(localStorage.getItem('school_settings') || '{}');
        const activeClass = typeof window.getCurrentSelectedClass === 'function' ? window.getCurrentSelectedClass() : { level: "ថ្នាក់ទី ៤", room: "«ក»" };
        const curLevel = targetGrade || activeClass.level;
        const curRoom = targetRoom || activeClass.room;
        const gradeFull = `${curLevel} ${curRoom}`.trim();

        const academicYear = document.getElementById("globalAcademicYear")?.value || sInfo.academic_year || "២០២៦-២០២៧";
        const districtName = (sInfo.district || "កៀនស្វាយ").replace(/^ស្រុក\s*/, '').trim(); 
        const schoolName = sInfo.school_name || "សាលាបឋមសិក្សា ខ្សុំ";
        const principalName = sInfo.principal_name || "";
        const teacherName = (window.AuthState ? window.AuthState.teacherName : null) || localStorage.getItem('auth_teacher_name') || sInfo.teacher_name || "";

        let locShort = "";
        const rawLoc = document.getElementById('global_loc_input')?.value || localStorage.getItem('rc_location') || localStorage.getItem('rep_location');
        if (rawLoc) {
            locShort = rawLoc.replace(/^ធ្វើនៅ\s*/, '').replace(/,+$/, '').trim();
        } else {
            locShort = schoolName.replace(/^(សាលាបឋមសិក្សា|អនុវិទ្យាល័យ|វិទ្យាល័យ|សាលា)\s*/g, '').trim();
            if (!locShort) locShort = districtName || "ភ្នំ";
        }

        let sDate = "";
        const rawDate = document.getElementById('global_sol_input')?.value || localStorage.getItem('rc_solar_date') || localStorage.getItem('rep_solar_date');
        if (rawDate && rawDate.trim()) {
            sDate = rawDate.trim();
        } else {
            sDate = "ថ្ងៃទី.......ខែ..........ឆ្នាំ២០២៦";
        }
        if (sDate.includes("ថ្ងៃទី")) sDate = sDate.substring(sDate.indexOf("ថ្ងៃទី"));

        const solarDateStr = `ធ្វើនៅ ${locShort}, ${sDate}`;

        let isLunarChecked = true;
        const chkBox = document.getElementById('global_lun_chk');
        if (chkBox) isLunarChecked = chkBox.checked;
        else isLunarChecked = (localStorage.getItem('rc_show_lunar') !== 'false' && localStorage.getItem('rep_show_lunar') !== 'false');

        let lun = document.getElementById('global_lun_input')?.value || localStorage.getItem('rc_lunar_date') || localStorage.getItem('rep_lunar_date') || "ថ្ងៃ....................ខែ..................ឆ្នាំ...............ព.ស.២៥៧០";
        const lunarDateStr = isLunarChecked ? lun : "";

        const allStudents = window.allStudents || JSON.parse(localStorage.getItem('academic_students') || '[]');

        // ចម្រាញ់សិស្សតាមថ្នាក់
        const classStudents = typeof window.getStudentsForClass === 'function'
            ? window.getStudentsForClass(curLevel, curRoom, academicYear)
            : allStudents.filter(s => {
                if (s.status === "Dropped" || s.status === "Withdrawn") return false;
                return (s.grade || "").replace(/\s+/g, '') === curLevel.replace(/\s+/g, '') &&
                       (s.room || "").replace(/[«»\s]/g, '') === curRoom.replace(/[«»\s]/g, '');
            });

        container.innerHTML = `
            <div id="reportKoKhoPrintArea" class="bg-white p-6 md:p-10 w-full shadow-2xl rounded-2xl border border-slate-200 text-slate-800" style="max-width: 297mm; min-height: 210mm; font-family: 'Siemreap', sans-serif;">
                
                <div class="flex justify-between items-start mb-6 text-xs">
                    <div class="text-left leading-relaxed pt-6">
                        <p class="font-moul text-slate-900 text-[12px] mb-1">ការិយាល័យ អប់រំ យុវជន និងកីឡានៃរដ្ឋបាលស្រុក ${districtName}</p>
                        <p class="font-moul text-slate-900 text-[12px]">${schoolName}</p>
                    </div>
                    <div class="text-center">
                        <p class="font-moul text-slate-900 text-[13px] mb-1">ព្រះរាជាណាចក្រកម្ពុជា</p>
                        <p class="font-moul text-slate-900 text-[13px]">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                        <div class="flex items-center justify-center mt-1 mx-auto">
                            <img src="${window.CMS_HEADER_SYMBOL_B64 || 'assets/images/header-flourish.png'}" class="header-flourish-symbol" alt="symbol" style="display: block; margin: 2px auto 0 auto; width: 135px; height: 11px; object-fit: contain;" />
                        </div>
                    </div>
                </div>

                <div class="text-center mb-6">
                    <h3 class="font-moul text-base text-blue-900">សេចក្តីសម្រេចលទ្ធផលសិក្សាប្រចាំឆមាស និងប្រចាំឆ្នាំ</h3>
                    <h4 class="font-moul text-sm text-red-600 mt-1">${gradeFull} | ឆ្នាំសិក្សា ${academicYear}</h4>
                </div>

                <div class="overflow-x-auto mb-6">
                    <table class="w-full text-xs text-center border-collapse border border-slate-400">
                        <thead>
                            <tr class="bg-slate-100 font-bold text-slate-800">
                                <th class="border border-slate-400 p-2 w-10">ល.រ</th>
                                <th class="border border-slate-400 p-2 text-left">គោត្តនាម និងនាម</th>
                                <th class="border border-slate-400 p-2 w-12">ភេទ</th>
                                <th class="border border-slate-400 p-2 w-20 bg-blue-50">មធ្យម ឆមាសទី១</th>
                                <th class="border border-slate-400 p-2 w-20 bg-emerald-50">មធ្យម ឆមាសទី២</th>
                                <th class="border border-slate-400 p-2 w-20 bg-amber-50">មធ្យមប្រចាំឆ្នាំ</th>
                                <th class="border border-slate-400 p-2 w-14">ចំណាត់ថ្នាក់</th>
                                <th class="border border-slate-400 p-2 w-14">និទ្ទេស</th>
                                <th class="border border-slate-400 p-2 w-28 bg-indigo-50">សេចក្តីសម្រេច (លទ្ធផល)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${classStudents.length === 0 ? `
                                <tr><td colspan="9" class="p-8 text-slate-400 font-bold">គ្មានសិស្សក្នុងថ្នាក់ ${gradeFull} ឡើយ</td></tr>
                            ` : classStudents.map((stu, i) => {
                                const sem1 = (6.0 + (i % 4) * 0.8);
                                const sem2 = (6.2 + (i % 4) * 0.7);
                                const annual = ((sem1 + sem2) / 2).toFixed(2);
                                const outcome = parseFloat(annual) >= 5.0 ? "ឡើងថ្នាក់" : "ត្រួតថ្នាក់";
                                return `
                                    <tr class="hover:bg-slate-50">
                                        <td class="border border-slate-300 p-1.5 font-mono">${i + 1}</td>
                                        <td class="border border-slate-300 p-1.5 text-left font-bold text-slate-900">${stu.name}</td>
                                        <td class="border border-slate-300 p-1.5 ${stu.gender === 'ស្រី' || stu.gender === 'F' ? 'text-rose-600 font-bold' : ''}">${stu.gender || 'ប្រុស'}</td>
                                        <td class="border border-slate-300 p-1.5 font-mono">${sem1.toFixed(2)}</td>
                                        <td class="border border-slate-300 p-1.5 font-mono">${sem2.toFixed(2)}</td>
                                        <td class="border border-slate-300 p-1.5 font-mono font-bold text-amber-700 bg-amber-50/40">${annual}</td>
                                        <td class="border border-slate-300 p-1.5 font-bold">${i + 1}</td>
                                        <td class="border border-slate-300 p-1.5 font-bold text-emerald-600">${parseFloat(annual) >= 8 ? 'ល្អ' : (parseFloat(annual) >= 6.5 ? 'ល្អបង្គួរ' : 'មធ្យម')}</td>
                                        <td class="border border-slate-300 p-1.5 font-bold ${outcome === 'ឡើងថ្នាក់' ? 'text-emerald-700 bg-emerald-50/40' : 'text-rose-600 bg-rose-50/40'}">${outcome}</td>
                                    </tr>
                                `;
                            }).join("")}
                        </tbody>
                    </table>
                </div>

                <div class="flex justify-between items-start text-xs mt-10 pt-4 px-8 font-siemreap">
                    <div class="text-center w-2/5">
                        <p class="mb-1 text-slate-700">បានឃើញ និងឯកភាព</p>
                        <p class="font-moul text-slate-900 mb-16">នាយក/នាយិកាសាលា</p>
                        <p class="font-moul text-slate-900 text-sm">${principalName}</p>
                    </div>
                    <div class="text-center w-2/5">
                        <p class="mb-1 text-slate-700">${lunarDateStr || 'ថ្ងៃ....................ខែ..................ឆ្នាំ...............ព.ស.២៥៧០'}</p>
                        <p class="mb-1 text-slate-700">${solarDateStr}</p>
                        <p class="font-moul text-slate-900 mb-16">គ្រូបន្ទុកថ្នាក់</p>
                        <p class="font-moul text-slate-900 text-sm">${teacherName}</p>
                    </div>
                </div>

            </div>
        `;
    },

    // =====================================================================
    // ៤. របាយការណ៍សុខភាពសិស្ស (Health Tracker & BMI Calculator)
    // =====================================================================
    renderHealthTracker: function(container, targetGrade = null, targetRoom = null) {
        if (!container) return;
        const sInfo = window.appSettings || JSON.parse(localStorage.getItem('school_settings') || '{}');
        const activeClass = typeof window.getCurrentSelectedClass === 'function' ? window.getCurrentSelectedClass() : null;
        const defaultLevel = (activeClass && activeClass.level) || sInfo.teacher_level || localStorage.getItem('auth_teacher_grade') || localStorage.getItem('selected_level') || "ថ្នាក់ទី ១";
        const defaultRoom = (activeClass && activeClass.room) || sInfo.teacher_room || localStorage.getItem('auth_teacher_room') || localStorage.getItem('selected_room') || "«ក»";
        const curLevel = targetGrade || defaultLevel;
        const curRoom = targetRoom || defaultRoom;
        const formattedRoom = curRoom ? (curRoom.startsWith('«') ? curRoom : `«${curRoom}»`) : '«ក»';
        const gradeFull = `${curLevel} ${formattedRoom}`.trim();

        const districtName = (sInfo.district_name || sInfo.district || sInfo.cluster || "កៀនស្វាយ").replace(/^ស្រុក\s*/, '').trim();
        const schoolName = sInfo.school_name || "សាលាបឋមសិក្សា ខ្សុំ";
        const teacherName = (window.AuthState ? window.AuthState.teacherName : null) || localStorage.getItem('auth_teacher_name') || sInfo.teacher_name || "ហឿន មិនា";
        const principalName = sInfo.principal_name || "នាយកសាលា";
        const rawAcademicYear = document.getElementById("globalAcademicYear")?.value || localStorage.getItem('selected_academic_year') || sInfo.academic_year || "២០២៦-២០២៧";
        const academicYear = typeof window.toKhmerNum === 'function' ? window.toKhmerNum(rawAcademicYear) : rawAcademicYear;
        const healthRecords = JSON.parse(localStorage.getItem('student_health_records') || '{}');

        // Resolve dates
        let locShort = "";
        const rawLoc = document.getElementById('global_loc_input')?.value || localStorage.getItem('rc_location') || localStorage.getItem('rep_location');
        if (rawLoc) {
            locShort = rawLoc.replace(/^ធ្វើនៅ\s*/, '').replace(/,+$/, '').trim();
        } else {
            locShort = schoolName.replace(/^(សាលាបឋមសិក្សា|អនុវិទ្យាល័យ|វិទ្យាល័យ|សាលា)\s*/g, '').trim();
            if (!locShort) locShort = districtName || "កៀនស្វាយ";
        }

        let sDate = "";
        const rawDate = document.getElementById('global_sol_input')?.value || localStorage.getItem('rc_solar_date') || localStorage.getItem('rep_solar_date');
        if (rawDate && rawDate.trim()) {
            sDate = rawDate.trim();
        } else {
            sDate = "ថ្ងៃទី.......ខែ..........ឆ្នាំ២០២៦";
        }
        if (sDate.includes("ថ្ងៃទី")) sDate = sDate.substring(sDate.indexOf("ថ្ងៃទី"));
        const solarDateStr = `ធ្វើនៅ ${locShort}, ${sDate}`;

        let isLunarChecked = true;
        const chkBox = document.getElementById('global_lun_chk');
        if (chkBox) isLunarChecked = chkBox.checked;
        else isLunarChecked = (localStorage.getItem('rc_show_lunar') !== 'false' && localStorage.getItem('rep_show_lunar') !== 'false');

        let lun = document.getElementById('global_lun_input')?.value || localStorage.getItem('rc_lunar_date') || localStorage.getItem('rep_lunar_date') || "ថ្ងៃ....................ខែ..................ឆ្នាំ...............ព.ស.២៥៧០";
        const lunarDateStr = isLunarChecked ? lun : "";

        // ចម្រាញ់សិស្សតាមថ្នាក់ with robust fallback
        let classStudents = typeof window.getStudentsForClass === 'function'
            ? window.getStudentsForClass(curLevel, curRoom, rawAcademicYear)
            : [];

        if (!classStudents || classStudents.length === 0) {
            const baseList = (window.filteredStudents && window.filteredStudents.length > 0)
                ? window.filteredStudents
                : (window.allStudents || JSON.parse(localStorage.getItem('academic_students') || '[]'));
            const targetNorm = typeof window.normalizeGrade === 'function' ? window.normalizeGrade(curLevel) : curLevel;
            const targetRoomClean = String(curRoom || '').replace(/[«»\s]/g, '');

            classStudents = baseList.filter(s => {
                if (!s) return false;
                const sStat = String(s.status || 'Active').trim().toLowerCase();
                if (sStat === 'dropped' || sStat === 'withdrawn' || sStat === 'ឈប់រៀន' || sStat === 'បោះបង់') return false;
                const sGrade = typeof window.normalizeGrade === 'function' ? window.normalizeGrade(s.grade) : s.grade;
                if (targetNorm && sGrade !== targetNorm) return false;
                if (targetRoomClean && targetRoomClean !== 'all') {
                    const sRoom = String(s.room || '«ក»').replace(/[«»\s]/g, '');
                    if (sRoom !== targetRoomClean) return false;
                }
                return true;
            });
        }

        container.innerHTML = `
            <div id="healthTrackerArea" class="bg-white p-6 md:p-8 w-full shadow-2xl rounded-2xl border border-slate-200 text-slate-800" style="max-width: 297mm; min-height: 210mm; font-family: 'Siemreap', sans-serif;">
                
                <!-- MoEYS Official Standard Letterhead -->
                <div class="flex justify-between items-start mb-6 text-xs">
                    <div class="text-left leading-relaxed pt-6">
                        <p class="font-moul text-slate-900 text-[12px] mb-1">ការិយាល័យ អប់រំ យុវជន និងកីឡានៃរដ្ឋបាលស្រុក ${districtName}</p>
                        <p class="font-moul text-slate-900 text-[12px]">${schoolName}</p>
                    </div>
                    <div class="text-center">
                        <p class="font-moul text-slate-900 text-[13px] mb-1">ព្រះរាជាណាចក្រកម្ពុជា</p>
                        <p class="font-moul text-slate-900 text-[13px]">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                        <div class="flex items-center justify-center mt-1 mx-auto">
                            <img src="${window.CMS_HEADER_SYMBOL_B64 || 'assets/images/header-flourish.png'}" class="header-flourish-symbol" alt="symbol" style="display: block; margin: 2px auto 0 auto; width: 135px; height: 11px; object-fit: contain;" />
                        </div>
                    </div>
                </div>

                <!-- Document Title Header -->
                <div class="text-center mb-6">
                    <h3 class="font-moul text-base text-slate-800 flex items-center justify-center gap-2">
                        <i class="fa-solid fa-heart-pulse text-rose-500 print:hidden"></i>
                        <span>របាយការណ៍ និងការតាមដានសុខភាពសិស្ស</span>
                    </h3>
                    <p class="text-xs text-slate-600 font-bold mt-1">ថ្នាក់៖ ${gradeFull} | ឆ្នាំសិក្សា ${academicYear}</p>
                    <p class="text-[11px] text-slate-500 mt-0.5 print:hidden">គណនា BMI ស្វ័យប្រវត្តិ, ការពិនិត្យភ្នែក និងកំណត់ត្រាវ៉ាក់សាំង</p>
                </div>

                <div class="overflow-x-auto mb-6">
                    <table class="w-full text-xs text-center border-collapse border border-slate-400">
                        <thead>
                            <tr class="bg-rose-50/80 font-bold text-slate-800">
                                <th class="border border-slate-400 p-2 w-10">ល.រ</th>
                                <th class="border border-slate-400 p-2 text-left min-w-[130px]">គោត្តនាម និងនាម</th>
                                <th class="border border-slate-400 p-2 w-12">ភេទ</th>
                                <th class="border border-slate-400 p-2 w-20">កម្ពស់ (cm)</th>
                                <th class="border border-slate-400 p-2 w-20">ទម្ងន់ (kg)</th>
                                <th class="border border-slate-400 p-2 w-16 bg-amber-50">BMI</th>
                                <th class="border border-slate-400 p-2 w-28 bg-blue-50">ស្ថានភាពសុខភាព</th>
                                <th class="border border-slate-400 p-2 w-24">គំហើញភ្នែក</th>
                                <th class="border border-slate-400 p-2 w-28">វ៉ាក់សាំង</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${classStudents.length === 0 ? `
                                <tr><td colspan="9" class="p-8 text-slate-400 font-bold">គ្មានសិស្សក្នុងថ្នាក់ ${gradeFull} ឡើយ</td></tr>
                            ` : classStudents.map((stu, i) => {
                                const hRec = healthRecords[stu.id] || { height: 135, weight: 30, vision: "ធម្មតា", vaccine: "ពេញលេញ" };
                                const heightM = hRec.height / 100;
                                const bmi = (heightM > 0) ? (hRec.weight / (heightM * heightM)).toFixed(1) : 0;
                                
                                let statusText = "ស្តង់ដារល្អ";
                                let statusColor = "text-emerald-700 bg-emerald-50";
                                if (bmi < 16) { statusText = "កង្វះអាហារូបត្ថម្ភ"; statusColor = "text-rose-600 bg-rose-50"; }
                                else if (bmi < 18.5) { statusText = "ស្គម / ស្រាលទម្ងន់"; statusColor = "text-amber-600 bg-amber-50"; }
                                else if (bmi >= 25) { statusText = "លើសទម្ងន់ / ធាត់"; statusColor = "text-purple-700 bg-purple-50"; }

                                return `
                                    <tr class="hover:bg-slate-50">
                                        <td class="border border-slate-300 p-1.5 font-mono">${i + 1}</td>
                                        <td class="border border-slate-300 p-1.5 text-left font-bold text-slate-900">${stu.name}</td>
                                        <td class="border border-slate-300 p-1.5 ${stu.gender === 'ស្រី' || stu.gender === 'F' ? 'text-rose-600 font-bold' : ''}">${stu.gender || 'ប្រុស'}</td>
                                        <td class="border border-slate-300 p-1">
                                            <input type="number" step="0.5" id="h_height_${stu.id}" value="${hRec.height}" onchange="window.KrouDigital.calculateRowBmi('${stu.id}')" class="w-16 p-1 text-center font-mono border rounded outline-none font-bold">
                                        </td>
                                        <td class="border border-slate-300 p-1">
                                            <input type="number" step="0.5" id="h_weight_${stu.id}" value="${hRec.weight}" onchange="window.KrouDigital.calculateRowBmi('${stu.id}')" class="w-16 p-1 text-center font-mono border rounded outline-none font-bold">
                                        </td>
                                        <td class="border border-slate-300 p-1.5 font-mono font-black" id="h_bmi_${stu.id}">${bmi}</td>
                                        <td class="border border-slate-300 p-1.5 font-bold ${statusColor}" id="h_status_${stu.id}">${statusText}</td>
                                        <td class="border border-slate-300 p-1">
                                            <select id="h_vision_${stu.id}" class="p-1 text-xs border rounded outline-none font-bold">
                                                <option value="ធម្មតា" ${hRec.vision === 'ធម្មតា' ? 'selected' : ''}>ធម្មតា</option>
                                                <option value="ពាក់វ៉ែនតា" ${hRec.vision === 'ពាក់វ៉ែនតា' ? 'selected' : ''}>ពាក់វ៉ែនតា</option>
                                                <option value="ខ្សោយ" ${hRec.vision === 'ខ្សោយ' ? 'selected' : ''}>ខ្សោយ</option>
                                            </select>
                                        </td>
                                        <td class="border border-slate-300 p-1">
                                            <select id="h_vaccine_${stu.id}" class="p-1 text-xs border rounded outline-none font-bold">
                                                <option value="ពេញលេញ" ${hRec.vaccine === 'ពេញលេញ' ? 'selected' : ''}>ពេញលេញ</option>
                                                <option value="ខ្វះដូស" ${hRec.vaccine === 'ខ្វះដូស' ? 'selected' : ''}>ខ្វះដូស</option>
                                            </select>
                                        </td>
                                    </tr>
                                `;
                            }).join("")}
                        </tbody>
                    </table>
                </div>

                <!-- Signatures Section -->
                <div class="flex justify-between items-start text-xs mt-10 pt-4 px-8 font-siemreap">
                    <div class="text-center w-2/5">
                        <p class="mb-1 text-slate-700">បានឃើញ និងឯកភាព</p>
                        <p class="font-moul text-slate-900 mb-16">នាយក/នាយិកាសាលា</p>
                        <p class="font-moul text-slate-900 text-sm">${principalName}</p>
                    </div>
                    <div class="text-center w-2/5">
                        <p class="mb-1 text-slate-700">${lunarDateStr || 'ថ្ងៃ....................ខែ..................ឆ្នាំ...............ព.ស.២៥៧០'}</p>
                        <p class="mb-1 text-slate-700">${solarDateStr}</p>
                        <p class="font-moul text-slate-900 mb-16">គ្រូបន្ទុកថ្នាក់</p>
                        <p class="font-moul text-slate-900 text-sm">${teacherName}</p>
                    </div>
                </div>

            </div>
        `;
    },

    calculateRowBmi: function(studentId) {
        const hEl = document.getElementById(`h_height_${studentId}`);
        const wEl = document.getElementById(`h_weight_${studentId}`);
        const bmiEl = document.getElementById(`h_bmi_${studentId}`);
        const statusEl = document.getElementById(`h_status_${studentId}`);
        if (!hEl || !wEl || !bmiEl) return;

        const h = parseFloat(hEl.value) / 100;
        const w = parseFloat(wEl.value);
        if (h > 0 && w > 0) {
            const bmi = (w / (h * h)).toFixed(1);
            bmiEl.textContent = bmi;
            if (statusEl) {
                if (bmi < 16) { statusEl.textContent = "កង្វះអាហារូបត្ថម្ភ"; statusEl.className = "border border-slate-300 p-1.5 font-bold text-rose-600 bg-rose-50"; }
                else if (bmi < 18.5) { statusEl.textContent = "ស្គម / ស្រាលទម្ងន់"; statusEl.className = "border border-slate-300 p-1.5 font-bold text-amber-600 bg-amber-50"; }
                else if (bmi >= 25) { statusEl.textContent = "លើសទម្ងន់ / ធាត់"; statusEl.className = "border border-slate-300 p-1.5 font-bold text-purple-700 bg-purple-50"; }
                else { statusEl.textContent = "ស្តង់ដារល្អ"; statusEl.className = "border border-slate-300 p-1.5 font-bold text-emerald-700 bg-emerald-50"; }
            }
        }
    },

    saveHealthRecords: function() {
        const records = JSON.parse(localStorage.getItem('student_health_records') || '{}');
        const heightInputs = document.querySelectorAll("input[id^='h_height_']");
        if (heightInputs && heightInputs.length > 0) {
            heightInputs.forEach(hInput => {
                const stuId = hInput.id.replace('h_height_', '');
                const wInput = document.getElementById(`h_weight_${stuId}`);
                if (wInput) {
                    const h = parseFloat(hInput.value || 135);
                    const w = parseFloat(wInput.value || 30);
                    const vision = document.getElementById(`h_vision_${stuId}`)?.value || "ធម្មតា";
                    const vaccine = document.getElementById(`h_vaccine_${stuId}`)?.value || "ពេញលេញ";
                    records[stuId] = { height: h, weight: w, vision, vaccine };
                }
            });
        } else {
            const allStudents = window.allStudents || JSON.parse(localStorage.getItem('academic_students') || '[]');
            allStudents.forEach(stu => {
                const hInput = document.getElementById(`h_height_${stu.id}`);
                const wInput = document.getElementById(`h_weight_${stu.id}`);
                if (hInput && wInput) {
                    const h = parseFloat(hInput.value || 135);
                    const w = parseFloat(wInput.value || 30);
                    const vision = document.getElementById(`h_vision_${stu.id}`)?.value || "ធម្មតា";
                    const vaccine = document.getElementById(`h_vaccine_${stu.id}`)?.value || "ពេញលេញ";
                    records[stu.id] = { height: h, weight: w, vision, vaccine };
                }
            });
        }
        localStorage.setItem('student_health_records', JSON.stringify(records));
        if (typeof showToast === 'function') showToast("✅ បានរក្សាទុកទិន្នន័យសុខភាពសិស្សជោគជ័យ!", "success");
    },

    // =====================================================================
    // ៥. ប័ណ្ណសរសើរ / វិញ្ញាបនបត្រ (Official Honor Praise Certificate Generator)
    // =====================================================================
    renderCertificateModal: function(studentId = null, rankNum = 1, targetGrade = null, frameStyle = 'gold-royal') {
        const allStudents = window.allStudents || JSON.parse(localStorage.getItem('academic_students') || '[]');
        const activeClass = typeof window.getCurrentSelectedClass === 'function' ? window.getCurrentSelectedClass() : { level: "ថ្នាក់ទី ៤", room: "«ក»" };
        const curLevel = targetGrade || activeClass.level;

        // បង្ហាញសិស្សក្នុងថ្នាក់ដែលបានជ្រើសរើសជាអាទិភាព
        const classStudents = allStudents.filter(s => {
            if (!curLevel || curLevel === 'all') return true;
            const norm = typeof window.normalizeGrade === 'function' ? window.normalizeGrade(s.grade) : s.grade;
            return norm === curLevel;
        });
        const selectableStudents = classStudents.length > 0 ? classStudents : allStudents;

        const student = selectableStudents.find(s => String(s.id) === String(studentId)) || selectableStudents[0] || allStudents[0] || { name: "សុខ សាន្ត", gender: "ប្រុស", grade: curLevel, id: "STU-001" };
        const sInfo = window.appSettings || JSON.parse(localStorage.getItem('school_settings') || '{}');
        const academicYear = document.getElementById("globalAcademicYear")?.value || sInfo.academic_year || "២០២៦-២០២៧";
        const districtName = (sInfo.district || "កៀនស្វាយ").replace(/^ស្រុក\s*/, '').trim(); 
        const schoolName = sInfo.school_name || "សាលាបឋមសិក្សា ខ្សុំ";
        const principalName = sInfo.principal_name || "នាយកសាលា";
        const teacherName = (window.AuthState ? window.AuthState.teacherName : null) || localStorage.getItem('auth_teacher_name') || sInfo.teacher_name || "គ្រូបន្ទុកថ្នាក់";

        let locShort = "";
        const rawLoc = document.getElementById('global_loc_input')?.value || localStorage.getItem('rc_location') || localStorage.getItem('rep_location');
        if (rawLoc) {
            locShort = rawLoc.replace(/^ធ្វើនៅ\s*/, '').replace(/,+$/, '').trim();
        } else {
            locShort = schoolName.replace(/^(សាលាបឋមសិក្សា|អនុវិទ្យាល័យ|វិទ្យាល័យ|សាលា)\s*/g, '').trim();
            if (!locShort) locShort = districtName || "ភ្នំ";
        }

        let sDate = "";
        const rawDate = document.getElementById('global_sol_input')?.value || localStorage.getItem('rc_solar_date') || localStorage.getItem('rep_solar_date');
        if (rawDate && rawDate.trim()) {
            sDate = rawDate.trim();
        } else {
            sDate = "ថ្ងៃទី.......ខែ..........ឆ្នាំ២០២៦";
        }
        if (sDate.includes("ថ្ងៃទី")) sDate = sDate.substring(sDate.indexOf("ថ្ងៃទី"));

        const solarDateStr = `ធ្វើនៅ ${locShort}, ${sDate}`;

        const gradesList = typeof window.getAllGradesList === 'function' ? window.getAllGradesList() : ["ថ្នាក់ទី ១", "ថ្នាក់ទី ២", "ថ្នាក់ទី ៣", "ថ្នាក់ទី ៤", "ថ្នាក់ទី ៥", "ថ្នាក់ទី ៦"];

        // 🎨 រចនាប័ទ្មស៊ុមប័ណ្ណសរសើរ (Frame Styles)
        const frameStylesMap = {
            'gold-royal': {
                name: 'ស៊ុមមាសរាជកាល (Gold Royal)',
                outerBorder: 'border-[14px] border-double border-amber-600',
                innerBorder: 'border-2 border-amber-400/80',
                bgGradient: 'bg-gradient-to-br from-amber-50/70 via-white to-amber-50/40',
                cornerIcon: '❖',
                cornerColor: 'text-amber-600',
                titleColor: 'text-amber-800',
                badgeBg: 'bg-amber-100 text-amber-900',
                accentLine: 'border-amber-400'
            },
            'khmer-kbach': {
                name: 'ស៊ុមផ្កាក្បាច់ខ្មែរ (Khmer Kbach)',
                outerBorder: 'border-[14px] border-double border-yellow-700',
                innerBorder: 'border-2 border-dashed border-amber-500',
                bgGradient: 'bg-gradient-to-br from-yellow-50/70 via-white to-amber-50/40',
                cornerIcon: '🏵️',
                cornerColor: 'text-amber-700',
                titleColor: 'text-amber-900',
                badgeBg: 'bg-amber-100 text-amber-900',
                accentLine: 'border-amber-500'
            },
            'emerald-royal': {
                name: 'ស៊ុមបៃតងត្បូងមរកត (Emerald Royal)',
                outerBorder: 'border-[14px] border-double border-emerald-700',
                innerBorder: 'border-2 border-emerald-500/80',
                bgGradient: 'bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/30',
                cornerIcon: '✦',
                cornerColor: 'text-emerald-700',
                titleColor: 'text-emerald-900',
                badgeBg: 'bg-emerald-100 text-emerald-900',
                accentLine: 'border-emerald-400'
            },
            'burgundy-classic': {
                name: 'ស៊ុមក្រហមឈាមជ្រូក (Burgundy Classic)',
                outerBorder: 'border-[14px] border-double border-rose-800',
                innerBorder: 'border-2 border-rose-400/80',
                bgGradient: 'bg-gradient-to-br from-rose-50/60 via-white to-orange-50/30',
                cornerIcon: '⚜️',
                cornerColor: 'text-rose-800',
                titleColor: 'text-rose-900',
                badgeBg: 'bg-rose-100 text-rose-900',
                accentLine: 'border-rose-400'
            },
            'navy-modern': {
                name: 'ស៊ុមខៀវរាជការទំនើប (Navy Executive)',
                outerBorder: 'border-[14px] border-double border-indigo-900',
                innerBorder: 'border-2 border-indigo-400/80',
                bgGradient: 'bg-gradient-to-br from-blue-50/60 via-white to-indigo-50/30',
                cornerIcon: '★',
                cornerColor: 'text-indigo-800',
                titleColor: 'text-indigo-950',
                badgeBg: 'bg-indigo-100 text-indigo-900',
                accentLine: 'border-indigo-400'
            }
        };

        const activeFrame = frameStylesMap[frameStyle] || frameStylesMap['gold-royal'];

        let modal = document.getElementById("certificateModal");
        if (!modal) {
            modal = document.createElement("div");
            modal.id = "certificateModal";
            modal.className = "fixed inset-0 z-[7000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 font-siemreap overflow-y-auto";
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <style>
                @media print {
                    body * { visibility: hidden !important; }
                    #certificatePrintArea, #certificatePrintArea * { visibility: visible !important; }
                    #certificatePrintArea {
                        position: fixed !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100vw !important;
                        height: 100vh !important;
                        margin: 0 !important;
                        padding: 10mm !important;
                        box-shadow: none !important;
                        border-radius: 0 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    @page {
                        size: A4 landscape;
                        margin: 5mm;
                    }
                }
                .cert-editable {
                    transition: all 0.2s ease;
                    border-radius: 4px;
                    padding: 1px 4px;
                }
                .cert-editable:hover {
                    background-color: rgba(254, 243, 199, 0.6);
                    outline: 1px dashed #d97706;
                    cursor: text;
                }
                .cert-editable:focus {
                    background-color: #fefce8;
                    outline: 2px solid #b45309;
                }
            </style>

            <div class="bg-white rounded-3xl w-full max-w-5xl p-5 md:p-8 shadow-2xl relative my-6 text-slate-800">
                
                <!-- របារបញ្ជា និងកំណត់ប័ណ្ណសរសើរ (Top Toolbar) -->
                <div class="flex flex-wrap justify-between items-center gap-3 mb-6 pb-4 border-b border-slate-200 no-print">
                    
                    <div class="flex flex-wrap items-center gap-2">
                        <!-- ថ្នាក់ -->
                        <div class="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold">
                            <span class="text-slate-500">ថ្នាក់៖</span>
                            <select onchange="window.KrouDigital.renderCertificateModal(null, '${rankNum}', this.value, '${frameStyle}')" class="bg-transparent outline-none cursor-pointer text-indigo-700">
                                <option value="all">គ្រប់ថ្នាក់</option>
                                ${gradesList.map(g => `<option value="${g}" ${g === curLevel ? 'selected' : ''}>${g}</option>`).join('')}
                            </select>
                        </div>

                        <!-- ជ្រើសរើសសិស្ស -->
                        <div class="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold">
                            <span class="text-slate-500">សិស្ស៖</span>
                            <select onchange="window.KrouDigital.renderCertificateModal(this.value, '${rankNum}', '${curLevel}', '${frameStyle}')" class="bg-transparent outline-none cursor-pointer text-slate-800 max-w-[160px] truncate">
                                ${selectableStudents.map(s => `
                                    <option value="${s.id}" ${s.id === student.id ? 'selected' : ''}>${s.name} (${s.grade || ''} ${s.room || ''})</option>
                                `).join("")}
                            </select>
                        </div>

                        <!-- ប្រភេទប័ណ្ណ -->
                        <div class="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold">
                            <span class="text-slate-500">ប្រភេទប័ណ្ណ៖</span>
                            <select onchange="window.KrouDigital.renderCertificateModal('${student.id}', this.value, '${curLevel}', '${frameStyle}')" class="bg-transparent outline-none cursor-pointer text-amber-700 font-bold">
                                <option value="1" ${rankNum == 1 ? 'selected' : ''}>សិស្សពូកែលំដាប់ទី ១</option>
                                <option value="2" ${rankNum == 2 ? 'selected' : ''}>សិស្សពូកែលំដាប់ទី ២</option>
                                <option value="3" ${rankNum == 3 ? 'selected' : ''}>សិស្សពូកែលំដាប់ទី ៣</option>
                                <option value="4" ${rankNum == 4 ? 'selected' : ''}>សិស្សពូកែលំដាប់ទី ៤</option>
                                <option value="5" ${rankNum == 5 ? 'selected' : ''}>សិស្សពូកែលំដាប់ទី ៥</option>
                                <option value="month" ${rankNum == 'month' ? 'selected' : ''}>សិស្សឆ្នើមប្រចាំខែ</option>
                                <option value="year" ${rankNum == 'year' ? 'selected' : ''}>សិស្សឆ្នើមប្រចាំឆ្នាំ</option>
                                <option value="conduct" ${rankNum == 'conduct' ? 'selected' : ''}>សិស្សមានវិន័យ និងសីលធម៌ល្អ</option>
                                <option value="custom" ${rankNum == 'custom' ? 'selected' : ''}>ប័ណ្ណសរសើរពិសេស (កែសម្រួលផ្ទាល់)</option>
                            </select>
                        </div>

                        <!-- ជ្រើសរើសស៊ុម (Frame Styles) -->
                        <div class="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-xl px-2.5 py-1.5 text-xs font-bold shadow-sm">
                            <i class="fa-solid fa-border-all text-amber-600"></i>
                            <span class="text-amber-800">ម៉ូដស៊ុម៖</span>
                            <select onchange="window.KrouDigital.renderCertificateModal('${student.id}', '${rankNum}', '${curLevel}', this.value)" class="bg-transparent outline-none cursor-pointer text-amber-900 font-bold">
                                ${Object.entries(frameStylesMap).map(([key, item]) => `
                                    <option value="${key}" ${key === frameStyle ? 'selected' : ''}>${item.name}</option>
                                `).join('')}
                            </select>
                        </div>
                    </div>

                    <div class="flex items-center gap-2">
                        <span class="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200">
                            <i class="fa-solid fa-pen-to-square text-emerald-600"></i> ចុចលើអក្សរដើម្បីកែ
                        </span>
                        
                        <button onclick="window.print()" class="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/30 transition flex items-center gap-2 active:scale-95 outline-none">
                            <i class="fa-solid fa-print"></i> បោះពុម្ព (Print A4)
                        </button>
                        
                        <button onclick="document.getElementById('certificateModal').classList.add('hidden')" class="w-9 h-9 bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 rounded-xl font-bold flex items-center justify-center transition active:scale-95" title="បិទ (Close)">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                </div>

                <!-- ក្រដាសប័ណ្ណសរសើរ A4 Landscape -->
                <div id="certificatePrintArea" class="${activeFrame.bgGradient} p-8 md:p-12 ${activeFrame.outerBorder} rounded-2xl relative text-center text-slate-900 shadow-inner" style="min-height: 175mm;">
                    
                    <!-- ស៊ុមបន្ទាត់ខាងក្នុង (Inner Decorative Line) -->
                    <div class="absolute inset-3 ${activeFrame.innerBorder} rounded-xl pointer-events-none"></div>

                    <!-- ផ្កាក្បាច់ ៤ ជ្រុង (Corner Ornaments) -->
                    <div class="absolute top-4 left-5 ${activeFrame.cornerColor} text-2xl font-serif select-none pointer-events-none">${activeFrame.cornerIcon}</div>
                    <div class="absolute top-4 right-5 ${activeFrame.cornerColor} text-2xl font-serif select-none pointer-events-none">${activeFrame.cornerIcon}</div>
                    <div class="absolute bottom-4 left-5 ${activeFrame.cornerColor} text-2xl font-serif select-none pointer-events-none">${activeFrame.cornerIcon}</div>
                    <div class="absolute bottom-4 right-5 ${activeFrame.cornerColor} text-2xl font-serif select-none pointer-events-none">${activeFrame.cornerIcon}</div>

                    <!-- ក្បាលប័ណ្ណ (Header) -->
                    <div class="flex justify-between items-start text-xs mb-4 px-4 relative z-10">
                        <div class="text-left pt-1">
                            <p contenteditable="true" class="cert-editable font-moul text-amber-950 text-[13px] leading-snug">${schoolName}</p>
                            <p contenteditable="true" class="cert-editable text-slate-500 font-bold mt-1 text-[11px]">លេខ៖ .......... / ប.ស.ស</p>
                        </div>
                        <div class="text-center">
                            <p contenteditable="true" class="cert-editable font-moul text-slate-900 text-sm">ព្រះរាជាណាចក្រកម្ពុជា</p>
                            <p contenteditable="true" class="cert-editable font-moul text-slate-800 text-xs mt-0.5">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                            <img src="${window.CMS_HEADER_SYMBOL_B64 || 'assets/images/header-flourish.png'}" class="header-flourish-symbol" alt="symbol" style="display: block; margin: 3px auto 0 auto; width: 130px; height: 10px; object-fit: contain;" />
                        </div>
                        <div class="text-right pt-1 opacity-90 hidden sm:block">
                            <div class="w-12 h-12 rounded-full border-2 border-amber-400 bg-amber-50 flex items-center justify-center text-amber-600 text-xl shadow-sm mx-auto">
                                <i class="fa-solid fa-award"></i>
                            </div>
                        </div>
                    </div>

                    <!-- ចំណងជើងប័ណ្ណសរសើរ (Title Banner) -->
                    <div class="my-4 relative z-10">
                        <h1 contenteditable="true" class="cert-editable font-moul text-2xl md:text-4xl ${activeFrame.titleColor} drop-shadow-sm mb-1">ប័ណ្ណសរសើរ</h1>
                        <p contenteditable="true" class="cert-editable text-[11px] font-bold text-amber-950 uppercase tracking-[0.25em]">CERTIFICATE OF HONOR & EXCELLENCE</p>
                    </div>

                    <!-- តួសេចក្តី (Certificate Body) -->
                    <div class="my-5 max-w-3xl mx-auto space-y-3.5 text-sm md:text-base leading-relaxed relative z-10">
                        <p contenteditable="true" class="cert-editable text-slate-700">
                            គណៈគ្រប់គ្រង និងលោកគ្រូ អ្នកគ្រូ នៃ <strong>${schoolName}</strong> សូមសម្តែងនូវការកោតសរសើរចំពោះ៖
                        </p>
                        
                        <div class="my-2">
                            <h2 contenteditable="true" class="cert-editable font-moul text-2xl md:text-3xl text-indigo-950 py-1.5 border-b-2 border-dashed ${activeFrame.accentLine} inline-block px-10">
                                ${student.name}
                            </h2>
                        </div>

                        <p contenteditable="true" class="cert-editable text-slate-700 text-xs md:text-sm">
                            ភេទ៖ <strong>${student.gender || 'ប្រុស'}</strong> &nbsp;|&nbsp; សិស្សថ្នាក់៖ <strong>${student.grade || curLevel} ${student.room || ''}</strong> &nbsp;|&nbsp; អត្តលេខ៖ <span class="font-mono font-bold">${student.id}</span>
                        </p>

                        <div contenteditable="true" class="cert-editable text-slate-800 font-medium text-sm md:text-base px-4 py-1">
                            ${rankNum == 'conduct' ? 
                                `ដែលបានខិតខំប្រឹងប្រែងគោរពវិន័យ មានសីលធម៌ សុជីវធម៌ល្អប្រពៃ និងជាគំរូដ៏ល្អដល់មិត្តរួមថ្នាក់` : 
                              rankNum == 'month' ?
                                `ដែលទទួលបានជោគជ័យ និងចំណាត់ថ្នាក់ឆ្នើមជា <span class="font-moul text-amber-700">«សិស្សឆ្នើមប្រចាំខែ»</span> ក្នុងការសិក្សា និងវិន័យល្អ` :
                              rankNum == 'year' ?
                                `ដែលទទួលបានជោគជ័យ និងចំណាត់ថ្នាក់ឆ្នើមជា <span class="font-moul text-amber-700">«សិស្សឆ្នើមប្រចាំឆ្នាំ»</span> ក្នុងការប្រឡង និងវាយតម្លៃលទ្ធផលសិក្សា` :
                              rankNum == 'custom' ?
                                `ដែលបានខិតខំប្រឹងប្រែងរៀនសូត្រ សម្រេចបានលទ្ធផលយ៉ាងត្រចះត្រចង់ ក្នុងការអប់រំ និងសកម្មភាពនានា` :
                                `ដែលទទួលបានជោគជ័យ និងចំណាត់ថ្នាក់ជា <span class="font-moul text-amber-700">«សិស្សពូកែលំដាប់ទី ${rankNum}»</span> ក្នុងការប្រឡង និងវាយតម្លៃលទ្ធផលសិក្សា`}
                            ប្រចាំឆ្នាំសិក្សា <strong>${academicYear}</strong>។
                        </div>
                    </div>

                    <!-- ហត្ថលេខា និងកាលបរិច្ឆេទ (Signatures & Date) -->
                    <div class="flex justify-between items-end text-xs mt-10 md:mt-12 px-8 md:px-14 relative z-10">
                        <div class="text-center">
                            <p contenteditable="true" class="cert-editable font-bold text-slate-600 text-[11px]">គ្រូបន្ទុកថ្នាក់</p>
                            <div class="h-16 flex items-center justify-center text-slate-300 text-xs italic">
                                (ហត្ថលេខា)
                            </div>
                            <p contenteditable="true" class="cert-editable font-bold text-slate-800 text-xs">${teacherName}</p>
                        </div>

                        <!-- ត្រាសាលា (School Stamp Area) -->
                        <div class="text-center hidden sm:block opacity-60">
                            <div class="w-16 h-16 rounded-full border border-dashed border-amber-500/60 flex items-center justify-center text-[10px] text-amber-700">
                                ទីតាំងបោះត្រា
                            </div>
                        </div>

                        <div class="text-center">
                            <p contenteditable="true" class="cert-editable text-slate-500 text-[11px]">${solarDateStr}</p>
                            <p contenteditable="true" class="cert-editable font-moul text-amber-950 mt-1 text-[11px]">នាយក/នាយិកាសាលា</p>
                            <div class="h-14 flex items-center justify-center text-slate-300 text-xs italic">
                                (ហត្ថលេខា និងត្រា)
                            </div>
                            <p contenteditable="true" class="cert-editable font-bold text-slate-900 text-xs">${principalName}</p>
                        </div>
                    </div>

                </div>
            </div>
        `;

        modal.classList.remove("hidden");
    },

    // =====================================================================
    // ៦. ច្រកពិនិត្យលទ្ធផលសម្រាប់សិស្ស និងមាតាបិតា (Parent & Student Result Portal)
    // =====================================================================

    openParentPortalModal: function(query = "") {
        let modal = document.getElementById("parentPortalModal");
        if (!modal) {
            modal = document.createElement("div");
            modal.id = "parentPortalModal";
            modal.className = "fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 font-siemreap overflow-y-auto";
            modal.onclick = function(e) {
                if (e.target === modal) {
                    modal.classList.add('hidden');
                }
            };
            document.body.appendChild(modal);
        } else {
            modal.className = "fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 font-siemreap overflow-y-auto";
        }

        modal.innerHTML = `
            <div class="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-xl p-6 md:p-8 shadow-2xl relative border border-indigo-100 dark:border-slate-700 text-slate-800 dark:text-white">
                <div class="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-xl shadow-lg shadow-indigo-500/30">
                            <i class="fa-solid fa-magnifying-glass-chart"></i>
                        </div>
                        <div>
                            <h3 class="font-moul text-base text-indigo-950 dark:text-white">ច្រកពិនិត្យលទ្ធផលសិក្សាសិស្ស</h3>
                            <p class="text-xs text-slate-500 dark:text-slate-400 font-bold">សម្រាប់សិស្សានុសិស្ស និងមាតាបិតា</p>
                        </div>
                    </div>
                    <button onclick="document.getElementById('parentPortalModal').classList.add('hidden')" class="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-rose-500 flex items-center justify-center transition">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div class="space-y-4">
                    <div>
                        <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">បញ្ចូលអត្តលេខសិស្ស ឬឈ្មោះសិស្ស៖</label>
                        <div class="flex gap-2">
                            <div class="relative flex-1">
                                <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><i class="fa-solid fa-id-card"></i></span>
                                <input type="text" id="parentSearchInput" value="${query}" placeholder="ឧទាហរណ៍៖ STU-001 ឬ ឈ្មោះខ្មែរ..." onkeydown="if(event.key === 'Enter') window.KrouDigital.searchStudentForParent()" class="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500">
                            </div>
                            <button onclick="window.KrouDigital.searchStudentForParent()" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition flex items-center gap-1.5">
                                <i class="fa-solid fa-search"></i> ស្វែងរក
                            </button>
                        </div>
                    </div>

                    <div id="parentSearchResultArea" class="pt-2"></div>
                </div>
            </div>
        `;

        modal.classList.remove("hidden");
        if (query) window.KrouDigital.searchStudentForParent();
    },

    searchStudentForParent: function() {
        const input = document.getElementById("parentSearchInput");
        const area = document.getElementById("parentSearchResultArea");
        if (!input || !area) return;

        const q = input.value.trim().toLowerCase();
        if (!q) {
            area.innerHTML = `<div class="p-4 text-center text-rose-500 font-bold text-xs">សូមបញ្ចូលអត្តលេខ ឬឈ្មោះសិស្ស!</div>`;
            return;
        }

        const allStudents = window.allStudents || JSON.parse(localStorage.getItem('academic_students') || '[]');
        const found = allStudents.find(s => String(s.id).toLowerCase() === q || String(s.name).toLowerCase().includes(q));

        if (!found) {
            area.innerHTML = `
                <div class="p-6 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-800 text-center text-rose-700 dark:text-rose-300 text-xs font-bold">
                    <i class="fa-solid fa-triangle-exclamation text-2xl mb-2 text-rose-500"></i>
                    <p>រកមិនឃើញសិស្សដែលមានអត្តលេខ ឬឈ្មោះ «${q}» ឡើយ។</p>
                </div>
            `;
            return;
        }

        const allScores = JSON.parse(localStorage.getItem('academic_scores') || '[]');
        const latestScore = allScores.filter(sc => String(sc.student_id) === String(found.id)).pop() || {};
        const avg = parseFloat(latestScore.average || latestScore.avg || 0);

        area.innerHTML = `
            <div class="p-5 bg-gradient-to-br from-indigo-50/80 to-purple-50/50 dark:from-slate-700/60 dark:to-slate-700/30 rounded-2xl border border-indigo-100 dark:border-slate-600 text-xs space-y-4">
                <div class="flex items-center justify-between pb-3 border-b border-indigo-100 dark:border-slate-600">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-14 rounded-xl overflow-hidden border border-indigo-200 shadow-sm bg-white shrink-0">
                            <img src="${found.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(found.name)}`}" class="w-full h-full object-cover">
                        </div>
                        <div>
                            <h4 class="font-moul text-sm text-indigo-950 dark:text-white">${found.name}</h4>
                            <p class="text-slate-500 dark:text-slate-400 font-bold">អត្តលេខ៖ <span class="font-mono text-slate-800 dark:text-slate-200">${found.id}</span> | ភេទ៖ ${found.gender || 'ប្រុស'}</p>
                            <p class="text-slate-500 dark:text-slate-400 font-bold">ថ្នាក់៖ ${found.grade || 'ថ្នាក់ទី ៤'} ${found.room || 'ក'}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <span class="text-[10px] font-bold text-slate-400 block">ចំណាត់ថ្នាក់</span>
                        <span class="font-moul text-base text-amber-600">លេខ ${latestScore.rank || '-'}</span>
                    </div>
                </div>

                <div class="grid grid-cols-3 gap-2 text-center">
                    <div class="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-600">
                        <span class="text-[10px] text-slate-400 font-bold block">ពិន្ទុសរុប</span>
                        <strong class="font-mono text-indigo-600 dark:text-indigo-400 text-sm">${latestScore.total_score || latestScore.total || '-'}</strong>
                    </div>
                    <div class="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-600">
                        <span class="text-[10px] text-slate-400 font-bold block">មធ្យមភាគ</span>
                        <strong class="font-mono text-slate-800 dark:text-slate-200 text-sm">${avg > 0 ? avg.toFixed(2) : '-'}</strong>
                    </div>
                    <div class="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-600">
                        <span class="text-[10px] text-slate-400 font-bold block">និទ្ទេសទូទៅ</span>
                        <strong class="font-bold text-emerald-600 text-sm">${latestScore.grade_letter || (avg >= 8 ? 'ល្អ' : 'មធ្យម')}</strong>
                    </div>
                </div>

                <div class="flex gap-2 pt-2">
                    <button onclick="window.AdvancedReports.openStudentReportCard('${found.id}')" class="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow flex items-center justify-center gap-1.5">
                        <i class="fa-solid fa-file-invoice"></i> មើលព្រឹត្តិបត្រពិន្ទុពេញលេញ (PDF)
                    </button>
                </div>
            </div>
        `;
    }
};
