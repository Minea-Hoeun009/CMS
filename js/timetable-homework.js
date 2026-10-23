// =========================================================================
// ឯកសារ js/timetable-homework.js - កាលវិភាគបង្រៀន & កិច្ចការផ្ទះ (Timetable & Homework)
// =========================================================================

window.TimetableHomeworkManager = {
    activeTab: 'timetable', // 'timetable' or 'homework'
    currentGrade: null,
    
    days: [
        { key: 'mon', label: 'ថ្ងៃច័ន្ទ' },
        { key: 'tue', label: 'ថ្ងៃអង្គារ' },
        { key: 'wed', label: 'ថ្ងៃពុធ' },
        { key: 'thu', label: 'ថ្ងៃព្រហស្បតិ៍' },
        { key: 'fri', label: 'ថ្ងៃសុក្រ' },
        { key: 'sat', label: 'ថ្ងៃសៅរ៍' }
    ],

    periods: [
        { slot: 1, session: 'morning', time: '០៧:០០ - ០៧:៥០', label: 'ម៉ោងទី ១ (ព្រឹក)' },
        { slot: 2, session: 'morning', time: '០៧:៥៥ - ០៨:៤៥', label: 'ម៉ោងទី ២ (ព្រឹក)' },
        { slot: 3, session: 'morning', time: '០៩:០០ - ០៩:៥០', label: 'ម៉ោងទី ៣ (ព្រឹក)' },
        { slot: 4, session: 'morning', time: '០៩:៥៥ - 10:45', label: 'ម៉ោងទី ៤ (ព្រឹក)' },
        { slot: 5, session: 'afternoon', time: '១៣:០០ - 13:50', label: 'ម៉ោងទី ១ (រសៀល)' },
        { slot: 6, session: 'afternoon', time: '១៣:៥៥ - 14:45', label: 'ម៉ោងទី ២ (រសៀល)' },
        { slot: 7, session: 'afternoon', time: '១៥:០០ - 15:50', label: 'ម៉ោងទី ៣ (រសៀល)' },
        { slot: 8, session: 'afternoon', time: '១៥:៥៥ - 16:45', label: 'ម៉ោងទី ៤ (រសៀល)' }
    ],

    subjects: [
        "ភាសាខ្មែរ", "គណិតវិទ្យា", "វិទ្យាសាស្ត្រ", "សិក្សាសង្គម", "ភាសាអង់គ្លេស", 
        "សិល្បៈ", "កីឡា", "គេហវិទ្យា", "បំណិនជីវិត", "ព័ត៌មានវិទ្យា"
    ],

    init: function() {
        const sInfo = window.appSettings || JSON.parse(localStorage.getItem('school_settings') || '{}');
        this.currentGrade = (sInfo.teacher_level && sInfo.teacher_room) 
            ? `${sInfo.teacher_level} ${sInfo.teacher_room}`.trim() 
            : "ថ្នាក់ទី ១ «ក»";
        this.renderView();
    },

    getTimetableData: function() {
        const key = `school_timetable_${this.currentGrade.replace(/\s+/g, '_')}`;
        return JSON.parse(localStorage.getItem(key) || '{}');
    },

    saveTimetableData: async function(data) {
        const key = `school_timetable_${this.currentGrade.replace(/\s+/g, '_')}`;
        localStorage.setItem(key, JSON.stringify(data));

        if (window.db) {
            try {
                await window.db.collection("timetables").doc(key).set({
                    grade: this.currentGrade,
                    schedule: data,
                    last_updated: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            } catch(e) { console.warn("Firestore timetable save:", e); }
        }

        if (typeof window.logAudit === 'function') {
            window.logAudit('UPDATE_TIMETABLE', 'system', `បានកែសម្រួលកាលវិភាគបង្រៀនថ្នាក់ ${this.currentGrade}`);
        }
    },

    getHomeworkList: function() {
        return JSON.parse(localStorage.getItem('school_homework_list') || '[]');
    },

    saveHomeworkList: async function(list) {
        localStorage.setItem('school_homework_list', JSON.stringify(list));

        if (window.db) {
            try {
                await window.db.collection("homework").doc("all_assignments").set({
                    assignments: list,
                    last_updated: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            } catch(e) { console.warn("Firestore homework save:", e); }
        }
    },

    renderView: function() {
        const container = document.getElementById("timetableHomeworkContainer");
        if (!container) return;

        container.innerHTML = `
            <div class="max-w-[1600px] mx-auto space-y-6 animate-fade-in font-siemreap pb-20">
                
                <!-- Header Banner -->
                <div class="bg-gradient-to-r from-teal-900 via-emerald-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden border border-emerald-800/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div class="absolute -right-10 -top-10 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
                    <div class="relative z-10">
                        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-3 border border-emerald-400/30">
                            <i class="fa-solid fa-clock"></i> ការគ្រប់គ្រងពេលវេលា & ការសិក្សា
                        </div>
                        <h2 class="text-2xl md:text-3xl font-black font-moul tracking-wide drop-shadow-md">កាលវិភាគបង្រៀន & កិច្ចការផ្ទះ</h2>
                        <p class="text-sm text-emerald-200 mt-1 font-medium">រៀបចំកាលវិភាគប្រចាំសប្តាហ៍ និងតាមដានការប្រគល់កិច្ចការផ្ទះរបស់សិស្ស</p>
                    </div>

                    <!-- Navigation Switch Tabs -->
                    <div class="flex items-center gap-2 bg-black/30 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 relative z-10">
                        <button onclick="window.TimetableHomeworkManager.switchTab('timetable')" id="tabBtnTimetable" class="px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${this.activeTab === 'timetable' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-300 hover:text-white'}">
                            <i class="fa-solid fa-calendar-days"></i> កាលវិភាគបង្រៀន
                        </button>
                        <button onclick="window.TimetableHomeworkManager.switchTab('homework')" id="tabBtnHomework" class="px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${this.activeTab === 'homework' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-300 hover:text-white'}">
                            <i class="fa-solid fa-book-open-reader"></i> កិច្ចការផ្ទះ & Assignment
                        </button>
                    </div>
                </div>

                <!-- Tab Content 1: Timetable -->
                <div id="tabContentTimetable" class="${this.activeTab === 'timetable' ? 'block' : 'hidden'} space-y-6">
                    <div class="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
                            <div>
                                <h3 class="font-moul text-slate-800 dark:text-white text-base">កាលវិភាគបង្រៀនប្រចាំសប្តាហ៍ (${this.currentGrade})</h3>
                                <p class="text-xs text-slate-400 mt-1">ចុចលើចន្លោះម៉ោងនីមួយៗដើម្បីជ្រើសរើសមុខវិជ្ជា និងបន្ទប់</p>
                            </div>
                            <div class="flex items-center gap-3">
                                <button onclick="window.print()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-2">
                                    <i class="fa-solid fa-print"></i> បោះពុម្ព
                                </button>
                                <button onclick="window.TimetableHomeworkManager.resetTimetable()" class="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition flex items-center gap-2">
                                    <i class="fa-solid fa-rotate-left"></i> សម្អាតកាលវិភាគ
                                </button>
                            </div>
                        </div>

                        <!-- Timetable Grid -->
                        <div class="overflow-x-auto custom-scrollbar">
                            <table class="w-full border-collapse border border-slate-200 dark:border-slate-700 text-xs text-center font-siemreap">
                                <thead>
                                    <tr class="bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-200 font-bold">
                                        <th class="border border-slate-200 dark:border-slate-700 p-3 w-36">ម៉ោងសិក្សា</th>
                                        ${this.days.map(d => `<th class="border border-slate-200 dark:border-slate-700 p-3 font-moul text-indigo-900 dark:text-indigo-300">${d.label}</th>`).join("")}
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- Morning Header -->
                                    <tr class="bg-emerald-50/70 dark:bg-emerald-950/30 font-bold text-emerald-800 dark:text-emerald-300">
                                        <td colspan="7" class="border border-slate-200 dark:border-slate-700 py-1.5 text-left px-4">
                                            <i class="fa-solid fa-sun mr-2 text-amber-500"></i> វេនព្រឹក (Morning Session)
                                        </td>
                                    </tr>
                                    ${this.periods.filter(p => p.session === 'morning').map(p => this.renderPeriodRow(p)).join("")}

                                    <!-- Afternoon Header -->
                                    <tr class="bg-blue-50/70 dark:bg-blue-950/30 font-bold text-blue-800 dark:text-blue-300">
                                        <td colspan="7" class="border border-slate-200 dark:border-slate-700 py-1.5 text-left px-4">
                                            <i class="fa-solid fa-cloud-sun mr-2 text-blue-500"></i> វេនរសៀល (Afternoon Session)
                                        </td>
                                    </tr>
                                    ${this.periods.filter(p => p.session === 'afternoon').map(p => this.renderPeriodRow(p)).join("")}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Tab Content 2: Homework -->
                <div id="tabContentHomework" class="${this.activeTab === 'homework' ? 'block' : 'hidden'} space-y-6">
                    <div class="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
                            <div>
                                <h3 class="font-moul text-slate-800 dark:text-white text-base">កិច្ចការផ្ទះ & កិច្ចការស្រាវជ្រាវ (Homework Tracker)</h3>
                                <p class="text-xs text-slate-400 mt-1">ដាក់កិច្ចការផ្ទះ និងតាមដានការប្រគល់របស់សិស្សក្នុងថ្នាក់</p>
                            </div>
                            <button onclick="window.TimetableHomeworkManager.openNewHomeworkModal()" class="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2">
                                <i class="fa-solid fa-plus"></i> បង្កើតកិច្ចការផ្ទះថ្មី
                            </button>
                        </div>

                        <!-- Homework Cards Grid -->
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="homeworkCardsGrid">
                            <!-- Populated dynamically -->
                        </div>
                    </div>
                </div>

            </div>

            <!-- Modal Edit Timetable Cell -->
            <div id="editSlotModal" class="hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-siemreap">
                <div class="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 dark:border-slate-700 animate-scale-up">
                    <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700 mb-4">
                        <h4 class="font-moul text-sm text-slate-800 dark:text-white" id="editSlotTitle">កំណត់មុខវិជ្ជា</h4>
                        <button onclick="window.TimetableHomeworkManager.closeSlotModal()" class="text-slate-400 hover:text-slate-600 dark:hover:text-white"><i class="fa-solid fa-xmark text-lg"></i></button>
                    </div>
                    <form id="editSlotForm" onsubmit="window.TimetableHomeworkManager.handleSaveSlot(event)" class="space-y-4">
                        <input type="hidden" id="slotDayKey">
                        <input type="hidden" id="slotIndex">
                        
                        <div>
                            <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">មុខវិជ្ជា</label>
                            <select id="slotSubjectSelect" class="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500">
                                <option value="">-- ទំនេរ / គ្មានម៉ោង --</option>
                                ${this.subjects.map(s => `<option value="${s}">${s}</option>`).join("")}
                            </select>
                        </div>

                        <div>
                            <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">បន្ទប់រៀន / ទីតាំង</label>
                            <input type="text" id="slotRoomInput" placeholder="ឧ. បន្ទប់ ១០១ ឬ ទីលាន" class="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500">
                        </div>

                        <div>
                            <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">ចំណាំបន្ថែម (Optional)</label>
                            <input type="text" id="slotNoteInput" placeholder="ឧ. យកសៀវភៅលំហាត់មកផង" class="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500">
                        </div>

                        <div class="flex justify-end gap-2 pt-2">
                            <button type="button" onclick="window.TimetableHomeworkManager.closeSlotModal()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold">បោះបង់</button>
                            <button type="submit" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md">រក្សាទុក</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Modal Create Homework -->
            <div id="newHomeworkModal" class="hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-siemreap">
                <div class="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-slate-200 dark:border-slate-700 animate-scale-up">
                    <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700 mb-4">
                        <h4 class="font-moul text-sm text-slate-800 dark:text-white">បង្កើតកិច្ចការផ្ទះថ្មី</h4>
                        <button onclick="window.TimetableHomeworkManager.closeNewHomeworkModal()" class="text-slate-400 hover:text-slate-600 dark:hover:text-white"><i class="fa-solid fa-xmark text-lg"></i></button>
                    </div>
                    <form id="newHomeworkForm" onsubmit="window.TimetableHomeworkManager.handleSaveHomework(event)" class="space-y-4">
                        <div>
                            <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">មុខវិជ្ជា</label>
                            <select id="hwSubject" required class="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500">
                                ${this.subjects.map(s => `<option value="${s}">${s}</option>`).join("")}
                            </select>
                        </div>

                        <div>
                            <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">ចំណងជើងកិច្ចការ</label>
                            <input type="text" id="hwTitle" required placeholder="ឧ. លំហាត់ប្រភាគ ទំព័រ ៤៥" class="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500">
                        </div>

                        <div>
                            <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">ការណែនាំ / សេចក្តីលម្អិត</label>
                            <textarea id="hwDesc" rows="3" placeholder="សរសេរការណែនាំដល់សិស្ស..." class="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"></textarea>
                        </div>

                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">កាលបរិច្ឆេទប្រគល់ (Due Date)</label>
                                <input type="date" id="hwDueDate" required class="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">ពិន្ទុអតិបរមា</label>
                                <input type="number" id="hwMaxScore" value="10" min="1" max="100" class="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500">
                            </div>
                        </div>

                        <div class="flex justify-end gap-2 pt-2">
                            <button type="button" onclick="window.TimetableHomeworkManager.closeNewHomeworkModal()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold">បោះបង់</button>
                            <button type="submit" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md">ដាក់កិច្ចការ</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Modal Submission Tracker -->
            <div id="hwSubmissionModal" class="hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-siemreap">
                <div class="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-700 animate-scale-up">
                    <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700 mb-4">
                        <div>
                            <h4 class="font-moul text-base text-slate-800 dark:text-white" id="subModalHwTitle">តាមដានការប្រគល់កិច្ចការ</h4>
                            <span class="text-xs text-slate-400 font-medium" id="subModalHwSubtitle">ថ្នាក់ទី ១ «ក»</span>
                        </div>
                        <button onclick="window.TimetableHomeworkManager.closeSubmissionModal()" class="text-slate-400 hover:text-slate-600 dark:hover:text-white"><i class="fa-solid fa-xmark text-lg"></i></button>
                    </div>

                    <div class="overflow-x-auto custom-scrollbar">
                        <table class="w-full text-xs text-left">
                            <thead>
                                <tr class="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold">
                                    <th class="p-3">ល.រ</th>
                                    <th class="p-3">អត្តលេខ</th>
                                    <th class="p-3">គោត្តនាម និងនាម</th>
                                    <th class="p-3 text-center">ស្ថានភាពប្រគល់</th>
                                    <th class="p-3 text-center w-28">ពិន្ទុទទួលបាន</th>
                                </tr>
                            </thead>
                            <tbody id="subStudentsTableBody">
                                <!-- Populated dynamically -->
                            </tbody>
                        </table>
                    </div>

                    <div class="flex justify-end gap-2 pt-6 mt-4 border-t border-slate-100 dark:border-slate-700">
                        <button onclick="window.TimetableHomeworkManager.closeSubmissionModal()" class="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold">បិទ</button>
                    </div>
                </div>
            </div>
        `;

        this.renderHomeworkCards();
    },

    switchTab: function(tab) {
        this.activeTab = tab;
        const tabTimetable = document.getElementById("tabContentTimetable");
        const tabHomework = document.getElementById("tabContentHomework");
        const btnTimetable = document.getElementById("tabBtnTimetable");
        const btnHomework = document.getElementById("tabBtnHomework");

        if (tab === 'timetable') {
            tabTimetable?.classList.remove('hidden');
            tabHomework?.classList.add('hidden');
            btnTimetable?.classList.add('bg-emerald-600', 'text-white', 'shadow-md');
            btnTimetable?.classList.remove('text-slate-300');
            btnHomework?.classList.remove('bg-emerald-600', 'text-white', 'shadow-md');
            btnHomework?.classList.add('text-slate-300');
        } else {
            tabTimetable?.classList.add('hidden');
            tabHomework?.classList.remove('hidden');
            btnHomework?.classList.add('bg-emerald-600', 'text-white', 'shadow-md');
            btnHomework?.classList.remove('text-slate-300');
            btnTimetable?.classList.remove('bg-emerald-600', 'text-white', 'shadow-md');
            btnTimetable?.classList.add('text-slate-300');
            this.renderHomeworkCards();
        }
    },

    renderPeriodRow: function(period) {
        const data = this.getTimetableData();

        return `
            <tr>
                <td class="border border-slate-200 dark:border-slate-700 p-2.5 bg-slate-50 dark:bg-slate-800">
                    <span class="font-bold text-slate-800 dark:text-white block">${period.label.split(' ')[0]} ${period.label.split(' ')[1]}</span>
                    <span class="text-[10px] text-slate-400 font-mono block">${period.time}</span>
                </td>
                ${this.days.map(d => {
                    const slotData = data[`${d.key}_${period.slot}`] || {};
                    const hasSub = !!slotData.subject;
                    return `
                        <td onclick="window.TimetableHomeworkManager.openSlotModal('${d.key}', ${period.slot}, '${d.label}', '${period.label}')" class="border border-slate-200 dark:border-slate-700 p-2 cursor-pointer hover:bg-emerald-50/50 dark:hover:bg-slate-700/50 transition">
                            ${hasSub ? `
                                <div class="bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 rounded-xl p-2 border border-indigo-200/60 dark:border-indigo-800/60 shadow-sm">
                                    <span class="font-bold text-xs block mb-0.5">${slotData.subject}</span>
                                    ${slotData.room ? `<span class="text-[10px] text-indigo-500 font-mono block">${slotData.room}</span>` : ''}
                                </div>
                            ` : `
                                <span class="text-slate-300 dark:text-slate-600 text-[11px]">- ទំនេរ -</span>
                            `}
                        </td>
                    `;
                }).join("")}
            </tr>
        `;
    },

    openSlotModal: function(dayKey, slotIndex, dayLabel, periodLabel) {
        const modal = document.getElementById("editSlotModal");
        if (!modal) return;

        const data = this.getTimetableData();
        const slotData = data[`${dayKey}_${slotIndex}`] || {};

        document.getElementById("slotDayKey").value = dayKey;
        document.getElementById("slotIndex").value = slotIndex;
        document.getElementById("editSlotTitle").textContent = `${dayLabel} - ${periodLabel}`;
        document.getElementById("slotSubjectSelect").value = slotData.subject || "";
        document.getElementById("slotRoomInput").value = slotData.room || "";
        document.getElementById("slotNoteInput").value = slotData.note || "";

        modal.classList.remove("hidden");
    },

    closeSlotModal: function() {
        const modal = document.getElementById("editSlotModal");
        if (modal) modal.classList.add("hidden");
    },

    handleSaveSlot: function(e) {
        e.preventDefault();
        const dayKey = document.getElementById("slotDayKey").value;
        const slotIndex = document.getElementById("slotIndex").value;
        const subject = document.getElementById("slotSubjectSelect").value;
        const room = document.getElementById("slotRoomInput").value;
        const note = document.getElementById("slotNoteInput").value;

        const data = this.getTimetableData();
        data[`${dayKey}_${slotIndex}`] = { subject, room, note };
        this.saveTimetableData(data);

        this.closeSlotModal();
        this.renderView();
        if (typeof showToast === 'function') showToast("✅ រក្សាទុកកាលវិភាគបានជោគជ័យ!");
    },

    resetTimetable: function() {
        if (!confirm("តើអ្នកពិតជាចង់សម្អាតកាលវិភាគទាំងអស់មែនទេ?")) return;
        this.saveTimetableData({});
        this.renderView();
        if (typeof showToast === 'function') showToast("បានសម្អាតកាលវិភាគជោគជ័យ!");
    },

    // Homework Management
    renderHomeworkCards: function() {
        const grid = document.getElementById("homeworkCardsGrid");
        if (!grid) return;

        let list = this.getHomeworkList();
        if (list.length === 0) {
            // Seed a realistic sample assignment
            list = [
                {
                    id: "hw_" + Date.now(),
                    subject: "គណិតវិទ្យា",
                    title: "លំហាត់ប្រភាគ ទំព័រ ៥២ ដល់ ៥៤",
                    desc: "ធ្វើលំហាត់លេខ ១ ដល់លេខ ៥ ក្នុងសៀវភៅពុម្ពគណិតវិទ្យា ហើយយកមកប្រគល់នៅម៉ោងរៀនបន្ទាប់។",
                    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
                    maxScore: 10,
                    grade: this.currentGrade,
                    submissions: {}
                }
            ];
            this.saveHomeworkList(list);
        }

        grid.innerHTML = list.map(hw => {
            const isDue = new Date(hw.dueDate) < new Date();
            const subCount = Object.keys(hw.submissions || {}).length;
            const students = window.allStudents || JSON.parse(localStorage.getItem('academic_students') || '[]');
            const totalStudents = students.length || 30;

            return `
                <div class="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-600 flex flex-col justify-between hover:shadow-md transition">
                    <div>
                        <div class="flex items-center justify-between mb-2">
                            <span class="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                                ${hw.subject}
                            </span>
                            <span class="text-[11px] font-mono ${isDue ? 'text-rose-500 font-bold' : 'text-slate-400'}">
                                <i class="fa-solid fa-clock mr-1"></i> កាលកំណត់៖ ${hw.dueDate}
                            </span>
                        </div>
                        <h4 class="font-bold text-slate-800 dark:text-white text-sm mb-1">${hw.title}</h4>
                        <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">${hw.desc || 'គ្មានការពិពណ៌នា'}</p>
                    </div>

                    <div class="pt-3 border-t border-slate-200 dark:border-slate-600 flex items-center justify-between">
                        <span class="text-xs text-slate-600 dark:text-slate-300 font-bold">
                            <i class="fa-solid fa-check-double text-emerald-500 mr-1"></i> បានប្រគល់៖ <span class="font-mono text-emerald-600">${subCount}/${totalStudents}</span>
                        </span>
                        <div class="flex items-center gap-2">
                            <button onclick="window.TimetableHomeworkManager.openSubmissionModal('${hw.id}')" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition">
                                តាមដានការប្រគល់
                            </button>
                            <button onclick="window.TimetableHomeworkManager.deleteHomework('${hw.id}')" class="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/40 rounded-lg transition" title="លុបកិច្ចការ">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join("");
    },

    openNewHomeworkModal: function() {
        const modal = document.getElementById("newHomeworkModal");
        if (modal) modal.classList.remove("hidden");
    },

    closeNewHomeworkModal: function() {
        const modal = document.getElementById("newHomeworkModal");
        if (modal) modal.classList.add("hidden");
    },

    handleSaveHomework: function(e) {
        e.preventDefault();
        const subject = document.getElementById("hwSubject").value;
        const title = document.getElementById("hwTitle").value;
        const desc = document.getElementById("hwDesc").value;
        const dueDate = document.getElementById("hwDueDate").value;
        const maxScore = parseFloat(document.getElementById("hwMaxScore").value) || 10;

        const newHw = {
            id: "hw_" + Date.now(),
            subject,
            title,
            desc,
            dueDate,
            maxScore,
            grade: this.currentGrade,
            submissions: {}
        };

        const list = this.getHomeworkList();
        list.unshift(newHw);
        this.saveHomeworkList(list);

        if (typeof window.logAudit === 'function') {
            window.logAudit('CREATE_HOMEWORK', 'homework', `បានដាក់កិច្ចការផ្ទះ «${title}» មុខវិជ្ជា ${subject} កាលកំណត់ ${dueDate}`);
        }

        this.closeNewHomeworkModal();
        this.renderHomeworkCards();
        if (typeof showToast === 'function') showToast("✅ ដាក់កិច្ចការផ្ទះបានជោគជ័យ!");
    },

    deleteHomework: function(hwId) {
        if (!confirm("តើអ្នកពិតជាចង់លុបកិច្ចការផ្ទះនេះមែនទេ?")) return;
        let list = this.getHomeworkList();
        list = list.filter(h => h.id !== hwId);
        this.saveHomeworkList(list);
        this.renderHomeworkCards();
        if (typeof showToast === 'function') showToast("បានលុបកិច្ចការផ្ទះរួចរាល់!");
    },

    openSubmissionModal: function(hwId) {
        const list = this.getHomeworkList();
        const hw = list.find(h => h.id === hwId);
        if (!hw) return;

        const modal = document.getElementById("hwSubmissionModal");
        const tbody = document.getElementById("subStudentsTableBody");
        if (!modal || !tbody) return;

        document.getElementById("subModalHwTitle").textContent = hw.title;
        document.getElementById("subModalHwSubtitle").textContent = `មុខវិជ្ជា៖ ${hw.subject} | កាលបរិច្ឆេទប្រគល់៖ ${hw.dueDate}`;

        const students = window.allStudents || JSON.parse(localStorage.getItem('academic_students') || '[]');

        tbody.innerHTML = students.map((stu, idx) => {
            const sub = hw.submissions ? hw.submissions[stu.id] : null;
            const isDone = !!sub;
            const score = sub ? sub.score : "";

            return `
                <tr class="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td class="p-3 font-mono">${idx + 1}</td>
                    <td class="p-3 font-mono font-bold">${stu.id}</td>
                    <td class="p-3 font-bold text-slate-800 dark:text-white">${stu.name}</td>
                    <td class="p-3 text-center">
                        <label class="inline-flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" onchange="window.TimetableHomeworkManager.toggleStudentSubmission('${hw.id}', '${stu.id}', this.checked)" ${isDone ? 'checked' : ''} class="w-4 h-4 text-emerald-600 rounded">
                            <span class="text-xs font-bold ${isDone ? 'text-emerald-600' : 'text-slate-400'}">${isDone ? 'បានប្រគល់' : 'មិនទាន់'}</span>
                        </label>
                    </td>
                    <td class="p-3 text-center">
                        <input type="number" min="0" max="${hw.maxScore}" value="${score}" placeholder="0" onchange="window.TimetableHomeworkManager.updateStudentHwScore('${hw.id}', '${stu.id}', this.value)" class="w-16 text-center bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-1 text-xs font-mono font-bold outline-none">
                    </td>
                </tr>
            `;
        }).join("");

        modal.classList.remove("hidden");
    },

    toggleStudentSubmission: function(hwId, studentId, isDone) {
        const list = this.getHomeworkList();
        const hw = list.find(h => h.id === hwId);
        if (!hw) return;

        if (!hw.submissions) hw.submissions = {};
        if (isDone) {
            hw.submissions[studentId] = { done: true, score: hw.submissions[studentId]?.score || 10 };
        } else {
            delete hw.submissions[studentId];
        }
        this.saveHomeworkList(list);
    },

    updateStudentHwScore: function(hwId, studentId, score) {
        const list = this.getHomeworkList();
        const hw = list.find(h => h.id === hwId);
        if (!hw) return;

        if (!hw.submissions) hw.submissions = {};
        if (!hw.submissions[studentId]) hw.submissions[studentId] = { done: true };
        hw.submissions[studentId].score = parseFloat(score) || 0;
        this.saveHomeworkList(list);
    },

    closeSubmissionModal: function() {
        const modal = document.getElementById("hwSubmissionModal");
        if (modal) modal.classList.add("hidden");
        this.renderHomeworkCards();
    }
};

window.loadTimetableHomeworkView = function() {
    window.TimetableHomeworkManager.init();
};
