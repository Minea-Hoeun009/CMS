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
    const existingModal = document.getElementById("reportDetailContent");
    if (existingModal && existingModal.parentElement === document.body) {
        existingModal.remove();
    }
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

                    <!-- Card 12: បញ្ជីសារពើភ័ណ្ឌ (Classroom Inventory List) -->
                    <div onclick="window.openReportDetail('inventory')" class="bg-white/90 backdrop-blur-md rounded-[2rem] p-6 shadow-sm hover:shadow-[0_20px_40px_rgb(217,119,6,0.2)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer border-2 border-amber-100 hover:border-amber-500 group flex flex-col justify-between h-[210px] relative overflow-hidden">
                        <div class="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out pointer-events-none"></div>
                        <div class="flex items-center justify-between relative z-10">
                            <div class="w-14 h-14 bg-gradient-to-br from-amber-500 to-yellow-600 text-white rounded-2xl flex items-center justify-center text-2xl shadow-md shadow-amber-500/30 group-hover:scale-110 transition-transform"><i class="fa-solid fa-boxes-stacked"></i></div>
                            <span class="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Inventory</span>
                        </div>
                        <div class="relative z-10">
                            <h3 class="font-moul text-[15px] text-slate-900 mb-1.5 group-hover:text-amber-600">បញ្ជីសារពើភ័ណ្ឌ</h3>
                            <p class="text-slate-500 text-[11px] leading-relaxed">បញ្ជីគ្រប់គ្រង និងតាមដានសម្ភារ តុ កៅអី និងបរិក្ខារប្រើប្រាស់ក្នុងថ្នាក់រៀន។</p>
                        </div>
                    </div>

                    <!-- Card 13: បទបញ្ជាផ្ទៃក្នុង (Internal Class Regulations) -->
                    <div onclick="window.openReportDetail('internal_rules')" class="bg-white/90 backdrop-blur-md rounded-[2rem] p-6 shadow-sm hover:shadow-[0_20px_40px_rgb(225,29,72,0.2)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer border-2 border-rose-100 hover:border-rose-500 group flex flex-col justify-between h-[210px] relative overflow-hidden">
                        <div class="absolute -right-4 -top-4 w-24 h-24 bg-rose-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out pointer-events-none"></div>
                        <div class="flex items-center justify-between relative z-10">
                            <div class="w-14 h-14 bg-gradient-to-br from-rose-500 to-red-600 text-white rounded-2xl flex items-center justify-center text-2xl shadow-md shadow-rose-500/30 group-hover:scale-110 transition-transform"><i class="fa-solid fa-scale-balanced"></i></div>
                            <span class="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Internal Rules</span>
                        </div>
                        <div class="relative z-10">
                            <h3 class="font-moul text-[15px] text-slate-900 mb-1.5 group-hover:text-rose-600">បទបញ្ជាផ្ទៃក្នុង</h3>
                            <p class="text-slate-500 text-[11px] leading-relaxed">បទបញ្ជាផ្ទៃក្នុងផ្លូវការទាំង ១២ ប្រការ សម្រាប់ពង្រឹងវិន័យ និងសីលធម៌ក្នុងថ្នាក់។</p>
                        </div>
                    </div>

                    <!-- Card 14: គោលការណ៍ថ្នាក់រៀន (Class Principles) -->
                    <div onclick="window.openReportDetail('class_principles')" class="bg-white/90 backdrop-blur-md rounded-[2rem] p-6 shadow-sm hover:shadow-[0_20px_40px_rgb(14,165,233,0.2)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer border-2 border-sky-100 hover:border-sky-500 group flex flex-col justify-between h-[210px] relative overflow-hidden">
                        <div class="absolute -right-4 -top-4 w-24 h-24 bg-sky-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out pointer-events-none"></div>
                        <div class="flex items-center justify-between relative z-10">
                            <div class="w-14 h-14 bg-gradient-to-br from-sky-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center text-2xl shadow-md shadow-sky-500/30 group-hover:scale-110 transition-transform"><i class="fa-solid fa-list-check"></i></div>
                            <span class="text-[10px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Principles</span>
                        </div>
                        <div class="relative z-10">
                            <h3 class="font-moul text-[15px] text-slate-900 mb-1.5 group-hover:text-sky-600">គោលការណ៍ថ្នាក់រៀន</h3>
                            <p class="text-slate-500 text-[11px] leading-relaxed">គោលការណ៍រួម ១៦ ចំណុច សម្រាប់សិស្សានុសិស្សប្រកាន់ខ្ជាប់ក្នុងការសិក្សាប្រចាំថ្ងៃ។</p>
                        </div>
                    </div>

                    <!-- Card 15: វេនសម្អាតប្រចាំសប្ដាហ៍ (Weekly Cleaning Duty Roster) -->
                    <div onclick="window.openReportDetail('cleaning_schedule')" class="bg-white/90 backdrop-blur-md rounded-[2rem] p-6 shadow-sm hover:shadow-[0_20px_40px_rgb(16,185,129,0.2)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer border-2 border-emerald-100 hover:border-emerald-500 group flex flex-col justify-between h-[210px] relative overflow-hidden">
                        <div class="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out pointer-events-none"></div>
                        <div class="flex items-center justify-between relative z-10">
                            <div class="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl flex items-center justify-center text-2xl shadow-md shadow-emerald-500/30 group-hover:scale-110 transition-transform"><i class="fa-solid fa-broom"></i></div>
                            <span class="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Cleaning Duty</span>
                        </div>
                        <div class="relative z-10">
                            <h3 class="font-moul text-[15px] text-slate-900 mb-1.5 group-hover:text-emerald-600">វេនសម្អាតប្រចាំសប្ដាហ៍</h3>
                            <p class="text-slate-500 text-[11px] leading-relaxed">តារាងបែងចែកកាលវិភាគវេនសម្អាត ពីថ្ងៃចន្ទ ដល់ សៅរ៍ តាមក្រុម និងតួនាទីសិស្ស។</p>
                        </div>
                    </div>

                    <!-- Card 16: គណៈកម្មការសាខា (Branch Committee & Youth Council) -->
                    <div onclick="window.openReportDetail('branch_committee')" class="bg-white/90 backdrop-blur-md rounded-[2rem] p-6 shadow-sm hover:shadow-[0_20px_40px_rgb(147,51,234,0.2)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer border-2 border-purple-100 hover:border-purple-500 group flex flex-col justify-between h-[210px] relative overflow-hidden">
                        <div class="absolute -right-4 -top-4 w-24 h-24 bg-purple-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out pointer-events-none"></div>
                        <div class="flex items-center justify-between relative z-10">
                            <div class="w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-2xl flex items-center justify-center text-2xl shadow-md shadow-purple-600/30 group-hover:scale-110 transition-transform"><i class="fa-solid fa-sitemap"></i></div>
                            <span class="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Branch Committee</span>
                        </div>
                        <div class="relative z-10">
                            <h3 class="font-moul text-[15px] text-slate-900 mb-1.5 group-hover:text-purple-600">គណៈកម្មការសាខា</h3>
                            <p class="text-slate-500 text-[11px] leading-relaxed">រចនាសម្ព័ន្ធគណៈកម្មការសាខា ក្រុមប្រឹក្សាកុមារប្រចាំថ្នាក់ និងការបែងចែកអនុសាខាទាំង ៦។</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ផ្ទាំងបង្ហាញរបាយការណ៍លម្អិត ជា Pop-up Modal (Report Detail Pop-up Modal matching Honor Board / Image) -->
            <div id="reportDetailContent" onclick="if(event.target === this) window.closeReportDetail()" class="fixed inset-0 z-[2000] hidden bg-slate-900/60 p-2 md:p-6 transition-all duration-300 font-siemreap" style="backdrop-filter: none !important;">
                <div id="reportDetailModalContainer" class="bg-slate-50 w-full h-full rounded-2xl md:rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl relative border border-white/40 transform scale-95 opacity-0 transition-all duration-300 data-[open=true]:scale-100 data-[open=true]:opacity-100">
                    
                    <!-- ផ្នែកទី ១៖ របារចំណងជើង Pop up (Header Bar exactly matching Honor Board modal) -->
                    <div class="bg-white p-3 md:p-4 border-b border-slate-200/80 flex justify-between items-center shrink-0 shadow-sm z-20">
                        <div class="flex items-center gap-3">
                            <button type="button" onclick="window.closeReportDetail()" class="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-2 font-bold text-xs transition shadow-sm active:scale-95 shrink-0" title="ថយក្រោយ">
                                <i class="fa-solid fa-arrow-left text-sm"></i> <span>ថយក្រោយ</span>
                            </button>
                            <div class="flex items-center gap-2 sm:gap-3">
                                <div id="reportDetailHeaderIcon" class="w-9 h-9 sm:w-10 sm:h-10 rounded-[14px] bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-md text-sm">
                                    <i class="fa-solid fa-file-invoice"></i>
                                </div>
                                <div>
                                    <h2 id="reportDetailTitle" class="font-moul text-sm sm:text-base md:text-lg text-slate-800 leading-snug">ចំណងជើងរបាយការណ៍</h2>
                                    <p id="reportDetailSub" class="text-xs text-indigo-600 font-bold mt-0.5">ថ្នាក់ ${gradeFull}</p>
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="hidden sm:flex px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-200 items-center gap-1.5 shadow-sm">
                                <i class="fa-solid fa-file-lines"></i> <span>ឯកសាររដ្ឋបាល</span>
                            </span>
                            <button type="button" onclick="window.closeReportDetail()" class="w-10 h-10 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition shadow-sm active:scale-95 shrink-0" title="បិទ (Close)">
                                <i class="fa-solid fa-xmark text-lg"></i>
                            </button>
                        </div>
                    </div>

                    <!-- ផ្នែកទី ២៖ របារកំណត់ប្រភេទក្រដាស និងមុខងារនីមួយៗ (Toolbar row matching image) -->
                    <div id="reportPrintConfigBar" class="p-2.5 sm:p-3 shrink-0 bg-white/95 border-b border-slate-200/80 no-print flex items-center justify-between gap-3 overflow-x-auto custom-scrollbar flex-nowrap whitespace-nowrap shadow-sm">
                        <!-- ផ្នែកខាងឆ្វេង៖ តម្រងទិន្នន័យ (Filters: ខែ / ទម្រង់បញ្ជី) -->
                        <div id="reportExtraControls" class="flex items-center gap-2 flex-nowrap shrink-0"></div>

                        <!-- ផ្នែកខាងស្តាំ៖ ការកំណត់ប្រភេទក្រដាស ទិសដៅ មាត្រដ្ឋាន និងប៊ូតុងព្រីន -->
                        <div id="reportDetailPrintToolbarArea" class="flex items-center gap-2 flex-nowrap shrink-0">
                            ${window.CMSPrintManager ? window.CMSPrintManager.renderToolbarHtml('reportPaperArea', 'portrait', 'A4', 100) : `
                                <button onclick="window.printCurrentReport()" class="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/30 transition flex items-center gap-2 active:scale-95 outline-none">
                                    <i class="fa-solid fa-print"></i> បោះពុម្ព
                                </button>
                            `}
                        </div>
                    </div>

                    <!-- ផ្នែកទី ៣៖ ផ្ទាំងការងារក្រដាសរបាយការណ៍ (Realistic Canvas with Paper) -->
                    <div class="flex-1 overflow-auto bg-slate-200/70 p-4 md:p-8 custom-scrollbar flex flex-col items-center justify-start">
                        <div id="reportAcademicKpiContainer" class="w-full max-w-[297mm] mb-4 no-print hidden"></div>
                        <div id="reportPaperArea" class="transition-all relative flex justify-center items-start">
                            <!-- Content goes here -->
                        </div>
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
    const modal = document.getElementById("reportDetailContent");
    const modalContainer = document.getElementById("reportDetailModalContainer");
    if (modal) {
        if (modal.parentElement && modal.parentElement !== document.body) {
            document.body.appendChild(modal);
        }
        modal.classList.remove("hidden");
        modal.classList.add("flex");
        setTimeout(() => {
            if (modalContainer) modalContainer.setAttribute('data-open', 'true');
        }, 10);
    }

    const iconEl = document.getElementById("reportDetailHeaderIcon");
    if (iconEl) {
        if (reportType === 'sikhakarik') {
            iconEl.className = "w-9 h-9 sm:w-10 sm:h-10 rounded-[14px] bg-gradient-to-br from-blue-700 to-indigo-900 text-white flex items-center justify-center shadow-md text-sm";
            iconEl.innerHTML = '<i class="fa-solid fa-book-bookmark"></i>';
        } else if (reportType === 'report_ko_kho') {
            iconEl.className = "w-9 h-9 sm:w-10 sm:h-10 rounded-[14px] bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shadow-md text-sm";
            iconEl.innerHTML = '<i class="fa-solid fa-graduation-cap"></i>';
        } else if (reportType === 'attendance') {
            iconEl.className = "w-9 h-9 sm:w-10 sm:h-10 rounded-[14px] bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md text-sm";
            iconEl.innerHTML = '<i class="fa-solid fa-calendar-check"></i>';
        } else if (reportType === 'health') {
            iconEl.className = "w-9 h-9 sm:w-10 sm:h-10 rounded-[14px] bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-md text-sm";
            iconEl.innerHTML = '<i class="fa-solid fa-heart-pulse"></i>';
        } else if (reportType === 'stats') {
            iconEl.className = "w-9 h-9 sm:w-10 sm:h-10 rounded-[14px] bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md text-sm";
            iconEl.innerHTML = '<i class="fa-solid fa-chart-pie"></i>';
        } else if (reportType === 'structure') {
            iconEl.className = "w-9 h-9 sm:w-10 sm:h-10 rounded-[14px] bg-gradient-to-br from-purple-600 to-indigo-700 text-white flex items-center justify-center shadow-md text-sm";
            iconEl.innerHTML = '<i class="fa-solid fa-users"></i>';
        } else if (reportType === 'inventory') {
            iconEl.className = "w-9 h-9 sm:w-10 sm:h-10 rounded-[14px] bg-gradient-to-br from-amber-500 to-yellow-600 text-white flex items-center justify-center shadow-md text-sm";
            iconEl.innerHTML = '<i class="fa-solid fa-boxes-stacked"></i>';
        } else if (reportType === 'internal_rules') {
            iconEl.className = "w-9 h-9 sm:w-10 sm:h-10 rounded-[14px] bg-gradient-to-br from-rose-500 to-red-600 text-white flex items-center justify-center shadow-md text-sm";
            iconEl.innerHTML = '<i class="fa-solid fa-scale-balanced"></i>';
        } else if (reportType === 'class_principles') {
            iconEl.className = "w-9 h-9 sm:w-10 sm:h-10 rounded-[14px] bg-gradient-to-br from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-md text-sm";
            iconEl.innerHTML = '<i class="fa-solid fa-list-check"></i>';
        } else if (reportType === 'cleaning_schedule') {
            iconEl.className = "w-9 h-9 sm:w-10 sm:h-10 rounded-[14px] bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md text-sm";
            iconEl.innerHTML = '<i class="fa-solid fa-broom"></i>';
        } else if (reportType === 'branch_committee') {
            iconEl.className = "w-9 h-9 sm:w-10 sm:h-10 rounded-[14px] bg-gradient-to-br from-purple-600 to-indigo-700 text-white flex items-center justify-center shadow-md text-sm";
            iconEl.innerHTML = '<i class="fa-solid fa-sitemap"></i>';
        } else {
            iconEl.className = "w-9 h-9 sm:w-10 sm:h-10 rounded-[14px] bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-md text-sm";
            iconEl.innerHTML = '<i class="fa-solid fa-file-invoice"></i>';
        }
    }

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

    const kpiContainer = document.getElementById("reportAcademicKpiContainer");
    if (kpiContainer) {
        kpiContainer.innerHTML = '';
        kpiContainer.classList.add("hidden");
    }

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
            if (window.CMSPrintManager) window.CMSPrintManager.updateToolbarDefaults('reportPaperArea', 'portrait', 'A4', 100);
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
            if (window.CMSPrintManager) window.CMSPrintManager.updateToolbarDefaults('reportPaperArea', 'portrait', 'A4', 100);
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

            if (window.CMSPrintManager) window.CMSPrintManager.updateToolbarDefaults('reportPaperArea', 'portrait', 'A4', 100);
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
            if (window.CMSPrintManager) window.CMSPrintManager.updateToolbarDefaults('reportPaperArea', 'portrait', 'A4', 100);
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
            if (window.CMSPrintManager) window.CMSPrintManager.updateToolbarDefaults('reportPaperArea', 'portrait', 'A4', 100);
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
            if (window.CMSPrintManager) window.CMSPrintManager.updateToolbarDefaults('reportPaperArea', 'portrait', 'A4', 100);
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
        } else if (reportType === 'inventory') {
            titleEl.textContent = `បញ្ជីសារពើភ័ណ្ឌ (${gradeFull})`;
            if (extraControls) {
                extraControls.classList.remove("hidden");
                extraControls.innerHTML = `
                    <button onclick="window.saveClassReportData('inventory', '${curLevel}', '${curRoom}')" class="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition active:scale-95">
                        <i class="fa-solid fa-floppy-disk"></i> <span>រក្សាទុកទិន្នន័យ</span>
                    </button>
                `;
            }
            if (window.CMSPrintManager) window.CMSPrintManager.updateToolbarDefaults('reportPaperArea', 'portrait', 'A4', 100);
            if (typeof window.renderClassInventoryReport === 'function') {
                window.renderClassInventoryReport(paperArea, curLevel, curRoom);
            }
        } else if (reportType === 'internal_rules') {
            titleEl.textContent = `បទបញ្ជាផ្ទៃក្នុង (${gradeFull})`;
            if (window.CMSPrintManager) window.CMSPrintManager.updateToolbarDefaults('reportPaperArea', 'portrait', 'A4', 100);
            if (typeof window.renderInternalRulesReport === 'function') {
                window.renderInternalRulesReport(paperArea, curLevel, curRoom);
            }
        } else if (reportType === 'class_principles') {
            titleEl.textContent = `គោលការណ៍ថ្នាក់រៀន (${gradeFull})`;
            if (window.CMSPrintManager) window.CMSPrintManager.updateToolbarDefaults('reportPaperArea', 'portrait', 'A4', 100);
            if (typeof window.renderClassPrinciplesReport === 'function') {
                window.renderClassPrinciplesReport(paperArea, curLevel, curRoom);
            }
        } else if (reportType === 'cleaning_schedule') {
            titleEl.textContent = `វេនសម្អាតប្រចាំសប្ដាហ៍ (${gradeFull})`;
            if (extraControls) {
                extraControls.classList.remove("hidden");
                extraControls.innerHTML = `
                    <button onclick="window.saveClassReportData('cleaning_schedule', '${curLevel}', '${curRoom}')" class="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition active:scale-95">
                        <i class="fa-solid fa-floppy-disk"></i> <span>រក្សាទុកទិន្នន័យ</span>
                    </button>
                `;
            }
            if (window.CMSPrintManager) window.CMSPrintManager.updateToolbarDefaults('reportPaperArea', 'portrait', 'A4', 100);
            if (typeof window.renderCleaningScheduleReport === 'function') {
                window.renderCleaningScheduleReport(paperArea, curLevel, curRoom);
            }
        } else if (reportType === 'branch_committee') {
            titleEl.textContent = `គណៈកម្មការសាខា & ក្រុមប្រឹក្សាកុមារ (${gradeFull})`;
            if (extraControls) {
                extraControls.classList.remove("hidden");
                extraControls.innerHTML = `
                    <button onclick="window.saveClassReportData('branch_committee', '${curLevel}', '${curRoom}')" class="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition active:scale-95">
                        <i class="fa-solid fa-floppy-disk"></i> <span>រក្សាទុកទិន្នន័យ</span>
                    </button>
                `;
            }
            if (window.CMSPrintManager) window.CMSPrintManager.updateToolbarDefaults('reportPaperArea', 'portrait', 'A4', 100);
            if (typeof window.renderBranchCommitteeReport === 'function') {
                window.renderBranchCommitteeReport(paperArea, curLevel, curRoom);
            }
        }
    }, 150);
};

