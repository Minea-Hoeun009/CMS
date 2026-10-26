// ==========================================================================
// ឯកសារ js/reports.js - ប្រព័ន្ធគ្រប់គ្រងរបាយការណ៍រដ្ឋបាលគ្រូ (KrouDigital Reports)
// ==========================================================================

window.reportDateSettings = {
    location: localStorage.getItem('rep_location') || "រាជធានីភ្នំពេញ",
    solarDate: localStorage.getItem('rep_solar_date') || "ថ្ងៃទី....... ខែ....... ឆ្នាំ២០....",
    lunarDate: localStorage.getItem('rep_lunar_date') || "ថ្ងៃ................. ខែ............. ឆ្នាំ......... ........ស័ក ព.ស.២៥....",
    showLunar: localStorage.getItem('rep_show_lunar') !== 'false'
};

window.handleReportClassChange = function() {
    const grade = document.getElementById("reportGradeSelect")?.value;
    const room = document.getElementById("reportRoomSelect")?.value;
    if (grade && room) {
        if (typeof window.setSelectedClass === 'function') window.setSelectedClass(grade, room);
        window.currentReportTargetGrade = grade;
        window.currentReportTargetRoom = room;
        const sub = document.getElementById("reportDetailSub");
        if (sub) sub.textContent = `ថ្នាក់ ${grade} ${room}`;
        const display = document.getElementById("reportHeaderGradeDisplay");
        if (display) display.textContent = `${grade} ${room}`;
        if (window.currentActiveReportType && document.getElementById("reportDetailContent") && !document.getElementById("reportDetailContent").classList.contains("hidden")) {
            window.openReportDetail(window.currentActiveReportType);
        }
    }
};

// ពេលទំព័រដើម Load រួចរាល់
window.loadReportsView = function() {
    const container = document.getElementById("reportsContainer");
    if (!container) return;

    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const activeClass = typeof window.getCurrentSelectedClass === 'function' ? window.getCurrentSelectedClass() : { level: "ថ្នាក់ទី ៤", room: "«ក»" };
    const curLevel = activeClass.level;
    const curRoom = activeClass.room;
    const gradeFull = `${curLevel} ${curRoom}`.trim();

    const gradesList = typeof window.getAllGradesList === 'function' ? window.getAllGradesList() : ["ថ្នាក់ទី ១", "ថ្នាក់ទី ២", "ថ្នាក់ទី ៣", "ថ្នាក់ទី ៤", "ថ្នាក់ទី ៥", "ថ្នាក់ទី ៦"];
    const roomsList = typeof window.getAllRoomsList === 'function' ? window.getAllRoomsList() : ["«ក»", "«ខ»", "«គ»", "«ឃ»"];
    const gradesOptions = gradesList.map(g => `<option value="${g}" ${g === curLevel ? 'selected' : ''}>${g}</option>`).join('');
    const roomsOptions = roomsList.map(r => `<option value="${r}" ${r === curRoom ? 'selected' : ''}>${r}</option>`).join('');

    container.innerHTML = `
        <div class="w-full h-full flex flex-col font-siemreap animate-fade-in relative max-w-[1600px] mx-auto pb-16">
            
            <!-- ផ្ទាំងកាតជម្រើសរបាយការណ៍ (Reports Dashboard) -->
            <div id="reportsMainDashboard" class="block w-full">
            <!-- 🟢 Executive Header 🟢 -->
            ${typeof window.renderExecutiveHeaderHTML === 'function' ? window.renderExecutiveHeaderHTML({
                title: "របាយការណ៍ផ្សេងៗ",
                subtitle: "មជ្ឈមណ្ឌលរបាយការណ៍រដ្ឋបាលគ្រូ សៀវភៅតាមដាន និងលទ្ធផលសិក្សា",
                icon: "fa-solid fa-folder-open",
                currentClass: gradeFull,
                clockId: "reportsHeaderClock",
                extraBadgesHtml: `
                    <span id="reportHeaderGradeDisplay" class="hidden">${gradeFull}</span>
                `
            }) : ''}

            <!-- ជ្រើសរើសថ្នាក់ និងបន្ទប់ សម្រាប់របាយការណ៍ -->
            <div class="bg-white dark:bg-slate-800 p-4 rounded-[1.8rem] shadow-sm border border-slate-200/80 dark:border-slate-700 mb-6 flex flex-wrap items-center justify-between gap-3 no-print">
                <div class="flex items-center gap-2">
                    <span class="text-xs font-bold text-slate-500 dark:text-slate-400"><i class="fa-solid fa-graduation-cap text-indigo-600"></i> ថ្នាក់ទទួលបន្ទុក៖</span>
                    <div class="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-1.5 shadow-inner">
                        <select id="reportGradeSelect" onchange="window.handleReportClassChange()" class="border-none bg-transparent text-xs sm:text-sm font-bold text-indigo-700 dark:text-indigo-300 outline-none cursor-pointer font-siemreap py-0 pr-1">
                            ${gradesOptions}
                        </select>
                        <span class="text-slate-300 dark:text-slate-500">|</span>
                        <select id="reportRoomSelect" onchange="window.handleReportClassChange()" class="border-none bg-transparent text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400 outline-none cursor-pointer font-moul py-0 pl-1">
                            ${roomsOptions}
                        </select>
                    </div>
                </div>

                <div class="flex items-center gap-2">
                    <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800">
                        <i class="fa-solid fa-file-invoice text-xs"></i> របាយការណ៍កម្រិតថ្នាក់
                    </span>
                </div>
            </div>

                <!-- Cards Grid - រចនាឡើងតាមស្តង់ដារ KrouDigital 4.0 -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
                    
                    <!-- KrouDigital Card 1: តារាងស្រង់ពិន្ទុ និងការវាយតម្លៃលទ្ធផលសិក្សា -->
                    <div onclick="window.openReportDetail('report_ka')" class="bg-white/90 backdrop-blur-md rounded-[2rem] p-6 shadow-sm hover:shadow-[0_20px_40px_rgb(79,70,229,0.18)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer border-2 border-indigo-100 hover:border-indigo-400 group flex flex-col justify-between h-[210px] relative overflow-hidden">
                        <div class="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out pointer-events-none"></div>
                        <div class="flex items-center justify-between relative z-10">
                            <div class="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl flex items-center justify-center text-2xl shadow-md shadow-indigo-500/30 group-hover:scale-110 transition-transform"><i class="fa-solid fa-file-lines"></i></div>
                            <span class="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full uppercase">KrouDigital 4.0</span>
                        </div>
                        <div class="relative z-10">
                            <h3 class="font-moul text-[15px] text-slate-900 mb-1.5 group-hover:text-indigo-600">តារាងស្រង់ពិន្ទុ និងការវាយតម្លៃលទ្ធផល</h3>
                            <p class="text-slate-500 text-[11px] leading-relaxed">តារាងស្រង់ពិន្ទុ មធ្យមភាគ ចំណាត់ថ្នាក់ និងនិទ្ទេសប្រចាំខែ/ឆមាស។</p>
                        </div>
                    </div>

                    <!-- KrouDigital Card 2: តារាងកិត្តិយសសិស្សឆ្នើម Top 5 -->
                    <div onclick="window.openReportDetail('report_kha')" class="bg-white/90 backdrop-blur-md rounded-[2rem] p-6 shadow-sm hover:shadow-[0_20px_40px_rgb(245,158,11,0.18)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer border-2 border-amber-100 hover:border-amber-400 group flex flex-col justify-between h-[210px] relative overflow-hidden">
                        <div class="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out pointer-events-none"></div>
                        <div class="flex items-center justify-between relative z-10">
                            <div class="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-2xl flex items-center justify-center text-2xl shadow-md shadow-amber-500/30 group-hover:scale-110 transition-transform"><i class="fa-solid fa-trophy"></i></div>
                            <span class="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full uppercase">Honor Roll</span>
                        </div>
                        <div class="relative z-10">
                            <h3 class="font-moul text-[15px] text-slate-900 mb-1.5 group-hover:text-amber-600">តារាងកិត្តិយសសិស្សឆ្នើម (Top 5)</h3>
                            <p class="text-slate-500 text-[11px] leading-relaxed">តារាងកិត្តិយសសិស្សឆ្នើម Top 5 ជាមួយរូបថតសម្រាប់បិទផ្សាយ។</p>
                        </div>
                    </div>

                    <!-- KrouDigital Card 3: លទ្ធផលសិក្សាប្រចាំឆមាស និងប្រចាំឆ្នាំ -->
                    <div onclick="window.openReportDetail('report_ko_kho')" class="bg-white/90 backdrop-blur-md rounded-[2rem] p-6 shadow-sm hover:shadow-[0_20px_40px_rgb(16,185,129,0.18)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer border-2 border-emerald-100 hover:border-emerald-400 group flex flex-col justify-between h-[210px] relative overflow-hidden">
                        <div class="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out pointer-events-none"></div>
                        <div class="flex items-center justify-between relative z-10">
                            <div class="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-600 text-white rounded-2xl flex items-center justify-center text-2xl shadow-md shadow-emerald-500/30 group-hover:scale-110 transition-transform"><i class="fa-solid fa-graduation-cap"></i></div>
                            <span class="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase">លទ្ធផលប្រចាំឆ្នាំ</span>
                        </div>
                        <div class="relative z-10">
                            <h3 class="font-moul text-[15px] text-slate-900 mb-1.5 group-hover:text-emerald-600">លទ្ធផលសិក្សាប្រចាំឆមាស និងប្រចាំឆ្នាំ</h3>
                            <p class="text-slate-500 text-[11px] leading-relaxed">សេចក្តីសម្រេចលទ្ធផលប្រចាំឆមាស និងប្រចាំឆ្នាំ (ឡើង/ត្រួតថ្នាក់)។</p>
                        </div>
                    </div>

                    <!-- KrouDigital Card 4: របាយការណ៍សុខភាព (BMI) -->
                    <div onclick="window.openReportDetail('health')" class="bg-white/90 backdrop-blur-md rounded-[2rem] p-6 shadow-sm hover:shadow-[0_20px_40px_rgb(244,63,94,0.18)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer border-2 border-rose-100 hover:border-rose-400 group flex flex-col justify-between h-[210px] relative overflow-hidden">
                        <div class="absolute -right-4 -top-4 w-24 h-24 bg-rose-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out pointer-events-none"></div>
                        <div class="flex items-center justify-between relative z-10">
                            <div class="w-14 h-14 bg-gradient-to-br from-rose-500 to-pink-600 text-white rounded-2xl flex items-center justify-center text-2xl shadow-md shadow-rose-500/30 group-hover:scale-110 transition-transform"><i class="fa-solid fa-heart-pulse"></i></div>
                            <span class="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full uppercase">Health &amp; BMI</span>
                        </div>
                        <div class="relative z-10">
                            <h3 class="font-moul text-[15px] text-slate-900 mb-1.5 group-hover:text-rose-600">របាយការណ៍សុខភាព</h3>
                            <p class="text-slate-500 text-[11px] leading-relaxed">គណនា BMI ស្វ័យប្រវត្ត (កម្ពស់-ទម្ងន់) ការពិនិត្យភ្នែក និងវ៉ាក់សាំង។</p>
                        </div>
                    </div>

                    <!-- KrouDigital Card 5: ប័ណ្ណសរសើរ / វិញ្ញាបនបត្រ -->
                    <div onclick="window.KrouDigital && window.KrouDigital.renderCertificateModal()" class="bg-white/90 backdrop-blur-md rounded-[2rem] p-6 shadow-sm hover:shadow-[0_20px_40px_rgb(217,119,6,0.18)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer border-2 border-amber-100 hover:border-amber-400 group flex flex-col justify-between h-[210px] relative overflow-hidden">
                        <div class="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out pointer-events-none"></div>
                        <div class="flex items-center justify-between relative z-10">
                            <div class="w-14 h-14 bg-gradient-to-br from-amber-500 to-yellow-600 text-white rounded-2xl flex items-center justify-center text-2xl shadow-md shadow-amber-500/30 group-hover:scale-110 transition-transform"><i class="fa-solid fa-certificate"></i></div>
                            <span class="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full uppercase">Print Certificate</span>
                        </div>
                        <div class="relative z-10">
                            <h3 class="font-moul text-[15px] text-slate-900 mb-1.5 group-hover:text-amber-600">ប័ណ្ណសរសើរផ្លូវការ</h3>
                            <p class="text-slate-500 text-[11px] leading-relaxed">បង្កើតប័ណ្ណសរសើរសិស្សពូកែ និងវិន័យល្អ បោះពុម្ពជាក្រដាស A4។</p>
                        </div>
                    </div>

                    <!-- KrouDigital Card 6: សៀវភៅតាមដានការសិក្សា -->
                    <div onclick="window.openTrackingBookModal ? window.openTrackingBookModal() : alert('Tracking book')" class="bg-white/90 backdrop-blur-md rounded-[2rem] p-6 shadow-sm hover:shadow-[0_20px_40px_rgb(99,102,241,0.18)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer border border-slate-100 group flex flex-col justify-between h-[210px] relative overflow-hidden">
                        <div class="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out pointer-events-none"></div>
                        <div class="w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl shadow-md shadow-indigo-500/30 group-hover:scale-110 transition-transform relative z-10"><i class="fa-solid fa-book-open-reader"></i></div>
                        <div class="relative z-10">
                            <h3 class="font-moul text-[15px] text-slate-900 mb-1.5 group-hover:text-indigo-600">សៀវភៅតាមដាន</h3>
                            <p class="text-slate-500 text-[11px] leading-relaxed">សៀវភៅតាមដានការសិក្សា (មួយសន្លឹកក្នុងសិស្សម្នាក់) ពេញមួយឆ្នាំ។</p>
                        </div>
                    </div>

                    <!-- Card 7: ស្ថិតិសិស្ស -->
                    <div onclick="window.openReportDetail('stats')" class="bg-white/90 backdrop-blur-md rounded-[2rem] p-6 shadow-sm hover:shadow-[0_20px_40px_rgb(59,130,246,0.15)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer border border-slate-100 group flex flex-col justify-between h-[210px] relative overflow-hidden">
                        <div class="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out pointer-events-none"></div>
                        <div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center text-2xl shadow-md shadow-blue-500/30 group-hover:scale-110 transition-transform relative z-10"><i class="fa-solid fa-chart-pie"></i></div>
                        <div class="relative z-10"><h3 class="font-moul text-[15px] text-slate-800 mb-1.5 group-hover:text-blue-700">តារាងស្ថិតិសិស្ស</h3><p class="text-slate-500 text-[11px] leading-relaxed">របាយការណ៍ចំនួនសិស្សដើមឆ្នាំ/ចុងឆ្នាំ បែងចែកតាមអាយុ និងភេទ។</p></div>
                    </div>

                    <!-- Card 8: វត្តមានប្រចាំខែ -->
                    <div onclick="window.openReportDetail('attendance')" class="bg-white/90 backdrop-blur-md rounded-[2rem] p-6 shadow-sm hover:shadow-[0_20px_40px_rgb(16,185,129,0.15)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer border border-slate-100 group flex flex-col justify-between h-[210px] relative overflow-hidden">
                        <div class="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out pointer-events-none"></div>
                        <div class="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-600 text-white rounded-2xl flex items-center justify-center text-2xl shadow-md shadow-emerald-500/30 group-hover:scale-110 transition-transform relative z-10"><i class="fa-solid fa-calendar-check"></i></div>
                        <div class="relative z-10"><h3 class="font-moul text-[15px] text-slate-800 mb-1.5 group-hover:text-emerald-600">របាយការណ៍វត្តមាន</h3><p class="text-slate-500 text-[11px] leading-relaxed">សរុបស្ថិតិអវត្តមានសិស្សប្រចាំខែ មានច្បាប់ និងឥតច្បាប់។</p></div>
                    </div>

                    <!-- Card 9: នាំចេញ Master Excel -->
                    <div onclick="window.AdvancedReports && window.AdvancedReports.exportMasterExcelWorkbook ? window.AdvancedReports.exportMasterExcelWorkbook() : alert('Export Master Excel')" class="bg-white/90 backdrop-blur-md rounded-[2rem] p-6 shadow-sm hover:shadow-[0_20px_40px_rgb(16,185,129,0.15)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer border border-slate-100 group flex flex-col justify-between h-[210px] relative overflow-hidden">
                        <div class="absolute -right-4 -top-4 w-24 h-24 bg-teal-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out pointer-events-none"></div>
                        <div class="w-14 h-14 bg-gradient-to-br from-teal-400 to-emerald-600 text-white rounded-2xl flex items-center justify-center text-2xl shadow-md shadow-emerald-500/30 group-hover:scale-110 transition-transform relative z-10"><i class="fa-solid fa-file-excel"></i></div>
                        <div class="relative z-10"><h3 class="font-moul text-[15px] text-slate-800 mb-1.5 group-hover:text-teal-600">Master Excel</h3><p class="text-slate-500 text-[11px] leading-relaxed">នាំចេញឯកសារ Excel ច្រើន Sheet រួមមាន បញ្ជីសិស្ស និងពិន្ទុ។</p></div>
                    </div>

                    <!-- Card 10: ច្រកពិនិត្យលទ្ធផលមាតាបិតា -->
                    <div onclick="window.KrouDigital && window.KrouDigital.openParentPortalModal()" class="bg-white/90 backdrop-blur-md rounded-[2rem] p-6 shadow-sm hover:shadow-[0_20px_40px_rgb(14,165,233,0.18)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer border-2 border-sky-100 hover:border-sky-400 group flex flex-col justify-between h-[210px] relative overflow-hidden">
                        <div class="absolute -right-4 -top-4 w-24 h-24 bg-sky-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out pointer-events-none"></div>
                        <div class="flex items-center justify-between relative z-10">
                            <div class="w-14 h-14 bg-gradient-to-br from-sky-400 to-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl shadow-md shadow-sky-500/30 group-hover:scale-110 transition-transform"><i class="fa-solid fa-magnifying-glass-chart"></i></div>
                            <span class="text-[10px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded-full uppercase">Parent Portal</span>
                        </div>
                        <div class="relative z-10">
                            <h3 class="font-moul text-[15px] text-slate-900 mb-1.5 group-hover:text-sky-600">ច្រកមាតាបិតា &amp; សិស្ស</h3>
                            <p class="text-slate-500 text-[11px] leading-relaxed">ស្វែងរកពិន្ទុ និងទាញយកព្រឹត្តិបត្រពិន្ទុសម្រាប់មាតាបិតា។</p>
                        </div>
                    </div>

                </div>
            </div>

            <!-- ផ្ទាំងបង្ហាញរបាយការណ៍លម្អិត (Report Detail View) -->
            <div id="reportDetailContent" class="hidden w-full h-full flex-col relative z-20 space-y-3">
                <!-- ផ្នែកទី ១៖ របារចំណងជើងរបាយការណ៍ (Section 1: Report Title Header Bar) -->
                <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-wrap justify-between items-center gap-3 z-40 sticky top-0 no-print">
                    <div class="flex items-center gap-3">
                        <button onclick="window.closeReportDetail()" class="w-10 h-10 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-rose-600 dark:hover:text-white flex items-center justify-center transition-all shadow-inner active:scale-90 shrink-0" title="ត្រឡប់ក្រោយ (Back)">
                            <i class="fa-solid fa-arrow-left text-lg"></i>
                        </button>
                        <div>
                            <h2 id="reportDetailTitle" class="font-moul text-slate-800 dark:text-white text-sm sm:text-base md:text-lg leading-snug">ចំណងជើងរបាយការណ៍</h2>
                            <p id="reportDetailSub" class="text-xs text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">ថ្នាក់ ${gradeFull}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-bold border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 shadow-sm">
                            <i class="fa-solid fa-file-lines"></i> <span>ឯកសាររដ្ឋបាល</span>
                        </span>
                    </div>
                </div>

                <!-- ផ្នែកទី ២៖ របារកំណត់ប្រភេទក្រដាស និងការបោះពុម្ព (Section 2: Paper Settings & Print Toolbar Under Title) -->
                <div id="reportPrintConfigBar" class="bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-800 dark:via-slate-850 dark:to-slate-800 p-3 sm:p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-wrap justify-between items-center gap-3 z-30 no-print">
                    <!-- ផ្នែកខាងឆ្វេង៖ តម្រងទិន្នន័យ (Filters: ខែ / ទម្រង់បញ្ជី / រក្សាទុក) -->
                    <div id="reportExtraControls" class="flex flex-wrap items-center gap-2"></div>

                    <!-- ផ្នែកខាងស្តាំ៖ ការកំណត់ប្រភេទក្រដាស ទិសដៅ មាត្រដ្ឋាន និងប៊ូតុងព្រីន -->
                    <div id="reportDetailPrintToolbarArea" class="flex flex-wrap items-center gap-2">
                        ${window.CMSPrintManager ? window.CMSPrintManager.renderToolbarHtml('reportPaperArea', 'portrait', 'A4', 100) : `
                            <button onclick="window.printCurrentReport()" class="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/30 transition flex items-center gap-2 active:scale-95 outline-none">
                                <i class="fa-solid fa-print"></i> បោះពុម្ព
                            </button>
                        `}
                    </div>
                </div>

                <!-- ផ្នែកទី ៣៖ ផ្ទាំងការងារក្រដាសរបាយការណ៍ (Section 3: Realistic Paper Canvas) -->
                <div class="w-full flex-1 overflow-x-auto custom-scrollbar flex justify-center pb-16 pt-2">
                    <div id="reportPaperArea" class="transition-all relative flex justify-center items-start">
                        <!-- Content goes here -->
                    </div>
                </div>
            </div>
        </div>
    `;
};

