// ==========================================
// ឯកសារ js/config.js (Advanced Cloud Sync & Multi-Teacher API)
// ==========================================

// 👉 URL របស់ Google Apps Script (Connected & Standardized)
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw6ZNl_m8VrX_HAgci15kWzBKIhoHOliii32LGxN7-_MIETighSV1LJvdodWET-7gtQ/exec";
window.SCRIPT_URL = SCRIPT_URL;
window.getScriptUrl = function() {
  return localStorage.getItem('cms_custom_script_url') || SCRIPT_URL;
};

// ⚡ Global Standardized Grade & Room Helpers
window.getAllGradesList = function() {
    let struct = window.academicStructure;
    if (!struct || !Array.isArray(struct.grades) || struct.grades.length === 0) {
        try { struct = JSON.parse(localStorage.getItem("academic_structure") || "{}"); } catch(e) {}
    }
    const gradesList = [];
    
    // ថ្នាក់ដែលគ្រូបានបង្កើត ឬទទួលបន្ទុក (Teacher's own created/assigned classroom)
    const teacherGrade = localStorage.getItem('selected_level') || (window.AuthState && window.AuthState.assigned_grade) || (window.appSettings && window.appSettings.teacher_level);
    if (teacherGrade && teacherGrade !== 'all' && !gradesList.includes(teacherGrade)) {
        gradesList.push(teacherGrade);
    }

    if (struct && Array.isArray(struct.grades)) {
        struct.grades.forEach(g => {
            if (g && g.name && !gradesList.includes(g.name)) gradesList.push(g.name);
        });
    }
    for (let i = 1; i <= 12; i++) {
        const kh = typeof window.toKhmerNum === 'function' ? window.toKhmerNum(i) : i;
        const gName = `ថ្នាក់ទី ${kh}`;
        if (!gradesList.includes(gName)) gradesList.push(gName);
    }
    const allStudents = window.allStudents || (typeof window.getMasterStudents === 'function' ? window.getMasterStudents() : []);
    allStudents.forEach(s => {
        if (s && s.grade) {
            const norm = typeof window.normalizeGrade === 'function' ? window.normalizeGrade(s.grade) : s.grade.trim();
            if (norm && !gradesList.includes(norm)) gradesList.push(norm);
        }
    });
    return gradesList;
};

window.getAllRoomsList = function() {
    let struct = window.academicStructure;
    if (!struct || !Array.isArray(struct.grades) || struct.grades.length === 0) {
        try { struct = JSON.parse(localStorage.getItem("academic_structure") || "{}"); } catch(e) {}
    }
    const roomsSet = new Set(["«ក»", "«ខ»", "«គ»", "«ឃ»", "«ង»"]);
    if (struct && Array.isArray(struct.grades)) {
        struct.grades.forEach(g => {
            if (g && Array.isArray(g.rooms)) g.rooms.forEach(r => roomsSet.add(r));
        });
    }
    const allStudents = window.allStudents || (typeof window.getMasterStudents === 'function' ? window.getMasterStudents() : []);
    allStudents.forEach(s => {
        if (s && s.room && s.room.trim()) roomsSet.add(s.room.trim());
    });
    return Array.from(roomsSet);
};

window.getCurrentSelectedClass = function() {
    const sInfo = window.appSettings || JSON.parse(localStorage.getItem('school_settings') || '{}');
    const teacherGradeInfo = typeof window.getTeacherGradeInfo === 'function' ? window.getTeacherGradeInfo() : {};
    const savedLevel = localStorage.getItem('selected_level') || teacherGradeInfo.level || sInfo.teacher_level || "ថ្នាក់ទី ១";
    const savedRoom = localStorage.getItem('selected_room') || teacherGradeInfo.room || sInfo.teacher_room || "«ក»";
    return {
        level: savedLevel,
        room: savedRoom,
        full: `${savedLevel} ${savedRoom}`.trim()
    };
};

window.setSelectedClass = function(level, room) {
    if (level && level !== 'all') localStorage.setItem('selected_level', level);
    if (room && room !== 'all') localStorage.setItem('selected_room', room);
};

// ⚡ Dynamic Dropdown Updater: updates all class/room dropdowns in real-time without reloading
window.updateAllClassDropdowns = function() {
    const gradesList = window.getAllGradesList();
    const roomsList = window.getAllRoomsList();
    
    // 1. Update Students filter select #stuFilterGrade
    const stuGradeSel = document.getElementById("stuFilterGrade");
    if (stuGradeSel) {
        const curVal = stuGradeSel.value;
        let optHtml = `<option value="all">គ្រប់ថ្នាក់ទាំងអស់</option>`;
        gradesList.forEach(g => {
            optHtml += `<option value="${g}" ${g === curVal ? 'selected' : ''}>${g}</option>`;
        });
        stuGradeSel.innerHTML = optHtml;
    }

    // 2. Update Student modal select #stu_grade
    const modalStuGrade = document.getElementById("stu_grade");
    if (modalStuGrade) {
        const curVal = modalStuGrade.value;
        let optHtml = "";
        gradesList.forEach(g => {
            optHtml += `<option value="${g}" ${g === curVal ? 'selected' : ''}>${g}</option>`;
        });
        modalStuGrade.innerHTML = optHtml;
    }

    // 3. Update Attendance select #attGradeSelect
    const attGradeSel = document.getElementById("attGradeSelect");
    if (attGradeSel) {
        const curVal = attGradeSel.value;
        let optHtml = `<option value="all">គ្រប់ថ្នាក់ទាំងអស់ (All Classes)</option>`;
        gradesList.forEach(g => {
            optHtml += `<option value="${g}" ${g === curVal ? 'selected' : ''}>${g}</option>`;
        });
        attGradeSel.innerHTML = optHtml;
    }

    // 4. Update Scores select #globalLevelSelect
    const scoreGradeSel = document.getElementById("globalLevelSelect");
    if (scoreGradeSel) {
        const curVal = scoreGradeSel.value;
        let optHtml = "";
        gradesList.forEach(g => {
            optHtml += `<option value="${g}" ${g === curVal ? 'selected' : ''}>${g}</option>`;
        });
        scoreGradeSel.innerHTML = optHtml;
    }

    // 5. Update Reports select #reportGradeSelect and #reportRoomSelect
    const reportGradeSel = document.getElementById("reportGradeSelect");
    if (reportGradeSel) {
        const curVal = reportGradeSel.value;
        let optHtml = "";
        gradesList.forEach(g => {
            optHtml += `<option value="${g}" ${g === curVal ? 'selected' : ''}>${g}</option>`;
        });
        reportGradeSel.innerHTML = optHtml;
    }
    const reportRoomSel = document.getElementById("reportRoomSelect");
    if (reportRoomSel) {
        const curVal = reportRoomSel.value;
        let optHtml = "";
        roomsList.forEach(r => {
            optHtml += `<option value="${r}" ${r === curVal ? 'selected' : ''}>${r}</option>`;
        });
        reportRoomSel.innerHTML = optHtml;
    }

    // 6. Update Library select #libGradeSelect and #libRoomSelect
    const libGradeSel = document.getElementById("libGradeSelect");
    if (libGradeSel) {
        const curVal = libGradeSel.value;
        let optHtml = "";
        gradesList.forEach(g => {
            optHtml += `<option value="${g}" ${g === curVal ? 'selected' : ''}>${g}</option>`;
        });
        libGradeSel.innerHTML = optHtml;
    }
    const libRoomSel = document.getElementById("libRoomSelect");
    if (libRoomSel) {
        const curVal = libRoomSel.value;
        let optHtml = "";
        roomsList.forEach(r => {
            optHtml += `<option value="${r}" ${r === curVal ? 'selected' : ''}>${r}</option>`;
        });
        libRoomSel.innerHTML = optHtml;
    }

    // 7. Update Tracking Book select #tbLevelSelect
    const tbLevelSel = document.getElementById("tbLevelSelect");
    if (tbLevelSel) {
        const curVal = tbLevelSel.value;
        let optHtml = "";
        gradesList.forEach(g => {
            optHtml += `<option value="${g}" ${g === curVal ? 'selected' : ''}>${g}</option>`;
        });
        tbLevelSel.innerHTML = optHtml;
    }

    // 8. Update Timetable & other class selects
    const otherSelects = document.querySelectorAll("select[id*='Grade'], select[id*='grade'], select[onchange*='handleClassChange']");
    otherSelects.forEach(sel => {
        if (sel !== stuGradeSel && sel !== modalStuGrade && sel !== attGradeSel && sel !== scoreGradeSel && sel !== reportGradeSel && sel !== reportRoomSel && sel !== libGradeSel && sel !== libRoomSel && sel !== tbLevelSel) {
            const curVal = sel.value;
            let optHtml = `<option value="all">គ្រប់ថ្នាក់ទាំងអស់</option>`;
            gradesList.forEach(g => {
                optHtml += `<option value="${g}" ${g === curVal ? 'selected' : ''}>${g}</option>`;
            });
            sel.innerHTML = optHtml;
        }
    });
};

// ⚡ Global Real-Time Event Dispatcher
window.notifyDataChanged = function(type, detail = {}) {
    window.dispatchEvent(new CustomEvent('cms-data-changed', { detail: { type, ...detail } }));

    if (type === 'students' || type === 'student') {
        if (typeof window.filterStudents === 'function') window.filterStudents();
        if (typeof window.calculateStudentStats === 'function') window.calculateStudentStats();
        if (typeof window.fetchStudentsForScores === 'function') window.fetchStudentsForScores();
    }
    if (type === 'scores' || type === 'score') {
        if (typeof window.calculateScoresSummary === 'function') window.calculateScoresSummary();
    }
    if (type === 'attendance') {
        if (typeof window.calculateAllAttendance === 'function') window.calculateAllAttendance();
    }
    if (type === 'academic_structure' || type === 'class' || type === 'grade') {
        if (typeof window.updateAllClassDropdowns === 'function') window.updateAllClassDropdowns();
        if (typeof window.renderAcademicManagementTab === 'function') window.renderAcademicManagementTab();
    }
    if (type === 'settings') {
        if (typeof window.updateUIWithSettings === 'function') window.updateUIWithSettings();
    }
};

