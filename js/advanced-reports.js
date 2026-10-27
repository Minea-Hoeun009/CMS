// =========================================================================
// ឯកសារ js/advanced-reports.js - របាយការណ៍កម្រិតខ្ពស់, ព្រឹត្តិបត្រពិន្ទុ & Excel Import/Export
// =========================================================================

window.AdvancedReports = {

    // =====================================================================
    // ១. ព្រឹត្តិបត្រពិន្ទុបុគ្គលផ្លូវការ (Official Student Academic Report Card)
    // =====================================================================
    openStudentReportCard: function(studentId, selectedMonth = "មករា") {
        const students = window.allStudents || JSON.parse(localStorage.getItem('academic_students') || '[]');
        const student = students.find(s => String(s.id) === String(studentId));
        if (!student) {
            alert("រកមិនឃើញព័ត៌មានសិស្សនេះទេ!");
            return;
        }

        const sInfo = window.appSettings || JSON.parse(localStorage.getItem('school_settings') || '{}');
        const allScores = JSON.parse(localStorage.getItem('academic_scores') || '[]');
        const currentYear = document.getElementById("globalAcademicYear")?.value || sInfo.academic_year || "២០២៦-២០២៧";
        
        // ស្វែងរកពិន្ទុសិស្ស
        const scoreRec = allScores.find(s => String(s.student_id) === String(studentId) && s.month === selectedMonth) || {};

        let modal = document.getElementById("reportCardModal");
        if (!modal) {
            modal = document.createElement("div");
            modal.id = "reportCardModal";
            modal.className = "fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-2 sm:p-4 font-siemreap overflow-y-auto";
            document.body.appendChild(modal);
        }

        const subjectsList = [
            { key: "khmer", label: "ភាសាខ្មែរ", max: 10 },
            { key: "math", label: "គណិតវិទ្យា", max: 10 },
            { key: "science", label: "វិទ្យាសាស្ត្រ", max: 10 },
            { key: "social", label: "សិក្សាសង្គម", max: 10 },
            { key: "english", label: "ភាសាអង់គ្លេស", max: 10 },
            { key: "art", label: "សិល្បៈ", max: 10 },
            { key: "sport", label: "អប់រំកាយ និងកីឡា", max: 10 }
        ];

        modal.innerHTML = `
            <div class="bg-white rounded-3xl w-full max-w-4xl p-6 md:p-10 shadow-2xl relative my-8 text-slate-800">
                <!-- Action Buttons (Print / PDF / Close) -->
                <div class="flex justify-between items-center mb-6 pb-4 border-b border-slate-200 no-print">
                    <div class="flex items-center gap-2">
                        <span class="text-xs font-bold text-slate-500">ជ្រើសរើសខែ៖</span>
                        <select onchange="window.AdvancedReports.openStudentReportCard('${studentId}', this.value)" class="bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold outline-none cursor-pointer">
                            ${["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"].map(m => `
                                <option value="${m}" ${m === selectedMonth ? 'selected' : ''}>ខែ${m}</option>
                            `).join("")}
                        </select>
                    </div>

                    <div class="flex items-center gap-2">
                        ${window.CMSPrintManager ? window.CMSPrintManager.renderToolbarHtml('printableReportCard', 'portrait', 'A4', 100) : `
                            <button onclick="window.print()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5">
                                <i class="fa-solid fa-print"></i> បោះពុម្ព (Print)
                            </button>
                        `}
                        <button onclick="window.AdvancedReports.exportReportCardPDF('${student.name}')" class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5">
                            <i class="fa-solid fa-file-pdf"></i> ទាញយក PDF
                        </button>
                        <button onclick="document.getElementById('reportCardModal').classList.add('hidden')" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                </div>

                <!-- Printable Certificate Area -->
                <div id="printableReportCard" class="p-4 sm:p-8 border-2 border-amber-600/30 rounded-2xl bg-amber-50/10 relative overflow-hidden">
                    
                    <!-- Emblem & Header -->
                    <div class="text-center mb-6 space-y-1">
                        <h4 class="font-moul text-sm text-slate-700">ព្រះរាជាណាចក្រកម្ពុជា</h4>
                        <h5 class="font-moul text-xs text-slate-600">ជាតិ សាសនា ព្រះមហាក្សត្រ</h5>
                        <div class="w-24 h-0.5 bg-amber-600/40 mx-auto my-1"></div>
                        <h3 class="font-moul text-lg text-indigo-950 mt-3 pt-2">ព្រឹត្តិបត្រពិន្ទុ និងការវាយតម្លៃលទ្ធផលសិក្សា</h3>
                        <p class="text-xs text-slate-500 font-bold">ប្រចាំខែ ${selectedMonth} ឆ្នាំសិក្សា ${currentYear}</p>
                    </div>

                    <!-- School & Student Meta -->
                    <div class="grid grid-cols-2 gap-4 text-xs mb-6 pb-4 border-b border-slate-200 leading-relaxed">
                        <div>
                            <p><span class="font-bold">សាលារៀន៖</span> ${sInfo.school_name || 'សាលាបឋមសិក្សាគំរូ'}</p>
                            <p><span class="font-bold">ថ្នាក់បន្ទុក៖</span> ${student.class || (sInfo.teacher_level + ' ' + sInfo.teacher_room) || 'ថ្នាក់ទី ១'}</p>
                            <p><span class="font-bold">គ្រូបន្ទុកថ្នាក់៖</span> ${sInfo.teacher_name || 'លោកគ្រូ អ្នកគ្រូ'}</p>
                        </div>
                        <div class="text-right">
                            <p><span class="font-bold">គោត្តនាម និងនាម៖</span> <span class="font-moul text-indigo-900">${student.name}</span></p>
                            <p><span class="font-bold">អត្តលេខ៖</span> <span class="font-mono font-bold">${student.id}</span> | <span class="font-bold">ភេទ៖</span> ${student.gender || 'ប្រុស'}</p>
                            <p><span class="font-bold">ថ្ងៃខែឆ្នាំកំណើត៖</span> ${typeof window.formatDate === 'function' ? window.formatDate(student.dob) : (student.dob || '-')}</p>
                        </div>
                    </div>

                    <!-- Scores Table -->
                    <table class="w-full text-xs text-center border-collapse border border-slate-300 mb-6">
                        <thead>
                            <tr class="bg-slate-100 font-bold text-slate-700">
                                <th class="border border-slate-300 p-2.5 text-left">ល.រ</th>
                                <th class="border border-slate-300 p-2.5 text-left">មុខវិជ្ជាសិក្សា</th>
                                <th class="border border-slate-300 p-2.5">ពិន្ទុអតិបរមា</th>
                                <th class="border border-slate-300 p-2.5">ពិន្ទុទទួលបាន</th>
                                <th class="border border-slate-300 p-2.5">និទ្ទេស</th>
                                <th class="border border-slate-300 p-2.5 text-left">ការសង្កេតរបស់គ្រូ</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${subjectsList.map((sub, idx) => {
                                const val = scoreRec[sub.key] !== undefined ? scoreRec[sub.key] : "";
                                const numVal = parseFloat(val);
                                const subGrade = !isNaN(numVal) ? (numVal >= 8 ? 'ល្អ' : numVal >= 5 ? 'មធ្យម' : 'ខ្សោយ') : '-';
                                return `
                                    <tr>
                                        <td class="border border-slate-300 p-2 text-left font-mono">${idx + 1}</td>
                                        <td class="border border-slate-300 p-2 text-left font-bold">${sub.label}</td>
                                        <td class="border border-slate-300 p-2 font-mono">${sub.max}</td>
                                        <td class="border border-slate-300 p-2 font-mono font-bold ${numVal < 5 ? 'text-rose-600' : 'text-slate-800'}">${val || '-'}</td>
                                        <td class="border border-slate-300 p-2">${subGrade}</td>
                                        <td class="border border-slate-300 p-2 text-left text-[11px] text-slate-500">${numVal >= 8 ? 'យល់ដឹងបានល្អណាស់' : numVal >= 5 ? 'ខិតខំបន្ថែមទៀត' : 'ត្រូវការការបំប៉ន'}</td>
                                    </tr>
                                `;
                            }).join("")}
                            
                            <!-- Summary Row -->
                            <tr class="bg-indigo-50/60 font-bold text-slate-800">
                                <td colspan="3" class="border border-slate-300 p-2.5 text-right font-moul">សរុប និងមធ្យមភាគ៖</td>
                                <td class="border border-slate-300 p-2.5 font-mono text-sm font-black text-indigo-700">${scoreRec.total_score || '-'}</td>
                                <td colspan="2" class="border border-slate-300 p-2.5 text-left">
                                    <span>មធ្យមភាគ៖ <strong class="font-mono text-indigo-700">${scoreRec.average || '-'}</strong></span> | 
                                    <span>ចំណាត់ថ្នាក់៖ <strong class="text-rose-600 font-moul">លេខ ${scoreRec.rank || '-'}</strong></span> | 
                                    <span>និទ្ទេសទូទៅ៖ <strong class="text-emerald-700 font-moul">${scoreRec.grade_letter || '-'}</strong></span>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- Evaluation & Conduct -->
                    <div class="grid grid-cols-2 gap-4 text-xs mb-8 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                        <div>
                            <span class="font-bold block mb-1">ការវាយតម្លៃអត្តចរិត និងសីលធម៌៖</span>
                            <p class="text-slate-600">សិស្សមានវិន័យល្អ គោរពបទបញ្ជាផ្ទៃក្នុងសាលា មានស្មារតីសាមគ្គីភាព និងឧស្សាហ៍ព្យាយាមក្នុងការសិក្សា។</p>
                        </div>
                        <div>
                            <span class="font-bold block mb-1">យោបល់របស់គ្រូបន្ទុកថ្នាក់៖</span>
                            <p class="text-slate-600">សូមបន្តរក្សាការខិតខំប្រឹងប្រែងរៀនសូត្រនេះជាបន្តទៀត ដើម្បីទទួលបានលទ្ធផលកាន់តែប្រសើរនៅឆមាសបន្ទាប់។</p>
                        </div>
                    </div>

                    <!-- Signatures Section -->
                    <div class="grid grid-cols-3 gap-6 text-center text-xs pt-4">
                        <div>
                            <p class="font-bold text-slate-700 mb-16">បានឃើញ និងឯកភាព<br>នាយក/នាយិកាសាលា</p>
                            <p class="font-moul text-[11px] text-slate-800">${(sInfo.principal_name && sInfo.principal_name !== 'នាយកសាលា') ? sInfo.principal_name : ''}</p>
                        </div>
                        <div>
                            <p class="font-bold text-slate-700 mb-16">មតិអាណាព្យាបាលសិស្ស<br>&nbsp;</p>
                            <p class="text-[11px] text-slate-400">............................................</p>
                        </div>
                        <div>
                            <p class="font-bold text-slate-700 mb-16">ថ្ងៃទី........ ខែ........ ឆ្នាំ២០២....<br>គ្រូបន្ទុកថ្នាក់</p>
                            <p class="font-moul text-[11px] text-slate-800">${sInfo.teacher_name || 'គ្រូបង្រៀន'}</p>
                        </div>
                    </div>

                </div>
            </div>
        `;

        modal.classList.remove("hidden");
    },

    exportReportCardPDF: function(studentName) {
        const el = document.getElementById("printableReportCard");
        if (!el || typeof html2pdf !== 'function') {
            window.print();
            return;
        }

        const opt = {
            margin: 10,
            filename: `ព្រឹត្តិបត្រពិន្ទុ_${studentName}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(el).save();
    },

    // =====================================================================
    // ២. ការនាំចេញ Excel ស្តង់ដារក្រសួង MoEYS ច្រើន Sheet (CMS Master Report with 3 Separate Sheets)
    // =====================================================================
    // ផ្ទាំងជ្រើសរើសទម្រង់ Multi-Sheet Excel Export Modal
    openMasterExportModal: function() {
        let modal = document.getElementById("masterExportChoiceModal");
        if (!modal) {
            modal = document.createElement("div");
            modal.id = "masterExportChoiceModal";
            modal.className = "fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 font-siemreap";
            document.body.appendChild(modal);
        }

        const currentYear = document.getElementById("globalAcademicYear")?.value || localStorage.getItem('selected_academic_year') || "2026-2027";
        const students = (typeof window.getMasterStudents === 'function' ? window.getMasterStudents() : null)
            || window.allStudents
            || (window.filteredStudents && window.filteredStudents.length > 0 ? window.filteredStudents : null)
            || JSON.parse(localStorage.getItem('academic_students') || '[]');

        modal.innerHTML = `
            <div class="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg p-6 md:p-7 shadow-2xl border border-slate-200 dark:border-slate-700 animate-scale-up space-y-5">
                <!-- Header -->
                <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                    <div class="flex items-center gap-3">
                        <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center text-xl shadow-md shadow-emerald-500/20">
                            <i class="fa-solid fa-file-excel"></i>
                        </div>
                        <div>
                            <h3 class="font-moul text-base text-slate-800 dark:text-white">នាំចេញ CMS Master Report</h3>
                            <p class="text-xs text-slate-400">ឆ្នាំសិក្សា ${currentYear} (ឯកសារចែកជា ៣ Sheet ដាច់ដោយឡែក)</p>
                        </div>
                    </div>
                    <button onclick="document.getElementById('masterExportChoiceModal').classList.add('hidden')" class="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-white flex items-center justify-center transition">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <!-- Sheets Overview Info -->
                <div class="space-y-2.5">
                    <div class="p-3 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl flex items-start gap-3">
                        <span class="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">១</span>
                        <div>
                            <b class="text-blue-900 dark:text-blue-200 text-xs font-bold block">Sheet ១៖ បញ្ជីរាយនាមសិស្ស (Student List)</b>
                            <p class="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">ព័ត៌មានលម្អិតសិស្ស ១៨ ជួរឈរ, ស្ថិតិសង្ខេប (សរុប ស្រី ក្រីក្រ អាហារូបករណ៍), ក្បាលលិខិត និងហត្ថលេខា។</p>
                        </div>
                    </div>

                    <div class="p-3 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-start gap-3">
                        <span class="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">២</span>
                        <div>
                            <b class="text-emerald-900 dark:text-emerald-200 text-xs font-bold block">Sheet ២៖ តារាងស្រង់ពិន្ទុ (Score Sheet)</b>
                            <p class="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">ពិន្ទុគ្រប់មុខវិជ្ជា តម្រៀបតាមអក្ខរក្រមខ្មែរ (ក-អ) ជាមួយមធ្យមភាគ និទ្ទេស និងស្ថិតិអត្រាជាប់/ធ្លាក់។</p>
                        </div>
                    </div>

                    <div class="p-3 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-start gap-3">
                        <span class="w-6 h-6 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">៣</span>
                        <div>
                            <b class="text-amber-900 dark:text-amber-200 text-xs font-bold block">Sheet ៣៖ តារាងចំណាត់ថ្នាក់ (Rankings Sheet)</b>
                            <p class="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">តារាងចំណាត់ថ្នាក់សិស្សឆ្នើម តម្រៀបពីលេខ ១ ដល់ចុងក្រោយ ជាមួយ Top 3 (🥇🥈🥉) និងលទ្ធផលសិក្សា។</p>
                        </div>
                    </div>
                </div>

                <!-- Action Download Buttons -->
                <div class="space-y-2.5 pt-2">
                    <button onclick="window.AdvancedReports.executeMultiSheetExport('xlsx')" class="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2 group">
                        <i class="fa-solid fa-file-arrow-down text-base group-hover:translate-y-0.5 transition-transform"></i>
                        <span>ទាញយកជា Excel (.xlsx) - មាន ៣ Sheet ស្តង់ដារ (ណែនាំ)</span>
                    </button>

                    <button onclick="window.AdvancedReports.executeMultiSheetExport('xls')" class="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2 group">
                        <i class="fa-solid fa-palette text-base group-hover:scale-110 transition-transform"></i>
                        <span>ទាញយកជា Excel ចាក់ពណ៌ (.xls) - មាន ៣ Sheet + Royal Blue</span>
                    </button>
                </div>
            </div>
        `;

        modal.classList.remove("hidden");
    },

    // មុខងារចម្បង៖ បើក Modal ឬនាំចេញផ្ទាល់តាម Format
    exportMasterExcelWorkbook: function(format) {
        if (!format) {
            this.openMasterExportModal();
            return;
        }
        this.executeMultiSheetExport(format);
    },

    // ដំណើរការនាំចេញ Multi-Sheet Workbook ជាក់ស្តែង (Separate Sheets for Students, Scores & Rankings)
    executeMultiSheetExport: function(format = 'xlsx') {
        const modal = document.getElementById("masterExportChoiceModal");
        if (modal) modal.classList.add("hidden");

        const students = (typeof window.getMasterStudents === 'function' ? window.getMasterStudents() : null)
            || window.allStudents
            || (window.filteredStudents && window.filteredStudents.length > 0 ? window.filteredStudents : null)
            || JSON.parse(localStorage.getItem('academic_students') || '[]');

        if (!students || students.length === 0) {
            if (typeof showToast === 'function') showToast("⚠️ មិនមានទិន្នន័យសិស្សសម្រាប់នាំចេញទេ!");
            else alert("⚠️ មិនមានទិន្នន័យសិស្សសម្រាប់នាំចេញទេ!");
            return;
        }

        // គណនាពិន្ទុថ្មីៗស្រស់ៗ
        if (typeof window.calculateAllScores === 'function') {
            try { window.calculateAllScores(); } catch(e) { console.warn("calculateAllScores error:", e); }
        }

        let rawScores = (window.rankingsDataList && window.rankingsDataList.length > 0)
            ? [...window.rankingsDataList]
            : JSON.parse(localStorage.getItem('academic_scores') || '[]');

        const sInfo = window.appSettings || JSON.parse(localStorage.getItem('school_settings') || '{}');
        const currentYear = document.getElementById("globalAcademicYear")?.value || localStorage.getItem('selected_academic_year') || sInfo.academic_year || "2026-2027";

        // ១. បរិបទ និងកាលបរិច្ឆេទ MoEYS
        const ctx = (window.CMSPrintManager && typeof window.CMSPrintManager.getStandardContext === 'function')
            ? window.CMSPrintManager.getStandardContext({ academicYear: currentYear })
            : {
                districtName: (sInfo.district || "កៀនស្វាយ").replace(/^ស្រុក\s*/, '').trim(),
                schoolName: sInfo.school_name || "សាលាបឋមសិក្សា ខ្សុំ",
                principalName: sInfo.principal_name || "",
                teacherName: (window.AuthState ? window.AuthState.teacherName : null) || localStorage.getItem('auth_teacher_name') || sInfo.teacher_name || "",
                academicYear: currentYear || "២០២៦-២០២៧",
                grade: (sInfo.teacher_level && sInfo.teacher_room) ? `${sInfo.teacher_level} ${sInfo.teacher_room}`.trim() : "ថ្នាក់ទី ២ «ក»",
                solarDateStr: "ធ្វើនៅ..., ថ្ងៃទី.......ខែ..........ឆ្នាំ២០២៦",
                lunarDateStr: "ថ្ងៃ....................ខែ..................ឆ្នាំ...............ព.ស.២៥៧០"
            };

        const principalDisplayName = (ctx.principalName && ctx.principalName !== "នាយកសាលា") ? ctx.principalName : "";
        const toKh = window.toKhmerNum || (n => n);

        // ២. ស្ថិតិសង្ខេបសិស្ស
        const totalStudents = students.length;
        const femaleStudents = students.filter(s => s.gender === 'ស្រី' || s.gender === 'F').length;
        const maleStudents = totalStudents - femaleStudents;
        const femalePercent = totalStudents > 0 ? ((femaleStudents / totalStudents) * 100).toFixed(1) : "0";

        const poorCount = students.filter(s => s.poor_id && s.poor_id !== 'គ្មាន' && s.poor_id !== 'false' && s.poor_id !== false).length;
        const scholarshipCount = students.filter(s => s.scholarship && s.scholarship !== 'គ្មាន' && s.scholarship !== 'false' && s.scholarship !== false).length;
        const disabilityCount = students.filter(s => s.disability && s.disability !== 'គ្មាន' && s.disability !== 'false' && s.disability !== false).length;

        const activeCount = students.filter(s => !s.status || s.status === 'Active' || s.status === 'កំពុងសិក្សា').length;
        const transferredCount = students.filter(s => s.status === 'Transferred' || s.status === 'បានផ្ទេរចេញ').length;
        const droppedCount = students.filter(s => s.status === 'Withdrawn' || s.status === 'Dropped' || s.status === 'បានឈប់រៀន').length;

        // បំពេញសិស្សទៅក្នុង Scores បើមិនទាន់មាន
        let scoresMap = {};
        rawScores.forEach(sc => { scoresMap[String(sc.id || sc.student_id)] = sc; });
        let fullScoresList = students.map((s, idx) => {
            const sc = scoresMap[String(s.id)] || {};
            return {
                id: s.id,
                name: s.name,
                gender: s.gender || 'ប្រុស',
                grade: s.grade || s.class || ctx.grade,
                room: s.room || '',
                khmer: sc.khmer !== undefined ? sc.khmer : '',
                math: sc.math !== undefined ? sc.math : '',
                science: sc.science !== undefined ? sc.science : '',
                social: sc.social !== undefined ? sc.social : '',
                english: sc.english !== undefined ? sc.english : '',
                total_score: sc.total_score || sc.total || '',
                avg: sc.avg || sc.average || '',
                rank: sc.rank !== undefined ? sc.rank : (idx + 1),
                grade_letter: sc.grade_letter || sc.gradeLetter || ''
            };
        });

        // ៣. បែងចែកជា ២ បញ្ជីពិន្ទុ និងចំណាត់ថ្នាក់ដាច់ដោយឡែក
        // Sheet 2 Data: តម្រៀបតាមអក្ខរក្រម (Alphabetical ก-អ)
        const scoreStudents = [...fullScoresList].sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), 'km'));

        // Sheet 3 Data: តម្រៀបតាមចំណាត់ថ្នាក់ (Rank 1st..N)
        const rankingStudents = [...fullScoresList].sort((a, b) => {
            const rA = parseFloat(a.rank) || (a.rank === '-' ? 9999 : 999);
            const rB = parseFloat(b.rank) || (b.rank === '-' ? 9999 : 999);
            if (rA !== rB) return rA - rB;
            return (parseFloat(b.avg) || 0) - (parseFloat(a.avg) || 0);
        });

        // ស្ថិតិពិន្ទុរួម
        const evaluatedScores = fullScoresList.filter(s => s.avg !== '' && !isNaN(parseFloat(s.avg)));
        const evaluatedCount = evaluatedScores.length;
        const passedScores = evaluatedScores.filter(s => parseFloat(s.avg) >= 5.0);
        const passedCount = passedScores.length;
        const passedFemaleCount = passedScores.filter(s => s.gender === 'ស្រី' || s.gender === 'ស' || s.gender === 'F').length;
        const passedMaleCount = passedCount - passedFemaleCount;

        const failedScores = evaluatedScores.filter(s => parseFloat(s.avg) < 5.0);
        const failedCount = failedScores.length;
        const failedFemaleCount = failedScores.filter(s => s.gender === 'ស្រី' || s.gender === 'ស' || s.gender === 'F').length;
        const failedMaleCount = failedCount - failedFemaleCount;

        const passRate = evaluatedCount > 0 ? ((passedCount / evaluatedCount) * 100).toFixed(1) : "0";
        const failRate = evaluatedCount > 0 ? ((failedCount / evaluatedCount) * 100).toFixed(1) : "0";
        const passedFemalePercent = femaleStudents > 0 ? ((passedFemaleCount / femaleStudents) * 100).toFixed(1) : "0";
        const failedFemalePercent = femaleStudents > 0 ? ((failedFemaleCount / femaleStudents) * 100).toFixed(1) : "0";

        let maxAvg = evaluatedCount > 0 ? Math.max(...evaluatedScores.map(s => parseFloat(s.avg))).toFixed(2) : "0.00";
        let minAvg = evaluatedCount > 0 ? Math.min(...evaluatedScores.map(s => parseFloat(s.avg))).toFixed(2) : "0.00";
        let overallAvg = evaluatedCount > 0 ? (evaluatedScores.reduce((acc, s) => acc + parseFloat(s.avg), 0) / evaluatedCount).toFixed(2) : "0.00";

        const top1 = rankingStudents[0] || {};
        const top2 = rankingStudents[1] || {};
        const top3 = rankingStudents[2] || {};

        // ==============================================================
        // ជម្រើស A: នាំចេញជា OpenXML (.xlsx) តាមរយៈ SheetJS
        // ==============================================================
        if (format === 'xlsx') {
            if (typeof XLSX === 'undefined') {
                alert("⚠️ SheetJS (XLSX) Library មិនទាន់ត្រូវបាន Load ទេ!");
                return;
            }

            const wb = XLSX.utils.book_new();

            // ----------------------------------------------------------
            // 📑 Sheet 1: ១. បញ្ជីរាយនាមសិស្ស (Student List Master)
            // ----------------------------------------------------------
            const ws1Data = [
                ["ការិយាល័យអប់រំ យុវជន និងកីឡានៃរដ្ឋបាលស្រុក " + ctx.districtName, "", "", "", "", "", "", "", "", "", "", "", "", "", "ព្រះរាជាណាចក្រកម្ពុជា"],
                [ctx.schoolName, "", "", "", "", "", "", "", "", "", "", "", "", "", "ជាតិ សាសនា ព្រះមហាក្សត្រ"],
                [ctx.grade, "", "", "", "", "", "", "", "", "", "", "", "", "", "❖ ❖ ❖"],
                [""],
                ["បញ្ជីរាយនាមសិស្ស (CMS Master Student Report)"],
                [(ctx.grade ? ctx.grade + " | " : "") + "ឆ្នាំសិក្សា ៖ " + toKh(ctx.academicYear)],
                ["ទិន្នន័យសង្ខេប៖ សិស្សសរុប " + totalStudents + " នាក់ (ស្រី " + femaleStudents + " នាក់, " + femalePercent + "%), ប្រុស " + maleStudents + " នាក់, កំពុងសិក្សា " + activeCount + " នាក់, ក្រីក្រ " + poorCount + " នាក់, អាហារូបករណ៍ " + scholarshipCount + " នាក់, ពិការភាព " + disabilityCount + " នាក់, ផ្ទេរចេញ/ឈប់ " + (transferredCount + droppedCount) + " នាក់"],
                [""],
                ["ល.រ", "អត្តលេខ", "គោត្តនាម និងនាម", "ឈ្មោះឡាតាំង", "ភេទ", "ថ្ងៃខែឆ្នាំកំណើត", "ទីកន្លែងកំណើត", "ទីលំនៅបច្ចុប្បន្ន", "ឈ្មោះឪពុក", "មុខរបរ", "ឈ្មោះម្ដាយ", "មុខរបរ", "ថ្នាក់/បន្ទប់", "លេខទូរស័ព្ទ", "ប័ណ្ណក្រីក្រ", "អាហារូបករណ៍", "ពិការភាព", "ស្ថានភាព"]
            ];

            students.forEach((s, idx) => {
                const dobStr = typeof window.formatDate === 'function' ? window.formatDate(s.dob) : (s.dob || '');
                const pobStr = [s.pob_village, s.pob_commune, s.pob_district, s.pob_province].filter(Boolean).join(', ') || s.pob || '';
                const currAddrStr = [s.curr_village, s.curr_commune, s.curr_district, s.curr_province].filter(Boolean).join(', ') || s.address || s.curr_address || '';

                let statusKhmer = "កំពុងសិក្សា";
                if (s.status === "Transferred" || s.status === "បានផ្ទេរចេញ") statusKhmer = "បានផ្ទេរចេញ";
                else if (s.status === "Graduated" || s.status === "បានបញ្ចប់ការសិក្សា") statusKhmer = "បានបញ្ចប់ការសិក្សា";
                else if (s.status === "Inactive" || s.status === "ផ្អាក") statusKhmer = "មិនសកម្ម (ផ្អាក)";
                else if (s.status === "Withdrawn" || s.status === "Dropped" || s.status === "បានឈប់រៀន") statusKhmer = "បានឈប់រៀន";

                const poorStr = (s.poor_id && s.poor_id !== 'គ្មាន' && s.poor_id !== 'false' && s.poor_id !== false) ? (s.poor_id === true ? 'មាន' : s.poor_id) : 'គ្មាន';
                const scholarStr = (s.scholarship && s.scholarship !== 'គ្មាន' && s.scholarship !== 'false' && s.scholarship !== false) ? 'មាន' : 'គ្មាន';
                const disabStr = (s.disability && s.disability !== 'គ្មាន' && s.disability !== 'false' && s.disability !== false) ? (s.disability === true ? 'មាន' : s.disability) : 'គ្មាន';
                const gradeRoom = [s.grade || s.class || ctx.grade, s.room ? `«${s.room}»` : ''].filter(Boolean).join(' ');

                ws1Data.push([
                    idx + 1,
                    s.id || '',
                    s.name || '',
                    s.name_en || s.name_latin || '',
                    s.gender || 'ប្រុស',
                    dobStr,
                    pobStr,
                    currAddrStr,
                    s.father_name || '',
                    s.father_job || '',
                    s.mother_name || '',
                    s.mother_job || '',
                    gradeRoom,
                    s.phone || s.parent_contact || '',
                    poorStr,
                    scholarStr,
                    disabStr,
                    statusKhmer
                ]);
            });

            ws1Data.push([""]);
            ws1Data.push(["បានឃើញ និងឯកភាព", "", "", "", "", "", "", "", "", "", "", "", ctx.lunarDateStr || '']);
            ws1Data.push(["នាយក/នាយិកាសាលា", "", "", "", "", "", "", "", "", "", "", "", ctx.solarDateStr || '']);
            ws1Data.push(["", "", "", "", "", "", "", "", "", "", "", "", "គ្រូបន្ទុកថ្នាក់ / អ្នករៀបចំ"]);
            ws1Data.push([""]);
            ws1Data.push([""]);
            ws1Data.push([principalDisplayName, "", "", "", "", "", "", "", "", "", "", "", ctx.teacherName || '']);

            const ws1 = XLSX.utils.aoa_to_sheet(ws1Data);
            ws1['!cols'] = [
                { wch: 6 }, { wch: 14 }, { wch: 24 }, { wch: 20 }, { wch: 8 },
                { wch: 16 }, { wch: 22 }, { wch: 22 }, { wch: 18 }, { wch: 16 },
                { wch: 18 }, { wch: 16 }, { wch: 14 }, { wch: 15 }, { wch: 12 },
                { wch: 14 }, { wch: 12 }, { wch: 15 }
            ];
            ws1['!merges'] = [
                { s: { r: 4, c: 0 }, e: { r: 4, c: 17 } },
                { s: { r: 5, c: 0 }, e: { r: 5, c: 17 } },
                { s: { r: 6, c: 0 }, e: { r: 6, c: 17 } }
            ];
            XLSX.utils.book_append_sheet(wb, ws1, "១. បញ្ជីរាយនាមសិស្ស");

            // ----------------------------------------------------------
            // 📑 Sheet 2: ២. តារាងស្រង់ពិន្ទុ (Score Sheet - Sorted Alphabetically)
            // ----------------------------------------------------------
            const ws2Data = [
                ["ការិយាល័យអប់រំ យុវជន និងកីឡានៃរដ្ឋបាលស្រុក " + ctx.districtName, "", "", "", "", "", "", "", "", "", "", "ព្រះរាជាណាចក្រកម្ពុជា"],
                [ctx.schoolName, "", "", "", "", "", "", "", "", "", "", "ជាតិ សាសនា ព្រះមហាក្សត្រ"],
                [ctx.grade, "", "", "", "", "", "", "", "", "", "", "❖ ❖ ❖"],
                [""],
                ["តារាងស្រង់ពិន្ទុសិស្ស (Score Sheet - តម្រៀបតាមអក្ខរក្រម)"],
                [(ctx.grade ? ctx.grade + " | " : "") + "ឆ្នាំសិក្សា ៖ " + toKh(ctx.academicYear)],
                ["ស្ថិតិពិន្ទុ៖ សិស្សមានពិន្ទុ " + evaluatedCount + " នាក់ | ជាប់ " + passedCount + " នាក់ (" + passRate + "%) | ធ្លាក់ " + failedCount + " នាក់ | មធ្យមភាគខ្ពស់បំផុត " + maxAvg + " | មធ្យមភាគទាបបំផុត " + minAvg + " | មធ្យមភាគរួម " + overallAvg],
                [""],
                ["ល.រ", "អត្តលេខ", "គោត្តនាម និងនាម", "ភេទ", "ថ្នាក់", "ភាសាខ្មែរ", "គណិតវិទ្យា", "វិទ្យាសាស្ត្រ", "សិក្សាសង្គម", "ភាសាអង់គ្លេស", "ពិន្ទុសរុប", "មធ្យមភាគ", "ចំណាត់ថ្នាក់", "និទ្ទេស", "លទ្ធផល"]
            ];

            scoreStudents.forEach((sc, idx) => {
                const avgNum = parseFloat(sc.avg);
                const outcome = isNaN(avgNum) ? "-" : (avgNum >= 5.0 ? "ជាប់" : "ធ្លាក់");
                ws2Data.push([
                    idx + 1,
                    sc.id || '',
                    sc.name || '',
                    sc.gender || 'ប្រុស',
                    sc.grade || ctx.grade,
                    sc.khmer !== '' ? parseFloat(sc.khmer) || sc.khmer : '',
                    sc.math !== '' ? parseFloat(sc.math) || sc.math : '',
                    sc.science !== '' ? parseFloat(sc.science) || sc.science : '',
                    sc.social !== '' ? parseFloat(sc.social) || sc.social : '',
                    sc.english !== '' ? parseFloat(sc.english) || sc.english : '',
                    sc.total_score !== '' ? parseFloat(sc.total_score) || sc.total_score : '',
                    sc.avg !== '' ? parseFloat(sc.avg) || sc.avg : '',
                    sc.rank || '',
                    sc.grade_letter || '',
                    outcome
                ]);
            });

            // ស្ថិតិសង្ខេបក្រោមតារាងពិន្ទុ
            ws2Data.push([""]);
            ws2Data.push(["📊 ស្ថិតិសង្ខេបលទ្ធផល ៖"]);
            ws2Data.push(["• សិស្សសរុប ៖ " + totalStudents + " នាក់ (ស្រី " + femaleStudents + " នាក់, ប្រុស " + maleStudents + " នាក់)"]);
            ws2Data.push(["• សិស្សជាប់មធ្យមភាគ ៖ " + passedCount + " នាក់ គិតជាភាគរយ " + passRate + "% (ស្រី " + passedFemaleCount + " នាក់ គិតជាភាគរយ " + passedFemalePercent + "%, ប្រុស " + passedMaleCount + " នាក់)"]);
            ws2Data.push(["• សិស្សធ្លាក់មធ្យមភាគ ៖ " + failedCount + " នាក់ គិតជាភាគរយ " + failRate + "% (ស្រី " + failedFemaleCount + " នាក់ គិតជាភាគរយ " + failedFemalePercent + "%, ប្រុស " + failedMaleCount + " នាក់)"]);
            ws2Data.push([""]);
            ws2Data.push(["លទ្ធផល", "សរុប", "ស្រី", "ប្រុស", "ភាគរយសរុប (%)", "ភាគរយស្រី (%)"]);
            ws2Data.push(["សិស្សសរុប", totalStudents + " នាក់", femaleStudents + " នាក់", maleStudents + " នាក់", "100%", femalePercent + "%"]);
            ws2Data.push(["សិស្សជាប់មធ្យមភាគ", passedCount + " នាក់", passedFemaleCount + " នាក់", passedMaleCount + " នាក់", passRate + "%", passedFemalePercent + "%"]);
            ws2Data.push(["សិស្សធ្លាក់មធ្យមភាគ", failedCount + " នាក់", failedFemaleCount + " នាក់", failedMaleCount + " នាក់", failRate + "%", failedFemalePercent + "%"]);

            ws2Data.push([""]);
            ws2Data.push(["បានឃើញ និងឯកភាព", "", "", "", "", "", "", "", "", "", ctx.lunarDateStr || '']);
            ws2Data.push(["នាយក/នាយិកាសាលា", "", "", "", "", "", "", "", "", "", ctx.solarDateStr || '']);
            ws2Data.push(["", "", "", "", "", "", "", "", "", "", "គ្រូបន្ទុកថ្នាក់ / អ្នករៀបចំ"]);
            ws2Data.push([""]);
            ws2Data.push([""]);
            ws2Data.push([principalDisplayName, "", "", "", "", "", "", "", "", "", ctx.teacherName || '']);

            const ws2 = XLSX.utils.aoa_to_sheet(ws2Data);
            ws2['!cols'] = [
                { wch: 6 }, { wch: 14 }, { wch: 24 }, { wch: 8 }, { wch: 14 },
                { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
                { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 10 }, { wch: 14 }
            ];
            ws2['!merges'] = [
                { s: { r: 4, c: 0 }, e: { r: 4, c: 14 } },
                { s: { r: 5, c: 0 }, e: { r: 5, c: 14 } },
                { s: { r: 6, c: 0 }, e: { r: 6, c: 14 } }
            ];
            XLSX.utils.book_append_sheet(wb, ws2, "២. តារាងស្រង់ពិន្ទុ");

            // ----------------------------------------------------------
            // 📑 Sheet 3: ៣. តារាងចំណាត់ថ្នាក់ (Rankings Sheet - Sorted by Rank 1..N)
            // ----------------------------------------------------------
            const ws3Data = [
                ["ការិយាល័យអប់រំ យុវជន និងកីឡានៃរដ្ឋបាលស្រុក " + ctx.districtName, "", "", "", "", "", "", "ព្រះរាជាណាចក្រកម្ពុជា"],
                [ctx.schoolName, "", "", "", "", "", "", "ជាតិ សាសនា ព្រះមហាក្សត្រ"],
                [ctx.grade, "", "", "", "", "", "", "❖ ❖ ❖"],
                [""],
                ["តារាងចំណាត់ថ្នាក់ និងកិត្តិយសសិស្ស (Student Rankings & Honors)"],
                [(ctx.grade ? ctx.grade + " | " : "") + "ឆ្នាំសិក្សា ៖ " + toKh(ctx.academicYear)],
                ["សិស្សឆ្នើម Top 3៖ 🥇លេខ ១៖ " + (top1.name || '-') + " (ម.ភាគ " + (top1.avg || '-') + ") | 🥈លេខ ២៖ " + (top2.name || '-') + " (ម.ភាគ " + (top2.avg || '-') + ") | 🥉លេខ ៣៖ " + (top3.name || '-') + " (ម.ភាគ " + (top3.avg || '-') + ")"],
                [""],
                ["ចំណាត់ថ្នាក់", "អត្តលេខ", "គោត្តនាម និងនាម", "ភេទ", "ថ្នាក់", "ពិន្ទុសរុប", "មធ្យមភាគ", "និទ្ទេស", "កិត្តិយស / លទ្ធផល", "ផ្សេងៗ / សម្គាល់"]
            ];

            rankingStudents.forEach((sc) => {
                const avgNum = parseFloat(sc.avg);
                const rNum = parseInt(sc.rank);
                let rankLabel = sc.rank || '-';
                let honorLabel = "ជាប់";
                if (rNum === 1) { rankLabel = "🥇 លេខ ១"; honorLabel = "🏆 សិស្សឆ្នើមលេខ ១"; }
                else if (rNum === 2) { rankLabel = "🥈 លេខ ២"; honorLabel = "🥈 សិស្សឆ្នើមលេខ ២"; }
                else if (rNum === 3) { rankLabel = "🥉 លេខ ៣"; honorLabel = "🥉 សិស្សឆ្នើមលេខ ៣"; }
                else if (rNum <= 5) { honorLabel = "🌟 កិត្តិយស Top 5"; }
                else if (avgNum < 5.0) { honorLabel = "ត្រួតថ្នាក់"; }
                else { honorLabel = "ឡើងថ្នាក់"; }

                ws3Data.push([
                    rankLabel,
                    sc.id || '',
                    sc.name || '',
                    sc.gender || 'ប្រុស',
                    sc.grade || ctx.grade,
                    sc.total_score !== '' ? parseFloat(sc.total_score) || sc.total_score : '',
                    sc.avg !== '' ? parseFloat(sc.avg) || sc.avg : '',
                    sc.grade_letter || '',
                    honorLabel,
                    ""
                ]);
            });

            // ស្ថិតិសង្ខេបក្រោមតារាងចំណាត់ថ្នាក់
            ws3Data.push([""]);
            ws3Data.push(["📊 ស្ថិតិសង្ខេបលទ្ធផល ៖"]);
            ws3Data.push(["• សិស្សសរុប ៖ " + totalStudents + " នាក់ (ស្រី " + femaleStudents + " នាក់, ប្រុស " + maleStudents + " នាក់)"]);
            ws3Data.push(["• សិស្សជាប់មធ្យមភាគ ៖ " + passedCount + " នាក់ គិតជាភាគរយ " + passRate + "% (ស្រី " + passedFemaleCount + " នាក់ គិតជាភាគរយ " + passedFemalePercent + "%, ប្រុស " + passedMaleCount + " នាក់)"]);
            ws3Data.push(["• សិស្សធ្លាក់មធ្យមភាគ ៖ " + failedCount + " នាក់ គិតជាភាគរយ " + failRate + "% (ស្រី " + failedFemaleCount + " នាក់ គិតជាភាគរយ " + failedFemalePercent + "%, ប្រុស " + failedMaleCount + " នាក់)"]);
            ws3Data.push([""]);
            ws3Data.push(["លទ្ធផល", "សរុប", "ស្រី", "ប្រុស", "ភាគរយសរុប (%)", "ភាគរយស្រី (%)"]);
            ws3Data.push(["សិស្សសរុប", totalStudents + " នាក់", femaleStudents + " នាក់", maleStudents + " នាក់", "100%", femalePercent + "%"]);
            ws3Data.push(["សិស្សជាប់មធ្យមភាគ", passedCount + " នាក់", passedFemaleCount + " នាក់", passedMaleCount + " នាក់", passRate + "%", passedFemalePercent + "%"]);
            ws3Data.push(["សិស្សធ្លាក់មធ្យមភាគ", failedCount + " នាក់", failedFemaleCount + " នាក់", failedMaleCount + " នាក់", failRate + "%", failedFemalePercent + "%"]);

            ws3Data.push([""]);
            ws3Data.push(["បានឃើញ និងឯកភាព", "", "", "", "", "", ctx.lunarDateStr || '']);
            ws3Data.push(["នាយក/នាយិកាសាលា", "", "", "", "", "", ctx.solarDateStr || '']);
            ws3Data.push(["", "", "", "", "", "", "គ្រូបន្ទុកថ្នាក់ / អ្នករៀបចំ"]);
            ws3Data.push([""]);
            ws3Data.push([""]);
            ws3Data.push([principalDisplayName, "", "", "", "", "", ctx.teacherName || '']);

            const ws3 = XLSX.utils.aoa_to_sheet(ws3Data);
            ws3['!cols'] = [
                { wch: 15 }, { wch: 14 }, { wch: 24 }, { wch: 8 }, { wch: 14 },
                { wch: 14 }, { wch: 14 }, { wch: 10 }, { wch: 22 }, { wch: 18 }
            ];
            ws3['!merges'] = [
                { s: { r: 4, c: 0 }, e: { r: 4, c: 9 } },
                { s: { r: 5, c: 0 }, e: { r: 5, c: 9 } },
                { s: { r: 6, c: 0 }, e: { r: 6, c: 9 } }
            ];
            XLSX.utils.book_append_sheet(wb, ws3, "៣. តារាងចំណាត់ថ្នាក់");

            const fileName = `CMS_Master_Report_${currentYear}.xlsx`;
            XLSX.writeFile(wb, fileName);

            if (typeof window.logAudit === 'function') {
                window.logAudit('EXPORT_EXCEL', 'reports', `បាននាំចេញឯកសារ CMS Master Report XLSX (${students.length} សិស្ស, ៣ Sheet ដាច់ដោយឡែក)`);
            }
            if (typeof showToast === 'function') {
                showToast("✅ បាននាំចេញ CMS Master Report (.xlsx) ចំនួន ៣ Sheet ជោគជ័យ!");
            }
            return;
        }

        // ==============================================================
        // ជម្រើស B: នាំចេញជា SpreadsheetML Multi-Sheet (.xls) មានចាក់ពណ៌ និង Border
        // ==============================================================
        const esc = (s) => (s === null || s === undefined ? '' : String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;'));

        // Sheet 1 XML Rows (Students)
        let s1RowsXml = '';
        students.forEach((s, idx) => {
            const isEven = idx % 2 === 1;
            const styleC = isEven ? "CellCenterEven" : "CellCenter";
            const styleL = isEven ? "CellLeftEven" : "CellLeft";
            const dobStr = typeof window.formatDate === 'function' ? window.formatDate(s.dob) : (s.dob || '');
            const pobStr = [s.pob_village, s.pob_commune, s.pob_district, s.pob_province].filter(Boolean).join(', ') || s.pob || '';
            const currAddrStr = [s.curr_village, s.curr_commune, s.curr_district, s.curr_province].filter(Boolean).join(', ') || s.address || s.curr_address || '';

            let statusKhmer = "កំពុងសិក្សា";
            if (s.status === "Transferred" || s.status === "បានផ្ទេរចេញ") statusKhmer = "បានផ្ទេរចេញ";
            else if (s.status === "Graduated" || s.status === "បានបញ្ចប់ការសិក្សា") statusKhmer = "បានបញ្ចប់ការសិក្សា";
            else if (s.status === "Inactive" || s.status === "ផ្អាក") statusKhmer = "មិនសកម្ម (ផ្អាក)";
            else if (s.status === "Withdrawn" || s.status === "Dropped" || s.status === "បានឈប់រៀន") statusKhmer = "បានឈប់រៀន";

            const poorStr = (s.poor_id && s.poor_id !== 'គ្មាន' && s.poor_id !== 'false' && s.poor_id !== false) ? (s.poor_id === true ? 'មាន' : s.poor_id) : 'គ្មាន';
            const scholarStr = (s.scholarship && s.scholarship !== 'គ្មាន' && s.scholarship !== 'false' && s.scholarship !== false) ? 'មាន' : 'គ្មាន';
            const disabStr = (s.disability && s.disability !== 'គ្មាន' && s.disability !== 'false' && s.disability !== false) ? (s.disability === true ? 'មាន' : s.disability) : 'គ្មាន';
            const gradeRoom = [s.grade || s.class || ctx.grade, s.room ? `«${s.room}»` : ''].filter(Boolean).join(' ');

            s1RowsXml += `
            <Row ss:Height="22">
                <Cell ss:StyleID="${styleC}"><Data ss:Type="Number">${idx + 1}</Data></Cell>
                <Cell ss:StyleID="${styleC}"><Data ss:Type="String">${esc(s.id)}</Data></Cell>
                <Cell ss:StyleID="${styleL}"><Data ss:Type="String">${esc(s.name)}</Data></Cell>
                <Cell ss:StyleID="${styleL}"><Data ss:Type="String">${esc(s.name_en || s.name_latin)}</Data></Cell>
                <Cell ss:StyleID="${styleC}"><Data ss:Type="String">${esc(s.gender || 'ប្រុស')}</Data></Cell>
                <Cell ss:StyleID="${styleC}"><Data ss:Type="String">${esc(dobStr)}</Data></Cell>
                <Cell ss:StyleID="${styleL}"><Data ss:Type="String">${esc(pobStr)}</Data></Cell>
                <Cell ss:StyleID="${styleL}"><Data ss:Type="String">${esc(currAddrStr)}</Data></Cell>
                <Cell ss:StyleID="${styleL}"><Data ss:Type="String">${esc(s.father_name)}</Data></Cell>
                <Cell ss:StyleID="${styleL}"><Data ss:Type="String">${esc(s.father_job)}</Data></Cell>
                <Cell ss:StyleID="${styleL}"><Data ss:Type="String">${esc(s.mother_name)}</Data></Cell>
                <Cell ss:StyleID="${styleL}"><Data ss:Type="String">${esc(s.mother_job)}</Data></Cell>
                <Cell ss:StyleID="${styleC}"><Data ss:Type="String">${esc(gradeRoom)}</Data></Cell>
                <Cell ss:StyleID="${styleC}"><Data ss:Type="String">${esc(s.phone || s.parent_contact)}</Data></Cell>
                <Cell ss:StyleID="${styleC}"><Data ss:Type="String">${esc(poorStr)}</Data></Cell>
                <Cell ss:StyleID="${styleC}"><Data ss:Type="String">${esc(scholarStr)}</Data></Cell>
                <Cell ss:StyleID="${styleC}"><Data ss:Type="String">${esc(disabStr)}</Data></Cell>
                <Cell ss:StyleID="${styleC}"><Data ss:Type="String">${esc(statusKhmer)}</Data></Cell>
            </Row>`;
        });

        // Sheet 2 XML Rows (Score Sheet Alphabetical)
        let s2RowsXml = '';
        scoreStudents.forEach((sc, idx) => {
            const isEven = idx % 2 === 1;
            const styleC = isEven ? "CellCenterEven" : "CellCenter";
            const styleL = isEven ? "CellLeftEven" : "CellLeft";
            const avgNum = parseFloat(sc.avg);
            const outcome = isNaN(avgNum) ? "-" : (avgNum >= 5.0 ? "ជាប់" : "ធ្លាក់");

            s2RowsXml += `
            <Row ss:Height="22">
                <Cell ss:StyleID="${styleC}"><Data ss:Type="Number">${idx + 1}</Data></Cell>
                <Cell ss:StyleID="${styleC}"><Data ss:Type="String">${esc(sc.id)}</Data></Cell>
                <Cell ss:StyleID="${styleL}"><Data ss:Type="String">${esc(sc.name)}</Data></Cell>
                <Cell ss:StyleID="${styleC}"><Data ss:Type="String">${esc(sc.gender || 'ប្រុស')}</Data></Cell>
                <Cell ss:StyleID="${styleC}"><Data ss:Type="String">${esc(sc.grade || ctx.grade)}</Data></Cell>
                <Cell ss:StyleID="${styleC}"><Data ss:Type="${sc.khmer !== '' ? 'Number' : 'String'}">${esc(sc.khmer)}</Data></Cell>
                <Cell ss:StyleID="${styleC}"><Data ss:Type="${sc.math !== '' ? 'Number' : 'String'}">${esc(sc.math)}</Data></Cell>
                <Cell ss:StyleID="${styleC}"><Data ss:Type="${sc.science !== '' ? 'Number' : 'String'}">${esc(sc.science)}</Data></Cell>
                <Cell ss:StyleID="${styleC}"><Data ss:Type="${sc.social !== '' ? 'Number' : 'String'}">${esc(sc.social)}</Data></Cell>
                <Cell ss:StyleID="${styleC}"><Data ss:Type="${sc.english !== '' ? 'Number' : 'String'}">${esc(sc.english)}</Data></Cell>
                <Cell ss:StyleID="${styleC}"><Data ss:Type="${sc.total_score !== '' ? 'Number' : 'String'}">${esc(sc.total_score)}</Data></Cell>
                <Cell ss:StyleID="${styleC}"><Data ss:Type="${sc.avg !== '' ? 'Number' : 'String'}">${esc(sc.avg)}</Data></Cell>
                <Cell ss:StyleID="${styleC}"><Data ss:Type="String">${esc(sc.rank)}</Data></Cell>
                <Cell ss:StyleID="${styleC}"><Data ss:Type="String">${esc(sc.grade_letter)}</Data></Cell>
                <Cell ss:StyleID="${styleC}"><Data ss:Type="String">${esc(outcome)}</Data></Cell>
            </Row>`;
        });

        // Sheet 3 XML Rows (Rankings Sheet)
        let s3RowsXml = '';
        rankingStudents.forEach((sc) => {
            const isEven = false;
            const avgNum = parseFloat(sc.avg);
            const rNum = parseInt(sc.rank);
            let rankLabel = sc.rank || '-';
            let honorLabel = "ជាប់";
            let rowStyle = "CellCenter";
            if (rNum === 1) { rankLabel = "🥇 លេខ ១"; honorLabel = "🏆 សិស្សឆ្នើមលេខ ១"; }
            else if (rNum === 2) { rankLabel = "🥈 លេខ ២"; honorLabel = "🥈 សិស្សឆ្នើមលេខ ២"; }
            else if (rNum === 3) { rankLabel = "🥉 លេខ ៣"; honorLabel = "🥉 សិស្សឆ្នើមលេខ ៣"; }
            else if (rNum <= 5) { honorLabel = "🌟 កិត្តិយស Top 5"; }
            else if (avgNum < 5.0) { honorLabel = "ត្រួតថ្នាក់"; }
            else { honorLabel = "ឡើងថ្នាក់"; }

            s3RowsXml += `
            <Row ss:Height="22">
                <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${esc(rankLabel)}</Data></Cell>
                <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${esc(sc.id)}</Data></Cell>
                <Cell ss:StyleID="CellLeft"><Data ss:Type="String">${esc(sc.name)}</Data></Cell>
                <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${esc(sc.gender || 'ប្រុស')}</Data></Cell>
                <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${esc(sc.grade || ctx.grade)}</Data></Cell>
                <Cell ss:StyleID="CellCenter"><Data ss:Type="${sc.total_score !== '' ? 'Number' : 'String'}">${esc(sc.total_score)}</Data></Cell>
                <Cell ss:StyleID="CellCenter"><Data ss:Type="${sc.avg !== '' ? 'Number' : 'String'}">${esc(sc.avg)}</Data></Cell>
                <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${esc(sc.grade_letter)}</Data></Cell>
                <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${esc(honorLabel)}</Data></Cell>
                <Cell ss:StyleID="CellCenter"><Data ss:Type="String"></Data></Cell>
            </Row>`;
        });

        // សាងសង់ SpreadsheetML XML Workbook ពេញលេញ
        const xmlContent = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Author>KrouDigital CMS</Author>
 </DocumentProperties>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Khmer OS Siemreap" ss:Size="10" ss:Color="#000000"/>
  </Style>
  <Style ss:ID="HeaderLeft">
   <Alignment ss:Horizontal="Left" ss:Vertical="Top" ss:WrapText="1"/>
   <Font ss:FontName="Khmer OS Muol Light" ss:Size="10.5" ss:Color="#1E3A8A"/>
  </Style>
  <Style ss:ID="HeaderRight">
   <Alignment ss:Horizontal="Center" ss:Vertical="Top" ss:WrapText="1"/>
   <Font ss:FontName="Khmer OS Muol Light" ss:Size="11" ss:Color="#1E3A8A"/>
  </Style>
  <Style ss:ID="TitleMain">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Khmer OS Muol Light" ss:Size="15" ss:Color="#1E3A8A"/>
  </Style>
  <Style ss:ID="TitleSub">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Khmer OS Siemreap" ss:Size="11" ss:Bold="1" ss:Color="#DC2626"/>
  </Style>
  <Style ss:ID="SummaryHeader">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Khmer OS Muol Light" ss:Size="10.5" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#1E40AF" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="SummaryBlue">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#BFDBFE"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#BFDBFE"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#BFDBFE"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#BFDBFE"/>
   </Borders>
   <Font ss:FontName="Khmer OS Siemreap" ss:Size="9.5" ss:Color="#000000"/>
   <Interior ss:Color="#EFF6FF" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="SummaryGreen">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#BBF7D0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#BBF7D0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#BBF7D0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#BBF7D0"/>
   </Borders>
   <Font ss:FontName="Khmer OS Siemreap" ss:Size="9.5" ss:Color="#000000"/>
   <Interior ss:Color="#F0FDF4" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="TableHeader">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#0F172A"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#0F172A"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#0F172A"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#0F172A"/>
   </Borders>
   <Font ss:FontName="Khmer OS Muol Light" ss:Size="10" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#10489C" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="CellCenter">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#94A3B8"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#94A3B8"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#94A3B8"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#94A3B8"/>
   </Borders>
   <Font ss:FontName="Khmer OS Siemreap" ss:Size="9.5" ss:Color="#000000"/>
  </Style>
  <Style ss:ID="CellLeft">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#94A3B8"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#94A3B8"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#94A3B8"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#94A3B8"/>
   </Borders>
   <Font ss:FontName="Khmer OS Siemreap" ss:Size="9.5" ss:Color="#000000"/>
  </Style>
  <Style ss:ID="CellCenterEven">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#94A3B8"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#94A3B8"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#94A3B8"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#94A3B8"/>
   </Borders>
   <Font ss:FontName="Khmer OS Siemreap" ss:Size="9.5" ss:Color="#000000"/>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="CellLeftEven">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#94A3B8"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#94A3B8"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#94A3B8"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#94A3B8"/>
   </Borders>
   <Font ss:FontName="Khmer OS Siemreap" ss:Size="9.5" ss:Color="#000000"/>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="SigText">
   <Alignment ss:Horizontal="Center" ss:Vertical="Top"/>
   <Font ss:FontName="Khmer OS Siemreap" ss:Size="10.5" ss:Color="#000000"/>
  </Style>
  <Style ss:ID="SigTitle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Top"/>
   <Font ss:FontName="Khmer OS Muol Light" ss:Size="11" ss:Color="#000000"/>
  </Style>
 </Styles>

 <!-- ១. WORKSHEET បញ្ជីរាយនាមសិស្ស -->
 <Worksheet ss:Name="១. បញ្ជីរាយនាមសិស្ស">
  <Table ss:DefaultColumnWidth="65" ss:DefaultRowHeight="20">
   <Column ss:Index="1" ss:Width="35"/>
   <Column ss:Index="2" ss:Width="95"/>
   <Column ss:Index="3" ss:Width="160"/>
   <Column ss:Index="4" ss:Width="140"/>
   <Column ss:Index="5" ss:Width="55"/>
   <Column ss:Index="6" ss:Width="110"/>
   <Column ss:Index="7" ss:Width="150"/>
   <Column ss:Index="8" ss:Width="150"/>
   <Column ss:Index="9" ss:Width="120"/>
   <Column ss:Index="10" ss:Width="110"/>
   <Column ss:Index="11" ss:Width="120"/>
   <Column ss:Index="12" ss:Width="110"/>
   <Column ss:Index="13" ss:Width="95"/>
   <Column ss:Index="14" ss:Width="105"/>
   <Column ss:Index="15" ss:Width="80"/>
   <Column ss:Index="16" ss:Width="90"/>
   <Column ss:Index="17" ss:Width="80"/>
   <Column ss:Index="18" ss:Width="100"/>
   
   <Row ss:Height="55">
    <Cell ss:MergeAcross="7" ss:StyleID="HeaderLeft"><Data ss:Type="String">ការិយាល័យអប់រំ យុវជន និងកីឡានៃរដ្ឋបាលស្រុក${esc(ctx.districtName)}&#10;${esc(ctx.schoolName)}&#10;${esc(ctx.grade)}</Data></Cell>
    <Cell ss:Index="9" ss:MergeAcross="1" ss:StyleID="Default"/>
    <Cell ss:Index="11" ss:MergeAcross="7" ss:StyleID="HeaderRight"><Data ss:Type="String">ព្រះរាជាណាចក្រកម្ពុជា&#10;ជាតិ សាសនា ព្រះមហាក្សត្រ&#10;❖ ❖ ❖</Data></Cell>
   </Row>
   <Row ss:Height="12"><Cell ss:StyleID="Default"/></Row>
   <Row ss:Height="25">
    <Cell ss:MergeAcross="17" ss:StyleID="TitleMain"><Data ss:Type="String">បញ្ជីរាយនាមសិស្ស (CMS Master Student Report)</Data></Cell>
   </Row>
   <Row ss:Height="20">
    <Cell ss:MergeAcross="17" ss:StyleID="TitleSub"><Data ss:Type="String">${esc(ctx.grade ? ctx.grade + ' | ' : '')}ឆ្នាំសិក្សា ៖ ${esc(toKh(ctx.academicYear))}</Data></Cell>
   </Row>
   <Row ss:Height="10"><Cell ss:StyleID="Default"/></Row>
   <Row ss:Height="22">
    <Cell ss:MergeAcross="17" ss:StyleID="SummaryHeader"><Data ss:Type="String">📊 ទិន្នន័យសង្ខេបសិស្សរួម (Student Summary Statistics)</Data></Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:MergeAcross="3" ss:StyleID="SummaryBlue"><Data ss:Type="String">• សិស្សសរុប៖ ${totalStudents} នាក់</Data></Cell>
    <Cell ss:Index="5" ss:MergeAcross="4" ss:StyleID="SummaryBlue"><Data ss:Type="String">• ស្រី៖ ${femaleStudents} នាក់ (${femalePercent}%)</Data></Cell>
    <Cell ss:Index="10" ss:MergeAcross="3" ss:StyleID="SummaryBlue"><Data ss:Type="String">• ប្រុស៖ ${maleStudents} នាក់</Data></Cell>
    <Cell ss:Index="14" ss:MergeAcross="4" ss:StyleID="SummaryBlue"><Data ss:Type="String">• កំពុងសិក្សា៖ ${activeCount} នាក់</Data></Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:MergeAcross="3" ss:StyleID="SummaryGreen"><Data ss:Type="String">• ប័ណ្ណក្រីក្រ (ID Poor)៖ ${poorCount} នាក់</Data></Cell>
    <Cell ss:Index="5" ss:MergeAcross="4" ss:StyleID="SummaryGreen"><Data ss:Type="String">• អាហារូបករណ៍៖ ${scholarshipCount} នាក់</Data></Cell>
    <Cell ss:Index="10" ss:MergeAcross="3" ss:StyleID="SummaryGreen"><Data ss:Type="String">• ពិការភាព៖ ${disabilityCount} នាក់</Data></Cell>
    <Cell ss:Index="14" ss:MergeAcross="4" ss:StyleID="SummaryGreen"><Data ss:Type="String">• ផ្ទេរចេញ/ឈប់រៀន៖ ${transferredCount + droppedCount} នាក់</Data></Cell>
   </Row>
   <Row ss:Height="12"><Cell ss:StyleID="Default"/></Row>
   <Row ss:Height="28">
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">ល.រ</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">អត្តលេខ</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">គោត្តនាម និងនាម</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">ឈ្មោះឡាតាំង</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">ភេទ</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">ថ្ងៃខែឆ្នាំកំណើត</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">ទីកន្លែងកំណើត</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">ទីលំនៅបច្ចុប្បន្ន</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">ឈ្មោះឪពុក</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">មុខរបរ</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">ឈ្មោះម្ដាយ</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">មុខរបរ</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">ថ្នាក់/បន្ទប់</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">លេខទូរស័ព្ទ</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">ប័ណ្ណក្រីក្រ</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">អាហារូបករណ៍</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">ពិការភាព</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">ស្ថានភាព</Data></Cell>
   </Row>
   ${s1RowsXml}
   <Row ss:Height="20"><Cell ss:StyleID="Default"/></Row>
   <Row ss:Height="22">
    <Cell ss:MergeAcross="7" ss:StyleID="SigText"><Data ss:Type="String">បានឃើញ និងឯកភាព</Data></Cell>
    <Cell ss:Index="9" ss:MergeAcross="1" ss:StyleID="Default"/>
    <Cell ss:Index="11" ss:MergeAcross="7" ss:StyleID="SigText"><Data ss:Type="String">${esc(ctx.lunarDateStr || 'ថ្ងៃ....................ខែ..................ឆ្នាំ...............ព.ស.២៥៧០')}</Data></Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:MergeAcross="7" ss:StyleID="SigTitle"><Data ss:Type="String">នាយក/នាយិកាសាលា</Data></Cell>
    <Cell ss:Index="9" ss:MergeAcross="1" ss:StyleID="Default"/>
    <Cell ss:Index="11" ss:MergeAcross="7" ss:StyleID="SigText"><Data ss:Type="String">${esc(ctx.solarDateStr)}</Data></Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:Index="11" ss:MergeAcross="7" ss:StyleID="SigTitle"><Data ss:Type="String">គ្រូបន្ទុកថ្នាក់ / អ្នករៀបចំ</Data></Cell>
   </Row>
   <Row ss:Height="35"><Cell ss:StyleID="Default"/></Row>
   <Row ss:Height="25">
    <Cell ss:MergeAcross="7" ss:StyleID="SigTitle"><Data ss:Type="String">${esc(principalDisplayName)}</Data></Cell>
    <Cell ss:Index="9" ss:MergeAcross="1" ss:StyleID="Default"/>
    <Cell ss:Index="11" ss:MergeAcross="7" ss:StyleID="SigTitle"><Data ss:Type="String">${esc(ctx.teacherName)}</Data></Cell>
   </Row>
  </Table>
 </Worksheet>

 <!-- ២. WORKSHEET តារាងស្រង់ពិន្ទុ (SCORE SHEET) -->
 <Worksheet ss:Name="២. តារាងស្រង់ពិន្ទុ">
  <Table ss:DefaultColumnWidth="65" ss:DefaultRowHeight="20">
   <Column ss:Index="1" ss:Width="35"/>
   <Column ss:Index="2" ss:Width="95"/>
   <Column ss:Index="3" ss:Width="160"/>
   <Column ss:Index="4" ss:Width="55"/>
   <Column ss:Index="5" ss:Width="95"/>
   <Column ss:Index="6" ss:Width="80"/>
   <Column ss:Index="7" ss:Width="80"/>
   <Column ss:Index="8" ss:Width="80"/>
   <Column ss:Index="9" ss:Width="80"/>
   <Column ss:Index="10" ss:Width="80"/>
   <Column ss:Index="11" ss:Width="95"/>
   <Column ss:Index="12" ss:Width="95"/>
   <Column ss:Index="13" ss:Width="85"/>
   <Column ss:Index="14" ss:Width="70"/>
   <Column ss:Index="15" ss:Width="95"/>
   
   <Row ss:Height="55">
    <Cell ss:MergeAcross="6" ss:StyleID="HeaderLeft"><Data ss:Type="String">ការិយាល័យអប់រំ យុវជន និងកីឡានៃរដ្ឋបាលស្រុក${esc(ctx.districtName)}&#10;${esc(ctx.schoolName)}&#10;${esc(ctx.grade)}</Data></Cell>
    <Cell ss:Index="8" ss:MergeAcross="1" ss:StyleID="Default"/>
    <Cell ss:Index="10" ss:MergeAcross="5" ss:StyleID="HeaderRight"><Data ss:Type="String">ព្រះរាជាណាចក្រកម្ពុជា&#10;ជាតិ សាសនា ព្រះមហាក្សត្រ&#10;❖ ❖ ❖</Data></Cell>
   </Row>
   <Row ss:Height="12"><Cell ss:StyleID="Default"/></Row>
   <Row ss:Height="25">
    <Cell ss:MergeAcross="14" ss:StyleID="TitleMain"><Data ss:Type="String">តារាងស្រង់ពិន្ទុសិស្ស (Score Sheet - តម្រៀបតាមអក្ខរក្រម)</Data></Cell>
   </Row>
   <Row ss:Height="20">
    <Cell ss:MergeAcross="14" ss:StyleID="TitleSub"><Data ss:Type="String">${esc(ctx.grade ? ctx.grade + ' | ' : '')}ឆ្នាំសិក្សា ៖ ${esc(toKh(ctx.academicYear))}</Data></Cell>
   </Row>
   <Row ss:Height="10"><Cell ss:StyleID="Default"/></Row>
   <Row ss:Height="22">
    <Cell ss:MergeAcross="14" ss:StyleID="SummaryHeader"><Data ss:Type="String">📈 ស្ថិតិពិន្ទុ៖ សិស្សមានពិន្ទុ ${evaluatedCount} នាក់ | ជាប់ ${passedCount} នាក់ (${passRate}%) | ធ្លាក់ ${failedCount} នាក់ | មធ្យមភាគខ្ពស់ ${maxAvg} | មធ្យមភាគទាប ${minAvg}</Data></Cell>
   </Row>
   <Row ss:Height="12"><Cell ss:StyleID="Default"/></Row>
   <Row ss:Height="28">
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">ល.រ</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">អត្តលេខ</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">គោត្តនាម និងនាម</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">ភេទ</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">ថ្នាក់</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">ភាសាខ្មែរ</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">គណិតវិទ្យា</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">វិទ្យាសាស្ត្រ</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">សិក្សាសង្គម</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">ភាសាអង់គ្លេស</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">ពិន្ទុសរុប</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">មធ្យមភាគ</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">ចំណាត់ថ្នាក់</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">និទ្ទេស</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">លទ្ធផល</Data></Cell>
   </Row>
   ${s2RowsXml}
   <Row ss:Height="15"><Cell ss:StyleID="Default"/></Row>
   <Row ss:Height="22">
    <Cell ss:MergeAcross="14" ss:StyleID="SummaryBlue"><Data ss:Type="String">📊 ស្ថិតិសង្ខេបលទ្ធផល ៖ សិស្សសរុប ${totalStudents} នាក់ (ស្រី ${femaleStudents} នាក់, ប្រុស ${maleStudents} នាក់) | ជាប់ ${passedCount} នាក់ គិតជាភាគរយ ${passRate}% (ស្រី ${passedFemaleCount} នាក់ គិតជាភាគរយ ${passedFemalePercent}%) | ធ្លាក់ ${failedCount} នាក់ គិតជាភាគរយ ${failRate}% (ស្រី ${failedFemaleCount} នាក់ គិតជាភាគរយ ${failedFemalePercent}%)</Data></Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:MergeAcross="2" ss:StyleID="TableHeader"><Data ss:Type="String">លទ្ធផល</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="TableHeader"><Data ss:Type="String">សរុប</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="TableHeader"><Data ss:Type="String">ស្រី</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="TableHeader"><Data ss:Type="String">ប្រុស</Data></Cell>
    <Cell ss:MergeAcross="2" ss:StyleID="TableHeader"><Data ss:Type="String">ភាគរយសរុប (%)</Data></Cell>
    <Cell ss:MergeAcross="2" ss:StyleID="TableHeader"><Data ss:Type="String">ភាគរយស្រី (%)</Data></Cell>
   </Row>
   <Row ss:Height="20">
    <Cell ss:MergeAcross="2" ss:StyleID="CellLeft"><Data ss:Type="String">សិស្សសរុប</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="CellCenter"><Data ss:Type="String">${totalStudents} នាក់</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="CellCenter"><Data ss:Type="String">${femaleStudents} នាក់</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="CellCenter"><Data ss:Type="String">${maleStudents} នាក់</Data></Cell>
    <Cell ss:MergeAcross="2" ss:StyleID="CellCenter"><Data ss:Type="String">100%</Data></Cell>
    <Cell ss:MergeAcross="2" ss:StyleID="CellCenter"><Data ss:Type="String">${femalePercent}%</Data></Cell>
   </Row>
   <Row ss:Height="20">
    <Cell ss:MergeAcross="2" ss:StyleID="CellLeft"><Data ss:Type="String">សិស្សជាប់មធ្យមភាគ</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="CellCenter"><Data ss:Type="String">${passedCount} នាក់</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="CellCenter"><Data ss:Type="String">${passedFemaleCount} នាក់</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="CellCenter"><Data ss:Type="String">${passedMaleCount} នាក់</Data></Cell>
    <Cell ss:MergeAcross="2" ss:StyleID="CellCenter"><Data ss:Type="String">${passRate}%</Data></Cell>
    <Cell ss:MergeAcross="2" ss:StyleID="CellCenter"><Data ss:Type="String">${passedFemalePercent}%</Data></Cell>
   </Row>
   <Row ss:Height="20">
    <Cell ss:MergeAcross="2" ss:StyleID="CellLeft"><Data ss:Type="String">សិស្សធ្លាក់មធ្យមភាគ</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="CellCenter"><Data ss:Type="String">${failedCount} នាក់</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="CellCenter"><Data ss:Type="String">${failedFemaleCount} នាក់</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="CellCenter"><Data ss:Type="String">${failedMaleCount} នាក់</Data></Cell>
    <Cell ss:MergeAcross="2" ss:StyleID="CellCenter"><Data ss:Type="String">${failRate}%</Data></Cell>
    <Cell ss:MergeAcross="2" ss:StyleID="CellCenter"><Data ss:Type="String">${failedFemalePercent}%</Data></Cell>
   </Row>
   <Row ss:Height="20"><Cell ss:StyleID="Default"/></Row>
   <Row ss:Height="22">
    <Cell ss:MergeAcross="6" ss:StyleID="SigText"><Data ss:Type="String">បានឃើញ និងឯកភាព</Data></Cell>
    <Cell ss:Index="8" ss:MergeAcross="1" ss:StyleID="Default"/>
    <Cell ss:Index="10" ss:MergeAcross="5" ss:StyleID="SigText"><Data ss:Type="String">${esc(ctx.lunarDateStr || 'ថ្ងៃ....................ខែ..................ឆ្នាំ...............ព.ស.២៥៧០')}</Data></Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:MergeAcross="6" ss:StyleID="SigTitle"><Data ss:Type="String">នាយក/នាយិកាសាលា</Data></Cell>
    <Cell ss:Index="8" ss:MergeAcross="1" ss:StyleID="Default"/>
    <Cell ss:Index="10" ss:MergeAcross="5" ss:StyleID="SigText"><Data ss:Type="String">${esc(ctx.solarDateStr)}</Data></Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:Index="10" ss:MergeAcross="5" ss:StyleID="SigTitle"><Data ss:Type="String">គ្រូបន្ទុកថ្នាក់ / អ្នករៀបចំ</Data></Cell>
   </Row>
   <Row ss:Height="35"><Cell ss:StyleID="Default"/></Row>
   <Row ss:Height="25">
    <Cell ss:MergeAcross="6" ss:StyleID="SigTitle"><Data ss:Type="String">${esc(principalDisplayName)}</Data></Cell>
    <Cell ss:Index="8" ss:MergeAcross="1" ss:StyleID="Default"/>
    <Cell ss:Index="10" ss:MergeAcross="5" ss:StyleID="SigTitle"><Data ss:Type="String">${esc(ctx.teacherName)}</Data></Cell>
   </Row>
  </Table>
 </Worksheet>

 <!-- ៣. WORKSHEET តារាងចំណាត់ថ្នាក់ (RANKINGS SHEET) -->
 <Worksheet ss:Name="៣. តារាងចំណាត់ថ្នាក់">
  <Table ss:DefaultColumnWidth="65" ss:DefaultRowHeight="20">
   <Column ss:Index="1" ss:Width="105"/>
   <Column ss:Index="2" ss:Width="95"/>
   <Column ss:Index="3" ss:Width="160"/>
   <Column ss:Index="4" ss:Width="55"/>
   <Column ss:Index="5" ss:Width="95"/>
   <Column ss:Index="6" ss:Width="95"/>
   <Column ss:Index="7" ss:Width="95"/>
   <Column ss:Index="8" ss:Width="70"/>
   <Column ss:Index="9" ss:Width="150"/>
   <Column ss:Index="10" ss:Width="120"/>
   
   <Row ss:Height="55">
    <Cell ss:MergeAcross="4" ss:StyleID="HeaderLeft"><Data ss:Type="String">ការិយាល័យអប់រំ យុវជន និងកីឡានៃរដ្ឋបាលស្រុក${esc(ctx.districtName)}&#10;${esc(ctx.schoolName)}&#10;${esc(ctx.grade)}</Data></Cell>
    <Cell ss:Index="6" ss:StyleID="Default"/>
    <Cell ss:Index="7" ss:MergeAcross="3" ss:StyleID="HeaderRight"><Data ss:Type="String">ព្រះរាជាណាចក្រកម្ពុជា&#10;ជាតិ សាសនា ព្រះមហាក្សត្រ&#10;❖ ❖ ❖</Data></Cell>
   </Row>
   <Row ss:Height="12"><Cell ss:StyleID="Default"/></Row>
   <Row ss:Height="25">
    <Cell ss:MergeAcross="9" ss:StyleID="TitleMain"><Data ss:Type="String">តារាងចំណាត់ថ្នាក់ និងកិត្តិយសសិស្ស (Student Rankings &amp; Honors)</Data></Cell>
   </Row>
   <Row ss:Height="20">
    <Cell ss:MergeAcross="9" ss:StyleID="TitleSub"><Data ss:Type="String">${esc(ctx.grade ? ctx.grade + ' | ' : '')}ឆ្នាំសិក្សា ៖ ${esc(toKh(ctx.academicYear))}</Data></Cell>
   </Row>
   <Row ss:Height="10"><Cell ss:StyleID="Default"/></Row>
   <Row ss:Height="22">
    <Cell ss:MergeAcross="9" ss:StyleID="SummaryHeader"><Data ss:Type="String">🏆 សិស្សឆ្នើម Top 3៖ 🥇លេខ ១៖ ${esc(top1.name || '-')} (${esc(top1.avg || '-')}) | 🥈លេខ ២៖ ${esc(top2.name || '-')} (${esc(top2.avg || '-')}) | 🥉លេខ ៣៖ ${esc(top3.name || '-')} (${esc(top3.avg || '-')})</Data></Cell>
   </Row>
   <Row ss:Height="12"><Cell ss:StyleID="Default"/></Row>
   <Row ss:Height="28">
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">ចំណាត់ថ្នាក់</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">អត្តលេខ</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">គោត្តនាម និងនាម</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">ភេទ</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">ថ្នាក់</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">ពិន្ទុសរុប</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">មធ្យមភាគ</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">និទ្ទេស</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">កិត្តិយស / លទ្ធផល</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">ផ្សេងៗ / សម្គាល់</Data></Cell>
   </Row>
   ${s3RowsXml}
   <Row ss:Height="15"><Cell ss:StyleID="Default"/></Row>
   <Row ss:Height="22">
    <Cell ss:MergeAcross="9" ss:StyleID="SummaryBlue"><Data ss:Type="String">📊 ស្ថិតិសង្ខេបលទ្ធផល ៖ សិស្សសរុប ${totalStudents} នាក់ (ស្រី ${femaleStudents} នាក់, ប្រុស ${maleStudents} នាក់) | ជាប់ ${passedCount} នាក់ គិតជាភាគរយ ${passRate}% (ស្រី ${passedFemaleCount} នាក់ គិតជាភាគរយ ${passedFemalePercent}%) | ធ្លាក់ ${failedCount} នាក់ គិតជាភាគរយ ${failRate}% (ស្រី ${failedFemaleCount} នាក់ គិតជាភាគរយ ${failedFemalePercent}%)</Data></Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:MergeAcross="1" ss:StyleID="TableHeader"><Data ss:Type="String">លទ្ធផល</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">សរុប</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">ស្រី</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">ប្រុស</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="TableHeader"><Data ss:Type="String">ភាគរយសរុប (%)</Data></Cell>
    <Cell ss:MergeAcross="2" ss:StyleID="TableHeader"><Data ss:Type="String">ភាគរយស្រី (%)</Data></Cell>
   </Row>
   <Row ss:Height="20">
    <Cell ss:MergeAcross="1" ss:StyleID="CellLeft"><Data ss:Type="String">សិស្សសរុប</Data></Cell>
    <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${totalStudents} នាក់</Data></Cell>
    <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${femaleStudents} នាក់</Data></Cell>
    <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${maleStudents} នាក់</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="CellCenter"><Data ss:Type="String">100%</Data></Cell>
    <Cell ss:MergeAcross="2" ss:StyleID="CellCenter"><Data ss:Type="String">${femalePercent}%</Data></Cell>
   </Row>
   <Row ss:Height="20">
    <Cell ss:MergeAcross="1" ss:StyleID="CellLeft"><Data ss:Type="String">សិស្សជាប់មធ្យមភាគ</Data></Cell>
    <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${passedCount} នាក់</Data></Cell>
    <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${passedFemaleCount} នាក់</Data></Cell>
    <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${passedMaleCount} នាក់</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="CellCenter"><Data ss:Type="String">${passRate}%</Data></Cell>
    <Cell ss:MergeAcross="2" ss:StyleID="CellCenter"><Data ss:Type="String">${passedFemalePercent}%</Data></Cell>
   </Row>
   <Row ss:Height="20">
    <Cell ss:MergeAcross="1" ss:StyleID="CellLeft"><Data ss:Type="String">សិស្សធ្លាក់មធ្យមភាគ</Data></Cell>
    <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${failedCount} នាក់</Data></Cell>
    <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${failedFemaleCount} នាក់</Data></Cell>
    <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${failedMaleCount} នាក់</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="CellCenter"><Data ss:Type="String">${failRate}%</Data></Cell>
    <Cell ss:MergeAcross="2" ss:StyleID="CellCenter"><Data ss:Type="String">${failedFemalePercent}%</Data></Cell>
   </Row>
   <Row ss:Height="20"><Cell ss:StyleID="Default"/></Row>
   <Row ss:Height="22">
    <Cell ss:MergeAcross="4" ss:StyleID="SigText"><Data ss:Type="String">បានឃើញ និងឯកភាព</Data></Cell>
    <Cell ss:Index="6" ss:StyleID="Default"/>
    <Cell ss:Index="7" ss:MergeAcross="3" ss:StyleID="SigText"><Data ss:Type="String">${esc(ctx.lunarDateStr || 'ថ្ងៃ....................ខែ..................ឆ្នាំ...............ព.ស.២៥៧០')}</Data></Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:MergeAcross="4" ss:StyleID="SigTitle"><Data ss:Type="String">នាយក/នាយិកាសាលា</Data></Cell>
    <Cell ss:Index="6" ss:StyleID="Default"/>
    <Cell ss:Index="7" ss:MergeAcross="3" ss:StyleID="SigText"><Data ss:Type="String">${esc(ctx.solarDateStr)}</Data></Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:Index="7" ss:MergeAcross="3" ss:StyleID="SigTitle"><Data ss:Type="String">គ្រូបន្ទុកថ្នាក់ / អ្នករៀបចំ</Data></Cell>
   </Row>
   <Row ss:Height="35"><Cell ss:StyleID="Default"/></Row>
   <Row ss:Height="25">
    <Cell ss:MergeAcross="4" ss:StyleID="SigTitle"><Data ss:Type="String">${esc(principalDisplayName)}</Data></Cell>
    <Cell ss:Index="6" ss:StyleID="Default"/>
    <Cell ss:Index="7" ss:MergeAcross="3" ss:StyleID="SigTitle"><Data ss:Type="String">${esc(ctx.teacherName)}</Data></Cell>
   </Row>
  </Table>
 </Worksheet>
</Workbook>`;

        const blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
        const fileName = `CMS_Master_Report_${currentYear}.xls`;
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        }, 150);

        if (typeof window.logAudit === 'function') {
            window.logAudit('EXPORT_EXCEL', 'reports', `បាននាំចេញឯកសារ CMS Master Report XLS (${students.length} សិស្ស, ៣ Sheet ដាច់ដោយឡែក)`);
        }
        if (typeof showToast === 'function') {
            showToast("✅ បាននាំចេញ CMS Master Report (.xls) ចំនួន ៣ Sheet ចាក់ពណ៌ស្អាតជោគជ័យ!");
        }
    },

    // =====================================================================
    // ៣. ផ្ទាំងនាំចូលសិស្សពី Excel (Excel Student Import Wizard)
    // =====================================================================
    openExcelImportModal: function() {
        let modal = document.getElementById("excelImportModal");
        if (!modal) {
            modal = document.createElement("div");
            modal.id = "excelImportModal";
            modal.className = "fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 font-siemreap";
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div class="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-2xl p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-700 animate-scale-up space-y-6">
                <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-lg shadow-md">
                            <i class="fa-solid fa-file-excel"></i>
                        </div>
                        <div>
                            <h3 class="font-moul text-base text-slate-800 dark:text-white">នាំចូលសិស្សពី Excel (.xlsx, .xls)</h3>
                            <p class="text-xs text-slate-400 mt-0.5">ផ្ទុកឯកសារបញ្ជីសិស្សដើម្បីបញ្ចូលក្នុងប្រព័ន្ធស្វ័យប្រវត្តិ</p>
                        </div>
                    </div>
                    <button onclick="document.getElementById('excelImportModal').classList.add('hidden')" class="text-slate-400 hover:text-slate-600 dark:hover:text-white"><i class="fa-solid fa-xmark text-lg"></i></button>
                </div>

                <!-- Template Download Option -->
                <div class="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                    <div class="flex items-center gap-3">
                        <i class="fa-solid fa-circle-info text-emerald-600 text-lg"></i>
                        <div>
                            <h5 class="text-xs font-bold text-emerald-900 dark:text-emerald-300">ទម្រង់គំរូសម្រាប់បញ្ចូល (Excel Template)</h5>
                            <p class="text-[11px] text-emerald-700 dark:text-emerald-400">ទាញយកទម្រង់គំរូដើម្បីងាយស្រួលបំពេញទិន្នន័យ</p>
                        </div>
                    </div>
                    <button onclick="window.AdvancedReports.downloadStudentTemplate()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5">
                        <i class="fa-solid fa-download"></i> ទាញយក Template
                    </button>
                </div>

                <!-- File Drop Zone -->
                <div class="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-3xl p-8 text-center hover:border-emerald-500 transition cursor-pointer relative bg-slate-50 dark:bg-slate-700/40">
                    <input type="file" id="excelFileInput" accept=".xlsx, .xls" onchange="window.AdvancedReports.handleExcelFileSelect(event)" class="absolute inset-0 opacity-0 cursor-pointer">
                    <i class="fa-solid fa-cloud-arrow-up text-4xl text-emerald-500 mb-3 block"></i>
                    <h5 class="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">ជ្រើសរើស ឬទម្លាក់ឯកសារ Excel ទីនេះ</h5>
                    <p class="text-xs text-slate-400">គាំទ្រទម្រង់ .xlsx ឬ .xls</p>
                </div>

                <!-- Preview Box -->
                <div id="excelPreviewContainer" class="hidden space-y-3">
                    <h5 class="font-bold text-xs text-slate-700 dark:text-slate-200" id="excelPreviewCount">សិស្សដែលបានរកឃើញ៖ 0 នាក់</h5>
                    <div class="max-h-56 overflow-y-auto custom-scrollbar border border-slate-200 dark:border-slate-700 rounded-xl">
                        <table class="w-full text-xs text-left whitespace-nowrap">
                            <thead class="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 sticky top-0">
                                <tr>
                                    <th class="p-2">ល.រ</th>
                                    <th class="p-2">អត្តលេខ</th>
                                    <th class="p-2">គោត្តនាម និងនាម</th>
                                    <th class="p-2">ឈ្មោះឡាតាំង</th>
                                    <th class="p-2 text-center">ភេទ</th>
                                    <th class="p-2 text-center">ថ្ងៃកំណើត</th>
                                    <th class="p-2 text-center">ថ្នាក់រៀន</th>
                                    <th class="p-2 text-center">បន្ទប់</th>
                                    <th class="p-2">ទូរស័ព្ទ</th>
                                    <th class="p-2 text-center">ស្ថានភាព</th>
                                </tr>
                            </thead>
                            <tbody id="excelPreviewTbody"></tbody>
                        </table>
                    </div>
                </div>

                <div class="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                    <button onclick="document.getElementById('excelImportModal').classList.add('hidden')" class="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold">បោះបង់</button>
                    <button id="btnConfirmExcelImport" disabled onclick="window.AdvancedReports.confirmExcelImport()" class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed">
                        <i class="fa-solid fa-check mr-1.5"></i> បញ្ចូលក្នុងប្រព័ន្ធ
                    </button>
                </div>
            </div>
        `;

        modal.classList.remove("hidden");
    },

    downloadStudentTemplate: function() {
        if (typeof window.downloadStudentTemplate === 'function') {
            return window.downloadStudentTemplate();
        }
        if (typeof XLSX === 'undefined') return alert("SheetJS មិនទាន់ Load ទេ!");

        const headers = [
            "ល.រ", "អត្តលេខ", "គោត្តនាម និងនាម", "ឈ្មោះជាអក្សរឡាតាំង", "ភេទ", "ថ្ងៃខែឆ្នាំកំណើត", "ថ្ងៃចូលរៀន", 
            "ទីកន្លែងកំណើត(ភូមិ)", "ទីកន្លែងកំណើត(ឃុំ/សង្កាត់)", "ទីកន្លែងកំណើត(ស្រុក/ក្រុង/ខណ្ឌ)", "ទីកន្លែងកំណើត(ខេត្ត/រាជធានី)", 
            "ទីលំនៅបច្ចុប្បន្ន(ភូមិ)", "ទីលំនៅបច្ចុប្បន្ន(ឃុំ/សង្កាត់)", "ទីលំនៅបច្ចុប្បន្ន(ស្រុក/ក្រុង/ខណ្ឌ)", "ទីលំនៅបច្ចុប្បន្ន(ខេត្ត/រាជធានី)", 
            "ឈ្មោះឪពុក", "មុខរបរឪពុក", "ឈ្មោះម្ដាយ", "មុខរបរម្ដាយ", "លេខទូរស័ព្ទអាណាព្យាបាល", 
            "ថ្នាក់រៀន", "បន្ទប់", "ឆ្នាំសិក្សា", "ស្ថានភាព", "ប័ណ្ណក្រីក្រ", "អាហារូបករណ៍", "ពិការភាព"
        ];
        const sampleData1 = [
            "1", "STU10201", "ស៊ុន វិបុល", "SUN VIBOL", "ប្រុស", "15/05/2012", "01/10/2026", 
            "ព្រែកសំរោង", "តាខ្មៅ", "តាខ្មៅ", "កណ្តាល", 
            "ព្រែកសំរោង", "តាខ្មៅ", "តាខ្មៅ", "កណ្តាល", 
            "ស៊ុន សារ៉េត", "គ្រូបង្រៀន", "កែវ ធីតា", "អាជីវករ", "012 889 977", 
            "ថ្នាក់ទី ៧", "«ក»", "2026-2027", "កំពុងសិក្សា", "គ្មាន", "គ្មាន", "គ្មាន"
        ];
        const sampleData2 = [
            "2", "STU10202", "ចាន់ សុខា", "CHAN SOKHA", "ស្រី", "20/08/2012", "01/10/2026", 
            "បឹងកេងកង", "បឹងកេងកងទី១", "បឹងកេងកង", "រាជធានីភ្នំពេញ", 
            "បឹងកេងកង", "បឹងកេងកងទី១", "បឹងកេងកង", "រាជធានីភ្នំពេញ", 
            "ចាន់ ពិសិដ្ឋ", "វិស្វករ", "អ៊ុំ សុភាព", "វេជ្ជបណ្ឌិត", "098 765 432", 
            "ថ្នាក់ទី ៧", "«ក»", "2026-2027", "កំពុងសិក្សា", "មាន", "មាន", "គ្មាន"
        ];
        const ws = XLSX.utils.aoa_to_sheet([headers, sampleData1, sampleData2]);
        ws['!cols'] = [
            { wch: 6 },  // ល.រ
            { wch: 14 }, // អត្តលេខ
            { wch: 22 }, // គោត្តនាម និងនាម
            { wch: 20 }, // ឈ្មោះជាអក្សរឡាតាំង
            { wch: 10 }, // ភេទ
            { wch: 16 }, // ថ្ងៃខែឆ្នាំកំណើត
            { wch: 16 }, // ថ្ងៃចូលរៀន
            { wch: 20 }, // ទីកន្លែងកំណើត(ភូមិ)
            { wch: 22 }, // ទីកន្លែងកំណើត(ឃុំ/សង្កាត់)
            { wch: 24 }, // ទីកន្លែងកំណើត(ស្រុក/ក្រុង/ខណ្ឌ)
            { wch: 24 }, // ទីកន្លែងកំណើត(ខេត្ត/រាជធានី)
            { wch: 20 }, // ទីលំនៅបច្ចុប្បន្ន(ភូមិ)
            { wch: 22 }, // ទីលំនៅបច្ចុប្បន្ន(ឃុំ/សង្កាត់)
            { wch: 24 }, // ទីលំនៅបច្ចុប្បន្ន(ស្រុក/ក្រុង/ខណ្ឌ)
            { wch: 24 }, // ទីលំនៅបច្ចុប្បន្ន(ខេត្ត/រាជធានី)
            { wch: 20 }, // ឈ្មោះឪពុក
            { wch: 18 }, // មុខរបរឪពុក
            { wch: 20 }, // ឈ្មោះម្ដាយ
            { wch: 18 }, // មុខរបរម្ដាយ
            { wch: 24 }, // លេខទូរស័ព្ទអាណាព្យាបាល
            { wch: 14 }, // ថ្នាក់រៀន
            { wch: 10 }, // បន្ទប់
            { wch: 14 }, // ឆ្នាំសិក្សា
            { wch: 16 }, // ស្ថានភាព
            { wch: 14 }, // ប័ណ្ណក្រីក្រ
            { wch: 14 }, // អាហារូបករណ៍
            { wch: 14 }  // ពិការភាព
        ];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "បញ្ជីសិស្សគំរូ");
        XLSX.writeFile(wb, "Student_Import_Template_MoEYS.xlsx");
    },

    parsedExcelStudents: [],

    handleExcelFileSelect: function(event) {
        const file = event.target.files[0];
        if (!file || typeof XLSX === 'undefined') return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

                if (!rows || rows.length <= 1) {
                    alert("⚠️ ឯកសារ Excel គ្មានទិន្នន័យទេ!");
                    return;
                }

                const headerRow = rows[0].map(h => String(h || '').trim().toLowerCase());
                const findCol = (keywords, defaultIdx) => {
                    const idx = headerRow.findIndex(h => keywords.some(k => h.includes(k)));
                    return idx > -1 ? idx : defaultIdx;
                };

                const colId = findCol(["អត្តលេខ", "id", "student_id"], 1);
                const colNameKh = findCol(["គោត្តនាម", "ឈ្មោះ", "name_kh", "name"], 2);
                const colNameEn = findCol(["ឡាតាំង", "អង់គ្លេស", "latin", "english", "name_en"], 3);
                const colGender = findCol(["ភេទ", "gender", "sex"], 4);
                const colDob = findCol(["កំណើត", "dob", "birth"], 5);
                const colEnroll = findCol(["ចូលរៀន", "enroll"], 6);
                const colPobVil = findCol(["ភូមិ(កំណើត)", "ភូមិកំណើត", "ទីកន្លែងកំណើត(ភូមិ)"], 7);
                const colPobCom = findCol(["ឃុំ(កំណើត)", "ឃុំកំណើត", "ទីកន្លែងកំណើត(ឃុំ"], 8);
                const colPobDis = findCol(["ស្រុក(កំណើត)", "ស្រុកកំណើត", "ទីកន្លែងកំណើត(ស្រុក"], 9);
                const colPobPro = findCol(["ខេត្ត(កំណើត)", "ខេត្តកំណើត", "ទីកន្លែងកំណើត(ខេត្ត"], 10);
                const colCurVil = findCol(["ភូមិ(បច្ចុប្បន្ន)", "ទីលំនៅ(ភូមិ)", "ទីលំនៅបច្ចុប្បន្ន(ភូមិ)"], 11);
                const colCurCom = findCol(["ឃុំ(បច្ចុប្បន្ន)", "ទីលំនៅ(ឃុំ)", "ទីលំនៅបច្ចុប្បន្ន(ឃុំ"], 12);
                const colCurDis = findCol(["ស្រុក(បច្ចុប្បន្ន)", "ទីលំនៅ(ស្រុក)", "ទីលំនៅបច្ចុប្បន្ន(ស្រុក"], 13);
                const colCurPro = findCol(["ខេត្ត(បច្ចុប្បន្ន)", "ទីលំនៅ(ខេត្ត)", "ទីលំនៅបច្ចុប្បន្ន(ខេត្ត"], 14);
                const colFather = findCol(["ឈ្មោះឪពុក", "ឪពុក", "father"], 15);
                const colFJob = findCol(["មុខរបរឪពុក", "father_job"], 16);
                const colMother = findCol(["ឈ្មោះម្ដាយ", "ឈ្មោះម្តាយ", "ម្ដាយ", "ម្តាយ", "mother"], 17);
                const colMJob = findCol(["មុខរបរម្ដាយ", "មុខរបរម្តាយ", "mother_job"], 18);
                const colContact = findCol(["ទូរស័ព្ទ", "ទំនាក់ទំនង", "phone", "contact"], 19);
                const colGrade = findCol(["ថ្នាក់", "grade"], 20);
                const colRoom = findCol(["បន្ទប់", "room"], 21);
                const colYear = findCol(["ឆ្នាំសិក្សា", "academic_year", "year"], 22);
                const colStatus = findCol(["ស្ថានភាព", "status"], 23);
                const colPoor = findCol(["ប័ណ្ណក្រីក្រ", "ក្រីក្រ", "poor"], 24);
                const colScholar = findCol(["អាហារូបករណ៍", "scholar"], 25);
                const colDisability = findCol(["ពិការ", "disab"], 26);

                const currentYear = document.getElementById("globalAcademicYear")?.value || localStorage.getItem('selected_academic_year') || "2026-2027";
                const schoolId = window.AuthState?.school_id || localStorage.getItem('school_id') || 'SCH-001';
                const currentTeacherId = window.AuthState ? window.AuthState.teacherId : localStorage.getItem('auth_teacher_id');

                const parsed = [];
                for (let r = 1; r < rows.length; r++) {
                    const rowData = rows[r];
                    const name = String(rowData[colNameKh] || "").trim();
                    if (!name || name === "undefined") continue;

                    const id = String(rowData[colId] || `STU${Math.floor(Math.random() * 900000 + 100000)}`).trim();
                    let rawDob = String(rowData[colDob] || "").trim();
                    if (rawDob && rawDob.includes('/')) {
                        const p = rawDob.split('/');
                        if (p.length === 3) rawDob = `${p[2]}-${p[1].padStart(2, '0')}-${p[0].padStart(2, '0')}`;
                    }

                    let rawEnroll = colEnroll > -1 ? String(rowData[colEnroll] || "").trim() : "";
                    if (rawEnroll && rawEnroll.includes('/')) {
                        const p = rawEnroll.split('/');
                        if (p.length === 3) rawEnroll = `${p[2]}-${p[1].padStart(2, '0')}-${p[0].padStart(2, '0')}`;
                    }

                    const rawStatus = colStatus > -1 ? String(rowData[colStatus] || "Active").trim() : "Active";
                    let normStatus = "Active";
                    if (rawStatus.includes("ផ្ទេរ") || rawStatus.toLowerCase().includes("transfer")) normStatus = "Transferred";
                    else if (rawStatus.includes("បញ្ចប់") || rawStatus.toLowerCase().includes("graduat")) normStatus = "Graduated";
                    else if (rawStatus.includes("មិនសកម្ម") || rawStatus.toLowerCase().includes("inactive")) normStatus = "Inactive";
                    else if (rawStatus.includes("ឈប់") || rawStatus.includes("បោះបង់") || rawStatus.toLowerCase().includes("drop") || rawStatus.toLowerCase().includes("withdrawn")) normStatus = "Withdrawn";

                    const parseBool = (idx) => {
                        if (idx === -1) return false;
                        const v = String(rowData[idx] || '').trim().toLowerCase();
                        return v === 'មាន' || v === 'បាទ' || v === 'ចាស' || v === 'true' || v === 'yes' || v === '1';
                    };

                    const stuYear = colYear > -1 && String(rowData[colYear] || '').trim() ? String(rowData[colYear]).trim() : currentYear;
                    const normGrade = typeof window.normalizeGrade === 'function' 
                        ? window.normalizeGrade(String(rowData[colGrade] || "ថ្នាក់ទី ១"))
                        : String(rowData[colGrade] || "ថ្នាក់ទី ១");

                    parsed.push({
                        id: id,
                        school_id: schoolId,
                        teacher_id: currentTeacherId,
                        academic_year: stuYear,
                        name: name,
                        name_en: colNameEn > -1 ? String(rowData[colNameEn] || "").trim().toUpperCase() : "",
                        gender: String(rowData[colGender] || "ប្រុស").trim(),
                        dob: rawDob,
                        enrollment_date: rawEnroll || new Date().toISOString().split('T')[0],
                        photo_url: "",
                        pob_village: String(rowData[colPobVil] || "").trim(),
                        pob_commune: String(rowData[colPobCom] || "").trim(),
                        pob_district: String(rowData[colPobDis] || "").trim(),
                        pob_province: String(rowData[colPobPro] || "").trim(),
                        curr_village: String(rowData[colCurVil] || "").trim(),
                        curr_commune: String(rowData[colCurCom] || "").trim(),
                        curr_district: String(rowData[colCurDis] || "").trim(),
                        curr_province: String(rowData[colCurPro] || "").trim(),
                        father_name: String(rowData[colFather] || "").trim(),
                        father_job: String(rowData[colFJob] || "").trim(),
                        mother_name: String(rowData[colMother] || "").trim(),
                        mother_job: String(rowData[colMJob] || "").trim(),
                        grade: normGrade,
                        room: String(rowData[colRoom] || "«ក»").trim(),
                        parent_contact: String(rowData[colContact] || "").trim(),
                        poor_id: parseBool(colPoor),
                        scholarship: parseBool(colScholar),
                        disability: parseBool(colDisability),
                        status: normStatus,
                        updated_at: new Date().toISOString()
                    });
                }

                this.parsedExcelStudents = parsed;

                const previewBox = document.getElementById("excelPreviewContainer");
                const previewCount = document.getElementById("excelPreviewCount");
                const previewTbody = document.getElementById("excelPreviewTbody");
                const confirmBtn = document.getElementById("btnConfirmExcelImport");

                if (previewBox && previewTbody && confirmBtn) {
                    previewBox.classList.remove("hidden");
                    previewCount.textContent = `សិស្សដែលបានរកឃើញ៖ ${this.parsedExcelStudents.length} នាក់`;
                    previewTbody.innerHTML = this.parsedExcelStudents.slice(0, 15).map((s, idx) => `
                        <tr class="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                            <td class="p-2 text-center text-slate-400 font-mono">${idx + 1}</td>
                            <td class="p-2 font-mono font-bold text-indigo-600">${s.id}</td>
                            <td class="p-2 font-bold font-moul text-xs">${s.name}</td>
                            <td class="p-2 font-mono text-[11px] uppercase">${s.name_en || '-'}</td>
                            <td class="p-2 text-center font-bold ${s.gender === 'ស្រី' ? 'text-pink-500' : 'text-blue-500'}">${s.gender}</td>
                            <td class="p-2 text-center font-mono">${typeof window.formatDate === 'function' ? window.formatDate(s.dob) : (s.dob || '-')}</td>
                            <td class="p-2 text-center font-bold text-slate-700">${s.grade}</td>
                            <td class="p-2 text-center font-moul text-rose-500">${s.room}</td>
                            <td class="p-2 font-mono">${s.parent_contact || '-'}</td>
                            <td class="p-2 text-center"><span class="px-2 py-0.5 rounded-md text-[10px] font-bold ${s.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}">${s.status}</span></td>
                        </tr>
                    `).join("");

                    confirmBtn.disabled = this.parsedExcelStudents.length === 0;
                }

            } catch (err) {
                console.error("Excel parse error:", err);
                alert("កំហុសក្នុងការអានឯកសារ Excel! សូមពិនិត្យទម្រង់ឯកសារ។");
            }
        };
        reader.readAsArrayBuffer(file);
    },

    confirmExcelImport: async function() {
        if (!this.parsedExcelStudents || this.parsedExcelStudents.length === 0) return;

        let existing = [];
        if (typeof window.getMasterStudents === 'function') {
            existing = window.getMasterStudents();
        } else {
            existing = window.allStudents || JSON.parse(localStorage.getItem('academic_students') || '[]');
        }
        const existingIds = new Set(existing.map(s => String(s.id)));

        let addedCount = 0;
        let updatedCount = 0;

        for (const stu of this.parsedExcelStudents) {
            if (existingIds.has(String(stu.id))) {
                const idx = existing.findIndex(s => String(s.id) === String(stu.id));
                if (idx !== -1) {
                    existing[idx] = { ...existing[idx], ...stu };
                }
                updatedCount++;
            } else {
                stu.enrollment_history = [{
                    grade: stu.grade,
                    room: stu.room,
                    academic_year: stu.academic_year,
                    date: stu.enrollment_date || new Date().toISOString().split('T')[0],
                    status: stu.status || 'Active',
                    reason: 'នាំចូលពី Excel',
                    type: 'excel_import',
                    created_at: new Date().toISOString()
                }];
                existing.unshift(stu);
                existingIds.add(String(stu.id));
                addedCount++;
            }

            // Sync to Firestore
            if (window.db) {
                try {
                    await window.db.collection("students").doc(String(stu.id)).set({
                        ...stu,
                        last_updated: firebase.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });
                } catch(e) {}
            }
        }

        window.allStudents = existing;
        if (typeof window.setMasterStudents === 'function') {
            window.setMasterStudents(existing);
        } else {
            localStorage.setItem('academic_students', JSON.stringify(existing));
        }

        if (typeof window.logAudit === 'function') {
            window.logAudit('IMPORT_EXCEL_STUDENTS', 'student', `បាននាំចូលសិស្សពី Excel (បន្ថែមថ្មី ${addedCount} នាក់, កែប្រែ ${updatedCount} នាក់)`);
        }

        // Emit EventBus notification
        if (window.CMSEventBus && window.CMSEventTypes) {
            window.CMSEventBus.emit(window.CMSEventTypes.STUDENT_ENROLLED, {
                total_imported: this.parsedExcelStudents.length,
                added: addedCount,
                updated: updatedCount,
                source: 'excel_import'
            });
        }

        document.getElementById('excelImportModal')?.classList.add('hidden');

        if (typeof window.renderStudentsTable === 'function') window.renderStudentsTable();
        if (typeof window.filterStudents === 'function') window.filterStudents();
        if (typeof showToast === 'function') showToast(`✅ នាំចូលសិស្សបានជោគជ័យ៖ បន្ថែមថ្មី ${addedCount} នាក់, កែប្រែ ${updatedCount} នាក់!`);
    }
};

window.openReportCard = (id) => window.AdvancedReports.openStudentReportCard(id);
window.exportMasterExcel = () => window.AdvancedReports.exportMasterExcelWorkbook();
window.openExcelImportWizard = () => window.AdvancedReports.openExcelImportModal();
