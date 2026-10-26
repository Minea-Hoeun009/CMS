// ==========================================
// ឯកសារ js/students.js - ប្រព័ន្ធគ្រប់គ្រងទិន្នន័យសិស្ស (Ultra-Safe Dynamic Edition)
// ==========================================

if (typeof window.getMasterStudents === 'function') {
    window.allStudents = window.getMasterStudents();
} else {
    try {
        window.allStudents = JSON.parse(localStorage.getItem('academic_students') || '[]');
    } catch(e) {
        window.allStudents = [];
    }
}
window.filteredStudents = [...window.allStudents];
// ==========================================
// មុខងារជំនួយ៖ បំប្លែងថ្ងៃខែឆ្នាំកំណើត ទៅជាទម្រង់ខ្មែរពេញលេញ (Super Clean & Khmer Format)
// ==========================================
window.formatKhmerDateFull = function(dateStr) {
    if (!dateStr) return ".........................";
    
    // ១. សម្អាតទិន្នន័យ (លុបសញ្ញា " និង ម៉ោងអន្តរជាតិ T17:00:00.000Z)
    let cleanStr = String(dateStr).replace(/["'\s]/g, ""); 
    cleanStr = cleanStr.replace(/T[0-9:\.Z]+/gi, "");
    cleanStr = cleanStr.replace(/-/g, '/');
    
    // ២. កាត់យក ថ្ងៃ ខែ ឆ្នាំ
    let parts = cleanStr.split('/').filter(p => p.trim() !== "");
    if (parts.length >= 3) {
        let day, month, year;
        let p1 = parts[0].padStart(2, '0');
        let p2 = parts[1].padStart(2, '0');
        let p3 = parts[2];
        
        // កំណត់ទីតាំង ថ្ងៃ ខែ ឆ្នាំ
        if (p1.length === 4) {
            year = p1; month = p2; day = p3; // YYYY/MM/DD
        } else {
            day = p1; month = p2; year = p3; // DD/MM/YYYY
        }
        
        // ៣. បំប្លែងលេខខែ ទៅជាឈ្មោះខែខ្មែរ
        const khmerMonths = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];
        let mIndex = parseInt(month, 10) - 1;
        let monthName = (mIndex >= 0 && mIndex < 12) ? khmerMonths[mIndex] : month;
        
        // ៤. បំប្លែងលេខ ទៅជាលេខខ្មែរ
        let toKhNum = typeof window.toKhmerNum === 'function' ? window.toKhmerNum : String;
        
        return `ថ្ងៃទី ${toKhNum(day)} ខែ ${monthName} ឆ្នាំ ${toKhNum(year)}`;
    }
    
    // បើខុសទម្រង់ បង្ហាញលេខខ្មែរធម្មតា
    return typeof window.toKhmerNum === 'function' ? window.toKhmerNum(cleanStr) : cleanStr; 
};

// ==========================================
// មុខងារជំនួយ៖ គណនាអាយុ
// ==========================================
window.calculateAge = function(dobStr) {
    if (!dobStr) return "";
    
    let cleanStr = String(dobStr).replace(/["'\s]/g, "");
    if (cleanStr.includes('T')) {
        cleanStr = cleanStr.split('T')[0];
    }
    
    let birthYear = 0;
    if (cleanStr.includes('-')) {
        let p = cleanStr.split('-');
        birthYear = p[0].length === 4 ? parseInt(p[0]) : parseInt(p[2]);
    } else if (cleanStr.includes('/')) {
        let p = cleanStr.split('/');
        birthYear = p[0].length === 4 ? parseInt(p[0]) : parseInt(p[2]);
    } else {
        birthYear = new Date(cleanStr).getFullYear();
    }
    
    if (!birthYear || isNaN(birthYear)) return "";
    
    let currentYear = new Date().getFullYear();
    return currentYear - birthYear;
};

// ==========================================
// អនុគមន៍ជំនួយ (Helper Functions)
// ==========================================
function toKhmerNum(str) {
    if (!str) return "";
    const khmerNumbers = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    return String(str).split('').map(n => (n >= '0' && n <= '9') ? khmerNumbers[parseInt(n)] : n).join('');
}

function normalizeGrade(str) {
    if (!str) return "";
    let s = String(str).trim();
    if (s === "all" || s === "គ្រប់ថ្នាក់") return "";
    const khmerToArabic = {'០':'0', '១':'1', '២':'2', '៣':'3', '៤':'4', '៥':'5', '៦':'6', '៧':'7', '៨':'8', '៩':'9'};
    let arabicStr = s.replace(/[០-៩]/g, match => khmerToArabic[match]);
    let match = arabicStr.match(/[0-9]+/);
    if (match) return "ថ្នាក់ទី " + toKhmerNum(match[0]);
    return s;
}

const formatDate = function(dateVal, format = 'DD/MM/YYYY') {
    if (!dateVal && dateVal !== 0) return "-";
    let str = String(dateVal).trim().replace(/^["']+|["']+$/g, '');
    if (!str || str === "undefined" || str === "null") return "-";

    const dmyMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (dmyMatch) {
        const day = dmyMatch[1].padStart(2, '0');
        const month = dmyMatch[2].padStart(2, '0');
        const year = dmyMatch[3];
        if (format === 'YYYY-MM-DD') return `${year}-${month}-${day}`;
        return `${day}/${month}/${year}`;
    }

    const ymdMatch = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
    if (ymdMatch) {
        const year = ymdMatch[1];
        const month = ymdMatch[2].padStart(2, '0');
        const day = ymdMatch[3].padStart(2, '0');
        if (format === 'YYYY-MM-DD') return `${year}-${month}-${day}`;
        return `${day}/${month}/${year}`;
    }

    let parsedDate = new Date(str);
    if (!isNaN(parsedDate.getTime())) {
        try {
            const parts = new Intl.DateTimeFormat('en-GB', {
                timeZone: 'Asia/Phnom_Penh',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }).formatToParts(parsedDate);
            const day = parts.find(p => p.type === 'day')?.value || String(parsedDate.getDate()).padStart(2, '0');
            const month = parts.find(p => p.type === 'month')?.value || String(parsedDate.getMonth() + 1).padStart(2, '0');
            const year = parts.find(p => p.type === 'year')?.value || String(parsedDate.getFullYear());
            if (format === 'YYYY-MM-DD') return `${year}-${month}-${day}`;
            return `${day}/${month}/${year}`;
        } catch (e) {
            const d = new Date(parsedDate.getTime() + (7 * 60 * 60 * 1000));
            const day = String(d.getUTCDate()).padStart(2, '0');
            const month = String(d.getUTCMonth() + 1).padStart(2, '0');
            const year = d.getUTCFullYear();
            if (format === 'YYYY-MM-DD') return `${year}-${month}-${day}`;
            return `${day}/${month}/${year}`;
        }
    }
    return str;
};
window.formatDate = formatDate;

function calculateAge(dobStr) {
    if (!dobStr) return "-";
    const cleanDob = formatDate(dobStr, 'YYYY-MM-DD');
    if (!cleanDob || cleanDob === "-") return "-";
    const dob = new Date(cleanDob);
    if (isNaN(dob.getTime())) return "-";
    const diff_ms = Date.now() - dob.getTime();
    const age_dt = new Date(diff_ms); 
    return Math.abs(age_dt.getUTCFullYear() - 1970).toString();
}

function getAvatarInitial(name) {
    if (!name) return "ស";
    const cleanName = String(name).replace(/^(កុមារា|កុមារី|យុវជន|យុវតី)\s*/, '');
    const words = cleanName.split(' ');
    if (words.length > 1) return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    return cleanName.substring(0, 2).toUpperCase();
}

function formatAddress(village, commune) {
    let addr = [];
    if(village) addr.push(`ភូមិ${village}`);
    if(commune) addr.push(`ឃុំ${commune}`);
    return addr.length > 0 ? addr.join(" ") : "-";
}

// ==========================================
// ១. មុខងារចម្បងក្នុងការគូរផ្ទាំងគ្រប់គ្រងសិស្ស (Fast Load)
// ==========================================
window.loadStudentsView = async function() {
    try {
        const container = document.getElementById("studentsView") || document.getElementById("mainContentArea") || document.getElementById("appView");
        if (!container) return;

        const teacherScope = typeof window.getAssignedScope === 'function' ? window.getAssignedScope() : {};
        const isSchoolOrSysAdmin = typeof window.isSchoolAdmin === 'function' ? window.isSchoolAdmin() : false;
        
        const curClass = typeof window.getCurrentSelectedClass === 'function' ? window.getCurrentSelectedClass() : { level: "ថ្នាក់ទី ១", room: "«ក»" };
        let initialSelectedGrade = curClass.level || "ថ្នាក់ទី ១";
        let initialSelectedRoom = curClass.room || "«ក»";

        const toKhNum = typeof window.toKhmerNum === 'function' ? window.toKhmerNum : String;
        const struct = window.academicStructure || window.defaultAcademicStructure || {};
        const structGrades = Array.isArray(struct.grades) ? struct.grades.map(g => (typeof g === 'object' ? g.name : g)).filter(Boolean) : [];
        
        const allGradesSet = new Set();
        for(let i = 1; i <= 12; i++) {
            allGradesSet.add(`ថ្នាក់ទី ${toKhNum(i)}`);
        }
        structGrades.forEach(g => allGradesSet.add(g));
        (window.allStudents || []).forEach(s => {
            if (s && s.grade && s.grade.trim()) {
                const norm = normalizeGrade(s.grade);
                if (norm) allGradesSet.add(norm);
                else allGradesSet.add(s.grade.trim());
            }
        });

        let gradesOptions = `<option value="all" ${initialSelectedGrade === 'all' ? 'selected' : ''}>គ្រប់ថ្នាក់ទាំងអស់</option>`;
        allGradesSet.forEach(gVal => {
            gradesOptions += `<option value="${gVal}" ${gVal === initialSelectedGrade ? 'selected' : ''}>${gVal}</option>`;
        });

        const structRooms = [];
        if (Array.isArray(struct.grades)) {
            struct.grades.forEach(g => {
                if (Array.isArray(g.rooms)) g.rooms.forEach(r => structRooms.push(r));
            });
        }
        const roomsSet = new Set(["«ក»", "«ខ»", "«គ»", "«ឃ»", "«ង»", ...structRooms]);
        (window.allStudents || []).forEach(s => {
            if (s && s.room && s.room.trim()) roomsSet.add(s.room.trim());
        });

        let roomsOptions = `<option value="all" ${initialSelectedRoom === 'all' ? 'selected' : ''}>គ្រប់បន្ទប់ទាំងអស់</option>`;
        roomsSet.forEach(r => {
            roomsOptions += `<option value="${r}" ${r === initialSelectedRoom ? 'selected' : ''}>បន្ទប់ ${r}</option>`;
        });

        const sInfo = typeof appSettings !== 'undefined' ? appSettings : (JSON.parse(localStorage.getItem('school_settings') || '{}'));
        const academicYear = document.getElementById("globalAcademicYear")?.value || localStorage.getItem('selected_academic_year') || sInfo.academic_year || "2026-2027";
        
        container.className = "p-2 md:p-6 transition duration-500 h-full w-full flex flex-col min-h-0 bg-slate-50";
        container.innerHTML = `
            <style>
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
                .check-card-input:checked + .check-card-content { border-color: #6366f1; background-color: #eef2ff; }
                .check-card-input:checked + .check-card-content .check-icon { color: #6366f1; opacity: 1; transform: scale(1); }
            </style>
            
            <div class="w-full h-full overflow-y-auto overflow-x-hidden custom-scrollbar bg-slate-50 relative">
                <div class="flex animate-fade-in flex-col font-siemreap text-slate-800 max-w-[1680px] mx-auto pb-16 pt-1 min-h-full">
                    
                    <div class="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200 shrink-0 mb-6 no-print relative overflow-hidden flex flex-col xl:flex-row justify-between items-center gap-6 transition-all">
                        <div class="absolute -right-10 -top-10 w-40 h-40 bg-indigo-50 rounded-full blur-3xl pointer-events-none hidden md:block"></div>
                        <div class="absolute -left-10 -bottom-10 w-32 h-32 bg-blue-50 rounded-full blur-3xl pointer-events-none hidden md:block"></div>
                        
                        <div class="flex items-center gap-5 relative z-10 w-full xl:w-auto">
                            <div class="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-indigo-200 shrink-0 transform -rotate-3"><i class="fa-solid fa-users"></i></div>
                            <div>
                                <h2 class="text-xl md:text-3xl font-black text-slate-800 font-moul mb-1">បញ្ជីឈ្មោះសិស្ស</h2>
                                <p class="text-[11px] md:text-sm text-slate-500 font-bold flex gap-3 items-center">
                                    <span class="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg border border-indigo-100">សរុប: <span id="hdrTotal" class="font-mono text-sm">0</span> នាក់</span>
                                    <span class="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg border border-emerald-100">បង្ហាញ: <span id="hdrActive" class="font-mono text-sm">0</span> នាក់</span>
                                </p>
                            </div>
                        </div>
                        
                        <div class="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-start xl:justify-end relative z-10">
                            <div class="h-8 w-px bg-slate-200 hidden lg:block mx-1"></div>
                            
                            <button onclick="if(typeof window.printStudentList === 'function') window.printStudentList();" class="w-10 h-10 flex items-center justify-center bg-white hover:bg-slate-50 text-slate-700 rounded-xl transition border border-slate-200 shadow-sm hover:shadow" title="បោះពុម្ពបញ្ជីសង្ខេប">
                                <i class="fa-solid fa-print text-lg"></i>
                            </button>
                            <button onclick="if(typeof window.printFullStudentList === 'function') window.printFullStudentList();" class="w-10 h-10 flex items-center justify-center bg-white hover:bg-slate-50 text-slate-700 rounded-xl transition border border-slate-200 shadow-sm hover:shadow" title="បោះពុម្ពបញ្ជីលម្អិត">
                                <i class="fa-solid fa-list-check text-lg"></i>
                            </button>

                            <div class="h-8 w-px bg-slate-200 hidden lg:block mx-1"></div>
                            
                            <input type="file" id="stuExcelInput" accept=".xlsx, .xls" class="hidden" onchange="if(typeof window.importStudentsExcel === 'function') window.importStudentsExcel(event)">
                            <div class="flex bg-slate-100 p-1 rounded-xl">
                                <button onclick="if(typeof window.downloadStudentTemplate === 'function') window.downloadStudentTemplate(); else if(window.AdvancedReports) window.AdvancedReports.downloadStudentTemplate();" class="px-3 py-2 text-slate-600 hover:text-indigo-600 hover:bg-white rounded-lg text-[13px] font-bold transition" title="ទាញយកគំរូ Excel"><i class="fa-solid fa-download"></i></button>
                                <button onclick="if(typeof window.openExcelImportWizard === 'function') window.openExcelImportWizard(); else document.getElementById('stuExcelInput').click();" class="px-3 py-2 text-slate-600 hover:text-amber-600 hover:bg-white rounded-lg text-[13px] font-bold transition" title="នាំចូលពី Excel"><i class="fa-solid fa-file-import"></i></button>
                                <button onclick="if(typeof window.exportMasterExcel === 'function') window.exportMasterExcel(); else if(typeof window.exportStudentsExcel === 'function') window.exportStudentsExcel();" class="px-3 py-2 text-slate-600 hover:text-emerald-600 hover:bg-white rounded-lg text-[13px] font-bold transition" title="ទាញយកជា Excel"><i class="fa-solid fa-file-excel"></i></button>
                            </div>
                            
                            <button onclick="if(typeof window.openStudentModal === 'function') window.openStudentModal();" class="w-full sm:w-auto mt-2 sm:mt-0 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[13px] font-bold shadow-md shadow-indigo-200 transition flex items-center justify-center gap-2 transform hover:-translate-y-0.5 sm:ml-2">
                                <i class="fa-solid fa-user-plus"></i> ចុះឈ្មោះថ្មី
                            </button>
                        </div>
                    </div>

                    <div class="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm mb-6 shrink-0 no-print relative z-20">
                        <div class="flex items-center justify-between mb-3 px-1">
                            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><i class="fa-solid fa-filter text-indigo-500"></i> តម្រងស្វែងរកសិស្ស</span>
                            <button type="button" onclick="if(typeof window.resetStudentFilters === 'function') window.resetStudentFilters();" title="សម្អាតតម្រងទាំងអស់" class="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition inline-flex items-center gap-1.5">
                                <i class="fa-solid fa-arrow-rotate-left text-[11px]"></i> សម្អាតតម្រង
                            </button>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                            <!-- ស្វែងរក -->
                            <div class="relative col-span-1 sm:col-span-2 lg:col-span-4 group">
                                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"><i class="fa-solid fa-magnifying-glass text-[14px]"></i></span>
                                <input type="text" id="stuSearchInput" oninput="if(typeof window.filterStudents === 'function') window.filterStudents();" placeholder="ស្វែងរកឈ្មោះ ឬ អត្តលេខ..." class="pl-11 pr-4 py-3 w-full border border-slate-200 rounded-2xl text-[13px] font-bold outline-none bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all shadow-inner">
                            </div>

                            <!-- Hidden Grade & Room Selectors for Single Classroom Mode -->
                            <div class="hidden" aria-hidden="true">
                                <select id="stuFilterGrade" onchange="if(typeof window.filterStudents === 'function') window.filterStudents();">
                                    ${gradesOptions}
                                </select>
                                <select id="stuFilterRoom" onchange="if(typeof window.filterStudents === 'function') window.filterStudents();">
                                    ${roomsOptions}
                                </select>
                            </div>
                           
                            <!-- ភេទ -->
                            <div class="relative col-span-1">
                                <select id="stuFilterGender" onchange="if(typeof window.filterStudents === 'function') window.filterStudents();" class="w-full border border-slate-200 rounded-2xl px-4 py-3 text-[13px] font-bold text-slate-700 bg-slate-50 outline-none cursor-pointer focus:bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition shadow-inner">
                                    <option value="all">ប្រុស និង ស្រី</option>
                                    <option value="ប្រុស">ប្រុស</option>
                                    <option value="ស្រី">ស្រី</option>
                                </select>
                            </div>

                            <!-- ស្ថានភាព -->
                            <div class="relative col-span-1">
                                <select id="stuFilterStatus" onchange="if(typeof window.filterStudents === 'function') window.filterStudents();" class="w-full border border-slate-200 rounded-2xl px-4 py-3 text-[13px] font-bold text-slate-700 bg-slate-50 outline-none cursor-pointer focus:bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition shadow-inner">
                                    <option value="all">គ្រប់ស្ថានភាព</option>
                                    <option value="Active" selected>កំពុងសិក្សា (Active)</option>
                                    <option value="Transferred">បានផ្ទេរចេញ (Transferred)</option>
                                    <option value="Graduated">បានបញ្ចប់ការសិក្សា (Graduated)</option>
                                    <option value="Inactive">មិនសកម្ម (Inactive)</option>
                                    <option value="Withdrawn">បានឈប់រៀន (Withdrawn)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white rounded-[2rem] border border-slate-200 shadow-sm relative flex-1 flex flex-col w-full min-h-[400px] overflow-hidden print:border-none print:shadow-none z-10">
                        <div class="w-full h-full overflow-x-auto custom-scrollbar print:overflow-visible relative bg-white pb-6">
                            <table id="studentsTable" class="w-max min-w-full border-collapse text-left whitespace-nowrap bg-white relative">
                                <thead class="bg-slate-50/90 text-slate-500 sticky top-0 z-20 backdrop-blur-md text-[11px] uppercase tracking-wider font-bold shadow-sm">
                                    <tr>
                                        <th class="p-4 border-b border-slate-200 text-center w-12">ល.រ</th>
                                        <th class="p-4 border-b border-slate-200 text-center w-16">រូបថត</th>
                                        <th class="p-4 border-b border-slate-200 w-24 text-indigo-600 font-moul">អត្តលេខ</th>
                                        <th class="p-4 border-b border-slate-200 font-moul text-slate-700">គោត្តនាម និងនាម</th>
                                        <th class="p-4 border-b border-slate-200 text-center w-16">ភេទ</th>
                                        <th class="p-4 border-b border-slate-200 w-32 text-center">ថ្ងៃខែឆ្នាំកំណើត</th>
                                        <th class="p-4 border-b border-slate-200 w-36 text-center font-moul text-slate-700">ថ្នាក់ និងបន្ទប់</th>
                                        <th class="p-4 border-b border-slate-200 w-40">ទីលំនៅ (ភូមិ/ឃុំ)</th>
                                        <th class="p-4 border-b border-slate-200 text-center w-36 no-print">សកម្មភាព</th>
                                    </tr>
                                </thead>
                                <tbody id="studentsTableBody" class="divide-y divide-slate-100 text-[13px] text-slate-700">
                                    <tr>
                                        <td colspan="9" class="p-20 text-center text-slate-400 font-bold">
                                            <i class="fa-solid fa-circle-notch fa-spin text-4xl mb-4 text-indigo-400"></i><br>កំពុងរៀបចំទិន្នន័យ...
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div id="stuModalContainer"></div>
                </div> 
            </div>
        `;

        if (typeof window.renderStudentModalTemplate === 'function') window.renderStudentModalTemplate();
        
        // 🔴 ១. គូរតារាងភ្លាមៗដោយប្រើទិន្នន័យក្នុង Memory (ដើម្បីឱ្យលោតឈ្មោះសិស្សចេញមកភ្លាម)
        if (typeof window.filterStudents === 'function') {
            window.filterStudents();
        }

        // 🔴 ២. លួចទៅចាប់ទិន្នន័យថ្មីពី Firebase មក Update (Background Sync)
        if (typeof window.fetchStudentsData === 'function') {
            window.fetchStudentsData();
        }

    } catch (error) {
        console.error("មានកំហុសក្នុងការ Load ផ្ទាំងបញ្ជីឈ្មោះសិស្ស:", error);
    }
};

// ==========================================
// ២. មុខងារទាញយកទិន្នន័យសិស្ស (Background Sync)
// ==========================================
window.fetchStudentsData = function() {
    const tbody = document.getElementById("studentsTableBody");
    
    // បើគ្មានទិន្នន័យសោះក្នុង Memory ទើបបង្ហាញពាក្យថា "កំពុងភ្ជាប់ទិន្នន័យ..."
    if ((!window.allStudents || window.allStudents.length === 0) && tbody) {
        tbody.innerHTML = `<tr><td colspan="9" class="p-20 text-center"><i class="fa-solid fa-circle-notch fa-spin text-3xl text-indigo-500 mb-2"></i><br>កំពុងភ្ជាប់ទិន្នន័យពី Cloud...</td></tr>`;
    }

    // 1. ទាញទិន្នន័យពី Google Apps Script (REST API) ពេលប្រើ Google Sheets
    if (typeof window.apiGet === 'function') {
        window.apiGet("getStudents").then(res => {
            if (res && res.status === "success" && Array.isArray(res.data) && res.data.length > 0) {
                if (typeof window.setMasterStudents === 'function') {
                    window.setMasterStudents(res.data);
                } else {
                    window.allStudents = res.data;
                    localStorage.setItem('academic_students', JSON.stringify(res.data));
                }
                if (typeof window.filterStudents === 'function') {
                    window.filterStudents();
                }
            }
        }).catch(err => console.warn("Google Sheets fetchStudents error:", err));
    }

    // 2. ទាញទិន្នន័យពី Firebase Firestore បើបានភ្ជាប់ Firestore
    if (typeof db !== 'undefined') {
        try {
            db.collection("students")
              .onSnapshot((snapshot) => {
                  let stus = [];
                  snapshot.forEach((doc) => {
                      stus.push({ fb_id: doc.id, id: doc.id, ...doc.data() });
                  });

                  if (stus.length > 0) {
                      if (typeof window.setMasterStudents === 'function') {
                          window.setMasterStudents(stus);
                      } else {
                          window.allStudents = stus;
                          localStorage.setItem('academic_students', JSON.stringify(stus));
                      }
                  }

                  if (typeof window.filterStudents === 'function') {
                      window.filterStudents();
                  }
              }, (error) => {
                  console.warn("កំហុសក្នុងការស្តាប់ទិន្នន័យ Firebase (ប្រើ Cached Data):", error);
                  try {
                      const cached = JSON.parse(localStorage.getItem('academic_students') || '[]');
                      if (cached.length > 0) {
                          window.allStudents = cached;
                          if (typeof window.filterStudents === 'function') window.filterStudents();
                      }
                  } catch(e) {}
              });
        } catch (e) {
            console.error("កំហុសក្នុងការហៅ Firebase:", e);
        }
    } else {
        try {
            const cached = JSON.parse(localStorage.getItem('academic_students') || '[]');
            if (cached.length > 0) {
                window.allStudents = cached;
                if (typeof window.filterStudents === 'function') window.filterStudents();
            }
        } catch(e) {}
    }
};

// ==========================================
// មុខងាររក្សាទុកសិស្សទៅកាន់ Firebase
// ==========================================
window.saveStudentToFirebase = async function(studentData) {
    if (!window.db) return false;
    const docRef = window.db.collection("students").doc(String(studentData.id));
    await docRef.set({
        ...studentData,
        last_updated: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    console.log("✅ ទិន្នន័យសិស្សត្រូវបានរក្សាទុកទៅ Cloud:", studentData.id);
    return true;
};

// ==========================================
// ៣. ចម្រោះ និងបង្ហាញទិន្នន័យសិស្ស (Ultra-Safe Filter)
// ==========================================
window.resetStudentFilters = function() {
    const sInput = document.getElementById("stuSearchInput");
    const sGrade = document.getElementById("stuFilterGrade");
    const sRoom = document.getElementById("stuFilterRoom");
    const sGen = document.getElementById("stuFilterGender");
    const sStat = document.getElementById("stuFilterStatus");
    if (sInput) sInput.value = "";
    if (sGrade) sGrade.value = "all";
    if (sRoom) sRoom.value = "all";
    if (sGen) sGen.value = "all";
    if (sStat) sStat.value = "Active";
    if (typeof window.filterStudents === 'function') window.filterStudents();
};

window.filterStudents = function() {
    const search = (document.getElementById("stuSearchInput")?.value || "").toLowerCase().trim();
    const grade = document.getElementById("stuFilterGrade")?.value || "all";
    const room = document.getElementById("stuFilterRoom")?.value || "all";
    const gender = document.getElementById("stuFilterGender")?.value || "all";
    const status = document.getElementById("stuFilterStatus")?.value || "all";

    const currentTeacherId = String(window.AuthState ? window.AuthState.teacherId : localStorage.getItem('auth_teacher_id') || "").trim();
    const currentYear = String(document.getElementById("globalAcademicYear")?.value || localStorage.getItem('selected_academic_year') || "").trim();
    const isSchoolOrSysAdmin = typeof window.isSchoolAdmin === 'function' ? window.isSchoolAdmin() : (typeof isCurrentUserAdmin === 'function' && isCurrentUserAdmin());
    const isReportViewer = typeof window.isReportViewer === 'function' ? window.isReportViewer() : false;
    const scope = typeof window.getAssignedScope === 'function' ? window.getAssignedScope() : {};

    // បង្ការកំហុស Error ពេល allStudents ជា null
    if (!window.allStudents || window.allStudents.length === 0) {
        try {
            window.allStudents = JSON.parse(localStorage.getItem('academic_students') || '[]');
        } catch(e) {
            window.allStudents = [];
        }
    }
    const baseStudents = window.allStudents || [];

    const cleanRoom = (r) => String(r || '').replace(/[«»\s]/g, '');
    const inactiveStatuses = ["transferred", "បានផ្ទេរចេញ", "ផ្ទេរចេញ", "graduated", "បានបញ្ចប់ការសិក្សា", "បញ្ចប់ការសិក្សា", "inactive", "មិនសកម្ម", "ផ្អាក", "withdrawn", "dropped", "បោះបង់", "ឈប់រៀន"];

    window.filteredStudents = baseStudents.filter(s => {
        if (!s || typeof s !== 'object') return false;

        // Year check: match if academic_year matches currentYear, or if student doesn't have an academic_year set
        const sYear = String(s.academic_year || "").trim();
        if (currentYear && currentYear !== "all" && sYear && sYear !== "undefined" && !sYear.includes(currentYear) && !currentYear.includes(sYear)) {
            const hasMatchingYearStudents = baseStudents.some(st => {
                const y = String(st.academic_year || '').trim();
                return y && (y.includes(currentYear) || currentYear.includes(y));
            });
            if (hasMatchingYearStudents && (!isSchoolOrSysAdmin || (grade !== "all"))) {
                return false;
            }
        }

        const normGrade = typeof window.normalizeGrade === 'function' ? window.normalizeGrade(s.grade) : String(s.grade || "").trim();
        const safeRoom = cleanRoom(s.room);

        // ត្រួតពិនិត្យវិសាលភាពទទួលខុសត្រូវ (Scope Enforcement) សម្រាប់គ្រូតាមកម្រិតថ្នាក់
        if (!isSchoolOrSysAdmin && !isReportViewer) {
            const rawAssigned = (scope.grade || "").trim();
            if (rawAssigned && rawAssigned !== "all" && rawAssigned !== "គ្រប់ថ្នាក់") {
                const assignedGrade = typeof window.normalizeGrade === 'function' ? window.normalizeGrade(rawAssigned) : rawAssigned;
                if (assignedGrade && normGrade && normGrade !== assignedGrade) {
                    const hasAssignedGradeStudents = baseStudents.some(st => (typeof window.normalizeGrade === 'function' ? window.normalizeGrade(st.grade) : st.grade) === assignedGrade);
                    if (hasAssignedGradeStudents) {
                        return false;
                    }
                }
            }
            const cleanScopeRoom = cleanRoom(scope.room);
            if (cleanScopeRoom && cleanScopeRoom !== "all" && cleanScopeRoom !== "គ្រប់បន្ទប់" && cleanScopeRoom !== "ទូទៅ") {
                if (safeRoom && safeRoom !== cleanScopeRoom) {
                    const hasAssignedRoomStudents = baseStudents.some(st => cleanRoom(st.room) === cleanScopeRoom);
                    if (hasAssignedRoomStudents) {
                        return false;
                    }
                }
            }
        }

        const safeName = String(s.name || "").toLowerCase();
        const safeNameEn = String(s.name_en || s.name_latin || "").toLowerCase();
        const safeId = String(s.id || "").toLowerCase();
        const safeGender = String(s.gender || "").trim();
        const safeStatus = String(s.status || "Active").trim().toLowerCase();

        // Check Filters
        const matchSearch = search === "" || safeName.includes(search) || safeNameEn.includes(search) || safeId.includes(search);
        
        let matchGrade = true;
        if (grade !== "all") {
            const selectedNorm = typeof window.normalizeGrade === 'function' ? window.normalizeGrade(grade) : String(grade).trim();
            matchGrade = !selectedNorm || (normGrade === selectedNorm) || (String(s.grade || "").trim() === String(grade).trim());
        }

        let matchRoom = true;
        if (room !== "all") {
            const targetRoomClean = cleanRoom(room);
            matchRoom = !targetRoomClean || (safeRoom === targetRoomClean) || (targetRoomClean === "ក" && (!safeRoom || safeRoom === ""));
        }

        let matchGender = true;
        if (gender !== "all") {
            matchGender = safeGender === gender || (gender === "ប្រុស" && safeGender === "");
        }
        
        let matchStatus = true;
        if (status === "all") {
            matchStatus = true;
        } else if (status === "Active") {
            matchStatus = !inactiveStatuses.includes(safeStatus);
        } else if (status === "Transferred") {
            matchStatus = safeStatus === "transferred" || safeStatus === "បានផ្ទេរចេញ" || safeStatus === "ផ្ទេរចេញ";
        } else if (status === "Graduated") {
            matchStatus = safeStatus === "graduated" || safeStatus === "បានបញ្ចប់ការសិក្សា" || safeStatus === "បញ្ចប់ការសិក្សា";
        } else if (status === "Inactive") {
            matchStatus = safeStatus === "inactive" || safeStatus === "មិនសកម្ម" || safeStatus === "ផ្អាក";
        } else if (status === "Withdrawn") {
            matchStatus = safeStatus === "withdrawn" || safeStatus === "dropped" || safeStatus === "បោះបង់" || safeStatus === "ឈប់រៀន";
        } else {
            matchStatus = safeStatus === status.toLowerCase();
        }

        return matchSearch && matchGrade && matchRoom && matchGender && matchStatus;
    });

    // 🟢 Single-Classroom UX Guard: បើគ្មានពាក្យស្វែងរក ហើយតម្រងទូទៅមិនត្រូវគ្នាដោយសារ format ត្រូវបង្ហាញសិស្សសកម្មទាំងអស់ភ្លាមៗ
    if (window.filteredStudents.length === 0 && baseStudents.length > 0 && search === "" && gender === "all") {
        const activeList = baseStudents.filter(s => {
            const st = String(s?.status || '').toLowerCase().trim();
            return !inactiveStatuses.includes(st);
        });
        window.filteredStudents = activeList.length > 0 ? activeList : [...baseStudents];
    }

    if (document.getElementById("hdrTotal")) document.getElementById("hdrTotal").innerText = baseStudents.length;
    if (document.getElementById("hdrActive")) document.getElementById("hdrActive").innerText = window.filteredStudents.length;

    window.renderStudentsTable();
};

window.renderStudentsTable = function() {
    const tbody = document.getElementById("studentsTableBody");
    if(!tbody) return;

    if (window.filteredStudents.length === 0) {
        const hasBaseData = (window.allStudents && window.allStudents.length > 0);
        tbody.innerHTML = hasBaseData ? `
            <tr>
                <td colspan="9" class="p-16 text-center">
                    <div class="inline-flex items-center justify-center w-16 h-16 bg-amber-50 text-amber-500 rounded-full text-3xl mb-3 shadow-inner"><i class="fa-solid fa-filter-circle-xmark"></i></div>
                    <h3 class="text-slate-700 font-bold text-base">រកមិនឃើញសិស្សតាមលក្ខខណ្ឌចម្រោះនេះទេ!</h3>
                    <p class="text-slate-400 text-xs mt-1">សូមសាកល្បងផ្លាស់ប្តូរពាក្យគន្លឹះ ឬសម្អាតតម្រងស្វែងរកឡើងវិញ</p>
                    <button type="button" onclick="if(typeof window.resetStudentFilters === 'function') window.resetStudentFilters();" class="mt-4 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-xs font-bold transition inline-flex items-center gap-2 shadow-sm">
                        <i class="fa-solid fa-arrow-rotate-left"></i> សម្អាតតម្រងទាំងអស់
                    </button>
                </td>
            </tr>` : `
            <tr>
                <td colspan="9" class="p-24 text-center">
                    <div class="inline-flex items-center justify-center w-20 h-20 bg-slate-50 rounded-full text-slate-300 text-4xl mb-4 shadow-inner"><i class="fa-solid fa-folder-open"></i></div>
                    <h3 class="text-slate-500 font-bold text-lg">មិនទាន់មានទិន្នន័យសិស្សនៅឡើយទេ!</h3>
                    <p class="text-slate-400 text-sm mt-1">សូមចុចប៊ូតុង "ចុះឈ្មោះថ្មី" ឬ "នាំចូលពី Excel" ឬចុច "ទាញទិន្នន័យថ្មី (Sync)"</p>
                </td>
            </tr>`;
        return;
    }

    const bgColors = ['bg-indigo-400', 'bg-emerald-400', 'bg-amber-400', 'bg-rose-400', 'bg-cyan-400', 'bg-purple-400'];
    const canEdit = typeof canEditRecords === 'function' ? canEditRecords() : true;

    let trs = "";
    window.filteredStudents.forEach((stu, index) => {
        let safeGender = String(stu.gender || "ប្រុស").trim();
        let isMale = safeGender !== 'ស្រី';
        let genBadge = isMale 
            ? `<span class="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[11px] font-bold border border-blue-100 shadow-sm whitespace-nowrap"><i class="fa-solid fa-mars mr-1"></i> ប្រុស</span>` 
            : `<span class="bg-pink-50 text-pink-600 px-3 py-1 rounded-full text-[11px] font-bold border border-pink-100 shadow-sm whitespace-nowrap"><i class="fa-solid fa-venus mr-1"></i> ស្រី</span>`;
        
        let avatarColor = bgColors[index % bgColors.length];
        let avatarContent = `<div class="w-10 h-10 rounded-[0.8rem] mx-auto flex items-center justify-center font-bold text-white text-sm ${avatarColor} shadow-sm border border-black/5 transform -rotate-3 transition duration-300 group-hover:rotate-0">${getAvatarInitial(stu.name)}</div>`;
        if (stu.photo_url && stu.photo_url.trim() !== "") {
            avatarContent = `<img src="${stu.photo_url}" class="w-10 h-10 rounded-[0.8rem] mx-auto object-cover shadow-sm border border-black/5 transform -rotate-3 transition duration-300 group-hover:rotate-0" alt="Photo">`;
        }

        let ageHtml = calculateAge(stu.dob) !== "-" ? `<span class="text-slate-400 text-[12px] ml-1 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 shadow-sm">${calculateAge(stu.dob)}ឆ្នាំ</span>` : "";
        let addrText = formatAddress(stu.curr_village, stu.curr_commune);
        let displayGrade = normalizeGrade(stu.grade);

        let statusTag = "";
        const sStat = String(stu.status || "Active").toLowerCase();
        if (sStat === "withdrawn" || sStat === "dropped" || sStat === "បោះបង់") {
            statusTag = `<span class="bg-rose-50 text-rose-600 px-2 py-0.5 rounded-md text-[10px] font-bold border border-rose-100 ml-1.5">ឈប់រៀន</span>`;
        } else if (sStat === "transferred" || sStat === "បានផ្ទេរចេញ") {
            statusTag = `<span class="bg-amber-50 text-amber-600 px-2 py-0.5 rounded-md text-[10px] font-bold border border-amber-100 ml-1.5">ផ្ទេរចេញ</span>`;
        } else if (sStat === "graduated" || sStat === "បានបញ្ចប់ការសិក្សា") {
            statusTag = `<span class="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md text-[10px] font-bold border border-indigo-100 ml-1.5">បញ្ចប់</span>`;
        } else if (sStat === "inactive" || sStat === "មិនសកម្ម") {
            statusTag = `<span class="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md text-[10px] font-bold border border-slate-200 ml-1.5">ផ្អាក</span>`;
        }

        trs += `
            <tr class="hover:bg-slate-50/80 transition-colors group font-bold">
                <td class="p-3 text-center text-slate-400 font-mono text-[12px]">${index + 1}</td>
                <td class="p-3 text-center">${avatarContent}</td>
                <td class="p-3 text-indigo-600 font-mono"><span class="bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-indigo-100/50">${window.escapeHtml(stu.id) || '-'}</span></td>
                <td class="p-3 text-slate-800 font-Siemreap text-[14px]">
                    <div class="flex items-center">${window.escapeHtml(stu.name) || '-'}${statusTag}</div>
                    ${stu.name_en ? `<div class="text-[11px] text-slate-400 font-mono tracking-wider font-normal uppercase">${window.escapeHtml(stu.name_en)}</div>` : ''}
                </td>
                <td class="p-3 text-center font-Siemreap text-[14px]">${genBadge}</td>
                <td class="p-3 text-center text-slate-600 font-Siemreap text-[14px] whitespace-nowrap">${formatDate(stu.dob)} ${ageHtml}</td>
                <td class="p-3 text-center text-slate-700">
                   <span class="border border-indigo-100 bg-indigo-50/70 px-3 py-1.5 rounded-xl text-[12px] shadow-sm text-indigo-900 font-moul whitespace-nowrap">${displayGrade || 'ថ្នាក់ទី ១'} ${window.escapeHtml(stu.room) || '«ក»'}</span> 
                </td>
                <td class="p-3 text-slate-500 text-[12px]"><i class="fa-solid fa-map-pin text-slate-300 mr-1.5"></i> ${window.escapeHtml(addrText)}</td>
                <td class="p-3 text-center no-print">
                    <div class="flex items-center justify-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button onclick="window.openReportCard ? window.openReportCard('${stu.id}') : alert('Report Card')" title="ព្រឹត្តិបត្រពិន្ទុបុគ្គល" class="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-amber-600 hover:bg-amber-100 transition"><i class="fa-solid fa-file-invoice text-xs"></i></button>
                        <button onclick="window.viewStudentProfile('${stu.id}')" title="ប្រវត្តិរូប" class="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-indigo-600 hover:bg-indigo-100 transition"><i class="fa-regular fa-eye text-xs"></i></button>
                        ${canEdit ? `
                        <button onclick="window.openTransferStudentModal('${stu.id}')" title="ផ្ទេរថ្នាក់ / ប្តូរបន្ទប់រៀន" class="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-blue-600 hover:bg-blue-100 transition"><i class="fa-solid fa-arrow-right-arrow-left text-xs"></i></button>
                        <button onclick="window.openStudentModal('${stu.id}')" title="កែប្រែ" class="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-emerald-600 hover:bg-emerald-100 transition"><i class="fa-regular fa-pen-to-square text-xs"></i></button>
                        <button onclick="window.deleteStudent('${stu.id}')" title="លុប/ផ្អាក" class="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-rose-600 hover:bg-rose-100 transition"><i class="fa-regular fa-trash-can text-xs"></i></button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = trs;
};

// =========================================
// ៤. មុខងារបន្ថែម, កែប្រែ, លុប (CRUD Operations)
// =========================================
window.handleStudentPhotoUpload = function(inputEl) {
    const file = inputEl.files[0];
    if (!file) return;

    const previewImg = document.getElementById("stu_photo_preview");
    const iconPlaceholder = document.getElementById("stu_photo_icon_placeholder");
    
    if(previewImg) {
        previewImg.classList.add("opacity-50", "animate-pulse");
        previewImg.classList.remove("hidden");
    }
    if(iconPlaceholder) iconPlaceholder.classList.add("hidden");

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement("canvas");
            const MAX_WIDTH = 150; 
            let width = img.width;
            let height = img.height;
            if (width > MAX_WIDTH) { height = Math.round((height * MAX_WIDTH) / width); width = MAX_WIDTH; }
            canvas.width = width; canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7); 

            if(previewImg) {
                previewImg.src = compressedBase64;
                previewImg.classList.remove("opacity-50", "animate-pulse");
            }
            document.getElementById("stu_photo_val").value = compressedBase64; 
        }
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
};

window.clearStudentForm = function() {
    if (confirm("តើលោកគ្រូអ្នកគ្រូពិតជាចង់សម្អាតទិន្នន័យដែលកំពុងវាយបញ្ចូលនេះមែនទេ?")) {
        document.getElementById("studentForm").reset();
        document.getElementById("stu_photo_val").value = "";
    const stuBanner = document.getElementById("stuModalErrorBanner");
    if (stuBanner) { stuBanner.classList.add("hidden"); stuBanner.innerHTML = ""; }
        const previewImg = document.getElementById("stu_photo_preview");
        if(previewImg) { previewImg.src = ""; previewImg.classList.add("hidden"); }
        const iconPlaceholder = document.getElementById("stu_photo_icon_placeholder");
        if (iconPlaceholder) iconPlaceholder.classList.remove("hidden");
        if (document.getElementById("stu_is_edit").value === "0") {
            document.getElementById("stu_id").value = "STU" + Math.floor(Math.random() * 900000 + 100000);
        }
    }
};

window.openStudentModal = function(id = null) {
    const modal = document.getElementById("studentModal");
    if(!modal) return;
    
    document.getElementById("studentForm").reset();
    document.getElementById("stu_photo_val").value = "";
    
    const previewImg = document.getElementById("stu_photo_preview");
    const iconPlaceholder = document.getElementById("stu_photo_icon_placeholder");
    if(previewImg) { previewImg.src = ""; previewImg.classList.add("hidden"); }
    if(iconPlaceholder) iconPlaceholder.classList.remove("hidden");

    // 🟢 ថាមវន្ត៖ ទាញយកថ្នាក់ និងបន្ទប់ ពី Settings 🟢
    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const defaultGrade = sInfo.teacher_level || "ថ្នាក់ទី ១";
    const defaultRoom = sInfo.teacher_room || "«ក»";

    if (id) {
        const stu = window.allStudents.find(s => String(s.id) === String(id));
        if(stu) {
            document.getElementById("stu_is_edit").value = "1";
            document.getElementById("stu_id").value = stu.id;
            document.getElementById("stu_id").readOnly = true;
            document.getElementById("stu_id").classList.add("bg-slate-100", "text-slate-500", "cursor-not-allowed");
            
            document.getElementById("stu_name").value = stu.name || "";
            if (document.getElementById("stu_name_en")) document.getElementById("stu_name_en").value = stu.name_en || stu.name_latin || "";
            document.getElementById("stu_gender").value = stu.gender || "ប្រុស";
            document.getElementById("stu_dob").value = (formatDate(stu.dob, "YYYY-MM-DD") !== "-") ? formatDate(stu.dob, "YYYY-MM-DD") : (stu.dob || ""); 
            if (document.getElementById("stu_enrollment_date")) document.getElementById("stu_enrollment_date").value = (formatDate(stu.enrollment_date, "YYYY-MM-DD") !== "-") ? formatDate(stu.enrollment_date, "YYYY-MM-DD") : (stu.enrollment_date || "");
            
            if (stu.photo_url && stu.photo_url.trim() !== "") {
                if(previewImg) { previewImg.src = stu.photo_url; previewImg.classList.remove("hidden"); }
                if(iconPlaceholder) iconPlaceholder.classList.add("hidden");
                document.getElementById("stu_photo_val").value = stu.photo_url;
            }

            document.getElementById("stu_pob_village").value = stu.pob_village || "";
            document.getElementById("stu_pob_commune").value = stu.pob_commune || "";
            document.getElementById("stu_pob_district").value = stu.pob_district || "";
            document.getElementById("stu_pob_province").value = stu.pob_province || "";

            document.getElementById("stu_curr_village").value = stu.curr_village || "";
            document.getElementById("stu_curr_commune").value = stu.curr_commune || "";
            document.getElementById("stu_curr_district").value = stu.curr_district || "";
            document.getElementById("stu_curr_province").value = stu.curr_province || "";

            document.getElementById("stu_father_name").value = stu.father_name || "";
            document.getElementById("stu_father_job").value = stu.father_job || "";
            document.getElementById("stu_mother_name").value = stu.mother_name || "";
            document.getElementById("stu_mother_job").value = stu.mother_job || "";
            
            document.getElementById("stu_grade").value = normalizeGrade(stu.grade);
            const normRoom = (stu.room && !stu.room.startsWith("«")) ? `«${stu.room}»` : (stu.room || "«ក»");
            document.getElementById("stu_room").value = normRoom;
            if (document.getElementById("stu_academic_year")) {
                document.getElementById("stu_academic_year").value = stu.academic_year || document.getElementById("globalAcademicYear")?.value || "2026-2027";
            }
            document.getElementById("stu_contact").value = stu.parent_contact || "";
            document.getElementById("stu_status").value = stu.status || "Active";
            
            document.getElementById("stu_poor").checked = !!stu.poor_id;
            document.getElementById("stu_scholar").checked = !!stu.scholarship;
            document.getElementById("stu_disable").checked = !!stu.disability;

            document.getElementById("stuModalTitle").innerHTML = `<div class="w-10 h-10 rounded-2xl bg-amber-50 text-amber-500 flex justify-center items-center text-lg shadow-sm border border-amber-100"><i class="fa-solid fa-user-pen"></i></div> កែប្រែព័ត៌មានសិស្ស`;
        }
    } else {
        document.getElementById("stu_is_edit").value = "0";
        document.getElementById("stu_id").value = "STU" + Math.floor(Math.random() * 900000 + 100000); 
        document.getElementById("stu_id").readOnly = false;
        document.getElementById("stu_id").classList.remove("bg-slate-100", "text-slate-500", "cursor-not-allowed");
        if (document.getElementById("stu_name_en")) document.getElementById("stu_name_en").value = "";
        if (document.getElementById("stu_enrollment_date")) document.getElementById("stu_enrollment_date").value = new Date().toISOString().split('T')[0];
        
        // 🟢 កំណត់តម្លៃលំនាំដើមពី Settings 🟢
        document.getElementById("stu_grade").value = defaultGrade;
        document.getElementById("stu_room").value = defaultRoom;
        if (document.getElementById("stu_academic_year")) {
            document.getElementById("stu_academic_year").value = document.getElementById("globalAcademicYear")?.value || localStorage.getItem('selected_academic_year') || "2026-2027";
        }

        document.getElementById("stuModalTitle").innerHTML = `<div class="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex justify-center items-center text-lg shadow-sm border border-indigo-100"><i class="fa-solid fa-user-plus"></i></div> ចុះឈ្មោះសិស្សថ្មី`;
    }
    modal.classList.remove("hidden");
    modal.classList.add("flex");
};

window.saveStudentData = async function(e) {
    e.preventDefault();

    const btn = document.getElementById("btnSaveStudent");
    const origText = btn.innerHTML;

    const isEdit = document.getElementById("stu_is_edit").value === "1";
    const studentGrade = normalizeGrade(document.getElementById("stu_grade").value);
    const studentRoom = document.getElementById("stu_room").value.trim();

    // ត្រួតពិនិត្យសិទ្ធិនៅកម្រិត Backend/Data Guard (Chapter 2)
    if (window.DataServiceGuard) {
        try {
            window.DataServiceGuard.assertCan(
                isEdit ? 'edit_student' : 'create_student', 
                { grade: studentGrade, room: studentRoom },
                `⚠️ សិទ្ធិត្រូវបានបដិសេធ៖ លោកគ្រូអ្នកគ្រូមិនមានសិទ្ធិចុះឈ្មោះ ឬកែប្រែសិស្សក្រៅពីថ្នាក់ទទួលខុសត្រូវ (${studentGrade} ${studentRoom}) ឡើយ!`
            );
        } catch(guardErr) {
            alert(guardErr.message);
            return;
        }
    } else if (typeof canEditRecords === 'function' && !canEditRecords()) {
        alert("🔒 លោកគ្រូអ្នកគ្រូមានត្រឹមសិទ្ធិមើលប៉ុណ្ណោះ (Viewer) មិនអាចកែប្រែទិន្នន័យបានទេ!");
        return;
    }

    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> កំពុងរក្សាទុក...`;
    btn.disabled = true;

    const currentTeacherId = window.AuthState ? window.AuthState.teacherId : localStorage.getItem('auth_teacher_id');
    const currentYear = document.getElementById("globalAcademicYear")?.value || localStorage.getItem('selected_academic_year') || "2026-2027";

    const studentId = document.getElementById("stu_id").value.trim();
    const studentName = document.getElementById("stu_name").value.trim();
    const studentDob = document.getElementById("stu_dob").value;

    // 🟢 STU-02 & ACAD-05: ផ្ទៀងផ្ទាត់ការចុះឈ្មោះស្ទួន (Unique Student ID & Duplicate Class Validation) 🟢
    if (!isEdit) {
        const idExists = (window.allStudents || []).some(s => 
            String(s.id).trim().toLowerCase() === studentId.toLowerCase() && 
            String(s.academic_year || currentYear) === String(currentYear)
        );
        if (idExists) {
            alert(`⚠️ អត្តលេខសិស្ស «${studentId}» នេះមានរួចហើយក្នុងប្រព័ន្ធសម្រាប់ឆ្នាំសិក្សា ${currentYear}!\nសូមពិនិត្យ ឬផ្លាស់ប្តូរអត្តលេខថ្មី។`);
            btn.innerHTML = origText;
            btn.disabled = false;
            return;
        }

        const dupInClass = (window.allStudents || []).some(s => 
            String(s.name || '').trim().toLowerCase() === studentName.toLowerCase() &&
            String(s.dob || '').trim() === studentDob.trim() &&
            normalizeGrade(s.grade) === studentGrade &&
            String(s.room || '').trim() === studentRoom &&
            String(s.academic_year || currentYear) === String(currentYear)
        );
        if (dupInClass) {
            if (!confirm(`⚠️ សិស្សឈ្មោះ «${studentName}» (ថ្ងៃខែឆ្នាំកំណើត: ${studentDob}) ហាក់បីដូចជាមានឈ្មោះក្នុងថ្នាក់ ${studentGrade} ${studentRoom} សម្រាប់ឆ្នាំ ${currentYear} រួចហើយ!\n\nតើលោកគ្រូ/អ្នកគ្រូពិតជាចង់បន្តចុះឈ្មោះស្ទួនទៀតដែរឬទេ?`)) {
                btn.innerHTML = origText;
                btn.disabled = false;
                return;
            }
        }
    }

    const schoolId = window.AuthState?.school_id || localStorage.getItem('school_id') || 'SCH-001';
    const oldStudent = isEdit ? (window.allStudents || []).find(s => String(s.id) === studentId) : null;
    
    // 🟢 ACAD-05: រៀបចំប្រវត្តិការសិក្សា និងការផ្ទេរថ្នាក់ (Enrollment & Transfer History) 🟢
    let enrollmentHist = [];
    if (isEdit && oldStudent) {
        enrollmentHist = Array.isArray(oldStudent.enrollment_history) ? [...oldStudent.enrollment_history] : [{
            grade: normalizeGrade(oldStudent.grade),
            room: oldStudent.room || '«ក»',
            academic_year: oldStudent.academic_year || currentYear,
            date: oldStudent.enrollment_date || new Date().toISOString().split('T')[0],
            status: oldStudent.status || 'Active',
            reason: 'ចុះឈ្មោះចូលរៀនដំបូង',
            type: 'initial_enrollment',
            created_at: oldStudent.created_at || new Date().toISOString()
        }];

        if (normalizeGrade(oldStudent.grade) !== studentGrade || String(oldStudent.room || '').trim() !== studentRoom) {
            enrollmentHist.push({
                from_grade: normalizeGrade(oldStudent.grade),
                from_room: oldStudent.room || '',
                grade: studentGrade,
                room: studentRoom,
                academic_year: currentYear,
                date: new Date().toISOString().split('T')[0],
                status: document.getElementById("stu_status").value || "Active",
                reason: "កែប្រែថ្នាក់/បន្ទប់ក្នុងទម្រង់កែប្រែសិស្ស",
                type: "edit_transfer",
                transferred_by: window.AuthState?.teacherName || localStorage.getItem('auth_teacher_name') || 'Admin',
                created_at: new Date().toISOString()
            });
        }
    } else {
        enrollmentHist = [{
            grade: studentGrade,
            room: studentRoom,
            academic_year: currentYear,
            date: document.getElementById("stu_enrollment_date")?.value || new Date().toISOString().split('T')[0],
            status: document.getElementById("stu_status").value || "Active",
            reason: "ចុះឈ្មោះចូលរៀនដំបូង",
            type: "initial_enrollment",
            created_at: new Date().toISOString()
        }];
    }

    const payload = {
        id: studentId,
        school_id: schoolId,               // 🟢 Data Isolation (Chapter 4 & 6)
        teacher_id: currentTeacherId,       // 🟢 ចងភ្ជាប់ទិន្នន័យ
        academic_year: document.getElementById("stu_academic_year")?.value || currentYear,         // 🟢 ចងភ្ជាប់ទិន្នន័យ
        name: studentName,
        name_en: (document.getElementById("stu_name_en")?.value || "").trim().toUpperCase(),
        gender: document.getElementById("stu_gender").value,
        dob: studentDob, 
        enrollment_date: document.getElementById("stu_enrollment_date")?.value || "",
        photo_url: document.getElementById("stu_photo_val").value,
        pob_village: document.getElementById("stu_pob_village").value.trim(),
        pob_commune: document.getElementById("stu_pob_commune").value.trim(),
        pob_district: document.getElementById("stu_pob_district").value.trim(),
        pob_province: document.getElementById("stu_pob_province").value.trim(),
        curr_village: document.getElementById("stu_curr_village").value.trim(),
        curr_commune: document.getElementById("stu_curr_commune").value.trim(),
        curr_district: document.getElementById("stu_curr_district").value.trim(),
        curr_province: document.getElementById("stu_curr_province").value.trim(),
        father_name: document.getElementById("stu_father_name").value.trim(),
        father_job: document.getElementById("stu_father_job").value.trim(),
        mother_name: document.getElementById("stu_mother_name").value.trim(),
        mother_job: document.getElementById("stu_mother_job").value.trim(),
        grade: studentGrade,
        room: studentRoom,
        parent_contact: document.getElementById("stu_contact").value.trim(),
        status: document.getElementById("stu_status").value || "Active",
        poor_id: document.getElementById("stu_poor").checked,
        scholarship: document.getElementById("stu_scholar").checked,
        disability: document.getElementById("stu_disable").checked,
        enrollment_history: enrollmentHist, // 🟢 ACAD-05
        updated_at: new Date().toISOString()
    };

    // Schema validation using CMSValidator
    const stuBanner = document.getElementById("stuModalErrorBanner");
    if (stuBanner) { stuBanner.classList.add("hidden"); stuBanner.innerHTML = ""; }

    if (window.CMSValidator && typeof window.CMSValidator.validateStudent === 'function') {
        const vRes = window.CMSValidator.validateStudent(payload, isEdit, window.allStudents);
        if (!vRes.isValid) {
            if (stuBanner) {
                stuBanner.innerHTML = `
                    <div class="flex items-center gap-2 font-bold mb-1.5 text-sm text-rose-800">
                        <i class="fa-solid fa-triangle-exclamation text-base"></i> សូមពិនិត្យ និងបំពេញព័ត៌មានដែលខ្វះ៖
                    </div>
                    <ul class="list-disc list-inside space-y-0.5 text-xs text-rose-700 pl-1 font-semibold">
                        ${vRes.errors.map(err => `<li>${window.escapeHtml ? window.escapeHtml(err) : err}</li>`).join('')}
                    </ul>
                `;
                stuBanner.classList.remove("hidden");
                stuBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                alert("❌ ព័ត៌មានសិស្សមិនត្រឹមត្រូវ:\n\n• " + vRes.errors.join("\n• "));
            }
            btn.innerHTML = origText;
            btn.disabled = false;
            return;
        }
    }

    // Backend duplicate verification on Firestore if available
    if (!isEdit && window.db) {
        try {
            const snapDup = await window.db.collection("students")
                .where("school_id", "==", schoolId)
                .where("academic_year", "==", currentYear)
                .where("id", "==", payload.id)
                .limit(1)
                .get();
            if (!snapDup.empty) {
                alert(`⚠️ អត្តលេខសិស្ស «${payload.id}» នេះមានរួចហើយនៅលើ Cloud សម្រាប់ឆ្នាំសិក្សា ${currentYear}!\nសូមពិនិត្យ ឬផ្លាស់ប្តូរអត្តលេខថ្មី។`);
                btn.innerHTML = origText;
                btn.disabled = false;
                return;
            }
        } catch(dupErr) {
            console.warn("Firestore duplicate check note:", dupErr);
        }
    }

    // ⚡ ១. INSTANT OPTIMISTIC IN-MEMORY & LOCAL STORAGE UPDATE (0ms Latency)
    let localSaved = false;
    try {
        if (isEdit) {
            const idx = window.allStudents.findIndex(s => String(s.id) === payload.id);
            if (idx > -1) window.allStudents[idx] = payload;
            else window.allStudents.push(payload);
        } else {
            window.allStudents.unshift(payload);
        }

        if (typeof window.setMasterStudents === 'function') {
            window.setMasterStudents(window.allStudents);
        } else {
            localStorage.setItem('academic_students', JSON.stringify(window.allStudents));
        }
        localSaved = true;
    } catch(storageErr) {
        console.warn("Storage quota error on student save:", storageErr);
    }

    // ⚡ ២. UPDATE UI IMMEDIATELY & CLOSE MODAL (Instantaneous Visual Feedback)
    window.filterStudents();
    const modalEl = document.getElementById("studentModal");
    if (modalEl) modalEl.classList.replace("flex", "hidden");
    if (typeof showToast === 'function') {
        showToast(`⚡ បានកត់ត្រាសិស្ស «${payload.name}» ភ្លាមៗ! កំពុង Sync ទៅ Cloud...`, "info");
    }

    // ៣. CLOUD & GOOGLE SHEET SYNC IN BACKGROUND
    let cloudSaved = false;
    let gasSaved = false;

    // Firebase Firestore write
    if (window.db && typeof window.saveStudentToFirebase === 'function') {
        try {
            await window.saveStudentToFirebase(payload);
            cloudSaved = true;
        } catch(fsErr) {
            console.warn("Firestore saveStudent error:", fsErr);
        }
    }

    // Google Apps Script API (Save/Edit to Google Sheets)
    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    if (typeof window.apiPost === 'function') {
        try {
            const res = await window.apiPost("saveStudent", payload);
            if (res && res.status === "success") gasSaved = true;
        } catch(gasErr) {
            console.warn("GAS saveStudent error:", gasErr);
        }
    }

    if (cloudSaved || gasSaved) {
        if (typeof showToast === 'function') showToast("✅ រក្សាទុកព័ត៌មានសិស្សទៅកាន់ Cloud/Server បានជោគជ័យ!");
    } else if (localSaved) {
        if (typeof showToast === 'function') showToast("⚠️ បានរក្សាទុកក្នុងម៉ាស៊ីន (Offline - Pending Sync)! Cloud មិនទាន់ទទួលបានទិន្នន័យនៅឡើយទេ។", "warning");
    } else {
        alert("❌ បរាជ័យក្នុងការរក្សាទុកព័ត៌មានសិស្ស!");
    }

    if (typeof window.logAudit === 'function' && (cloudSaved || gasSaved || localSaved)) {
        window.logAudit(
            isEdit ? 'UPDATE_STUDENT' : 'CREATE_STUDENT', 
            'student', 
            `បាន${isEdit ? 'កែប្រែ' : 'ចុះឈ្មោះ'}សិស្ស ${payload.name} (${payload.id}) ថ្នាក់ ${payload.grade} ${payload.room} | Cloud: ${cloudSaved ? 'Yes' : 'No'}`
        );
    }

    // 📡 ៤. Emit System Event to Central EventBus (Dynamic Architecture)
    if (window.CMSEventBus && window.CMSEventTypes) {
        window.CMSEventBus.emit(window.CMSEventTypes.STUDENT_ENROLLED, {
            student_id: payload.id,
            student_name: payload.name,
            grade: payload.grade,
            room: payload.room,
            academic_year: payload.academic_year || localStorage.getItem('selected_academic_year') || '2026-2027',
            is_edit: isEdit
        });
    }

    btn.innerHTML = origText;
    btn.disabled = false; 
};

// 🟢 STU-04: ការលុបទិន្នន័យ Soft Delete (ផ្អាក/ឈប់រៀន) និង Hard Delete (Admin) 🟢
window.deleteStudent = async function(id) {
    const stu = (window.allStudents || []).find(s => String(s.id) === String(id));
    if (!stu) return;

    // ត្រួតពិនិត្យសិទ្ធិនៅកម្រិត Data Guard (Chapter 2)
    if (window.DataServiceGuard) {
        try {
            window.DataServiceGuard.assertCan(
                'edit_student', 
                { grade: stu.grade, room: stu.room },
                "🔒 លោកគ្រូអ្នកគ្រូមានត្រឹមសិទ្ធិមើលប៉ុណ្ណោះ (Viewer) មិនអាចកែប្រែ ឬលុបទិន្នន័យបានទេ!"
            );
        } catch(guardErr) {
            alert(guardErr.message);
            return;
        }
    } else if (typeof canEditRecords === 'function' && !canEditRecords()) {
        alert("🔒 លោកគ្រូអ្នកគ្រូមានត្រឹមសិទ្ធិមើលប៉ុណ្ណោះ មិនអាចលុបទិន្នន័យបានទេ!");
        return;
    }

    const gradeRoomStr = [normalizeGrade(stu.grade), stu.room].filter(Boolean).join(" ");
    const confirmDelete = confirm(`⚠️ បញ្ជាក់ការលុបទិន្នន័យសិស្ស៖\n\n• ឈ្មោះ៖ ${stu.name}\n• អត្តលេខ៖ ${stu.id}\n• ថ្នាក់៖ ${gradeRoomStr || 'មិនទាន់កំណត់'}\n\nតើលោកគ្រូ/អ្នកគ្រូពិតជាចង់លុបទិន្នន័យសិស្ស «${stu.name}» (ID: ${stu.id}) ចេញពីប្រព័ន្ធ និង Google Sheets មែនទេ?\n⚠️ សកម្មភាពនេះនឹងលុបជួរដេកសិស្សចេញពី Google Sheets ដោយផ្ទាល់!`);
    
    if (!confirmDelete) return;

    // ១. លុបចេញពី Memory & LocalStorage
    window.allStudents = (window.allStudents || []).filter(s => String(s.id) !== String(id));
    if (typeof window.setMasterStudents === 'function') {
        window.setMasterStudents(window.allStudents);
    } else {
        localStorage.setItem('academic_students', JSON.stringify(window.allStudents));
    }

    // ២. លុបចេញពី Cloud Firestore (ប្រសិនបើបានភ្ជាប់)
    if (window.db) {
        window.db.collection("students").doc(String(id)).delete().catch(console.warn);
    }

    // ៣. លុបចេញពី Google Sheets តាមរយៈ GAS REST API (Hard Delete)
    let gasDeleted = false;
    if (typeof window.apiPost === 'function') {
        try {
            const res = await window.apiPost("deleteStudent", { id: id, hard_delete: true });
            if (res && res.status === "success") gasDeleted = true;
        } catch(gasErr) {
            console.warn("GAS deleteStudent error:", gasErr);
        }
    }

    if (typeof window.logAudit === 'function') {
        window.logAudit('HARD_DELETE_STUDENT', 'student', `បានលុបសិស្ស ${stu.name} (${id}) ចេញពីប្រព័ន្ធ និង Google Sheets`);
    }

    if (window.CMSEventBus && window.CMSEventTypes) {
        window.CMSEventBus.emit(window.CMSEventTypes.STUDENT_WITHDRAWN, {
            student_id: stu.id,
            student_name: stu.name,
            grade: stu.grade,
            room: stu.room,
            status: 'Deleted'
        });
    }

    window.filterStudents();
    const msg = gasDeleted 
        ? `🗑️ បានលុបសិស្ស «${stu.name}» ចេញពីប្រព័ន្ធ និង Google Sheets រួចរាល់!` 
        : `🗑️ បានលុបសិស្ស «${stu.name}» ចេញពីប្រព័ន្ធជោគជ័យ!`;
    if (typeof showToast === 'function') {
        showToast(msg);
    } else {
        alert(msg);
    }
};

window.syncStudentsToCloud = async function(btnEl) {
    if (typeof window.apiPost !== 'function') return alert("❌ មុខងារតភ្ជាប់ API មិនទាន់ដំណើរការទេ!");
    if (window.allStudents.length === 0) return alert("⚠️ មិនមានទិន្នន័យសិស្សសម្រាប់រក្សាទុកទេ!");

    let origText = "";
    if (btnEl) { origText = btnEl.innerHTML; btnEl.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> កំពុងបញ្ជូន...`; btnEl.disabled = true; }

    try {
        const res = await window.apiPost("saveStudentsBatch", window.allStudents);
        if (res && res.status === "success") {
            if (typeof showToast === 'function') showToast("✅ ទិន្នន័យសិស្សត្រូវបានរក្សាទុកចូល Cloud ជោគជ័យ!");
            else alert("✅ ទិន្នន័យសិស្សត្រូវបានរក្សាទុកចូល Cloud ជោគជ័យ!");
        } else { throw new Error(res.message || "Unknown error"); }
    } catch (error) {
        console.error("Cloud Sync Error:", error); alert("❌ បរាជ័យក្នុងការតភ្ជាប់ទៅ Cloud! សូមពិនិត្យមើលអ៊ីនធឺណិត។");
    } finally {
        if (btnEl) { btnEl.innerHTML = origText; btnEl.disabled = false; }
    }
};

// ==========================================
// ៥. មុខងារមើលប្រវត្តិរូបសិស្ស (View Profile - Fixed Alert & Modal)
// ==========================================
window.viewStudentProfile = function(id) {
    try {
        const modal = document.getElementById("studentProfileModal");
        const stu = window.allStudents.find(s => String(s.id) === String(id));
        
        if (!modal) {
            alert("⚠️ រកមិនឃើញផ្ទាំង Modal ប្រវត្តិរូបសិស្ស (studentProfileModal) ក្នុងប្រព័ន្ធទេ!");
            return;
        }
        
        if (!stu) {
            alert("សូមអភ័យទោស រកមិនឃើញទិន្នន័យសិស្សនេះទេ!");
            return;
        }

        if (stu.photo_url && stu.photo_url.trim() !== "") {
            document.getElementById("profAvatar").innerHTML = `<img src="${stu.photo_url}" class="w-full h-full object-cover">`;
        } else {
            document.getElementById("profAvatar").innerHTML = `<span class="flex items-center justify-center w-full h-full bg-slate-100 text-slate-400 font-bold">${getAvatarInitial(stu.name)}</span>`;
        }
        
        document.getElementById("profName").innerHTML = (stu.name || "-") + (stu.name_en ? `<span class="block text-sm font-normal font-mono text-slate-500 mt-1 tracking-wider uppercase">${stu.name_en}</span>` : "");
        document.getElementById("profId").textContent = "ID: " + (stu.id || "-");
        document.getElementById("profGender").innerHTML = stu.gender === 'ស្រី' ? '<span class="text-pink-600 font-bold">ស្រី</span>' : '<span class="text-blue-600 font-bold">ប្រុស</span>';
        
        let dobStr = formatDate(stu.dob);
        let age = calculateAge(stu.dob);
        document.getElementById("profDob").textContent = `${dobStr} ${age !== "-" ? `(${age}ឆ្នាំ)` : ''}`;
        
        document.getElementById("profGrade").innerHTML = `${normalizeGrade(stu.grade)} <span class="text-rose-500 ml-1 font-moul">${stu.room || ''}</span>`;
        
        let fatherStr = stu.father_name ? `${stu.father_name} <span class="text-[10px] text-slate-500 font-normal">(${stu.father_job || 'មិនបញ្ជាក់'})</span>` : '-';
        let motherStr = stu.mother_name ? `${stu.mother_name} <span class="text-[10px] text-slate-500 font-normal">(${stu.mother_job || 'មិនបញ្ជាក់'})</span>` : '-';
        document.getElementById("profParents").innerHTML = `${fatherStr}<br>${motherStr}`;
        document.getElementById("profContact").textContent = stu.parent_contact || 'មិនមានទិន្នន័យ';
        
        let addressArr = [];
        if(stu.curr_village) addressArr.push(`ភូមិ${stu.curr_village}`);
        if(stu.curr_commune) addressArr.push(`ឃុំ${stu.curr_commune}`);
        if(stu.curr_district) addressArr.push(`ស្រុក${stu.curr_district}`);
        if(stu.curr_province) addressArr.push(`ខេត្ត${stu.curr_province}`);
        document.getElementById("profAddress").textContent = addressArr.length > 0 ? addressArr.join(" ") : 'មិនមានទិន្នន័យ';

        let badges = [];
        const statusEl = document.getElementById("profStatusText");
        
        const rawStatus = String(stu.status || "Active").trim();
        if (rawStatus === "Active" || rawStatus === "កំពុងសិក្សា") {
            statusEl.textContent = "កំពុងសិក្សា (Active)"; 
            statusEl.className = "text-[13px] md:text-sm font-bold text-emerald-600";
        } else if (rawStatus === "Transferred" || rawStatus === "ផ្ទេរចេញ") {
            statusEl.textContent = "បានផ្ទេរចេញ (Transferred)"; 
            statusEl.className = "text-[13px] md:text-sm font-bold text-amber-600";
            badges.push(`<span class="bg-amber-50 text-amber-600 px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-sm border border-amber-100"><i class="fa-solid fa-arrow-right-from-bracket mr-1"></i> បានផ្ទេរចេញ</span>`);
        } else if (rawStatus === "Graduated" || rawStatus === "បញ្ចប់ការសិក្សា") {
            statusEl.textContent = "បានបញ្ចប់ការសិក្សា (Graduated)"; 
            statusEl.className = "text-[13px] md:text-sm font-bold text-indigo-600";
            badges.push(`<span class="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-sm border border-indigo-100"><i class="fa-solid fa-user-graduate mr-1"></i> បញ្ចប់ការសិក្សា</span>`);
        } else if (rawStatus === "Inactive" || rawStatus === "មិនសកម្ម") {
            statusEl.textContent = "មិនសកម្ម / ផ្អាក (Inactive)"; 
            statusEl.className = "text-[13px] md:text-sm font-bold text-slate-500";
            badges.push(`<span class="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-sm border border-slate-200"><i class="fa-solid fa-pause mr-1"></i> មិនសកម្ម (ផ្អាក)</span>`);
        } else {
            statusEl.textContent = "បានឈប់រៀន (Withdrawn)"; 
            statusEl.className = "text-[13px] md:text-sm font-bold text-rose-500";
            badges.push(`<span class="bg-rose-50 text-rose-600 px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-sm border border-rose-100"><i class="fa-solid fa-ban mr-1"></i> បានឈប់រៀន</span>`);
        }
        
        if (stu.poor_id) badges.push(`<span class="bg-amber-50 text-amber-600 px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-sm border border-amber-100"><i class="fa-solid fa-star mr-1"></i> ប័ណ្ណក្រីក្រ</span>`);
        if (stu.scholarship) badges.push(`<span class="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-sm border border-indigo-100"><i class="fa-solid fa-award mr-1"></i> អាហារូបករណ៍</span>`);
        if (stu.disability) badges.push(`<span class="bg-orange-50 text-orange-600 px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-sm border border-orange-100"><i class="fa-solid fa-wheelchair mr-1"></i> ពិការភាព</span>`);
        
        document.getElementById("profBadges").innerHTML = badges.join("");

        // 🟢 ACAD-05 & STU-04: បង្ហាញប្រវត្តិការចុះឈ្មោះ និងការផ្ទេរថ្នាក់ (Enrollment & Transfer History Timeline) 🟢
        const timelineEl = document.getElementById("profEnrollmentTimeline");
        if (timelineEl) {
            const histList = Array.isArray(stu.enrollment_history) && stu.enrollment_history.length > 0
                ? [...stu.enrollment_history].reverse()
                : [{
                    grade: normalizeGrade(stu.grade),
                    room: stu.room || '«ក»',
                    academic_year: stu.academic_year || document.getElementById("globalAcademicYear")?.value || "2026-2027",
                    date: stu.enrollment_date || '-',
                    status: stu.status || 'Active',
                    reason: 'ចុះឈ្មោះចូលរៀនដំបូង',
                    type: 'initial_enrollment'
                }];

            timelineEl.innerHTML = histList.map((h) => {
                const isInit = h.type === 'initial_enrollment' || !h.from_grade;
                const badgeColor = isInit ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-blue-50 border-blue-200 text-blue-700';
                const icon = isInit ? 'fa-id-card' : 'fa-arrow-right-arrow-left';
                const actionTitle = isInit 
                    ? `ចុះឈ្មោះចូលរៀនដំបូង ថ្នាក់ ${h.grade} ${h.room || ''}`
                    : `ផ្ទេរពី ${h.from_grade || ''} ${h.from_room || ''} ➡️ ${h.grade} ${h.room || ''}`;

                return `
                    <div class="flex items-start gap-3 p-3 rounded-2xl bg-white border border-slate-100 shadow-sm">
                        <div class="w-8 h-8 rounded-xl ${badgeColor} border flex items-center justify-center text-xs shrink-0 mt-0.5">
                            <i class="fa-solid ${icon}"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex flex-wrap items-center justify-between gap-1">
                                <span class="font-bold text-xs text-slate-800">${actionTitle}</span>
                                <span class="text-[11px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">${formatDate(h.date)}</span>
                            </div>
                            <div class="text-[11px] text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                                <span>ឆ្នាំសិក្សា៖ <b class="text-slate-700">${h.academic_year || '-'}</b></span>
                                <span>• ស្ថានភាព៖ <b class="text-emerald-600">${h.status || 'Active'}</b></span>
                                ${h.reason ? `<span>• មូលហេតុ៖ <span class="italic text-slate-600">${h.reason}</span></span>` : ''}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
        modal.classList.remove("hidden"); 
        modal.classList.add("flex");
    } catch (error) { 
        console.error("View Profile Error:", error); 
        alert("មានបញ្ហាក្នុងការបង្ហាញប្រវត្តិរូបសិស្ស សូមព្យាយាមម្តងទៀត!"); 
    }
};

window.closeStudentProfileModal = function() {
    const modal = document.getElementById("studentProfileModal");
    if (modal) {
        modal.classList.add("hidden");
        modal.classList.remove("flex");
    }
};

window.printStudentProfileRecord = function() {
    const name = document.getElementById("profName")?.innerText || "សិស្ស";
    if (window.CMSPrintManager) {
        window.CMSPrintManager.print('studentProfilePrintArea', {
            paperSize: 'A4',
            orientation: 'portrait',
            scale: 90,
            title: `សលាកបត្របុគ្គល_${name}`
        });
    } else {
        window.print();
    }
};

// ==========================================
// ៦. មុខងារបង្កើត UI ទម្រង់ Modal (Render HTML & Profile Modal)
// ==========================================
window.renderStudentModalTemplate = function() {
    const mContainer = document.getElementById("stuModalContainer");
    if(!mContainer) return;

    let gradesOptions = "";
    for(let i=1; i<=12; i++) {
        const khGrade = toKhmerNum(i.toString());
        gradesOptions += `<option value="ថ្នាក់ទី ${khGrade}">ថ្នាក់ទី ${khGrade}</option>`;
    }

    mContainer.innerHTML = `
        <!-- ទម្រង់ចុះឈ្មោះ និងកែប្រែ -->
        <div id="studentModal" class="fixed inset-0 z-[6000] bg-slate-900/70 backdrop-blur-md hidden items-center justify-center p-2 md:p-6 fade-in font-siemreap overflow-y-auto custom-scrollbar">
            <div class="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] w-full max-w-5xl overflow-hidden border border-slate-100 flex flex-col my-auto transform transition-all max-h-[95vh]">
                
                <div class="px-6 md:px-10 py-5 border-b border-slate-100 bg-white/80 backdrop-blur-xl flex justify-between items-center shrink-0 sticky top-0 z-30">
                    <h3 id="stuModalTitle" class="font-moul text-lg md:text-xl text-slate-800 flex items-center gap-3"></h3>
                    <button type="button" onclick="document.getElementById('studentModal').classList.replace('flex','hidden')" class="w-10 h-10 bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 rounded-full flex items-center justify-center transition hover:scale-105"><i class="fa-solid fa-xmark text-lg"></i></button>
                </div>

                <div class="p-6 md:p-10 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50">
                    <form id="studentForm" onsubmit="window.saveStudentData(event)">
                        <input type="hidden" id="stu_is_edit" value="0">
                        <input type="hidden" id="stu_photo_val" value="">
                        
                        <!-- Inline Validation Error Banner (P0 UX/UI) -->
                        <div id="stuModalErrorBanner" class="hidden mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs shadow-sm"></div>
                        
                        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
                            <div class="col-span-1 lg:col-span-4 space-y-5 bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:border-indigo-300 transition duration-300">
                                <div class="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-blue-500"></div>
                                <h4 class="font-moul text-[13px] text-slate-800 border-b border-slate-100 pb-4 mb-5 flex items-center gap-3"><i class="fa-regular fa-address-card text-indigo-500 text-lg"></i> ១. ព័ត៌មានផ្ទាល់ខ្លួន</h4>
                                
                                <div class="flex flex-col items-center justify-center mb-6 pb-6 border-b border-slate-100">
                                    <div class="w-28 h-36 relative mb-3 cursor-pointer border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl flex items-center justify-center overflow-hidden bg-slate-50 transition-all shadow-inner hover:shadow-md transform hover:-translate-y-1" onclick="document.getElementById('stu_photo_file').click()">
                                        <img id="stu_photo_preview" src="" class="w-full h-full object-cover hidden" alt="Student Photo">
                                        <div id="stu_photo_icon_placeholder" class="text-slate-400 text-center flex flex-col items-center">
                                            <div class="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-2 text-indigo-400"><i class="fa-solid fa-camera"></i></div>
                                            <span class="text-[10px] font-bold tracking-wide">រូបថតសិស្ស</span>
                                        </div>
                                    </div>
                                    <input type="file" id="stu_photo_file" accept="image/png, image/jpeg" class="hidden" onchange="window.handleStudentPhotoUpload(this)">
                                </div>

                                <div><label class="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">អត្តលេខសិស្ស (ID) *</label><input type="text" id="stu_id" required class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold font-mono outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white transition text-indigo-700 shadow-inner"></div>
                                <div><label class="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">គោត្តនាម និងនាម (ខ្មែរ) *</label><input type="text" id="stu_name" required placeholder="ឧ. ហឿន មីនា" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold font-moul outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white transition shadow-inner"></div>
                                <div><label class="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">ឈ្មោះជាអក្សរឡាតាំង (English)</label><input type="text" id="stu_name_en" placeholder="ឧ. HOEUN MINEA" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold font-mono uppercase outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white transition shadow-inner"></div>
                                <div><label class="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">ភេទ *</label><select id="stu_gender" required class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white transition cursor-pointer shadow-inner"><option value="ប្រុស">ប្រុស</option><option value="ស្រី">ស្រី</option></select></div>
                                <div><label class="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">ថ្ងៃខែឆ្នាំកំណើត</label><input type="date" id="stu_dob" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold font-mono outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white transition cursor-pointer shadow-inner"></div>
                                <div><label class="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">ថ្ងៃចូលរៀន</label><input type="date" id="stu_enrollment_date" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold font-mono outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white transition cursor-pointer shadow-inner"></div>
                            </div>

                            <div class="col-span-1 lg:col-span-8 space-y-6">
                                <div class="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-300 transition duration-300">
                                    <div class="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-400 to-cyan-400"></div>
                                    <h4 class="font-moul text-[13px] text-slate-800 border-b border-slate-100 pb-4 mb-5 flex items-center gap-3"><i class="fa-solid fa-map-location-dot text-blue-500 text-lg"></i> ២. ទីកន្លែងកំណើត និងទីលំនៅ</h4>
                                    
                                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                                        <div><label class="text-[10px] font-bold text-slate-400 mb-1.5 block">ភូមិ (កំណើត)</label><input type="text" id="stu_pob_village" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition shadow-inner"></div>
                                        <div><label class="text-[10px] font-bold text-slate-400 mb-1.5 block">ឃុំ (កំណើត)</label><input type="text" id="stu_pob_commune" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition shadow-inner"></div>
                                        <div><label class="text-[10px] font-bold text-slate-400 mb-1.5 block">ស្រុក (កំណើត)</label><input type="text" id="stu_pob_district" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition shadow-inner"></div>
                                        <div><label class="text-[10px] font-bold text-slate-400 mb-1.5 block">ខេត្ត (កំណើត)</label><input type="text" id="stu_pob_province" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition shadow-inner"></div>
                                    </div>
                                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div><label class="text-[10px] font-bold text-blue-500 mb-1.5 block">ភូមិ (បច្ចុប្បន្ន)</label><input type="text" id="stu_curr_village" class="w-full bg-blue-50/50 border border-blue-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition shadow-inner"></div>
                                        <div><label class="text-[10px] font-bold text-blue-500 mb-1.5 block">ឃុំ (បច្ចុប្បន្ន)</label><input type="text" id="stu_curr_commune" class="w-full bg-blue-50/50 border border-blue-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition shadow-inner"></div>
                                        <div><label class="text-[10px] font-bold text-blue-500 mb-1.5 block">ស្រុក (បច្ចុប្បន្ន)</label><input type="text" id="stu_curr_district" class="w-full bg-blue-50/50 border border-blue-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition shadow-inner"></div>
                                        <div><label class="text-[10px] font-bold text-blue-500 mb-1.5 block">ខេត្ត (បច្ចុប្បន្ន)</label><input type="text" id="stu_curr_province" class="w-full bg-blue-50/50 border border-blue-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition shadow-inner"></div>
                                    </div>
                                </div>

                                <div class="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition duration-300">
                                    <div class="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 to-teal-400"></div>
                                    <h4 class="font-moul text-[13px] text-slate-800 border-b border-slate-100 pb-4 mb-5 flex items-center gap-3"><i class="fa-solid fa-people-roof text-emerald-500 text-lg"></i> ៣. អាណាព្យាបាល និងការសិក្សា</h4>
                                    
                                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                                        <div class="col-span-2 md:col-span-1"><label class="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">ឈ្មោះឪពុក</label><input type="text" id="stu_father_name" placeholder="ឈ្មោះឪពុក" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 focus:bg-white transition shadow-inner"></div>
                                        <div class="col-span-2 md:col-span-1"><label class="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">មុខរបរឪពុក</label><input type="text" id="stu_father_job" placeholder="មុខរបរ" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 focus:bg-white transition shadow-inner"></div>
                                        <div class="col-span-2 md:col-span-1"><label class="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">ឈ្មោះម្ដាយ</label><input type="text" id="stu_mother_name" placeholder="ឈ្មោះម្ដាយ" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 focus:bg-white transition shadow-inner"></div>
                                        <div class="col-span-2 md:col-span-1"><label class="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">មុខរបរម្ដាយ</label><input type="text" id="stu_mother_job" placeholder="មុខរបរ" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 focus:bg-white transition shadow-inner"></div>
                                    </div>
                                    
                                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                        <div><label class="block text-[10px] font-bold text-indigo-600 mb-1.5 uppercase tracking-wider">ថ្នាក់ទី *</label><select id="stu_grade" required class="w-full bg-indigo-50/50 border border-indigo-200 rounded-xl px-3 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 focus:bg-white transition cursor-pointer text-indigo-700 shadow-inner">${gradesOptions}</select></div>
                                        <div><label class="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">បន្ទប់រៀន *</label><select id="stu_room" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 focus:bg-white transition cursor-pointer text-indigo-700 shadow-inner"><option value="«ក»">«ក»</option><option value="«ខ»">«ខ»</option><option value="«គ»">«គ»</option><option value="«ឃ»">«ឃ»</option><option value="«ង»">«ង»</option></select></div>
                                        <div><label class="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">ឆ្នាំសិក្សា</label><select id="stu_academic_year" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 focus:bg-white transition cursor-pointer text-indigo-700 shadow-inner"><option value="2026-2027">២០២៦-២០២៧</option><option value="2025-2026">២០២៥-២០២៦</option><option value="2024-2025">២០២៤-២០២៥</option></select></div>
                                        <div><label class="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">ទូរស័ព្ទអាណាព្យាបាល</label><input type="text" id="stu_contact" placeholder="012 345 678" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-xs font-bold font-mono outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 focus:bg-white transition shadow-inner"></div>
                                        <div><label class="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">ស្ថានភាព</label><select id="stu_status" class="w-full bg-emerald-50/50 border border-emerald-200 rounded-xl px-3 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white transition cursor-pointer shadow-inner text-emerald-700">
                                            <option value="Active">កំពុងសិក្សា (Active)</option>
                                            <option value="Transferred">បានផ្ទេរចេញ (Transferred)</option>
                                            <option value="Graduated">បានបញ្ចប់ការសិក្សា (Graduated)</option>
                                            <option value="Inactive">មិនសកម្ម / ផ្អាក (Inactive)</option>
                                            <option value="Withdrawn">បានឈប់រៀន (Withdrawn)</option>
                                        </select></div>
                                    </div>
                                </div>
                                
                                <div class="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-[2rem] border border-amber-100 flex flex-col items-start gap-4 shadow-sm mt-6">
                                    <div class="text-[14px] font-moul text-amber-700 flex items-center gap-2 mb-2"><i class="fa-solid fa-star"></i> ស្ថានភាពពិសេស</div>
                                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                                        <!-- Card 1 -->
                                        <label class="relative cursor-pointer w-full">
                                            <input type="checkbox" id="stu_poor" class="peer sr-only check-card-input">
                                            <div class="check-card-content w-full p-4 bg-white border-2 border-slate-100 rounded-2xl transition duration-300 shadow-sm flex items-center gap-4 hover:border-indigo-200">
                                                <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 peer-checked:bg-indigo-100 transition"><i class="fa-solid fa-hand-holding-dollar text-lg check-icon opacity-50 transform scale-90 transition"></i></div>
                                                <span class="font-bold text-sm text-slate-700">មានប័ណ្ណក្រីក្រ</span>
                                            </div>
                                        </label>
                                        <!-- Card 2 -->
                                        <label class="relative cursor-pointer w-full">
                                            <input type="checkbox" id="stu_scholar" class="peer sr-only check-card-input">
                                            <div class="check-card-content w-full p-4 bg-white border-2 border-slate-100 rounded-2xl transition duration-300 shadow-sm flex items-center gap-4 hover:border-indigo-200">
                                                <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 peer-checked:bg-indigo-100 transition"><i class="fa-solid fa-award text-lg check-icon opacity-50 transform scale-90 transition"></i></div>
                                                <span class="font-bold text-sm text-slate-700">អាហារូបករណ៍</span>
                                            </div>
                                        </label>
                                        <!-- Card 3 -->
                                        <label class="relative cursor-pointer w-full">
                                            <input type="checkbox" id="stu_disable" class="peer sr-only check-card-input">
                                            <div class="check-card-content w-full p-4 bg-white border-2 border-slate-100 rounded-2xl transition duration-300 shadow-sm flex items-center gap-4 hover:border-indigo-200">
                                                <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 peer-checked:bg-indigo-100 transition"><i class="fa-solid fa-wheelchair text-lg check-icon opacity-50 transform scale-90 transition"></i></div>
                                                <span class="font-bold text-sm text-slate-700">ពិការភាព</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="flex flex-col-reverse md:flex-row justify-between items-center pt-6 mt-6 border-t border-slate-200 gap-4 sticky bottom-0 bg-slate-50/90 pb-4 backdrop-blur-md z-30">
                            <button type="button" onclick="window.clearStudentForm()" class="w-full md:w-auto px-6 py-3.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-rose-600 rounded-2xl text-[14px] font-bold transition flex justify-center items-center gap-2 shadow-sm"><i class="fa-solid fa-eraser"></i> សម្អាត</button>
                            <div class="flex gap-3 w-full md:w-auto">
                                <button type="button" onclick="document.getElementById('studentModal').classList.replace('flex','hidden')" class="flex-1 md:flex-none px-6 py-3.5 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-2xl text-[14px] font-bold transition">បោះបង់</button>
                                <button type="submit" id="btnSaveStudent" class="flex-[2] md:flex-none px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-2xl text-[14px] font-bold shadow-xl shadow-indigo-200 transition transform hover:-translate-y-1 flex justify-center items-center gap-2"><i class="fa-solid fa-floppy-disk"></i> រក្សាទុកព័ត៌មាន</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- 🟢 ផ្ទាំង Modal សលាកបត្របុគ្គល / ប្រវត្តិរូបសិស្ស (Student Cumulative Record Modal HTML) 🟢 -->
        <div id="studentProfileModal" class="fixed inset-0 z-[7000] bg-slate-900/80 backdrop-blur-md hidden items-start sm:items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto custom-scrollbar" onclick="if(event.target===this) window.closeStudentProfileModal()">
            <div class="bg-white dark:bg-slate-800 rounded-3xl md:rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-100 dark:border-slate-700 flex flex-col my-2 sm:my-auto max-h-[92vh] relative">
                
                <!-- Sticky Top Header Bar (Always Visible Close & Print Controls) -->
                <div class="sticky top-0 z-40 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md px-6 py-3.5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center shrink-0">
                    <div class="flex items-center gap-2.5">
                        <div class="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm shadow-sm"><i class="fa-solid fa-address-card"></i></div>
                        <div>
                            <h3 class="font-moul text-sm sm:text-base text-slate-800 dark:text-white">សលាកបត្របុគ្គលសិស្ស</h3>
                            <p class="text-[10px] text-slate-400 dark:text-slate-400 font-bold hidden sm:block">ប្រវត្តិរូប និងកំណត់ត្រាព័ត៌មានលម្អិតសិស្ស</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <button type="button" onclick="window.printStudentProfileRecord()" class="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm">
                            <i class="fa-solid fa-print"></i> <span class="hidden sm:inline">ព្រីន (Print)</span>
                        </button>
                        <button type="button" onclick="window.closeStudentProfileModal()" class="w-9 h-9 rounded-full bg-slate-100 hover:bg-rose-500 hover:text-white text-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-rose-500 flex items-center justify-center transition shadow-sm font-bold text-base outline-none" title="បិទផ្ទាំងនេះ (Close)">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                </div>

                <!-- Printable Content Area -->
                <div id="studentProfilePrintArea" class="overflow-y-auto custom-scrollbar flex-1 relative bg-white dark:bg-slate-800">
                    <div class="h-32 md:h-40 bg-gradient-to-br from-indigo-600 via-blue-600 to-sky-500 relative overflow-hidden">
                        <div class="absolute inset-0 bg-black opacity-10"></div>
                        <div class="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                        <div class="absolute -top-20 -left-20 w-48 h-48 bg-sky-300/20 rounded-full blur-3xl"></div>
                    </div>
                    <div class="px-6 md:px-10 pb-8 relative">
                        <div class="flex flex-col md:flex-row items-center md:items-end gap-5 -mt-16 md:-mt-20 mb-8">
                            <div id="profAvatar" class="w-32 h-32 md:w-36 md:h-36 bg-white dark:bg-slate-700 rounded-[2rem] border-[6px] border-white dark:border-slate-800 shadow-xl flex items-center justify-center text-5xl font-bold text-indigo-500 overflow-hidden relative z-10 shrink-0 transform rotate-2 hover:rotate-0 transition duration-300"></div>
                            <div class="text-center md:text-left flex-1 mt-2 md:mt-0 mb-2">
                                <div class="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-3">
                                    <h3 id="profName" class="text-2xl md:text-3xl font-moul text-slate-800 dark:text-white drop-shadow-sm leading-tight"></h3>
                                    <span id="profId" class="text-xs md:text-sm text-indigo-600 dark:text-indigo-300 font-bold font-mono bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-800 inline-block w-max mx-auto md:mx-0 shadow-sm"></span>
                                </div>
                                <div id="profBadges" class="flex justify-center md:justify-start flex-wrap gap-2"></div>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            <div class="bg-slate-50 dark:bg-slate-700/50 p-5 md:p-6 rounded-[2rem] border border-slate-100 dark:border-slate-600 hover:shadow-md transition duration-300 group">
                                <h4 class="text-[11px] font-bold text-slate-400 dark:text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2"><i class="fa-solid fa-graduation-cap text-indigo-500"></i> ព័ត៌មានសិក្សា</h4>
                                <div class="space-y-4">
                                    <div class="flex items-center gap-4">
                                        <div class="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm group-hover:scale-110 transition shrink-0"><i class="fa-solid fa-layer-group"></i></div>
                                        <div><p class="text-[10px] text-slate-400 font-bold mb-0.5">ថ្នាក់រៀនបច្ចុប្បន្ន</p><p id="profGrade" class="text-[13px] md:text-sm font-bold text-slate-800 dark:text-white"></p></div>
                                    </div>
                                    <div class="flex items-center gap-4">
                                        <div class="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm group-hover:scale-110 transition shrink-0"><i class="fa-solid fa-calendar-check"></i></div>
                                        <div><p class="text-[10px] text-slate-400 font-bold mb-0.5">ស្ថានភាពសិក្សា</p><p id="profStatusText" class="text-[13px] md:text-sm font-bold text-emerald-600"></p></div>
                                    </div>
                                </div>
                            </div>
                            <div class="bg-slate-50 dark:bg-slate-700/50 p-5 md:p-6 rounded-[2rem] border border-slate-100 dark:border-slate-600 hover:shadow-md transition duration-300 group">
                                <h4 class="text-[11px] font-bold text-slate-400 dark:text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2"><i class="fa-solid fa-user text-pink-500"></i> ព័ត៌មានផ្ទាល់ខ្លួន</h4>
                                <div class="space-y-4">
                                    <div class="flex items-center gap-4">
                                        <div class="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 text-pink-500 flex items-center justify-center shadow-sm group-hover:scale-110 transition shrink-0"><i class="fa-solid fa-venus-mars"></i></div>
                                        <div><p class="text-[10px] text-slate-400 font-bold mb-0.5">ភេទ</p><p id="profGender" class="text-[13px] md:text-sm font-bold text-slate-800 dark:text-white"></p></div>
                                    </div>
                                    <div class="flex items-center gap-4">
                                        <div class="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 text-orange-500 flex items-center justify-center shadow-sm group-hover:scale-110 transition shrink-0"><i class="fa-regular fa-calendar"></i></div>
                                        <div><p class="text-[10px] text-slate-400 font-bold mb-0.5">ថ្ងៃខែឆ្នាំកំណើត</p><p id="profDob" class="text-[13px] md:text-sm font-bold text-slate-800 dark:text-white font-mono"></p></div>
                                    </div>
                                </div>
                            </div>
                            <div class="bg-slate-50 dark:bg-slate-700/50 p-5 md:p-6 rounded-[2rem] border border-slate-100 dark:border-slate-600 hover:shadow-md transition duration-300 group md:col-span-2">
                                <h4 class="text-[11px] font-bold text-slate-400 dark:text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2"><i class="fa-solid fa-address-book text-amber-500"></i> ទំនាក់ទំនង និងគ្រួសារ</h4>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                                    <div class="flex items-center gap-4">
                                        <div class="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 text-amber-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition shrink-0"><i class="fa-solid fa-people-roof"></i></div>
                                        <div class="w-full">
                                            <p class="text-[10px] text-slate-400 font-bold mb-0.5">ឪពុក / ម្ដាយ</p>
                                            <p id="profParents" class="text-[13px] md:text-sm font-bold text-slate-800 dark:text-white leading-snug"></p>
                                        </div>
                                    </div>
                                    <div class="flex items-center gap-4">
                                        <div class="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 text-green-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition shrink-0"><i class="fa-solid fa-phone"></i></div>
                                        <div><p class="text-[10px] text-slate-400 font-bold mb-0.5">លេខទូរស័ព្ទអាណាព្យាបាល</p><p id="profContact" class="text-[13px] md:text-sm font-bold text-slate-800 dark:text-white font-mono"></p></div>
                                    </div>
                                    <div class="flex items-start gap-4 md:col-span-2 mt-2 pt-4 border-t border-slate-200/60 dark:border-slate-600">
                                        <div class="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 text-sky-600 flex items-center justify-center shadow-sm shrink-0 group-hover:scale-110 transition"><i class="fa-solid fa-map-location-dot"></i></div>
                                        <div><p class="text-[10px] text-slate-400 font-bold mb-0.5">ទីលំនៅបច្ចុប្បន្ន</p><p id="profAddress" class="text-[12px] md:text-[13px] font-bold text-slate-700 dark:text-slate-200 leading-relaxed"></p></div>
                                    </div>
                                </div>
                            </div>

                            <!-- ACAD-05: ប័ណ្ណប្រវត្តិការចុះឈ្មោះ និងការផ្ទេរថ្នាក់ (Enrollment & Transfer History) -->
                            <div id="profEnrollmentHistoryCard" class="bg-slate-50 dark:bg-slate-700/50 p-5 md:p-6 rounded-[2rem] border border-slate-100 dark:border-slate-600 hover:shadow-md transition duration-300 group md:col-span-2">
                                <h4 class="text-[11px] font-bold text-slate-400 dark:text-slate-300 uppercase tracking-widest mb-3 flex items-center gap-2"><i class="fa-solid fa-timeline text-indigo-500"></i> ប្រវត្តិការចុះឈ្មោះ និងការផ្លាស់ប្តូរថ្នាក់រៀន (Enrollment & Class Transfer History)</h4>
                                <div id="profEnrollmentTimeline" class="space-y-2.5 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                                    <!-- Populated dynamically by viewStudentProfile -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Sticky Bottom Footer Bar (Always Reachable Close Button) -->
                <div class="sticky bottom-0 z-30 bg-slate-50 dark:bg-slate-900 px-6 py-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center shrink-0 text-xs font-bold">
                    <span class="text-slate-400 font-medium">សលាកបត្របុគ្គល (Student Profile)</span>
                    <div class="flex items-center gap-2">
                        <button type="button" onclick="window.closeStudentProfileModal()" class="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl transition flex items-center gap-1.5 shadow-sm">
                            <i class="fa-solid fa-xmark"></i> <span>បិទ (Close)</span>
                        </button>
                        <button type="button" onclick="window.printStudentProfileRecord()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition flex items-center gap-1.5 shadow-md">
                            <i class="fa-solid fa-print"></i> <span>បោះពុម្ពសលាកបត្រ</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 🟢 ផ្ទាំង Modal ផ្ទេរថ្នាក់ / ប្តូរបន្ទប់រៀន (ACAD-05 / STU-04) 🟢 -->
        <div id="studentTransferModal" class="fixed inset-0 z-[6500] bg-slate-900/70 backdrop-blur-md hidden items-center justify-center p-4 fade-in font-siemreap overflow-y-auto custom-scrollbar">
            <div class="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 flex flex-col my-auto transform transition-all">
                <div class="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex justify-between items-center">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg"><i class="fa-solid fa-arrow-right-arrow-left"></i></div>
                        <div>
                            <h3 class="font-moul text-base text-slate-800">ផ្ទេរថ្នាក់ / ប្តូរបន្ទប់រៀន</h3>
                            <p class="text-xs text-slate-500">រក្សាទុកប្រវត្តិពិន្ទុ និងវត្តមានចាស់ដោយស្វ័យប្រវត្តិ</p>
                        </div>
                    </div>
                    <button type="button" onclick="document.getElementById('studentTransferModal').classList.replace('flex','hidden')" class="w-8 h-8 rounded-full bg-slate-200 hover:bg-rose-100 text-slate-600 hover:text-rose-600 flex items-center justify-center transition"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <form id="studentTransferForm" onsubmit="window.handleTransferStudentSubmit(event)" class="p-6 space-y-4">
                    <input type="hidden" id="trans_stu_id" value="">
                    
                    <div class="p-4 bg-blue-50/60 rounded-2xl border border-blue-100">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0" id="trans_avatar">ស</div>
                            <div class="min-w-0">
                                <h4 class="font-bold text-slate-800 text-sm truncate" id="trans_stu_name">-</h4>
                                <p class="text-xs text-slate-500 font-mono" id="trans_stu_id_badge">ID: -</p>
                            </div>
                        </div>
                        <div class="mt-3 pt-3 border-t border-blue-100/60 flex items-center justify-between text-xs font-bold text-slate-600">
                            <span>ថ្នាក់បច្ចុប្បន្ន៖ <span class="text-blue-600 font-moul" id="trans_cur_class">-</span></span>
                            <span>ឆ្នាំសិក្សា៖ <span class="text-slate-700" id="trans_cur_year">-</span></span>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">ថ្នាក់រៀនថ្មី *</label>
                            <select id="trans_new_grade" class="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 bg-white" required>
                                ${gradesOptions}
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">បន្ទប់រៀនថ្មី *</label>
                            <select id="trans_new_room" class="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 bg-white" required>
                                <option value="«ក»">«ក»</option>
                                <option value="«ខ»">«ខ»</option>
                                <option value="«គ»">«គ»</option>
                                <option value="«ឃ»">«ឃ»</option>
                                <option value="«ង»">«ង»</option>
                            </select>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">កាលបរិច្ឆេទផ្ទេរ *</label>
                            <input type="date" id="trans_date" class="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 bg-white" required>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">ស្ថានភាព</label>
                            <select id="trans_status" class="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                                <option value="Active">កំពុងសិក្សា (Active)</option>
                                <option value="Transferred">បានផ្ទេរចេញ (Transferred)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">មូលហេតុនៃការផ្ទេរ / ចំណាំ</label>
                        <textarea id="trans_reason" rows="2" placeholder="ឧ. ប្តូរបន្ទប់តាមការរៀបចំថ្មី, ប្តូរទីលំនៅ..." class="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                    </div>

                    <div class="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
                        <i class="fa-solid fa-circle-info text-amber-600 mt-0.5"></i>
                        <span>ប្រព័ន្ធនឹងរក្សាទុកកំណត់ត្រាពិន្ទុ និងវត្តមានរបស់សិស្សក្នុងថ្នាក់ចាស់ដោយស្វ័យប្រវត្តិ មិនឱ្យបាត់បង់ទិន្នន័យឡើយ។</span>
                    </div>

                    <div class="flex justify-end gap-2 pt-2 border-t border-slate-100">
                        <button type="button" onclick="document.getElementById('studentTransferModal').classList.replace('flex','hidden')" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition">បោះបង់</button>
                        <button type="submit" id="btnSubmitTransfer" class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-200 flex items-center gap-1.5 transition"><i class="fa-solid fa-check"></i> បញ្ជាក់ការផ្ទេរ</button>
                    </div>
                </form>
            </div>
        </div>
    `;
};

// ==========================================
// 🟢 ACAD-05 & STU-04: មុខងារផ្ទេរថ្នាក់សិស្ស (Student Class Transfer Handlers) 🟢
// ==========================================
window.openTransferStudentModal = function(id) {
    const stu = (window.allStudents || []).find(s => String(s.id) === String(id));
    if (!stu) return alert("រកមិនឃើញទិន្នន័យសិស្សឡើយ!");

    const modal = document.getElementById("studentTransferModal");
    if (!modal) return alert("មិនទាន់មាន Modal ផ្ទេរថ្នាក់ក្នុងប្រព័ន្ធទេ!");

    document.getElementById("trans_stu_id").value = stu.id;
    document.getElementById("trans_stu_name").textContent = stu.name + (stu.name_en ? ` (${stu.name_en})` : '');
    document.getElementById("trans_stu_id_badge").textContent = `ID: ${stu.id}`;
    document.getElementById("trans_avatar").textContent = getAvatarInitial(stu.name);
    document.getElementById("trans_cur_class").textContent = `${normalizeGrade(stu.grade)} ${stu.room || ''}`;
    document.getElementById("trans_cur_year").textContent = stu.academic_year || document.getElementById("globalAcademicYear")?.value || "2026-2027";

    document.getElementById("trans_new_grade").value = normalizeGrade(stu.grade);
    document.getElementById("trans_new_room").value = stu.room || "«ក»";
    document.getElementById("trans_date").value = new Date().toISOString().split('T')[0];
    document.getElementById("trans_status").value = stu.status || "Active";
    document.getElementById("trans_reason").value = "";

    modal.classList.remove("hidden");
    modal.classList.add("flex");
};

window.handleTransferStudentSubmit = async function(e) {
    e.preventDefault();
    const stuId = document.getElementById("trans_stu_id").value;
    const stu = (window.allStudents || []).find(s => String(s.id) === String(stuId));
    if (!stu) return;

    const newGrade = normalizeGrade(document.getElementById("trans_new_grade").value);
    const newRoom = document.getElementById("trans_new_room").value.trim();
    const transDate = document.getElementById("trans_date").value;
    const transStatus = document.getElementById("trans_status").value;
    const transReason = document.getElementById("trans_reason").value.trim() || "ការផ្ទេរថ្នាក់រៀន";

    if (newGrade === normalizeGrade(stu.grade) && newRoom === (stu.room || '').trim() && transStatus === (stu.status || 'Active')) {
        alert("⚠️ ថ្នាក់ បន្ទប់ និងស្ថានភាពថ្មីដូចគ្នាទៅនឹងបច្ចុប្បន្ន!");
        return;
    }

    // Permission check
    if (window.DataServiceGuard) {
        try {
            window.DataServiceGuard.assertCan(
                'edit_student', 
                { grade: stu.grade, room: stu.room },
                `⚠️ សិទ្ធិត្រូវបានបដិសេធ៖ លោកគ្រូអ្នកគ្រូមិនមានសិទ្ធិផ្ទេរសិស្សចេញពីថ្នាក់ ${stu.grade} ${stu.room} ឡើយ!`
            );
        } catch(guardErr) {
            alert(guardErr.message);
            return;
        }
    } else if (typeof canEditRecords === 'function' && !canEditRecords()) {
        alert("🔒 លោកគ្រូអ្នកគ្រូមានត្រឹមសិទ្ធិមើលប៉ុណ្ណោះ មិនអាចផ្ទេរសិស្សបានទេ!");
        return;
    }

    const btn = document.getElementById("btnSubmitTransfer");
    const origBtnText = btn.innerHTML;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> កំពុងដំណើរការ...`;
    btn.disabled = true;

    try {
        const curYear = stu.academic_year || document.getElementById("globalAcademicYear")?.value || "2026-2027";
        
        // Initialize history if missing
        if (!Array.isArray(stu.enrollment_history)) {
            stu.enrollment_history = [{
                grade: normalizeGrade(stu.grade),
                room: stu.room || '«ក»',
                academic_year: curYear,
                date: stu.enrollment_date || '2026-01-01',
                status: stu.status || 'Active',
                reason: 'ចុះឈ្មោះចូលរៀនដំបូង',
                type: 'initial_enrollment',
                created_at: stu.created_at || new Date().toISOString()
            }];
        }

        const historyEntry = {
            from_grade: normalizeGrade(stu.grade),
            from_room: stu.room || '',
            grade: newGrade,
            room: newRoom,
            academic_year: curYear,
            date: transDate,
            status: transStatus,
            reason: transReason,
            type: 'class_transfer',
            transferred_by: window.AuthState?.teacherName || localStorage.getItem('auth_teacher_name') || 'Admin',
            created_at: new Date().toISOString()
        };

        stu.enrollment_history.push(historyEntry);

        // Update current grade & room & status
        stu.grade = newGrade;
        stu.room = newRoom;
        stu.status = transStatus;
        stu.updated_at = new Date().toISOString();

        // Save local
        if (typeof window.setMasterStudents === 'function') {
            window.setMasterStudents(window.allStudents);
        } else {
            localStorage.setItem('academic_students', JSON.stringify(window.allStudents));
        }

        // Save to Firebase
        if (window.db) {
            await window.db.collection("students").doc(String(stu.id)).set({
                grade: stu.grade,
                room: stu.room,
                status: stu.status,
                enrollment_history: stu.enrollment_history,
                updated_at: stu.updated_at,
                last_updated: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        }

        if (typeof window.logAudit === 'function') {
            window.logAudit(
                'TRANSFER_STUDENT',
                'student',
                `បានផ្ទេរសិស្ស ${stu.name} (${stu.id}) ពី ${historyEntry.from_grade} ${historyEntry.from_room} ទៅ ${newGrade} ${newRoom} (មូលហេតុ: ${transReason})`
            );
        }

        document.getElementById("studentTransferModal").classList.replace("flex", "hidden");
        window.filterStudents();
        if (typeof showToast === 'function') showToast("🔄 បានផ្ទេរថ្នាក់សិស្ស និងកត់ត្រាប្រវត្តិជោគជ័យ!", "success");

    } catch (err) {
        console.error("Transfer error:", err);
        alert("មានបញ្ហាក្នុងការផ្ទេរថ្នាក់សិស្ស: " + err.message);
    } finally {
        btn.innerHTML = origBtnText;
        btn.disabled = false;
    }
};


// ==========================================
// 🟢 មុខងារស្នូលសម្រាប់បញ្ជា Print លើទូរស័ព្ទដៃ (ការពារការលោតបាត់ពេលសារ៉េក្រដាស) 🟢
// ==========================================
window.executeMobilePrint = function(htmlContent, isLandscape = false) {
    if (window.CMSPrintManager && typeof window.CMSPrintManager.openUniversalPreview === 'function') {
        window.CMSPrintManager.openUniversalPreview({
            title: "បញ្ជីរាយនាមសិស្ស",
            orientation: isLandscape ? 'landscape' : 'portrait',
            contentHtml: htmlContent,
            autoWrapHeaderFooter: false
        });
        return;
    }

    let oldPrintArea = document.getElementById('global-mobile-print-area');
    if (oldPrintArea) oldPrintArea.remove();

    const printArea = document.createElement('div');
    printArea.id = 'global-mobile-print-area';
    
    const pageCSS = isLandscape 
        ? `@page { size: A4 landscape; margin: 10mm; }` 
        : `@page { size: A4 portrait; margin: 12mm; }`;

    printArea.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Battambang:wght@400;700&family=Moul&family=Siemreap:wght@400;700&display=swap');
            
            @media print {
                body > *:not(#global-mobile-print-area) { display: none !important; }
                body { background: white !important; margin: 0 !important; padding: 0 !important; }
                #global-mobile-print-area { display: block !important; width: 100%; background: white; z-index: 999999; }
                ${pageCSS}
                * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            }
            
            @media screen { #global-mobile-print-area { display: none !important; } }
            
            .print-wrapper {
                background: white; color: #0f172a; width: 100%; margin: 0 auto;
                font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif; line-height: 1.4;
                max-width: ${isLandscape ? '277mm' : '190mm'};
            }
        </style>
        <div class="print-wrapper">
            ${htmlContent}
        </div>
    `;

    document.body.appendChild(printArea);

    setTimeout(() => {
        window.print();
    }, 800); 
};

// ==========================================
// មុខងារបោះពុម្ពបញ្ជីរាយនាមសិស្ស (សង្ខេប - បញ្ឈរ A4)
// ==========================================
window.printStudentList = function() {
    if (!window.filteredStudents || window.filteredStudents.length === 0) return alert("គ្មានទិន្នន័យដើម្បីបោះពុម្ពទេ!");

    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const schoolName = sInfo.school_name || "សាលាបឋមសិក្សា ខ្សុំ";
    let rawDistrict = sInfo.district || "ស្រុកកៀនស្វាយ";
    const districtName = rawDistrict.replace('ស្រុក', '').trim();
    const academicYear = document.getElementById("globalAcademicYear")?.value || localStorage.getItem('selected_academic_year') || "2026-2027";
    const teacherName = window.AuthState ? window.AuthState.teacherName : sInfo.teacher_name || ".......................";
    const principalName = sInfo.principal_name || ".......................";
    
    // 🟢 ទាញយកកាលបរិច្ឆេទពីប្រព័ន្ធកំណត់ថ្មី (Settings Panel) 🟢
    const rDates = window.reportCardDateSettings || {};
    let locationStr = (rDates.location || "ធ្វើនៅ.........................").trim();
    let sDate = (rDates.solarDate || "ថ្ងៃទី....... ខែ....... ឆ្នាំ២០....").trim();
    if (sDate.includes("ថ្ងៃទី")) sDate = sDate.substring(sDate.indexOf("ថ្ងៃទី"));
    locationStr = locationStr.replace(/,+$/, '').trim();

    const solarDateStr = `${locationStr}, ${sDate}`;
    const lunarDateStr = rDates.showLunar !== false ? (rDates.lunarDate || "ថ្ងៃ......................... ខែ............ ឆ្នាំ............ ព.ស.២៥៧...") : "";

    // ទាញយកព័ត៌មានថ្នាក់ដែលគ្រូគ្រប់គ្រងពីការកំណត់ (appSettings ឬ State)
    const curClass = typeof window.getCurrentSelectedClass === 'function' ? window.getCurrentSelectedClass() : null;
    const defaultLevel = (curClass && curClass.level) || sInfo.teacher_level || localStorage.getItem('auth_teacher_grade') || localStorage.getItem('selected_level') || "ថ្នាក់ទី ១";
    const defaultRoom = (curClass && curClass.room) || sInfo.teacher_room || localStorage.getItem('auth_teacher_room') || localStorage.getItem('selected_room') || "«ក»";

    // ទាញយកតម្លៃដែលគ្រូជ្រើសរើស តែបើសិនអត់ជ្រើសរើស ទាញយកថ្នាក់ដែលគ្រូគ្រប់គ្រង
    const filterGrade = document.getElementById("stuFilterGrade")?.value;
    const filterRoom = document.getElementById("stuFilterRoom")?.value;
    
    // បង្ហាញចំណងជើងរង (SubTitle) តាមថ្នាក់ជាក់ស្តែងរបស់គ្រូបន្ទុកថ្នាក់
    const targetGrade = (filterGrade && filterGrade !== "all") ? filterGrade : defaultLevel;
    const targetRoom = (filterRoom && filterRoom !== "all") ? filterRoom : defaultRoom;
    let subTitle = `${targetGrade} ${targetRoom}`.trim();

    // ត្រងយកសិស្សក្នុងថ្នាក់ជាក់ស្តែងនោះមកបោះពុម្ព
    const cleanRoom = (r) => String(r || '').replace(/[«»\s]/g, '');
    const normTarget = typeof window.normalizeGrade === 'function' ? window.normalizeGrade(targetGrade) : targetGrade;
    const targetCleanRoom = cleanRoom(targetRoom);

    let baseList = (window.filteredStudents && window.filteredStudents.length > 0) ? window.filteredStudents : (window.allStudents || []);
    let studentsToPrint = baseList.filter(stu => {
        if (!stu) return false;
        const stuGrade = typeof window.normalizeGrade === 'function' ? window.normalizeGrade(stu.grade) : String(stu.grade || '').trim();
        const gradeMatches = !normTarget || normTarget === "all" || stuGrade === normTarget || String(stu.grade || '').trim() === targetGrade;
        if (!gradeMatches) return false;
        if (targetCleanRoom && targetCleanRoom !== 'all') {
            const stuRoom = cleanRoom(stu.room);
            if (stuRoom && stuRoom !== targetCleanRoom) return false;
        }
        return true;
    });

    if (studentsToPrint.length === 0 && baseList.length > 0) {
        studentsToPrint = baseList;
    }

    let total = studentsToPrint.length;
    let female = 0;

    let rowsHtml = "";
    studentsToPrint.forEach((stu, idx) => {
        let isF = stu.gender === 'ស្រី';
        if (isF) female++;

        let dobStr = typeof formatDate === 'function' ? formatDate(stu.dob) : stu.dob;
        let remark = stu.status === "Dropped" ? "បោះបង់" : "";
        if (stu.poor_id) remark += (remark?"/":"") + "ក្រីក្រ";
        if (stu.scholarship) remark += (remark?"/":"") + "អាហារូបករណ៍";
        
        let village = stu.curr_village ? stu.curr_village.replace('ភូមិ', '').trim() : '';
        let commune = stu.curr_commune ? stu.curr_commune.replace('ឃុំ', '').replace('សង្កាត់', '').trim() : '';
        let addrText = village && commune ? `${village}, ${commune}` : (village || commune || '-');
        
        let genColor = isF ? '#e11d48' : '#1e3a8a';
        let bgRow = idx % 2 !== 0 ? 'background-color: #f8fafc;' : 'background-color: #ffffff;';

        rowsHtml += `
            <tr style="height: 30px; ${bgRow}">
                <td style="text-align: center; border: 1px solid #00204e; padding: 4px;">${typeof window.toKhmerNum === 'function' ? window.toKhmerNum(idx + 1) : idx + 1}</td>
                <td style="text-align: center; border: 1px solid #00204e; padding: 4px;">${stu.id || ''}</td>
                <td style="text-align: left; padding-left: 8px; font-weight: bold; border: 1px solid #00204e; font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif;">${stu.name || ''}</td>
                <td style="text-align: center; font-weight: bold; color: ${genColor}; border: 1px solid #00204e;">${isF ? 'ស' : 'ប'}</td>
                <td style="text-align: center; border: 1px solid #00204e; padding: 4px;">${dobStr}</td>
                <td style="text-align: left; padding-left: 8px; border: 1px solid #00204e; font-size: 10pt;">${addrText}</td>
                <td style="text-align: center; border: 1px solid #00204e; font-family: 'Battambang', sans-serif;">${stu.parent_contact || '-'}</td>
                <td style="text-align: center; color: #dc2626; font-size: 9pt; border: 1px solid #00204e;">${remark}</td>
            </tr>
        `;
    });

    const tableContentHtml = `
        <table style="width: 100%; border-collapse: collapse; font-size: 11pt; border: 1.5px solid #0f172a; margin-bottom: 20px;">
            <thead>
                <tr>
                    <th style="width: 5%; background: #e2e8f0; font-family: 'Khmer OS Muol Light', 'Moul', sans-serif; font-size: 10pt; font-weight: normal; border: 1px solid #475569; padding: 8px 4px;">ល.រ</th>
                    <th style="width: 12%; background: #e2e8f0; font-family: 'Khmer OS Muol Light', 'Moul', sans-serif; font-size: 10pt; font-weight: normal; border: 1px solid #475569;">អត្តលេខ</th>
                    <th style="width: 23%; background: #e2e8f0; font-family: 'Khmer OS Muol Light', 'Moul', sans-serif; font-size: 10pt; font-weight: normal; border: 1px solid #475569;">គោត្តនាម និងនាម</th>
                    <th style="width: 6%; background: #e2e8f0; font-family: 'Khmer OS Muol Light', 'Moul', sans-serif; font-size: 10pt; font-weight: normal; border: 1px solid #475569;">ភេទ</th>
                    <th style="width: 14%; background: #e2e8f0; font-family: 'Khmer OS Muol Light', 'Moul', sans-serif; font-size: 10pt; font-weight: normal; border: 1px solid #475569;">ថ្ងៃខែឆ្នាំកំណើត</th>
                    <th style="width: 18%; background: #e2e8f0; font-family: 'Khmer OS Muol Light', 'Moul', sans-serif; font-size: 10pt; font-weight: normal; border: 1px solid #475569;">ទីលំនៅបច្ចុប្បន្ន</th>
                    <th style="width: 12%; background: #e2e8f0; font-family: 'Khmer OS Muol Light', 'Moul', sans-serif; font-size: 10pt; font-weight: normal; border: 1px solid #475569;">លេខទូរស័ព្ទ</th>
                    <th style="width: 10%; background: #e2e8f0; font-family: 'Khmer OS Muol Light', 'Moul', sans-serif; font-size: 10pt; font-weight: normal; border: 1px solid #475569;">ផ្សេងៗ</th>
                </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
        </table>
        
        <table style="width: 100%; border-collapse: collapse; border-top: 2px solid #0f172a; margin-bottom: 20px; font-weight: bold;">
            <tr>
                <td style="width: 40%; padding: 6px 0;">បញ្ឈប់បញ្ជីត្រឹមលេខរៀងទី <span style="color: #2563eb; margin-left:10px;">${typeof window.toKhmerNum === 'function' ? window.toKhmerNum(total) : total}</span></td>
                <td style="width: 25%;">សិស្សសរុប៖ <span style="color: #0f172a; margin-left:10px;">${typeof window.toKhmerNum === 'function' ? window.toKhmerNum(total) : total} នាក់</span></td>
                <td style="width: 20%; text-align: right;">ស្រី៖ <span style="color: #e11d48; margin-left:10px;">${typeof window.toKhmerNum === 'function' ? window.toKhmerNum(female) : female} នាក់</span></td>
            </tr>
        </table>
    `;

    if (window.CMSPrintManager && typeof window.CMSPrintManager.openUniversalPreview === 'function') {
        window.CMSPrintManager.openUniversalPreview({
            title: `បញ្ជីរាយនាមសិស្សានុសិស្ស`,
            grade: subTitle,
            academicYear: academicYear,
            districtName: districtName,
            schoolName: schoolName,
            principalName: principalName,
            teacherName: teacherName,
            paperSize: "A4",
            orientation: "portrait",
            defaultZoom: 1.0,
            contentHtml: tableContentHtml
        });
    } else {
        window.executeMobilePrint(tableContentHtml, false);
    }
};


// ==========================================
// មុខងារបោះពុម្ពបញ្ជីរាយនាមសិស្ស (លម្អិត - ផ្តេក A4 Landscape)
// ==========================================
window.printFullStudentList = function() {
    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const schoolName = sInfo.school_name || "សាលាបឋមសិក្សា ខ្សុំ";
    let rawDistrict = sInfo.district || "ស្រុកកៀនស្វាយ";
    const districtName = rawDistrict.replace('ស្រុក', '').trim();
    const academicYear = document.getElementById("globalAcademicYear")?.value || localStorage.getItem('selected_academic_year') || "2026-2027";
    const teacherName = window.AuthState ? window.AuthState.teacherName : sInfo.teacher_name || ".......................";
    const principalName = sInfo.principal_name || ".......................";
    
    // 🟢 ទាញយកកាលបរិច្ឆេទពីប្រព័ន្ធកំណត់ថ្មី (Settings Panel) 🟢
    const rDates = window.reportCardDateSettings || {};
    let locationStr = (rDates.location || "ធ្វើនៅ.........................").trim();
    let sDate = (rDates.solarDate || "ថ្ងៃទី....... ខែ....... ឆ្នាំ២០....").trim();
    if (sDate.includes("ថ្ងៃទី")) sDate = sDate.substring(sDate.indexOf("ថ្ងៃទី"));
    locationStr = locationStr.replace(/,+$/, '').trim();

    const solarDateStr = `${locationStr}, ${sDate}`;
    const lunarDateStr = rDates.showLunar !== false ? (rDates.lunarDate || "ថ្ងៃ......................... ខែ............ ឆ្នាំ............ ព.ស.២៥៧...") : "";

    // ទាញយកព័ត៌មានថ្នាក់ដែលគ្រូគ្រប់គ្រងពីការកំណត់ (appSettings ឬ State)
    const curClass = typeof window.getCurrentSelectedClass === 'function' ? window.getCurrentSelectedClass() : null;
    const defaultLevel = (curClass && curClass.level) || sInfo.teacher_level || localStorage.getItem('auth_teacher_grade') || localStorage.getItem('selected_level') || "ថ្នាក់ទី ១";
    const defaultRoom = (curClass && curClass.room) || sInfo.teacher_room || localStorage.getItem('auth_teacher_room') || localStorage.getItem('selected_room') || "«ក»";

    // ទាញយកតម្លៃដែលគ្រូជ្រើសរើស តែបើសិនអត់ជ្រើសរើស ទាញយកថ្នាក់ដែលគ្រូគ្រប់គ្រង
    const filterGrade = document.getElementById("stuFilterGrade")?.value;
    const filterRoom = document.getElementById("stuFilterRoom")?.value;
    
    // បង្ហាញចំណងជើងរង (SubTitle) តាមថ្នាក់ជាក់ស្តែងរបស់គ្រូបន្ទុកថ្នាក់
    const targetGrade = (filterGrade && filterGrade !== "all") ? filterGrade : defaultLevel;
    const targetRoom = (filterRoom && filterRoom !== "all") ? filterRoom : defaultRoom;
    let subTitle = `${targetGrade} ${targetRoom}`.trim();

    // ត្រងយកសិស្សក្នុងថ្នាក់ជាក់ស្តែងនោះមកបោះពុម្ព
    const cleanRoom = (r) => String(r || '').replace(/[«»\s]/g, '');
    const normTarget = typeof window.normalizeGrade === 'function' ? window.normalizeGrade(targetGrade) : targetGrade;
    const targetCleanRoom = cleanRoom(targetRoom);

    let baseList = (window.filteredStudents && window.filteredStudents.length > 0) ? window.filteredStudents : (window.allStudents || []);
    let studentsToPrint = baseList.filter(stu => {
        if (!stu) return false;
        const stuGrade = typeof window.normalizeGrade === 'function' ? window.normalizeGrade(stu.grade) : String(stu.grade || '').trim();
        const gradeMatches = !normTarget || normTarget === "all" || stuGrade === normTarget || String(stu.grade || '').trim() === targetGrade;
        if (!gradeMatches) return false;
        if (targetCleanRoom && targetCleanRoom !== 'all') {
            const stuRoom = cleanRoom(stu.room);
            if (stuRoom && stuRoom !== targetCleanRoom) return false;
        }
        return true;
    });

    if (studentsToPrint.length === 0 && baseList.length > 0) {
        studentsToPrint = baseList;
    }

    if (studentsToPrint.length === 0) return alert("គ្មានទិន្នន័យដើម្បីបោះពុម្ពទេ!");

    let total = studentsToPrint.length;
    let female = 0;

    const formatFullAddress = (v, c, d, p) => {
        let arr = [];
        if(v) arr.push(`${v}`);
        if(c) arr.push(`${c}`);
        if(d) arr.push(`${d}`);
        if(p) arr.push(`${p}`);
        return arr.length > 0 ? arr.join(", ") : "-";
    };

    let rowsHtml = "";
    studentsToPrint.forEach((stu, idx) => {
        let isF = stu.gender === 'ស្រី';
        if (isF) female++;

        let dobStr = typeof formatDate === 'function' ? formatDate(stu.dob) : stu.dob;
        let remark = stu.status === "Dropped" ? "បោះបង់" : "";
        if (stu.poor_id) remark += (remark?"\n":"") + "ក្រីក្រ";
        if (stu.scholarship) remark += (remark?"\n":"") + "អាហារូបករណ៍";

        let pobText = formatFullAddress(stu.pob_village, stu.pob_commune, stu.pob_district, stu.pob_province);
        let currText = formatFullAddress(stu.curr_village, stu.curr_commune, stu.curr_district, stu.curr_province);
        let fatherText = `${stu.father_name || '-'}${stu.father_job ? `<br><span style="color:#64748b; font-size:7pt; font-weight:normal;">(${stu.father_job})</span>` : ''}`;
        let motherText = `${stu.mother_name || '-'}${stu.mother_job ? `<br><span style="color:#64748b; font-size:7pt; font-weight:normal;">(${stu.mother_job})</span>` : ''}`;

        let genColor = isF ? '#e11d48' : '#1e3a8a';
        let bgRow = idx % 2 !== 0 ? 'background-color: #f8fafc;' : 'background-color: #ffffff;';

        rowsHtml += `
            <tr style="height: 35px; ${bgRow}">
                <td style="text-align: center; border: 1px solid #475569; padding: 2px;">${typeof window.toKhmerNum === 'function' ? window.toKhmerNum(idx + 1) : idx + 1}</td>
                <td style="text-align: center; border: 1px solid #475569; padding: 2px;">${stu.id || ''}</td>
                <td style="text-align: left; padding-left: 6px; font-weight: bold; border: 1px solid #475569; font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif;">${stu.name || ''}</td>
                <td style="text-align: center; font-weight: bold; color: ${genColor}; border: 1px solid #475569; padding: 2px;">${isF ? 'ស' : 'ប'}</td>
                <td style="text-align: center; border: 1px solid #475569; padding: 2px;">${dobStr}</td>
                <td style="text-align: left; padding-left: 4px; font-size: 9pt; border: 1px solid #475569;">${pobText}</td>
                <td style="text-align: left; padding-left: 4px; font-size: 9pt; font-weight: bold; border: 1px solid #475569;">${fatherText}</td>
                <td style="text-align: left; padding-left: 4px; font-size: 9pt; font-weight: bold; border: 1px solid #475569;">${motherText}</td>
                <td style="text-align: left; padding-left: 4px; font-size: 9pt; border: 1px solid #475569;">${currText}</td>
                <td style="text-align: center; font-size: 10pt; font-family: 'Battambang', sans-serif; border: 1px solid #475569; padding: 2px;">${stu.parent_contact || '-'}</td>
                <td style="text-align: center; color: #dc2626; font-size: 8pt; border: 1px solid #475569; white-space: pre-line;">${remark}</td>
            </tr>
        `;
    });

    const fullTableContentHtml = `
        <table style="width: 100%; border-collapse: collapse; font-size: 10pt; border: 1.5px solid #0f172a; margin-bottom: 15px; table-layout: fixed;">
            <thead>
                <tr>
                    <th style="width: 3.5%; background: #e2e8f0; font-family: 'Khmer OS Muol Light', 'Moul', sans-serif; font-size: 9.5pt; font-weight: normal; border: 1px solid #475569; padding: 6px 2px;">ល.រ</th>
                    <th style="width: 8%; background: #e2e8f0; font-family: 'Khmer OS Muol Light', 'Moul', sans-serif; font-size: 9.5pt; font-weight: normal; border: 1px solid #475569;">អត្តលេខ</th>
                    <th style="width: 14%; background: #e2e8f0; font-family: 'Khmer OS Muol Light', 'Moul', sans-serif; font-size: 9.5pt; font-weight: normal; border: 1px solid #475569;">គោត្តនាម និងនាម</th>
                    <th style="width: 4%; background: #e2e8f0; font-family: 'Khmer OS Muol Light', 'Moul', sans-serif; font-size: 9.5pt; font-weight: normal; border: 1px solid #475569;">ភេទ</th>
                    <th style="width: 9%; background: #e2e8f0; font-family: 'Khmer OS Muol Light', 'Moul', sans-serif; font-size: 9.5pt; font-weight: normal; border: 1px solid #475569;">ថ្ងៃខែឆ្នាំកំណើត</th>
                    <th style="width: 13%; background: #e2e8f0; font-family: 'Khmer OS Muol Light', 'Moul', sans-serif; font-size: 9.5pt; font-weight: normal; border: 1px solid #475569;">ទីកន្លែងកំណើត</th>
                    <th style="width: 13%; background: #e2e8f0; font-family: 'Khmer OS Muol Light', 'Moul', sans-serif; font-size: 9.5pt; font-weight: normal; border: 1px solid #475569;">ឈ្មោះឪពុក</th>
                    <th style="width: 13%; background: #e2e8f0; font-family: 'Khmer OS Muol Light', 'Moul', sans-serif; font-size: 9.5pt; font-weight: normal; border: 1px solid #475569;">ឈ្មោះម្ដាយ</th>
                    <th style="width: 13%; background: #e2e8f0; font-family: 'Khmer OS Muol Light', 'Moul', sans-serif; font-size: 9.5pt; font-weight: normal; border: 1px solid #475569;">ទីលំនៅបច្ចុប្បន្ន</th>
                    <th style="width: 9.5%; background: #e2e8f0; font-family: 'Khmer OS Muol Light', 'Moul', sans-serif; font-size: 9.5pt; font-weight: normal; border: 1px solid #475569;">លេខទូរស័ព្ទ</th>
                    <th style="width: 5%; background: #e2e8f0; font-family: 'Khmer OS Muol Light', 'Moul', sans-serif; font-size: 9.5pt; font-weight: normal; border: 1px solid #475569;">ផ្សេងៗ</th>
                </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
        </table>
        
        <table style="width: 60%; border-collapse: collapse; border-top: 2px solid #0f172a; margin-bottom: 20px; font-weight: bold;">
            <tr>
                <td style="width: 40%; text-align: left; padding: 4px 0;">បញ្ឈប់បញ្ជីត្រឹមលេខរៀងទី <span style="color: #2563eb; margin-left: 5px;">${typeof window.toKhmerNum === 'function' ? window.toKhmerNum(total) : total}</span></td>
                <td style="width: 30%; text-align: left;">សិស្សសរុប៖ <span style="margin-left: 5px;">${typeof window.toKhmerNum === 'function' ? window.toKhmerNum(total) : total} នាក់</span></td>
                <td style="width: 30%; text-align: right;">ស្រី៖ <span style="color: #e11d48; margin-left: 5px;">${typeof window.toKhmerNum === 'function' ? window.toKhmerNum(female) : female} នាក់</span></td>
            </tr>
        </table>
    `;

    if (window.CMSPrintManager && typeof window.CMSPrintManager.openUniversalPreview === 'function') {
        window.CMSPrintManager.openUniversalPreview({
            title: `បញ្ជីព័ត៌មានសិស្ស`,
            grade: subTitle,
            academicYear: academicYear,
            districtName: districtName,
            schoolName: schoolName,
            principalName: principalName,
            teacherName: teacherName,
            paperSize: "A4",
            orientation: "landscape",
            defaultZoom: 0.85,
            contentHtml: fullTableContentHtml
        });
    } else {
        window.executeMobilePrint(fullTableContentHtml, true);
    }
};

window.downloadStudentTemplate = function() {
    if (typeof XLSX === 'undefined') return alert("សូមភ្ជាប់ Library SheetJS ជាមុនសិន!");
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
};

window.importStudentsExcel = function(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (typeof XLSX === 'undefined') return alert("សូមភ្ជាប់ Library SheetJS ជាមុនសិន!");
    
    const currentTeacherId = window.AuthState ? window.AuthState.teacherId : localStorage.getItem('auth_teacher_id');
    const currentYear = document.getElementById("globalAcademicYear")?.value || localStorage.getItem('selected_academic_year') || "2026-2027";

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, {type: 'array'});
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
            
            if (rows.length <= 1) {
                alert("⚠️ ឯកសារ Excel គ្មានទិន្នន័យទេ!");
                return;
            }

            // ស្វែងរកទីតាំងជួរឈរដោយឆ្លាតវៃតាមរយៈ Headers
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

            const parseBool = (idx) => {
                if (idx === -1) return false;
                const v = String(rowData[idx] || '').trim().toLowerCase();
                return v === 'មាន' || v === 'បាទ' || v === 'ចាស' || v === 'true' || v === 'yes' || v === '1';
            };

            let newAdded = 0;
            let updatedCount = 0;
            
            for (let r = 1; r < rows.length; r++) {
                const rowData = rows[r];
                const name = String(rowData[colNameKh] || "").trim();
                if (!name || name === "undefined") continue; 

                const id = String(rowData[colId] || `STU${Math.floor(Math.random() * 900000 + 100000)}`).trim();
                const existingIdx = (window.allStudents || []).findIndex(s => String(s.id).trim() === id);

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

                const stuYear = colYear > -1 && String(rowData[colYear] || '').trim() ? String(rowData[colYear]).trim() : currentYear;
                const schoolId = window.AuthState?.school_id || localStorage.getItem('school_id') || 'SCH-001';

                const newStu = {
                    id: id, 
                    school_id: schoolId,
                    teacher_id: currentTeacherId,
                    academic_year: stuYear,
                    name: name,
                    name_en: colNameEn > -1 ? String(rowData[colNameEn] || "").trim().toUpperCase() : "",
                    gender: String(rowData[colGender] || "ប្រុស").trim(), 
                    dob: rawDob, 
                    enrollment_date: rawEnroll,
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
                    grade: normalizeGrade(String(rowData[colGrade] || "ថ្នាក់ទី ១")), 
                    room: String(rowData[colRoom] || "«ក»").trim(), 
                    parent_contact: String(rowData[colContact] || "").trim(),
                    poor_id: parseBool(colPoor),
                    scholarship: parseBool(colScholar),
                    disability: parseBool(colDisability),
                    status: normStatus,
                    updated_at: new Date().toISOString()
                };

                if (existingIdx > -1) {
                    const oldRec = window.allStudents[existingIdx];
                    let hist = Array.isArray(oldRec.enrollment_history) ? [...oldRec.enrollment_history] : [{
                        grade: normalizeGrade(oldRec.grade),
                        room: oldRec.room || '«ក»',
                        academic_year: oldRec.academic_year || currentYear,
                        date: oldRec.enrollment_date || new Date().toISOString().split('T')[0],
                        status: oldRec.status || 'Active',
                        reason: 'ចុះឈ្មោះចូលរៀនដំបូង',
                        type: 'initial_enrollment',
                        created_at: oldRec.created_at || new Date().toISOString()
                    }];

                    if (normalizeGrade(oldRec.grade) !== newStu.grade || String(oldRec.room || '').trim() !== newStu.room) {
                        hist.push({
                            from_grade: normalizeGrade(oldRec.grade),
                            from_room: oldRec.room || '',
                            grade: newStu.grade,
                            room: newStu.room,
                            academic_year: currentYear,
                            date: new Date().toISOString().split('T')[0],
                            status: normStatus,
                            reason: "កែប្រែថ្នាក់/បន្ទប់តាមរយៈការនាំចូល Excel",
                            type: "excel_import_transfer",
                            created_at: new Date().toISOString()
                        });
                    }
                    newStu.enrollment_history = hist;
                    window.allStudents[existingIdx] = Object.assign({}, oldRec, newStu);
                    updatedCount++;
                } else {
                    newStu.enrollment_history = [{
                        grade: newStu.grade,
                        room: newStu.room,
                        academic_year: currentYear,
                        date: rawEnroll || new Date().toISOString().split('T')[0],
                        status: normStatus,
                        reason: "នាំចូលពីឯកសារ Excel",
                        type: "excel_import",
                        created_at: new Date().toISOString()
                    }];
                    window.allStudents.push(newStu);
                    newAdded++;
                }

                // Sync individual doc to Firestore if connected
                if (window.db && typeof window.saveStudentToFirebase === 'function') {
                    window.saveStudentToFirebase(newStu).catch(console.warn);
                }
            }
            
            if (typeof window.setMasterStudents === 'function') {
                window.setMasterStudents(window.allStudents);
            } else {
                localStorage.setItem('academic_students', JSON.stringify(window.allStudents));
            }
            
            const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
            if (sInfo.auto_sync && typeof window.apiPost === 'function') {
                window.apiPost("saveStudentsBatch", window.allStudents).catch(console.error);
            }

            event.target.value = ""; 
            window.filterStudents();

            if (typeof window.logAudit === 'function') {
                window.logAudit('IMPORT_STUDENTS_EXCEL', 'student', `បាននាំចូលសិស្សពី Excel សរុប ${newAdded + updatedCount} នាក់ (ថ្មី: ${newAdded}, ធ្វើបច្ចុប្បន្នភាព: ${updatedCount})`);
            }

            const summaryMsg = `📥 នាំចូលសិស្សបានជោគជ័យ សរុប៖ ${newAdded + updatedCount} នាក់ (បន្ថែមថ្មី: ${newAdded} នាក់, កែប្រែព័ត៌មាន: ${updatedCount} នាក់)`;
            if(typeof showToast === 'function') showToast(summaryMsg);
            else alert(summaryMsg);
        } catch (error) {
            console.error("Excel import error:", error); 
            alert("❌ មានបញ្ហាក្នុងការអានឯកសារ Excel។ សូមប្រាកដថាទម្រង់ឯកសារត្រឹមត្រូវ។");
        }
    };
    reader.readAsArrayBuffer(file);
};

window.exportStudentsExcel = function() {
    if (!window.filteredStudents || window.filteredStudents.length === 0) return alert("គ្មានទិន្នន័យសម្រាប់ទាញយកទេ!");
    let tableHtml = `<table border="1"><tr>
        <th>ល.រ</th><th>អត្តលេខ</th><th>គោត្តនាម និងនាម (ខ្មែរ)</th><th>ឈ្មោះជាអក្សរឡាតាំង</th><th>ភេទ</th>
        <th>ថ្ងៃខែឆ្នាំកំណើត</th><th>ថ្ងៃចូលរៀន</th>
        <th>ទីកន្លែងកំណើត(ភូមិ)</th><th>ទីកន្លែងកំណើត(ឃុំ)</th><th>ទីកន្លែងកំណើត(ស្រុក)</th><th>ទីកន្លែងកំណើត(ខេត្ត)</th>
        <th>ទីលំនៅ(ភូមិ)</th><th>ទីលំនៅ(ឃុំ)</th><th>ទីលំនៅ(ស្រុក)</th><th>ទីលំនៅ(ខេត្ត)</th>
        <th>ឈ្មោះឪពុក</th><th>មុខរបរឪពុក</th><th>ឈ្មោះម្ដាយ</th><th>មុខរបរម្ដាយ</th>
        <th>ថ្នាក់រៀន</th><th>បន្ទប់</th><th>ទំនាក់ទំនង</th>
        <th>ប័ណ្ណក្រីក្រ</th><th>អាហារូបករណ៍</th><th>ពិការភាព</th><th>ស្ថានភាព</th>
    </tr>`;
    
    window.filteredStudents.forEach((s, idx) => {
        let dobExport = formatDate(s.dob);
        let enrollExport = s.enrollment_date ? formatDate(s.enrollment_date) : "";
        let statusKhmer = "កំពុងសិក្សា";
        if (s.status === "Transferred") statusKhmer = "បានផ្ទេរចេញ";
        else if (s.status === "Graduated") statusKhmer = "បានបញ្ចប់ការសិក្សា";
        else if (s.status === "Inactive") statusKhmer = "មិនសកម្ម (ផ្អាក)";
        else if (s.status === "Withdrawn" || s.status === "Dropped") statusKhmer = "បានឈប់រៀន";

        tableHtml += `<tr>
            <td>${idx+1}</td>
            <td>${s.id}</td>
            <td>${s.name}</td>
            <td>${s.name_en || s.name_latin || ''}</td>
            <td>${s.gender}</td>
            <td>${dobExport}</td>
            <td>${enrollExport}</td>
            <td>${s.pob_village||''}</td><td>${s.pob_commune||''}</td><td>${s.pob_district||''}</td><td>${s.pob_province||''}</td>
            <td>${s.curr_village||''}</td><td>${s.curr_commune||''}</td><td>${s.curr_district||''}</td><td>${s.curr_province||''}</td>
            <td>${s.father_name||''}</td><td>${s.father_job||''}</td><td>${s.mother_name||''}</td><td>${s.mother_job||''}</td>
            <td>${normalizeGrade(s.grade)}</td><td>${s.room}</td><td>${s.parent_contact||''}</td>
            <td>${s.poor_id ? 'មាន' : 'គ្មាន'}</td>
            <td>${s.scholarship ? 'មាន' : 'គ្មាន'}</td>
            <td>${s.disability ? 'មាន' : 'គ្មាន'}</td>
            <td>${statusKhmer}</td>
        </tr>`;
    });
    tableHtml += `</table>`;
    const finalHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head><body>${tableHtml}</body></html>`;
    const blob = new Blob(['\ufeff', finalHtml], { type: 'application/vnd.ms-excel' });
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob); 
    link.download = `Student_List_${new Date().toISOString().split('T')[0]}.xls`; 
    link.click();
};



// ==========================================
// មុខងារទាញយកទិន្នន័យទាំងអស់ពី Cloud មកកុំព្យូទ័រវិញ (Manual Fetch All Data)
// ==========================================
window.fetchAllData = async function(btnEl = null) {
    let origText = "";
    
    // បង្ហាញសញ្ញាវិល (Loading state) លើប៊ូតុង
    if (btnEl) {
        origText = btnEl.innerHTML;
        btnEl.innerHTML = `<i class="fa-solid fa-spinner fa-spin text-indigo-500"></i> កំពុងទាញយក...`;
        btnEl.disabled = true;
    }

    try {
        if (typeof window.apiGet !== 'function') throw new Error("មុខងារ API មិនទាន់ដំណើរការ");

        // ទាញយកទិន្នន័យព្រមគ្នាពី Cloud (Students, Scores, Attendance, Settings)
        const [studentsRes, scoresRes, attRes] = await Promise.all([
            window.apiGet("getStudents", { status: "Active" }),
            window.apiGet("getScores"),
            window.apiGet("getAttendance")
        ]);

        // ១. ធ្វើបច្ចុប្បន្នភាពបញ្ជីសិស្ស
        if (studentsRes && studentsRes.status === "success") {
            const stuData = studentsRes.data || [];
            if (typeof window.setMasterStudents === 'function') {
                window.setMasterStudents(stuData);
            } else {
                localStorage.setItem('academic_students', JSON.stringify(stuData));
                if (typeof window.allStudents !== 'undefined') window.allStudents = stuData;
            }
        }

        // ២. ធ្វើបច្ចុប្បន្នភាពបញ្ជីពិន្ទុ
        if (scoresRes && scoresRes.status === "success") {
            localStorage.setItem('academic_scores', JSON.stringify(scoresRes.data || []));
        }

        // ៣. ធ្វើបច្ចុប្បន្នភាពបញ្ជីវត្តមាន
        if (attRes && attRes.status === "success") {
            localStorage.setItem('academic_attendance', JSON.stringify(attRes.data || []));
        }

        // បង្ហាញសារជោគជ័យ
        if (typeof showToast === 'function') showToast("🔄 បានទាញយកទិន្នន័យពី Cloud ជោគជ័យ!");

        // 🟢 ធ្វើបច្ចុប្បន្នភាព (Refresh) ផ្ទាំងដែលកំពុងបើកមើលជាក់ស្តែង 🟢
        setTimeout(() => {
            // បើកំពុងបើកផ្ទាំងបញ្ជីសិស្ស
            if (document.getElementById("studentsView") && !document.getElementById("studentsView").classList.contains("hidden")) {
                if (typeof window.filterStudents === 'function') window.filterStudents();
            } 
            // បើកំពុងបើកផ្ទាំង Dashboard
            else if (document.getElementById("dashboardView") && !document.getElementById("dashboardView").classList.contains("hidden")) {
                if (typeof window.fetchAndComputeClassDashboard === 'function') window.fetchAndComputeClassDashboard();
            }
            // បើកំពុងបើកផ្ទាំងពិន្ទុ
            else if (document.getElementById("scoresView") && !document.getElementById("scoresView").classList.contains("hidden")) {
                if (typeof window.fetchStudentsForScores === 'function') window.fetchStudentsForScores();
            }
        }, 300);

    } catch (error) {
        console.error("Fetch Data Error:", error);
        if (typeof showToast === 'function') showToast("បរាជ័យក្នុងការទាញយកទិន្នន័យពី Cloud!", true);
        else alert("បរាជ័យក្នុងការទាញយកទិន្នន័យ! សូមពិនិត្យអ៊ីនធឺណិត។");
    } finally {
        // ត្រឡប់ប៊ូតុងមកសភាពដើមវិញ
        if (btnEl) {
            btnEl.innerHTML = origText;
            btnEl.disabled = false;
        }
    }
};
