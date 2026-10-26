// =========================================================================
// ឯកសារ js/settings.js - ការកំណត់ប្រព័ន្ធ, ការគ្រប់គ្រងការសិក្សា & គណនី (CMS Settings)
// =========================================================================

// ១. ដំណើរការអាន Settings ជាសកលភ្លាមៗពេល Load
window.loadGlobalSettings = function() {
    let savedSettings = localStorage.getItem("school_settings");
    if (savedSettings) {
        try { window.appSettings = JSON.parse(savedSettings); } 
        catch (e) { window.appSettings = {}; }
    } else { window.appSettings = {}; }
};
window.loadGlobalSettings();

// ២. ទិន្នន័យរចនាសម្ព័ន្ធការសិក្សាលំនាំដើម (Default Academic Structure - Chapter 5)
window.defaultAcademicStructure = {
    academic_years: [
        { year: "2024-2025", start: "2024-10-01", end: "2025-07-31", status: "archived" },
        { year: "2025-2026", start: "2025-10-01", end: "2026-07-31", status: "archived" },
        { year: "2026-2027", start: "2026-10-01", end: "2027-07-31", status: "active" },
        { year: "2027-2028", start: "2027-10-01", end: "2028-07-31", status: "archived" }
    ],
    active_year: "2026-2027",
    semesters: {
        sem1: { start: "2026-10-01", end: "2027-02-28", name: "ឆមាសទី ១" },
        sem2: { start: "2027-03-01", end: "2027-07-31", name: "ឆមាសទី ២" }
    },
    grades: [
        { id: "g1", name: "ថ្នាក់ទី ១", rooms: ["«ក»", "«ខ»"], max_capacity: 45, teacher: "TCH-001" },
        { id: "g2", name: "ថ្នាក់ទី ២", rooms: ["«ក»", "«ខ»"], max_capacity: 45, teacher: "" },
        { id: "g3", name: "ថ្នាក់ទី ៣", rooms: ["«ក»", "«ខ»"], max_capacity: 45, teacher: "" },
        { id: "g4", name: "ថ្នាក់ទី ៤", rooms: ["«ក»"], max_capacity: 45, teacher: "" },
        { id: "g5", name: "ថ្នាក់ទី ៥", rooms: ["«ក»"], max_capacity: 45, teacher: "" },
        { id: "g6", name: "ថ្នាក់ទី ៦", rooms: ["«ក»"], max_capacity: 45, teacher: "" }
    ],
    primary_subjects: [
        { key: "khmer", name: "ភាសាខ្មែរ", name_kh: "ភាសាខ្មែរ", name_en: "Khmer Language", max: 100, weight: 1, color: "#dbeafe", teacher_id: "" },
        { key: "math", name: "គណិតវិទ្យា", name_kh: "គណិតវិទ្យា", name_en: "Mathematics", max: 100, weight: 1, color: "#ede9fe", teacher_id: "" },
        { key: "science", name: "វិទ្យាសាស្ត្រ", name_kh: "វិទ្យាសាស្ត្រ", name_en: "Science", max: 50, weight: 1, color: "#dcfce7", teacher_id: "" },
        { key: "social", name: "សិក្សាសង្គម", name_kh: "សិក្សាសង្គម", name_en: "Social Studies", max: 50, weight: 1, color: "#fef9c3", teacher_id: "" },
        { key: "pe_art", name: "អប់រំកាយ/សិល្បៈ", name_kh: "អប់រំកាយ/សិល្បៈ", name_en: "PE & Arts", max: 50, weight: 1, color: "#ffe4e6", teacher_id: "" },
        { key: "foreign", name: "ភាសាបរទេស", name_kh: "ភាសាបរទេស", name_en: "Foreign Language", max: 50, weight: 1, color: "#e0f2fe", teacher_id: "" }
    ],
    secondary_subjects: [
        { key: "khmer", name: "ភាសាខ្មែរ", name_kh: "ភាសាខ្មែរ", name_en: "Khmer Literature", max: 100, weight: 1, color: "#dbeafe", teacher_id: "" },
        { key: "math", name: "គណិតវិទ្យា", name_kh: "គណិតវិទ្យា", name_en: "Mathematics", max: 100, weight: 1, color: "#ede9fe", teacher_id: "" },
        { key: "physics", name: "រូបវិទ្យា", name_kh: "រូបវិទ្យា", name_en: "Physics", max: 50, weight: 1, color: "#dcfce7", teacher_id: "" },
        { key: "chem", name: "គីមីវិទ្យា", name_kh: "គីមីវិទ្យា", name_en: "Chemistry", max: 50, weight: 1, color: "#ede9fe", teacher_id: "" },
        { key: "bio", name: "ជីវវិទ្យា", name_kh: "ជីវវិទ្យា", name_en: "Biology", max: 50, weight: 1, color: "#dcfce7", teacher_id: "" },
        { key: "history", name: "ប្រវត្តិវិទ្យា", name_kh: "ប្រវត្តិវិទ្យា", name_en: "History", max: 50, weight: 1, color: "#fef9c3", teacher_id: "" },
        { key: "geo", name: "ភូមិវិទ្យា", name_kh: "ភូមិវិទ្យា", name_en: "Geography", max: 50, weight: 1, color: "#fef9c3", teacher_id: "" },
        { key: "civics", name: "ពលរដ្ឋវិទ្យា", name_kh: "ពលរដ្ឋវិទ្យា", name_en: "Civics", max: 50, weight: 1, color: "#ffe4e6", teacher_id: "" },
        { key: "earth", name: "ផែនដីវិទ្យា", name_kh: "ផែនដីវិទ្យា", name_en: "Earth Science", max: 50, weight: 1, color: "#e0f2fe", teacher_id: "" },
        { key: "english", name: "ភាសាអង់គ្លេស", name_kh: "ភាសាអង់គ្លេស", name_en: "English", max: 50, weight: 1, color: "#e0f2fe", teacher_id: "" }
    ]
};

window.loadAcademicStructure = function() {
    let raw = localStorage.getItem("academic_structure");
    if (raw) {
        try {
            window.academicStructure = JSON.parse(raw);
        } catch (e) {
            window.academicStructure = window.defaultAcademicStructure;
        }
    } else {
        window.academicStructure = window.defaultAcademicStructure;
    }

    // ភាពត្រូវគ្នាជាមួយទិន្នន័យចាស់ (Normalize academic_years array if it contained simple strings)
    if (window.academicStructure && Array.isArray(window.academicStructure.academic_years)) {
        const actYear = window.academicStructure.active_year || "2026-2027";
        window.academicStructure.academic_years = window.academicStructure.academic_years.map(y => {
            if (typeof y === "object" && y !== null) return y;
            const isAct = String(y) === String(actYear);
            return {
                year: String(y),
                start: isAct ? (window.academicStructure.semesters?.sem1?.start || "2026-10-01") : "",
                end: isAct ? (window.academicStructure.semesters?.sem2?.end || "2027-07-31") : "",
                status: isAct ? "active" : "archived"
            };
        });
    }

    return window.academicStructure;
};
window.loadAcademicStructure();

window.saveAcademicStructure = function(structure) {
    window.academicStructure = structure;
    try {
        localStorage.setItem("academic_structure", JSON.stringify(structure));
    } catch(e) {
        console.warn("localStorage academic_structure write error:", e);
    }

    if (window.db && typeof firebase !== 'undefined') {
        try {
            const cleanStructure = JSON.parse(JSON.stringify(structure));
            window.db.collection("schools_config").doc("academic_structure").set({
                ...cleanStructure,
                last_updated: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true }).catch(e => {
                console.warn("Firestore academic_structure async write note:", e.message);
            });
        } catch(err) {
            console.warn("Firestore serialize note:", err);
        }
    }

    return Promise.resolve(structure);
};

// =========================================================================
// ៣. ប្រព័ន្ធគ្រប់គ្រងការកំណត់ផ្ទាល់ខ្លួនរបស់គ្រូម្នាក់ៗ (Personal Teacher Workspace & Features)
// =========================================================================

window.getTeacherPersonalSettings = function(teacherId) {
    const tId = teacherId || localStorage.getItem('auth_teacher_id') || (window.AppAuth && window.AppAuth.state ? window.AppAuth.state.teacherId : "TCH-001");
    let saved = null;
    try {
        const raw = localStorage.getItem(`teacher_settings_${tId}`);
        if (raw) saved = JSON.parse(raw);
    } catch(e) {}

    const currentTId = localStorage.getItem('auth_teacher_id') || (window.AuthState ? window.AuthState.teacherId : null);
    const isCurrentTeacher = !teacherId || teacherId === currentTId;
    const s = typeof window.appSettings !== 'undefined' ? window.appSettings : {};
    const authState = window.AuthState || {};

    return {
        teacher_id: tId,
        teacher_name: (saved && saved.teacher_name) || (isCurrentTeacher ? (authState.teacherName || s.teacher_name || localStorage.getItem('auth_teacher_name')) : "") || "",
        teacher_gender: (saved && saved.teacher_gender) || s.teacher_gender || "ប្រុស",
        teacher_dob: (saved && saved.teacher_dob) || s.teacher_dob || "",
        teacher_phone: (saved && saved.teacher_phone) || s.teacher_phone || "",
        teacher_email: (saved && saved.teacher_email) || (isCurrentTeacher ? (s.teacher_email || localStorage.getItem('auth_email')) : "") || "",
        telegram_username: (saved && saved.telegram_username) || (isCurrentTeacher ? localStorage.getItem('auth_telegram_username') : "") || "",
        telegram_id: (saved && saved.telegram_id) || (isCurrentTeacher ? localStorage.getItem('auth_telegram_id') : "") || "",
        teacher_edu: (saved && saved.teacher_edu) || s.teacher_edu || "",
        teacher_level: (saved && saved.teacher_level) || (isCurrentTeacher ? (localStorage.getItem('auth_teacher_grade') || localStorage.getItem('auth_teacher_level') || localStorage.getItem('selected_level') || authState.teacher_level || s.teacher_level) : null) || "ថ្នាក់ទី ១",
        teacher_room: (saved && saved.teacher_room) || (isCurrentTeacher ? (localStorage.getItem('auth_teacher_room') || localStorage.getItem('selected_room') || authState.teacher_room || s.teacher_room) : null) || "«ក»",
        academic_year: (saved && saved.academic_year) || localStorage.getItem('selected_academic_year') || s.academic_year || "2026-2027",
        features: {
            attendance: saved?.features?.attendance !== false,
            scores: saved?.features?.scores !== false,
            library: saved?.features?.library !== false,
            timetable: saved?.features?.timetable !== false,
            tracking_book: saved?.features?.tracking_book !== false,
            reports: saved?.features?.reports !== false,
            parent_portal: saved?.features?.parent_portal !== false,
            auto_sync: saved?.features?.auto_sync !== false
        },
        grading_scale: (saved && saved.grading_scale) || "primary",
        signature_url: (saved && saved.signature_url) || s.signature_url || "",
        avatar_url: (saved && saved.avatar_url) || s.profile_avatar || localStorage.getItem('auth_teacher_avatar') || ""
    };
};

window.loadAndApplyTeacherSettings = function(teacherId) {
    const personal = window.getTeacherPersonalSettings(teacherId);
    if (!personal) return null;

    window.appSettings = window.appSettings || {};
    if (personal.teacher_name) window.appSettings.teacher_name = personal.teacher_name;
    if (personal.teacher_level) window.appSettings.teacher_level = personal.teacher_level;
    if (personal.teacher_room) window.appSettings.teacher_room = personal.teacher_room;
    if (personal.teacher_email) window.appSettings.teacher_email = personal.teacher_email;
    if (personal.telegram_username) window.appSettings.telegram_username = personal.telegram_username;
    if (personal.telegram_id) window.appSettings.telegram_id = personal.telegram_id;
    if (personal.teacher_phone) window.appSettings.teacher_phone = personal.teacher_phone;
    if (personal.signature_url) window.appSettings.signature_url = personal.signature_url;
    if (personal.avatar_url) window.appSettings.profile_avatar = personal.avatar_url;

    if (typeof window.setSelectedClass === 'function') {
        window.setSelectedClass(personal.teacher_level, personal.teacher_room);
    }
    if (typeof window.updateAllClassDropdowns === 'function') {
        window.updateAllClassDropdowns();
    }
    if (typeof window.applyTeacherFeatureVisibility === 'function') {
        window.applyTeacherFeatureVisibility(personal.features);
    }
    if (typeof window.updateUIWithSettings === 'function') {
        window.updateUIWithSettings();
    }
    return personal;
};

window.applyTeacherFeatureVisibility = function(features) {
    if (!features || typeof features !== 'object') return;
    const map = {
        attendance: ['nav-attendance', 'btn-mobile-nav-attendance'],
        scores: ['nav-scores', 'btn-mobile-nav-scores'],
        timetable: ['nav-timetable-homework'],
        timetable_homework: ['nav-timetable-homework'],
        library: ['nav-library'],
        reports: ['nav-reports'],
        students: ['nav-students', 'btn-mobile-nav-students']
    };
    Object.keys(map).forEach(key => {
        const isEnabled = features[key] !== false;
        (map[key] || []).forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                if (isEnabled) el.classList.remove('hidden');
                else el.classList.add('hidden');
            }
        });
    });
};

window.renderPersonalSettingsBadges = function(settings) {
    const s = settings || window.getTeacherPersonalSettings();
    const gmailBadge = document.getElementById("badge_gmail_status") || document.getElementById("badgeGoogleConnected");
    if (gmailBadge) {
        if (s.teacher_email) {
            gmailBadge.innerHTML = `<span class="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-xs font-bold flex items-center gap-1.5"><i class="fa-solid fa-circle-check text-emerald-500"></i> Gmail៖ ${s.teacher_email}</span>`;
        } else {
            gmailBadge.innerHTML = `<span class="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-xs font-bold flex items-center gap-1.5"><i class="fa-solid fa-circle-exclamation text-amber-500"></i> មិនទាន់ភ្ជាប់ Gmail</span>`;
        }
    }
    const tgBadge = document.getElementById("badge_telegram_status") || document.getElementById("badgeTelegramConnected");
    if (tgBadge) {
        if (s.telegram_username || s.telegram_id) {
            const handle = s.telegram_username ? `@${s.telegram_username.replace(/^@/, '')}` : `ID: ${s.telegram_id}`;
            tgBadge.innerHTML = `<span class="px-3 py-1 bg-sky-50 border border-sky-200 text-sky-700 rounded-full text-xs font-bold flex items-center gap-1.5"><i class="fa-brands fa-telegram text-[#229ED9]"></i> Telegram៖ ${handle}</span>`;
        } else {
            tgBadge.innerHTML = `<span class="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-xs font-bold flex items-center gap-1.5"><i class="fa-solid fa-circle-exclamation text-amber-500"></i> មិនទាន់ភ្ជាប់ Telegram</span>`;
        }
    }
};

window.linkTeacherTelegramDirectly = async function() {
    const tId = localStorage.getItem('auth_teacher_id') || (window.AppAuth && window.AppAuth.state ? window.AppAuth.state.teacherId : "TCH-001");
    let tgInput = document.getElementById("pers_telegram_username")?.value.trim().replace(/^@/, '') || "";
    const tgIdInput = document.getElementById("pers_telegram_id")?.value.trim() || "";

    if (!tgInput && !tgIdInput) {
        if (typeof window.openTelegramLoginModal === 'function') {
            window.openTelegramLoginModal('link');
        } else {
            alert("សូមបញ្ចូល Telegram @username ឬ Telegram ID ជាមុនសិន!");
        }
        return;
    }

    let personal = typeof window.getTeacherPersonalSettings === 'function' ? window.getTeacherPersonalSettings(tId) : {};
    personal.telegram_username = tgInput;
    personal.telegram_id = tgIdInput;

    try { localStorage.setItem(`teacher_settings_${tId}`, JSON.stringify(personal)); } catch(e) {}
    if (tgInput) localStorage.setItem('auth_telegram_username', tgInput);
    if (tgIdInput) localStorage.setItem('auth_telegram_id', tgIdInput);

    if (window.db) {
        try {
            await window.db.collection("teachers").doc(tId).set({
                telegram_username: tgInput,
                telegram_id: tgIdInput,
                last_linked_telegram: new Date().toISOString()
            }, { merge: true });
        } catch(e) {
            console.warn("Firestore telegram link note:", e);
        }
    }

    if (typeof window.renderPersonalSettingsBadges === 'function') {
        window.renderPersonalSettingsBadges(personal);
    }

    if (typeof showToast === 'function') {
        showToast(`✅ បានភ្ជាប់គណនី Telegram (@${tgInput || tgIdInput}) ជោគជ័យ!`);
    } else {
        alert(`✅ បានភ្ជាប់គណនី Telegram (@${tgInput || tgIdInput}) ជោគជ័យ!`);
    }
};

window.saveTeacherPersonalSettings = async function(teacherId, settings) {
    const tId = teacherId || localStorage.getItem('auth_teacher_id') || "TCH-001";
    const existing = window.getTeacherPersonalSettings(tId);
    const payload = {
        ...existing,
        ...settings,
        teacher_id: tId,
        features: {
            ...existing.features,
            ...(settings.features || {})
        },
        last_updated: new Date().toISOString()
    };

    localStorage.setItem(`teacher_settings_${tId}`, JSON.stringify(payload));
    if (payload.teacher_name) localStorage.setItem('auth_teacher_name', payload.teacher_name);
    if (payload.teacher_email) localStorage.setItem('auth_email', payload.teacher_email);
    if (payload.telegram_username) localStorage.setItem('auth_telegram_username', payload.telegram_username);
    if (payload.telegram_id) localStorage.setItem('auth_telegram_id', payload.telegram_id);
    if (payload.teacher_level) localStorage.setItem('auth_teacher_grade', payload.teacher_level);
    if (payload.teacher_room) localStorage.setItem('auth_teacher_room', payload.teacher_room);
    if (payload.avatar_url) {
        localStorage.setItem('auth_teacher_avatar', payload.avatar_url);
    } else {
        localStorage.removeItem('auth_teacher_avatar');
    }

    window.loadAndApplyTeacherSettings(tId);

    if (window.db) {
        try {
            await window.db.collection("teachers").doc(tId).set({
                name: payload.teacher_name,
                assigned_grade: payload.teacher_level,
                assigned_room: payload.teacher_room,
                email: payload.teacher_email,
                telegram_username: payload.telegram_username,
                telegram_id: payload.telegram_id,
                phone: payload.teacher_phone,
                personal_settings: payload,
                last_updated: (typeof firebase !== 'undefined' && firebase.firestore?.FieldValue?.serverTimestamp) ? firebase.firestore.FieldValue.serverTimestamp() : new Date().toISOString()
            }, { merge: true });
        } catch(e) {
            console.warn("Firestore teacher settings save notice:", e);
        }
    }

    window.renderPersonalSettingsBadges(payload);
    return payload;
};

