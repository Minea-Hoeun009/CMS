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
            modal.className = "fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 font-siemreap overflow-y-auto";
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
                            <p><span class="font-bold">ថ្ងៃខែឆ្នាំកំណើត៖</span> ${student.dob || '-'}</p>
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
                            <p class="font-bold text-slate-700 mb-16">បានឃើញ និងឯកភាព<br>នាយកសាលា</p>
                            <p class="font-moul text-[11px] text-slate-800">${sInfo.principal_name || 'នាយកសាលា'}</p>
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
    // ២. ការនាំចេញ Excel ច្រើនសន្លឹក (Multi-Sheet Excel Export via SheetJS)
    // =====================================================================
    exportMasterExcelWorkbook: function() {
        if (typeof XLSX === 'undefined') {
            alert("SheetJS (XLSX) library មិនទាន់ត្រូវបាន Load ទេ!");
            return;
        }

        const students = window.allStudents || JSON.parse(localStorage.getItem('academic_students') || '[]');
        const scores = JSON.parse(localStorage.getItem('academic_scores') || '[]');
        const sInfo = window.appSettings || JSON.parse(localStorage.getItem('school_settings') || '{}');
        const currentYear = document.getElementById("globalAcademicYear")?.value || "2026-2027";

        // Sheet 1: បញ្ជីរាយនាមសិស្ស
        const stuData = students.map((s, idx) => ({
            "ល.រ": idx + 1,
            "អត្តលេខ": s.id,
            "គោត្តនាម និងនាម": s.name,
            "ឈ្មោះឡាតាំង": s.name_en || "",
            "ភេទ": s.gender || "ប្រុស",
            "ថ្ងៃខែឆ្នាំកំណើត": s.dob || "",
            "ថ្នាក់": s.class || sInfo.teacher_level || "",
            "ទូរស័ព្ទ": s.phone || "",
            "អាសយដ្ឋាន": s.address || ""
        }));

        // Sheet 2: តារាងពិន្ទុ
        const scoreData = scores.map((sc, idx) => ({
            "ល.រ": idx + 1,
            "អត្តលេខ": sc.student_id,
            "ថ្នាក់": sc.grade,
            "ខែ/វគ្គ": sc.month,
            "ភាសាខ្មែរ": sc.khmer || "",
            "គណិតវិទ្យា": sc.math || "",
            "វិទ្យាសាស្ត្រ": sc.science || "",
            "សិក្សាសង្គម": sc.social || "",
            "ភាសាអង់គ្លេស": sc.english || "",
            "ពិន្ទុសរុប": sc.total_score || "",
            "មធ្យមភាគ": sc.average || "",
            "ចំណាត់ថ្នាក់": sc.rank || "",
            "និទ្ទេស": sc.grade_letter || ""
        }));

        const wb = XLSX.utils.book_new();

        const wsStudents = XLSX.utils.json_to_sheet(stuData);
        XLSX.utils.book_append_sheet(wb, wsStudents, "បញ្ជីសិស្ស");

        const wsScores = XLSX.utils.json_to_sheet(scoreData);
        XLSX.utils.book_append_sheet(wb, wsScores, "តារាងពិន្ទុ");

        const fileName = `CMS_Master_Report_${currentYear}.xlsx`;
        XLSX.writeFile(wb, fileName);

        if (typeof window.logAudit === 'function') {
            window.logAudit('EXPORT_EXCEL', 'reports', `បាននាំចេញឯកសារ Master Excel (${students.length} សិស្ស, ${scores.length} ពិន្ទុ)`);
        }

        if (typeof showToast === 'function') showToast("✅ នាំចេញឯកសារ Excel បានជោគជ័យ!");
    },

    // =====================================================================
    // ៣. ផ្ទាំងនាំចូលសិស្សពី Excel (Excel Student Import Wizard)
    // =====================================================================
    openExcelImportModal: function() {
        let modal = document.getElementById("excelImportModal");
        if (!modal) {
            modal = document.createElement("div");
            modal.id = "excelImportModal";
            modal.className = "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-siemreap";
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
                            <td class="p-2 text-center font-mono">${s.dob || '-'}</td>
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