window.openReportDetail = function(reportType) {
    window.currentActiveReportType = reportType;
    document.getElementById("reportsMainDashboard").classList.add("hidden");
    document.getElementById("reportDetailContent").classList.remove("hidden");
    document.getElementById("reportDetailContent").classList.add("flex");

    const activeClass = typeof window.getCurrentSelectedClass === 'function' ? window.getCurrentSelectedClass() : { level: "ថ្នាក់ទី ៤", room: "«ក»" };
    const curLevel = document.getElementById("reportGradeSelect")?.value || activeClass.level;
    const curRoom = document.getElementById("reportRoomSelect")?.value || activeClass.room;
    window.currentReportTargetGrade = curLevel;
    window.currentReportTargetRoom = curRoom;
    const gradeFull = `${curLevel} ${curRoom}`.trim();

    const titleEl = document.getElementById("reportDetailTitle");
    const subEl = document.getElementById("reportDetailSub");
    if (subEl) subEl.textContent = `ថ្នាក់ ${gradeFull}`;
    const paperArea = document.getElementById("reportPaperArea");
    const extraControls = document.getElementById("reportExtraControls");

    paperArea.innerHTML = `<div class="w-full h-full flex flex-col items-center justify-center text-slate-400 py-20"><i class="fa-solid fa-spinner fa-spin text-4xl mb-4 text-indigo-400"></i><p>កំពុងទាញយកទិន្នន័យ...</p></div>`;
    
    if (extraControls) {
        extraControls.innerHTML = '';
        extraControls.classList.add("hidden");
    }

    const khmerMonths = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];
    const curMonth = localStorage.getItem('selected_assessment_month') || "មករា";

    setTimeout(() => {
        if (reportType === 'report_ka') {
            titleEl.textContent = `តារាងស្រង់ពិន្ទុ និងការវាយតម្លៃលទ្ធផលសិក្សា (${gradeFull})`;
            if (extraControls) {
                extraControls.classList.remove("hidden");
                extraControls.innerHTML = `
                    <div class="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-2.5 py-1 text-xs">
                        <span class="font-bold text-slate-600 dark:text-slate-300">ខែ៖</span>
                        <select onchange="localStorage.setItem('selected_assessment_month', this.value); if(window.KrouDigital) window.KrouDigital.renderReportKa(document.getElementById('reportPaperArea'), '${curLevel}', '${curRoom}');" class="bg-transparent font-bold text-indigo-600 dark:text-indigo-400 outline-none cursor-pointer">
                            ${khmerMonths.map(m => `<option value="${m}" ${m === curMonth ? 'selected' : ''}>${m}</option>`).join('')}
                        </select>
                    </div>
                `;
            }
            if (window.CMSPrintManager) window.CMSPrintManager.updateToolbarDefaults('reportPaperArea', 'landscape', 'A4', 100);
            if (window.KrouDigital && typeof window.KrouDigital.renderReportKa === 'function') {
                window.KrouDigital.renderReportKa(paperArea, curLevel, curRoom);
            }
        } else if (reportType === 'report_kha') {
            titleEl.textContent = `តារាងកិត្តិយសសិស្សឆ្នើម Top 5 (${gradeFull})`;
            if (extraControls) {
                extraControls.classList.remove("hidden");
                extraControls.innerHTML = `
                    <div class="flex items-center gap-1.5 bg-amber-50 dark:bg-slate-700 border border-amber-200 dark:border-slate-600 rounded-xl px-2.5 py-1 text-xs">
                        <span class="font-bold text-amber-900 dark:text-amber-300">ខែ៖</span>
                        <select onchange="localStorage.setItem('selected_assessment_month', this.value); if(window.KrouDigital) window.KrouDigital.renderReportKha(document.getElementById('reportPaperArea'), '${curLevel}', '${curRoom}');" class="bg-transparent font-bold text-amber-700 dark:text-amber-400 outline-none cursor-pointer">
                            ${khmerMonths.map(m => `<option value="${m}" ${m === curMonth ? 'selected' : ''}>${m}</option>`).join('')}
                        </select>
                    </div>
                `;
            }
            if (window.CMSPrintManager) window.CMSPrintManager.updateToolbarDefaults('reportPaperArea', 'portrait', 'A4', 100);
            if (window.KrouDigital && typeof window.KrouDigital.renderReportKha === 'function') {
                window.KrouDigital.renderReportKha(paperArea, curLevel, curRoom);
            }
        } else if (reportType === 'report_ko_kho') {
            titleEl.textContent = `លទ្ធផលសិក្សាប្រចាំឆមាស និងប្រចាំឆ្នាំ (${gradeFull})`;
            if (window.CMSPrintManager) window.CMSPrintManager.updateToolbarDefaults('reportPaperArea', 'landscape', 'A4', 100);
            if (window.KrouDigital && typeof window.KrouDigital.renderReportKoKho === 'function') {
                window.KrouDigital.renderReportKoKho(paperArea, curLevel, curRoom);
            }
        } else if (reportType === 'health') {
            titleEl.textContent = `របាយការណ៍ និងការតាមដានសុខភាពសិស្ស (BMI, ភ្នែក, វ៉ាក់សាំង - ${gradeFull})`;
            if (extraControls) {
                extraControls.classList.remove("hidden");
                extraControls.innerHTML = `
                    <button onclick="window.KrouDigital.saveHealthRecords()" class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition active:scale-95">
                        <i class="fa-solid fa-floppy-disk"></i> <span>រក្សាទុកសុខភាព</span>
                    </button>
                `;
            }
            if (window.CMSPrintManager) window.CMSPrintManager.updateToolbarDefaults('reportPaperArea', 'landscape', 'A4', 100);
            if (window.KrouDigital && typeof window.KrouDigital.renderHealthTracker === 'function') {
                window.KrouDigital.renderHealthTracker(paperArea, curLevel, curRoom);
            }
        } else if (reportType === 'certificate') {
            titleEl.textContent = `ប័ណ្ណសរសើរផ្លូវការ (Honor Praise Certificates - ${gradeFull})`;
            if (window.KrouDigital && typeof window.KrouDigital.renderCertificateModal === 'function') {
                window.KrouDigital.renderCertificateModal(null, 1, curLevel);
            }
        } else if (reportType === 'stats') {
            titleEl.textContent = "តារាងស្ថិតិសិស្ស";
            if (window.CMSPrintManager) window.CMSPrintManager.updateToolbarDefaults('reportPaperArea', 'portrait', 'A4', 100);
            window.renderStudentStatsReportHTML(paperArea, curLevel, curRoom);
        } else if (reportType === 'attendance') {
            titleEl.textContent = "របាយការណ៍វត្តមានប្រចាំខែ";
            if (extraControls) {
                extraControls.classList.remove("hidden");
                extraControls.innerHTML = `
                    <div class="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-2.5 py-1 text-xs">
                        <span class="font-bold text-slate-600 dark:text-slate-300">ប្រភេទ៖</span>
                        <select id="attReportType" onchange="window.updateAttendanceReportPreview()" class="bg-transparent font-bold text-emerald-700 dark:text-emerald-400 outline-none cursor-pointer">
                            <option value="monthly">ប្រចាំខែ</option>
                            <option value="semester">ប្រចាំឆមាស</option>
                            <option value="annual">ប្រចាំឆ្នាំ</option>
                        </select>
                        <span class="font-bold text-slate-400 mx-0.5">|</span>
                        <span class="font-bold text-slate-600 dark:text-slate-300">ជ្រើសរើស៖</span>
                        <select id="attReportValue" onchange="window.updateAttendanceReportPreview()" class="bg-transparent font-bold text-slate-700 dark:text-white outline-none cursor-pointer"></select>
                    </div>
                `;
            }
            if (window.CMSPrintManager) window.CMSPrintManager.updateToolbarDefaults('reportPaperArea', 'landscape', 'A4', 100);
            if(typeof window.renderAttendanceReportHTML === 'function') {
                window.renderAttendanceReportHTML(paperArea, curLevel, curRoom);
            } else {
                paperArea.innerHTML = `<div class="text-center p-12 bg-amber-50/50 rounded-2xl border border-amber-200 text-amber-800 font-siemreap max-w-md mx-auto my-10 shadow-sm animate-fade-in"><i class="fa-solid fa-clock-rotate-left text-3xl mb-3 text-amber-500"></i><h4 class="font-moul text-base mb-1">របាយការណ៍នេះគ្រោងនឹងដាក់ឱ្យប្រើប្រាស់ឆាប់ៗ</h4><p class="text-xs text-amber-600 leading-relaxed">មុខងារនេះស្ថិតក្នុងដំណាក់កាលអភិវឌ្ឍ (In Progress/Planned)។ សូមជ្រើសរើសរបាយការណ៍ស្តង់ដាផ្សេងទៀតជាបណ្តោះអាសន្ន។</p></div>`;
            }
        } else if (reportType === 'students') {
            titleEl.textContent = "បញ្ជីរាយនាមសិស្ស";
            if (extraControls) {
                extraControls.classList.remove("hidden");
                extraControls.innerHTML = `
                    <div class="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-2.5 py-1 text-xs">
                        <span class="font-bold text-slate-600 dark:text-slate-300">ទម្រង់បញ្ជី៖</span>
                        <select id="stListType" onchange="window.handleStudentListTypeChange()" class="bg-transparent font-bold text-indigo-600 dark:text-indigo-400 outline-none cursor-pointer">
                            <option value="detailed" selected>បញ្ជីលម្អិត (១១ក្រឡោន)</option>
                            <option value="simple">បញ្ជីសង្ខេប (ទូទៅ)</option>
                        </select>
                    </div>
                `;
            }
            if (window.CMSPrintManager) window.CMSPrintManager.updateToolbarDefaults('reportPaperArea', 'landscape', 'A4', 100);
            if(typeof window.renderStudentListReportHTML === 'function') {
                window.renderStudentListReportHTML(paperArea, curLevel, curRoom);
            } else {
                paperArea.innerHTML = `<div class="text-center p-12 bg-amber-50/50 rounded-2xl border border-amber-200 text-amber-800 font-siemreap max-w-md mx-auto my-10 shadow-sm animate-fade-in"><i class="fa-solid fa-clock-rotate-left text-3xl mb-3 text-amber-500"></i><h4 class="font-moul text-base mb-1">របាយការណ៍នេះគ្រោងនឹងដាក់ឱ្យប្រើប្រាស់ឆាប់ៗ</h4><p class="text-xs text-amber-600 leading-relaxed">មុខងារនេះស្ថិតក្នុងដំណាក់កាលអភិវឌ្ឍ (In Progress/Planned)។ សូមជ្រើសរើសរបាយការណ៍ស្តង់ដាផ្សេងទៀតជាបណ្តោះអាសន្ន។</p></div>`;
            }
        } else if (reportType === 'scores') {
            titleEl.textContent = "របាយការណ៍លទ្ធផលសិក្សា";
            if (window.CMSPrintManager) window.CMSPrintManager.updateToolbarDefaults('reportPaperArea', 'portrait', 'A4', 100);
            if(typeof window.renderScoresReportHTML === 'function') {
                window.renderScoresReportHTML(paperArea, curLevel, curRoom);
            } else {
                paperArea.innerHTML = `<div class="text-center p-12 bg-amber-50/50 rounded-2xl border border-amber-200 text-amber-800 font-siemreap max-w-md mx-auto my-10 shadow-sm animate-fade-in"><i class="fa-solid fa-clock-rotate-left text-3xl mb-3 text-amber-500"></i><h4 class="font-moul text-base mb-1">របាយការណ៍នេះគ្រោងនឹងដាក់ឱ្យប្រើប្រាស់ឆាប់ៗ</h4><p class="text-xs text-amber-600 leading-relaxed">មុខងារនេះស្ថិតក្នុងដំណាក់កាលអភិវឌ្ឍ (In Progress/Planned)។ សូមជ្រើសរើសរបាយការណ៍ស្តង់ដាផ្សេងទៀតជាបណ្តោះអាសន្ន។</p></div>`;
            }
        } else if (reportType === 'structure') {
            titleEl.textContent = "រចនាសម្ព័ន្ធថ្នាក់រៀន";
            if (window.CMSPrintManager) window.CMSPrintManager.updateToolbarDefaults('reportPaperArea', 'portrait', 'A4', 100);
            if(typeof window.renderClassStructureHTML === 'function') {
                window.renderClassStructureHTML(paperArea, curLevel, curRoom);
            } else {
                paperArea.innerHTML = `<div class="text-center p-12 bg-amber-50/50 rounded-2xl border border-amber-200 text-amber-800 font-siemreap max-w-md mx-auto my-10 shadow-sm animate-fade-in"><i class="fa-solid fa-clock-rotate-left text-3xl mb-3 text-amber-500"></i><h4 class="font-moul text-base mb-1">របាយការណ៍នេះគ្រោងនឹងដាក់ឱ្យប្រើប្រាស់ឆាប់ៗ</h4><p class="text-xs text-amber-600 leading-relaxed">មុខងារនេះស្ថិតក្នុងដំណាក់កាលអភិវឌ្ឍ (In Progress/Planned)។ សូមជ្រើសរើសរបាយការណ៍ស្តង់ដាផ្សេងទៀតជាបណ្តោះអាសន្ន។</p></div>`;
            }
        }
    }, 150);
};