window.handleSavePersonalTeacherSettings = async function(event) {
    if (event && event.preventDefault) event.preventDefault();

    const tId = localStorage.getItem('auth_teacher_id') || (window.AppAuth && window.AppAuth.state ? window.AppAuth.state.teacherId : "TCH-001");
    const name = document.getElementById("pers_teacher_name")?.value.trim() || "";
    const level = document.getElementById("pers_teacher_level")?.value || "ថ្នាក់ទី ១";
    const room = document.getElementById("pers_teacher_room")?.value || "«ក»";
    const phone = document.getElementById("pers_teacher_phone")?.value.trim() || "";
    const email = document.getElementById("pers_teacher_email")?.value.trim() || "";
    const tgUsername = document.getElementById("pers_telegram_username")?.value.trim().replace(/^@/, '') || "";
    const tgId = document.getElementById("pers_telegram_id")?.value.trim() || "";
    const gender = document.getElementById("pers_teacher_gender")?.value || "ប្រុស";
    const dob = document.getElementById("pers_teacher_dob")?.value || "";
    const edu = document.getElementById("pers_teacher_edu")?.value.trim() || "";
    const academicYear = document.getElementById("pers_academic_year")?.value.trim() || "2026-2027";
    const gradingScale = document.getElementById("pers_grading_scale")?.value || "primary";

    // School settings fields (Combined into single settings section)
    const schoolName = document.getElementById("set_school_name")?.value.trim() || "";
    const schoolEn = document.getElementById("set_school_en")?.value.trim() || "";
    const districtName = document.getElementById("set_cluster")?.value.trim() || "";
    const province = document.getElementById("set_school_province")?.value.trim() || "";
    const commune = document.getElementById("set_school_commune")?.value.trim() || "";
    const village = document.getElementById("set_school_village")?.value.trim() || "";
    const cluster = document.getElementById("set_school_cluster")?.value.trim() || "";
    const principalName = document.getElementById("set_principal_name")?.value.trim() || "";
    const schoolPhone = document.getElementById("set_school_phone")?.value.trim() || "";
    const schoolEmail = document.getElementById("set_school_email")?.value.trim() || "";

    const features = {
        attendance: document.getElementById("pers_feat_attendance") ? document.getElementById("pers_feat_attendance").checked : true,
        scores: document.getElementById("pers_feat_scores") ? document.getElementById("pers_feat_scores").checked : true,
        library: document.getElementById("pers_feat_library") ? document.getElementById("pers_feat_library").checked : true,
        timetable: document.getElementById("pers_feat_timetable") ? document.getElementById("pers_feat_timetable").checked : true,
        tracking_book: document.getElementById("pers_feat_tracking_book") ? document.getElementById("pers_feat_tracking_book").checked : true,
        reports: document.getElementById("pers_feat_reports") ? document.getElementById("pers_feat_reports").checked : true,
        parent_portal: document.getElementById("pers_feat_parent_portal") ? document.getElementById("pers_feat_parent_portal").checked : true,
        auto_sync: document.getElementById("pers_feat_auto_sync") ? document.getElementById("pers_feat_auto_sync").checked : true
    };

    const payload = {
        teacher_id: tId,
        teacher_name: name || localStorage.getItem('auth_teacher_name') || "លោកគ្រូ អ្នកគ្រូ",
        teacher_gender: gender,
        teacher_dob: dob,
        teacher_phone: phone,
        teacher_email: email,
        telegram_username: tgUsername,
        telegram_id: tgId,
        teacher_edu: edu,
        teacher_level: level,
        teacher_room: room,
        academic_year: academicYear,
        grading_scale: gradingScale,
        features: features,
        avatar_url: document.getElementById("val_profile_avatar")?.value || "",
        signature_url: document.getElementById("val_sig")?.value || "",
        school_name: schoolName,
        school_en: schoolEn,
        district_name: districtName,
        province: province,
        commune: commune,
        village: village,
        school_cluster: cluster,
        principal_name: principalName,
        school_phone: schoolPhone,
        school_email: schoolEmail
    };

    const btn = document.getElementById("btnSavePersonalSettings");
    const origHtml = btn ? btn.innerHTML : "";
    if (btn) {
        btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> <span>កំពុងរក្សាទុក...</span>`;
        btn.disabled = true;
    }

    try {
        await window.saveTeacherPersonalSettings(tId, payload);

        // Update school_settings
        window.appSettings = window.appSettings || {};
        if (schoolName) window.appSettings.school_name = schoolName;
        if (schoolEn) window.appSettings.school_en = schoolEn;
        if (districtName) {
            window.appSettings.cluster = districtName;
            window.appSettings.district_name = districtName;
        }
        if (province) window.appSettings.province = province;
        if (commune) window.appSettings.commune = commune;
        if (village) window.appSettings.village = village;
        if (cluster) window.appSettings.school_cluster = cluster;
        if (principalName) window.appSettings.principal_name = principalName;
        if (schoolPhone) window.appSettings.school_phone = schoolPhone;
        if (schoolEmail) window.appSettings.school_email = schoolEmail;
        window.appSettings.teacher_name = payload.teacher_name;
        window.appSettings.teacher_level = level;
        window.appSettings.teacher_room = room;
        window.appSettings.academic_year = academicYear;
        if (payload.avatar_url) {
            window.appSettings.profile_avatar = payload.avatar_url;
            localStorage.setItem('auth_teacher_avatar', payload.avatar_url);
        } else {
            delete window.appSettings.profile_avatar;
            localStorage.removeItem('auth_teacher_avatar');
        }
        localStorage.setItem('school_settings', JSON.stringify(window.appSettings));
        if (academicYear) {
            localStorage.setItem('selected_academic_year', academicYear);
            const yrSelect = document.getElementById("globalAcademicYear");
            if (yrSelect) yrSelect.value = academicYear;
        }

        // Set classroom across the whole system
        if (typeof window.setSelectedClass === 'function') {
            window.setSelectedClass(level, room);
        }
        localStorage.setItem('auth_teacher_grade', level);
        localStorage.setItem('auth_teacher_room', room);
        localStorage.setItem('selected_level', level);
        localStorage.setItem('selected_room', room);

        // Update UI Header and Sidebar
        const navId = document.getElementById('navUserId');
        if (navId) navId.textContent = `${level} ${room}`;
        const headerBadge = document.getElementById('headerActiveClassBadge');
        if (headerBadge) headerBadge.textContent = `${level} ${room}`;

        // Reload views dynamically with newly configured classroom
        if (typeof window.filterStudents === 'function') {
            try { window.filterStudents(); } catch(e) {}
        }
        if (typeof window.fetchMonthlyAttendance === 'function') {
            try { window.fetchMonthlyAttendance(); } catch(e) {}
        }
        if (typeof window.handleScoreClassChange === 'function') {
            try { window.handleScoreClassChange(); } catch(e) {}
        }
        if (typeof window.fetchLibraryData === 'function') {
            try { window.fetchLibraryData(); } catch(e) {}
        }
        if (typeof window.loadLibraryView === 'function' && document.getElementById('libraryView') && !document.getElementById('libraryView').classList.contains('hidden')) {
            try { window.loadLibraryView(); } catch(e) {}
        }

        // Save Settings to Google Sheets (Real-time REST API)
        let gasSaved = false;
        if (typeof window.apiPost === 'function') {
            try {
                const results = await Promise.allSettled([
                    window.apiPost("saveSettings", window.appSettings),
                    window.apiPost("saveTeacherSettings", { teacher_id: tId, data: payload }),
                    window.apiPost("saveClass", {
                        class_id: `CLS-${level}-${room}`,
                        grade: level,
                        room: room,
                        teacher_id: tId,
                        teacher_name: payload.teacher_name,
                        academic_year: academicYear
                    })
                ]);
                gasSaved = results.some(r => r.status === 'fulfilled');
            } catch(gasErr) {
                console.warn("GAS saveSettings error:", gasErr);
            }
        }

        const successMsg = gasSaved 
            ? "🎉 បានរក្សាទុកការកំណត់ និង Sync ទៅកាន់ Google Sheet ដោយជោគជ័យ!" 
            : "🎉 បានរក្សាទុកព័ត៌មានគ្រូ និងព័ត៌មានសាលារៀនដោយជោគជ័យ!";

        if (typeof showToast === 'function') {
            showToast(successMsg);
        } else {
            alert(successMsg);
        }

    } catch(err) {
        console.error("Save personal settings error:", err);
        alert("⚠️ បរាជ័យក្នុងការរក្សាទុក: " + err.message);
    } finally {
        if (btn) {
            btn.innerHTML = origHtml || `<i class="fa-solid fa-cloud-arrow-up"></i> <span>រក្សាទុកការកំណត់ផ្ទាល់ខ្លួន</span>`;
            btn.disabled = false;
        }
    }
};

window.renderPersonalSettingsTab = function() {
    const container = document.getElementById("tabContent_personal");
    if (!container) return;

    const tId = localStorage.getItem('auth_teacher_id') || (window.AppAuth?.state?.teacherId) || "TCH-001";
    const personal = window.getTeacherPersonalSettings(tId);
    const gradesList = typeof window.getAllGradesList === 'function' ? window.getAllGradesList() : ["ថ្នាក់ទី ១", "ថ្នាក់ទី ២", "ថ្នាក់ទី ៣", "ថ្នាក់ទី ៤", "ថ្នាក់ទី ៥", "ថ្នាក់ទី ៦"];
    const roomsList = typeof window.getAllRoomsList === 'function' ? window.getAllRoomsList() : ["«ក»", "«ខ»", "«គ»", "«ឃ»"];

    const normCurrentGrade = typeof window.normalizeGrade === 'function' ? window.normalizeGrade(personal.teacher_level) : personal.teacher_level;
    const gradesOpts = gradesList.map(g => {
        const normG = typeof window.normalizeGrade === 'function' ? window.normalizeGrade(g) : g;
        const isSel = (g === personal.teacher_level || normG === normCurrentGrade);
        return `<option value="${g}" ${isSel ? 'selected' : ''}>${g}</option>`;
    }).join('');
    const cleanCurrentRoom = String(personal.teacher_room || '').replace(/[«»\s]/g, '');
    const roomsOpts = roomsList.map(r => {
        const cleanR = String(r || '').replace(/[«»\s]/g, '');
        const isSel = (r === personal.teacher_room || cleanR === cleanCurrentRoom);
        return `<option value="${r}" ${isSel ? 'selected' : ''}>${r}</option>`;
    }).join('');

    container.innerHTML = `
        <!-- Welcome & Quick Status Banner -->
        <div class="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-950 rounded-[2rem] p-6 text-white shadow-lg border border-indigo-700/50 flex flex-col sm:flex-row items-center justify-between gap-5 relative overflow-hidden">
            <div class="flex items-center gap-4 relative z-10">
                <div class="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 p-1 flex items-center justify-center shrink-0 shadow-inner">
                    <img id="pers_avatar_preview" src="${personal.avatar_url || 'https://ui-avatars.com/api/?name=Teacher&background=6366f1&color=fff&size=150'}" class="w-full h-full object-cover rounded-xl bg-indigo-950">
                </div>
                <div>
                    <h3 class="font-moul text-lg text-white">${personal.teacher_name || 'លោកគ្រូ អ្នកគ្រូ'}</h3>
                    <p class="text-xs text-indigo-200 mt-1 flex flex-wrap items-center gap-2 font-bold">
                        <span>អត្តលេខគ្រូ៖ <strong class="font-mono text-white">${personal.teacher_id}</strong></span>
                        <span class="text-white/40">•</span>
                        <span>គ្រូបន្ទុកថ្នាក់៖ <strong class="text-white font-moul">${personal.teacher_name || 'លោកគ្រូ អ្នកគ្រូ'}</strong></span>
                        <span class="text-white/40">•</span>
                        <span class="text-amber-300 font-moul">${personal.teacher_level || 'ថ្នាក់ទី ១'} ${typeof window.normalizeRoomName === 'function' ? window.normalizeRoomName(personal.teacher_room) : (personal.teacher_room || '«ក»')}</span>
                    </p>
                </div>
            </div>

            <div class="flex flex-wrap items-center gap-2 relative z-10 text-xs">
                <div id="badge_gmail_status"></div>
                <div id="badge_telegram_status"></div>
            </div>
        </div>

        <form id="personalSettingsForm" onsubmit="window.handleSavePersonalTeacherSettings(event)" class="space-y-6">
            
            <!-- ផ្នែកទី ១៖ ព័ត៌មានគ្រូ និងថ្នាក់រៀនទទួលបន្ទុក (Teacher Profile & My Classroom) -->
            <div class="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
                <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center text-lg shadow-inner">
                            <i class="fa-solid fa-chalkboard-user"></i>
                        </div>
                        <div>
                            <h4 class="font-moul text-base text-slate-800 dark:text-white">១. ព័ត៌មានគ្រូ និងថ្នាក់រៀនទទួលបន្ទុក (Homeroom Teacher & Classroom)</h4>
                            <p class="text-xs text-slate-500 dark:text-slate-400">កំណត់ឈ្មោះ ថ្នាក់ និងបន្ទប់ដែលលោកគ្រូអ្នកគ្រូទទួលបន្ទុកបង្រៀន (កំណត់តែម្ដង ប្រព័ន្ធស្គាល់គ្រប់ផ្នែក)</p>
                        </div>
                    </div>
                </div>

                <!-- Teacher Photo Upload Card -->
                <div class="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-50 via-indigo-50/40 to-slate-50 dark:from-slate-700/60 dark:via-slate-700/40 dark:to-slate-700/60 border border-slate-200 dark:border-slate-600 flex flex-col sm:flex-row items-center sm:items-start gap-5">
                    <!-- Photo Preview Box -->
                    <div class="relative group shrink-0">
                        <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-indigo-200 dark:border-indigo-500/50 shadow-md bg-white dark:bg-slate-800 flex items-center justify-center">
                            <img id="pers_avatar_form_preview" 
                                 src="${personal.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(personal.teacher_name || 'Teacher') + '&background=6366f1&color=fff&size=200'}" 
                                 alt="រូបថតគ្រូ" 
                                 class="w-full h-full object-cover">
                        </div>
                        <label for="pers_teacher_photo_input" class="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 active:scale-95 transition-all border-2 border-white dark:border-slate-800" title="ជ្រើសរើសរូបថត">
                            <i class="fa-solid fa-camera text-sm"></i>
                        </label>
                    </div>

                    <!-- Upload Controls & Guidance -->
                    <div class="flex-1 text-center sm:text-left space-y-2">
                        <div>
                            <h5 class="text-sm font-bold text-slate-800 dark:text-white flex items-center justify-center sm:justify-start gap-2">
                                <i class="fa-solid fa-id-badge text-indigo-600 dark:text-indigo-400"></i>
                                <span>រូបថតផ្ទាល់ខ្លួនរបស់គ្រូបង្រៀន (Teacher Profile Photo)</span>
                            </h5>
                            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                សូមបញ្ចូលរូបថតផ្ទាល់ខ្លួនរបស់លោកគ្រូអ្នកគ្រូ (JPG, PNG, WebP)។ ប្រព័ន្ធនឹងបង្រួមទំហំរូបភាពដោយស្វ័យប្រវត្តិដើម្បីរក្សាទុកក្នុង Google Sheet និងគណនីបានលឿនរហ័ស។
                            </p>
                        </div>

                        <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1">
                            <input type="file" id="pers_teacher_photo_input" accept="image/png, image/jpeg, image/jpg, image/webp" onchange="window.handleTeacherPhotoUpload(this)" class="hidden">
                            <label for="pers_teacher_photo_input" class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-sm hover:shadow active:scale-95 transition-all">
                                <i class="fa-solid fa-arrow-up-from-bracket"></i>
                                <span>ជ្រើសរើសរូបថតថ្មី</span>
                            </label>
                            <button type="button" onclick="window.removeTeacherPhoto()" class="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-200 hover:bg-rose-100 hover:text-rose-600 dark:bg-slate-600 dark:hover:bg-rose-900/40 dark:hover:text-rose-300 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all">
                                <i class="fa-solid fa-trash-can"></i>
                                <span>ដករូបថតចេញ</span>
                            </button>
                        </div>
                        <input type="hidden" id="val_profile_avatar" value="${personal.avatar_url || ''}">
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-2">ឈ្មោះគ្រូបង្រៀន (Full Name) *</label>
                        <input type="text" id="pers_teacher_name" required value="${personal.teacher_name || ''}" placeholder="បញ្ចូលឈ្មោះលោកគ្រូ/អ្នកគ្រូ..." class="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 font-bold outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800 dark:text-white">
                    </div>

                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-2">ភេទ *</label>
                        <select id="pers_teacher_gender" class="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 font-bold outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800 dark:text-white">
                            <option value="ប្រុស" ${personal.teacher_gender === 'ប្រុស' ? 'selected' : ''}>ប្រុស</option>
                            <option value="ស្រី" ${personal.teacher_gender === 'ស្រី' ? 'selected' : ''}>ស្រី</option>
                        </select>
                    </div>

                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-2">លេខទូរស័ព្ទ (Phone Number)</label>
                        <input type="text" id="pers_teacher_phone" value="${personal.teacher_phone || ''}" placeholder="012 345 678" class="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 font-mono font-bold outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800 dark:text-white">
                    </div>

                    <div>
                        <label class="block font-bold text-indigo-700 dark:text-indigo-400 mb-2">ថ្នាក់ទីទទួលបន្ទុក (Grade Level) *</label>
                        <select id="pers_teacher_level" class="w-full bg-indigo-50/50 dark:bg-slate-700 border-2 border-indigo-200 dark:border-indigo-500/40 rounded-xl px-4 py-2.5 font-bold text-indigo-900 dark:text-indigo-200 outline-none focus:ring-2 focus:ring-indigo-500">
                            ${gradesOpts}
                        </select>
                    </div>

                    <div>
                        <label class="block font-bold text-rose-700 dark:text-rose-400 mb-2">បន្ទប់ទទួលបន្ទុក (My Room) *</label>
                        <select id="pers_teacher_room" class="w-full bg-rose-50/50 dark:bg-slate-700 border-2 border-rose-200 dark:border-rose-500/40 rounded-xl px-4 py-2.5 font-moul text-rose-800 dark:text-rose-200 outline-none focus:ring-2 focus:ring-rose-500">
                            ${roomsOpts}
                        </select>
                    </div>

                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-2">ឆ្នាំសិក្សាបង្រៀន (Academic Year) *</label>
                        <input type="text" id="pers_academic_year" required value="${personal.academic_year || '2026-2027'}" placeholder="២០២៦-២០២៧" class="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 font-bold outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800 dark:text-white text-center">
                    </div>

                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-2">ថ្ងៃខែឆ្នាំកំណើត</label>
                        <input type="date" id="pers_teacher_dob" value="${personal.teacher_dob || ''}" class="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 font-bold outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800 dark:text-white">
                    </div>

                    <div class="col-span-1 md:col-span-2">
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-2">កម្រិតវប្បធម៌ ឬឯកទេសបង្រៀន</label>
                        <input type="text" id="pers_teacher_edu" value="${personal.teacher_edu || ''}" placeholder="ឧ. បរិញ្ញាបត្រអប់រំ / គរុកោសល្យបឋមសិក្សា" class="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 font-bold outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800 dark:text-white">
                    </div>
                </div>
            </div>

            <!-- ផ្នែកទី ២៖ ព័ត៌មានទូទៅនៃសាលារៀន (School Information) -->
            <div class="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
                <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center text-lg shadow-inner">
                            <i class="fa-solid fa-school"></i>
                        </div>
                        <div>
                            <h4 class="font-moul text-base text-slate-800 dark:text-white">២. ព័ត៌មានទូទៅនៃសាលារៀន (School Information)</h4>
                            <p class="text-xs text-slate-500 dark:text-slate-400">កំណត់ព័ត៌មានសាលារៀនសម្រាប់បង្ហាញលើក្បាលលិខិតផ្លូវការ និងរបាយការណ៍</p>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-2">ឈ្មោះសាលារៀន (ខ្មែរ) *</label>
                        <input type="text" id="set_school_name" required value="${window.appSettings?.school_name || personal.school_name || ''}" placeholder="ឧ. សាលាបឋមសិក្សា..." class="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 font-moul text-indigo-700 dark:text-indigo-300 outline-none focus:ring-2 focus:ring-indigo-400">
                    </div>

                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-2">ឈ្មោះសាលារៀន (អង់គ្លេស)</label>
                        <input type="text" id="set_school_en" value="${window.appSettings?.school_en || ''}" placeholder="ឧ. Primary School" class="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 font-bold outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800 dark:text-white">
                    </div>

                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-2">កម្រងសាលារៀន (Cluster) *</label>
                        <input type="text" id="set_school_cluster" value="${window.appSettings?.school_cluster || window.appSettings?.cluster_name || ''}" placeholder="ឧ. កម្រងបឋមសិក្សា..." class="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 font-bold outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800 dark:text-white">
                    </div>

                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-2">ភូមិ (Village)</label>
                        <input type="text" id="set_school_village" value="${window.appSettings?.village || ''}" placeholder="ឧ. ភូមិធំ" class="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 font-bold outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800 dark:text-white">
                    </div>

                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-2">ឃុំ / សង្កាត់ (Commune)</label>
                        <input type="text" id="set_school_commune" value="${window.appSettings?.commune || ''}" placeholder="ឧ. ឃុំភ្នំ" class="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 font-bold outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800 dark:text-white">
                    </div>

                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-2">ស្រុក / ខណ្ឌ (ការិយាល័យអប់រំ) *</label>
                        <input type="text" id="set_cluster" value="${window.appSettings?.cluster || window.appSettings?.district_name || 'កៀនស្វាយ'}" placeholder="ឧ. កៀនស្វាយ" class="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 font-bold outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800 dark:text-white">
                    </div>

                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-2">ខេត្ត / រាជធានី (Province) *</label>
                        <input type="text" id="set_school_province" value="${window.appSettings?.province || 'កណ្តាល'}" placeholder="ឧ. កណ្តាល" class="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 font-bold outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800 dark:text-white">
                    </div>

                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-2">នាយក / នាយិកាសាលា *</label>
                        <input type="text" id="set_principal_name" value="${window.appSettings?.principal_name || ''}" placeholder="ឈ្មោះនាយកសាលា" class="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 font-moul outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800 dark:text-white">
                    </div>

                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-2">លេខទូរស័ព្ទផ្លូវការសាលា</label>
                        <input type="text" id="set_school_phone" value="${window.appSettings?.school_phone || ''}" placeholder="012 345 678" class="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 font-mono font-bold outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800 dark:text-white">
                    </div>

                    <div class="md:col-span-3">
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-2">អ៊ីមែលផ្លូវការសាលា</label>
                        <input type="email" id="set_school_email" value="${window.appSettings?.school_email || ''}" placeholder="school@moeys.gov.kh" class="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 font-mono font-bold outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800 dark:text-white">
                    </div>
                </div>
            </div>

            <!-- ផ្នែកទី ៣៖ ភ្ជាប់គណនី Gmail & Telegram (auth.telegram.org) -->
            <div class="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
                <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-sky-50 dark:bg-sky-950/50 text-[#229ED9] rounded-xl flex items-center justify-center text-lg shadow-inner">
                            <i class="fa-solid fa-link"></i>
                        </div>
                        <div>
                            <h4 class="font-moul text-base text-slate-800 dark:text-white">៣. ភ្ជាប់គណនី Gmail & Telegram (auth.telegram.org)</h4>
                            <p class="text-xs text-slate-500 dark:text-slate-400">ភ្ជាប់ជាមួយគណនី Gmail ឬ Telegram ដើម្បីចូលប្រើប្រាស់ និងគ្រប់គ្រងថ្នាក់រៀនដោយផ្ទាល់</p>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
                    <!-- Google (Gmail) Link Box -->
                    <div class="p-5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-2xl flex flex-col justify-between gap-4">
                        <div class="space-y-3">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-2.5">
                                    <svg class="w-6 h-6 shrink-0" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                                    </svg>
                                    <h5 class="font-bold text-sm text-slate-800 dark:text-white">គណនី Google (Gmail)</h5>
                                </div>
                            </div>
                            <p class="text-slate-500 dark:text-slate-400 leading-relaxed">
                                ភ្ជាប់អាសយដ្ឋាន Gmail របស់អ្នក ដើម្បីអនុញ្ញាតឱ្យចូលប្រើប្រាស់ដោយចុចតែម្តង (One-tap Sign-in)។
                            </p>
                            <div>
                                <label class="block font-bold text-slate-600 dark:text-slate-300 mb-1">អាសយដ្ឋាន Gmail បច្ចុប្បន្ន៖</label>
                                <input type="email" id="pers_teacher_email" value="${personal.teacher_email || ''}" placeholder="teacher@gmail.com" class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl px-3.5 py-2 font-mono font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-red-400">
                            </div>
                        </div>

                        <div class="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-600">
                            <button type="button" onclick="window.linkTeacherGoogleAccount()" class="flex-1 py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-sm transition">
                                <i class="fa-brands fa-google"></i> ភ្ជាប់ Gmail ឥឡូវនេះ
                            </button>
                            <button type="button" onclick="window.unlinkTeacherGoogleAccount()" class="py-2 px-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition" title="ផ្តាច់ Gmail">
                                <i class="fa-solid fa-link-slash"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Telegram Link Box -->
                    <div class="p-5 bg-sky-50/60 dark:bg-slate-700/50 border border-sky-100 dark:border-slate-600 rounded-2xl flex flex-col justify-between gap-4">
                        <div class="space-y-3">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-2.5">
                                    <div class="w-7 h-7 rounded-lg bg-[#229ED9] text-white flex items-center justify-center text-sm shadow-sm">
                                        <i class="fa-brands fa-telegram"></i>
                                    </div>
                                    <h5 class="font-bold text-sm text-slate-800 dark:text-white">គណនី Telegram</h5>
                                </div>
                            </div>
                            <p class="text-slate-500 dark:text-slate-400 leading-relaxed">
                                ភ្ជាប់គណនី Telegram របស់អ្នកតាមរយៈ <strong>@username</strong> ឬ Telegram ID សម្រាប់ទទួលការជូនដំណឹង និងចូលប្រើប្រាស់។
                            </p>
                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <label class="block font-bold text-slate-600 dark:text-slate-300 mb-1">Telegram Username៖</label>
                                    <div class="relative">
                                        <span class="absolute left-3 top-2 text-slate-400 font-bold">@</span>
                                        <input type="text" id="pers_telegram_username" value="${personal.telegram_username || ''}" placeholder="username" class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl pl-7 pr-3 py-2 font-mono font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-sky-400">
                                    </div>
                                </div>
                                <div>
                                    <label class="block font-bold text-slate-600 dark:text-slate-300 mb-1">Telegram ID (បើមាន)៖</label>
                                    <input type="text" id="pers_telegram_id" value="${personal.telegram_id || ''}" placeholder="12345678" class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 font-mono font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-sky-400">
                                </div>
                            </div>
                        </div>

                        <div class="flex items-center gap-2 pt-2 border-t border-sky-100 dark:border-slate-600">
                            <button type="button" onclick="window.linkTeacherTelegramDirectly()" class="flex-1 py-2 px-3 bg-[#229ED9] hover:bg-[#0088cc] text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-sm transition">
                                <i class="fa-brands fa-telegram"></i> ភ្ជាប់ Telegram ភ្លាមៗ
                            </button>
                            <button type="button" onclick="window.unlinkTeacherTelegramAccount()" class="py-2 px-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition" title="ផ្តាច់ Telegram">
                                <i class="fa-solid fa-link-slash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ផ្នែកទី ៤៖ សមកាលកម្មទិន្នន័យផ្ទាល់ជាមួយ Google Sheets (Google Sheets Live Sync & Storage) -->
            <div class="bg-gradient-to-br from-emerald-50 to-teal-50/50 dark:from-slate-800 dark:to-slate-850 p-6 md:p-8 rounded-[2rem] shadow-sm border border-emerald-200 dark:border-emerald-800/40 space-y-4">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-200/60 dark:border-slate-700 pb-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center text-lg shadow-sm">
                            <i class="fa-solid fa-file-excel"></i>
                        </div>
                        <div>
                            <h4 class="font-moul text-base text-slate-800 dark:text-white">៤. សមកាលកម្មទិន្នន័យជាមួយ Google Sheets (Live Sheets Storage)</h4>
                            <p class="text-xs text-slate-500 dark:text-slate-400">ទិន្នន័យសិស្ស វត្តមាន ពិន្ទុ បណ្ណាល័យ និងថ្នាក់រៀន ត្រូវបានបញ្ជូន និងរក្សាទុកក្នុង Google Sheet ដោយស្វ័យប្រវត្តិ</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-full border border-emerald-300 dark:border-emerald-700">
                            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            ភ្ជាប់ស្វ័យប្រវត្តិ
                        </span>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div class="p-4 bg-white dark:bg-slate-700/60 rounded-xl border border-emerald-100 dark:border-slate-600 space-y-2">
                        <p class="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                            <i class="fa-solid fa-cloud-arrow-up text-emerald-600"></i> សមកាលកម្មទិន្នន័យភ្លាមៗ (Instant Auto-Sync)
                        </p>
                        <p class="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
                            រាល់ពេលបន្ថែមសិស្ស កត់វត្តមាន ឬបញ្ចូលពិន្ទុ ប្រព័ន្ធនឹងរក្សាទុកក្នុងម៉ាស៊ីន និងបញ្ជូនទៅតារាង Google Sheets ដោយផ្ទាល់។
                        </p>
                    </div>

                    <div class="p-4 bg-white dark:bg-slate-700/60 rounded-xl border border-emerald-100 dark:border-slate-600 flex flex-col justify-between gap-3">
                        <div>
                            <p class="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                <i class="fa-solid fa-arrows-rotate text-emerald-600"></i> ធ្វើបច្ចុប្បន្នភាពទិន្នន័យទាំងអស់ (Manual Full Sync)
                            </p>
                            <p class="text-slate-500 dark:text-slate-400 text-[11px]">
                                ចុចប៊ូតុងនេះដើម្បីបញ្ជូនទិន្នន័យដែលមានទាំងអស់ក្នុងថ្នាក់បច្ចុប្បន្នទៅ Google Sheets ឡើងវិញភ្លាមៗ។
                            </p>
                        </div>
                        <button type="button" onclick="window.syncAllExistingDataToGoogleSheets(this)" class="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-95">
                            <i class="fa-solid fa-arrows-rotate"></i> <span>Sync ទិន្នន័យទាំងអស់ទៅ Google Sheet ឥឡូវនេះ</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Save Action Bar -->
            <div class="pt-4 flex justify-end">
                <button type="submit" id="btnSavePersonalSettings" class="px-8 py-3.5 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-800 text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-500/25 transition active:scale-95 flex items-center gap-2">
                    <i class="fa-solid fa-cloud-arrow-up"></i> <span>រក្សាទុកព័ត៌មានទាំងអស់ (Save All Settings)</span>
                </button>
            </div>
        </form>
    `;

    window.renderPersonalSettingsBadges(personal);
};

// ៣. Tab State
window.currentSettingsTab = "personal";

window.switchSettingsTab = function(tabName) {
    if (tabName === "users" || tabName === "academic" || tabName === "backup") {
        tabName = "personal";
    }
    if (tabName !== "school" && tabName !== "personal") {
        tabName = "personal";
    }

    window.currentSettingsTab = tabName;
    const tabs = ["personal", "school", "backup"];
    
    tabs.forEach(t => {
        const btn = document.getElementById(`tabBtn_${t}`);
        const content = document.getElementById(`tabContent_${t}`);
        if (t === tabName) {
            btn?.classList.add("bg-white", "text-indigo-700", "shadow-sm", "border-indigo-200");
            btn?.classList.remove("text-slate-500", "hover:text-slate-700");
            content?.classList.remove("hidden");
        } else {
            btn?.classList.remove("bg-white", "text-indigo-700", "shadow-sm", "border-indigo-200");
            btn?.classList.add("text-slate-500", "hover:text-slate-700");
            content?.classList.add("hidden");
        }
    });

    if (tabName === "personal") {
        window.renderPersonalSettingsTab();
    }
};

// =========================================================================
// ៤. ផ្ទាំងការកំណត់មេ (Master Settings View Loader)
// =========================================================================
window.loadSettingsView = function() {
    const container = document.getElementById("settingsContainer") || document.getElementById("mainContentArea") || document.getElementById("appView");
    if (!container) return console.error("រកមិនឃើញ ID: settingsContainer ទេ!");

    window.loadGlobalSettings();
    window.loadAcademicStructure();

    const isAdmin = typeof window.isCurrentUserAdmin === "function" ? window.isCurrentUserAdmin() : false;

    container.innerHTML = `
      <div class="max-w-6xl mx-auto space-y-6 animate-fade-in font-siemreap pb-20">
        
        <!-- Header Banner -->
        <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-[2rem] p-6 md:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden border border-slate-700">
           <div class="absolute -right-10 -top-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
           <div class="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl"></div>
           <div class="relative z-10">
             <div class="flex items-center gap-2 mb-2">
                <span class="px-3 py-1 bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 rounded-full text-xs font-bold font-mono">
                    ${isAdmin ? '👑 អ្នកគ្រប់គ្រងប្រព័ន្ធ (Admin)' : '👨‍🏫 គ្រូបន្ទុកថ្នាក់បឋមសិក្សា'}
                </span>
             </div>
             <h2 class="text-2xl md:text-3xl font-black font-moul mb-2 tracking-wide drop-shadow-md">ការកំណត់ព័ត៌មានគ្រូ និងសាលារៀន</h2>
             <p class="text-xs md:text-sm text-indigo-200 font-medium">គ្រប់គ្រងព័ត៌មានគ្រូបង្រៀន ថ្នាក់រៀនទទួលបន្ទុកបឋមសិក្សា និងព័ត៌មានទូទៅនៃសាលារៀន</p>
           </div>
           <div class="w-14 h-14 md:w-16 md:h-16 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center text-2xl md:text-3xl shadow-inner relative z-10 backdrop-blur-md shrink-0">
             <i class="fa-solid fa-gears text-indigo-200"></i>
           </div>
        </div>

        <!-- Tab Navigation Bar (Hidden - Unified Settings Page) -->
        <div class="hidden" aria-hidden="true">
            <button id="tabBtn_personal" onclick="window.switchSettingsTab('personal')">ព័ត៌មានគ្រូ</button>
            <button id="tabBtn_school" onclick="window.switchSettingsTab('school')">ព័ត៌មានសាលារៀន</button>
            <button id="tabBtn_backup" onclick="window.switchSettingsTab('backup')">បម្រុងទុក</button>
        </div>

        <!-- ============================================================= -->
        <!-- TAB 0: ការកំណត់ផ្ទាល់ខ្លួន (Teacher Personal Settings & Features)   -->
        <!-- ============================================================= -->
        <div id="tabContent_personal" class="space-y-6">
            <!-- Dynamic Content loaded by renderPersonalSettingsTab() -->
        </div>

        <!-- ============================================================= -->
        <!-- TAB 1: ព័ត៌មានសាលារៀន (School Settings & Official Info)        -->
        <!-- ============================================================= -->
        <div id="tabContent_school" class="space-y-6 hidden">
            
            <!-- ផ្ទាំងប្រវត្តិរូបគ្រូបង្រៀន (Teacher Profile Card) -->
            <div class="w-full bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden relative">
                <div class="h-28 w-full bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 relative">
                    <div class="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==')]"></div>
                </div>
                
                <div class="px-6 md:px-10 pb-6 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 relative -mt-12">
                    <div class="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                        <div class="relative group">
                            <div class="w-24 h-24 bg-white rounded-2xl p-1 shadow-lg border border-slate-100 overflow-hidden">
                                <img id="profile_avatar_preview" src="${window.appSettings.profile_avatar || 'https://ui-avatars.com/api/?name=Teacher&background=e0e7ff&color=4338ca&size=150'}" class="w-full h-full rounded-xl object-cover bg-slate-100">
                            </div>
                            <label class="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-md cursor-pointer transition transform hover:scale-110 border-2 border-white">
                                <i class="fa-solid fa-camera text-xs"></i>
                                <input type="file" accept="image/png, image/jpeg" onchange="window.processSettingsImage(this, 'profile_avatar_preview', 'val_profile_avatar', null)" class="hidden">
                            </label>
                            <input type="hidden" id="val_profile_avatar" value="${window.appSettings.profile_avatar || ''}">
                        </div>
                        <div>
                            <h3 id="display_teacher_name" class="font-moul text-lg text-slate-800 uppercase">${window.appSettings.teacher_name || 'លោកគ្រូ អ្នកគ្រូ'}</h3>
                            <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1">
                                <span class="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-xs font-bold font-mono">ID: ${localStorage.getItem('auth_teacher_id') || 'TCH-001'}</span>
                                <span class="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-xs font-bold font-moul">${window.appSettings.teacher_level || 'ថ្នាក់ទី ១'}</span>
                                <span class="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-bold font-moul">បន្ទប់ ${window.appSettings.teacher_room || '«ក»'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ព័ត៌មានលម្អិតគ្រូ -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-slate-50/50 border-t border-slate-100 text-sm">
                    <div class="space-y-3">
                        <div class="flex justify-between items-center py-1.5 border-b border-slate-200/60">
                            <span class="text-slate-500 text-xs font-bold">នាមត្រកូល និងនាមខ្លួន</span>
                            <input type="text" id="prof_teacher_name" value="${window.appSettings.teacher_name || ''}" placeholder="បញ្ចូលឈ្មោះ..." class="text-right font-bold text-slate-800 text-xs outline-none bg-white border border-slate-200 rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-indigo-300 w-48" onkeyup="document.getElementById('display_teacher_name').textContent = this.value || 'មិនទាន់មានឈ្មោះ'">
                        </div>
                        <div class="flex justify-between items-center py-1.5 border-b border-slate-200/60">
                            <span class="text-slate-500 text-xs font-bold">ភេទ</span>
                            <select id="prof_teacher_gender" class="text-right font-bold text-slate-800 text-xs outline-none bg-white border border-slate-200 rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-indigo-300 w-48">
                                <option value="ប្រុស" ${window.appSettings.teacher_gender === 'ប្រុស' ? 'selected' : ''}>ប្រុស</option>
                                <option value="ស្រី" ${window.appSettings.teacher_gender === 'ស្រី' ? 'selected' : ''}>ស្រី</option>
                            </select>
                        </div>
                        <div class="flex justify-between items-center py-1.5 border-b border-slate-200/60">
                            <span class="text-slate-500 text-xs font-bold">ថ្ងៃខែឆ្នាំកំណើត</span>
                            <input type="date" id="prof_teacher_dob" value="${window.appSettings.teacher_dob || ''}" class="text-right font-bold text-slate-800 text-xs outline-none bg-white border border-slate-200 rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-indigo-300 w-48">
                        </div>
                    </div>

                    <div class="space-y-3">
                        <div class="flex justify-between items-center py-1.5 border-b border-slate-200/60">
                            <span class="text-slate-500 text-xs font-bold">លេខទូរស័ព្ទ</span>
                            <input type="text" id="prof_teacher_phone" value="${window.appSettings.teacher_phone || ''}" placeholder="012 345..." class="text-right font-mono font-bold text-slate-800 text-xs outline-none bg-white border border-slate-200 rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-indigo-300 w-48">
                        </div>
                        <div class="flex justify-between items-center py-1.5 border-b border-slate-200/60">
                            <span class="text-slate-500 text-xs font-bold">អ៊ីមែល (Email)</span>
                            <input type="email" id="prof_teacher_email" value="${window.appSettings.teacher_email || ''}" placeholder="example@gmail.com" class="text-right font-mono font-bold text-slate-800 text-xs outline-none bg-white border border-slate-200 rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-indigo-300 w-48">
                        </div>
                        <div class="flex justify-between items-center py-1.5 border-b border-slate-200/60">
                            <span class="text-slate-500 text-xs font-bold">កម្រិតវប្បធម៌ទូទៅ</span>
                            <input type="text" id="prof_teacher_edu" value="${window.appSettings.teacher_edu || ''}" placeholder="ឧ. បរិញ្ញាបត្រ" class="text-right font-bold text-slate-800 text-xs outline-none bg-white border border-slate-200 rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-indigo-300 w-48">
                        </div>
                    </div>
                </div>
            </div>

            <!-- ការជូនដំណឹងសិទ្ធិមើល (Read-only banner for non-admins - SET-04) -->
            <div id="schoolSettingsPermWarning" class="hidden p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs font-bold items-center gap-2.5 shadow-sm">
                <div class="w-7 h-7 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center text-sm shrink-0">
                    <i class="fa-solid fa-lock"></i>
                </div>
                <span>លោកគ្រូអ្នកគ្រូមានត្រឹមសិទ្ធិមើលព័ត៌មានសាលារៀន (Read-only)។ មានតែ School Administrator ឬ System Administrator ប៉ុណ្ណោះដែលអាចកែប្រែព័ត៌មានសាលារៀនបាន។</span>
            </div>

            <!-- ទម្រង់កំណត់ព័ត៌មានសាលារៀន (School Form) -->
            <form id="settingsForm" onsubmit="window.handleSaveSettings(event)" class="space-y-6">
               
               <div class="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200">
                   <h3 class="font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6 text-base md:text-lg flex items-center gap-3">
                       <div class="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-inner"><i class="fa-solid fa-school"></i></div>
                       ព័ត៌មានទូទៅនៃសាលារៀន (School Profile - SET-01)
                   </h3>
                   
                   <div class="grid grid-cols-1 md:grid-cols-3 gap-5 text-sm">
                      <div>
                         <label class="block text-xs font-bold text-slate-600 mb-2">ឈ្មោះសាលារៀន (ខ្មែរ) *</label>
                         <input type="text" id="set_school_name" required placeholder="ឧ. សាលាបឋមសិក្សាគំរូ" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-moul text-blue-800 text-xs shadow-inner transition">
                      </div>

                      <div>
                         <label class="block text-xs font-bold text-slate-600 mb-2">ឈ្មោះសាលារៀន (អង់គ្លេស)</label>
                         <input type="text" id="set_school_en" placeholder="ឧ. Model Primary School" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-medium text-xs shadow-inner transition">
                      </div>

                      <div>
                         <label class="block text-xs font-bold text-slate-600 mb-2">លេខកូដសាលា</label>
                         <input type="text" id="set_school_code" placeholder="ឧ. KPS-01" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-mono uppercase text-xs shadow-inner transition text-center">
                      </div>

                      <div>
                         <label class="block text-xs font-bold text-slate-600 mb-2">ប្រភេទសាលា</label>
                         <select id="set_school_type" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-bold shadow-inner transition cursor-pointer text-xs">
                            <option value="មត្តេយ្យសិក្សា">មត្តេយ្យសិក្សា</option>
                            <option value="បឋមសិក្សា">បឋមសិក្សា</option>
                            <option value="អនុវិទ្យាល័យ">អនុវិទ្យាល័យ</option>
                            <option value="វិទ្យាល័យ">វិទ្យាល័យ</option>
                            <option value="ចំណេះទូទៅ">ចំណេះទូទៅ (គ្រប់កម្រិត)</option>
                         </select>
                      </div>

                      <div>
                         <label class="block text-xs font-bold text-slate-600 mb-2">កម្រងសាលា</label>
                         <input type="text" id="set_cluster" placeholder="ឧ. កម្រងកៀនស្វាយ" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-bold text-xs shadow-inner transition">
                      </div>

                      <div>
                         <label class="block text-xs font-bold text-slate-600 mb-2">នាយក / នាយិកាសាលា *</label>
                         <input type="text" id="set_principal_name" required placeholder="ឈ្មោះនាយកសាលា" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-bold text-slate-800 shadow-inner transition font-moul text-xs">
                      </div>

                      <div>
                         <label class="block text-xs font-bold text-slate-600 mb-2">ឆ្នាំសិក្សាដើម *</label>
                         <input type="text" id="set_academic_year" required placeholder="២០២៦-២០២៧" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-bold text-center text-xs shadow-inner transition">
                      </div>

                      <div>
                         <label class="block text-xs font-bold text-slate-600 mb-2">លេខទូរស័ព្ទផ្លូវការសាលា</label>
                         <input type="text" id="set_school_phone" placeholder="012 345 678" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-mono text-xs shadow-inner transition">
                      </div>

                      <div>
                         <label class="block text-xs font-bold text-slate-600 mb-2">អ៊ីមែលផ្លូវការសាលា (School Email)</label>
                         <input type="email" id="set_school_email" placeholder="school@moeys.gov.kh" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-mono text-xs shadow-inner transition">
                      </div>

                      <div class="col-span-1 md:col-span-2">
                         <label class="block text-xs font-bold text-slate-600 mb-2">ព័ត៌មានទំនាក់ទំនងបន្ថែម / បណ្តាញសង្គម</label>
                         <input type="text" id="set_school_contact" placeholder="ឧ. Facebook Page / Telegram Channel" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none text-xs shadow-inner transition">
                      </div>

                      <div>
                         <label class="block text-xs font-bold text-slate-600 mb-2">ថ្នាក់ទទួលបន្ទុក (Default Grade/Room)</label>
                         <div class="grid grid-cols-2 gap-2">
                             <select id="prof_teacher_level" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold outline-none">
                                <option value="ថ្នាក់ទី ១">ថ្នាក់ទី ១</option>
                                <option value="ថ្នាក់ទី ២">ថ្នាក់ទី ២</option>
                                <option value="ថ្នាក់ទី ៣">ថ្នាក់ទី ៣</option>
                                <option value="ថ្នាក់ទី ៤">ថ្នាក់ទី ៤</option>
                                <option value="ថ្នាក់ទី ៥">ថ្នាក់ទី ៥</option>
                                <option value="ថ្នាក់ទី ៦">ថ្នាក់ទី ៦</option>
                                <option value="ថ្នាក់ទី ៧">ថ្នាក់ទី ៧</option>
                                <option value="ថ្នាក់ទី ៨">ថ្នាក់ទី ៨</option>
                                <option value="ថ្នាក់ទី ៩">ថ្នាក់ទី ៩</option>
                                <option value="ថ្នាក់ទី ១០">ថ្នាក់ទី ១០</option>
                                <option value="ថ្នាក់ទី ១១">ថ្នាក់ទី ១១</option>
                                <option value="ថ្នាក់ទី ១២">ថ្នាក់ទី ១២</option>
                             </select>
                             <input type="text" id="prof_teacher_room" value="«ក»" placeholder="«ក»" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-center outline-none">
                         </div>
                      </div>
                   </div>

                   <!-- អាសយដ្ឋានសាលា -->
                   <div class="mt-6 pt-5 border-t border-slate-100">
                       <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                           <i class="fa-solid fa-map-location-dot text-indigo-500"></i> អាសយដ្ឋាន និងទីតាំងសាលារៀន
                       </h4>
                       <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                          <div>
                             <label class="block font-bold text-slate-500 mb-1.5">រាជធានី / ខេត្ត</label>
                             <input type="text" id="prof_province" placeholder="ខេត្តកណ្តាល" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-400">
                          </div>
                          <div>
                             <label class="block font-bold text-slate-500 mb-1.5">ក្រុង / ស្រុក / ខណ្ឌ</label>
                             <input type="text" id="prof_district" placeholder="ស្រុកកៀនស្វាយ" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-400">
                          </div>
                          <div>
                             <label class="block font-bold text-slate-500 mb-1.5">ឃុំ / សង្កាត់</label>
                             <input type="text" id="prof_commune" placeholder="ឃុំដីឥដ្ឋ" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-400">
                          </div>
                          <div>
                             <label class="block font-bold text-slate-500 mb-1.5">ភូមិ</label>
                             <input type="text" id="prof_village" placeholder="ភូមិ..." class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-400">
                          </div>
                       </div>
                   </div>
               </div>

               <!-- ការកំណត់ទូទៅនៃប្រព័ន្ធ (General Settings - SET-02) -->
               <div class="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200">
                   <h3 class="font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6 text-base md:text-lg flex items-center gap-3">
                       <div class="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-inner"><i class="fa-solid fa-sliders"></i></div>
                       ការកំណត់ទូទៅនៃប្រព័ន្ធ (General Settings - SET-02)
                   </h3>
                   
                   <div class="grid grid-cols-1 md:grid-cols-3 gap-5 text-sm">
                       <div>
                           <label class="block text-xs font-bold text-slate-600 mb-2">ភាសាលំនាំដើម (Default Language)</label>
                           <select id="set_default_language" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-bold text-xs shadow-inner transition cursor-pointer">
                               <option value="km" selected>🇰🇭 ភាសាខ្មែរ (Khmer - Standard)</option>
                               <option value="en">🇬🇧 English (International)</option>
                           </select>
                       </div>

                       <div>
                           <label class="block text-xs font-bold text-slate-600 mb-2">ទម្រង់កាលបរិច្ឆេទ (Date Format)</label>
                           <select id="set_date_format" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-mono text-xs shadow-inner transition cursor-pointer font-bold">
                               <option value="DD/MM/YYYY" selected>DD/MM/YYYY (ឧ. 23/10/2026)</option>
                               <option value="YYYY-MM-DD">YYYY-MM-DD (ISO 8601)</option>
                               <option value="D MMMM YYYY">D MMMM YYYY (ខ្មែរផ្លូវការ)</option>
                           </select>
                       </div>

                       <div>
                           <label class="block text-xs font-bold text-slate-600 mb-2">ទម្រង់ម៉ោង (Time Format)</label>
                           <select id="set_time_format" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-bold text-xs shadow-inner transition cursor-pointer">
                               <option value="12h" selected>១២ ម៉ោង (12-hour AM/PM)</option>
                               <option value="24h">២៤ ម៉ោង (24-hour Military)</option>
                           </select>
                       </div>

                       <div>
                           <label class="block text-xs font-bold text-slate-600 mb-2">តំបន់ពេលវេលា (Timezone)</label>
                           <input type="text" id="set_timezone" value="Asia/Phnom_Penh" readonly class="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 font-mono text-xs text-slate-600 outline-none cursor-not-allowed">
                       </div>

                       <div>
                           <label class="block text-xs font-bold text-slate-600 mb-2">បុព្វបទអត្តលេខសិស្ស (Student ID Prefix)</label>
                           <input type="text" id="set_student_id_prefix" placeholder="ឧ. STU-" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-mono font-bold text-xs shadow-inner transition uppercase text-center">
                       </div>

                       <div>
                           <label class="block text-xs font-bold text-slate-600 mb-2">លេខសម្គាល់សាលា (School ID)</label>
                           <input type="text" id="set_school_id" readonly class="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 font-mono font-bold text-xs text-indigo-700 outline-none cursor-not-allowed text-center">
                       </div>
                   </div>

                   <!-- Report Headers Options -->
                   <div class="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                       <label class="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200 cursor-pointer transition">
                           <input type="checkbox" id="set_show_logo_on_reports" checked class="w-4 h-4 text-indigo-600 rounded">
                           <div>
                               <span class="block text-xs font-bold text-slate-800">បង្ហាញនិមិត្តសញ្ញាសាលាលើរបាយការណ៍</span>
                               <span class="block text-[11px] text-slate-400 mt-0.5">ដាក់បញ្ចូល Logo លើក្បាលតារាងពិន្ទុ និងរបាយការណ៍ផ្លូវការ</span>
                           </div>
                       </label>

                       <label class="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200 cursor-pointer transition">
                           <input type="checkbox" id="set_show_school_header" checked class="w-4 h-4 text-indigo-600 rounded">
                           <div>
                               <span class="block text-xs font-bold text-slate-800">បង្ហាញបឋមកថាឈ្មោះសាលាពេញលេញ</span>
                               <span class="block text-[11px] text-slate-400 mt-0.5">ព្រះរាជាណាចក្រកម្ពុជា និងឈ្មោះក្រសួង/មន្ទីរអប់រំ</span>
                           </div>
                       </label>
                   </div>
               </div>

               <!-- រូបភាពផ្លូវការ (Logo & Signature) -->
               <div class="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200">
                   <h3 class="font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6 text-base md:text-lg flex items-center gap-3">
                       <div class="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shadow-inner"><i class="fa-solid fa-image"></i></div>
                       រូបភាពផ្លូវការ (ឡូហ្គោសាលា & ហត្ថលេខានាយក)
                   </h3>
                   <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                      <div class="border-2 border-slate-100 rounded-3xl p-6 text-center bg-slate-50/50 shadow-sm relative group">
                          <label class="block text-xs font-bold text-slate-700 mb-4 flex items-center justify-center gap-2"><i class="fa-solid fa-shield-cat text-indigo-500"></i> ឡូហ្គោសាលារៀន</label>
                          <div class="w-24 h-24 mx-auto mb-4 border-2 border-dashed border-slate-300 rounded-2xl p-2 bg-white flex items-center justify-center overflow-hidden">
                              <img id="preview_logo" src="" class="w-full h-full object-contain hidden" alt="Logo">
                              <div id="icon_logo" class="flex flex-col items-center justify-center text-slate-400">
                                  <i class="fa-solid fa-image text-2xl mb-1"></i>
                                  <span class="text-[10px]">ជ្រើសរើសរូប</span>
                              </div>
                          </div>
                          <label class="inline-block px-5 py-2 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600 font-bold rounded-xl text-xs cursor-pointer transition shadow-sm">
                              <i class="fa-solid fa-upload mr-1"></i> ជ្រើសរើសឡូហ្គោ
                              <input type="file" accept="image/png, image/jpeg" onchange="window.processSettingsImage(this, 'preview_logo', 'val_logo', 'icon_logo')" class="hidden">
                          </label>
                          <input type="hidden" id="val_logo">
                      </div>

                      <div class="border-2 border-slate-100 rounded-3xl p-6 text-center bg-slate-50/50 shadow-sm relative group">
                          <label class="block text-xs font-bold text-slate-700 mb-4 flex items-center justify-center gap-2"><i class="fa-solid fa-signature text-emerald-500"></i> ហត្ថលេខានាយកសាលា</label>
                          <div class="w-32 h-24 mx-auto mb-4 border-2 border-dashed border-slate-300 rounded-2xl p-2 bg-white flex items-center justify-center overflow-hidden">
                              <img id="preview_sig" src="" class="w-full h-full object-contain hidden" alt="Signature">
                              <div id="icon_sig" class="flex flex-col items-center justify-center text-slate-400">
                                  <i class="fa-solid fa-signature text-2xl mb-1"></i>
                                  <span class="text-[10px]">ជ្រើសរើសហត្ថលេខា</span>
                              </div>
                          </div>
                          <label class="inline-block px-5 py-2 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-600 font-bold rounded-xl text-xs cursor-pointer transition shadow-sm">
                              <i class="fa-solid fa-upload mr-1"></i> ជ្រើសរើសហត្ថលេខា
                              <input type="file" accept="image/png, image/jpeg" onchange="window.processSettingsImage(this, 'preview_sig', 'val_sig', 'icon_sig')" class="hidden">
                          </label>
                          <p class="text-[10px] text-slate-400 mt-2">* គួរប្រើរូបភាព .PNG ផ្ទៃថ្លា (Transparent)</p>
                          <input type="hidden" id="val_sig">
                      </div>
                   </div>
               </div>

               <!-- ចំណូលចិត្តប្រព័ន្ធ -->
               <div class="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 flex items-center justify-between">
                   <div>
                       <h4 class="font-bold text-slate-800 text-sm flex items-center gap-2">
                           <i class="fa-solid fa-cloud-arrow-up text-purple-600"></i> ស្វ័យប្រវត្តិ Sync ទិន្នន័យ (Cloud Synchronization)
                       </h4>
                       <p class="text-xs text-slate-400 mt-0.5">រក្សាទុកទិន្នន័យទៅ Cloud Firestore ដោយស្វ័យប្រវត្តិពេលមានអ៊ីនធឺណិត</p>
                   </div>
                   <label class="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" id="set_auto_sync" class="sr-only peer" checked>
                      <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                   </label>
               </div>

               <!-- Save Button -->
               <div class="flex justify-end pt-2">
                  <button type="submit" id="btnSaveSettings" class="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-8 py-3.5 rounded-2xl font-black shadow-lg shadow-indigo-200 transition transform hover:-translate-y-0.5 flex items-center gap-2 text-sm">
                     <i class="fa-solid fa-floppy-disk"></i> <span>រក្សាទុកព័ត៌មានសាលារៀន</span>
                  </button>
               </div>
            </form>
        </div>

        <!-- ============================================================= -->
        <!-- TAB 4: បម្រុងទុក & សុវត្ថិភាពទិន្នន័យ (Backup, Restore & Audit) -->
        <!-- ============================================================= -->
        <div id="tabContent_backup" class="space-y-6 hidden">
            <div class="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200 space-y-6">
               <div class="border-b border-slate-100 pb-4">
                   <h3 class="font-bold text-slate-800 text-base md:text-lg flex items-center gap-3">
                       <div class="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center shadow-inner"><i class="fa-solid fa-shield-halved"></i></div>
                       ការការពារទិន្នន័យ ការបម្រុងទុក និងកំណត់ហេតុ (Data Protection & Audit)
                   </h3>
                   <p class="text-xs text-slate-400 mt-1">ការពារការបាត់បង់ទិន្នន័យតាមរយៈការទាញយកបម្រុងទុក (Backup) និងតាមដានរាល់សកម្មភាពសំខាន់ៗ</p>
               </div>

               <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <!-- Export Backup Card -->
                   <div class="p-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex flex-col justify-between space-y-4">
                       <div>
                           <div class="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-lg mb-3 shadow-md">
                               <i class="fa-solid fa-cloud-arrow-down"></i>
                           </div>
                           <h4 class="font-bold text-slate-800 text-sm">ទាញយកទិន្នន័យបម្រុងទុក (Full System Backup)</h4>
                           <p class="text-xs text-slate-500 mt-1 leading-relaxed">រក្សាទុកទិន្នន័យទាំងមូលនៃសាលា (សិស្ស, វត្តមាន, ពិន្ទុ, ការកំណត់, បណ្ណាល័យ) ជាឯកសារ .JSON មានសុវត្ថិភាពខ្ពស់។</p>
                       </div>
                       <button type="button" onclick="window.AuditBackup ? window.AuditBackup.exportFullBackup() : window.exportBackupData()" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-2">
                           <i class="fa-solid fa-download"></i> ទាញយកទិន្នន័យឥឡូវនេះ
                       </button>
                   </div>

                   <!-- Restore Backup Card -->
                   <div class="p-5 bg-teal-50/50 border border-teal-100 rounded-2xl flex flex-col justify-between space-y-4">
                       <div>
                           <div class="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center text-lg mb-3 shadow-md">
                               <i class="fa-solid fa-cloud-arrow-up"></i>
                           </div>
                           <h4 class="font-bold text-slate-800 text-sm">ស្តារទិន្នន័យឡើងវិញ (Restore Backup File)</h4>
                           <p class="text-xs text-slate-500 mt-1 leading-relaxed">បញ្ចូលឯកសារ Backup .JSON ដែលបានទាញយកពីមុន ដើម្បីស្តារទិន្នន័យឡើងវិញដោយស្វ័យប្រវត្តិ។</p>
                       </div>
                       <label class="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-2 cursor-pointer text-center">
                           <i class="fa-solid fa-upload"></i> ជ្រើសរើសឯកសារស្តារទិន្នន័យ (.JSON)
                           <input type="file" accept=".json" class="hidden" onchange="window.AuditBackup ? window.AuditBackup.restoreFullBackup(this) : window.importBackupData(event)">
                       </label>
                   </div>
               </div>

               <!-- Audit Log & Maintenance Row -->
               <div class="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                   <div class="flex items-center gap-3.5">
                       <div class="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-lg shrink-0">
                           <i class="fa-solid fa-clock-rotate-left"></i>
                       </div>
                       <div>
                           <h4 class="font-bold text-slate-800 text-xs md:text-sm">កំណត់ហេតុសកម្មភាពប្រព័ន្ធ (System Audit Logs)</h4>
                           <p class="text-xs text-slate-500 mt-0.5">ពិនិត្យមើលរាល់សកម្មភាពចូលប្រព័ន្ធ ការកែប្រែពិន្ទុ វត្តមាន និងការបន្ថែមសិស្ស</p>
                       </div>
                   </div>
                   <button type="button" onclick="window.AuditBackup ? window.AuditBackup.renderAuditLogModal() : alert('Audit log viewer')" class="px-5 py-2.5 bg-white border border-purple-200 hover:bg-purple-50 text-purple-700 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-2 shrink-0">
                       <i class="fa-solid fa-eye"></i> មើលកំណត់ហេតុ (Logs)
                   </button>
               </div>

               <!-- Clear Cache Row -->
               <div class="p-5 bg-rose-50/50 border border-rose-100 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                   <div>
                       <h4 class="font-bold text-rose-800 text-xs md:text-sm flex items-center gap-2">
                           <i class="fa-solid fa-broom"></i> សម្អាត Cache បណ្តោះអាសន្ន (Clear Local Cache)
                       </h4>
                       <p class="text-xs text-rose-600/80 mt-1">ប្រើប្រាស់នៅពេលលោកគ្រូចង់ឱ្យប្រព័ន្ធទាញយកទិន្នន័យស្រស់ៗពី Cloud ដោយមិនលុបគណនី</p>
                   </div>
                   <button type="button" onclick="window.clearLocalCacheWithConfirm()" class="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-2 shrink-0">
                       <i class="fa-solid fa-trash-can"></i> សម្អាត Cache
                   </button>
               </div>
            </div>
        </div>

      </div>
    `;

    window.fillSettingsForm();

    // ធ្វើឱ្យ Settings ដំណើរការភ្លាមៗពេលបើក (Render active tab immediately)
    const activeTab = window.currentSettingsTab || (!isAdmin ? "personal" : "personal");
    window.switchSettingsTab(activeTab);
};

// =========================================================================
// ៥. គ្រប់គ្រងការសិក្សា (Academic Management Tab Renderer - Chapter 5)
// =========================================================================
window.renderAcademicManagementTab = function() {
    const container = document.getElementById("tabContent_academic");
    if (!container) return;

    const data = window.academicStructure || window.defaultAcademicStructure;
    const activeYear = data.active_year || "2026-2027";
    const rawYears = data.academic_years || ["2024-2025", "2025-2026", "2026-2027", "2027-2028"];
    const grades = data.grades || [];
    const pSubjects = data.primary_subjects || [];
    const sSubjects = data.secondary_subjects || [];

    // Normalize years list (ACAD-01: Supporting Year, Start Date, End Date, Status)
    const yearsList = rawYears.map(y => {
        if (typeof y === "object" && y !== null) return y;
        const isAct = String(y) === String(activeYear);
        return {
            year: String(y),
            start: isAct ? (data.semesters?.sem1?.start || "2026-10-01") : "",
            end: isAct ? (data.semesters?.sem2?.end || "2027-07-31") : "",
            status: isAct ? "active" : "archived"
        };
    });

    const isSchoolAdmin = typeof window.isSchoolAdmin === "function" ? window.isSchoolAdmin() : true;

    container.innerHTML = `
        <div class="space-y-6">
            
            <!-- ផ្នែកទី ១៖ គ្រប់គ្រងឆ្នាំសិក្សា & ឆមាស (ACAD-01 & ACAD-02) -->
            <div class="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4 mb-6">
                    <div>
                        <h3 class="font-bold text-slate-800 text-base flex items-center gap-2.5">
                            <i class="fa-solid fa-calendar-check text-indigo-600"></i> ១. គ្រប់គ្រងឆ្នាំសិក្សា និងកាលបរិច្ឆេទឆមាស (ACAD-01 & ACAD-02)
                        </h3>
                        <p class="text-xs text-slate-400 mt-1">បង្កើតឆ្នាំសិក្សា កំណត់ថ្ងៃចាប់ផ្តើម-បញ្ចប់ ជ្រើសឆ្នាំសកម្ម និងកំណត់ឆមាស (ទិន្នន័យចាស់មិនត្រូវលុបទេ)</p>
                    </div>
                    ${isSchoolAdmin ? `
                        <div class="flex items-center gap-2 w-full sm:w-auto">
                            <button onclick="window.openAddAcademicYearModal()" class="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-indigo-200 shadow-sm">
                                <i class="fa-solid fa-plus"></i> បន្ថែមឆ្នាំសិក្សាថ្មី
                            </button>
                        </div>
                    ` : ''}
                </div>

                <!-- Active Year & Semesters Setting -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-5 text-sm p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100/60 mb-6">
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-2">ឆ្នាំសិក្សាសកម្មបច្ចុប្បន្ន (Active Academic Year) *</label>
                        <select id="acad_active_year" onchange="window.handleSelectActiveYear(this.value)" class="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-xs text-indigo-700 outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer shadow-sm">
                            ${yearsList.map(yObj => `<option value="${yObj.year}" ${yObj.year === activeYear ? 'selected' : ''}>ឆ្នាំសិក្សា ${window.toKhmerNum ? window.toKhmerNum(yObj.year) : yObj.year} ${yObj.year === activeYear ? '⭐ (សកម្ម)' : ''}</option>`).join("")}
                        </select>
                        <span class="block text-[11px] text-slate-400 mt-1.5">អនុញ្ញាតឱ្យមានឆ្នាំសិក្សាសកម្មតែមួយគត់ក្នុងប្រព័ន្ធ</span>
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-2">ឆមាសទី ១ (Start & End Date)</label>
                        <div class="grid grid-cols-2 gap-2">
                            <input type="date" id="acad_sem1_start" value="${data.semesters?.sem1?.start || '2026-10-01'}" class="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold outline-none shadow-sm font-mono">
                            <input type="date" id="acad_sem1_end" value="${data.semesters?.sem1?.end || '2027-02-28'}" class="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold outline-none shadow-sm font-mono">
                        </div>
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-2">ឆមាសទី ២ (Start & End Date)</label>
                        <div class="grid grid-cols-2 gap-2">
                            <input type="date" id="acad_sem2_start" value="${data.semesters?.sem2?.start || '2027-03-01'}" class="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold outline-none shadow-sm font-mono">
                            <input type="date" id="acad_sem2_end" value="${data.semesters?.sem2?.end || '2027-07-31'}" class="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold outline-none shadow-sm font-mono">
                        </div>
                    </div>
                </div>

                <!-- Academic Years Historical Table -->
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs">
                        <thead>
                            <tr class="border-b border-slate-200 text-slate-500 font-bold bg-slate-50/70">
                                <th class="p-3">ឆ្នាំសិក្សា</th>
                                <th class="p-3">កាលបរិច្ឆេទចាប់ផ្តើម</th>
                                <th class="p-3">កាលបរិច្ឆេទបញ្ចប់</th>
                                <th class="p-3">ស្ថានភាព</th>
                                <th class="p-3 text-right">សកម្មភាព</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            ${yearsList.map(y => {
                                const isActive = y.year === activeYear || y.status === "active";
                                return `
                                    <tr class="hover:bg-slate-50/80 transition">
                                        <td class="p-3 font-bold text-slate-800 font-mono text-xs">
                                            ${y.year} ${isActive ? '<span class="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full ml-1 border border-emerald-200 font-sans">សកម្ម</span>' : ''}
                                        </td>
                                        <td class="p-3 font-mono text-slate-600">${y.start || '-'}</td>
                                        <td class="p-3 font-mono text-slate-600">${y.end || '-'}</td>
                                        <td class="p-3">
                                            ${isActive ? 
                                                '<span class="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-[10px] font-bold">✅ សកម្ម (Active)</span>' : 
                                                '<span class="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[10px] font-bold">📁 បណ្ណសារ (Archived)</span>'
                                            }
                                        </td>
                                        <td class="p-3 text-right">
                                            <div class="flex items-center justify-end gap-1.5">
                                                ${!isActive && isSchoolAdmin ? `
                                                    <button onclick="window.setYearActive('${y.year}')" class="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-bold transition flex items-center gap-1 border border-emerald-200 text-[11px]" title="ជ្រើសជាឆ្នាំសកម្ម">
                                                        <i class="fa-solid fa-check"></i> ជ្រើសជាឆ្នាំសកម្ម
                                                    </button>
                                                ` : ''}
                                                ${isSchoolAdmin ? `
                                                    <button onclick="window.openAddAcademicYearModal('${y.year}')" class="w-8 h-8 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 flex items-center justify-center transition" title="កែប្រែកាលបរិច្ឆេទ">
                                                        <i class="fa-solid fa-pen"></i>
                                                    </button>
                                                ` : ''}
                                            </div>
                                        </td>
                                    </tr>
                                `;
                            }).join("")}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- ផ្នែកទី ២៖ គ្រប់គ្រងកម្រិតថ្នាក់ បន្ទប់ និងគ្រូប្រចាំថ្នាក់ (ACAD-03) -->
            <div class="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4 mb-6">
                    <div>
                        <h3 class="font-bold text-slate-800 text-base flex items-center gap-2.5">
                            <i class="fa-solid fa-door-open text-teal-600"></i> ២. គ្រប់គ្រងកម្រិតថ្នាក់ បន្ទប់ និងគ្រូបន្ទុកថ្នាក់ (ACAD-03)
                        </h3>
                        <p class="text-xs text-slate-400 mt-1">កំណត់បញ្ជីថ្នាក់រៀន បន្ទប់ («ក», «ខ», «គ»...) សមត្ថភាពសិស្សអតិបរមា និងចាត់តាំងគ្រូទទួលបន្ទុក</p>
                    </div>
                    ${isSchoolAdmin ? `
                        <button onclick="window.openAddGradeLevelModal()" class="px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-teal-200 shadow-sm">
                            <i class="fa-solid fa-plus"></i> បន្ថែមកម្រិតថ្នាក់ថ្មី
                        </button>
                    ` : ''}
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs">
                        <thead>
                            <tr class="border-b border-slate-200 text-slate-500 font-bold bg-slate-50/70">
                                <th class="p-3">កម្រិតថ្នាក់</th>
                                <th class="p-3">បន្ទប់ / ក្រុម</th>
                                <th class="p-3">សមត្ថភាពសិស្សអតិបរមា</th>
                                <th class="p-3">គ្រូទទួលបន្ទុកថ្នាក់ (Homeroom Teacher)</th>
                                <th class="p-3 text-right">សកម្មភាព</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            ${grades.map((g, idx) => `
                                <tr class="hover:bg-slate-50/80 transition">
                                    <td class="p-3 font-bold text-slate-800">${g.name}</td>
                                    <td class="p-3 font-mono font-bold text-indigo-600">${Array.isArray(g.rooms) ? g.rooms.join(", ") : (g.rooms || "«ក»")}</td>
                                    <td class="p-3 font-bold text-slate-600 font-mono">
                                        ${g.max_capacity ? `${g.max_capacity} នាក់/បន្ទប់` : '៤៥ នាក់/បន្ទប់'}
                                    </td>
                                    <td class="p-3 text-slate-600 font-bold">
                                        ${g.teacher ? `<span class="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100 font-mono">ID: ${g.teacher}</span>` : '<span class="text-slate-400 italic">មិនទាន់ចាត់តាំង</span>'}
                                    </td>
                                    <td class="p-3 text-right">
                                        ${isSchoolAdmin ? `
                                            <button onclick="window.openAssignTeacherClassModal('${g.id}')" class="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg font-bold transition flex items-center gap-1 border border-teal-200 ml-auto">
                                                <i class="fa-solid fa-user-pen"></i> ចាត់តាំង & កែប្រែ
                                            </button>
                                        ` : '<span class="text-slate-400">មើលប៉ុណ្ណោះ</span>'}
                                    </td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- ផ្នែកទី ៣៖ គ្រប់គ្រងមុខវិជ្ជា និងពិន្ទុអតិបរមា (Subjects Config - ACAD-04) -->
            <div class="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4 mb-6">
                    <div>
                        <h3 class="font-bold text-slate-800 text-base flex items-center gap-2.5">
                            <i class="fa-solid fa-book-open-reader text-amber-600"></i> ៣. កំណត់មុខវិជ្ជា និងពិន្ទុអតិបរមា (Subjects & Max Scores - ACAD-04)
                        </h3>
                        <p class="text-xs text-slate-400 mt-1">កំណត់មុខវិជ្ជាផ្លូវការ (ឈ្មោះខ្មែរ/អង់គ្លេស) ពិន្ទុអតិបរមា (Max) មេគុណ (Weight) និងគ្រូទទួលបន្ទុក</p>
                    </div>
                    ${isSchoolAdmin ? `
                        <button onclick="window.openAddCustomSubjectModal('primary')" class="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-amber-200 shadow-sm">
                            <i class="fa-solid fa-plus"></i> បន្ថែមមុខវិជ្ជាថ្មី
                        </button>
                    ` : ''}
                </div>

                <!-- Tabs: បឋមសិក្សា vs មធ្យមសិក្សា -->
                <div class="space-y-6">
                    <div>
                        <h4 class="font-bold text-xs uppercase tracking-wider text-slate-600 flex items-center gap-2 mb-3">
                            <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span> កម្រិតបឋមសិក្សា (Primary School Subjects)
                        </h4>
                        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                            ${pSubjects.map(sub => `
                                <div class="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white transition shadow-sm flex items-center justify-between group">
                                    <div class="flex items-center gap-2.5">
                                        <div class="w-3.5 h-3.5 rounded-full shrink-0" style="background-color: ${sub.color || '#dbeafe'};"></div>
                                        <div>
                                            <div class="font-bold text-slate-800 text-xs">${sub.name_kh || sub.name} ${sub.name_en ? `<span class="text-[10px] text-slate-400 font-sans font-normal">(${sub.name_en})</span>` : ''}</div>
                                            <div class="text-[10px] text-slate-400 font-mono">Key: ${sub.key} • មេគុណ: ${sub.weight || 1} ${sub.teacher_id ? `• គ្រូ: ${sub.teacher_id}` : ''}</div>
                                        </div>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <span class="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-indigo-700 shadow-inner">
                                            Max: ${sub.max}
                                        </span>
                                        ${isSchoolAdmin ? `
                                            <button onclick="window.openAddCustomSubjectModal('primary', '${sub.key}')" class="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 flex items-center justify-center transition" title="កែប្រែ">
                                                <i class="fa-solid fa-pen text-[11px]"></i>
                                            </button>
                                        ` : ''}
                                    </div>
                                </div>
                            `).join("")}
                        </div>
                    </div>

                    <div>
                        <h4 class="font-bold text-xs uppercase tracking-wider text-slate-600 flex items-center gap-2 mb-3 pt-2">
                            <span class="w-2.5 h-2.5 rounded-full bg-purple-500"></span> កម្រិតមធ្យមសិក្សា (Secondary School Subjects)
                        </h4>
                        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                            ${sSubjects.map(sub => `
                                <div class="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white transition shadow-sm flex items-center justify-between group">
                                    <div class="flex items-center gap-2.5">
                                        <div class="w-3.5 h-3.5 rounded-full shrink-0" style="background-color: ${sub.color || '#ede9fe'};"></div>
                                        <div>
                                            <div class="font-bold text-slate-800 text-xs">${sub.name_kh || sub.name} ${sub.name_en ? `<span class="text-[10px] text-slate-400 font-sans font-normal">(${sub.name_en})</span>` : ''}</div>
                                            <div class="text-[10px] text-slate-400 font-mono">Key: ${sub.key} • មេគុណ: ${sub.weight || 1} ${sub.teacher_id ? `• គ្រូ: ${sub.teacher_id}` : ''}</div>
                                        </div>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <span class="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-purple-700 shadow-inner">
                                            Max: ${sub.max}
                                        </span>
                                        ${isSchoolAdmin ? `
                                            <button onclick="window.openAddCustomSubjectModal('secondary', '${sub.key}')" class="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 flex items-center justify-center transition" title="កែប្រែ">
                                                <i class="fa-solid fa-pen text-[11px]"></i>
                                            </button>
                                        ` : ''}
                                    </div>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                </div>

                <!-- Save Academic Structure Button -->
                ${isSchoolAdmin ? `
                    <div class="flex justify-end pt-6 mt-6 border-t border-slate-100">
                        <button onclick="window.handleSaveAcademicStructure()" class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center gap-2">
                            <i class="fa-solid fa-floppy-disk"></i> រក្សាទុកកាលបរិច្ឆេទឆមាស
                        </button>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
};

window.setYearActive = function(yearVal) {
    if (!yearVal) return;
    const data = window.academicStructure || window.defaultAcademicStructure;
    data.active_year = yearVal;

    // Set all other years to archived, selected to active (ACAD-01)
    if (Array.isArray(data.academic_years)) {
        data.academic_years = data.academic_years.map(y => {
            const yStr = typeof y === "object" ? y.year : String(y);
            const isTarget = yStr === yearVal;
            if (typeof y === "object") {
                return { ...y, status: isTarget ? "active" : "archived" };
            }
            return { year: yStr, status: isTarget ? "active" : "archived" };
        });
    }

    window.saveAcademicStructure(data);

    // Sync global year dropdown
    const globalYear = document.getElementById("globalAcademicYear");
    if (globalYear) globalYear.value = yearVal;
    localStorage.setItem("selected_academic_year", yearVal);

    if (typeof showToast === "function") showToast(`✅ បានជ្រើសរើសឆ្នាំសិក្សា ${window.toKhmerNum ? window.toKhmerNum(yearVal) : yearVal} ជាឆ្នាំសកម្ម!`);
    window.renderAcademicManagementTab();
};

window.handleSelectActiveYear = function(yearVal) {
    window.setYearActive(yearVal);
};

window.handleSaveAcademicStructure = async function() {
    const data = window.academicStructure || window.defaultAcademicStructure;
    const s1Start = document.getElementById("acad_sem1_start")?.value;
    const s1End = document.getElementById("acad_sem1_end")?.value;
    const s2Start = document.getElementById("acad_sem2_start")?.value;
    const s2End = document.getElementById("acad_sem2_end")?.value;

    data.semesters = {
        sem1: { start: s1Start || "2026-10-01", end: s1End || "2027-02-28", name: "ឆមាសទី ១" },
        sem2: { start: s2Start || "2027-03-01", end: s2End || "2027-07-31", name: "ឆមាសទី ២" }
    };

    // Update active year object dates as well
    if (Array.isArray(data.academic_years)) {
        const actYear = data.active_year || "2026-2027";
        const idx = data.academic_years.findIndex(y => (typeof y === 'object' ? y.year : String(y)) === actYear);
        if (idx >= 0) {
            const currentObj = typeof data.academic_years[idx] === 'object' ? data.academic_years[idx] : { year: actYear };
            data.academic_years[idx] = {
                ...currentObj,
                start: s1Start || currentObj.start,
                end: s2End || currentObj.end,
                status: "active"
            };
        }
    }

    await window.saveAcademicStructure(data);
    if (typeof showToast === "function") showToast("✅ រក្សាទុកកាលបរិច្ឆេទឆមាសបានជោគជ័យ!");
    if (typeof window.logAudit === "function") {
        window.logAudit("ACADEMIC_SETTINGS", "settings", `បានកែប្រែកាលបរិច្ឆេទឆមាស និងរចនាសម្ព័ន្ធការសិក្សា (ACAD-01 & ACAD-02)`);
    }
};

// =========================================================================
// ៥.១. Modals សម្រាប់ Academic Management (ACAD-01, ACAD-03, ACAD-04)
// =========================================================================

// Modal បន្ថែម/កែប្រែឆ្នាំសិក្សា (ACAD-01)
window.openAddAcademicYearModal = function(editYear = null) {
    let modal = document.getElementById("academicYearModal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "academicYearModal";
        modal.className = "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-siemreap overflow-y-auto";
        document.body.appendChild(modal);
    }
    modal.classList.remove("hidden");
    modal.style.display = "flex";

    const data = window.academicStructure || window.defaultAcademicStructure;
    const yearsList = data.academic_years || [];
    const existing = editYear ? yearsList.find(y => (typeof y === 'object' ? y.year : String(y)) === editYear) : null;
    const yearVal = existing ? (typeof existing === 'object' ? existing.year : existing) : "";
    const startVal = existing && typeof existing === 'object' ? existing.start : "";
    const endVal = existing && typeof existing === 'object' ? existing.end : "";
    const isActive = existing && typeof existing === 'object' ? existing.status === 'active' : (yearVal === data.active_year);

    modal.innerHTML = `
        <div class="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 animate-scale-up my-auto">
            <div class="p-6 border-b border-slate-100 flex items-center justify-between bg-indigo-50/50">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-lg shadow-md">
                        <i class="fa-solid fa-calendar-plus"></i>
                    </div>
                    <div>
                        <h3 class="font-moul text-sm text-slate-800">${editYear ? 'កែប្រែឆ្នាំសិក្សា' : 'បន្ថែមឆ្នាំសិក្សាថ្មី'}</h3>
                        <p class="text-xs text-slate-400 mt-0.5">កំណត់ឆ្នាំ និងកាលបរិច្ឆេទចាប់ផ្តើម-បញ្ចប់</p>
                    </div>
                </div>
                <button onclick="document.getElementById('academicYearModal').classList.add('hidden')" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 flex items-center justify-center transition">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

            <form onsubmit="window.handleSaveAcademicYearSubmit(event, '${editYear || ''}')" class="p-6 space-y-4 text-xs">
                <div>
                    <label class="block font-bold text-slate-700 mb-1">ឆ្នាំសិក្សា (Academic Year) *</label>
                    <input type="text" id="modal_year_name" value="${yearVal}" required placeholder="ឧ. 2027-2028" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold font-mono outline-none focus:ring-2 focus:ring-indigo-400 text-center">
                    <span class="block text-[11px] text-slate-400 mt-1">ទម្រង់ណែនាំ៖ YYYY-YYYY (ឧ. 2027-2028)</span>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">កាលបរិច្ឆេទចាប់ផ្តើម</label>
                        <input type="date" id="modal_year_start" value="${startVal || '2027-10-01'}" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold font-mono outline-none">
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">កាលបរិច្ឆេទបញ្ចប់</label>
                        <input type="date" id="modal_year_end" value="${endVal || '2028-07-31'}" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold font-mono outline-none">
                    </div>
                </div>

                <label class="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition border border-slate-200">
                    <input type="checkbox" id="modal_year_is_active" ${isActive ? 'checked' : ''} class="w-4 h-4 text-indigo-600 rounded">
                    <div>
                        <span class="font-bold text-slate-800 text-xs">កំណត់ជាឆ្នាំសិក្សាសកម្ម (Active) ឥឡូវនេះ</span>
                        <span class="block text-[10px] text-slate-400 mt-0.5">ឆ្នាំសិក្សាផ្សេងទៀតនឹងត្រូវបានកំណត់ជាបណ្ណសារ</span>
                    </div>
                </label>

                <div class="pt-4 flex gap-3 border-t border-slate-100">
                    <button type="button" onclick="document.getElementById('academicYearModal').classList.add('hidden')" class="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition">បោះបង់</button>
                    <button type="submit" class="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition shadow-md">រក្សាទុក</button>
                </div>
            </form>
        </div>
    `;

    modal.classList.remove("hidden");
};

window.handleSaveAcademicYearSubmit = async function(e, editYear) {
    if (e && e.preventDefault) e.preventDefault();
    const yearName = document.getElementById("modal_year_name").value.trim();
    const startDate = document.getElementById("modal_year_start").value;
    const endDate = document.getElementById("modal_year_end").value;
    const makeActive = document.getElementById("modal_year_is_active").checked;

    if (!yearName) return alert("សូមបញ្ចូលឈ្មោះឆ្នាំសិក្សា!");

    const data = window.academicStructure || window.defaultAcademicStructure;
    let list = data.academic_years || [];

    // Normalize
    list = list.map(y => (typeof y === 'object' ? y : { year: String(y), status: String(y) === data.active_year ? 'active' : 'archived' }));

    const newObj = {
        year: yearName,
        start: startDate,
        end: endDate,
        status: makeActive ? "active" : "archived"
    };

    if (editYear) {
        const idx = list.findIndex(y => y.year === editYear);
        if (idx >= 0) list[idx] = newObj;
        else list.push(newObj);
    } else {
        const exists = list.some(y => y.year === yearName);
        if (exists) return alert("ឆ្នាំសិក្សានេះមានរួចហើយ!");
        list.push(newObj);
    }

    if (makeActive) {
        data.active_year = yearName;
        list.forEach(y => { if (y.year !== yearName) y.status = "archived"; });
        localStorage.setItem("selected_academic_year", yearName);
        const globalYear = document.getElementById("globalAcademicYear");
        if (globalYear) globalYear.value = yearName;
    }

    data.academic_years = list;
    await window.saveAcademicStructure(data);

    const yModal = document.getElementById("academicYearModal");
    if (yModal) { yModal.classList.add("hidden"); yModal.style.display = "none"; }
    if (typeof showToast === "function") showToast("✅ បានរក្សាទុកឆ្នាំសិក្សាជោគជ័យ!");
    window.renderAcademicManagementTab();
};

// Modal ចាត់តាំងគ្រូ និងកែបន្ទប់ថ្នាក់ (ACAD-03)
window.openAssignTeacherClassModal = async function(gradeId) {
    const data = window.academicStructure || window.defaultAcademicStructure;
    const g = (data.grades || []).find(item => item.id === gradeId);
    if (!g) return alert("រកមិនឃើញកម្រិតថ្នាក់នេះទេ!");

    let teachers = [];
    try {
        teachers = typeof window.fetchTeacherAccounts === "function" ? await window.fetchTeacherAccounts() : [];
    } catch(e) {}

    let modal = document.getElementById("assignTeacherModal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "assignTeacherModal";
        modal.className = "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-siemreap overflow-y-auto";
        document.body.appendChild(modal);
    }
    modal.classList.remove("hidden");
    modal.style.display = "flex";

    modal.innerHTML = `
        <div class="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 animate-scale-up my-auto">
            <div class="p-6 border-b border-slate-100 flex items-center justify-between bg-teal-50/50">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center text-lg shadow-md">
                        <i class="fa-solid fa-chalkboard-user"></i>
                    </div>
                    <div>
                        <h3 class="font-moul text-sm text-slate-800">ចាត់តាំងគ្រូ & កែបន្ទប់</h3>
                        <p class="text-xs text-slate-400 mt-0.5">${g.name}</p>
                    </div>
                </div>
                <button onclick="document.getElementById('assignTeacherModal').classList.add('hidden')" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 flex items-center justify-center transition">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

            <form onsubmit="window.handleSaveAssignTeacherClassSubmit(event, '${gradeId}')" class="p-6 space-y-4 text-xs">
                <div>
                    <label class="block font-bold text-slate-700 mb-1">បន្ទប់រៀន / ក្រុម (Rooms - បំបែកដោយសញ្ញាក្បៀស ,) *</label>
                    <input type="text" id="modal_grade_rooms" value="${Array.isArray(g.rooms) ? g.rooms.join(", ") : (g.rooms || "«ក»")}" required placeholder="«ក», «ខ», «គ»" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold outline-none focus:ring-2 focus:ring-teal-400 font-mono">
                    <span class="block text-[10px] text-slate-400 mt-1">ឧទាហរណ៍៖ «ក», «ខ» ឬ 8A, 8B</span>
                </div>

                <div>
                    <label class="block font-bold text-slate-700 mb-1">សមត្ថភាពសិស្សអតិបរមា (Max Student Capacity) *</label>
                    <input type="number" id="modal_grade_capacity" value="${g.max_capacity || 45}" min="1" max="100" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold font-mono outline-none focus:ring-2 focus:ring-teal-400 text-center">
                    <span class="block text-[10px] text-slate-400 mt-1">ចំនួនសិស្សអតិបរមាក្នុងមួយបន្ទប់ (Default: ៤៥ នាក់)</span>
                </div>

                <div>
                    <label class="block font-bold text-slate-700 mb-1">គ្រូទទួលបន្ទុកថ្នាក់ (Homeroom Teacher)</label>
                    <select id="modal_grade_teacher" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold outline-none cursor-pointer">
                        <option value="">-- មិនទាន់ចាត់តាំង --</option>
                        ${teachers.map(t => `<option value="${t.teacher_id}" ${g.teacher === t.teacher_id ? 'selected' : ''}>${t.name} (ID: ${t.teacher_id})</option>`).join("")}
                    </select>
                </div>

                <div class="pt-4 flex gap-3 border-t border-slate-100">
                    <button type="button" onclick="document.getElementById('assignTeacherModal').classList.add('hidden')" class="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition">បោះបង់</button>
                    <button type="submit" class="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition shadow-md">រក្សាទុក</button>
                </div>
            </form>
        </div>
    `;

    modal.classList.remove("hidden");
};

window.handleSaveAssignTeacherClassSubmit = async function(e, gradeId) {
    if (e && e.preventDefault) e.preventDefault();
    const roomsStr = document.getElementById("modal_grade_rooms").value.trim();
    const capacityVal = parseInt(document.getElementById("modal_grade_capacity").value || "45", 10);
    const teacherId = document.getElementById("modal_grade_teacher").value;

    const data = window.academicStructure || window.defaultAcademicStructure;
    const g = (data.grades || []).find(item => item.id === gradeId);
    if (!g) return;

    g.rooms = roomsStr.split(",").map(r => r.trim()).filter(Boolean);
    g.max_capacity = capacityVal;
    g.teacher = teacherId;

    window.saveAcademicStructure(data);
    const m = document.getElementById("assignTeacherModal");
    if (m) { m.classList.add("hidden"); m.style.display = "none"; }
    if (typeof showToast === "function") showToast("✅ បានចាត់តាំងគ្រូ និងកែប្រែព័ត៌មានថ្នាក់ជោគជ័យ!");
    window.renderAcademicManagementTab();
    if (typeof window.syncGlobalYearDropdown === "function") window.syncGlobalYearDropdown();
};

// Modal បន្ថែមកម្រិតថ្នាក់ថ្មី (ACAD-03)
window.openAddGradeLevelModal = function() {
    let modal = document.getElementById("addGradeModal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "addGradeModal";
        modal.className = "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-siemreap overflow-y-auto";
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 animate-scale-up my-auto">
            <div class="p-6 border-b border-slate-100 flex items-center justify-between bg-teal-50/50">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center text-lg shadow-md">
                        <i class="fa-solid fa-door-open"></i>
                    </div>
                    <div>
                        <h3 class="font-moul text-sm text-slate-800">បន្ថែមកម្រិតថ្នាក់ថ្មី</h3>
                        <p class="text-xs text-slate-400 mt-0.5">បង្កើតកម្រិតថ្នាក់ និងបន្ទប់សិក្សា</p>
                    </div>
                </div>
                <button type="button" onclick="const m = document.getElementById('addGradeModal'); if(m){ m.classList.add('hidden'); m.style.display='none'; }" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 flex items-center justify-center transition">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

            <form onsubmit="window.handleSaveGradeLevelSubmit(event)" class="p-6 space-y-4 text-xs">
                <div>
                    <label class="block font-bold text-slate-700 mb-1">ឈ្មោះកម្រិតថ្នាក់ *</label>
                    <input type="text" id="modal_new_grade_name" required placeholder="ឧ. ថ្នាក់ទី ៧" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold outline-none focus:ring-2 focus:ring-teal-400">
                </div>

                <div>
                    <label class="block font-bold text-slate-700 mb-1">បន្ទប់រៀន (Rooms) *</label>
                    <input type="text" id="modal_new_grade_rooms" value="«ក», «ខ»" required placeholder="«ក», «ខ»" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold font-mono outline-none">
                </div>

                <div>
                    <label class="block font-bold text-slate-700 mb-1">សមត្ថភាពសិស្សអតិបរមា (Max Capacity)</label>
                    <input type="number" id="modal_new_grade_capacity" value="45" min="1" max="100" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold font-mono outline-none text-center">
                </div>

                <div class="pt-4 flex gap-3 border-t border-slate-100">
                    <button type="button" onclick="const m = document.getElementById('addGradeModal'); if(m){ m.classList.add('hidden'); m.style.display='none'; }" class="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition">បោះបង់</button>
                    <button type="submit" class="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition shadow-md">បង្កើតកម្រិតថ្នាក់</button>
                </div>
            </form>
        </div>
    `;

    modal.classList.remove("hidden");
    modal.style.display = "flex";
};

window.handleSaveGradeLevelSubmit = async function(e) {
    if (e && e.preventDefault) e.preventDefault();
    const nameInput = document.getElementById("modal_new_grade_name");
    const roomsInput = document.getElementById("modal_new_grade_rooms");
    const capacityInput = document.getElementById("modal_new_grade_capacity");

    const name = nameInput ? nameInput.value.trim() : "";
    const rooms = roomsInput ? roomsInput.value.split(",").map(r => r.trim()).filter(Boolean) : ["«ក»"];
    const capacity = parseInt((capacityInput ? capacityInput.value : "45") || "45", 10);

    if (!name) return alert("សូមបញ្ចូលឈ្មោះកម្រិតថ្នាក់!");

    const data = window.academicStructure || window.defaultAcademicStructure;
    data.grades = data.grades || [];

    const newId = `g_${Date.now()}`;
    data.grades.push({
        id: newId,
        name: name,
        rooms: rooms.length > 0 ? rooms : ["«ក»"],
        max_capacity: capacity,
        teacher: ""
    });

    // ១. រក្សាទុកភ្លាមៗ
    window.saveAcademicStructure(data);

    // ២. បិទ Modal ភ្លាមៗ
    const modal = document.getElementById("addGradeModal");
    if (modal) {
        modal.classList.add("hidden");
        modal.style.display = "none";
    }

    // ៣. បង្ហាញ Toast ជោគជ័យ
    if (typeof showToast === "function") showToast("✅ បានបន្ថែមកម្រិតថ្នាក់ថ្មីជោគជ័យ!");

    // ៤. Re-render Tab ភ្លាមៗដើម្បីឃើញថ្នាក់ថ្មីលើអេក្រង់
    window.renderAcademicManagementTab();

    // ៥. Update Dropdown ថ្នាក់ជាសកលគ្រប់ Module ទាំងអស់ភ្លាមៗ
    if (typeof window.updateAllClassDropdowns === "function") window.updateAllClassDropdowns();
    if (typeof window.notifyDataChanged === "function") window.notifyDataChanged('academic_structure', data);
    if (typeof window.syncGlobalYearDropdown === "function") window.syncGlobalYearDropdown();
};

// Modal បន្ថែម/កែប្រែមុខវិជ្ជា (ACAD-04)
window.openAddCustomSubjectModal = async function(category = "primary", editKey = null) {
    const data = window.academicStructure || window.defaultAcademicStructure;
    const subList = category === "primary" ? (data.primary_subjects || []) : (data.secondary_subjects || []);
    const existing = editKey ? subList.find(s => s.key === editKey) : null;

    let teachers = [];
    try {
        teachers = typeof window.fetchTeacherAccounts === "function" ? await window.fetchTeacherAccounts() : [];
    } catch(e) {}

    let modal = document.getElementById("subjectModal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "subjectModal";
        modal.className = "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-siemreap overflow-y-auto";
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 animate-scale-up my-auto">
            <div class="p-6 border-b border-slate-100 flex items-center justify-between bg-amber-50/50">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center text-lg shadow-md">
                        <i class="fa-solid fa-book-open"></i>
                    </div>
                    <div>
                        <h3 class="font-moul text-sm text-slate-800">${editKey ? 'កែប្រែមុខវិជ្ជា' : 'បន្ថែមមុខវិជ្ជាថ្មី'}</h3>
                        <p class="text-xs text-slate-400 mt-0.5">${category === 'primary' ? 'កម្រិតបឋមសិក្សា' : 'កម្រិតមធ្យមសិក្សា'}</p>
                    </div>
                </div>
                <button onclick="document.getElementById('subjectModal').classList.add('hidden')" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 flex items-center justify-center transition">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

            <form onsubmit="window.handleSaveCustomSubjectSubmit(event, '${category}', '${editKey || ''}')" class="p-6 space-y-4 text-xs">
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">លេខកូដ / Key *</label>
                        <input type="text" id="modal_sub_key" value="${existing ? existing.key : ''}" ${existing ? 'readonly' : ''} required placeholder="ឧ. math, eng" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold font-mono outline-none lowercase ${existing ? 'cursor-not-allowed bg-slate-100' : ''}">
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">កម្រិតសិក្សា *</label>
                        <select id="modal_sub_category" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold outline-none cursor-pointer">
                            <option value="primary" ${category === 'primary' ? 'selected' : ''}>បឋមសិក្សា</option>
                            <option value="secondary" ${category === 'secondary' ? 'selected' : ''}>មធ្យមសិក្សា</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label class="block font-bold text-slate-700 mb-1">ឈ្មោះមុខវិជ្ជាជាភាសាខ្មែរ *</label>
                    <input type="text" id="modal_sub_name_kh" value="${existing ? (existing.name_kh || existing.name) : ''}" required placeholder="ឧ. គណិតវិទ្យា" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold outline-none focus:ring-2 focus:ring-amber-400">
                </div>

                <div>
                    <label class="block font-bold text-slate-700 mb-1">ឈ្មោះមុខវិជ្ជាជាភាសាអង់គ្លេស</label>
                    <input type="text" id="modal_sub_name_en" value="${existing ? (existing.name_en || '') : ''}" placeholder="ឧ. Mathematics" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium outline-none">
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">ពិន្ទុអតិបរមា (Max Score) *</label>
                        <input type="number" id="modal_sub_max" value="${existing ? existing.max : 100}" required min="1" max="1000" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold font-mono outline-none text-center">
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">មេគុណ (Weight) *</label>
                        <input type="number" id="modal_sub_weight" value="${existing ? existing.weight : 1}" required min="1" max="10" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold font-mono outline-none text-center">
                    </div>
                </div>

                <div>
                    <label class="block font-bold text-slate-700 mb-1">គ្រូទទួលបន្ទុកមុខវិជ្ជា (Subject Teacher)</label>
                    <select id="modal_sub_teacher" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold outline-none cursor-pointer">
                        <option value="">-- មិនទាន់ចាត់តាំង --</option>
                        ${teachers.map(t => `<option value="${t.teacher_id}" ${existing && existing.teacher_id === t.teacher_id ? 'selected' : ''}>${t.name} (ID: ${t.teacher_id})</option>`).join("")}
                    </select>
                </div>

                <div class="pt-4 flex gap-3 border-t border-slate-100">
                    <button type="button" onclick="document.getElementById('subjectModal').classList.add('hidden')" class="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition">បោះបង់</button>
                    <button type="submit" class="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition shadow-md">រក្សាទុកមុខវិជ្ជា</button>
                </div>
            </form>
        </div>
    `;

    modal.classList.remove("hidden");
};

window.handleSaveCustomSubjectSubmit = async function(e, category, editKey) {
    if (e && e.preventDefault) e.preventDefault();
    const key = document.getElementById("modal_sub_key").value.trim().toLowerCase();
    const selCategory = document.getElementById("modal_sub_category").value;
    const nameKh = document.getElementById("modal_sub_name_kh").value.trim();
    const nameEn = document.getElementById("modal_sub_name_en").value.trim();
    const maxScore = parseInt(document.getElementById("modal_sub_max").value || "100", 10);
    const weightVal = parseInt(document.getElementById("modal_sub_weight").value || "1", 10);
    const teacherId = document.getElementById("modal_sub_teacher").value;

    if (!key || !nameKh) return alert("សូមបញ្ចូល Key និងឈ្មោះមុខវិជ្ជាជាភាសាខ្មែរ!");

    const data = window.academicStructure || window.defaultAcademicStructure;
    const targetKey = selCategory === "primary" ? "primary_subjects" : "secondary_subjects";
    data[targetKey] = data[targetKey] || [];

    const newSubject = {
        key: key,
        name: nameKh,
        name_kh: nameKh,
        name_en: nameEn,
        max: maxScore,
        weight: weightVal,
        color: selCategory === "primary" ? "#dbeafe" : "#ede9fe",
        teacher_id: teacherId
    };

    if (editKey) {
        const idx = data[targetKey].findIndex(s => s.key === editKey);
        if (idx >= 0) data[targetKey][idx] = newSubject;
        else data[targetKey].push(newSubject);
    } else {
        const exists = data[targetKey].some(s => s.key === key);
        if (exists) return alert("Key មុខវិជ្ជានេះមានរួចហើយ!");
        data[targetKey].push(newSubject);
    }

    await window.saveAcademicStructure(data);
    const subModal = document.getElementById("subjectModal");
    if (subModal) { subModal.classList.add("hidden"); subModal.style.display = "none"; }
    if (typeof showToast === "function") showToast("✅ បានរក្សាទុកមុខវិជ្ជាជោគជ័យ!");
    window.renderAcademicManagementTab();
};

window.handleSelectActiveYear = function(yearVal) {
    if (!yearVal) return;
    const data = window.academicStructure || window.defaultAcademicStructure;
    data.active_year = yearVal;
    window.saveAcademicStructure(data);

    // Sync global year dropdown
    const globalYear = document.getElementById("globalAcademicYear");
    if (globalYear) globalYear.value = yearVal;
    localStorage.setItem("selected_academic_year", yearVal);

    if (typeof showToast === "function") showToast(`✅ បានជ្រើសរើសឆ្នាំសិក្សា ${window.toKhmerNum(yearVal)} ជាឆ្នាំសកម្ម!`);
};

window.handleSaveAcademicStructure = async function() {
    const data = window.academicStructure || window.defaultAcademicStructure;
    const s1Start = document.getElementById("acad_sem1_start")?.value;
    const s1End = document.getElementById("acad_sem1_end")?.value;
    const s2Start = document.getElementById("acad_sem2_start")?.value;
    const s2End = document.getElementById("acad_sem2_end")?.value;

    data.semesters = {
        sem1: { start: s1Start || "2026-10-01", end: s1End || "2027-02-28", name: "ឆមាសទី ១" },
        sem2: { start: s2Start || "2027-03-01", end: s2End || "2027-07-31", name: "ឆមាសទី ២" }
    };

    await window.saveAcademicStructure(data);
    if (typeof showToast === "function") showToast("✅ រក្សាទុកការកំណត់ការសិក្សាបានជោគជ័យ!");
    if (typeof window.logAudit === "function") {
        window.logAudit("ACADEMIC_SETTINGS", "settings", `បានកែប្រែកាលបរិច្ឆេទឆមាស និងរចនាសម្ព័ន្ធការសិក្សា`);
    }
};

// =========================================================================
// ៦. គ្រប់គ្រងគណនី & សិទ្ធិប្រើប្រាស់ (User Accounts & Roles Tab Renderer)
// =========================================================================
window.renderUserAccountsTab = async function() {
    const container = document.getElementById("tabContent_users");
    if (!container) return;

    container.innerHTML = `
        <div class="p-12 text-center text-slate-400 font-bold">
            <i class="fa-solid fa-circle-notch fa-spin text-3xl mb-3 text-indigo-500"></i>
            <div>កំពុងទាញយកបញ្ជីគណនី និងសិទ្ធិប្រើប្រាស់...</div>
        </div>
    `;

    const teachers = typeof window.fetchTeacherAccounts === "function" ? await window.fetchTeacherAccounts() : [];
    const isSysAdmin = typeof window.isSystemAdmin === "function" ? window.isSystemAdmin() : false;
    const isSchAdmin = typeof window.isSchoolAdmin === "function" ? window.isSchoolAdmin() : false;
    const canManageUsers = isSysAdmin;
    const currentId = localStorage.getItem("auth_teacher_id");

    const totalUsers = teachers.length;
    const totalSysAdmins = teachers.filter(t => (t.roles || [t.role]).includes("system_admin") || t.role === "admin").length;
    const totalSchAdmins = teachers.filter(t => (t.roles || [t.role]).includes("school_admin")).length;
    const totalTeachers = teachers.filter(t => (t.roles || [t.role]).includes("teacher")).length;
    const totalViewers = teachers.filter(t => (t.roles || [t.role]).includes("report_viewer") || t.role === "viewer").length;

    container.innerHTML = `
        <div class="space-y-6">
            
            <!-- Summary KPI Cards for Chapter 2 Roles -->
            <div class="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
                <div class="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center justify-between">
                    <div>
                        <span class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">គណនីសរុប</span>
                        <span class="font-black text-2xl font-mono text-slate-800">${totalUsers}</span>
                    </div>
                    <div class="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center text-lg">
                        <i class="fa-solid fa-users"></i>
                    </div>
                </div>

                <div class="p-4 bg-white border border-rose-100 rounded-2xl shadow-sm flex items-center justify-between">
                    <div>
                        <span class="block text-[11px] font-bold text-rose-500 uppercase tracking-wider">System Admin</span>
                        <span class="font-black text-2xl font-mono text-rose-600">${totalSysAdmins}</span>
                    </div>
                    <div class="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center text-lg">
                        <i class="fa-solid fa-shield-halved"></i>
                    </div>
                </div>

                <div class="p-4 bg-white border border-indigo-100 rounded-2xl shadow-sm flex items-center justify-between">
                    <div>
                        <span class="block text-[11px] font-bold text-indigo-500 uppercase tracking-wider">School Admin</span>
                        <span class="font-black text-2xl font-mono text-indigo-600">${totalSchAdmins}</span>
                    </div>
                    <div class="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-lg">
                        <i class="fa-solid fa-school"></i>
                    </div>
                </div>

                <div class="p-4 bg-white border border-emerald-100 rounded-2xl shadow-sm flex items-center justify-between">
                    <div>
                        <span class="block text-[11px] font-bold text-emerald-500 uppercase tracking-wider">Teachers</span>
                        <span class="font-black text-2xl font-mono text-emerald-600">${totalTeachers}</span>
                    </div>
                    <div class="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-lg">
                        <i class="fa-solid fa-chalkboard-user"></i>
                    </div>
                </div>

                <div class="p-4 bg-white border border-amber-100 rounded-2xl shadow-sm flex items-center justify-between col-span-2 lg:col-span-1">
                    <div>
                        <span class="block text-[11px] font-bold text-amber-500 uppercase tracking-wider">Report Viewers</span>
                        <span class="font-black text-2xl font-mono text-amber-600">${totalViewers}</span>
                    </div>
                    <div class="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center text-lg">
                        <i class="fa-solid fa-chart-pie"></i>
                    </div>
                </div>
            </div>

            <!-- Chapter 2 Role Matrix Information Card -->
            <div class="bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-50 border border-indigo-100 rounded-2xl p-4 md:p-5 text-xs text-indigo-950">
                <div class="flex items-center gap-2.5 font-bold font-moul text-sm text-indigo-900 mb-2">
                    <i class="fa-solid fa-book-bookmark text-indigo-600"></i>
                    <span>ជំពូកទី២៖ តួនាទី និងសិទ្ធិអ្នកប្រើប្រាស់ (Roles & Permissions Matrix)</span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                    <div class="p-3 bg-white/80 rounded-xl border border-rose-200/60 shadow-sm">
                        <div class="font-bold text-rose-700 flex items-center gap-1.5"><i class="fa-solid fa-shield-halved"></i> System Administrator</div>
                        <div class="text-[11px] text-slate-600 mt-1">គ្រប់គ្រងគណនី សិទ្ធិ ការកំណត់ប្រព័ន្ធ និងការបម្រុងទុកទិន្នន័យ</div>
                    </div>
                    <div class="p-3 bg-white/80 rounded-xl border border-indigo-200/60 shadow-sm">
                        <div class="font-bold text-indigo-700 flex items-center gap-1.5"><i class="fa-solid fa-school"></i> School Administrator</div>
                        <div class="text-[11px] text-slate-600 mt-1">គ្រប់គ្រងព័ត៌មានសាលា ឆ្នាំសិក្សា ថ្នាក់ សិស្ស និងរបាយការណ៍ដែលបានអនុញ្ញាត</div>
                    </div>
                    <div class="p-3 bg-white/80 rounded-xl border border-emerald-200/60 shadow-sm">
                        <div class="font-bold text-emerald-700 flex items-center gap-1.5"><i class="fa-solid fa-chalkboard-user"></i> Teacher</div>
                        <div class="text-[11px] text-slate-600 mt-1">មើលថ្នាក់ដែលទទួលខុសត្រូវ កត់ត្រាវត្តមាន និងបញ្ចូលពិន្ទុតាមសិទ្ធិ</div>
                    </div>
                    <div class="p-3 bg-white/80 rounded-xl border border-amber-200/60 shadow-sm">
                        <div class="font-bold text-amber-700 flex items-center gap-1.5"><i class="fa-solid fa-chart-pie"></i> Report Viewer</div>
                        <div class="text-[11px] text-slate-600 mt-1">មើលរបាយការណ៍ដែលបានអនុញ្ញាត ដោយមិនអាចកែប្រែទិន្នន័យ</div>
                    </div>
                </div>
            </div>

            <!-- Table Card -->
            <div class="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4 mb-6">
                    <div>
                        <h3 class="font-bold text-slate-800 text-base flex items-center gap-2.5">
                            <i class="fa-solid fa-id-badge text-indigo-600"></i> បញ្ជីរាយនាមគណនី តួនាទី និងសិទ្ធិប្រើប្រាស់
                        </h3>
                        <p class="text-xs text-slate-400 mt-1">អ្នកប្រើប្រាស់ម្នាក់អាចមានតួនាទីមួយ ឬច្រើន ដោយសិទ្ធិត្រូវបានត្រួតពិនិត្យនៅកម្រិតសេវាទិន្នន័យ</p>
                    </div>

                    ${canManageUsers ? `
                        <button onclick="window.openAddTeacherModal()" class="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center gap-2">
                            <i class="fa-solid fa-user-plus"></i> បន្ថែមគណនីថ្មី
                        </button>
                    ` : `
                        <span class="text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 font-bold">
                            <i class="fa-solid fa-lock mr-1"></i> មានតែ System Admin ប៉ុណ្ណោះដែលអាចបន្ថែម ឬកែប្រែគណនី និងសិទ្ធិ
                        </span>
                    `}
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs">
                        <thead>
                            <tr class="border-b border-slate-200 text-slate-500 font-bold bg-slate-50/70">
                                <th class="p-3">អត្តលេខ</th>
                                <th class="p-3">គោត្តនាម និង នាម</th>
                                <th class="p-3">ឈ្មោះគណនី</th>
                                <th class="p-3">តួនាទី (Roles)</th>
                                <th class="p-3">ថ្នាក់ទទួលបន្ទុក (Scope)</th>
                                <th class="p-3">ស្ថានភាព</th>
                                <th class="p-3">ទំនាក់ទំនង</th>
                                <th class="p-3 text-right">សកម្មភាព</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            ${teachers.map(t => {
                                const isSelf = t.teacher_id === currentId;
                                const userRoles = window.normalizeRoles(t.roles || t.role, "teacher");
                                const isLocked = t.status && t.status.toLowerCase() !== "active";

                                const roleBadgesHtml = userRoles.map(r => {
                                    const def = window.ROLE_DEFINITIONS[r];
                                    if (def) {
                                        return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${def.badgeClass}"><i class="fa-solid ${def.icon}"></i> ${def.titleKh}</span>`;
                                    }
                                    return `<span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600">${r}</span>`;
                                }).join(" ");

                                return `
                                    <tr class="hover:bg-slate-50/80 transition">
                                        <td class="p-3 font-mono font-bold text-indigo-700">${t.teacher_id}</td>
                                        <td class="p-3 font-bold text-slate-800">
                                            ${t.name} ${isSelf ? '<span class="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full ml-1 font-sans">អ្នក</span>' : ''}
                                        </td>
                                        <td class="p-3 font-mono text-slate-500">${t.username}</td>
                                        <td class="p-3">
                                            <div class="flex flex-wrap gap-1">
                                                ${roleBadgesHtml}
                                            </div>
                                        </td>
                                        <td class="p-3 font-bold text-slate-700">${t.assigned_room ? 'បន្ទប់ ' + t.assigned_room : 'គ្រូបន្ទុកថ្នាក់'}</td>
                                        <td class="p-3">
                                            ${isLocked ? 
                                                `<button ${(canManageUsers && !isSelf && t.teacher_id !== 'TCH-ADMIN' && t.teacher_id !== 'TCH-SYSADMIN') ? `onclick="window.toggleUserAccountStatus('${t.teacher_id}', '${t.status || 'inactive'}')"` : 'disabled'} class="px-2 py-0.5 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-md text-[10px] font-bold flex items-center gap-1 transition" title="ចុចដើម្បីបើកដំណើរការឡើងវិញ">
                                                    <i class="fa-solid fa-lock"></i> <span>ចាក់សោ/ផ្អាក</span>
                                                </button>` : 
                                                `<button ${(canManageUsers && !isSelf && t.teacher_id !== 'TCH-ADMIN' && t.teacher_id !== 'TCH-SYSADMIN') ? `onclick="window.toggleUserAccountStatus('${t.teacher_id}', '${t.status || 'active'}')"` : 'disabled'} class="px-2 py-0.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 rounded-md text-[10px] font-bold flex items-center gap-1 transition" title="ចុចដើម្បីផ្អាកដំណើរការ">
                                                    <i class="fa-solid fa-circle-check"></i> <span>សកម្ម</span>
                                                </button>`
                                            }
                                        </td>
                                        <td class="p-3 font-mono text-slate-500">${t.contact || '-'}</td>
                                        <td class="p-3 text-right">
                                            <div class="flex items-center justify-end gap-1.5">
                                                ${canManageUsers ? `
                                                    <button onclick="window.openEditTeacherModal('${t.teacher_id}')" title="កែប្រែសិទ្ធិ & ព័ត៌មាន" class="w-8 h-8 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 flex items-center justify-center transition">
                                                        <i class="fa-solid fa-user-pen"></i>
                                                    </button>
                                                    <button onclick="window.openResetTeacherPasswordModal('${t.teacher_id}', '${t.name}')" title="ប្តូរលេខសម្ងាត់" class="w-8 h-8 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 flex items-center justify-center transition">
                                                        <i class="fa-solid fa-key"></i>
                                                    </button>
                                                ` : ''}
                                                ${(canManageUsers && !isSelf && t.teacher_id !== 'TCH-ADMIN' && t.teacher_id !== 'TCH-SYSADMIN') ? `
                                                    <button onclick="window.toggleUserAccountStatus('${t.teacher_id}', '${t.status || 'active'}')" title="${isLocked ? 'បើកដំណើរការឡើងវិញ (Activate)' : 'ផ្អាកដំណើរការ (Deactivate)'}" class="w-8 h-8 rounded-lg ${isLocked ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600' : 'bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600'} flex items-center justify-center transition">
                                                        <i class="fa-solid ${isLocked ? 'fa-lock-open' : 'fa-user-lock'}"></i>
                                                    </button>
                                                    <button onclick="window.handleDeleteTeacher('${t.teacher_id}', '${t.name}')" title="លុបគណនី" class="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition">
                                                        <i class="fa-solid fa-trash-can"></i>
                                                    </button>
                                                ` : ''}
                                            </div>
                                        </td>
                                    </tr>
                                `;
                            }).join("")}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
};

// =========================================================================
// ៧. Modals សម្រាប់បន្ថែម/កែប្រែគ្រូ & Multi-role Management (Chapter 2)
// =========================================================================

window.openAddTeacherModal = function() {
    let modal = document.getElementById("addTeacherModal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "addTeacherModal";
        modal.className = "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-siemreap overflow-y-auto";
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 animate-scale-up my-auto">
            <div class="p-6 border-b border-slate-100 flex items-center justify-between bg-indigo-50/50">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-lg shadow-md">
                        <i class="fa-solid fa-user-plus"></i>
                    </div>
                    <div>
                        <h3 class="font-moul text-sm text-slate-800">បន្ថែមគណនីអ្នកប្រើប្រាស់ថ្មី</h3>
                        <p class="text-xs text-slate-400 mt-0.5">កំណត់តួនាទីមួយ ឬច្រើន (Multi-role) តាមជំពូកទី២</p>
                    </div>
                </div>
                <button onclick="document.getElementById('addTeacherModal').classList.add('hidden')" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 flex items-center justify-center transition">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

            <form onsubmit="window.handleCreateTeacherSubmit(event)" class="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto custom-scrollbar">
                <div>
                    <label class="block font-bold text-slate-700 mb-1">គោត្តនាម និង នាមខ្លួន *</label>
                    <input type="text" id="add_teacher_name" required placeholder="ឧ. ឡុង សុខា" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold outline-none focus:ring-2 focus:ring-indigo-400">
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">ឈ្មោះគណនី (Username) *</label>
                        <input type="text" id="add_teacher_user" required placeholder="ឧ. sokha" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold outline-none focus:ring-2 focus:ring-indigo-400 lowercase">
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">លេខទូរស័ព្ទ</label>
                        <input type="text" id="add_teacher_contact" placeholder="012 345 678" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold font-mono outline-none">
                    </div>
                </div>

                <div>
                    <label class="block font-bold text-slate-700 mb-1">លេខសម្ងាត់ដំបូង *</label>
                    <input type="password" id="add_teacher_pass" required minlength="6" placeholder="យ៉ាងតិច ៦ តួអក្សរ" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold outline-none focus:ring-2 focus:ring-indigo-400">
                </div>

                <!-- Multi-role Selector Section (Chapter 2) -->
                <div>
                    <label class="block font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                        <i class="fa-solid fa-user-shield text-indigo-600"></i>
                        <span>តួនាទី និងសិទ្ធិ (អាចជ្រើសរើសបានលើសពីមួយ) *</span>
                    </label>
                    <div class="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                        <label class="flex items-start gap-2.5 cursor-pointer p-2 rounded-xl hover:bg-white transition border border-transparent hover:border-slate-200">
                            <input type="checkbox" name="add_roles" value="teacher" checked class="mt-0.5 w-4 h-4 text-emerald-600 rounded">
                            <div>
                                <span class="font-bold text-slate-800 text-xs flex items-center gap-1.5"><i class="fa-solid fa-chalkboard-user text-emerald-600"></i> Teacher (គ្រូបង្រៀន)</span>
                                <span class="block text-[11px] text-slate-400 mt-0.5">មើលថ្នាក់ដែលទទួលខុសត្រូវ កត់ត្រាវត្តមាន និងបញ្ចូលពិន្ទុ</span>
                            </div>
                        </label>
                        <label class="flex items-start gap-2.5 cursor-pointer p-2 rounded-xl hover:bg-white transition border border-transparent hover:border-slate-200">
                            <input type="checkbox" name="add_roles" value="school_admin" class="mt-0.5 w-4 h-4 text-indigo-600 rounded">
                            <div>
                                <span class="font-bold text-slate-800 text-xs flex items-center gap-1.5"><i class="fa-solid fa-school text-indigo-600"></i> School Administrator (អ្នកគ្រប់គ្រងសាលា)</span>
                                <span class="block text-[11px] text-slate-400 mt-0.5">គ្រប់គ្រងព័ត៌មានសាលា ឆ្នាំសិក្សា ថ្នាក់ សិស្ស និងរបាយការណ៍</span>
                            </div>
                        </label>
                        <label class="flex items-start gap-2.5 cursor-pointer p-2 rounded-xl hover:bg-white transition border border-transparent hover:border-slate-200">
                            <input type="checkbox" name="add_roles" value="system_admin" class="mt-0.5 w-4 h-4 text-rose-600 rounded">
                            <div>
                                <span class="font-bold text-slate-800 text-xs flex items-center gap-1.5"><i class="fa-solid fa-shield-halved text-rose-600"></i> System Administrator (អ្នកគ្រប់គ្រងប្រព័ន្ធ)</span>
                                <span class="block text-[11px] text-slate-400 mt-0.5">គ្រប់គ្រងគណនី សិទ្ធិ ការកំណត់ប្រព័ន្ធ និងការបម្រុងទុកទិន្នន័យ</span>
                            </div>
                        </label>
                        <label class="flex items-start gap-2.5 cursor-pointer p-2 rounded-xl hover:bg-white transition border border-transparent hover:border-slate-200">
                            <input type="checkbox" name="add_roles" value="report_viewer" class="mt-0.5 w-4 h-4 text-amber-600 rounded">
                            <div>
                                <span class="font-bold text-slate-800 text-xs flex items-center gap-1.5"><i class="fa-solid fa-chart-pie text-amber-600"></i> Report Viewer (អ្នកមើលរបាយការណ៍)</span>
                                <span class="block text-[11px] text-slate-400 mt-0.5">មើលរបាយការណ៍ដែលបានអនុញ្ញាត ដោយមិនអាចកែប្រែទិន្នន័យ</span>
                            </div>
                        </label>
                    </div>
                </div>

                <!-- Scope: Assigned Class & Room -->
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">ថ្នាក់ទទួលខុសត្រូវ (Grade Scope)</label>
                        <select id="add_teacher_grade" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold outline-none cursor-pointer">
                            <option value="គ្រប់ថ្នាក់">គ្រប់ថ្នាក់ (School-wide)</option>
                            <option value="ថ្នាក់ទី ១">ថ្នាក់ទី ១</option>
                            <option value="ថ្នាក់ទី ២">ថ្នាក់ទី ២</option>
                            <option value="ថ្នាក់ទី ៣">ថ្នាក់ទី ៣</option>
                            <option value="ថ្នាក់ទី ៤">ថ្នាក់ទី ៤</option>
                            <option value="ថ្នាក់ទី ៥">ថ្នាក់ទី ៥</option>
                            <option value="ថ្នាក់ទី ៦">ថ្នាក់ទី ៦</option>
                        </select>
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">បន្ទប់ (Room)</label>
                        <input type="text" id="add_teacher_room" value="«ក»" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold outline-none text-center">
                    </div>
                </div>

                <!-- Account Status Selection (AUTH-03 & Section 3.3) -->
                <div>
                    <label class="block font-bold text-slate-700 mb-1">ស្ថានភាពគណនី (Account Status)</label>
                    <select id="add_teacher_status" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold outline-none cursor-pointer">
                        <option value="active" selected>✅ សកម្ម (Active - អាចចូលប្រើប្រាស់បាន)</option>
                        <option value="inactive">⏸️ ផ្អាកដំណើរការ (Inactive - ផ្អាកបណ្តោះអាសន្ន)</option>
                    </select>
                </div>

                <div class="pt-4 flex gap-3 border-t border-slate-100">
                    <button type="button" onclick="document.getElementById('addTeacherModal').classList.add('hidden')" class="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition">បោះបង់</button>
                    <button type="submit" id="btnSubmitAddTeacher" class="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition shadow-md">បង្កើតគណនី</button>
                </div>
            </form>
        </div>
    `;

    modal.classList.remove("hidden");
};

window.handleCreateTeacherSubmit = async function(e) {
    if (e && e.preventDefault) e.preventDefault();
    const btn = document.getElementById("btnSubmitAddTeacher");
    const origText = btn.innerHTML;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-1"></i> កំពុងបង្កើត...`;
    btn.disabled = true;

    try {
        const checkedRoles = Array.from(document.querySelectorAll("input[name='add_roles']:checked")).map(el => el.value);
        if (checkedRoles.length === 0) {
            throw new Error("សូមជ្រើសរើសតួនាទីយ៉ាងហោចណាស់មួយ!");
        }

        const payload = {
            name: document.getElementById("add_teacher_name").value.trim(),
            username: document.getElementById("add_teacher_user").value.trim(),
            password: document.getElementById("add_teacher_pass").value,
            roles: checkedRoles,
            role: checkedRoles[0],
            contact: document.getElementById("add_teacher_contact").value.trim(),
            assigned_grade: document.getElementById("add_teacher_grade").value,
            assigned_room: document.getElementById("add_teacher_room").value.trim(),
            status: document.getElementById("add_teacher_status")?.value || "active"
        };

        await window.saveTeacherAccount(payload);
        const tModal = document.getElementById("addTeacherModal");
    if (tModal) { tModal.classList.add("hidden"); tModal.style.display = "none"; }
        if (typeof showToast === "function") showToast("✅ បង្កើតគណនី និងកំណត់សិទ្ធិបានជោគជ័យ!");
        window.renderUserAccountsTab();

    } catch (err) {
        alert("❌ " + err.message);
    } finally {
        btn.innerHTML = origText;
        btn.disabled = false;
    }
};

// Modal កែប្រែគណនី & សិទ្ធិ (Edit Teacher Modal - Chapter 2)
window.openEditTeacherModal = async function(teacherId) {
    let teachers = [];
    try {
        teachers = typeof window.fetchTeacherAccounts === "function" ? await window.fetchTeacherAccounts() : [];
    } catch(e) {}
    const t = teachers.find(item => item.teacher_id === teacherId);
    if (!t) return alert("រកមិនឃើញគណនីនេះទេ!");

    let modal = document.getElementById("editTeacherModal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "editTeacherModal";
        modal.className = "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-siemreap overflow-y-auto";
        document.body.appendChild(modal);
    }

    const currentRoles = window.normalizeRoles(t.roles || t.role, "teacher");

    modal.innerHTML = `
        <div class="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 animate-scale-up my-auto">
            <div class="p-6 border-b border-slate-100 flex items-center justify-between bg-indigo-50/50">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-lg shadow-md">
                        <i class="fa-solid fa-user-pen"></i>
                    </div>
                    <div>
                        <h3 class="font-moul text-sm text-slate-800">កែប្រែគណនី និងសិទ្ធិប្រើប្រាស់</h3>
                        <p class="text-xs text-slate-400 mt-0.5">អត្តលេខ៖ <span class="font-mono font-bold text-indigo-700">${t.teacher_id}</span></p>
                    </div>
                </div>
                <button onclick="document.getElementById('editTeacherModal').classList.add('hidden')" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 flex items-center justify-center transition">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

            <form onsubmit="window.handleEditTeacherSubmit(event, '${t.teacher_id}')" class="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto custom-scrollbar">
                <div>
                    <label class="block font-bold text-slate-700 mb-1">គោត្តនាម និង នាមខ្លួន *</label>
                    <input type="text" id="edit_teacher_name" value="${t.name || ''}" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold outline-none focus:ring-2 focus:ring-indigo-400">
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">ឈ្មោះគណនី (Username) *</label>
                        <input type="text" id="edit_teacher_user" value="${t.username || ''}" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold outline-none focus:ring-2 focus:ring-indigo-400 lowercase">
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">លេខទូរស័ព្ទ</label>
                        <input type="text" id="edit_teacher_contact" value="${t.contact || ''}" placeholder="012 345 678" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold font-mono outline-none">
                    </div>
                </div>

                <!-- Multi-role Selector Section (Chapter 2) -->
                <div>
                    <label class="block font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                        <i class="fa-solid fa-user-shield text-indigo-600"></i>
                        <span>កំណត់តួនាទី និងសិទ្ធិ (Multi-role Assignment) *</span>
                    </label>
                    <div class="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                        <label class="flex items-start gap-2.5 cursor-pointer p-2 rounded-xl hover:bg-white transition border border-transparent hover:border-slate-200">
                            <input type="checkbox" name="edit_roles" value="teacher" ${currentRoles.includes('teacher') ? 'checked' : ''} class="mt-0.5 w-4 h-4 text-emerald-600 rounded">
                            <div>
                                <span class="font-bold text-slate-800 text-xs flex items-center gap-1.5"><i class="fa-solid fa-chalkboard-user text-emerald-600"></i> Teacher (គ្រូបង្រៀន)</span>
                                <span class="block text-[11px] text-slate-400 mt-0.5">មើលថ្នាក់ដែលទទួលខុសត្រូវ កត់ត្រាវត្តមាន និងបញ្ចូលពិន្ទុ</span>
                            </div>
                        </label>
                        <label class="flex items-start gap-2.5 cursor-pointer p-2 rounded-xl hover:bg-white transition border border-transparent hover:border-slate-200">
                            <input type="checkbox" name="edit_roles" value="school_admin" ${currentRoles.includes('school_admin') ? 'checked' : ''} class="mt-0.5 w-4 h-4 text-indigo-600 rounded">
                            <div>
                                <span class="font-bold text-slate-800 text-xs flex items-center gap-1.5"><i class="fa-solid fa-school text-indigo-600"></i> School Administrator (អ្នកគ្រប់គ្រងសាលា)</span>
                                <span class="block text-[11px] text-slate-400 mt-0.5">គ្រប់គ្រងព័ត៌មានសាលា ឆ្នាំសិក្សា ថ្នាក់ សិស្ស និងរបាយការណ៍</span>
                            </div>
                        </label>
                        <label class="flex items-start gap-2.5 cursor-pointer p-2 rounded-xl hover:bg-white transition border border-transparent hover:border-slate-200">
                            <input type="checkbox" name="edit_roles" value="system_admin" ${currentRoles.includes('system_admin') ? 'checked' : ''} class="mt-0.5 w-4 h-4 text-rose-600 rounded">
                            <div>
                                <span class="font-bold text-slate-800 text-xs flex items-center gap-1.5"><i class="fa-solid fa-shield-halved text-rose-600"></i> System Administrator (អ្នកគ្រប់គ្រងប្រព័ន្ធ)</span>
                                <span class="block text-[11px] text-slate-400 mt-0.5">គ្រប់គ្រងគណនី សិទ្ធិ ការកំណត់ប្រព័ន្ធ និងការបម្រុងទុកទិន្នន័យ</span>
                            </div>
                        </label>
                        <label class="flex items-start gap-2.5 cursor-pointer p-2 rounded-xl hover:bg-white transition border border-transparent hover:border-slate-200">
                            <input type="checkbox" name="edit_roles" value="report_viewer" ${currentRoles.includes('report_viewer') ? 'checked' : ''} class="mt-0.5 w-4 h-4 text-amber-600 rounded">
                            <div>
                                <span class="font-bold text-slate-800 text-xs flex items-center gap-1.5"><i class="fa-solid fa-chart-pie text-amber-600"></i> Report Viewer (អ្នកមើលរបាយការណ៍)</span>
                                <span class="block text-[11px] text-slate-400 mt-0.5">មើលរបាយការណ៍ដែលបានអនុញ្ញាត ដោយមិនអាចកែប្រែទិន្នន័យ</span>
                            </div>
                        </label>
                    </div>
                </div>

                <!-- Scope: Assigned Class & Room -->
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">ថ្នាក់ទទួលខុសត្រូវ (Grade Scope)</label>
                        <select id="edit_teacher_grade" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold outline-none cursor-pointer">
                            <option value="គ្រប់ថ្នាក់" ${t.assigned_grade === 'គ្រប់ថ្នាក់' ? 'selected' : ''}>គ្រប់ថ្នាក់ (School-wide)</option>
                            <option value="ថ្នាក់ទី ១" ${t.assigned_grade === 'ថ្នាក់ទី ១' ? 'selected' : ''}>ថ្នាក់ទី ១</option>
                            <option value="ថ្នាក់ទី ២" ${t.assigned_grade === 'ថ្នាក់ទី ២' ? 'selected' : ''}>ថ្នាក់ទី ២</option>
                            <option value="ថ្នាក់ទី ៣" ${t.assigned_grade === 'ថ្នាក់ទី ៣' ? 'selected' : ''}>ថ្នាក់ទី ៣</option>
                            <option value="ថ្នាក់ទី ៤" ${t.assigned_grade === 'ថ្នាក់ទី ៤' ? 'selected' : ''}>ថ្នាក់ទី ៤</option>
                            <option value="ថ្នាក់ទី ៥" ${t.assigned_grade === 'ថ្នាក់ទី ៥' ? 'selected' : ''}>ថ្នាក់ទី ៥</option>
                            <option value="ថ្នាក់ទី ៦" ${t.assigned_grade === 'ថ្នាក់ទី ៦' ? 'selected' : ''}>ថ្នាក់ទី ៦</option>
                        </select>
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">បន្ទប់ (Room)</label>
                        <input type="text" id="edit_teacher_room" value="${t.assigned_room || '«ក»'}" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold outline-none text-center">
                    </div>
                </div>

                <!-- Status Check (Active / Inactive / Locked) -->
                <div>
                    <label class="block font-bold text-slate-700 mb-1">ស្ថានភាពគណនី (Account Status)</label>
                    <select id="edit_teacher_status" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold outline-none cursor-pointer">
                        <option value="active" ${(t.status || 'active').toLowerCase() === 'active' ? 'selected' : ''}>✅ សកម្ម (Active - អាចចូលប្រើប្រាស់បាន)</option>
                        <option value="inactive" ${(t.status || '').toLowerCase() === 'inactive' ? 'selected' : ''}>⏸️ ផ្អាកដំណើរការ (Inactive - ផ្អាកបណ្តោះអាសន្ន)</option>
                        <option value="locked" ${(t.status || '').toLowerCase() === 'locked' ? 'selected' : ''}>🔒 ចាក់សោ (Locked - មិនអនុញ្ញាតឱ្យចូលប្រើ)</option>
                    </select>
                </div>

                <div class="pt-4 flex gap-3 border-t border-slate-100">
                    <button type="button" onclick="document.getElementById('editTeacherModal').classList.add('hidden')" class="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition">បោះបង់</button>
                    <button type="submit" id="btnSubmitEditTeacher" class="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition shadow-md">រក្សាទុកការកែប្រែ</button>
                </div>
            </form>
        </div>
    `;

    modal.classList.remove("hidden");
};

window.handleEditTeacherSubmit = async function(e, teacherId) {
    if (e && e.preventDefault) e.preventDefault();
    const btn = document.getElementById("btnSubmitEditTeacher");
    const origText = btn.innerHTML;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-1"></i> កំពុងរក្សាទុក...`;
    btn.disabled = true;

    try {
        const checkedRoles = Array.from(document.querySelectorAll("input[name='edit_roles']:checked")).map(el => el.value);
        if (checkedRoles.length === 0) {
            throw new Error("សូមជ្រើសរើសតួនាទីយ៉ាងហោចណាស់មួយ!");
        }

        const payload = {
            teacher_id: teacherId,
            name: document.getElementById("edit_teacher_name").value.trim(),
            username: document.getElementById("edit_teacher_user").value.trim(),
            roles: checkedRoles,
            role: checkedRoles[0],
            contact: document.getElementById("edit_teacher_contact").value.trim(),
            assigned_grade: document.getElementById("edit_teacher_grade").value,
            assigned_room: document.getElementById("edit_teacher_room").value.trim(),
            status: document.getElementById("edit_teacher_status").value
        };

        await window.saveTeacherAccount(payload);
        const etModal = document.getElementById("editTeacherModal");
    if (etModal) { etModal.classList.add("hidden"); etModal.style.display = "none"; }
        if (typeof showToast === "function") showToast("✅ បានកែប្រែគណនី និងសិទ្ធិប្រើប្រាស់ជោគជ័យ!");
        window.renderUserAccountsTab();

    } catch (err) {
        alert("❌ " + err.message);
    } finally {
        btn.innerHTML = origText;
        btn.disabled = false;
    }
};

window.openResetTeacherPasswordModal = function(teacherId, teacherName) {
    const newPass = prompt(`🔑 បញ្ចូលលេខសម្ងាត់ថ្មីសម្រាប់៖ ${teacherName} (ID: ${teacherId})\n(យ៉ាងតិច ៦ តួអក្សរ)`);
    if (newPass === null) return;
    if (!newPass || newPass.trim().length < 6) {
        return alert("❌ លេខសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ ៦ តួអក្សរ!");
    }

    window.resetTeacherPasswordByAdmin(teacherId, newPass.trim())
        .then(() => {
            if (typeof showToast === "function") showToast(`✅ បានប្តូរលេខសម្ងាត់សម្រាប់ ${teacherName} ជោគជ័យ!`);
            else alert("✅ បានប្តូរលេខសម្ងាត់ជោគជ័យ!");
        })
        .catch(err => alert("❌ " + err.message));
};

window.handleDeleteTeacher = function(teacherId, teacherName) {
    if (confirm(`⚠️ តើលោកគ្រូអ្នកគ្រូពិតជាចង់លុបគណនី "${teacherName}" (ID: ${teacherId}) មែនទេ?`)) {
        window.deleteTeacherAccount(teacherId)
            .then(() => {
                if (typeof showToast === "function") showToast(`🗑️ បានលុបគណនី ${teacherName} រួចរាល់!`);
                window.renderUserAccountsTab();
            })
            .catch(err => alert("❌ " + err.message));
    }
};

// =========================================================================
// ៨. មុខងារជំនួយបំពេញទម្រង់ & Save Settings (Form Helpers - Chapter 4)
// =========================================================================

window.fillSettingsForm = function() {
    const s = typeof appSettings !== 'undefined' ? appSettings : {};
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ""; };
    
    // SET-01 School Profile Fields
    setVal("set_school_name", s.school_name);
    setVal("set_school_en", s.school_en);
    setVal("set_school_code", s.school_code);
    setVal("set_school_type", s.school_type || "បឋមសិក្សា");
    setVal("set_cluster", s.cluster || s.school_cluster); 
    setVal("set_principal_name", s.principal_name);
    setVal("set_academic_year", s.academic_year || localStorage.getItem('selected_academic_year') || "2026-2027");
    setVal("set_school_phone", s.school_phone || s.school_contact || "");
    setVal("set_school_email", s.school_email || "");
    setVal("set_school_contact", s.school_contact || "");
    
    // SET-02 General Settings Fields
    setVal("set_default_language", s.default_language || "km");
    setVal("set_date_format", s.date_format || "DD/MM/YYYY");
    setVal("set_time_format", s.time_format || "12h");
    setVal("set_timezone", s.timezone || "Asia/Phnom_Penh");
    setVal("set_student_id_prefix", s.student_id_prefix || "STU-");
    setVal("set_school_id", s.school_id || localStorage.getItem('auth_school_id') || "SCH-001");
    
    if (document.getElementById("set_show_logo_on_reports")) {
        document.getElementById("set_show_logo_on_reports").checked = s.show_logo_on_reports !== false;
    }
    if (document.getElementById("set_show_school_header")) {
        document.getElementById("set_show_school_header").checked = s.show_school_header !== false;
    }
    
    // Teacher & Location profile
    setVal("prof_teacher_name", s.teacher_name);
    setVal("prof_teacher_phone", s.teacher_phone);
    setVal("prof_teacher_level", s.teacher_level || "ថ្នាក់ទី ១");
    setVal("prof_teacher_room", s.teacher_room || "«ក»");
    setVal("prof_teacher_gender", s.teacher_gender || "ប្រុស");
    setVal("prof_teacher_dob", s.teacher_dob || "");
    setVal("prof_teacher_email", s.teacher_email || "");
    setVal("prof_teacher_edu", s.teacher_edu || "");
    
    setVal("prof_province", s.province);
    setVal("prof_district", s.district);
    setVal("prof_commune", s.commune);
    setVal("prof_village", s.village);

    if(document.getElementById("set_auto_sync")) document.getElementById("set_auto_sync").checked = s.auto_sync !== false;
    
    if (s.logo_url) {
        const preview = document.getElementById("preview_logo");
        const icon = document.getElementById("icon_logo");
        if(preview) { preview.src = s.logo_url; preview.classList.remove("hidden"); }
        if(icon) icon.classList.add("hidden");
        setVal("val_logo", s.logo_url);
    }
    if (s.signature_url) {
        const preview = document.getElementById("preview_sig");
        const icon = document.getElementById("icon_sig");
        if(preview) { preview.src = s.signature_url; preview.classList.remove("hidden"); }
        if(icon) icon.classList.add("hidden");
        setVal("val_sig", s.signature_url);
    }

    // SET-04: Data Isolation & RBAC Permission Check
    const canManageSchool = typeof window.isSchoolAdmin === "function" ? window.isSchoolAdmin() : false;
    const warnEl = document.getElementById("schoolSettingsPermWarning");
    const saveBtn = document.getElementById("btnSaveSettings");
    const form = document.getElementById("settingsForm");

    if (!canManageSchool) {
        if (warnEl) {
            warnEl.classList.remove("hidden");
            warnEl.classList.add("flex");
        }
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.classList.add("opacity-50", "cursor-not-allowed");
            saveBtn.title = "🔒 លោកគ្រូអ្នកគ្រូមិនមានសិទ្ធិកែប្រែព័ត៌មានសាលារៀនឡើយ";
        }
        if (form) {
            const inputs = form.querySelectorAll("input:not([type='file']), select, textarea");
            inputs.forEach(inp => {
                inp.disabled = true;
                inp.classList.add("bg-slate-100", "cursor-not-allowed");
            });
        }
    } else {
        if (warnEl) {
            warnEl.classList.add("hidden");
            warnEl.classList.remove("flex");
        }
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.classList.remove("opacity-50", "cursor-not-allowed");
        }
    }
};

window.processSettingsImage = function(inputEl, previewImgId, hiddenInputId, iconId) {
    const file = inputEl.files[0];
    if (!file) return;

    // SET-03: Validation of image type and file size
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
        alert("⚠️ ប្រភេទឯកសារមិនត្រឹមត្រូវ! សូមជ្រើសរើសឯកសាររូបភាពប្រភេទ PNG, JPEG ឬ WebP ប៉ុណ្ណោះ។");
        inputEl.value = "";
        return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert("⚠️ ទំហំរូបភាពធំពេក (លើសពី 2MB)! សូមជ្រើសរើសរូបភាពដែលមានទំហំតូចជាង 2MB ដើម្បីដំណើរការបានលឿន។");
        inputEl.value = "";
        return;
    }

    const previewImg = document.getElementById(previewImgId);
    const hiddenInput = document.getElementById(hiddenInputId);
    const iconEl = document.getElementById(iconId);

    if(previewImg) {
        previewImg.classList.add("opacity-50", "animate-pulse");
        previewImg.classList.remove("hidden");
    }
    if(iconEl) iconEl.classList.add("hidden");

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement("canvas");
            const MAX_WIDTH = 300; 
            let width = img.width;
            let height = img.height;
            
            if (width > MAX_WIDTH) { height = Math.round((height * MAX_WIDTH) / width); width = MAX_WIDTH; }
            
            canvas.width = width; canvas.height = height;
            const ctx = canvas.getContext("2d");
            
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            
            const compressedBase64 = canvas.toDataURL("image/png", 0.8); 

            if(previewImg) {
                previewImg.src = compressedBase64;
                previewImg.classList.remove("opacity-50", "animate-pulse");
            }
            if(hiddenInput) hiddenInput.value = compressedBase64;
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
};

window.handleTeacherPhotoUpload = function(inputEl) {
    if (!inputEl || !inputEl.files || !inputEl.files[0]) return;
    const file = inputEl.files[0];

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
        alert("⚠️ ប្រភេទឯកសារមិនត្រឹមត្រូវ! សូមជ្រើសរើសឯកសាររូបភាពប្រភេទ PNG, JPEG ឬ WebP ប៉ុណ្ណោះ។");
        inputEl.value = "";
        return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB input limit
        alert("⚠️ ទំហំរូបភាពធំពេក (លើសពី 10MB)! សូមជ្រើសរើសរូបភាពដែលមានទំហំតូចជាងនេះ។");
        inputEl.value = "";
        return;
    }

    const formPreview = document.getElementById("pers_avatar_form_preview");
    const bannerPreview = document.getElementById("pers_avatar_preview");
    const hiddenInput = document.getElementById("val_profile_avatar");
    const accAvatar = document.getElementById("acc_avatar_img");

    if (formPreview) formPreview.classList.add("opacity-50", "animate-pulse");
    if (bannerPreview) bannerPreview.classList.add("opacity-50", "animate-pulse");
    if (accAvatar) accAvatar.classList.add("opacity-50", "animate-pulse");

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            // Compress and scale to max 220px to stay safely within Google Sheet cell limit
            const MAX_DIM = 220;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_DIM) {
                    height = Math.round((height * MAX_DIM) / width);
                    width = MAX_DIM;
                }
            } else {
                if (height > MAX_DIM) {
                    width = Math.round((width * MAX_DIM) / height);
                    height = MAX_DIM;
                }
            }

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);

            const compressedBase64 = canvas.toDataURL("image/jpeg", 0.8);

            if (hiddenInput) hiddenInput.value = compressedBase64;
            localStorage.setItem('auth_teacher_avatar', compressedBase64);
            if (window.appSettings) window.appSettings.profile_avatar = compressedBase64;

            if (formPreview) {
                formPreview.src = compressedBase64;
                formPreview.classList.remove("opacity-50", "animate-pulse");
            }
            if (bannerPreview) {
                bannerPreview.src = compressedBase64;
                bannerPreview.classList.remove("opacity-50", "animate-pulse");
            }
            if (accAvatar) {
                accAvatar.src = compressedBase64;
                accAvatar.classList.remove("opacity-50", "animate-pulse");
            }

            const headerAvatar = document.getElementById("headerUserAvatarImg");
            const headerIcon = document.getElementById("headerUserAvatarIcon");
            if (headerAvatar) {
                headerAvatar.src = compressedBase64;
                headerAvatar.classList.remove('hidden');
                if (headerIcon) headerIcon.classList.add('hidden');
            }

            if (typeof window.showToast === 'function') {
                window.showToast("📸 បានជ្រើសរូបថតរួចរាល់! សូមចុច «រក្សាទុកការកំណត់» ដើម្បី Sync ទៅកាន់ Google Sheet។");
            }
        };
        img.onerror = function() {
            alert("⚠️ មិនអាចដំណើរការរូបភាពនេះបានទេ! សូមជ្រើសរើសរូបភាពផ្សេងទៀត។");
            if (formPreview) formPreview.classList.remove("opacity-50", "animate-pulse");
            if (bannerPreview) bannerPreview.classList.remove("opacity-50", "animate-pulse");
            if (accAvatar) accAvatar.classList.remove("opacity-50", "animate-pulse");
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
};

