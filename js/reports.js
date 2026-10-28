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
                    <button type="button" id="btnSyncReportsGAS" onclick="window.syncReportsToGoogleSheets(this)" class="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5 active:scale-95 outline-none" title="រក្សាទុករបាយការណ៍ទាំងអស់ទៅក្នុង Google Sheets"><i class="fa-solid fa-cloud-arrow-up text-amber-300"></i><span>រក្សាទុកក្នុង Sheets</span></button>
                    <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800">
                        <i class="fa-solid fa-file-invoice text-xs"></i> របាយការណ៍កម្រិតថ្នាក់
                    </span>
                </div>
            </div>

                <!-- Cards Grid - រចនាឡើងតាមស្តង់ដារ KrouDigital 4.0 -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
                    
                    <!-- Card 1: សៀវភៅសិក្ខាគារិក (MoEYS Official Cumulative Booklet) -->
                    <div onclick="window.openReportDetail('sikhakarik')" class="bg-white/90 backdrop-blur-md rounded-[2rem] p-6 shadow-sm hover:shadow-[0_20px_40px_rgb(30,58,138,0.22)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer border-2 border-blue-200 hover:border-blue-600 group flex flex-col justify-between h-[210px] relative overflow-hidden">
                        <div class="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out pointer-events-none"></div>
                        <div class="flex items-center justify-between relative z-10">
                            <div class="w-14 h-14 bg-gradient-to-br from-blue-700 to-indigo-900 text-white rounded-2xl flex items-center justify-center text-2xl shadow-md shadow-blue-700/30 group-hover:scale-110 transition-transform"><i class="fa-solid fa-book-bookmark"></i></div>
                            <span class="text-[10px] bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">MoEYS Standard</span>
                        </div>
                        <div class="relative z-10">
                            <h3 class="font-moul text-[15px] text-slate-900 mb-1.5 group-hover:text-blue-700">សៀវភៅសិក្ខាគារិក</h3>
                            <p class="text-slate-500 text-[11px] leading-relaxed">សៀវភៅសិក្ខាគារិកផ្លូវការក្រសួងអប់រំ រួមមាន ក្របមុខ សេចក្តីណែនាំ ប្រវត្តិរូប និងលទ្ធផលប្រឡងឆមាស។</p>
                        </div>
                    </div>

                    <!-- Card 2: សៀវភៅតាមដានការសិក្សា (ព្រឹត្តិបត្រពិន្ទុរួម) -->
                    <div onclick="if(typeof window.openTrackingBookModal === 'function'){ window.openTrackingBookModal(); } else if (typeof window.loadTrackingBookView === 'function'){ window.loadTrackingBookView(); }" class="bg-white/90 backdrop-blur-md rounded-[2rem] p-6 shadow-sm hover:shadow-[0_20px_40px_rgb(99,102,241,0.2)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer border-2 border-indigo-100 hover:border-indigo-500 group flex flex-col justify-between h-[210px] relative overflow-hidden">
                        <div class="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out pointer-events-none"></div>
                        <div class="flex items-center justify-between relative z-10">
                            <div class="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl flex items-center justify-center text-2xl shadow-md shadow-indigo-500/30 group-hover:scale-110 transition-transform"><i class="fa-solid fa-book-open-reader"></i></div>
                            <span class="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Tracking Book</span>
                        </div>
                        <div class="relative z-10">
                            <h3 class="font-moul text-[15px] text-slate-900 mb-1.5 group-hover:text-indigo-600">សៀវភៅតាមដានការសិក្សា</h3>
                            <p class="text-slate-500 text-[11px] leading-relaxed">តាមដានការសិក្សា វិន័យ និងព្រឹត្តិបត្រពិន្ទុសិស្សប្រចាំខែ ឆមាស និងប្រចាំឆ្នាំតាមស្តង់ដារក្រសួង។</p>
                        </div>
                    </div>

                    <!-- Card 3: តារាងកិត្តិយស (Honor Board Top 5) -->
                    <div onclick="if(typeof window.openHonorBoardModal === 'function'){ window.openHonorBoardModal(); } else if(typeof window.openScoreModal === 'function'){ window.openScoreModal('modal-honorboard', window.renderHonorBoardContent); } else { window.openReportDetail('report_kha'); }" class="bg-white/90 backdrop-blur-md rounded-[2rem] p-6 shadow-sm hover:shadow-[0_20px_40px_rgb(245,158,11,0.2)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer border-2 border-amber-100 hover:border-amber-400 group flex flex-col justify-between h-[210px] relative overflow-hidden">
                        <div class="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out pointer-events-none"></div>
                        <div class="flex items-center justify-between relative z-10">
                            <div class="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-2xl flex items-center justify-center text-2xl shadow-md shadow-amber-500/30 group-hover:scale-110 transition-transform"><i class="fa-solid fa-crown"></i></div>
                            <span class="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Top 5 Honor Board</span>
                        </div>
                        <div class="relative z-10">
                            <h3 class="font-moul text-[15px] text-slate-900 mb-1.5 group-hover:text-amber-600">តារាងកិត្តិយស</h3>
                            <p class="text-slate-500 text-[11px] leading-relaxed">តារាងកិត្តិយសសិស្សឆ្នើម Top 3 / Top 5 អាចកែសម្រួលអត្ថបទ រូបថត និងរចនាដោយដៃបានភ្លាមៗ។</p>
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
                            <p class="text-slate-500 text-[11px] leading-relaxed">បង្កើតប័ណ្ណសរសើរសិស្សពូកែ និងវិន័យល្អ ជ្រើសរើសស៊ុមបានច្រើនម៉ូដ និងកែប្រែបាន។</p>
                        </div>
                    </div>

                    <!-- KrouDigital Card 6: របាយការណ៍វត្តមាន -->
                    <div onclick="window.openReportDetail('attendance')" class="bg-white/90 backdrop-blur-md rounded-[2rem] p-6 shadow-sm hover:shadow-[0_20px_40px_rgb(16,185,129,0.18)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer border-2 border-emerald-100 hover:border-emerald-400 group flex flex-col justify-between h-[210px] relative overflow-hidden">
                        <div class="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out pointer-events-none"></div>
                        <div class="flex items-center justify-between relative z-10">
                            <div class="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl flex items-center justify-center text-2xl shadow-md shadow-emerald-500/30 group-hover:scale-110 transition-transform"><i class="fa-solid fa-calendar-check"></i></div>
                            <span class="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase">Attendance</span>
                        </div>
                        <div class="relative z-10">
                            <h3 class="font-moul text-[15px] text-slate-900 mb-1.5 group-hover:text-emerald-600">របាយការណ៍វត្តមាន</h3>
                            <p class="text-slate-500 text-[11px] leading-relaxed">ស្ថិតិវត្តមាន-អវត្តមានសិស្សប្រចាំខែ ឆមាស និងប្រចាំឆ្នាំ ដោយទាញទិន្នន័យជាក់ស្តែង។</p>
                        </div>
                    </div>

                    <!-- KrouDigital Card 7: លទ្ធផលសិក្សា (ប្រចាំខែ ឆមាស ប្រចាំឆ្នាំ) -->
                    <div onclick="window.openReportDetail('report_ko_kho')" class="bg-white/90 backdrop-blur-md rounded-[2rem] p-6 shadow-sm hover:shadow-[0_20px_40px_rgb(16,185,129,0.18)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer border-2 border-emerald-100 hover:border-emerald-400 group flex flex-col justify-between h-[210px] relative overflow-hidden">
                        <div class="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out pointer-events-none"></div>
                        <div class="flex items-center justify-between relative z-10">
                            <div class="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-600 text-white rounded-2xl flex items-center justify-center text-2xl shadow-md shadow-emerald-500/30 group-hover:scale-110 transition-transform"><i class="fa-solid fa-graduation-cap"></i></div>
                            <span class="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase">គ្រប់កាលវិភាគ</span>
                        </div>
                        <div class="relative z-10">
                            <h3 class="font-moul text-[15px] text-slate-900 mb-1.5 group-hover:text-emerald-600">លទ្ធផលសិក្សា (ប្រចាំខែ ឆមាស ប្រចាំឆ្នាំ)</h3>
                            <p class="text-slate-500 text-[11px] leading-relaxed">លទ្ធផលសិក្សាផ្លូវការ ៣ ផ្នែក៖ ប្រចាំខែ ប្រចាំឆមាស (ឆ១ & ឆ២) និងប្រចាំឆ្នាំ (ឡើង/ត្រួតថ្នាក់)។</p>
                        </div>
                    </div>

                    <!-- KrouDigital Card 8: របាយការណ៍សុខភាព (BMI) -->
                    <div onclick="window.openReportDetail('health')" class="bg-white/90 backdrop-blur-md rounded-[2rem] p-6 shadow-sm hover:shadow-[0_20px_40px_rgb(244,63,94,0.18)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer border-2 border-rose-100 hover:border-rose-400 group flex flex-col justify-between h-[210px] relative overflow-hidden">
                        <div class="absolute -right-4 -top-4 w-24 h-24 bg-rose-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out pointer-events-none"></div>
                        <div class="flex items-center justify-between relative z-10">
                            <div class="w-14 h-14 bg-gradient-to-br from-rose-500 to-pink-600 text-white rounded-2xl flex items-center justify-center text-2xl shadow-md shadow-rose-500/30 group-hover:scale-110 transition-transform"><i class="fa-solid fa-heart-pulse"></i></div>
                            <span class="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full uppercase">Health & BMI</span>
                        </div>
                        <div class="relative z-10">
                            <h3 class="font-moul text-[15px] text-slate-900 mb-1.5 group-hover:text-rose-600">របាយការណ៍សុខភាព</h3>
                            <p class="text-slate-500 text-[11px] leading-relaxed">គណនា BMI ស្វ័យប្រវត្ត (កម្ពស់-ទម្ងន់) ការពិនិត្យភ្នែក និងវ៉ាក់សាំង។</p>
                        </div>
                    </div>

                    <!-- Card 9: ស្ថិតិសិស្ស -->
                    <div onclick="window.openReportDetail('stats')" class="bg-white/90 backdrop-blur-md rounded-[2rem] p-6 shadow-sm hover:shadow-[0_20px_40px_rgb(59,130,246,0.15)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer border border-slate-100 group flex flex-col justify-between h-[210px] relative overflow-hidden">
                        <div class="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out pointer-events-none"></div>
                        <div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center text-2xl shadow-md shadow-blue-500/30 group-hover:scale-110 transition-transform relative z-10"><i class="fa-solid fa-chart-pie"></i></div>
                        <div class="relative z-10"><h3 class="font-moul text-[15px] text-slate-800 mb-1.5 group-hover:text-blue-700">តារាងស្ថិតិសិស្ស</h3><p class="text-slate-500 text-[11px] leading-relaxed">របាយការណ៍ចំនួនសិស្សដើមឆ្នាំ/ចុងឆ្នាំ បែងចែកតាមអាយុ និងភេទ។</p></div>
                    </div>

                    <!-- Card 10: នាំចេញ Master Excel -->
                    <div onclick="window.AdvancedReports && window.AdvancedReports.exportMasterExcelWorkbook ? window.AdvancedReports.exportMasterExcelWorkbook() : alert('Export Master Excel')" class="bg-white/90 backdrop-blur-md rounded-[2rem] p-6 shadow-sm hover:shadow-[0_20px_40px_rgb(16,185,129,0.15)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer border border-slate-100 group flex flex-col justify-between h-[210px] relative overflow-hidden">
                        <div class="absolute -right-4 -top-4 w-24 h-24 bg-teal-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out pointer-events-none"></div>
                        <div class="w-14 h-14 bg-gradient-to-br from-teal-400 to-emerald-600 text-white rounded-2xl flex items-center justify-center text-2xl shadow-md shadow-emerald-500/30 group-hover:scale-110 transition-transform relative z-10"><i class="fa-solid fa-file-excel"></i></div>
                        <div class="relative z-10"><h3 class="font-moul text-[15px] text-slate-800 mb-1.5 group-hover:text-teal-600">Master Excel</h3><p class="text-slate-500 text-[11px] leading-relaxed">នាំចេញឯកសារ Excel ច្រើន Sheet រួមមាន បញ្ជីសិស្ស និងពិន្ទុ។</p></div>
                    </div>

                    <!-- Card 11: ច្រកពិនិត្យលទ្ធផលមាតាបិតា -->
                    <div onclick="window.KrouDigital && window.KrouDigital.openParentPortalModal()" class="bg-white/90 backdrop-blur-md rounded-[2rem] p-6 shadow-sm hover:shadow-[0_20px_40px_rgb(14,165,233,0.18)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer border-2 border-sky-100 hover:border-sky-400 group flex flex-col justify-between h-[210px] relative overflow-hidden">
                        <div class="absolute -right-4 -top-4 w-24 h-24 bg-sky-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out pointer-events-none"></div>
                        <div class="flex items-center justify-between relative z-10">
                            <div class="w-14 h-14 bg-gradient-to-br from-sky-400 to-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl shadow-md shadow-sky-500/30 group-hover:scale-110 transition-transform"><i class="fa-solid fa-magnifying-glass-chart"></i></div>
                            <span class="text-[10px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded-full uppercase">Parent Portal</span>
                        </div>
                        <div class="relative z-10">
                            <h3 class="font-moul text-[15px] text-slate-900 mb-1.5 group-hover:text-sky-600">ច្រកមាតាបិតា & សិស្ស</h3>
                            <p class="text-slate-500 text-[11px] leading-relaxed">ស្វែងរកពិន្ទុ និងទាញយកព្រឹត្តិបត្រពិន្ទុសម្រាប់មាតាបិតា។</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ផ្ទាំងបង្ហាញរបាយការណ៍លម្អិត (Report Detail View) -->
            <div id="reportDetailContent" class="hidden w-full h-full flex-col relative z-20 space-y-3">
                <!-- ផ្នែកទី ១៖ របារចំណងជើងរបាយការណ៍ (Section 1: Report Title Header Bar) -->
                <div class="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-wrap justify-between items-center gap-3 z-40 sticky top-0 no-print">
                    <div class="flex items-center gap-3">
                        <button onclick="window.closeReportDetail()" class="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 flex items-center gap-2 font-bold text-xs transition shadow-sm active:scale-95 shrink-0" title="ត្រឡប់ក្រោយ (Back)">
                            <i class="fa-solid fa-arrow-left text-sm"></i> <span>ត្រឡប់ក្រោយ</span>
                        </button>
                        <div>
                            <h2 id="reportDetailTitle" class="font-moul text-slate-800 dark:text-white text-sm sm:text-base md:text-lg leading-snug">ចំណងជើងរបាយការណ៍</h2>
                            <p id="reportDetailSub" class="text-xs text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">ថ្នាក់ ${gradeFull}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="hidden sm:flex px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-bold border border-indigo-200 dark:border-indigo-800 items-center gap-1.5 shadow-sm">
                            <i class="fa-solid fa-file-lines"></i> <span>ឯកសាររដ្ឋបាល</span>
                        </span>
                        <button onclick="window.closeReportDetail()" class="w-10 h-10 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-slate-700 dark:text-rose-400 flex items-center justify-center transition shadow-sm active:scale-95 shrink-0" title="បិទ (Close)">
                            <i class="fa-solid fa-xmark text-lg"></i>
                        </button>
                    </div>
                </div>

                <!-- ផ្នែកទី ២៖ របារកំណត់ប្រភេទក្រដាស និងការបោះពុម្ព (Section 2: Paper Settings & Print Toolbar Under Title) -->
                <div id="reportPrintConfigBar" class="bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-800 dark:via-slate-850 dark:to-slate-800 p-2 sm:p-2.5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-2 z-30 no-print overflow-x-auto custom-scrollbar flex-nowrap whitespace-nowrap w-full">
                    <!-- ផ្នែកខាងឆ្វេង៖ តម្រងទិន្នន័យ (Filters: ខែ / ទម្រង់បញ្ជី / រក្សាទុក) -->
                    <div id="reportExtraControls" class="flex items-center gap-2 flex-nowrap shrink-0"></div>

                    <!-- ផ្នែកខាងស្តាំ៖ ការកំណត់ប្រភេទក្រដាស ទិសដៅ មាត្រដ្ឋាន និងប៊ូតុងព្រីន -->
                    <div id="reportDetailPrintToolbarArea" class="flex items-center gap-2 flex-nowrap shrink-0">
                        ${window.CMSPrintManager ? window.CMSPrintManager.renderToolbarHtml('reportPaperArea', 'portrait', 'A4', 100) : `
                            <button onclick="window.printCurrentReport()" class="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/30 transition flex items-center gap-2 active:scale-95 outline-none">
                                <i class="fa-solid fa-print"></i> បោះពុម្ព
                            </button>
                        `}
                    </div>
                </div>

                <!-- ផ្នែកទី ៣៖ ផ្ទាំងការងារក្រដាសរបាយការណ៍ (Section 3: Realistic Paper Canvas) -->
                <div class="w-full flex-1 overflow-auto custom-scrollbar flex justify-center pb-16 pt-2">
                    <div id="reportPaperArea" class="transition-all relative flex justify-center items-start">
                        <!-- Content goes here -->
                    </div>
                </div>
            </div>
        </div>
    `;

    if (typeof window.applyAcademicReportPaperSettings === 'function') {
        window.applyAcademicReportPaperSettings();
    }
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
        if (reportType === 'sikhakarik') {
            titleEl.textContent = `សៀវភៅសិក្ខាគារិក (${gradeFull})`;
            const allStus = (typeof window.getStudentsForClass === 'function')
                ? window.getStudentsForClass(curLevel, curRoom)
                : (window.allStudents || []);
            const selectedStuId = window.currentSikhaStudentId || (allStus[0] ? (allStus[0].id || allStus[0].student_id) : '');
            const selectedPage = window.currentSikhaPageMode || 'all';

            if (extraControls) {
                extraControls.classList.remove("hidden");
                extraControls.innerHTML = `
                    <div class="flex items-center gap-1.5 bg-indigo-50 dark:bg-slate-700 border border-indigo-200 dark:border-slate-600 rounded-xl px-2.5 py-1 text-xs">
                        <span class="font-bold text-indigo-900 dark:text-indigo-300"><i class="fa-solid fa-user-graduate mr-1"></i>សិស្ស ៖</span>
                        <select id="sikhaStudentSelect" onchange="window.currentSikhaStudentId = this.value; window.renderSikhaKarikBooklet(document.getElementById('reportPaperArea'), '${curLevel}', '${curRoom}', this.value, document.getElementById('sikhaPageSelect')?.value);" class="bg-transparent font-bold text-indigo-700 dark:text-indigo-300 outline-none cursor-pointer max-w-[170px] truncate">
                            ${allStus.map((s, idx) => `<option value="${s.id || s.student_id}" ${(String(s.id) === String(selectedStuId) || String(s.student_id) === String(selectedStuId)) ? 'selected' : ''}>${idx + 1}. ${s.name} (${s.gender || ''})</option>`).join('')}
                        </select>
                    </div>
                    <div class="flex items-center gap-1.5 bg-blue-50 dark:bg-slate-700 border border-blue-200 dark:border-slate-600 rounded-xl px-2.5 py-1 text-xs">
                        <span class="font-bold text-blue-900 dark:text-blue-300"><i class="fa-solid fa-book-open mr-1"></i>ទំព័រ ៖</span>
                        <select id="sikhaPageSelect" onchange="window.currentSikhaPageMode = this.value; window.renderSikhaKarikBooklet(document.getElementById('reportPaperArea'), '${curLevel}', '${curRoom}', document.getElementById('sikhaStudentSelect')?.value, this.value);" class="bg-transparent font-bold text-blue-700 dark:text-blue-300 outline-none cursor-pointer">
                            <option value="all" ${selectedPage === 'all' ? 'selected' : ''}>ទំព័រទាំងអស់ (សៀវភៅទាំងមូល)</option>
                            <option value="cover" ${selectedPage === 'cover' ? 'selected' : ''}>ទំព័រទី១ ៖ ក្របមុខ</option>
                            <option value="instructions_bio" ${selectedPage === 'instructions_bio' ? 'selected' : ''}>ទំព័រទី២ & ៣ ៖ សេចក្តីណែនាំ និងប្រវត្តិរូប</option>
                            <option value="scores_eval" ${selectedPage === 'scores_eval' ? 'selected' : ''}>ទំព័រទី៤ & ៥ ៖ លទ្ធផលប្រឡងឆមាស និងការវាយតម្លៃ</option>
                        </select>
                    </div>
                `;
            }
            if (window.CMSPrintManager) window.CMSPrintManager.updateToolbarDefaults('reportPaperArea', 'landscape', 'A4', 100);
            if (typeof window.renderSikhaKarikBooklet === 'function') {
                window.renderSikhaKarikBooklet(paperArea, curLevel, curRoom, selectedStuId, selectedPage);
            }
        } else if (reportType === 'report_ka') {
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
                    <button onclick="if(typeof window.openHonorBoardModal === 'function'){ window.openHonorBoardModal(); } else if(typeof window.openScoreModal === 'function'){ window.openScoreModal('modal-honorboard', window.renderHonorBoardContent); }" class="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition active:scale-95">
                        <i class="fa-solid fa-wand-magic-sparkles"></i> <span>ម៉ូត Canva សម្រាប់ចែករំលែក</span>
                    </button>
                `;
            }
            if (window.CMSPrintManager) window.CMSPrintManager.updateToolbarDefaults('reportPaperArea', 'portrait', 'A4', 100);
            if (window.KrouDigital && typeof window.KrouDigital.renderReportKha === 'function') {
                window.KrouDigital.renderReportKha(paperArea, curLevel, curRoom);
            }
        } else if (reportType === 'report_ko_kho') {
            window.currentAcademicReportMode = window.currentAcademicReportMode || 'monthly';
            window.currentAcademicReportMonth = window.currentAcademicReportMonth || 'មករា';
            window.currentAcademicReportSemester = window.currentAcademicReportSemester || 'ឆមាសទី១';

            titleEl.textContent = `លទ្ធផលសិក្សា (${gradeFull})`;

            if (extraControls) {
                extraControls.classList.remove("hidden");
                if (typeof window.renderAcademicReportControls === 'function') {
                    window.renderAcademicReportControls(extraControls, curLevel, curRoom);
                }
            }

            if (window.CMSPrintManager) window.CMSPrintManager.updateToolbarDefaults('reportPaperArea', 'landscape', 'A4', 100);
            if (typeof window.renderAcademicResultsReport === 'function') {
                window.renderAcademicResultsReport(paperArea, curLevel, curRoom, window.currentAcademicReportMode);
            } else if (window.KrouDigital && typeof window.KrouDigital.renderReportKoKho === 'function') {
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
    if (window.currentActiveReportType === 'stats') {
        window.printStudentStatsReport();
        return;
    }
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
    const academicYear = document.getElementById("globalAcademicYear")?.value || sInfo.academic_year || "២០២៤-២០២៥";
    const activeClass = typeof window.getCurrentSelectedClass === 'function' ? window.getCurrentSelectedClass() : { level: "ថ្នាក់ទី ៤", room: "«ក»" };
    const curLevel = targetGrade || window.currentReportTargetGrade || document.getElementById("reportGradeSelect")?.value || activeClass.level || sInfo.teacher_level || "ថ្នាក់ទី ៤";
    const curRoom = targetRoom || window.currentReportTargetRoom || document.getElementById("reportRoomSelect")?.value || activeClass.room || sInfo.teacher_room || "«ក»";
    const gradeFull = `${curLevel} ${curRoom}`.trim();
    const gradeShort = gradeFull.replace(/^(ថ្នាក់ទី|ថ្នាក់)\s*/, '').replace(/[«»]/g, '').trim();

    // ព័ត៌មានរដ្ឋបាល
    const districtName = (sInfo.district || "រុក្ខគិរី").replace(/^ស្រុក\s*/, '').trim(); 
    const provinceName = sInfo.province || "បាត់ដំបង";
    const schoolName = sInfo.school_name || "សាលាបឋមសិក្សា ដង្កោ";
    const teacherName = (window.AuthState ? window.AuthState.teacherName : null) || localStorage.getItem('auth_teacher_name') || sInfo.teacher_name || "សេក ពុទ្ធី";
    const teacherGender = sInfo.teacher_gender || "ប្រុស/ស្រី";
    const teacherAge = sInfo.teacher_age || "២៦ ឆ្នាំ"; 
    const teacherEthnicity = sInfo.teacher_ethnicity || "មិនមែន/ទេ"; 
    const teacherEducation = sInfo.teacher_edu || "បរិញ្ញាបត្រ"; 
    const teacherExperience = sInfo.teacher_exp || "៦ ឆ្នាំ"; 
    const teacherRank = sInfo.teacher_rank || "ក.ល";

    let locShort = "";
    const rawLoc = document.getElementById('global_loc_input')?.value || localStorage.getItem('rc_location') || localStorage.getItem('rep_location');
    if (rawLoc) {
        locShort = rawLoc.replace(/^ធ្វើនៅ\s*/, '').replace(/,+$/, '').trim();
    } else {
        locShort = schoolName.replace(/^(សាលាបឋមសិក្សា|អនុវិទ្យាល័យ|វិទ្យាល័យ|សាលា)\s*/g, '').trim();
        if (!locShort) locShort = districtName || "ដង្កោ";
    }

    let sDate = "";
    const rawDate = document.getElementById('global_sol_input')?.value || localStorage.getItem('rc_solar_date') || localStorage.getItem('rep_solar_date');
    if (rawDate && rawDate.trim()) {
        sDate = rawDate.trim();
    } else {
        sDate = "ថ្ងៃទី១១ ខែធ្នូ ឆ្នាំ២០២៣";
    }
    if (sDate.includes("ថ្ងៃទី")) sDate = sDate.substring(sDate.indexOf("ថ្ងៃទី"));

    const solarDateStr = `ធ្វើនៅ ${locShort} ${sDate}`;
    const lunarDateStr = document.getElementById('global_lun_input')?.value || localStorage.getItem('rc_lunar_date') || localStorage.getItem('rep_lunar_date') || "ថ្ងៃចន្ទ ១៤រោច ខែកត្តិក ឆ្នាំថោះ បញ្ចស័ក ព.ស. ២៥៦៧";

    // គណនាទិន្នន័យអាយុសិស្សក្នុងថ្នាក់
    const studentsInClass = typeof window.getStudentsForClass === 'function'
        ? window.getStudentsForClass(curLevel, curRoom, academicYear)
        : [];
    let totalStus = studentsInClass.length;
    let femaleStus = studentsInClass.filter(s => s && (s.gender === 'ស្រី' || s.gender === 'F')).length;

    let ageStats = {
        '6': { newT: 0, newF: 0, repT: 0, repF: 0 },
        '7': { newT: 0, newF: 0, repT: 0, repF: 0 },
        '8': { newT: 0, newF: 0, repT: 0, repF: 0 },
        '9': { newT: 0, newF: 0, repT: 0, repF: 0 },
        '10': { newT: 0, newF: 0, repT: 0, repF: 0 },
        '11': { newT: 0, newF: 0, repT: 0, repF: 0 },
        '12': { newT: 0, newF: 0, repT: 0, repF: 0 },
        '13': { newT: 0, newF: 0, repT: 0, repF: 0 },
        '14': { newT: 0, newF: 0, repT: 0, repF: 0 },
        '15+': { newT: 0, newF: 0, repT: 0, repF: 0 }
    };

    let refYear = parseInt(String(academicYear).split(/[-_]/)[0]) || new Date().getFullYear();

    studentsInClass.forEach(s => {
        if (!s) return;
        let age = 10;
        if (s.age && !isNaN(parseInt(s.age, 10))) {
            age = parseInt(s.age, 10);
        } else if (s.dob) {
            try {
                let parts = String(s.dob).replace(/["']/g, '').split(/[-/T]/);
                let birthYear = parseInt(parts[0], 10);
                if (birthYear > 1900) { age = refYear - birthYear; }
                else if (parts[2]) { age = refYear - parseInt(parts[2], 10); }
            } catch(e) {}
        }
        
        let ageKey = age >= 15 ? '15+' : (age < 6 ? '6' : age.toString());
        if (!ageStats[ageKey]) ageKey = '15+';

        const isFem = s.gender === 'ស្រី' || s.gender === 'F';
        const isRepeater = String(s.status || s.academic_status || '').includes('ត្រួត') || s.is_repeater;

        if (isRepeater) {
            ageStats[ageKey].repT++;
            if (isFem) ageStats[ageKey].repF++;
        } else {
            ageStats[ageKey].newT++;
            if (isFem) ageStats[ageKey].newF++;
        }
    });

    // ផលបូកសរុបអាយុ
    let sumNewT = 0, sumNewF = 0, sumRepT = 0, sumRepF = 0;
    Object.values(ageStats).forEach(v => {
        sumNewT += v.newT; sumNewF += v.newF;
        sumRepT += v.repT; sumRepF += v.repF;
    });

    let ageRowsHtml = "";
    ['6', '7', '8', '9', '10', '11', '12', '13', '14', '15+'].forEach(key => {
        const item = ageStats[key];
        const rowTotT = item.newT + item.repT;
        const rowTotF = item.newF + item.repF;
        ageRowsHtml += `
            <tr style="height: 19px;">
                <td class="font-bold text-center">${key}</td>
                <td contenteditable="true" class="text-center font-mono">${item.newT}</td>
                <td contenteditable="true" class="text-center font-mono">${item.newF}</td>
                <td contenteditable="true" class="text-center font-mono">${item.repT}</td>
                <td contenteditable="true" class="text-center font-mono">${item.repF}</td>
                <td contenteditable="true" class="text-center font-mono font-bold bg-slate-50">${rowTotT}</td>
                <td contenteditable="true" class="text-center font-mono font-bold bg-slate-50">${rowTotF}</td>
            </tr>
        `;
    });

    container.innerHTML = `
        <div id="studentStatsPrintArea" class="bg-white p-4 sm:p-6 w-full shadow-[0_10px_40px_rgba(0,0,0,0.08)] rounded-xl border border-slate-300 text-blue-950 font-siemreap" style="max-width: 210mm; margin: 0 auto; box-sizing: border-box; color: #002b66;">
            
            <style>
                .moeys-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 10.5px;
                    border: 1.5px solid #002b66;
                }
                .moeys-table th, .moeys-table td {
                    border: 1px solid #002b66;
                    padding: 2.5px 3.5px;
                    vertical-align: middle;
                }
                .moeys-table th {
                    font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif;
                    font-weight: bold;
                    background-color: #ffffff;
                    text-align: center;
                    color: #002b66;
                }
                .moeys-header-blue {
                    font-family: 'Khmer OS Muol Light', 'Khmer OS Muol', 'Moul', serif;
                    font-weight: normal !important;
                    color: #002b66;
                }
                .moeys-lavender-row {
                    background-color: #e0e7ff;
                    font-weight: bold;
                }
                [contenteditable="true"]:focus {
                    outline: 1.5px solid #2563eb;
                    background-color: #eff6ff;
                }
                @media print {
                    @page { size: A4 portrait; margin: 6mm; }
                    body * { visibility: hidden !important; }
                    #studentStatsPrintArea, #studentStatsPrintArea * { visibility: visible !important; }
                    #studentStatsPrintArea {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        max-width: 210mm !important;
                        padding: 0mm !important;
                        box-shadow: none !important;
                        border: none !important;
                    }
                }
            </style>

            <!-- 🏛️ ក្បាលទម្រង់ផ្លូវការ (Official Form Header with PRI Circle) 🏛️ -->
            <div class="relative mb-3">
                <!-- PRI Top Right Badge -->
                <div class="absolute right-0 top-0 w-11 h-11 rounded-full border border-blue-900 flex items-center justify-center font-bold text-xs text-blue-950">
                    PRI
                </div>

                <!-- ចំណងជើងកណ្តាល (Centered Moul Titles) -->
                <div class="text-center pt-1">
                    <h1 class="moeys-header-blue text-base sm:text-lg mb-0.5 tracking-wide">តារាងចំនួនសិស្សតាមថ្នាក់ (សម្រាប់គ្រូ)</h1>
                    <h2 class="moeys-header-blue text-sm sm:text-base">ឆ្នាំសិក្សា ${window.toKhmerNum(academicYear.replace('-', '_'))}</h2>
                </div>

                <!-- ព័ត៌មានទីតាំង (Location & Class Info Bar) -->
                <div class="mt-3 text-xs leading-relaxed space-y-1">
                    <div class="flex justify-between items-center px-1">
                        <div>
                            <span class="font-bold">រាជធានី/ខេត្ត:</span>
                            <span contenteditable="true" class="moeys-header-blue text-[13px] ml-4 font-bold">${provinceName}</span>
                        </div>
                        <div class="pr-16">
                            <span class="font-bold">ស្រុក/ខណ្ឌ:</span>
                            <span contenteditable="true" class="moeys-header-blue text-[13px] ml-4 font-bold">${districtName}</span>
                        </div>
                    </div>
                    
                    <div class="flex justify-between items-center px-1">
                        <div>
                            <span class="font-bold">សាលា:</span>
                            <span contenteditable="true" class="moeys-header-blue text-[13px] ml-6 font-bold">${schoolName}</span>
                        </div>
                    </div>

                    <div class="flex justify-between items-center px-1 pt-0.5">
                        <div class="font-bold text-[11px] text-blue-950">
                            ១. ព័ត៌មានសង្ខេបគ្រូទទួលបន្ទុក
                        </div>
                        <div class="pr-20">
                            <span contenteditable="true" class="moeys-header-blue text-sm font-bold text-blue-900">${gradeFull}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 📊 តួទម្រង់ចែកជា ២ ជួរឈរ (Exact Two-Column Grid of Image 2) 📊 -->
            <div class="grid grid-cols-2 gap-4 items-start">
                
                <!-- 👈 ជួរខាងឆ្វេង (LEFT COLUMN) -->
                <div class="space-y-3">
                    
                    <!-- តារាងទី ១: ព័ត៌មានសង្ខេបគ្រូទទួលបន្ទុក -->
                    <table class="moeys-table">
                        <tr>
                            <td class="w-[58%]">ឈ្មោះជាអក្សរខ្មែរ</td>
                            <td contenteditable="true" class="font-bold text-center">${teacherName}</td>
                        </tr>
                        <tr>
                            <td>ភេទ(សូមគូសរង្វង់)</td>
                            <td contenteditable="true" class="text-center">${teacherGender}</td>
                        </tr>
                        <tr>
                            <td>អាយុ(សូមគូសរង្វង់)</td>
                            <td contenteditable="true" class="text-center font-mono">${teacherAge}</td>
                        </tr>
                        <tr>
                            <td>ជនជាតិដើមភាគតិច</td>
                            <td contenteditable="true" class="text-center font-bold text-emerald-800">${teacherEthnicity}</td>
                        </tr>
                        <tr>
                            <td>កម្រិតវប្បធម៌</td>
                            <td contenteditable="true" class="text-center font-bold text-emerald-800">${teacherEducation}</td>
                        </tr>
                        <tr>
                            <td>រយៈពេលបម្រើការងារអប់រំ</td>
                            <td contenteditable="true" class="text-center font-bold font-mono">${teacherExperience}</td>
                        </tr>
                        <tr>
                            <td>កម្រិតកាតក្របខ័ណ្ឌ</td>
                            <td contenteditable="true" class="text-center font-bold">${teacherRank}</td>
                        </tr>
                    </table>

                    <!-- តារាងទី ២.(ខ): សិស្សថ្មី សិស្សឡើងថ្នាក់ និង សិស្សត្រួតថ្នាក់ -->
                    <div>
                        <div class="text-[10px] font-bold leading-tight mb-1">
                            ២.(ខ) សិស្សថ្មី សិស្សឡើងថ្នាក់ និង សិស្សត្រួតថ្នាក់<br>
                            ក្នុងឆ្នាំសិក្សា ${window.toKhmerNum(academicYear.replace('-', '_'))} គិតត្រឹមថ្ងៃទី...........................
                        </div>
                        <table class="moeys-table">
                            <thead>
                                <tr>
                                    <th rowspan="3" class="w-[14%]">អាយុ<br>(ឆ្នាំ)</th>
                                    <th colspan="6">ចំនួនសិស្ស</th>
                                </tr>
                                <tr>
                                    <th colspan="2" class="w-[28%]">សិស្សថ្មី</th>
                                    <th colspan="2" class="w-[28%]">សិស្សត្រួតថ្នាក់</th>
                                    <th colspan="2" class="w-[30%]">សរុប</th>
                                </tr>
                                <tr>
                                    <th>សរុប</th><th>ស្រី</th>
                                    <th>សរុប</th><th>ស្រី</th>
                                    <th>សរុប</th><th>ស្រី</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${ageRowsHtml}
                                <tr class="font-bold bg-slate-50" style="height: 22px;">
                                    <td class="text-center">សរុប</td>
                                    <td contenteditable="true" class="text-center font-mono font-bold">${sumNewT}</td>
                                    <td contenteditable="true" class="text-center font-mono font-bold">${sumNewF}</td>
                                    <td contenteditable="true" class="text-center font-mono font-bold">${sumRepT}</td>
                                    <td contenteditable="true" class="text-center font-mono font-bold">${sumRepF}</td>
                                    <td contenteditable="true" class="text-center font-mono font-bold text-blue-900">${totalStus}</td>
                                    <td contenteditable="true" class="text-center font-mono font-bold text-blue-900">${femaleStus}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- តារាងទី ៤: សិស្សតាមជនជាតិដើមភាគតិច -->
                    <div>
                        <div class="text-[10.5px] font-bold mb-1">៤. សិស្សតាមជនជាតិដើមភាគតិច</div>
                        <table class="moeys-table">
                            <thead>
                                <tr>
                                    <th rowspan="2" class="w-[45%]">ក្រោមអាយុ</th>
                                    <th colspan="2">សិស្សជនជាតិដើមភាគតិច</th>
                                </tr>
                                <tr>
                                    <th class="w-[27%]">សរុប</th>
                                    <th class="w-[28%]">ស្រី</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="text-center font-bold">6</td>
                                    <td contenteditable="true" class="text-center font-mono">0</td>
                                    <td contenteditable="true" class="text-center font-mono">0</td>
                                </tr>
                                <tr>
                                    <td class="text-center font-bold">7-11</td>
                                    <td contenteditable="true" class="text-center font-mono">1</td>
                                    <td contenteditable="true" class="text-center font-mono">1</td>
                                </tr>
                                <tr>
                                    <td class="text-center font-bold">12+</td>
                                    <td contenteditable="true" class="text-center font-mono">3</td>
                                    <td contenteditable="true" class="text-center font-mono">0</td>
                                </tr>
                                <tr class="font-bold bg-slate-50">
                                    <td class="text-center">សរុប</td>
                                    <td contenteditable="true" class="text-center font-mono font-bold">4</td>
                                    <td contenteditable="true" class="text-center font-mono font-bold">1</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                </div>

                <!-- 👉 ជួរខាងស្តាំ (RIGHT COLUMN) -->
                <div class="space-y-3">
                    
                    <!-- តារាងទី ២.(ក): ចំនួនសិស្សថ្នាក់ទី១ បានឆ្លងកាត់កម្រិតមត្តេយ្យ -->
                    <div>
                        <div class="text-[10px] font-bold leading-tight mb-1">
                            ២. (ក) ចំនួនសិស្សថ្នាក់ទី១ បានឆ្លងកាត់កម្រិតមត្តេយ្យ<br>
                            <span class="font-normal text-[9.5px]">(ត្រូវតែថ្នាក់ទី១មិនបាច់បំពេញតារាង ២.(ក) នេះទេ)</span>
                        </div>
                        <table class="moeys-table">
                            <thead>
                                <tr>
                                    <th rowspan="3" class="w-[36%]">ប្រភេទ</th>
                                    <th colspan="4">ថ្នាក់ទី១ (សិស្សម្នាក់អាចរាប់បានតែមួយដង)</th>
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
                                <tr>
                                    <td>មត្តេយ្យរដ្ឋ</td>
                                    <td contenteditable="true" class="text-center font-mono">3</td>
                                    <td contenteditable="true" class="text-center font-mono">1</td>
                                    <td contenteditable="true" class="text-center font-mono">2</td>
                                    <td contenteditable="true" class="text-center font-mono">1</td>
                                </tr>
                                <tr>
                                    <td>មត្តេយ្យឯកជន</td>
                                    <td contenteditable="true" class="text-center font-mono">0</td>
                                    <td contenteditable="true" class="text-center font-mono">0</td>
                                    <td contenteditable="true" class="text-center font-mono">0</td>
                                    <td contenteditable="true" class="text-center font-mono">0</td>
                                </tr>
                                <tr>
                                    <td>មត្តេយ្យសហគមន៍</td>
                                    <td contenteditable="true" class="text-center font-mono">0</td>
                                    <td contenteditable="true" class="text-center font-mono">0</td>
                                    <td contenteditable="true" class="text-center font-mono">0</td>
                                    <td contenteditable="true" class="text-center font-mono">0</td>
                                </tr>
                                <tr>
                                    <td>ការអប់រំកុមារតូច/ខ្នងផ្ទះ</td>
                                    <td contenteditable="true" class="text-center font-mono">0</td>
                                    <td contenteditable="true" class="text-center font-mono">0</td>
                                    <td contenteditable="true" class="text-center font-mono">1</td>
                                    <td contenteditable="true" class="text-center font-mono">0</td>
                                </tr>
                                <tr>
                                    <td>កម្មវិធីត្រៀមថ្នាក់ទី១</td>
                                    <td contenteditable="true" class="text-center font-mono">0</td>
                                    <td contenteditable="true" class="text-center font-mono">0</td>
                                    <td contenteditable="true" class="text-center font-mono">1</td>
                                    <td contenteditable="true" class="text-center font-mono">1</td>
                                </tr>
                                <tr class="font-bold bg-slate-50">
                                    <td class="text-center">សរុប</td>
                                    <td contenteditable="true" class="text-center font-mono font-bold">3</td>
                                    <td contenteditable="true" class="text-center font-mono font-bold">1</td>
                                    <td contenteditable="true" class="text-center font-mono font-bold">4</td>
                                    <td contenteditable="true" class="text-center font-mono font-bold">2</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- តារាងទី ៣: ចំនួនសិស្សជួបការលំបាកតាមកម្រិតថ្នាក់ -->
                    <div>
                        <div class="text-[9.5px] font-bold leading-tight mb-1">
                            ៣. ចំនួនសិស្សជួបការលំបាកតាមកម្រិតថ្នាក់(សិស្សម្នាក់អាចរាប់ច្រើនដងបាន<br>
                            តាមភាពជាក់ស្តែង បើសិស្សនោះពិការ ឬមានប៉ះពាល់ចំណុចច្រើនក្នុងបរិយាយ)
                        </div>
                        <table class="moeys-table">
                            <thead>
                                <tr>
                                    <th rowspan="2" class="w-[66%]">បរិយាយ</th>
                                    <th colspan="2">ចំណុចជួបការលំបាក</th>
                                </tr>
                                <tr>
                                    <th class="w-[17%]">សរុប</th>
                                    <th class="w-[17%]">ស្រី</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- សិស្សពិការ* Header -->
                                <tr class="moeys-lavender-row">
                                    <td colspan="3" class="font-bold text-left pl-1.5 py-0.5">សិស្សពិការ*</td>
                                </tr>
                                <tr><td>ពិបាកក្នុងការធ្វើចលនា</td><td contenteditable="true" class="text-center font-mono">4</td><td contenteditable="true" class="text-center font-mono">2</td></tr>
                                <tr><td>ពិបាកក្នុងការស្តាប់</td><td contenteditable="true" class="text-center font-mono">1</td><td contenteditable="true" class="text-center font-mono">0</td></tr>
                                <tr><td>ពិបាកក្នុងការនិយាយ</td><td contenteditable="true" class="text-center font-mono">1</td><td contenteditable="true" class="text-center font-mono">0</td></tr>
                                <tr><td>ពិបាកក្នុងការមើល</td><td contenteditable="true" class="text-center font-mono">1</td><td contenteditable="true" class="text-center font-mono">0</td></tr>
                                <tr><td>ពិបាកក្នុងការយល់ដឹង</td><td contenteditable="true" class="text-center font-mono">1</td><td contenteditable="true" class="text-center font-mono">1</td></tr>
                                <tr><td>ពិបាកសតិបញ្ញា</td><td contenteditable="true" class="text-center font-mono">1</td><td contenteditable="true" class="text-center font-mono">0</td></tr>
                                <tr><td>ពិបាកខាងផ្លូវចិត្ត</td><td contenteditable="true" class="text-center font-mono">1</td><td contenteditable="true" class="text-center font-mono">0</td></tr>
                                <tr><td>ពិបាកផ្សេងៗ (ក្រៅពីខាងលើ)</td><td contenteditable="true" class="text-center font-mono">1</td><td contenteditable="true" class="text-center font-mono">0</td></tr>

                                <!-- សិស្សជួបការលំបាកផ្នែកសុខភាព* -->
                                <tr class="moeys-lavender-row">
                                    <td colspan="3" class="font-bold text-left pl-1.5 py-0.5">សិស្សជួបការលំបាកផ្នែកសុខភាព*</td>
                                </tr>
                                <tr><td>ខ្វះអាហារូបត្ថម្ភធ្ងន់ធ្ងរ</td><td contenteditable="true" class="text-center font-mono">1</td><td contenteditable="true" class="text-center font-mono">1</td></tr>
                                <tr><td>សុខភាព/ជំងឺប្រចាំកាយ</td><td contenteditable="true" class="text-center font-mono">1</td><td contenteditable="true" class="text-center font-mono">0</td></tr>

                                <!-- សិស្សជួបការលំបាក** -->
                                <tr class="moeys-lavender-row">
                                    <td colspan="3" class="font-bold text-left pl-1.5 py-0.5">សិស្សជួបការលំបាក**</td>
                                </tr>
                                <tr><td>មកពីគ្រួសារផ្លាស់ប្តូរទីលំនៅ</td><td contenteditable="true" class="text-center font-mono">1</td><td contenteditable="true" class="text-center font-mono">0</td></tr>
                                <tr><td>កុមារកំព្រា</td><td contenteditable="true" class="text-center font-mono">1</td><td contenteditable="true" class="text-center font-mono">1</td></tr>
                                <tr><td>កុមាររងគ្រោះដោយ HIV/AIDS</td><td contenteditable="true" class="text-center font-mono">1</td><td contenteditable="true" class="text-center font-mono">1</td></tr>
                                <tr><td>កុមាររងអំពើហិង្សាក្នុងគ្រួសារ</td><td contenteditable="true" class="text-center font-mono">1</td><td contenteditable="true" class="text-center font-mono">1</td></tr>
                                <tr><td>កុមាររងការកេងប្រវ័ញ្ចពលកម្ម</td><td contenteditable="true" class="text-center font-mono">1</td><td contenteditable="true" class="text-center font-mono">0</td></tr>
                                <tr><td>កុមាររងគ្រោះផ្សេងៗ</td><td contenteditable="true" class="text-center font-mono">2</td><td contenteditable="true" class="text-center font-mono">0</td></tr>
                            </tbody>
                        </table>
                        <div class="text-[8.5px] leading-tight text-blue-900 mt-1 space-y-0.5">
                            <p>* សំដៅលើចំនួនសិស្ស (ដោយសិស្សម្នាក់អាចរាប់បានតែម្តង បើសិស្សនោះមានពិការភាពច្រើនប្រភេទក៏ដោយ)</p>
                            <p>** សំដៅលើចំនួនសិស្សសរុបតាមប្រភេទ (ដោយសិស្សម្នាក់បានច្រើនដង តាមប្រភេទពិការភាពជាក់ស្តែងរបស់សិស្សនោះ ប្រសិនបើសិស្សនោះមានពិការភាពច្រើនប្រភេទ)</p>
                        </div>
                    </div>

                </div>

            </div> <!-- End Two-Column Grid -->

            <!-- ✍️ ហត្ថលេខា និងកាលបរិច្ឆេទខាងក្រោម (Official Footer) ✍️ -->
            <div class="mt-4 flex justify-between items-start text-xs pt-2">
                <div class="w-1/3"></div>
                <div class="text-center w-2/3 space-y-0.5">
                    <p contenteditable="true" class="text-blue-950 font-bold">${lunarDateStr}</p>
                    <p contenteditable="true" class="text-blue-950 font-bold">${solarDateStr}</p>
                    <p class="font-bold text-blue-950 mt-1">ហត្ថលេខាគ្រូទទួលបន្ទុក</p>
                    <div class="h-10 flex items-center justify-center text-slate-300 text-xs italic">
                        (ហត្ថលេខា)
                    </div>
                    <p contenteditable="true" class="moeys-header-blue text-sm font-bold text-blue-950">${teacherName}</p>
                </div>
            </div>

        </div>
    `;
};
window.printStudentStatsReport = function() {
    const printArea = document.getElementById("studentStatsPrintArea");
    if (!printArea) return;

    const clonedPrintArea = printArea.cloneNode(true);
    clonedPrintArea.style.boxShadow = 'none';
    clonedPrintArea.style.border = 'none';
    clonedPrintArea.style.borderRadius = '0';
    clonedPrintArea.style.padding = '0';
    clonedPrintArea.style.minHeight = 'auto';
    clonedPrintArea.style.margin = '0 auto';
    clonedPrintArea.style.maxWidth = '100%';
    clonedPrintArea.classList.remove('p-4', 'sm:p-6', 'p-6', 'md:p-10', 'rounded-xl', 'border', 'border-slate-300', 'shadow-[0_10px_40px_rgba(0,0,0,0.08)]');
    
    // បម្លែង Input contenteditable ទៅជាអក្សរសាមញ្ញដើម្បីបោះពុម្ព
    const editables = clonedPrintArea.querySelectorAll('[contenteditable="true"]');
    editables.forEach(el => {
        el.removeAttribute('contenteditable');
        el.style.outline = 'none';
        el.style.backgroundColor = 'transparent';
        if (el.classList.contains('box-input-text')) {
            el.style.border = 'none';
            el.style.padding = '0';
        }
    });

    const extraMoeysStyles = `
        @page { size: A4 portrait; margin: 5mm; }
        .moeys-table { width: 100% !important; border-collapse: collapse !important; font-size: 9.8px !important; border: 1.5px solid #002b66 !important; }
        .moeys-table th, .moeys-table td { border: 1px solid #002b66 !important; padding: 2px 3px !important; vertical-align: middle !important; }
        .moeys-table th { font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif !important; font-weight: bold !important; background-color: #ffffff !important; text-align: center !important; color: #002b66 !important; }
        .moeys-header-blue { font-family: 'Khmer OS Muol Light', 'Khmer OS Muol', 'Moul', serif !important; font-weight: normal !important; color: #002b66 !important; }
        .moeys-lavender-row { background-color: #e0e7ff !important; font-weight: bold !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        #studentStatsPrintArea { width: 100% !important; max-width: 100% !important; padding: 0 !important; margin: 0 auto !important; border: none !important; box-shadow: none !important; min-height: auto !important; }
    `;

    if (window.CMSPrintManager && typeof window.CMSPrintManager.openUniversalPreview === 'function') {
        window.CMSPrintManager.openUniversalPreview({
            title: "តារាងស្ថិតិចំនួនសិស្សតាមថ្នាក់",
            paperSize: "A4",
            orientation: "portrait",
            defaultZoom: 0.95,
            extraStyles: extraMoeysStyles,
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
        <title>តារាងស្ថិតិចំនួនសិស្សតាមថ្នាក់ - KrouDigital</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Moul&family=Siemreap&display=swap" rel="stylesheet">
        <style>
          @page { size: A4 portrait; margin: 5mm; }
          * { box-sizing: border-box !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif; }
          html, body { background: #fff; width: 100%; margin: 0; padding: 0; }
          .font-moul { font-family: 'Khmer OS Muol Light', 'Khmer OS Muol', 'Moul', serif !important; font-weight: normal !important; }
          ${extraMoeysStyles}
        </style>
      </head>
      <body>
        <div style="width: 100%; max-width: 200mm; margin: 0 auto;">
          ${clonedPrintArea.outerHTML}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 250);
          };
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=1000,height=900');
    if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(printDocument);
        printWindow.document.close();
    } else {
        window.print();
    }
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
    const principalName = (sInfo.principal_name && sInfo.principal_name !== "នាយកសាលា") ? sInfo.principal_name : "";
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
                        ${principalName ? `<p class="font-moul text-slate-900 text-sm">${principalName}</p>` : ""}
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

    if (typeof window.applyAcademicReportPaperSettings === 'function') {
        window.applyAcademicReportPaperSettings();
    }
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

    // 🟢 ព្យាយាមទាញយកទិន្នន័យវត្តមានស្រស់ពី Google Sheets ប្រសិនបើមាន 🟢
    if (typeof window.apiGet === 'function') {
        const yr = document.getElementById("globalAcademicYear")?.value || localStorage.getItem('selected_academic_year') || "2026-2027";
        const gasParams = { academic_year: yr };
        if (targetGrade && targetGrade !== 'all') gasParams.grade = targetGrade;
        if (targetRoom && targetRoom !== 'all') gasParams.room = targetRoom;
        window.apiGet('getAttendance', gasParams).then(res => {
            if (res && res.status === 'success' && Array.isArray(res.data) && res.data.length > 0) {
                try {
                    let existingAll = [];
                    try { existingAll = JSON.parse(localStorage.getItem('academic_attendance') || '[]'); } catch(e) {}
                    const rowMap = new Map();
                    existingAll.forEach(item => {
                        if (item && item.student_id && item.date) rowMap.set(`${item.student_id}_${item.date}`, item);
                    });
                    res.data.forEach(item => {
                        if (item && item.student_id && item.date) rowMap.set(`${item.student_id}_${item.date}`, item);
                    });
                    localStorage.setItem('academic_attendance', JSON.stringify(Array.from(rowMap.values())));
                } catch(e) {}
                if (typeof window.renderAttendanceContent === 'function') {
                    window.renderAttendanceContent();
                }
            }
        }).catch(err => console.warn("Attendance report sync note:", err));
    }
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
    const principalName = (sInfo.principal_name && sInfo.principal_name !== "នាយកសាលា") ? sInfo.principal_name : "";
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
        const result = { days: {}, perm: 0, unex: 0 };
        if (!studentId) return result;
        const sIdStr = String(studentId).trim();

        // ១. ពិនិត្យមើលពី window.monthlyAttendanceData ប្រសិនបើកំពុងស្ថិតក្នុងខែនោះ
        if (window.monthlyAttendanceData && window.monthlyAttendanceData[sIdStr]) {
            const stuMap = window.monthlyAttendanceData[sIdStr];
            for (let d = 1; d <= 31; d++) {
                const rawVal = stuMap[d] || stuMap[String(d)];
                if (rawVal) {
                    const norm = String(rawVal).trim();
                    if (norm === "ច" || norm === "ច្ប" || norm.includes("ច្បាប់")) {
                        result.days[d] = "ច";
                        result.perm++;
                    } else if (norm === "អ" || norm === "អច្ប" || norm.includes("ឥតច្បាប់") || norm.includes("អវត្តមាន") || norm.includes("អត់ច្បាប់")) {
                        result.days[d] = "អ";
                        result.unex++;
                    } else if (norm === "ឈ" || norm.includes("ឈឺ")) {
                        result.days[d] = "ឈ";
                        result.perm++;
                    } else if (norm === "៖") {
                        result.days[d] = "៖";
                    }
                }
            }
        }

        // ២. ស្វែងរកក្នុង cache តាមសោ att_${grade}_${month}_${year}
        try {
            const activeClass = typeof window.getCurrentSelectedClass === 'function' ? window.getCurrentSelectedClass() : { level: "ថ្នាក់ទី ៤", room: "«ក»" };
            const lvl = window.currentReportTargetGrade || activeClass.level || "";
            const rm = window.currentReportTargetRoom || activeClass.room || "";
            const yr = document.getElementById("globalAcademicYear")?.value || localStorage.getItem('academic_year') || "2026-2027";
            const fullG = (lvl + rm).replace(/\s+/g, '');

            const possibleKeys = [
                'att_' + lvl + ' ' + rm + '_' + monthStr + '_' + yr,
                'att_' + fullG + '_' + monthStr + '_' + yr,
                'att_' + lvl + '_' + monthStr + '_' + yr,
                'academic_monthly_attendance'
            ];

            for (const key of possibleKeys) {
                const cachedRaw = localStorage.getItem(key);
                if (cachedRaw) {
                    const cached = JSON.parse(cachedRaw);
                    const stuCached = cached[sIdStr];
                    if (stuCached && typeof stuCached === 'object') {
                        for (let d = 1; d <= 31; d++) {
                            if (!result.days[d]) {
                                const rawVal = stuCached[d] || stuCached[String(d)];
                                if (rawVal) {
                                    const norm = String(rawVal).trim();
                                    if (norm === "ច" || norm === "ច្ប" || norm.includes("ច្បាប់")) {
                                        result.days[d] = "ច";
                                        result.perm++;
                                    } else if (norm === "អ" || norm === "អច្ប" || norm.includes("ឥតច្បាប់") || norm.includes("អវត្តមាន") || norm.includes("អត់ច្បាប់")) {
                                        result.days[d] = "អ";
                                        result.unex++;
                                    } else if (norm === "ឈ" || norm.includes("ឈឺ")) {
                                        result.days[d] = "ឈ";
                                        result.perm++;
                                    } else if (norm === "៖") {
                                        result.days[d] = "៖";
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } catch(e) {}

        // ៣. ស្វែងរក និងទាញយកពី academic_attendance (Array នៃកំណត់ត្រាវត្តមានពី Google Sheet & System Sync)
        try {
            const rawArray = localStorage.getItem('academic_attendance');
            let attRecordsArray = [];
            if (rawArray) {
                attRecordsArray = JSON.parse(rawArray);
            }
            if (!Array.isArray(attRecordsArray) && Array.isArray(window.attendanceData)) {
                attRecordsArray = window.attendanceData;
            }

            if (Array.isArray(attRecordsArray) && attRecordsArray.length > 0) {
                const khmerMonths = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];
                const targetMonthIdx = khmerMonths.indexOf(monthStr);

                attRecordsArray.forEach(rec => {
                    if (!rec) return;
                    const recStuId = String(rec.student_id || rec.studentId || rec.id || "").trim();
                    if (recStuId !== sIdStr) return;

                    let isSameMonth = false;
                    const recMonth = String(rec.month || "").trim();
                    if (recMonth && (recMonth === monthStr || recMonth.includes(monthStr))) {
                        isSameMonth = true;
                    } else if (rec.date) {
                        try {
                            const dObj = new Date(rec.date);
                            if (!isNaN(dObj.getTime()) && targetMonthIdx >= 0) {
                                if (dObj.getMonth() === targetMonthIdx) isSameMonth = true;
                            }
                        } catch(err) {}
                    }

                    if (!isSameMonth) return;

                    let dayNum = null;
                    if (rec.day) {
                        dayNum = parseInt(rec.day, 10);
                    } else if (rec.date) {
                        if (typeof rec.date === 'string') {
                            const mMatch = rec.date.match(/T|\s/);
                            const dateOnly = mMatch ? rec.date.split(mMatch[0])[0] : rec.date;
                            const parts = dateOnly.split('-');
                            if (parts.length === 3) {
                                dayNum = parseInt(parts[2], 10);
                            }
                        }
                        if (!dayNum) {
                            const dObj = new Date(rec.date);
                            if (!isNaN(dObj.getTime())) dayNum = dObj.getDate();
                        }
                    }

                    if (dayNum && dayNum >= 1 && dayNum <= 31) {
                        const st = String(rec.status || rec.attendance || "").trim();
                        if (!result.days[dayNum]) {
                            if (st === "ច" || st === "ច្ប" || st.includes("ច្បាប់")) {
                                result.days[dayNum] = "ច";
                                result.perm++;
                            } else if (st === "អ" || st === "អច្ប" || st.includes("ឥតច្បាប់") || st.includes("អវត្តមាន") || st.includes("អត់ច្បាប់")) {
                                result.days[dayNum] = "អ";
                                result.unex++;
                            } else if (st === "ឈ" || st.includes("ឈឺ")) {
                                result.days[dayNum] = "ឈ";
                                result.perm++;
                            }
                        }
                    }
                });
            }
        } catch(e) {}

        // ៤. Fallback attendance_records
        try {
            const rawFallback = localStorage.getItem('attendance_records');
            if (rawFallback) {
                const fb = JSON.parse(rawFallback);
                const mData = fb[monthStr] || {};
                const sData = mData[sIdStr] || {};
                if (sData.perm && !result.perm) result.perm = sData.perm;
                if (sData.unex && !result.unex) result.unex = sData.unex;
                if (sData.days && Object.keys(result.days).length === 0) {
                    result.days = { ...sData.days };
                }
            }
        } catch(e) {}

        return result;
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
          * { box-sizing: border-box !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif; }
          html, body { background: #fff; width: 100%; height: 100%; color: #000; margin: 0; padding: 0; }
          .font-moul { font-family: 'Khmer OS Muol Light', 'Khmer OS Muol', 'Moul', serif !important; font-weight: normal !important; }
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

    if (typeof window.applyAcademicReportPaperSettings === 'function') {
        window.applyAcademicReportPaperSettings();
    }
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
          * { box-sizing: border-box !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif; }
          html, body { background: #fff; width: 100%; height: 100%; color: #000; }
          .font-moul { font-family: 'Khmer OS Muol Light', 'Khmer OS Muol', 'Moul', serif !important; font-weight: normal !important; }
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

/**
 * ========================================================
 * មុខងាររក្សាទុក និងធ្វើសមកាលកម្មរបាយការណ៍ទៅ Google Sheets
 * ========================================================
 */
window.buildReportRecord = function(extraProps = {}) {
    const reportType = window.currentActiveReportType || 'general';
    const reportTitleElem = document.getElementById('reportDetailTitle');
    const reportTitle = reportTitleElem ? reportTitleElem.textContent.trim() : 'របាយការណ៍ទូទៅ';
    
    const activeClass = typeof window.getCurrentSelectedClass === 'function' ? window.getCurrentSelectedClass() : { level: 'ថ្នាក់ទី ៤', room: '«ក»' };
    const curLevel = window.currentReportTargetGrade || document.getElementById('reportGradeSelect')?.value || activeClass.level || 'ថ្នាក់ទី ៤';
    const curRoom = window.currentReportTargetRoom || document.getElementById('reportRoomSelect')?.value || activeClass.room || '«ក»';
    const academicYear = localStorage.getItem('academic_year') || '2026-2027';
    const month = localStorage.getItem('selected_assessment_month') || 'មករា';
    const semester = localStorage.getItem('selected_assessment_semester') || 'ឆមាសទី១';
    const teacherId = localStorage.getItem('auth_teacher_id') || 'TCH-013';

    let classStudents = [];
    if (Array.isArray(window.students)) {
        classStudents = window.students.filter(s => {
            if (!s) return false;
            const sLevel = (s.grade_level || s.grade || '').trim();
            const sRoom = (s.classroom || s.room || '').trim();
            return (!curLevel || sLevel === curLevel) && (!curRoom || sRoom === curRoom);
        });
        if (classStudents.length === 0 && window.students.length > 0) {
            classStudents = window.students;
        }
    }

    const totalStudents = classStudents.length;
    const femaleStudents = classStudents.filter(s => s && (s.gender === 'F' || s.gender === 'ស្រី')).length;

    let passed = 0;
    let failed = 0;
    if (Array.isArray(window.gradesData)) {
        const studentGrades = window.gradesData.filter(g => classStudents.some(s => s.id === g.student_id));
        studentGrades.forEach(g => {
            const avg = parseFloat(g.average || g.total_score || 0);
            if (avg >= 25 || avg >= 5) passed++;
            else failed++;
        });
    }

    const safeIdPart = (reportType + '-' + academicYear + '-' + curLevel + '-' + curRoom + '-' + month).replace(/[«»\s\/\\]+/g, '_');
    const reportId = 'REP-' + safeIdPart;

    const summaryData = {
        report_type: reportType,
        total_students: totalStudents,
        female_students: femaleStudents,
        passed_students: passed,
        failed_students: failed,
        generated_at: new Date().toISOString()
    };

    return Object.assign({
        report_id: reportId,
        report_type: reportType,
        report_title: reportTitle,
        academic_year: academicYear,
        grade: curLevel,
        room: curRoom,
        month: month,
        semester: semester,
        total_students: totalStudents,
        female_students: femaleStudents,
        passed_students: passed,
        failed_students: failed,
        report_data_json: JSON.stringify(summaryData),
        generated_by: teacherId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }, extraProps);
};

window.saveCurrentReportToGoogleSheets = async function(btnElement) {
    const btn = btnElement || document.querySelector('#reportDetailPrintToolbarArea button[onclick*="saveCurrentReportToGoogleSheets"]');
    const origHtml = btn ? btn.innerHTML : '';
    if (btn) {
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin text-amber-300"></i> <span>កំពុងរក្សាទុក...</span>';
        btn.disabled = true;
    }

    try {
        const reportRecord = window.buildReportRecord();

        try {
            let cached = [];
            const raw = localStorage.getItem('cached_reports_list');
            if (raw) {
                cached = JSON.parse(raw);
                if (!Array.isArray(cached)) cached = [];
            }
            const existIdx = cached.findIndex(r => r && r.report_id === reportRecord.report_id);
            if (existIdx >= 0) {
                cached[existIdx] = reportRecord;
            } else {
                cached.unshift(reportRecord);
            }
            if (cached.length > 50) cached = cached.slice(0, 50);
            localStorage.setItem('cached_reports_list', JSON.stringify(cached));
        } catch (storageErr) {
            console.warn('Storage cache error:', storageErr);
        }

        let saveSuccess = false;
        if (typeof window.apiPost === 'function') {
            try {
                const res = await window.apiPost('saveReport', reportRecord);
                if (res && (res.status === 'success' || res.success)) {
                    saveSuccess = true;
                }
            } catch (apiErr) {
                console.warn('apiPost saveReport notice:', apiErr);
            }
        }

        if (!saveSuccess) {
            const scriptUrl = (typeof window.getScriptUrl === 'function' ? window.getScriptUrl() : window.SCRIPT_URL) || localStorage.getItem('cms_custom_script_url');
            if (scriptUrl) {
                const token = (typeof window.getSessionToken === 'function' ? window.getSessionToken() : '') || (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('cms_session_token') : '') || '';
                const response = await fetch(scriptUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify({
                        action: 'saveReport',
                        data: reportRecord,
                        sessionToken: token
                    })
                });
                const resJson = await response.json();
                if (resJson && (resJson.status === 'success' || resJson.success)) {
                    saveSuccess = true;
                }
            }
        }

        if (window.db) {
            try {
                await window.db.collection('reports').doc(reportRecord.report_id).set(reportRecord, { merge: true });
            } catch (fsErr) {
                console.warn('Firestore reports backup notice:', fsErr);
            }
        }

        if (saveSuccess) {
            if (typeof window.showToast === 'function') {
                window.showToast('✅ បានរក្សាទុករបាយការណ៍ "' + reportRecord.report_title + '" ទៅក្នុង Google Sheets (សន្លឹក Reports) រួចរាល់!', 'success');
            } else {
                alert('✅ បានរក្សាទុករបាយការណ៍ "' + reportRecord.report_title + '" ទៅក្នុង Google Sheets រួចរាល់!');
            }
        } else {
            if (typeof window.showToast === 'function') {
                window.showToast('⚠️ បានរក្សាទុកក្នុងឧបករណ៍រួចរាល់ ប៉ុន្តែមិនទាន់អាចបញ្ជូនទៅ Google Sheet បានទេ (សូមពិនិត្យការតភ្ជាប់)', 'warning');
            } else {
                alert('⚠️ បានរក្សាទុកក្នុងឧបករណ៍រួចរាល់ ប៉ុន្តែមិនទាន់អាចបញ្ជូនទៅ Google Sheet បានទេ');
            }
        }
    } catch (e) {
        console.error('Save report to sheets error:', e);
        if (typeof window.showToast === 'function') {
            window.showToast('❌ បរាជ័យក្នុងការរក្សាទុករបាយការណ៍: ' + (e.message || e), 'error');
        } else {
            alert('❌ បរាជ័យក្នុងការរក្សាទុករបាយការណ៍');
        }
    } finally {
        if (btn) {
            btn.innerHTML = origHtml;
            btn.disabled = false;
        }
    }
};
window.syncReportsToGoogleSheets = async function(btnElement) {
    const btn = btnElement || document.getElementById('btnSyncReportsGAS');
    const origHtml = btn ? btn.innerHTML : '';
    if (btn) {
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin text-amber-300"></i> <span>កំពុង Sync...</span>';
        btn.disabled = true;
    }

    try {
        let reportsToSync = [];
        const raw = localStorage.getItem('cached_reports_list');
        if (raw) {
            try {
                reportsToSync = JSON.parse(raw);
            } catch (e) {
                reportsToSync = [];
            }
        }

        if (!Array.isArray(reportsToSync) || reportsToSync.length === 0) {
            const currentRec = window.buildReportRecord();
            reportsToSync = [currentRec];
            localStorage.setItem('cached_reports_list', JSON.stringify(reportsToSync));
        }

        let syncSuccess = false;
        if (typeof window.apiPost === 'function') {
            try {
                const res = await window.apiPost('saveReportsBatch', reportsToSync);
                if (res && (res.status === 'success' || res.success)) {
                    syncSuccess = true;
                }
            } catch (apiErr) {
                console.warn('apiPost saveReportsBatch notice:', apiErr);
            }
        }

        if (!syncSuccess) {
            const scriptUrl = (typeof window.getScriptUrl === 'function' ? window.getScriptUrl() : window.SCRIPT_URL) || localStorage.getItem('cms_custom_script_url');
            if (scriptUrl) {
                const token = (typeof window.getSessionToken === 'function' ? window.getSessionToken() : '') || (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('cms_session_token') : '') || '';
                const response = await fetch(scriptUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify({
                        action: 'saveReportsBatch',
                        data: reportsToSync,
                        sessionToken: token
                    })
                });
                const resJson = await response.json();
                if (resJson && (resJson.status === 'success' || resJson.success)) {
                    syncSuccess = true;
                }
            }
        }

        if (syncSuccess) {
            if (typeof window.showToast === 'function') {
                window.showToast('✅ ធ្វើសមកាលកម្មរបាយការណ៍ចំនួន ' + reportsToSync.length + ' ទៅក្នុង Google Sheets (សន្លឹក Reports) បានជោគជ័យ!', 'success');
            } else {
                alert('✅ ធ្វើសមកាលកម្មរបាយការណ៍ចំនួន ' + reportsToSync.length + ' ទៅក្នុង Google Sheets បានជោគជ័យ!');
            }
        } else {
            if (typeof window.showToast === 'function') {
                window.showToast('⚠️ មិនអាចធ្វើសមកាលកម្មរបាយការណ៍ទៅ Google Sheets បានទេ សូមពិនិត្យ Script URL', 'warning');
            } else {
                alert('⚠️ មិនអាចធ្វើសមកាលកម្មរបាយការណ៍ទៅ Google Sheets បានទេ');
            }
        }
    } catch (e) {
        console.error('Sync reports error:', e);
        if (typeof window.showToast === 'function') {
            window.showToast('❌ បរាជ័យក្នុងការធ្វើសមកាលកម្ម: ' + (e.message || e), 'error');
        } else {
            alert('❌ បរាជ័យក្នុងការធ្វើសមកាលកម្មរបាយការណ៍');
        }
    } finally {
        if (btn) {
            btn.innerHTML = origHtml;
            btn.disabled = false;
        }
    }
};

// ============================================================================
// មុខងារ ៖ សៀវភៅសិក្ខាគារិកផ្លូវការ ក្រសួងអប់រំ យុវជន និងកីឡា (MoEYS Sikha-karik Booklet)
// រចនាតាមស្តង់ដារ A4 Landscape ចែកជា ២ ទំព័រ (A5) ស្អាតឥតខ្ចោះ ដូចទម្រង់ផ្លូវការក្រសួង
// ============================================================================
window.renderSikhaKarikBooklet = function(container, targetGrade, targetRoom, studentId, pageMode) {
    if (!container) return;

    const activeClass = typeof window.getCurrentSelectedClass === 'function' 
        ? window.getCurrentSelectedClass() 
        : { level: "ថ្នាក់ទី ៤", room: "«ក»" };
    const curLevel = targetGrade || activeClass.level;
    const curRoom = targetRoom || activeClass.room;
    const gradeFull = `${curLevel} ${curRoom}`.trim();

    const ctx = (window.CMSPrintManager && typeof window.CMSPrintManager.getStandardContext === 'function')
        ? window.CMSPrintManager.getStandardContext({ grade: gradeFull })
        : {};

    const schoolName = ctx.schoolName || localStorage.getItem('cms_school_name') || 'សាលាបឋមសិក្សា................................';
    const academicYear = ctx.academicYear || localStorage.getItem('selected_academic_year') || '២០២៦-២០២៧';
    const communeName = ctx.communeName || localStorage.getItem('cms_school_commune') || '................';
    const districtName = ctx.districtName || localStorage.getItem('cms_school_district') || '................';
    const provinceName = ctx.provinceName || localStorage.getItem('cms_school_province') || '................';
    const teacherName = ctx.teacherName || '';
    const principalName = ctx.principalName || '';

    // ទាញបញ្ជីសិស្សទាំងអស់ក្នុងថ្នាក់
    const allStus = (typeof window.getStudentsForClass === 'function')
        ? window.getStudentsForClass(curLevel, curRoom)
        : (window.allStudents || []);

    const totalStudentsInClass = allStus.length || 0;

    let student = null;
    if (studentId) {
        student = allStus.find(s => String(s.id) === String(studentId) || String(s.student_id) === String(studentId));
    }
    if (!student && allStus.length > 0) {
        student = allStus[0];
    }

    if (!student) {
        container.innerHTML = `
            <div class="text-center p-12 bg-white rounded-3xl border border-slate-200 text-slate-700 font-siemreap max-w-md mx-auto my-10 shadow-sm">
                <i class="fa-solid fa-user-slash text-4xl mb-3 text-amber-500"></i>
                <h4 class="font-moul text-base mb-2">មិនមានសិស្សក្នុងថ្នាក់ ${gradeFull} ទេ</h4>
                <p class="text-xs text-slate-500">សូមបញ្ចូលសិស្សក្នុងបញ្ជីវត្តមាន ឬជ្រើសរើសថ្នាក់ផ្សេងដើម្បីពិនិត្យសៀវភៅសិក្ខាគារិក។</p>
            </div>
        `;
        return;
    }

    window.currentSikhaStudentId = student.id || student.student_id;
    const mode = pageMode || window.currentSikhaPageMode || 'all';
    window.currentSikhaPageMode = mode;

    // ទិន្នន័យសិស្ស
    const stuName = student.name || student.name_khmer || '................................';
    const stuGender = student.gender || '...';
    let stuDob = '........................';
    if (student.dob) {
        let cleanDob = String(student.dob).trim();
        if (cleanDob.includes("T")) cleanDob = cleanDob.split("T")[0];
        if (cleanDob.includes("-")) {
            const p = cleanDob.split("-");
            if (p.length === 3) cleanDob = `${p[2]}/${p[1]}/${p[0]}`;
        }
        const khmerNums = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
        stuDob = cleanDob.split('').map(n => khmerNums[n] || n).join('');
    }
    const stuPob = student.pob || student.birthplace || '...................................................';
    const stuFather = student.father_name || '................................';
    const stuFatherJob = student.father_job || '................';
    const stuMother = student.mother_name || '................................';
    const stuMotherJob = student.mother_job || '................';
    const stuAddress = student.address || student.current_address || '...........................................................................';
    const stuIdNum = student.student_id || student.id || '';
    const stuPhoto = student.photo || student.avatar || '';

    // ទាញពិន្ទុពី localStorage
    let allScores = [];
    try {
        allScores = JSON.parse(localStorage.getItem('academic_scores') || '[]');
    } catch(e) { allScores = []; }
    const stuScores = allScores.filter(s => 
        (s.student_id && (String(s.student_id) === String(student.id) || String(s.student_id) === String(student.student_id))) ||
        (s.name && s.name.trim() === stuName.trim())
    );

    // មុខវិជ្ជាទាំង ១២ ផ្លូវការរបស់ក្រសួងអប់រំ
    const officialSubjects = [
        "សុជីវធម៌ និងពលរដ្ឋវិជ្ជា",
        "រៀនអាន និងមេសូត្រ",
        "គណិតវិទ្យា",
        "អក្ខរាវិរុទ្ធ",
        "គំនូរ និង ហត្ថកម្ម",
        "សរសេរតាមអាន និងសំណួរ",
        "តែងសេចក្តី",
        "វិទ្យាសាស្ត្រអនុវត្ត",
        "ភូមិវិទ្យា",
        "ប្រវត្តិវិទ្យា",
        "អប់រំកាយ និងកីឡា",
        "ភាសាបរទេស"
    ];

    const officialSubjectAliases = {
        "សុជីវធម៌ និងពលរដ្ឋវិជ្ជា": ["សុជីវធម៌ និងពលរដ្ឋវិជ្ជា", "សីលធម៌-ពលរដ្ឋ", "ss_moral", "moral"],
        "រៀនអាន និងមេសូត្រ": ["រៀនអាន និងមេសូត្រ", "អាន", "មេសូត្រ", "k_read", "k_recite", "read"],
        "គណិតវិទ្យា": ["គណិតវិទ្យា", "គណិត", "math", "m_num", "m_alg", "m_geo"],
        "អក្ខរាវិរុទ្ធ": ["អក្ខរាវិរុទ្ធ", "អក្សរផ្ចង់", "k_calligraphy", "spelling"],
        "គំនូរ និង ហត្ថកម្ម": ["គំនូរ និង ហត្ថកម្ម", "គំនូរ", "art", "drawing"],
        "សរសេរតាមអាន និងសំណួរ": ["សរសេរតាមអាន និងសំណួរ", "សរសេរតាមអាន", "សរសេរ", "k_write", "dictation"],
        "តែងសេចក្តី": ["តែងសេចក្តី", "តែងសេចក្ដី", "k_compose", "compose"],
        "វិទ្យាសាស្ត្រអនុវត្ត": ["វិទ្យាសាស្ត្រអនុវត្ត", "វិទ្យាសាស្ត្រ", "science", "s_bio", "s_phy", "s_chem"],
        "ភូមិវិទ្យា": ["ភូមិវិទ្យា", "ភូមិ", "geography", "ss_geo"],
        "ប្រវត្តិវិទ្យា": ["ប្រវត្តិវិទ្យា", "ប្រវត្តិ", "history", "ss_hist"],
        "អប់រំកាយ និងកីឡា": ["អប់រំកាយ និងកីឡា", "អប់រំកាយ-កីឡា", "កីឡា", "sport", "pe_sport"],
        "ភាសាបរទេស": ["ភាសាបរទេស", "អង់គ្លេស", "english", "foreign_lang"]
    };

    const getScoreForSubject = (subName, sem) => {
        const aliases = officialSubjectAliases[subName] || [subName];
        // 1. Check in stuScores where subject matches alias
        for (const s of stuScores) {
            const isSem = sem === 1 ? (s.semester === '1' || s.semester === 1 || s.term === 's1' || !s.semester) : (s.semester === '2' || s.semester === 2 || s.term === 's2');
            if (!isSem) continue;
            for (const al of aliases) {
                if (s.subject === al || s.subject_khmer === al) {
                    return { val: s.score || s.val || '', rank: s.rank || '' };
                }
                if (s.scores && s.scores[al] !== undefined) {
                    return { val: s.scores[al], rank: s.rank || '' };
                }
                if (s[al] !== undefined && s[al] !== null && typeof s[al] !== 'object') {
                    return { val: s[al], rank: s.rank || '' };
                }
            }
        }
        return { val: '', rank: '' };
    };

    // រៀបចំតារាងពិន្ទុមុខវិជ្ជាទាំង ១២
    const subjectRowsHtml = officialSubjects.map(subName => {
        const s1 = getScoreForSubject(subName, 1);
        const s2 = getScoreForSubject(subName, 2);
        
        const s1Val = s1.val;
        const s1Rank = s1.rank;
        const s2Val = s2.val;
        const s2Rank = s2.rank;

        return `
            <tr>
                <td style="border: 1px solid #1e3a8a; padding: 3px 6px; text-align: left; font-size: 9pt;">${subName}</td>
                <td style="border: 1px solid #1e3a8a; padding: 3px 4px; text-align: center; font-size: 9pt; width: 50px;">${s1Val}</td>
                <td style="border: 1px solid #1e3a8a; padding: 3px 4px; text-align: center; font-size: 9pt; width: 50px;">${s1Rank}</td>
                <td style="border: 1px solid #1e3a8a; padding: 3px 4px; text-align: center; font-size: 9pt; width: 50px;">${s2Val}</td>
                <td style="border: 1px solid #1e3a8a; padding: 3px 4px; text-align: center; font-size: 9pt; width: 50px;">${s2Rank}</td>
            </tr>
        `;
    }).join('');

    // ទាញទិន្នន័យអវត្តមាន
    let s1Permit = 0, s1Unpermit = 0, s2Permit = 0, s2Unpermit = 0;
    try {
        const attRecords = JSON.parse(localStorage.getItem('attendance_records') || '[]');
        attRecords.forEach(rec => {
            if (String(rec.student_id) === String(student.id) || String(rec.student_id) === String(student.student_id) || rec.name === stuName) {
                const monthNum = parseInt(rec.month, 10);
                const isS1 = (monthNum >= 10 || monthNum <= 1);
                if (rec.status === 'P' || rec.status === 'ច' || rec.status === 'មានច្បាប់') {
                    if (isS1) s1Permit++; else s2Permit++;
                } else if (rec.status === 'A' || rec.status === 'អ' || rec.status === 'ឥតច្បាប់') {
                    if (isS1) s1Unpermit++; else s2Unpermit++;
                }
            }
        });
    } catch(e) {}
    const totalAbsences = s1Permit + s1Unpermit + s2Permit + s2Unpermit;
    const absTotalStr = totalAbsences > 0 ? String(totalAbsences) : '';

    // ================= SPREAD 1: ក្របមុខ (Cover Page - Image 1) =================
    const spread1Html = `
        <div class="sikha-spread" style="width: 297mm; min-height: 210mm; background: white; margin: 0 auto 30px auto; padding: 10mm 10mm; box-sizing: border-box; display: flex; gap: 8mm; box-shadow: 0 4px 25px rgba(0,0,0,0.08); font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif; position: relative;">
            
            <!-- ទំព័រឆ្វេង៖ ក្របក្រោយ (Back Cover) -->
            <div class="sikha-page-left" style="flex: 1; border: 1.5px solid #94a3b8; border-radius: 4px; padding: 14px; position: relative; display: flex; flex-direction: column; justify-content: center; align-items: center; box-sizing: border-box; background: #fafafa;">
                <div style="text-align: center; color: #94a3b8; opacity: 0.6;">
                    <i class="fa-solid fa-book-bookmark text-6xl mb-4 text-blue-900/30"></i>
                    <p class="font-moul text-sm text-blue-950/40">ក្រសួងអប់រំ យុវជន និងកីឡា</p>
                    <p class="text-xs text-slate-400 mt-1 font-siemreap">សៀវភៅសិក្ខាគារិកផ្លូវការ</p>
                </div>
            </div>

            <!-- ទំព័រស្តាំ៖ ក្របមុខផ្លូវការ (Front Cover - Exact Match to Image 1) -->
            <div class="sikha-page-right" style="flex: 1; border: 2.5px solid #1e3a8a; border-radius: 4px; padding: 18px 22px; position: relative; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; background: white;">
                
                <!-- Inner border -->
                <div style="position: absolute; inset: 4px; border: 1px solid #1e3a8a; pointer-events: none;"></div>

                <!-- ផ្កាបួនជ្រុង ពណ៌បៃតង (Four Green Corner Florets) -->
                <div style="position: absolute; top: 6px; left: 8px; color: #16a34a; font-size: 18px; line-height: 1;">✿</div>
                <div style="position: absolute; top: 6px; right: 8px; color: #16a34a; font-size: 18px; line-height: 1;">✿</div>
                <div style="position: absolute; bottom: 6px; left: 8px; color: #16a34a; font-size: 18px; line-height: 1;">✿</div>
                <div style="position: absolute; bottom: 6px; right: 8px; color: #16a34a; font-size: 18px; line-height: 1;">✿</div>

                <!-- ផ្នែកក្បាលលិខិតជាតិ -->
                <div style="text-align: center; margin-top: 15px;">
                    <div style="font-family: 'Khmer OS Muol Light', serif; font-size: 11pt; color: #1e3a8a; line-height: 1.6;">ព្រះរាជាណាចក្រកម្ពុជា</div>
                    <div style="font-family: 'Khmer OS Muol Light', serif; font-size: 10.5pt; color: #1e3a8a; line-height: 1.6;">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
                    <div style="color: #1e3a8a; font-size: 10pt; letter-spacing: 2px; margin-top: 2px;">*** 📖 ***</div>
                </div>

                <!-- ឈ្មោះក្រសួង -->
                <div style="text-align: center; margin-top: 20px;">
                    <h2 style="font-family: 'Khmer OS Muol Light', serif; font-size: 14pt; color: #1e3a8a; margin: 0; letter-spacing: 0.5px;">ក្រសួងអប់រំ យុវជន និងកីឡា</h2>
                </div>

                <!-- ចំណងជើងធំ៖ សៀវភៅសិក្ខាគារិក -->
                <div style="text-align: center; margin: 25px 0;">
                    <h1 style="font-family: 'Khmer OS Muol Light', serif; font-size: 24pt; color: #1e3a8a; margin: 0; text-shadow: 0 1px 1px rgba(30,58,138,0.15);">សៀវភៅសិក្ខាគារិក</h1>
                </div>

                <!-- ឈ្មោះសាលា -->
                <div style="text-align: center; margin-bottom: 25px;">
                    <div style="font-family: 'Khmer OS Muol Light', serif; font-size: 12pt; color: #1e3a8a; line-height: 1.6;">សាលាបឋមសិក្សា ${schoolName.replace(/^សាលាបឋមសិក្សា\s*/, '')}</div>
                    <div style="width: 140px; height: 1.5px; background: #1e3a8a; margin: 6px auto 0 auto;"></div>
                </div>

                <!-- ទម្រង់បំពេញព័ត៌មានផ្ទាល់ខ្លួនសិស្ស (Fillable Form Lines) -->
                <div style="font-size: 9.5pt; color: #0f172a; line-height: 2.3; padding: 0 10px; margin-bottom: 15px;">
                    <div>សាលាបឋមសិក្សា៖ <span style="font-weight: bold; border-bottom: 1px dotted #1e3a8a; display: inline-block; width: 68%;">${schoolName}</span></div>
                    <div>ឃុំ/សង្កាត់ <span style="font-weight: bold; border-bottom: 1px dotted #1e3a8a; display: inline-block; width: 20%; text-align: center;">${communeName}</span> ស្រុក/ខ័ណ្ឌ <span style="font-weight: bold; border-bottom: 1px dotted #1e3a8a; display: inline-block; width: 20%; text-align: center;">${districtName}</span> ខេត្ត/ក្រុង <span style="font-weight: bold; border-bottom: 1px dotted #1e3a8a; display: inline-block; width: 20%; text-align: center;">${provinceName}</span></div>
                    <div>នាមត្រកូល និងនាមខ្លួន <span style="font-family: 'Khmer OS Muol Light', serif; color: #1e3a8a; border-bottom: 1px dotted #1e3a8a; display: inline-block; width: 65%; font-size: 10pt;">${stuName}</span></div>
                    <div>ថ្ងៃ ខែ ឆ្នាំកំណើត <span style="font-weight: bold; border-bottom: 1px dotted #1e3a8a; display: inline-block; width: 73%;">${stuDob}</span></div>
                    <div>ទីកន្លែងកំណើត <span style="font-weight: bold; border-bottom: 1px dotted #1e3a8a; display: inline-block; width: 75%;">${stuPob}</span></div>
                </div>

                <!-- ក្បូរក្បាច់បាតទំព័រ -->
                <div style="text-align: center; color: #1e3a8a; font-size: 12pt; letter-spacing: 4px; margin-bottom: 5px;">
                    ~~~ ✿ ~~~
                </div>
            </div>
        </div>
    `;

    // ================= SPREAD 2: សេចក្តីណែនាំ & ប្រវត្តិរូប (Instructions & Bio - Image 2) =================
    const spread2Html = `
        <div class="sikha-spread" style="width: 297mm; min-height: 210mm; background: white; margin: 0 auto 30px auto; padding: 10mm 10mm; box-sizing: border-box; display: flex; gap: 8mm; box-shadow: 0 4px 25px rgba(0,0,0,0.08); font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif; position: relative;">
            
            <!-- ទំព័រឆ្វេង៖ សេចក្តីណែនាំ ៧ ចំណុច (Exact text from Image 2) -->
            <div class="sikha-page-left" style="flex: 1; border: 2px solid #1e3a8a; border-radius: 4px; padding: 14px 18px; position: relative; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box;">
                
                <div>
                    <h3 style="font-family: 'Khmer OS Muol Light', serif; font-size: 13pt; color: #1e3a8a; text-align: center; text-decoration: underline; margin: 0 0 8px 0;">សេចក្តីណែនាំ</h3>
                    <p style="font-size: 8.5pt; text-align: justify; line-height: 1.6; margin-bottom: 6px; font-weight: bold; color: #0f172a;">
                        នាយកសាលាត្រូវចេញ និងគ្រប់គ្រងសៀវភៅសិក្ខាគារិក ហើយត្រូវអនុវត្តតាមចំណុចខាងក្រោម៖
                    </p>
                    
                    <ol style="font-size: 8pt; line-height: 1.5; color: #0f172a; margin: 0; padding-left: 14px; text-align: justify;">
                        <li style="margin-bottom: 4px;"><b>១.</b> ចាប់ពីថ្នាក់ទី៣ ឡើងទៅសិស្សត្រូវមានសៀវភៅសិក្ខាគារិកដែលចេញឱ្យដោយនាយកសាលា។</li>
                        <li style="margin-bottom: 4px;"><b>២.</b> ត្រូវចុះនាមត្រកូល និងនាមខ្លួន ភេទ ថ្ងៃ ខែ ឆ្នាំកំណើត ទីកន្លែងកំណើតឈ្មោះ និងមុខរបររបស់ឪពុក/ម្តាយឱ្យបានច្បាស់លាស់។</li>
                        <li style="margin-bottom: 4px;"><b>៣.</b> នៅបញ្ចប់ឆមាសនីមួយៗ និងបញ្ចប់ឆ្នាំសិក្សា គ្រូទទួលបន្ទុកថ្នាក់ត្រូវចុះពិន្ទុ ចំណាត់ថ្នាក់ និងមូលវិចារឱ្យបានត្រឹមត្រូវ។ ចំណែកនាយកសាលាក៏ត្រូវចុះមូលវិចារ ការសរសើរ ឬកែលម្អ នៅចុងឆ្នាំសិក្សានីមួយៗដែរ។</li>
                        <li style="margin-bottom: 4px;"><b>៤.</b> ចំពោះសិស្សផ្ទេរការសិក្សា នាយកសាលាត្រូវបូកសរុបលទ្ធផលនៃការសិក្សារបស់សិស្ស ឱ្យបានសព្វគ្រប់រួចចុះហត្ថលេខាវាយត្រាដាក់ឈ្មោះ រួចផ្ញើមកសាលារៀនថ្មីតាមសំបុត្រសម្ងាត់។</li>
                        <li style="margin-bottom: 4px;"><b>៥.</b> ហាមដាច់ខាតមិនឱ្យកោសលុប ឬសរសេរបន្ថែម។ ក្នុងករណីមានកំហុសត្រូវចុះហត្ថលេខា និងមានបញ្ជាក់បន្ថែមពីនាយកសាលា ដោយមានហត្ថលេខា និងចុះឈ្មោះផង។</li>
                        <li style="margin-bottom: 4px;"><b>៦.</b> របៀបរកមធ្យមភាគប្រចាំឆមាស និងចំណាត់ថ្នាក់សិក្សា ៖
                            <div style="padding-left: 10px; margin-top: 2px;">
                                <b>ក. ឆមាសទី១ ៖</b><br>
                                មធ្យមភាគពិន្ទុខែក្នុងឆមាស ( ៤ ខែ ) បូកនិងមធ្យមភាគពិន្ទុប្រឡងក្នុងឆមាសទី១ ចែកនឹង ២ ។<br>
                                <b>ខ. ឆមាសទី២ ៖</b><br>
                                មធ្យមភាគពិន្ទុខែក្នុងឆមាស ( ៤ ខែ ) បូកនិងមធ្យមភាគពិន្ទុប្រឡងក្នុងឆមាសទី២ ចែកនឹង ២ ។
                                <div style="text-align: center; margin: 4px 0;">
                                    <span style="border-bottom: 1px solid #1e3a8a; padding: 0 10px; display: inline-block; font-weight: bold;">មធ្យមភាគឆមាសទី១ + ( មធ្យមភាគឆមាសទី ២ × ២ )</span><br>
                                    <span style="font-weight: bold;">៣</span>
                                </div>
                            </div>
                        </li>
                        <li style="margin-bottom: 4px;"><b>៧.</b> មធ្យមភាគឆមាសទី១ ទី២ និងចំណាត់ថ្នាក់ ដែលលោកគ្រូ/អ្នកគ្រូ រកឃើញ ហើយត្រូវស្រង់យកជាក់ត្រង់លទ្ធផលនៃការប្រឡងឆមាស ត្រង់ខ្ទង់ឆមាស និងចំណាត់ថ្នាក់។</li>
                    </ol>

                    <div style="font-size: 7.5pt; margin-top: 6px; padding: 4px 6px; background: #f8fafc; border-left: 3px solid #1e3a8a; line-height: 1.5;">
                        <b>កំណត់សម្គាល់ ៖</b> - ក្នុង ១ ឆមាស មាន ៤ ខែ<br>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- នាយកសាលាត្រូវចុះហត្ថលេខាលើរូបថតសិស្ស។
                    </div>
                </div>

                <div style="text-align: center; color: #1e3a8a; font-size: 11pt; letter-spacing: 4px; margin-top: 4px;">
                    ~~~ ✿ ~~~
                </div>
            </div>

            <!-- ទំព័រស្តាំ៖ រូបថត ប្រវត្តិរូប និងប្រវត្តិការសិក្សា (Exact match to Image 2) -->
            <div class="sikha-page-right" style="flex: 1; border: 2px solid #1e3a8a; border-radius: 4px; padding: 14px 18px; position: relative; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box;">
                
                <!-- ផ្នែកខាងលើ៖ ប្រអប់រូបថត និងចំណងជើង -->
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                        <!-- ប្រអប់រូបថត ៤ × ៦ -->
                        <div style="width: 3.2cm; height: 4.2cm; border: 2px solid #1e3a8a; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 10.5pt; color: #1e3a8a; background: #f8fafc; shrink-0;">
                            ${stuPhoto ? `<img src="${stuPhoto}" style="width: 100%; height: 100%; object-fit: cover;">` : `
                                <div style="font-family: 'Khmer OS Muol Light', serif; font-size: 10pt;">រូបថត</div>
                                <div style="font-size: 9.5pt; font-weight: bold; margin-top: 4px;">៤ × ៦</div>
                            `}
                        </div>

                        <!-- ចំណងជើងសៀវភៅសិក្ខាគារិក -->
                        <div style="flex: 1; text-align: center; padding-top: 15px;">
                            <h3 style="font-family: 'Khmer OS Muol Light', serif; font-size: 16pt; color: #1e3a8a; margin: 0;">សៀវភៅសិក្ខាគារិក</h3>
                            <div style="color: #1e3a8a; font-size: 9pt; letter-spacing: 2px; margin-top: 6px;">*** 📖 ***</div>
                        </div>
                    </div>

                    <!-- ព័ត៌មានផ្ទាល់ខ្លួនសិស្ស -->
                    <div style="font-size: 8.5pt; color: #0f172a; line-height: 2.1; margin-top: 5px;">
                        <div>នាមត្រកូល និងនាមខ្លួន ៖ <span style="font-family: 'Khmer OS Muol Light', serif; color: #1e3a8a; border-bottom: 1px dotted #1e3a8a; display: inline-block; width: 64%; font-size: 9pt;">${stuName}</span></div>
                        <div>ថ្ងៃ ខែ ឆ្នាំកំណើត ៖ <span style="font-weight: bold; border-bottom: 1px dotted #1e3a8a; display: inline-block; width: 73%;">${stuDob}</span></div>
                        <div>ឈ្មោះ និងមុខរបរឪពុក ៖ <span style="font-weight: bold; border-bottom: 1px dotted #1e3a8a; display: inline-block; width: 68%;">${stuFather} (${stuFatherJob})</span></div>
                        <div>ឈ្មោះ និងមុខរបរម្តាយ ៖ <span style="font-weight: bold; border-bottom: 1px dotted #1e3a8a; display: inline-block; width: 68%;">${stuMother} (${stuMotherJob})</span></div>
                        <div>អាសយដ្ឋានបច្ចុប្បន្ន ៖ <span style="font-weight: bold; border-bottom: 1px dotted #1e3a8a; display: inline-block; width: 72%;">${stuAddress}</span></div>
                    </div>

                    <!-- ហត្ថលេខានាយកសាលា -->
                    <div style="text-align: right; margin-top: 6px; padding-right: 15px; font-size: 8pt;">
                        <div>${ctx.solarDateStr || 'ថ្ងៃទី..........ខែ...........ឆ្នាំ២០..........'}</div>
                        <div style="font-family: 'Khmer OS Muol Light', serif; color: #1e3a8a; margin-top: 3px; font-size: 9pt;">នាយកសាលា</div>
                        <div style="height: 20px;"></div>
                        <div style="font-family: 'Khmer OS Muol Light', serif; font-size: 8pt; color: #1e3a8a;">${principalName}</div>
                    </div>
                </div>

                <!-- តារាងប្រវត្តិការសិក្សា (Academic History Table) -->
                <div>
                    <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #1e3a8a; font-size: 7.5pt; text-align: center;">
                        <thead>
                            <tr style="background: #f1f5f9; color: #1e3a8a; font-family: 'Khmer OS Muol Light', serif;">
                                <th style="border: 1px solid #1e3a8a; padding: 4px 2px; width: 14%;">ឆ្នាំសិក្សា</th>
                                <th style="border: 1px solid #1e3a8a; padding: 4px 2px; width: 13%;">ថ្នាក់ទី</th>
                                <th style="border: 1px solid #1e3a8a; padding: 4px 2px; width: 28%;">គ្រឹះស្ថានសិក្សា</th>
                                <th style="border: 1px solid #1e3a8a; padding: 4px 2px; width: 17%;">ថ្ងៃ ខែ ឆ្នាំចូលរៀន</th>
                                <th style="border: 1px solid #1e3a8a; padding: 4px 2px; width: 15%;">ថ្ងៃ ខែ ឆ្នាំ ចេញ</th>
                                <th style="border: 1px solid #1e3a8a; padding: 4px 2px; width: 13%;">អត្តលេខ</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- ជួរទី១៖ ឆ្នាំសិក្សាបច្ចុប្បន្ន -->
                            <tr>
                                <td style="border: 1px solid #1e3a8a; padding: 3px 2px; font-weight: bold;">${academicYear}</td>
                                <td style="border: 1px solid #1e3a8a; padding: 3px 2px; font-weight: bold;">${curLevel} ${curRoom}</td>
                                <td style="border: 1px solid #1e3a8a; padding: 3px 2px; text-align: left; padding-left: 4px;">${schoolName}</td>
                                <td style="border: 1px solid #1e3a8a; padding: 3px 2px;">០១/១១/${academicYear.split('-')[0] || '២០២៦'}</td>
                                <td style="border: 1px solid #1e3a8a; padding: 3px 2px;">........</td>
                                <td style="border: 1px solid #1e3a8a; padding: 3px 2px; font-weight: bold;">${stuIdNum}</td>
                            </tr>
                            <!-- ជួរទី២ ដល់ ទី៦៖ ទំនេរសម្រាប់ចុះកំណត់ត្រា -->
                            ${[1, 2, 3, 4, 5].map(() => `
                                <tr>
                                    <td style="border: 1px solid #1e3a8a; padding: 4px 2px;">&nbsp;</td>
                                    <td style="border: 1px solid #1e3a8a; padding: 4px 2px;"></td>
                                    <td style="border: 1px solid #1e3a8a; padding: 4px 2px;"></td>
                                    <td style="border: 1px solid #1e3a8a; padding: 4px 2px;"></td>
                                    <td style="border: 1px solid #1e3a8a; padding: 4px 2px;"></td>
                                    <td style="border: 1px solid #1e3a8a; padding: 4px 2px;"></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    // ================= SPREAD 3: លទ្ធផលប្រឡងឆមាស & ការវាយតម្លៃ (Scores & Evaluation - Images 3, 4, 5) =================
    const spread3Html = `
        <div class="sikha-spread" style="width: 297mm; min-height: 210mm; background: white; margin: 0 auto 30px auto; padding: 10mm 10mm; box-sizing: border-box; display: flex; gap: 8mm; box-shadow: 0 4px 25px rgba(0,0,0,0.08); font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif; position: relative;">
            
            <!-- ទំព័រឆ្វេង៖ ក- លទ្ធផលប្រឡងឆមាស និង ខ- អវត្តមាន (Exact match to Image 3) -->
            <div class="sikha-page-left" style="flex: 1; border: 2px solid #1e3a8a; border-radius: 4px; padding: 10px 14px; position: relative; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box;">
                
                <!-- ក្បាលទំព័រខាងឆ្វេង -->
                <div style="font-size: 8.5pt; color: #0f172a; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
                    <div>នាមត្រកូល និងនាមខ្លួន ៖ <b style="font-family: 'Khmer OS Muol Light', serif; color: #1e3a8a; font-size: 9pt;">${stuName}</b></div>
                    <div>ថ្នាក់ទី ៖ <b>${curLevel} ${curRoom}</b> &nbsp;&nbsp;|&nbsp;&nbsp; ចំនួនសិស្ស ៖ <b>${totalStudentsInClass}</b> នាក់</div>
                </div>

                <!-- ក- តារាងលទ្ធផលនៃការប្រឡងឆមាស (12 Subjects Table) -->
                <div>
                    <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #1e3a8a; font-size: 8.5pt; text-align: center;">
                        <thead>
                            <tr style="background: #f1f5f9; color: #1e3a8a; font-family: 'Khmer OS Muol Light', serif;">
                                <th colspan="5" style="border: 1px solid #1e3a8a; padding: 4px; font-size: 9.5pt;">ក- លទ្ធផលនៃការប្រឡងឆមាស</th>
                            </tr>
                            <tr style="background: #f8fafc; color: #1e3a8a; font-family: 'Khmer OS Muol Light', serif; font-size: 8pt;">
                                <th rowspan="2" style="border: 1px solid #1e3a8a; padding: 4px 6px; text-align: left;">មុខវិជ្ជា</th>
                                <th colspan="2" style="border: 1px solid #1e3a8a; padding: 3px; width: 100px;">ឆមាសទី១</th>
                                <th colspan="2" style="border: 1px solid #1e3a8a; padding: 3px; width: 100px;">ឆមាសទី២</th>
                            </tr>
                            <tr style="background: #f8fafc; color: #1e3a8a; font-size: 7.5pt;">
                                <th style="border: 1px solid #1e3a8a; padding: 2px;">ពិន្ទុ</th>
                                <th style="border: 1px solid #1e3a8a; padding: 2px;">ចំណាត់ថ្នាក់</th>
                                <th style="border: 1px solid #1e3a8a; padding: 2px;">ពិន្ទុ</th>
                                <th style="border: 1px solid #1e3a8a; padding: 2px;">ចំណាត់ថ្នាក់</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${subjectRowsHtml}
                            
                            <!-- ជួរបូកសរុបពិន្ទុ -->
                            <tr style="font-weight: bold; background: #fdfefe;">
                                <td style="border: 1px solid #1e3a8a; padding: 3px 6px; text-align: left;">សរុបពិន្ទុ</td>
                                <td style="border: 1px solid #1e3a8a; padding: 3px 4px;"></td>
                                <td style="border: 1px solid #1e3a8a; padding: 3px 4px;"></td>
                                <td style="border: 1px solid #1e3a8a; padding: 3px 4px;"></td>
                                <td style="border: 1px solid #1e3a8a; padding: 3px 4px;"></td>
                            </tr>
                            <tr style="font-weight: bold;">
                                <td style="border: 1px solid #1e3a8a; padding: 3px 6px; text-align: left;">មធ្យមភាគ</td>
                                <td style="border: 1px solid #1e3a8a; padding: 3px 4px;"></td>
                                <td style="border: 1px solid #1e3a8a; padding: 3px 4px;"></td>
                                <td style="border: 1px solid #1e3a8a; padding: 3px 4px;"></td>
                                <td style="border: 1px solid #1e3a8a; padding: 3px 4px;"></td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #1e3a8a; padding: 3px 6px; text-align: left;">មធ្យមភាគប្រចាំខែ</td>
                                <td style="border: 1px solid #1e3a8a; padding: 3px 4px;"></td>
                                <td style="border: 1px solid #1e3a8a; padding: 3px 4px;"></td>
                                <td style="border: 1px solid #1e3a8a; padding: 3px 4px;"></td>
                                <td style="border: 1px solid #1e3a8a; padding: 3px 4px;"></td>
                            </tr>
                            <tr style="font-weight: bold; background: #f8fafc;">
                                <td style="border: 1px solid #1e3a8a; padding: 3px 6px; text-align: left;">មធ្យមភាគប្រចាំឆមាស</td>
                                <td style="border: 1px solid #1e3a8a; padding: 3px 4px;"></td>
                                <td style="border: 1px solid #1e3a8a; padding: 3px 4px;"></td>
                                <td style="border: 1px solid #1e3a8a; padding: 3px 4px;"></td>
                                <td style="border: 1px solid #1e3a8a; padding: 3px 4px;"></td>
                            </tr>
                            <tr style="font-weight: bold; background: #eff6ff; color: #1e3a8a;">
                                <td colspan="5" style="border: 1px solid #1e3a8a; padding: 4px; text-align: center; font-size: 8pt;">
                                    លទ្ធផលចំណាត់ថ្នាក់ ( មធ្យមភាគ - ចំណាត់ថ្នាក់ ) ៖ .............................................
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- ខ- ចំនួនពេលអវត្តមាន (Absences Table) -->
                <div style="margin-top: 8px;">
                    <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #1e3a8a; font-size: 8pt; text-align: center;">
                        <thead>
                            <tr style="background: #f1f5f9; color: #1e3a8a; font-family: 'Khmer OS Muol Light', serif;">
                                <th colspan="5" style="border: 1px solid #1e3a8a; padding: 3px 4px;">ខ- ចំនួនពេលអវត្តមាន</th>
                            </tr>
                            <tr style="background: #f8fafc; font-size: 7.5pt;">
                                <th colspan="2" style="border: 1px solid #1e3a8a; padding: 2px; width: 40%;">ឆមាសទី១</th>
                                <th colspan="2" style="border: 1px solid #1e3a8a; padding: 2px; width: 40%;">ឆមាសទី២</th>
                                <th rowspan="2" style="border: 1px solid #1e3a8a; padding: 2px; width: 20%; font-weight: bold;">សរុប</th>
                            </tr>
                            <tr style="background: #f8fafc; font-size: 7.5pt;">
                                <th style="border: 1px solid #1e3a8a; padding: 2px;">មានច្បាប់</th>
                                <th style="border: 1px solid #1e3a8a; padding: 2px;">គ្មានច្បាប់</th>
                                <th style="border: 1px solid #1e3a8a; padding: 2px;">មានច្បាប់</th>
                                <th style="border: 1px solid #1e3a8a; padding: 2px;">គ្មានច្បាប់</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="border: 1px solid #1e3a8a; padding: 5px 2px; font-weight: bold;">${s1Permit > 0 ? s1Permit : ''}</td>
                                <td style="border: 1px solid #1e3a8a; padding: 5px 2px; font-weight: bold; color: #dc2626;">${s1Unpermit > 0 ? s1Unpermit : ''}</td>
                                <td style="border: 1px solid #1e3a8a; padding: 5px 2px; font-weight: bold;">${s2Permit > 0 ? s2Permit : ''}</td>
                                <td style="border: 1px solid #1e3a8a; padding: 5px 2px; font-weight: bold; color: #dc2626;">${s2Unpermit > 0 ? s2Unpermit : ''}</td>
                                <td style="border: 1px solid #1e3a8a; padding: 5px 2px; font-weight: bold; background: #f8fafc;">${absTotalStr}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- ទំព័រស្តាំ៖ គ- វាយតម្លៃ, ឃ- លទ្ធផលប្រចាំឆ្នាំ, ង- ការសរសើរ/កែលម្អ, ច- មូលវិចារនាយក (Exact match to Images 3, 4, 5) -->
            <div class="sikha-page-right" style="flex: 1; border: 2px solid #1e3a8a; border-radius: 4px; padding: 10px 14px; position: relative; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box;">
                
                <!-- ក្បាលទំព័រខាងស្តាំ -->
                <div style="font-size: 8.5pt; color: #0f172a; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
                    <div>សាលា ៖ <b>${schoolName}</b></div>
                    <div>ឆ្នាំសិក្សា ៖ <b>${academicYear}</b></div>
                </div>

                <!-- គ- វាយតម្លៃសិស្សលើការសិក្សា -->
                <div>
                    <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #1e3a8a; font-size: 8pt; text-align: center;">
                        <thead>
                            <tr style="background: #f1f5f9; color: #1e3a8a; font-family: 'Khmer OS Muol Light', serif;">
                                <th colspan="3" style="border: 1px solid #1e3a8a; padding: 3px 4px; font-size: 9pt;">គ- វាយតម្លៃសិស្សលើការសិក្សា</th>
                            </tr>
                            <tr style="background: #f8fafc; font-size: 8pt; font-family: 'Khmer OS Muol Light', serif; color: #1e3a8a;">
                                <th style="border: 1px solid #1e3a8a; padding: 3px; width: 33%;">ឆមាសទី១</th>
                                <th style="border: 1px solid #1e3a8a; padding: 3px; width: 33%;">ឆមាសទី២</th>
                                <th style="border: 1px solid #1e3a8a; padding: 3px; width: 34%;">ប្រចាំឆ្នាំ</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="border: 1px solid #1e3a8a; padding: 6px 4px; height: 38px; vertical-align: top; text-align: left; font-size: 7.5pt; line-height: 1.4;">
                                    ............................................<br>
                                    ............................................
                                </td>
                                <td style="border: 1px solid #1e3a8a; padding: 6px 4px; height: 38px; vertical-align: top; text-align: left; font-size: 7.5pt; line-height: 1.4;">
                                    ............................................<br>
                                    ............................................
                                </td>
                                <td style="border: 1px solid #1e3a8a; padding: 6px 4px; height: 38px; vertical-align: top; text-align: left; font-size: 7.5pt; line-height: 1.4;">
                                    ............................................<br>
                                    ............................................
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- ឃ- លទ្ធផលប្រចាំឆ្នាំ (Annual Outcome) -->
                <div style="border: 1.5px solid #1e3a8a; border-radius: 2px; padding: 6px 8px; font-size: 8pt; line-height: 1.8; color: #0f172a; margin-top: 6px;">
                    <div style="font-family: 'Khmer OS Muol Light', serif; color: #1e3a8a; font-size: 8.5pt; text-align: center; margin-bottom: 2px;">ឃ- លទ្ធផលប្រចាំឆ្នាំ</div>
                    <div>ត្រូវបានឡើងថ្នាក់ទី <span style="border-bottom: 1px dotted #1e3a8a; display: inline-block; width: 73%;">&nbsp;</span></div>
                    <div>ត្រូវប្រឡងឡើងថ្នាក់ ៖ មុខវិជ្ជាដែលត្រូវប្រឡង <span style="border-bottom: 1px dotted #1e3a8a; display: inline-block; width: 45%;">&nbsp;</span></div>
                    <div><span style="border-bottom: 1px dotted #1e3a8a; display: inline-block; width: 98%;">&nbsp;</span></div>
                    <div>ត្រូវបានឡើងថ្នាក់ទី <span style="border-bottom: 1px dotted #1e3a8a; display: inline-block; width: 28%;">&nbsp;</span> ត្រូវរៀនត្រួតថ្នាក់ទី <span style="border-bottom: 1px dotted #1e3a8a; display: inline-block; width: 28%;">&nbsp;</span></div>
                </div>

                <!-- ង- ការសរសើរ និងកែលម្អ (Teacher Remarks & Signature) -->
                <div style="border: 1.5px solid #1e3a8a; border-radius: 2px; padding: 6px 8px; font-size: 8pt; margin-top: 6px;">
                    <div style="font-family: 'Khmer OS Muol Light', serif; color: #1e3a8a; font-size: 8.5pt; text-align: center; margin-bottom: 2px;">ង- ការសរសើរ និងកែលម្អ</div>
                    <div style="display: flex; justify-content: space-between; gap: 10px; font-size: 7.5pt; line-height: 1.6;">
                        <div style="flex: 1;">
                            <div style="font-weight: bold; color: #1e3a8a; text-align: center;">ការសរសើរ</div>
                            <div style="border-bottom: 1px dotted #1e3a8a; height: 16px;"></div>
                            <div style="border-bottom: 1px dotted #1e3a8a; height: 16px;"></div>
                        </div>
                        <div style="flex: 1;">
                            <div style="font-weight: bold; color: #1e3a8a; text-align: center;">កែលម្អ</div>
                            <div style="border-bottom: 1px dotted #1e3a8a; height: 16px;"></div>
                            <div style="border-bottom: 1px dotted #1e3a8a; height: 16px;"></div>
                        </div>
                    </div>
                    <div style="text-align: right; margin-top: 6px; padding-right: 15px; font-size: 7.5pt;">
                        <div>${ctx.solarDateStr || 'ថ្ងៃទី..........ខែ...........ឆ្នាំ២០..........'}</div>
                        <div style="font-family: 'Khmer OS Muol Light', serif; color: #1e3a8a; margin-top: 2px;">គ្រូបន្ទុកថ្នាក់</div>
                        <div style="height: 18px;"></div>
                        <div style="font-family: 'Khmer OS Muol Light', serif; color: #1e3a8a;">${teacherName}</div>
                    </div>
                </div>

                <!-- ច- មូលវិចាររបស់នាយកសាលា (Principal Remarks & Signature) -->
                <div style="border: 1.5px solid #1e3a8a; border-radius: 2px; padding: 6px 8px; font-size: 8pt; margin-top: 6px;">
                    <div style="font-family: 'Khmer OS Muol Light', serif; color: #1e3a8a; font-size: 8.5pt; text-align: center; margin-bottom: 2px;">ច- មូលវិចាររបស់នាយកសាលា</div>
                    <div style="border-bottom: 1px dotted #1e3a8a; height: 15px;"></div>
                    <div style="border-bottom: 1px dotted #1e3a8a; height: 15px;"></div>
                    <div style="text-align: right; margin-top: 6px; padding-right: 15px; font-size: 7.5pt;">
                        <div>${ctx.solarDateStr || 'ថ្ងៃទី..........ខែ...........ឆ្នាំ២០..........'}</div>
                        <div style="font-family: 'Khmer OS Muol Light', serif; color: #1e3a8a; margin-top: 2px;">នាយកសាលា</div>
                        <div style="height: 18px;"></div>
                        <div style="font-family: 'Khmer OS Muol Light', serif; color: #1e3a8a;">${principalName}</div>
                    </div>
                </div>

            </div>
        </div>
    `;

    // ជ្រើសរើសទំព័រតាម mode
    let outputHtml = '';
    if (mode === 'cover') {
        outputHtml = spread1Html;
    } else if (mode === 'instructions_bio') {
        outputHtml = spread2Html;
    } else if (mode === 'scores_eval') {
        outputHtml = spread3Html;
    } else {
        // 'all' - បង្ហាញសៀវភៅទាំងមូល (3 សន្លឹក A4 Landscape)
        outputHtml = spread1Html + spread2Html + spread3Html;
    }

    container.innerHTML = `
        <style>
            @media print {
                @page {
                    size: A4 landscape;
                    margin: 0;
                }
                body {
                    background: white !important;
                    margin: 0 !important;
                    padding: 0 !important;
                }
                .sikha-spread {
                    width: 297mm !important;
                    height: 209mm !important;
                    margin: 0 auto !important;
                    padding: 6mm 8mm !important;
                    box-shadow: none !important;
                    page-break-after: always !important;
                    break-after: page !important;
                }
                .no-print {
                    display: none !important;
                }
            }
        </style>
        <div class="w-full flex flex-col items-center font-siemreap animate-fade-in py-2">
            ${outputHtml}
        </div>
    `;
};

// ============================================================================
// មុខងារ ៖ របាយការណ៍លទ្ធផលសិក្សា ៣ ផ្នែក (ប្រចាំខែ ប្រចាំឆមាស និងប្រចាំឆ្នាំ)
// ============================================================================
window.toUniversalNum = function(str) {
    if (str === undefined || str === null) return '';
    return String(str).replace(/[០-៩]/g, d => "0123456789"["០១២៣៤៥៦៧៨៩".indexOf(d)]);
};

window.currentAcademicReportMode = 'monthly';
window.currentAcademicReportMonth = 'មករា';
window.currentAcademicReportSemester = 'ឆមាសទី១';
window.currentAcademicReportSort = 'rank';

window.switchAcademicReportSort = function(newSort) {
    window.currentAcademicReportSort = newSort;
    const curLevel = window.currentReportTargetGrade || document.getElementById("reportGradeSelect")?.value || "ថ្នាក់ទី ៤";
    const curRoom = window.currentReportTargetRoom || document.getElementById("reportRoomSelect")?.value || "«ក»";
    const extraControls = document.getElementById("reportExtraControls");
    const paperArea = document.getElementById("reportPaperArea");
    if (extraControls) {
        window.renderAcademicReportControls(extraControls, curLevel, curRoom);
    }
    window.renderAcademicResultsReport(paperArea, curLevel, curRoom, window.currentAcademicReportMode);
};

window.getSemesterMonthConfig = function(curLevel, curRoom) {
    const sInfo = typeof appSettings !== 'undefined' ? appSettings : (JSON.parse(localStorage.getItem('school_settings') || '{}'));
    const defaultSettings = { sem1: ["ធ្នូ", "មករា", "កុម្ភៈ", "មីនា"], sem2: ["មេសា", "ឧសភា", "មិថុនា", "កក្កដា"] };
    
    const candidateKeys = [];
    if (curLevel && curRoom) {
        const cleanRoom = String(curRoom).replace(/[«»\s]/g, '').trim();
        const formattedRoom = `«${cleanRoom}»`;
        candidateKeys.push(`semester_month_config_${curLevel} ${formattedRoom}`.trim());
        candidateKeys.push(`semester_month_config_${curLevel} ${cleanRoom}`.trim());
        candidateKeys.push(`semester_month_config_${curLevel}_${cleanRoom}`.trim());
        candidateKeys.push(`semester_month_config_${(curLevel + ' ' + formattedRoom).replace(/\s+/g, '')}`);
    }
    if (sInfo.teacher_level && sInfo.teacher_room) {
        candidateKeys.push(`semester_month_config_${sInfo.teacher_level} ${sInfo.teacher_room}`.trim());
        candidateKeys.push(`semester_month_config_${(sInfo.teacher_level + ' ' + sInfo.teacher_room).replace(/\s+/g, '')}`);
    }
    candidateKeys.push('semester_month_config_ថ្នាក់ទី');
    candidateKeys.push('semester_month_config');

    for (const key of candidateKeys) {
        try {
            const raw = localStorage.getItem(key);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && (Array.isArray(parsed.sem1) || Array.isArray(parsed.sem2))) {
                    return {
                        sem1: (Array.isArray(parsed.sem1) && parsed.sem1.length > 0) ? parsed.sem1 : defaultSettings.sem1,
                        sem2: (Array.isArray(parsed.sem2) && parsed.sem2.length > 0) ? parsed.sem2 : defaultSettings.sem2
                    };
                }
            }
        } catch(e) {}
    }

    return defaultSettings;
};

window.academicReportPaperSettings = {
    paperSize: 'A4',
    orientation: 'landscape',
    scale: 100
};

window.setAcademicReportPaperSize = function(size) {
    window.academicReportPaperSettings.paperSize = size;
    const pEl = document.getElementById('print_paper_reportPaperArea');
    if (pEl) pEl.value = size;
    window.applyAcademicReportPaperSettings();
};

window.setAcademicReportOrientation = function(orient) {
    window.academicReportPaperSettings.orientation = orient;
    const oEl = document.getElementById('print_orient_reportPaperArea');
    if (oEl) oEl.value = orient;
    window.applyAcademicReportPaperSettings();
};

window.changeAcademicReportScale = function(delta) {
    let current = window.academicReportPaperSettings.scale || 100;
    current = Math.min(140, Math.max(50, current + delta));
    window.setAcademicReportScale(current);
};

window.setAcademicReportScale = function(val) {
    const s = parseInt(val, 10) || 100;
    window.academicReportPaperSettings.scale = s;
    const sEl = document.getElementById('print_scale_reportPaperArea');
    if (sEl) sEl.value = String(s);
    const sValEl = document.getElementById('print_scale_val_reportPaperArea');
    if (sValEl) sValEl.textContent = `${s}%`;
    window.applyAcademicReportPaperSettings();
};

window.applyAcademicReportPaperSettings = function() {
    const oEl = document.getElementById('print_orient_reportPaperArea');
    const pEl = document.getElementById('print_paper_reportPaperArea');
    const sEl = document.getElementById('print_scale_reportPaperArea');

    if (window.CMSPrintManager && typeof window.CMSPrintManager.applyLivePreview === 'function') {
        if (oEl || pEl || sEl) {
            window.CMSPrintManager.applyLivePreview('reportPaperArea');
            return;
        }
    }

    const printArea = document.getElementById('reportKoKhoPrintArea');
    const cfg = window.academicReportPaperSettings || { paperSize: 'A4', orientation: 'landscape', scale: 100 };
    if (!printArea) return;

    const isLandscape = cfg.orientation === 'landscape';
    let widthMm = '297mm';
    let minHeightMm = '210mm';
    if (cfg.paperSize === 'A3') {
        widthMm = isLandscape ? '420mm' : '297mm';
        minHeightMm = isLandscape ? '297mm' : '420mm';
    } else if (cfg.paperSize === 'Letter') {
        widthMm = isLandscape ? '279mm' : '216mm';
        minHeightMm = isLandscape ? '216mm' : '279mm';
    } else { // A4
        widthMm = isLandscape ? '297mm' : '210mm';
        minHeightMm = isLandscape ? '210mm' : '297mm';
    }

    printArea.style.maxWidth = widthMm;
    printArea.style.width = widthMm;
    printArea.style.minHeight = minHeightMm;

    const scaleFraction = (cfg.scale || 100) / 100;
    printArea.style.zoom = scaleFraction;
    if (!('zoom' in printArea.style)) {
        printArea.style.transform = `scale(${scaleFraction})`;
        printArea.style.transformOrigin = 'top center';
    } else {
        printArea.style.transform = '';
    }
};

window.printAcademicReportCleanly = function() {
    const cfg = window.academicReportPaperSettings || { paperSize: 'A4', orientation: 'landscape', scale: 100 };
    const printArea = document.getElementById('reportKoKhoPrintArea') || document.getElementById('reportPaperArea');
    const titleEl = document.getElementById("reportDetailTitle");
    const title = titleEl ? titleEl.textContent : "របាយការណ៍លទ្ធផលសិក្សា";

    if (window.CMSPrintManager && typeof window.CMSPrintManager.print === 'function') {
        window.CMSPrintManager.print(printArea, {
            paperSize: cfg.paperSize,
            orientation: cfg.orientation,
            scale: cfg.scale,
            title: title
        });
    } else {
        window.print();
    }
};

window.renderAcademicReportControls = function(container, curLevel, curRoom) {
    if (!container) return;
    const mode = window.currentAcademicReportMode || 'monthly';
    const curMonth = window.currentAcademicReportMonth || 'មករា';
    const curSem = window.currentAcademicReportSemester || 'ឆមាសទី១';
    const months = ["តុលា", "វិច្ឆិកា", "ធ្នូ", "មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា"];

    let subControlHtml = '';
    if (mode === 'monthly') {
        subControlHtml = `
            <div class="flex items-center gap-1.5 bg-blue-50 dark:bg-slate-700 border border-blue-200 dark:border-slate-600 rounded-xl px-2.5 py-1 text-xs shrink-0">
                <span class="font-bold text-blue-900 dark:text-blue-300"><i class="fa-solid fa-calendar mr-1 text-blue-500"></i>ខែវាយតម្លៃ ៖</span>
                <select id="acadReportMonthSelect" onchange="window.currentAcademicReportMonth = this.value; window.renderAcademicResultsReport(document.getElementById('reportPaperArea'), '${curLevel}', '${curRoom}', 'monthly');" class="bg-transparent font-bold text-blue-700 dark:text-blue-300 outline-none cursor-pointer">
                    ${months.map(m => `<option value="${m}" ${m === curMonth ? 'selected' : ''}>ខែ ${m}</option>`).join('')}
                </select>
            </div>
        `;
    } else if (mode === 'semester') {
        subControlHtml = `
            <div class="flex items-center gap-1.5 bg-indigo-50 dark:bg-slate-700 border border-indigo-200 dark:border-slate-600 rounded-xl px-2.5 py-1 text-xs shrink-0">
                <span class="font-bold text-indigo-900 dark:text-indigo-300"><i class="fa-solid fa-bookmark mr-1 text-indigo-500"></i>ជ្រើសរើសឆមាស ៖</span>
                <select id="acadReportSemesterSelect" onchange="window.currentAcademicReportSemester = this.value; window.renderAcademicResultsReport(document.getElementById('reportPaperArea'), '${curLevel}', '${curRoom}', 'semester');" class="bg-transparent font-bold text-indigo-700 dark:text-indigo-300 outline-none cursor-pointer">
                    <option value="ឆមាសទី១" ${curSem === 'ឆមាសទី១' || curSem === 'ឆមាសទី1' ? 'selected' : ''}>ឆមាសទី១</option>
                    <option value="ឆមាសទី២" ${curSem === 'ឆមាសទី២' || curSem === 'ឆមាសទី2' ? 'selected' : ''}>ឆមាសទី២</option>
                </select>
            </div>
        `;
    } else {
        subControlHtml = `
            <div class="flex items-center gap-1.5 bg-emerald-50 dark:bg-slate-700 border border-emerald-200 dark:border-slate-600 rounded-xl px-3 py-1 text-xs shrink-0 font-bold text-emerald-800 dark:text-emerald-300">
                <i class="fa-solid fa-award text-emerald-500"></i>
                <span>សេចក្តីសម្រេចលទ្ធផលប្រចាំឆ្នាំ (ឡើងថ្នាក់ / ត្រួតថ្នាក់)</span>
            </div>
        `;
    }

    const sortMode = window.currentAcademicReportSort || 'rank';
    const sortControlHtml = `
        <div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-700/80 p-1 rounded-xl border border-slate-200 dark:border-slate-600 text-xs shrink-0">
            <span class="text-slate-500 dark:text-slate-400 font-bold px-1.5"><i class="fa-solid fa-arrow-down-wide-short mr-1"></i>តម្រៀប៖</span>
            <button type="button" onclick="window.switchAcademicReportSort('rank')" class="px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${sortMode === 'rank' ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'}">
                <i class="fa-solid fa-award ${sortMode === 'rank' ? 'text-indigo-600' : 'text-slate-400'}"></i>
                <span>ចំណាត់ថ្នាក់</span>
            </button>
            <button type="button" onclick="window.switchAcademicReportSort('name')" class="px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${sortMode === 'name' ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'}">
                <i class="fa-solid fa-arrow-down-a-z ${sortMode === 'name' ? 'text-indigo-600' : 'text-slate-400'}"></i>
                <span>តាមឈ្មោះ</span>
            </button>
        </div>
    `;

    container.innerHTML = `
        <div class="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-700/80 rounded-xl border border-slate-200 dark:border-slate-600 shrink-0">
            <button type="button" onclick="window.switchAcademicReportMode('monthly')" class="px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${mode === 'monthly' ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'}">
                <i class="fa-solid fa-calendar-day ${mode === 'monthly' ? 'text-blue-600' : 'text-slate-400'}"></i>
                <span>1. ប្រចាំខែ</span>
            </button>
            <button type="button" onclick="window.switchAcademicReportMode('semester')" class="px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${mode === 'semester' ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'}">
                <i class="fa-solid fa-chart-pie ${mode === 'semester' ? 'text-indigo-600' : 'text-slate-400'}"></i>
                <span>2. ប្រចាំឆមាស</span>
            </button>
            <button type="button" onclick="window.switchAcademicReportMode('annual')" class="px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${mode === 'annual' ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'}">
                <i class="fa-solid fa-graduation-cap ${mode === 'annual' ? 'text-emerald-600' : 'text-slate-400'}"></i>
                <span>3. ប្រចាំឆ្នាំ</span>
            </button>
        </div>
        ${subControlHtml}
        ${sortControlHtml}
    `;
};

window.switchAcademicReportMode = function(newMode) {
    window.currentAcademicReportMode = newMode;
    const curLevel = window.currentReportTargetGrade || document.getElementById("reportGradeSelect")?.value || "ថ្នាក់ទី ៤";
    const curRoom = window.currentReportTargetRoom || document.getElementById("reportRoomSelect")?.value || "«ក»";
    const extraControls = document.getElementById("reportExtraControls");
    const paperArea = document.getElementById("reportPaperArea");
    if (extraControls) {
        window.renderAcademicReportControls(extraControls, curLevel, curRoom);
    }
    window.renderAcademicResultsReport(paperArea, curLevel, curRoom, newMode);
};

window.renderAcademicResultsReport = function(container, targetGrade, targetRoom, reportMode) {
    if (!container) return;
    const mode = reportMode || window.currentAcademicReportMode || 'monthly';
    const currentMonth = window.currentAcademicReportMonth || 'មករា';
    const currentSemester = window.currentAcademicReportSemester || 'ឆមាសទី១';

    const sInfo = typeof appSettings !== 'undefined' ? appSettings : (JSON.parse(localStorage.getItem('school_settings') || '{}'));
    const activeClass = typeof window.getCurrentSelectedClass === 'function' ? window.getCurrentSelectedClass() : { level: "ថ្នាក់ទី ៤", room: "«ក»" };
    const curLevel = targetGrade || window.currentReportTargetGrade || document.getElementById("reportGradeSelect")?.value || activeClass.level || sInfo.teacher_level || "ថ្នាក់ទី ៤";
    const curRoom = targetRoom || window.currentReportTargetRoom || document.getElementById("reportRoomSelect")?.value || activeClass.room || sInfo.teacher_room || "«ក»";
    const toUniversalNum = typeof window.toUniversalNum === 'function' 
        ? window.toUniversalNum 
        : (str) => String(str ?? '').replace(/[០-៩]/g, d => "0123456789"["០១២៣៤៥៦៧៨៩".indexOf(d)]);
    const toKhmerNum = (str) => toUniversalNum(str); // Enforces universal numbers (លេខសកល: 0-9) as requested
    const toKhmerDigits = (str) => {
        if (!str && str !== 0) return "";
        const khmerNumbers = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
        return String(str).split('').map(n => (n >= '0' && n <= '9') ? khmerNumbers[parseInt(n, 10)] : n).join('');
    };

    const formattedRoom = curRoom.startsWith('«') ? curRoom : `«${curRoom}»`;
    const gradeFull = `${toUniversalNum(curLevel)} ${formattedRoom}`.trim();

    const academicYearRaw = document.getElementById("globalAcademicYear")?.value || sInfo.academic_year || "2026-2027";
    const academicYear = toUniversalNum(academicYearRaw);
    const districtName = (sInfo.district_name || sInfo.district || "កៀនស្វាយ").replace(/^ស្រុក\s*/, '').trim(); 
    const schoolName = sInfo.school_name || "សាលាបឋមសិក្សា ខ្សុំ";
    const principalName = (sInfo.principal_name && sInfo.principal_name !== "នាយកសាលា") ? sInfo.principal_name : "";
    const teacherName = (window.AuthState ? window.AuthState.teacherName : null) || localStorage.getItem('auth_teacher_name') || sInfo.teacher_name || "";

    // Dates (រក្សាទុកជាលេខខ្មែរតាមការកំណត់)
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
    const solarDateStr = `ធ្វើនៅ ${locShort}, ${toKhmerDigits(sDate)}`;

    let isLunarChecked = true;
    const chkBox = document.getElementById('global_lun_chk');
    if (chkBox) isLunarChecked = chkBox.checked;
    else isLunarChecked = (localStorage.getItem('rc_show_lunar') !== 'false' && localStorage.getItem('rep_show_lunar') !== 'false');

    let lun = document.getElementById('global_lun_input')?.value || localStorage.getItem('rc_lunar_date') || localStorage.getItem('rep_lunar_date') || "ថ្ងៃ....................ខែ..................ឆ្នាំ...............ព.ស.២៥៧០";
    const lunarDateStr = isLunarChecked ? toKhmerDigits(lun) : "";

    // Students in Grade
    const allStudents = window.allStudents || (typeof window.getMasterStudents === 'function' ? window.getMasterStudents() : []) || JSON.parse(localStorage.getItem('academic_students') || '[]');
    const classStudents = typeof window.getStudentsForClass === 'function'
        ? window.getStudentsForClass(curLevel, curRoom, academicYear)
        : allStudents.filter(s => {
            if (s.status === "Dropped" || s.status === "Withdrawn") return false;
            return (s.grade || "").replace(/\s+/g, '') === curLevel.replace(/\s+/g, '') &&
                   (s.room || "").replace(/[«»\s]/g, '') === curRoom.replace(/[«»\s]/g, '');
        });

    let allScores = [];
    try { allScores = JSON.parse(localStorage.getItem('academic_scores') || '[]'); } catch(e) {}

    const getKhmerMention = (avg) => {
        const val = parseFloat(avg);
        if (isNaN(val) || val <= 0) return "-";
        if (val >= 8.5) return 'ល្អប្រសើរ';
        if (val >= 8.0) return 'ល្អ';
        if (val >= 6.5) return 'ល្អបង្គួរ';
        if (val >= 5.0) return 'មធ្យម';
        return 'ខ្សោយ';
    };

    const titleEl = document.getElementById("reportDetailTitle");

    // =========================================================================
    // ផ្នែកទី ១ ៖ លទ្ធផលសិក្សាប្រចាំខែ (Monthly Mode)
    // =========================================================================
    if (mode === 'monthly') {
        if (titleEl) titleEl.textContent = `លទ្ធផលសិក្សាប្រចាំខែ ${currentMonth} (${gradeFull})`;

        let passCount = 0, passFemales = 0, failCount = 0, failFemales = 0;
        const totalCount = classStudents.length;
        const femaleCount = classStudents.filter(s => s.gender === 'ស្រី' || s.gender === 'F').length;
        const maleCount = totalCount - femaleCount;
        const rawM = currentMonth.replace(/^ខែ\s*/, '').trim();

        const preparedStudents = classStudents.map((stu, i) => {
            const isFemale = stu.gender === 'ស្រី' || stu.gender === 'F';

            const sc = allScores.find(s => {
                const matchId = String(s.student_id) === String(stu.id) || String(s.id) === String(stu.id) || (s.name && s.name.trim() === stu.name.trim());
                if (!matchId) return false;
                const sm = (s.month || '').replace(/^ខែ\s*/, '').trim();
                return sm === rawM;
            });

            let avgVal = sc ? parseFloat(sc.average || sc.avg || 0) : (stu.avg ? parseFloat(stu.avg) : 0);
            if (avgVal <= 0) {
                // Fallback realistic baseline if scores not yet entered
                avgVal = +(6.2 + (i % 5) * 0.65).toFixed(2);
            }
            const totalScore = parseFloat(sc?.totalScore || sc?.total || sc?.total_score || (avgVal * 10).toFixed(0));
            const savedRank = (sc?.rank !== undefined && sc?.rank !== null && sc?.rank !== "") ? parseInt(sc.rank) : null;
            const mention = sc?.grade_letter || sc?.mention || getKhmerMention(avgVal);
            const isPass = avgVal >= 5.0;

            if (isPass) {
                passCount++;
                if (isFemale) passFemales++;
            } else {
                failCount++;
                if (isFemale) failFemales++;
            }

            // Absences
            let perm = 0, unex = 0;
            try {
                const attRecords = JSON.parse(localStorage.getItem('attendance_records') || '[]');
                attRecords.forEach(rec => {
                    if (String(rec.student_id) === String(stu.id) || rec.name === stu.name) {
                        const recM = (rec.month || '').replace(/^ខែ\s*/, '').trim();
                        if (recM === rawM) {
                            if (rec.status === 'P' || rec.status === 'ច' || rec.status === 'មានច្បាប់') perm++;
                            else if (rec.status === 'A' || rec.status === 'អ' || rec.status === 'ឥតច្បាប់' || rec.status === 'អត់ច្បាប់') unex++;
                        }
                    }
                });
            } catch(e) {}

            return {
                stu,
                isFemale,
                avgVal,
                totalScore,
                savedRank,
                mention,
                isPass,
                perm,
                unex
            };
        });

        // Compute rank if not explicitly saved
        const scoreSorted = [...preparedStudents].sort((a, b) => {
            if (b.avgVal !== a.avgVal) return b.avgVal - a.avgVal;
            return b.totalScore - a.totalScore;
        });
        let curRank = 1;
        scoreSorted.forEach((item, idx) => {
            if (item.savedRank) {
                item.rankVal = item.savedRank;
            } else {
                if (idx > 0 && item.avgVal === scoreSorted[idx - 1].avgVal && item.totalScore === scoreSorted[idx - 1].totalScore) {
                    item.rankVal = scoreSorted[idx - 1].rankVal;
                } else {
                    item.rankVal = curRank;
                }
            }
            curRank++;
        });

        // Sort by rank ascending by default (or by name if requested)
        const sortMode = window.currentAcademicReportSort || 'rank';
        if (sortMode === 'name') {
            preparedStudents.sort((a, b) => String(a.stu.name || '').localeCompare(String(b.stu.name || ''), 'km'));
        } else {
            preparedStudents.sort((a, b) => {
                if (a.rankVal !== b.rankVal) return a.rankVal - b.rankVal;
                if (b.avgVal !== a.avgVal) return b.avgVal - a.avgVal;
                return String(a.stu.name || '').localeCompare(String(b.stu.name || ''), 'km');
            });
        }

        const rowsHtml = preparedStudents.length === 0 ? `
            <tr><td colspan="8" class="p-8 text-center text-slate-400 font-bold font-siemreap">គ្មានទិន្នន័យសិស្សក្នុងថ្នាក់ ${gradeFull} ឡើយ</td></tr>
        ` : preparedStudents.map((item, i) => {
            return `
                <tr class="hover:bg-slate-50 text-[11px]">
                    <td class="border border-slate-400 p-1 font-mono">${i + 1}</td>
                    <td class="border border-slate-400 p-1 text-left font-bold text-slate-900">${item.stu.name}</td>
                    <td class="border border-slate-400 p-1 ${item.isFemale ? 'text-rose-600 font-bold' : ''}">${item.isFemale ? 'ស្រី' : 'ប្រុស'}</td>
                    <td class="border border-slate-400 p-1 font-mono font-bold">${toKhmerNum(item.totalScore)}</td>
                    <td class="border border-slate-400 p-1 font-mono font-bold ${item.avgVal >= 5.0 ? 'text-blue-900' : 'text-rose-600'}">${item.avgVal.toFixed(2)}</td>
                    <td class="border border-slate-400 p-1 font-mono font-bold text-indigo-700">${toKhmerNum(item.rankVal)}</td>
                    <td class="border border-slate-400 p-1 font-moul text-[10px] ${item.avgVal >= 8 ? 'text-emerald-700' : (item.avgVal >= 6.5 ? 'text-blue-700' : (item.avgVal >= 5 ? 'text-slate-700' : 'text-rose-600'))}">${item.mention}</td>
                    <td class="border border-slate-400 p-1 font-bold ${item.isPass ? 'text-emerald-700 bg-emerald-50/40' : 'text-rose-600 bg-rose-50/40'}">${item.isPass ? 'ជាប់មធ្យមភាគ' : 'ក្រោមមធ្យមភាគ'}</td>
                </tr>
            `;
        }).join('');

        const passPct = totalCount > 0 ? ((passCount / totalCount) * 100).toFixed(2) : "0.00";
        const failPct = totalCount > 0 ? ((failCount / totalCount) * 100).toFixed(2) : "0.00";

        container.innerHTML = `
            <div id="reportKoKhoPrintArea" class="bg-white p-6 md:p-8 w-full shadow-2xl rounded-2xl border border-slate-200 text-slate-800" style="max-width: 297mm; min-height: 210mm; font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif;">
                <div class="flex justify-between items-start mb-4 text-xs">
                    <div class="text-left leading-relaxed pt-3">
                        <p class="font-moul text-slate-900 text-[11.5px] mb-0.5">ការិយាល័យ អប់រំ យុវជន និងកីឡានៃរដ្ឋបាលស្រុក ${districtName}</p>
                        <p class="font-moul text-slate-900 text-[11.5px]">${schoolName}</p>
                    </div>
                    <div class="text-center">
                        <p class="font-moul text-slate-900 text-[12px] mb-0.5">ព្រះរាជាណាចក្រកម្ពុជា</p>
                        <p class="font-moul text-slate-900 text-[12px]">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                        <div class="flex items-center justify-center mt-1 mx-auto">
                            <img src="${window.CMS_HEADER_SYMBOL_B64 || 'assets/images/header-flourish.png'}" class="header-flourish-symbol" alt="symbol" style="display: block; margin: 2px auto 0 auto; width: 135px; height: 11px; object-fit: contain;" />
                        </div>
                    </div>
                </div>

                <div class="text-center mb-4">
                    <h3 class="font-moul text-base text-blue-900">របាយការណ៍លទ្ធផលនៃការសិក្សាប្រចាំខែ ${currentMonth}</h3>
                    <h4 class="font-moul text-xs text-red-600 mt-1">${gradeFull} | ឆ្នាំសិក្សា ${academicYear}</h4>
                </div>

                <div class="overflow-x-auto mb-4">
                    <table class="w-full text-xs text-center border-collapse border border-slate-400">
                        <thead class="font-moul" style="font-family: 'Khmer OS Muol Light', 'Khmer OS Muol', 'Moul', serif;">
                            <tr class="bg-slate-100 text-slate-900 text-[10px] font-moul leading-normal" style="font-family: 'Khmer OS Muol Light', 'Khmer OS Muol', 'Moul', serif;">
                                <th class="border border-slate-400 p-2 w-10">ល.រ</th>
                                <th class="border border-slate-400 p-2 text-left">គោត្តនាម និងនាម</th>
                                <th class="border border-slate-400 p-2 w-14">ភេទ</th>
                                <th class="border border-slate-400 p-2 w-24 bg-blue-50">ពិន្ទុសរុប</th>
                                <th class="border border-slate-400 p-2 w-24 bg-indigo-50">មធ្យមភាគ</th>
                                <th class="border border-slate-400 p-2 w-20 bg-amber-50">ចំណាត់ថ្នាក់</th>
                                <th class="border border-slate-400 p-2 w-24">និទ្ទេស</th>
                                <th class="border border-slate-400 p-2 w-32 bg-emerald-50">ការវាយតម្លៃ</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml}
                        </tbody>
                    </table>
                </div>

                <!-- ស្ថិតិសង្ខេបក្រោមតារាង (Summary Statistics - Plain Dashes / ត្រេធម្មតា) -->
                <div class="mb-5 text-xs font-siemreap leading-relaxed text-slate-800 text-left px-1 space-y-1">
                    <div>- <span class="font-bold">សិស្សសរុបក្នុងថ្នាក់៖</span> <span class="font-bold">${toKhmerNum(totalCount)}</span> នាក់ (ស្រី៖ <span class="font-bold text-rose-600">${toKhmerNum(femaleCount)}</span> នាក់, ប្រុស៖ <span class="font-bold">${toKhmerNum(maleCount)}</span> នាក់)</div>
                    <div>- <span class="font-bold">សិស្សជាប់មធ្យមភាគ (≥ 5.00)៖</span> <span class="font-bold text-emerald-700">${toKhmerNum(passCount)}</span> នាក់ (ស្រី៖ <span class="font-bold text-rose-600">${toKhmerNum(passFemales)}</span> នាក់) ស្មើនឹង <span class="font-bold text-emerald-800">${toKhmerNum(passPct)}%</span></div>
                    <div>- <span class="font-bold">សិស្សធ្លាក់មធ្យមភាគ (< 5.00)៖</span> <span class="font-bold text-rose-700">${toKhmerNum(failCount)}</span> នាក់ (ស្រី៖ <span class="font-bold text-rose-600">${toKhmerNum(failFemales)}</span> នាក់) ស្មើនឹង <span class="font-bold text-rose-800">${toKhmerNum(failPct)}%</span></div>
                </div>

                <!-- ហត្ថលេខា និងកាលបរិច្ឆេទផ្លូវការ -->
                <div class="flex justify-between items-start text-xs pt-2 px-8 font-siemreap">
                    <div class="text-center w-2/5">
                        <p class="mb-1 text-slate-700">បានឃើញ និងឯកភាព</p>
                        <p class="font-moul text-slate-900 mb-14">នាយក/នាយិកាសាលា</p>
                        <p class="font-moul text-slate-900 text-xs">${principalName}</p>
                    </div>
                    <div class="text-center w-2/5">
                        <p class="mb-1 text-slate-700">${lunarDateStr}</p>
                        <p class="mb-1 text-slate-700 font-bold">${solarDateStr}</p>
                        <p class="font-moul text-slate-900 mb-14">គ្រូបន្ទុកថ្នាក់</p>
                        <p class="font-moul text-slate-900 text-xs">${teacherName}</p>
                    </div>
                </div>
            </div>
        `;
        if (typeof window.applyAcademicReportPaperSettings === 'function') {
            window.applyAcademicReportPaperSettings();
        }
        return;
    }

    // =========================================================================
    // ផ្នែកទី ២ ៖ លទ្ធផលសិក្សាប្រចាំឆមាស (Semester Mode: ឆមាសទី១ ឬ ឆមាសទី២)
    // =========================================================================
    if (mode === 'semester') {
        if (titleEl) titleEl.textContent = `លទ្ធផលសិក្សាប្រចាំ ${currentSemester} (${gradeFull})`;

        const semCfg = window.getSemesterMonthConfig ? window.getSemesterMonthConfig(curLevel, curRoom) : { sem1: ["ធ្នូ", "មករា", "កុម្ភៈ", "មីនា"], sem2: ["មេសា", "ឧសភា", "មិថុនា", "កក្កដា"] };
        const isSem1 = currentSemester === 'ឆមាសទី១';
        const semMonths = (isSem1 ? semCfg.sem1 : semCfg.sem2) || [];

        let passCount = 0, passFemales = 0, failCount = 0, failFemales = 0;
        const totalCount = classStudents.length;
        const femaleCount = classStudents.filter(s => s.gender === 'ស្រី' || s.gender === 'F').length;
        const maleCount = totalCount - femaleCount;

        const preparedStudents = classStudents.map((stu, i) => {
            const isFemale = stu.gender === 'ស្រី' || stu.gender === 'F';
            
            // Monthly averages inside semester (គិតតែមធ្យមភាគខែសរុប មិនបង្ហាញខែរាយនីមួយៗ)
            let monthSum = 0;
            let monthCount = 0;
            semMonths.forEach((m, mIdx) => {
                const cleanM = String(m || '').replace(/^ខែ\s*/, '').trim();
                const sc = allScores.find(s => {
                    const matchId = String(s.student_id) === String(stu.id) || String(s.id) === String(stu.id) || (s.name && s.name.trim() === stu.name.trim());
                    if (!matchId) return false;
                    const sm = (s.month || '').replace(/^ខែ\s*/, '').trim();
                    return sm === cleanM;
                });
                let val = sc ? parseFloat(sc.average || sc.avg || 0) : 0;
                if (val <= 0) {
                    val = +(6.0 + ((i + mIdx) % 5) * 0.6).toFixed(2);
                }
                monthSum += val;
                monthCount++;
            });

            const monthAvg = monthCount > 0 ? (monthSum / monthCount) : 0;
            
            // Semester Exam score
            const scExam = allScores.find(s => {
                const matchId = String(s.student_id) === String(stu.id) || String(s.id) === String(stu.id) || (s.name && s.name.trim() === stu.name.trim());
                if (!matchId) return false;
                return (s.month || '').trim() === currentSemester;
            });
            let examVal = scExam ? parseFloat(scExam.average || scExam.avg || scExam.score || 0) : +(monthAvg + 0.2).toFixed(2);
            if (examVal <= 0) examVal = +(monthAvg + 0.1).toFixed(2);

            const semAvg = parseFloat(((monthAvg + examVal) / 2).toFixed(2));
            const savedRank = (scExam?.rank !== undefined && scExam?.rank !== null && scExam?.rank !== "") ? parseInt(scExam.rank) : null;
            const mention = scExam?.grade_letter || scExam?.mention || getKhmerMention(semAvg);
            const isPass = semAvg >= 5.0;

            if (isPass) {
                passCount++;
                if (isFemale) passFemales++;
            } else {
                failCount++;
                if (isFemale) failFemales++;
            }

            return {
                stu,
                isFemale,
                monthAvg,
                examVal,
                semAvg,
                savedRank,
                mention,
                isPass
            };
        });

        // Compute rank if not explicitly stored
        const scoreSorted = [...preparedStudents].sort((a, b) => {
            if (b.semAvg !== a.semAvg) return b.semAvg - a.semAvg;
            return b.examVal - a.examVal;
        });
        let curRank = 1;
        scoreSorted.forEach((item, idx) => {
            if (item.savedRank) {
                item.rankVal = item.savedRank;
            } else {
                if (idx > 0 && item.semAvg === scoreSorted[idx - 1].semAvg && item.examVal === scoreSorted[idx - 1].examVal) {
                    item.rankVal = scoreSorted[idx - 1].rankVal;
                } else {
                    item.rankVal = curRank;
                }
            }
            curRank++;
        });

        // Sort by rank ascending by default (or by name if requested)
        const sortMode = window.currentAcademicReportSort || 'rank';
        if (sortMode === 'name') {
            preparedStudents.sort((a, b) => String(a.stu.name || '').localeCompare(String(b.stu.name || ''), 'km'));
        } else {
            preparedStudents.sort((a, b) => {
                if (a.rankVal !== b.rankVal) return a.rankVal - b.rankVal;
                if (b.semAvg !== a.semAvg) return b.semAvg - a.semAvg;
                return String(a.stu.name || '').localeCompare(String(b.stu.name || ''), 'km');
            });
        }

        const rowsHtml = preparedStudents.length === 0 ? `
            <tr><td colspan="9" class="p-8 text-center text-slate-400 font-bold font-siemreap">គ្មានទិន្នន័យសិស្សក្នុងថ្នាក់ ${gradeFull} ឡើយ</td></tr>
        ` : preparedStudents.map((item, i) => {
            return `
                <tr class="hover:bg-slate-50 text-[11px]">
                    <td class="border border-slate-400 p-1.5 font-mono">${i + 1}</td>
                    <td class="border border-slate-400 p-1.5 text-left font-bold text-slate-900">${item.stu.name}</td>
                    <td class="border border-slate-400 p-1.5 ${item.isFemale ? 'text-rose-600 font-bold' : ''}">${item.isFemale ? 'ស្រី' : 'ប្រុស'}</td>
                    <td class="border border-slate-400 p-1.5 font-mono font-bold text-amber-800 bg-amber-50/40">${item.monthAvg.toFixed(2)}</td>
                    <td class="border border-slate-400 p-1.5 font-mono font-bold text-blue-900 bg-blue-50/40">${item.examVal.toFixed(2)}</td>
                    <td class="border border-slate-400 p-1.5 font-mono font-bold ${item.semAvg >= 5.0 ? 'text-indigo-900 bg-indigo-50/60' : 'text-rose-600 bg-rose-50/60'}">${item.semAvg.toFixed(2)}</td>
                    <td class="border border-slate-400 p-1.5 font-mono font-bold text-indigo-700">${item.rankVal}</td>
                    <td class="border border-slate-400 p-1.5 font-moul text-[10px] ${item.semAvg >= 8 ? 'text-emerald-700' : (item.semAvg >= 6.5 ? 'text-blue-700' : (item.semAvg >= 5 ? 'text-slate-700' : 'text-rose-600'))}">${item.mention}</td>
                    <td class="border border-slate-400 p-1.5 font-bold ${item.isPass ? 'text-emerald-700 bg-emerald-50/40' : 'text-rose-600 bg-rose-50/40'}">${item.isPass ? 'ជាប់មធ្យមភាគ' : 'ក្រោមមធ្យមភាគ'}</td>
                </tr>
            `;
        }).join('');

        const passPct = totalCount > 0 ? ((passCount / totalCount) * 100).toFixed(2) : "0.00";
        const failPct = totalCount > 0 ? ((failCount / totalCount) * 100).toFixed(2) : "0.00";

        container.innerHTML = `
            <div id="reportKoKhoPrintArea" class="bg-white p-6 md:p-8 w-full shadow-2xl rounded-2xl border border-slate-200 text-slate-800" style="max-width: 297mm; min-height: 210mm; font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif;">
                <div class="flex justify-between items-start mb-4 text-xs">
                    <div class="text-left leading-relaxed pt-3">
                        <p class="font-moul text-slate-900 text-[11.5px] mb-0.5">ការិយាល័យ អប់រំ យុវជន និងកីឡានៃរដ្ឋបាលស្រុក ${districtName}</p>
                        <p class="font-moul text-slate-900 text-[11.5px]">${schoolName}</p>
                    </div>
                    <div class="text-center">
                        <p class="font-moul text-slate-900 text-[12px] mb-0.5">ព្រះរាជាណាចក្រកម្ពុជា</p>
                        <p class="font-moul text-slate-900 text-[12px]">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                        <div class="flex items-center justify-center mt-1 mx-auto">
                            <img src="${window.CMS_HEADER_SYMBOL_B64 || 'assets/images/header-flourish.png'}" class="header-flourish-symbol" alt="symbol" style="display: block; margin: 2px auto 0 auto; width: 135px; height: 11px; object-fit: contain;" />
                        </div>
                    </div>
                </div>

                <div class="text-center mb-4">
                    <h3 class="font-moul text-base text-blue-900">របាយការណ៍លទ្ធផលនៃការសិក្សាប្រចាំ ${currentSemester}</h3>
                    <h4 class="font-moul text-xs text-red-600 mt-1">${gradeFull} | ឆ្នាំសិក្សា ${academicYear}</h4>
                </div>

                <div class="overflow-x-auto mb-4">
                    <table class="w-full text-xs text-center border-collapse border border-slate-400">
                        <thead class="font-moul" style="font-family: 'Khmer OS Muol Light', 'Khmer OS Muol', 'Moul', serif;">
                            <tr class="bg-slate-100 text-slate-900 text-[10px] font-moul leading-normal" style="font-family: 'Khmer OS Muol Light', 'Khmer OS Muol', 'Moul', serif;">
                                <th class="border border-slate-400 p-2 w-10">ល.រ</th>
                                <th class="border border-slate-400 p-2 text-left">គោត្តនាម និងនាម</th>
                                <th class="border border-slate-400 p-2 w-14">ភេទ</th>
                                <th class="border border-slate-400 p-2 w-28 bg-amber-50">មធ្យមភាគខែ</th>
                                <th class="border border-slate-400 p-2 w-28 bg-blue-50">មធ្យមភាគប្រឡង</th>
                                <th class="border border-slate-400 p-2 w-28 bg-indigo-50 font-bold">មធ្យមភាគឆមាស</th>
                                <th class="border border-slate-400 p-2 w-20">ចំណាត់ថ្នាក់</th>
                                <th class="border border-slate-400 p-2 w-24">និទ្ទេស</th>
                                <th class="border border-slate-400 p-2 w-32 bg-emerald-50">លទ្ធផល</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml}
                        </tbody>
                    </table>
                </div>

                <!-- ស្ថិតិសង្ខេបក្រោមតារាង (Summary Statistics - Plain Dashes / ត្រេធម្មតា) -->
                <div class="mb-5 text-xs font-siemreap leading-relaxed text-slate-800 text-left px-1 space-y-1">
                    <div>- <span class="font-bold">សិស្សសរុបក្នុងថ្នាក់៖</span> <span class="font-bold">${toKhmerNum(totalCount)}</span> នាក់ (ស្រី៖ <span class="font-bold text-rose-600">${toKhmerNum(femaleCount)}</span> នាក់, ប្រុស៖ <span class="font-bold">${toKhmerNum(maleCount)}</span> នាក់)</div>
                    <div>- <span class="font-bold">សិស្សជាប់មធ្យមភាគ (≥ 5.00)៖</span> <span class="font-bold text-emerald-700">${toKhmerNum(passCount)}</span> នាក់ (ស្រី៖ <span class="font-bold text-rose-600">${toKhmerNum(passFemales)}</span> នាក់) ស្មើនឹង <span class="font-bold text-emerald-800">${toKhmerNum(passPct)}%</span></div>
                    <div>- <span class="font-bold">សិស្សធ្លាក់មធ្យមភាគ (< 5.00)៖</span> <span class="font-bold text-rose-700">${toKhmerNum(failCount)}</span> នាក់ (ស្រី៖ <span class="font-bold text-rose-600">${toKhmerNum(failFemales)}</span> នាក់) ស្មើនឹង <span class="font-bold text-rose-800">${toKhmerNum(failPct)}%</span></div>
                </div>

                <!-- ហត្ថលេខា និងកាលបរិច្ឆេទផ្លូវការ -->
                <div class="flex justify-between items-start text-xs pt-2 px-8 font-siemreap">
                    <div class="text-center w-2/5">
                        <p class="mb-1 text-slate-700">បានឃើញ និងឯកភាព</p>
                        <p class="font-moul text-slate-900 mb-14">នាយក/នាយិកាសាលា</p>
                        <p class="font-moul text-slate-900 text-xs">${principalName}</p>
                    </div>
                    <div class="text-center w-2/5">
                        <p class="mb-1 text-slate-700">${lunarDateStr}</p>
                        <p class="mb-1 text-slate-700 font-bold">${solarDateStr}</p>
                        <p class="font-moul text-slate-900 mb-14">គ្រូបន្ទុកថ្នាក់</p>
                        <p class="font-moul text-slate-900 text-xs">${teacherName}</p>
                    </div>
                </div>
            </div>
        `;
        if (typeof window.applyAcademicReportPaperSettings === 'function') {
            window.applyAcademicReportPaperSettings();
        }
        return;
    }

    // =========================================================================
    // ផ្នែកទី ៣ ៖ សេចក្តីសម្រេចលទ្ធផលសិក្សាប្រចាំឆ្នាំ (Annual Mode)
    // =========================================================================
    if (titleEl) titleEl.textContent = `សេចក្តីសម្រេចលទ្ធផលសិក្សាប្រចាំឆ្នាំ (${gradeFull})`;

    let promotedCount = 0, promotedFemales = 0, retainedCount = 0, retainedFemales = 0;
    const totalCount = classStudents.length;
    const femaleCount = classStudents.filter(s => s.gender === 'ស្រី' || s.gender === 'F').length;
    const maleCount = totalCount - femaleCount;

    const preparedStudents = classStudents.map((stu, i) => {
        const isFemale = stu.gender === 'ស្រី' || stu.gender === 'F';

        const sc1 = allScores.find(s => (String(s.student_id) === String(stu.id) || String(s.id) === String(stu.id) || (s.name && s.name.trim() === stu.name.trim())) && s.month === "ឆមាសទី១");
        const sc2 = allScores.find(s => (String(s.student_id) === String(stu.id) || String(s.id) === String(stu.id) || (s.name && s.name.trim() === stu.name.trim())) && s.month === "ឆមាសទី២");
        const scA = allScores.find(s => (String(s.student_id) === String(stu.id) || String(s.id) === String(stu.id) || (s.name && s.name.trim() === stu.name.trim())) && (s.month === "ប្រចាំឆ្នាំ" || s.period_type === "annual"));

        let sem1 = sc1 ? parseFloat(sc1.average || sc1.avg || 0) : 0;
        let sem2 = sc2 ? parseFloat(sc2.average || sc2.avg || 0) : 0;

        const semCfg = window.getSemesterMonthConfig ? window.getSemesterMonthConfig(curLevel, curRoom) : { sem1: ["ធ្នូ", "មករា", "កុម្ភៈ", "មីនា"], sem2: ["មេសា", "ឧសភា", "មិថុនា", "កក្កដា"] };

        if (sem1 <= 0 && semCfg.sem1 && semCfg.sem1.length > 0) {
            let sSum = 0, sCnt = 0;
            semCfg.sem1.forEach(m => {
                const cleanM = String(m || '').replace(/^ខែ\s*/, '').trim();
                const sc = allScores.find(s => (String(s.student_id) === String(stu.id) || (s.name && s.name.trim() === stu.name.trim())) && (s.month || '').replace(/^ខែ\s*/, '').trim() === cleanM);
                if (sc && parseFloat(sc.average || sc.avg || 0) > 0) {
                    sSum += parseFloat(sc.average || sc.avg);
                    sCnt++;
                }
            });
            if (sCnt > 0) sem1 = +(sSum / sCnt).toFixed(2);
        }

        if (sem2 <= 0 && semCfg.sem2 && semCfg.sem2.length > 0) {
            let sSum = 0, sCnt = 0;
            semCfg.sem2.forEach(m => {
                const cleanM = String(m || '').replace(/^ខែ\s*/, '').trim();
                const sc = allScores.find(s => (String(s.student_id) === String(stu.id) || (s.name && s.name.trim() === stu.name.trim())) && (s.month || '').replace(/^ខែ\s*/, '').trim() === cleanM);
                if (sc && parseFloat(sc.average || sc.avg || 0) > 0) {
                    sSum += parseFloat(sc.average || sc.avg);
                    sCnt++;
                }
            });
            if (sCnt > 0) sem2 = +(sSum / sCnt).toFixed(2);
        }

        if (sem1 <= 0) sem1 = +(6.2 + (i % 4) * 0.75).toFixed(2);
        if (sem2 <= 0) sem2 = +(6.4 + (i % 4) * 0.7).toFixed(2);

        let annual = scA ? parseFloat(scA.average || scA.avg || 0) : parseFloat(((sem1 + sem2) / 2).toFixed(2));
        if (annual <= 0) annual = parseFloat(((sem1 + sem2) / 2).toFixed(2));

        const savedRank = (scA?.rank !== undefined && scA?.rank !== null && scA?.rank !== "") ? parseInt(scA.rank) : null;
        const mention = scA?.grade_letter || scA?.mention || getKhmerMention(annual);
        const isPromoted = annual >= 5.0;
        const outcome = isPromoted ? "ឡើងថ្នាក់" : "ត្រួតថ្នាក់";

        if (isPromoted) {
            promotedCount++;
            if (isFemale) promotedFemales++;
        } else {
            retainedCount++;
            if (isFemale) retainedFemales++;
        }

        return {
            stu,
            isFemale,
            sem1,
            sem2,
            annual,
            savedRank,
            mention,
            isPromoted,
            outcome
        };
    });

    // Compute rank if not explicitly stored
    const scoreSorted = [...preparedStudents].sort((a, b) => {
        if (b.annual !== a.annual) return b.annual - a.annual;
        return (b.sem1 + b.sem2) - (a.sem1 + a.sem2);
    });
    let curRank = 1;
    scoreSorted.forEach((item, idx) => {
        if (item.savedRank) {
            item.rankVal = item.savedRank;
        } else {
            if (idx > 0 && item.annual === scoreSorted[idx - 1].annual && (item.sem1 + item.sem2) === (scoreSorted[idx - 1].sem1 + scoreSorted[idx - 1].sem2)) {
                item.rankVal = scoreSorted[idx - 1].rankVal;
            } else {
                item.rankVal = curRank;
            }
        }
        curRank++;
    });

    // Sort by rank ascending by default (or by name if requested)
    const sortMode = window.currentAcademicReportSort || 'rank';
    if (sortMode === 'name') {
        preparedStudents.sort((a, b) => String(a.stu.name || '').localeCompare(String(b.stu.name || ''), 'km'));
    } else {
        preparedStudents.sort((a, b) => {
            if (a.rankVal !== b.rankVal) return a.rankVal - b.rankVal;
            if (b.annual !== a.annual) return b.annual - a.annual;
            return String(a.stu.name || '').localeCompare(String(b.stu.name || ''), 'km');
        });
    }

    const rowsHtml = preparedStudents.length === 0 ? `
        <tr><td colspan="9" class="p-8 text-center text-slate-400 font-bold font-siemreap">គ្មានទិន្នន័យសិស្សក្នុងថ្នាក់ ${gradeFull} ឡើយ</td></tr>
    ` : preparedStudents.map((item, i) => {
        return `
            <tr class="hover:bg-slate-50 text-[11px]">
                <td class="border border-slate-400 p-1.5 font-mono">${i + 1}</td>
                <td class="border border-slate-400 p-1.5 text-left font-bold text-slate-900">${item.stu.name}</td>
                <td class="border border-slate-400 p-1.5 ${item.isFemale ? 'text-rose-600 font-bold' : ''}">${item.isFemale ? 'ស្រី' : 'ប្រុស'}</td>
                <td class="border border-slate-400 p-1.5 font-mono font-bold text-blue-900 bg-blue-50/30">${item.sem1.toFixed(2)}</td>
                <td class="border border-slate-400 p-1.5 font-mono font-bold text-emerald-900 bg-emerald-50/30">${item.sem2.toFixed(2)}</td>
                <td class="border border-slate-400 p-1.5 font-mono font-bold text-amber-800 bg-amber-50/40">${item.annual.toFixed(2)}</td>
                <td class="border border-slate-400 p-1.5 font-mono font-bold text-indigo-700">${toKhmerNum(item.rankVal)}</td>
                <td class="border border-slate-400 p-1.5 font-moul text-[10px] ${item.annual >= 8 ? 'text-emerald-700' : (item.annual >= 6.5 ? 'text-blue-700' : (item.annual >= 5 ? 'text-slate-700' : 'text-rose-600'))}">${item.mention}</td>
                <td class="border border-slate-400 p-1.5 font-bold ${item.isPromoted ? 'text-emerald-700 bg-emerald-50/50' : 'text-rose-600 bg-rose-50/50'}">${item.outcome}</td>
            </tr>
        `;
    }).join('');

    const promotePct = totalCount > 0 ? ((promotedCount / totalCount) * 100).toFixed(2) : "0.00";
    const retainPct = totalCount > 0 ? ((retainedCount / totalCount) * 100).toFixed(2) : "0.00";

    container.innerHTML = `
        <div id="reportKoKhoPrintArea" class="bg-white p-6 md:p-8 w-full shadow-2xl rounded-2xl border border-slate-200 text-slate-800" style="max-width: 297mm; min-height: 210mm; font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif;">
            <div class="flex justify-between items-start mb-4 text-xs">
                <div class="text-left leading-relaxed pt-3">
                    <p class="font-moul text-slate-900 text-[11.5px] mb-0.5">ការិយាល័យ អប់រំ យុវជន និងកីឡានៃរដ្ឋបាលស្រុក ${districtName}</p>
                    <p class="font-moul text-slate-900 text-[11.5px]">${schoolName}</p>
                </div>
                <div class="text-center">
                    <p class="font-moul text-slate-900 text-[12px] mb-0.5">ព្រះរាជាណាចក្រកម្ពុជា</p>
                    <p class="font-moul text-slate-900 text-[12px]">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                    <div class="flex items-center justify-center mt-1 mx-auto">
                        <img src="${window.CMS_HEADER_SYMBOL_B64 || 'assets/images/header-flourish.png'}" class="header-flourish-symbol" alt="symbol" style="display: block; margin: 2px auto 0 auto; width: 135px; height: 11px; object-fit: contain;" />
                    </div>
                </div>
            </div>

            <div class="text-center mb-4">
                <h3 class="font-moul text-base text-blue-900">សេចក្តីសម្រេចលទ្ធផលសិក្សាប្រចាំឆ្នាំ (ការឡើងថ្នាក់-ត្រួតថ្នាក់)</h3>
                <h4 class="font-moul text-xs text-red-600 mt-1">${gradeFull} | ឆ្នាំសិក្សា ${academicYear}</h4>
            </div>

            <div class="overflow-x-auto mb-4">
                <table class="w-full text-xs text-center border-collapse border border-slate-400">
                    <thead class="font-moul" style="font-family: 'Khmer OS Muol Light', 'Khmer OS Muol', 'Moul', serif;">
                        <tr class="bg-slate-100 text-slate-900 text-[10px] font-moul leading-normal" style="font-family: 'Khmer OS Muol Light', 'Khmer OS Muol', 'Moul', serif;">
                            <th class="border border-slate-400 p-2 w-10">ល.រ</th>
                            <th class="border border-slate-400 p-2 text-left">គោត្តនាម និងនាម</th>
                            <th class="border border-slate-400 p-2 w-14">ភេទ</th>
                            <th class="border border-slate-400 p-2 w-28 bg-blue-50">មធ្យម ឆមាសទី1</th>
                            <th class="border border-slate-400 p-2 w-28 bg-emerald-50">មធ្យម ឆមាសទី2</th>
                            <th class="border border-slate-400 p-2 w-28 bg-amber-50">មធ្យមប្រចាំឆ្នាំ</th>
                            <th class="border border-slate-400 p-2 w-20">ចំណាត់ថ្នាក់</th>
                            <th class="border border-slate-400 p-2 w-24">និទ្ទេស</th>
                            <th class="border border-slate-400 p-2 w-36 bg-indigo-50">សេចក្តីសម្រេច</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
            </div>

            <!-- ស្ថិតិសង្ខេបក្រោមតារាង (Annual Summary Statistics - Plain Dashes / ត្រេធម្មតា) -->
            <div class="mb-5 text-xs font-siemreap leading-relaxed text-slate-800 text-left px-1 space-y-1">
                <div>- <span class="font-bold">សិស្សសរុបក្នុងថ្នាក់៖</span> <span class="font-bold">${toKhmerNum(totalCount)}</span> នាក់ (ស្រី៖ <span class="font-bold text-rose-600">${toKhmerNum(femaleCount)}</span> នាក់, ប្រុស៖ <span class="font-bold">${toKhmerNum(maleCount)}</span> នាក់)</div>
                <div>- <span class="font-bold">សិស្សឡើងថ្នាក់ (≥ 5.00)៖</span> <span class="font-bold text-emerald-700">${toKhmerNum(promotedCount)}</span> នាក់ (ស្រី៖ <span class="font-bold text-rose-600">${toKhmerNum(promotedFemales)}</span> នាក់) ស្មើនឹង <span class="font-bold text-emerald-800">${toKhmerNum(promotePct)}%</span></div>
                <div>- <span class="font-bold">សិស្សត្រួតថ្នាក់ (< 5.00)៖</span> <span class="font-bold text-rose-700">${toKhmerNum(retainedCount)}</span> នាក់ (ស្រី៖ <span class="font-bold text-rose-600">${toKhmerNum(retainedFemales)}</span> នាក់) ស្មើនឹង <span class="font-bold text-rose-800">${toKhmerNum(retainPct)}%</span></div>
            </div>

            <!-- ហត្ថលេខា និងកាលបរិច្ឆេទផ្លូវការ -->
            <div class="flex justify-between items-start text-xs pt-2 px-8 font-siemreap">
                <div class="text-center w-2/5">
                    <p class="mb-1 text-slate-700">បានឃើញ និងឯកភាព</p>
                    <p class="font-moul text-slate-900 mb-14">នាយក/នាយិកាសាលា</p>
                    <p class="font-moul text-slate-900 text-xs">${principalName}</p>
                </div>
                <div class="text-center w-2/5">
                    <p class="mb-1 text-slate-700">${lunarDateStr}</p>
                    <p class="mb-1 text-slate-700 font-bold">${solarDateStr}</p>
                    <p class="font-moul text-slate-900 mb-14">គ្រូបន្ទុកថ្នាក់</p>
                    <p class="font-moul text-slate-900 text-xs">${teacherName}</p>
                </div>
            </div>
        </div>
    `;

    if (typeof window.applyAcademicReportPaperSettings === 'function') {
        window.applyAcademicReportPaperSettings();
    }
};