window.closeReportDetail = function() {
    document.getElementById("reportDetailContent").classList.add("hidden");
    document.getElementById("reportDetailContent").classList.remove("flex");
    document.getElementById("reportsMainDashboard").classList.remove("hidden");
};

window.printCurrentReport = function() {
    const paperArea = document.getElementById("reportPaperArea");
    if (!paperArea) {
        window.print();
        return;
    }
    const titleEl = document.getElementById("reportDetailTitle");
    const isLandscape = window.currentActiveReportType === 'report_ka' || 
                        window.currentActiveReportType === 'report_ko_kho' || 
                        window.currentActiveReportType === 'health' || 
                        window.currentActiveReportType === 'attendance';
    
    if (window.CMSPrintManager) {
        const paper = document.getElementById("print_paper_reportPaperArea")?.value || 'A4';
        const orient = document.getElementById("print_orient_reportPaperArea")?.value || (isLandscape ? 'landscape' : 'portrait');
        const scale = document.getElementById("print_scale_reportPaperArea")?.value || 100;
        window.CMSPrintManager.print(paperArea, {
            paperSize: paper,
            orientation: orient,
            scale: parseInt(scale, 10),
            title: titleEl ? titleEl.textContent : "របាយការណ៍"
        });
    } else {
        window.print();
    }
};

window.updateReportViewSettings = function() {
    const paperArea = document.getElementById("reportPaperArea");
    if (paperArea) {
        const curLevel = document.getElementById("reportGradeSelect")?.value;
        const curRoom = document.getElementById("reportRoomSelect")?.value;
        window.renderStudentStatsReportHTML(paperArea, curLevel, curRoom);
    }
};