window.removeTeacherPhoto = function() {
    const inputEl = document.getElementById("pers_teacher_photo_input");
    if (inputEl) inputEl.value = "";
    const accInput = document.getElementById("acc_avatar_upload_input");
    if (accInput) accInput.value = "";

    const hiddenInput = document.getElementById("val_profile_avatar");
    if (hiddenInput) hiddenInput.value = "";

    localStorage.removeItem('auth_teacher_avatar');
    if (window.appSettings) delete window.appSettings.profile_avatar;

    const teacherName = document.getElementById("pers_teacher_name")?.value || localStorage.getItem('auth_teacher_name') || "Teacher";
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(teacherName)}&background=6366f1&color=fff&size=200`;

    const formPreview = document.getElementById("pers_avatar_form_preview");
    if (formPreview) formPreview.src = defaultAvatar;

    const bannerPreview = document.getElementById("pers_avatar_preview");
    if (bannerPreview) bannerPreview.src = defaultAvatar;

    const accAvatar = document.getElementById("acc_avatar_img");
    if (accAvatar) accAvatar.src = defaultAvatar;

    const headerAvatar = document.getElementById("headerUserAvatarImg");
    const headerIcon = document.getElementById("headerUserAvatarIcon");
    if (headerAvatar) {
        headerAvatar.src = "";
        headerAvatar.classList.add('hidden');
        if (headerIcon) headerIcon.classList.remove('hidden');
    }

    if (typeof window.showToast === 'function') {
        window.showToast("🗑️ បានដករូបថតចេញ! សូមចុច «រក្សាទុកការកំណត់»។");
    }
};

window.handleSaveSettings = async function(event) {
    event.preventDefault();

    // SET-04: DataServiceGuard assert permission
    if (window.DataServiceGuard) {
        try {
            window.DataServiceGuard.assertCan('manage_school_info', {}, "🔒 សិទ្ធិត្រូវបានបដិសេធ៖ មានតែ School Administrator ឬ System Administrator ប៉ុណ្ណោះដែលអាចកែប្រែព័ត៌មានសាលារៀន!");
        } catch(guardErr) {
            return alert(guardErr.message);
        }
    } else if (typeof window.isSchoolAdmin === 'function' && !window.isSchoolAdmin()) {
        return alert("🔒 មានតែ School Administrator ឬ System Administrator ប៉ុណ្ណោះដែលអាចកែប្រែព័ត៌មានសាលារៀន!");
    }

    const schoolName = document.getElementById("set_school_name")?.value.trim() || "";
    const schoolPhone = document.getElementById("set_school_phone")?.value.trim() || "";
    const schoolEmail = document.getElementById("set_school_email")?.value.trim() || "";

    // SET-03: Validation
    if (!schoolName) {
        return alert("⚠️ សូមបំពេញឈ្មោះសាលារៀនជាភាសាខ្មែរ (School Name)! ព័ត៌មាននេះចាំបាច់ត្រូវមាន។");
    }

    if (schoolEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(schoolEmail)) {
        return alert("⚠️ ទម្រង់អ៊ីមែលសាលារៀនមិនត្រឹមត្រូវទេ! (ឧ. school@moeys.gov.kh)");
    }

    if (schoolPhone && !/^[0-9+\s-]{8,15}$/.test(schoolPhone)) {
        return alert("⚠️ ទម្រង់លេខទូរស័ព្ទសាលារៀនមិនត្រឹមត្រូវទេ! (ឧ. 012 345 678)");
    }

    const btn = document.getElementById("btnSaveSettings");
    const origHTML = btn ? btn.innerHTML : "រក្សាទុក";
    if (btn) {
        btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin text-xl"></i> <span>កំពុងរក្សាទុក...</span>`;
        btn.disabled = true;
        btn.classList.add("opacity-90", "cursor-not-allowed");
    }

    const payload = {
        // SET-01 School Profile
        school_id: localStorage.getItem('auth_school_id') || window.AuthState?.school_id || "SCH-001",
        school_name: schoolName,
        school_en: document.getElementById("set_school_en")?.value.trim() || "",
        school_code: document.getElementById("set_school_code")?.value.trim() || "",
        school_type: document.getElementById("set_school_type")?.value || "បឋមសិក្សា",
        cluster: document.getElementById("set_cluster")?.value.trim() || "", 
        principal_name: document.getElementById("set_principal_name")?.value.trim() || "",
        academic_year: document.getElementById("set_academic_year")?.value.trim() || "2026-2027",
        school_phone: schoolPhone,
        school_email: schoolEmail,
        school_contact: document.getElementById("set_school_contact")?.value.trim() || "",

        // SET-02 General Settings
        default_language: document.getElementById("set_default_language")?.value || "km",
        date_format: document.getElementById("set_date_format")?.value || "DD/MM/YYYY",
        time_format: document.getElementById("set_time_format")?.value || "12h",
        timezone: document.getElementById("set_timezone")?.value || "Asia/Phnom_Penh",
        student_id_prefix: document.getElementById("set_student_id_prefix")?.value.trim().toUpperCase() || "STU-",
        show_logo_on_reports: document.getElementById("set_show_logo_on_reports")?.checked !== false,
        show_school_header: document.getElementById("set_show_school_header")?.checked !== false,
        
        // Teacher Profile
        teacher_name: document.getElementById("prof_teacher_name")?.value.trim() || "",
        teacher_gender: document.getElementById("prof_teacher_gender")?.value || "ប្រុស",
        teacher_dob: document.getElementById("prof_teacher_dob")?.value || "",
        teacher_phone: document.getElementById("prof_teacher_phone")?.value.trim() || "",
        teacher_email: document.getElementById("prof_teacher_email")?.value.trim() || "",
        teacher_edu: document.getElementById("prof_teacher_edu")?.value.trim() || "",
        
        teacher_level: document.getElementById("prof_teacher_level")?.value || "ថ្នាក់ទី ១",
        teacher_room: document.getElementById("prof_teacher_room")?.value || "«ក»",
        province: document.getElementById("prof_province")?.value.trim() || "",
        district: document.getElementById("prof_district")?.value.trim() || "",
        commune: document.getElementById("prof_commune")?.value.trim() || "",
        village: document.getElementById("prof_village")?.value.trim() || "",
        
        auto_sync: document.getElementById("set_auto_sync")?.checked !== false,
        
        profile_avatar: document.getElementById("val_profile_avatar") ? document.getElementById("val_profile_avatar").value : "",
        logo_url: document.getElementById("val_logo") ? document.getElementById("val_logo").value : "",
        signature_url: document.getElementById("val_sig") ? document.getElementById("val_sig").value : ""
    };

    try {
        // Validation ឆ្នាំសិក្សា
        if (window.CMSValidator && typeof window.CMSValidator.validateAcademicYear === 'function') {
            if (!window.CMSValidator.validateAcademicYear(payload.academic_year)) {
                alert("⚠️ ទម្រង់ឆ្នាំសិក្សាមិនត្រឹមត្រូវ (ឧ. ២០២៦-២០២៧ ឬ 2026-2027)!");
                if (btn) { btn.innerHTML = origHTML; btn.disabled = false; btn.classList.remove("opacity-90", "cursor-not-allowed"); }
                return;
            }
        }

        let localSaved = false;
        try {
            window.appSettings = payload;
            localStorage.setItem("school_settings", JSON.stringify(window.appSettings));
            localStorage.setItem('selected_academic_year', payload.academic_year);
            const globalYearDrop = document.getElementById("globalAcademicYear");
            if (globalYearDrop) globalYearDrop.value = payload.academic_year;
            if (typeof window.updateUIWithSettings === "function") window.updateUIWithSettings();
            localSaved = true;
        } catch(storageErr) {
            console.warn("Local storage quota error on settings:", storageErr);
            alert("⚠️ ទំហំផ្ទុកលើ Browser ពេញ (Storage Full)!");
        }

        let cloudSaved = false;
        // រក្សាទុកក្នុង Firestore Cloud (AWAIT write & Multi-school Scoped - SET-03 Audit Fix)
        if (window.db) {
            try {
                let fsPayload = { ...payload };
                if (fsPayload.logo_url && fsPayload.logo_url.length > 500000) delete fsPayload.logo_url;
                if (fsPayload.signature_url && fsPayload.signature_url.length > 500000) delete fsPayload.signature_url;
                if (fsPayload.profile_avatar && fsPayload.profile_avatar.length > 500000) delete fsPayload.profile_avatar;

                const schoolId = payload.school_id || window.AuthState?.school_id || localStorage.getItem('auth_school_id') || 'SCH-001';
                
                // រក្សាទុកទាំង main_settings និង schoolId document
                await window.db.collection("schools_config").doc(schoolId).set({
                    ...fsPayload,
                    last_updated: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });

                await window.db.collection("schools_config").doc("main_settings").set({
                    ...fsPayload,
                    last_updated: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true }).catch(() => {});

                cloudSaved = true;
                console.log("✅ Settings persisted to Firestore for school:", schoolId);
            } catch(fsErr) {
                console.warn("Firestore settings save failed:", fsErr);
            }
        }

        // រក្សាទុកក្នុង Google Sheets
        if (typeof window.apiPost === 'function') {
            try {
                const gasRes = await window.apiPost("saveSettings", payload);
                if (gasRes && gasRes.status === "success") cloudSaved = true;
            } catch(gasErr) {
                console.warn("GAS saveSettings error:", gasErr);
            }
        }
        
        if (cloudSaved) {
            if(typeof showToast === 'function') showToast("✅ រក្សាទុកការកំណត់ទៅកាន់ Cloud បានជោគជ័យ!");
            else alert("✅ រក្សាទុកការកំណត់ទៅកាន់ Cloud បានជោគជ័យ!");
        } else if (localSaved) {
            if(typeof showToast === 'function') showToast("⚠️ បានរក្សាទុកក្នុងម៉ាស៊ីន (Offline - Pending Sync)! Cloud មិនទាន់ទទួលបានទិន្នន័យនៅឡើយទេ។", "warning");
            else alert("⚠️ បានរក្សាទុកក្នុងម៉ាស៊ីន (Offline - Pending Sync)!");
        } else {
            alert("❌ បរាជ័យក្នុងការរក្សាទុកការកំណត់!");
        }

        if (typeof window.logAudit === 'function' && (cloudSaved || localSaved)) {
            window.logAudit('UPDATE_SETTINGS', 'settings', `បានកែប្រែការកំណត់សាលារៀន (${payload.school_name || 'សាលា'}) និងព័ត៌មានទូទៅ (Cloud: ${cloudSaved ? 'Yes' : 'No'})`);
        }
        
    } catch (error) {
        console.error(error);
        alert("❌ មានបញ្ហាក្នុងការរក្សាទុកទិន្នន័យ: " + error.message);
    } finally {
        if (btn) {
            btn.innerHTML = origHTML;
            btn.disabled = false;
            btn.classList.remove("opacity-90", "cursor-not-allowed");
        }
    }
};

