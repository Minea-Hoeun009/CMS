window.currentTbZoom = 85;
window.setTbZoom = function(val) {
  const z = Math.max(40, Math.min(180, parseInt(val, 10) || 85));
  window.currentTbZoom = z;
  const wrapper = document.getElementById("tbPagesWrapper");
  if (wrapper) {
    wrapper.style.transform = "scale(" + (z / 100) + ")";
    wrapper.style.transformOrigin = "top center";
  }
  const label = document.getElementById("tbZoomDisplay");
  if (label) label.textContent = z + "%";
};
window.tbZoomIn = function() {
  window.setTbZoom((window.currentTbZoom || 85) + 10);
};
window.tbZoomOut = function() {
  window.setTbZoom((window.currentTbZoom || 85) - 10);
};
window.tbZoomFit = function() {
  const isMobile = window.innerWidth < 768;
  window.setTbZoom(isMobile ? 55 : 85);
};

// ==========================================================
// ឯកសារ js/tracking-book.js - សៀវភៅតាមដានការសិក្សា (Update ថ្មី: ទាញទិន្នន័យគ្រប់ជ្រុងជ្រោយ និងសារ៉េក្រដាសព្រីន)
// ==========================================================

function openTrackingBookModal() {
  let modal = document.getElementById("trackingBookModal");
  if (!modal) {
    const modalHtml = `
      <div id="trackingBookModal" class="fixed inset-0 z-[6000] bg-black/60 hidden flex-col items-center justify-center p-2 md:p-4 font-siemreap fade-in no-print" style="backdrop-filter: none !important;">
        <div class="bg-slate-200 rounded-3xl shadow-2xl w-full max-w-[1240px] h-[95vh] flex flex-col overflow-hidden border border-slate-300">
          
          <div class="p-2 sm:p-2.5 md:p-3 border-b border-slate-300 bg-white flex items-center gap-2 shrink-0 shadow-sm z-10 overflow-x-auto custom-scrollbar flex-nowrap whitespace-nowrap w-full">
            <button onclick="window.closeTrackingBookModal()" class="px-3 py-1.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 font-bold text-xs transition shadow-sm active:scale-95 shrink-0" title="ថយក្រោយ"><i class="fa-solid fa-arrow-left text-sm"></i> <span>ថយក្រោយ</span></button>
            
            <div class="hidden lg:flex items-center gap-2 shrink-0 pr-2 border-r border-slate-200">
              <div class="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm text-xs"><i class="fa-solid fa-book-open-reader"></i></div>
              <h2 class="font-bold text-xs text-slate-800 font-moul">សៀវភៅតាមដាន</h2>
            </div>
            
            <!-- ជ្រើសរើស ថ្នាក់ទី & បន្ទប់ -->
            <div class="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2 py-1 shadow-sm shrink-0">
              <span class="text-[10px] font-bold text-slate-500 uppercase ml-1">ថ្នាក់ទី</span>
              <select id="tbLevelSelect" onchange="updateTbStudentSelect()" class="border-none bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer">
                ${(typeof window.getAllGradesList === 'function' ? window.getAllGradesList() : ["ថ្នាក់ទី ១", "ថ្នាក់ទី ២", "ថ្នាក់ទី ៣", "ថ្នាក់ទី ៤", "ថ្នាក់ទី ៥", "ថ្នាក់ទី ៦"]).map(g => `<option value="${g}">${g}</option>`).join('')}
              </select>
              <select id="tbRoomSelect" onchange="updateTbStudentSelect()" class="border-none bg-transparent text-xs font-bold text-indigo-700 outline-none cursor-pointer">
                ${(typeof window.getAllRoomsList === 'function' ? window.getAllRoomsList() : ["«ក»", "«ខ»", "«គ»", "«ឃ»"]).map(r => `<option value="${r}">${r}</option>`).join('')}
              </select>
            </div>

            <!-- ជ្រើសរើស សិស្ស -->
            <div class="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2 py-1 shadow-sm shrink-0 min-w-[140px] max-w-[200px]">
              <i class="fa-solid fa-user-graduate text-slate-400 text-xs ml-1"></i>
              <select id="tbStudentSelect" onchange="renderTrackingBookPreview()" class="w-full border-none bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer truncate">
                <option value="">-- ជ្រើសរើសសិស្ស --</option>
              </select>
            </div>

            <!-- ជ្រើសរើស ខែ / ប្រចាំឆ្នាំ -->
            <div class="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2 py-1 shadow-sm shrink-0">
              <i class="fa-solid fa-calendar text-slate-400 text-xs ml-1"></i>
              <select id="tbPeriodSelect" onchange="renderTrackingBookPreview()" class="border-none bg-transparent text-xs font-bold text-blue-700 outline-none cursor-pointer">
                <option value="ខែ តុលា">ខែ តុលា</option><option value="ខែ វិច្ឆិកា">ខែ វិច្ឆិកា</option><option value="ខែ ធ្នូ">ខែ ធ្នូ</option>
                <option value="ខែ មករា" selected>ខែ មករា</option><option value="ខែ កុម្ភៈ">ខែ កុម្ភៈ</option><option value="ខែ មីនា">ខែ មីនា</option>
                <option value="ខែ មេសា">ខែ មេសា</option><option value="ខែ ឧសភា">ខែ ឧសភា</option><option value="ខែ មិថុនា">ខែ មិថុនា</option><option value="ខែ កក្កដា">ខែ កក្កដា</option>
                <option value="ប្រចាំឆ្នាំ">ប្រចាំឆ្នាំ</option>
              </select>
            </div>

            <div class="w-px h-5 bg-slate-300 mx-0.5 shrink-0"></div>

            <!-- 🛠️ មុខងារសារ៉េក្រដាស (Paper Settings Controls) 🛠️ -->
            <div class="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 shadow-sm shrink-0">
              <i class="fa-solid fa-file text-indigo-500 text-xs ml-1"></i>
              <span class="text-[10px] font-bold text-slate-500">ក្រដាស៖</span>
              <select id="tbPaperSize" onchange="window.applyTbPaperSettings()" class="border-none bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer">
                <option value="A4" selected>A4</option>
                <option value="A3">A3</option>
                <option value="Legal">Legal</option>
                <option value="Letter">Letter</option>
              </select>
            </div>

            <div class="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 shadow-sm shrink-0">
              <i class="fa-solid fa-rotate text-blue-500 text-xs ml-1"></i>
              <span class="text-[10px] font-bold text-slate-500">ទិស៖</span>
              <select id="tbOrientation" onchange="window.applyTbPaperSettings()" class="border-none bg-transparent text-xs font-bold text-indigo-700 outline-none cursor-pointer">
                <option value="landscape" selected>ផ្តេក (Landscape)</option>
                <option value="portrait">បញ្ឈរ (Portrait)</option>
              </select>
            </div>

            <!-- Zoom Controls -->
            <div class="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2 py-1 shadow-sm shrink-0">
              <button type="button" onclick="window.tbZoomOut()" class="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition active:scale-95" title="បង្រួម"><i class="fa-solid fa-minus text-[10px]"></i></button>
              <span id="tbZoomDisplay" class="text-xs font-bold text-slate-700 min-w-[38px] text-center">85%</span>
              <button type="button" onclick="window.tbZoomIn()" class="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition active:scale-95" title="ពង្រីក"><i class="fa-solid fa-plus text-[10px]"></i></button>
              <button type="button" onclick="window.tbZoomFit()" class="px-1.5 py-0.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold ml-0.5 transition" title="កំណត់ទំហំសមរម្យ">Fit</button>
            </div>

            <div class="w-px h-5 bg-slate-300 mx-0.5 shrink-0"></div>

            <!-- ប៊ូតុងបោះពុម្ព & Export Word -->
            <button onclick="executeTrackingBookPrint('print')" class="px-3.5 py-1.5 bg-gradient-to-r from-slate-800 to-indigo-900 hover:from-slate-900 hover:to-indigo-950 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 shrink-0 active:scale-95">
              <i class="fa-solid fa-print text-amber-300"></i> <span>បោះពុម្ព</span>
            </button>
            <button onclick="executeTrackingBookPrint('word')" class="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 shrink-0 active:scale-95">
              <i class="fa-solid fa-file-word"></i> <span>Word</span>
            </button>
            
            <button onclick="closeTrackingBookModal()" class="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white font-bold transition flex justify-center items-center shadow-sm shrink-0 ml-auto" title="បិទ">
              <i class="fa-solid fa-xmark text-sm"></i>
            </button>
          </div>

          <div class="w-full flex-1 overflow-auto p-4 md:p-8 bg-slate-300 custom-scrollbar flex flex-col items-center" id="tbPreviewContainer">
            <div class="text-slate-500 font-bold mt-20 flex flex-col items-center">
               <i class="fa-solid fa-spinner fa-spin text-4xl mb-3 opacity-50"></i>
               <p>កំពុងរៀបចំទិន្នន័យសៀវភៅតាមដាន...</p>
            </div>
          </div>
          
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    modal = document.getElementById("trackingBookModal");
  }

  modal.classList.remove("hidden");
  modal.classList.add("flex");
  const curClass = typeof window.getCurrentSelectedClass === 'function' ? window.getCurrentSelectedClass() : { level: "ថ្នាក់ទី ៤", room: "«ក»" };
  const lvlEl = document.getElementById("tbLevelSelect");
  const rmEl = document.getElementById("tbRoomSelect");
  if (lvlEl && curClass.level) lvlEl.value = curClass.level;
  if (rmEl && curClass.room) rmEl.value = curClass.room;
  updateTbStudentSelect();
}

function closeTrackingBookModal() {
  const m = document.getElementById("trackingBookModal");
  if(m) { m.classList.add("hidden"); m.classList.remove("flex"); }
}

function updateTbStudentSelect() {
  const levelSelect = document.getElementById("tbLevelSelect");
  const roomSelect = document.getElementById("tbRoomSelect");
  if (!levelSelect || !roomSelect) return;

  const level = levelSelect.value;
  const room = roomSelect.value;
  const targetGrade = `${level} ${room}`.trim();
  const select = document.getElementById("tbStudentSelect");
  if (!select) return;

  const academicYear = document.getElementById("globalAcademicYear")?.value || "2026-2027";
  const studentsInGrade = typeof window.getStudentsForClass === 'function'
      ? window.getStudentsForClass(level, room, academicYear)
      : (window.allStudents || []).filter(s => {
          return (s.grade || "").replace(/\s+/g, '') === level.replace(/\s+/g, '') &&
                 (s.room || "").replace(/[«»\s]/g, '') === room.replace(/[«»\s]/g, '');
      });

  if (studentsInGrade.length === 0) {
    select.innerHTML = `<option value="">-- គ្មានសិស្សក្នុងថ្នាក់ ${targetGrade} --</option>`;
    const prev = document.getElementById("tbPreviewContainer");
    if (prev) prev.innerHTML = `<div class="mt-20 text-slate-500 font-bold text-center">គ្មានសិស្សក្នុងថ្នាក់ ${targetGrade} ទេ!</div>`;
  } else {
    select.innerHTML = studentsInGrade.map(s => `<option value="${s.id || s.student_id}">${s.name} (${s.gender || 'ប្រុស'})</option>`).join("");
    renderTrackingBookPreview();
  }
}

// មុខងារកែតម្រូវទំហំក្រដាសផ្ទាល់ (Apply Live Paper Size and Orientation)
window.applyTbPaperSettings = function() {
  const paper = document.getElementById("tbPaperSize")?.value || "A4";
  const orient = document.getElementById("tbOrientation")?.value || "landscape";
  const isLandscape = orient === "landscape";

  let w = "297mm", h = "210mm";
  if (paper === "A4") {
    w = isLandscape ? "297mm" : "210mm";
    h = isLandscape ? "210mm" : "297mm";
  } else if (paper === "A3") {
    w = isLandscape ? "420mm" : "297mm";
    h = isLandscape ? "297mm" : "420mm";
  } else if (paper === "Legal") {
    w = isLandscape ? "355.6mm" : "215.9mm";
    h = isLandscape ? "215.9mm" : "355.6mm";
  } else if (paper === "Letter") {
    w = isLandscape ? "279.4mm" : "215.9mm";
    h = isLandscape ? "215.9mm" : "279.4mm";
  }

  const pages = document.querySelectorAll("#tbPreviewContainer .printable-page");
  pages.forEach(p => {
    p.style.width = w;
    p.style.minHeight = h;
    p.style.height = isLandscape ? h : "auto";
  });
};

// គូររូបរាងសៀវភៅបញ្ចូលទៅក្នុង Pop-up ដោយទាញទិន្នន័យគ្រប់ជ្រុងជ្រោយ
function renderTrackingBookPreview() {
  const studentId = document.getElementById("tbStudentSelect")?.value;
  const period = document.getElementById("tbPeriodSelect")?.value || "ខែ មករា";
  const container = document.getElementById("tbPreviewContainer");
  if (!container || !studentId) return;

  const allStudents = window.allStudents || (typeof window.getMasterStudents === 'function' ? window.getMasterStudents() : []);
  let student = allStudents.find(s => String(s.id) === String(studentId) || String(s.student_id) === String(studentId));
  if (!student && typeof window.rankingsDataList !== 'undefined') {
    student = window.rankingsDataList.find(s => String(s.id) === String(studentId) || String(s.student_id) === String(studentId));
  }
  if (!student) {
    try {
      const stored = JSON.parse(localStorage.getItem('academic_students') || '[]');
      student = stored.find(s => String(s.id) === String(studentId) || String(s.student_id) === String(studentId));
    } catch(e) {}
  }
  if (!student) return;

  // 1. បរិបទសាលារៀន និងការកំណត់ទូទៅ (School & Context Info)
  const sInfo = typeof window.appSettings !== 'undefined' ? window.appSettings : {};
  let savedSettings = {};
  try { savedSettings = JSON.parse(localStorage.getItem('school_settings') || '{}'); } catch(e) {}
  const schoolName = sInfo.school_name || savedSettings.school_name || "សាលាបឋមសិក្សា ខ្សុំ";
  const schoolPhone = sInfo.school_phone || savedSettings.school_phone || sInfo.phone || sInfo.teacher_phone || "";
  const clusterName = sInfo.school_cluster || savedSettings.school_cluster || sInfo.cluster || savedSettings.cluster || sInfo.cluster_name || "";
  const academicYear = sInfo.academic_year || savedSettings.academic_year || document.getElementById("globalAcademicYear")?.value || "២០២៦-២០២៧";
  
  const levelSelect = document.getElementById("tbLevelSelect");
  const roomSelect = document.getElementById("tbRoomSelect");
  const curLevel = levelSelect ? levelSelect.value : (student.grade || "ថ្នាក់ទី ៤");
  const curRoom = roomSelect ? roomSelect.value : (student.room || "«ក»");
  const grade = `${curLevel} ${curRoom}`.trim();

  const teacherName = (window.AuthState ? window.AuthState.teacherName : null) || localStorage.getItem('auth_teacher_name') || sInfo.teacher_name || savedSettings.teacher_name || "";
  const principalName = (sInfo.principal_name && sInfo.principal_name !== "នាយកសាលា") ? sInfo.principal_name : (savedSettings.principal_name || "");
  const districtName = (sInfo.district_name || savedSettings.district_name || sInfo.district || savedSettings.district || "កៀនស្វាយ").replace(/^ស្រុក\s*/, '').trim();
  const provinceName = sInfo.province || savedSettings.province || "កណ្តាល";
  const communeName = sInfo.commune || savedSettings.commune || "";
  const villageName = sInfo.village || savedSettings.village || "";

  // 2. ទាញពិន្ទុ មធ្យមភាគ និងចំណាត់ថ្នាក់
  let allScores = [];
  try { allScores = JSON.parse(localStorage.getItem('academic_scores') || '[]'); } catch(e) {}
  
  const rawMonth = period.replace(/^ខែ\s*/, '').trim();
  let matchedScore = allScores.filter(sc => {
    const isStu = String(sc.student_id) === String(studentId) || (sc.name && sc.name.trim() === student.name.trim());
    if (!isStu) return false;
    if (period === 'ប្រចាំឆ្នាំ') {
      return sc.month === 'ប្រចាំឆ្នាំ' || sc.month === 'annual' || sc.type === 'annual';
    }
    const scMonth = (sc.month || '').replace(/^ខែ\s*/, '').trim();
    return scMonth === rawMonth;
  }).pop();

  if (!matchedScore) {
    matchedScore = allScores.filter(sc => String(sc.student_id) === String(studentId)).pop() || {};
  }

  const avgVal = parseFloat(matchedScore.average || matchedScore.avg || student.avg || 0);
  const avgStr = avgVal > 0 ? avgVal.toFixed(2) : (student.avg ? student.avg.toFixed(2) : "......");
  const gradeStr = matchedScore.grade_letter || matchedScore.gradeLetter || matchedScore.mention || student.gradeLetter || (avgVal >= 8 ? 'ល្អ' : avgVal >= 6.5 ? 'ល្អបង្គួរ' : avgVal >= 5 ? 'មធ្យម' : 'ខ្សោយ');
  
  const studentsInClass = typeof window.getStudentsForClass === 'function'
      ? window.getStudentsForClass(curLevel, curRoom, academicYear)
      : (window.allStudents || []);
  const totalStus = studentsInClass.length || (window.rankingsDataList?.length || 0);
  const rawRank = matchedScore.rank || student.rank || "";
  const rankStr = rawRank ? (totalStus ? `${rawRank} / ${totalStus}` : String(rawRank)) : "......";

  // 3. ទាញទិន្នន័យអវត្តមាន (Absences)
  let permCount = 0, unexCount = 0;
  try {
    if (typeof window.getStudentAttendance === "function") {
      const att = window.getStudentAttendance(student.id || student.student_id, rawMonth);
      if (att && att.hasData) {
        permCount = att.permission || 0;
        unexCount = att.unexcused || 0;
      }
    }
    if (permCount === 0 && unexCount === 0) {
      const monthAtt = JSON.parse(localStorage.getItem(`attendance_${student.id || student.student_id}_${rawMonth}`)) || null;
      if (monthAtt) {
        permCount = monthAtt.perm || 0;
        unexCount = monthAtt.unex || 0;
      }
    }
    if (permCount === 0 && unexCount === 0) {
      const attRecords = JSON.parse(localStorage.getItem('attendance_records') || '[]');
      attRecords.forEach(rec => {
        const isStu = (String(rec.student_id) === String(student.id) || String(rec.student_id) === String(student.student_id) || rec.name === student.name);
        if (!isStu) return;
        const recMonth = (rec.month || '').replace(/^ខែ\s*/, '').trim();
        if (period === 'ប្រចាំឆ្នាំ' || recMonth === rawMonth) {
          if (rec.status === 'P' || rec.status === 'ច' || rec.status === 'មានច្បាប់') permCount++;
          else if (rec.status === 'A' || rec.status === 'អ' || rec.status === 'ឥតច្បាប់' || rec.status === 'អត់ច្បាប់') unexCount++;
        }
      });
    }
  } catch(e) {}

  // 4. បម្លែងលេខ និងកាលបរិច្ឆេទជាលេខខ្មែរ
  const khmerNumbers = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  const toKhmerNum = (str) => String(str || '').split('').map(n => khmerNumbers[n] || n).join('');
  
  let dobStr = "....................";
  if (student.dob) {
    let cleanDob = String(student.dob).trim();
    if (cleanDob.includes("T")) cleanDob = cleanDob.split("T")[0];
    if (cleanDob.includes("-")) {
      const p = cleanDob.split("-");
      if (p.length === 3) cleanDob = `${p[2]}/${p[1]}/${p[0]}`;
    }
    dobStr = toKhmerNum(cleanDob);
  }

  // 5. ទីកន្លែងកំណើត និងទីលំនៅបច្ចុប្បន្ន (Place of Birth & Current Residence Parsing)
  let pobVil = student.pob_village || "";
  let pobCom = student.pob_commune || "";
  let pobDis = student.pob_district || "";
  let pobPro = student.pob_province || "";
  if (!pobVil && !pobCom && !pobDis && !pobPro && (student.pob || student.birthplace)) {
    const rawPob = String(student.pob || student.birthplace).trim();
    const parts = rawPob.split(/[,،/\-]+/).map(p => p.trim()).filter(Boolean);
    if (parts.length >= 4) {
      pobVil = parts[0]; pobCom = parts[1]; pobDis = parts[2]; pobPro = parts[3];
    } else if (parts.length === 3) {
      pobVil = parts[0]; pobCom = parts[1]; pobPro = parts[2];
    } else if (parts.length === 2) {
      pobVil = parts[0]; pobPro = parts[1];
    } else {
      pobVil = rawPob;
    }
  }
  if (!pobPro && provinceName) pobPro = provinceName;
  if (!pobDis && districtName) pobDis = districtName;
  if (!pobCom && communeName) pobCom = communeName;

  let currVil = student.curr_village || student.village || "";
  let currCom = student.curr_commune || student.commune || "";
  let currDis = student.curr_district || student.district || "";
  let currPro = student.curr_province || student.province || "";
  if (!currVil && !currCom && !currDis && !currPro && (student.address || student.curr_address)) {
    const rawAddr = String(student.address || student.curr_address).trim();
    const parts = rawAddr.split(/[,،/\-]+/).map(p => p.trim()).filter(Boolean);
    if (parts.length >= 4) {
      currVil = parts[0]; currCom = parts[1]; currDis = parts[2]; currPro = parts[3];
    } else if (parts.length === 3) {
      currVil = parts[0]; currCom = parts[1]; currPro = parts[2];
    } else if (parts.length === 2) {
      currVil = parts[0]; currPro = parts[1];
    } else {
      currVil = rawAddr;
    }
  }
  if (!currPro && provinceName) currPro = provinceName;
  if (!currDis && districtName) currDis = districtName;
  if (!currCom && communeName) currCom = communeName;
  if (!currVil && villageName) currVil = villageName;

  // 6. ព័ត៌មានឪពុកម្តាយ និងអាណាព្យាបាល
  const fatherName = student.father_name || "";
  const fatherJob = student.father_job || "";
  const motherName = student.mother_name || "";
  const motherJob = student.mother_job || "";
  const guardianName = student.guardian_name || student.guardian || student.parent_name || fatherName || motherName || "";
  const guardianJob = student.guardian_job || (student.guardian_name ? "" : (fatherJob || motherJob || ""));

  // 7. កាលបរិច្ឆេទស្តង់ដារ MoEYS (Solar & Lunar Dates)
  const ctx = (window.CMSPrintManager && typeof window.CMSPrintManager.getStandardContext === 'function')
    ? window.CMSPrintManager.getStandardContext({ academicYear, grade })
    : null;
  const solarDateStr = ctx?.solarDateStr || (typeof window.getFormattedSolarDate === 'function' ? window.getFormattedSolarDate() : "ថ្ងៃទី.......ខែ..........ឆ្នាំ២០២៦");
  const lunarDateStr = ctx?.lunarDateStr || "ថ្ងៃ....................ខែ..................ឆ្នាំ...............ព.ស.២៥៧០";
  const savedConduct = localStorage.getItem(`conduct_${student.id}`) || student.conduct || "ល្អប្រសើរ";

  // ទំហំក្រដាស និងទិសដៅពី Controls (A4 Landscape Default)
  const paper = document.getElementById("tbPaperSize")?.value || "A4";
  const orient = document.getElementById("tbOrientation")?.value || "landscape";
  const isLandscape = orient === "landscape";

  let pageW = "297mm", pageH = "210mm";
  if (paper === "A4") { pageW = isLandscape ? "297mm" : "210mm"; pageH = isLandscape ? "210mm" : "297mm"; }
  else if (paper === "A3") { pageW = isLandscape ? "420mm" : "297mm"; pageH = isLandscape ? "297mm" : "420mm"; }
  else if (paper === "Legal") { pageW = isLandscape ? "355.6mm" : "215.9mm"; pageH = isLandscape ? "215.9mm" : "355.6mm"; }
  else if (paper === "Letter") { pageW = isLandscape ? "279.4mm" : "215.9mm"; pageH = isLandscape ? "215.9mm" : "279.4mm"; }

  // Classes ស្តង់ដារ MoEYS
  const pageClass = `bg-white shadow-2xl flex p-[8mm] sm:p-[10mm] shrink-0 box-border gap-[8mm] text-[#0000ff] mx-auto origin-top font-siemreap printable-page mb-6 transition-all rounded-sm`;
  const halfClass = "w-1/2 h-full border-[2.5px] border-double border-[#0000ff] p-[7mm] relative flex flex-col box-border justify-between";

  // ==========================================
  // ទំព័រទី១៖ គម្របមុខ និង ក្រោយ (Cover Spread)
  // ==========================================
  const coverHtml = `
    <div class="${pageClass}" style="width: ${pageW}; min-height: ${pageH}; height: ${isLandscape ? pageH : 'auto'};">
      <!-- គម្របក្រោយ (Back Cover) -->
      <div class="${halfClass} border-none text-[#0000ff] flex flex-col justify-center items-center text-center">
         <div class="opacity-20 text-[#0000ff] flex flex-col items-center">
            <i class="fa-solid fa-book-open-reader text-7xl mb-4"></i>
            <h3 class="font-moul text-sm">ក្រសួងអប់រំ យុវជន និងកីឡា</h3>
            <p class="text-xs font-siemreap mt-1">សៀវភៅតាមដានការសិក្សាផ្លូវការ</p>
         </div>
      </div>

      <!-- គម្របមុខ (Front Cover) -->
      <div class="${halfClass} text-center text-[#0000ff]">
        <div class="absolute top-2 left-2 font-moul text-[10px]">/\\</div>
        <div class="absolute top-2 right-2 font-moul text-[10px]">/\\</div>
        
        <div>
          <h3 class="font-moul text-[13px] mt-1 tracking-wide">ព្រះរាជាណាចក្រកម្ពុជា</h3>
          <h3 class="font-moul text-[13px] mt-0.5 tracking-wide">ជាតិ សាសនា ព្រះមហាក្សត្រ</h3>
          <div class="tracking-[3px] mt-[-2px] font-serif text-[11px]">𑁋𑁋𑁋 📖 𑁋𑁋𑁋</div>

          <h2 class="font-moul text-[16px] mt-6">ក្រសួងអប់រំ យុវជន និងកីឡា</h2>
          <h1 class="font-moul text-[22px] mt-2 text-[#0000ff] hover:bg-blue-50 outline-none cursor-text px-2 rounded" contenteditable="true">${schoolName}</h1>
          
          <p class="text-[11px] mt-2 font-siemreap font-bold">ទូរសព្ទសាលា៖ <span contenteditable="true" class="hover:bg-blue-50 outline-none cursor-text px-1 border-b border-dotted border-[#0000ff]">${schoolPhone ? toKhmerNum(schoolPhone) : '....................................'}</span></p>

          <h1 class="font-moul text-[26px] mt-7 leading-snug">សៀវភៅតាមដានការសិក្សា</h1>
        </div>
        
        <div class="my-auto text-left px-4 text-[13.5px] leading-relaxed space-y-2">
           <div class="flex items-center justify-between gap-2">
             <div class="flex items-center flex-1 min-w-0">
               <span class="whitespace-nowrap shrink-0 font-bold">របស់សិស្សឈ្មោះ៖</span>
               <span class="border-b border-dotted border-[#0000ff] flex-1 text-center font-moul truncate px-1 hover:bg-blue-50 outline-none cursor-text text-[#0000ff]" contenteditable="true">${student.name}</span>
             </div>
             <div class="flex items-center shrink-0">
               <span class="whitespace-nowrap shrink-0 ml-2 font-bold">អត្តលេខ៖</span>
               <span class="border-b border-dotted border-[#0000ff] min-w-[70px] text-center font-bold px-1 hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${toKhmerNum(student.id || student.student_id)}</span>
             </div>
           </div>
           <div class="flex items-center gap-2">
              <span class="whitespace-nowrap shrink-0 font-bold">ថ្នាក់ទី៖</span>
              <span class="border-b border-dotted border-[#0000ff] flex-1 text-center font-moul hover:bg-blue-50 outline-none cursor-text text-[#0000ff]" contenteditable="true">${grade}</span>
           </div>
        </div>

        <div class="mb-4 text-[13px] font-bold">
           ឆ្នាំសិក្សា៖ ២០<span class="border-b border-dotted border-[#0000ff] inline-block w-[36px] text-center hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${toKhmerNum(academicYear.substring(2, 4))}</span> - ២០<span class="border-b border-dotted border-[#0000ff] inline-block w-[36px] text-center hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${toKhmerNum(academicYear.substring(7, 9))}</span>
        </div>

        <div class="absolute bottom-2 left-2 font-moul text-[10px]">\\/</div>
        <div class="absolute bottom-2 right-2 font-moul text-[10px]">\\/</div>
      </div>
    </div>
  `;

  // ==========================================
  // ទំព័រទី២៖ បទបញ្ជា និង ជីវប្រវត្តិ (Rules & Bio Spread)
  // ==========================================
  const rulesHtml = `
    <div class="${pageClass}" style="width: ${pageW}; min-height: ${pageH}; height: ${isLandscape ? pageH : 'auto'};">
      <!-- ផ្នែកឆ្វេង៖ បទបញ្ជាផ្ទៃក្នុង -->
      <div class="${halfClass} text-[#0000ff]">
        <h3 class="font-moul text-center text-[12.5px] mt-0 leading-[1.6]">
           ចំណុចសំខាន់ៗនៃបទបញ្ជាផ្ទៃក្នុង<br>
           នាយកសាលា គ្រូបង្រៀន និងគ្រប់គ្រងសៀវភៅតាមដានការសិក្សា<br>
           ហើយត្រូវអនុវត្តតាមចំណុចខាងក្រោម៖
        </h3>
        <ol class="pl-4 text-[10.5px] text-justify mt-2 space-y-[5px] leading-relaxed">
           <li><b>១.</b> សិស្សត្រូវអនុវត្តតាមអាកប្បកិរិយា និងបទបញ្ជាផ្ទៃក្នុងរបស់សាលារៀនឱ្យបានម៉ឺងម៉ាត់។</li>
           <li><b>២.</b> សិស្សត្រូវស្លៀកពាក់ឯកសណ្ឋានឱ្យបានត្រឹមត្រូវ អាវស ខៀវ តាមឯកសណ្ឋានសាលា ត្រូវកាត់សក់ខ្លី និងសំអាតខ្លួនប្រាណ។ មិនត្រូវពាក់គ្រឿងអលង្ការមកសាលាដាច់ខាត។</li>
           <li><b>៣.</b> សិស្សត្រូវខិតខំរៀនសូត្រ គោរពកោតក្រែងលោកគ្រូ/អ្នកគ្រូ និងនាយកសាលា ត្រូវចូលរួមគ្រប់សកម្មភាពការងារសង្គម អនាម័យ យាមកាម...។ល។</li>
           <li><b>៤.</b> សិស្សឈប់កិច្ចការ ក្នុងពេលប្រឡងឆមាសត្រូវធ្លាក់ស្វ័យប្រវត្តិ។ សិស្សដែលមិនប្រឡង ៣ មុខវិជ្ជាក្នុងឆមាសណាមួយ ត្រូវចាត់ទុកថា "ធ្លាក់ចំណាត់ថ្នាក់"។</li>
           <li><b>៥.</b> សិស្សអាចឡើងថ្នាក់បាន លុះត្រាតែមានពិន្ទុមធ្យមភាគឡើងថ្នាក់ សីលធម៌រស់នៅ និងអវត្តមានតិចជាង ១៥ ថ្ងៃ។ សិស្សក្រោមមធ្យមភាគត្រូវប្រឡងឡើងថ្នាក់ ឬរៀនត្រួតថ្នាក់។</li>
           <li><b>៦.</b> សិស្សឈប់រៀនដោយមានឬគ្មានហេតុផលត្រឹមត្រូវពី ៣១ ទៅ ៦០ ពេល ត្រូវប្រឡងឡើងថ្នាក់ បើលើសពី ៦០ ពេល ត្រូវរៀនត្រួតថ្នាក់។</li>
           <li><b>៧.</b> សិស្សដែលឈប់រៀនជាប់គ្នាលើសពី ៦០ ពេល ត្រូវលុបឈ្មោះចេញពីបញ្ជីសាលារៀន។</li>
           <li><b>៨.</b> ចំពោះសិស្សផ្ទេរការសិក្សា នាយកសាលាត្រូវបូកសរុបលទ្ធផលនៃការសិក្សារបស់សិស្សឱ្យបានសព្វគ្រប់ រួចផ្ញើទៅសាលាថ្មី។</li>
           <li><b>៩.</b> ហាមផ្តាច់មិនឱ្យប្រគល់សៀវភៅនេះឱ្យសិស្សកាន់ដោយខ្លួនឯង។ ក្នុងករណីមានកំហុសឆ្គង នាយកសាលា និងគ្រូបង្រៀនជាអ្នកទទួលខុសត្រូវ។</li>
        </ol>
      </div>

      <!-- ផ្នែកស្តាំ៖ ជីវប្រវត្តិសិស្ស (Student Demographics) -->
      <div class="${halfClass} text-center text-[#0000ff]">
        <div class="absolute top-2 left-2 font-moul text-[10px]">/\\</div>
        <div class="absolute top-2 right-2 font-moul text-[10px]">/\\</div>
        
        <div>
          <h3 class="font-moul text-[11.5px] mt-0">ព្រះរាជាណាចក្រកម្ពុជា</h3>
          <h3 class="font-moul text-[11.5px] mt-0.5">ជាតិ សាសនា ព្រះមហាក្សត្រ</h3>
          <div class="tracking-[2px] mt-[-2px] text-[11px] font-serif">* * * 📖 * * *</div>

          <h2 class="font-moul text-[14px] mt-2">ក្រសួងអប់រំ យុវជន និងកីឡា</h2>
          <h1 class="font-moul text-[18px] mt-1 leading-snug">សៀវភៅតាមដានការសិក្សា</h1>
          <h2 class="font-moul text-[12px] mt-0.5">សាលាបឋមសិក្សាចំណេះទូទៅ</h2>
        </div>

        <div class="my-auto text-left px-1 text-[11px] leading-[1.95] space-y-0.5">
           <div class="flex items-center gap-1.5">
             <span class="whitespace-nowrap shrink-0 font-bold">សាលាបឋមសិក្សា៖</span>
             <span class="border-b border-dotted border-[#0000ff] flex-1 font-moul text-center truncate hover:bg-blue-50 outline-none cursor-text text-[#0000ff]" contenteditable="true">${schoolName}</span>
             <span class="whitespace-nowrap shrink-0 ml-1 font-bold">កម្រងសាលា៖</span>
             <span class="border-b border-dotted border-[#0000ff] w-[100px] text-center hover:bg-blue-50 outline-none cursor-text truncate" contenteditable="true">${clusterName || '....................'}</span>
           </div>

           <div class="flex items-center gap-1.5">
             <span class="whitespace-nowrap shrink-0 font-bold">ឈ្មោះសិស្ស៖</span>
             <span class="border-b border-dotted border-[#0000ff] flex-1 font-moul text-center truncate hover:bg-blue-50 outline-none cursor-text text-[#0000ff]" contenteditable="true">${student.name}</span>
             <span class="whitespace-nowrap shrink-0 ml-1 font-bold">ភេទ៖</span>
             <span class="border-b border-dotted border-[#0000ff] w-[50px] text-center font-bold hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${student.gender || 'ប្រុស'}</span>
           </div>

           <div class="flex items-center gap-1.5">
             <span class="whitespace-nowrap shrink-0 font-bold">រៀនថ្នាក់ទី៖</span>
             <span class="border-b border-dotted border-[#0000ff] flex-1 text-center font-bold hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${grade}</span>
             <span class="whitespace-nowrap shrink-0 ml-1 font-bold">អត្តលេខ៖</span>
             <span class="border-b border-dotted border-[#0000ff] min-w-[70px] text-center font-bold hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${toKhmerNum(student.id || student.student_id)}</span>
           </div>

           <!-- ទីកន្លែងកំណើត (Place of Birth) -->
           <div class="flex items-center gap-1.5">
             <span class="whitespace-nowrap shrink-0 font-bold">កើតថ្ងៃទី៖</span>
             <span class="border-b border-dotted border-[#0000ff] min-w-[100px] text-center font-bold hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${dobStr}</span>
             <span class="whitespace-nowrap shrink-0 ml-1 font-bold">នៅភូមិ/ក្រុម៖</span>
             <span class="border-b border-dotted border-[#0000ff] flex-1 truncate text-center hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${pobVil || '....................'}</span>
           </div>

           <div class="flex items-center gap-1.5">
             <span class="whitespace-nowrap shrink-0 font-bold">ឃុំ/សង្កាត់៖</span>
             <span class="border-b border-dotted border-[#0000ff] flex-1 text-center truncate hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${pobCom || '....................'}</span>
             <span class="whitespace-nowrap shrink-0 ml-1 font-bold">ស្រុក/ខណ្ឌ៖</span>
             <span class="border-b border-dotted border-[#0000ff] flex-1 text-center truncate hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${pobDis || '....................'}</span>
             <span class="whitespace-nowrap shrink-0 ml-1 font-bold">ខេត្ត/ក្រុង៖</span>
             <span class="border-b border-dotted border-[#0000ff] flex-1 text-center truncate hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${pobPro || '....................'}</span>
           </div>

           <!-- ឪពុក & ម្តាយ -->
           <div class="flex items-center gap-1.5">
             <span class="whitespace-nowrap shrink-0 font-bold">ឪពុកឈ្មោះ៖</span>
             <span class="border-b border-dotted border-[#0000ff] flex-1 text-center truncate hover:bg-blue-50 outline-none cursor-text font-bold" contenteditable="true">${fatherName || '....................'}</span>
             <span class="whitespace-nowrap shrink-0 ml-1 font-bold">មុខរបរ៖</span>
             <span class="border-b border-dotted border-[#0000ff] w-[120px] text-center truncate hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${fatherJob || '....................'}</span>
           </div>

           <div class="flex items-center gap-1.5">
             <span class="whitespace-nowrap shrink-0 font-bold">ម្តាយឈ្មោះ៖</span>
             <span class="border-b border-dotted border-[#0000ff] flex-1 text-center truncate hover:bg-blue-50 outline-none cursor-text font-bold" contenteditable="true">${motherName || '....................'}</span>
             <span class="whitespace-nowrap shrink-0 ml-1 font-bold">មុខរបរ៖</span>
             <span class="border-b border-dotted border-[#0000ff] w-[120px] text-center truncate hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${motherJob || '....................'}</span>
           </div>

           <!-- អាណាព្យាបាល -->
           <div class="flex items-center gap-1.5">
             <span class="whitespace-nowrap shrink-0 font-bold">អាណាព្យាបាល៖</span>
             <span class="border-b border-dotted border-[#0000ff] flex-1 text-center truncate hover:bg-blue-50 outline-none cursor-text font-bold" contenteditable="true">${guardianName || '....................'}</span>
             <span class="whitespace-nowrap shrink-0 ml-1 font-bold">មុខរបរ៖</span>
             <span class="border-b border-dotted border-[#0000ff] w-[120px] text-center truncate hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${guardianJob || '....................'}</span>
           </div>

           <!-- ទីលំនៅបច្ចុប្បន្ន (Current Residence) -->
           <div class="flex items-center gap-1.5">
             <span class="whitespace-nowrap shrink-0 font-bold">ស្នាក់នៅភូមិ/ក្រុម៖</span>
             <span class="border-b border-dotted border-[#0000ff] flex-1 text-center truncate hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${currVil || '....................'}</span>
             <span class="whitespace-nowrap shrink-0 ml-1 font-bold">ឃុំ/សង្កាត់៖</span>
             <span class="border-b border-dotted border-[#0000ff] w-[110px] text-center truncate hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${currCom || '....................'}</span>
           </div>

           <div class="flex items-center gap-1.5">
             <span class="whitespace-nowrap shrink-0 font-bold">ស្រុក/ខណ្ឌ៖</span>
             <span class="border-b border-dotted border-[#0000ff] flex-1 text-center truncate hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${currDis || '....................'}</span>
             <span class="whitespace-nowrap shrink-0 ml-1 font-bold">ខេត្ត/ក្រុង៖</span>
             <span class="border-b border-dotted border-[#0000ff] flex-1 text-center truncate hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${currPro || '....................'}</span>
           </div>
        </div>

        <div class="pt-2 text-center text-[12px] font-bold">
           ឆ្នាំសិក្សា៖ ២០<span class="border-b border-dotted border-[#0000ff] inline-block w-[32px] text-center hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${toKhmerNum(academicYear.substring(2, 4))}</span> - ២០<span class="border-b border-dotted border-[#0000ff] inline-block w-[32px] text-center hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${toKhmerNum(academicYear.substring(7, 9))}</span>
        </div>

        <div class="absolute bottom-2 left-2 font-moul text-[10px]">\\/</div>
        <div class="absolute bottom-2 right-2 font-moul text-[10px]">\\/</div>
      </div>
    </div>
  `;

  // ==========================================
  // ទំព័រទី៣៖ តារាងពិន្ទុ & លទ្ធផលសិក្សា
  // ==========================================
  const subjects = [
    "អាន", "សរសេរតាមអាន", "តែងសេចក្តី", "មេសូត្រ", "អក្សរផ្ចង់", 
    "គណិតវិទ្យា", "វិទ្យាសាស្ត្រអនុវត្ត", "ប្រវត្តិវិទ្យា", "ភូមិវិទ្យា", 
    "សីលធម៌ ពលរដ្ឋវិជ្ជា", "គំនូរ", "កិច្ចការ-ផ្ទះ", "អប់រំកាយ-កីឡា", 
    "សិល្បៈបំណិនសិល្បៈ", "សីលធម៌រស់នៅ", "សុខភាព-អនាម័យ"
  ];

  const getTickMark = (score) => {
    if (score == null || score === "") return ["", "", "", ""];
    const s = parseFloat(score);
    if (isNaN(s)) return ["", "", "", ""];
    if (s >= 8) return ["✔", "", "", ""];
    if (s >= 6.5) return ["", "✔", "", ""];
    if (s >= 5) return ["", "", "✔", ""];
    return ["", "", "", "✔"];
  };

  const subjectKeyAliases = {
    "អាន": ["k_read", "read", "reading", "អាន", "ភាសាខ្មែរ-អាន", "រៀនអាន និងមេសូត្រ"],
    "សរសេរតាមអាន": ["k_write", "dictation", "dict", "សរសេរតាមអាន", "សរសេរ", "សរសេរតាមអាន និងសំណួរ", "អក្ខរាវិរុទ្ធ"],
    "តែងសេចក្តី": ["k_compose", "compose", "composition", "តែងសេចក្តី", "តែងសេចក្ដី"],
    "មេសូត្រ": ["k_recite", "recite", "poem", "មេសូត្រ"],
    "អក្សរផ្ចង់": ["k_calligraphy", "calligraphy", "អក្សរផ្ចង់"],
    "គណិតវិទ្យា": ["math", "m_num", "m_alg", "m_geo", "គណិតវិទ្យា", "គណិត"],
    "វិទ្យាសាស្ត្រអនុវត្ត": ["s_bio", "s_phy", "s_chem", "science", "វិទ្យាសាស្ត្រ", "វិទ្យាសាស្ត្រអនុវត្ត"],
    "ប្រវត្តិវិទ្យា": ["ss_hist", "history", "ប្រវត្តិវិទ្យា", "ប្រវត្តិ"],
    "ភូមិវិទ្យា": ["ss_geo", "geography", "ភូមិវិទ្យា", "ភូមិ"],
    "សីលធម៌ ពលរដ្ឋវិជ្ជា": ["ss_moral", "moral", "សីលធម៌-ពលរដ្ឋ", "សីលធម៌", "ពលរដ្ឋ", "សុជីវធម៌ និងពលរដ្ឋវិជ្ជា"],
    "គំនូរ": ["art", "drawing", "គំនូរ", "គំនូរ និង ហត្ថកម្ម"],
    "កិច្ចការ-ផ្ទះ": ["homework", "life_skill", "កិច្ចការ-ផ្ទះ", "កិច្ចការផ្ទះ"],
    "អប់រំកាយ-កីឡា": ["pe_sport", "sport", "pe", "អប់រំកាយ", "កីឡា", "អប់រំកាយ-កីឡា", "អប់រំកាយ និងកីឡា"],
    "សិល្បៈបំណិនសិល្បៈ": ["life_skill", "art", "បំណិនជីវិត", "សិល្បៈបំណិនសិល្បៈ"],
    "សីលធម៌រស់នៅ": ["morality", "living_moral", "សីលធម៌រស់នៅ"],
    "សុខភាព-អនាម័យ": ["pe_health", "health", "hygiene", "សុខភាព", "សុខភាព-អនាម័យ"]
  };

  const findSubScore = (sub) => {
    const aliases = subjectKeyAliases[sub] || [sub];
    const sources = [matchedScore.scores, matchedScore.subject_scores, matchedScore, student.scores];
    for (const src of sources) {
      if (!src || typeof src !== 'object') continue;
      for (const al of aliases) {
        if (src[al] !== undefined && src[al] !== null && src[al] !== '') {
          return src[al];
        }
      }
    }
    return null;
  };

  const buildResultTable = (title, isAnnual) => {
    let tbody = subjects.map(sub => {
      let scoreVal = findSubScore(sub);
      let ticks = getTickMark(scoreVal);

      return `
        <tr class="h-[16px]">
          <td class="text-left px-[4px] border border-[#0000ff] font-siemreap font-bold">${sub}</td>
          <td class="border border-[#0000ff] text-center font-bold text-rose-600 text-[12px] cursor-pointer hover:bg-blue-100 tb-tick-cell" onclick="toggleBookTick(this)">${ticks[0]}</td>
          <td class="border border-[#0000ff] text-center font-bold text-rose-600 text-[12px] cursor-pointer hover:bg-blue-100 tb-tick-cell" onclick="toggleBookTick(this)">${ticks[1]}</td>
          <td class="border border-[#0000ff] text-center font-bold text-rose-600 text-[12px] cursor-pointer hover:bg-blue-100 tb-tick-cell" onclick="toggleBookTick(this)">${ticks[2]}</td>
          <td class="border border-[#0000ff] text-center font-bold text-rose-600 text-[12px] cursor-pointer hover:bg-blue-100 tb-tick-cell" onclick="toggleBookTick(this)">${ticks[3]}</td>
          <td class="border border-[#0000ff] text-left px-1 text-[8.5px] hover:bg-blue-50 outline-none cursor-text" contenteditable="true"></td>
        </tr>
      `;
    }).join("");

    const displayTitle = isAnnual ? `លទ្ធផលនៃការសិក្សាប្រចាំឆ្នាំសិក្សា ២០<span class="font-sans" contenteditable="true">${toKhmerNum(academicYear.substring(2, 4))}</span>-២០<span class="font-sans" contenteditable="true">${toKhmerNum(academicYear.substring(7, 9))}</span>` : `លទ្ធផលនៃការសិក្សាប្រចាំ ${title}`;

    return `
      <div class="flex flex-col h-full justify-between">
        <div>
          <h3 class="font-moul text-center text-[12.5px] mb-[4px] text-[#0000ff] outline-none hover:bg-blue-50 cursor-text" contenteditable="true">${displayTitle}</h3>
          <table class="w-full border-collapse border border-[#0000ff] text-[10px] text-center text-[#0000ff]">
            <tr class="bg-blue-50/50 border border-[#0000ff]">
              <th rowspan="2" class="w-[30%] border border-[#0000ff] font-moul text-[10px] font-normal">មុខវិជ្ជា</th>
              <th colspan="4" class="border border-[#0000ff] font-moul text-[10px] font-normal">និទ្ទេស</th>
              <th rowspan="2" class="w-[26%] border border-[#0000ff] font-moul text-[8.5px] font-normal leading-tight">ចំណុចដែលត្រូវជួយ<br>ពង្រឹងបន្ថែម</th>
            </tr>
            <tr class="bg-blue-50/50 border border-[#0000ff]">
              <th class="w-[11%] border border-[#0000ff] font-moul text-[8.5px] font-normal">ល្អ<br><span class="font-sans text-[7px]">ពិន្ទុ 8-10</span></th>
              <th class="w-[11%] border border-[#0000ff] font-moul text-[8.5px] font-normal">ល្អបង្គួរ<br><span class="font-sans text-[7px]">ពិន្ទុ 6.5-7.99</span></th>
              <th class="w-[11%] border border-[#0000ff] font-moul text-[8.5px] font-normal">មធ្យម<br><span class="font-sans text-[7px]">ពិន្ទុ 5-6.49</span></th>
              <th class="w-[11%] border border-[#0000ff] font-moul text-[8.5px] font-normal">ខ្សោយ<br><span class="font-sans text-[7px]">ពិន្ទុ 0-4.99</span></th>
            </tr>
            ${tbody}
          </table>

          <div class="text-[10.5px] mt-[6px] leading-[1.85] text-left text-[#0000ff]">
             មធ្យមភាគ៖ <span class="border-b border-dotted border-[#0000ff] inline-block min-w-[45px] text-center font-bold text-rose-600 hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${avgStr}</span> 
             ចំណាត់ថ្នាក់ទី៖ <span class="border-b border-dotted border-[#0000ff] inline-block min-w-[55px] text-center font-bold text-rose-600 hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${rankStr}</span> 
             និទ្ទេស៖ <span class="border-b border-dotted border-[#0000ff] inline-block min-w-[45px] text-center font-bold text-rose-600 hover:bg-blue-50 outline-none cursor-text font-moul text-[9px]" contenteditable="true">${gradeStr}</span><br> 
             អវត្តមានមានច្បាប់ <span class="border-b border-dotted border-[#0000ff] inline-block w-[30px] text-center hover:bg-blue-50 outline-none cursor-text font-bold text-rose-600" contenteditable="true">${toKhmerNum(permCount)}</span> ដង អត់ច្បាប់ <span class="border-b border-dotted border-[#0000ff] inline-block w-[30px] text-center hover:bg-blue-50 outline-none cursor-text font-bold text-rose-600" contenteditable="true">${toKhmerNum(unexCount)}</span> ដង<br>
             វិន័យសីលធម៌៖ <span class="border-b border-dotted border-[#0000ff] inline-block w-[75%] hover:bg-blue-50 outline-none cursor-text font-bold text-blue-900" contenteditable="true">${savedConduct}</span>
          </div>
        </div>

        <!-- ✍️ ហត្ថលេខា និងកាលបរិច្ឆេទ MoEYS ស្តង់ដារ (Signatures & Dates) ✍️ -->
        <div class="mt-2 pt-2 border-t border-dotted border-[#0000ff] text-center text-[#0000ff]">
           <div class="flex justify-between items-start text-[10px]">
             <!-- នាយកសាលា -->
             <div class="w-1/3">
               <p class="font-siemreap font-bold">បានឃើញ និងឯកភាព</p>
               <p class="font-moul text-[9px] mt-0.5">នាយក/នាយិកាសាលា</p>
               <div class="h-10 flex items-center justify-center"></div>
               ${principalName ? `<p class="font-moul text-[9.5px] hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${principalName}</p>` : `<p class="text-[9px] text-blue-900/60">....................................</p>`}
             </div>

             <!-- មាតាបិតា -->
             <div class="w-1/3 px-1">
               <p class="font-moul text-[8.5px]">មតិមាតាបិតា/អាណាព្យាបាល</p>
               <div class="h-10 flex items-center justify-center"></div>
               <p class="text-[9px] text-blue-900/60">....................................</p>
             </div>

             <!-- គ្រូបន្ទុកថ្នាក់ -->
             <div class="w-1/3">
               <p class="text-[9px] font-bold hover:bg-blue-50 outline-none cursor-text truncate" contenteditable="true">${solarDateStr}</p>
               <p class="font-moul text-[9px] mt-0.5">គ្រូបន្ទុកថ្នាក់</p>
               <div class="h-10 flex items-center justify-center"></div>
               <p class="font-moul text-[9.5px] hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${teacherName || 'លោកគ្រូ អ្នកគ្រូ'}</p>
             </div>
           </div>
        </div>
      </div>
    `;
  };

  const annualInstructions = `
    <div class="flex flex-col h-full justify-between">
      <div>
        <h3 class="font-moul text-center text-[13.5px] mb-2 text-[#0000ff]">សេចក្តីណែនាំ</h3>
        <p class="text-[11px] text-justify leading-relaxed indent-4">
          សូមលោកគ្រូ/អ្នកគ្រូ មាតាបិតា ឬអាណាព្យាបាលសិស្ស មេត្តាអាននូវសេចក្តីណែនាំពីរបៀបបំពេញខាងក្រោម៖
        </p>
        <div class="text-[11px] text-justify leading-relaxed mt-2 space-y-2">
          <p><span class="font-bold">១. ខ្ទង់និទ្ទេស៖</span> សូមលោកគ្រូ-អ្នកគ្រូគូសសញ្ញា " ✔ " នៅក្នុងខ្ទង់និទ្ទេសតាមលទ្ធផលនៃការសិក្សារបស់សិស្ស។</p>
          <div>
            <span class="font-bold">២. ខ្ទង់ចំណុចដែលត្រូវជួយបន្ថែម៖</span><br>
            <p class="mt-1 pl-3"><span class="font-bold">ក. ចំពោះគ្រូ៖</span> អាចសរសេរបញ្ជាក់ឱ្យបានច្បាស់ អំពីមេរៀនដែលសិស្សទទួលបានលទ្ធផលមិនល្អ "ខ្សោយ" ឧទាហរណ៍៖ ទទួលបានលទ្ធផលខ្សោយ ដូចនេះគួរសរសេរមេរៀនអ្វីខ្លះ? ឬអាចគ្រាន់តែគូសសញ្ញា " ✔ " នៅក្នុងខ្ទង់ដែលត្រូវជួយបន្ថែមចំពោះមុខវិជ្ជាណាដែលទទួលបានលទ្ធផលមិនល្អ "ខ្សោយ" ដូចជាសិស្សបាននិទ្ទេសខ្សោយ រៀនអាន-ពណ៌នាត្រា-វិទ្យាសាស្ត្រអនុវត្តកិច្ចដើម ។ល។</p>
            <p class="mt-1 pl-3"><span class="font-bold">ខ. ចំពោះមាតាបិតាសិស្ស ឬអាណាព្យាបាលសិស្ស៖</span> សូមយកចិត្តទុកដាក់អានលើខ្ទង់ "ចំណុចដែលត្រូវជួយបន្ថែម" នេះ ដែលជាការផ្តល់ព័ត៌មានពីលទ្ធផលនៃការសិក្សារបស់កូន ហើយលោកគ្រូ/អ្នកគ្រូ សូមធ្វើការចូលរួមជួយពីសំណាក់លោក/លោកស្រី មេត្តាជួយផ្តល់មតិយោបល់ផ្សេងៗ បើពុំមាននៃការសិក្សារបស់កូនអស់លោក/លោកស្រីផង។</p>
          </div>
        </div>
      </div>
      <div class="mt-auto flex flex-col items-center pb-2 opacity-60">
        <i class="fa-solid fa-book-open text-3xl mb-1"></i>
        <span class="text-[10px] font-moul">ក្រសួងអប់រំ យុវជន និងកីឡា</span>
      </div>
    </div>
  `;

  // ផ្ទាំងទំនាក់ទំនង និងតាមដានការសិក្សាប្រចាំខែ (Monthly Communications Spread for MoEYS standard)
  const monthlyCommunicationsHtml = `
    <div class="flex flex-col h-full justify-between text-[#0000ff]">
      <div>
        <h3 class="font-moul text-center text-[12.5px] mb-2">ការតាមដានការសិក្សា និងទំនាក់ទំនងប្រចាំ ${period}</h3>
        <p class="text-[10.5px] leading-relaxed text-justify mb-2 indent-3">
          ទំព័រនេះសម្រាប់គ្រូ និងមាតាបិតា ឬអាណាព្យាបាល ធ្វើការផ្លាស់ប្តូរព័ត៌មានអំពីការខិតខំរៀនសូត្រ អាកប្បកិរិយា និងការចូលរួមរបស់សិស្ស៖
        </p>

        <!-- Weekly Progress Tracking Table -->
        <table class="w-full border-collapse border border-[#0000ff] text-[10px] text-center mb-3">
          <tr class="bg-blue-50/50">
            <th class="border border-[#0000ff] p-1 font-moul text-[9px] w-[18%]">សប្តាហ៍</th>
            <th class="border border-[#0000ff] p-1 font-moul text-[9px] w-[50%]">ការកត់សម្គាល់របស់គ្រូ</th>
            <th class="border border-[#0000ff] p-1 font-moul text-[9px] w-[32%]">ហត្ថលេខាអាណាព្យាបាល</th>
          </tr>
          ${[1, 2, 3, 4].map(w => `
            <tr class="h-[26px]">
              <td class="border border-[#0000ff] font-bold">សប្តាហ៍ទី ${toKhmerNum(w)}</td>
              <td class="border border-[#0000ff] text-left px-2 hover:bg-blue-50 outline-none cursor-text text-[9.5px]" contenteditable="true"></td>
              <td class="border border-[#0000ff] text-center hover:bg-blue-50 outline-none cursor-text text-[9px] text-blue-900/60" contenteditable="true">...........................</td>
            </tr>
          `).join('')}
        </table>

        <!-- Parent Feedback & Notes -->
        <div class="border border-[#0000ff] rounded p-2 text-[10.5px] leading-relaxed">
          <p class="font-moul text-[9.5px] mb-1">មតិយោបល់ ឬសំណូមពររបស់មាតាបិតា-អាណាព្យាបាលសិស្ស៖</p>
          <div class="h-16 text-[10px] leading-relaxed hover:bg-blue-50 outline-none cursor-text" contenteditable="true">
            ............................................................................................................................................................................................................................................................................................................
          </div>
        </div>
      </div>

      <div class="mt-auto pt-2 border-t border-dotted border-[#0000ff] text-center">
         <div class="flex justify-between items-center text-[10px] px-3">
           <span class="font-bold">កាលបរិច្ឆេទពិនិត្យ៖ ថ្ងៃទី.......ខែ..........ឆ្នាំ២០.......</span>
           <span class="font-moul text-[9px]">ហត្ថលេខា ឬស្នាមមេដៃអាណាព្យាបាល</span>
         </div>
      </div>
    </div>
  `;

  let resultsHtml = "";
  if (period === "ប្រចាំឆ្នាំ") {
    resultsHtml = `
      <div class="${pageClass}" style="width: ${pageW}; min-height: ${pageH}; height: ${isLandscape ? pageH : 'auto'};">
        <div class="${halfClass}">${buildResultTable("", true)}</div>
        <div class="${halfClass} text-[#0000ff]">${annualInstructions}</div>
      </div>
    `;
  } else {
    resultsHtml = `
      <div class="${pageClass}" style="width: ${pageW}; min-height: ${pageH}; height: ${isLandscape ? pageH : 'auto'};">
        <div class="${halfClass}">${buildResultTable(period, false)}</div>
        <div class="${halfClass}">${monthlyCommunicationsHtml}</div>
      </div>
    `;
  }

  // បញ្ចូល HTML ទំព័រទាំង ៣ ទៅក្នុង Preview Container ដោយភ្ជាប់ជាមួយ Zoom Wrapper
  const zoomScale = (window.currentTbZoom || 85) / 100;
  container.innerHTML = `
    <div id="tbPagesWrapper" class="transition-transform duration-200 flex flex-col items-center gap-8 py-4" style="transform: scale(${zoomScale}); transform-origin: top center;">
      ${coverHtml}
      ${rulesHtml}
      ${resultsHtml}
    </div>
  `;
}

// មុខងារសម្រាប់ចុច Tick (✔) ដោយផ្ទាល់លើតារាង
function toggleBookTick(cell) {
  const row = cell.parentElement;
  const allTickCells = row.querySelectorAll('.tb-tick-cell');
  const hasTick = cell.innerText.trim() === "✔";
  
  allTickCells.forEach(c => c.innerText = "");
  if (!hasTick) {
    cell.innerText = "✔";
  }
}

// ==========================================
// មុខងារ Print / Word Export ជាមួយ Toolbar សារ៉េក្រដាស (Print Adjustment Window)
// ==========================================
function executeTrackingBookPrint(actionType) {
  const container = document.getElementById("tbPreviewContainer");
  const studentSelect = document.getElementById("tbStudentSelect");
  
  if (!studentSelect || !studentSelect.value || container.innerHTML.includes("គ្មានសិស្ស")) {
    alert("⚠️ សូមជ្រើសរើសសិស្សឱ្យបានត្រឹមត្រូវសិន!");
    return;
  }
  
  const studentName = studentSelect.options[studentSelect.selectedIndex].text.split('(')[0].trim();
  const pages = container.querySelectorAll('.printable-page');
  let cleanHtml = "";
  
  pages.forEach(p => {
    let clone = p.cloneNode(true);
    clone.querySelectorAll('.no-print').forEach(el => el.remove());
    cleanHtml += clone.outerHTML;
  });

  const paperSize = document.getElementById("tbPaperSize")?.value || "A4";
  const orientation = document.getElementById("tbOrientation")?.value || "landscape";
  const defaultZoom = ((window.currentTbZoom || 85) / 100).toFixed(2);

  const isLandscape = orientation === 'landscape';
  let defaultWidth = isLandscape ? '297mm' : '210mm';
  if (paperSize === 'A3') defaultWidth = isLandscape ? '420mm' : '297mm';
  else if (paperSize === 'Legal') defaultWidth = isLandscape ? '355.6mm' : '215.9mm';
  else if (paperSize === 'Letter') defaultWidth = isLandscape ? '279.4mm' : '215.9mm';

  if (actionType === "word") {
    const wordDocument = `
      <!DOCTYPE html>
      <html lang="km">
      <head>
        <meta charset="utf-8">
        <title>សៀវភៅតាមដាន - ${studentName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Moul&family=Siemreap&display=swap');
          @page { size: ${defaultWidth} 210mm; mso-page-orientation: ${orientation}; margin: 8mm; }
          body { font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif; color: #0000ff; }
          .font-moul { font-family: 'Khmer OS Muol Light', 'Khmer OS Muol', 'Moul', serif !important; }
          .printable-page { page-break-after: always; break-after: page; margin-bottom: 25px; }
        </style>
      </head>
      <body>
        ${cleanHtml}
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff', wordDocument], { type: 'application/msword' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `សៀវភៅតាមដាន_${studentName.replace(/ /g, '_')}.doc`;
    link.click();
    return;
  }

  // ផ្ទាំង Interactive Print Preview Window ជាមួយ Toolbar សារ៉េក្រដាស (Print Paper Adjustment)
  const printDocument = `
    <!DOCTYPE html>
    <html lang="km">
    <head>
      <meta charset="utf-8">
      <title>សៀវភៅតាមដាន - ${studentName}</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Moul&family=Siemreap:wght@400;700&display=swap" rel="stylesheet">
      <style id="dynamic-page-style">
        @page { size: ${paperSize} ${orientation}; margin: 6mm; }
      </style>
      <style>
        * { 
          box-sizing: border-box !important; 
          -webkit-print-color-adjust: exact !important; 
          print-color-adjust: exact !important; 
          font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif; 
        }
        html, body { 
          margin: 0; 
          padding: 0; 
          background: #f1f5f9; 
          color: #0000ff; 
          min-height: 100vh; 
        }
        .font-moul { 
          font-family: 'Khmer OS Muol Light', 'Khmer OS Muol', 'Moul', serif !important; 
          font-weight: normal; 
        }
        .font-siemreap { 
          font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif !important; 
        }
        
        .print-toolbar { 
          position: fixed; 
          top: 0; 
          left: 0; 
          right: 0; 
          z-index: 9999; 
          background: white; 
          padding: 10px 18px; 
          border-bottom: 1px solid #cbd5e1; 
          box-shadow: 0 4px 15px rgba(0,0,0,0.06); 
          display: flex; 
          flex-wrap: wrap; 
          justify-content: center; 
          align-items: center; 
          gap: 16px; 
        }
        body { padding-top: 65px; }
        
        @media print {
            .no-print { display: none !important; }
            body { background: #fff !important; padding-top: 0 !important; }
            #print-wrapper { margin: 0 !important; box-shadow: none !important; border-radius: 0 !important; width: 100% !important; height: auto !important; padding: 0 !important; background: transparent !important; }
            .printable-page { page-break-after: always !important; break-after: page !important; margin: 0 auto !important; box-shadow: none !important; }
        }
        
        #print-wrapper { 
            padding: 10px 0; 
            width: 100%; 
            margin: 0 auto; 
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
        }

        #content-scaler {
            transform-origin: top center;
            transition: transform 0.15s ease;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 25px;
        }

        .printable-page {
            box-shadow: 0 10px 30px rgba(0,0,0,0.12);
            background: white;
            border-radius: 4px;
        }
      </style>
    </head>
    <body>
      <!-- ផ្ទាំង Toolbar សម្រាប់សារ៉េក្រដាស (Print Paper & Zoom Adjustment Toolbar) -->
      <div class="no-print print-toolbar font-siemreap">
          <div class="flex items-center gap-2">
              <span class="font-bold text-xs text-slate-700"><i class="fa-solid fa-file text-slate-400"></i> ទំហំក្រដាស៖</span>
              <select id="paperSize" onchange="updateSettings()" class="bg-slate-50 border border-slate-300 text-slate-700 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 py-1.5 px-2.5 outline-none font-bold cursor-pointer">
                  <option value="A4" ${paperSize === 'A4' ? 'selected' : ''}>A4</option>
                  <option value="A3" ${paperSize === 'A3' ? 'selected' : ''}>A3</option>
                  <option value="Legal" ${paperSize === 'Legal' ? 'selected' : ''}>Legal</option>
                  <option value="Letter" ${paperSize === 'Letter' ? 'selected' : ''}>Letter</option>
              </select>
          </div>
          <div class="w-px h-5 bg-slate-300"></div>
          <div class="flex items-center gap-2">
              <span class="font-bold text-xs text-slate-700"><i class="fa-solid fa-rotate text-slate-400"></i> ទិសដៅ៖</span>
              <select id="paperOrientation" onchange="updateSettings()" class="bg-slate-50 border border-slate-300 text-slate-700 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 py-1.5 px-2.5 outline-none font-bold cursor-pointer">
                  <option value="landscape" ${orientation === 'landscape' ? 'selected' : ''}>ផ្តេក (Landscape)</option>
                  <option value="portrait" ${orientation === 'portrait' ? 'selected' : ''}>បញ្ឈរ (Portrait)</option>
              </select>
          </div>
          <div class="w-px h-5 bg-slate-300"></div>
          <div class="flex items-center gap-2">
              <span class="font-bold text-xs text-slate-700"><i class="fa-solid fa-magnifying-glass text-slate-400"></i> មាត្រដ្ឋាន (Scale)៖</span>
              <input type="range" id="zoomLevel" min="0.4" max="1.5" step="0.02" value="${defaultZoom}" oninput="updateSettings()" class="w-28 cursor-pointer">
              <span id="zoomDisplay" class="font-mono text-xs font-bold text-blue-600 w-12 bg-blue-50 py-1 rounded text-center">${Math.round(defaultZoom * 100)}%</span>
          </div>
          <div class="w-px h-5 bg-slate-300"></div>
          <button onclick="window.print()" class="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 active:scale-95">
              <i class="fa-solid fa-print"></i> ព្រីនឥឡូវនេះ
          </button>
      </div>

      <div id="print-wrapper">
        <div id="content-scaler" style="transform: scale(${defaultZoom});">
          ${cleanHtml}
        </div>
      </div>

      <script>
        function updateSettings() {
          const paper = document.getElementById('paperSize').value;
          const orient = document.getElementById('paperOrientation').value;
          const zoom = parseFloat(document.getElementById('zoomLevel').value);
          
          document.getElementById('zoomDisplay').textContent = Math.round(zoom * 100) + '%';
          
          const style = document.getElementById('dynamic-page-style');
          style.innerHTML = '@page { size: ' + paper + ' ' + orient + '; margin: 6mm; }';
          
          const scaler = document.getElementById('content-scaler');
          scaler.style.transform = 'scale(' + zoom + ')';
        }
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank', 'width=1250,height=850');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(printDocument);
    printWindow.document.close();
  }
}

window.loadTrackingBookView = openTrackingBookModal;
window.openTrackingBookModal = openTrackingBookModal;
window.openReportCardsModal = openTrackingBookModal;
window.closeTrackingBookModal = closeTrackingBookModal;