// ==========================================================================
// ២. មុខងារគូសតារាង A4 ស្ថិតិសិស្ស (ដែលរៀបចំថ្មី)
// ==========================================================================
window.renderStudentStatsReportHTML = function(container, targetGrade, targetRoom) {
    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const academicYear = document.getElementById("globalAcademicYear")?.value || sInfo.academic_year || "២០២៦-២០២៧";
    const activeClass = typeof window.getCurrentSelectedClass === 'function' ? window.getCurrentSelectedClass() : { level: "ថ្នាក់ទី ៤", room: "«ក»" };
    const curLevel = targetGrade || window.currentReportTargetGrade || document.getElementById("reportGradeSelect")?.value || activeClass.level || sInfo.teacher_level || "ថ្នាក់ទី ៤";
    const curRoom = targetRoom || window.currentReportTargetRoom || document.getElementById("reportRoomSelect")?.value || activeClass.room || sInfo.teacher_room || "«ក»";
    const gradeFull = `${curLevel} ${curRoom}`.trim();
    
    // ទាញយកព័ត៌មានពីការកំណត់ (Settings)
    const districtName = (sInfo.district || "កៀនស្វាយ").replace(/^ស្រុក\s*/, '').trim(); 
    const provinceName = sInfo.province || "កណ្តាល";
    const schoolName = sInfo.school_name || "សាលាបឋមសិក្សា ខ្សុំ";
    const principalName = sInfo.principal_name || "";
    const teacherName = (window.AuthState ? window.AuthState.teacherName : null) || localStorage.getItem('auth_teacher_name') || sInfo.teacher_name || "";
    const teacherGender = sInfo.teacher_gender || "ប្រុស";
    const teacherAge = sInfo.teacher_age || "៣០"; 
    const teacherEthnicity = sInfo.teacher_ethnicity || "ខ្មែរ"; 
    const teacherEducation = sInfo.teacher_edu || "បរិញ្ញាបត្រ"; 
    const teacherExperience = sInfo.teacher_exp || "៥ឆ្នាំ"; 

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
    
    // គណនាទិន្នន័យអាយុពីបញ្ជីសិស្សតាមថ្នាក់ដែលបានជ្រើសរើស (Single Source of Truth)
    const studentsInClass = typeof window.getStudentsForClass === 'function'
        ? window.getStudentsForClass(curLevel, curRoom, academicYear)
        : [];
    let totalStus = studentsInClass.length;
    let femaleStus = studentsInClass.filter(s => s.gender === 'ស្រី').length;
    
    let ageStats = {
        '6': { t: 0, f: 0 }, '7': { t: 0, f: 0 }, '8': { t: 0, f: 0 }, '9': { t: 0, f: 0 },
        '10': { t: 0, f: 0 }, '11': { t: 0, f: 0 }, '12': { t: 0, f: 0 }, '13': { t: 0, f: 0 },
        '14': { t: 0, f: 0 }, '15+': { t: 0, f: 0 }
    };

    let refYear = parseInt(academicYear.split('-')[0]) || new Date().getFullYear();

    studentsInClass.forEach(s => {
        let age = 10; 
        if (s.dob) {
            try {
                let birthYear = parseInt(s.dob.split(/[-/]/)[0]);
                if (birthYear > 1900) { age = refYear - birthYear; }
                else { age = refYear - parseInt(s.dob.split(/[-/]/)[2]); }
            } catch(e) {}
        }
        
        let ageKey = age >= 15 ? '15+' : age.toString();
        if (ageStats[ageKey]) {
            ageStats[ageKey].t++;
            if (s.gender === 'ស្រី') ageStats[ageKey].f++;
        } else if (age < 6) {
            ageStats['6'].t++; if (s.gender === 'ស្រី') ageStats['6'].f++;
        }
    });

    let ageRowsHtml = "";
    Object.keys(ageStats).forEach(key => {
        let tVal = ageStats[key].t === 0 ? "0" : ageStats[key].t;
        let fVal = ageStats[key].f === 0 ? "0" : ageStats[key].f;
        
        ageRowsHtml += `<tr>
            <td class="text-center">${key}</td>
            <td><div class="box-input" contenteditable="true">${tVal}</div></td>
            <td><div class="box-input text-red-600" contenteditable="true">${fVal}</div></td>
            <td><div class="box-input" contenteditable="true">0</div></td>
            <td><div class="box-input text-red-600" contenteditable="true">0</div></td>
            <td class="bg-slate-50 font-bold">${tVal}</td>
            <td class="bg-slate-50 font-bold text-red-600">${fVal}</td>
        </tr>`;
    });

    container.innerHTML = `
        <div id="studentStatsPrintArea" class="bg-white p-6 md:p-10 w-full shadow-[0_10px_40px_rgba(0,0,0,0.08)] rounded-xl border border-slate-200 text-slate-800" style="max-width: 210mm; min-height: 297mm; font-family: 'Khmer OS Siemreap', sans-serif;">
            
            <style>
                .form-table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
                .form-table th, .form-table td { border: 1px solid #94a3b8; padding: 4px; text-align: center; vertical-align: middle; }
                .form-table th { color: #1e3a8a; font-weight: bold; font-family: 'Siemreap', sans-serif; background-color: #f8fafc; }
                
                .form-section { margin-bottom: 15px; }
                .form-header { 
                    background-color: #1e3a8a; 
                    color: white; 
                    padding: 6px 10px; 
                    border-radius: 6px 6px 0 0; 
                    font-family: 'Moul', serif; 
                    font-size: 12.5px; 
                    border: 1px solid #1e3a8a;
                    display: flex;
                    flex-direction: column;
                }
                .form-header .sub-text {
                    font-family: 'Siemreap', sans-serif;
                    font-size: 10px;
                    font-weight: normal;
                    color: #cbd5e1;
                    margin-top: 2px;
                }
                .form-wrapper { 
                    border: 1px solid #1e3a8a; 
                    border-top: none; 
                    border-radius: 0 0 6px 6px; 
                    overflow: hidden; 
                }

                .box-input {
                    border: 1px solid #cbd5e1;
                    border-radius: 2px;
                    display: inline-block;
                    padding: 1px 4px;
                    min-width: 20px;
                    text-align: center;
                    font-family: 'Arial', sans-serif;
                    font-weight: bold;
                    color: #475569;
                    outline: none;
                    background: #ffffff;
                }
                .box-input-text {
                    border: 1px solid #cbd5e1;
                    border-radius: 2px;
                    display: inline-block;
                    padding: 2px 6px;
                    min-width: 100px;
                    text-align: left;
                    font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif;
                    font-weight: bold;
                    color: #1e3a8a;
                    outline: none;
                    background: #ffffff;
                }
                .box-input:focus, .box-input-text:focus {
                    border-color: #3b82f6;
                    background: #eff6ff;
                }
                
                .table-1 td { padding: 5px 10px; border: 1px solid #cbd5e1; }
                .table-1 td:first-child { text-align: right; width: 45%; color: #475569; }
                .table-1 td:last-child { text-align: left; }
            </style>

            <div class="flex justify-between items-start mb-6">
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
                <h1 class="font-moul text-xl text-blue-900 mb-2">តារាងចំនួនសិស្សតាមថ្នាក់ (សម្រាប់គ្រូ)</h1>
                <h2 class="font-moul text-sm text-red-600">${gradeFull} | ឆ្នាំសិក្សា ${window.toKhmerNum(academicYear)}</h2>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-0 items-start">
                
                <!-- ជួរខាងឆ្វេង (Left Column) -->
                <div class="flex flex-col gap-0">
                    
                    <div class="form-section">
                        <div class="form-header">១. ព័ត៌មានគ្រូបន្ទុកថ្នាក់ទី ${gradeFull.replace('ថ្នាក់ទី ', '')}</div>
                        <div class="form-wrapper">
                            <table class="form-table table-1 !border-0">
                                <tr><td>ឈ្មោះគ្រូបន្ទុកថ្នាក់</td><td><div class="box-input-text font-moul" contenteditable="true">${teacherName}</div></td></tr>
                                <tr><td>ភេទ</td><td><div class="box-input-text font-moul" contenteditable="true">${teacherGender}</div></td></tr>
                                <tr><td>អាយុ</td><td><div class="box-input-text font-moul" contenteditable="true">${teacherAge}</div></td></tr>
                                <tr><td>ជនជាតិដើមភាគតិច</td><td><div class="box-input-text font-moul" contenteditable="true">${teacherEthnicity}</div></td></tr>
                                <tr><td>កម្រិតវប្បធម៌</td><td><div class="box-input-text font-moul" contenteditable="true">${teacherEducation}</div></td></tr>
                                <tr><td>រយៈពេលបម្រើការងារ</td><td><div class="box-input-text font-moul" contenteditable="true">${teacherExperience}</div></td></tr>
                                <tr><td>កម្រិតថ្នាក់បង្រៀន</td><td><div class="box-input-text font-moul" contenteditable="true">${gradeFull.replace('ថ្នាក់ទី ', '')}</div></td></tr>
                            </table>
                        </div>
                    </div>

                    <div class="form-section">
                        <div class="form-header">២.(ខ) សិស្សថ្មី សិស្សឡើងថ្នាក់ និង សិស្សត្រួតថ្នាក់</div>
                        <div class="form-wrapper">
                            <table class="form-table !border-0">
                                <thead>
                                    <tr>
                                        <th rowspan="2" class="w-[15%]">អាយុ<br>(ឆ្នាំ)</th>
                                        <th colspan="2">សិស្សថ្មី</th>
                                        <th colspan="2">សិស្សត្រួតថ្នាក់</th>
                                        <th colspan="2">សិស្សសរុប</th>
                                    </tr>
                                    <tr>
                                        <th>សរុប</th><th>ស្រី</th>
                                        <th>សរុប</th><th>ស្រី</th>
                                        <th>សរុប</th><th>ស្រី</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${ageRowsHtml}
                                    <tr class="font-bold bg-slate-100">
                                        <td>សរុប</td>
                                        <td><div class="box-input" contenteditable="true">${totalStus}</div></td>
                                        <td><div class="box-input text-red-600" contenteditable="true">${femaleStus}</div></td>
                                        <td><div class="box-input" contenteditable="true">0</div></td>
                                        <td><div class="box-input text-red-600" contenteditable="true">0</div></td>
                                        <td class="text-blue-800">${totalStus}</td><td class="text-pink-700">${femaleStus}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <div class="form-header">៤. សិស្សជាជនជាតិដើមភាគតិច</div>
                        <div class="form-wrapper">
                            <table class="form-table !border-0">
                                <thead>
                                    <tr>
                                        <th rowspan="2" class="bg-blue-50/50 w-1/3">ក្រុមអាយុ</th>
                                        <th colspan="2">សិស្សជនជាតិដើមភាគតិច</th>
                                    </tr>
                                    <tr><th>សរុប</th><th>ស្រី</th></tr>
                                </thead>
                                <tbody>
                                    <tr><td class="bg-slate-50">៦ឆ្នាំ</td><td><div class="box-input" contenteditable="true">0</div></td><td><div class="box-input text-red-600" contenteditable="true">0</div></td></tr>
                                    <tr><td class="bg-slate-50">៧-១១ឆ្នាំ</td><td><div class="box-input" contenteditable="true">0</div></td><td><div class="box-input text-red-600" contenteditable="true">0</div></td></tr>
                                    <tr><td class="bg-slate-50">១២+</td><td><div class="box-input" contenteditable="true">0</div></td><td><div class="box-input text-red-600" contenteditable="true">0</div></td></tr>
                                    <tr class="font-bold bg-slate-100 text-blue-900"><td class="text-center">សរុប</td><td><div class="box-input" contenteditable="true">0</div></td><td><div class="box-input text-red-600" contenteditable="true">0</div></td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- ជួរខាងស្តាំ (Right Column) -->
                <div class="flex flex-col gap-0">
                    
                    <div class="form-section">
                        <div class="form-header">
                            <div>២.(ក) ចំនួនសិស្សថ្នាក់ទី១ បន្តមកពីមត្តេយ្យ</div>
                            <div class="sub-text">(ក្រៅពីថ្នាក់ទី១ មិនចាំបាច់បញ្ចូលតារាង ២.(ក)នេះទេ)</div>
                        </div>
                        <div class="form-wrapper">
                            <table class="form-table !border-0">
                                <thead>
                                    <tr>
                                        <th rowspan="3" class="text-center px-2">ប្រភេទ</th>
                                        <th colspan="4">ថ្នាក់ទី១ (សិស្សម្នាក់អាចរាប់បានតែម្តង)</th>
                                    </tr>
                                    <tr>
                                        <th colspan="2">សិស្សថ្មី</th>
                                        <th colspan="2">សិស្សត្រួតថ្នាក់</th>
                                    </tr>
                                    <tr>
                                        <th>សរុប</th><th>ស្រី</th>
                                        <th>សរុប</th><th>ស្រី</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td class="text-left pl-3">មត្តេយ្យរដ្ឋ</td><td><div class="box-input" contenteditable="true">0</div></td><td><div class="box-input text-red-600" contenteditable="true">0</div></td><td><div class="box-input" contenteditable="true">0</div></td><td><div class="box-input text-red-600" contenteditable="true">0</div></td></tr>
                                    <tr><td class="text-left pl-3">មត្តេយ្យឯកជន</td><td><div class="box-input" contenteditable="true">0</div></td><td><div class="box-input text-red-600" contenteditable="true">0</div></td><td><div class="box-input" contenteditable="true">0</div></td><td><div class="box-input text-red-600" contenteditable="true">0</div></td></tr>
                                    <tr><td class="text-left pl-3">មត្តេយ្យសហគមន៍</td><td><div class="box-input" contenteditable="true">0</div></td><td><div class="box-input text-red-600" contenteditable="true">0</div></td><td><div class="box-input" contenteditable="true">0</div></td><td><div class="box-input text-red-600" contenteditable="true">0</div></td></tr>
                                    <tr><td class="text-left pl-3">ការអប់រំតាមផ្ទះ</td><td><div class="box-input" contenteditable="true">0</div></td><td><div class="box-input text-red-600" contenteditable="true">0</div></td><td><div class="box-input" contenteditable="true">0</div></td><td><div class="box-input text-red-600" contenteditable="true">0</div></td></tr>
                                    <tr><td class="text-left pl-3">កម្មវិធីត្រៀមថ្នាក់ទី១</td><td><div class="box-input" contenteditable="true">0</div></td><td><div class="box-input text-red-600" contenteditable="true">0</div></td><td><div class="box-input" contenteditable="true">0</div></td><td><div class="box-input text-red-600" contenteditable="true">0</div></td></tr>
                                    <tr class="font-bold bg-slate-100"><td class="text-center">សរុប</td><td>0</td><td class="text-red-600">0</td><td>0</td><td class="text-red-600">0</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="form-section">
                        <div class="form-header">
                            <div>៣. ចំនួនសិស្សជួបការលំបាកក្នុងថ្នាក់រៀន</div>
                            <div class="sub-text">(សិស្សម្នាក់អាចរាប់ច្រើនដង តាមអាការៈពិបាកជាក់ស្តែង)</div>
                        </div>
                        <div class="form-wrapper">
                            <table class="form-table !border-0 text-left">
                                <thead>
                                    <tr>
                                        <th rowspan="2" class="text-center w-[60%]">បរិយាយ</th>
                                        <th colspan="2">ចំណុចជួបការលំបាក</th>
                                    </tr>
                                    <tr>
                                        <th class="w-[20%]">សរុប</th><th class="w-[20%]">ស្រី</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td class="pl-2 font-bold text-blue-900 bg-blue-50/30">សិស្សពិការ</td><td class="text-center"><div class="box-input" contenteditable="true">0</div></td><td class="text-center"><div class="box-input text-red-600" contenteditable="true">0</div></td></tr>
                                    <tr><td class="pl-6 text-xs text-slate-600">ពិបាកក្នុងការមើលឃើញ</td><td class="text-center"><div class="box-input" contenteditable="true">0</div></td><td class="text-center"><div class="box-input text-red-600" contenteditable="true">0</div></td></tr>
                                    <tr><td class="pl-6 text-xs text-slate-600">ពិបាកក្នុងការស្តាប់</td><td class="text-center"><div class="box-input" contenteditable="true">0</div></td><td class="text-center"><div class="box-input text-red-600" contenteditable="true">0</div></td></tr>
                                    <tr><td class="pl-6 text-xs text-slate-600">ពិបាកក្នុងការនិយាយ</td><td class="text-center"><div class="box-input" contenteditable="true">0</div></td><td class="text-center"><div class="box-input text-red-600" contenteditable="true">0</div></td></tr>
                                    <tr><td class="pl-6 text-xs text-slate-600">ពិបាកក្នុងការដើរ</td><td class="text-center"><div class="box-input" contenteditable="true">0</div></td><td class="text-center"><div class="box-input text-red-600" contenteditable="true">0</div></td></tr>
                                    <tr><td class="pl-6 text-xs text-slate-600">ពិបាកខាងវិញ្ញាណ/ខួរក្បាល</td><td class="text-center"><div class="box-input" contenteditable="true">0</div></td><td class="text-center"><div class="box-input text-red-600" contenteditable="true">0</div></td></tr>
                                    <tr><td class="pl-6 text-xs text-slate-600">ពិបាកក្នុងការចងចាំ</td><td class="text-center"><div class="box-input" contenteditable="true">0</div></td><td class="text-center"><div class="box-input text-red-600" contenteditable="true">0</div></td></tr>
                                    <tr><td class="pl-6 text-xs text-slate-600">ពិការផ្សេងៗ (ក្រៅពីខាងលើ)</td><td class="text-center"><div class="box-input" contenteditable="true">0</div></td><td class="text-center"><div class="box-input text-red-600" contenteditable="true">0</div></td></tr>
                                    
                                    <tr><td class="pl-2 font-bold text-blue-900 bg-blue-50/30">សិស្សជួបការលំបាកផ្នែកសុខភាព</td><td class="text-center"><div class="box-input" contenteditable="true">0</div></td><td class="text-center"><div class="box-input text-red-600" contenteditable="true">0</div></td></tr>
                                    <tr><td class="pl-6 text-xs text-slate-600">ខ្វះអាហារូបត្ថម្ភធ្ងន់ធ្ងរ</td><td class="text-center"><div class="box-input" contenteditable="true">0</div></td><td class="text-center"><div class="box-input text-red-600" contenteditable="true">0</div></td></tr>
                                    <tr><td class="pl-6 text-xs text-slate-600">ជម្ងឺប្រចាំកាយ</td><td class="text-center"><div class="box-input" contenteditable="true">0</div></td><td class="text-center"><div class="box-input text-red-600" contenteditable="true">0</div></td></tr>
                                    <tr><td class="pl-6 text-xs text-slate-600">កុមាររងគ្រោះដោយ HIV</td><td class="text-center"><div class="box-input" contenteditable="true">0</div></td><td class="text-center"><div class="box-input text-red-600" contenteditable="true">0</div></td></tr>

                                    <tr><td class="pl-2 font-bold text-blue-900 bg-blue-50/30">សិស្សជួបការលំបាកទូទៅ</td><td class="text-center"><div class="box-input" contenteditable="true">0</div></td><td class="text-center"><div class="box-input text-red-600" contenteditable="true">0</div></td></tr>
                                    <tr><td class="pl-6 text-xs text-slate-600">មកពីគ្រួសារក្រីក្រ</td><td class="text-center"><div class="box-input" contenteditable="true">0</div></td><td class="text-center"><div class="box-input text-red-600" contenteditable="true">0</div></td></tr>
                                    <tr><td class="pl-6 text-xs text-slate-600">កុមារកំព្រា</td><td class="text-center"><div class="box-input" contenteditable="true">0</div></td><td class="text-center"><div class="box-input text-red-600" contenteditable="true">0</div></td></tr>
                                    <tr><td class="pl-6 text-xs text-slate-600">កុមាររងគ្រោះដោយការជួញដូរ</td><td class="text-center"><div class="box-input" contenteditable="true">0</div></td><td class="text-center"><div class="box-input text-red-600" contenteditable="true">0</div></td></tr>
                                    <tr><td class="pl-6 text-xs text-slate-600">កុមារមកពីគ្រួសារចំណាកស្រុក</td><td class="text-center"><div class="box-input" contenteditable="true">0</div></td><td class="text-center"><div class="box-input text-red-600" contenteditable="true">0</div></td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div> <!-- End Grid -->

            <!-- ហត្ថលេខាខាងក្រោម -->
            <div class="flex justify-between items-start mt-8 text-sm px-4">
                <div class="text-center w-2/5">
                    <p class="mb-1 text-slate-700">បានឃើញ និងឯកភាព</p>
                    <p class="font-moul text-slate-900 mb-16">នាយក/នាយិកាសាលា</p>
                    <p class="font-moul text-slate-900 text-sm" contenteditable="true">${principalName}</p>
                </div>
                <div class="text-center w-2/5">
                    <p class="mb-1 text-slate-700">${lunarDateStr || 'ថ្ងៃ....................ខែ..................ឆ្នាំ...............ព.ស.២៥៧០'}</p>
                    <p class="mb-1 text-slate-700">${solarDateStr}</p>
                    <p class="font-moul text-slate-900 mb-16">គ្រូបន្ទុកថ្នាក់</p>
                    <p class="font-moul text-slate-900 text-sm" contenteditable="true">${teacherName}</p>
                </div>
            </div>

        </div>
    `;
};

