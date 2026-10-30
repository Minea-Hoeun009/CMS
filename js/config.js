// ==========================================
// ឯកសារ js/config.js (Advanced Cloud Sync & Multi-Teacher API)
// ==========================================

// 👉 URL របស់ Google Apps Script (Connected & Standardized)
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycby65mFS_22-jsctxEJSLS_ebuAiWuPOrhcm1-_IVu3Xn_dePOIqPkfqDYwjc0JlU0TA/exec";
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
    const reportYearSel = document.getElementById("reportAcademicYearSelect");
    if (reportYearSel) {
        const curY = (typeof window.getReportAcademicYear === 'function' ? window.getReportAcademicYear() : (localStorage.getItem('selected_academic_year') || '2026-2027'));
        if (reportYearSel.value !== curY) reportYearSel.value = curY;
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
  principal_name: "",
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
async function apiGet(action, params = {}, forceRefresh = false) {
  // 🟢 បញ្ចូលអត្តសញ្ញាណគ្រូ ឆ្នាំសិក្សា និង Session Token ទៅក្នុងប៉ារ៉ាម៉ែត្រជានិច្ច 🟢
  const auth = getAuthCredentials();
  const sessionToken = (typeof window.getSessionToken === 'function' ? window.getSessionToken() : '') || (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('cms_session_token') : '') || '';
  const finalParams = { ...auth, ...params };
  if (sessionToken && !finalParams.session_token) {
    finalParams.session_token = sessionToken;
  }
  
  const cacheKey = `cache_${action}_${JSON.stringify(finalParams)}`;
  if (!forceRefresh) {
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      fetchDataFromAPI(action, finalParams, cacheKey).catch(e => console.warn("Background Sync API Get Error"));
      return JSON.parse(cachedData);
    }
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

        // ពិនិត្យឆ្នាំសិក្សា (បើមានកំណត់ក្នុងសិស្ស - បំលែងលេខខ្មែរ/សកលដើម្បីធានាភាពត្រូវគ្នា)
        const sYear = String(s.academic_year || '').trim();
        if (sYear && sYear !== 'undefined' && currentAcademicYear && currentAcademicYear !== 'all') {
            const toUni = (str) => String(str || '').replace(/[០-៩]/g, d => "0123456789"["០១២៣៤៥៦៧៨៩".indexOf(d)]);
            const sUni = toUni(sYear);
            const cUni = toUni(currentAcademicYear);
            if (!sUni.includes(cUni) && !cUni.includes(sUni)) {
                return false;
            }
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

// =========================================================================
// បន្ទាត់ក្បាច់ចំណងជើងឯកសារ (Standard Document Title Flourish)
// =========================================================================
window.CMS_TITLE_FLOURISH_B64 = "data:image/png;base64,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";
window.CMS_TITLE_FLOURISH_HTML = `<img src="${window.CMS_TITLE_FLOURISH_B64 || 'assets/images/title-flourish.png'}" class="title-flourish-symbol" alt="flourish" style="display: block; margin: 0 auto; width: 230px; height: 14px; object-fit: contain;" />`;

// =========================================================================
// ស៊ុមតារាងកិត្តិយសផ្លូវការ (Official Honor Board Cyan Border Frame)
// =========================================================================
window.CMS_HONORBOARD_BORDER_B64 = "data:image/png;base64,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";


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
        const margin = options.margin !== undefined ? options.margin : (paperSize === 'A3' ? '10mm' : '1.5cm');
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
            clone.style.padding = "0";
            clone.style.minHeight = "auto";
        }
        // Standardize .a4-page elements to exact full A4 dimensions (210mm x 297mm) matching Honor Board
        const isLandscape = orientation === 'landscape';
        const pageW = isLandscape ? '297mm' : '210mm';
        const pageH = isLandscape ? '210mm' : '297mm';

        const a4Pages = clone.querySelectorAll ? clone.querySelectorAll('.a4-page') : [];
        if (a4Pages.length > 0) {
            a4Pages.forEach(p => {
                p.style.setProperty('width', pageW, 'important');
                p.style.setProperty('height', pageH, 'important');
                p.style.setProperty('min-height', pageH, 'important');
                p.style.setProperty('max-height', pageH, 'important');
                p.style.setProperty('display', 'flex', 'important');
                p.style.setProperty('flex-direction', 'column', 'important');
                p.style.setProperty('justify-content', 'flex-start', 'important');
                p.style.setProperty('box-shadow', 'none', 'important');
                p.style.setProperty('border-radius', '0', 'important');
                p.style.setProperty('margin', '0 auto', 'important');
                p.style.setProperty('padding', '1.5cm', 'important');
                p.style.setProperty('box-sizing', 'border-box', 'important');
                p.style.setProperty('overflow', 'hidden', 'important');
            });
        }
        if (clone.classList && clone.classList.contains('a4-page')) {
            clone.style.setProperty('width', pageW, 'important');
            clone.style.setProperty('height', pageH, 'important');
            clone.style.setProperty('min-height', pageH, 'important');
            clone.style.setProperty('max-height', pageH, 'important');
            clone.style.setProperty('display', 'flex', 'important');
            clone.style.setProperty('flex-direction', 'column', 'important');
            clone.style.setProperty('justify-content', 'flex-start', 'important');
            clone.style.setProperty('box-shadow', 'none', 'important');
            clone.style.setProperty('border-radius', '0', 'important');
            clone.style.setProperty('margin', '0 auto', 'important');
            clone.style.setProperty('padding', '1.5cm', 'important');
            clone.style.setProperty('box-sizing', 'border-box', 'important');
            clone.style.setProperty('overflow', 'hidden', 'important');
        }
        if (clone.firstElementChild) {
            const isA4Page = clone.firstElementChild.classList && clone.firstElementChild.classList.contains('a4-page');
            if (clone.firstElementChild.style) {
                clone.firstElementChild.style.boxShadow = "none";
                if (isA4Page) {
                    clone.firstElementChild.style.setProperty('width', pageW, 'important');
                    clone.firstElementChild.style.setProperty('height', pageH, 'important');
                    clone.firstElementChild.style.setProperty('min-height', pageH, 'important');
                    clone.firstElementChild.style.setProperty('max-height', pageH, 'important');
                    clone.firstElementChild.style.setProperty('display', 'flex', 'important');
                    clone.firstElementChild.style.setProperty('flex-direction', 'column', 'important');
                    clone.firstElementChild.style.setProperty('justify-content', 'flex-start', 'important');
                    clone.firstElementChild.style.setProperty('overflow', 'hidden', 'important');
                }
                if (!isA4Page) {
                    clone.firstElementChild.style.border = "none";
                    clone.firstElementChild.style.borderRadius = "0";
                    clone.firstElementChild.style.padding = "0";
                }
            }
            if (clone.firstElementChild.classList) {
                if (!isA4Page) {
                    clone.firstElementChild.classList.remove(
                        "p-4", "sm:p-6", "p-6", "md:p-10", "p-8", "md:p-12",
                        "rounded-xl", "rounded-2xl", "border", "border-slate-200",
                        "border-slate-300", "shadow-sm", "shadow-md", "shadow-xl", "shadow-2xl"
                    );
                } else {
                    clone.firstElementChild.classList.remove("shadow-sm", "shadow-md", "shadow-xl", "shadow-2xl");
                }
            }
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
                        margin: ${options.margin !== undefined ? options.margin : (a4Pages.length > 0 || (clone.classList && clone.classList.contains('a4-page')) ? '0 !important' : '1.5cm !important')};
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
                        font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif !important;
                    }
                    h1, h2, h3, h4, h5, h6, .font-moul { font-family: 'Khmer OS Muol Light', 'Khmer OS Muol', 'Moul', serif !important; font-weight: normal !important; }
                    .font-siemreap { font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif !important; }
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
                    
                    /* A4 Page Structured Layout - Compact & Natural Flow without Bottom-Dropping */
                    .a4-page, [class*="min-h-"] {
                        box-sizing: border-box !important;
                        width: ${orientation === 'landscape' ? '297mm' : '210mm'} !important;
                        height: ${orientation === 'landscape' ? '210mm' : '297mm'} !important;
                        min-height: ${orientation === 'landscape' ? '210mm' : '297mm'} !important;
                        max-height: ${orientation === 'landscape' ? '210mm' : '297mm'} !important;
                        display: flex !important;
                        flex-direction: column !important;
                        justify-content: flex-start !important;
                        position: relative !important;
                        padding: 1.5cm !important;
                        margin: 0 auto !important;
                        page-break-inside: avoid !important;
                        page-break-after: avoid !important;
                        background: white !important;
                        border-radius: 0 !important;
                        box-shadow: none !important;
                        overflow: hidden !important;
                    }

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
    renderToolbarHtml: function(targetElementId, defaultOrientation = 'portrait', defaultPaper = 'A4', defaultScale = 100) {
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
                    <option value="portrait" ${defaultOrientation === 'portrait' ? 'selected' : ''}>បញ្ឈរ (Portrait)</option>
                    <option value="landscape" ${defaultOrientation === 'landscape' ? 'selected' : ''}>ផ្តេក (Landscape)</option>
                </select>

                <div class="flex items-center gap-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1 ml-1 shadow-inner">
                    <span class="font-bold text-slate-500 text-[11px] select-none flex items-center gap-1">
                        <i class="fa-solid fa-magnifying-glass text-[10px] text-rose-500"></i>ទំហំ៖
                    </span>
                    <input type="range" id="print_scale_${targetElementId}" min="50" max="140" step="1" value="${defaultScale}" 
                        oninput="window.CMSPrintManager.applyLivePreview('${targetElementId}')"
                        class="w-20 sm:w-28 h-1.5 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-rose-600 focus:outline-none">
                    <span id="print_scale_val_${targetElementId}" class="font-mono font-bold text-rose-600 dark:text-rose-400 text-xs min-w-[38px] text-center select-none">${defaultScale}%</span>
                    <button type="button" onclick="const s = document.getElementById('print_scale_${targetElementId}'); if(s){ s.value = 100; window.CMSPrintManager.applyLivePreview('${targetElementId}'); }" title="កំណត់ឡើងវិញ 100%" class="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-0.5 transition active:scale-90">
                        <i class="fa-solid fa-rotate-left text-[10px]"></i>
                    </button>
                </div>

                <button onclick="window.CMSPrintManager.executePrintWithToolbar('${targetElementId}')" class="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow flex items-center gap-1.5 ml-1 sm:ml-2 transition active:scale-95">
                    <i class="fa-solid fa-print"></i> <span>ព្រីន (Print)</span>
                </button>
            </div>
        `;
    },

    updateToolbarDefaults: function(targetElementId, defaultOrientation = 'portrait', defaultPaper = 'A4', defaultScale = 100) {
        const pEl = document.getElementById(`print_paper_${targetElementId}`);
        const oEl = document.getElementById(`print_orient_${targetElementId}`);
        const sEl = document.getElementById(`print_scale_${targetElementId}`);
        const sValEl = document.getElementById(`print_scale_val_${targetElementId}`);
        if (pEl && defaultPaper) pEl.value = defaultPaper;
        if (oEl && defaultOrientation) oEl.value = defaultOrientation;
        if (sEl && defaultScale) {
            sEl.value = String(defaultScale);
            if (sValEl) sValEl.textContent = `${defaultScale}%`;
        }
        this.applyLivePreview(targetElementId);
    },

    applyLivePreview: function(targetElementId) {
        const target = document.getElementById(targetElementId);
        if (!target) return;
        const orient = document.getElementById(`print_orient_${targetElementId}`)?.value || 'portrait';
        const paper = document.getElementById(`print_paper_${targetElementId}`)?.value || 'A4';
        const scaleVal = document.getElementById(`print_scale_${targetElementId}`)?.value;
        const scale = scaleVal !== undefined && scaleVal !== null && scaleVal !== '' ? parseInt(scaleVal, 10) : 100;

        const sValEl = document.getElementById(`print_scale_val_${targetElementId}`);
        if (sValEl) sValEl.textContent = `${scale}%`;

        // Sync global settings object if present
        if (window.academicReportPaperSettings) {
            window.academicReportPaperSettings.paperSize = paper;
            window.academicReportPaperSettings.orientation = orient;
            window.academicReportPaperSettings.scale = scale;
        }

        const paperWrapper = document.getElementById('reportKoKhoPrintArea') || 
                             target.querySelector('#reportKoKhoPrintArea') || 
                             target.firstElementChild || 
                             target;

        if (paperWrapper && paperWrapper.style) {
            const isLandscape = orient === 'landscape';
            let widthMm = '297mm';
            let minHeightMm = '210mm';

            if (paper === 'A3') {
                widthMm = isLandscape ? '420mm' : '297mm';
                minHeightMm = isLandscape ? '297mm' : '420mm';
            } else if (paper === 'Letter') {
                widthMm = isLandscape ? '279mm' : '216mm';
                minHeightMm = isLandscape ? '216mm' : '279mm';
            } else if (paper === 'Legal') {
                widthMm = isLandscape ? '356mm' : '216mm';
                minHeightMm = isLandscape ? '216mm' : '356mm';
            } else { // A4
                widthMm = isLandscape ? '297mm' : '210mm';
                minHeightMm = isLandscape ? '210mm' : '297mm';
            }

            paperWrapper.style.maxWidth = widthMm;
            paperWrapper.style.width = widthMm;
            paperWrapper.style.minHeight = minHeightMm;

            const scaleRatio = (scale || 100) / 100;
            // Use CSS zoom so all child text, tables, columns and borders scale proportionately
            paperWrapper.style.zoom = scaleRatio;

            // Fallback for browsers that do not support zoom
            if (!('zoom' in paperWrapper.style)) {
                paperWrapper.style.transform = `scale(${scaleRatio})`;
                paperWrapper.style.transformOrigin = 'top center';
            } else {
                paperWrapper.style.transform = '';
            }

            target.style.transform = '';
        }
    },

    executePrintWithToolbar: function(targetElementId) {
        const paper = document.getElementById(`print_paper_${targetElementId}`)?.value || 'A4';
        const orient = document.getElementById(`print_orient_${targetElementId}`)?.value || 'portrait';
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
        const schoolName = custom.schoolName || sInfo.school_name || "សាលាបឋមសិក្សា ខ្សុំ";
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
              <div class="header-left" style="text-align: left; line-height: 1.6; padding-top: 24px;">
                <p style="margin: 0 0 4px 0; font-size: 10.5pt; font-family: 'Khmer OS Muol Light', 'Moul', serif; color: #0f172a;">ការិយាល័យ អប់រំ យុវជន និងកីឡានៃរដ្ឋបាលស្រុក ${ctx.districtName}</p>
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
        const gradeKh = typeof window.toKhmerNum === 'function' ? window.toKhmerNum(grade) : grade;
        const yearKh = typeof window.toKhmerNum === 'function' ? window.toKhmerNum(academicYear) : academicYear;
        const gradePart = gradeKh ? `${gradeKh} | ` : "";
        return `
            <div class="title-box" style="text-align: center; margin: 6px 0 12px 0;">
              <h2 style="margin: 0 0 3px 0; font-size: 13.5pt; color: #1e3a8a; letter-spacing: 0.5px; font-family: 'Khmer OS Muol Light', 'Moul', serif;">${titleText}</h2>
              <div style="display: flex; justify-content: center; margin: 2px 0 4px 0;">
                <img src="${window.CMS_TITLE_FLOURISH_B64 || 'assets/images/title-flourish.png'}" class="title-flourish-symbol" alt="flourish" style="display: block; margin: 0 auto; width: 230px; height: 14px; object-fit: contain;" />
              </div>
              <p style="margin: 0; font-size: 10.5pt; color: #dc2626; font-family: 'Khmer OS Muol Light', 'Moul', serif;">${gradePart}ឆ្នាំសិក្សា ${yearKh}</p>
            </div>
        `;
    },

    // ៧. ទម្រង់ហត្ថលេខា និងកាលបរិច្ឆេទខាងក្រោមស្តង់ដារ (Standard Signatures & Dates ដូចរូបគំរូ)
    getFooterHtml: function(ctx, customRoleLeft = "នាយក/នាយិកាសាលា", customRoleRight = "គ្រូបន្ទុកថ្នាក់", middleColHtml = "") {
        const pName = (ctx.principalName && ctx.principalName !== "នាយកសាលា") ? ctx.principalName : "";
        return `
            <div class="bottom-sig-container" style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%; page-break-inside: avoid; padding: 0 20px; margin-top: 15px;">
                <div class="sig-box-left" style="width: 40%; text-align: center;">
                    <p style="margin: 0 0 4px 0; font-size: 11pt; font-family: 'Siemreap', sans-serif; color: #000;">បានឃើញ និងឯកភាព</p>
                    <p style="margin: 0 0 55px 0; font-size: 11pt; font-family: 'Khmer OS Muol Light', 'Moul', serif; color: #000;">${customRoleLeft}</p>
                    ${pName ? `<p style="margin: 0; font-size: 11pt; font-family: 'Khmer OS Muol Light', 'Moul', serif; color: #000;">${pName}</p>` : ''}
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
        const orientation = options.orientation || "portrait";
        const defaultZoom = options.defaultZoom || 1.0;
        const extraStyles = options.extraStyles || "";
        
        // ពិនិត្យមើលថាតើ Content ខាងក្នុងមាន Header/Footer រួចហើយ ឬត្រូវការចាក់បញ្ចូលស្វ័យប្រវត្តិ
        let bodyContent = options.contentHtml || "";
        if (options.autoWrapHeaderFooter !== false && !options.fullHtml) {
            const headerHtml = options.headerHtml !== undefined ? options.headerHtml : this.getHeaderHtml(ctx);
            const titleHtml = options.titleHtml !== undefined ? options.titleHtml : this.getTitleHtml(titleText, ctx.academicYear, ctx.grade);
            const footerHtml = (options.footerHtml !== undefined && options.footerHtml !== null) 
                ? options.footerHtml 
                : this.getFooterHtml(ctx, options.roleLeft || "នាយក/នាយិកាសាលា", options.roleRight || "គ្រូបន្ទុកថ្នាក់", options.middleColHtml || "");
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
              @page { size: ${paperSize} ${orientation}; margin: 1.5cm; }
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
                  padding: 1.5cm; 
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
              .header-left { text-align: left; padding-top: 24px; }
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
                    
                    document.getElementById('dynamic-page-style').innerHTML = '@page { size: ' + size + ' ' + orientation + '; margin: 1.5cm; }';
                    
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
        
        // Fallback ប្រសិនបើ Pop-up ត្រូវបានបិទ (Direct Iframe Printing)
        try {
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

            const doc = iframe.contentWindow || iframe.contentDocument;
            const iframeDoc = doc.document || doc;
            iframeDoc.open();
            iframeDoc.write(printDocument);
            iframeDoc.close();

            setTimeout(() => {
                try {
                    iframe.contentWindow.focus();
                    iframe.contentWindow.print();
                } catch(pErr) {
                    console.warn("Iframe print error:", pErr);
                    window.print();
                }
            }, 600);
            return;
        } catch(fallbackErr) {
            console.error("Print fallback error:", fallbackErr);
            window.print();
        }
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

        // ទាញយកកាលវិភាគ (Timetables)
        let timetables = [];
        try {
            const ttKey = `timetable_${(currentClass.level + '_' + currentClass.room).replace(/[«»\s]+/g, '_')}`;
            const rawTt = JSON.parse(localStorage.getItem(ttKey) || localStorage.getItem('timetable_default') || '{}');
            for (const [key, slot] of Object.entries(rawTt)) {
                if (slot && slot.subject) {
                    const [dayKey, slotNum] = key.split('_');
                    timetables.push({
                        entry_id: `TT-${academicYear}-${currentClass.level}-${currentClass.room}-${dayKey}-${slotNum}`.replace(/[«»\s]+/g, '_'),
                        academic_year: academicYear,
                        grade: currentClass.level,
                        room: currentClass.room,
                        day_of_week: dayKey,
                        period_slot: parseInt(slotNum, 10),
                        subject_name: slot.subject,
                        teacher_id: slot.teacher_id || teacherId,
                        room_number: slot.room || currentClass.room,
                        updated_at: new Date().toISOString()
                    });
                }
            }
        } catch(e) {}

        // ទាញយករបាយការណ៍ (Reports)
        let reports = [];
        try {
            reports = JSON.parse(localStorage.getItem('cached_reports_list') || '[]');
        } catch(e) {}

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
                library: library || [],
                timetables: timetables || [],
                reports: reports || []
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

            if (timetables && timetables.length > 0) {
                try {
                    await window.apiPost("saveTimetableBatch", timetables);
                } catch(e) {
                    console.warn("saveTimetableBatch notice:", e);
                }
            }

            if (reports && reports.length > 0) {
                try {
                    await window.apiPost("saveReportsBatch", reports);
                } catch(e) {
                    console.warn("saveReportsBatch notice:", e);
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

// =========================================================================
// ៥. មុខងារ Executive Header ស្តង់ដាររួម (Unified Modern Executive Header)
// ធានាថារចនាបថ Header គ្រប់ផ្នែកទាំងអស់ (Dashboard, Students, Attendance,
// Scores, Timetable, Library, Reports, Settings) មានទម្រង់ដូចគ្នាបេះបិទ
// =========================================================================

if (typeof window.getKhmerLunarDate !== 'function') {
    window.getKhmerLunarDate = function(dateObj = new Date()) {
        try {
            let solarYear = dateObj.getFullYear();
            let solarMonth = dateObj.getMonth() + 1;
            let solarDay = dateObj.getDate();
            const khmerDays = ["អាទិត្យ", "ចន្ទ", "អង្គារ", "ពុធ", "ព្រហស្បតិ៍", "សុក្រ", "សៅរ៍"];
            let dayName = khmerDays[dateObj.getDay()];
            const toKh = typeof window.toKhmerNum === 'function' ? window.toKhmerNum : String;

            if (solarYear === 2026 && solarMonth === 10) {
                let lunarDayNum = solarDay + 4;
                let phase = "រោច";
                let monthName = "ភទ្របទ";
                if (solarDay >= 12) {
                    lunarDayNum = solarDay - 11;
                    phase = lunarDayNum > 15 ? "រោច" : "កើត";
                    if (lunarDayNum > 15) lunarDayNum -= 15;
                    monthName = "អស្សុជ";
                }
                return `ថ្ងៃ${dayName} ${toKh(lunarDayNum)}${phase} ខែ${monthName} ឆ្នាំមមី អដ្ឋស័ក ព.ស.២៥៧០`;
            }

            let isNewYearPassed = (solarMonth > 4) || (solarMonth === 4 && solarDay >= 14);
            let beYear = solarYear + 543;
            if (solarMonth > 5 || (solarMonth === 5 && solarDay >= 15)) beYear += 1;

            const animals = ["ជូត", "ឆ្លូវ", "ខាល", "ថោះ", "រោង", "ម្សាញ់", "មមី", "មមែ", "វក", "រកា", "ច", "កុរ"];
            let animalYear = solarYear + 8;
            if (!isNewYearPassed) animalYear -= 1;
            
            return `ថ្ងៃ${dayName} ........... ខែ........... ឆ្នាំ${animals[animalYear % 12]} ........... ព.ស.${toKh(beYear)}`;
        } catch(e) {
            return "ថ្ងៃ......................... ខែ............ ឆ្នាំ............ ព.ស.២៥៧...";
        }
    };
}

window.startHeaderClock = function(clockId = 'dashClock') {
    const clockEl = document.getElementById(clockId);
    if (!clockEl) return;
    if (!window._headerClockIntervals) window._headerClockIntervals = {};
    if (window._headerClockIntervals[clockId]) {
        clearInterval(window._headerClockIntervals[clockId]);
    }
    const update = () => {
        const el = document.getElementById(clockId);
        if (!el) {
            if (window._headerClockIntervals[clockId]) {
                clearInterval(window._headerClockIntervals[clockId]);
                delete window._headerClockIntervals[clockId];
            }
            return;
        }
        const now = new Date();
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        const s = String(now.getSeconds()).padStart(2, '0');
        el.textContent = `${h}:${m}:${s}`;
    };
    update();
    window._headerClockIntervals[clockId] = setInterval(update, 1000);
};

window.renderExecutiveHeaderHTML = function(options = {}) {
    const toKhNum = typeof window.toKhmerNum === 'function' ? window.toKhmerNum : String;
    
    // Academic Year
    const sInfo = window.appSettings || JSON.parse(localStorage.getItem('school_settings') || '{}');
    const academicYear = options.academicYear || localStorage.getItem('selected_academic_year') || sInfo.academic_year || '2026-2027';
    
    // Title & Subtitle
    const title = options.title || 'ផ្ទាំងគ្រប់គ្រងទិន្នន័យ';
    const subtitle = options.subtitle || 'លោកគ្រូអ្នកគ្រូកំពុងស្ថិតក្នុងទំព័រនេះ';
    const icon = options.icon || 'fa-solid fa-laptop-code';

    // Teacher & Class Info
    const activeClass = typeof window.getCurrentSelectedClass === 'function' 
        ? window.getCurrentSelectedClass() 
        : { level: localStorage.getItem('selected_level') || "ថ្នាក់ទី ១", room: localStorage.getItem('selected_room') || "«ក»" };
    const curLevel = options.level || activeClass.level || localStorage.getItem('selected_level') || sInfo.teacher_level || "ថ្នាក់ទី ១";
    const curRoom = options.room || activeClass.room || localStorage.getItem('selected_room') || sInfo.teacher_room || "«ក»";
    const currentClassFull = options.currentClass || `${curLevel} ${curRoom}`.trim();

    const teacherName = options.teacherName || window.AuthState?.teacherName || window.AppAuth?.state?.teacherName || localStorage.getItem('auth_teacher_name') || sInfo.teacher_name || "ហឿន មិនា";
    const teacherCode = options.teacherCode || localStorage.getItem('auth_teacher_id') || window.AuthState?.teacherId || window.AppAuth?.state?.teacherId || "TCH-013";

    // Date computation
    const now = new Date();
    const dayNames = ["អាទិត្យ", "ចន្ទ", "អង្គារ", "ពុធ", "ព្រហស្បតិ៍", "សុក្រ", "សៅរ៍"];
    const khmerMonths = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];
    const dayName = dayNames[now.getDay()];
    const dateNumKh = toKhNum(now.getDate());
    const monthKh = khmerMonths[now.getMonth()];
    const yearKh = toKhNum(now.getFullYear());
    const solarDateStr = options.solarDateStr || `ថ្ងៃទី ${dateNumKh} ខែ ${monthKh} ឆ្នាំ ${yearKh}`;
    
    let lunarDateStr = options.lunarDateStr;
    if (!lunarDateStr) {
        if (typeof window.getKhmerLunarDate === 'function') {
            lunarDateStr = window.getKhmerLunarDate(now);
        } else {
            lunarDateStr = `ថ្ងៃ${dayName} ១៥កើត ខែអស្សុជ ឆ្នាំមមី អដ្ឋស័ក ព.ស.២៥៧០`;
        }
    }

    const clockId = options.clockId || ('headerClock_' + Math.random().toString(36).substr(2, 9));
    const extraBadgesHtml = options.extraBadgesHtml || '';
    const extraActionsHtml = options.extraActionsHtml || '';
    const customBottomBarHtml = options.customBottomBarHtml || '';

    // Schedule live clock start automatically
    setTimeout(() => {
        if (typeof window.startHeaderClock === 'function') {
            window.startHeaderClock(clockId);
        }
    }, 50);

    return `
        <!-- 🟢 Standardized Modern Executive Header (Image 2 Aligned) 🟢 -->
        <div class="bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 rounded-3xl sm:rounded-[2.5rem] p-4 sm:p-7 text-white shadow-xl relative overflow-hidden border border-white/20 mb-4 sm:mb-6 shrink-0 no-print">
            <!-- Subtle glowing background shapes -->
            <div class="absolute -right-12 -bottom-12 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
            <div class="absolute -left-12 -top-12 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none"></div>

            <div class="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6">
                
                <!-- Left Column: Greetings & Teacher Info -->
                <div class="space-y-2.5 sm:space-y-3">
                    <div class="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold text-white shadow-sm">
                        <i class="fa-solid fa-graduation-cap text-amber-300"></i>
                        <span>ឆ្នាំសិក្សា ${toKhNum(academicYear)}</span>
                    </div>

                    <h1 class="text-xl sm:text-3xl lg:text-4xl font-black font-moul tracking-wide text-white drop-shadow-md">
                        ${title}
                    </h1>

                    <div class="flex flex-wrap items-center gap-2 sm:gap-3 pt-1 text-xs text-blue-100 font-medium">
                        <span class="flex items-center gap-2 text-white/95">
                            <i class="${icon} text-blue-200"></i>
                            <span>${subtitle}</span>
                        </span>
                        <span class="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl bg-indigo-950/70 border border-white/20 font-bold font-moul text-amber-300 shadow-sm">
                            ${currentClassFull}
                        </span>
                        <span class="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl bg-white/10 border border-white/15 text-[11px] text-blue-100 font-bold">
                            <i class="fa-solid fa-chalkboard-user text-amber-300"></i>
                            <span>${teacherName} (${teacherCode})</span>
                        </span>
                        ${extraBadgesHtml}
                    </div>
                </div>

                <!-- Right Column: Modern Glass Card for Time & Dates (Exact Match Image 2) -->
                <div class="w-full lg:w-auto shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3 items-stretch lg:items-end">
                    ${extraActionsHtml ? `<div class="flex flex-wrap items-center gap-2 justify-start lg:justify-end">${extraActionsHtml}</div>` : ''}
                    <div class="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-inner space-y-2.5 sm:space-y-3 w-full sm:min-w-[340px]">
                        <!-- Realtime Digital Clock Row -->
                        <div class="flex items-center gap-3 sm:gap-3.5 pb-2 sm:pb-2.5 border-b border-white/15">
                            <div class="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-white/20 text-white flex items-center justify-center text-lg sm:text-xl shrink-0 shadow-sm border border-white/25">
                                <i class="fa-regular fa-clock"></i>
                            </div>
                            <div>
                                <span class="text-[10px] text-blue-200 font-bold uppercase tracking-wider block">ម៉ោងបច្ចុប្បន្ន</span>
                                <span id="${clockId}" class="text-xl sm:text-3xl font-black font-mono tracking-wider text-amber-300 block leading-tight">--:--:--</span>
                            </div>
                        </div>

                        <!-- Lunar Date Row -->
                        <div class="flex items-center gap-2 sm:gap-2.5 text-[11px] sm:text-xs text-white/95 font-medium">
                            <i class="fa-solid fa-moon text-amber-300 text-xs sm:text-sm shrink-0"></i>
                            <span class="truncate">${lunarDateStr}</span>
                        </div>

                        <!-- Solar Date Row -->
                        <div class="flex items-center gap-2 sm:gap-2.5 text-[11px] sm:text-xs text-white/95 font-medium">
                            <i class="fa-regular fa-calendar-check text-blue-200 text-xs sm:text-sm shrink-0"></i>
                            <span>${solarDateStr}</span>
                        </div>
                    </div>
                </div>

            </div>
            ${customBottomBarHtml}
        </div>
    `;
};
