// =========================================================================
// ឯកសារ js/timetable-homework.js - ប្រព័ន្ធរៀបចំកាលវិភាគបង្រៀន & កិច្ចការផ្ទះ (Smart Timetable & Homework Manager)
// កំណែអភិវឌ្ឍន៍ពិសេសសម្រាប់ Admin៖ រៀបចំកាលវិភាគតាមថ្នាក់, មុខងារឆ្លាតវៃ (AI/Smart Generator) និងត្រួតពិនិត្យភាពជាន់ម៉ោងគ្រូ
// =========================================================================

window.TimetableHomeworkManager = {
    activeTab: 'timetable', // 'timetable' or 'homework'
    currentGrade: null,
    currentAcademicYear: '2026-2027',

    days: [
        { key: 'mon', label: 'ថ្ងៃច័ន្ទ', short: 'ច័ន្ទ' },
        { key: 'tue', label: 'ថ្ងៃអង្គារ', short: 'អង្គារ' },
        { key: 'wed', label: 'ថ្ងៃពុធ', short: 'ពុធ' },
        { key: 'thu', label: 'ថ្ងៃព្រហស្បតិ៍', short: 'ព្រហ' },
        { key: 'fri', label: 'ថ្ងៃសុក្រ', short: 'សុក្រ' },
        { key: 'sat', label: 'ថ្ងៃសៅរ៍', short: 'សៅរ៍' }
    ],

    periods: [
        { slot: 1, session: 'morning', time: '០៧:០០ - ០៧:៤០', label: 'ម៉ោងទី ១ (ព្រឹក)' },
        { slot: 2, session: 'morning', time: '០៧:៤០ - ០៨:២០', label: 'ម៉ោងទី ២ (ព្រឹក)' },
        { slot: 3, session: 'morning', time: '០៨:៣៥ - ០៩:១៥', label: 'ម៉ោងទី ៣ (ព្រឹក)' },
        { slot: 4, session: 'morning', time: '០៩:៣០ - ១០:១០', label: 'ម៉ោងទី ៤ (ព្រឹក)' },
        { slot: 5, session: 'morning', time: '១០:១០ - ១០:៥០', label: 'ម៉ោងទី ៥ (ព្រឹក)' },
        { slot: 6, session: 'afternoon', time: '០១:០០ - ០១:៤០', label: 'ម៉ោងទី ១ (រសៀល)' },
        { slot: 7, session: 'afternoon', time: '០១:៤០ - ០២:២០', label: 'ម៉ោងទី ២ (រសៀល)' },
        { slot: 8, session: 'afternoon', time: '០២:៣៥ - ០៣:១៥', label: 'ម៉ោងទី ៣ (រសៀល)' },
        { slot: 9, session: 'afternoon', time: '០៣:៣០ - ០៤:១០', label: 'ម៉ោងទី ៤ (រសៀល)' },
        { slot: 10, session: 'afternoon', time: '០៤:១០ - ០៤:៥០', label: 'ម៉ោងទី ៥ (រសៀល)' }
    ],

    defaultPeriods: [
        { slot: 1, session: 'morning', time: '០៧:០០ - ០៧:៤០', label: 'ម៉ោងទី ១ (ព្រឹក)' },
        { slot: 2, session: 'morning', time: '០៧:៤០ - ០៨:២០', label: 'ម៉ោងទី ២ (ព្រឹក)' },
        { slot: 3, session: 'morning', time: '០៨:៣៥ - ០៩:១៥', label: 'ម៉ោងទី ៣ (ព្រឹក)' },
        { slot: 4, session: 'morning', time: '០៩:៣០ - ១០:១០', label: 'ម៉ោងទី ៤ (ព្រឹក)' },
        { slot: 5, session: 'morning', time: '១០:១០ - ១០:៥០', label: 'ម៉ោងទី ៥ (ព្រឹក)' },
        { slot: 6, session: 'afternoon', time: '០១:០០ - ០១:៤០', label: 'ម៉ោងទី ១ (រសៀល)' },
        { slot: 7, session: 'afternoon', time: '០១:៤០ - ០២:២០', label: 'ម៉ោងទី ២ (រសៀល)' },
        { slot: 8, session: 'afternoon', time: '០២:៣៥ - ០៣:១៥', label: 'ម៉ោងទី ៣ (រសៀល)' },
        { slot: 9, session: 'afternoon', time: '០៣:៣០ - ០៤:១០', label: 'ម៉ោងទី ៤ (រសៀល)' },
        { slot: 10, session: 'afternoon', time: '០៤:១០ - ០៤:៥០', label: 'ម៉ោងទី ៥ (រសៀល)' }
    ],

    getRecessTimes: function() {
        try {
            const saved = localStorage.getItem('cms_custom_timetable_recess');
            if (saved) {
                const p = JSON.parse(saved);
                return {
                    morning1: p.morning1 || p.morning || '០៨:២០ - ០៨:៣៥',
                    morning2: p.morning2 || '០៩:១៥ - ០៩:៣០',
                    afternoon1: p.afternoon1 || p.afternoon || '០២:២០ - ០២:៣៥',
                    afternoon2: p.afternoon2 || '០៣:១៥ - ០៣:៣០',
                    flagMorning: p.flagMorning || '០៦:៥០ - ០៧:០០',
                    flagAfternoon: p.flagAfternoon || '០៤:៥០ - ០៥:០០'
                };
            }
        } catch(e) {}
        return {
            morning1: '០៨:២០ - ០៨:៣៥',
            morning2: '០៩:១៥ - ០៩:៣០',
            afternoon1: '០២:២០ - ០២:៣៥',
            afternoon2: '០៣:១៥ - ០៣:៣០',
            flagMorning: '០៦:៥០ - ០៧:០០',
            flagAfternoon: '០៤:៥០ - ០៥:០០'
        };
    },

    saveRecessTimes: function(m1, m2, a1, a2, fm, fa) {
        const toKh = typeof window.toKhmerNum === 'function' ? window.toKhmerNum : String;
        const data = {
            morning1: m1 ? toKh(m1.trim()) : '០៨:២០ - ០៨:៣៥',
            morning2: m2 ? toKh(m2.trim()) : '០៩:១៥ - ០៩:៣០',
            afternoon1: a1 ? toKh(a1.trim()) : '០២:២០ - ០២:៣៥',
            afternoon2: a2 ? toKh(a2.trim()) : '០៣:១៥ - ០៣:៣០',
            flagMorning: fm ? toKh(fm.trim()) : '០៦:៥០ - ០៧:០០',
            flagAfternoon: fa ? toKh(fa.trim()) : '០៤:៥០ - ០៥:០០'
        };
        localStorage.setItem('cms_custom_timetable_recess', JSON.stringify(data));
        return data;
    },

    loadPeriods: function() {
        try {
            const saved = localStorage.getItem('cms_custom_timetable_periods');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length >= 10) {
                    this.periods = parsed;
                    return;
                }
            }
        } catch (e) {
            console.error("កំហុសក្នុងការទាញយកម៉ោងសិក្សា:", e);
        }
        this.periods = JSON.parse(JSON.stringify(this.defaultPeriods));
    },

    saveCustomPeriods: function() {
        const newPeriods = JSON.parse(JSON.stringify(this.periods));
        for (let i = 1; i <= this.periods.length; i++) {
            const timeInp = document.getElementById(`custom_period_time_${i}`);
            const labelInp = document.getElementById(`custom_period_label_${i}`);
            const target = newPeriods.find(p => p.slot === i);
            if (target) {
                if (timeInp && timeInp.value.trim()) {
                    let val = timeInp.value.trim();
                    if (window.toKhmerNum) val = window.toKhmerNum(val);
                    target.time = val;
                }
                if (labelInp && labelInp.value.trim()) {
                    target.label = labelInp.value.trim();
                }
            }
        }

        // Save recess & flag times too
        const recM1 = document.getElementById("custom_recess_morning1")?.value;
        const recM2 = document.getElementById("custom_recess_morning2")?.value;
        const recA1 = document.getElementById("custom_recess_afternoon1")?.value;
        const recA2 = document.getElementById("custom_recess_afternoon2")?.value;
        const flagM = document.getElementById("custom_flag_morning")?.value;
        const flagA = document.getElementById("custom_flag_afternoon")?.value;
        this.saveRecessTimes(recM1, recM2, recA1, recA2, flagM, flagA);

        localStorage.setItem('cms_custom_timetable_periods', JSON.stringify(newPeriods));
        this.periods = newPeriods;
        this.closePeriodSettingsModal();
        this.renderView();
        if (typeof window.showToast === 'function') {
            window.showToast("បានរក្សាទុកម៉ោងសិក្សា ចេញលេង និងគោរពទង់ជាតិដោយជោគជ័យ!", "success");
        }
    },

    resetPeriodsToDefault: function() {
        if (!confirm("តើអ្នកពិតជាចង់កំណត់ម៉ោងសិក្សាត្រឡប់មកស្តង់ដារក្រសួងដើមវិញមែនទេ?")) return;
        localStorage.removeItem('cms_custom_timetable_periods');
        localStorage.removeItem('cms_custom_timetable_recess');
        this.periods = JSON.parse(JSON.stringify(this.defaultPeriods));
        this.closePeriodSettingsModal();
        this.renderView();
        if (typeof window.showToast === 'function') {
            window.showToast("បានកំណត់ម៉ោងសិក្សា ចេញលេង និងគោរពទង់ជាតិដូចដើម!", "info");
        }
    },

    openPeriodSettingsModal: function() {
        const modal = document.getElementById('periodSettingsModal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    },

    closePeriodSettingsModal: function() {
        const modal = document.getElementById('periodSettingsModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    },

    // មុខវិជ្ជាបឋមសិក្សា (Primary Subjects)
    primarySubjects: [
        { name: "ភាសាខ្មែរ", color: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300" },
        { name: "គណិតវិទ្យា", color: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300" },
        { name: "វិទ្យាសាស្ត្រ", color: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300" },
        { name: "សិក្សាសង្គម", color: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300" },
        { name: "អប់រំកាយ/កីឡា", color: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300" },
        { name: "សិល្បៈ", color: "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-950/60 dark:text-pink-300" },
        { name: "ភាសាអង់គ្លេស", color: "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300" },
        { name: "បំណិនជីវិត", color: "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300" },
        { name: "ព័ត៌មានវិទ្យា", color: "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300" },
        // មុខវិជ្ជាបំប៉នបន្ថែម (Thursday & Supplementary Studies)
        { name: "បំប៉នបន្ថែម (វិទ្យាសាស្ត្រ)", color: "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-200" },
        { name: "បំប៉នបន្ថែម (ភាសាខ្មែរ)", color: "bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950/80 dark:text-sky-200" },
        { name: "បំប៉នបន្ថែម (គណិតវិទ្យា)", color: "bg-violet-100 text-violet-900 border-violet-300 dark:bg-violet-950/80 dark:text-violet-200" },
        { name: "បំប៉នបន្ថែម", color: "bg-teal-100 text-teal-900 border-teal-300 dark:bg-teal-950/80 dark:text-teal-200" },
        { name: "ក្លឹបសិក្សា/ស្វ័យសិក្សា", color: "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-200" }
    ],

    // មុខវិជ្ជាអនុវិទ្យាល័យ (Secondary Subjects)
    secondarySubjects: [
        { name: "អក្សរសាស្ត្រខ្មែរ", color: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300" },
        { name: "គណិតវិទ្យា", color: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300" },
        { name: "រូបវិទ្យា", color: "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300" },
        { name: "គីមីវិទ្យា", color: "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-950/60 dark:text-violet-300" },
        { name: "ជីវវិទ្យា", color: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300" },
        { name: "ផែនដីវិទ្យា", color: "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300" },
        { name: "ប្រវត្តិវិទ្យា", color: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300" },
        { name: "ភូមិវិទ្យា", color: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/60 dark:text-yellow-300" },
        { name: "ពលរដ្ឋវិទ្យា", color: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/60 dark:text-orange-300" },
        { name: "ភាសាអង់គ្លេស", color: "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300" },
        { name: "គេហវិទ្យា/បច្ចេកវិទ្យា", color: "bg-lime-100 text-lime-800 border-lime-200 dark:bg-lime-950/60 dark:text-lime-300" },
        { name: "អប់រំកាយ/កីឡា", color: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300" },
        { name: "បំប៉នបន្ថែម (វិទ្យាសាស្ត្រ)", color: "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-200" },
        { name: "បំប៉នបន្ថែម", color: "bg-teal-100 text-teal-900 border-teal-300 dark:bg-teal-950/80 dark:text-teal-200" }
    ],

    init: function() {
        this.loadPeriods();
        const sInfo = window.appSettings || JSON.parse(localStorage.getItem('school_settings') || '{}');
        this.currentAcademicYear = document.getElementById("globalAcademicYear")?.value || 
                                   localStorage.getItem('selected_academic_year') || 
                                   sInfo.academic_year || "2026-2027";

        // កំណត់ថ្នាក់ដំបូង តាមថ្នាក់ទទួលបន្ទុករបស់គ្រូបច្ចុប្បន្ន
        const activeClass = typeof window.getCurrentSelectedClass === 'function' 
            ? window.getCurrentSelectedClass() 
            : { level: localStorage.getItem('selected_level') || "ថ្នាក់ទី ១", room: localStorage.getItem('selected_room') || "«ក»" };
        const homeroomClass = `${activeClass.level || "ថ្នាក់ទី ១"} ${activeClass.room || "«ក»"}`.trim();
        this.currentGrade = homeroomClass || "ថ្នាក់ទី ១ «ក»";

        this.renderView();
    },

    /**
     * ទាញយកបញ្ជីថ្នាក់រៀនទាំងអស់ក្នុងសាលា (All Classes in School)
     */
    getAvailableClasses: function() {
        const classSet = new Set();
        
        // ១. យកពី Academic Structure
        const structure = window.academicStructure || (typeof window.loadAcademicStructure === 'function' ? window.loadAcademicStructure() : null);
        if (structure && Array.isArray(structure.grades)) {
            structure.grades.forEach(g => {
                const gName = g.name || "ថ្នាក់ទី ១";
                const rooms = Array.isArray(g.rooms) && g.rooms.length > 0 ? g.rooms : ["«ក»"];
                rooms.forEach(r => classSet.add(`${gName} ${r}`.trim()));
            });
        }

        // ២. យកពី Master Students បន្ថែម (បើមានសិស្សចុះឈ្មោះក្នុងថ្នាក់ណា ត្រូវតែមានថ្នាក់នោះ)
        const masterStudents = typeof window.getMasterStudents === 'function' ? window.getMasterStudents() : (window.allStudents || []);
        if (Array.isArray(masterStudents)) {
            masterStudents.forEach(s => {
                if (s.grade) {
                    const normG = typeof window.normalizeGrade === 'function' ? window.normalizeGrade(s.grade) : s.grade;
                    const normR = s.room || "«ក»";
                    classSet.add(`${normG} ${normR}`.trim());
                }
            });
        }

        // Fallback ប្រសិនបើទទេ
        if (classSet.size === 0) {
            ["ថ្នាក់ទី ១ «ក»", "ថ្នាក់ទី ១ «ខ»", "ថ្នាក់ទី ២ «ក»", "ថ្នាក់ទី ៣ «ក»", "ថ្នាក់ទី ៤ «ក»", "ថ្នាក់ទី ៥ «ក»", "ថ្នាក់ទី ៦ «ក»"].forEach(c => classSet.add(c));
        }

        return Array.from(classSet).sort((a, b) => a.localeCompare(b, 'km'));
    },

    /**
     * ទាញយកបញ្ជីគ្រូបង្រៀនទាំងអស់ក្នុងសាលា
     */
    getTeachersList: function() {
        if (window.AppAuth && typeof window.AppAuth.getTeachersList === 'function') {
            return window.AppAuth.getTeachersList();
        }
        try {
            const cached = JSON.parse(localStorage.getItem('cached_teachers_list') || '[]');
            if (Array.isArray(cached) && cached.length > 0) return cached;
        } catch(e) {}
        return [
            { teacher_id: "TCH-001", name: "លោកគ្រូ គំរូ", assigned_grade: "ថ្នាក់ទី ១", assigned_room: "«ក»" }
        ];
    },

    /**
     * ស្វែងរកគ្រូទទួលបន្ទុកថ្នាក់បច្ចុប្បន្ន
     */
    getClassTeacherInfo: function(gradeStr) {
        const target = gradeStr || this.currentGrade;
        const teachers = this.getTeachersList();
        const found = teachers.find(t => `${t.assigned_grade || ''} ${t.assigned_room || ''}`.trim() === target.trim());
        if (found) return found;

        // ស្វែងរកតាម Structure
        const structure = window.academicStructure;
        if (structure && Array.isArray(structure.grades)) {
            const parts = target.split(' ');
            const gName = parts.slice(0, 2).join(' ');
            const gObj = structure.grades.find(g => g.name === gName);
            if (gObj && gObj.teacher) {
                const tObj = teachers.find(t => t.teacher_id === gObj.teacher);
                if (tObj) return tObj;
            }
        }
        return null;
    },

    /**
     * កំណត់ Key សម្រាប់ផ្ទុកទិន្នន័យកាលវិភាគ
     */
    getStorageKey: function(gradeStr) {
        const target = (gradeStr || this.currentGrade || 'default').replace(/[«»\s]+/g, '_');
        const year = (this.currentAcademicYear || '2026-2027').replace(/[^a-zA-Z0-9]/g, '_');
        return `timetable_${year}_${target}`;
    },

    getTimetableData: function(gradeStr) {
        const key = this.getStorageKey(gradeStr);
        try {
            return JSON.parse(localStorage.getItem(key) || '{}');
        } catch(e) {
            return {};
        }
    },

    saveTimetableData: async function(data, gradeStr) {
        const targetGrade = gradeStr || this.currentGrade;
        const key = this.getStorageKey(targetGrade);
        localStorage.setItem(key, JSON.stringify(data));

        // Sync ទៅ Firebase Firestore
        if (window.db) {
            try {
                await window.db.collection("timetables").doc(key).set({
                    grade: targetGrade,
                    academic_year: this.currentAcademicYear,
                    schedule: data,
                    updated_by: localStorage.getItem('auth_teacher_id') || 'ADMIN',
                    last_updated: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            } catch(e) { 
                console.warn("Firestore timetable save note:", e); 
            }
        }

        if (typeof window.logAudit === 'function') {
            window.logAudit('UPDATE_TIMETABLE', 'timetable', `Admin បានកែសម្រួលកាលវិភាគបង្រៀនថ្នាក់ ${targetGrade} (ឆ្នាំ ${this.currentAcademicYear})`);
        }

        // 📡 Emit Event to EventBus
        if (window.CMSEventBus && window.CMSEventTypes) {
            window.CMSEventBus.emit(window.CMSEventTypes.TIMETABLE_CHANGED, {
                grade: targetGrade,
                academic_year: this.currentAcademicYear
            });
        }
    },

    /**
     * រក្សាទុកកាលវិភាគទៅកាន់ Google Sheets (Cloud Sync)
     */
    syncToGoogleSheets: async function() {
        const btn = document.getElementById("btnSyncTimetableGAS");
        const origHtml = btn ? btn.innerHTML : "";
        if (btn) {
            btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>កំពុងរក្សាទុក...</span>`;
            btn.disabled = true;
        }

        try {
            const scheduleData = this.getTimetableData();
            const activeKeys = Object.keys(scheduleData).filter(k => !!scheduleData[k].subject);

            if (activeKeys.length === 0) {
                if (typeof window.showToast === 'function') {
                    window.showToast("⚠️ មិនទាន់មានទិន្នន័យកាលវិភាគសម្រាប់រក្សាទុកក្នុង Google Sheets ទេ!", "warning");
                } else {
                    alert("⚠️ មិនទាន់មានទិន្នន័យកាលវិភាគសម្រាប់រក្សាទុកក្នុង Google Sheets ទេ!");
                }
                return;
            }

            const classTeacher = this.getClassTeacherInfo(this.currentGrade);
            const gradeParts = this.currentGrade.split(' ');
            const gradeLevel = gradeParts.slice(0, 2).join(' ') || this.currentGrade;
            const gradeRoom = gradeParts[2] || '«ក»';
            const academicYear = this.currentAcademicYear || '2026-2027';

            const entries = [];
            for (const [key, slot] of Object.entries(scheduleData)) {
                if (slot && slot.subject) {
                    const [dayKey, slotNum] = key.split('_');
                    entries.push({
                        entry_id: `TT-${academicYear}-${gradeLevel}-${gradeRoom}-${dayKey}-${slotNum}`.replace(/[«»\s]+/g, '_'),
                        academic_year: academicYear,
                        grade: gradeLevel,
                        room: gradeRoom,
                        day_of_week: dayKey,
                        period_slot: parseInt(slotNum, 10),
                        subject_name: slot.subject,
                        teacher_id: slot.teacher_id || (classTeacher ? classTeacher.teacher_id : ''),
                        room_number: slot.room || gradeRoom,
                        note: slot.note || ''
                    });
                }
            }

            let syncSuccess = false;

            // ១. ផ្ញើតាម window.apiPost (ស្តង់ដារប្រព័ន្ធ)
            if (typeof window.apiPost === 'function') {
                try {
                    const res = await window.apiPost('saveTimetableBatch', entries);
                    if (res && (res.status === 'success' || res.success)) {
                        syncSuccess = true;
                    }
                } catch (err) {
                    console.warn("apiPost saveTimetableBatch fallback error:", err);
                }
            }

            // ២. Direct Fetch ទៅ SCRIPT_URL ប្រសិនបើ apiPost មិនដំណើរការ
            if (!syncSuccess) {
                const scriptUrl = (typeof window.getScriptUrl === 'function' ? window.getScriptUrl() : window.SCRIPT_URL) || localStorage.getItem('cms_custom_script_url');
                if (scriptUrl) {
                    const token = (typeof window.getSessionToken === 'function' ? window.getSessionToken() : '') || (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('cms_session_token') : '') || '';
                    const payload = {
                        action: 'saveTimetableBatch',
                        data: entries,
                        sessionToken: token,
                        academic_year: academicYear,
                        grade: gradeLevel,
                        room: gradeRoom
                    };
                    const response = await fetch(scriptUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                        body: JSON.stringify(payload)
                    });
                    const resJson = await response.json();
                    if (resJson && (resJson.status === 'success' || resJson.success)) {
                        syncSuccess = true;
                    }
                }
            }

            // ៣. Sync ទៅ Firebase Firestore ជាទិន្នន័យបម្រុងទុកបន្ថែម
            const storageKey = this.getStorageKey(this.currentGrade);
            if (window.db) {
                try {
                    await window.db.collection("timetables").doc(storageKey).set({
                        grade: this.currentGrade,
                        academic_year: academicYear,
                        schedule: scheduleData,
                        total_slots: entries.length,
                        updated_by: localStorage.getItem('auth_teacher_id') || 'TCH-013',
                        last_updated: firebase.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });
                } catch(e) {
                    console.warn("Firestore timetable backup notice:", e);
                }
            }

            if (typeof window.logAudit === 'function') {
                window.logAudit('SYNC_TIMETABLE_GAS', 'timetable', `បានរក្សាទុកកាលវិភាគថ្នាក់ ${this.currentGrade} (${entries.length} ម៉ោង) ទៅក្នុង Google Sheets`);
            }

            if (typeof window.showToast === 'function') {
                window.showToast(`🎉 បានរក្សាទុកកាលវិភាគថ្នាក់ ${this.currentGrade} (${entries.length} ម៉ោង) ទៅក្នុង Google Sheets ដោយជោគជ័យ!`, "success");
            } else {
                alert(`🎉 បានរក្សាទុកកាលវិភាគថ្នាក់ ${this.currentGrade} (${entries.length} ម៉ោង) ទៅក្នុង Google Sheets ដោយជោគជ័យ!`);
            }

        } catch (error) {
            console.error("Google Sheets timetable sync error:", error);
            if (typeof window.showToast === 'function') {
                window.showToast(`⚠️ បរាជ័យក្នុងការតភ្ជាប់ Google Sheets: ${error.message || error}`, "error");
            } else {
                alert(`⚠️ បរាជ័យក្នុងការតភ្ជាប់ Google Sheets: ${error.message || error}`);
            }
        } finally {
            if (btn) {
                btn.innerHTML = origHtml || `<i class="fa-solid fa-cloud-arrow-up text-amber-300"></i> <span>រក្សាទុកក្នុង Google Sheets</span>`;
                btn.disabled = false;
            }
        }
    },

    /**
     * បើក Modal រៀបចំម៉ោងបំប៉នបន្ថែមថ្ងៃព្រហស្បតិ៍
     */
    openThursdayRemedialModal: function() {
        const modal = document.getElementById("thursdayRemedialModal");
        if (modal) modal.classList.remove("hidden");
    },

    closeThursdayRemedialModal: function() {
        const modal = document.getElementById("thursdayRemedialModal");
        if (modal) modal.classList.add("hidden");
    },

    /**
     * អនុវត្តម៉ោងបំប៉នបន្ថែមថ្ងៃព្រហស្បតិ៍
     */
    applyThursdayRemedial: function() {
        const p1 = document.getElementById("thu_slot_1")?.value || "បំប៉នបន្ថែម (ភាសាខ្មែរ)";
        const p2 = document.getElementById("thu_slot_2")?.value || "បំប៉នបន្ថែម (គណិតវិទ្យា)";
        const p3 = document.getElementById("thu_slot_3")?.value || "បំប៉នបន្ថែម (វិទ្យាសាស្ត្រ)";
        const p4 = document.getElementById("thu_slot_4")?.value || "ក្លឹបសិក្សា/ស្វ័យសិក្សា";
        const sessionChoice = document.getElementById("thu_session_choice")?.value || "morning";

        const data = this.getTimetableData();
        const classTeacher = this.getClassTeacherInfo(this.currentGrade);
        const tId = classTeacher ? classTeacher.teacher_id : '';
        const tName = classTeacher ? classTeacher.name : '';
        const room = this.currentGrade.split(' ')[1] || '«ក»';

        const slots = sessionChoice === "afternoon" 
            ? [ { slot: 5, sub: p1 }, { slot: 6, sub: p2 }, { slot: 7, sub: p3 }, { slot: 8, sub: p4 } ]
            : [ { slot: 1, sub: p1 }, { slot: 2, sub: p2 }, { slot: 3, sub: p3 }, { slot: 4, sub: p4 } ];

        slots.forEach(s => {
            if (s.sub && s.sub !== 'empty') {
                data[`thu_${s.slot}`] = {
                    subject: s.sub,
                    teacher_id: tId,
                    teacher_name: tName,
                    room: room,
                    note: "ម៉ោងបំប៉នបន្ថែមថ្ងៃព្រហស្បតិ៍"
                };
            }
        });

        this.saveTimetableData(data);
        this.closeThursdayRemedialModal();
        this.renderView();
        if (typeof showToast === 'function') {
            showToast("🎉 បានរៀបចំម៉ោងបំប៉នបន្ថែមថ្ងៃព្រហស្បតិ៍ដោយជោគជ័យ!", "success");
        }
    },

    /**
     * ប្តូរថ្នាក់រៀន
     */
    handleClassChange: function(newGrade) {
        this.currentGrade = newGrade;
        localStorage.setItem('admin_selected_timetable_class', newGrade);
        this.renderView();
    },

    /**
     * ប្តូរ Tab (កាលវិភាគ ឬ កិច្ចការផ្ទះ)
     */
    switchTab: function(tab) {
        this.activeTab = tab;
        this.renderView();
    },

    /**
     * ត្រួតពិនិត្យភាពជាន់ម៉ោងរបស់គ្រូបង្រៀន (Smart Conflict Detector)
     * ពិនិត្យមើលថាតើគ្រូម្នាក់នេះកំពុងបង្រៀននៅថ្នាក់ណាផ្សេងក្នុងម៉ោងនោះឬទេ
     */
    checkTeacherConflict: function(teacherId, dayKey, slotIndex, excludeGrade) {
        if (!teacherId) return null;
        const allClasses = this.getAvailableClasses();
        const exclude = excludeGrade || this.currentGrade;

        for (const cls of allClasses) {
            if (cls === exclude) continue;
            const data = this.getTimetableData(cls);
            const slot = data[`${dayKey}_${slotIndex}`];
            if (slot && slot.teacher_id === teacherId) {
                return {
                    conflictClass: cls,
                    subject: slot.subject,
                    room: slot.room
                };
            }
        }
        return null;
    },

    /**
     * មុខងារឆ្លាតវៃ៖ បង្កើតកាលវិភាគស្វ័យប្រវត្តិតាមស្តង់ដារ (Smart Generator Engine)
     */
    autoGenerateSmartSchedule: function(options = {}) {
        const sessionMode = options.sessionMode || 'morning'; // 'morning', 'afternoon', 'fullday'
        const level = options.level || (this.currentGrade.includes("៧") || this.currentGrade.includes("៨") || this.currentGrade.includes("៩") ? 'secondary' : 'primary');
        const targetScope = options.targetScope || 'current'; // 'current' or 'all'

        const subjectsList = level === 'secondary' ? this.secondarySubjects : this.primarySubjects;
        const targetClasses = targetScope === 'all' ? this.getAvailableClasses() : [this.currentGrade];

        let generatedCount = 0;

        targetClasses.forEach(cls => {
            const classTeacher = this.getClassTeacherInfo(cls);
            const teacherId = classTeacher ? classTeacher.teacher_id : '';
            const teacherName = classTeacher ? classTeacher.name : '';

            // បែងចែកមុខវិជ្ជាទៅតាមកូតាស្តង់ដារក្រសួងអប់រំ (Standard Curriculum Quota)
            let weeklySlots = [];

            if (level === 'primary') {
                // ភាសាខ្មែរ (៧ ម៉ោង), គណិត (៦ ម៉ោង), វិទ្យាសាស្ត្រ (៣ ម៉ោង), សង្គម (៣ ម៉ោង), អង់គ្លេស (២ ម៉ោង), កីឡា (២ ម៉ោង), សិល្បៈ (១ ម៉ោង)
                weeklySlots = [
                    "ភាសាខ្មែរ", "ភាសាខ្មែរ", "ភាសាខ្មែរ", "ភាសាខ្មែរ", "ភាសាខ្មែរ", "ភាសាខ្មែរ", "ភាសាខ្មែរ",
                    "គណិតវិទ្យា", "គណិតវិទ្យា", "គណិតវិទ្យា", "គណិតវិទ្យា", "គណិតវិទ្យា", "គណិតវិទ្យា",
                    "វិទ្យាសាស្ត្រ", "វិទ្យាសាស្ត្រ", "វិទ្យាសាស្ត្រ",
                    "សិក្សាសង្គម", "សិក្សាសង្គម", "សិក្សាសង្គម",
                    "ភាសាអង់គ្លេស", "ភាសាអង់គ្លេស",
                    "អប់រំកាយ/កីឡា", "អប់រំកាយ/កីឡា",
                    "សិល្បៈ"
                ];
            } else {
                weeklySlots = [
                    "អក្សរសាស្ត្រខ្មែរ", "អក្សរសាស្ត្រខ្មែរ", "អក្សរសាស្ត្រខ្មែរ", "អក្សរសាស្ត្រខ្មែរ", "អក្សរសាស្ត្រខ្មែរ",
                    "គណិតវិទ្យា", "គណិតវិទ្យា", "គណិតវិទ្យា", "គណិតវិទ្យា", "គណិតវិទ្យា",
                    "រូបវិទ្យា", "រូបវិទ្យា",
                    "គីមីវិទ្យា", "គីមីវិទ្យា",
                    "ជីវវិទ្យា", "ជីវវិទ្យា",
                    "ប្រវត្តិវិទ្យា", "ប្រវត្តិវិទ្យា",
                    "ភូមិវិទ្យា", "ភូមិវិទ្យា",
                    "ពលរដ្ឋវិទ្យា",
                    "ផែនដីវិទ្យា",
                    "ភាសាអង់គ្លេស", "ភាសាអង់គ្លេស"
                ];
            }

            const newSchedule = {};
            let slotIndexMorning = [1, 2, 3, 4, 5];
            let slotIndexAfternoon = [6, 7, 8, 9, 10];
            let activeSlots = sessionMode === 'afternoon' ? slotIndexAfternoon : (sessionMode === 'fullday' ? [...slotIndexMorning, ...slotIndexAfternoon] : slotIndexMorning);

            let slotPointer = 0;

            // រៀបចំតាមថ្ងៃនីមួយៗ (ច័ន្ទ ដល់ សៅរ៍)
            this.days.forEach((day, dIdx) => {
                activeSlots.forEach((slotNum, sIdx) => {
                    let subName = weeklySlots[slotPointer % weeklySlots.length];
                    
                    // ក្បួនឆ្លាតវៃគរុកោសល្យ៖ ម៉ោងទី ១ និង ២ ត្រូវតែជា ភាសាខ្មែរ ឬ គណិតវិទ្យា
                    if ((slotNum === 1 || slotNum === 2 || slotNum === 6 || slotNum === 7)) {
                        if (dIdx % 2 === 0) {
                            subName = (sIdx === 0) ? (level === 'secondary' ? "អក្សរសាស្ត្រខ្មែរ" : "ភាសាខ្មែរ") : "គណិតវិទ្យា";
                        } else {
                            subName = (sIdx === 0) ? "គណិតវិទ្យា" : (level === 'secondary' ? "អក្សរសាស្ត្រខ្មែរ" : "ភាសាខ្មែរ");
                        }
                    }

                    // ម៉ោងចុងសប្តាហ៍ ឬរសៀល ដាក់កីឡា ឬសិល្បៈ
                    if (day.key === 'sat' && (slotNum === 5 || slotNum === 10)) {
                        subName = "អប់រំកាយ/កីឡា";
                    } else if (day.key === 'fri' && (slotNum === 5 || slotNum === 10)) {
                        subName = level === 'secondary' ? "ភាសាអង់គ្លេស" : "សិល្បៈ";
                    }

                    newSchedule[`${day.key}_${slotNum}`] = {
                        subject: subName,
                        teacher_id: teacherId,
                        teacher_name: teacherName,
                        room: cls.split(' ')[1] || "បន្ទប់ទូទៅ",
                        note: "រៀបចំដោយប្រព័ន្ធឆ្លាតវៃ (Smart Generator)"
                    };

                    slotPointer++;
                });
            });

            this.saveTimetableData(newSchedule, cls);
            generatedCount++;
        });

        if (typeof showToast === 'function') {
            showToast(`✨ បានបង្កើតកាលវិភាគស្វ័យប្រវត្តិចំនួន ${generatedCount} ថ្នាក់ជោគជ័យ!`);
        }
        this.renderView();
    },

    /**
     * ចម្លងកាលវិភាគពីថ្នាក់មួយទៅថ្នាក់មួយ (Copy Timetable)
     */
    copyTimetableFrom: function(sourceGrade) {
        if (!sourceGrade || sourceGrade === this.currentGrade) {
            alert("សូមជ្រើសរើសថ្នាក់ប្រភពផ្សេងពីថ្នាក់បច្ចុប្បន្ន!");
            return;
        }

        const sourceData = this.getTimetableData(sourceGrade);
        if (Object.keys(sourceData).length === 0) {
            alert(`⚠️ ថ្នាក់ ${sourceGrade} មិនទាន់មានទិន្នន័យកាលវិភាគឡើយ!`);
            return;
        }

        if (confirm(`តើលោកគ្រូ/អ្នកគ្រូពិតជាចង់ចម្លងកាលវិភាគពី «${sourceGrade}» មកកាន់ «${this.currentGrade}» មែនទេ?`)) {
            const classTeacher = this.getClassTeacherInfo(this.currentGrade);
            const copiedData = {};

            for (const [key, val] of Object.entries(sourceData)) {
                copiedData[key] = {
                    ...val,
                    // Reassign គ្រូ និងបន្ទប់សម្រាប់ថ្នាក់ថ្មី
                    teacher_id: classTeacher ? classTeacher.teacher_id : (val.teacher_id || ''),
                    teacher_name: classTeacher ? classTeacher.name : (val.teacher_name || ''),
                    room: this.currentGrade.split(' ')[1] || val.room || ''
                };
            }

            this.saveTimetableData(copiedData, this.currentGrade);
            if (typeof showToast === 'function') showToast(`✅ បានចម្លងកាលវិភាគពី ${sourceGrade} ដោយជោគជ័យ!`);
            this.renderView();
        }
    },

    /**
     * បង្កើតផ្នែកខាងក្រោមនៃកាលវិភាគ (Footnote & Official MoEYS Signatures - Match Image 1)
     */
    getTimetableFootnoteHtml: function(isPrint = false) {
        const now = new Date();
        const khmerMonths = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];
        const toKhNum = typeof window.toKhmerNum === 'function' ? window.toKhmerNum : String;
        const solarDateStr = `ថ្ងៃទី ${toKhNum(now.getDate())} ខែ ${khmerMonths[now.getMonth()]} ឆ្នាំ ${toKhNum(now.getFullYear())}`;
        const lunarDateStr = typeof window.getKhmerLunarDate === 'function' 
            ? window.getKhmerLunarDate(now) 
            : `ថ្ងៃចន្ទ ១៥កើត ខែអស្សុជ ឆ្នាំខាល អដ្ឋស័ក ព.ស.២៥៧០`;
        const sInfo = window.appSettings || JSON.parse(localStorage.getItem('school_settings') || '{}');
        const principalName = (sInfo.principal_name && sInfo.principal_name !== "នាយកសាលា") ? sInfo.principal_name : "";
        const classTeacher = this.getClassTeacherInfo(this.currentGrade);
        const teacherName = classTeacher ? classTeacher.name : (sInfo.teacher_name || "ហឿន មិនា");

        if (isPrint) {
            return `
                <div class="timetable-print-footnote" style="margin-top: 14px; font-size: 9.5pt; line-height: 1.5; page-break-inside: avoid; font-family: 'Siemreap', sans-serif;">
                    <p style="margin: 0 0 2px 0; font-weight: bold; font-family: 'Moul', cursive; font-size: 9.5pt;">សម្គាល់៖</p>
                    <p style="margin: 0 0 4px 0; font-weight: bold;">- ក្នុង ១សប្ដាហ៍ គ្រូបង្រៀនត្រូវបង្រៀនឱ្យបាន៖</p>
                    <table style="width: 100%; border: none; margin: 0 0 4px 0;">
                        <tr style="border: none;">
                            <td style="border: none; text-align: left; padding: 1px 0; width: 33%;">១) ភាសាខ្មែរ ១៤ម៉ោង</td>
                            <td style="border: none; text-align: left; padding: 1px 0; width: 33%;">២) គណិតវិទ្យា ៨ម៉ោង</td>
                            <td style="border: none; text-align: left; padding: 1px 0; width: 34%;">៣) វិទ្យាសាស្ត្រ ២ម៉ោង</td>
                        </tr>
                        <tr style="border: none;">
                            <td style="border: none; text-align: left; padding: 1px 0;">៤) វិទ្យាសាស្ត្រសង្គម ២ម៉ោង</td>
                            <td style="border: none; text-align: left; padding: 1px 0;">៥) ការអប់រំសីលធម៌ ២ម៉ោង</td>
                            <td style="border: none; text-align: left; padding: 1px 0;">៦) អប់រំកាយ ២ម៉ោង</td>
                        </tr>
                        <tr style="border: none;">
                            <td style="border: none; text-align: left; padding: 1px 0;">៧) អប់រំសុខភាព ១ម៉ោង</td>
                            <td style="border: none; text-align: left; padding: 1px 0;">៨) អប់រំសិល្បៈ ១ម៉ោង</td>
                            <td style="border: none; text-align: left; padding: 1px 0;">៩) អប់រំបរិស្ថាន ១ម៉ោង</td>
                        </tr>
                        <tr style="border: none;">
                            <td style="border: none; text-align: left; padding: 1px 0;">១០) បំណិនជីវិត ២ម៉ោង</td>
                            <td style="border: none; text-align: left; padding: 1px 0;">១១) បុរេកុំព្យូទ័រ ១ម៉ោង</td>
                            <td style="border: none;"></td>
                        </tr>
                    </table>
                    <div style="font-size: 9pt; margin-top: 4px; line-height: 1.5;">
                        • ១ម៉ោងសិក្សាមានរយៈពេល៤០នាទី ពេលព្រឹកអនុវត្តតាមកាលវិភាគពេលសិក្សាពេលរសៀលសាលាត្រូវកំណត់សម្រាប់ទ្រទ្រង់ភាសាខ្មែរនិងគណិតវិទ្យា ។<br>
                        • ថ្ងៃសៅរ៍ពេលរសៀលត្រូវរៀបចំក្លឹបសិក្សាសម្រាប់សិស្សរៀនយឺត និងសិស្សពូកែ ។
                    </div>
                </div>

                <div class="footer-box" style="display: flex; justify-content: space-between; margin-top: 22px; padding: 0 40px; page-break-inside: avoid; font-family: 'Siemreap', sans-serif;">
                    <div style="text-align: center; width: 250px;">
                        <p style="margin: 0 0 3px 0;">បានឃើញ និងឯកភាព</p>
                        <p class="font-moul" style="font-size: 10pt; margin: 0;">នាយិកាសាលា</p>
                        <div style="height: 60px;"></div>
                    </div>
                    <div style="text-align: center; width: 290px;">
                        <p style="margin: 0 0 2px 0; font-size: 9pt; color: #475569;">${lunarDateStr}</p>
                        <p style="margin: 0 0 3px 0; font-size: 9.5pt;">${solarDateStr}</p>
                        <p class="font-moul" style="font-size: 10pt; margin: 0;">គ្រូបន្ទុកថ្នាក់</p>
                        <div style="height: 60px;"></div>
                        <p style="margin: 0; font-family: 'Moul', cursive; font-size: 10pt;">${teacherName}</p>
                    </div>
                </div>
            `;
        }

        // Web View
        return `
            <div class="mt-6 p-5 sm:p-6 bg-slate-50/80 dark:bg-slate-700/40 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 font-siemreap space-y-4">
                <div>
                    <h4 class="font-moul text-sm text-slate-800 dark:text-white mb-2">សម្គាល់៖</h4>
                    <p class="font-bold text-slate-700 dark:text-slate-200 mb-2.5">- ក្នុង ១សប្ដាហ៍ គ្រូបង្រៀនត្រូវបង្រៀនឱ្យបាន៖</p>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                        <div class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span> ១) ភាសាខ្មែរ ១៤ម៉ោង</div>
                        <div class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-purple-500"></span> ២) គណិតវិទ្យា ៨ម៉ោង</div>
                        <div class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> ៣) វិទ្យាសាស្ត្រ ២ម៉ោង</div>
                        <div class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span> ៤) វិទ្យាសាស្ត្រសង្គម ២ម៉ោង</div>
                        <div class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> ៥) ការអប់រំសីលធម៌ ២ម៉ោង</div>
                        <div class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span> ៦) អប់រំកាយ ២ម៉ោង</div>
                        <div class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-teal-500"></span> ៧) អប់រំសុខភាព ១ម៉ោង</div>
                        <div class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-pink-500"></span> ៨) អប់រំសិល្បៈ ១ម៉ោង</div>
                        <div class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-green-500"></span> ៩) អប់រំបរិស្ថាន ១ម៉ោង</div>
                        <div class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-cyan-500"></span> ១០) បំណិនជីវិត ២ម៉ោង</div>
                        <div class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-sky-500"></span> ១១) បុរេកុំព្យូទ័រ ១ម៉ោង</div>
                    </div>
                </div>

                <ul class="list-disc list-inside space-y-1.5 text-slate-600 dark:text-slate-300 text-xs leading-relaxed pt-3 border-t border-slate-200/60 dark:border-slate-600/60">
                    <li>១ម៉ោងសិក្សាមានរយៈពេល ៤០នាទី (ឬតាមម៉ោងកំណត់ជាក់ស្ដែង)។ ពេលព្រឹកអនុវត្តតាមកាលវិភាគពេលសិក្សា ពេលរសៀលសាលាត្រូវកំណត់សម្រាប់ទ្រទ្រង់ភាសាខ្មែរនិងគណិតវិទ្យា ។</li>
                    <li>ថ្ងៃសៅរ៍ពេលរសៀលត្រូវរៀបចំក្លឹបសិក្សាសម្រាប់សិស្សរៀនយឺត និងសិស្សពូកែ ។</li>
                </ul>

                <!-- Official Signature Row -->
                <div class="flex justify-between items-start pt-6 border-t border-slate-200 dark:border-slate-600 text-xs">
                    <div class="text-center space-y-1">
                        <p class="font-bold text-slate-700 dark:text-slate-300">បានឃើញ និងឯកភាព</p>
                        <p class="font-moul text-xs text-slate-800 dark:text-white">នាយិកាសាលា</p>
                        <div class="h-16"></div>
                    </div>
                    <div class="text-center space-y-1">
                        <p class="text-[11px] text-slate-500 dark:text-slate-400">${lunarDateStr}</p>
                        <p class="text-slate-600 dark:text-slate-300 font-medium">${solarDateStr}</p>
                        <p class="font-moul text-xs text-slate-800 dark:text-white">គ្រូបន្ទុកថ្នាក់</p>
                        <div class="h-16"></div>
                        <p class="font-moul text-xs text-slate-900 dark:text-white font-bold">${teacherName}</p>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * បោះពុម្ពកាលវិភាគស្តង់ដារក្រសួងអប់រំ
     */
    printTimetable: function() {
        const sInfo = window.appSettings || JSON.parse(localStorage.getItem('school_settings') || '{}');
        const schoolName = sInfo.school_name || "សាលាបឋមសិក្សា";
        const principalName = (sInfo.principal_name && sInfo.principal_name !== "នាយកសាលា") ? sInfo.principal_name : "";
        const classTeacher = this.getClassTeacherInfo(this.currentGrade);
        const teacherName = classTeacher ? classTeacher.name : (sInfo.teacher_name || "គ្រូទទួលបន្ទុកថ្នាក់");
        const academicYear = this.currentAcademicYear;
        const data = this.getTimetableData();
        const recessTimes = this.getRecessTimes();

        const tableHtml = `
                <table class="timetable-main-table">
                    <thead>
                        <tr>
                            <th style="width: 14%;">ម៉ោងសិក្សា</th>
                            ${this.days.map(d => `<th style="width: 14%;" class="font-moul">${d.label}</th>`).join("")}
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="session-header">
                            <td colspan="7">● វេនព្រឹក (MORNING SESSION)</td>
                        </tr>
                        <tr style="background-color: #fff1f2; font-weight: bold; text-align: center;">
                            <td colspan="7" style="padding: 5px; font-size: 9.5pt; color: #be123c; border: 1px solid #111;">
                                🚩 ម៉ោង ${recessTimes.flagMorning} ៖ ការគោរពទង់ជាតិ
                            </td>
                        </tr>
                        ${this.periods.filter(p => p.session === 'morning').map(p => {
                            let pRow = `
                                <tr>
                                    <td>
                                        <b>${p.label.split(' ')[0]} ${p.label.split(' ')[1]}</b><br>
                                        <small style="color: #64748b;">${p.time}</small>
                                    </td>
                                    ${this.days.map(d => {
                                        const slot = data[`${d.key}_${p.slot}`] || {};
                                        return `
                                            <td>
                                                ${slot.subject ? `
                                                    <div class="sub-name">${slot.subject}</div>
                                                    
                                                ` : `<span style="color: #cbd5e1;">- ទំនេរ -</span>`}
                                            </td>
                                        `;
                                    }).join("")}
                                </tr>
                            `;
                            if (p.slot === 2) {
                                pRow += `
                                    <tr style="background-color: #fef3c7; font-weight: bold; text-align: center;">
                                        <td colspan="7" style="padding: 5px; font-size: 9.5pt; color: #dc2626; border: 1px solid #111; font-family: 'Moul', cursive;">
                                            ចេញលេង (${recessTimes.morning1})
                                        </td>
                                    </tr>
                                `;
                            }
                            if (p.slot === 3) {
                                pRow += `
                                    <tr style="background-color: #fef3c7; font-weight: bold; text-align: center;">
                                        <td colspan="7" style="padding: 5px; font-size: 9.5pt; color: #dc2626; border: 1px solid #111; font-family: 'Moul', cursive;">
                                            ចេញលេង (${recessTimes.morning2})
                                        </td>
                                    </tr>
                                `;
                            }
                            return pRow;
                        }).join("")}

                        <tr class="session-header">
                            <td colspan="7">● វេនរសៀល (AFTERNOON SESSION)</td>
                        </tr>
                        ${this.periods.filter(p => p.session === 'afternoon').map(p => {
                            let pRow = `
                                <tr>
                                    <td>
                                        <b>${p.label.split(' ')[0]} ${p.label.split(' ')[1]}</b><br>
                                        <small style="color: #64748b;">${p.time}</small>
                                    </td>
                                    ${this.days.map(d => {
                                        const slot = data[`${d.key}_${p.slot}`] || {};
                                        return `
                                            <td>
                                                ${slot.subject ? `
                                                    <div class="sub-name">${slot.subject}</div>
                                                    
                                                ` : `<span style="color: #cbd5e1;">- ទំនេរ -</span>`}
                                            </td>
                                        `;
                                    }).join("")}
                                </tr>
                            `;
                            if (p.slot === 7) {
                                pRow += `
                                    <tr style="background-color: #fef3c7; font-weight: bold; text-align: center;">
                                        <td colspan="7" style="padding: 5px; font-size: 9.5pt; color: #dc2626; border: 1px solid #111; font-family: 'Moul', cursive;">
                                            ចេញលេង (${recessTimes.afternoon1})
                                        </td>
                                    </tr>
                                `;
                            }
                            if (p.slot === 8) {
                                pRow += `
                                    <tr style="background-color: #fef3c7; font-weight: bold; text-align: center;">
                                        <td colspan="7" style="padding: 5px; font-size: 9.5pt; color: #dc2626; border: 1px solid #111; font-family: 'Moul', cursive;">
                                            ចេញលេង (${recessTimes.afternoon2})
                                        </td>
                                    </tr>
                                `;
                            }
                            return pRow;
                        }).join("")}
                        <tr style="background-color: #fff1f2; font-weight: bold; text-align: center;">
                            <td colspan="7" style="padding: 5px; font-size: 9.5pt; color: #be123c; border: 1px solid #111;">
                                🚩 ម៉ោង ${recessTimes.flagAfternoon} ៖ គោរពទង់ជាតិ
                            </td>
                        </tr>
                    </tbody>
                </table>
        `;

        const footnotePrintHtml = this.getTimetableFootnoteHtml(true);

        const timetableExtraStyles = `
            table.timetable-main-table { width: 100%; border-collapse: collapse; margin-top: 5px; margin-bottom: 12px; }
            .timetable-main-table th, .timetable-main-table td { border: 1px solid #111; padding: 6px 4px; text-align: center; }
            .timetable-main-table th { background-color: #f1f5f9; font-weight: bold; }
            .session-header { background-color: #e2e8f0; font-weight: bold; text-align: left; padding-left: 10px; }
            .sub-name { font-weight: bold; font-size: 10.5pt; color: #1e3a8a; }
            .teacher-name { font-size: 9pt; color: #475569; margin-top: 2px; }
        `;

        if (window.CMSPrintManager && typeof window.CMSPrintManager.openUniversalPreview === 'function') {
            window.CMSPrintManager.openUniversalPreview({
                title: `កាលវិភាគបង្រៀនប្រចាំសប្តាហ៍`,
                grade: this.currentGrade,
                academicYear: academicYear,
                schoolName: schoolName,
                principalName: principalName,
                teacherName: teacherName,
                paperSize: "A4",
                orientation: "landscape",
                defaultZoom: 1.0,
                contentHtml: tableHtml + footnotePrintHtml,
                extraStyles: timetableExtraStyles,
                footerHtml: "" // 👈 Prevent duplicate footer signatures
            });
            return;
        }

        // បង្កើត HTML សម្រាប់បោះពុម្ព
        let printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>កាលវិភាគបង្រៀន_${this.currentGrade}</title>
                <link href="https://fonts.googleapis.com/css2?family=Moul&family=Siemreap&display=swap" rel="stylesheet">
                <style>
                    @page { size: A4 landscape; margin: 12mm; }
                    body { font-family: 'Siemreap', sans-serif; font-size: 11pt; color: #000; margin: 0; padding: 0; }
                    .font-moul { font-family: 'Moul', cursive; }
                    .text-center { text-align: center; }
                    .header-box { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; }
                    .national-header { text-align: center; line-height: 1.5; }
                    .school-header { text-align: left; line-height: 1.5; padding-top: 24px; }
                    .title { font-size: 15pt; margin: 15px 0 5px 0; text-align: center; }
                    .subtitle { font-size: 11pt; text-align: center; margin-bottom: 15px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 5px; }
                    th, td { border: 1px solid #111; padding: 7px 4px; text-align: center; }
                    th { background-color: #f1f5f9; font-weight: bold; }
                    .session-header { background-color: #e2e8f0; font-weight: bold; text-align: left; padding-left: 10px; }
                    .sub-name { font-weight: bold; font-size: 10.5pt; color: #1e3a8a; }
                    .teacher-name { font-size: 9pt; color: #475569; margin-top: 2px; }
                    .footer-box { display: flex; justify-content: space-between; margin-top: 25px; padding: 0 40px; page-break-inside: avoid; }
                    .signature-area { height: 70px; }
                </style>
            </head>
            <body>
                <div class="header-box">
                    <div class="school-header">
                        <div>ក្រសួងអប់រំ យុវជន និងកីឡា</div>
                        <div class="font-moul">${schoolName}</div>
                    </div>
                    <div class="national-header">
                        <div class="font-moul" style="font-size: 11pt;">ព្រះរាជាណាចក្រកម្ពុជា</div>
                        <div class="font-moul" style="font-size: 10pt;">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
                    </div>
                </div>

                <div class="title font-moul">កាលវិភាគបង្រៀនប្រចាំសប្តាហ៍</div>
                <div class="subtitle font-moul">${this.currentGrade} | ឆ្នាំសិក្សា ${academicYear}</div>

                <table>
                    <thead>
                        <tr>
                            <th style="width: 14%;">ម៉ោងសិក្សា</th>
                            ${this.days.map(d => `<th style="width: 14%;" class="font-moul">${d.label}</th>`).join("")}
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="session-header">
                            <td colspan="7">● វេនព្រឹក (MORNING SESSION)</td>
                        </tr>
                        <tr style="background-color: #fff1f2; font-weight: bold; text-align: center;">
                            <td colspan="7" style="padding: 5px; font-size: 9.5pt; color: #be123c; border: 1px solid #111;">
                                🚩 ម៉ោង ${recessTimes.flagMorning} ៖ ការគោរពទង់ជាតិ
                            </td>
                        </tr>
                        ${this.periods.filter(p => p.session === 'morning').map(p => {
                            let pRow = `
                                <tr>
                                    <td>
                                        <b>${p.label.split(' ')[0]} ${p.label.split(' ')[1]}</b><br>
                                        <small style="color: #64748b;">${p.time}</small>
                                    </td>
                                    ${this.days.map(d => {
                                        const slot = data[`${d.key}_${p.slot}`] || {};
                                        return `
                                            <td>
                                                ${slot.subject ? `
                                                    <div class="sub-name">${slot.subject}</div>
                                                    
                                                ` : `<span style="color: #cbd5e1;">- ទំនេរ -</span>`}
                                            </td>
                                        `;
                                    }).join("")}
                                </tr>
                            `;
                            if (p.slot === 2) {
                                pRow += `
                                    <tr style="background-color: #fef3c7; font-weight: bold; text-align: center;">
                                        <td colspan="7" style="padding: 5px; font-size: 9.5pt; color: #dc2626; border: 1px solid #111; font-family: 'Moul', cursive;">
                                            ចេញលេង (${recessTimes.morning1})
                                        </td>
                                    </tr>
                                `;
                            }
                            if (p.slot === 3) {
                                pRow += `
                                    <tr style="background-color: #fef3c7; font-weight: bold; text-align: center;">
                                        <td colspan="7" style="padding: 5px; font-size: 9.5pt; color: #dc2626; border: 1px solid #111; font-family: 'Moul', cursive;">
                                            ចេញលេង (${recessTimes.morning2})
                                        </td>
                                    </tr>
                                `;
                            }
                            return pRow;
                        }).join("")}

                        <tr class="session-header">
                            <td colspan="7">● វេនរសៀល (AFTERNOON SESSION)</td>
                        </tr>
                        ${this.periods.filter(p => p.session === 'afternoon').map(p => {
                            let pRow = `
                                <tr>
                                    <td>
                                        <b>${p.label.split(' ')[0]} ${p.label.split(' ')[1]}</b><br>
                                        <small style="color: #64748b;">${p.time}</small>
                                    </td>
                                    ${this.days.map(d => {
                                        const slot = data[`${d.key}_${p.slot}`] || {};
                                        return `
                                            <td>
                                                ${slot.subject ? `
                                                    <div class="sub-name">${slot.subject}</div>
                                                    
                                                ` : `<span style="color: #cbd5e1;">- ទំនេរ -</span>`}
                                            </td>
                                        `;
                                    }).join("")}
                                </tr>
                            `;
                            if (p.slot === 7) {
                                pRow += `
                                    <tr style="background-color: #fef3c7; font-weight: bold; text-align: center;">
                                        <td colspan="7" style="padding: 5px; font-size: 9.5pt; color: #dc2626; border: 1px solid #111; font-family: 'Moul', cursive;">
                                            ចេញលេង (${recessTimes.afternoon1})
                                        </td>
                                    </tr>
                                `;
                            }
                            if (p.slot === 8) {
                                pRow += `
                                    <tr style="background-color: #fef3c7; font-weight: bold; text-align: center;">
                                        <td colspan="7" style="padding: 5px; font-size: 9.5pt; color: #dc2626; border: 1px solid #111; font-family: 'Moul', cursive;">
                                            ចេញលេង (${recessTimes.afternoon2})
                                        </td>
                                    </tr>
                                `;
                            }
                            return pRow;
                        }).join("")}
                        <tr style="background-color: #fff1f2; font-weight: bold; text-align: center;">
                            <td colspan="7" style="padding: 5px; font-size: 9.5pt; color: #be123c; border: 1px solid #111;">
                                🚩 ម៉ោង ${recessTimes.flagAfternoon} ៖ គោរពទង់ជាតិ
                            </td>
                        </tr>
                    </tbody>
                </table>

                ${footnotePrintHtml}
            </body>
            </html>
        `;

        const printWin = window.open('', '_blank');
        if (printWin) {
            printWin.document.open();
            printWin.document.write(printContent);
            printWin.document.close();
            setTimeout(() => {
                printWin.focus();
                printWin.print();
            }, 600);
        } else {
            alert("សូមអនុញ្ញាត Popup ដើម្បីបោះពុម្ពកាលវិភាគ!");
        }
    },

    /**
     * បោះពុម្ពតារាងកិច្ចការផ្ទះជាទម្រង់ក្រដាស A4 ផ្លូវការ
     */
    printHomeworkSheet: function() {
        const list = this.getHomeworkList();
        const sInfo = typeof window.appSettings !== 'undefined' ? window.appSettings : {};
        const schoolName = sInfo.school_name || "សាលាបឋមសិក្សា";
        const gradeStr = this.currentGrade || "ថ្នាក់រៀន";

        let rowsHtml = "";
        if (!list || list.length === 0) {
            rowsHtml = `<tr><td colspan="6" style="border: 1px solid #cbd5e1; padding: 25px; text-align: center; color: #94a3b8; font-weight: bold;">មិនទាន់មានកិច្ចការផ្ទះសម្រាប់ថ្នាក់ ${gradeStr} ឡើយ</td></tr>`;
        } else {
            rowsHtml = list.map((hw, idx) => `
                <tr style="background: ${idx % 2 === 1 ? '#f8fafc' : '#ffffff'};">
                    <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; font-weight: bold;">${idx + 1}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; font-weight: bold; color: #4338ca;">${hw.subject || '-'}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: left; font-weight: bold; color: #1e293b;">${hw.title || '-'}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: left; color: #475569; font-size: 9.5pt;">${hw.desc || '-'}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; font-family: monospace; font-weight: bold; color: #e11d48;">${hw.dueDate || '-'}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; font-weight: bold; color: #059669;">${hw.maxScore || 10} ពិន្ទុ</td>
                </tr>
            `).join('');
        }

        const hwTableHtml = `
            <table class="hw-main-table" style="width: 100%; border-collapse: collapse; font-size: 9.5pt; margin-bottom: 25px;">
                <thead>
                    <tr style="background: #eef2ff; font-weight: bold; color: #1e1b4b;">
                        <th style="border: 1px solid #cbd5e1; padding: 8px; width: 35px; text-align: center;">ល.រ</th>
                        <th style="border: 1px solid #cbd5e1; padding: 8px; width: 100px; text-align: center;">មុខវិជ្ជា</th>
                        <th style="border: 1px solid #cbd5e1; padding: 8px; width: 180px; text-align: left;">ចំណងជើងកិច្ចការ</th>
                        <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">ការណែនាំលម្អិត</th>
                        <th style="border: 1px solid #cbd5e1; padding: 8px; width: 90px; text-align: center;">ថ្ងៃផុតកំណត់</th>
                        <th style="border: 1px solid #cbd5e1; padding: 8px; width: 75px; text-align: center;">ពិន្ទុ</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHtml}
                </tbody>
            </table>
        `;

        if (window.CMSPrintManager && typeof window.CMSPrintManager.openUniversalPreview === 'function') {
            window.CMSPrintManager.openUniversalPreview({
                title: `តារាងកិច្ចការផ្ទះ និងការណែនាំស្វ័យសិក្សា`,
                grade: gradeStr,
                schoolName: schoolName,
                principalName: sInfo.principal_name || '.......................',
                teacherName: sInfo.teacher_name || '.......................',
                paperSize: "A4",
                orientation: "portrait",
                defaultZoom: 1.0,
                contentHtml: hwTableHtml
            });
            return;
        }

        const printContent = `
            <div id="homeworkPrintArea" style="max-width: 210mm; min-height: 297mm; margin: 0 auto; padding: 15mm 12mm; background: white; font-family: 'Siemreap', sans-serif; color: #1e293b;">
                <!-- Header -->
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
                    <div style="text-align: left; padding-top: 24px;">
                        <p style="font-family: 'Moul', serif; font-size: 10.5pt; margin: 0; color: #0f172a;">${sInfo.province || "រាជធានីភ្នំពេញ"}</p>
                        <p style="font-family: 'Moul', serif; font-size: 10.5pt; margin: 4px 0 0 0; color: #1e293b;">${schoolName}</p>
                        <p style="font-weight: bold; font-size: 9.5pt; margin: 4px 0 0 0; color: #4338ca;">ថ្នាក់បន្ទុក៖ ${gradeStr}</p>
                    </div>
                    <div style="text-align: center;">
                        <p style="font-family: 'Moul', serif; font-size: 11pt; margin: 0; color: #0f172a;">ព្រះរាជាណាចក្រកម្ពុជា</p>
                        <p style="font-family: 'Moul', serif; font-size: 9.5pt; margin: 4px 0 0 0; color: #1e293b;">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                        <div style="color: #d97706; font-size: 8pt; letter-spacing: 4px; margin-top: 3px;">❖ ❖ ❖</div>
                    </div>
                </div>

                <!-- Title -->
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="font-family: 'Moul', serif; font-size: 13pt; margin: 0; color: #1e1b4b;">តារាងកិច្ចការផ្ទះ និងការណែនាំស្វ័យសិក្សា</h2>
                    <p style="font-size: 9.5pt; font-weight: bold; color: #64748b; margin: 5px 0 0 0;">ឆ្នាំសិក្សា ${this.currentAcademicYear || '២០២៦-២០២៧'} (ថ្នាក់៖ ${gradeStr})</p>
                </div>

                <!-- Table -->
                <table style="width: 100%; border-collapse: collapse; font-size: 9.5pt; margin-bottom: 25px;">
                    <thead>
                        <tr style="background: #eef2ff; font-weight: bold; color: #1e1b4b;">
                            <th style="border: 1px solid #cbd5e1; padding: 8px; width: 35px; text-align: center;">ល.រ</th>
                            <th style="border: 1px solid #cbd5e1; padding: 8px; width: 100px; text-align: center;">មុខវិជ្ជា</th>
                            <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left; width: 180px;">ចំណងជើងកិច្ចការ</th>
                            <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">ការណែនាំលម្អិត</th>
                            <th style="border: 1px solid #cbd5e1; padding: 8px; width: 90px; text-align: center;">ថ្ងៃផុតកំណត់</th>
                            <th style="border: 1px solid #cbd5e1; padding: 8px; width: 75px; text-align: center;">ពិន្ទុ</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>

                <!-- Signatures -->
                <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 35px; font-size: 9.5pt;">
                    <div style="text-align: center;">
                        <p style="font-family: 'Moul', serif; margin-bottom: 50px;">បានឃើញ និងឯកភាព</p>
                        <p style="font-family: 'Moul', serif; margin: 0;">នាយក/នាយិកាសាលា</p>
                    </div>
                    <div style="text-align: center;">
                        <p style="margin: 0; color: #64748b;">ថ្ងៃទី.......... ខែ.......... ឆ្នាំ២០២....</p>
                        <p style="font-family: 'Moul', serif; margin-top: 5px; margin-bottom: 50px;">គ្រូបន្ទុកថ្នាក់</p>
                        <p style="font-weight: bold; margin: 0;">${sInfo.teacher_name || '.......................'}</p>
                    </div>
                </div>
            </div>
        `;

        if (window.CMSPrintManager) {
            let container = document.getElementById("tempHomeworkPrintContainer");
            if (!container) {
                container = document.createElement("div");
                container.id = "tempHomeworkPrintContainer";
                container.style.display = "none";
                document.body.appendChild(container);
            }
            container.innerHTML = printContent;
            window.CMSPrintManager.print('homeworkPrintArea', {
                paperSize: 'A4',
                orientation: 'portrait',
                scale: 100,
                title: `កិច្ចការផ្ទះ_${gradeStr}`
            });
        } else {
            const printWin = window.open('', '_blank');
            if (printWin) {
                printWin.document.open();
                printWin.document.write(`<html><head><title>កិច្ចការផ្ទះ</title></head><body>${printContent}</body></html>`);
                printWin.document.close();
                printWin.focus();
                printWin.print();
            }
        }
    },

    /**
     * Render View ទាំងមូល
     */
    renderView: function() {
        const container = document.getElementById("timetableHomeworkContainer");
        if (!container) return;

        const availableClasses = this.getAvailableClasses();
        const classTeacher = this.getClassTeacherInfo(this.currentGrade);
        const data = this.getTimetableData();
        const activeSlotsCount = Object.keys(data).filter(k => !!data[k].subject).length;
        const recessTimes = this.getRecessTimes();

        // កំណត់សិទ្ធិ Admin
        const isAdmin = typeof window.isSchoolAdmin === 'function' ? window.isSchoolAdmin() : true;

        container.innerHTML = `
            <div class="max-w-[1600px] mx-auto space-y-6 animate-fade-in font-siemreap pb-20">
                
                <!-- Header Banner -->
                ${typeof window.renderExecutiveHeaderHTML === 'function' ? window.renderExecutiveHeaderHTML({
                    title: "កាលវិភាគសិក្សា",
                    subtitle: "រៀបចំកាលវិភាគសិក្សាតាមថ្នាក់ និងកំណត់ម៉ោងសិក្សានីមួយៗដោយខ្លួនឯង",
                    icon: "fa-solid fa-calendar-days",
                    currentClass: this.currentGrade,
                    academicYear: this.currentAcademicYear,
                    clockId: "ttHeaderClock",
                    extraActionsHtml: `
                        <button onclick="window.TimetableHomeworkManager.openPeriodSettingsModal()" class="px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-lg border border-white/20 transform hover:-translate-y-0.5">
                            <i class="fa-solid fa-clock text-amber-300 text-sm"></i> កំណត់ម៉ោងសិក្សា
                        </button>
                    `
                }) : ''}

                <!-- Control Bar (Class Info, Smart Generator, Copy, Print) -->
                <div class="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-700 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    
                    <!-- Class Teacher & Active Slots Badges -->
                    <div class="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        <!-- Class Teacher Badge -->
                        <div class="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-700/60 border border-slate-200/60 dark:border-slate-600 text-xs">
                            <i class="fa-solid fa-chalkboard-user text-emerald-600"></i>
                            <span class="text-slate-500 dark:text-slate-400">គ្រូបន្ទុក៖</span>
                            <span class="font-bold text-slate-800 dark:text-slate-200">
                                ${classTeacher ? `${classTeacher.name} (${classTeacher.teacher_id})` : 'មិនទាន់ចាត់តាំង'}
                            </span>
                        </div>

                        <!-- Active Slots Status -->
                        <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-bold">
                            <i class="fa-solid fa-circle-check"></i>
                            <span>${activeSlotsCount} ម៉ោង/សប្តាហ៍</span>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
                        <!-- Save / Sync to Google Sheets Button -->
                        <button onclick="window.TimetableHomeworkManager.syncToGoogleSheets()" id="btnSyncTimetableGAS" class="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-2xl text-xs font-black shadow-md hover:shadow-lg transition flex items-center gap-2 transform hover:-translate-y-0.5">
                            <i class="fa-solid fa-cloud-arrow-up text-amber-300"></i>
                            <span>រក្សាទុកក្នុង Google Sheets</span>
                        </button>

                        <!-- Thursday Remedial Setup Button -->
                        <button onclick="window.TimetableHomeworkManager.openThursdayRemedialModal()" class="px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 rounded-2xl text-xs font-bold transition flex items-center gap-2 shadow-sm border border-purple-200/60">
                            <i class="fa-solid fa-graduation-cap text-purple-600"></i>
                            <span>បំប៉នថ្ងៃព្រហស្បតិ៍</span>
                        </button>

                        <!-- Configure Period Times Button -->
                        <button onclick="window.TimetableHomeworkManager.openPeriodSettingsModal()" class="px-4 py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 rounded-2xl text-xs font-bold transition flex items-center gap-2 shadow-sm border border-teal-200/60">
                            <i class="fa-solid fa-clock text-teal-600"></i>
                            <span>កំណត់ម៉ោង</span>
                        </button>

                        <!-- Smart Auto-Generator Button -->
                        <button onclick="window.TimetableHomeworkManager.openSmartGeneratorModal()" class="px-4 py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl text-xs font-black shadow-md hover:shadow-lg transition flex items-center gap-2 transform hover:-translate-y-0.5">
                            <i class="fa-solid fa-bolt-lightning text-yellow-200"></i>
                            <span>មុខងារឆ្លាតវៃ (Auto-Generate)</span>
                        </button>

                        <!-- Copy Timetable Button -->
                        <button onclick="window.TimetableHomeworkManager.openCopyModal()" class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold transition flex items-center gap-2 shadow-sm">
                            <i class="fa-solid fa-copy text-indigo-500"></i>
                            <span>ចម្លងកាលវិភាគ</span>
                        </button>

                        <!-- Print Button -->
                        <button onclick="window.TimetableHomeworkManager.printTimetable()" class="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 rounded-2xl text-xs font-bold transition flex items-center gap-2 shadow-sm">
                            <i class="fa-solid fa-print"></i>
                            <span>បោះពុម្ព</span>
                        </button>

                        <!-- Reset / Clear Button -->
                        <button onclick="window.TimetableHomeworkManager.resetTimetable()" class="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-2xl text-xs font-bold transition flex items-center gap-1.5" title="សម្អាតកាលវិភាគថ្នាក់នេះ">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </div>

                <!-- Timetable Grid Container -->
                <div id="tabContentTimetable" class="space-y-6">
                    <div class="bg-white dark:bg-slate-800 rounded-[2rem] p-6 shadow-sm border border-slate-200/80 dark:border-slate-700 overflow-hidden">
                        
                        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-3 border-b border-slate-100 dark:border-slate-700">
                            <div>
                                <h3 class="font-moul text-slate-800 dark:text-white text-base">
                                    កាលវិភាគប្រចាំសប្តាហ៍ — ${this.currentGrade}
                                </h3>
                                <p class="text-xs text-slate-400 mt-0.5">
                                    <i class="fa-solid fa-circle-info text-indigo-400 mr-1"></i> ចុចលើក្រឡាម៉ោងនីមួយៗ ដើម្បីចាត់តាំងមុខវិជ្ជា គ្រូបង្រៀន និងបន្ទប់រៀន
                                </p>
                            </div>
                            <div class="text-xs text-slate-400 flex items-center gap-3">
                                <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> វេនព្រឹក</span>
                                <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-blue-500 inline-block"></span> វេនរសៀល</span>
                            </div>
                        </div>

                        <!-- Timetable Grid -->
                        <div class="overflow-x-auto custom-scrollbar rounded-2xl border border-slate-200 dark:border-slate-700">
                            <table class="w-full border-collapse text-xs text-center font-siemreap">
                                <thead>
                                    <tr class="bg-slate-100/80 dark:bg-slate-700/80 text-slate-700 dark:text-slate-200 font-bold divide-x divide-slate-200 dark:divide-slate-700">
                                        <th class="p-3 w-40">ម៉ោងសិក្សា</th>
                                        ${this.days.map(d => `
                                            <th class="p-3 font-moul text-indigo-950 dark:text-indigo-300">
                                                ${d.label}
                                            </th>
                                        `).join("")}
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
                                    <!-- Morning Session Section -->
                                    <tr class="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 font-bold text-emerald-900 dark:text-emerald-300">
                                        <td colspan="7" class="py-2 text-left px-4">
                                            <i class="fa-solid fa-sun mr-2 text-amber-500"></i> វេនព្រឹក (Morning Session)
                                        </td>
                                    </tr>
                                    <!-- Flag Ceremony (Morning - Before Period 1) -->
                                    <tr class="bg-red-50/80 dark:bg-red-950/40 font-bold text-center text-red-900 dark:text-red-200 border-y border-red-300/80 dark:border-red-700/60">
                                        <td colspan="7" class="py-1.5 px-4 text-xs font-bold">
                                            <i class="fa-solid fa-flag text-red-600 mr-1.5 animate-pulse"></i>
                                            ម៉ោង ${recessTimes.flagMorning} ៖ ការគោរពទង់ជាតិ និងចម្រៀងជាតិ
                                        </td>
                                    </tr>
                                    ${this.periods.filter(p => p.session === 'morning').map(p => {
                                        let rowHtml = this.renderPeriodRow(p);
                                        if (p.slot === 2) {
                                            rowHtml += `
                                                <tr class="bg-amber-100/80 dark:bg-amber-950/40 font-bold text-center text-amber-900 dark:text-amber-200 border-y border-amber-300/80 dark:border-amber-700/60">
                                                    <td colspan="7" class="py-1.5 px-4 text-xs font-bold">
                                                        <i class="fa-solid fa-bell text-amber-600 animate-bounce mr-1.5"></i>
                                                        ម៉ោងចេញលេងលើកទី ១ (${recessTimes.morning1})
                                                    </td>
                                                </tr>
                                            `;
                                        } else if (p.slot === 3) {
                                            rowHtml += `
                                                <tr class="bg-amber-100/80 dark:bg-amber-950/40 font-bold text-center text-amber-900 dark:text-amber-200 border-y border-amber-300/80 dark:border-amber-700/60">
                                                    <td colspan="7" class="py-1.5 px-4 text-xs font-bold">
                                                        <i class="fa-solid fa-bell text-amber-600 animate-bounce mr-1.5"></i>
                                                        ម៉ោងចេញលេងលើកទី ២ (${recessTimes.morning2})
                                                    </td>
                                                </tr>
                                            `;
                                        }
                                        return rowHtml;
                                    }).join("")}

                                    <!-- Afternoon Session Section -->
                                    <tr class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 font-bold text-blue-900 dark:text-blue-300">
                                        <td colspan="7" class="py-2 text-left px-4">
                                            <i class="fa-solid fa-cloud-sun mr-2 text-blue-500"></i> វេនរសៀល (Afternoon Session)
                                        </td>
                                    </tr>
                                    ${this.periods.filter(p => p.session === 'afternoon').map(p => {
                                        let rowHtml = this.renderPeriodRow(p);
                                        if (p.slot === 7) {
                                            rowHtml += `
                                                <tr class="bg-amber-100/80 dark:bg-amber-950/40 font-bold text-center text-amber-900 dark:text-amber-200 border-y border-amber-300/80 dark:border-amber-700/60">
                                                    <td colspan="7" class="py-1.5 px-4 text-xs font-bold">
                                                        <i class="fa-solid fa-bell text-amber-600 animate-bounce mr-1.5"></i>
                                                        ម៉ោងចេញលេងលើកទី ១ (${recessTimes.afternoon1})
                                                    </td>
                                                </tr>
                                            `;
                                        } else if (p.slot === 8) {
                                            rowHtml += `
                                                <tr class="bg-amber-100/80 dark:bg-amber-950/40 font-bold text-center text-amber-900 dark:text-amber-200 border-y border-amber-300/80 dark:border-amber-700/60">
                                                    <td colspan="7" class="py-1.5 px-4 text-xs font-bold">
                                                        <i class="fa-solid fa-bell text-amber-600 animate-bounce mr-1.5"></i>
                                                        ម៉ោងចេញលេងលើកទី ២ (${recessTimes.afternoon2})
                                                    </td>
                                                </tr>
                                            `;
                                        }
                                        return rowHtml;
                                    }).join("")}
                                    <!-- Flag Ceremony (Afternoon - After Period 5) -->
                                    <tr class="bg-red-50/80 dark:bg-red-950/40 font-bold text-center text-red-900 dark:text-red-200 border-y border-red-300/80 dark:border-red-700/60">
                                        <td colspan="7" class="py-1.5 px-4 text-xs font-bold">
                                            <i class="fa-solid fa-flag text-red-600 mr-1.5 animate-pulse"></i>
                                            ម៉ោង ${recessTimes.flagAfternoon} ៖ គោរពទង់ជាតិ
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <!-- 🟢 ផ្នែកខាងក្រោមនៃកាលវិភាគ៖ សម្គាល់ និងហត្ថលេខាផ្លូវការ (Match Image 1) 🟢 -->
                        ${this.getTimetableFootnoteHtml(false)}
                    </div>
                </div>

            </div>

            <!-- MODAL: Period Settings Modal (កំណត់ម៉ោងសិក្សានីមួយៗដោយខ្លួនឯង) -->
            <div id="periodSettingsModal" class="hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-siemreap">
                <div class="bg-white dark:bg-slate-800 rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-700 animate-scale-up space-y-6 custom-scrollbar">
                    <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 dark:bg-teal-900/60 dark:text-teal-300 flex items-center justify-center text-xl shadow-inner">
                                <i class="fa-solid fa-clock"></i>
                            </div>
                            <div>
                                <h3 class="font-moul text-base text-slate-800 dark:text-white">កំណត់ម៉ោងសិក្សានីមួយៗ</h3>
                                <p class="text-xs text-slate-400">កំណត់ម៉ោងចូលរៀន និងចេញរៀនសម្រាប់ម៉ោងនីមួយៗតាមការជាក់ស្ដែង</p>
                            </div>
                        </div>
                        <button onclick="window.TimetableHomeworkManager.closePeriodSettingsModal()" class="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-500 text-sm flex items-center justify-center transition">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    <div class="space-y-6 text-xs">
                        <!-- ម៉ោងចេញលេង និងគោរពទង់ជាតិ (Recess Breaks & Flag Ceremony) -->
                        <div class="p-4 bg-amber-50/80 dark:bg-amber-950/30 rounded-2xl border border-amber-200/80 dark:border-amber-700/50 space-y-4">
                            <h4 class="font-bold text-amber-800 dark:text-amber-300 text-sm flex items-center gap-2">
                                <i class="fa-solid fa-bell text-amber-600"></i> ម៉ោងចេញលេង និងគោរពទង់ជាតិ (Recess Breaks & Flag Ceremony)
                            </h4>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <!-- Morning Recess & Flag -->
                                <div class="p-3.5 bg-white/90 dark:bg-slate-800/90 rounded-2xl border border-emerald-200 dark:border-emerald-700/40 space-y-2.5">
                                    <div class="font-bold text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-1.5 pb-1 border-b border-emerald-100 dark:border-emerald-800">
                                        <i class="fa-solid fa-sun text-amber-500"></i> វេនព្រឹក (Morning)
                                    </div>
                                    <div>
                                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">គោរពទង់ជាតិ (ពេលព្រឹក មុនម៉ោងទី ១)</label>
                                        <input type="text" id="custom_flag_morning" value="${recessTimes.flagMorning}" class="w-full px-3 py-1.5 rounded-xl border border-red-300 dark:border-red-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-red-900 dark:text-red-200 outline-none focus:ring-2 focus:ring-red-500" placeholder="ឧ. ០៦:៥០ - ០៧:០០">
                                    </div>
                                    <div>
                                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">ចេញលេងលើកទី ១ (ក្រោយម៉ោងទី ២)</label>
                                        <input type="text" id="custom_recess_morning1" value="${recessTimes.morning1}" class="w-full px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-amber-900 dark:text-amber-200 outline-none focus:ring-2 focus:ring-amber-500" placeholder="ឧ. ០៨:២០ - ០៨:៣៥">
                                    </div>
                                    <div>
                                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">ចេញលេងលើកទី ២ (ក្រោយម៉ោងទី ៣)</label>
                                        <input type="text" id="custom_recess_morning2" value="${recessTimes.morning2}" class="w-full px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-amber-900 dark:text-amber-200 outline-none focus:ring-2 focus:ring-amber-500" placeholder="ឧ. ០៩:១៥ - ០៩:៣០">
                                    </div>
                                </div>
                                <!-- Afternoon Recess & Flag -->
                                <div class="p-3.5 bg-white/90 dark:bg-slate-800/90 rounded-2xl border border-blue-200 dark:border-blue-700/40 space-y-2.5">
                                    <div class="font-bold text-blue-700 dark:text-blue-400 text-xs flex items-center gap-1.5 pb-1 border-b border-blue-100 dark:border-blue-800">
                                        <i class="fa-solid fa-cloud-sun text-blue-500"></i> វេនរសៀល (Afternoon)
                                    </div>
                                    <div>
                                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">ចេញលេងលើកទី ១ (ក្រោយម៉ោងទី ២ រសៀល)</label>
                                        <input type="text" id="custom_recess_afternoon1" value="${recessTimes.afternoon1}" class="w-full px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-amber-900 dark:text-amber-200 outline-none focus:ring-2 focus:ring-amber-500" placeholder="ឧ. ០២:២០ - ០២:៣៥">
                                    </div>
                                    <div>
                                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">ចេញលេងលើកទី ២ (ក្រោយម៉ោងទី ៣ រសៀល)</label>
                                        <input type="text" id="custom_recess_afternoon2" value="${recessTimes.afternoon2}" class="w-full px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-amber-900 dark:text-amber-200 outline-none focus:ring-2 focus:ring-amber-500" placeholder="ឧ. ០៣:១៥ - ០៣:៣០">
                                    </div>
                                    <div>
                                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">គោរពទង់ជាតិ (ពេលរសៀល ក្រោយម៉ោងទី ៥)</label>
                                        <input type="text" id="custom_flag_afternoon" value="${recessTimes.flagAfternoon}" class="w-full px-3 py-1.5 rounded-xl border border-red-300 dark:border-red-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-red-900 dark:text-red-200 outline-none focus:ring-2 focus:ring-red-500" placeholder="ឧ. ០៤:៥០ - ០៥:០០">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- វេនព្រឹក (Morning Periods) -->
                        <div>
                            <h4 class="font-bold text-emerald-700 dark:text-emerald-400 text-sm mb-3 flex items-center gap-2">
                                <i class="fa-solid fa-sun text-amber-500"></i> វេនព្រឹក (Morning Sessions)
                            </h4>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                ${this.periods.filter(p => p.session === 'morning').map(p => `
                                    <div class="p-3.5 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-200/80 dark:border-slate-600 space-y-2">
                                        <div class="flex items-center justify-between">
                                            <label class="font-bold text-slate-700 dark:text-slate-200">${p.label}</label>
                                            <span class="text-[10px] text-slate-400 font-mono">Slot ${p.slot}</span>
                                        </div>
                                        <input type="text" id="custom_period_label_${p.slot}" value="${p.label}" class="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-teal-500" placeholder="ឈ្មោះម៉ោងសិក្សា">
                                        <input type="text" id="custom_period_time_${p.slot}" value="${p.time}" class="w-full px-3 py-2 rounded-xl border border-teal-200 dark:border-teal-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-teal-800 dark:text-teal-300 outline-none focus:ring-2 focus:ring-teal-500" placeholder="ឧ. ០៧:០០ - ០៧:៤៥">
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- វេនរសៀល (Afternoon Periods) -->
                        <div>
                            <h4 class="font-bold text-blue-700 dark:text-blue-400 text-sm mb-3 flex items-center gap-2">
                                <i class="fa-solid fa-cloud-sun text-blue-500"></i> វេនរសៀល (Afternoon Sessions)
                            </h4>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                ${this.periods.filter(p => p.session === 'afternoon').map(p => `
                                    <div class="p-3.5 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-200/80 dark:border-slate-600 space-y-2">
                                        <div class="flex items-center justify-between">
                                            <label class="font-bold text-slate-700 dark:text-slate-200">${p.label}</label>
                                            <span class="text-[10px] text-slate-400 font-mono">Slot ${p.slot}</span>
                                        </div>
                                        <input type="text" id="custom_period_label_${p.slot}" value="${p.label}" class="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-teal-500" placeholder="ឈ្មោះម៉ោងសិក្សា">
                                        <input type="text" id="custom_period_time_${p.slot}" value="${p.time}" class="w-full px-3 py-2 rounded-xl border border-blue-200 dark:border-blue-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-blue-800 dark:text-blue-300 outline-none focus:ring-2 focus:ring-teal-500" placeholder="ឧ. ១៣:០០ - ១៣:៤៥">
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <button onclick="window.TimetableHomeworkManager.resetPeriodsToDefault()" class="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition border border-rose-200/60">
                            <i class="fa-solid fa-rotate-left mr-1"></i> កំណត់ដូចដើម (ក្រសួង)
                        </button>
                        <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
                            <button onclick="window.TimetableHomeworkManager.closePeriodSettingsModal()" class="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                                បោះបង់
                            </button>
                            <button onclick="window.TimetableHomeworkManager.saveCustomPeriods()" class="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2">
                                <i class="fa-solid fa-check"></i> រក្សាទុកម៉ោងសិក្សា
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- MODAL: Thursday Remedial Setup Modal (ម៉ោងបំប៉នបន្ថែមថ្ងៃព្រហស្បតិ៍) -->
            <div id="thursdayRemedialModal" class="hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-siemreap">
                <div class="bg-white dark:bg-slate-800 rounded-[2.5rem] w-full max-w-lg p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-700 animate-scale-up space-y-5 text-xs">
                    <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300 flex items-center justify-center text-lg">
                                <i class="fa-solid fa-graduation-cap"></i>
                            </div>
                            <div>
                                <h4 class="font-moul text-sm text-slate-800 dark:text-white">រៀបចំម៉ោងបំប៉នបន្ថែមថ្ងៃព្រហស្បតិ៍</h4>
                                <span class="text-[11px] text-purple-600 font-bold">វិទ្យាសាស្ត្រ • ភាសាខ្មែរ • គណិតវិទ្យា (${this.currentGrade})</span>
                            </div>
                        </div>
                        <button onclick="window.TimetableHomeworkManager.closeThursdayRemedialModal()" class="text-slate-400 hover:text-slate-600 text-lg">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    <div class="space-y-3.5">
                        <div>
                            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">វេនសិក្សាសម្រាប់បំប៉ន</label>
                            <select id="thu_session_choice" class="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl px-3.5 py-2 font-bold text-slate-800 dark:text-white outline-none">
                                <option value="morning">វេនព្រឹក (ម៉ោងទី ១ ដល់ ទី ៤)</option>
                                <option value="afternoon">វេនរសៀល (ម៉ោងទី ៥ ដល់ ទី ៨)</option>
                            </select>
                        </div>

                        <div class="space-y-2">
                            <label class="block font-bold text-slate-700 dark:text-slate-300">កំណត់មុខវិជ្ជាបំប៉ននីមួយៗ</label>
                            <div class="grid grid-cols-2 gap-2.5">
                                <div>
                                    <span class="text-[10px] text-slate-500 font-bold block mb-1">ម៉ោងទី ១៖</span>
                                    <select id="thu_slot_1" class="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 dark:text-white outline-none">
                                        <option value="បំប៉នបន្ថែម (ភាសាខ្មែរ)" selected>បំប៉ន (ភាសាខ្មែរ)</option>
                                        <option value="បំប៉នបន្ថែម (គណិតវិទ្យា)">បំប៉ន (គណិតវិទ្យា)</option>
                                        <option value="បំប៉នបន្ថែម (វិទ្យាសាស្ត្រ)">បំប៉ន (វិទ្យាសាស្ត្រ)</option>
                                        <option value="បំប៉នបន្ថែម">បំប៉នបន្ថែមទូទៅ</option>
                                        <option value="empty">-- ទុកទំនេរ --</option>
                                    </select>
                                </div>
                                <div>
                                    <span class="text-[10px] text-slate-500 font-bold block mb-1">ម៉ោងទី ២៖</span>
                                    <select id="thu_slot_2" class="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 dark:text-white outline-none">
                                        <option value="បំប៉នបន្ថែម (គណិតវិទ្យា)" selected>បំប៉ន (គណិតវិទ្យា)</option>
                                        <option value="បំប៉នបន្ថែម (ភាសាខ្មែរ)">បំប៉ន (ភាសាខ្មែរ)</option>
                                        <option value="បំប៉នបន្ថែម (វិទ្យាសាស្ត្រ)">បំប៉ន (វិទ្យាសាស្ត្រ)</option>
                                        <option value="បំប៉នបន្ថែម">បំប៉នបន្ថែមទូទៅ</option>
                                        <option value="empty">-- ទុកទំនេរ --</option>
                                    </select>
                                </div>
                                <div>
                                    <span class="text-[10px] text-slate-500 font-bold block mb-1">ម៉ោងទី ៣ (វិទ្យាសាស្ត្រ)៖</span>
                                    <select id="thu_slot_3" class="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 dark:text-white outline-none">
                                        <option value="បំប៉នបន្ថែម (វិទ្យាសាស្ត្រ)" selected>🔬 បំប៉ន (វិទ្យាសាស្ត្រ)</option>
                                        <option value="បំប៉នបន្ថែម (ភាសាខ្មែរ)">បំប៉ន (ភាសាខ្មែរ)</option>
                                        <option value="បំប៉នបន្ថែម (គណិតវិទ្យា)">បំប៉ន (គណិតវិទ្យា)</option>
                                        <option value="បំប៉នបន្ថែម">បំប៉នបន្ថែមទូទៅ</option>
                                        <option value="empty">-- ទុកទំនេរ --</option>
                                    </select>
                                </div>
                                <div>
                                    <span class="text-[10px] text-slate-500 font-bold block mb-1">ម៉ោងទី ៤៖</span>
                                    <select id="thu_slot_4" class="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 dark:text-white outline-none">
                                        <option value="ក្លឹបសិក្សា/ស្វ័យសិក្សា" selected>ក្លឹបសិក្សា/ស្វ័យសិក្សា</option>
                                        <option value="បំប៉នបន្ថែម (វិទ្យាសាស្ត្រ)">🔬 បំប៉ន (វិទ្យាសាស្ត្រ)</option>
                                        <option value="បំប៉នបន្ថែម (ភាសាខ្មែរ)">បំប៉ន (ភាសាខ្មែរ)</option>
                                        <option value="បំប៉នបន្ថែម (គណិតវិទ្យា)">បំប៉ន (គណិតវិទ្យា)</option>
                                        <option value="empty">-- ទុកទំនេរ --</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div class="bg-purple-50 dark:bg-purple-950/40 p-3 rounded-2xl border border-purple-200/60 dark:border-purple-800/60 text-purple-900 dark:text-purple-200 text-[11px] leading-relaxed">
                            <i class="fa-solid fa-circle-check text-purple-600 mr-1"></i>
                            មុខវិជ្ជាបំប៉នបន្ថែមនៅថ្ងៃព្រហស្បតិ៍រួមមាន <b>វិទ្យាសាស្ត្រ</b>, <b>ភាសាខ្មែរ</b>, <b>គណិតវិទ្យា</b> និង<b>ក្លឹបសិក្សា</b> តាមការណែនាំរបស់ក្រសួង។
                        </div>
                    </div>

                    <div class="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                        <button type="button" onclick="window.TimetableHomeworkManager.closeThursdayRemedialModal()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold">បោះបង់</button>
                        <button type="button" onclick="window.TimetableHomeworkManager.applyThursdayRemedial()" class="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md flex items-center gap-1.5">
                            <i class="fa-solid fa-check"></i> អនុវត្តម៉ោងបំប៉ន
                        </button>
                    </div>
                </div>
            </div>

            <!-- MODAL 1: Smart Auto-Generator Modal (ម៉ាស៊ីនបង្កើតកាលវិភាគឆ្លាតវៃ) -->
            <div id="smartGeneratorModal" class="hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-siemreap">
                <div class="bg-white dark:bg-slate-800 rounded-[2.5rem] w-full max-w-lg p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-700 animate-scale-up space-y-6">
                    <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-lg">
                                <i class="fa-solid fa-bolt-lightning"></i>
                            </div>
                            <div>
                                <h4 class="font-moul text-sm text-slate-800 dark:text-white">ម៉ាស៊ីនបង្កើតកាលវិភាគឆ្លាតវៃ</h4>
                                <span class="text-[11px] text-slate-400">ស្វ័យប្រវត្តិតាមគរុកោសល្យ និងស្តង់ដារក្រសួងអប់រំ</span>
                            </div>
                        </div>
                        <button onclick="window.TimetableHomeworkManager.closeSmartGeneratorModal()" class="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    <form id="smartGeneratorForm" onsubmit="window.TimetableHomeworkManager.handleRunSmartGenerator(event)" class="space-y-4 text-xs">
                        <!-- Session Mode -->
                        <div>
                            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                <i class="fa-solid fa-clock text-indigo-500 mr-1"></i> ជ្រើសរើសវេនសិក្សា (Session Mode)
                            </label>
                            <div class="grid grid-cols-3 gap-2">
                                <label class="border border-slate-200 dark:border-slate-600 rounded-2xl p-3 flex flex-col items-center justify-center text-center cursor-pointer hover:border-emerald-500 transition has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-50 dark:has-[:checked]:bg-emerald-950/40">
                                    <input type="radio" name="genSession" value="morning" checked class="sr-only">
                                    <i class="fa-solid fa-sun text-amber-500 text-lg mb-1"></i>
                                    <span class="font-bold text-slate-800 dark:text-white">វេនព្រឹក</span>
                                    <span class="text-[10px] text-slate-400">៤ ម៉ោង/ថ្ងៃ</span>
                                </label>
                                <label class="border border-slate-200 dark:border-slate-600 rounded-2xl p-3 flex flex-col items-center justify-center text-center cursor-pointer hover:border-emerald-500 transition has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-50 dark:has-[:checked]:bg-emerald-950/40">
                                    <input type="radio" name="genSession" value="afternoon" class="sr-only">
                                    <i class="fa-solid fa-cloud-sun text-blue-500 text-lg mb-1"></i>
                                    <span class="font-bold text-slate-800 dark:text-white">វេនរសៀល</span>
                                    <span class="text-[10px] text-slate-400">៤ ម៉ោង/ថ្ងៃ</span>
                                </label>
                                <label class="border border-slate-200 dark:border-slate-600 rounded-2xl p-3 flex flex-col items-center justify-center text-center cursor-pointer hover:border-emerald-500 transition has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-50 dark:has-[:checked]:bg-emerald-950/40">
                                    <input type="radio" name="genSession" value="fullday" class="sr-only">
                                    <i class="fa-solid fa-calendar-week text-purple-500 text-lg mb-1"></i>
                                    <span class="font-bold text-slate-800 dark:text-white">ពេញមួយថ្ងៃ</span>
                                    <span class="text-[10px] text-slate-400">៨ ម៉ោង/ថ្ងៃ</span>
                                </label>
                            </div>
                        </div>

                        <!-- Target Scope -->
                        <div>
                            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                <i class="fa-solid fa-bullseye text-indigo-500 mr-1"></i> វិសាលភាពនៃការអនុវត្ត (Target Scope)
                            </label>
                            <select id="genTargetScope" class="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl px-4 py-2.5 font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-500">
                                <option value="current">អនុវត្តតែលើថ្នាក់បច្ចុប្បន្ន (${this.currentGrade})</option>
                                <option value="all">⚡ អនុវត្តលើគ្រប់ថ្នាក់ទាំងអស់ក្នុងសាលា (${availableClasses.length} ថ្នាក់)</option>
                            </select>
                        </div>

                        <!-- Highlights Box -->
                        <div class="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 rounded-2xl p-3.5 space-y-1.5 text-[11px] text-amber-900 dark:text-amber-200">
                            <div class="font-bold flex items-center gap-1.5">
                                <i class="fa-solid fa-lightbulb text-amber-500"></i> ក្បួនគណនាឆ្លាតវៃ៖
                            </div>
                            <ul class="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-300">
                                <li>ម៉ោងទី ១-២ (ព្រឹក)៖ មុខវិជ្ជាស្នូល (ភាសាខ្មែរ, គណិតវិទ្យា)</li>
                                <li>ម៉ោងទី ៣-៤ (ព្រឹក)៖ វិទ្យាសាស្ត្រ, សិក្សាសង្គម, អង់គ្លេស</li>
                                <li>ម៉ោងរសៀល ឬចុងសប្តាហ៍៖ កីឡា, សិល្បៈ, បំណិនជីវិត</li>
                                <li>ចាត់តាំងគ្រូទទួលបន្ទុកថ្នាក់ស្វ័យប្រវត្តិចូលក្នុងម៉ោង</li>
                            </ul>
                        </div>

                        <div class="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                            <button type="button" onclick="window.TimetableHomeworkManager.closeSmartGeneratorModal()" class="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl font-bold">
                                បោះបង់
                            </button>
                            <button type="submit" class="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl font-black shadow-md transition flex items-center gap-2">
                                <i class="fa-solid fa-wand-magic-sparkles"></i> <span>ចាប់ផ្តើមបង្កើតស្វ័យប្រវត្តិ</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- MODAL 2: Copy Timetable Modal (ចម្លងកាលវិភាគពីថ្នាក់ផ្សេង) -->
            <div id="copyTimetableModal" class="hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-siemreap">
                <div class="bg-white dark:bg-slate-800 rounded-[2.5rem] w-full max-w-md p-6 shadow-2xl border border-slate-200 dark:border-slate-700 animate-scale-up space-y-4 text-xs">
                    <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                        <h4 class="font-moul text-sm text-slate-800 dark:text-white">ចម្លងកាលវិភាគពីថ្នាក់ផ្សេង</h4>
                        <button onclick="window.TimetableHomeworkManager.closeCopyModal()" class="text-slate-400 hover:text-slate-600 text-lg">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    <div class="space-y-3">
                        <p class="text-slate-500 dark:text-slate-400">
                            ជ្រើសរើសថ្នាក់ដែលបានរៀបចំកាលវិភាគរួច ដើម្បីចម្លងមកកាន់ថ្នាក់ <b>«${this.currentGrade}»</b>៖
                        </p>
                        <div>
                            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">ថ្នាក់ប្រភព (Source Class)</label>
                            <select id="copySourceGradeSelect" class="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl px-4 py-2.5 font-bold text-slate-800 dark:text-white outline-none">
                                ${availableClasses.filter(c => c !== this.currentGrade).map(c => `
                                    <option value="${c}">${c}</option>
                                `).join("")}
                            </select>
                        </div>
                    </div>

                    <div class="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                        <button type="button" onclick="window.TimetableHomeworkManager.closeCopyModal()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold">បោះបង់</button>
                        <button type="button" onclick="window.TimetableHomeworkManager.handleConfirmCopy()" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md">ចម្លងទិន្នន័យ</button>
                    </div>
                </div>
            </div>

            <!-- MODAL 3: Edit Timetable Cell (ចាត់តាំងមុខវិជ្ជា និងគ្រូបង្រៀន) -->
            <div id="editSlotModal" class="hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-siemreap">
                <div class="bg-white dark:bg-slate-800 rounded-[2.5rem] w-full max-w-lg p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-700 animate-scale-up space-y-4">
                    <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                        <div>
                            <h4 class="font-moul text-sm text-slate-800 dark:text-white" id="editSlotTitle">កំណត់មុខវិជ្ជា & គ្រូបង្រៀន</h4>
                            <span class="text-[11px] text-indigo-600 font-bold" id="editSlotSubtitle">${this.currentGrade}</span>
                        </div>
                        <button onclick="window.TimetableHomeworkManager.closeSlotModal()" class="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    <!-- Teacher Conflict Warning Banner -->
                    <div id="slotConflictAlert" class="hidden bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-3 text-xs font-bold flex items-center gap-2">
                        <i class="fa-solid fa-triangle-exclamation text-rose-500 text-base shrink-0"></i>
                        <span id="slotConflictText"></span>
                    </div>

                    <form id="editSlotForm" onsubmit="window.TimetableHomeworkManager.handleSaveSlot(event)" class="space-y-3.5 text-xs">
                        <input type="hidden" id="slotDayKey">
                        <input type="hidden" id="slotIndex">

                        <!-- Quick Box for Thursday Remedial Subjects -->
                        <div id="thuRemedialQuickBox" class="hidden p-3 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-800 space-y-2">
                            <div class="text-[11px] font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                                <i class="fa-solid fa-bolt text-purple-600"></i>
                                <span>ជ្រើសរើសរហ័ស ម៉ោងបំប៉នថ្ងៃព្រហស្បតិ៍៖</span>
                            </div>
                            <div class="flex flex-wrap gap-1.5">
                                <button type="button" onclick="document.getElementById('slotSubjectSelect').value='បំប៉នបន្ថែម (វិទ្យាសាស្ត្រ)'" class="px-2.5 py-1 bg-white dark:bg-slate-800 border border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 rounded-xl text-[10.5px] font-bold hover:bg-purple-100 transition shadow-xs">
                                    🔬 បំប៉នវិទ្យាសាស្ត្រ
                                </button>
                                <button type="button" onclick="document.getElementById('slotSubjectSelect').value='បំប៉នបន្ថែម (ភាសាខ្មែរ)'" class="px-2.5 py-1 bg-white dark:bg-slate-800 border border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 rounded-xl text-[10.5px] font-bold hover:bg-purple-100 transition shadow-xs">
                                    📖 បំប៉នភាសាខ្មែរ
                                </button>
                                <button type="button" onclick="document.getElementById('slotSubjectSelect').value='បំប៉នបន្ថែម (គណិតវិទ្យា)'" class="px-2.5 py-1 bg-white dark:bg-slate-800 border border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 rounded-xl text-[10.5px] font-bold hover:bg-purple-100 transition shadow-xs">
                                    📐 បំប៉នគណិតវិទ្យា
                                </button>
                                <button type="button" onclick="document.getElementById('slotSubjectSelect').value='ក្លឹបសិក្សា/ស្វ័យសិក្សា'" class="px-2.5 py-1 bg-white dark:bg-slate-800 border border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 rounded-xl text-[10.5px] font-bold hover:bg-purple-100 transition shadow-xs">
                                    🏆 ក្លឹបសិក្សា
                                </button>
                            </div>
                        </div>

                        <div>
                            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">មុខវិជ្ជា (Subject)</label>
                            <select id="slotSubjectSelect" class="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl px-3.5 py-2.5 font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500">
                                <option value="">-- ទំនេរ / គ្មានម៉ោង --</option>
                                <optgroup label="មុខវិជ្ជាបឋមសិក្សា">
                                    ${this.primarySubjects.map(s => `<option value="${s.name}">${s.name}</option>`).join("")}
                                </optgroup>
                                <optgroup label="មុខវិជ្ជាអនុវិទ្យាល័យ">
                                    ${this.secondarySubjects.map(s => `<option value="${s.name}">${s.name}</option>`).join("")}
                                </optgroup>
                            </select>
                        </div>

                        <div>
                            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">គ្រូបង្រៀន (Teacher)</label>
                            <select id="slotTeacherSelect" onchange="window.TimetableHomeworkManager.handleSlotTeacherChange(this.value)" class="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl px-3.5 py-2.5 font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500">
                                <option value="">-- ជ្រើសរើសគ្រូបង្រៀន (Optional) --</option>
                                ${this.getTeachersList().map(t => `
                                    <option value="${t.teacher_id}" data-name="${t.name}">
                                        ${t.name} (${t.teacher_id}) ${t.assigned_grade ? `— ទទួលបន្ទុក ${t.assigned_grade}` : ''}
                                    </option>
                                `).join("")}
                            </select>
                        </div>

                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">បន្ទប់រៀន / ទីតាំង</label>
                                <input type="text" id="slotRoomInput" placeholder="ឧ. បន្ទប់ ១០១" class="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl px-3.5 py-2 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500">
                            </div>
                            <div>
                                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">ចំណាំបន្ថែម</label>
                                <input type="text" id="slotNoteInput" placeholder="ឧ. យកសម្ភារពិសោធន៍" class="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl px-3.5 py-2 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500">
                            </div>
                        </div>

                        <div class="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-700">
                            <button type="button" onclick="window.TimetableHomeworkManager.handleClearSingleSlot()" class="text-rose-600 hover:text-rose-700 font-bold text-xs flex items-center gap-1">
                                <i class="fa-solid fa-eraser"></i> លុបម៉ោងនេះ
                            </button>
                            <div class="flex gap-2">
                                <button type="button" onclick="window.TimetableHomeworkManager.closeSlotModal()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold">បោះបង់</button>
                                <button type="submit" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md">រក្សាទុក</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <!-- MODAL 4: Create Homework Modal -->
            <div id="newHomeworkModal" class="hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-siemreap">
                <div class="bg-white dark:bg-slate-800 rounded-[2.5rem] w-full max-w-lg p-6 shadow-2xl border border-slate-200 dark:border-slate-700 animate-scale-up text-xs space-y-4">
                    <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                        <div>
                            <h4 class="font-moul text-sm text-slate-800 dark:text-white">បង្កើតកិច្ចការផ្ទះថ្មី</h4>
                            <span class="text-[11px] text-emerald-600 font-bold">${this.currentGrade}</span>
                        </div>
                        <button onclick="window.TimetableHomeworkManager.closeNewHomeworkModal()" class="text-slate-400 hover:text-slate-600 text-lg">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    <form id="newHomeworkForm" onsubmit="window.TimetableHomeworkManager.handleSaveHomework(event)" class="space-y-3.5">
                        <div>
                            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">មុខវិជ្ជា</label>
                            <select id="hwSubject" required class="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl px-3.5 py-2.5 font-bold text-slate-800 dark:text-white outline-none">
                                ${this.primarySubjects.map(s => `<option value="${s.name}">${s.name}</option>`).join("")}
                            </select>
                        </div>

                        <div>
                            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">ចំណងជើងកិច្ចការ</label>
                            <input type="text" id="hwTitle" required placeholder="ឧ. លំហាត់ប្រភាគ ទំព័រ ៤៥" class="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl px-3.5 py-2.5 text-slate-800 dark:text-white outline-none">
                        </div>

                        <div>
                            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">ការណែនាំ / សេចក្តីលម្អិត</label>
                            <textarea id="hwDesc" rows="3" placeholder="សរសេរការណែនាំដល់សិស្ស..." class="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl px-3.5 py-2 text-slate-800 dark:text-white outline-none"></textarea>
                        </div>

                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">កាលបរិច្ឆេទប្រគល់ (Due Date)</label>
                                <input type="date" id="hwDueDate" required class="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl px-3.5 py-2 text-slate-800 dark:text-white outline-none">
                            </div>
                            <div>
                                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">ពិន្ទុអតិបរមា</label>
                                <input type="number" id="hwMaxScore" value="10" min="1" max="100" class="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl px-3.5 py-2 font-bold text-slate-800 dark:text-white outline-none">
                            </div>
                        </div>

                        <div class="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                            <button type="button" onclick="window.TimetableHomeworkManager.closeNewHomeworkModal()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold">បោះបង់</button>
                            <button type="submit" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md">ដាក់កិច្ចការ</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- MODAL 5: Homework Submission Tracker Modal -->
            <div id="hwSubmissionModal" class="hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-siemreap">
                <div class="bg-white dark:bg-slate-800 rounded-[2.5rem] w-full max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-700 animate-scale-up space-y-4">
                    <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                        <div>
                            <h4 class="font-moul text-sm text-slate-800 dark:text-white" id="subModalHwTitle">តាមដានការប្រគល់កិច្ចការ</h4>
                            <span class="text-xs text-slate-400 font-medium" id="subModalHwSubtitle">ថ្នាក់ទី...</span>
                        </div>
                        <button onclick="window.TimetableHomeworkManager.closeSubmissionModal()" class="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    <div class="overflow-x-auto custom-scrollbar rounded-2xl border border-slate-200 dark:border-slate-700">
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
                            <tbody id="subStudentsTableBody" class="divide-y divide-slate-100 dark:divide-slate-700">
                                <!-- Populated dynamically -->
                            </tbody>
                        </table>
                    </div>

                    <div class="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                        <button onclick="window.TimetableHomeworkManager.closeSubmissionModal()" class="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold">បិទ</button>
                    </div>
                </div>
            </div>
        `;

        if (this.activeTab === 'homework') {
            this.renderHomeworkCards();
        }
    },

    /**
     * Render Period Row ក្នុងតារាង
     */
    renderPeriodRow: function(period) {
        const data = this.getTimetableData();

        return `
            <tr class="divide-x divide-slate-200 dark:divide-slate-700 hover:bg-slate-50/60 dark:hover:bg-slate-700/40 transition">
                <td class="p-3 bg-slate-50/70 dark:bg-slate-800 text-center">
                    <span class="font-bold text-slate-800 dark:text-white block text-xs">
                        ${period.label.split(' ')[0]} ${period.label.split(' ')[1]}
                    </span>
                    <span class="text-[10px] text-slate-400 font-mono block mt-0.5">${period.time}</span>
                </td>
                ${this.days.map(d => {
                    const slotData = data[`${d.key}_${period.slot}`] || {};
                    const hasSub = !!slotData.subject;

                    // ស្វែងរកពណ៌តាមមុខវិជ្ជា
                    const allSubs = [...this.primarySubjects, ...this.secondarySubjects];
                    const matchSub = allSubs.find(s => s.name === slotData.subject);
                    const colorClass = matchSub ? matchSub.color : "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300";

                    return `
                        <td onclick="window.TimetableHomeworkManager.openSlotModal('${d.key}', ${period.slot}, '${d.label}', '${period.label}')" class="p-2 cursor-pointer hover:bg-emerald-50/70 dark:hover:bg-slate-700/60 transition relative group">
                            ${hasSub ? `
                                <div class="${colorClass} border rounded-2xl p-2.5 shadow-xs transition transform group-hover:scale-[1.02] text-left">
                                    <div class="font-bold text-xs truncate flex items-center justify-between">
                                        <span>${slotData.subject}</span>
                                        <i class="fa-solid fa-pen-to-square text-[10px] opacity-0 group-hover:opacity-100 transition"></i>
                                    </div>
                                    
                                    
                                </div>
                            ` : `
                                <div class="py-3 text-slate-300 dark:text-slate-600 text-[11px] group-hover:text-emerald-600 flex flex-col items-center justify-center gap-1">
                                    <i class="fa-solid fa-plus text-[10px] opacity-0 group-hover:opacity-100 transition"></i>
                                    <span>- ទំនេរ -</span>
                                </div>
                            `}
                        </td>
                    `;
                }).join("")}
            </tr>
        `;
    },

    // ==========================================
    // SLOT MODAL HANDLERS
    // ==========================================
    openSlotModal: function(dayKey, slotIndex, dayLabel, periodLabel) {
        const modal = document.getElementById("editSlotModal");
        if (!modal) return;

        const data = this.getTimetableData();
        const slotData = data[`${dayKey}_${slotIndex}`] || {};

        document.getElementById("slotDayKey").value = dayKey;
        document.getElementById("slotIndex").value = slotIndex;
        document.getElementById("editSlotTitle").textContent = `${dayLabel} — ${periodLabel}`;
        document.getElementById("editSlotSubtitle").textContent = `ថ្នាក់៖ ${this.currentGrade}`;
        document.getElementById("slotSubjectSelect").value = slotData.subject || "";
        document.getElementById("slotTeacherSelect").value = slotData.teacher_id || "";
        document.getElementById("slotRoomInput").value = slotData.room || (this.currentGrade.split(' ')[1] || "");
        document.getElementById("slotNoteInput").value = slotData.note || "";

        // ត្រួតពិនិត្យ Conflict ដំបូង
        this.handleSlotTeacherChange(slotData.teacher_id || "");

        // បង្ហាញ Quick Box សម្រាប់ថ្ងៃព្រហស្បតិ៍
        const thuBox = document.getElementById("thuRemedialQuickBox");
        if (thuBox) {
            if (dayKey === 'thu') {
                thuBox.classList.remove("hidden");
            } else {
                thuBox.classList.add("hidden");
            }
        }

        modal.classList.remove("hidden");
    },

    closeSlotModal: function() {
        const modal = document.getElementById("editSlotModal");
        if (modal) modal.classList.add("hidden");
    },

    handleSlotTeacherChange: function(teacherId) {
        const alertEl = document.getElementById("slotConflictAlert");
        const alertText = document.getElementById("slotConflictText");
        const dayKey = document.getElementById("slotDayKey")?.value;
        const slotIndex = document.getElementById("slotIndex")?.value;

        if (!teacherId || !dayKey || !slotIndex) {
            if (alertEl) alertEl.classList.add("hidden");
            return;
        }

        const conflict = this.checkTeacherConflict(teacherId, dayKey, slotIndex, this.currentGrade);
        if (conflict && alertEl && alertText) {
            alertEl.classList.remove("hidden");
            alertText.textContent = `⚠️ ការព្រមានអំពីជាន់ម៉ោង៖ គ្រូនេះមានម៉ោងបង្រៀនមុខវិជ្ជា «${conflict.subject}» នៅ ${conflict.conflictClass} ក្នុងម៉ោងនេះរួចហើយ!`;
        } else if (alertEl) {
            alertEl.classList.add("hidden");
        }
    },

    handleSaveSlot: function(e) {
        e.preventDefault();
        const dayKey = document.getElementById("slotDayKey").value;
        const slotIndex = document.getElementById("slotIndex").value;
        const subject = document.getElementById("slotSubjectSelect").value;
        const teacherSelect = document.getElementById("slotTeacherSelect");
        const teacherId = teacherSelect.value;
        const teacherName = teacherSelect.selectedOptions[0]?.getAttribute('data-name') || '';
        const room = document.getElementById("slotRoomInput").value;
        const note = document.getElementById("slotNoteInput").value;

        const data = this.getTimetableData();
        if (!subject) {
            delete data[`${dayKey}_${slotIndex}`];
        } else {
            data[`${dayKey}_${slotIndex}`] = {
                subject,
                teacher_id: teacherId,
                teacher_name: teacherName,
                room,
                note
            };
        }

        this.saveTimetableData(data);
        this.closeSlotModal();
        this.renderView();
        if (typeof showToast === 'function') showToast("✅ បានរក្សាទុកម៉ោងបង្រៀនជោគជ័យ!");
    },

    handleClearSingleSlot: function() {
        const dayKey = document.getElementById("slotDayKey").value;
        const slotIndex = document.getElementById("slotIndex").value;
        const data = this.getTimetableData();
        delete data[`${dayKey}_${slotIndex}`];
        this.saveTimetableData(data);
        this.closeSlotModal();
        this.renderView();
        if (typeof showToast === 'function') showToast("🗑️ បានលុបម៉ោងនេះរួចរាល់!");
    },

    resetTimetable: function() {
        if (!confirm(`តើអ្នកពិតជាចង់សម្អាតកាលវិភាគទាំងអស់នៃថ្នាក់ «${this.currentGrade}» មែនទេ?`)) return;
        this.saveTimetableData({});
        this.renderView();
        if (typeof showToast === 'function') showToast("🧹 បានសម្អាតកាលវិភាគជោគជ័យ!");
    },

    // ==========================================
    // SMART GENERATOR MODAL HANDLERS
    // ==========================================
    openSmartGeneratorModal: function() {
        const modal = document.getElementById("smartGeneratorModal");
        if (modal) modal.classList.remove("hidden");
    },

    closeSmartGeneratorModal: function() {
        const modal = document.getElementById("smartGeneratorModal");
        if (modal) modal.classList.add("hidden");
    },

    handleRunSmartGenerator: function(e) {
        e.preventDefault();
        const sessionRadio = document.querySelector('input[name="genSession"]:checked');
        const sessionMode = sessionRadio ? sessionRadio.value : 'morning';
        const targetScope = document.getElementById("genTargetScope")?.value || 'current';

        this.closeSmartGeneratorModal();
        this.autoGenerateSmartSchedule({
            sessionMode: sessionMode,
            targetScope: targetScope
        });
    },

    // ==========================================
    // COPY TIMETABLE MODAL HANDLERS
    // ==========================================
    openCopyModal: function() {
        const modal = document.getElementById("copyTimetableModal");
        if (modal) modal.classList.remove("hidden");
    },

    closeCopyModal: function() {
        const modal = document.getElementById("copyTimetableModal");
        if (modal) modal.classList.add("hidden");
    },

    handleConfirmCopy: function() {
        const select = document.getElementById("copySourceGradeSelect");
        if (!select) return;
        const sourceGrade = select.value;
        this.closeCopyModal();
        this.copyTimetableFrom(sourceGrade);
    },

    // ==========================================
    // HOMEWORK & ASSIGNMENT MANAGEMENT
    // ==========================================
    getHomeworkStorageKey: function() {
        return `homework_list_${(this.currentGrade || 'all').replace(/[«»\s]+/g, '_')}`;
    },

    getHomeworkList: function() {
        const key = this.getHomeworkStorageKey();
        try {
            return JSON.parse(localStorage.getItem(key) || '[]');
        } catch(e) {
            return [];
        }
    },

    saveHomeworkList: async function(list) {
        const key = this.getHomeworkStorageKey();
        localStorage.setItem(key, JSON.stringify(list));

        if (window.db) {
            try {
                await window.db.collection("homework").doc(key).set({
                    grade: this.currentGrade,
                    assignments: list,
                    last_updated: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            } catch(e) {
                console.warn("Firestore homework save note:", e);
            }
        }

        // 📡 Emit Event to EventBus
        if (window.CMSEventBus && window.CMSEventTypes) {
            window.CMSEventBus.emit(window.CMSEventTypes.HOMEWORK_ASSIGNED, {
                grade: this.currentGrade,
                total_assignments: (list || []).length
            });
        }
    },

    renderHomeworkCards: function() {
        const grid = document.getElementById("homeworkCardsGrid");
        if (!grid) return;

        let list = this.getHomeworkList();
        
        // ប្រសិនបើគ្មានទិន្នន័យ សូមផ្តល់កិច្ចការគំរូ
        if (list.length === 0) {
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

        // Single Source of Truth សិស្សក្នុងថ្នាក់បច្ចុប្បន្ន
        const parts = this.currentGrade.split(' ');
        const gradeLevel = parts.slice(0, 2).join(' ');
        const roomName = parts[2] || "«ក»";
        const students = typeof window.getStudentsForClass === 'function' 
            ? window.getStudentsForClass(gradeLevel, roomName, this.currentAcademicYear) 
            : (window.allStudents || []);
        const totalStudents = students.length || 30;

        grid.innerHTML = list.map(hw => {
            const isDue = new Date(hw.dueDate) < new Date();
            const subCount = Object.keys(hw.submissions || {}).length;

            return `
                <div class="bg-slate-50 dark:bg-slate-700/50 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-600 flex flex-col justify-between hover:shadow-md transition">
                    <div>
                        <div class="flex items-center justify-between mb-2.5">
                            <span class="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                                ${hw.subject}
                            </span>
                            <span class="text-[11px] font-mono ${isDue ? 'text-rose-500 font-bold' : 'text-slate-400'}">
                                <i class="fa-solid fa-clock mr-1"></i> កាលកំណត់៖ ${hw.dueDate}
                            </span>
                        </div>
                        <h4 class="font-bold text-slate-800 dark:text-white text-sm mb-1">${hw.title}</h4>
                        <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">${hw.desc || 'គ្មានការពិពណ៌នា'}</p>
                    </div>

                    <div class="pt-3 border-t border-slate-200/80 dark:border-slate-600 flex items-center justify-between">
                        <span class="text-xs text-slate-600 dark:text-slate-300 font-bold">
                            <i class="fa-solid fa-check-double text-emerald-500 mr-1"></i> បានប្រគល់៖ <span class="font-mono text-emerald-600 font-bold">${subCount}/${totalStudents}</span>
                        </span>
                        <div class="flex items-center gap-2">
                            <button onclick="window.TimetableHomeworkManager.openSubmissionModal('${hw.id}')" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm">
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
            window.logAudit('CREATE_HOMEWORK', 'homework', `បានដាក់កិច្ចការផ្ទះ «${title}» ថ្នាក់ ${this.currentGrade}`);
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
        if (typeof showToast === 'function') showToast("🗑️ បានលុបកិច្ចការផ្ទះរួចរាល់!");
    },

    openSubmissionModal: function(hwId) {
        const list = this.getHomeworkList();
        const hw = list.find(h => h.id === hwId);
        if (!hw) return;

        const modal = document.getElementById("hwSubmissionModal");
        const tbody = document.getElementById("subStudentsTableBody");
        if (!modal || !tbody) return;

        document.getElementById("subModalHwTitle").textContent = hw.title;
        document.getElementById("subModalHwSubtitle").textContent = `ថ្នាក់៖ ${this.currentGrade} | មុខវិជ្ជា៖ ${hw.subject} | កាលបរិច្ឆេទប្រគល់៖ ${hw.dueDate}`;

        // SSOT Student retrieval
        const parts = this.currentGrade.split(' ');
        const gradeLevel = parts.slice(0, 2).join(' ');
        const roomName = parts[2] || "«ក»";
        const students = typeof window.getStudentsForClass === 'function' 
            ? window.getStudentsForClass(gradeLevel, roomName, this.currentAcademicYear) 
            : (window.allStudents || []);

        if (students.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="p-6 text-center text-slate-400">
                        មិនទាន់មានទិន្នន័យសិស្សក្នុងថ្នាក់នេះនៅឡើយទេ។ សូមចុះឈ្មោះសិស្សក្នុងផ្ទាំង «គ្រប់គ្រងសិស្ស»។
                    </td>
                </tr>
            `;
        } else {
            tbody.innerHTML = students.map((stu, idx) => {
                const sub = hw.submissions ? hw.submissions[stu.id] : null;
                const isDone = !!sub;
                const score = sub ? sub.score : "";

                return `
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50">
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
        }

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
