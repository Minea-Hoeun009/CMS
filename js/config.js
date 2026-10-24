// ==========================================
// ឯកសារ js/config.js (Advanced Cloud Sync & Multi-Teacher API)
// ==========================================

// 👉 URL របស់ Google Apps Script (Connected & Standardized)
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyOxLfIniR0LnfOAy2t5qF9oPuOma2u6tcOlNe-YbvAZF3oxqYRJ2xnbUruLup46aP3/exec";
window.SCRIPT_URL = SCRIPT_URL;
window.getScriptUrl = function() {
  return SCRIPT_URL;
};

// ⚡ Dynamic Dropdown Updater: updates all class/room dropdowns in real-time without reloading
window.updateAllClassDropdowns = function() {
    let struct = window.academicStructure;
    if (!struct || !Array.isArray(struct.grades) || struct.grades.length === 0) {
        try {
            struct = JSON.parse(localStorage.getItem("academic_structure") || "{}");
        } catch(e) {}
    }
    const gradesList = [];
    const roomsSet = new Set(["«ក»", "«ខ»", "«គ»", "«ឃ»"]);
    
    if (struct && Array.isArray(struct.grades)) {
        struct.grades.forEach(g => {
            if (g && g.name) gradesList.push(g.name);
            if (g && Array.isArray(g.rooms)) g.rooms.forEach(r => roomsSet.add(r));
        });
    }

    if (gradesList.length === 0) {
        for (let i = 1; i <= 12; i++) {
            const kh = typeof toKhmerNum === 'function' ? toKhmerNum(i) : i;
            gradesList.push(`ថ្នាក់ទី ${kh}`);
        }
    }

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

    // 5. Update Timetable & other class selects
    const otherSelects = document.querySelectorAll("select[id*='Grade'], select[id*='grade'], select[onchange*='handleClassChange']");
    otherSelects.forEach(sel => {
        if (sel !== stuGradeSel && sel !== modalStuGrade && sel !== attGradeSel && sel !== scoreGradeSel) {
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
  // 🟢 បញ្ចូលអត្តសញ្ញាណគ្រូ និងឆ្នាំសិក្សា ទៅក្នុងប៉ារ៉ាម៉ែត្រជានិច្ច 🟢
  const auth = getAuthCredentials();
  const finalParams = { ...auth, ...params };
  
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
  
  const requestBody = {
      action: action,
      teacher_id: auth.teacher_id,
      academic_year: auth.academic_year,
      data: payload.data ? payload.data : payload
  };
  
  if (payload && payload.id) requestBody.id = payload.id;
  else if (payload && payload.data && payload.data.id) requestBody.id = payload.data.id;

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
// ៣. មុខងារបោះពុម្ព (Print Iframe with Fonts Support)
// =========================================================
window.printSpecificSheet = function(elementId, orientation = 'landscape') {
  const target = document.getElementById(elementId);
  if (!target) {
    alert("រកមិនឃើញសន្លឹកការងារសម្រាប់បោះពុម្ពទេ!");
    return;
  }

  let oldIframe = document.getElementById("print_frame_helper");
  if (oldIframe) oldIframe.remove();

  const iframe = document.createElement("iframe");
  iframe.id = "print_frame_helper";
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const clone = target.cloneNode(true);
  
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
      span.style.cssText = "font-weight:bold; font-family:monospace; display:inline-block; text-align:center;";
      cloneInputs[idx].parentNode.replaceChild(span, cloneInputs[idx]);
    }
  });

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="km">
    <head>
      <meta charset="UTF-8">
      <title>បោះពុម្ពឯកសារ</title>
      
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Moul&family=Siemreap&display=swap" rel="stylesheet">
      
      <script src="https://cdn.tailwindcss.com"><\/script>
      <script>
        tailwind.config = { theme: { extend: { fontFamily: { siemreap: ['Siemreap', 'sans-serif'], moul: ['Moul', 'sans-serif'] } } } }
      <\/script>

      <style>
        @page { 
          size: A4 ${orientation}; 
          margin: 8mm; 
        }
        
        @media print {
          body, html { width: 100% !important; margin: 0 !important; padding: 0 !important; background: white !important; }
          #${elementId}, .bg-white, .shadow-xl { max-width: 100% !important; width: 100% !important; border: none !important; box-shadow: none !important; padding: 0 !important; }
        }

        * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        body { color: black !important; font-family: 'Siemreap', sans-serif !important; }
        .font-moul { font-family: 'Moul', serif !important; font-weight: normal !important;}
        .font-siemreap { font-family: 'Siemreap', sans-serif !important; font-weight: 500 !important; }
        .no-print { display: none !important; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid black !important; }
        .border-dashed { border-style: dashed !important; }
      </style>
    </head>
    <body>
      ${clone.innerHTML}
    </body>
    </html>
  `);
  doc.close();

  setTimeout(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  }, 1500); 
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