window.updateUIWithSettings = function() {
    const s = window.appSettings || {};
    const sidebarTitle = document.getElementById("sidebarSchoolName");
    if(sidebarTitle && s.school_name) sidebarTitle.textContent = s.school_name;

    const sidebarYear = document.getElementById("sidebarAcademicYear");
    if(sidebarYear && s.academic_year) {
        const khmerYear = typeof window.toKhmerNum === 'function' ? window.toKhmerNum(s.academic_year) : s.academic_year;
        sidebarYear.textContent = "ឆ្នាំសិក្សា: " + khmerYear;
    }

    const sidebarLogo = document.getElementById("sidebarLogo");
    if(sidebarLogo && s.logo_url) {
        sidebarLogo.src = s.logo_url;
        sidebarLogo.classList.remove('hidden');
        if(sidebarLogo.nextElementSibling) sidebarLogo.nextElementSibling.classList.add('hidden');
    }

    // Teacher Avatar in Header & UI
    const avatarUrl = s.profile_avatar || (typeof window.getTeacherPersonalSettings === 'function' ? window.getTeacherPersonalSettings()?.avatar_url : "") || localStorage.getItem('auth_teacher_avatar');
    const headerAvatar = document.getElementById("headerUserAvatarImg");
    const headerIcon = document.getElementById("headerUserAvatarIcon");
    if (headerAvatar) {
        if (avatarUrl) {
            headerAvatar.src = avatarUrl;
            headerAvatar.classList.remove('hidden');
            if (headerIcon) headerIcon.classList.add('hidden');
        } else {
            headerAvatar.src = "";
            headerAvatar.classList.add('hidden');
            if (headerIcon) headerIcon.classList.remove('hidden');
        }
    }
};