// ៣. មុខងារ Print
window.printStudentStatsReport = function() {
    const printArea = document.getElementById("studentStatsPrintArea");
    if (!printArea) return;

    const clonedPrintArea = printArea.cloneNode(true);
    clonedPrintArea.style.boxShadow = 'none';
    clonedPrintArea.style.margin = '0 auto';
    clonedPrintArea.style.maxWidth = '100%';
    
    // បម្លែង Input contenteditable ទៅជាអក្សរសាមញ្ញដើម្បីបោះពុម្ព
    const editables = clonedPrintArea.querySelectorAll('[contenteditable="true"]');
    editables.forEach(el => {
        let val = el.innerText || el.textContent;
        el.removeAttribute('contenteditable');
        // ដក border ចេញពេលព្រីនសម្រាប់ box-input-text តែរក្សា box-input
        if (el.classList.contains('box-input-text')) {
            el.style.border = 'none';
            el.style.padding = '0';
        }
    });

    if (window.CMSPrintManager && typeof window.CMSPrintManager.openUniversalPreview === 'function') {
        window.CMSPrintManager.openUniversalPreview({
            title: "តារាងស្ថិតិចំនួនសិស្សតាមថ្នាក់",
            paperSize: "A4",
            orientation: "portrait",
            defaultZoom: 1.0,
            contentHtml: clonedPrintArea.outerHTML,
            autoWrapHeaderFooter: false
        });
        return;
    }

    const printDocument = `
      <!DOCTYPE html>
      <html lang="km">
      <head>
        <meta charset="utf-8">
        <title>របាយការណ៍សិស្ស - KrouDigital</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Moul&family=Siemreap&display=swap');
          @page { size: A4 portrait; margin: 10mm; }
          * { box-sizing: border-box !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; font-family: 'Siemreap', sans-serif; }
          html, body { background: #fff; width: 100%; height: 100%; }
          .font-moul { font-family: 'Moul', serif !important; }
          
          /* Copy specific styles needed for print */
          .form-table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
          .form-table th, .form-table td { border: 1px solid #94a3b8; padding: 4px; text-align: center; vertical-align: middle; }
          .form-table th { color: #1e3a8a; font-weight: bold; font-family: 'Siemreap', sans-serif; background-color: #f8fafc; }
          .form-section { margin-bottom: 15px; }
          .form-header { background-color: #1e3a8a; color: white; padding: 6px 10px; border-radius: 6px 6px 0 0; font-family: 'Moul', serif; font-size: 12.5px; border: 1px solid #1e3a8a; display: flex; flex-direction: column; }
          .form-header .sub-text { font-family: 'Siemreap', sans-serif; font-size: 10px; font-weight: normal; color: #cbd5e1; margin-top: 2px; }
          .form-wrapper { border: 1px solid #1e3a8a; border-top: none; border-radius: 0 0 6px 6px; overflow: hidden; }
          .box-input { border: 1px solid #cbd5e1; border-radius: 2px; display: inline-block; padding: 1px 4px; min-width: 20px; text-align: center; font-family: 'Arial', sans-serif; font-weight: bold; color: #475569; }
          .table-1 td { padding: 5px 10px; border: 1px solid #cbd5e1; }
          .table-1 td:first-child { text-align: right; width: 45%; color: #475569; }
          .table-1 td:last-child { text-align: left; }
        </style>
      </head>
      <body>
        ${clonedPrintArea.outerHTML}
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=1000,height=900');
    printWindow.document.open();
    printWindow.document.write(printDocument);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 800);
};

// ==========================================================================
// ផ្នែកទី ២៖ បញ្ជីរាយនាមសិស្សលម្អិត & ទូទៅ (A4 Portrait & Landscape)
// ==========================================================================
window.renderStudentListReportHTML = function(container, targetGrade, targetRoom) {
    if (targetGrade) window.currentReportTargetGrade = targetGrade;
    if (targetRoom) window.currentReportTargetRoom = targetRoom;
    container.innerHTML = `
        <div class="w-full flex flex-col items-center pb-10 font-siemreap animate-fade-in">
            <!-- Print Wrapper (Pure Result Only) -->
            <div id="studentListPrintWrapper" class="w-full flex flex-col items-center">
                <!-- Pages generated dynamically -->
            </div>
        </div>
    `;
    window.updateStudentListContent();
};

window.handleStudentListTypeChange = function() {
    const listType = document.getElementById("stListType")?.value || "detailed";
    const orient = listType === "detailed" ? "landscape" : "portrait";
    if (window.CMSPrintManager) {
        window.CMSPrintManager.updateToolbarDefaults('reportPaperArea', orient, 'A4', 100);
    }
    window.updateStudentListContent();
};

window.updateStudentListContent = function() {
    const wrapper = document.getElementById("studentListPrintWrapper");
    if (!wrapper) return;
    
    const listType = document.getElementById("stListType")?.value || "detailed";
    const orientation = document.getElementById("print_orient_reportPaperArea")?.value || (listType === "detailed" ? "landscape" : "portrait");
    
    if(orientation === "landscape") {
        controlBox.classList.replace("max-w-[210mm]", "max-w-[297mm]");
    } else {
        controlBox.classList.replace("max-w-[297mm]", "max-w-[210mm]");
    }

    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const academicYear = document.getElementById("globalAcademicYear")?.value || sInfo.academic_year || "២០២៦-២០២៧";
    const activeClass = typeof window.getCurrentSelectedClass === 'function' ? window.getCurrentSelectedClass() : { level: "ថ្នាក់ទី ៤", room: "«ក»" };
    const curLevel = window.currentReportTargetGrade || document.getElementById("reportGradeSelect")?.value || activeClass.level || sInfo.teacher_level || "ថ្នាក់ទី ៤";
    const curRoom = window.currentReportTargetRoom || document.getElementById("reportRoomSelect")?.value || activeClass.room || sInfo.teacher_room || "«ក»";
    const gradeFull = `${curLevel} ${curRoom}`.trim();
    const districtName = (sInfo.district || "កៀនស្វាយ").replace(/^ស្រុក\s*/, '').trim(); 
    const schoolName = sInfo.school_name || "សាលាបឋមសិក្សា ខ្សុំ";
    const principalName = sInfo.principal_name || "";
    const teacherName = (window.AuthState ? window.AuthState.teacherName : null) || localStorage.getItem('auth_teacher_name') || sInfo.teacher_name || "";

    const rDates = window.reportDateSettings || {};
    let locShort = "";
    const rawLoc = document.getElementById('global_loc_input')?.value || localStorage.getItem('rc_location') || localStorage.getItem('rep_location') || rDates.location;
    if (rawLoc) {
        locShort = rawLoc.replace(/^ធ្វើនៅ\s*/, '').replace(/,+$/, '').trim();
    } else {
        locShort = schoolName.replace(/^(សាលាបឋមសិក្សា|អនុវិទ្យាល័យ|វិទ្យាល័យ|សាលា)\s*/g, '').trim();
        if (!locShort) locShort = districtName || "ភ្នំ";
    }

    let sDate = "";
    const rawDate = document.getElementById('global_sol_input')?.value || localStorage.getItem('rc_solar_date') || localStorage.getItem('rep_solar_date') || rDates.solarDate;
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
    else isLunarChecked = (rDates.showLunar !== false && localStorage.getItem('rc_show_lunar') !== 'false' && localStorage.getItem('rep_show_lunar') !== 'false');

    let lun = document.getElementById('global_lun_input')?.value || localStorage.getItem('rc_lunar_date') || localStorage.getItem('rep_lunar_date') || rDates.lunarDate || "ថ្ងៃ....................ខែ..................ឆ្នាំ...............ព.ស.២៥៧០";
    const lunarDateStr = isLunarChecked ? lun : "";

    let students = typeof window.getStudentsForClass === 'function'
        ? window.getStudentsForClass(curLevel, curRoom, academicYear)
        : [];

    students.sort((a,b) => String(a.name||"").localeCompare(String(b.name||""), 'km'));

    let totalStus = students.length;
    let femaleStus = students.filter(s => s.gender === 'ស្រី').length;

    // 🔴 បន្ថយចំនួនជួរក្នុងមួយសន្លឹក ដើម្បីទុកចន្លោះឱ្យអក្សរធ្លាក់បន្ទាត់មិនដាច់សន្លឹក 🔴
    let ROWS_PER_PAGE_FIRST, ROWS_PER_PAGE_NEXT, paperWidth, paperHeight;
    
    if (orientation === "landscape") {
        ROWS_PER_PAGE_FIRST = 13; 
        ROWS_PER_PAGE_NEXT = 16;
        paperWidth = "297mm";
        paperHeight = "210mm";
    } else {
        ROWS_PER_PAGE_FIRST = 22; 
        ROWS_PER_PAGE_NEXT = 28;
        paperWidth = "210mm";
        paperHeight = "297mm";
    }

    let pages = [];
    let currentIdx = 0;

    if (students.length === 0) {
        pages.push([]); 
    } else {
        while (currentIdx < students.length) {
            let limit = (pages.length === 0) ? ROWS_PER_PAGE_FIRST : ROWS_PER_PAGE_NEXT;
            let pageStus = students.slice(currentIdx, currentIdx + limit);
            pages.push(pageStus);
            currentIdx += limit;
        }
    }

    let allPagesHtml = "";

    pages.forEach((pageStus, pageIdx) => {
        let isFirstPage = pageIdx === 0;
        let isLastPage = pageIdx === pages.length - 1;

        let tbodyHtml = "";
        pageStus.forEach((stu, localIdx) => {
            let globalIdx = isFirstPage ? localIdx : (ROWS_PER_PAGE_FIRST + (pageIdx - 1) * ROWS_PER_PAGE_NEXT + localIdx);
            
            let dob = stu.dob ? (typeof window.formatDate === 'function' ? window.formatDate(stu.dob) : stu.dob) : "....................";
            
            let nameKh = stu.name || "";
            
            let pobArray = [stu.pob_village, stu.pob_commune, stu.pob_district, stu.pob_province].filter(Boolean);
            let pob = pobArray.length > 0 ? pobArray.join(', ') : (stu.pob || "............................");
            
            let currArray = [stu.curr_village, stu.curr_commune, stu.curr_district, stu.curr_province].filter(Boolean);
            let currAddr = currArray.length > 0 ? currArray.join(', ') : (stu.address || "............................");
            
            let fName = stu.father_name || "";
            let fJob = stu.father_job ? `(${stu.father_job})` : "";
            let mName = stu.mother_name || "";
            let mJob = stu.mother_job ? `(${stu.mother_job})` : "";
            
            // 🔴 ស្វែងរកលេខទូរស័ព្ទពីគ្រប់ប្រភព 🔴
            let phone = stu.parent_phone || stu.guardian_phone || stu.father_phone || stu.mother_phone || stu.phone || stu.contact || "....................";
            let statusBadge = stu.status_note || "ក្រីក្រ/អាហារូបករណ៍"; 
            
            if (listType === "detailed") {
                // លុប class truncate ចេញ ដើម្បីឱ្យអក្សរធ្លាក់បន្ទាត់
                tbodyHtml += `
                    <tr>
                        <td class="border border-slate-800 text-center font-siemreap text-[11px] py-1.5">${window.toKhmerNum((globalIdx + 1).toString())}</td>
                        <td class="border border-slate-800 text-center font-siemreap text-slate-700 text-[11px] py-1.5">${stu.id || ""}</td>
                        <td class="border border-slate-800 text-left px-2 font-bold font-siemreap text-[11.5px] py-1.5">${nameKh}</td>
                        <td class="border border-slate-800 text-center font-bold text-[11.5px] ${stu.gender === 'ស្រី' ? 'text-rose-600' : 'text-blue-700'} py-1.5">${stu.gender === 'ស្រី' ? 'ស' : 'ប'}</td>
                        <td class="border border-slate-800 text-center font-siemreap text-[10.5px] py-1.5">${dob}</td>
                        <td class="border border-slate-800 text-left px-1.5 py-1.5 text-[10px] leading-[1.4] break-words">${pob}</td>
                        <td class="border border-slate-800 text-left px-1.5 py-1.5 text-[10.5px] leading-tight font-bold">${fName}<br><span class="font-normal text-[9px] text-slate-500">${fJob}</span></td>
                        <td class="border border-slate-800 text-left px-1.5 py-1.5 text-[10.5px] leading-tight font-bold">${mName}<br><span class="font-normal text-[9px] text-slate-500">${mJob}</span></td>
                        <td class="border border-slate-800 text-left px-1.5 py-1.5 text-[10px] leading-[1.4] break-words">${currAddr}</td>
                        <td class="border border-slate-800 text-center font-siemreap text-[10px] py-1.5">${stu.parent_contact || '-'}</td>
                        <td class="border border-slate-800 text-center text-[9px] text-rose-500 font-siemreap leading-tight py-1.5">${statusBadge}</td>
                    </tr>
                `;
            } else {
                tbodyHtml += `
                    <tr>
                        <td class="border border-slate-800 text-center font-siemreap text-[11px] py-2">${window.toKhmerNum((globalIdx + 1).toString())}</td>
                        <td class="border border-slate-800 text-center font-siemreap text-slate-700 text-[11px] py-2">${stu.id || ""}</td>
                        <td class="border border-slate-800 text-left px-2 font-bold font-siemreap text-[11.5px] py-2">${nameKh}</td>
                        <td class="border border-slate-800 text-center font-bold text-[11.5px] ${stu.gender === 'ស្រី' ? 'text-rose-600' : 'text-blue-700'} py-2">${stu.gender === 'ស្រី' ? 'ស' : 'ប'}</td>
                        <td class="border border-slate-800 text-center font-siemreap text-[10.5px] py-2">${dob}</td>
                        <td class="border border-slate-800 text-left px-1.5 py-2 text-[10px] leading-[1.4] break-words">${currAddr}</td>
                        <td class="border border-slate-800 text-center font-siemreap text-[10px] py-2">${stu.parent_contact || '-'}</td>
                        <td class="border border-slate-800 text-center text-[9px] text-rose-500 font-siemreap leading-tight py-2">${statusBadge}</td>
                    </tr>
                `;
            }
        });

        let limit = isFirstPage ? ROWS_PER_PAGE_FIRST : ROWS_PER_PAGE_NEXT;
        if (isLastPage && pageStus.length < limit) {
            let emptyRowsNeeded = limit - pageStus.length;
            for (let i = 0; i < emptyRowsNeeded; i++) {
                if (listType === "detailed") {
                    tbodyHtml += `<tr><td class="border border-slate-800 py-2"></td><td class="border border-slate-800"></td><td class="border border-slate-800"></td><td class="border border-slate-800"></td><td class="border border-slate-800"></td><td class="border border-slate-800"></td><td class="border border-slate-800"></td><td class="border border-slate-800"></td><td class="border border-slate-800"></td><td class="border border-slate-800"></td><td class="border border-slate-800"></td></tr>`;
                } else {
                    tbodyHtml += `<tr><td class="border border-slate-800 py-3"></td><td class="border border-slate-800"></td><td class="border border-slate-800"></td><td class="border border-slate-800"></td><td class="border border-slate-800"></td><td class="border border-slate-800"></td><td class="border border-slate-800"></td><td class="border border-slate-800"></td></tr>`;
                }
            }
        }

        let headerSection = "";
        if (isFirstPage) {
            headerSection = `
                <div class="flex justify-between items-start mb-6">
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
                    <h1 class="font-moul text-xl text-blue-900 mb-2">${listType === 'detailed' ? 'បញ្ជីព័ត៌មានសិស្ស' : 'បញ្ជីរាយនាមសិស្សានុសិស្ស'}</h1>
                    <h2 class="font-moul text-sm text-red-600">${gradeFull} | ឆ្នាំសិក្សា ${window.toKhmerNum(academicYear)}</h2>
                </div>
            `;
        } else {
            headerSection = `
                <div class="text-center mb-4">
                    <h1 class="font-moul text-sm text-blue-900 mb-1">${listType === 'detailed' ? 'បញ្ជីព័ត៌មានសិស្ស (ត)' : 'បញ្ជីរាយនាមសិស្សានុសិស្ស (ត)'}</h1>
                    <h2 class="font-moul text-[11px] text-red-600">${gradeFull}</h2>
                </div>
            `;
        }

        let footerSection = "";
        if (isLastPage) {
            footerSection = `
                <div class="mt-2 border-b-2 border-slate-800 pb-2 flex justify-between items-center font-bold text-slate-800 text-[12px] font-moul px-4">
                    <div>បញ្ឈប់បញ្ជីត្រឹមលេខរៀងទី <span class="text-blue-600">${window.toKhmerNum(totalStus.toString())}</span></div>
                    <div>សិស្សសរុប៖ <span class="text-blue-600">${window.toKhmerNum(totalStus.toString())}</span> នាក់</div>
                    <div>ស្រី៖ <span class="text-rose-600">${window.toKhmerNum(femaleStus.toString())} នាក់</span></div>
                </div>

                <div class="flex justify-between items-start mt-6 px-10 text-[11.5px] font-siemreap text-slate-800">
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
            `;
        }

        let theadHtml = "";
        if (listType === "detailed") {
            theadHtml = `
                <tr>
                    <th class="border border-slate-800 p-2 w-[3%]">ល.រ</th>
                    <th class="border border-slate-800 p-2 w-[7%]">អត្តលេខ</th>
                    <th class="border border-slate-800 p-2 w-[13%]">គោត្តនាម និងនាម</th>
                    <th class="border border-slate-800 p-2 w-[4%]">ភេទ</th>
                    <th class="border border-slate-800 p-1 w-[8%] leading-tight text-[10px]">ថ្ងៃខែឆ្នាំ<br>កំណើត</th>
                    <th class="border border-slate-800 p-2 w-[14%]">ទីកន្លែងកំណើត</th>
                    <th class="border border-slate-800 p-2 w-[11%]">ឈ្មោះឪពុក</th>
                    <th class="border border-slate-800 p-2 w-[11%]">ឈ្មោះម្តាយ</th>
                    <th class="border border-slate-800 p-2 w-[14%]">ទីលំនៅបច្ចុប្បន្ន</th>
                    <th class="border border-slate-800 p-2 w-[9%]">លេខទូរស័ព្ទ</th>
                    <th class="border border-slate-800 p-2 w-[6%]">ផ្សេងៗ</th>
                </tr>
            `;
        } else {
            theadHtml = `
                <tr>
                    <th class="border border-slate-800 p-2 w-[5%]">ល.រ</th>
                    <th class="border border-slate-800 p-2 w-[12%]">អត្តលេខ</th>
                    <th class="border border-slate-800 p-2 w-[22%]">គោត្តនាម និងនាម</th>
                    <th class="border border-slate-800 p-2 w-[6%]">ភេទ</th>
                    <th class="border border-slate-800 p-1 w-[12%] leading-tight text-[10px]">ថ្ងៃខែឆ្នាំ<br>កំណើត</th>
                    <th class="border border-slate-800 p-2 w-[22%]">ទីលំនៅបច្ចុប្បន្ន</th>
                    <th class="border border-slate-800 p-2 w-[13%]">លេខទូរស័ព្ទ</th>
                    <th class="border border-slate-800 p-2 w-[8%]">ផ្សេងៗ</th>
                </tr>
            `;
        }

        let pageHtml = `
            <div class="print-page-wrapper bg-white shadow-lg border border-slate-200 mx-auto relative mb-6" style="width: ${paperWidth}; height: ${paperHeight}; padding: 10mm 12mm; box-sizing: border-box;">
                ${headerSection}
                <table class="w-full border-collapse border-2 border-slate-800 text-[11.5px] font-siemreap">
                    <thead class="bg-slate-100 font-moul text-[11px] text-blue-900 border-2 border-slate-800">
                        ${theadHtml}
                    </thead>
                    <tbody class="text-slate-800 border-2 border-slate-800">
                        ${tbodyHtml}
                    </tbody>
                </table>
                ${footerSection}
            </div>
        `;

        allPagesHtml += pageHtml;
    });

    wrapper.innerHTML = allPagesHtml;
    
};




// ==========================================================================
// ផ្នែកទី ៣៖ រចនាសម្ព័ន្ធថ្នាក់រៀន (Class Structure - 5 Groups)
// ==========================================================================
window.renderClassStructureHTML = function(container, targetGrade, targetRoom) {
    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const academicYear = document.getElementById("globalAcademicYear")?.value || sInfo.academic_year || "២០២៦-២០២៧";
    const activeClass = typeof window.getCurrentSelectedClass === 'function' ? window.getCurrentSelectedClass() : { level: "ថ្នាក់ទី ៤", room: "«ក»" };
    const curLevel = targetGrade || window.currentReportTargetGrade || document.getElementById("reportGradeSelect")?.value || activeClass.level || sInfo.teacher_level || "ថ្នាក់ទី ៤";
    const curRoom = targetRoom || window.currentReportTargetRoom || document.getElementById("reportRoomSelect")?.value || activeClass.room || sInfo.teacher_room || "«ក»";
    const gradeFull = `${curLevel} ${curRoom}`.trim();
    
    let students = typeof window.getStudentsForClass === 'function'
        ? window.getStudentsForClass(curLevel, curRoom, academicYear)
        : [];

    // បែងចែកជា ៥ ក្រុម
    let groups = [[], [], [], [], []];
    students.forEach((s, idx) => { groups[idx % 5].push(s); });

    let tablesHtml = "";
    groups.forEach((groupStus, gIdx) => {
        let rowsHtml = "";
        groupStus.forEach((s, i) => {
            let role = i === 0 ? "ប្រធាន" : (i === 1 ? "អនុប្រធាន" : (i === 2 ? "លេខា" : "សមាជិក"));
            let roleClass = i === 0 ? "text-rose-600 font-bold" : (i === 1 ? "text-blue-600 font-bold" : (i===2 ? "text-emerald-600 font-bold" : "text-slate-600"));
            
            rowsHtml += `
                <tr>
                    <td class="border border-slate-300 text-center py-1.5 text-[11.5px]">${i + 1}</td>
                    <td class="border border-slate-300 text-left px-2 py-1.5 text-[12px] font-bold">${s.name}</td>
                    <td class="border border-slate-300 text-center py-1.5 text-[11.5px]">${s.gender}</td>
                    <td class="border border-slate-300 text-center py-1.5 text-[11.5px] ${roleClass}">${role}</td>
                </tr>
            `;
        });

        tablesHtml += `
            <div class="mb-6 break-inside-avoid">
                <div class="bg-indigo-600 text-white font-moul text-center py-2 text-[12px] rounded-t-lg border border-indigo-600">ក្រុមទី ${window.toKhmerNum(gIdx + 1)}</div>
                <table class="w-full border-collapse border border-slate-300">
                    <thead class="bg-slate-100 text-[11px] font-moul text-slate-700">
                        <tr>
                            <th class="border border-slate-300 py-1.5 w-[10%]">ល.រ</th>
                            <th class="border border-slate-300 py-1.5 w-[50%]">គោត្តនាម-នាម</th>
                            <th class="border border-slate-300 py-1.5 w-[15%]">ភេទ</th>
                            <th class="border border-slate-300 py-1.5 w-[25%]">តួនាទី</th>
                        </tr>
                    </thead>
                    <tbody>${rowsHtml || `<tr><td colspan="4" class="text-center p-2 text-slate-400">គ្មានសិស្ស</td></tr>`}</tbody>
                </table>
            </div>
        `;
    });

    container.innerHTML = `
        <div class="w-full flex flex-col items-center">
            <div class="bg-white w-full max-w-[210mm] shadow-lg border border-slate-200" id="structurePrintArea" style="min-height: 297mm; padding: 12mm 10mm; font-family: 'Khmer OS Siemreap', sans-serif;">
                <div class="text-center mb-8 border-b-2 border-slate-200 pb-4">
                    <h1 class="font-moul text-xl text-blue-900 mb-2">តារាងរចនាសម្ព័ន្ធសិស្សតាមក្រុម</h1>
                    <h2 class="font-moul text-sm text-blue-800">ថ្នាក់ ${gradeFull} | ឆ្នាំសិក្សា ${window.toKhmerNum(academicYear)}</h2>
                </div>
                
                <div class="grid grid-cols-2 gap-x-8 gap-y-4">
                    ${tablesHtml}
                </div>
            </div>
        </div>
    `;
};


// ==========================================================================
// ផ្នែកទី ៤៖ របាយការណ៍វត្តមាន (Attendance - Monthly/Semester/Annual)
// ==========================================================================
window.renderAttendanceReportHTML = function(container, targetGrade, targetRoom) {
    if (targetGrade) window.currentReportTargetGrade = targetGrade;
    if (targetRoom) window.currentReportTargetRoom = targetRoom;
    container.innerHTML = `
        <div class="w-full flex flex-col items-center max-w-5xl mx-auto font-siemreap animate-fade-in pb-10">
            <!-- Print Area Preview (Pure Result Only) -->
            <div id="attendancePrintWrapper" class="w-full flex flex-col items-center">
                <!-- Content will be injected here -->
            </div>
        </div>
    `;
    
    window.updateAttendanceReportPreview();
};

window.updateAttendanceReportPreview = function() {
    const type = document.getElementById("attReportType")?.value || "monthly";
    const valSelect = document.getElementById("attReportValue");
    if (!valSelect) return;

    let currentVal = valSelect.value;

    if (type === "monthly") {
        valSelect.innerHTML = ["តុលា", "វិច្ឆិកា", "ធ្នូ", "មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា"].map(m => `<option value="${m}">${m}</option>`).join("");
        if(currentVal && ["តុលា", "វិច្ឆិកា", "ធ្នូ", "មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា"].includes(currentVal)) valSelect.value = currentVal;
    } else if (type === "semester") {
        valSelect.innerHTML = `<option value="ឆមាសទី១">ឆមាសទី១</option><option value="ឆមាសទី២">ឆមាសទី២</option>`;
        if(currentVal && ["ឆមាសទី១", "ឆមាសទី២"].includes(currentVal)) valSelect.value = currentVal;
    } else {
        valSelect.innerHTML = `<option value="សរុបប្រចាំឆ្នាំ">សរុបប្រចាំឆ្នាំ</option>`;
    }

    window.renderAttendanceContent();
};

window.renderAttendanceContent = function() {
    const wrapper = document.getElementById("attendancePrintWrapper");
    if (!wrapper) return;

    const type = document.getElementById("attReportType").value;
    const value = document.getElementById("attReportValue").value;

    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const academicYear = document.getElementById("globalAcademicYear")?.value || sInfo.academic_year || "២០២៦-២០២៧";
    const activeClass = typeof window.getCurrentSelectedClass === 'function' ? window.getCurrentSelectedClass() : { level: "ថ្នាក់ទី ៤", room: "«ក»" };
    const curLevel = window.currentReportTargetGrade || document.getElementById("reportGradeSelect")?.value || activeClass.level || sInfo.teacher_level || "ថ្នាក់ទី ៤";
    const curRoom = window.currentReportTargetRoom || document.getElementById("reportRoomSelect")?.value || activeClass.room || sInfo.teacher_room || "«ក»";
    const gradeFull = `${curLevel} ${curRoom}`.trim();
    const districtName = (sInfo.district || "កៀនស្វាយ").replace(/^ស្រុក\s*/, '').trim(); 
    const schoolName = sInfo.school_name || "សាលាបឋមសិក្សា ខ្សុំ";
    const principalName = sInfo.principal_name || "";
    const teacherName = (window.AuthState ? window.AuthState.teacherName : null) || localStorage.getItem('auth_teacher_name') || sInfo.teacher_name || "";

    const rDates = window.reportDateSettings || {};
    let locShort = "";
    const rawLoc = document.getElementById('global_loc_input')?.value || localStorage.getItem('rc_location') || localStorage.getItem('rep_location') || rDates.location;
    if (rawLoc) {
        locShort = rawLoc.replace(/^ធ្វើនៅ\s*/, '').replace(/,+$/, '').trim();
    } else {
        locShort = schoolName.replace(/^(សាលាបឋមសិក្សា|អនុវិទ្យាល័យ|វិទ្យាល័យ|សាលា)\s*/g, '').trim();
        if (!locShort) locShort = districtName || "ភ្នំ";
    }

    let sDate = "";
    const rawDate = document.getElementById('global_sol_input')?.value || localStorage.getItem('rc_solar_date') || localStorage.getItem('rep_solar_date') || rDates.solarDate;
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
    else isLunarChecked = (rDates.showLunar !== false && localStorage.getItem('rc_show_lunar') !== 'false' && localStorage.getItem('rep_show_lunar') !== 'false');

    let lun = document.getElementById('global_lun_input')?.value || localStorage.getItem('rc_lunar_date') || localStorage.getItem('rep_lunar_date') || rDates.lunarDate || "ថ្ងៃ....................ខែ..................ឆ្នាំ...............ព.ស.២៥៧០";
    const lunarDateStr = isLunarChecked ? lun : "";

    let students = typeof window.getStudentsForClass === 'function'
        ? window.getStudentsForClass(curLevel, curRoom, academicYear)
        : [];

    students.sort((a,b) => String(a.name||"").localeCompare(String(b.name||""), 'km'));

    let totalStus = students.length;
    let femaleStus = students.filter(s => s.gender === 'ស្រី').length;
    let maleStus = totalStus - femaleStus;

    let titleStr = "បញ្ជីហៅឈ្មោះសិស្ស";

    let columnsHtml = "";
    let secondRowHead = "";
    let thirdRowHead = "";
    let periods = [];

    // 🔴 កំណត់ក្រឡោនក្បាលតារាង
    if (type === "monthly") {
        periods = Array.from({length: 31}, (_, i) => (i + 1).toString());
        
        let daysRow = periods.map(d => `<th class="border border-slate-800 p-0 text-center"><div contenteditable="true" class="w-full text-[9px] text-slate-500 font-normal outline-none"></div></th>`).join("");
        let numsRow = periods.map(d => `<th class="border border-slate-800 p-0 text-center text-blue-800 text-[10px] bg-slate-50">${d}</th>`).join("");
        
        columnsHtml = `
            <th colspan="31" class="border border-slate-800 p-1 text-center bg-[#f1f5f9] text-[10px] text-blue-900 font-bold">កាលបរិច្ឆេទ និងថ្ងៃក្នុងខែ</th>
            <th colspan="4" class="border border-slate-800 p-1 text-center bg-[#f1f5f9] text-[10px] text-blue-900 font-bold">ចំនួនអវត្តមាន</th>
        `;
        
        secondRowHead = `
            <tr>
                ${daysRow}
                <th rowspan="2" class="border border-slate-800 text-blue-800 bg-blue-50 text-[10px] font-bold text-center">ច្ប</th>
                <th rowspan="2" class="border border-slate-800 text-rose-700 bg-rose-50 text-[10px] font-bold text-center">អច្ប</th>
                <th rowspan="2" class="border border-slate-800 text-purple-700 bg-purple-50 text-[10px] font-bold text-center">ឈ</th>
                <th rowspan="2" class="border border-slate-800 text-slate-800 bg-slate-100 text-[10px] font-bold text-center">សរុប</th>
            </tr>
            <tr>
                ${numsRow}
            </tr>
        `;
        thirdRowHead = ""; 
    } else {
        let monthsList = type === "semester" ? (value === "ឆមាសទី១" ? ["តុលា", "វិច្ឆិកា", "ធ្នូ", "មករា", "កុម្ភៈ"] : ["មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា"]) : ["តុលា", "វិច្ឆិកា", "ធ្នូ", "មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា"];
        periods = monthsList;
        
        let theadSubHtml = periods.map(m => `<th colspan="2" class="w-[10%] font-siemreap text-[10px] border border-slate-800 p-1 text-center bg-blue-50 text-blue-800">${m}</th>`).join("");
        
        columnsHtml = `
            <th colspan="${periods.length * 2}" class="border border-slate-800 p-1 text-center bg-[#f1f5f9] text-[11px] text-blue-900 font-bold">ចំនួនអវត្តមានប្រចាំខែ</th>
            <th colspan="3" class="border border-slate-800 p-1 text-center bg-[#f1f5f9] text-[10px] text-blue-900 font-bold">ចំនួនអវត្តមានសរុប</th>
        `;
        
        secondRowHead = `<tr>`;
        periods.forEach(() => { secondRowHead += `<th class="border border-slate-800 text-blue-700 bg-blue-50/50 text-[9px] font-bold text-center">ច្ប</th><th class="border border-slate-800 text-rose-600 bg-rose-50/50 text-[9px] font-bold text-center">អច្ប</th>`; });
        secondRowHead += `<th class="border border-slate-800 text-blue-800 bg-blue-50 text-[10px] font-bold text-center">ច្ប</th><th class="border border-slate-800 text-rose-700 bg-rose-50 text-[10px] font-bold text-center">អច្ប</th><th class="border border-slate-800 text-slate-800 bg-slate-50 text-[10px] font-bold text-center">សរុប</th></tr>`;
        
        thirdRowHead = `<tr>${theadSubHtml}<th class="border border-slate-800 text-blue-800 bg-blue-50 text-[10px] font-bold text-center">ច្ប</th><th class="border border-slate-800 text-rose-700 bg-rose-50 text-[10px] font-bold text-center">អច្ប</th><th class="border border-slate-800 text-slate-800 bg-slate-50 text-[10px] font-bold text-center">សរុប</th></tr>`;
    }

    const ROWS_PER_PAGE = 20;
    let pages = [];
    for (let i = 0; i < students.length; i += ROWS_PER_PAGE) {
        pages.push(students.slice(i, i + ROWS_PER_PAGE));
    }
    if(pages.length === 0) pages.push([]);

    let allPagesHtml = "";
    
    // 🔴 មុខងារជំនួយសម្រាប់ទាញយកទិន្នន័យវត្តមានពី LocalStorage
    // លោកគ្រូអាចកែប្រែ Key (ឧទាហរណ៍ 'attendance_records') ទៅតាម Key ជាក់ស្តែងដែលកម្មវិធីលោកគ្រូប្រើប្រាស់
    const fetchAttendanceData = function(studentId, monthStr) {
        try {
            // សាកល្បងអានពី attendance_records ដែលរក្សាទុកទិន្នន័យ (បើមាន)
            let attRecords = JSON.parse(localStorage.getItem('attendance_records')) || {};
            let monthData = attRecords[monthStr] || {};
            let stuData = monthData[studentId] || {};
            
            return {
                days: stuData.days || {}, // { "1": "ច", "15": "អ" }
                perm: stuData.perm || 0,  // ចំនួនច្បាប់សរុប
                unex: stuData.unex || 0   // ចំនួនឥតច្បាប់សរុប
            };
        } catch(e) {
            return { days: {}, perm: 0, unex: 0 };
        }
    };

    pages.forEach((pageStus, pageIdx) => {
        let isFirstPage = pageIdx === 0;
        let isLastPage = pageIdx === pages.length - 1;

        let pageTbodyHtml = "";
        
        pageStus.forEach((stu, localIdx) => {
            let globalIdx = pageIdx * ROWS_PER_PAGE + localIdx;
            
            let rowHtml = `
                <tr style="height: 24px;">
                    <td class="border border-slate-800 text-center font-mono text-[11px]">${window.toKhmerNum((globalIdx + 1).toString())}</td>
                    <td class="border border-slate-800 text-center font-mono text-slate-700 text-[11px]">${stu.id || ""}</td>
                    <td class="border border-slate-800 text-left px-2 font-bold font-siemreap text-[11.5px]">${stu.name || ""}</td>
                    <td class="border border-slate-800 text-center font-bold text-[11.5px] ${stu.gender === 'ស្រី' ? 'text-rose-600' : 'text-blue-700'}">${stu.gender === 'ស្រី' ? 'ស' : 'ប'}</td>
            `;

            let totalPerm = 0, totalUnex = 0;

            if (type === "monthly") {
                // 🔴 ទាញទិន្នន័យវត្តមានប្រចាំខែ (តាមថ្ងៃនីមួយៗ)
                let attData = fetchAttendanceData(stu.id, value);
                
                periods.forEach(d => {
                    let dVal = attData.days[d] || ""; 
                    let textColor = "";
                    if(dVal === "ច" || dVal === "ច្ប") textColor = "text-blue-700";
                    if(dVal === "អ" || dVal === "អច្ប") textColor = "text-rose-600";
                    if(dVal === "ឈ") textColor = "text-purple-600";
                    
                    rowHtml += `<td class="border border-slate-800 text-center"><div contenteditable="true" class="w-full h-full outline-none font-bold text-[10px] text-center ${textColor}">${dVal}</div></td>`;
                });
                
                totalPerm = attData.perm || 0;
                totalUnex = attData.unex || 0;
                
                rowHtml += `
                    <td class="border border-slate-800 text-center font-bold text-blue-800 bg-blue-50/30 text-[11px]"><div contenteditable="true" class="w-full outline-none text-center">${totalPerm > 0 ? window.toKhmerNum(totalPerm.toString()) : ''}</div></td>
                    <td class="border border-slate-800 text-center font-bold text-rose-700 bg-rose-50/30 text-[11px]"><div contenteditable="true" class="w-full outline-none text-center">${totalUnex > 0 ? window.toKhmerNum(totalUnex.toString()) : ''}</div></td>
                    <td class="border border-slate-800 text-center font-bold text-purple-700 bg-purple-50/30 text-[11px]"><div contenteditable="true" class="w-full outline-none text-center"></div></td>
                    <td class="border border-slate-800 text-center font-bold text-slate-800 bg-slate-50/30 text-[11px]"><div contenteditable="true" class="w-full outline-none text-center">${(totalPerm+totalUnex) > 0 ? window.toKhmerNum((totalPerm+totalUnex).toString()) : ''}</div></td>
                `;
            } else {
                // 🔴 ទាញទិន្នន័យសរុបប្រចាំខែនីមួយៗ សម្រាប់របាយការណ៍ឆមាស និងប្រចាំឆ្នាំ
                periods.forEach(m => {
                    let attData = fetchAttendanceData(stu.id, m);
                    let pVal = attData.perm || 0;
                    let uVal = attData.unex || 0;
                    
                    totalPerm += pVal;
                    totalUnex += uVal;
                    
                    rowHtml += `
                        <td class="border border-slate-800 text-center font-bold text-blue-700 text-[10px] ${pVal > 0 ? 'bg-blue-50/50' : ''}"><div contenteditable="true" class="w-full outline-none text-center">${pVal > 0 ? window.toKhmerNum(pVal.toString()) : ''}</div></td>
                        <td class="border border-slate-800 text-center font-bold text-rose-600 text-[10px] ${uVal > 0 ? 'bg-rose-50/50' : ''}"><div contenteditable="true" class="w-full outline-none text-center">${uVal > 0 ? window.toKhmerNum(uVal.toString()) : ''}</div></td>
                    `;
                });
                rowHtml += `
                    <td class="border border-slate-800 text-center font-bold text-blue-800 bg-blue-50/30 text-[11px]"><div contenteditable="true" class="w-full outline-none text-center">${totalPerm > 0 ? window.toKhmerNum(totalPerm.toString()) : ''}</div></td>
                    <td class="border border-slate-800 text-center font-bold text-rose-700 bg-rose-50/30 text-[11px]"><div contenteditable="true" class="w-full outline-none text-center">${totalUnex > 0 ? window.toKhmerNum(totalUnex.toString()) : ''}</div></td>
                    <td class="border border-slate-800 text-center font-bold text-slate-800 bg-slate-50/30 text-[11px]"><div contenteditable="true" class="w-full outline-none text-center">${(totalPerm+totalUnex) > 0 ? window.toKhmerNum((totalPerm+totalUnex).toString()) : ''}</div></td>
                `;
            }

            rowHtml += `
                    <td class="border border-slate-800 text-center text-[9px]"><div contenteditable="true" class="w-full outline-none text-center">${stu.remark || ''}</div></td>
                </tr>
            `;
            pageTbodyHtml += rowHtml;
        });

        // បំពេញប្រអប់ទទេ
        if (isLastPage && pageStus.length < ROWS_PER_PAGE) {
            let emptyCount = ROWS_PER_PAGE - pageStus.length;
            for (let i = 0; i < emptyCount; i++) {
                let emptyRow = `<tr style="height: 24px;">
                    <td class="border border-slate-800"></td><td class="border border-slate-800"></td><td class="border border-slate-800"></td><td class="border border-slate-800"></td>`;
                
                if (type === "monthly") {
                    periods.forEach(() => emptyRow += `<td class="border border-slate-800"></td>`);
                    emptyRow += `<td class="border border-slate-800"></td><td class="border border-slate-800"></td><td class="border border-slate-800"></td><td class="border border-slate-800"></td>`;
                } else {
                    periods.forEach(() => emptyRow += `<td class="border border-slate-800"></td><td class="border border-slate-800"></td>`);
                    emptyRow += `<td class="border border-slate-800"></td><td class="border border-slate-800"></td><td class="border border-slate-800"></td>`;
                }
                
                emptyRow += `<td class="border border-slate-800"></td></tr>`;
                pageTbodyHtml += emptyRow;
            }
        }

        let headerSection = "";
        if (isFirstPage) {
            headerSection = `
                <div class="flex justify-between items-start mb-4">
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
                
                <div class="text-center mb-4">
                    <h1 class="font-moul text-xl text-blue-900 mb-1">${titleStr}</h1>
                    <h2 class="font-moul text-sm text-red-600">${gradeFull} | ឆ្នាំសិក្សា ${window.toKhmerNum(academicYear)}</h2>
                </div>
            `;
        } else {
            headerSection = `
                <div class="text-center mb-4">
                    <h1 class="font-moul text-sm text-blue-900 mb-1">${titleStr} (ត)</h1>
                    <h2 class="font-moul text-[11px] text-red-600">${gradeFull}</h2>
                </div>
            `;
        }

        let topSummaryBarHtml = `
            <div class="flex items-center justify-between border border-slate-300 bg-[#f8fafc] p-2 mb-2 text-[11px] font-bold font-siemreap text-slate-800 rounded-sm">
                <div>ផ្នែកអវត្តមានសិស្ស</div>
                ${type === "monthly" ? `<div>ខែ <span class="text-rose-600 font-moul">${value}</span></div>` : `<div><span class="text-rose-600 font-moul">${value}</span></div>`}
                <div>ឆ្នាំសិក្សា ${window.toKhmerNum(academicYear)}</div>
                <div>ប្រុស <span class="text-emerald-600 font-bold">${window.toKhmerNum(maleStus.toString())}</span> នាក់</div>
                <div>ស្រី <span class="text-emerald-600 font-bold">${window.toKhmerNum(femaleStus.toString())}</span> នាក់</div>
                <div>សរុប <span class="text-emerald-600 font-bold">${window.toKhmerNum(totalStus.toString())}</span> នាក់</div>
            </div>
        `;

        let bottomSummaryBarHtml = `
            <div class="flex justify-between items-center mt-1.5 px-1 font-siemreap">
                <div class="text-[11px] text-slate-500 italic">បញ្ឈប់បញ្ជីក្នុងខែនេះត្រឹម <b class="text-blue-700 underline" contenteditable="true">២៥</b> ពេល</div>
            </div>
            <div class="flex items-center justify-between border border-emerald-400 bg-emerald-50/50 p-2 mt-1.5 text-[10.5px] font-siemreap rounded">
                <div class="flex gap-6 mx-auto w-full justify-around">
                    <span class="text-slate-500">ពេលសិស្សត្រូវមករៀន៖ <b class="text-slate-800" contenteditable="true">០</b></span>
                    <span class="text-slate-500">ពេលអវត្តមាន៖ <b class="text-rose-600" contenteditable="true">០</b></span>
                    <span class="text-slate-500">ពេលដែលសិស្សមករៀនពិតប្រាកដ៖ <b class="text-emerald-700" contenteditable="true">០</b></span>
                    <span class="text-slate-500">ភាគរយអវត្តមាន៖ <b class="text-rose-600" contenteditable="true">0.00%</b></span>
                </div>
            </div>
        `;

        let summaryFooterHtml = "";
        if (isLastPage) {
            summaryFooterHtml = `
                <div class="flex justify-between items-start mt-6 px-10 text-[11px] font-siemreap text-slate-800">
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
            `;
        }

        let pageHtml = `
            <div class="print-page-wrapper bg-white shadow-lg border border-slate-200 mx-auto relative mb-6" style="width: 297mm; min-height: 210mm; padding: 8mm 10mm; box-sizing: border-box; display: flex; flex-direction: column;">
                <div>
                    ${headerSection}
                    ${isFirstPage ? topSummaryBarHtml : ''}
                    
                    <table class="w-full border-collapse border-2 border-slate-800 text-[11px] font-siemreap table-fixed">
                        <thead class="bg-[#f1f5f9] font-moul text-[10px] text-blue-900 border-2 border-slate-800">
                            <tr>
                                <th rowspan="3" class="border border-slate-800 p-1 w-[3%]">ល.រ</th>
                                <th rowspan="3" class="border border-slate-800 p-1 w-[6%]">អត្តលេខ</th>
                                <th rowspan="3" class="border border-slate-800 p-1 w-[14%]">គោត្តនាម-នាម</th>
                                <th rowspan="3" class="border border-slate-800 p-1 w-[3%]">ភេទ</th>
                                ${columnsHtml}
                                <th rowspan="3" class="border border-slate-800 p-1 w-[6%]">ផ្សេងៗ</th>
                            </tr>
                            ${secondRowHead}
                            ${thirdRowHead}
                        </thead>
                        <tbody class="text-slate-800 border-2 border-slate-800">
                            ${pageTbodyHtml}
                        </tbody>
                    </table>
                    
                    ${isLastPage ? bottomSummaryBarHtml : ''}
                </div>
                
                <div style="margin-top: auto;">
                    ${summaryFooterHtml}
                </div>
            </div>
        `;

        allPagesHtml += pageHtml;
    });

    wrapper.innerHTML = allPagesHtml;
};

window.triggerAttendancePrint = function() {
    const wrapper = document.getElementById("attendancePrintWrapper");
    if (!wrapper) return;
    
    const clonedPrintArea = wrapper.cloneNode(true);
    
    const pages = clonedPrintArea.querySelectorAll('.print-page-wrapper');
    pages.forEach(p => {
        p.style.boxShadow = 'none';
        p.style.border = 'none';
        p.style.margin = '0 auto';
        p.style.pageBreakAfter = 'always';
    });

    // Remove contenteditable
    clonedPrintArea.querySelectorAll('[contenteditable="true"]').forEach(el => {
        let val = el.innerText || el.textContent;
        el.removeAttribute('contenteditable');
        el.innerText = val;
    });

    if (window.CMSPrintManager && typeof window.CMSPrintManager.openUniversalPreview === 'function') {
        window.CMSPrintManager.openUniversalPreview({
            title: "បញ្ជីវត្តមានសិស្ស",
            paperSize: "A4",
            orientation: "landscape",
            defaultZoom: 0.95,
            contentHtml: clonedPrintArea.outerHTML,
            autoWrapHeaderFooter: false
        });
        return;
    }

    const printDocument = `
      <!DOCTYPE html>
      <html lang="km">
      <head>
        <meta charset="utf-8">
        <title>របាយការណ៍វត្តមានសិស្ស - KrouDigital</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Moul&family=Siemreap&display=swap');
          @page { size: A4 landscape; margin: 0mm; }
          * { box-sizing: border-box !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; font-family: 'Siemreap', sans-serif; }
          html, body { background: #fff; width: 100%; height: 100%; color: #000; margin: 0; padding: 0; }
          .font-moul { font-family: 'Moul', serif !important; }
          .print-page-wrapper { page-break-after: always; }
          table { width: 100%; border-collapse: collapse; table-layout: fixed; }
          th, td { border: 0.5px solid #0f172a !important; color: #0f172a !important; }
        </style>
      </head>
      <body>
        ${clonedPrintArea.outerHTML}
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if(!printWindow) return alert("សូមអនុញ្ញាត Pop-up");
    printWindow.document.open();
    printWindow.document.write(printDocument);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 800);
};


// ==========================================================================
// ផ្នែកទី ៥៖ របាយការណ៍លទ្ធផល (Scores Report - Print Dashboard)
// ==========================================================================
window.renderScoresReportHTML = function(container) {
    container.innerHTML = `
        <div class="w-full flex flex-col items-center max-w-4xl mx-auto font-siemreap animate-fade-in">
            <div class="w-full bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200">
                <div class="text-center mb-8 border-b border-slate-100 pb-6">
                    <div class="w-16 h-16 mx-auto bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-inner">
                        <i class="fa-solid fa-ranking-star"></i>
                    </div>
                    <h2 class="font-moul text-xl text-slate-800">មជ្ឈមណ្ឌលបោះពុម្ពលទ្ធផលសិក្សា</h2>
                    <p class="text-slate-500 text-sm mt-2">សូមជ្រើសរើសប្រភេទរបាយការណ៍ ដែលលោកគ្រូអ្នកគ្រូចង់បោះពុម្ពបញ្ចេញ (Export)</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
                    
                    <!-- ប៊ូតុងបញ្ជីពិន្ទុ -->
                    <div onclick="window.triggerPrintScores('list')" class="border-2 border-slate-100 hover:border-blue-400 bg-slate-50 hover:bg-blue-50 rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 group">
                        <i class="fa-solid fa-file-invoice text-4xl text-slate-400 group-hover:text-blue-500 mb-3 transition-colors"></i>
                        <h3 class="font-bold text-slate-700 group-hover:text-blue-700 text-lg mb-1">១. បញ្ជីពិន្ទុ</h3>
                        <p class="text-xs text-slate-500">តារាងបញ្ជីស្រង់ពិន្ទុរួម</p>
                    </div>

                    <!-- ប៊ូតុងចំណាត់ថ្នាក់ -->
                    <div onclick="window.triggerPrintScores('ranking')" class="border-2 border-slate-100 hover:border-amber-400 bg-slate-50 hover:bg-amber-50 rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 group">
                        <i class="fa-solid fa-trophy text-4xl text-slate-400 group-hover:text-amber-500 mb-3 transition-colors"></i>
                        <h3 class="font-bold text-slate-700 group-hover:text-amber-700 text-lg mb-1">២. តារាងចំណាត់ថ្នាក់</h3>
                        <p class="text-xs text-slate-500">សិស្សតម្រៀបតាមចំណាត់ថ្នាក់</p>
                    </div>

                    <!-- ប៊ូតុងសៀវភៅតាមដាន -->
                    <div onclick="window.triggerPrintScores('reportCard')" class="border-2 border-slate-100 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50 rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 group">
                        <i class="fa-solid fa-book-open text-4xl text-slate-400 group-hover:text-indigo-500 mb-3 transition-colors"></i>
                        <h3 class="font-bold text-slate-700 group-hover:text-indigo-700 text-lg mb-1">៣. សៀវភៅតាមដាន</h3>
                        <p class="text-xs text-slate-500">ព្រឹត្តិបត្រពិន្ទុសម្រាប់សិស្សម្នាក់ៗ</p>
                    </div>

                </div>

                <div class="mt-8 bg-slate-100/50 p-4 rounded-xl border border-slate-200 text-center">
                    <p class="text-sm font-bold text-slate-600 mb-2">កំណត់សម្គាល់៖</p>
                    <p class="text-xs text-slate-500">ការបោះពុម្ពរបាយការណ៍ទាំងនេះ នឹងទាញយកទិន្នន័យពី <b class="text-indigo-600">"មុខងារបញ្ចូលពិន្ទុ"</b> ជាការស្រេច។ ប្រសិនបើលោកគ្រូចង់ប្តូរខែ ឬឆមាស សូមចូលទៅកាន់មុខងារបញ្ចូលពិន្ទុ ដើម្បីរៀបចំជាមុនសិន។</p>
                </div>
            </div>
        </div>
    `;
};

window.triggerPrintScores = function(type) {
    if (typeof window.calculateAllScores === 'function') window.calculateAllScores();
    
    if (type === 'list') {
        if(typeof window.printScoreList === 'function') {
            window.printScoreList();
        } else {
            alert("សូមចូលទៅកាន់មុខងារបញ្ចូលពិន្ទុដើម្បីប្រើមុខងារនេះ។");
        }
    } else if (type === 'ranking') {
        if(typeof window.printRankings === 'function') {
            window.printRankings();
        } else {
            alert("សូមចូលទៅកាន់មុខងារបញ្ចូលពិន្ទុដើម្បីប្រើមុខងារនេះ។");
        }
    } else if (type === 'reportCard') {
        if(typeof window.printReportCards === 'function') {
            window.reportCardPrintType = 'full_booklet'; // Set to print full booklet
            window.printReportCards();
        } else {
            alert("សូមចូលទៅកាន់មុខងារបញ្ចូលពិន្ទុដើម្បីប្រើមុខងារនេះ។");
        }
    }
};

// ==========================================================================
// មុខងារជំនួយសម្រាប់ Print ទម្រង់រង
// ==========================================================================
window.printReportArea = function(areaId, orientation = 'portrait') {
    const printArea = document.getElementById(areaId);
    if (!printArea) return;

    const clonedPrintArea = printArea.cloneNode(true);
    clonedPrintArea.style.boxShadow = 'none';
    clonedPrintArea.style.margin = '0 auto';
    clonedPrintArea.style.maxWidth = '100%';
    
    if (window.CMSPrintManager && typeof window.CMSPrintManager.openUniversalPreview === 'function') {
        window.CMSPrintManager.openUniversalPreview({
            title: "របាយការណ៍រដ្ឋបាលគ្រូ",
            paperSize: "A4",
            orientation: orientation,
            defaultZoom: orientation === 'landscape' ? 0.95 : 1.0,
            contentHtml: clonedPrintArea.outerHTML,
            autoWrapHeaderFooter: false
        });
        return;
    }

    const printDocument = `
      <!DOCTYPE html>
      <html lang="km">
      <head>
        <meta charset="utf-8">
        <title>របាយការណ៍រដ្ឋបាលគ្រូ</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Moul&family=Siemreap&display=swap');
          @page { size: A4 ${orientation}; margin: 8mm; }
          * { box-sizing: border-box !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; font-family: 'Siemreap', sans-serif; }
          html, body { background: #fff; width: 100%; height: 100%; color: #000; }
          .font-moul { font-family: 'Moul', serif !important; }
        </style>
      </head>
      <body>
        ${clonedPrintArea.outerHTML}
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if(!printWindow) return alert("សូមអនុញ្ញាត Pop-up");
    printWindow.document.open();
    printWindow.document.write(printDocument);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 800);
};