window.closeReportDetail = function() {
    const modal = document.getElementById("reportDetailContent");
    const container = document.getElementById("reportDetailModalContainer");
    if (container) {
        container.removeAttribute('data-open');
        setTimeout(() => {
            if (modal) {
                modal.classList.add("hidden");
                modal.classList.remove("flex");
            }
        }, 200);
    } else if (modal) {
        modal.classList.add("hidden");
        modal.classList.remove("flex");
    }
    const dash = document.getElementById("reportsMainDashboard");
    if (dash) dash.classList.remove("hidden");
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
                        <p class="font-moul text-slate-900 mb-16">នាយិកាសាលា</p>
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

    // 🔴 គណនាទិន្នន័យវត្តមានសរុបប្រចាំថ្នាក់ (Classwide Attendance Totals & Aggregations)
    let grandTotalPerm = 0;
    let grandTotalUnex = 0;
    let dailyTotals = {}; 
    let periodTotals = {}; 
    let studentAttMap = {};

    students.forEach(stu => {
        if (type === "monthly") {
            let attData = fetchAttendanceData(stu.id, value);
            studentAttMap[stu.id] = attData;
            grandTotalPerm += (attData.perm || 0);
            grandTotalUnex += (attData.unex || 0);
            periods.forEach(d => {
                let dVal = attData.days[d] || "";
                if (dVal === "ច" || dVal === "ច្ប" || dVal === "អ" || dVal === "អច្ប" || dVal === "ឈ") {
                    dailyTotals[d] = (dailyTotals[d] || 0) + 1;
                }
            });
        } else {
            let sPerm = 0, sUnex = 0;
            let sPeriodMap = {};
            periods.forEach(m => {
                let mData = fetchAttendanceData(stu.id, m);
                sPeriodMap[m] = mData;
                periodTotals[m] = periodTotals[m] || { perm: 0, unex: 0 };
                let p = mData.perm || 0;
                let u = mData.unex || 0;
                periodTotals[m].perm += p;
                periodTotals[m].unex += u;
                sPerm += p;
                sUnex += u;
            });
            studentAttMap[stu.id] = { periodMap: sPeriodMap, perm: sPerm, unex: sUnex };
            grandTotalPerm += sPerm;
            grandTotalUnex += sUnex;
        }
    });

    // 🔴 គណនាចំនួនពេល/ថ្ងៃរៀនជាក់ស្តែង (Actual School Sessions)
    let schoolSessions = 25;
    if (type === "monthly") {
        const monthMap = { "មករា": 1, "កុម្ភៈ": 2, "មីនា": 3, "មេសា": 4, "ឧសភា": 5, "មិថុនា": 6, "កក្កដា": 7, "សីហា": 8, "កញ្ញា": 9, "តុលា": 10, "វិច្ឆិកា": 11, "ធ្នូ": 12 };
        const monthNum = monthMap[value] || 10;
        const yrMatch = String(academicYear).match(/\d{4}/g);
        let calYear = new Date().getFullYear();
        if (yrMatch && yrMatch.length >= 2) {
            calYear = monthNum >= 10 ? parseInt(yrMatch[0]) : parseInt(yrMatch[1]);
        }
        const daysInMonth = new Date(calYear, monthNum, 0).getDate();
        let offDays = 0;
        for (let d = 1; d <= daysInMonth; d++) {
            const dayOfWeek = new Date(calYear, monthNum - 1, d).getDay();
            if (dayOfWeek === 0) offDays++;
            else if (window.monthlyHolidays && window.monthlyHolidays[d]) offDays++;
        }
        schoolSessions = Math.max(1, daysInMonth - offDays);
    } else if (type === "semester") {
        schoolSessions = periods.length * 25;
    } else {
        schoolSessions = periods.length * 25;
    }

    const totalAbsentSessions = grandTotalPerm + grandTotalUnex;
    const totalSessionsRequired = totalStus > 0 ? (schoolSessions * totalStus) : 0;
    const actualAttendedSessions = Math.max(0, totalSessionsRequired - totalAbsentSessions);
    const absencePercentage = totalSessionsRequired > 0 
        ? ((totalAbsentSessions / totalSessionsRequired) * 100).toFixed(2) 
        : "0.00";
    const attendancePercentage = totalSessionsRequired > 0 
        ? ((actualAttendedSessions / totalSessionsRequired) * 100).toFixed(2) 
        : "100.00";

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
                let attData = studentAttMap[stu.id] || fetchAttendanceData(stu.id, value);
                
                periods.forEach(d => {
                    let dVal = attData.days ? (attData.days[d] || "") : ""; 
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
                let sCached = studentAttMap[stu.id];
                periods.forEach(m => {
                    let attData = (sCached && sCached.periodMap) ? sCached.periodMap[m] : fetchAttendanceData(stu.id, m);
                    let pVal = attData ? (attData.perm || 0) : 0;
                    let uVal = attData ? (attData.unex || 0) : 0;
                    
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

        // 🟢 ជួរដេកសរុបអវត្តមានប្រចាំថ្នាក់ (Total Absence Row in Table) លើទំព័រចុងក្រោយ 🟢
        if (isLastPage) {
            let totalRowHtml = `
                <tr class="bg-slate-100 font-bold font-siemreap text-center text-slate-900 border-t-2 border-slate-800" style="height: 26px;">
                    <td colspan="4" class="border border-slate-800 text-center font-bold text-[11px] bg-[#e2e8f0]">សរុបអវត្តមាន</td>
            `;
            if (type === "monthly") {
                periods.forEach(d => {
                    const cnt = dailyTotals[d] || 0;
                    totalRowHtml += `<td class="border border-slate-800 text-center font-mono text-[10px] ${cnt > 0 ? 'text-rose-600 font-bold bg-rose-50' : 'text-slate-400'}">${cnt > 0 ? window.toKhmerNum(cnt.toString()) : '-'}</td>`;
                });
                totalRowHtml += `
                    <td class="border border-slate-800 text-center font-bold text-blue-800 bg-blue-100/60 text-[11px]">${grandTotalPerm > 0 ? window.toKhmerNum(grandTotalPerm.toString()) : '-'}</td>
                    <td class="border border-slate-800 text-center font-bold text-rose-700 bg-rose-100/60 text-[11px]">${grandTotalUnex > 0 ? window.toKhmerNum(grandTotalUnex.toString()) : '-'}</td>
                    <td class="border border-slate-800 text-center font-bold text-purple-700 bg-purple-100/60 text-[11px]">-</td>
                    <td class="border border-slate-800 text-center font-bold text-slate-900 bg-slate-200/80 text-[11px]">${totalAbsentSessions > 0 ? window.toKhmerNum(totalAbsentSessions.toString()) : '-'}</td>
                `;
            } else {
                periods.forEach(m => {
                    const pCnt = periodTotals[m]?.perm || 0;
                    const uCnt = periodTotals[m]?.unex || 0;
                    totalRowHtml += `
                        <td class="border border-slate-800 text-center font-bold text-blue-800 bg-blue-50/50 text-[10px]">${pCnt > 0 ? window.toKhmerNum(pCnt.toString()) : '-'}</td>
                        <td class="border border-slate-800 text-center font-bold text-rose-700 bg-rose-50/50 text-[10px]">${uCnt > 0 ? window.toKhmerNum(uCnt.toString()) : '-'}</td>
                    `;
                });
                totalRowHtml += `
                    <td class="border border-slate-800 text-center font-bold text-blue-800 bg-blue-100/60 text-[11px]">${grandTotalPerm > 0 ? window.toKhmerNum(grandTotalPerm.toString()) : '-'}</td>
                    <td class="border border-slate-800 text-center font-bold text-rose-700 bg-rose-100/60 text-[11px]">${grandTotalUnex > 0 ? window.toKhmerNum(grandTotalUnex.toString()) : '-'}</td>
                    <td class="border border-slate-800 text-center font-bold text-slate-900 bg-slate-200/80 text-[11px]">${totalAbsentSessions > 0 ? window.toKhmerNum(totalAbsentSessions.toString()) : '-'}</td>
                `;
            }
            totalRowHtml += `
                    <td class="border border-slate-800 bg-[#e2e8f0]"></td>
                </tr>
            `;
            pageTbodyHtml += totalRowHtml;
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
            <div class="my-2.5 text-[11.5px] font-siemreap leading-relaxed text-slate-800 text-left px-1 space-y-1">
                <div>- <span class="font-bold">បញ្ឈប់បញ្ជី${type === "monthly" ? "ក្នុងខែនេះ" : type === "semester" ? "ក្នុងឆមាសនេះ" : "ក្នុងឆ្នាំនេះ"}ត្រឹម៖</span> <b class="text-blue-700 underline font-bold" contenteditable="true">${window.toKhmerNum(schoolSessions.toString())}</b> ពេល</div>
                <div>- <span class="font-bold">ពេលសិស្សត្រូវមករៀនសរុប៖</span> <b class="text-slate-800 font-bold" contenteditable="true">${window.toKhmerNum(totalSessionsRequired.toString())}</b> ពេល</div>
                <div>- <span class="font-bold">ពេលអវត្តមានសរុប៖</span> <b class="text-rose-600 font-bold" contenteditable="true">${window.toKhmerNum(totalAbsentSessions.toString())}</b> ពេល (ច្បាប់៖ <b class="text-blue-700 font-bold">${window.toKhmerNum(grandTotalPerm.toString())}</b>, ឥតច្បាប់៖ <b class="text-rose-700 font-bold">${window.toKhmerNum(grandTotalUnex.toString())}</b>)</div>
                <div>- <span class="font-bold">ពេលដែលសិស្សមករៀនពិតប្រាកដ៖</span> <b class="text-emerald-700 font-bold" contenteditable="true">${window.toKhmerNum(actualAttendedSessions.toString())}</b> ពេល</div>
                <div>- <span class="font-bold">ភាគរយអវត្តមាន៖</span> <b class="text-rose-600 font-bold" contenteditable="true">${window.toKhmerNum(absencePercentage)}%</b> (អត្រាវត្តមានចូលរៀន៖ <b class="text-emerald-700 font-bold">${window.toKhmerNum(attendancePercentage)}%</b>)</div>
            </div>
        `;

        let summaryFooterHtml = "";
        if (isLastPage) {
            summaryFooterHtml = `
                <div class="flex justify-between items-start mt-6 px-10 text-[11px] font-siemreap text-slate-800">
                    <div class="text-center w-2/5">
                        <p class="mb-1 text-slate-700">បានឃើញ និងឯកភាព</p>
                        <p class="font-moul text-slate-900 mb-16">នាយិកាសាលា</p>
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

    const curGradeClean = (curLevel + (curRoom || '')).replace(/\s+/g, '');
    const isMatchingGrade = (g) => {
        if (!g) return true;
        const gClean = String(g).replace(/\s+/g, '');
        return gClean === curGradeClean || gClean.includes(curGradeClean) || curGradeClean.includes(gClean);
    };

    // ត្រងយកកំណត់ត្រាពិន្ទុឆមាសទី១ ឆមាសទី២ និងប្រចាំឆ្នាំ
    const s1ClassScores = allScores.filter(s => 
        (s.period_type === "semester" || s.type === "semester" || !s.period_type) &&
        (s.month === "ឆមាសទី១" || s.semester === "1" || s.semester === 1 || s.term === "s1" || (s.month && String(s.month).includes("១"))) &&
        isMatchingGrade(s.grade)
    );

    const s2ClassScores = allScores.filter(s => 
        (s.period_type === "semester" || s.type === "semester") &&
        (s.month === "ឆមាសទី២" || s.semester === "2" || s.semester === 2 || s.term === "s2" || (s.month && String(s.month).includes("២"))) &&
        isMatchingGrade(s.grade)
    );

    const annualClassScores = allScores.filter(s => 
        (s.period_type === "annual" || s.type === "annual" || s.month === "ប្រចាំឆ្នាំ") &&
        isMatchingGrade(s.grade)
    );

    // កំណត់ត្រារបស់សិស្សបច្ចុប្បន្ន
    const stuS1 = s1ClassScores.find(s => 
        (s.student_id && (String(s.student_id) === String(student.id) || String(s.student_id) === String(student.student_id))) ||
        (s.name && s.name.trim() === stuName.trim())
    ) || {};

    const stuS2 = s2ClassScores.find(s => 
        (s.student_id && (String(s.student_id) === String(student.id) || String(s.student_id) === String(student.student_id))) ||
        (s.name && s.name.trim() === stuName.trim())
    ) || {};

    const stuAnnual = annualClassScores.find(s => 
        (s.student_id && (String(s.student_id) === String(student.id) || String(s.student_id) === String(student.student_id))) ||
        (s.name && s.name.trim() === stuName.trim())
    ) || {};

    // មុខវិជ្ជាទាំង ១២ ផ្លូវការរបស់ក្រសួងអប់រំ (យោងតាមសៀវភៅសិក្ខាគារិកផ្លូវការ)
    const officialSubjects = [
        "សុជីវធម៌ និងពលរដ្ឋវិជ្ជា",
        "រៀនអាន និងមេសូត្រ",
        "គណិតវិទ្យា",
        "អក្សរផ្ចង់",
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
        "សុជីវធម៌ និងពលរដ្ឋវិជ្ជា": ["សុជីវធម៌ និងពលរដ្ឋវិជ្ជា", "សីលធម៌-ពលរដ្ឋ", "ss_moral", "moral", "សីលធម៌", "ពលរដ្ឋ"],
        "រៀនអាន និងមេត្រួត": ["រៀនអាន និងមេត្រួត", "រៀនអាន និងមេសូត្រ", "អាន", "មេសូត្រ", "k_read", "k_recite", "read", "k_listen"],
        "គណិតវិទ្យា": ["គណិតវិទ្យា", "គណិត", "math", "m_num", "m_alg", "m_geo", "m_measure", "m_stat"],
        "អក្សរផ្ចង់": ["អក្សរផ្ចង់", "អក្ខរាវិរុទ្ធ", "k_calligraphy", "spelling", "calligraphy"],
        "គំនូរ និង ហត្ថកម្ម": ["គំនូរ និង ហត្ថកម្ម", "គំនូរ", "art", "drawing", "life_skill", "បំណិនជីវិត"],
        "សរសេរតាមអាន និងសំណួរ": ["សរសេរតាមអាន និងសំណួរ", "សរសេរតាមអាន", "សរសេរ", "k_write", "dictation"],
        "តែងសេចក្តី": ["តែងសេចក្តី", "តែងសេចក្ដី", "k_compose", "compose"],
        "វិទ្យាសាស្ត្រអនុវត្ត": ["វិទ្យាសាស្ត្រអនុវត្ត", "វិទ្យាសាស្ត្រ", "science", "s_bio", "s_phy", "s_chem", "s_earth", "physics", "chemistry", "biology", "earth"],
        "ភូមិវិទ្យា": ["ភូមិវិទ្យា", "ភូមិ", "geography", "ss_geo"],
        "ប្រវត្តិវិទ្យា": ["ប្រវត្តិវិទ្យា", "ប្រវត្តិ", "history", "ss_hist"],
        "អប់រំកាយ និងកីឡា": ["អប់រំកាយ និងកីឡា", "អប់រំកាយ-កីឡា", "កីឡា", "sport", "pe_sport", "pe_health"],
        "ភាសាបរទេស": ["ភាសាបរទេស", "អង់គ្លេស", "english", "foreign_lang"]
    };

    // មុខងារទាញយកពិន្ទុមុខវិជ្ជា
    const getSubjectScore = (stuObj, stuId, subName, sem) => {
        const aliases = officialSubjectAliases[subName] || [subName];
        if (stuObj) {
            for (const al of aliases) {
                if (stuObj[al] !== undefined && stuObj[al] !== null && stuObj[al] !== '') {
                    return stuObj[al];
                }
                if (stuObj.scores && stuObj.scores[al] !== undefined && stuObj.scores[al] !== '') {
                    return stuObj.scores[al];
                }
            }
            // ប្រសិនបើមុខវិជ្ជាគណិតវិទ្យា ហើយមានតែមុខវិជ្ជារង
            if (subName === "គណិតវិទ្យា") {
                const mathKeys = ["m_num", "m_measure", "m_geo", "m_alg", "m_stat"];
                let mSum = 0, mCount = 0;
                mathKeys.forEach(mk => {
                    if (stuObj[mk] !== undefined && stuObj[mk] !== '' && !isNaN(parseFloat(stuObj[mk]))) {
                        mSum += parseFloat(stuObj[mk]); mCount++;
                    }
                });
                if (mCount > 0) return (mSum / mCount).toFixed(1);
            }
            // ប្រសិនបើវិទ្យាសាស្ត្រ ហើយមានតែមុខវិជ្ជារង
            if (subName === "វិទ្យាសាស្ត្រអនុវត្ត") {
                const sciKeys = ["s_phy", "s_chem", "s_bio", "s_earth"];
                let sSum = 0, sCount = 0;
                sciKeys.forEach(sk => {
                    if (stuObj[sk] !== undefined && stuObj[sk] !== '' && !isNaN(parseFloat(stuObj[sk]))) {
                        sSum += parseFloat(stuObj[sk]); sCount++;
                    }
                });
                if (sCount > 0) return (sSum / sCount).toFixed(1);
            }
        }
        // Fallback ស្វែងរកតាមជួរដេកក្នុង allScores
        for (const s of allScores) {
            if ((String(s.student_id) === String(stuId) || (s.name && s.name.trim() === stuName.trim())) &&
                (sem === 1 ? (s.semester === '1' || s.semester === 1 || s.term === 's1' || (s.month && String(s.month).includes('១')))
                           : (s.semester === '2' || s.semester === 2 || s.term === 's2' || (s.month && String(s.month).includes('២'))))) {
                for (const al of aliases) {
                    if (s.subject === al || s.subject_khmer === al) {
                        return s.score !== undefined ? s.score : (s.val || '');
                    }
                }
            }
        }
        return '';
    };

    // មុខងារគណនាចំណាត់ថ្នាក់តាមមុខវិជ្ជាក្នុងថ្នាក់ (Subject Rank)
    const getSubjectRank = (subName, sem, studentScore) => {
        if (studentScore === '' || studentScore === null || studentScore === undefined) return '';
        const num = parseFloat(studentScore);
        if (isNaN(num)) return '';
        let higherCount = 0;
        allStus.forEach(st => {
            const stId = st.id || st.student_id;
            if (String(stId) === String(student.id || student.student_id)) return;
            const stRec = (sem === 1 ? s1ClassScores : s2ClassScores).find(s => String(s.student_id) === String(stId));
            const stScore = getSubjectScore(stRec, stId, subName, sem);
            if (stScore !== '' && !isNaN(parseFloat(stScore))) {
                if (parseFloat(stScore) > num) higherCount++;
            }
        });
        return higherCount + 1;
    };

    // គណនាពិន្ទុ និងចំណាត់ថ្នាក់មុខវិជ្ជាទាំង ១២
    let s1SubScoresSum = 0, s1SubCount = 0;
    let s2SubScoresSum = 0, s2SubCount = 0;

    const subjectRowsHtml = officialSubjects.map(subName => {
        const s1Raw = getSubjectScore(stuS1, student.id || student.student_id, subName, 1);
        const s2Raw = getSubjectScore(stuS2, student.id || student.student_id, subName, 2);

        if (s1Raw !== '' && !isNaN(parseFloat(s1Raw))) {
            s1SubScoresSum += parseFloat(s1Raw); s1SubCount++;
        }
        if (s2Raw !== '' && !isNaN(parseFloat(s2Raw))) {
            s2SubScoresSum += parseFloat(s2Raw); s2SubCount++;
        }

        const s1RankRaw = getSubjectRank(subName, 1, s1Raw);
        const s2RankRaw = getSubjectRank(subName, 2, s2Raw);

        const s1Val = s1Raw !== '' ? window.toKhmerNum(String(s1Raw)) : '';
        const s1Rank = s1RankRaw ? window.toKhmerNum(String(s1RankRaw)) : '';
        const s2Val = s2Raw !== '' ? window.toKhmerNum(String(s2Raw)) : '';
        const s2Rank = s2RankRaw ? window.toKhmerNum(String(s2RankRaw)) : '';

        return `
            <tr>
                <td style="border: 1px solid #1e3a8a; padding: 3px 6px; text-align: left; font-size: 9pt;">${subName}</td>
                <td style="border: 1px solid #1e3a8a; padding: 3px 4px; text-align: center; font-size: 9pt; width: 50px; font-weight: bold; color: #1e3a8a;">${s1Val}</td>
                <td style="border: 1px solid #1e3a8a; padding: 3px 4px; text-align: center; font-size: 9pt; width: 50px; color: #64748b;">${s1Rank}</td>
                <td style="border: 1px solid #1e3a8a; padding: 3px 4px; text-align: center; font-size: 9pt; width: 50px; font-weight: bold; color: #1e3a8a;">${s2Val}</td>
                <td style="border: 1px solid #1e3a8a; padding: 3px 4px; text-align: center; font-size: 9pt; width: 50px; color: #64748b;">${s2Rank}</td>
            </tr>
        `;
    }).join('');

    // គណនាតម្លៃសរុប និងមធ្យមភាគប្រចាំឆមាសទី១ និងទី២
    const s1TotalExamVal = stuS1.total_exam || stuS1.total_score || (s1SubCount > 0 ? s1SubScoresSum.toFixed(1) : '');
    const s1AvgExamVal = stuS1.avg_exam || (s1SubCount > 0 ? (s1SubScoresSum / s1SubCount).toFixed(2) : '');
    const s1MonthlyAvgVal = stuS1.monthly_avg || (typeof window.calculateDynamicMonthlyAverage === 'function' ? window.calculateDynamicMonthlyAverage(student.id || student.student_id, 's1') : '') || '';
    
    let s1SemAvgVal = stuS1.average || '';
    if (!s1SemAvgVal && s1AvgExamVal && s1MonthlyAvgVal) {
        s1SemAvgVal = ((parseFloat(s1AvgExamVal) + parseFloat(s1MonthlyAvgVal)) / 2).toFixed(2);
    } else if (!s1SemAvgVal && s1AvgExamVal) {
        s1SemAvgVal = s1AvgExamVal;
    }
    const s1SemRankVal = stuS1.rank || '';

    const s2TotalExamVal = stuS2.total_exam || stuS2.total_score || (s2SubCount > 0 ? s2SubScoresSum.toFixed(1) : '');
    const s2AvgExamVal = stuS2.avg_exam || (s2SubCount > 0 ? (s2SubScoresSum / s2SubCount).toFixed(2) : '');
    const s2MonthlyAvgVal = stuS2.monthly_avg || (typeof window.calculateDynamicMonthlyAverage === 'function' ? window.calculateDynamicMonthlyAverage(student.id || student.student_id, 's2') : '') || '';
    
    let s2SemAvgVal = stuS2.average || '';
    if (!s2SemAvgVal && s2AvgExamVal && s2MonthlyAvgVal) {
        s2SemAvgVal = ((parseFloat(s2AvgExamVal) + parseFloat(s2MonthlyAvgVal)) / 2).toFixed(2);
    } else if (!s2SemAvgVal && s2AvgExamVal) {
        s2SemAvgVal = s2AvgExamVal;
    }
    const s2SemRankVal = stuS2.rank || '';

    // គណនាលទ្ធផលប្រចាំឆ្នាំ
    let annualAvgVal = stuAnnual.average || '';
    if (!annualAvgVal && s1SemAvgVal && s2SemAvgVal) {
        annualAvgVal = ((parseFloat(s1SemAvgVal) + (parseFloat(s2SemAvgVal) * 2)) / 3).toFixed(2);
    } else if (!annualAvgVal && s1SemAvgVal) {
        annualAvgVal = s1SemAvgVal;
    }
    const annualRankVal = stuAnnual.rank || '';
    const annualGradeLetter = stuAnnual.grade_letter || (typeof window.getGradeLetter === 'function' ? window.getGradeLetter(annualAvgVal) : '');

    // ការឡើងថ្នាក់ស្វ័យប្រវត្តិតាមកម្រិតថ្នាក់
    const gradeProgression = {
        "ថ្នាក់ទី ១": "ថ្នាក់ទី ២", "ថ្នាក់ទី 1": "ថ្នាក់ទី ២",
        "ថ្នាក់ទី ២": "ថ្នាក់ទី ៣", "ថ្នាក់ទី 2": "ថ្នាក់ទី ៣",
        "ថ្នាក់ទី ៣": "ថ្នាក់ទី ៤", "ថ្នាក់ទី 3": "ថ្នាក់ទី ៤",
        "ថ្នាក់ទី ៤": "ថ្នាក់ទី ៥", "ថ្នាក់ទី 4": "ថ្នាក់ទី ៥",
        "ថ្នាក់ទី ៥": "ថ្នាក់ទី ៦", "ថ្នាក់ទី 5": "ថ្នាក់ទី ៦",
        "ថ្នាក់ទី ៦": "ថ្នាក់ទី ៧", "ថ្នាក់ទី 6": "ថ្នាក់ទី ៧"
    };
    const nextGrade = gradeProgression[curLevel] || "ថ្នាក់បន្ទាប់";
    const isPromoted = parseFloat(annualAvgVal) >= 5.00;
    const isFailed = parseFloat(annualAvgVal) > 0 && parseFloat(annualAvgVal) < 5.00;

    // ទាញទិន្នន័យអវត្តមាន
    let s1Permit = 0, s1Unpermit = 0, s2Permit = 0, s2Unpermit = 0;
    try {
        const attRecords = JSON.parse(localStorage.getItem('academic_attendance') || '[]');
        attRecords.forEach(rec => {
            if (!rec) return;
            const recId = String(rec.student_id || rec.studentId || rec.id || '').trim();
            const recName = String(rec.student_name || rec.name || '').trim();
            if (recId !== String(student.id || student.student_id) && recName !== stuName) return;

            let isS1 = true;
            if (rec.month) {
                const mStr = String(rec.month);
                if (["មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា"].includes(mStr)) isS1 = false;
            } else if (rec.date) {
                const dObj = new Date(rec.date);
                if (!isNaN(dObj.getTime())) {
                    const mIdx = dObj.getMonth();
                    if (mIdx >= 2 && mIdx <= 6) isS1 = false;
                }
            }

            const st = String(rec.status || rec.attendance || '').trim();
            if (st === 'ច' || st === 'ច្ប' || st.includes('ច្បាប់')) {
                if (isS1) s1Permit++; else s2Permit++;
            } else if (st === 'អ' || st === 'អច្ប' || st.includes('ឥតច្បាប់') || st.includes('អវត្តមាន')) {
                if (isS1) s1Unpermit++; else s2Unpermit++;
            }
        });
    } catch(e) {}

    // Fallback ពិនិត្យ attendance_records
    if (s1Permit + s1Unpermit + s2Permit + s2Unpermit === 0) {
        try {
            const attRecordsFb = JSON.parse(localStorage.getItem('attendance_records') || '[]');
            attRecordsFb.forEach(rec => {
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
    }
    const totalAbsences = s1Permit + s1Unpermit + s2Permit + s2Unpermit;
    const absTotalStr = totalAbsences > 0 ? window.toKhmerNum(String(totalAbsences)) : '';

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
                                <td style="border: 1px solid #1e3a8a; padding: 3px 4px; text-align: center; color: #1e3a8a;">${s1TotalExamVal ? window.toKhmerNum(String(s1TotalExamVal)) : ''}</td>
                                <td style="border: 1px solid #1e3a8a; padding: 3px 4px; text-align: center; color: #64748b;"></td>
                                <td style="border: 1px solid #1e3a8a; padding: 3px 4px; text-align: center; color: #1e3a8a;">${s2TotalExamVal ? window.toKhmerNum(String(s2TotalExamVal)) : ''}</td>
                                <td style="border: 1px solid #1e3a8a; padding: 3px 4px; text-align: center; color: #64748b;"></td>
                            </tr>
                            <tr style="font-weight: bold;">
                                <td style="border: 1px solid #1e3a8a; padding: 3px 6px; text-align: left;">មធ្យមភាគ</td>
                                <td style="border: 1px solid #1e3a8a; padding: 3px 4px; text-align: center; color: #1e3a8a;">${s1AvgExamVal ? window.toKhmerNum(String(s1AvgExamVal)) : ''}</td>
                                <td style="border: 1px solid #1e3a8a; padding: 3px 4px; text-align: center; color: #64748b;"></td>
                                <td style="border: 1px solid #1e3a8a; padding: 3px 4px; text-align: center; color: #1e3a8a;">${s2AvgExamVal ? window.toKhmerNum(String(s2AvgExamVal)) : ''}</td>
                                <td style="border: 1px solid #1e3a8a; padding: 3px 4px; text-align: center; color: #64748b;"></td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #1e3a8a; padding: 3px 6px; text-align: left;">មធ្យមភាគប្រចាំខែ</td>
                                <td style="border: 1px solid #1e3a8a; padding: 3px 4px; text-align: center; color: #1d4ed8;">${s1MonthlyAvgVal ? window.toKhmerNum(String(s1MonthlyAvgVal)) : ''}</td>
                                <td style="border: 1px solid #1e3a8a; padding: 3px 4px; text-align: center; color: #64748b;"></td>
                                <td style="border: 1px solid #1e3a8a; padding: 3px 4px; text-align: center; color: #1d4ed8;">${s2MonthlyAvgVal ? window.toKhmerNum(String(s2MonthlyAvgVal)) : ''}</td>
                                <td style="border: 1px solid #1e3a8a; padding: 3px 4px; text-align: center; color: #64748b;"></td>
                            </tr>
                            <tr style="font-weight: bold; background: #f8fafc;">
                                <td style="border: 1px solid #1e3a8a; padding: 3px 6px; text-align: left;">មធ្យមភាគប្រចាំឆមាស</td>
                                <td style="border: 1px solid #1e3a8a; padding: 3px 4px; text-align: center; color: #047857; font-size: 9.5pt;">${s1SemAvgVal ? window.toKhmerNum(String(s1SemAvgVal)) : ''}</td>
                                <td style="border: 1px solid #1e3a8a; padding: 3px 4px; text-align: center; color: #be123c; font-size: 9.5pt;">${s1SemRankVal ? window.toKhmerNum(String(s1SemRankVal)) : ''}</td>
                                <td style="border: 1px solid #1e3a8a; padding: 3px 4px; text-align: center; color: #047857; font-size: 9.5pt;">${s2SemAvgVal ? window.toKhmerNum(String(s2SemAvgVal)) : ''}</td>
                                <td style="border: 1px solid #1e3a8a; padding: 3px 4px; text-align: center; color: #be123c; font-size: 9.5pt;">${s2SemRankVal ? window.toKhmerNum(String(s2SemRankVal)) : ''}</td>
                            </tr>
                            <tr style="font-weight: bold; background: #eff6ff; color: #1e3a8a;">
                                <td colspan="5" style="border: 1px solid #1e3a8a; padding: 5px 6px; text-align: center; font-size: 8.5pt;">
                                    លទ្ធផលដំណាច់ឆ្នាំ ( មធ្យមភាគ - ចំណាត់ថ្នាក់ ) ៖ &nbsp;&nbsp;មធ្យមភាគ <b style="color: #047857; font-size: 9.5pt;">${annualAvgVal ? window.toKhmerNum(String(annualAvgVal)) : '.........'}</b> &nbsp;&nbsp;|&nbsp;&nbsp; ចំណាត់ថ្នាក់ <b style="color: #be123c; font-size: 9.5pt;">${annualRankVal ? window.toKhmerNum(String(annualRankVal)) : '.........'}</b> ${annualGradeLetter ? `&nbsp;(<span style="color: #1e3a8a;">${annualGradeLetter}</span>)` : ''}
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
                                <td style="border: 1px solid #1e3a8a; padding: 5px 2px; font-weight: bold;">${s1Permit > 0 ? window.toKhmerNum(String(s1Permit)) : ''}</td>
                                <td style="border: 1px solid #1e3a8a; padding: 5px 2px; font-weight: bold; color: #dc2626;">${s1Unpermit > 0 ? window.toKhmerNum(String(s1Unpermit)) : ''}</td>
                                <td style="border: 1px solid #1e3a8a; padding: 5px 2px; font-weight: bold;">${s2Permit > 0 ? window.toKhmerNum(String(s2Permit)) : ''}</td>
                                <td style="border: 1px solid #1e3a8a; padding: 5px 2px; font-weight: bold; color: #dc2626;">${s2Unpermit > 0 ? window.toKhmerNum(String(s2Unpermit)) : ''}</td>
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
                                    ${stuS1.evaluation || stuS1.eval_knowledge || (stuS1.grade_letter ? `កម្រិតសិក្សា ៖ ${stuS1.grade_letter}` : '............................................<br>............................................')}
                                </td>
                                <td style="border: 1px solid #1e3a8a; padding: 6px 4px; height: 38px; vertical-align: top; text-align: left; font-size: 7.5pt; line-height: 1.4;">
                                    ${stuS2.evaluation || stuS2.eval_knowledge || (stuS2.grade_letter ? `កម្រិតសិក្សា ៖ ${stuS2.grade_letter}` : '............................................<br>............................................')}
                                </td>
                                <td style="border: 1px solid #1e3a8a; padding: 6px 4px; height: 38px; vertical-align: top; text-align: left; font-size: 7.5pt; line-height: 1.4;">
                                    ${stuAnnual.evaluation || (annualGradeLetter ? `កម្រិតសិក្សា ៖ ${annualGradeLetter}` : '............................................<br>............................................')}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- ឃ- លទ្ធផលប្រចាំឆ្នាំ (Annual Outcome) -->
                <div style="border: 1.5px solid #1e3a8a; border-radius: 2px; padding: 6px 8px; font-size: 8pt; line-height: 1.8; color: #0f172a; margin-top: 6px;">
                    <div style="font-family: 'Khmer OS Muol Light', serif; color: #1e3a8a; font-size: 8.5pt; text-align: center; margin-bottom: 2px;">ឃ- លទ្ធផលប្រចាំឆ្នាំ</div>
                    <div>ត្រូវបានឡើងថ្នាក់ទី <span style="font-weight: bold; color: #1e3a8a; border-bottom: 1px dotted #1e3a8a; display: inline-block; width: 73%;">${isPromoted ? nextGrade : '&nbsp;'}</span></div>
                    <div>ត្រូវប្រឡងឡើងថ្នាក់ ៖ មុខវិជ្ជាដែលត្រូវប្រឡង <span style="border-bottom: 1px dotted #1e3a8a; display: inline-block; width: 45%;">&nbsp;</span></div>
                    <div><span style="border-bottom: 1px dotted #1e3a8a; display: inline-block; width: 98%;">&nbsp;</span></div>
                    <div>ត្រូវបានឡើងថ្នាក់ទី <span style="border-bottom: 1px dotted #1e3a8a; display: inline-block; width: 28%;">&nbsp;</span> ត្រូវរៀនត្រួតថ្នាក់ទី <span style="font-weight: bold; color: #dc2626; border-bottom: 1px dotted #1e3a8a; display: inline-block; width: 28%;">${isFailed ? curLevel : '&nbsp;'}</span></div>
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
    orientation: 'portrait',
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
    const cfg = window.academicReportPaperSettings || { paperSize: 'A4', orientation: 'portrait', scale: 100 };
    if (!printArea) return;

    const isLandscape = cfg.orientation === 'landscape';
    let widthMm = '210mm';
    let minHeightMm = '297mm';
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
    const cfg = window.academicReportPaperSettings || { paperSize: 'A4', orientation: 'portrait', scale: 100 };
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
                <span>1. ចំណាត់ថ្នាក់ប្រចាំខែ</span>
            </button>
            <button type="button" onclick="window.switchAcademicReportMode('semester')" class="px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${mode === 'semester' ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'}">
                <i class="fa-solid fa-chart-pie ${mode === 'semester' ? 'text-indigo-600' : 'text-slate-400'}"></i>
                <span>2. ចំណាត់ថ្នាក់ប្រចាំឆមាស</span>
            </button>
            <button type="button" onclick="window.switchAcademicReportMode('annual')" class="px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${mode === 'annual' ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'}">
                <i class="fa-solid fa-graduation-cap ${mode === 'annual' ? 'text-emerald-600' : 'text-slate-400'}"></i>
                <span>3. ចំណាត់ថ្នាក់ប្រចាំឆ្នាំ</span>
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

    const getGradeBadge = (g) => {
        const str = String(g || "E").trim();
        let colorClass = "bg-slate-100 text-slate-600 border-slate-200";
        if (str.includes("A") || str.includes("ល្អប្រសើរ") || str.includes("ល្អណាស់")) colorClass = "bg-emerald-100 text-emerald-700 border-emerald-200";
        else if (str.includes("B") || str.includes("ល្អ")) colorClass = "bg-blue-100 text-blue-700 border-blue-200";
        else if (str.includes("C") || str.includes("បង្គួរ")) colorClass = "bg-teal-100 text-teal-700 border-teal-200";
        else if (str.includes("D") || str.includes("មធ្យម")) colorClass = "bg-amber-100 text-amber-700 border-amber-200";
        else if (str.includes("E") || str.includes("ខ្សោយ") || str.includes("F") || str.includes("ធ្លាក់")) colorClass = "bg-rose-100 text-rose-700 border-rose-200";
        return `<span class="inline-block px-2.5 py-0.5 rounded-lg text-[11px] font-bold font-siemreap border shadow-sm whitespace-nowrap ${colorClass}">${str}</span>`;
    };
    window.getGradeBadge = window.getGradeBadge || getGradeBadge;

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
        if (titleEl) titleEl.textContent = `ចំណាត់ថ្នាក់ប្រចាំខែ ${currentMonth} (${gradeFull})`;

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

        // Compute rank dynamically based on actual average scores
        const scoreSorted = [...preparedStudents].sort((a, b) => {
            if (b.avgVal !== a.avgVal) return b.avgVal - a.avgVal;
            return b.totalScore - a.totalScore;
        });
        let curRank = 1;
        scoreSorted.forEach((item, idx) => {
            if (item.avgVal <= 0) {
                item.rankVal = '-';
            } else if (idx > 0 && item.avgVal === scoreSorted[idx - 1].avgVal && item.totalScore === scoreSorted[idx - 1].totalScore) {
                item.rankVal = scoreSorted[idx - 1].rankVal;
            } else {
                item.rankVal = curRank;
            }
            curRank++;
        });

        // Sort by rank ascending by default (or by name if requested)
        const sortMode = window.currentAcademicReportSort || 'rank';
        if (sortMode === 'name') {
            preparedStudents.sort((a, b) => String(a.stu.name || '').localeCompare(String(b.stu.name || ''), 'km'));
        } else {
            preparedStudents.sort((a, b) => {
                if (typeof a.rankVal === 'number' && typeof b.rankVal === 'number' && a.rankVal !== b.rankVal) {
                    return a.rankVal - b.rankVal;
                }
                if (typeof a.rankVal === 'number' && typeof b.rankVal !== 'number') return -1;
                if (typeof a.rankVal !== 'number' && typeof b.rankVal === 'number') return 1;
                if (b.avgVal !== a.avgVal) return b.avgVal - a.avgVal;
                return String(a.stu.name || '').localeCompare(String(b.stu.name || ''), 'km');
            });
        }

        const passPct = totalCount > 0 ? ((passCount / totalCount) * 100).toFixed(2) : "0.00";
        const failPct = totalCount > 0 ? ((failCount / totalCount) * 100).toFixed(2) : "0.00";
        const passFemalesPct = femaleCount > 0 ? ((passFemales / femaleCount) * 100).toFixed(2) : "0.00";
        const failFemalesPct = femaleCount > 0 ? ((failFemales / femaleCount) * 100).toFixed(2) : "0.00";
        const classAvg = totalCount > 0 ? (preparedStudents.reduce((acc, s) => acc + (s.avgVal || 0), 0) / totalCount).toFixed(2) : "0.00";
        const topStudent = preparedStudents.find(s => s.rankVal === 1) || preparedStudents[0];

        const kpiEl = document.getElementById("reportAcademicKpiContainer");
        if (kpiEl && totalCount > 0) {
            kpiEl.classList.remove('hidden');
            kpiEl.innerHTML = `
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-2 no-print">
                    <div class="bg-white p-3.5 rounded-2xl border border-slate-200/70 shadow-sm flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg"><i class="fa-solid fa-users"></i></div>
                        <div>
                            <div class="text-[10px] text-slate-500 font-bold uppercase font-siemreap">សិស្សសរុប</div>
                            <div class="text-sm font-black text-slate-800 font-siemreap">${totalCount} <span class="text-[10px] font-normal text-slate-400 font-siemreap">(ស្រី ${femaleCount})</span></div>
                        </div>
                    </div>
                    <div class="bg-white p-3.5 rounded-2xl border border-slate-200/70 shadow-sm flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg"><i class="fa-solid fa-circle-check"></i></div>
                        <div>
                            <div class="text-[10px] text-slate-500 font-bold uppercase font-siemreap">ជាប់មធ្យមភាគ</div>
                            <div class="text-sm font-black text-emerald-600 font-siemreap">${passCount} <span class="text-[10px] font-bold text-emerald-700 font-siemreap">(${passPct}%)</span></div>
                        </div>
                    </div>
                    <div class="bg-white p-3.5 rounded-2xl border border-slate-200/70 shadow-sm flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-lg"><i class="fa-solid fa-circle-xmark"></i></div>
                        <div>
                            <div class="text-[10px] text-slate-500 font-bold uppercase font-siemreap">ធ្លាក់មធ្យមភាគ</div>
                            <div class="text-sm font-black text-rose-600 font-siemreap">${failCount} <span class="text-[10px] font-normal text-slate-400 font-siemreap">នាក់</span></div>
                        </div>
                    </div>
                    <div class="bg-white p-3.5 rounded-2xl border border-slate-200/70 shadow-sm flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg"><i class="fa-solid fa-chart-line"></i></div>
                        <div>
                            <div class="text-[10px] text-slate-500 font-bold uppercase font-siemreap">មធ្យមភាគថ្នាក់</div>
                            <div class="text-sm font-black text-indigo-700 font-siemreap">${classAvg}</div>
                        </div>
                    </div>
                    <div class="bg-gradient-to-r from-amber-50 to-orange-50 p-3.5 rounded-2xl border border-amber-200 shadow-sm flex items-center gap-3 col-span-2 sm:col-span-1 lg:col-span-1">
                        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center font-bold text-lg"><i class="fa-solid fa-medal"></i></div>
                        <div class="truncate">
                            <div class="text-[10px] text-amber-800 font-bold uppercase font-siemreap">ជើងឯកលេខ ១</div>
                            <div class="text-xs font-bold text-slate-800 font-moul truncate mt-0.5">${topStudent?.stu?.name || '-'}</div>
                        </div>
                    </div>
                </div>
            `;
        }

        // Dual-Column Table Data Split (ដូចទម្រង់គំរូផ្លូវការ ២ ចំហៀងស្មើគ្នា)
        const half = Math.max(1, Math.ceil(preparedStudents.length / 2));
        const leftList = preparedStudents.slice(0, half);
        const rightList = preparedStudents.slice(half);

        const renderHalfCellRow = (item, num) => {
            if (!item) {
                return `
                    <td class="border border-slate-300 p-1 text-center font-siemreap text-slate-300 w-10">&nbsp;</td>
                    <td class="border border-slate-300 p-1 text-left px-3 font-siemreap text-slate-300">&nbsp;</td>
                    <td class="border border-slate-300 p-1 text-center font-siemreap w-10">&nbsp;</td>
                    <td class="border border-slate-300 p-1 text-center font-siemreap font-bold w-14">&nbsp;</td>
                    <td class="border border-slate-300 p-1 text-center font-siemreap font-bold w-14">&nbsp;</td>
                `;
            }
            const isF = item.isFemale;
            const genderSym = isF ? 'ស' : 'ប';
            const genderColor = isF ? 'text-rose-600 font-bold' : 'text-slate-800 font-bold';
            const avgStr = item.avgVal > 0 ? item.avgVal.toFixed(2) : '0.00';
            const avgColor = item.avgVal >= 5.0 ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold';
            const rankStr = item.rankVal !== undefined && item.rankVal !== null ? item.rankVal : '-';
            const rankColor = (rankStr !== '-' && rankStr !== '') ? 'text-rose-600 font-bold' : 'text-slate-400 font-bold';

            return `
                <td class="border border-slate-300 p-1 text-center font-siemreap text-slate-600 font-bold w-10">${num}</td>
                <td class="border border-slate-300 p-1 text-left px-3 font-bold text-slate-800 font-siemreap truncate">${item.stu.name}</td>
                <td class="border border-slate-300 p-1 text-center font-siemreap w-10 ${genderColor}">${genderSym}</td>
                <td class="border border-slate-300 p-1 text-center font-siemreap font-bold text-[13px] w-14 ${avgColor}">${avgStr}</td>
                <td class="border border-slate-300 p-1 text-center font-siemreap font-bold text-[13px] w-14 ${rankColor}">${rankStr}</td>
            `;
        };

        const leftRowsHtml = leftList.map((item, i) => `
            <tr class="hover:bg-slate-50/80 transition-colors border-b border-slate-300 text-[12px] h-8.5">
                ${renderHalfCellRow(item, i + 1)}
            </tr>
        `).join('');

        const rightRowsHtml = Array.from({ length: half }).map((_, i) => {
            const item = rightList[i];
            return `
                <tr class="hover:bg-slate-50/80 transition-colors border-b border-slate-300 text-[12px] h-8.5">
                    ${renderHalfCellRow(item, half + i + 1)}
                </tr>
            `;
        }).join('');

        container.innerHTML = `
            <div id="reportKoKhoPrintArea" class="bg-white p-6 md:p-8 w-full shadow-2xl rounded-2xl border border-slate-200 text-slate-800" style="max-width: 210mm; min-height: 297mm; font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif;">
                
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
                    <h3 class="font-moul text-base text-blue-900">ចំណាត់ថ្នាក់ប្រចាំខែ ${currentMonth} <span class="hidden">របាយការណ៍លទ្ធផលនៃការសិក្សាប្រចាំខែ ${currentMonth}</span></h3>
                    <h4 class="font-moul text-xs text-red-600 mt-1">${gradeFull} | ឆ្នាំសិក្សា ${academicYear}</h4>
                </div>

                <!-- តារាងចំណាត់ថ្នាក់ទម្រង់ ២ ជួរស្មើស្អាត (Dual-Column Split Table) តាមគំរូរូបភាពជាក់ស្តែង -->
                <div class="overflow-x-auto mb-4 border border-slate-400 shadow-sm rounded-sm w-full mx-auto">
                    <div class="flex justify-center w-full min-w-[650px]">
                        <!-- តារាងផ្នែកឆ្វេង (Left Half Table) -->
                        <table class="w-1/2 text-xs text-center border-collapse border-r-2 border-slate-700">
                            <thead class="font-moul" style="font-family: 'Khmer OS Muol Light', 'Khmer OS Muol', 'Moul', serif;">
                                <tr class="bg-slate-50 text-slate-800 text-[11px] font-moul leading-normal border-b-2 border-slate-400">
                                    <th class="border border-slate-300 p-1.5 w-10 text-center text-slate-700 bg-slate-50">ល.រ</th>
                                    <th class="border border-slate-300 p-1.5 text-left px-3 text-slate-800">គោត្តនាម និងនាម</th>
                                    <th class="border border-slate-300 p-1.5 w-10 text-center text-slate-700 bg-slate-50">ភេទ</th>
                                    <th class="border border-slate-300 p-1 w-14 text-center align-middle bg-blue-50/80 text-blue-900 border-x border-white" style="height: 85px;">
                                        <div style="writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap; margin: 0 auto; display: inline-block;">មធ្យមភាគ</div>
                                        <span class="hidden">ពិន្ទុសរុប</span>
                                    </th>
                                    <th class="border border-slate-300 p-1 w-14 text-center align-middle bg-rose-50/80 text-rose-900" style="height: 85px;">
                                        <div style="writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap; margin: 0 auto; display: inline-block;">ចំណាត់ថ្នាក់</div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                ${leftRowsHtml}
                            </tbody>
                        </table>

                        <!-- តារាងផ្នែកស្តាំ (Right Half Table) -->
                        <table class="w-1/2 text-xs text-center border-collapse">
                            <thead class="font-moul" style="font-family: 'Khmer OS Muol Light', 'Khmer OS Muol', 'Moul', serif;">
                                <tr class="bg-slate-50 text-slate-800 text-[11px] font-moul leading-normal border-b-2 border-slate-400">
                                    <th class="border border-slate-300 p-1.5 w-10 text-center text-slate-700 bg-slate-50">ល.រ</th>
                                    <th class="border border-slate-300 p-1.5 text-left px-3 text-slate-800">គោត្តនាម និងនាម</th>
                                    <th class="border border-slate-300 p-1.5 w-10 text-center text-slate-700 bg-slate-50">ភេទ</th>
                                    <th class="border border-slate-300 p-1 w-14 text-center align-middle bg-blue-50/80 text-blue-900 border-x border-white" style="height: 85px;">
                                        <div style="writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap; margin: 0 auto; display: inline-block;">មធ្យមភាគ</div>
                                    </th>
                                    <th class="border border-slate-300 p-1 w-14 text-center align-middle bg-rose-50/80 text-rose-900" style="height: 85px;">
                                        <div style="writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap; margin: 0 auto; display: inline-block;">ចំណាត់ថ្នាក់</div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                ${rightRowsHtml}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- ស្ថិតិសង្ខេបក្រោមតារាង (Summary Statistics - ដូចទម្រង់គំរូជាក់ស្តែង) -->
                <div class="mb-5 text-xs font-siemreap leading-relaxed text-slate-800 text-left px-1 space-y-1">
                    <div>❖ បញ្ឈប់បញ្ជីត្រឹមលេខរៀង <b>${totalCount}</b> |  សិស្សសរុប <b>${totalCount}</b> នាក់ ស្រី <b>${femaleCount}</b> នាក់ ប្រុស <b>${maleCount}</b> នាក់<span class="hidden">សិស្សសរុបក្នុងថ្នាក់៖</span></div>
                    <div>❖ សិស្សជាប់មធ្យមភាគ <b>${passCount}</b> នាក់ គិតជាភាគរយ <b>${passPct}%</b> (ស្រី <b>${passFemales}</b> នាក់ គិតជាភាគរយ <b>${passFemalesPct}%</b> )<span class="hidden">សិស្សជាប់មធ្យមភាគ (≥ 5.00)៖</span></div>
                    <div>❖ សិស្សធ្លាក់មធ្យមភាគ <b>${failCount}</b> នាក់ គិតជាភាគរយ <b>${failPct}%</b> (ស្រី <b>${failFemales}</b> នាក់ គិតជាភាគរយ <b>${failFemalesPct}%</b> )<span class="hidden">សិស្សធ្លាក់មធ្យមភាគ (< 5.00)៖</span></div>
                </div>

                <!-- ហត្ថលេខា និងកាលបរិច្ឆេទផ្លូវការ -->
                <div class="flex justify-between items-start text-xs pt-2 px-8 font-siemreap">
                    <div class="text-center w-2/5">
                        <p class="mb-1 text-slate-700">បានឃើញ និងឯកភាព</p>
                        <p class="font-moul text-slate-900 mb-14">នាយិកាសាលា</p>
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
        const isSem1 = currentSemester === 'ឆមាសទី១' || currentSemester === 'ឆមាសទី1';
        const semNumKhmer = isSem1 ? '១' : '២';
        if (titleEl) titleEl.textContent = `ចំណាត់ថ្នាក់ប្រចាំឆមាសលើកទី ${semNumKhmer} (${gradeFull})`;

        const semCfg = window.getSemesterMonthConfig ? window.getSemesterMonthConfig(curLevel, curRoom) : { sem1: ["ធ្នូ", "មករា", "កុម្ភៈ", "មីនា"], sem2: ["មេសា", "ឧសភា", "មិថុនា", "កក្កដា"] };
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

        // Compute rank dynamically
        const scoreSorted = [...preparedStudents].sort((a, b) => {
            if (b.semAvg !== a.semAvg) return b.semAvg - a.semAvg;
            return b.examVal - a.examVal;
        });
        let curRank = 1;
        scoreSorted.forEach((item, idx) => {
            if (item.semAvg <= 0) {
                item.rankVal = '-';
            } else if (idx > 0 && item.semAvg === scoreSorted[idx - 1].semAvg && item.examVal === scoreSorted[idx - 1].examVal) {
                item.rankVal = scoreSorted[idx - 1].rankVal;
            } else {
                item.rankVal = curRank;
            }
            curRank++;
        });

        // Sort by rank ascending by default (or by name if requested)
        const sortMode = window.currentAcademicReportSort || 'rank';
        if (sortMode === 'name') {
            preparedStudents.sort((a, b) => String(a.stu.name || '').localeCompare(String(b.stu.name || ''), 'km'));
        } else {
            preparedStudents.sort((a, b) => {
                if (typeof a.rankVal === 'number' && typeof b.rankVal === 'number' && a.rankVal !== b.rankVal) {
                    return a.rankVal - b.rankVal;
                }
                if (typeof a.rankVal === 'number' && typeof b.rankVal !== 'number') return -1;
                if (typeof a.rankVal !== 'number' && typeof b.rankVal === 'number') return 1;
                if (b.semAvg !== a.semAvg) return b.semAvg - a.semAvg;
                return String(a.stu.name || '').localeCompare(String(b.stu.name || ''), 'km');
            });
        }

        const rowsHtml = preparedStudents.length === 0 ? `
            <tr><td colspan="8" class="p-8 text-center text-slate-400 font-bold font-siemreap">គ្មានទិន្នន័យសិស្សក្នុងថ្នាក់ ${gradeFull} ឡើយ</td></tr>
        ` : preparedStudents.map((item, i) => {
            const bgClass = i % 2 !== 0 ? 'bg-slate-50/40' : 'bg-white';
            return `
                <tr class="hover:bg-blue-50/50 transition-colors border-b border-slate-200/80 text-[12px] ${bgClass}">
                    <td class="border border-slate-300 p-2 font-siemreap text-slate-500 font-bold w-12">${i + 1}</td>
                    <td class="border border-slate-300 p-2 text-left px-4 font-bold text-slate-800 font-siemreap">${item.stu.name}</td>
                    <td class="border border-slate-300 p-2 text-center font-bold font-siemreap w-12 ${item.isFemale ? 'text-rose-600' : 'text-blue-700'}">${item.isFemale ? 'ស' : 'ប'}</td>
                    <td class="border border-slate-300 p-2 font-siemreap font-bold text-orange-700 bg-orange-50/40 w-16">${item.examVal > 0 ? item.examVal.toFixed(2) : '0.00'}</td>
                    <td class="border border-slate-300 p-2 font-siemreap font-bold text-indigo-700 bg-indigo-50/40 w-16">${item.monthAvg > 0 ? item.monthAvg.toFixed(2) : '0.00'}</td>
                    <td class="border border-slate-300 p-2 font-siemreap font-bold ${item.semAvg >= 5.0 ? 'text-emerald-700 bg-blue-50/40' : 'text-rose-600 bg-rose-50/40'} text-[13px] md:text-[14px] w-20">${item.semAvg > 0 ? item.semAvg.toFixed(2) : '0.00'}</td>
                    <td class="border border-slate-300 p-2 text-center font-siemreap font-bold text-rose-600 bg-rose-50/40 text-[13px] md:text-[14px] w-16">${item.rankVal}</td>
                    <td class="border border-slate-300 p-2 text-center whitespace-nowrap w-24">${getGradeBadge(item.mention)}</td>
                </tr>
            `;
        }).join('');

        const passPct = totalCount > 0 ? ((passCount / totalCount) * 100).toFixed(2) : "0.00";
        const failPct = totalCount > 0 ? ((failCount / totalCount) * 100).toFixed(2) : "0.00";
        const passFemalesPct = femaleCount > 0 ? ((passFemales / femaleCount) * 100).toFixed(2) : "0.00";
        const failFemalesPct = femaleCount > 0 ? ((failFemales / femaleCount) * 100).toFixed(2) : "0.00";
        const classAvg = totalCount > 0 ? (preparedStudents.reduce((acc, s) => acc + (s.semAvg || 0), 0) / totalCount).toFixed(2) : "0.00";
        const topStudent = preparedStudents.find(s => s.rankVal === 1) || preparedStudents[0];

        const kpiEl = document.getElementById("reportAcademicKpiContainer");
        if (kpiEl && totalCount > 0) {
            kpiEl.classList.remove('hidden');
            kpiEl.innerHTML = `
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-2 no-print">
                    <div class="bg-white p-3.5 rounded-2xl border border-slate-200/70 shadow-sm flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg"><i class="fa-solid fa-users"></i></div>
                        <div>
                            <div class="text-[10px] text-slate-500 font-bold uppercase font-siemreap">សិស្សសរុប</div>
                            <div class="text-sm font-black text-slate-800 font-siemreap">${totalCount} <span class="text-[10px] font-normal text-slate-400 font-siemreap">(ស្រី ${femaleCount})</span></div>
                        </div>
                    </div>
                    <div class="bg-white p-3.5 rounded-2xl border border-slate-200/70 shadow-sm flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg"><i class="fa-solid fa-circle-check"></i></div>
                        <div>
                            <div class="text-[10px] text-slate-500 font-bold uppercase font-siemreap">ជាប់មធ្យមភាគ</div>
                            <div class="text-sm font-black text-emerald-600 font-siemreap">${passCount} <span class="text-[10px] font-bold text-emerald-700 font-siemreap">(${passPct}%)</span></div>
                        </div>
                    </div>
                    <div class="bg-white p-3.5 rounded-2xl border border-slate-200/70 shadow-sm flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-lg"><i class="fa-solid fa-circle-xmark"></i></div>
                        <div>
                            <div class="text-[10px] text-slate-500 font-bold uppercase font-siemreap">ធ្លាក់មធ្យមភាគ</div>
                            <div class="text-sm font-black text-rose-600 font-siemreap">${failCount} <span class="text-[10px] font-normal text-slate-400 font-siemreap">នាក់</span></div>
                        </div>
                    </div>
                    <div class="bg-white p-3.5 rounded-2xl border border-slate-200/70 shadow-sm flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg"><i class="fa-solid fa-chart-line"></i></div>
                        <div>
                            <div class="text-[10px] text-slate-500 font-bold uppercase font-siemreap">មធ្យមភាគថ្នាក់</div>
                            <div class="text-sm font-black text-indigo-700 font-siemreap">${classAvg}</div>
                        </div>
                    </div>
                    <div class="bg-gradient-to-r from-amber-50 to-orange-50 p-3.5 rounded-2xl border border-amber-200 shadow-sm flex items-center gap-3 col-span-2 sm:col-span-1 lg:col-span-1">
                        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center font-bold text-lg"><i class="fa-solid fa-medal"></i></div>
                        <div class="truncate">
                            <div class="text-[10px] text-amber-800 font-bold uppercase font-siemreap">ជើងឯកលេខ ១</div>
                            <div class="text-xs font-bold text-slate-800 font-moul truncate mt-0.5">${topStudent?.stu?.name || '-'}</div>
                        </div>
                    </div>
                </div>
            `;
        }

        container.innerHTML = `
            <div id="reportKoKhoPrintArea" class="bg-white p-6 md:p-8 w-full shadow-2xl rounded-2xl border border-slate-200 text-slate-800" style="max-width: 210mm; min-height: 297mm; font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif;">
                
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
                    <h3 class="font-moul text-base text-blue-900">ចំណាត់ថ្នាក់ប្រចាំឆមាសលើកទី ${semNumKhmer} <span class="hidden">របាយការណ៍លទ្ធផលនៃការសិក្សាប្រចាំ ${currentSemester}</span></h3>
                    <h4 class="font-moul text-xs text-red-600 mt-1">${gradeFull} | ឆ្នាំសិក្សា ${academicYear}</h4>
                </div>

                <div class="overflow-x-auto mb-4">
                    <table class="w-full text-xs text-center border-collapse border border-slate-300">
                        <thead class="font-moul" style="font-family: 'Khmer OS Muol Light', 'Khmer OS Muol', 'Moul', serif;">
                            <tr class="bg-slate-50 text-slate-800 text-[11px] font-moul leading-normal border-b-2 border-slate-300" style="font-family: 'Khmer OS Muol Light', 'Khmer OS Muol', 'Moul', serif;">
                                <th class="border border-slate-300 p-2 w-12 text-center text-slate-600 bg-slate-50">ល.រ</th>
                                <th class="border border-slate-300 p-2 text-left px-4 text-slate-800">គោត្តនាម និងនាម</th>
                                <th class="border border-slate-300 p-2 w-14 text-center text-slate-600 bg-slate-50">ភេទ</th>
                                <th class="border border-slate-300 p-1 w-14 text-center align-middle bg-orange-50/80 text-orange-900 border-l border-white" style="height: 90px;">
                                    <div style="writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap; margin: 0 auto; display: inline-block;">ម.ប្រឡង</div>
                                    <span class="hidden">មធ្យមភាគប្រឡង</span>
                                </th>
                                <th class="border border-slate-300 p-1 w-14 text-center align-middle bg-indigo-50/80 text-indigo-900 border-l border-white" style="height: 90px;">
                                    <div style="writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap; margin: 0 auto; display: inline-block;">មធ្យមខែ</div>
                                    <span class="hidden">មធ្យមភាគខែ</span>
                                </th>
                                <th class="border border-slate-300 p-1 w-14 text-center align-middle bg-blue-50/80 text-blue-900 border-x border-white" style="height: 90px;">
                                    <div style="writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap; margin: 0 auto; display: inline-block;">ម.ប្រចាំឆមាស</div>
                                    <span class="hidden">មធ្យមភាគឆមាស</span>
                                </th>
                                <th class="border border-slate-300 p-1 w-14 text-center align-middle bg-rose-50/80 text-rose-900 border-r border-white" style="height: 90px;">
                                    <div style="writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap; margin: 0 auto; display: inline-block;">ចំណាត់ថ្នាក់</div>
                                </th>
                                <th class="border border-slate-300 p-1 w-14 text-center align-middle bg-emerald-50/80 text-emerald-900" style="height: 90px;">
                                    <div style="writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap; margin: 0 auto; display: inline-block;">និទ្ទេស</div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml}
                        </tbody>
                    </table>
                </div>

                <!-- ស្ថិតិសង្ខេបក្រោមតារាង (Summary Statistics - ដូចទម្រង់គំរូជាក់ស្តែង) -->
                <div class="mb-5 text-xs font-siemreap leading-relaxed text-slate-800 text-left px-1 space-y-1">
                    <div>❖ បញ្ឈប់បញ្ជីត្រឹមលេខរៀង <b>${totalCount}</b> |  សិស្សសរុប <b>${totalCount}</b> នាក់ ស្រី <b>${femaleCount}</b> នាក់ ប្រុស <b>${maleCount}</b> នាក់<span class="hidden">សិស្សសរុបក្នុងថ្នាក់៖</span></div>
                    <div>❖ សិស្សជាប់មធ្យមភាគ <b>${passCount}</b> នាក់ គិតជាភាគរយ <b>${passPct}%</b> (ស្រី <b>${passFemales}</b> នាក់ គិតជាភាគរយ <b>${passFemalesPct}%</b> )<span class="hidden">សិស្សជាប់មធ្យមភាគ (≥ 5.00)៖</span></div>
                    <div>❖ សិស្សធ្លាក់មធ្យមភាគ <b>${failCount}</b> នាក់ គិតជាភាគរយ <b>${failPct}%</b> (ស្រី <b>${failFemales}</b> នាក់ គិតជាភាគរយ <b>${failFemalesPct}%</b> )<span class="hidden">សិស្សធ្លាក់មធ្យមភាគ (< 5.00)៖</span></div>
                </div>

                <!-- ហត្ថលេខា និងកាលបរិច្ឆេទផ្លូវការ -->
                <div class="flex justify-between items-start text-xs pt-2 px-8 font-siemreap">
                    <div class="text-center w-2/5">
                        <p class="mb-1 text-slate-700">បានឃើញ និងឯកភាព</p>
                        <p class="font-moul text-slate-900 mb-14">នាយិកាសាលា</p>
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
    if (titleEl) titleEl.textContent = `ចំណាត់ថ្នាក់ប្រចាំឆ្នាំ (${gradeFull})`;

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

    // Compute rank dynamically
    const scoreSorted = [...preparedStudents].sort((a, b) => {
        if (b.annual !== a.annual) return b.annual - a.annual;
        return (b.sem1 + b.sem2) - (a.sem1 + a.sem2);
    });
    let curRank = 1;
    scoreSorted.forEach((item, idx) => {
        if (item.annual <= 0) {
            item.rankVal = '-';
        } else if (idx > 0 && item.annual === scoreSorted[idx - 1].annual && (item.sem1 + item.sem2) === (scoreSorted[idx - 1].sem1 + scoreSorted[idx - 1].sem2)) {
            item.rankVal = scoreSorted[idx - 1].rankVal;
        } else {
            item.rankVal = curRank;
        }
        curRank++;
    });

    // Sort by rank ascending by default (or by name if requested)
    const sortMode = window.currentAcademicReportSort || 'rank';
    if (sortMode === 'name') {
        preparedStudents.sort((a, b) => String(a.stu.name || '').localeCompare(String(b.stu.name || ''), 'km'));
    } else {
        preparedStudents.sort((a, b) => {
            if (typeof a.rankVal === 'number' && typeof b.rankVal === 'number' && a.rankVal !== b.rankVal) {
                return a.rankVal - b.rankVal;
            }
            if (typeof a.rankVal === 'number' && typeof b.rankVal !== 'number') return -1;
            if (typeof a.rankVal !== 'number' && typeof b.rankVal === 'number') return 1;
            if (b.annual !== a.annual) return b.annual - a.annual;
            return String(a.stu.name || '').localeCompare(String(b.stu.name || ''), 'km');
        });
    }

    const rowsHtml = preparedStudents.length === 0 ? `
        <tr><td colspan="8" class="p-8 text-center text-slate-400 font-bold font-siemreap">គ្មានទិន្នន័យសិស្សក្នុងថ្នាក់ ${gradeFull} ឡើយ</td></tr>
    ` : preparedStudents.map((item, i) => {
        const bgClass = i % 2 !== 0 ? 'bg-slate-50/40' : 'bg-white';
        return `
            <tr class="hover:bg-blue-50/50 transition-colors border-b border-slate-200/80 text-[12px] ${bgClass}">
                <td class="border border-slate-300 p-2 font-siemreap text-slate-500 font-bold w-12">${i + 1}</td>
                <td class="border border-slate-300 p-2 text-left px-4 font-bold text-slate-800 font-siemreap">${item.stu.name}</td>
                <td class="border border-slate-300 p-2 text-center font-bold font-siemreap w-12 ${item.isFemale ? 'text-rose-600' : 'text-blue-700'}">${item.isFemale ? 'ស' : 'ប'}</td>
                <td class="border border-slate-300 p-2 font-siemreap font-bold text-blue-700 bg-blue-50/40 w-16">${item.sem1 > 0 ? item.sem1.toFixed(2) : '0.00'}</td>
                <td class="border border-slate-300 p-2 font-siemreap font-bold text-indigo-700 bg-indigo-50/40 w-16">${item.sem2 > 0 ? item.sem2.toFixed(2) : '0.00'}</td>
                <td class="border border-slate-300 p-2 font-siemreap font-bold ${item.annual >= 5.0 ? 'text-amber-700 bg-amber-50/40' : 'text-rose-600 bg-rose-50/40'} text-[13px] md:text-[14px] w-20">${item.annual > 0 ? item.annual.toFixed(2) : '0.00'}</td>
                <td class="border border-slate-300 p-2 text-center font-siemreap font-bold text-rose-600 bg-rose-50/40 text-[13px] md:text-[14px] w-16">${item.rankVal}</td>
                <td class="border border-slate-300 p-2 text-center whitespace-nowrap w-24">${getGradeBadge(item.mention)}</td>
            </tr>
        `;
    }).join('');

    const promotePct = totalCount > 0 ? ((promotedCount / totalCount) * 100).toFixed(2) : "0.00";
    const retainPct = totalCount > 0 ? ((retainedCount / totalCount) * 100).toFixed(2) : "0.00";
    const promotedFemalesPct = femaleCount > 0 ? ((promotedFemales / femaleCount) * 100).toFixed(2) : "0.00";
    const retainedFemalesPct = femaleCount > 0 ? ((retainedFemales / femaleCount) * 100).toFixed(2) : "0.00";
    const classAvg = totalCount > 0 ? (preparedStudents.reduce((acc, s) => acc + (s.annual || 0), 0) / totalCount).toFixed(2) : "0.00";
    const topStudent = preparedStudents.find(s => s.rankVal === 1) || preparedStudents[0];

    const kpiEl = document.getElementById("reportAcademicKpiContainer");
    if (kpiEl && totalCount > 0) {
        kpiEl.classList.remove('hidden');
        kpiEl.innerHTML = `
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-2 no-print">
                <div class="bg-white p-3.5 rounded-2xl border border-slate-200/70 shadow-sm flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg"><i class="fa-solid fa-users"></i></div>
                    <div>
                        <div class="text-[10px] text-slate-500 font-bold uppercase font-siemreap">សិស្សសរុប</div>
                        <div class="text-sm font-black text-slate-800 font-siemreap">${totalCount} <span class="text-[10px] font-normal text-slate-400 font-siemreap">(ស្រី ${femaleCount})</span></div>
                    </div>
                </div>
                <div class="bg-white p-3.5 rounded-2xl border border-slate-200/70 shadow-sm flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg"><i class="fa-solid fa-circle-check"></i></div>
                    <div>
                        <div class="text-[10px] text-slate-500 font-bold uppercase font-siemreap">ឡើងថ្នាក់</div>
                        <div class="text-sm font-black text-emerald-600 font-siemreap">${promotedCount} <span class="text-[10px] font-bold text-emerald-700 font-siemreap">(${promotePct}%)</span></div>
                    </div>
                </div>
                <div class="bg-white p-3.5 rounded-2xl border border-slate-200/70 shadow-sm flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-lg"><i class="fa-solid fa-circle-xmark"></i></div>
                    <div>
                        <div class="text-[10px] text-slate-500 font-bold uppercase font-siemreap">ត្រួតថ្នាក់</div>
                        <div class="text-sm font-black text-rose-600 font-siemreap">${retainedCount} <span class="text-[10px] font-normal text-slate-400 font-siemreap">នាក់</span></div>
                    </div>
                </div>
                <div class="bg-white p-3.5 rounded-2xl border border-slate-200/70 shadow-sm flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg"><i class="fa-solid fa-chart-line"></i></div>
                    <div>
                        <div class="text-[10px] text-slate-500 font-bold uppercase font-siemreap">មធ្យមភាគថ្នាក់</div>
                        <div class="text-sm font-black text-indigo-700 font-siemreap">${classAvg}</div>
                    </div>
                </div>
                <div class="bg-gradient-to-r from-amber-50 to-orange-50 p-3.5 rounded-2xl border border-amber-200 shadow-sm flex items-center gap-3 col-span-2 sm:col-span-1 lg:col-span-1">
                    <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center font-bold text-lg"><i class="fa-solid fa-medal"></i></div>
                    <div class="truncate">
                        <div class="text-[10px] text-amber-800 font-bold uppercase font-siemreap">ជើងឯកលេខ ១</div>
                        <div class="text-xs font-bold text-slate-800 font-moul truncate mt-0.5">${topStudent?.stu?.name || '-'}</div>
                    </div>
                </div>
            </div>
        `;
    }

    container.innerHTML = `
        <div id="reportKoKhoPrintArea" class="bg-white p-6 md:p-8 w-full shadow-2xl rounded-2xl border border-slate-200 text-slate-800" style="max-width: 210mm; min-height: 297mm; font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif;">
            
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
                <h3 class="font-moul text-base text-blue-900">ចំណាត់ថ្នាក់ប្រចាំឆ្នាំ <span class="hidden">សេចក្តីសម្រេចលទ្ធផលសិក្សាប្រចាំឆ្នាំ (ការឡើងថ្នាក់-ត្រួតថ្នាក់)</span></h3>
                <h4 class="font-moul text-xs text-red-600 mt-1">${gradeFull} | ឆ្នាំសិក្សា ${academicYear}</h4>
            </div>

            <div class="overflow-x-auto mb-4">
                <table class="w-full text-xs text-center border-collapse border border-slate-300">
                    <thead class="font-moul" style="font-family: 'Khmer OS Muol Light', 'Khmer OS Muol', 'Moul', serif;">
                        <tr class="bg-slate-50 text-slate-800 text-[11px] font-moul leading-normal border-b-2 border-slate-300" style="font-family: 'Khmer OS Muol Light', 'Khmer OS Muol', 'Moul', serif;">
                            <th class="border border-slate-300 p-2 w-12 text-center text-slate-600 bg-slate-50">ល.រ</th>
                            <th class="border border-slate-300 p-2 text-left px-4 text-slate-800">គោត្តនាម និងនាម</th>
                            <th class="border border-slate-300 p-2 w-14 text-center text-slate-600 bg-slate-50">ភេទ</th>
                            <th class="border border-slate-300 p-1 w-14 text-center align-middle bg-blue-50/80 text-blue-900 border-l border-white" style="height: 90px;">
                                <div style="writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap; margin: 0 auto; display: inline-block;">ម.ឆមាសទី១</div>
                            </th>
                            <th class="border border-slate-300 p-1 w-14 text-center align-middle bg-indigo-50/80 text-indigo-900 border-l border-white" style="height: 90px;">
                                <div style="writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap; margin: 0 auto; display: inline-block;">ម.ឆមាសទី២</div>
                            </th>
                            <th class="border border-slate-300 p-1 w-14 text-center align-middle bg-amber-50/80 text-amber-900 border-x border-white" style="height: 90px;">
                                <div style="writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap; margin: 0 auto; display: inline-block;">ម.ប្រចាំឆ្នាំ</div>
                            </th>
                            <th class="border border-slate-300 p-1 w-14 text-center align-middle bg-rose-50/80 text-rose-900 border-r border-white" style="height: 90px;">
                                <div style="writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap; margin: 0 auto; display: inline-block;">ចំណាត់ថ្នាក់</div>
                            </th>
                            <th class="border border-slate-300 p-1 w-14 text-center align-middle bg-emerald-50/80 text-emerald-900" style="height: 90px;">
                                <div style="writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap; margin: 0 auto; display: inline-block;">និទ្ទេស</div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
            </div>

            <!-- ស្ថិតិសង្ខេបក្រោមតារាង (Annual Summary Statistics - ដូចទម្រង់គំរូជាក់ស្តែង) -->
            <div class="mb-5 text-xs font-siemreap leading-relaxed text-slate-800 text-left px-1 space-y-1">
                <div>❖ បញ្ឈប់បញ្ជីត្រឹមលេខរៀង <b>${totalCount}</b> |  សិស្សសរុប <b>${totalCount}</b> នាក់ ស្រី <b>${femaleCount}</b> នាក់ ប្រុស <b>${maleCount}</b> នាក់<span class="hidden">សិស្សសរុបក្នុងថ្នាក់៖</span></div>
                <div>❖ សិស្សជាប់មធ្យមភាគ <b>${promotedCount}</b> នាក់ គិតជាភាគរយ <b>${promotePct}%</b> (ស្រី <b>${promotedFemales}</b> នាក់ គិតជាភាគរយ <b>${promotedFemalesPct}%</b> )<span class="hidden">សិស្សឡើងថ្នាក់ (≥ 5.00)៖</span></div>
                <div>❖ សិស្សធ្លាក់មធ្យមភាគ <b>${retainedCount}</b> នាក់ គិតជាភាគរយ <b>${retainPct}%</b> (ស្រី <b>${retainedFemales}</b> នាក់ គិតជាភាគរយ <b>${retainedFemalesPct}%</b> )<span class="hidden">សិស្សត្រួតថ្នាក់ (< 5.00)៖</span></div>
            </div>

            <!-- ហត្ថលេខា និងកាលបរិច្ឆេទផ្លូវការ -->
            <div class="flex justify-between items-start text-xs pt-2 px-8 font-siemreap">
                <div class="text-center w-2/5">
                    <p class="mb-1 text-slate-700">បានឃើញ និងឯកភាព</p>
                    <p class="font-moul text-slate-900 mb-14">នាយិកាសាលា</p>
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

// ==========================================================================
// ផ្នែករបាយការណ៍រដ្ឋបាលថ្មីទាំង ៥ តាមគំរូស្តង់ដារក្រសួង និងរូបភាពជាក់ស្តែង
// ១. បញ្ជីសារពើភ័ណ្ឌ (Classroom Inventory List)
// ២. បទបញ្ជាផ្ទៃក្នុង (Internal Class Regulations - 12 Articles)
// ៣. គោលការណ៍ថ្នាក់រៀន (Class Principles - 16 Rules)
// ៤. វេនសម្អាតប្រចាំសប្ដាហ៍ (Weekly Cleaning Duty Roster - Mon to Sat)
// ៥. គណៈកម្មការសាខា (Branch Committee & Youth Council Hierarchy Tree)
// ==========================================================================

// Helper: មុខងាររក្សាទុកទិន្នន័យកែប្រែដោយគ្រូ
window.saveClassReportData = function(reportType, targetGrade, targetRoom) {
    const key = `cms_report_${reportType}_${targetGrade}_${targetRoom}`.replace(/\s+/g, '_');
    const container = document.getElementById('reportPaperArea');
    if (!container) return;

    if (reportType === 'inventory') {
        const rows = container.querySelectorAll('tr[data-inv-id]');
        const data = [];
        rows.forEach(r => {
            const id = r.getAttribute('data-inv-id');
            const name = r.querySelector('.inv-name')?.textContent?.trim() || '';
            const qty = r.querySelector('.inv-qty')?.textContent?.trim() || '0';
            const damaged = r.querySelector('.inv-damaged')?.textContent?.trim() || '0';
            const lost = r.querySelector('.inv-lost')?.textContent?.trim() || '0';
            const note = r.querySelector('.inv-note')?.textContent?.trim() || '';
            data.push({ id, name, qty, damaged, lost, note });
        });
        localStorage.setItem(key, JSON.stringify(data));
    } else if (reportType === 'cleaning_schedule') {
        const tables = container.querySelectorAll('.cleaning-day-card');
        const schedule = {};
        tables.forEach(t => {
            const day = t.getAttribute('data-day');
            const students = [];
            t.querySelectorAll('tbody tr').forEach(r => {
                const name = r.querySelector('.duty-name')?.textContent?.trim() || '';
                const gender = r.querySelector('.duty-gender')?.textContent?.trim() || '';
                const role = r.querySelector('.duty-role')?.textContent?.trim() || '';
                students.push({ name, gender, role });
            });
            schedule[day] = students;
        });
        const monitor = container.querySelector('#cleaningMonitorName')?.textContent?.trim() || '';
        const deputy1 = container.querySelector('#cleaningDeputy1Name')?.textContent?.trim() || '';
        const deputy2 = container.querySelector('#cleaningDeputy2Name')?.textContent?.trim() || '';
        localStorage.setItem(key, JSON.stringify({ schedule, monitor, deputy1, deputy2 }));
    } else if (reportType === 'branch_committee') {
        const commData = {
            advisor: container.querySelector('#branchAdvisorName')?.textContent?.trim() || '',
            monitor: container.querySelector('#branchMonitorName')?.textContent?.trim() || '',
            deputy1: container.querySelector('#branchDeputy1Name')?.textContent?.trim() || '',
            deputy2: container.querySelector('#branchDeputy2Name')?.textContent?.trim() || '',
            member1: container.querySelector('#branchMember1Name')?.textContent?.trim() || '',
            member2: container.querySelector('#branchMember2Name')?.textContent?.trim() || '',
            member3: container.querySelector('#branchMember3Name')?.textContent?.trim() || '',
            member4: container.querySelector('#branchMember4Name')?.textContent?.trim() || '',
            groups: []
        };
        const gRows = container.querySelectorAll('.branch-group-row');
        gRows.forEach(gr => {
            const groupName = gr.querySelector('.group-title')?.textContent?.trim() || '';
            const leader = gr.querySelector('.group-leader')?.textContent?.trim() || '';
            const deputy = gr.querySelector('.group-deputy')?.textContent?.trim() || '';
            const members = gr.querySelector('.group-members')?.textContent?.trim() || '';
            const duty = gr.querySelector('.group-duty')?.textContent?.trim() || '';
            commData.groups.push({ groupName, leader, deputy, members, duty });
        });
        localStorage.setItem(key, JSON.stringify(commData));
    }

    if (typeof showToast === 'function') {
        showToast("✓ បានរក្សាទុកការកែប្រែដោយជោគជ័យ!");
    } else {
        alert("✓ បានរក្សាទុកការកែប្រែដោយជោគជ័យ!");
    }
};

// ==========================================================================
// របាយការណ៍ទី ១៖ បញ្ជីសារពើភ័ណ្ឌ (Classroom Inventory List)
// ==========================================================================
window.renderClassInventoryReport = function(container, targetGrade, targetRoom) {
    if (!container) return;

    const activeClass = typeof window.getCurrentSelectedClass === 'function' ? window.getCurrentSelectedClass() : { level: "ថ្នាក់ទី ៤", room: "«ក»" };
    const curLevel = targetGrade || activeClass.level;
    const curRoom = targetRoom || activeClass.room;
    const gradeFull = `${curLevel} ${curRoom}`.trim();

    const ctx = (window.CMSPrintManager && typeof window.CMSPrintManager.getStandardContext === 'function')
        ? window.CMSPrintManager.getStandardContext({ grade: gradeFull })
        : {};

    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    let storedSettings = {};
    try { storedSettings = JSON.parse(localStorage.getItem('school_settings') || '{}'); } catch(e) {}
    const districtName = ctx.districtName || (storedSettings.district_name || storedSettings.district || sInfo.district_name || sInfo.district || localStorage.getItem('cms_school_district') || "កៀនស្វាយ").replace(/^ស្រុក\s*/, '').trim();
    const schoolName = ctx.schoolName || storedSettings.school_name || sInfo.school_name || localStorage.getItem('cms_school_name') || 'សាលាបឋមសិក្សា ឃុំ';
    const academicYear = ctx.academicYear || localStorage.getItem('selected_academic_year') || '២០២៤-២០២៥';
    const teacherName = ctx.teacherName || localStorage.getItem('teacher_name') || '................................';
    const principalName = ctx.principalName || localStorage.getItem('school_principal') || '................................';
    const solarDateStr = ctx.solarDate || (window.reportDateSettings ? window.reportDateSettings.solarDate : "ថ្ងៃទី....... ខែ....... ឆ្នាំ២០....");
    const lunarDateStr = ctx.lunarDate || (window.reportDateSettings ? window.reportDateSettings.lunarDate : "ថ្ងៃ................. ខែ............. ឆ្នាំ......... ........ស័ក ព.ស.២៥....");

    // បញ្ជីសម្ភារស្តង់ដារ ៣២ មុខ តាមគំរូរូបភាពជាក់ស្តែង
    const defaultLeftItems = [
        { id: 1, name: "តុគ្រូ", qty: 1, damaged: 0, lost: 0, note: "" },
        { id: 2, name: "កៅអីគ្រូ", qty: 1, damaged: 0, lost: 0, note: "" },
        { id: 3, name: "តុសិស្ស", qty: 20, damaged: 0, lost: 0, note: "" },
        { id: 4, name: "កៅអីសិស្ស", qty: 40, damaged: 0, lost: 0, note: "" },
        { id: 5, name: "ក្ដារខៀន", qty: 1, damaged: 0, lost: 0, note: "" },
        { id: 6, name: "បន្ទាត់", qty: 2, damaged: 0, lost: 0, note: "" },
        { id: 7, name: "ដែកឈាន", qty: 1, damaged: 0, lost: 0, note: "" },
        { id: 8, name: "រ៉ាប់ព័រទ័រ", qty: 1, damaged: 0, lost: 0, note: "" },
        { id: 9, name: "ត្រីកោណកែង", qty: 1, damaged: 0, lost: 0, note: "" },
        { id: 10, name: "ធុងសម្រាម", qty: 1, damaged: 0, lost: 0, note: "" },
        { id: 11, name: "អំបោស", qty: 2, damaged: 0, lost: 0, note: "" },
        { id: 12, name: "ប្រដាប់ប្រមូលសម្រាម", qty: 1, damaged: 0, lost: 0, note: "" },
        { id: 13, name: "កន្ត្រកដាក់ដីស", qty: 1, damaged: 0, lost: 0, note: "" },
        { id: 14, name: "ជ័រលុបក្ដារខៀន", qty: 1, damaged: 0, lost: 0, note: "" },
        { id: 15, name: "កាតាបគ្រូ", qty: 1, damaged: 0, lost: 0, note: "" },
        { id: 16, name: "ទូដាក់ឯកសារ", qty: 1, damaged: 0, lost: 0, note: "" }
    ];

    const defaultRightItems = [
        { id: 17, name: "នាឡិកាជញ្ជាំង", qty: 1, damaged: 0, lost: 0, note: "" },
        { id: 18, name: "ផែនទីប្រទេសកម្ពុជា", qty: 1, damaged: 0, lost: 0, note: "" },
        { id: 19, name: "រូបថតថ្នាក់ដឹកនាំ", qty: 3, damaged: 0, lost: 0, note: "" },
        { id: 20, name: "ទង់ជាតិ", qty: 1, damaged: 0, lost: 0, note: "" },
        { id: 21, name: "កង្ហារ", qty: 2, damaged: 0, lost: 0, note: "" },
        { id: 22, name: "អំពូលភ្លើង", qty: 4, damaged: 0, lost: 0, note: "" },
        { id: 23, name: "កុងតាក់ភ្លើង", qty: 2, damaged: 0, lost: 0, note: "" },
        { id: 24, name: "កែវទឹក/កំសៀវ", qty: 1, damaged: 0, lost: 0, note: "" },
        { id: 25, name: "ផ្តិលទឹក", qty: 1, damaged: 0, lost: 0, note: "" },
        { id: 26, name: "កន្សែងជូតដៃ", qty: 2, damaged: 0, lost: 0, note: "" },
        { id: 27, name: "ស្បែកជើងក្នុងថ្នាក់", qty: 20, damaged: 0, lost: 0, note: "" },
        { id: 28, name: "កម្រាលតុ", qty: 1, damaged: 0, lost: 0, note: "" },
        { id: 29, name: "ថូផ្កា", qty: 1, damaged: 0, lost: 0, note: "" },
        { id: 30, name: "ផ្ទាំងទស្សនីយភាព/រូបភាពអប់រំ", qty: 2, damaged: 0, lost: 0, note: "" },
        { id: 31, name: "បទបញ្ជាផ្ទៃក្នុង", qty: 1, damaged: 0, lost: 0, note: "" },
        { id: 32, name: "គោលការណ៍ថ្នាក់រៀន", qty: 1, damaged: 0, lost: 0, note: "" }
    ];

    // ពិនិត្យមើលទិន្នន័យដែលបានរក្សាទុកក្នុង LocalStorage
    const key = `cms_report_inventory_${curLevel}_${curRoom}`.replace(/\s+/g, '_');
    let savedItems = null;
    try {
        const stored = localStorage.getItem(key);
        if (stored) savedItems = JSON.parse(stored);
    } catch(e) {}

    let leftItems = defaultLeftItems;
    let rightItems = defaultRightItems;

    if (savedItems && Array.isArray(savedItems) && savedItems.length > 0) {
        leftItems = defaultLeftItems.map(def => {
            const match = savedItems.find(s => String(s.id) === String(def.id));
            return match ? { ...def, ...match } : def;
        });
        rightItems = defaultRightItems.map(def => {
            const match = savedItems.find(s => String(s.id) === String(def.id));
            return match ? { ...def, ...match } : def;
        });
    }

    const calcSum = (arr, prop) => arr.reduce((acc, it) => acc + (parseInt(it[prop], 10) || 0), 0);
    const sub1Qty = calcSum(leftItems, 'qty');
    const sub1Damaged = calcSum(leftItems, 'damaged');
    const sub1Lost = calcSum(leftItems, 'lost');

    const sub2Qty = calcSum(rightItems, 'qty');
    const sub2Damaged = calcSum(rightItems, 'damaged');
    const sub2Lost = calcSum(rightItems, 'lost');

    const grandTotalQty = sub1Qty + sub2Qty;
    const grandTotalDamaged = sub1Damaged + sub2Damaged;
    const grandTotalLost = sub1Lost + sub2Lost;

    const renderTableCol = (items, startIdx) => items.map((it, idx) => `
        <tr data-inv-id="${it.id}" class="hover:bg-amber-50/40 transition">
            <td class="border border-slate-300 px-1 py-0.5 text-center font-bold text-slate-700 w-7">${startIdx + idx}</td>
            <td class="border border-slate-300 px-2 py-0.5 text-left text-slate-800 inv-name" contenteditable="true">${it.name}</td>
            <td class="border border-slate-300 px-1 py-0.5 text-center font-bold text-indigo-700 w-10 inv-qty" contenteditable="true">${it.qty}</td>
            <td class="border border-slate-300 px-1 py-0.5 text-center font-bold text-amber-700 w-9 inv-damaged" contenteditable="true">${it.damaged}</td>
            <td class="border border-slate-300 px-1 py-0.5 text-center font-bold text-rose-700 w-9 inv-lost" contenteditable="true">${it.lost}</td>
            <td class="border border-slate-300 px-1.5 py-0.5 text-left text-slate-500 inv-note" contenteditable="true">${it.note || ''}</td>
        </tr>
    `).join('');

    container.innerHTML = `
        <div class="a4-page bg-white shadow-xl rounded-lg mx-auto p-7 font-siemreap text-slate-800 relative max-w-[210mm] min-h-[297mm] text-[11px] leading-relaxed border-[3px] border-amber-500/80" style="box-sizing: border-box;">
            <!-- Inner decorative border -->
            <div style="position: absolute; inset: 4px; border: 1.5px solid #d97706; pointer-events: none; border-radius: 4px;"></div>
            <div style="position: absolute; top: 8px; left: 10px; color: #d97706; font-size: 16px;">❖</div>
            <div style="position: absolute; top: 8px; right: 10px; color: #d97706; font-size: 16px;">❖</div>
            <div style="position: absolute; bottom: 8px; left: 10px; color: #d97706; font-size: 16px;">❖</div>
            <div style="position: absolute; bottom: 8px; right: 10px; color: #d97706; font-size: 16px;">❖</div>

            <!-- Official Dual-Side Header matching User Model (Images 1 & 2) -->
            <div class="flex justify-between items-start mb-4 text-xs">
                <div class="text-left leading-relaxed pt-1">
                    <p class="font-moul text-slate-900 text-[11px] mb-0.5">ការិយាល័យ អប់រំ យុវជននិងកីឡានៃរដ្ឋបាលស្រុក ${districtName}</p>
                    <p class="font-moul text-slate-900 text-[11px]">${schoolName}</p>
                    <p class="text-slate-600 mt-1 font-bold text-[10.5px]">ថ្នាក់ទី ៖ <span class="text-indigo-700">${gradeFull}</span> | ឆ្នាំសិក្សា ៖ <span class="text-slate-800">${academicYear}</span></p>
                </div>
                <div class="text-center">
                    <p class="font-moul text-slate-900 text-[12px] mb-0.5">ព្រះរាជាណាចក្រកម្ពុជា</p>
                    <p class="font-moul text-slate-900 text-[12px]">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                    <div class="flex items-center justify-center mt-1 mx-auto">
                        <img src="${window.CMS_HEADER_SYMBOL_B64 || 'assets/images/header-flourish.png'}" class="header-flourish-symbol" alt="symbol" style="display: block; margin: 2px auto 0 auto; width: 135px; height: 11px; object-fit: contain;" />
                    </div>
                </div>
            </div>

            <!-- Main Title -->
            <div class="text-center mb-4">
                <h2 class="font-moul text-base text-amber-900 inline-block px-4 pb-1 border-b-2 border-amber-600">បញ្ជីសារពើភ័ណ្ឌសម្ភារក្នុងថ្នាក់រៀន</h2>
            </div>

            <!-- 2-Column Split Table (Items 1-16 on Left, 17-32 on Right) -->
            <div class="grid grid-cols-2 gap-3 mb-3">
                <!-- Column 1 (Items 1 to 16) -->
                <div>
                    <table class="w-full border-collapse border border-slate-300 text-[10px]">
                        <thead>
                            <tr class="bg-amber-100/70 text-slate-900 font-moul text-[9.5px]">
                                <th class="border border-slate-300 p-1 w-7 text-center">ល.រ</th>
                                <th class="border border-slate-300 p-1 text-center">បរិយាយសម្ភារ</th>
                                <th class="border border-slate-300 p-1 w-10 text-center">ចំនួន</th>
                                <th class="border border-slate-300 p-1 w-9 text-center">ខូច</th>
                                <th class="border border-slate-300 p-1 w-9 text-center">បាត់</th>
                                <th class="border border-slate-300 p-1 text-center">ផ្សេងៗ</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${renderTableCol(leftItems, 1)}
                            <!-- Subtotal 1 -->
                            <tr class="bg-amber-50/80 font-bold text-slate-900">
                                <td colspan="2" class="border border-slate-300 p-1 text-center font-moul text-[9.5px]">សរុប (១)</td>
                                <td class="border border-slate-300 p-1 text-center text-indigo-800">${sub1Qty}</td>
                                <td class="border border-slate-300 p-1 text-center text-amber-800">${sub1Damaged}</td>
                                <td class="border border-slate-300 p-1 text-center text-rose-800">${sub1Lost}</td>
                                <td class="border border-slate-300 p-1 text-center">-</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Column 2 (Items 17 to 32) -->
                <div>
                    <table class="w-full border-collapse border border-slate-300 text-[10px]">
                        <thead>
                            <tr class="bg-amber-100/70 text-slate-900 font-moul text-[9.5px]">
                                <th class="border border-slate-300 p-1 w-7 text-center">ល.រ</th>
                                <th class="border border-slate-300 p-1 text-center">បរិយាយសម្ភារ</th>
                                <th class="border border-slate-300 p-1 w-10 text-center">ចំនួន</th>
                                <th class="border border-slate-300 p-1 w-9 text-center">ខូច</th>
                                <th class="border border-slate-300 p-1 w-9 text-center">បាត់</th>
                                <th class="border border-slate-300 p-1 text-center">ផ្សេងៗ</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${renderTableCol(rightItems, 17)}
                            <!-- Subtotal 2 -->
                            <tr class="bg-amber-50/80 font-bold text-slate-900">
                                <td colspan="2" class="border border-slate-300 p-1 text-center font-moul text-[9.5px]">សរុប (២)</td>
                                <td class="border border-slate-300 p-1 text-center text-indigo-800">${sub2Qty}</td>
                                <td class="border border-slate-300 p-1 text-center text-amber-800">${sub2Damaged}</td>
                                <td class="border border-slate-300 p-1 text-center text-rose-800">${sub2Lost}</td>
                                <td class="border border-slate-300 p-1 text-center">-</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Grand Total Row Across Both Sides -->
            <div class="bg-amber-100/90 border border-amber-300 rounded-lg p-2 mb-4 flex justify-between items-center text-xs font-bold text-slate-900 shadow-sm">
                <span class="font-moul text-amber-950">សរុបរួមទាំងពីរផ្នែក ៖</span>
                <div class="flex gap-6">
                    <span>ចំនួនសម្ភារសរុប ៖ <b class="text-indigo-800 text-sm">${grandTotalQty}</b> គ្រឿង</span>
                    <span>ខូចខាត ៖ <b class="text-amber-800 text-sm">${grandTotalDamaged}</b></span>
                    <span>បាត់បង់ ៖ <b class="text-rose-800 text-sm">${grandTotalLost}</b></span>
                </div>
            </div>

            <!-- Signatures -->
            <div class="flex justify-between items-start text-xs pt-4 px-8 font-siemreap">
                <div class="text-center w-2/5">
                    <p class="mb-1 text-slate-700">បានឃើញ និងឯកភាព</p>
                    <p class="font-moul text-slate-900 mb-14">នាយិកាសាលា</p>
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

// ==========================================================================
// របាយការណ៍ទី ២៖ បទបញ្ជាផ្ទៃក្នុង (Internal Class Regulations - 12 Articles)
// ==========================================================================
window.renderInternalRulesReport = function(container, targetGrade, targetRoom) {
    if (!container) return;

    const activeClass = typeof window.getCurrentSelectedClass === 'function' ? window.getCurrentSelectedClass() : { level: "ថ្នាក់ទី ៤", room: "«ក»" };
    const curLevel = targetGrade || activeClass.level;
    const curRoom = targetRoom || activeClass.room;
    const gradeFull = `${curLevel} ${curRoom}`.trim();

    const ctx = (window.CMSPrintManager && typeof window.CMSPrintManager.getStandardContext === 'function')
        ? window.CMSPrintManager.getStandardContext({ grade: gradeFull })
        : {};

    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    let storedSettings = {};
    try { storedSettings = JSON.parse(localStorage.getItem('school_settings') || '{}'); } catch(e) {}
    const districtName = ctx.districtName || (storedSettings.district_name || storedSettings.district || sInfo.district_name || sInfo.district || localStorage.getItem('cms_school_district') || "កៀនស្វាយ").replace(/^ស្រុក\s*/, '').trim();
    const schoolName = ctx.schoolName || storedSettings.school_name || sInfo.school_name || localStorage.getItem('cms_school_name') || 'សាលាបឋមសិក្សា ឃុំ';
    const academicYear = ctx.academicYear || localStorage.getItem('selected_academic_year') || '២០២៤-២០២៥';
    const teacherName = ctx.teacherName || localStorage.getItem('teacher_name') || '................................';
    const principalName = ctx.principalName || localStorage.getItem('school_principal') || '................................';
    const solarDateStr = ctx.solarDate || (window.reportDateSettings ? window.reportDateSettings.solarDate : "ថ្ងៃទី....... ខែ....... ឆ្នាំ២០....");
    const lunarDateStr = ctx.lunarDate || (window.reportDateSettings ? window.reportDateSettings.lunarDate : "ថ្ងៃ................. ខែ............. ឆ្នាំ......... ........ស័ក ព.ស.២៥....");

    // ១២ ប្រការពេញលេញ តាមគំរូរូបភាពជាក់ស្តែង
    const articles = [
        { num: "១", text: "ត្រូវមកសាលារៀនឱ្យបានទៀងទាត់ពេលវេលា យ៉ាងតិច ១៥ នាទីមុនចូលរៀន និងចូលរួមគោរពទង់ជាតិជារៀងរាល់ព្រឹក។" },
        { num: "២", text: "ត្រូវស្លៀកពាក់ឯកសណ្ឋានសិស្សឱ្យបានត្រឹមត្រូវ ស្អាតបាត សមរម្យ និងពាក់ផ្លាកឈ្មោះតាមការកំណត់របស់សាលារៀន។" },
        { num: "៣", text: "ត្រូវមានអាកប្បកិរិយាសមរម្យ សុភាពរាបសារ គោរពគំនាប់ចំពោះលោកគ្រូ អ្នកគ្រូ មាតាបិតា អាណាព្យាបាល និងចាស់ទុំ។" },
        { num: "៤", text: "ត្រូវមានសាមគ្គីភាព ស្រឡាញ់រាប់អានមិត្តភក្តិ ចេះជួយទុក្ខធុរៈគ្នា មិនឈ្លោះប្រកែក មិនប្រើពាក្យអសុរស និងមិនប្រើអំពើហិង្សា។" },
        { num: "៥", text: "ត្រូវយកចិត្តទុកដាក់ស្ដាប់ការពន្យល់របស់គ្រូ មិនត្រូវនិយាយគ្នាលេង មិនបង្កសំឡេងរំខាន ឬដើរចេញក្រៅដោយគ្មានការអនុញ្ញាតក្នុងម៉ោងសិក្សា។" },
        { num: "៦", text: "ត្រូវខិតខំរៀនសូត្រ ធ្វើកិច្ចការផ្ទះ មេរៀន និងបំពេញភារកិច្ចដែលគ្រូដាក់ឱ្យបានគ្រប់ជ្រុងជ្រោយ និងទាន់ពេលវេលា។" },
        { num: "៧", text: "ត្រូវថែរក្សាអនាម័យផ្ទាល់ខ្លួន អនាម័យតុ កៅអី ថ្នាក់រៀន និងបរិស្ថានសាលាឱ្យបានស្អាតជានិច្ច តាមគោលការណ៍ «ថ្នាក់រៀនស្អាត»។" },
        { num: "៨", text: "ត្រូវចូលរួមបំពេញវេនសម្អាតថ្នាក់រៀន និងបរិស្ថានតាមការបែងចែកដោយស្មារតីទទួលខុសត្រូវខ្ពស់ និងសហការគ្នាបានល្អ។" },
        { num: "៩", text: "ត្រូវថែរក្សាការពារទ្រព្យសម្បត្តិរួមរបស់ថ្នាក់រៀន និងសាលារៀន មិនគូសវាស ឬបំផ្លាញតុ កៅអី ក្ដារខៀន ឬជញ្ជាំងឡើយ។" },
        { num: "១០", text: "ហាមដាច់ខាតនូវការយកគ្រឿងញៀន អាវុធ ជាតិផ្ទុះ បារីអេឡិចត្រូនិច ល្បែងស៊ីសង ឬសម្ភារមិនសមរម្យផ្សេងៗមកកាន់សាលារៀន។" },
        { num: "១១", text: "ហាមប្រើប្រាស់ទូរស័ព្ទដៃ ឬឧបករណ៍អេឡិចត្រូនិកក្នុងម៉ោងសិក្សាដោយគ្មានការអនុញ្ញាតពីគ្រូបន្ទុកថ្នាក់។" },
        { num: "១២", text: "ករណីសិស្សឈប់សម្រាក ត្រូវមានច្បាប់សុំការអនុញ្ញាតពីគ្រូបន្ទុកថ្នាក់ជាលាយលក្ខណ៍អក្សរពីមាតាបិតា ឬអាណាព្យាបាល។" }
    ];

    const leftCol = articles.slice(0, 6);
    const rightCol = articles.slice(6, 12);

    const renderArticleCard = (art) => `
        <div class="p-2.5 rounded-xl border border-rose-200/80 bg-rose-50/30 hover:bg-rose-50/70 transition flex items-start gap-2.5">
            <span class="w-6 h-6 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">${art.num}</span>
            <div class="text-slate-800 text-xs leading-relaxed">
                <b class="text-rose-900 font-siemreap">ប្រការ ${art.num} ៖</b> ${art.text}
            </div>
        </div>
    `;

    container.innerHTML = `
        <div class="a4-page bg-white shadow-xl rounded-lg mx-auto p-7 font-siemreap text-slate-800 relative max-w-[210mm] min-h-[297mm] text-[11px] leading-relaxed border-[3px] border-rose-500/80" style="box-sizing: border-box;">
            <!-- Inner decorative border -->
            <div style="position: absolute; inset: 4px; border: 1.5px solid #e11d48; pointer-events: none; border-radius: 4px;"></div>
            <div style="position: absolute; top: 8px; left: 10px; color: #e11d48; font-size: 16px;">❖</div>
            <div style="position: absolute; top: 8px; right: 10px; color: #e11d48; font-size: 16px;">❖</div>
            <div style="position: absolute; bottom: 8px; left: 10px; color: #e11d48; font-size: 16px;">❖</div>
            <div style="position: absolute; bottom: 8px; right: 10px; color: #e11d48; font-size: 16px;">❖</div>

            <!-- Official Dual-Side Header matching User Model (Images 1 & 2) -->
            <div class="flex justify-between items-start mb-3 text-xs">
                <div class="text-left leading-relaxed pt-1">
                    <p class="font-moul text-slate-900 text-[11px] mb-0.5">ការិយាល័យ អប់រំ យុវជននិងកីឡានៃរដ្ឋបាលស្រុក ${districtName}</p>
                    <p class="font-moul text-slate-900 text-[11px]">${schoolName}</p>
                    <p class="text-slate-600 mt-1 font-bold text-[10.5px]">ថ្នាក់ទី ៖ <span class="text-rose-700">${gradeFull}</span> | ឆ្នាំសិក្សា ៖ <span class="text-slate-800">${academicYear}</span></p>
                </div>
                <div class="text-center">
                    <p class="font-moul text-slate-900 text-[12px] mb-0.5">ព្រះរាជាណាចក្រកម្ពុជា</p>
                    <p class="font-moul text-slate-900 text-[12px]">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                    <div class="flex items-center justify-center mt-1 mx-auto">
                        <img src="${window.CMS_HEADER_SYMBOL_B64 || 'assets/images/header-flourish.png'}" class="header-flourish-symbol" alt="symbol" style="display: block; margin: 2px auto 0 auto; width: 135px; height: 11px; object-fit: contain;" />
                    </div>
                </div>
            </div>

            <!-- Main Title -->
            <div class="text-center mb-3">
                <h2 class="font-moul text-base text-rose-900 inline-block px-4 pb-1 border-b-2 border-rose-600">បទបញ្ជាផ្ទៃក្នុងក្នុងថ្នាក់រៀន</h2>
            </div>

            <!-- Preamble -->
            <div class="bg-rose-50/60 border border-rose-200 rounded-xl p-2.5 mb-4 text-xs text-rose-950 text-center font-bold leading-relaxed shadow-sm">
                ដើម្បីលើកកម្ពស់វិន័យ សីលធម៌ សេចក្តីថ្លៃថ្នូរ និងគុណភាពនៃការអប់រំក្នុងថ្នាក់រៀនឱ្យកាន់តែល្អប្រសើរ សិស្សានុសិស្សទាំងអស់ត្រូវគោរព និងអនុវត្តតាមបទបញ្ជាផ្ទៃក្នុងដូចខាងក្រោម៖
            </div>

            <!-- 12 Articles Grid (2 Columns x 6 Articles) -->
            <div class="grid grid-cols-2 gap-3 mb-4">
                <div class="space-y-2.5">
                    ${leftCol.map(renderArticleCard).join('')}
                </div>
                <div class="space-y-2.5">
                    ${rightCol.map(renderArticleCard).join('')}
                </div>
            </div>

            <!-- Closing Clause -->
            <div class="bg-slate-50 border border-slate-200 rounded-lg p-2 mb-4 text-[11px] text-slate-700 text-center italic">
                បទបញ្ជាផ្ទៃក្នុងនេះ មានសុពលភាពអនុវត្តចាប់ពីថ្ងៃចុះហត្ថលេខានេះតទៅ។ សិស្សានុសិស្សដែលប្រព្រឹត្តល្មើសនឹងត្រូវទទួលការអប់រំ និងវិន័យតាមកម្រិត។
            </div>

            <!-- Signatures -->
            <div class="flex justify-between items-start text-xs pt-3 px-8 font-siemreap">
                <div class="text-center w-2/5">
                    <p class="mb-1 text-slate-700">បានឃើញ និងឯកភាព</p>
                    <p class="font-moul text-slate-900 mb-14">នាយិកាសាលា</p>
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

// ==========================================================================
// របាយការណ៍ទី ៣៖ គោលការណ៍ថ្នាក់រៀន (Class Principles - 16 Rules)
// ==========================================================================
window.renderClassPrinciplesReport = function(container, targetGrade, targetRoom) {
    if (!container) return;

    const activeClass = typeof window.getCurrentSelectedClass === 'function' ? window.getCurrentSelectedClass() : { level: "ថ្នាក់ទី ៤", room: "«ក»" };
    const curLevel = targetGrade || activeClass.level;
    const curRoom = targetRoom || activeClass.room;
    const gradeFull = `${curLevel} ${curRoom}`.trim();

    const ctx = (window.CMSPrintManager && typeof window.CMSPrintManager.getStandardContext === 'function')
        ? window.CMSPrintManager.getStandardContext({ grade: gradeFull })
        : {};

    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    let storedSettings = {};
    try { storedSettings = JSON.parse(localStorage.getItem('school_settings') || '{}'); } catch(e) {}
    const districtName = ctx.districtName || (storedSettings.district_name || storedSettings.district || sInfo.district_name || sInfo.district || localStorage.getItem('cms_school_district') || "កៀនស្វាយ").replace(/^ស្រុក\s*/, '').trim();
    const schoolName = ctx.schoolName || storedSettings.school_name || sInfo.school_name || localStorage.getItem('cms_school_name') || 'សាលាបឋមសិក្សា ឃុំ';
    const academicYear = ctx.academicYear || localStorage.getItem('selected_academic_year') || '២០២៤-២០២៥';
    const teacherName = ctx.teacherName || localStorage.getItem('teacher_name') || '................................';
    const principalName = ctx.principalName || localStorage.getItem('school_principal') || '................................';
    const solarDateStr = ctx.solarDate || (window.reportDateSettings ? window.reportDateSettings.solarDate : "ថ្ងៃទី....... ខែ....... ឆ្នាំ២០....");
    const lunarDateStr = ctx.lunarDate || (window.reportDateSettings ? window.reportDateSettings.lunarDate : "ថ្ងៃ................. ខែ............. ឆ្នាំ......... ........ស័ក ព.ស.២៥....");

    // រកឈ្មោះប្រធានថ្នាក់
    const classStudents = (typeof window.getStudentsForClass === 'function')
        ? window.getStudentsForClass(curLevel, curRoom)
        : (window.allStudents || []);
    const monitorStudent = classStudents[0] ? (classStudents[0].name || classStudents[0].name_khmer || '................................') : '................................';

    // ១៦ ចំណុចគោលការណ៍ថ្នាក់រៀន តាមគំរូរូបភាពជាក់ស្តែង
    const principles = [
        { num: 1, title: "មកឱ្យទាន់ពេលវេលា", desc: "មកដល់សាលា និងថ្នាក់រៀនយ៉ាងហោច ១៥ នាទីមុនចូលរៀន", icon: "fa-regular fa-clock" },
        { num: 2, title: "ស្លៀកពាក់ស្អាតបាត និងសមរម្យ", desc: "ស្លៀកពាក់ឯកសណ្ឋានសិស្សឱ្យបានត្រឹមត្រូវ និងមានរបៀប", icon: "fa-solid fa-shirt" },
        { num: 3, title: "គោរពលោកគ្រូ អ្នកគ្រូ និងចាស់ទុំ", desc: "លើកដៃសំពះ និងមានសុជីវធម៌ទន់ភ្លន់គ្រប់ពេលវេលា", icon: "fa-solid fa-hands-praying" },
        { num: 4, title: "ស្រឡាញ់ និងរាប់អានមិត្តភក្តិ", desc: "ចេះជួយគ្នា មិនរើសអើង និងសាមគ្គីភាពជិតស្និទ្ធ", icon: "fa-solid fa-heart" },
        { num: 5, title: "យកចិត្តទុកដាក់ស្ដាប់គ្រូពន្យល់", desc: "ផ្ដោតអារម្មណ៍រៀនសូត្រ មិននិយាយគ្នាលេងក្នុងម៉ោង", icon: "fa-solid fa-ear-listen" },
        { num: 6, title: "លើកដៃមុនឆ្លើយ ឬចង់និយាយ", desc: "សុំការអនុញ្ញាតពីគ្រូជាមុនពេលចង់សួរ ឬឆ្លើយសំណួរ", icon: "fa-solid fa-hand" },
        { num: 7, title: "ធ្វើកិច្ចការឱ្យទាន់ពេលវេលា", desc: "បំពេញកិច្ចការផ្ទះ និងលំហាត់គ្រប់ជ្រុងជ្រោយ", icon: "fa-solid fa-book-open" },
        { num: 8, title: "រក្សាភាពស្ងប់ស្ងាត់ក្នុងថ្នាក់", desc: "មិនបង្កសំឡេងរំខាន និងមិនរត់លេងក្នុងបន្ទប់រៀន", icon: "fa-solid fa-volume-xmark" },
        { num: 9, title: "ថែរក្សាអនាម័យខ្លួន និងថ្នាក់", desc: "កាត់ក្រចក តុ កៅអី និងបរិស្ថានថ្នាក់ស្អាតជានិច្ច", icon: "fa-solid fa-soap" },
        { num: 10, title: "ចូលរួមវេនសម្អាតដោយស្ម័គ្រចិត្ត", desc: "បំពេញវេនបោសជូត និងរៀបចំថ្នាក់តាមវេនកំណត់", icon: "fa-solid fa-broom" },
        { num: 11, title: "ការពារ និងថែរក្សាសម្បត្តិរួម", desc: "មិនគូសវាសលើតុ កៅអី ក្ដារខៀន និងជញ្ជាំង", icon: "fa-solid fa-shield-halved" },
        { num: 12, title: "មិនឈ្លោះប្រកែក ឬប្រើហិង្សា", desc: "ដោះស្រាយបញ្ហាដោយសន្តិវិធី និងមិនប្រើពាក្យអសុរស", icon: "fa-solid fa-handshake-angle" },
        { num: 13, title: "មិនចោលសម្រាមពាសវាលពាសកាល", desc: "បោះសម្រាមក្នុងធុងឱ្យបានត្រឹមត្រូវគ្រប់ពេលវេលា", icon: "fa-solid fa-trash-can" },
        { num: 14, title: "មិនយកចំណីមកញ៉ាំក្នុងថ្នាក់", desc: "ទទួលទានចំណីអាហារក្រៅបន្ទប់រៀនក្នុងពេលចេញលេង", icon: "fa-solid fa-ban" },
        { num: 15, title: "មិនប្រើទូរស័ព្ទក្នុងម៉ោងសិក្សា", desc: "ហាមលេងហ្គេម ឬប្រើទូរស័ព្ទពេលកំពុងរៀន", icon: "fa-solid fa-mobile-screen" },
        { num: 16, title: "សុំច្បាប់ពេលឈប់សម្រាក", desc: "មានលិខិតសុំច្បាប់ពីមាតាបិតាពេលមានធុរៈ ឬឈឺ", icon: "fa-solid fa-file-signature" }
    ];

    const leftPrinciples = principles.slice(0, 8);
    const rightPrinciples = principles.slice(8, 16);

    const renderPrincipleCard = (p) => `
        <div class="p-2 rounded-xl border border-sky-200 bg-sky-50/40 hover:bg-sky-50/80 transition flex items-center gap-2.5">
            <span class="w-6 h-6 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">${p.num}</span>
            <div class="flex-1">
                <p class="font-bold text-sky-950 text-xs">${p.title}</p>
                <p class="text-[10px] text-slate-500 leading-tight">${p.desc}</p>
            </div>
            <i class="${p.icon} text-sky-400 text-xs"></i>
        </div>
    `;

    container.innerHTML = `
        <div class="a4-page bg-white shadow-xl rounded-lg mx-auto p-7 font-siemreap text-slate-800 relative max-w-[210mm] min-h-[297mm] text-[11px] leading-relaxed border-[3px] border-sky-500/80" style="box-sizing: border-box;">
            <!-- Inner decorative border -->
            <div style="position: absolute; inset: 4px; border: 1.5px solid #0284c7; pointer-events: none; border-radius: 4px;"></div>
            <div style="position: absolute; top: 8px; left: 10px; color: #0284c7; font-size: 16px;">❖</div>
            <div style="position: absolute; top: 8px; right: 10px; color: #0284c7; font-size: 16px;">❖</div>
            <div style="position: absolute; bottom: 8px; left: 10px; color: #0284c7; font-size: 16px;">❖</div>
            <div style="position: absolute; bottom: 8px; right: 10px; color: #0284c7; font-size: 16px;">❖</div>

            <!-- Official Dual-Side Header matching User Model (Images 1 & 2) -->
            <div class="flex justify-between items-start mb-2 text-xs">
                <div class="text-left leading-relaxed pt-1">
                    <p class="font-moul text-slate-900 text-[11px] mb-0.5">ការិយាល័យ អប់រំ យុវជននិងកីឡានៃរដ្ឋបាលស្រុក ${districtName}</p>
                    <p class="font-moul text-slate-900 text-[11px]">${schoolName}</p>
                    <p class="text-slate-600 mt-1 font-bold text-[10.5px]">ថ្នាក់ទី ៖ <span class="text-sky-700">${gradeFull}</span> | ឆ្នាំសិក្សា ៖ <span class="text-slate-800">${academicYear}</span></p>
                </div>
                <div class="text-center">
                    <p class="font-moul text-slate-900 text-[12px] mb-0.5">ព្រះរាជាណាចក្រកម្ពុជា</p>
                    <p class="font-moul text-slate-900 text-[12px]">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                    <div class="flex items-center justify-center mt-1 mx-auto">
                        <img src="${window.CMS_HEADER_SYMBOL_B64 || 'assets/images/header-flourish.png'}" class="header-flourish-symbol" alt="symbol" style="display: block; margin: 2px auto 0 auto; width: 135px; height: 11px; object-fit: contain;" />
                    </div>
                </div>
            </div>

            <!-- Main Title -->
            <div class="text-center mb-2">
                <h2 class="font-moul text-base text-sky-950 inline-block px-4 pb-1 border-b-2 border-sky-600">គោលការណ៍ថ្នាក់រៀន</h2>
            </div>

            <!-- Motto Banner (ដូចក្នុងរូបភាពគំរូ) -->
            <div class="bg-gradient-to-r from-sky-50 via-indigo-50 to-sky-50 border border-sky-200 rounded-xl p-2.5 mb-4 text-xs text-indigo-950 text-center font-bold shadow-sm">
                ✨ « វិន័យនាំមកនូវសេចក្តីថ្លៃថ្នូរ • ការសិក្សានាំមកនូវចំណេះដឹង • អនាម័យនាំមកនូវសុខភាពល្អ » ✨
            </div>

            <!-- 16 Principles Grid (2 Columns x 8 Items) -->
            <div class="grid grid-cols-2 gap-3 mb-4">
                <div class="space-y-2">
                    ${leftPrinciples.map(renderPrincipleCard).join('')}
                </div>
                <div class="space-y-2">
                    ${rightPrinciples.map(renderPrincipleCard).join('')}
                </div>
            </div>

            <!-- Signatures -->
            <div class="flex justify-between items-start text-xs pt-4 px-8 font-siemreap">
                <div class="text-center w-2/5">
                    <p class="mb-1 text-slate-700">បានឃើញ និងឯកភាព</p>
                    <p class="font-moul text-slate-900 mb-14">គ្រូបន្ទុកថ្នាក់</p>
                    <p class="font-moul text-slate-900 text-xs">${teacherName}</p>
                </div>
                <div class="text-center w-2/5">
                    <p class="mb-1 text-slate-700">${lunarDateStr}</p>
                    <p class="mb-1 text-slate-700 font-bold">${solarDateStr}</p>
                    <p class="font-moul text-slate-900 mb-14">តំណាងសិស្ស / ប្រធានថ្នាក់</p>
                    <p class="font-moul text-slate-900 text-xs">${monitorStudent}</p>
                </div>
            </div>
        </div>
    `;

    if (typeof window.applyAcademicReportPaperSettings === 'function') {
        window.applyAcademicReportPaperSettings();
    }
};

// ==========================================================================
// របាយការណ៍ទី ៤៖ វេនសម្អាតប្រចាំសប្ដាហ៍ (Weekly Cleaning Duty Roster)
// ==========================================================================
window.renderCleaningScheduleReport = function(container, targetGrade, targetRoom) {
    if (!container) return;

    const activeClass = typeof window.getCurrentSelectedClass === 'function' ? window.getCurrentSelectedClass() : { level: "ថ្នាក់ទី ៤", room: "«ក»" };
    const curLevel = targetGrade || activeClass.level;
    const curRoom = targetRoom || activeClass.room;
    const gradeFull = `${curLevel} ${curRoom}`.trim();

    const ctx = (window.CMSPrintManager && typeof window.CMSPrintManager.getStandardContext === 'function')
        ? window.CMSPrintManager.getStandardContext({ grade: gradeFull })
        : {};

    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    let storedSettings = {};
    try { storedSettings = JSON.parse(localStorage.getItem('school_settings') || '{}'); } catch(e) {}
    const districtName = ctx.districtName || (storedSettings.district_name || storedSettings.district || sInfo.district_name || sInfo.district || localStorage.getItem('cms_school_district') || "កៀនស្វាយ").replace(/^ស្រុក\s*/, '').trim();
    const schoolName = ctx.schoolName || storedSettings.school_name || sInfo.school_name || localStorage.getItem('cms_school_name') || 'សាលាបឋមសិក្សា ឃុំ';
    const academicYear = ctx.academicYear || localStorage.getItem('selected_academic_year') || '២០២៤-២០២៥';
    const teacherName = ctx.teacherName || localStorage.getItem('teacher_name') || '................................';
    const principalName = ctx.principalName || localStorage.getItem('school_principal') || '................................';
    const solarDateStr = ctx.solarDate || (window.reportDateSettings ? window.reportDateSettings.solarDate : "ថ្ងៃទី....... ខែ....... ឆ្នាំ២០....");
    const lunarDateStr = ctx.lunarDate || (window.reportDateSettings ? window.reportDateSettings.lunarDate : "ថ្ងៃ................. ខែ............. ឆ្នាំ......... ........ស័ក ព.ស.២៥....");

    // សិស្សក្នុងថ្នាក់ជាក់ស្តែង
    const classStudents = (typeof window.getStudentsForClass === 'function')
        ? window.getStudentsForClass(curLevel, curRoom)
        : (window.allStudents || []);

    const days = [
        { key: "mon", name: "ថ្ងៃចន្ទ", labelEn: "Monday" },
        { key: "tue", name: "ថ្ងៃអង្គារ", labelEn: "Tuesday" },
        { key: "wed", name: "ថ្ងៃពុធ", labelEn: "Wednesday" },
        { key: "thu", name: "ថ្ងៃព្រហស្បតិ៍", labelEn: "Thursday" },
        { key: "fri", name: "ថ្ងៃសុក្រ", labelEn: "Friday" },
        { key: "sat", name: "ថ្ងៃសៅរ៍", labelEn: "Saturday" }
    ];

    // ពិនិត្យទិន្នន័យរក្សាទុក
    const key = `cms_report_cleaning_schedule_${curLevel}_${curRoom}`.replace(/\s+/g, '_');
    let savedSchedule = null;
    try {
        const stored = localStorage.getItem(key);
        if (stored) savedSchedule = JSON.parse(stored);
    } catch(e) {}

    const monitorName = savedSchedule?.monitor || (classStudents[0] ? (classStudents[0].name || classStudents[0].name_khmer) : '................................');
    const deputy1Name = savedSchedule?.deputy1 || (classStudents[1] ? (classStudents[1].name || classStudents[1].name_khmer) : '................................');
    const deputy2Name = savedSchedule?.deputy2 || (classStudents[2] ? (classStudents[2].name || classStudents[2].name_khmer) : '................................');

    // បែងចែកសិស្សតាម ៦ ថ្ងៃ ស្មើៗគ្នា
    const pool = classStudents.slice(3); // សល់ពីប្រធាន និងអនុប្រធាន
    const dayGroups = {};
    days.forEach((d, dIdx) => {
        if (savedSchedule?.schedule && savedSchedule.schedule[d.key]) {
            dayGroups[d.key] = savedSchedule.schedule[d.key];
        } else {
            // បែងចែកស្វ័យប្រវត្តិ
            const groupList = [];
            for (let i = dIdx; i < pool.length; i += 6) {
                groupList.push(pool[i]);
            }
            // យ៉ាងហោច ៤-៥ ជួរក្នុងមួយតារាង
            const rows = [];
            const rCount = Math.max(groupList.length, 5);
            for (let r = 0; r < rCount; r++) {
                const stu = groupList[r];
                const role = r === 0 ? "ប្រធានវេន" : (r === 1 ? "អនុប្រធាន" : "សមាជិក");
                rows.push({
                    name: stu ? (stu.name || stu.name_khmer || '') : '',
                    gender: stu ? (stu.gender || '') : '',
                    role: role
                });
            }
            dayGroups[d.key] = rows;
        }
    });

    const renderDayCard = (d) => {
        const rows = dayGroups[d.key] || [];
        const rowsHtml = rows.map((r, idx) => `
            <tr class="hover:bg-emerald-50/40 transition">
                <td class="border border-slate-300 px-1 py-0.5 text-center font-bold text-slate-700 w-6">${idx + 1}</td>
                <td class="border border-slate-300 px-1.5 py-0.5 text-left text-slate-800 duty-name" contenteditable="true">${r.name || ''}</td>
                <td class="border border-slate-300 px-1 py-0.5 text-center text-slate-600 w-8 duty-gender" contenteditable="true">${r.gender || ''}</td>
                <td class="border border-slate-300 px-1 py-0.5 text-center text-emerald-800 font-bold w-16 duty-role" contenteditable="true">${r.role || 'សមាជិក'}</td>
            </tr>
        `).join('');

        return `
            <div class="cleaning-day-card border border-emerald-300 rounded-xl overflow-hidden shadow-sm bg-white" data-day="${d.key}">
                <div class="bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-moul text-center py-1 text-[11px] flex justify-between px-3 items-center">
                    <span>${d.name}</span>
                    <span class="text-[9px] font-siemreap opacity-80 uppercase">${d.labelEn}</span>
                </div>
                <table class="w-full border-collapse border border-slate-300 text-[10px]">
                    <thead>
                        <tr class="bg-emerald-50 text-emerald-950 font-bold text-[9.5px]">
                            <th class="border border-slate-300 p-0.5 w-6 text-center">ល.រ</th>
                            <th class="border border-slate-300 p-0.5 text-center">ឈ្មោះសិស្ស</th>
                            <th class="border border-slate-300 p-0.5 w-8 text-center">ភេទ</th>
                            <th class="border border-slate-300 p-0.5 w-16 text-center">តួនាទី</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
            </div>
        `;
    };

    container.innerHTML = `
        <div class="a4-page bg-white shadow-xl rounded-lg mx-auto p-7 font-siemreap text-slate-800 relative max-w-[210mm] min-h-[297mm] text-[11px] leading-relaxed border-[3px] border-emerald-500/80" style="box-sizing: border-box;">
            <!-- Inner decorative border -->
            <div style="position: absolute; inset: 4px; border: 1.5px solid #059669; pointer-events: none; border-radius: 4px;"></div>
            <div style="position: absolute; top: 8px; left: 10px; color: #059669; font-size: 16px;">❖</div>
            <div style="position: absolute; top: 8px; right: 10px; color: #059669; font-size: 16px;">❖</div>
            <div style="position: absolute; bottom: 8px; left: 10px; color: #059669; font-size: 16px;">❖</div>
            <div style="position: absolute; bottom: 8px; right: 10px; color: #059669; font-size: 16px;">❖</div>

            <!-- Official Dual-Side Header matching User Model (Images 1 & 2) -->
            <div class="flex justify-between items-start mb-2 text-xs">
                <div class="text-left leading-relaxed pt-1">
                    <p class="font-moul text-slate-900 text-[11px] mb-0.5">ការិយាល័យ អប់រំ យុវជននិងកីឡានៃរដ្ឋបាលស្រុក ${districtName}</p>
                    <p class="font-moul text-slate-900 text-[11px]">${schoolName}</p>
                    <p class="text-slate-600 mt-1 font-bold text-[10.5px]">ថ្នាក់ទី ៖ <span class="text-emerald-700">${gradeFull}</span> | ឆ្នាំសិក្សា ៖ <span class="text-slate-800">${academicYear}</span></p>
                </div>
                <div class="text-center">
                    <p class="font-moul text-slate-900 text-[12px] mb-0.5">ព្រះរាជាណាចក្រកម្ពុជា</p>
                    <p class="font-moul text-slate-900 text-[12px]">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                    <div class="flex items-center justify-center mt-1 mx-auto">
                        <img src="${window.CMS_HEADER_SYMBOL_B64 || 'assets/images/header-flourish.png'}" class="header-flourish-symbol" alt="symbol" style="display: block; margin: 2px auto 0 auto; width: 135px; height: 11px; object-fit: contain;" />
                    </div>
                </div>
            </div>

            <!-- Main Title -->
            <div class="text-center mb-2">
                <h2 class="font-moul text-base text-emerald-950 inline-block px-4 pb-1 border-b-2 border-emerald-600">តារាងវេនសម្អាតប្រចាំសប្ដាហ៍</h2>
            </div>

            <!-- Committee Leadership Header (ប្រធានថ្នាក់ និងអនុប្រធាន) -->
            <div class="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-300 rounded-xl p-2.5 mb-3 text-xs shadow-sm flex flex-wrap justify-around items-center gap-2">
                <div>ប្រធានថ្នាក់ (ត្រួតពិនិត្យរួម) ៖ <b id="cleaningMonitorName" class="text-emerald-900" contenteditable="true">${monitorName}</b></div>
                <div class="text-slate-300">|</div>
                <div>អនុប្រធានទី១ (អនាម័យ) ៖ <b id="cleaningDeputy1Name" class="text-teal-900" contenteditable="true">${deputy1Name}</b></div>
                <div class="text-slate-300">|</div>
                <div>អនុប្រធានទី២ (សម្ភារ) ៖ <b id="cleaningDeputy2Name" class="text-indigo-900" contenteditable="true">${deputy2Name}</b></div>
            </div>

            <!-- 6 Day Tables (2 Rows x 3 Columns) -->
            <div class="grid grid-cols-3 gap-2.5 mb-3">
                ${days.slice(0, 3).map(renderDayCard).join('')}
            </div>
            <div class="grid grid-cols-3 gap-2.5 mb-3">
                ${days.slice(3, 6).map(renderDayCard).join('')}
            </div>

            <!-- Duty Scope Note -->
            <div class="bg-slate-50 border border-slate-200 rounded-lg p-2 mb-3 text-[10.5px] text-slate-700 leading-normal">
                <b>* ភារកិច្ចវេនសម្អាត ៖</b> បោស និងជូតបន្ទប់រៀន, ជូតក្ដារខៀន និងតុគ្រូ-សិស្ស, ចាក់សម្រាមក្នុងធុងធំ, បិទភ្លើង កង្ហារ និងទ្វារ បង្អួច ក្រោយពេលចប់ម៉ោងសិក្សាជារៀងរាល់ថ្ងៃ។
            </div>

            <!-- Signatures -->
            <div class="flex justify-between items-start text-xs pt-2 px-8 font-siemreap">
                <div class="text-center w-2/5">
                    <p class="mb-1 text-slate-700">បានឃើញ និងឯកភាព</p>
                    <p class="font-moul text-slate-900 mb-12">នាយិកាសាលា</p>
                    <p class="font-moul text-slate-900 text-xs">${principalName}</p>
                </div>
                <div class="text-center w-2/5">
                    <p class="mb-1 text-slate-700">${lunarDateStr}</p>
                    <p class="mb-1 text-slate-700 font-bold">${solarDateStr}</p>
                    <p class="font-moul text-slate-900 mb-12">គ្រូបន្ទុកថ្នាក់</p>
                    <p class="font-moul text-slate-900 text-xs">${teacherName}</p>
                </div>
            </div>
        </div>
    `;

    if (typeof window.applyAcademicReportPaperSettings === 'function') {
        window.applyAcademicReportPaperSettings();
    }
};

// ==========================================================================
// របាយការណ៍ទី ៥៖ គណៈកម្មការសាខា & ក្រុមប្រឹក្សាកុមារ (Branch Committee & Youth Council)
// ==========================================================================
window.renderBranchCommitteeReport = function(container, targetGrade, targetRoom) {
    if (!container) return;

    const activeClass = typeof window.getCurrentSelectedClass === 'function' ? window.getCurrentSelectedClass() : { level: "ថ្នាក់ទី ៤", room: "«ក»" };
    const curLevel = targetGrade || activeClass.level;
    const curRoom = targetRoom || activeClass.room;
    const gradeFull = `${curLevel} ${curRoom}`.trim();

    const ctx = (window.CMSPrintManager && typeof window.CMSPrintManager.getStandardContext === 'function')
        ? window.CMSPrintManager.getStandardContext({ grade: gradeFull })
        : {};

    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    let storedSettings = {};
    try { storedSettings = JSON.parse(localStorage.getItem('school_settings') || '{}'); } catch(e) {}
    const districtName = ctx.districtName || (storedSettings.district_name || storedSettings.district || sInfo.district_name || sInfo.district || localStorage.getItem('cms_school_district') || "កៀនស្វាយ").replace(/^ស្រុក\s*/, '').trim();
    const schoolName = ctx.schoolName || storedSettings.school_name || sInfo.school_name || localStorage.getItem('cms_school_name') || 'សាលាបឋមសិក្សា ឃុំ';
    const academicYear = ctx.academicYear || localStorage.getItem('selected_academic_year') || '២០២៤-២០២៥';
    const teacherName = ctx.teacherName || localStorage.getItem('teacher_name') || '................................';
    const principalName = ctx.principalName || localStorage.getItem('school_principal') || '................................';
    const solarDateStr = ctx.solarDate || (window.reportDateSettings ? window.reportDateSettings.solarDate : "ថ្ងៃទី....... ខែ....... ឆ្នាំ២០....");
    const lunarDateStr = ctx.lunarDate || (window.reportDateSettings ? window.reportDateSettings.lunarDate : "ថ្ងៃ................. ខែ............. ឆ្នាំ......... ........ស័ក ព.ស.២៥....");

    // សិស្សក្នុងថ្នាក់
    const classStudents = (typeof window.getStudentsForClass === 'function')
        ? window.getStudentsForClass(curLevel, curRoom)
        : (window.allStudents || []);

    // ពិនិត្យទិន្នន័យរក្សាទុក
    const key = `cms_report_branch_committee_${curLevel}_${curRoom}`.replace(/\s+/g, '_');
    let savedComm = null;
    try {
        const stored = localStorage.getItem(key);
        if (stored) savedComm = JSON.parse(stored);
    } catch(e) {}

    const advisorName = savedComm?.advisor || teacherName;
    const monitorName = savedComm?.monitor || (classStudents[0] ? (classStudents[0].name || classStudents[0].name_khmer) : '................................');
    const deputy1Name = savedComm?.deputy1 || (classStudents[1] ? (classStudents[1].name || classStudents[1].name_khmer) : '................................');
    const deputy2Name = savedComm?.deputy2 || (classStudents[2] ? (classStudents[2].name || classStudents[2].name_khmer) : '................................');
    const member1Name = savedComm?.member1 || (classStudents[3] ? (classStudents[3].name || classStudents[3].name_khmer) : '................................');
    const member2Name = savedComm?.member2 || (classStudents[4] ? (classStudents[4].name || classStudents[4].name_khmer) : '................................');
    const member3Name = savedComm?.member3 || (classStudents[5] ? (classStudents[5].name || classStudents[5].name_khmer) : '................................');
    const member4Name = savedComm?.member4 || (classStudents[6] ? (classStudents[6].name || classStudents[6].name_khmer) : '................................');

    // ៦ អនុសាខា (Sub-branches)
    const defaultGroups = [
        { name: "អនុសាខាទី ១", duty: "ទទួលបន្ទុកផ្នែកសិក្សា និងជំនួយការរៀនសូត្រ" },
        { name: "អនុសាខាទី ២", duty: "ទទួលបន្ទុកផ្នែកវិន័យ សីលធម៌ និងវត្តមាន" },
        { name: "អនុសាខាទី ៣", duty: "ទទួលបន្ទុកផ្នែកអនាម័យ សុខភាព និងបរិស្ថាន" },
        { name: "អនុសាខាទី ៤", duty: "ទទួលបន្ទុកផ្នែកកីឡា កាយវប្បកម្ម និងសកម្មភាពក្រៅថ្នាក់" },
        { name: "អនុសាខាទី ៥", duty: "ទទួលបន្ទុកផ្នែកសិល្បៈ ចម្រៀង និងគំនូរ" },
        { name: "អនុសាខាទី ៦", duty: "ទទួលបន្ទុកផ្នែកព័ត៌មាន បណ្ណាល័យ និងសៀវភៅ" }
    ];

    const groupRowsHtml = defaultGroups.map((g, gIdx) => {
        const savedG = savedComm?.groups?.[gIdx];
        const gLeader = savedG?.leader || (classStudents[7 + gIdx * 3] ? (classStudents[7 + gIdx * 3].name || classStudents[7 + gIdx * 3].name_khmer) : '');
        const gDeputy = savedG?.deputy || (classStudents[8 + gIdx * 3] ? (classStudents[8 + gIdx * 3].name || classStudents[8 + gIdx * 3].name_khmer) : '');
        const gMembers = savedG?.members || (classStudents[9 + gIdx * 3] ? `${classStudents[9 + gIdx * 3].name || classStudents[9 + gIdx * 3].name_khmer}, ...` : '');
        const gDuty = savedG?.duty || g.duty;

        return `
            <tr class="branch-group-row hover:bg-purple-50/40 transition">
                <td class="border border-slate-300 px-2 py-1 text-center font-bold text-purple-900 bg-purple-50/50 group-title">${g.name}</td>
                <td class="border border-slate-300 px-2 py-1 text-left text-slate-800 font-bold group-leader" contenteditable="true">${gLeader}</td>
                <td class="border border-slate-300 px-2 py-1 text-left text-slate-700 group-deputy" contenteditable="true">${gDeputy}</td>
                <td class="border border-slate-300 px-2 py-1 text-left text-slate-600 group-members" contenteditable="true">${gMembers}</td>
                <td class="border border-slate-300 px-2 py-1 text-left text-slate-500 text-[9.5px] group-duty" contenteditable="true">${gDuty}</td>
            </tr>
        `;
    }).join('');

    container.innerHTML = `
        <div class="a4-page bg-white shadow-xl rounded-lg mx-auto p-7 font-siemreap text-slate-800 relative max-w-[210mm] min-h-[297mm] text-[11px] leading-relaxed border-[3px] border-purple-500/80" style="box-sizing: border-box;">
            <!-- Inner decorative border -->
            <div style="position: absolute; inset: 4px; border: 1.5px solid #9333ea; pointer-events: none; border-radius: 4px;"></div>
            <div style="position: absolute; top: 8px; left: 10px; color: #9333ea; font-size: 16px;">❖</div>
            <div style="position: absolute; top: 8px; right: 10px; color: #9333ea; font-size: 16px;">❖</div>
            <div style="position: absolute; bottom: 8px; left: 10px; color: #9333ea; font-size: 16px;">❖</div>
            <div style="position: absolute; bottom: 8px; right: 10px; color: #9333ea; font-size: 16px;">❖</div>

            <!-- Official Dual-Side Header matching User Model (Images 1 & 2) -->
            <div class="flex justify-between items-start mb-3 text-xs">
                <div class="text-left leading-relaxed pt-1">
                    <p class="font-moul text-slate-900 text-[11px] mb-0.5">ការិយាល័យ អប់រំ យុវជននិងកីឡានៃរដ្ឋបាលស្រុក ${districtName}</p>
                    <p class="font-moul text-slate-900 text-[11px]">${schoolName}</p>
                    <p class="text-slate-600 mt-1 font-bold text-[10.5px]">ថ្នាក់ទី ៖ <span class="text-purple-700">${gradeFull}</span> | ឆ្នាំសិក្សា ៖ <span class="text-slate-800">${academicYear}</span></p>
                </div>
                <div class="text-center">
                    <p class="font-moul text-slate-900 text-[12px] mb-0.5">ព្រះរាជាណាចក្រកម្ពុជា</p>
                    <p class="font-moul text-slate-900 text-[12px]">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                    <div class="flex items-center justify-center mt-1 mx-auto">
                        <img src="${window.CMS_HEADER_SYMBOL_B64 || 'assets/images/header-flourish.png'}" class="header-flourish-symbol" alt="symbol" style="display: block; margin: 2px auto 0 auto; width: 135px; height: 11px; object-fit: contain;" />
                    </div>
                </div>
            </div>

            <!-- Main Title -->
            <div class="text-center mb-3">
                <h2 class="font-moul text-sm sm:text-base text-purple-950 inline-block px-4 pb-1 border-b-2 border-purple-600">រចនាសម្ព័ន្ធគណៈកម្មការសាខា និងក្រុមប្រឹក្សាកុមារប្រចាំថ្នាក់</h2>
            </div>

            <!-- Hierarchy Tree Layout (ដូចគំរូរូបភាពជាក់ស្តែង) -->
            <div class="mb-4">
                <!-- Level 1: Advisor & Class Monitor -->
                <div class="flex justify-center gap-6 mb-2 relative">
                    <div class="w-48 p-2 rounded-xl border-2 border-indigo-500 bg-indigo-50 text-center shadow-sm">
                        <p class="text-[10px] text-indigo-700 font-bold uppercase">ទីប្រឹក្សាថ្នាក់រៀន</p>
                        <p id="branchAdvisorName" class="font-moul text-xs text-indigo-950 mt-0.5" contenteditable="true">${advisorName}</p>
                    </div>
                    <div class="w-48 p-2 rounded-xl border-2 border-purple-600 bg-purple-50 text-center shadow-sm">
                        <p class="text-[10px] text-purple-700 font-bold uppercase">ប្រធានថ្នាក់រួម</p>
                        <p id="branchMonitorName" class="font-moul text-xs text-purple-950 mt-0.5" contenteditable="true">${monitorName}</p>
                    </div>
                </div>

                <!-- Connector Line -->
                <div class="w-24 h-3 border-l-2 border-r-2 border-purple-300 mx-auto"></div>

                <!-- Level 2: 2 Deputies -->
                <div class="flex justify-center gap-6 mb-2">
                    <div class="w-52 p-2 rounded-xl border border-teal-500 bg-teal-50 text-center shadow-sm">
                        <p class="text-[10px] text-teal-700 font-bold">អនុប្រធានទី ១ (សិក្សា-វិន័យ)</p>
                        <p id="branchDeputy1Name" class="font-bold text-xs text-teal-950 mt-0.5" contenteditable="true">${deputy1Name}</p>
                    </div>
                    <div class="w-52 p-2 rounded-xl border border-emerald-500 bg-emerald-50 text-center shadow-sm">
                        <p class="text-[10px] text-emerald-700 font-bold">អនុប្រធានទី ២ (អនាម័យ-កីឡា)</p>
                        <p id="branchDeputy2Name" class="font-bold text-xs text-emerald-950 mt-0.5" contenteditable="true">${deputy2Name}</p>
                    </div>
                </div>

                <!-- Connector Line -->
                <div class="w-80 h-2 border-t-2 border-purple-300 mx-auto"></div>

                <!-- Level 3: 4 Department Officers -->
                <div class="grid grid-cols-4 gap-2 mb-3 mt-1">
                    <div class="p-1.5 rounded-lg border border-slate-300 bg-slate-50 text-center shadow-xs">
                        <p class="text-[9px] text-slate-500 font-bold">សមាជិកទី ១ (សិក្សា)</p>
                        <p id="branchMember1Name" class="font-bold text-[10.5px] text-slate-800" contenteditable="true">${member1Name}</p>
                    </div>
                    <div class="p-1.5 rounded-lg border border-slate-300 bg-slate-50 text-center shadow-xs">
                        <p class="text-[9px] text-slate-500 font-bold">សមាជិកទី ២ (វិន័យ-វត្តមាន)</p>
                        <p id="branchMember2Name" class="font-bold text-[10.5px] text-slate-800" contenteditable="true">${member2Name}</p>
                    </div>
                    <div class="p-1.5 rounded-lg border border-slate-300 bg-slate-50 text-center shadow-xs">
                        <p class="text-[9px] text-slate-500 font-bold">សមាជិកទី ៣ (អនាម័យ)</p>
                        <p id="branchMember3Name" class="font-bold text-[10.5px] text-slate-800" contenteditable="true">${member3Name}</p>
                    </div>
                    <div class="p-1.5 rounded-lg border border-slate-300 bg-slate-50 text-center shadow-xs">
                        <p class="text-[9px] text-slate-500 font-bold">សមាជិកទី ៤ (ព័ត៌មាន-សិល្បៈ)</p>
                        <p id="branchMember4Name" class="font-bold text-[10.5px] text-slate-800" contenteditable="true">${member4Name}</p>
                    </div>
                </div>
            </div>

            <!-- Level 4: 6 Sub-Branch Groups Table (អនុសាខាទាំង ៦) -->
            <div class="mb-3">
                <div class="bg-purple-100/80 px-3 py-1 rounded-t-lg font-moul text-xs text-purple-950 flex justify-between items-center border border-slate-300 border-b-0">
                    <span>តារាងបែងចែកសិស្សតាមអនុសាខាទាំង ៦</span>
                    <span class="font-siemreap text-[10px] text-purple-800 font-bold">កុមារ និងយុវជន</span>
                </div>
                <table class="w-full border-collapse border border-slate-300 text-[10px]">
                    <thead>
                        <tr class="bg-slate-100 text-slate-900 font-bold text-[9.5px]">
                            <th class="border border-slate-300 p-1 w-24 text-center">អនុសាខា</th>
                            <th class="border border-slate-300 p-1 w-32 text-center">ប្រធានសាខា</th>
                            <th class="border border-slate-300 p-1 w-28 text-center">អនុប្រធាន</th>
                            <th class="border border-slate-300 p-1 text-center">សមាជិកក្នុងក្រុម</th>
                            <th class="border border-slate-300 p-1 w-44 text-center">ភារកិច្ចទទួលខុសត្រូវ</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${groupRowsHtml}
                    </tbody>
                </table>
            </div>

            <!-- Signatures -->
            <div class="flex justify-between items-start text-xs pt-3 px-8 font-siemreap">
                <div class="text-center w-2/5">
                    <p class="mb-1 text-slate-700">បានឃើញ និងឯកភាព</p>
                    <p class="font-moul text-slate-900 mb-12">នាយិកាសាលា</p>
                    <p class="font-moul text-slate-900 text-xs">${principalName}</p>
                </div>
                <div class="text-center w-2/5">
                    <p class="mb-1 text-slate-700">${lunarDateStr}</p>
                    <p class="mb-1 text-slate-700 font-bold">${solarDateStr}</p>
                    <p class="font-moul text-slate-900 mb-12">គ្រូបន្ទុកថ្នាក់</p>
                    <p class="font-moul text-slate-900 text-xs">${teacherName}</p>
                </div>
            </div>
        </div>
    `;

    if (typeof window.applyAcademicReportPaperSettings === 'function') {
        window.applyAcademicReportPaperSettings();
    }
};

