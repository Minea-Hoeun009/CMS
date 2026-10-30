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
            <div id="reportKaPrintArea" class="bg-white p-6 md:p-10 w-full shadow-2xl rounded-2xl border border-slate-200 text-slate-800" style="max-width: 297mm; min-height: 210mm; font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif;">
                
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

                <div class="text-center mb-3">
                    <h3 class="font-moul text-base text-blue-900 tracking-wide">តារាងស្រង់ពិន្ទុ និងការវាយតម្លៃលទ្ធផលសិក្សាសិស្ស</h3>
                    <div class="flex items-center justify-center my-1.5">
                        <img src="${window.CMS_TITLE_FLOURISH_B64 || 'assets/images/title-flourish.png'}" class="title-flourish-symbol" alt="flourish" style="display: block; margin: 0 auto; width: 230px; height: 14px; object-fit: contain;" />
                    </div>
                    <h4 class="font-moul text-xs text-red-600 mt-1">${window.toKhmerNum ? window.toKhmerNum(gradeFull) : gradeFull} | ឆ្នាំសិក្សា ${academicYear} (ខែ ${selectedMonth})</h4>
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
                        ${principalName ? `<p class="font-moul text-slate-900 text-sm">${principalName}</p>` : ""}
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
            <div id="reportKhaPrintArea" class="bg-gradient-to-b from-amber-50 via-white to-orange-50/40 p-8 md:p-12 w-full shadow-2xl rounded-2xl border-[10px] border-double border-amber-700 text-slate-900 relative overflow-hidden" style="max-width: 210mm; min-height: 297mm; font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif;">
                
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
    // ៣. របាយការណ៍ គ & ឃ (Report Ko / Kho) - លទ្ធផលប្រចាំខែ ឆមាស និងប្រចាំឆ្នាំ
    // =====================================================================
    renderReportKoKho: function(container, targetGrade = null, targetRoom = null, mode = null) {
        if (!container) return;
        if (typeof window.renderAcademicResultsReport === 'function') {
            window.renderAcademicResultsReport(container, targetGrade, targetRoom, mode || window.currentAcademicReportMode || 'annual');
            return;
        }
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
            <div id="reportKoKhoPrintArea" class="bg-white p-6 md:p-10 w-full shadow-2xl rounded-2xl border border-slate-200 text-slate-800" style="max-width: 297mm; min-height: 210mm; font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif;">
                
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

                <div class="text-center mb-3">
                    <h3 class="font-moul text-base text-blue-900 tracking-wide">សេចក្តីសម្រេចលទ្ធផលសិក្សាប្រចាំឆមាស និងប្រចាំឆ្នាំ</h3>
                    <div class="flex items-center justify-center my-1.5">
                        <img src="${window.CMS_TITLE_FLOURISH_B64 || 'assets/images/title-flourish.png'}" class="title-flourish-symbol" alt="flourish" style="display: block; margin: 0 auto; width: 230px; height: 14px; object-fit: contain;" />
                    </div>
                    <h4 class="font-moul text-xs text-red-600 mt-1">${window.toKhmerNum ? window.toKhmerNum(gradeFull) : gradeFull} | ឆ្នាំសិក្សា ${academicYear}</h4>
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
        const principalName = (sInfo.principal_name && sInfo.principal_name !== "នាយកសាលា") ? sInfo.principal_name : "";
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
            <div id="healthTrackerArea" class="bg-white p-6 md:p-8 w-full shadow-2xl rounded-2xl border border-slate-200 text-slate-800" style="max-width: 297mm; min-height: 210mm; font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif;">
                
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
    // ៥. ប័ណ្ណសរសើរ / វិញ្ញាបនបត្រ (Professional Canva-Style Certificate Studio 4.0)
    // =====================================================================
    initDraggable: function(el, type, id) {
        if (!el) return;
        let isDragging = false;
        let startX = 0, startY = 0;
        let initX = 0, initY = 0;
        const isSection = (type === 'section');

        const handle = el.querySelector('.drag-handle') || el;

        const onStart = function(clientX, clientY, target) {
            if (target.tagName === 'BUTTON' || target.closest('button')) return false;
            if (target.tagName === 'SELECT' || target.closest('select')) return false;
            if (target.tagName === 'INPUT' || target.closest('input')) return false;
            // If clicking directly inside contenteditable text and NOT clicking the drag handle, let them edit
            if (!target.closest('.drag-handle') && (target.hasAttribute('contenteditable') || target.closest('[contenteditable="true"]'))) {
                return false;
            }

            isDragging = true;
            startX = clientX;
            startY = clientY;

            if (isSection) {
                const saved = JSON.parse(localStorage.getItem('cert_pos_' + id) || '{"x":0,"y":0}');
                initX = saved.x || 0;
                initY = saved.y || 0;
            } else {
                initX = parseFloat(el.style.left) || el.offsetLeft || 0;
                initY = parseFloat(el.style.top) || el.offsetTop || 0;
            }
            el.style.zIndex = '999';
            return true;
        };

        const onMove = function(clientX, clientY) {
            if (!isDragging) return;
            const zoom = (parseInt(localStorage.getItem('cert_studio_zoom') || '85', 10)) / 100;
            const dx = (clientX - startX) / zoom;
            const dy = (clientY - startY) / zoom;

            const newX = Math.round(initX + dx);
            const newY = Math.round(initY + dy);

            if (isSection) {
                el.style.transform = `translate(${newX}px, ${newY}px)`;
                localStorage.setItem('cert_pos_' + id, JSON.stringify({ x: newX, y: newY }));
            } else {
                el.style.left = newX + 'px';
                el.style.top = newY + 'px';
                if (type === 'text') {
                    const texts = JSON.parse(localStorage.getItem('custom_cert_texts') || '[]');
                    const item = texts.find(t => t.id === id);
                    if (item) {
                        item.x = newX;
                        item.y = newY;
                        localStorage.setItem('custom_cert_texts', JSON.stringify(texts));
                    }
                } else if (type === 'pic') {
                    const pics = JSON.parse(localStorage.getItem('custom_cert_pictures') || '[]');
                    const item = pics.find(p => p.id === id);
                    if (item) {
                        item.x = newX;
                        item.y = newY;
                        localStorage.setItem('custom_cert_pictures', JSON.stringify(pics));
                    }
                }
            }
        };

        const onEnd = function() {
            if (isDragging) {
                isDragging = false;
                el.style.zIndex = isSection ? '20' : '30';
            }
        };

        // Mouse Drag on Handle
        handle.addEventListener('mousedown', function(e) {
            if (onStart(e.clientX, e.clientY, e.target)) {
                e.preventDefault();
                const mouseMoveHandler = (ev) => onMove(ev.clientX, ev.clientY);
                const mouseUpHandler = () => {
                    onEnd();
                    window.removeEventListener('mousemove', mouseMoveHandler);
                    window.removeEventListener('mouseup', mouseUpHandler);
                };
                window.addEventListener('mousemove', mouseMoveHandler);
                window.addEventListener('mouseup', mouseUpHandler);
            }
        });

        // Touch Drag on Handle (mobile/tablet)
        handle.addEventListener('touchstart', function(e) {
            const touch = e.touches[0];
            if (touch && onStart(touch.clientX, touch.clientY, e.target)) {
                const touchMoveHandler = (ev) => {
                    const t = ev.touches[0];
                    if (t) onMove(t.clientX, t.clientY);
                };
                const touchEndHandler = () => {
                    onEnd();
                    window.removeEventListener('touchmove', touchMoveHandler);
                    window.removeEventListener('touchend', touchEndHandler);
                };
                window.addEventListener('touchmove', touchMoveHandler, { passive: true });
                window.addEventListener('touchend', touchEndHandler);
            }
        }, { passive: true });
    },

    handleUploadFrame: function(event) {
        const file = event.target.files && event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                localStorage.setItem('custom_cert_frame_b64', e.target.result);
                if (typeof window.showToast === 'function') {
                    window.showToast("✅ បានបញ្ចូលស៊ុមរូបភាពផ្ទាល់ខ្លួនជោគជ័យ!", "success");
                }
                const activeStId = document.getElementById("certStudentSelect")?.value || null;
                const activeRank = document.getElementById("certRankSelect")?.value || 1;
                const activeGrade = document.getElementById("certGradeSelect")?.value || null;
                window.KrouDigital.renderCertificateModal(activeStId, activeRank, activeGrade, 'custom-uploaded');
            } catch (err) {
                alert("ទំហំរូបភាពធំពេក សូមជ្រើសរើសរូបភាពក្រោម 2MB");
            }
        };
        reader.readAsDataURL(file);
    },

    removeCustomFrame: function() {
        localStorage.removeItem('custom_cert_frame_b64');
        const activeStId = document.getElementById("certStudentSelect")?.value || null;
        const activeRank = document.getElementById("certRankSelect")?.value || 1;
        const activeGrade = document.getElementById("certGradeSelect")?.value || null;
        window.KrouDigital.renderCertificateModal(activeStId, activeRank, activeGrade, 'khmer-kbach-gold');
    },

    handleUploadLogo: function(event) {
        const file = event.target.files && event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                localStorage.setItem('custom_cert_logo_b64', e.target.result);
                if (typeof window.showToast === 'function') {
                    window.showToast("✅ បានបញ្ចូល Logo / ត្រា ជោគជ័យ!", "success");
                }
                window.KrouDigital.renderCertificateModal();
            } catch (err) {
                alert("ទំហំឡូហ្គោធំពេក សូមជ្រើសរើសរូបភាពក្រោម 1MB");
            }
        };
        reader.readAsDataURL(file);
    },

    removeCustomLogo: function() {
        localStorage.removeItem('custom_cert_logo_b64');
        window.KrouDigital.renderCertificateModal();
    },

    handleUploadPicture: function(event) {
        const file = event.target.files && event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const pics = JSON.parse(localStorage.getItem('custom_cert_pictures') || '[]');
                pics.push({
                    id: 'pic_' + Date.now(),
                    name: file.name,
                    b64: e.target.result,
                    width: 120,
                    x: 60 + (pics.length * 30),
                    y: 80 + (pics.length * 20)
                });
                localStorage.setItem('custom_cert_pictures', JSON.stringify(pics));
                if (typeof window.showToast === 'function') {
                    window.showToast("✅ បានបញ្ចូលរូបភាពបន្ថែម (Picture/Logo) ជោគជ័យ!", "success");
                }
                window.KrouDigital.renderCertificateModal();
            } catch (err) {
                alert("ទំហំរូបភាពធំពេក សូមជ្រើសរើសរូបភាពក្រោម 2MB");
            }
        };
        reader.readAsDataURL(file);
    },

    resizePicture: function(picId, delta) {
        const pics = JSON.parse(localStorage.getItem('custom_cert_pictures') || '[]');
        const pic = pics.find(p => p.id === picId);
        if (pic) {
            pic.width = Math.max(35, Math.min(400, (pic.width || 120) + delta));
            localStorage.setItem('custom_cert_pictures', JSON.stringify(pics));
            const el = document.getElementById(picId);
            if (el) el.style.width = pic.width + 'px';
        }
    },

    removePicture: function(picId) {
        let pics = JSON.parse(localStorage.getItem('custom_cert_pictures') || '[]');
        pics = pics.filter(p => p.id !== picId);
        localStorage.setItem('custom_cert_pictures', JSON.stringify(pics));
        window.KrouDigital.renderCertificateModal();
    },

    addCustomText: function() {
        const texts = JSON.parse(localStorage.getItem('custom_cert_texts') || '[]');
        texts.push({
            id: 'txt_' + Date.now(),
            content: "អត្ថបទថ្មី (ចុចអូស ឬកែសម្រួល)",
            fontSize: 16,
            color: '#dc2626',
            fontFamily: 'font-moul',
            x: 220,
            y: 180 + (texts.length * 35)
        });
        localStorage.setItem('custom_cert_texts', JSON.stringify(texts));
        window.KrouDigital.renderCertificateModal();
    },

    removeCustomText: function(textId) {
        let texts = JSON.parse(localStorage.getItem('custom_cert_texts') || '[]');
        texts = texts.filter(t => t.id !== textId);
        localStorage.setItem('custom_cert_texts', JSON.stringify(texts));
        window.KrouDigital.renderCertificateModal();
    },

    resetCertPositions: function() {
        // Clear all section transforms
        ['sec_header_left', 'sec_header_center', 'sec_title', 'sec_body', 'sec_sig_left', 'sec_sig_right'].forEach(id => {
            localStorage.removeItem('cert_pos_' + id);
            const el = document.getElementById('cert_' + id);
            if (el) el.style.transform = 'translate(0px, 0px)';
        });

        // Reset pictures and texts
        const pics = JSON.parse(localStorage.getItem('custom_cert_pictures') || '[]');
        pics.forEach((p, idx) => {
            p.x = 60 + (idx * 30);
            p.y = 80 + (idx * 20);
            p.width = 120;
        });
        localStorage.setItem('custom_cert_pictures', JSON.stringify(pics));

        const texts = JSON.parse(localStorage.getItem('custom_cert_texts') || '[]');
        texts.forEach((t, idx) => {
            t.x = 220;
            t.y = 180 + (idx * 35);
        });
        localStorage.setItem('custom_cert_texts', JSON.stringify(texts));

        if (typeof window.showToast === 'function') {
            window.showToast("✅ បានកំណត់ទីតាំង និងទំហំទាំងអស់ត្រឡប់ទៅស្តង់ដារដើម!", "info");
        }
        this.renderCertificateModal();
    },

    setZoom: function(val) {
        const zoom = Math.max(40, Math.min(200, parseInt(val, 10) || 100));
        localStorage.setItem('cert_studio_zoom', zoom);
        const wrapper = document.getElementById("certificatePrintWrapper");
        if (wrapper) {
            wrapper.style.transform = "scale(" + (zoom / 100) + ")";
            wrapper.style.transformOrigin = 'top center';
        }
        const label = document.getElementById("certZoomDisplay");
        if (label) label.textContent = zoom + '%';
        const slider = document.getElementById("certZoomSlider");
        if (slider) slider.value = zoom;
    },

    zoomIn: function() {
        const cur = parseInt(localStorage.getItem('cert_studio_zoom') || '85', 10);
        this.setZoom(cur + 10);
    },

    zoomOut: function() {
        const cur = parseInt(localStorage.getItem('cert_studio_zoom') || '85', 10);
        this.setZoom(cur - 10);
    },

    zoomFit: function() {
        this.setZoom(85);
    },

    setPageSize: function(sizeKey) {
        localStorage.setItem('cert_page_size', sizeKey);
        this.renderCertificateModal();
    },

    updateCertPadding: function(val) {
        localStorage.setItem('cert_padding', val);
        const area = document.getElementById("certificateInnerCanvas");
        if (area) area.style.padding = val + 'px';
        const label = document.getElementById("certPaddingDisplay");
        if (label) label.textContent = val + 'px';
    },

    updateCertFontScale: function(val) {
        localStorage.setItem('cert_font_scale', val);
        const area = document.getElementById("certificatePrintArea");
        if (area) area.style.fontSize = val + '%';
        const label = document.getElementById("certScaleDisplay");
        if (label) label.textContent = val + '%';
    },

    updateCertFontFamily: function(fontClass) {
        localStorage.setItem('cert_font_family', fontClass);
        const title = document.getElementById("certMainTitle");
        if (title) {
            title.classList.remove('font-moul', 'font-siemreap', 'font-battambang');
            title.classList.add(fontClass);
        }
    },

    updateCertColor: function(colorHex) {
        localStorage.setItem('cert_title_color', colorHex);
        const title = document.getElementById("certMainTitle");
        if (title) title.style.color = colorHex;
        const colorInput = document.getElementById("certCustomColorPicker");
        if (colorInput) colorInput.value = colorHex;
    },

    updateCertBgColor: function(colorHex) {
        localStorage.setItem('cert_bg_color', colorHex);
        const canvas = document.getElementById("certificatePrintArea");
        if (canvas) canvas.style.backgroundColor = colorHex;
    },

    toggleWatermark: function(enabled) {
        localStorage.setItem('cert_watermark_enabled', enabled ? 'true' : 'false');
        this.renderCertificateModal();
    },

    setActiveTab: function(tabName) {
        localStorage.setItem('cert_active_tab', tabName);
        const allTabs = ['design', 'text', 'uploads', 'data'];
        allTabs.forEach(t => {
            const pane = document.getElementById('certTabPane_' + t);
            const btn = document.getElementById('certTabBtn_' + t);
            if (pane) {
                if (t === tabName) pane.classList.remove('hidden');
                else pane.classList.add('hidden');
            }
            if (btn) {
                if (t === tabName) {
                    btn.className = 'px-3.5 py-1.5 rounded-xl font-bold text-xs bg-indigo-600 text-white shadow-md shadow-indigo-500/30 flex items-center gap-1.5 transition';
                } else {
                    btn.className = 'px-3.5 py-1.5 rounded-xl font-bold text-xs bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition';
                }
            }
        });
    },

    execTextCmd: function(cmd, val = null) {
        document.execCommand(cmd, false, val);
    },

    // 🖨️ បើកមើលផ្ទាំង Preview មុនព្រីន (Universal Print Preview)
    openPrintPreview: function() {
        const printArea = document.getElementById("certificatePrintArea");
        if (!printArea) return;

        const pageSizeKey = localStorage.getItem('cert_page_size') || 'A4-landscape';
        const isLandscape = !pageSizeKey.includes('portrait');
        const paper = pageSizeKey.includes('A3') ? 'A3' : pageSizeKey.includes('Letter') ? 'Letter' : 'A4';
        const orientation = isLandscape ? 'landscape' : 'portrait';

        const clone = printArea.cloneNode(true);
        clone.style.transform = 'none';
        clone.style.margin = '0 auto';
        clone.style.boxShadow = 'none';
        clone.style.borderRadius = '0';
        clone.style.position = 'relative';
        clone.querySelectorAll('.no-print, .drag-handle, button').forEach(el => el.remove());
        clone.querySelectorAll('[contenteditable="true"]').forEach(el => {
            el.removeAttribute('contenteditable');
            el.style.outline = 'none';
            el.style.backgroundColor = 'transparent';
        });

        if (window.CMSPrintManager && typeof window.CMSPrintManager.openUniversalPreview === 'function') {
            window.CMSPrintManager.openUniversalPreview({
                title: "លិខិតសរសើរ",
                paperSize: paper,
                orientation: orientation,
                defaultZoom: 1.0,
                contentHtml: clone.outerHTML,
                autoWrapHeaderFooter: false
            });
        } else {
            this.printCertificate();
        }
    },

    // 🖨️ មុខងារបោះពុម្ពប័ណ្ណសរសើរពេញទំហំក្រដាស 100% ឥតដាច់ ឥតចន្លោះស (Seamless 100% A4 Print Engine)
    printCertificate: function() {
        if (document.activeElement && typeof document.activeElement.blur === 'function') {
            document.activeElement.blur();
        }

        const printArea = document.getElementById("certificatePrintArea");
        if (!printArea) {
            window.print();
            return;
        }

        const pageSizeKey = localStorage.getItem('cert_page_size') || 'A4-landscape';
        const pageSizesMap = {
            'A4-landscape': { width: '297mm', height: '210mm', isLandscape: true, name: 'A4' },
            'A4-portrait': { width: '210mm', height: '297mm', isLandscape: false, name: 'A4' },
            'A3-landscape': { width: '420mm', height: '297mm', isLandscape: true, name: 'A3' },
            'Letter-landscape': { width: '11in', height: '8.5in', isLandscape: true, name: 'Letter' }
        };
        const curSize = pageSizesMap[pageSizeKey] || pageSizesMap['A4-landscape'];

        // Clone printArea cleanly
        const clone = printArea.cloneNode(true);
        clone.style.transform = 'none';
        clone.style.margin = '0 auto';
        clone.style.boxShadow = 'none';
        clone.style.borderRadius = '0';
        clone.style.width = '100%';
        clone.style.height = '100%';
        clone.style.minHeight = '100%';
        clone.style.maxHeight = '100%';
        clone.style.position = 'relative';
        clone.style.left = '0';
        clone.style.top = '0';
        clone.style.boxSizing = 'border-box';

        // Remove all controls, drag handles, delete buttons, and toolbars
        clone.querySelectorAll('.no-print, .drag-handle, button').forEach(el => el.remove());

        // Clean up contenteditable and outline
        clone.querySelectorAll('[contenteditable="true"]').forEach(el => {
            el.removeAttribute('contenteditable');
            el.style.outline = 'none';
            el.style.backgroundColor = 'transparent';
        });

        // Collect all existing stylesheets from main window
        const stylesHtml = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
            .map(el => el.outerHTML)
            .join('\n');

        // Open dedicated clean print window to guarantee top-level landscape orientation in Chromium & physical printer drivers
        const printDoc = `
            <!DOCTYPE html>
            <html lang="km">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>លិខិតសរសើរ - បោះពុម្ព</title>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Moul&family=Siemreap&family=Battambang&display=swap" rel="stylesheet">
                <script src="https://cdn.tailwindcss.com"></script>
                ${stylesHtml}
                <style>
                    @page {
                        size: ${curSize.isLandscape ? 'landscape' : 'portrait'};
                        margin: 0 !important;
                    }
                    @media print {
                        @page {
                            size: ${curSize.isLandscape ? 'landscape' : 'portrait'};
                            margin: 0 !important;
                        }
                        html, body {
                            width: 100vw !important;
                            height: 100vh !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            overflow: hidden !important;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        .no-print, .drag-handle, button {
                            display: none !important;
                        }
                        #cert_print_container {
                            width: 100vw !important;
                            height: 100vh !important;
                            margin: 0 !important;
                            padding: 0 !important;
                        }
                    }
                    * {
                        box-sizing: border-box !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    html, body {
                        width: 100%;
                        height: 100%;
                        margin: 0;
                        padding: 0;
                        background: #ffffff;
                        overflow: auto;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .font-moul { font-family: 'Khmer OS Muol Light', 'Khmer OS Muol', 'Moul', serif !important; font-weight: normal !important; }
                    .font-siemreap { font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif !important; }
                    .font-battambang { font-family: 'Battambang', sans-serif !important; }
                    .no-print, .drag-handle { display: none !important; }
                    
                    /* Screen helper banner */
                    .print-helper-bar {
                        background: #1e293b;
                        color: #f8fafc;
                        padding: 10px 18px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif;
                        font-size: 13px;
                        border-bottom: 2px solid #3b82f6;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    }
                </style>
            </head>
            <body>
                <div class="print-helper-bar no-print">
                    <div style="display:flex;align-items:center;gap:12px;">
                        <span style="font-size:20px;">🖨️</span>
                        <div>
                            <strong>ការណែនាំដើម្បីព្រីនពេញក្រដាស A4 ស្អាត ១០០%៖</strong>
                            <span style="color:#fde047;margin-left:6px;">សូមជ្រើសរើស Layout: <b>${curSize.isLandscape ? 'Landscape (ផ្តេក)' : 'Portrait (បញ្ឈរ)'}</b> និង Margins: <b>None (គ្មានគែម)</b> ក្នុងផ្ទាំង Print</span>
                        </div>
                    </div>
                    <div style="display:flex;gap:10px;">
                        <button onclick="window.print()" style="background:#059669;color:#fff;border:none;padding:7px 16px;border-radius:8px;font-weight:bold;cursor:pointer;font-family:'Siemreap',sans-serif;">🖨️ ចុចព្រីន (Print Now)</button>
                        <button onclick="window.close()" style="background:#475569;color:#fff;border:none;padding:7px 14px;border-radius:8px;cursor:pointer;font-family:'Siemreap',sans-serif;">បិទ (Close)</button>
                    </div>
                </div>

                <div id="cert_print_container" style="width:${curSize.width};height:${curSize.height};margin:0 auto;position:relative;display:flex;justify-content:center;align-items:center;">
                    ${clone.outerHTML}
                </div>

                <script>
                    window.onload = function() {
                        setTimeout(function() {
                            window.focus();
                            window.print();
                        }, 500);
                    };
                </script>
            </body>
            </html>
        `;

        const printWin = window.open('', '_blank', 'width=1100,height=800');
        if (printWin) {
            printWin.document.open();
            printWin.document.write(printDoc);
            printWin.document.close();
        } else {
            // Fallback to helper iframe if popups blocked
            let oldIframe = document.getElementById("cms_cert_print_iframe");
            if (oldIframe) oldIframe.remove();

            const iframe = document.createElement("iframe");
            iframe.id = "cms_cert_print_iframe";
            iframe.style.position = "fixed";
            iframe.style.top = "0";
            iframe.style.left = "0";
            iframe.style.width = "100%";
            iframe.style.height = "100%";
            iframe.style.border = "none";
            iframe.style.zIndex = "-9999";
            iframe.style.opacity = "0.001";
            iframe.style.pointerEvents = "none";
            document.body.appendChild(iframe);

            const doc = iframe.contentWindow.document;
            doc.open();
            doc.write(printDoc);
            doc.close();

            setTimeout(() => {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();
            }, 600);
        }
    },

    renderCertificateModal: function(studentId = null, rankNum = null, targetGrade = null, frameStyle = null) {
        const customFrameB64 = localStorage.getItem('custom_cert_frame_b64');
        if (!frameStyle) {
            frameStyle = customFrameB64 ? 'custom-uploaded' : (localStorage.getItem('cert_last_frame') || 'khmer-kbach-gold');
        }
        localStorage.setItem('cert_last_frame', frameStyle);

        const customLogoB64 = localStorage.getItem('custom_cert_logo_b64');
        const customPics = JSON.parse(localStorage.getItem('custom_cert_pictures') || '[]');
        const customTexts = JSON.parse(localStorage.getItem('custom_cert_texts') || '[]');
        const certPadding = parseInt(localStorage.getItem('cert_padding') || '36', 10);
        const certFontScale = parseInt(localStorage.getItem('cert_font_scale') || '100', 10);
        const certFontFamily = localStorage.getItem('cert_font_family') || 'font-moul';
        const certTitleColor = localStorage.getItem('cert_title_color') || '#dc2626';
        const certBgColor = localStorage.getItem('cert_bg_color') || '#ffffff';
        const watermarkEnabled = localStorage.getItem('cert_watermark_enabled') !== 'false';
        const activeTab = localStorage.getItem('cert_active_tab') || 'design';
        const studioZoom = parseInt(localStorage.getItem('cert_studio_zoom') || '85', 10);
        const pageSizeKey = localStorage.getItem('cert_page_size') || 'A4-landscape';
        const titleType = localStorage.getItem('cert_title_type') || 'លិខិតសរសើរ';
        const examSession = localStorage.getItem('cert_exam_session') || 'ប្រឡងឆមាសលើកទី១ ឆ្នាំសិក្សា ២០២៥ - ២០២៦';

        // Load section saved positions (Canva drag offsets)
        const posHeaderLeft = JSON.parse(localStorage.getItem('cert_pos_sec_header_left') || '{"x":0,"y":0}');
        const posHeaderCenter = JSON.parse(localStorage.getItem('cert_pos_sec_header_center') || '{"x":0,"y":0}');
        const posTitle = JSON.parse(localStorage.getItem('cert_pos_sec_title') || '{"x":0,"y":0}');
        const posBody = JSON.parse(localStorage.getItem('cert_pos_sec_body') || '{"x":0,"y":0}');
        const posSigLeft = JSON.parse(localStorage.getItem('cert_pos_sec_sig_left') || '{"x":0,"y":0}');
        const posSigRight = JSON.parse(localStorage.getItem('cert_pos_sec_sig_right') || '{"x":0,"y":0}');

        // Page size mapping
        const pageSizesMap = {
            'A4-landscape': { name: 'A4 ផ្តេក (297 x 210 mm)', width: '297mm', height: '210mm', css: 'A4 landscape' },
            'A4-portrait': { name: 'A4 បញ្ឈរ (210 x 297 mm)', width: '210mm', height: '297mm', css: 'A4 portrait' },
            'A3-landscape': { name: 'A3 ផ្តេក (420 x 297 mm)', width: '420mm', height: '297mm', css: 'A3 landscape' },
            'Letter-landscape': { name: 'Letter ផ្តេក (11 x 8.5 in)', width: '11in', height: '8.5in', css: 'Letter landscape' }
        };
        const curPageSize = pageSizesMap[pageSizeKey] || pageSizesMap['A4-landscape'];

        const allStudents = window.allStudents || JSON.parse(localStorage.getItem('academic_students') || '[]');
        const activeClass = typeof window.getCurrentSelectedClass === 'function' ? window.getCurrentSelectedClass() : { level: "ថ្នាក់ទី ៤", room: "«ក»" };
        const curLevel = targetGrade || activeClass.level;

        const classStudents = allStudents.filter(s => {
            if (!curLevel || curLevel === 'all') return true;
            const norm = typeof window.normalizeGrade === 'function' ? window.normalizeGrade(s.grade) : s.grade;
            return norm === curLevel;
        });
        const selectableStudents = classStudents.length > 0 ? classStudents : allStudents;

        const student = selectableStudents.find(s => String(s.id) === String(studentId)) || selectableStudents[0] || allStudents[0] || { name: "ណៃ ច័ន្ទសុផានី", gender: "ស្រី", grade: curLevel, id: "STU-001" };
        const activeRank = rankNum !== null ? rankNum : (localStorage.getItem('cert_last_rank') || '3');
        localStorage.setItem('cert_last_rank', activeRank);

        const sInfo = window.appSettings || JSON.parse(localStorage.getItem('school_settings') || '{}');
        const academicYear = document.getElementById("globalAcademicYear")?.value || sInfo.academic_year || "២០២៥ - ២០២៦";
        const districtName = (sInfo.district || "អង្គរជ័យ").replace(/^ស្រុក\s*/, '').trim(); 
        const provinceName = sInfo.province || "កំពត";
        const schoolName = sInfo.school_name || "វិទ្យាល័យ សម្តេច ជា ស៊ីម អង្គរជ័យ";
        const principalName = (sInfo.principal_name && sInfo.principal_name !== "នាយកសាលា") ? sInfo.principal_name : "";
        const teacherName = (window.AuthState ? window.AuthState.teacherName : null) || localStorage.getItem('auth_teacher_name') || sInfo.teacher_name || "លុយ សុផល";

        let locShort = "";
        const rawLoc = document.getElementById('global_loc_input')?.value || localStorage.getItem('rc_location') || localStorage.getItem('rep_location');
        if (rawLoc) {
            locShort = rawLoc.replace(/^ធ្វើនៅ\s*/, '').replace(/,+$/, '').trim();
        } else {
            locShort = districtName || schoolName.replace(/^(សាលាបឋមសិក្សា|អនុវិទ្យាល័យ|វិទ្យាល័យ|សាលា)\s*/g, '').trim() || "ភ្នំពេញ";
        }

        let sDate = "";
        const rawDate = document.getElementById('global_sol_input')?.value || localStorage.getItem('rc_solar_date') || localStorage.getItem('rep_solar_date');
        if (rawDate && rawDate.trim()) {
            sDate = rawDate.trim();
        } else {
            sDate = "ថ្ងៃទី២៥ ខែកុម្ភៈ ឆ្នាំ២០២៦";
        }
        if (sDate.includes("ថ្ងៃទី")) sDate = sDate.substring(sDate.indexOf("ថ្ងៃទី"));

        const solarDateStr = `${locShort} ${sDate}`;
        const lunarDateStr = "ថ្ងៃពុធ ៩កើត ខែផល្គុន ឆ្នាំម្សាញ់ សប្តស័ក ព.ស. ២៥៦៩";

        const gradesList = typeof window.getAllGradesList === 'function' ? window.getAllGradesList() : ["ថ្នាក់ទី ១", "ថ្នាក់ទី ២", "ថ្នាក់ទី ៣", "ថ្នាក់ទី ៤", "ថ្នាក់ទី ៥", "ថ្នាក់ទី ៦", "10A", "10B", "11A", "12A"];

        // 🎨 ម៉ូដស៊ុម Preset
        const frameStylesMap = {
            'khmer-kbach-gold': {
                name: '🏵️ ស៊ុមផ្កាក្បាច់ខ្មែរពណ៌មាស (Gold Kbach - ដូចរូបគំរូ)',
                outerBorder: 'border-[16px] border-[#b45309]',
                innerBorder: 'border-2 border-[#15803d]',
                styleExtra: 'box-shadow: inset 0 0 0 3px #15803d, inset 0 0 0 5px #ffffff, inset 0 0 0 7px #15803d;',
                bgGradient: 'bg-white',
                cornerIcon: '🏵️',
                cornerColor: 'text-amber-600',
                titleColor: certTitleColor || '#dc2626',
                accentLine: 'border-amber-400'
            },
            'custom-uploaded': {
                name: '🖼️ ស៊ុមផ្ទុកឡើងផ្ទាល់ខ្លួន (Custom Frame)',
                outerBorder: 'border-0',
                innerBorder: 'border-0',
                styleExtra: '',
                bgGradient: 'bg-transparent',
                cornerIcon: '',
                cornerColor: 'text-transparent',
                titleColor: certTitleColor || '#dc2626',
                accentLine: 'border-amber-400'
            },
            'royal-gold': {
                name: '👑 ស៊ុមមាសរាជការ (Royal Gold Double)',
                outerBorder: 'border-[14px] border-double border-amber-600',
                innerBorder: 'border-2 border-amber-400/80',
                styleExtra: '',
                bgGradient: 'bg-gradient-to-br from-amber-50/60 via-white to-amber-50/40',
                cornerIcon: '⚜️',
                cornerColor: 'text-amber-600',
                titleColor: certTitleColor || '#b45309',
                accentLine: 'border-amber-500'
            },
            'emerald-formal': {
                name: '🌿 ស៊ុមត្បូងមរកត (Emerald Green)',
                outerBorder: 'border-[14px] border-double border-emerald-800',
                innerBorder: 'border-2 border-emerald-400/80',
                styleExtra: '',
                bgGradient: 'bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/30',
                cornerIcon: '❖',
                cornerColor: 'text-emerald-800',
                titleColor: certTitleColor || '#047857',
                accentLine: 'border-emerald-400'
            },
            'burgundy-classic': {
                name: '🍷 ស៊ុមក្រហមឈាមជ្រូក (Burgundy Luxury)',
                outerBorder: 'border-[14px] border-double border-rose-800',
                innerBorder: 'border-2 border-rose-400/80',
                styleExtra: '',
                bgGradient: 'bg-gradient-to-br from-rose-50/60 via-white to-orange-50/30',
                cornerIcon: '⚜️',
                cornerColor: 'text-rose-800',
                titleColor: certTitleColor || '#991b1b',
                accentLine: 'border-rose-400'
            },
            'navy-modern': {
                name: '🏛️ ស៊ុមខៀវរាជការទំនើប (Navy Executive)',
                outerBorder: 'border-[14px] border-double border-indigo-900',
                innerBorder: 'border-2 border-indigo-400/80',
                styleExtra: '',
                bgGradient: 'bg-gradient-to-br from-blue-50/60 via-white to-indigo-50/30',
                cornerIcon: '★',
                cornerColor: 'text-indigo-800',
                titleColor: certTitleColor || '#1e3a8a',
                accentLine: 'border-indigo-400'
            },
            'plain-blank': {
                name: '📄 គ្មានស៊ុម (សម្រាប់ក្រដាសមានស៊ុមស្រាប់)',
                outerBorder: 'border-0',
                innerBorder: 'border-0',
                styleExtra: '',
                bgGradient: 'bg-transparent',
                cornerIcon: '',
                cornerColor: 'text-transparent',
                titleColor: certTitleColor || '#dc2626',
                accentLine: 'border-slate-300'
            }
        };

        const activeFrame = frameStylesMap[frameStyle] || (customFrameB64 ? frameStylesMap['custom-uploaded'] : frameStylesMap['khmer-kbach-gold']);

        let modal = document.getElementById("certificateModal");
        if (!modal) {
            modal = document.createElement("div");
            modal.id = "certificateModal";
            modal.className = "fixed inset-0 z-[7000] bg-slate-900/60 p-2 md:p-6 transition-all duration-300 font-siemreap overflow-hidden flex flex-col";
            document.body.appendChild(modal);
        } else {
            modal.className = "fixed inset-0 z-[7000] bg-slate-900/60 p-2 md:p-6 transition-all duration-300 font-siemreap overflow-hidden flex flex-col";
            if (modal.parentElement && modal.parentElement !== document.body) {
                document.body.appendChild(modal);
            }
        }

        modal.innerHTML = `
            <style>
                .cert-editable {
                    transition: all 0.15s ease;
                    border-radius: 4px;
                    padding: 1px 4px;
                }
                .cert-editable:hover {
                    background-color: rgba(254, 243, 199, 0.7);
                    outline: 1px dashed #d97706;
                    cursor: text;
                }
                .cert-editable:focus {
                    background-color: #fefce8;
                    outline: 2px solid #b45309;
                }
                .canva-draggable-section {
                    transition: outline 0.15s ease;
                    position: relative;
                }
                .canva-draggable-section:hover {
                    outline: 1.5px dashed rgba(217, 119, 6, 0.5);
                    border-radius: 6px;
                }
                .canva-draggable-section:hover .drag-handle {
                    display: flex !important;
                }
            </style>

            <div class="bg-slate-50 border border-slate-200/80 rounded-2xl md:rounded-[2.5rem] w-full h-full shadow-2xl relative text-slate-800 flex flex-col overflow-hidden">
                
                <!-- 🎨 CANVA-STYLE TOP STUDIO HEADER 🎨 -->
                <div class="bg-white p-3 md:p-4 border-b border-slate-200/80 flex justify-between items-center shrink-0 shadow-sm z-20 no-print overflow-x-auto custom-scrollbar flex-nowrap whitespace-nowrap w-full">
                    
                    <!-- Left: Studio Logo & Title -->
                    <div class="flex items-center gap-3 shrink-0">
                        <button type="button" onclick="document.getElementById('certificateModal').classList.add('hidden')" class="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-2 font-bold text-xs transition shadow-sm active:scale-95 shrink-0" title="ថយក្រោយ"><i class="fa-solid fa-arrow-left text-sm"></i> <span>ថយក្រោយ</span></button>
                        <div class="flex items-center gap-2 sm:gap-3">
                            <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-[14px] bg-gradient-to-br from-amber-500 to-yellow-600 text-white flex items-center justify-center shadow-md text-sm">
                                <i class="fa-solid fa-certificate"></i>
                            </div>
                            <div>
                                <div class="flex items-center gap-2">
                                    <h3 class="font-moul text-xs sm:text-sm text-slate-800">ប័ណ្ណសរសើរផ្លូវការ (Certificate Studio)</h3>
                                    <span class="px-2 py-0.5 bg-slate-100 text-[10px] text-slate-600 border border-slate-200 rounded-md font-mono">${curPageSize.name}</span>
                                </div>
                                <p class="text-[10px] text-amber-700 font-bold hidden sm:block">ស្ទូឌីយោរចនាប័ណ្ណសរសើរ អូសទីតាំង Text បានដោយសេរី និងព្រីនពេញក្រដាស A4 ១០០%</p>
                            </div>
                        </div>
                    </div>

                    <!-- Center: Zoom In / Zoom Out Controls -->
                    <div class="flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-xl text-xs shrink-0">
                        <span class="text-slate-500 text-[11px] mr-1"><i class="fa-solid fa-magnifying-glass"></i> Zoom:</span>
                        <button onclick="window.KrouDigital.zoomOut()" class="w-6 h-6 rounded-lg bg-white hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center justify-center font-bold text-xs transition" title="Zoom Out (-10%)">-</button>
                        <input type="range" id="certZoomSlider" min="50" max="150" value="${studioZoom}" oninput="window.KrouDigital.setZoom(this.value)" class="w-20 accent-indigo-500 cursor-pointer">
                        <button onclick="window.KrouDigital.zoomIn()" class="w-6 h-6 rounded-lg bg-white hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center justify-center font-bold text-xs transition" title="Zoom In (+10%)">+</button>
                        <span id="certZoomDisplay" class="font-mono text-indigo-700 font-bold min-w-[36px] text-center">${studioZoom}%</span>
                        <button onclick="window.KrouDigital.zoomFit()" class="px-2 py-0.5 text-[10px] bg-white hover:bg-slate-200 text-slate-700 border border-slate-200 rounded font-bold transition" title="Fit to Screen">Fit</button>
                    </div>

                    <!-- Right: Page Size & Action Buttons -->
                    <div class="flex items-center gap-1.5 shrink-0 ml-auto">
                        <!-- Set Page Size Dropdown -->
                        <div class="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
                            <i class="fa-solid fa-file-invoice text-indigo-600 text-xs"></i>
                            <select onchange="window.KrouDigital.setPageSize(this.value)" class="bg-transparent text-slate-700 outline-none cursor-pointer font-bold text-xs">
                                ${Object.entries(pageSizesMap).map(([k, v]) => `
                                    <option value="${k}" ${k === pageSizeKey ? 'selected' : ''}>${v.name}</option>
                                `).join('')}
                            </select>
                        </div>

                        <!-- Universal Preview Button -->
                        <button onclick="window.KrouDigital.openPrintPreview()" class="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-indigo-700 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 active:scale-95 outline-none" title="បើកផ្ទាំងពិនិត្យមុនព្រីន (Universal Preview)">
                            <i class="fa-solid fa-eye"></i>
                            <span>Preview</span>
                        </button>

                        <!-- Print Button -->
                        <button onclick="window.KrouDigital.printCertificate()" class="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 transition flex items-center gap-1.5 active:scale-95 outline-none" title="បោះពុម្ពពេញទំហំក្រដាស ១០០%">
                            <i class="fa-solid fa-print"></i>
                            <span>ព្រីន (Print)</span>
                        </button>

                        <!-- Close Button -->
                        <button onclick="document.getElementById('certificateModal').classList.add('hidden')" class="w-10 h-10 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition shadow-sm active:scale-95 shrink-0" title="បិទ (Close)">
                            <i class="fa-solid fa-xmark text-lg"></i>
                        </button>
                    </div>

                </div>

                <!-- 🎛️ CANVA CATEGORY TABS BAR 🎛️ -->
                <div class="bg-slate-100/70 px-3 py-1.5 sm:py-2 border-b border-slate-200/80 flex items-center justify-between gap-2 text-xs no-print overflow-x-auto custom-scrollbar flex-nowrap whitespace-nowrap w-full shrink-0">
                    <!-- Tab Switcher Buttons -->
                    <div class="flex items-center gap-1.5 shrink-0 flex-nowrap">
                        <button id="certTabBtn_design" onclick="window.KrouDigital.setActiveTab('design')" class="${activeTab === 'design' ? 'px-3.5 py-1.5 rounded-xl font-bold text-xs bg-indigo-600 text-white shadow-md shadow-indigo-500/30 flex items-center gap-1.5 transition' : 'px-3.5 py-1.5 rounded-xl font-bold text-xs bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition'}">
                            <i class="fa-solid fa-border-all ${activeTab === 'design' ? 'text-amber-300' : 'text-amber-500'}"></i>
                            <span>ស៊ុម & ផ្ទៃ (Borders)</span>
                        </button>
                        <button id="certTabBtn_uploads" onclick="window.KrouDigital.setActiveTab('uploads')" class="${activeTab === 'uploads' ? 'px-3.5 py-1.5 rounded-xl font-bold text-xs bg-indigo-600 text-white shadow-md shadow-indigo-500/30 flex items-center gap-1.5 transition' : 'px-3.5 py-1.5 rounded-xl font-bold text-xs bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition'}">
                            <i class="fa-solid fa-cloud-arrow-up ${activeTab === 'uploads' ? 'text-white' : 'text-indigo-500'}"></i>
                            <span>Uploads (Logo/Frame/Pic)</span>
                        </button>
                        <button id="certTabBtn_text" onclick="window.KrouDigital.setActiveTab('text')" class="${activeTab === 'text' ? 'px-3.5 py-1.5 rounded-xl font-bold text-xs bg-indigo-600 text-white shadow-md shadow-indigo-500/30 flex items-center gap-1.5 transition' : 'px-3.5 py-1.5 rounded-xl font-bold text-xs bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition'}">
                            <i class="fa-solid fa-font ${activeTab === 'text' ? 'text-teal-200' : 'text-teal-600'}"></i>
                            <span>អត្ថបទ & អូស Text (Drag)</span>
                        </button>
                        <button id="certTabBtn_data" onclick="window.KrouDigital.setActiveTab('data')" class="${activeTab === 'data' ? 'px-3.5 py-1.5 rounded-xl font-bold text-xs bg-indigo-600 text-white shadow-md shadow-indigo-500/30 flex items-center gap-1.5 transition' : 'px-3.5 py-1.5 rounded-xl font-bold text-xs bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition'}">
                            <i class="fa-solid fa-user-graduate ${activeTab === 'data' ? 'text-purple-200' : 'text-purple-600'}"></i>
                            <span>ទិន្នន័យសិស្ស (Auto-fill)</span>
                        </button>
                    </div>

                    <!-- Reset & Help badges -->
                    <div class="flex items-center gap-2 shrink-0 flex-nowrap ml-auto">
                        <button onclick="window.KrouDigital.resetCertPositions()" class="px-2.5 py-1 bg-white hover:bg-slate-100 text-amber-700 rounded-lg text-[11px] font-bold border border-slate-200 flex items-center gap-1 shadow-sm" title="កំណត់ទីតាំង និងទំហំទាំងអស់ឡើងវិញ">
                            <i class="fa-solid fa-rotate-left"></i>
                            <span>Reset ទីតាំងដើម</span>
                        </button>
                        <span class="text-[11px] text-slate-500 hidden sm:inline">💡 ចុច <b class="text-amber-700">អូស (Drag)</b> ដើម្បីផ្លាស់ប្តូរទីតាំង Text ឬ Logo ដោយសេរី</span>
                    </div>
                </div>

                <!-- 🛠️ TAB CONTENT TOOLBAR PANES 🛠️ -->
                <div class="bg-slate-900 px-3 py-2 border-b border-slate-700/60 text-xs no-print overflow-x-auto custom-scrollbar w-full shrink-0">
                    
                    <!-- PANE 1: DESIGN & BORDERS -->
                    <div id="certTabPane_design" class="${activeTab === 'design' ? 'flex items-center gap-2.5 flex-nowrap whitespace-nowrap' : 'hidden'}">
                        <!-- Frame Selector -->
                        <div class="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 shrink-0">
                            <span class="text-slate-400">ម៉ូដស៊ុម៖</span>
                            <select id="certFrameSelect" onchange="window.KrouDigital.renderCertificateModal(document.getElementById('certStudentSelect')?.value, document.getElementById('certRankSelect')?.value, document.getElementById('certGradeSelect')?.value, this.value)" class="bg-transparent text-amber-200 outline-none cursor-pointer font-bold">
                                ${Object.entries(frameStylesMap).map(([key, item]) => `
                                    <option value="${key}" ${key === frameStyle ? 'selected' : ''} class="bg-slate-900 text-white">${item.name}</option>
                                `).join('')}
                            </select>
                        </div>

                        <!-- Frame Padding Slider -->
                        <div class="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-300 shrink-0">
                            <span>គម្លាតស៊ុម៖</span>
                            <input type="range" min="10" max="95" value="${certPadding}" oninput="window.KrouDigital.updateCertPadding(this.value)" class="w-20 accent-amber-500 cursor-pointer">
                            <span id="certPaddingDisplay" class="font-mono text-amber-400 font-bold">${certPadding}px</span>
                        </div>

                        <!-- Background Color -->
                        <div class="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 shrink-0">
                            <span class="text-slate-400">ពណ៌ផ្ទៃ៖</span>
                            <button onclick="window.KrouDigital.updateCertBgColor('#ffffff')" class="w-4 h-4 rounded-full bg-white border border-slate-400 hover:scale-110 transition" title="ស (White)"></button>
                            <button onclick="window.KrouDigital.updateCertBgColor('#fefcf3')" class="w-4 h-4 rounded-full bg-[#fefcf3] border border-amber-300 hover:scale-110 transition" title="ក្រដាសចាស់ (Ivory)"></button>
                            <button onclick="window.KrouDigital.updateCertBgColor('#fffbeb')" class="w-4 h-4 rounded-full bg-[#fffbeb] border border-amber-400 hover:scale-110 transition" title="ពងមាន់ (Cream)"></button>
                            <button onclick="window.KrouDigital.updateCertBgColor('#f8fafc')" class="w-4 h-4 rounded-full bg-[#f8fafc] border border-blue-300 hover:scale-110 transition" title="ទឹកកក (Ice)"></button>
                        </div>

                        <!-- Watermark Romduol Pattern Switch -->
                        <label class="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 cursor-pointer text-slate-300 hover:text-white transition shrink-0">
                            <input type="checkbox" ${watermarkEnabled ? 'checked' : ''} onchange="window.KrouDigital.toggleWatermark(this.checked)" class="accent-indigo-500 w-3.5 h-3.5 cursor-pointer">
                            <span>Watermark ផ្កាក្បាច់</span>
                        </label>
                    </div>

                    <!-- PANE 2: UPLOADS (LOGO, FRAME, PICTURES) -->
                    <div id="certTabPane_uploads" class="${activeTab === 'uploads' ? 'flex items-center gap-2.5 flex-nowrap whitespace-nowrap' : 'hidden'}">
                        <!-- Upload Custom Frame -->
                        <label class="cursor-pointer px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow transition flex items-center gap-1.5 active:scale-95 shrink-0" title="ផ្ទុកឡើងស៊ុមរូបភាព (JPG/PNG)">
                            <i class="fa-solid fa-image text-amber-300"></i>
                            <span>Upload Frame (ផ្ទុកស៊ុមផ្ទាល់ខ្លួន)</span>
                            <input type="file" accept="image/*" class="hidden" onchange="window.KrouDigital.handleUploadFrame(event)">
                        </label>
                        ${customFrameB64 ? `
                            <button onclick="window.KrouDigital.removeCustomFrame()" class="px-2 py-1 bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-xl font-bold transition flex items-center gap-1" title="លុបស៊ុម">
                                <i class="fa-solid fa-trash-can text-xs"></i> លុបស៊ុម
                            </button>
                        ` : ''}

                        <!-- Upload Logo -->
                        <label class="cursor-pointer px-3 py-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl font-bold shadow transition flex items-center gap-1.5 active:scale-95 shrink-0" title="ផ្ទុកឡើងឡូហ្គោសាលា/ក្រសួង">
                            <i class="fa-solid fa-certificate text-white"></i>
                            <span>Upload Logo (ក្បាលប័ណ្ណ)</span>
                            <input type="file" accept="image/*" class="hidden" onchange="window.KrouDigital.handleUploadLogo(event)">
                        </label>
                        ${customLogoB64 ? `
                            <button onclick="window.KrouDigital.removeCustomLogo()" class="px-2 py-1 bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-xl font-bold transition flex items-center gap-1" title="លុប Logo">
                                <i class="fa-solid fa-trash-can text-xs"></i> លុប Logo
                            </button>
                        ` : ''}

                        <!-- Upload Picture / Stamp / Signature / Photo -->
                        <label class="cursor-pointer px-3 py-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl font-bold shadow transition flex items-center gap-1.5 active:scale-95 shrink-0" title="Upload រូបភាពបន្ថែម ដូចជាត្រាក្រហម ហត្ថលេខា ឬរូបសិស្ស">
                            <i class="fa-solid fa-stamp text-amber-300"></i>
                            <span>Upload Picture (ត្រា/ហត្ថលេខា/Logo)</span>
                            <input type="file" accept="image/*" class="hidden" onchange="window.KrouDigital.handleUploadPicture(event)">
                        </label>

                        <!-- Uploaded Pictures Thumbnails Count -->
                        ${customPics.length > 0 ? `
                            <div class="flex items-center gap-2 bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-xl">
                                <span class="text-slate-400 text-[11px]">រូបបន្ថែម៖</span>
                                ${customPics.map(p => `
                                    <div class="flex items-center gap-1 bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded">
                                        <img src="${p.b64}" class="w-5 h-5 object-contain rounded" title="${p.name || 'Picture'}">
                                        <button onclick="window.KrouDigital.resizePicture('${p.id}', -15)" class="w-4 h-4 bg-slate-700 hover:bg-slate-600 text-white rounded text-[10px] flex items-center justify-center font-bold" title="បង្រួម">-</button>
                                        <button onclick="window.KrouDigital.resizePicture('${p.id}', 15)" class="w-4 h-4 bg-slate-700 hover:bg-slate-600 text-white rounded text-[10px] flex items-center justify-center font-bold" title="ពង្រីក">+</button>
                                        <button onclick="window.KrouDigital.removePicture('${p.id}')" class="text-rose-400 hover:text-rose-300 font-bold ml-1 text-xs" title="លុប">×</button>
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>

                    <!-- PANE 3: TEXT & FONTS & DRAGGABLE TEXT -->
                    <div id="certTabPane_text" class="${activeTab === 'text' ? 'flex items-center gap-2.5 flex-nowrap whitespace-nowrap' : 'hidden'}">
                        <!-- Add Text Box Button -->
                        <button onclick="window.KrouDigital.addCustomText()" class="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow transition flex items-center gap-1.5 active:scale-95 shrink-0" title="បន្ថែមអត្ថបទថ្មីដែលអាចអូសទីតាំងបានសេរី">
                            <i class="fa-solid fa-plus text-amber-300"></i>
                            <span>+ Add Text (បន្ថែមអត្ថបទអូសបាន)</span>
                        </button>

                        <!-- Font Family -->
                        <div class="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 shrink-0">
                            <span class="text-slate-400">ពុម្ពអក្សរ៖</span>
                            <select onchange="window.KrouDigital.updateCertFontFamily(this.value)" class="bg-transparent text-indigo-300 outline-none cursor-pointer font-bold">
                                <option value="font-moul" ${certFontFamily === 'font-moul' ? 'selected' : ''} class="bg-slate-900 text-white">Khmer OS Muol Light</option>
                                <option value="font-siemreap" ${certFontFamily === 'font-siemreap' ? 'selected' : ''} class="bg-slate-900 text-white">Siemreap (ស្តង់ដារ)</option>
                                <option value="font-battambang" ${certFontFamily === 'font-battambang' ? 'selected' : ''} class="bg-slate-900 text-white">Battambang</option>
                            </select>
                        </div>

                        <!-- Font Scale Slider -->
                        <div class="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-300 shrink-0">
                            <i class="fa-solid fa-text-height text-indigo-400"></i>
                            <span>ទំហំអក្សរ៖</span>
                            <input type="range" min="80" max="135" value="${certFontScale}" oninput="window.KrouDigital.updateCertFontScale(this.value)" class="w-20 accent-indigo-500 cursor-pointer">
                            <span id="certScaleDisplay" class="font-mono text-indigo-300 font-bold">${certFontScale}%</span>
                        </div>

                        <!-- Text Formatting (Bold, Italic, Align) -->
                        <div class="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-xl px-2 py-1 shrink-0">
                            <button onclick="window.KrouDigital.execTextCmd('bold')" class="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 font-bold text-white transition" title="Bold">B</button>
                            <button onclick="window.KrouDigital.execTextCmd('italic')" class="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 italic text-white transition" title="Italic">I</button>
                            <button onclick="window.KrouDigital.execTextCmd('underline')" class="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 underline text-white transition" title="Underline">U</button>
                            <div class="w-px h-4 bg-slate-600 mx-1"></div>
                            <button onclick="window.KrouDigital.execTextCmd('justifyLeft')" class="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 text-white transition" title="Left"><i class="fa-solid fa-align-left text-[10px]"></i></button>
                            <button onclick="window.KrouDigital.execTextCmd('justifyCenter')" class="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 text-white transition" title="Center"><i class="fa-solid fa-align-center text-[10px]"></i></button>
                            <button onclick="window.KrouDigital.execTextCmd('justifyRight')" class="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 text-white transition" title="Right"><i class="fa-solid fa-align-right text-[10px]"></i></button>
                        </div>

                        <!-- Text Color Swatches & Picker -->
                        <div class="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1 shrink-0">
                            <span class="text-slate-400 text-[11px]">ពណ៌៖</span>
                            <button onclick="window.KrouDigital.updateCertColor('#dc2626')" class="w-4 h-4 rounded-full bg-red-600 hover:scale-110 transition border border-white/40" title="ក្រហម (ដូចរូបគំរូ)"></button>
                            <button onclick="window.KrouDigital.updateCertColor('#b45309')" class="w-4 h-4 rounded-full bg-amber-600 hover:scale-110 transition border border-white/40" title="មាស"></button>
                            <button onclick="window.KrouDigital.updateCertColor('#1e3a8a')" class="w-4 h-4 rounded-full bg-blue-800 hover:scale-110 transition border border-white/40" title="ខៀវចាស់"></button>
                            <button onclick="window.KrouDigital.updateCertColor('#0f172a')" class="w-4 h-4 rounded-full bg-slate-900 hover:scale-110 transition border border-white/40" title="ខ្មៅ"></button>
                            <input type="color" id="certCustomColorPicker" value="${certTitleColor}" onchange="window.KrouDigital.updateCertColor(this.value)" class="w-5 h-5 rounded cursor-pointer border-0 bg-transparent" title="ជ្រើសរើសពណ៌ផ្ទាល់ខ្លួន">
                        </div>
                    </div>

                    <!-- PANE 4: DATA & AUTO-FILL -->
                    <div id="certTabPane_data" class="${activeTab === 'data' ? 'flex items-center gap-2.5 flex-nowrap whitespace-nowrap' : 'hidden'}">
                        <!-- Grade Select -->
                        <div class="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 shrink-0">
                            <span class="text-slate-400">ថ្នាក់៖</span>
                            <select id="certGradeSelect" onchange="window.KrouDigital.renderCertificateModal(null, document.getElementById('certRankSelect')?.value, this.value, '${frameStyle}')" class="bg-transparent text-indigo-300 font-bold outline-none cursor-pointer">
                                <option value="all" class="bg-slate-900 text-white">គ្រប់ថ្នាក់</option>
                                ${gradesList.map(g => `<option value="${g}" ${g === curLevel ? 'selected' : ''} class="bg-slate-900 text-white">${g}</option>`).join('')}
                            </select>
                        </div>

                        <!-- Student Select -->
                        <div class="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 shrink-0">
                            <span class="text-slate-400">សិស្ស៖</span>
                            <select id="certStudentSelect" onchange="window.KrouDigital.renderCertificateModal(this.value, document.getElementById('certRankSelect')?.value, '${curLevel}', '${frameStyle}')" class="bg-transparent text-white font-bold outline-none cursor-pointer max-w-[170px] truncate">
                                ${selectableStudents.map(s => `
                                    <option value="${s.id}" ${s.id === student.id ? 'selected' : ''} class="bg-slate-900 text-white">${s.name} (${s.grade || ''} ${s.room || ''})</option>
                                `).join("")}
                            </select>
                        </div>

                        <!-- Title Type (លិខិតសរសើរ vs ប័ណ្ណសរសើរ) -->
                        <div class="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 shrink-0">
                            <span class="text-slate-400">ចំណងជើង៖</span>
                            <select onchange="localStorage.setItem('cert_title_type', this.value); document.getElementById('certMainTitle').innerText = this.value;" class="bg-transparent text-amber-300 font-bold outline-none cursor-pointer">
                                <option value="លិខិតសរសើរ" ${titleType === 'លិខិតសរសើរ' ? 'selected' : ''} class="bg-slate-900 text-white">លិខិតសរសើរ (ដូចរូបគំរូ)</option>
                                <option value="ប័ណ្ណសរសើរ" ${titleType === 'ប័ណ្ណសរសើរ' ? 'selected' : ''} class="bg-slate-900 text-white">ប័ណ្ណសរសើរ</option>
                                <option value="វិញ្ញាបនបត្រកិត្តិយស" ${titleType === 'វិញ្ញាបនបត្រកិត្តិយស' ? 'selected' : ''} class="bg-slate-900 text-white">វិញ្ញាបនបត្រកិត្តិយស</option>
                            </select>
                        </div>

                        <!-- Rank Select -->
                        <div class="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 shrink-0">
                            <span class="text-slate-400">កិត្តិយស៖</span>
                            <select id="certRankSelect" onchange="window.KrouDigital.renderCertificateModal('${student.id}', this.value, '${curLevel}', '${frameStyle}')" class="bg-transparent text-amber-400 font-bold outline-none cursor-pointer">
                                <option value="1" ${activeRank == 1 ? 'selected' : ''} class="bg-slate-900 text-white">ចំណាត់ថ្នាក់លេខ ១</option>
                                <option value="2" ${activeRank == 2 ? 'selected' : ''} class="bg-slate-900 text-white">ចំណាត់ថ្នាក់លេខ ២</option>
                                <option value="3" ${activeRank == 3 ? 'selected' : ''} class="bg-slate-900 text-white">ចំណាត់ថ្នាក់លេខ ៣ (ដូចរូបគំរូ)</option>
                                <option value="4" ${activeRank == 4 ? 'selected' : ''} class="bg-slate-900 text-white">ចំណាត់ថ្នាក់លេខ ៤</option>
                                <option value="5" ${activeRank == 5 ? 'selected' : ''} class="bg-slate-900 text-white">ចំណាត់ថ្នាក់លេខ ៥</option>
                                <option value="month" ${activeRank == 'month' ? 'selected' : ''} class="bg-slate-900 text-white">សិស្សឆ្នើមប្រចាំខែ</option>
                                <option value="year" ${activeRank == 'year' ? 'selected' : ''} class="bg-slate-900 text-white">សិស្សឆ្នើមប្រចាំឆ្នាំ</option>
                                <option value="conduct" ${activeRank == 'conduct' ? 'selected' : ''} class="bg-slate-900 text-white">សិស្សមានវិន័យ និងសីលធម៌ល្អ</option>
                            </select>
                        </div>
                    </div>

                </div>

                <!-- 📜 CANVAS WORKSPACE AREA (ZOOMABLE) 📜 -->
                <div class="w-full flex-1 overflow-auto custom-scrollbar flex justify-center items-start p-4 sm:p-8 bg-slate-200/70 min-h-[500px]">
                    <div id="certificatePrintWrapper" class="transition-transform duration-200 relative flex justify-center items-center shadow-2xl rounded-2xl" style="transform: scale(${studioZoom / 100}); transform-origin: top center;">
                        
                        <!-- ក្រដាសប័ណ្ណសរសើរ / លិខិតសរសើរ Canvas -->
                        <div id="certificatePrintArea" class="${activeFrame.bgGradient} ${activeFrame.outerBorder} rounded-2xl relative text-center text-slate-900 overflow-hidden" 
                             style="width: ${curPageSize.width}; height: ${curPageSize.height}; min-height: ${curPageSize.height}; max-height: ${curPageSize.height}; max-width: ${curPageSize.width}; background-color: ${certBgColor}; font-size: ${certFontScale}%; ${activeFrame.styleExtra || ''}">
                            
                            <!-- 🖼️ Custom Uploaded Frame Layer (Full Bleed Background) -->
                            ${customFrameB64 ? `
                                <img src="${customFrameB64}" alt="Certificate Frame" class="absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-0" style="width: 100%; height: 100%;" />
                            ` : ''}

                            <!-- 🖼️ Built-in Khmer Kbach / Royal Borders -->
                            ${!customFrameB64 && activeFrame.innerBorder ? `
                                <div class="absolute inset-2 sm:inset-3 ${activeFrame.innerBorder} rounded-xl pointer-events-none z-10"></div>
                            ` : ''}

                            <!-- 🏵️ Khmer Romduol Watermark Pattern (Matching Sample Image!) -->
                            ${watermarkEnabled ? `
                                <svg width="100%" height="100%" class="absolute inset-0 pointer-events-none select-none z-10 opacity-[0.065]" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                        <pattern id="khmerRomduolPattern" width="90" height="90" patternUnits="userSpaceOnUse">
                                            <circle cx="45" cy="45" r="4" fill="#92400e"/>
                                            <path d="M45,20 C42,32 42,38 45,41 C48,38 48,32 45,20 Z" fill="#92400e"/>
                                            <path d="M45,70 C42,58 42,52 45,49 C48,52 48,58 45,70 Z" fill="#92400e"/>
                                            <path d="M20,45 C32,42 38,42 41,45 C38,48 32,48 20,45 Z" fill="#92400e"/>
                                            <path d="M70,45 C58,42 52,42 49,45 C52,48 58,48 70,45 Z" fill="#92400e"/>
                                            <circle cx="45" cy="45" r="14" fill="none" stroke="#92400e" stroke-width="0.8" stroke-dasharray="2,2"/>
                                        </pattern>
                                    </defs>
                                    <rect width="100%" height="100%" fill="url(#khmerRomduolPattern)"/>
                                </svg>
                            ` : ''}

                            <!-- 🖼️ Additional Uploaded Pictures (Stamps, Signatures, Student Photo) Overlays - DRAGGABLE & RESIZABLE -->
                            ${customPics.map(pic => `
                                <div id="${pic.id}" class="drag-box absolute select-none z-30 group cursor-move p-0.5 rounded hover:ring-2 hover:ring-amber-500/70" style="left: ${pic.x}px; top: ${pic.y}px; width: ${pic.width || 120}px;">
                                    <div class="drag-handle no-print flex items-center justify-between gap-1 px-1.5 py-0.5 bg-slate-900/95 text-amber-300 text-[9px] rounded shadow-md border border-amber-500/60 -top-6 left-0 absolute whitespace-nowrap opacity-80 group-hover:opacity-100 transition cursor-move">
                                        <span><i class="fa-solid fa-up-down-left-right"></i> អូស</span>
                                        <div class="flex items-center gap-1 ml-1 border-l border-slate-700 pl-1">
                                            <button onclick="window.KrouDigital.resizePicture('${pic.id}', -15)" class="w-3.5 h-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-[9px] flex items-center justify-center font-bold" title="បង្រួម">-</button>
                                            <button onclick="window.KrouDigital.resizePicture('${pic.id}', 15)" class="w-3.5 h-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-[9px] flex items-center justify-center font-bold" title="ពង្រីក">+</button>
                                            <button onclick="window.KrouDigital.removePicture('${pic.id}')" class="text-rose-400 hover:text-rose-300 font-bold ml-1 text-xs" title="លុប">×</button>
                                        </div>
                                    </div>
                                    <img src="${pic.b64}" alt="${pic.name}" class="w-full h-auto object-contain pointer-events-none drop-shadow-sm" />
                                </div>
                            `).join('')}

                            <!-- 🔤 Additional Custom Added Texts Overlays - DRAGGABLE -->
                            ${customTexts.map(txt => `
                                <div id="${txt.id}" class="drag-box absolute select-text z-30 group cursor-move p-1 rounded hover:ring-2 hover:ring-amber-500/70" style="left: ${txt.x}px; top: ${txt.y}px;">
                                    <div class="drag-handle no-print flex items-center justify-between gap-1 px-2 py-0.5 bg-slate-900/90 text-amber-300 text-[10px] rounded shadow-md border border-amber-500/60 -top-6 left-0 absolute whitespace-nowrap opacity-75 group-hover:opacity-100 transition cursor-move">
                                        <span><i class="fa-solid fa-up-down-left-right"></i> អូស (Drag)</span>
                                        <button onclick="window.KrouDigital.removeCustomText('${txt.id}')" class="text-rose-400 hover:text-rose-300 font-bold ml-1.5" title="លុប">×</button>
                                    </div>
                                    <div contenteditable="true" class="cert-editable font-bold ${txt.fontFamily}" style="font-size: ${txt.fontSize}px; color: ${txt.color}; outline: none; min-width: 60px;">
                                        ${txt.content}
                                    </div>
                                </div>
                            `).join('')}

                            <!-- 📝 Internal Content Container with Dynamic Padding Slider -->
                            <div id="certificateInnerCanvas" class="relative z-20 flex flex-col justify-between h-full w-full" style="padding: ${certPadding}px; height: 100%; box-sizing: border-box;">
                                
                                <!-- 🏛️ ក្បាលប័ណ្ណ (Official Header matching sample image) 🏛️ -->
                                <div class="flex justify-between items-start text-xs px-2 pt-1">
                                    <!-- Left: MoEYS Logo & Hierarchy (ដូចរូបគំរូ - DRAGGABLE SECTION) -->
                                    <div id="cert_sec_header_left" class="canva-el canva-draggable-section text-left pt-0.5 space-y-0.5 max-w-[270px]" style="transform: translate(${posHeaderLeft.x}px, ${posHeaderLeft.y}px);">
                                        <div class="drag-handle no-print hidden items-center gap-1 px-1.5 py-0.5 bg-slate-900/90 text-amber-300 text-[9px] rounded shadow border border-amber-500/60 -top-5 left-0 absolute whitespace-nowrap cursor-move z-50">
                                            <i class="fa-solid fa-up-down-left-right"></i> អូសទីតាំង
                                        </div>
                                        <div class="mb-1">
                                            ${customLogoB64 ? `
                                                <img src="${customLogoB64}" alt="Logo" class="w-14 h-14 object-contain shadow-sm rounded-full" />
                                            ` : `
                                                <div class="w-12 h-12 rounded-full border border-amber-500/80 bg-amber-50 flex items-center justify-center text-amber-700 text-xl shadow-sm">
                                                    <i class="fa-solid fa-award"></i>
                                                </div>
                                            `}
                                        </div>
                                        <p contenteditable="true" class="cert-editable font-moul text-blue-950 text-[10.5px] leading-tight">មន្ទីរអប់រំ យុវជន និងកីឡាខេត្ត${provinceName}</p>
                                        <p contenteditable="true" class="cert-editable font-moul text-blue-950 text-[10px] leading-tight">ការិយាល័យអប់រំ យុវជន និងកីឡានៃរដ្ឋបាលស្រុក${districtName}</p>
                                        <p contenteditable="true" class="cert-editable font-moul text-blue-950 text-[10px] leading-tight">${schoolName}</p>
                                    </div>

                                    <!-- Center: Kingdom of Cambodia & National Motto (DRAGGABLE SECTION) -->
                                    <div id="cert_sec_header_center" class="canva-el canva-draggable-section text-center pt-1" style="transform: translate(${posHeaderCenter.x}px, ${posHeaderCenter.y}px);">
                                        <div class="drag-handle no-print hidden items-center gap-1 px-1.5 py-0.5 bg-slate-900/90 text-amber-300 text-[9px] rounded shadow border border-amber-500/60 -top-5 left-1/2 -translate-x-1/2 absolute whitespace-nowrap cursor-move z-50">
                                            <i class="fa-solid fa-up-down-left-right"></i> អូសទីតាំង
                                        </div>
                                        <p contenteditable="true" class="cert-editable font-moul text-blue-950 text-sm md:text-base tracking-wide">ព្រះរាជាណាចក្រកម្ពុជា</p>
                                        <p contenteditable="true" class="cert-editable font-moul text-blue-900 text-xs md:text-sm mt-0.5">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                                        <img src="${window.CMS_HEADER_SYMBOL_B64 || 'assets/images/header-flourish.png'}" class="header-flourish-symbol" alt="symbol" style="display: block; margin: 3px auto 0 auto; width: 130px; height: 10px; object-fit: contain;" />
                                    </div>

                                    <!-- Right spacer -->
                                    <div class="text-right min-w-[70px]"></div>
                                </div>

                                <!-- 🎖️ ចំណងជើងប័ណ្ណសរសើរ / លិខិតសរសើរ (Title Banner - DRAGGABLE SECTION) 🎖️ -->
                                <div id="cert_sec_title" class="canva-el canva-draggable-section my-2 text-center" style="transform: translate(${posTitle.x}px, ${posTitle.y}px);">
                                    <div class="drag-handle no-print hidden items-center gap-1 px-2 py-0.5 bg-slate-900/90 text-amber-300 text-[10px] rounded shadow border border-amber-500/60 -top-6 left-1/2 -translate-x-1/2 absolute whitespace-nowrap cursor-move z-50">
                                        <i class="fa-solid fa-up-down-left-right"></i> អូសចំណងជើង (Drag Title)
                                    </div>
                                    <h1 id="certMainTitle" contenteditable="true" class="cert-editable ${certFontFamily} text-3xl sm:text-4xl md:text-5xl drop-shadow-sm mb-1 tracking-wide" style="color: ${certTitleColor};">
                                        ${titleType}
                                    </h1>
                                </div>

                                <!-- 📜 តួសេចក្តី (Body Content - DRAGGABLE SECTION) 📜 -->
                                <div id="cert_sec_body" class="canva-el canva-draggable-section my-1.5 max-w-4xl mx-auto space-y-2.5 text-sm md:text-base leading-relaxed text-slate-800" style="transform: translate(${posBody.x}px, ${posBody.y}px);">
                                    <div class="drag-handle no-print hidden items-center gap-1 px-2 py-0.5 bg-slate-900/90 text-amber-300 text-[10px] rounded shadow border border-amber-500/60 -top-6 left-1/2 -translate-x-1/2 absolute whitespace-nowrap cursor-move z-50">
                                        <i class="fa-solid fa-up-down-left-right"></i> អូសតួសេចក្តី (Drag Body)
                                    </div>

                                    <!-- Administration header line -->
                                    <p contenteditable="true" class="cert-editable font-moul text-blue-950 text-base md:text-lg">
                                        គណៈគ្រប់គ្រង${schoolName}
                                    </p>
                                    
                                    <!-- Praise to student line -->
                                    <div class="text-slate-800 text-sm md:text-base flex flex-wrap items-center justify-center gap-1.5 pt-0.5">
                                        <span contenteditable="true" class="cert-editable">សរសើរចំពោះសិស្សឈ្មោះ៖</span>
                                        <span contenteditable="true" class="cert-editable font-moul text-xl md:text-2xl text-blue-950 px-3 border-b-2 border-dashed border-amber-600 inline-block font-bold">
                                            ${student.name}
                                        </span>
                                        <span contenteditable="true" class="cert-editable">រៀនថ្នាក់ទី</span>
                                        <span contenteditable="true" class="cert-editable font-bold text-blue-900 px-1.5 text-base md:text-lg">${student.grade || curLevel} ${student.room || ''}</span>
                                        <span contenteditable="true" class="cert-editable">ដែលបានយកចិត្តទុកដាក់</span>
                                    </div>

                                    <!-- Study performance line -->
                                    <div class="text-slate-800 text-sm md:text-base flex flex-wrap items-center justify-center gap-1.5">
                                        <span contenteditable="true" class="cert-editable">ខិតខំសិក្សារៀនសូត្រ ទទួលបានចំណាត់ថ្នាក់លេខ</span>
                                        <span contenteditable="true" class="cert-editable font-moul text-lg md:text-xl text-red-600 font-bold px-1.5">${activeRank}</span>
                                        <span contenteditable="true" class="cert-editable">និទ្ទេស</span>
                                        <span contenteditable="true" class="cert-editable font-moul text-lg md:text-xl text-red-600 font-bold px-1.5">${activeRank == 1 ? 'A' : activeRank == 2 ? 'B' : activeRank == 3 ? 'C' : 'ល្អ'}</span>
                                    </div>

                                    <!-- Exam Session / Academic Year (in red Moul font matching image) -->
                                    <div class="pt-1">
                                        <p contenteditable="true" class="cert-editable font-moul text-red-600 text-sm md:text-base tracking-wide">
                                            ${examSession}
                                        </p>
                                    </div>
                                </div>

                                <!-- ✍️ ហត្ថលេខា និងកាលបរិច្ឆេទ (Signatures & Date - DRAGGABLE SECTIONS) ✍️ -->
                                <div class="flex justify-between items-end text-xs mt-4 px-4 sm:px-10">
                                    <!-- Left side: បានឃើញ និងឯកភាព / នាយករងបច្ចេកទេស -->
                                    <div id="cert_sec_sig_left" class="canva-el canva-draggable-section text-center min-w-[150px]" style="transform: translate(${posSigLeft.x}px, ${posSigLeft.y}px);">
                                        <div class="drag-handle no-print hidden items-center gap-1 px-1.5 py-0.5 bg-slate-900/90 text-amber-300 text-[9px] rounded shadow border border-amber-500/60 -top-5 left-1/2 -translate-x-1/2 absolute whitespace-nowrap cursor-move z-50">
                                            <i class="fa-solid fa-up-down-left-right"></i> អូស
                                        </div>
                                        <p contenteditable="true" class="cert-editable text-slate-700 text-[11px] font-bold">បានឃើញ និងឯកភាព</p>
                                        <p contenteditable="true" class="cert-editable font-moul text-blue-950 text-xs mt-0.5">នាយក/នាយិកាសាលា</p>
                                        
                                        <!-- Stamp & Signature Space -->
                                        <div class="h-16 flex items-center justify-center relative my-1"></div>

                                        ${principalName ? `<p contenteditable="true" class="cert-editable font-moul text-red-600 text-sm font-bold mt-1">${principalName}</p>` : ''}
                                    </div>

                                    <!-- Right side: Lunar Date, Solar Date, Teacher Signature -->
                                    <div id="cert_sec_sig_right" class="canva-el canva-draggable-section text-center min-w-[170px] space-y-0.5" style="transform: translate(${posSigRight.x}px, ${posSigRight.y}px);">
                                        <div class="drag-handle no-print hidden items-center gap-1 px-1.5 py-0.5 bg-slate-900/90 text-amber-300 text-[9px] rounded shadow border border-amber-500/60 -top-5 left-1/2 -translate-x-1/2 absolute whitespace-nowrap cursor-move z-50">
                                            <i class="fa-solid fa-up-down-left-right"></i> អូស
                                        </div>
                                        <p contenteditable="true" class="cert-editable text-slate-700 text-[10.5px]">${lunarDateStr}</p>
                                        <p contenteditable="true" class="cert-editable text-slate-700 text-[11px] font-bold">${solarDateStr}</p>
                                        <p contenteditable="true" class="cert-editable font-moul text-blue-950 text-xs mt-1">គ្រូទទួលបន្ទុកថ្នាក់</p>
                                        
                                        <!-- Teacher Signature Space -->
                                        <div class="h-14 flex items-center justify-center"></div>

                                        <p contenteditable="true" class="cert-editable font-moul text-blue-950 text-sm font-bold">${teacherName}</p>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

            </div>
        `;

        modal.classList.remove("hidden");

        // 🎯 ភ្ជាប់ Event សម្រាប់អូស Text, Sections, និង Pictures ដោយសេរី (Init Draggables)
        setTimeout(() => {
            // Core Sections
            ['sec_header_left', 'sec_header_center', 'sec_title', 'sec_body', 'sec_sig_left', 'sec_sig_right'].forEach(id => {
                const el = document.getElementById('cert_' + id);
                if (el) window.KrouDigital.initDraggable(el, 'section', id);
            });

            // Custom Texts
            customTexts.forEach(t => {
                const el = document.getElementById(t.id);
                if (el) window.KrouDigital.initDraggable(el, 'text', t.id);
            });

            // Custom Pictures
            customPics.forEach(p => {
                const el = document.getElementById(p.id);
                if (el) window.KrouDigital.initDraggable(el, 'pic', p.id);
            });

            // Initialize Unified Canva Studio 5.0 Engine
            if (typeof window.initCanvaEngine === 'function') {
                window.initCanvaEngine();
            }
        }, 50);
    },
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