window.exportBackupData = function() {
    if (window.AuditBackup && typeof window.AuditBackup.exportFullBackup === "function") {
        return window.AuditBackup.exportFullBackup();
    }
    const data = {
        settings: JSON.parse(localStorage.getItem("school_settings") || "{}"),
        students: JSON.parse(localStorage.getItem("academic_students") || "[]"),
        examScores: JSON.parse(localStorage.getItem("academic_scores") || "[]"),
        academicData: JSON.parse(localStorage.getItem("academic_data") || "{}"),
        timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `SchoolApp_Backup_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

window.importBackupData = function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data.settings) {
                localStorage.setItem("school_settings", JSON.stringify(data.settings));
                window.appSettings = data.settings;
            }
            if (data.students) localStorage.setItem("academic_students", JSON.stringify(data.students));
            if (data.examScores || data.scores) localStorage.setItem("academic_scores", JSON.stringify(data.examScores || data.scores));
            if (data.academicData) localStorage.setItem("academic_data", JSON.stringify(data.academicData));
            
            alert("✅ នាំចូលទិន្នន័យបានជោគជ័យ! ប្រព័ន្ធនឹងផ្ទុកឡើងវិញ (Reload)។");
            window.location.reload();
        } catch (error) {
            alert("❌ ឯកសារមិនត្រឹមត្រូវ ឬមានបញ្ហាក្នុងការនាំចូលទិន្នន័យ!");
        }
    };
    reader.readAsText(file);
    event.target.value = ""; 
};

window.clearLocalCacheWithConfirm = function() {
    if(confirm("⚠️ តើលោកគ្រូ/អ្នកគ្រូពិតជាចង់លុបសម្អាតទិន្នន័យបណ្តោះអាសន្ន (Cache) មែនទេ?\n\nបញ្ជាក់៖ ប្រព័ន្ធនឹងទាមទារទាញយកទិន្នន័យថ្មីពី Server ម្តងទៀតនៅពេលចុច OK។")) {
        localStorage.removeItem('academic_scores');
        localStorage.removeItem('academic_students');
        localStorage.removeItem('academic_data');
        if(typeof showToast === 'function') showToast("🧹 បានសម្អាត Cache ដោយជោគជ័យ!");
        setTimeout(() => window.location.reload(), 1500);
    }
};

setTimeout(() => { if (typeof window.updateUIWithSettings === "function") window.updateUIWithSettings(); }, 500);

// មុខងារធ្វើបច្ចុប្បន្នភាព Sidebar ពី Settings (សម្រាប់ Layout ធំ)
window.updateSidebarFromSettings = function() {
    let savedSettings = {};
    try {
        const rawSettings = localStorage.getItem('school_settings') || localStorage.getItem('appSettings');
        if (rawSettings) savedSettings = JSON.parse(rawSettings);
    } catch (e) {}

    const sInfo = Object.keys(savedSettings).length > 0 ? savedSettings : (typeof appSettings !== 'undefined' ? appSettings : {});

    const schoolName = sInfo.school_name || "សាលាបឋមសិក្សា";
    const academicYear = document.getElementById("globalAcademicYear")?.value || localStorage.getItem('selected_academic_year') || sInfo.academic_year || "2026-2027";
    const logoUrl = sInfo.logo_url || sInfo.school_logo || "";

    const nameEl = document.getElementById("sidebarSchoolName");
    if (nameEl) { nameEl.textContent = schoolName; nameEl.title = schoolName; }

    const yearEl = document.getElementById("sidebarAcademicYear");
    if (yearEl) {
        const khmerYear = typeof window.toKhmerNum === 'function' ? window.toKhmerNum(academicYear) : academicYear;
        yearEl.textContent = "ឆ្នាំសិក្សា " + khmerYear;
    }

    const logoEl = document.getElementById("sidebarLogo");
    if (logoEl) {
        const fallbackIcon = logoEl.nextElementSibling; 
        if (logoUrl.trim() !== "") {
            logoEl.src = logoUrl;
            logoEl.classList.remove("hidden");
            if (fallbackIcon) fallbackIcon.classList.add("hidden");
        } else {
            logoEl.classList.add("hidden");
            if (fallbackIcon) fallbackIcon.classList.remove("hidden");
        }
    }
};

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => { if (typeof window.updateSidebarFromSettings === 'function') window.updateSidebarFromSettings(); }, 100); 
});

// មុខងារផ្លាស់ប្តូរឆ្នាំសិក្សា (Dynamic Dropdowns)
window.changeGlobalAcademicYear = function(selectElement) {
    if (!selectElement) return;
    const newYear = selectElement.value;
    
    localStorage.setItem('selected_academic_year', newYear);
    if (window.appSettings) {
        window.appSettings.academic_year = newYear;
        localStorage.setItem("school_settings", JSON.stringify(window.appSettings));
    }

    localStorage.removeItem('academic_scores');
    localStorage.removeItem('academic_students');
    localStorage.removeItem('academic_data');

    const loadingHtml = `
    <div id="globalYearLoading" class="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[999999] flex flex-col justify-center items-center font-siemreap">
        <div class="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mb-5 border border-white/20 shadow-2xl">
            <i class="fa-solid fa-rotate fa-spin text-4xl text-sky-400"></i>
        </div>
        <h2 class="text-white text-2xl font-bold font-moul mb-3 tracking-wide">ប្តូរទៅឆ្នាំសិក្សា ${window.toKhmerNum(newYear)}</h2>
        <p class="text-sky-200 text-sm font-medium bg-white/10 px-4 py-2 rounded-full">ប្រព័ន្ធកំពុងទាញយកទិន្នន័យថ្មី សូមរង់ចាំបន្តិច...</p>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', loadingHtml);

    setTimeout(() => { window.location.reload(); }, 1500); 
};

document.addEventListener("change", function(e) {
    if (e.target && e.target.id === "globalAcademicYear") window.changeGlobalAcademicYear(e.target);
});

window.syncGlobalYearDropdown = function() {
    const yearSelect = document.getElementById("globalAcademicYear");
    if (yearSelect) {
        let savedYear = localStorage.getItem('selected_academic_year') || window.appSettings?.academic_year;
        if (savedYear) yearSelect.value = savedYear;
    }
};

document.addEventListener("DOMContentLoaded", () => { setTimeout(() => window.syncGlobalYearDropdown(), 300); });