// =========================================================
// ០. Security & Universal Data Validation Guard (CMSValidator & XSS Guard)
// =========================================================
window.escapeHtml = function(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

window.CMSValidator = {
    // ផ្ទៀងផ្ទាត់ទិន្នន័យសិស្ស (Schema & Business Rules)
    validateStudent: function(data, isEdit, existingList) {
        if (!existingList) existingList = [];
        const errors = [];
        const cleanId = String(data.id || '').trim();
        const cleanName = String(data.name || '').trim();
        const cleanDob = String(data.dob || '').trim();
        const gender = String(data.gender || '').trim();
        const grade = String(data.grade || '').trim();
        const room = String(data.room || '').trim();
        const status = String(data.status || 'Active').trim();
        const year = String(data.academic_year || '').trim();

        if (!cleanId) errors.push('អត្តលេខសិស្ស (Student ID) មិនអាចទទេបានឡើយ!');
        if (!cleanName) errors.push('ឈ្មោះសិស្ស មិនអាចទទេបានឡើយ!');
        
        // Validation ថ្ងៃកំណើត
        if (!cleanDob) {
            errors.push('ថ្ងៃខែឆ្នាំកំណើត ត្រូវតែបញ្ចូល!');
        } else {
            const dobDate = new Date(cleanDob);
            if (isNaN(dobDate.getTime())) {
                errors.push('ទម្រង់ថ្ងៃខែឆ្នាំកំណើតមិនត្រឹមត្រូវ!');
            } else if (dobDate > new Date()) {
                errors.push('ថ្ងៃខែឆ្នាំកំណើតមិនអាចនៅអនាគតបានទេ!');
            }
        }

        // Gender allowlist
        const ALLOWED_GENDERS = ['ប្រុស', 'ស្រី', 'ប', 'ស', 'M', 'F', 'Male', 'Female'];
        if (gender && !ALLOWED_GENDERS.includes(gender)) {
            errors.push('ភេទមិនត្រឹមត្រូវ (អនុញ្ញាតតែ ប្រុស ឬ ស្រី)!');
        }

        // Status allowlist
        const ALLOWED_STATUSES = ['Active', 'Suspended', 'Dropped', 'Transferred', 'Graduated', 'សកម្ម', 'ឈប់រៀន', 'ផ្អាក', 'ផ្ទេរចេញ', 'បញ្ចប់ការសិក្សា'];
        if (status && !ALLOWED_STATUSES.includes(status)) {
            errors.push('ស្ថានភាពសិស្សមិនស្ថិតក្នុងបញ្ជីត្រឹមត្រូវ!');
        }

        if (!grade) errors.push('ត្រូវតែជ្រើសរើសកម្រិតថ្នាក់!');
        if (!room) errors.push('ត្រូវតែជ្រើសរើសបន្ទប់រៀន!');
        if (!year) errors.push('ត្រូវតែមានឆ្នាំសិក្សាច្បាស់លាស់!');

        // Phone validation (Optional, but if present must be Cambodian format 9-10 digits)
        const phone = String(data.parent_contact || data.contact || '').trim().replace(/[\s-]/g, '');
        if (phone && !/^(0\d{8,9}|\+855\d{8,9})$/.test(phone)) {
            errors.push('លេខទូរស័ព្ទអាណាព្យាបាលមិនត្រឹមត្រូវ (ទម្រង់ក្នុងស្រុក ០xx xxx xxx)!');
        }

        // Uniqueness check against existing list
        if (!isEdit && cleanId) {
            const dup = existingList.some(function(s) { 
                return String(s.id).trim().toLowerCase() === cleanId.toLowerCase() &&
                       String(s.academic_year || year) === String(year);
            });
            if (dup) errors.push('អត្តលេខសិស្ស «' + cleanId + '» នេះមានរួចហើយក្នុងឆ្នាំសិក្សា ' + year + '!');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    },

    // ផ្ទៀងផ្ទាត់ពិន្ទុ (Schema & Business Range)
    validateScore: function(val, maxScore) {
        if (maxScore === undefined || maxScore === null) maxScore = 50;
        if (val === '' || val === null || val === undefined) {
            return { isValid: true, isMissing: true, numericValue: null, status: 'empty' };
        }
        const sVal = String(val).trim();
        // ករណីសម្គាល់ពិសេស: អវត្តមាន (A / Absent), លើកលែង (E / Exempt)
        if (['A', 'a', 'អ', 'អវត្តមាន'].includes(sVal)) {
            return { isValid: true, isMissing: false, numericValue: null, status: 'absent' };
        }
        if (['E', 'e', 'ល', 'លើកលែង'].includes(sVal)) {
            return { isValid: true, isMissing: false, numericValue: null, status: 'exempt' };
        }

        const num = parseFloat(sVal);
        if (isNaN(num) || !isFinite(num)) {
            return { isValid: false, error: 'ពិន្ទុត្រូវតែជាលេខពិតប្រាកដ!', status: 'invalid' };
        }
        if (num < 0) {
            return { isValid: false, error: 'ពិន្ទុមិនអាចតូចជាងសូន្យ (< 0) បានទេ!', status: 'invalid' };
        }
        if (num > maxScore) {
            return { isValid: false, error: 'ពិន្ទុ (' + num + ') មិនអាចធំជាងពិន្ទុអតិបរមា (' + maxScore + ') បានឡើយ!', status: 'invalid' };
        }

        return { isValid: true, isMissing: false, numericValue: num, status: 'scored' };
    },

    // ផ្ទៀងផ្ទាត់ស្ថានភាពវត្តមាន
    validateAttendanceStatus: function(status) {
        const ALLOWED_ATTENDANCE = [
            '', '1', '0.5', '0', 
            'present', 'permission', 'unexcused', 'sick', 'late', 'holiday',
            'វត្តមាន', 'ច្បាប់', 'ឥតច្បាប់', 'ឈឺ', 'យឺត', 'ឈប់សម្រាក',
            'ច', 'ច្ប', 'C', 'អ', 'អច្ប', 'A', 'ឈ', 'S', 'យ', 'L', '៖', ':'
        ];
        return ALLOWED_ATTENDANCE.includes(String(status).trim());
    },

    // ផ្ទៀងផ្ទាត់ឆ្នាំសិក្សា
    validateAcademicYear: function(yearStr) {
        if (!yearStr) return false;
        const clean = String(yearStr).trim();
        return /^[0-9]{4}-[0-9]{4}$/.test(clean) || /^[០-៩]{4}-[០-៩]{4}$/.test(clean);
    }
};

// =========================================================
// ១. ការកំណត់ទូទៅ (Global Settings Data)
// =========================================================
let appSettings = {
  school_name: "សាលាបឋមសិក្សា",
  academic_year: "២០២៦-២០២៧",
  principal_name: "នាយកសាលា",
  teacher_name: "គ្រូបង្រៀន",
  district: ".......",
  school_logo: "",
  grade_format: "khmer", 
  auto_sync: true
};

async function fetchSystemSettings() {
  const cached = localStorage.getItem("school_settings");
  if (cached) { 
    try {
        appSettings = { ...appSettings, ...JSON.parse(cached) }; 
        applySettingsToUI(); 
    } catch(e) {}
  }

  try {
    const res = await apiGet("getSettings");
    if (res && res.data) {
      appSettings = { ...appSettings, ...res.data };
      localStorage.setItem("school_settings", JSON.stringify(appSettings));
      applySettingsToUI();
    }
  } catch (error) {
    console.warn("⚠️ ប្រើប្រាស់ Settings ចាស់ក្នុងម៉ាស៊ីន ដោយសារបណ្តាញមានបញ្ហា។");
  }
}

function applySettingsToUI() {
  const nameEl = document.getElementById("navSchoolName");
  if (nameEl) nameEl.textContent = appSettings.school_name || "សាលារៀន";
  const yearEl = document.getElementById("navSchoolYear");
  if (yearEl) yearEl.textContent = "ឆ្នាំសិក្សា " + (appSettings.academic_year || "២០២៦-២០២៧");
  const logoEl = document.getElementById("sidebarLogo");
  if (logoEl && appSettings.logo_url) {
      logoEl.src = appSettings.logo_url;
      logoEl.style.display = "block";
      if(logoEl.nextElementSibling) logoEl.nextElementSibling.style.display = "none";
  }
}

// =========================================================
// ២. ប្រព័ន្ធ API (GET & POST) សម្រាប់ Google Apps Script (កែសម្រួលបន្ថែម Auth)
// =========================================================

/**
 * មុខងារសម្រាប់ទាញយក អត្តសញ្ញាណគ្រូ និងឆ្នាំសិក្សាបច្ចុប្បន្ន
 */
function getAuthCredentials() {
    return {
        teacher_id: localStorage.getItem('auth_teacher_id') || "TCH-001", // យកពីប្រព័ន្ធ Login
        academic_year: localStorage.getItem('selected_academic_year') || appSettings.academic_year || "2026-2027" // យកពី Dropdown ឆ្នាំសិក្សា
    };
}

/**
 * មុខងារសម្រាប់ហៅទិន្នន័យ (GET)
 */
async function apiGet(action, params = {}) {
  // 🟢 បញ្ចូលអត្តសញ្ញាណគ្រូ ឆ្នាំសិក្សា និង Session Token ទៅក្នុងប៉ារ៉ាម៉ែត្រជានិច្ច 🟢
  const auth = getAuthCredentials();
  const sessionToken = (typeof window.getSessionToken === 'function' ? window.getSessionToken() : '') || (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('cms_session_token') : '') || '';
  const finalParams = { ...auth, ...params };
  if (sessionToken && !finalParams.session_token) {
    finalParams.session_token = sessionToken;
  }
  
  const cacheKey = `cache_${action}_${JSON.stringify(finalParams)}`;
  const cachedData = localStorage.getItem(cacheKey);

  if (cachedData) {
    fetchDataFromAPI(action, finalParams, cacheKey).catch(e => console.warn("Background Sync API Get Error"));
    return JSON.parse(cachedData);
  }

  return await fetchDataFromAPI(action, finalParams, cacheKey);
}

async function fetchDataFromAPI(action, params, cacheKey) {
  try {
    const currentScriptUrl = window.getScriptUrl();
    const url = new URL(currentScriptUrl);
    url.searchParams.append("action", action);
    for (const [key, val] of Object.entries(params)) { 
      if (val !== undefined && val !== null) url.searchParams.append(key, val); 
    }
    
    const res = await fetch(url.toString(), {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
    });
    
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    const data = await res.json();
    
    if (data.status === "success") {
      localStorage.setItem(cacheKey, JSON.stringify(data));
    }
    return data;
  } catch (err) { 
    console.warn(`API GET Error [${action}]: បរាជ័យក្នុងការតភ្ជាប់។`, err);
    return { status: "error", data: null, message: err.toString() };
  }
}


// =========================================================================
// 🌟 SINGLE SOURCE OF TRUTH (SSOT) FOR STUDENTS DATA SERVICE
// ប្រព័ន្ធទាញយក និងគ្រប់គ្រងសិស្សពីប្រភពតែមួយ (Student Management Master)
// =========================================================================

window.toKhmerNum = window.toKhmerNum || function(str) {
    if (!str && str !== 0) return "";
    const khmerNumbers = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    return String(str).split('').map(n => (n >= '0' && n <= '9') ? khmerNumbers[parseInt(n, 10)] : n).join('');
};

window.normalizeGrade = function(str) {
    if (!str) return "";
    let s = String(str).trim();
    if (s === "all" || s === "គ្រប់ថ្នាក់") return "";
    const khmerToArabic = {'០':'0', '១':'1', '២':'2', '៣':'3', '៤':'4', '៥':'5', '៦':'6', '៧':'7', '៨':'8', '៩':'9'};
    let arabicStr = s.replace(/[០-៩]/g, match => khmerToArabic[match]);
    let match = arabicStr.match(/[0-9]+/);
    if (match) return "ថ្នាក់ទី " + window.toKhmerNum(match[0]);
    return s;
};

// Universal Date Formatter: supports ISO timestamps (e.g. "2013-07-12T17:00:00.000Z"), YYYY-MM-DD, DD/MM/YYYY, etc.
window.formatDate = function(dateVal, format = 'DD/MM/YYYY') {
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

// ១. ទាញយកបញ្ជីសិស្សមេទាំងអស់ (Master Students List) ពី Student Management
window.getMasterStudents = function() {
    if (window.allStudents && Array.isArray(window.allStudents) && window.allStudents.length > 0) {
        return window.allStudents;
    }
    try {
        const cached = JSON.parse(localStorage.getItem('academic_students') || '[]');
        if (Array.isArray(cached) && cached.length > 0) {
            window.allStudents = cached;
            return cached;
        }
    } catch(e) {}
    window.allStudents = window.allStudents || [];
    return window.allStudents;
};

// ២. ទាញយកសិស្សតាមថ្នាក់ និងបន្ទប់ សម្រាប់គ្រប់ម៉ូឌុល (Attendance, Scores, Library, Reports)
window.getStudentsForClass = function(gradeInput, roomInput, academicYearInput) {
    const allStus = window.getMasterStudents();
    const targetGrade = window.normalizeGrade(gradeInput);
    const targetRoomClean = String(roomInput || '«ក»').replace(/[«»\s]/g, '');
    const currentAcademicYear = academicYearInput || document.getElementById("globalAcademicYear")?.value || localStorage.getItem('selected_academic_year') || "2026-2027";

    const filtered = allStus.filter(s => {
        if (!s || typeof s !== 'object') return false;

        // បដិសេធសិស្សដែលបានឈប់រៀន ឬផ្អាក
        const sStat = String(s.status || 'Active').trim().toLowerCase();
        if (sStat === 'dropped' || sStat === 'withdrawn' || sStat === 'ឈប់រៀន' || sStat === 'បោះបង់' || sStat === 'អសកម្ម' || sStat === 'inactive') {
            return false;
        }

        // ពិនិត្យឆ្នាំសិក្សា (បើមានកំណត់ក្នុងសិស្ស)
        const sYear = String(s.academic_year || '').trim();
        if (sYear && sYear !== 'undefined' && currentAcademicYear && !sYear.includes(currentAcademicYear) && !currentAcademicYear.includes(sYear)) {
            return false;
        }

        // ពិនិត្យកម្រិតថ្នាក់ (Grade/Level)
        if (targetGrade && targetGrade !== 'all' && targetGrade !== 'គ្រប់ថ្នាក់') {
            const sGrade = window.normalizeGrade(s.grade);
            if (sGrade !== targetGrade && String(s.grade || '').trim() !== String(gradeInput || '').trim()) {
                return false;
            }
        }

        // ពិនិត្យបន្ទប់ (Room)
        if (targetRoomClean && targetRoomClean !== 'all' && targetRoomClean !== 'គ្រប់បន្ទប់') {
            const sRoomClean = String(s.room || '«ក»').replace(/[«»\s]/g, '');
            if (sRoomClean !== targetRoomClean) {
                // បើសិនបន្ទប់ជា «ក» ហើយសិស្សអត់មាន room វាស្មើនឹង «ក»
                if (!(targetRoomClean === 'ក' && (!s.room || s.room.trim() === ''))) {
                    return false;
                }
            }
        }

        return true;
    });

    // តម្រៀបអក្ខរក្រមតាមឈ្មោះខ្មែរ
    filtered.sort((a, b) => String(a.name || '').trim().localeCompare(String(b.name || '').trim(), 'km'));
    return filtered;
};

// ៣. រក្សាទុក និងផ្សព្វផ្សាយទិន្នន័យសិស្សមេ (Sync Master across App)
window.setMasterStudents = function(newStudentsList) {
    if (!Array.isArray(newStudentsList)) return;
    window.allStudents = newStudentsList;
    try {
        localStorage.setItem('academic_students', JSON.stringify(newStudentsList));
    } catch(e) {}
    window.dispatchEvent(new CustomEvent('masterStudentsUpdated', { detail: newStudentsList }));
};

// មុខងារទាញយកទិន្នន័យសិស្សប្រកបដោយល្បឿនលឿន (Cache-First Strategy)
window.fetchStudentsDataFast = async function() {
    // ១. បង្ហាញទិន្នន័យពី LocalStorage ភ្លាមៗ (Instant Display)
    try {
        const rawData = localStorage.getItem('academic_students');
        if (rawData) {
            const parsed = JSON.parse(rawData) || [];
            window.allStudents = parsed;
            if (typeof window.filterStudents === 'function') {
                window.filterStudents();
            }
        }
    } catch(e) {}

    // ២. ទាញទិន្នន័យថ្មីពី Google Sheets មកបំពេញបន្ថែមនៅខាងក្រោយ (Background Sync)
    if (typeof window.apiGet === 'function') {
        window.apiGet("getStudents").then(res => {
            if (res && res.status === "success" && Array.isArray(res.data)) {
                window.setMasterStudents(res.data);
                if (typeof window.filterStudents === 'function') {
                    window.filterStudents();
                }
            }
        }).catch(err => console.warn("Background fetch skipped:", err));
    }
};

/**
 * មុខងារសម្រាប់បញ្ជូនទិន្នន័យ (POST)
 */
async function apiPost(action, payload = {}) {
  const auth = getAuthCredentials();
  const sessionToken = (typeof window.getSessionToken === 'function' ? window.getSessionToken() : '') || (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('cms_session_token') : '') || '';
  
  const requestBody = {
      action: action,
      session_token: payload.session_token || sessionToken,
      teacher_id: auth.teacher_id,
      academic_year: auth.academic_year,
      data: payload.data !== undefined ? payload.data : payload
  };
  
  if (payload && payload.id) requestBody.id = payload.id;
  else if (payload && payload.data && payload.data.id) requestBody.id = payload.data.id;
  if (payload && payload.id_token) requestBody.id_token = payload.id_token;
  if (payload && payload.auth_data) requestBody.auth_data = payload.auth_data;
  if (payload && payload.target_user_id) requestBody.target_user_id = payload.target_user_id;
  if (payload && payload.role) requestBody.role = payload.role;
  if (payload && payload.new_role) requestBody.new_role = payload.new_role;
  if (payload && payload.new_status) requestBody.new_status = payload.new_status;

  // ⚡ INSTANT SERVER POST: Send directly to Google Apps Script right away
  try {
    const currentScriptUrl = window.getScriptUrl();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

    const response = await fetch(currentScriptUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const result = await response.json();
    return result;
  } catch (error) {
    console.warn(`API POST Direct Error [${action}], falling back to resilient sync queue:`, error);
    
    // Resilient offline-first queue fallback
    let syncQueue = JSON.parse(localStorage.getItem('syncQueue') || '[]');
    syncQueue = syncQueue.filter(item => item.action !== action);
    syncQueue.push({ 
        action, 
        requestBody: requestBody,
        timestamp: new Date().getTime() 
    });
    localStorage.setItem('syncQueue', JSON.stringify(syncQueue));
    updateSyncBadgeUI(syncQueue.length);

    if (appSettings.auto_sync !== false) {
        setTimeout(() => { syncDataToServer(true); }, 2000);
    }
    return { status: "success", message: "បានរក្សាទុកក្នុងម៉ាស៊ីន (Offline Queue - នឹង Sync ពេលមានអ៊ីនធឺណិត)" };
  }
}

/**
 * មុខងារបញ្ជូនទិន្នន័យដែលនៅសល់ក្នុងបញ្ជីរង់ចាំ (Queue) ទៅកាន់ Google Sheet
 */
async function syncDataToServer(isSilent = false) {
  let syncQueue = JSON.parse(localStorage.getItem('syncQueue') || '[]');
  if (syncQueue.length === 0) {
      if(!isSilent) {
          if(typeof showToast === 'function') showToast("✅ គ្មានទិន្នន័យថ្មីត្រូវបញ្ជូនទេ!");
          else alert("✅ គ្មានទិន្នន័យថ្មីត្រូវបញ្ជូនទេ!");
      }
      return;
  }

  const btn = document.getElementById("btnSyncData");
  const originalHtml = btn ? btn.innerHTML : "Sync";
  if (btn && !isSilent) btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> កំពុងបញ្ជូន...`;

  try {
    let failedQueue = [];

    for (let i = 0; i < syncQueue.length; i++) {
      const task = syncQueue[i];
      
      try {
          const currentScriptUrl = window.getScriptUrl();
          const res = await fetch(currentScriptUrl, { 
            method: "POST", 
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(task.requestBody) // បញ្ជូនអ្វីដែលបានចងក្រងទុករួចរាល់
          });
          
          const result = await res.json();
          if (result.status !== "success") {
             console.error(`Task [${task.action}] failed response:`, result);
             throw new Error(result.message);
          }
      } catch (reqErr) {
          console.warn(`Task [${task.action}] fetch failed:`, reqErr);
          failedQueue.push(task); 
      }
    }
    
    // រក្សាទុកតែទិន្នន័យដែលបរាជ័យ
    localStorage.setItem('syncQueue', JSON.stringify(failedQueue));
    updateSyncBadgeUI(failedQueue.length);
    
    if(failedQueue.length === 0) {
        if(!isSilent && typeof showToast === 'function') showToast("☁️ ទិន្នន័យត្រូវបាន Sync ទៅកាន់ Cloud ជោគជ័យ ១០០%!");
    } else {
        if(!isSilent && typeof showToast === 'function') showToast(`⚠️ នៅសល់ទិន្នន័យ ${failedQueue.length} មិនទាន់អាចបញ្ជូនបាន។`, true);
    }

  } catch (error) { 
    console.error("Global Sync Error:", error);
    if(!isSilent && typeof showToast === 'function') showToast("បរាជ័យក្នុងការធ្វើសមកាលកម្ម! សូមពិនិត្យអ៊ីនធឺណិត។", true);
  } finally { 
    if (btn && !isSilent) btn.innerHTML = originalHtml; 
  }
}

// មុខងារសម្អាត LocalStorage និងធ្វើបច្ចុប្បន្នភាពទំព័រ
window.clearLocalCacheWithConfirm = function() {
  if(confirm("⚠️ តើលោកគ្រូ/អ្នកគ្រូពិតជាចង់លុបទិន្នន័យបណ្តោះអាសន្ន (Cache) មែនទេ?\n\nបញ្ជាក់៖ ប្រព័ន្ធនឹងទាញយកទិន្នន័យថ្មីពី Cloud មកវិញ (ទិន្នន័យដែលមិនទាន់ Sync នឹងត្រូវបាត់បង់)។")) {
      Object.keys(localStorage).forEach(key => { 
        if (key.startsWith('cache_') || key === 'syncQueue' || key === 'academic_students' || key === 'exam_scores_data') {
            localStorage.removeItem(key); 
        }
      });
      if(typeof showToast === 'function') showToast("🧹 បានសម្អាត Cache ដោយជោគជ័យ!");
      setTimeout(() => location.reload(), 1500);
  }
};

/**
 * មុខងារតេស្តការតភ្ជាប់ទៅកាន់ Google Apps Script
 */
window.testGoogleAppsScriptConnection = async function(customUrl) {
  const targetUrl = customUrl || window.getScriptUrl();
  if (!targetUrl || !targetUrl.startsWith("http")) {
    return { ok: false, message: "URL មិនត្រឹមត្រូវ" };
  }
  try {
    const auth = (typeof getAuthCredentials === 'function') ? getAuthCredentials() : { teacher_id: "TCH-001", academic_year: "2026-2027" };
    
    // សាកល្បង action=testConnection ជាមុន
    try {
      const u1 = new URL(targetUrl);
      u1.searchParams.append("action", "testConnection");
      u1.searchParams.append("teacher_id", auth.teacher_id);
      u1.searchParams.append("academic_year", auth.academic_year);
      const res1 = await fetch(u1.toString(), { method: 'GET' });
      const json1 = await res1.json();
      if (json1 && json1.status === "success") {
        return { ok: true, message: json1.message || "ការតភ្ជាប់បានជោគជ័យ!", data: json1 };
      }
    } catch(e1) {}

    // Fallback: សាកល្បង action=getSettings ជាមួយ teacher_id
    const u2 = new URL(targetUrl);
    u2.searchParams.append("action", "getSettings");
    u2.searchParams.append("teacher_id", auth.teacher_id);
    u2.searchParams.append("academic_year", auth.academic_year);
    const res2 = await fetch(u2.toString(), { method: 'GET' });
    const json2 = await res2.json();
    if (json2 && (json2.status === "success" || json2.data !== undefined)) {
      return { ok: true, message: "ការតភ្ជាប់ទៅកាន់ Google Apps Script បានជោគជ័យ (Connected)!", data: json2 };
    }

    return { ok: false, message: (json2 && json2.message) || "ការតភ្ជាប់បរាជ័យ" };
  } catch (e) {
    return { ok: false, message: "មិនអាចតភ្ជាប់បានទេ: " + e.message };
  }
};

/**
 * មុខងារបញ្ជាបង្កើតតារាងស្តង់ដារទាំងអស់លើ Google Sheet ពីចម្ងាយ
 */
window.setupGoogleAppsScriptSheets = async function(customUrl) {
  const targetUrl = customUrl || window.getScriptUrl();
  try {
    const u = new URL(targetUrl);
    u.searchParams.append("action", "setupSheets");
    const res = await fetch(u.toString(), { method: 'GET' });
    const json = await res.json();
    return json;
  } catch (e) {
    return { status: "error", message: e.message };
  }
};

function updateSyncBadgeUI(count) {
  const badge = document.getElementById("syncBadgeCount");
  const syncBtn = document.getElementById("btnSyncData");
  
  if (badge) { 
    badge.textContent = count; 
  }
  if (syncBtn) {
    if (count > 0) syncBtn.classList.remove("hidden");
    else syncBtn.classList.add("hidden");
  }
}

// =========================================================
// ៣. មុខងារបោះពុម្ពស្តង់ដារកម្រិតខ្ពស់ (Universal CMS Print Manager)
// =========================================================
// =========================================================================
// បន្ទាត់ក្បាច់ស្តង់ដារ ជាតិ សាសនា ព្រះមហាក្សត្រ (Standard Cambodian Header Flourish)
// =========================================================================
window.CMS_HEADER_SYMBOL_B64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJUAAAAMCAYAAABry//EAAAClklEQVR4nO1XQUtVURB+/2CWQ0ZC4WqUtLUSKTwRwxsaz1UUhItaCD4xUDdiYYtaKj4jQ9sEtQg3raJwIf2Bclk7E40U99LzDnwHh8O5l1v4svB8MLxzz8ycc+7MN3PPK5UiIiIiIk4ZxMLEMk8sD3P0o8Tynli2iaXq6TudP7F0mXnB/Hf4vSaWpow9bsEuacArRpwEkOiuAqYuoXXIhdIxkWYd0UCIupEdYjkPslWJZZBYbhDLB2JZJJYxz15lAz667gKxtJkzfIbNj4JndoRtw3P/HwfrrCOPLGlSZjQxGGvSPhLLZWK5bmQeOpUBzNWI5SuxTJeOCXVoyPAG83vEskos94zuJrG0g0i6zkVi2YTuPrEMp0R9oetjjS2PaDXMXyGWyfS8b9HVQvIF+yzgvdT/GrG0Ynw1Iy79SuRG5uW/RaijePqEWJ6CLNo5hjBOjAwasXND6DS3ieVXoMto8nq8/SyBnd1S2o2eE8snz7bZ+WTIrnaptPP9JJZ9YlkjluWAPIMoyQ7gt+PITyx3vCJ6ZfbYNKR0MmaKq9HSGkpq51/aPEtqJkDjgWBoQB+DHAmekwJSxdo1kGI/kPRurHfOxKKOLjVn7CopAde9T6naDuSQagWEqYCQjjwTXhFYGYHvFLqjji95+WpCPOohfQSAwPdm6LTqds1YK7M50K2cPAKR1tElHpi1NkwyXuqnxTzb+9WcPZf5LK2au5cthIp5fmf2swXjSLVkyO7LOGxHQJ7lnJiVTzwRZwl6N8GvXoi7C/rYam43844oHRkdpgUE08v5XRBV/8H1wX8t4NOjSfYLwxD122+8ayTLvwxieaIX8Bx9BRfuFUcao+tw3S/gV8ZlfbjAGcquKCIiIiIiThtH7PZ3/jFJD4YAAAAASUVORK5CYII=";
window.CMS_HEADER_SYMBOL_HTML = `<img src="${window.CMS_HEADER_SYMBOL_B64}" class="header-flourish-symbol" alt="symbol" style="display: block; margin: 4px auto 0 auto; width: 135px; height: 11px; object-fit: contain;" />`;

window.CMSPrintManager = {
    HEADER_SYMBOL_B64: window.CMS_HEADER_SYMBOL_B64,
    getHeaderSymbolHtml: function() {
        return window.CMS_HEADER_SYMBOL_HTML;
    },
    // បោះពុម្ព Element ឬ ID ណាមួយ ជាមួយជម្រើសទំហំក្រដាស ទិសដៅ និងមាត្រដ្ឋាន (Scale)
    print: function(elementOrId, options = {}) {
        const target = typeof elementOrId === 'string' ? document.getElementById(elementOrId) : elementOrId;
        if (!target) {
            console.error("Print target not found:", elementOrId);
            if (typeof showToast === 'function') showToast("រកមិនឃើញផ្ទាំងសម្រាប់បោះពុម្ពទេ!", "error");
            else alert("រកមិនឃើញផ្ទាំងសម្រាប់បោះពុម្ពទេ!");
            return;
        }

        const paperSize = options.paperSize || 'A4';
        const orientation = options.orientation || 'portrait';
        const scale = options.scale ? parseInt(options.scale, 10) : 100;
        const margin = options.margin || (paperSize === 'A3' ? '10mm' : '6mm');
        const title = options.title || document.title || "បោះពុម្ពឯកសារ";

        let oldIframe = document.getElementById("cms_print_frame_helper");
        if (oldIframe) oldIframe.remove();

        const iframe = document.createElement("iframe");
        iframe.id = "cms_print_frame_helper";
        iframe.style.position = "fixed";
        iframe.style.top = "0";
        iframe.style.left = "0";
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.style.border = "none";
        iframe.style.zIndex = "-9999";
        iframe.style.opacity = "0.01";
        iframe.style.pointerEvents = "none";
        document.body.appendChild(iframe);

        const clone = target.cloneNode(true);
        // ដកចេញប៊ូតុង និងផ្ទាំងដែលមិនចាំបាច់ពេល print (.no-print)
        clone.querySelectorAll(".no-print").forEach(el => el.remove());

        // បម្លែង input, select, textarea ទៅជាអត្ថបទច្បាស់លាស់
        const origInputs = target.querySelectorAll("input, select, textarea");
        const cloneInputs = clone.querySelectorAll("input, select, textarea");
        origInputs.forEach((inp, idx) => {
            if (cloneInputs[idx]) {
                const span = document.createElement("span");
                if (inp.tagName === "SELECT") {
                    span.textContent = inp.options[inp.selectedIndex]?.text || "";
                } else {
                    span.textContent = inp.value || "";
                }
                span.style.cssText = "font-weight:bold; display:inline-block; text-align:center; padding: 2px 4px;";
                cloneInputs[idx].parentNode.replaceChild(span, cloneInputs[idx]);
            }
        });

        // សម្អាត Shadow, Border, និង Background របស់ App ឱ្យនៅសល់តែក្រដាសឯកសារសុទ្ធសាធ
        if (clone.style) {
            clone.style.boxShadow = "none";
            clone.style.border = "none";
            clone.style.borderRadius = "0";
            clone.style.margin = "0 auto";
            clone.style.background = "white";
        }
        if (clone.firstElementChild && clone.firstElementChild.style) {
            clone.firstElementChild.style.boxShadow = "none";
            clone.firstElementChild.style.border = "none";
            clone.firstElementChild.style.borderRadius = "0";
        }

        // ចម្លង Stylesheet ទាំងអស់ពី App ដើម្បីឱ្យទម្រង់អក្សរ និងតារាងចេញមកស្អាត ១០០%
        const parentStyles = (typeof document.querySelectorAll === 'function')
            ? Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
                .map(el => el.outerHTML || '')
                .join('\n')
            : '';

        const contentHtml = clone.outerHTML || clone.innerHTML || '';

        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write(`
            <!DOCTYPE html>
            <html lang="km">
            <head>
                <meta charset="UTF-8">
                <title>${title}</title>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Moul&family=Siemreap&display=swap" rel="stylesheet">
                ${parentStyles}
                <style>
                    @page {
                        size: ${paperSize} ${orientation};
                        margin: ${margin};
                    }
                    * {
                        box-sizing: border-box !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }
                    html, body {
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                        color: #0f172a !important;
                        font-family: 'Siemreap', sans-serif !important;
                    }
                    .font-moul { font-family: 'Moul', serif !important; }
                    .font-siemreap { font-family: 'Siemreap', sans-serif !important; }
                    .no-print { display: none !important; }
                    table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                        page-break-inside: auto !important;
                    }
                    tr {
                        page-break-inside: avoid !important;
                        page-break-after: auto !important;
                    }
                    thead { display: table-header-group !important; }
                    tfoot { display: table-footer-group !important; }
                    
                    /* Scale / Zoom Support */
                    .cms-print-container {
                        width: 100%;
                        margin: 0 auto;
                        zoom: ${scale / 100};
                    }
                    @supports not (zoom: 1) {
                        .cms-print-container {
                            transform: scale(${scale / 100});
                            transform-origin: top center;
                            width: ${scale < 100 ? (100 / (scale / 100)) + '%' : '100%'};
                        }
                    }
                </style>
            </head>
            <body>
                <div class="cms-print-container">
                    ${contentHtml}
                </div>
            </body>
            </html>
        `);
        doc.close();

        setTimeout(() => {
            try {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();
            } catch (err) {
                console.warn("Iframe print fallback triggered:", err);
                window.print();
            }
        }, 400);
    },

    // Toolbar អន្តរកម្មសម្រាប់កំណត់ប្រភេទក្រដាស និងមាត្រដ្ឋាន (ដាក់នៅលើរបារ Title Bar)
    renderToolbarHtml: function(targetElementId, defaultOrientation = 'landscape', defaultPaper = 'A4', defaultScale = 100) {
        return `
            <div class="flex flex-wrap items-center gap-1.5 sm:gap-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 sm:px-3 py-1.5 shadow-sm text-xs no-print">
                <i class="fa-solid fa-sliders text-indigo-600 dark:text-indigo-400"></i>
                <span class="font-bold text-slate-500">ក្រដាស៖</span>
                <select id="print_paper_${targetElementId}" onchange="window.CMSPrintManager.applyLivePreview('${targetElementId}')" class="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1 font-bold text-slate-700 dark:text-white outline-none cursor-pointer">
                    <option value="A4" ${defaultPaper === 'A4' ? 'selected' : ''}>A4</option>
                    <option value="A3" ${defaultPaper === 'A3' ? 'selected' : ''}>A3 (ទំហំធំ)</option>
                    <option value="Letter" ${defaultPaper === 'Letter' ? 'selected' : ''}>Letter</option>
                    <option value="Legal" ${defaultPaper === 'Legal' ? 'selected' : ''}>Legal</option>
                </select>

                <span class="font-bold text-slate-500 ml-1">ទិស៖</span>
                <select id="print_orient_${targetElementId}" onchange="window.CMSPrintManager.applyLivePreview('${targetElementId}')" class="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1 font-bold text-indigo-600 dark:text-indigo-400 outline-none cursor-pointer">
                    <option value="landscape" ${defaultOrientation === 'landscape' ? 'selected' : ''}>ផ្តេក (Landscape)</option>
                    <option value="portrait" ${defaultOrientation === 'portrait' ? 'selected' : ''}>បញ្ឈរ (Portrait)</option>
                </select>

                <span class="font-bold text-slate-500 ml-1">មាត្រដ្ឋាន (Scale)៖</span>
                <select id="print_scale_${targetElementId}" onchange="window.CMSPrintManager.applyLivePreview('${targetElementId}')" class="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1 font-bold text-rose-600 dark:text-rose-400 outline-none cursor-pointer">
                    <option value="120" ${defaultScale === 120 ? 'selected' : ''}>120%</option>
                    <option value="110" ${defaultScale === 110 ? 'selected' : ''}>110%</option>
                    <option value="100" ${defaultScale === 100 ? 'selected' : ''}>100% (ធម្មតា)</option>
                    <option value="90" ${defaultScale === 90 ? 'selected' : ''}>90% (សន្សំ)</option>
                    <option value="80" ${defaultScale === 80 ? 'selected' : ''}>80% (សន្សំ)</option>
                    <option value="75" ${defaultScale === 75 ? 'selected' : ''}>75% (បង្រួម)</option>
                </select>

                <button onclick="window.CMSPrintManager.executePrintWithToolbar('${targetElementId}')" class="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow flex items-center gap-1.5 ml-1 sm:ml-2 transition active:scale-95">
                    <i class="fa-solid fa-print"></i> <span>ព្រីន (Print)</span>
                </button>
            </div>
        `;
    },

    updateToolbarDefaults: function(targetElementId, defaultOrientation = 'landscape', defaultPaper = 'A4', defaultScale = 100) {
        const pEl = document.getElementById(`print_paper_${targetElementId}`);
        const oEl = document.getElementById(`print_orient_${targetElementId}`);
        const sEl = document.getElementById(`print_scale_${targetElementId}`);
        if (pEl && defaultPaper) pEl.value = defaultPaper;
        if (oEl && defaultOrientation) oEl.value = defaultOrientation;
        if (sEl && defaultScale) sEl.value = String(defaultScale);
        this.applyLivePreview(targetElementId);
    },

    applyLivePreview: function(targetElementId) {
        const target = document.getElementById(targetElementId);
        if (!target) return;
        const orient = document.getElementById(`print_orient_${targetElementId}`)?.value || 'landscape';
        const paper = document.getElementById(`print_paper_${targetElementId}`)?.value || 'A4';
        const scale = parseInt(document.getElementById(`print_scale_${targetElementId}`)?.value || 100, 10);

        const paperWrapper = target.firstElementChild || target;
        if (paperWrapper && paperWrapper.style) {
            const isLandscape = orient === 'landscape';
            if (paper === 'A4') {
                paperWrapper.style.maxWidth = isLandscape ? '297mm' : '210mm';
            } else if (paper === 'A3') {
                paperWrapper.style.maxWidth = isLandscape ? '420mm' : '297mm';
            }
            if (scale && scale !== 100) {
                target.style.transform = `scale(${scale / 100})`;
                target.style.transformOrigin = 'top center';
            } else {
                target.style.transform = '';
            }
        }
    },

    executePrintWithToolbar: function(targetElementId) {
        const paper = document.getElementById(`print_paper_${targetElementId}`)?.value || 'A4';
        const orient = document.getElementById(`print_orient_${targetElementId}`)?.value || 'landscape';
        const scale = document.getElementById(`print_scale_${targetElementId}`)?.value || 100;
        this.print(targetElementId, {
            paperSize: paper,
            orientation: orient,
            scale: parseInt(scale, 10)
        });
    },

    // ៤. មុខងារទាញយកទិន្នន័យបរិបទ និងកាលបរិច្ឆេទស្តង់ដារ (Standard Print Context & Dates)
    getStandardContext: function(custom = {}) {
        const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
        const districtName = (custom.districtName || sInfo.district || "កៀនស្វាយ").replace(/^ស្រុក\s*/, '').trim();
        const schoolName = custom.schoolName || sInfo.school_name || "សាលាបឋមសិក្សា ភ្នំ";
        const principalName = custom.principalName || sInfo.principal_name || "";
        const teacherName = custom.teacherName || (window.AuthState ? window.AuthState.teacherName : null) || localStorage.getItem('auth_teacher_name') || sInfo.teacher_name || "";
        const academicYear = custom.academicYear || document.getElementById("globalAcademicYear")?.value || localStorage.getItem('selected_academic_year') || sInfo.academic_year || "២០២៦-២០២៧";
        
        let grade = custom.grade;
        if (!grade) {
            const activeClass = typeof window.getCurrentSelectedClass === 'function' ? window.getCurrentSelectedClass() : null;
            if (activeClass && activeClass.level) {
                grade = `${activeClass.level} ${activeClass.room || ''}`.trim();
            } else if (sInfo.teacher_level) {
                grade = `${sInfo.teacher_level} ${sInfo.teacher_room || ''}`.trim();
            } else {
                grade = "ថ្នាក់ទី ២ «ក»";
            }
        }

        let locShort = "";
        if (custom.location) {
            locShort = custom.location.replace(/^ធ្វើនៅ\s*/, '').replace(/,+$/, '').trim();
        } else {
            const rawLoc = document.getElementById('global_loc_input')?.value || localStorage.getItem('rc_location') || localStorage.getItem('rep_location');
            if (rawLoc) {
                locShort = rawLoc.replace(/^ធ្វើនៅ\s*/, '').replace(/,+$/, '').trim();
            } else {
                locShort = schoolName.replace(/^(សាលាបឋមសិក្សា|អនុវិទ្យាល័យ|វិទ្យាល័យ|សាលា)\s*/g, '').trim();
                if (!locShort) locShort = districtName || "ភ្នំ";
            }
        }

        let sDate = "";
        if (custom.solarDate) {
            sDate = custom.solarDate.trim();
        } else {
            const rawDate = document.getElementById('global_sol_input')?.value || localStorage.getItem('rc_solar_date') || localStorage.getItem('rep_solar_date');
            if (rawDate && rawDate.trim()) {
                sDate = rawDate.trim();
            } else {
                sDate = "ថ្ងៃទី.......ខែ..........ឆ្នាំ២០២៦";
            }
        }
        if (sDate.includes("ថ្ងៃទី")) sDate = sDate.substring(sDate.indexOf("ថ្ងៃទី"));

        const solarDateStr = `ធ្វើនៅ ${locShort}, ${sDate}`;

        let lunarDateStr = "";
        let isLunarChecked = true;
        const chkBox = document.getElementById('global_lun_chk');
        if (chkBox) isLunarChecked = chkBox.checked;
        else isLunarChecked = (localStorage.getItem('rc_show_lunar') !== 'false' && localStorage.getItem('rep_show_lunar') !== 'false');

        if (custom.lunarDate) {
            lunarDateStr = custom.lunarDate.trim();
        } else if (isLunarChecked) {
            const rawLun = document.getElementById('global_lun_input')?.value || localStorage.getItem('rc_lunar_date') || localStorage.getItem('rep_lunar_date');
            if (rawLun && rawLun.trim()) {
                lunarDateStr = rawLun.trim();
            } else {
                lunarDateStr = "ថ្ងៃ....................ខែ..................ឆ្នាំ...............ព.ស.២៥៧០";
            }
        }

        return {
            districtName,
            schoolName,
            principalName,
            teacherName,
            academicYear,
            grade,
            solarDateStr,
            lunarDateStr
        };
    },

    // ៥. ទម្រង់ក្បាលលិខិតស្តង់ដារ (Standard Letterhead Header ដូចរូបគំរូ)
    getHeaderHtml: function(ctx) {
        return `
            <div class="header-box" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; width: 100%;">
              <div class="header-left" style="text-align: left; line-height: 1.6;">
                <p style="margin: 0 0 4px 0; font-size: 10.5pt; font-family: 'Khmer OS Muol Light', 'Moul', serif; color: #0f172a;">ការិយាល័យ អប់រំ យុវជននិងកីឡានៃរដ្ឋបាលស្រុក ${ctx.districtName}</p>
                <p style="margin: 0; font-size: 10.5pt; font-family: 'Khmer OS Muol Light', 'Moul', serif; color: #0f172a;">${ctx.schoolName}</p>
              </div>
              <div class="header-right" style="text-align: center; line-height: 1.6;">
                <p style="margin: 0 0 4px 0; font-size: 11pt; font-family: 'Khmer OS Muol Light', 'Moul', serif; color: #0f172a;">ព្រះរាជាណាចក្រកម្ពុជា</p>
                <p style="margin: 0; font-size: 10.5pt; font-family: 'Khmer OS Muol Light', 'Moul', serif; color: #0f172a;">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                <img src="${window.CMS_HEADER_SYMBOL_B64}" class="header-flourish-symbol" alt="symbol" style="display: block; margin: 4px auto 0 auto; width: 135px; height: 11px; object-fit: contain;" />
              </div>
            </div>
        `;
    },

    // ៦. ទម្រង់ចំណងជើងឯកសារស្តង់ដារ (Standard Document Title ដូចរូបគំរូ)
    getTitleHtml: function(titleText, academicYear, grade = "") {
        const gradePart = grade ? `${grade} | ` : "";
        return `
            <div class="title-box" style="text-align: center; margin: 8px 0 14px 0;">
              <h2 style="margin: 0 0 4px 0; font-size: 14pt; color: #1e3a8a; letter-spacing: 0.5px; font-family: 'Khmer OS Muol Light', 'Moul', serif;">${titleText}</h2>
              <p style="margin: 0; font-size: 11pt; color: #dc2626; font-family: 'Khmer OS Muol Light', 'Moul', serif;">${gradePart}ឆ្នាំសិក្សា ${academicYear}</p>
            </div>
        `;
    },

    // ៧. ទម្រង់ហត្ថលេខា និងកាលបរិច្ឆេទខាងក្រោមស្តង់ដារ (Standard Signatures & Dates ដូចរូបគំរូ)
    getFooterHtml: function(ctx, customRoleLeft = "នាយក/នាយិកាសាលា", customRoleRight = "គ្រូបន្ទុកថ្នាក់", middleColHtml = "") {
        return `
            <div class="bottom-sig-container" style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%; page-break-inside: avoid; padding: 0 20px; margin-top: 15px;">
                <div class="sig-box-left" style="width: 40%; text-align: center;">
                    <p style="margin: 0 0 4px 0; font-size: 11pt; font-family: 'Siemreap', sans-serif; color: #000;">បានឃើញ និងឯកភាព</p>
                    <p style="margin: 0 0 55px 0; font-size: 11pt; font-family: 'Khmer OS Muol Light', 'Moul', serif; color: #000;">${customRoleLeft}</p>
                    <p style="margin: 0; font-size: 11pt; font-family: 'Khmer OS Muol Light', 'Moul', serif; color: #000;">${ctx.principalName || ''}</p>
                </div>
                ${middleColHtml}
                <div class="sig-box-right" style="width: 40%; text-align: center;">
                    <p style="margin: 0 0 4px 0; font-size: 11pt; font-family: 'Siemreap', sans-serif; color: #000;">${ctx.lunarDateStr || 'ថ្ងៃ....................ខែ..................ឆ្នាំ...............ព.ស.២៥៧០'}</p>
                    <p style="margin: 0 0 6px 0; font-size: 11pt; font-family: 'Siemreap', sans-serif; color: #000;">${ctx.solarDateStr}</p>
                    <p style="margin: 0 0 55px 0; font-size: 11pt; font-family: 'Khmer OS Muol Light', 'Moul', serif; color: #000;">${customRoleRight}</p>
                    <p style="margin: 0; font-size: 11pt; font-family: 'Khmer OS Muol Light', 'Moul', serif; color: #000;">${ctx.teacherName || ''}</p>
                </div>
            </div>
        `;
    },

    // ៨. ផ្ទាំង Universal Print Preview Window ជាមួយ Toolbar សារ៉េក្រដាស និងទំហំ Zoom (ដូចរូបបញ្ជីស្រង់ពិន្ទុ)
    openUniversalPreview: function(options = {}) {
        const ctx = this.getStandardContext(options);
        const titleText = options.title || "ឯកសារបោះពុម្ព";
        const paperSize = options.paperSize || "A4";
        const orientation = options.orientation || "landscape";
        const defaultZoom = options.defaultZoom || 1.0;
        const extraStyles = options.extraStyles || "";
        
        // ពិនិត្យមើលថាតើ Content ខាងក្នុងមាន Header/Footer រួចហើយ ឬត្រូវការចាក់បញ្ចូលស្វ័យប្រវត្តិ
        let bodyContent = options.contentHtml || "";
        if (options.autoWrapHeaderFooter !== false && !options.fullHtml) {
            const headerHtml = options.headerHtml || this.getHeaderHtml(ctx);
            const titleHtml = options.titleHtml || this.getTitleHtml(titleText, ctx.academicYear, ctx.grade);
            const footerHtml = options.footerHtml || this.getFooterHtml(ctx, options.roleLeft || "នាយក/នាយិកាសាលា", options.roleRight || "គ្រូបន្ទុកថ្នាក់", options.middleColHtml || "");
            bodyContent = `
                ${headerHtml}
                ${titleHtml}
                ${bodyContent}
                ${footerHtml}
            `;
        }

        const isLandscape = orientation === 'landscape';
        let defaultWidth = isLandscape ? '297mm' : '210mm';
        if (paperSize === 'A3') defaultWidth = isLandscape ? '420mm' : '297mm';
        else if (paperSize === 'Legal') defaultWidth = isLandscape ? '14in' : '8.5in';
        else if (paperSize === 'Letter') defaultWidth = isLandscape ? '11in' : '8.5in';

        const printDocument = `
          <!DOCTYPE html>
          <html lang="km">
          <head>
            <meta charset="utf-8">
            <title>${titleText} - ${ctx.grade}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <style id="dynamic-page-style">
              @page { size: ${paperSize} ${orientation}; margin: 6mm; }
            </style>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Moul&family=Siemreap:wght@400;700&display=swap');
              * { box-sizing: border-box !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; font-family: 'Siemreap', sans-serif; }
              html, body { margin: 0; padding: 0; background: #f1f5f9; color: #000; min-height: 100vh; }
              .font-moul { font-family: 'Khmer OS Muol Light', 'Moul', serif !important; font-weight: normal; }
              
              /* ផ្ទាំងបញ្ជា (Toolbar) សម្រាប់សារ៉េក្រដាស និងទំហំ Zoom មុនពេលព្រីន */
              .print-toolbar { position: fixed; top: 0; left: 0; right: 0; z-index: 9999; background: white; padding: 12px 20px; border-bottom: 1px solid #cbd5e1; box-shadow: 0 4px 15px rgba(0,0,0,0.05); display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 20px; }
              body { padding-top: 70px; } /* ទុកចន្លោះឱ្យ Toolbar */
              
              @media print {
                  .no-print { display: none !important; }
                  body { background: #fff; padding-top: 0 !important; }
                  #print-wrapper { margin: 0 !important; box-shadow: none !important; border-radius: 0 !important; width: 100% !important; height: auto !important; padding: 0 !important; }
              }
              
              /* ការកំណត់ប្រអប់ក្រដាស (Print Wrapper) ឱ្យស្គាល់ខ្នាតទំហំថេរ */
              #print-wrapper { 
                  padding: 10mm; 
                  width: ${defaultWidth}; 
                  min-height: 210mm;
                  margin: 20px auto; 
                  background: white; 
                  box-shadow: 0 10px 30px rgba(0,0,0,0.1); 
                  border-radius: 8px; 
                  overflow: hidden;
              }

              /* Content Scaler សម្រាប់ Zoom អត្ថបទ និងតារាង */
              #content-scaler {
                  width: 100%;
                  transform-origin: top left;
                  zoom: ${defaultZoom};
              }
              
              .header-box { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; width: 100%; color: #000c58; }
              .header-left { text-align: left; }
              .header-left p { margin: 0 0 3px 0; font-size: 11pt; line-height: 1.5; font-family: 'Khmer OS Muol Light', 'Moul', serif; }
              .header-right { text-align: center; }
              .header-right p { margin: 0 0 3px 0; font-size: 11pt; line-height: 1.5; font-family: 'Khmer OS Muol Light', 'Moul', serif; }
              .title-box { text-align: center; margin: 5px 0 10px 0; }
              .title-box h2 { margin: 0 0 4px 0; font-size: 14pt; color: #000b51; letter-spacing: 0.5px; font-family: 'Khmer OS Muol Light', 'Moul', serif; }
              .title-box p { margin: 0; font-size: 11pt; color: #ff0000; font-weight: normal; font-family: 'Khmer OS Muol Light', 'Moul', serif; }
              
              .bottom-sig-container { display: flex; justify-content: space-between; align-items: flex-start; width: 100%; page-break-inside: avoid; padding: 0 30px; margin-top: 15px; }
              .sig-box-left { width: 40%; text-align: center; }
              .sig-box-right { width: 40%; text-align: center; }

              ${extraStyles}
            </style>
          </head>
          <body>
            <!-- ផ្ទាំងបញ្ជា (Toolbar) -->
            <div class="no-print print-toolbar font-siemreap">
                <div class="flex items-center gap-2">
                    <span class="font-bold text-sm text-slate-700"><i class="fa-solid fa-file text-slate-400"></i> ទំហំក្រដាស៖</span>
                    <select id="paperSize" onchange="updateSettings()" class="bg-slate-50 border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 outline-none font-bold cursor-pointer">
                        <option value="A4" ${paperSize === 'A4' ? 'selected' : ''}>A4</option>
                        <option value="A3" ${paperSize === 'A3' ? 'selected' : ''}>A3</option>
                        <option value="Legal" ${paperSize === 'Legal' ? 'selected' : ''}>Legal</option>
                        <option value="Letter" ${paperSize === 'Letter' ? 'selected' : ''}>Letter</option>
                    </select>
                </div>
                <div class="w-px h-6 bg-slate-300"></div>
                <div class="flex items-center gap-2">
                    <span class="font-bold text-sm text-slate-700"><i class="fa-solid fa-rotate text-slate-400"></i> ទិសដៅ៖</span>
                    <select id="paperOrientation" onchange="updateSettings()" class="bg-slate-50 border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 outline-none font-bold cursor-pointer">
                        <option value="landscape" ${orientation === 'landscape' ? 'selected' : ''}>ផ្តេក (Landscape)</option>
                        <option value="portrait" ${orientation === 'portrait' ? 'selected' : ''}>បញ្ឈរ (Portrait)</option>
                    </select>
                </div>
                <div class="w-px h-6 bg-slate-300"></div>
                <div class="flex items-center gap-2">
                    <span class="font-bold text-sm text-slate-700"><i class="fa-solid fa-magnifying-glass text-slate-400"></i> ទំហំអត្ថបទ (Zoom)៖</span>
                    <input type="range" id="zoomLevel" min="0.4" max="1.5" step="0.01" value="${defaultZoom}" oninput="updateSettings()" class="w-32 cursor-pointer">
                    <span id="zoomDisplay" class="font-mono text-sm font-bold text-blue-600 w-12 bg-blue-50 py-1 rounded text-center">${Math.round(defaultZoom * 100)}%</span>
                </div>
                <div class="w-px h-6 bg-slate-300"></div>
                <button onclick="window.print()" class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-md transition flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                    ព្រីនឥឡូវនេះ
                </button>
            </div>

            <div id="print-wrapper">
              <div id="content-scaler">
                ${bodyContent}
              </div>
            </div>

            <script>
                function updateSettings() {
                    const size = document.getElementById('paperSize').value;
                    const orientation = document.getElementById('paperOrientation').value;
                    const zoom = document.getElementById('zoomLevel').value;
                    
                    document.getElementById('dynamic-page-style').innerHTML = '@page { size: ' + size + ' ' + orientation + '; margin: 6mm; }';
                    
                    let wrapperWidth = "297mm";
                    if (orientation === 'landscape') {
                        if (size === 'A4') wrapperWidth = '297mm';
                        else if (size === 'A3') wrapperWidth = '420mm';
                        else if (size === 'Legal') wrapperWidth = '14in';
                        else if (size === 'Letter') wrapperWidth = '11in';
                    } else {
                        if (size === 'A4') wrapperWidth = '210mm';
                        else if (size === 'A3') wrapperWidth = '297mm';
                        else if (size === 'Legal') wrapperWidth = '8.5in';
                        else if (size === 'Letter') wrapperWidth = '8.5in';
                    }
                    
                    document.getElementById('print-wrapper').style.width = wrapperWidth;
                    document.getElementById('content-scaler').style.zoom = zoom;
                    document.getElementById('zoomDisplay').innerText = Math.round(zoom * 100) + '%';
                }
            <\/script>
          </body>
          </html>
        `;

        if (typeof window.open === 'function') {
            try {
                const printWin = window.open('', '_blank');
                if (printWin && printWin.document) {
                    printWin.document.open();
                    printWin.document.write(printDocument);
                    printWin.document.close();
                    return;
                }
            } catch(e) {
                console.warn("window.open failed, fallback to print:", e);
            }
        }
        
        // Fallback ប្រសិនបើ Pop-up ត្រូវបានបិទ (Iframe Printing)
        this.print(document.body, { title: titleText, paperSize, orientation });
    }
};

window.printSpecificSheet = function(elementId, orientation = 'landscape') {
    window.CMSPrintManager.print(elementId, { orientation });
};

// =========================================================================
// ៥. GOOGLE SHEETS LIVE SYNC & CLASSROOM MANAGEMENT (Teacher Self-Managed)
// =========================================================================

window.syncAllExistingDataToGoogleSheets = async function(btnElement) {
    const btn = btnElement || document.getElementById("btnHeaderSyncSheet");
    const origHtml = btn ? btn.innerHTML : "";
    if (btn) {
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>កំពុង Sync ទៅ Sheets...</span>`;
        btn.disabled = true;
    }

    try {
        const students = window.getMasterStudents();
        let scores = [];
        let attendance = [];
        let library = [];

        try { scores = JSON.parse(localStorage.getItem('academic_scores') || '[]'); } catch(e) {}
        try { attendance = JSON.parse(localStorage.getItem('academic_attendance') || '[]'); } catch(e) {}
        try { library = JSON.parse(localStorage.getItem('academic_library') || '[]'); } catch(e) {}

        const currentClass = window.getCurrentSelectedClass();
        const teacherId = localStorage.getItem('auth_teacher_id') || "TCH-001";
        const teacherName = localStorage.getItem('auth_teacher_name') || "លោកគ្រូ អ្នកគ្រូ";
        const academicYear = document.getElementById("globalAcademicYear")?.value || localStorage.getItem('selected_academic_year') || "2026-2027";

        // ១. ព្យាយាម Sync ទាំងអស់ក្នុងពេលតែមួយ (Master Bulk Sync)
        let masterSyncSuccess = false;
        try {
            const masterRes = await window.apiPost("syncAll", {
                class: {
                    class_id: `CLS-${currentClass.level}-${currentClass.room}`,
                    grade: currentClass.level,
                    room: currentClass.room,
                    teacher_id: teacherId,
                    teacher_name: teacherName,
                    academic_year: academicYear
                },
                students: students || [],
                scores: scores || [],
                attendance: attendance || [],
                library: library || []
            });
            if (masterRes && masterRes.status === "success") {
                masterSyncSuccess = true;
            }
        } catch(e) {
            console.warn("syncAll note, falling back to batch endpoints:", e);
        }

        if (!masterSyncSuccess) {
            // Fallback ទៅកាន់ Endpoint ដាច់ដោយឡែក
            try {
                await window.apiPost("saveClass", {
                    class_id: `CLS-${currentClass.level}-${currentClass.room}`,
                    grade: currentClass.level,
                    room: currentClass.room,
                    teacher_id: teacherId,
                    teacher_name: teacherName,
                    academic_year: academicYear
                });
            } catch(e) {
                console.warn("saveClass notice:", e);
            }

            if (students && students.length > 0) {
                await window.apiPost("saveStudentsBatch", students);
            }

            if (scores && scores.length > 0) {
                await window.apiPost("saveScoresBatch", scores);
            }

            if (attendance && attendance.length > 0) {
                await window.apiPost("saveAttendanceBatch", attendance);
            }

            if (library && library.length > 0) {
                try {
                    await window.apiPost("saveLibraryBatch", library);
                } catch(e) {
                    await window.apiPost("saveLibrary", { data: library });
                }
            }
        }

        const msg = `✅ បាន Sync ទិន្នន័យដែលមានទាំងអស់ (សិស្ស ${students.length} នាក់) ទៅកាន់ Google Sheet ដោយជោគជ័យ!`;
        if (typeof showToast === 'function') showToast(msg);
        else alert(msg);

    } catch (err) {
        console.error("Full Google Sheet Sync Error:", err);
        const errMsg = `⚠️ ការបញ្ជូនទៅ Google Sheet មានបញ្ហា: ${err.message || 'សូមពិនិត្យអ៊ីនធឺណិត'}`;
        if (typeof showToast === 'function') showToast(errMsg, "error");
        else alert(errMsg);
    } finally {
        if (btn) {
            btn.innerHTML = origHtml || `<i class="fa-solid fa-cloud-arrow-up"></i> <span>Google Sheet Sync</span>`;
            btn.disabled = false;
        }
    }
};

window.openManageClassModal = function() {
    const modal = document.getElementById("manageClassModal");
    if (!modal) return;
    const cur = window.getCurrentSelectedClass();
    const display = document.getElementById("modalCurClassDisplay");
    if (display) display.textContent = `បន្ទប់ ${cur.room || '«ក»'}`;

    const selGrade = document.getElementById("selManageGrade");
    const selRoom = document.getElementById("selManageRoom");
    if (selGrade) selGrade.value = cur.level || "ថ្នាក់ទី ១";
    if (selRoom) selRoom.value = cur.room || "«ក»";

    const customGradeInput = document.getElementById("inputCustomGrade");
    const customRoomInput = document.getElementById("inputCustomRoom");
    if (customGradeInput) customGradeInput.classList.add("hidden");
    if (customRoomInput) customRoomInput.classList.add("hidden");

    modal.classList.remove("hidden");
    modal.classList.add("flex");
};

window.closeManageClassModal = function() {
    const modal = document.getElementById("manageClassModal");
    if (modal) {
        modal.classList.add("hidden");
        modal.classList.remove("flex");
    }
};

window.handleGradeSelectChange = function(sel) {
    const customInput = document.getElementById("inputCustomGrade");
    if (!customInput) return;
    if (sel.value === "__custom__") {
        customInput.classList.remove("hidden");
        customInput.focus();
    } else {
        customInput.classList.add("hidden");
    }
};

window.handleRoomSelectChange = function(sel) {
    const customInput = document.getElementById("inputCustomRoom");
    if (!customInput) return;
    if (sel.value === "__custom__") {
        customInput.classList.remove("hidden");
        customInput.focus();
    } else {
        customInput.classList.add("hidden");
    }
};

window.handleSaveClassroom = async function(event) {
    if (event && event.preventDefault) event.preventDefault();
    
    let grade = document.getElementById("selManageGrade")?.value || "ថ្នាក់ទី ១";
    if (grade === "__custom__") {
        const val = document.getElementById("inputCustomGrade")?.value.trim();
        if (val) grade = val;
        else grade = "ថ្នាក់ទី ១";
    }
    
    let room = document.getElementById("selManageRoom")?.value || "«ក»";
    if (room === "__custom__") {
        const val = document.getElementById("inputCustomRoom")?.value.trim();
        if (val) room = val;
        else room = "«ក»";
    }

    // Set selected class across system
    window.setSelectedClass(grade, room);

    // Persist in Teacher Personal Settings
    const tId = localStorage.getItem('auth_teacher_id') || "TCH-001";
    if (typeof window.saveTeacherPersonalSettings === 'function') {
        window.saveTeacherPersonalSettings(tId, {
            teacher_level: grade,
            teacher_room: room
        }).catch(console.warn);
    } else {
        try {
            const raw = localStorage.getItem(`teacher_settings_${tId}`) || '{}';
            const parsed = JSON.parse(raw);
            parsed.teacher_level = grade;
            parsed.teacher_room = room;
            localStorage.setItem(`teacher_settings_${tId}`, JSON.stringify(parsed));
        } catch(e) {}
    }

    // Update Header Badge
    const badge = document.getElementById("headerActiveClassBadge");
    if (badge) badge.textContent = `${grade} ${room}`;

    // Update all dynamic dropdowns
    if (typeof window.updateAllClassDropdowns === 'function') {
        window.updateAllClassDropdowns();
    }

    // Notify all modules
    window.dispatchEvent(new CustomEvent('masterStudentsUpdated', { detail: window.getMasterStudents() }));

    // Send class info to Google Sheets
    if (typeof window.apiPost === 'function') {
        window.apiPost("saveClass", {
            class_id: `CLS-${grade}-${room}`,
            grade: grade,
            room: room,
            teacher_id: tId,
            teacher_name: localStorage.getItem('auth_teacher_name') || 'លោកគ្រូ អ្នកគ្រូ',
            academic_year: document.getElementById("globalAcademicYear")?.value || "2026-2027"
        }).catch(console.warn);
    }

    if (typeof showToast === 'function') {
        showToast(`🎉 បានកំណត់ថ្នាក់រៀន ${grade} ${room} ជាថ្នាក់ទទួលបន្ទុកជោគជ័យ!`);
    } else {
        alert(`🎉 បានកំណត់ថ្នាក់រៀន ${grade} ${room} ជាថ្នាក់ទទួលបន្ទុកជោគជ័យ!`);
    }

    window.closeManageClassModal();

    // Reload current active view to show newly isolated class immediately
    const curMenu = localStorage.getItem('activeMenu') || 'dashboard';
    if (typeof window.switchView === 'function') {
        window.switchView(curMenu, false);
    }
};

window.openQuickAddStudentModal = function() {
    const modal = document.getElementById("quickAddStudentModal");
    if (!modal) return;
    const cur = window.getCurrentSelectedClass();
    const classBadge = document.getElementById("quickAddClassBadge");
    if (classBadge) classBadge.textContent = `${cur.level} ${cur.room}`;

    const yearBadge = document.getElementById("quickAddYearBadge");
    const curYear = document.getElementById("globalAcademicYear")?.value || localStorage.getItem('selected_academic_year') || "2026-2027";
    if (yearBadge) yearBadge.textContent = curYear;

    const nameInput = document.getElementById("quickStuName");
    const phoneInput = document.getElementById("quickStuPhone");
    const dobInput = document.getElementById("quickStuDob");
    if (nameInput) nameInput.value = "";
    if (phoneInput) phoneInput.value = "";
    if (dobInput) dobInput.value = "";

    modal.classList.remove("hidden");
    modal.classList.add("flex");
    if (nameInput) nameInput.focus();
};

window.closeQuickAddStudentModal = function() {
    const modal = document.getElementById("quickAddStudentModal");
    if (modal) {
        modal.classList.add("hidden");
        modal.classList.remove("flex");
    }
};

window.handleQuickAddStudentSubmit = async function(event) {
    if (event && event.preventDefault) event.preventDefault();

    const name = document.getElementById("quickStuName")?.value.trim();
    if (!name) {
        alert("សូមបញ្ចូលឈ្មោះសិស្ស!");
        return;
    }

    const gender = document.getElementById("quickStuGender")?.value || "ប្រុស";
    const dob = document.getElementById("quickStuDob")?.value || "";
    const phone = document.getElementById("quickStuPhone")?.value.trim() || "";
    const cur = window.getCurrentSelectedClass();
    const curYear = document.getElementById("globalAcademicYear")?.value || localStorage.getItem('selected_academic_year') || "2026-2027";
    const teacherId = localStorage.getItem('auth_teacher_id') || "TCH-001";

    const btn = document.getElementById("btnQuickAddSave");
    const origHtml = btn ? btn.innerHTML : "";
    if (btn) {
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> កំពុងរក្សាទុក...`;
        btn.disabled = true;
    }

    try {
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const stuId = `STU-${randomNum}`;

        const newStudent = {
            id: stuId,
            name: name,
            gender: gender,
            dob: dob,
            grade: cur.level,
            room: cur.room,
            academic_year: curYear,
            parent_contact: phone,
            status: "Active",
            teacher_id: teacherId,
            enrollment_date: new Date().toISOString().split('T')[0],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const all = window.getMasterStudents();
        all.push(newStudent);
        window.setMasterStudents(all);

        // Save to Google Sheets
        if (typeof window.apiPost === 'function') {
            window.apiPost("saveStudent", newStudent).catch(err => console.warn("GAS saveStudent warning:", err));
        }

        // Save to Firebase
        if (window.db && typeof window.saveStudentToFirebase === 'function') {
            window.saveStudentToFirebase(newStudent).catch(err => console.warn("Firestore saveStudent warning:", err));
        }

        if (typeof showToast === 'function') {
            showToast(`🎉 បានបញ្ចូលសិស្ស ${name} ទៅក្នុងថ្នាក់ ${cur.level} ${cur.room} ជោគជ័យ!`);
        } else {
            alert(`🎉 បានបញ្ចូលសិស្ស ${name} ទៅក្នុងថ្នាក់ ${cur.level} ${cur.room} ជោគជ័យ!`);
        }

        window.closeQuickAddStudentModal();

        // Refresh currently active view
        const curMenu = localStorage.getItem('activeMenu') || 'students';
        if (typeof window.switchView === 'function') {
            window.switchView(curMenu, false);
        }

    } catch (err) {
        console.error("Quick Add Student Error:", err);
        alert("⚠️ បរាជ័យក្នុងការបញ្ចូលសិស្ស: " + err.message);
    } finally {
        if (btn) {
            btn.innerHTML = origHtml || `<i class="fa-solid fa-plus"></i> បញ្ចូលសិស្សភ្លាមៗ`;
            btn.disabled = false;
        }
    }
};


// =========================================================
// ៤. ដំណើរការនៅពេលកម្មវិធីចាប់ផ្តើម (Load)
// =========================================================
window.addEventListener('DOMContentLoaded', () => {
  const queue = JSON.parse(localStorage.getItem('syncQueue') || '[]');
  updateSyncBadgeUI(queue.length);
  
  fetchSystemSettings(); 
  
  if (queue.length > 0 && appSettings.auto_sync) {
      setTimeout(() => { syncDataToServer(true); }, 3000);
  }
});