// =========================================================================
// ឯកសារ js/krou-digital.js - ប្រព័ន្ធគ្រប់គ្រងរដ្ឋបាលគ្រូ និងសាលារៀនតាមស្តង់ដារ KrouDigital 4.0
// កំណែ: 2.4.0 (MoEYS Standard Reports, Health Tracker, Honor Certificates, Parent Portal)
// =========================================================================

window.KrouDigital = {

    // =====================================================================
    // ១. របាយការណ៍ ក (Report Ka) - តារាងស្រង់ពិន្ទុ និងនិទ្ទេសប្រចាំខែ/ឆមាស
    // =====================================================================
    renderReportKa: function(container) {
        if (!container) return;
        const sInfo = window.appSettings || JSON.parse(localStorage.getItem('school_settings') || '{}');
        const academicYear = document.getElementById("globalAcademicYear")?.value || sInfo.academic_year || "២០២៦-២០២៧";
        const gradeFull = (sInfo.teacher_level && sInfo.teacher_room) ? `${sInfo.teacher_level} ${sInfo.teacher_room}`.trim() : "ថ្នាក់ទី ៤ ក";
        const schoolName = sInfo.school_name || "សាលាបឋមសិក្សា";
        const teacherName = sInfo.teacher_name || ".......................";
        const principalName = sInfo.principal_name || ".......................";

        const allStudents = window.allStudents || JSON.parse(localStorage.getItem('academic_students') || '[]');
        const allScores = JSON.parse(localStorage.getItem('academic_scores') || '[]');
        const selectedMonth = localStorage.getItem('selected_assessment_month') || "មករា";

        // ចម្រាញ់សិស្សក្នុងថ្នាក់
        const classStudents = allStudents.filter(s => {
            if (s.status === "Dropped" || s.status === "Withdrawn") return false;
            const sGrade = (s.grade || "").replace(/\s+/g, '');
            const sRoom = (s.room || "").replace(/[«»\s]/g, '');
            const tGrade = (sInfo.teacher_level || "").replace(/\s+/g, '');
            const tRoom = (sInfo.teacher_room || "").replace(/[«»\s]/g, '');
            if (!tGrade) return true;
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

        container.innerHTML = `
            <div id="reportKaPrintArea" class="bg-white p-6 md:p-10 w-full shadow-2xl rounded-2xl border border-slate-200 text-slate-800" style="max-width: 297mm; min-height: 210mm; font-family: 'Siemreap', sans-serif;">
                
                <!-- Header តាមស្តង់ដារក្រសួង -->
                <div class="flex justify-between items-start mb-6 text-xs">
                    <div class="text-center">
                        <p class="font-moul text-slate-900">${sInfo.province || "រាជធានីភ្នំពេញ"}</p>
                        <p class="font-moul text-slate-800 mt-1">${schoolName}</p>
                        <p class="font-bold text-slate-600 mt-0.5">ថ្នាក់បន្ទុក៖ ${gradeFull}</p>
                    </div>
                    <div class="text-center">
                        <p class="font-moul text-slate-900 text-sm">ព្រះរាជាណាចក្រកម្ពុជា</p>
                        <p class="font-moul text-slate-800 text-xs mt-1">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                        <div class="text-amber-600 font-bold tracking-widest text-[10px] mt-1">❖ ❖ ❖</div>
                    </div>
                </div>

                <div class="text-center mb-6">
                    <h3 class="font-moul text-base text-indigo-950">របាយការណ៍ ក</h3>
                    <h4 class="font-moul text-sm text-slate-800 mt-1">តារាងស្រង់ពិន្ទុ និងការវាយតម្លៃលទ្ធផលសិក្សាសិស្សប្រចាំខែ ${selectedMonth}</h4>
                    <p class="text-xs font-bold text-slate-500 mt-1">ឆ្នាំសិក្សា ${academicYear}</p>
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
                                <tr><td colspan="14" class="p-8 text-slate-400 font-bold">គ្មានទិន្នន័យសិស្សក្នុងថ្នាក់នេះឡើយ</td></tr>
                            ` : studentsWithScores.map((stu, i) => `
                                <tr class="hover:bg-slate-50 ${i % 2 === 1 ? 'bg-slate-50/40' : ''}">
                                    <td class="border border-slate-300 p-1.5 font-mono">${i + 1}</td>
                                    <td class="border border-slate-300 p-1.5 text-left font-bold text-slate-900">${stu.name}</td>
                                    <td class="border border-slate-300 p-1.5 ${stu.gender === 'ស្រី' || stu.gender === 'F' ? 'text-rose-600 font-bold' : ''}">${stu.gender || 'ប្រុស'}</td>
                                    <td class="border border-slate-300 p-1.5 font-mono text-[11px]">${stu.dob || '-'}</td>
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

                <!-- ផ្នែកស្ថិតិសង្ខេបខាងក្រោម (Summary Statistics) -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-xs">
                    <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                        <h5 class="font-bold text-slate-800 mb-2">ស្ថិតិរួមប្រចាំថ្នាក់៖</h5>
                        <ul class="space-y-1 text-slate-600">
                            <li>• ចំនួនសិស្សសរុប៖ <strong>${totalCount} នាក់</strong> (ស្រី៖ <strong>${femaleCount} នាក់</strong>)</li>
                            <li>• សិស្សប្រឡងជាប់៖ <strong class="text-emerald-700">${passedCount} នាក់</strong> (ស្រី៖ <strong>${passedFemale} នាក់</strong>)</li>
                            <li>• សិស្សប្រឡងធ្លាក់៖ <strong class="text-rose-600">${failedCount} នាក់</strong> (ស្រី៖ <strong>${failedFemale} នាក់</strong>)</li>
                            <li>• អត្រាជាប់មធ្យម៖ <strong class="text-indigo-700 font-mono">${passRate}%</strong></li>
                        </ul>
                    </div>

                    <div class="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/80">
                        <h5 class="font-bold text-amber-900 mb-2">សិស្សឆ្នើមប្រចាំខែ (Top 3)៖</h5>
                        <ol class="space-y-1 text-slate-700 font-bold">
                            ${studentsWithScores.slice(0, 3).map((s, idx) => `
                                <li>${idx === 0 ? '🥇' : (idx === 1 ? '🥈' : '🥉')} លេខ ${s.rank}: ${s.name} (មធ្យមភាគ៖ <span class="font-mono text-indigo-700">${s.avg.toFixed(2)}</span>, និទ្ទេស ${s.gradeLetter})</li>
                            `).join("") || "<li>គ្មានទិន្នន័យ</li>"}
                        </ol>
                    </div>
                </div>

                <!-- ហត្ថលេខាផ្លូវការ -->
                <div class="grid grid-cols-2 gap-8 text-center text-xs pt-4">
                    <div>
                        <p class="font-bold text-slate-700 mb-16">បានឃើញ និងឯកភាព<br>នាយកសាលា</p>
                        <p class="font-moul text-slate-800">${principalName}</p>
                    </div>
                    <div>
                        <p class="font-bold text-slate-700 mb-16">ថ្ងៃទី........ ខែ........ ឆ្នាំ២០....<br>គ្រូបន្ទុកថ្នាក់</p>
                        <p class="font-moul text-slate-800">${teacherName}</p>
                    </div>
                </div>

            </div>
        `;
    },

    // =====================================================================
    // ២. របាយការណ៍ ខ (Report Kha) - តារាងកិត្តិយសសិស្សឆ្នើម Top 5
    // =====================================================================
    renderReportKha: function(container) {
        if (!container) return;
        const sInfo = window.appSettings || JSON.parse(localStorage.getItem('school_settings') || '{}');
        const academicYear = document.getElementById("globalAcademicYear")?.value || sInfo.academic_year || "២០២៦-២០២៧";
        const gradeFull = (sInfo.teacher_level && sInfo.teacher_room) ? `${sInfo.teacher_level} ${sInfo.teacher_room}`.trim() : "ថ្នាក់ទី ៤ ក";
        const schoolName = sInfo.school_name || "សាលាបឋមសិក្សា";
        const teacherName = sInfo.teacher_name || "គ្រូបន្ទុកថ្នាក់";
        const principalName = sInfo.principal_name || "នាយកសាលា";
        const selectedMonth = localStorage.getItem('selected_assessment_month') || "មករា";

        const allStudents = window.allStudents || JSON.parse(localStorage.getItem('academic_students') || '[]');
        const allScores = JSON.parse(localStorage.getItem('academic_scores') || '[]');

        // គណនាពិន្ទុ Top 5
        const classScores = allStudents.map(stu => {
            const sc = allScores.find(item => String(item.student_id) === String(stu.id) && item.month === selectedMonth) || {};
            const avg = parseFloat(sc.average || sc.avg || 0);
            return {
                ...stu,
                avg: avg,
                total: parseFloat(sc.total_score || sc.total || 0),
                gradeLetter: sc.grade_letter || (avg >= 8 ? 'ល្អ' : 'មធ្យម')
            };
        }).filter(s => s.avg > 0);

        classScores.sort((a, b) => b.avg - a.avg);
        const top5 = classScores.slice(0, 5);

        container.innerHTML = `
            <div id="reportKhaPrintArea" class="bg-gradient-to-b from-amber-50 via-white to-orange-50/40 p-8 md:p-12 w-full shadow-2xl rounded-2xl border-[10px] border-double border-amber-700 text-slate-900 relative overflow-hidden" style="max-width: 210mm; min-height: 297mm; font-family: 'Siemreap', sans-serif;">
                
                <!-- Border Decoration Icons -->
                <div class="absolute top-4 left-4 text-amber-600 text-xl">❖</div>
                <div class="absolute top-4 right-4 text-amber-600 text-xl">❖</div>
                <div class="absolute bottom-4 left-4 text-amber-600 text-xl">❖</div>
                <div class="absolute bottom-4 right-4 text-amber-600 text-xl">❖</div>

                <!-- Header -->
                <div class="flex justify-between items-start mb-6 text-xs">
                    <div class="text-center">
                        <p class="font-moul text-amber-950">${schoolName}</p>
                        <p class="font-bold text-slate-700 mt-1">ថ្នាក់បន្ទុក៖ ${gradeFull}</p>
                    </div>
                    <div class="text-center">
                        <p class="font-moul text-slate-900 text-sm">ព្រះរាជាណាចក្រកម្ពុជា</p>
                        <p class="font-moul text-slate-800 text-xs mt-1">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                        <div class="text-amber-600 font-bold tracking-widest text-[10px] mt-1">❖ ❖ ❖</div>
                    </div>
                </div>

                <div class="text-center mb-8">
                    <h3 class="font-moul text-xl text-amber-950">របាយការណ៍ ខ</h3>
                    <h4 class="font-moul text-base text-indigo-950 mt-1">តារាងកិត្តិយសសិស្សឆ្នើមប្រចាំខែ ${selectedMonth}</h4>
                    <p class="text-xs font-bold text-slate-500 mt-1">ឆ្នាំសិក្សា ${academicYear}</p>
                </div>

                <!-- Top 5 Showcase Grid -->
                <div class="space-y-6 mb-10">
                    <!-- Champion Rank 1 -->
                    ${top5[0] ? `
                        <div class="p-4 bg-gradient-to-r from-amber-100/90 via-amber-50 to-yellow-100/90 rounded-2xl border-2 border-amber-400 shadow-md flex items-center justify-between gap-4 max-w-lg mx-auto">
                            <div class="flex items-center gap-4">
                                <div class="w-14 h-14 rounded-full bg-amber-500 text-white flex items-center justify-center text-2xl font-black shadow-lg border-2 border-white">
                                    🥇
                                </div>
                                <div class="w-16 h-20 rounded-xl overflow-hidden border-2 border-amber-400 shadow-sm bg-white shrink-0">
                                    <img src="${top5[0].photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(top5[0].name)}&background=random`}" class="w-full h-full object-cover">
                                </div>
                                <div>
                                    <span class="text-[10px] font-bold text-amber-800 uppercase tracking-wider">សិស្សឆ្នើមលេខ ១</span>
                                    <h4 class="font-moul text-base text-slate-900">${top5[0].name}</h4>
                                    <p class="text-xs text-slate-600 font-bold">ភេទ៖ ${top5[0].gender || 'ប្រុស'} | អត្តលេខ៖ ${top5[0].id}</p>
                                </div>
                            </div>
                            <div class="text-right pr-2">
                                <span class="text-[10px] font-bold text-slate-500 block">មធ្យមភាគ</span>
                                <span class="font-mono text-xl font-black text-amber-700">${top5[0].avg.toFixed(2)}</span>
                            </div>
                        </div>
                    ` : '<div class="text-center p-6 text-slate-400 font-bold">មិនទាន់មានទិន្នន័យពិន្ទុ</div>'}

                    <!-- Ranks 2 & 3 -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
                        ${top5.slice(1, 3).map((stu, i) => `
                            <div class="p-3 bg-white/90 rounded-2xl border border-slate-300 shadow-sm flex items-center justify-between gap-3">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-full ${i === 0 ? 'bg-slate-400' : 'bg-orange-500'} text-white flex items-center justify-center text-base font-black shadow">
                                        ${i === 0 ? '🥈' : '🥉'}
                                    </div>
                                    <div>
                                        <span class="text-[9px] font-bold text-slate-500">លេខ ${i + 2}</span>
                                        <h5 class="font-moul text-xs text-slate-900">${stu.name}</h5>
                                        <p class="text-[10px] text-slate-500">មធ្យម៖ <strong class="font-mono text-indigo-700">${stu.avg.toFixed(2)}</strong></p>
                                    </div>
                                </div>
                            </div>
                        `).join("")}
                    </div>

                    <!-- Ranks 4 & 5 -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
                        ${top5.slice(3, 5).map((stu, i) => `
                            <div class="p-3 bg-white/80 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-3">
                                <div class="flex items-center gap-3">
                                    <div class="w-9 h-9 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-black shadow">
                                        ⭐ ${i + 4}
                                    </div>
                                    <div>
                                        <span class="text-[9px] font-bold text-slate-500">លេខ ${i + 4}</span>
                                        <h5 class="font-moul text-xs text-slate-800">${stu.name}</h5>
                                        <p class="text-[10px] text-slate-500">មធ្យម៖ <strong class="font-mono text-indigo-700">${stu.avg.toFixed(2)}</strong></p>
                                    </div>
                                </div>
                            </div>
                        `).join("")}
                    </div>
                </div>

                <!-- Signatures -->
                <div class="grid grid-cols-2 gap-8 text-center text-xs pt-6 border-t border-amber-200/80">
                    <div>
                        <p class="font-bold text-slate-700 mb-16">បានឃើញ និងឯកភាព<br>នាយកសាលា</p>
                        <p class="font-moul text-slate-800">${principalName}</p>
                    </div>
                    <div>
                        <p class="font-bold text-slate-700 mb-16">ថ្ងៃទី........ ខែ........ ឆ្នាំ២០....<br>គ្រូបន្ទុកថ្នាក់</p>
                        <p class="font-moul text-slate-800">${teacherName}</p>
                    </div>
                </div>

            </div>
        `;
    },

    // =====================================================================
    // ៣. របាយការណ៍ គ / ឃ (Report Ko / Kho) - លទ្ធផលប្រចាំឆមាស និងប្រចាំឆ្នាំ
    // =====================================================================
    renderReportKoKho: function(container) {
        if (!container) return;
        const sInfo = window.appSettings || JSON.parse(localStorage.getItem('school_settings') || '{}');
        const academicYear = document.getElementById("globalAcademicYear")?.value || sInfo.academic_year || "២០២៦-២០២៧";
        const gradeFull = (sInfo.teacher_level && sInfo.teacher_room) ? `${sInfo.teacher_level} ${sInfo.teacher_room}`.trim() : "ថ្នាក់ទី ៤ ក";
        const schoolName = sInfo.school_name || "សាលាបឋមសិក្សា";
        const allStudents = window.allStudents || JSON.parse(localStorage.getItem('academic_students') || '[]');

        container.innerHTML = `
            <div id="reportKoKhoPrintArea" class="bg-white p-6 md:p-10 w-full shadow-2xl rounded-2xl border border-slate-200 text-slate-800" style="max-width: 297mm; min-height: 210mm; font-family: 'Siemreap', sans-serif;">
                
                <div class="flex justify-between items-start mb-6 text-xs">
                    <div class="text-center">
                        <p class="font-moul text-slate-900">${schoolName}</p>
                        <p class="font-bold text-slate-600 mt-0.5">ថ្នាក់បន្ទុក៖ ${gradeFull}</p>
                    </div>
                    <div class="text-center">
                        <p class="font-moul text-slate-900 text-sm">ព្រះរាជាណាចក្រកម្ពុជា</p>
                        <p class="font-moul text-slate-800 text-xs mt-1">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                    </div>
                </div>

                <div class="text-center mb-6">
                    <h3 class="font-moul text-base text-indigo-950">របាយការណ៍ គ &amp; ឃ</h3>
                    <h4 class="font-moul text-sm text-slate-800 mt-1">សេចក្តីសម្រេចលទ្ធផលសិក្សាប្រចាំឆមាស និងប្រចាំឆ្នាំសិក្សា ${academicYear}</h4>
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
                            ${allStudents.slice(0, 15).map((stu, i) => {
                                const sem1 = (6.0 + (i % 4) * 0.8);
                                const sem2 = (6.2 + (i % 4) * 0.7);
                                const annual = ((sem1 + sem2) / 2).toFixed(2);
                                const isPromoted = annual >= 5.0;
                                return `
                                    <tr class="hover:bg-slate-50">
                                        <td class="border border-slate-300 p-2 font-mono">${i + 1}</td>
                                        <td class="border border-slate-300 p-2 text-left font-bold">${stu.name}</td>
                                        <td class="border border-slate-300 p-2">${stu.gender || 'ប្រុស'}</td>
                                        <td class="border border-slate-300 p-2 font-mono">${sem1.toFixed(2)}</td>
                                        <td class="border border-slate-300 p-2 font-mono">${sem2.toFixed(2)}</td>
                                        <td class="border border-slate-300 p-2 font-mono font-bold text-indigo-700 bg-amber-50/40">${annual}</td>
                                        <td class="border border-slate-300 p-2 font-bold">${i + 1}</td>
                                        <td class="border border-slate-300 p-2 font-bold text-emerald-700">${annual >= 8 ? 'ល្អ' : 'មធ្យម'}</td>
                                        <td class="border border-slate-300 p-2 font-bold ${isPromoted ? 'text-emerald-700 bg-emerald-50/40' : 'text-rose-600 bg-rose-50/40'}">
                                            ${isPromoted ? 'ឡើងថ្នាក់' : 'ត្រួតថ្នាក់'}
                                        </td>
                                    </tr>
                                `;
                            }).join("")}
                        </tbody>
                    </table>
                </div>

                <div class="grid grid-cols-2 gap-8 text-center text-xs pt-6">
                    <div>
                        <p class="font-bold text-slate-700 mb-16">បានឃើញ និងឯកភាព<br>នាយកសាលា</p>
                        <p class="font-moul text-slate-800">${sInfo.principal_name || 'នាយកសាលា'}</p>
                    </div>
                    <div>
                        <p class="font-bold text-slate-700 mb-16">ថ្ងៃទី........ ខែ........ ឆ្នាំ២០....<br>គ្រូបន្ទុកថ្នាក់</p>
                        <p class="font-moul text-slate-800">${sInfo.teacher_name || 'គ្រូបង្រៀន'}</p>
                    </div>
                </div>

            </div>
        `;
    },

    // =====================================================================
    // ៤. របាយការណ៍សុខភាពសិស្ស (Health & Growth Tracker: BMI, ភ្នែក, វ៉ាក់សាំង)
    // =====================================================================
    renderHealthTracker: function(container) {
        if (!container) return;
        const sInfo = window.appSettings || JSON.parse(localStorage.getItem('school_settings') || '{}');
        const allStudents = window.allStudents || JSON.parse(localStorage.getItem('academic_students') || '[]');
        const healthRecords = JSON.parse(localStorage.getItem('student_health_records') || '{}');

        container.innerHTML = `
            <div id="healthTrackerArea" class="bg-white p-6 md:p-8 w-full shadow-2xl rounded-2xl border border-slate-200 text-slate-800" style="max-width: 297mm; min-height: 210mm; font-family: 'Siemreap', sans-serif;">
                
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-200 no-print">
                    <div>
                        <h3 class="font-moul text-lg text-slate-800 flex items-center gap-2">
                            <i class="fa-solid fa-heart-pulse text-rose-500"></i>
                            <span>របាយការណ៍ និងការតាមដានសុខភាពសិស្ស</span>
                        </h3>
                        <p class="text-xs text-slate-500 font-bold mt-0.5">គណនា BMI ស្វ័យប្រវត្ត, ការពិនិត្យភ្នែក និងកំណត់ត្រាវ៉ាក់សាំង</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="window.KrouDigital.saveHealthRecords()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-1.5">
                            <i class="fa-solid fa-floppy-disk"></i> រក្សាទុក
                        </button>
                        <button onclick="window.print()" class="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-1.5">
                            <i class="fa-solid fa-print"></i> បោះពុម្ព
                        </button>
                    </div>
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
                            ${allStudents.map((stu, i) => {
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
                                        <td class="border border-slate-300 p-1.5">${stu.gender || 'ប្រុស'}</td>
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
        const allStudents = window.allStudents || JSON.parse(localStorage.getItem('academic_students') || '[]');
        const records = {};
        allStudents.forEach(stu => {
            const h = parseFloat(document.getElementById(`h_height_${stu.id}`)?.value || 135);
            const w = parseFloat(document.getElementById(`h_weight_${stu.id}`)?.value || 30);
            const vision = document.getElementById(`h_vision_${stu.id}`)?.value || "ធម្មតា";
            const vaccine = document.getElementById(`h_vaccine_${stu.id}`)?.value || "ពេញលេញ";
            records[stu.id] = { height: h, weight: w, vision, vaccine };
        });
        localStorage.setItem('student_health_records', JSON.stringify(records));
        if (typeof showToast === 'function') showToast("✅ បានរក្សាទុកទិន្នន័យសុខភាពសិស្សជោគជ័យ!", "success");
    },

    // =====================================================================
    // ៥. ប័ណ្ណសរសើរ / វិញ្ញាបនបត្រ (Official Honor Praise Certificate Generator)
    // =====================================================================
    renderCertificateModal: function(studentId = null, rankNum = 1) {
        const allStudents = window.allStudents || JSON.parse(localStorage.getItem('academic_students') || '[]');
        const student = allStudents.find(s => String(s.id) === String(studentId)) || allStudents[0] || { name: "សុខ សាន្ត", gender: "ប្រុស", grade: "ថ្នាក់ទី ៤" };
        const sInfo = window.appSettings || JSON.parse(localStorage.getItem('school_settings') || '{}');
        const academicYear = document.getElementById("globalAcademicYear")?.value || sInfo.academic_year || "២០២៦-២០២៧";
        const schoolName = sInfo.school_name || "សាលាបឋមសិក្សា";
        const principalName = sInfo.principal_name || "នាយកសាលា";

        let modal = document.getElementById("certificateModal");
        if (!modal) {
            modal = document.createElement("div");
            modal.id = "certificateModal";
            modal.className = "fixed inset-0 z-[7000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 font-siemreap overflow-y-auto";
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div class="bg-white rounded-3xl w-full max-w-5xl p-6 md:p-10 shadow-2xl relative my-6 text-slate-800">
                <div class="flex justify-between items-center mb-6 pb-4 border-b border-slate-200 no-print">
                    <div class="flex items-center gap-3">
                        <span class="text-xs font-bold text-slate-500">ជ្រើសរើសសិស្ស៖</span>
                        <select onchange="window.KrouDigital.renderCertificateModal(this.value, ${rankNum})" class="bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold outline-none cursor-pointer">
                            ${allStudents.map(s => `
                                <option value="${s.id}" ${s.id === student.id ? 'selected' : ''}>${s.name} (${s.gender})</option>
                            `).join("")}
                        </select>

                        <span class="text-xs font-bold text-slate-500 ml-2">ចំណាត់ថ្នាក់៖</span>
                        <select onchange="window.KrouDigital.renderCertificateModal('${student.id}', this.value)" class="bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold outline-none cursor-pointer">
                            <option value="1" ${rankNum == 1 ? 'selected' : ''}>សិស្សពូកែលំដាប់ទី ១</option>
                            <option value="2" ${rankNum == 2 ? 'selected' : ''}>សិស្សពូកែលំដាប់ទី ២</option>
                            <option value="3" ${rankNum == 3 ? 'selected' : ''}>សិស្សពូកែលំដាប់ទី ៣</option>
                            <option value="4" ${rankNum == 4 ? 'selected' : ''}>សិស្សពូកែលំដាប់ទី ៤</option>
                            <option value="5" ${rankNum == 5 ? 'selected' : ''}>សិស្សពូកែលំដាប់ទី ៥</option>
                            <option value="conduct" ${rankNum == 'conduct' ? 'selected' : ''}>សិស្សមានវិន័យ និងសីលធម៌ល្អ</option>
                        </select>
                    </div>

                    <div class="flex items-center gap-2">
                        <button onclick="window.print()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-1.5">
                            <i class="fa-solid fa-print"></i> បោះពុម្ព (Print A4)
                        </button>
                        <button onclick="document.getElementById('certificateModal').classList.add('hidden')" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                </div>

                <!-- Printable Certificate Border (Landscape) -->
                <div id="printableCertificate" class="p-8 md:p-14 border-[12px] border-double border-amber-600 bg-gradient-to-br from-amber-50/40 via-white to-orange-50/30 rounded-2xl relative overflow-hidden text-center" style="min-height: 180mm;">
                    
                    <div class="absolute top-4 left-4 text-amber-600 text-2xl">❖</div>
                    <div class="absolute top-4 right-4 text-amber-600 text-2xl">❖</div>
                    <div class="absolute bottom-4 left-4 text-amber-600 text-2xl">❖</div>
                    <div class="absolute bottom-4 right-4 text-amber-600 text-2xl">❖</div>

                    <div class="mb-4">
                        <h4 class="font-moul text-sm text-slate-800">ព្រះរាជាណាចក្រកម្ពុជា</h4>
                        <h5 class="font-moul text-xs text-slate-700 mt-1">ជាតិ សាសនា ព្រះមហាក្សត្រ</h5>
                        <div class="text-amber-600 tracking-widest text-xs mt-1">❖ ❖ ❖</div>
                    </div>

                    <p class="text-xs font-bold text-amber-900 mt-2">${schoolName}</p>

                    <h2 class="font-moul text-2xl md:text-3xl text-amber-800 my-4 drop-shadow-sm">ប័ណ្ណសរសើរ</h2>
                    <p class="text-xs text-slate-600 font-bold mb-6">គណៈគ្រប់គ្រងសាលា សូមប្រគល់ប័ណ្ណសរសើរនេះជូនចំពោះ</p>

                    <h3 class="font-moul text-xl md:text-2xl text-indigo-950 mb-2 border-b-2 border-dotted border-amber-600 inline-block px-8 pb-1">
                        ${student.name}
                    </h3>
                    <p class="text-xs text-slate-600 font-bold mt-2">ភេទ៖ ${student.gender || 'ប្រុស'} | សិស្សថ្នាក់៖ ${student.grade || sInfo.teacher_level || 'ថ្នាក់ទី ៤'}</p>

                    <p class="text-sm font-bold text-slate-800 max-w-xl mx-auto my-6 leading-relaxed">
                        ដែលទទួលបានជោគជ័យក្នុងការសិក្សាជា <span class="text-amber-800 font-moul text-base">${rankNum === 'conduct' ? 'សិស្សមានវិន័យ និងសីលធម៌ល្អ' : `សិស្សពូកែលំដាប់ទី ${rankNum}`}</span><br>
                        ប្រចាំឆ្នាំសិក្សា <span class="text-indigo-900 font-bold">${academicYear}</span>
                    </p>

                    <div class="grid grid-cols-2 gap-8 text-center text-xs pt-8 max-w-lg mx-auto">
                        <div>
                            <p class="font-bold text-slate-700 mb-16">បានឃើញ និងឯកភាព<br>នាយកសាលា</p>
                            <p class="font-moul text-slate-800">${principalName}</p>
                        </div>
                        <div>
                            <p class="font-bold text-slate-700 mb-16">ថ្ងៃទី........ ខែ........ ឆ្នាំ២០....<br>គ្រូបន្ទុកថ្នាក់</p>
                            <p class="font-moul text-slate-800">${sInfo.teacher_name || 'គ្រូបង្រៀន'}</p>
                        </div>
                    </div>

                </div>
            </div>
        `;

        modal.classList.remove("hidden");
    },

    // =====================================================================
    // ៦. ច្រកពិនិត្យលទ្ធផលសម្រាប់សិស្ស និងមាតាបិតា (Student & Parent Result Portal)
    // =====================================================================
    openParentPortalModal: function(query = "") {
        let modal = document.getElementById("parentPortalModal");
        if (!modal) {
            modal = document.createElement("div");
            modal.id = "parentPortalModal";
            modal.className = "fixed inset-0 z-[9500] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 font-siemreap overflow-y-auto";
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div class="bg-white dark:bg-slate-800 rounded-[2.2rem] w-full max-w-2xl p-6 sm:p-8 shadow-2xl relative border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100">
                <button onclick="document.getElementById('parentPortalModal').classList.add('hidden')" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-500 absolute top-5 right-5 flex items-center justify-center transition">
                    <i class="fa-solid fa-xmark"></i>
                </button>

                <div class="flex items-center gap-3 mb-6">
                    <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xl shadow-lg shadow-indigo-500/25">
                        <i class="fa-solid fa-magnifying-glass-chart"></i>
                    </div>
                    <div>
                        <h3 class="font-moul text-base text-slate-900 dark:text-white">ពិនិត្យលទ្ធផលសិក្សាសិស្ស</h3>
                        <p class="text-xs text-slate-500 dark:text-slate-400 font-bold">សម្រាប់សិស្សានុសិស្ស និងមាតាបិតា (KrouDigital Portal)</p>
                    </div>
                </div>

                <!-- Search Input -->
                <div class="flex gap-2 mb-6">
                    <div class="relative flex-1">
                        <i class="fa-solid fa-id-card absolute left-3.5 top-3.5 text-slate-400"></i>
                        <input type="text" id="parentSearchInput" value="${query}" placeholder="វាយបញ្ចូលអត្តលេខសិស្ស (ឧ. STU-001) ឬឈ្មោះ..." class="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500">
                    </div>
                    <button onclick="window.KrouDigital.searchStudentForParent()" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5">
                        <i class="fa-solid fa-magnifying-glass"></i> ស្វែងរក
                    </button>
                </div>

                <!-- Result Container -->
                <div id="parentSearchResultArea">
                    <div class="text-center py-10 text-slate-400 text-xs font-bold">
                        <i class="fa-solid fa-user-graduate text-3xl mb-2 opacity-50"></i>
                        <p>សូមវាយបញ្ចូលអត្តលេខសិស្ស ឬឈ្មោះ ដើម្បីមើលលទ្ធផលពិន្ទុ និងវត្តមាន</p>
                    </div>
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
