
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
// ឯកសារ js/tracking-book.js - សៀវភៅតាមដានការសិក្សា (Update ថ្មី: ទាញទិន្នន័យផ្ទាល់ និងទម្រង់ប្រចាំឆ្នាំ)
// ==========================================================

function openTrackingBookModal() {
  let modal = document.getElementById("trackingBookModal");
  if (!modal) {
    const modalHtml = `
      <div id="trackingBookModal" class="fixed inset-0 z-[6000] bg-black/60 hidden flex-col items-center justify-center p-2 md:p-4 font-siemreap fade-in no-print" style="backdrop-filter: none !important;">
        <div class="bg-slate-200 rounded-3xl shadow-2xl w-full max-w-[1200px] h-[95vh] flex flex-col overflow-hidden border border-slate-300">
          
          <div class="p-3 md:p-5 border-b border-slate-300 bg-white flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 shrink-0 shadow-sm z-10">
            <div class="flex items-center gap-3">
              <button onclick="window.closeTrackingBookModal()" class="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-2 font-bold text-xs transition shadow-sm active:scale-95 shrink-0" title="ថយក្រោយ"><i class="fa-solid fa-arrow-left text-sm"></i> <span>ថយក្រោយ</span></button>
              <h2 class="font-black text-base md:text-xl text-slate-800 flex items-center gap-2 sm:gap-3">
                <div class="w-8 h-8 md:w-10 md:h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm text-sm"><i class="fa-solid fa-book-open-reader"></i></div>
                សៀវភៅតាមដានការសិក្សា
              </h2>
            </div>
            
            <div class="flex flex-wrap items-center gap-2 md:gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200 w-full xl:w-auto">
              <div class="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2 py-1.5 shadow-sm">
                <span class="text-[10px] font-bold text-slate-500 uppercase ml-1">ថ្នាក់ទី</span>
                <select id="tbLevelSelect" onchange="updateTbStudentSelect()" class="border-none bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer">
                  ${(typeof window.getAllGradesList === 'function' ? window.getAllGradesList() : ["ថ្នាក់ទី ១", "ថ្នាក់ទី ២", "ថ្នាក់ទី ៣", "ថ្នាក់ទី ៤", "ថ្នាក់ទី ៥", "ថ្នាក់ទី ៦"]).map(g => `<option value="${g}">${g}</option>`).join('')}
                </select>
                <select id="tbRoomSelect" onchange="updateTbStudentSelect()" class="border-none bg-transparent text-xs font-bold text-indigo-700 outline-none cursor-pointer">
                  ${(typeof window.getAllRoomsList === 'function' ? window.getAllRoomsList() : ["«ក»", "«ខ»", "«គ»", "«ឃ»"]).map(r => `<option value="${r}">${r}</option>`).join('')}
                </select>
              </div>

              <div class="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2 py-1.5 shadow-sm flex-1 min-w-[150px]">
                <i class="fa-solid fa-user-graduate text-slate-400 text-xs ml-1"></i>
                <select id="tbStudentSelect" onchange="renderTrackingBookPreview()" class="w-full border-none bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer truncate">
                  <option value="">-- ជ្រើសរើសសិស្ស --</option>
                </select>
              </div>

              <div class="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2 py-1.5 shadow-sm">
                <i class="fa-solid fa-calendar text-slate-400 text-xs ml-1"></i>
                <select id="tbPeriodSelect" onchange="renderTrackingBookPreview()" class="border-none bg-transparent text-xs font-bold text-blue-700 outline-none cursor-pointer">
                  <option value="ខែ តុលា">ខែ តុលា</option><option value="ខែ វិច្ឆិកា">ខែ វិច្ឆិកា</option><option value="ខែ ធ្នូ">ខែ ធ្នូ</option>
                  <option value="ខែ មករា" selected>ខែ មករា</option><option value="ខែ កុម្ភៈ">ខែ កុម្ភៈ</option><option value="ខែ មីនា">ខែ មីនា</option>
                  <option value="ខែ មេសា">ខែ មេសា</option><option value="ខែ ឧសភា">ខែ ឧសភា</option><option value="ខែ មិថុនា">ខែ មិថុនា</option><option value="ខែ កក្កដា">ខែ កក្កដា</option>
                  <option value="ប្រចាំឆ្នាំ">ប្រចាំឆ្នាំ</option>
                </select>
              </div>

              <!-- Zoom Controls -->
              <div class="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2 py-1 shadow-sm">
                <button type="button" onclick="window.tbZoomOut()" class="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition active:scale-95" title="បង្រួម"><i class="fa-solid fa-minus text-[10px]"></i></button>
                <span id="tbZoomDisplay" class="text-xs font-bold text-slate-700 min-w-[42px] text-center">85%</span>
                <button type="button" onclick="window.tbZoomIn()" class="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition active:scale-95" title="ពង្រីក"><i class="fa-solid fa-plus text-[10px]"></i></button>
                <button type="button" onclick="window.tbZoomFit()" class="px-1.5 py-0.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold ml-1 transition" title="កំណត់ទំហំសមរម្យ">Fit</button>
              </div>

              <div class="w-px h-6 bg-slate-300 mx-1 hidden md:block"></div>

              <button onclick="executeTrackingBookPrint('print')" class="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-2">
                <i class="fa-solid fa-print"></i> បោះពុម្ព
              </button>
              <button onclick="executeTrackingBookPrint('word')" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-2">
                <i class="fa-solid fa-file-word"></i> Word
              </button>
            </div>
            
            <button onclick="closeTrackingBookModal()" class="w-10 h-10 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white rounded-xl font-bold transition flex justify-center items-center shadow-sm shrink-0 absolute top-4 right-4 xl:static">
              <i class="fa-solid fa-xmark text-lg"></i>
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
  const curClass = typeof window.getCurrentSelectedClass === 'function' ? window.getCurrentSelectedClass() : { level: "ថ្នាក់ទី ១", room: "«ក»" };
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
    select.innerHTML = studentsInGrade.map(s => `<option value="${s.id}">${s.name} (${s.gender || 'ប្រុស'})</option>`).join("");
    renderTrackingBookPreview();
  }
}

// គូររូបរាងសៀវភៅបញ្ចូលទៅក្នុង Pop-up
function renderTrackingBookPreview() {
  const studentId = document.getElementById("tbStudentSelect")?.value;
  const period = document.getElementById("tbPeriodSelect")?.value;
  const container = document.getElementById("tbPreviewContainer");
  if (!container || !studentId) return;

  const allStudents = window.allStudents || (typeof window.getMasterStudents === 'function' ? window.getMasterStudents() : []);
  let student = allStudents.find(s => String(s.id) === String(studentId));
  if (!student && typeof rankingsDataList !== 'undefined') {
    student = rankingsDataList.find(s => String(s.id) === String(studentId));
  }
  if (!student) return;

  let allScores = [];
  try { allScores = JSON.parse(localStorage.getItem('academic_scores') || '[]'); } catch(e) {}
  const studentScore = allScores.filter(sc => String(sc.student_id) === String(studentId)).pop() || {};
  const avgVal = parseFloat(student.avg || studentScore.average || studentScore.avg || 0);

  const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
  const schoolName = sInfo.school_name || "សាលាបឋមសិក្សាគំរូ";
  const academicYear = sInfo.academic_year || "២០២៦-២០២៧";
  const levelSelect = document.getElementById("tbLevelSelect");
  const roomSelect = document.getElementById("tbRoomSelect");
  const grade = student.grade ? `${student.grade} ${student.room || ''}`.trim() : (levelSelect && roomSelect ? `${levelSelect.value} ${roomSelect.value}` : "ថ្នាក់ទី ២ «ខ»");

  const khmerNumbers = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  const toKhmerNum = (str) => String(str).split('').map(n => khmerNumbers[n] || n).join('');
  
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

  const avgStr = student.avg ? student.avg.toFixed(2) : "";
  const rankStr = student.rank || "";
  const gradeStr = student.gradeLetter || "";

  // Common CSS classes (A4 Landscape)
  const pageClass = "w-[297mm] h-[210mm] bg-white shadow-xl flex p-[10mm] shrink-0 box-border gap-[10mm] text-[#0000ff] mx-auto transform scale-[0.6] sm:scale-75 md:scale-90 lg:scale-100 origin-top font-siemreap printable-page mb-4";
  const halfClass = "w-1/2 h-full border-[3px] border-double border-[#0000ff] p-[8mm] relative flex flex-col box-border";

  // ==========================================
  // ទំព័រទី១៖ គម្របមុខ និង ក្រោយ
  // ==========================================
  const coverHtml = `
    <div class="${pageClass}">
      <div class="${halfClass} border-none text-[#0000ff]">
         <!-- គម្របក្រោយ (ទទេ) -->
      </div>
      <div class="${halfClass} text-center text-[#0000ff]">
        <div class="absolute top-2 left-2 font-moul text-[10px]">/\\</div>
        <div class="absolute top-2 right-2 font-moul text-[10px]">/\\</div>
        
        <h3 class="font-moul text-[14px] mt-2">ព្រះរាជាណាចក្រកម្ពុជា</h3>
        <h3 class="font-moul text-[14px] mt-1">ជាតិ សាសនា ព្រះមហាក្សត្រ</h3>
        <div class="tracking-[2px] mt-[-4px] font-serif text-[12px]">𑁋𑁋𑁋 📖 𑁋𑁋𑁋</div>

        <h2 class="font-moul text-[18px] mt-8">ក្រសួងអប់រំ យុវជន និងកីឡា</h2>
        <h1 class="font-moul text-[24px] mt-4">${schoolName}</h1><br><br>
        
        
        <p class="text-[12px] mt-2 font-moul">ទូរសព្ទសាលា....................................</p>

        <h1 class="font-moul text-[28px] mt-10 leading-snug">សៀវភៅតាមដានការសិក្សា</h1>
        
        <div class="mt-8 text-left px-4 text-[14px] leading-loose">
           <div class="flex items-center justify-between gap-2 mb-2">
             <div class="flex items-center flex-1 min-w-0">
               <span class="whitespace-nowrap shrink-0">របស់សិស្សឈ្មោះ៖</span>
               <span class="border-b border-dotted border-[#0000ff] flex-1 text-center font-moul truncate px-1 hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${student.name}</span>
             </div>
             <div class="flex items-center shrink-0">
               <span class="whitespace-nowrap shrink-0 ml-2">អត្តលេខ៖</span>
               <span class="border-b border-dotted border-[#0000ff] min-w-[70px] text-center font-bold px-1 hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${toKhmerNum(student.id)}</span>
             </div>
           </div>
           <div class="flex items-center gap-2">
              <span class="whitespace-nowrap shrink-0">ថ្នាក់ទី៖</span>
              <span class="border-b border-dotted border-[#0000ff] flex-1 text-center font-moul hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${grade}</span>
           </div>
        </div>

        <div class="mt-auto mb-6 text-[14px]">
           ឆ្នាំសិក្សា៖ ២០<span class="border-b border-dotted border-[#0000ff] inline-block w-[40px] text-center hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${toKhmerNum(academicYear.substring(2, 4))}</span> - ២០<span class="border-b border-dotted border-[#0000ff] inline-block w-[40px] text-center hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${toKhmerNum(academicYear.substring(7, 9))}</span>
        </div>

        <div class="absolute bottom-2 left-2 font-moul text-[10px]">\\/</div>
        <div class="absolute bottom-2 right-2 font-moul text-[10px]">\\/</div>
      </div>
    </div>
  `;

  // ==========================================
  // ទំព័រទី២៖ បទបញ្ជា និង ជីវប្រវត្តិ
  // ==========================================
  const rulesHtml = `
    <div class="${pageClass}">
      <div class="${halfClass} text-[#0000ff]">
        <h3 class="font-moul text-center text-[13px] mt-0 leading-[1.6]">
           ចំណុចសំខាន់ៗនៃបទបញ្ជាផ្ទៃក្នុង<br>
           នាយកសាលា គ្រូបង្រៀន និងគ្រប់គ្រងសៀវភៅតាមដានការសិក្សា<br>
           ហើយត្រូវអនុវត្តតាមចំណុចខាងក្រោម៖
        </h3>
        <ol class="pl-5 text-[11px] text-justify mt-4 space-y-[6px]">
           <li>សិស្សត្រូវអនុវត្តតាមអាកប្បកិរិយា និងបទបញ្ជាផ្ទៃក្នុងរបស់សាលារៀនឱ្យបានម៉ឺងម៉ាត់។</li>
           <li>សិស្សត្រូវស្លៀកពាក់ឯកសណ្ឋានឱ្យបានត្រឹមត្រូវ អាវស ខៀវ តាមឯកសណ្ឋានសាលា ត្រូវកាត់សក់ខ្លី និងសំអាតខ្លួនប្រាណ។ មិនត្រូវពាក់គ្រឿងអលង្ការមកសាលាដាច់ខាត។</li>
           <li>សិស្សត្រូវខិតខំរៀនសូត្រ ខិតខំកែលម្អការរស់នៅរបស់លោកគ្រូ/អ្នកគ្រូ និងនាយកសាលា ត្រូវចូលរួមគ្រប់សកម្មភាពការងារសង្គម អនាម័យ យាមកាម...។ល។</li>
           <li>សិស្សឈប់កិច្ចការ ក្នុងពេលប្រឡងឆមាសត្រូវធ្លាក់ស្វ័យប្រវត្តិ។ សិស្សដែលមិនប្រឡង ៣ មុខវិជ្ជាក្នុងឆមាសណាមួយ ត្រូវចាត់ទុកថា "ធ្លាក់ចំណាត់ថ្នាក់"។</li>
           <li>សិស្សអាចឡើងថ្នាក់បាន លុះត្រាតែមានពិន្ទុមធ្យមភាគឡើងថ្នាក់ សីលធម៌រស់នៅ និងអវត្តមានតិចជាង ១៥ ថ្ងៃ។ សិស្សក្រោមមធ្យមភាគត្រូវប្រឡងឡើងថ្នាក់ ឬរៀនត្រួតថ្នាក់។</li>
           <li>សិស្សឈប់រៀនដោយមានឬគ្មានហេតុផលត្រឹមត្រូវពី ៣១ ទៅ ៦០ ពេល ត្រូវប្រឡងឡើងថ្នាក់ បើលើសពី ៦០ ពេល ត្រូវរៀនត្រួតថ្នាក់។</li>
           <li>សិស្សដែលឈប់រៀនជាប់គ្នាលើសពី ៦០ ពេល ត្រូវលុបឈ្មោះចេញពីបញ្ជីសាលារៀន។</li>
           <li>ចំពោះសិស្សផ្ទេរការសិក្សា នាយកសាលាត្រូវបូកសរុបលទ្ធផលនៃការសិក្សារបស់សិស្សឱ្យបានសព្វគ្រប់ រួចផ្ញើទៅសាលាថ្មី។</li>
           <li>ហាមផ្តាច់មិនឱ្យប្រគល់សៀវភៅនេះឱ្យសិស្សកាន់ដោយខ្លួនឯង។ ក្នុងករណីមានកំហុសឆ្គង នាយកសាលា និងគ្រូបង្រៀនជាអ្នកទទួលខុសត្រូវ។</li>
        </ol>
      </div>

      <div class="${halfClass} text-center text-[#0000ff]">
        <div class="absolute top-2 left-2 font-moul text-[10px]">/\\</div>
        <div class="absolute top-2 right-2 font-moul text-[10px]">/\\</div>
        
        <h3 class="font-moul text-[12px] mt-1">ព្រះរាជាណាចក្រកម្ពុជា</h3>
        <h3 class="font-moul text-[12px] mt-1">ជាតិ សាសនា ព្រះមហាក្សត្រ</h3>
        <div class="tracking-[2px] mt-[-2px] text-[12px] font-serif">* * * 📖 * * *</div>

        <h2 class="font-moul text-[16px] mt-4">ក្រសួងអប់រំ យុវជន និងកីឡា</h2>
        <h1 class="font-moul text-[22px] mt-6 leading-snug">សៀវភៅតាមដានការសិក្សា</h1>
        <h2 class="font-moul text-[14px] mt-6">សាលាបឋមសិក្សាចំណេះទូទៅ</h2>

        <div class="mt-4 text-left px-2 text-[11.5px] leading-[2.1] space-y-1">
           <div class="flex items-center gap-2">
             <span class="whitespace-nowrap shrink-0">សាលាបឋមសិក្សា៖</span>
             <span class="border-b border-dotted border-[#0000ff] flex-1 font-moul text-center truncate hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${schoolName}</span>
             <span class="whitespace-nowrap shrink-0 ml-1">កម្រងសាលា៖</span>
             <span class="border-b border-dotted border-[#0000ff] w-[90px] text-center hover:bg-blue-50 outline-none cursor-text" contenteditable="true"></span>
           </div>

           <div class="flex items-center gap-2">
             <span class="whitespace-nowrap shrink-0">ឈ្មោះសិស្ស៖</span>
             <span class="border-b border-dotted border-[#0000ff] flex-1 font-moul text-center truncate hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${student.name}</span>
             <span class="whitespace-nowrap shrink-0 ml-1">ភេទ៖</span>
             <span class="border-b border-dotted border-[#0000ff] w-[45px] text-center hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${student.gender || 'ប្រុស'}</span>
           </div>

           <div class="flex items-center gap-2">
             <span class="whitespace-nowrap shrink-0">រៀនថ្នាក់ទី៖</span>
             <span class="border-b border-dotted border-[#0000ff] flex-1 text-center font-bold hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${grade}</span>
             <span class="whitespace-nowrap shrink-0 ml-1">អត្តលេខ៖</span>
             <span class="border-b border-dotted border-[#0000ff] min-w-[70px] text-center font-bold hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${toKhmerNum(student.id)}</span>
           </div>

           <div class="flex items-center gap-2">
             <span class="whitespace-nowrap shrink-0">កើតថ្ងៃទី៖</span>
             <span class="border-b border-dotted border-[#0000ff] min-w-[110px] text-center hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${dobStr}</span>
             <span class="whitespace-nowrap shrink-0 ml-1">នៅភូមិ/ក្រុម៖</span>
             <span class="border-b border-dotted border-[#0000ff] flex-1 truncate text-center hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${student.pob || ''}</span>
           </div>

           <div class="flex items-center gap-2">
             <span class="whitespace-nowrap shrink-0">ឃុំ/សង្កាត់៖</span>
             <span class="border-b border-dotted border-[#0000ff] flex-1 text-center hover:bg-blue-50 outline-none cursor-text" contenteditable="true"></span>
             <span class="whitespace-nowrap shrink-0 ml-1">ស្រុក/ខណ្ឌ៖</span>
             <span class="border-b border-dotted border-[#0000ff] flex-1 text-center hover:bg-blue-50 outline-none cursor-text" contenteditable="true"></span>
             <span class="whitespace-nowrap shrink-0 ml-1">ខេត្ត/ក្រុង៖</span>
             <span class="border-b border-dotted border-[#0000ff] flex-1 text-center hover:bg-blue-50 outline-none cursor-text" contenteditable="true"></span>
           </div>

           <div class="flex items-center gap-2">
             <span class="whitespace-nowrap shrink-0">ឪពុកឈ្មោះ៖</span>
             <span class="border-b border-dotted border-[#0000ff] flex-1 text-center truncate hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${student.father_name || ''}</span>
             <span class="whitespace-nowrap shrink-0 ml-1">មុខរបរ៖</span>
             <span class="border-b border-dotted border-[#0000ff] w-[120px] text-center truncate hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${student.father_job || ''}</span>
           </div>

           <div class="flex items-center gap-2">
             <span class="whitespace-nowrap shrink-0">ម្តាយឈ្មោះ៖</span>
             <span class="border-b border-dotted border-[#0000ff] flex-1 text-center truncate hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${student.mother_name || ''}</span>
             <span class="whitespace-nowrap shrink-0 ml-1">មុខរបរ៖</span>
             <span class="border-b border-dotted border-[#0000ff] w-[120px] text-center truncate hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${student.mother_job || ''}</span>
           </div>

           <div class="flex items-center gap-2">
             <span class="whitespace-nowrap shrink-0">អាណាព្យាបាល៖</span>
             <span class="border-b border-dotted border-[#0000ff] flex-1 text-center truncate hover:bg-blue-50 outline-none cursor-text" contenteditable="true"></span>
             <span class="whitespace-nowrap shrink-0 ml-1">មុខរបរ៖</span>
             <span class="border-b border-dotted border-[#0000ff] w-[120px] text-center truncate hover:bg-blue-50 outline-none cursor-text" contenteditable="true"></span>
           </div>

           <div class="flex items-center gap-2">
             <span class="whitespace-nowrap shrink-0">ស្នាក់នៅភូមិ/ក្រុម៖</span>
             <span class="border-b border-dotted border-[#0000ff] flex-1 text-center truncate hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${student.address || ''}</span>
             <span class="whitespace-nowrap shrink-0 ml-1">ឃុំ/សង្កាត់៖</span>
             <span class="border-b border-dotted border-[#0000ff] w-[110px] text-center hover:bg-blue-50 outline-none cursor-text" contenteditable="true"></span>
           </div>

           <div class="flex items-center gap-2">
             <span class="whitespace-nowrap shrink-0">ស្រុក/ខណ្ឌ៖</span>
             <span class="border-b border-dotted border-[#0000ff] flex-1 text-center hover:bg-blue-50 outline-none cursor-text" contenteditable="true"></span>
             <span class="whitespace-nowrap shrink-0 ml-1">ខេត្ត/ក្រុង៖</span>
             <span class="border-b border-dotted border-[#0000ff] flex-1 text-center hover:bg-blue-50 outline-none cursor-text" contenteditable="true"></span>
           </div>

           <div class="pt-2 text-center text-[12px]">
             ឆ្នាំសិក្សា៖ ២០<span class="border-b border-dotted border-[#0000ff] inline-block w-[35px] text-center hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${toKhmerNum(academicYear.substring(2, 4))}</span> - ២០<span class="border-b border-dotted border-[#0000ff] inline-block w-[35px] text-center hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${toKhmerNum(academicYear.substring(7, 9))}</span>
           </div>
        </div>

        <div class="absolute bottom-2 left-2 font-moul text-[10px]">\\/</div>
        <div class="absolute bottom-2 right-2 font-moul text-[10px]">\\/</div>
      </div>
    </div>
  `;

  // ==========================================
  // ទំព័រទី៣៖ តារាងពិន្ទុ (Tick ដោយចុចលើក្រឡាផ្ទាល់)
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
    if (s >= 8) return ["✔", "", "", ""];
    if (s >= 6.5) return ["", "✔", "", ""];
    if (s >= 5) return ["", "", "✔", ""];
    return ["", "", "", "✔"];
  };

  const subjectKeyAliases = {
    "អាន": ["k_read", "read", "reading", "អាន", "ភាសាខ្មែរ-អាន"],
    "សរសេរតាមអាន": ["k_write", "dictation", "dict", "សរសេរតាមអាន", "សរសេរ"],
    "តែងសេចក្តី": ["k_compose", "compose", "composition", "តែងសេចក្តី", "តែងសេចក្ដី"],
    "មេសូត្រ": ["k_recite", "recite", "poem", "មេសូត្រ"],
    "អក្សរផ្ចង់": ["k_calligraphy", "calligraphy", "អក្សរផ្ចង់"],
    "គណិតវិទ្យា": ["math", "m_num", "m_alg", "m_geo", "គណិតវិទ្យា", "គណិត"],
    "វិទ្យាសាស្ត្រអនុវត្ត": ["s_bio", "s_phy", "s_chem", "science", "វិទ្យាសាស្ត្រ", "វិទ្យាសាស្ត្រអនុវត្ត"],
    "ប្រវត្តិវិទ្យា": ["ss_hist", "history", "ប្រវត្តិវិទ្យា", "ប្រវត្តិ"],
    "ភូមិវិទ្យា": ["ss_geo", "geography", "ភូមិវិទ្យា", "ភូមិ"],
    "សីលធម៌ ពលរដ្ឋវិជ្ជា": ["ss_moral", "moral", "សីលធម៌-ពលរដ្ឋ", "សីលធម៌", "ពលរដ្ឋ"],
    "គំនូរ": ["art", "drawing", "គំនូរ", "គំនូរ និង ហត្ថកម្ម"],
    "កិច្ចការ-ផ្ទះ": ["homework", "life_skill", "កិច្ចការ-ផ្ទះ", "កិច្ចការផ្ទះ"],
    "អប់រំកាយ-កីឡា": ["pe_sport", "sport", "pe", "អប់រំកាយ", "កីឡា", "អប់រំកាយ-កីឡា"],
    "សិល្បៈបំណិនសិល្បៈ": ["life_skill", "art", "បំណិនជីវិត", "សិល្បៈបំណិនសិល្បៈ"],
    "សីលធម៌រស់នៅ": ["morality", "living_moral", "សីលធម៌រស់នៅ"],
    "សុខភាព-អនាម័យ": ["pe_health", "health", "hygiene", "សុខភាព", "សុខភាព-អនាម័យ"]
  };

  const findSubScore = (sub) => {
    const aliases = subjectKeyAliases[sub] || [sub];
    const sources = [student.scores, studentScore.scores, studentScore.subject_scores, studentScore];
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

      // បន្ថែម onclick សម្រាប់ Tick ដូរចុះឡើង និង contenteditable សម្រាប់វាយអក្សរ
      return `
        <tr class="h-[17px]">
          <td class="text-left px-[4px] border border-[#0000ff]">${sub}</td>
          <td class="border border-[#0000ff] text-center font-bold text-rose-600 text-[13px] cursor-pointer hover:bg-blue-100 tb-tick-cell" onclick="toggleBookTick(this)">${ticks[0]}</td>
          <td class="border border-[#0000ff] text-center font-bold text-rose-600 text-[13px] cursor-pointer hover:bg-blue-100 tb-tick-cell" onclick="toggleBookTick(this)">${ticks[1]}</td>
          <td class="border border-[#0000ff] text-center font-bold text-rose-600 text-[13px] cursor-pointer hover:bg-blue-100 tb-tick-cell" onclick="toggleBookTick(this)">${ticks[2]}</td>
          <td class="border border-[#0000ff] text-center font-bold text-rose-600 text-[13px] cursor-pointer hover:bg-blue-100 tb-tick-cell" onclick="toggleBookTick(this)">${ticks[3]}</td>
          <td class="border border-[#0000ff] text-left px-1 text-[9px] hover:bg-blue-50 outline-none cursor-text" contenteditable="true"></td>
        </tr>
      `;
    }).join("");

    const displayTitle = isAnnual ? `លទ្ធផលនៃការសិក្សាប្រចាំឆ្នាំសិក្សា ២០<span class="font-sans" contenteditable="true">${academicYear.substring(2, 4)}</span>-២០<span class="font-sans" contenteditable="true">${academicYear.substring(7, 9)}</span>` : `លទ្ធផលនៃការសិក្សាប្រចាំ ${title}`;

    return `
      <h3 class="font-moul text-center text-[13px] mb-[6px] text-[#0000ff] outline-none hover:bg-blue-50 cursor-text" contenteditable="true">${displayTitle}</h3>
      <table class="w-full border-collapse border border-[#0000ff] text-[11px] text-center text-[#0000ff]">
        <tr class="bg-slate-50 border border-[#0000ff]">
          <th rowspan="2" class="w-[30%] border border-[#0000ff] font-moul text-[11px] font-normal">មុខវិជ្ជា</th>
          <th colspan="4" class="border border-[#0000ff] font-moul text-[11px] font-normal">និទ្ទេស</th>
          <th rowspan="2" class="w-[26%] border border-[#0000ff] font-moul text-[9px] font-normal leading-tight">ចំណុចដែលត្រូវជួយ<br>ពង្រឹងបន្ថែម</th>
        </tr>
        <tr class="bg-slate-50 border border-[#0000ff]">
          <th class="w-[11%] border border-[#0000ff] font-moul text-[9px] font-normal">ល្អ<br><span class="font-sans text-[7px]">ពិន្ទុ 8-10</span></th>
          <th class="w-[11%] border border-[#0000ff] font-moul text-[9px] font-normal">ល្អបង្គួរ<br><span class="font-sans text-[7px]">ពិន្ទុ 6.5-7.99</span></th>
          <th class="w-[11%] border border-[#0000ff] font-moul text-[9px] font-normal">មធ្យម<br><span class="font-sans text-[7px]">ពិន្ទុ 5-6.49</span></th>
          <th class="w-[11%] border border-[#0000ff] font-moul text-[9px] font-normal">ខ្សោយ<br><span class="font-sans text-[7px]">ពិន្ទុ 4.99-0</span></th>
        </tr>
        ${tbody}
      </table>
      <div class="text-[11px] mt-[8px] leading-[2] text-left text-[#0000ff]">
         មធ្យមភាគ៖ <span class="border-b border-dotted border-[#0000ff] inline-block w-[40px] text-center font-bold text-rose-600 hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${avgStr}</span> 
         ចំណាត់ថ្នាក់ទី៖ <span class="border-b border-dotted border-[#0000ff] inline-block w-[35px] text-center font-bold text-rose-600 hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${rankStr}</span> 
         និទ្ទេស៖ <span class="border-b border-dotted border-[#0000ff] inline-block w-[35px] text-center font-bold text-rose-600 hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${gradeStr}</span><br> 
         អវត្តមានមានច្បាប់ <span class="border-b border-dotted border-[#0000ff] inline-block w-[25px] text-center hover:bg-blue-50 outline-none cursor-text font-bold text-rose-600" contenteditable="true"></span> ដង អត់ច្បាប់ <span class="border-b border-dotted border-[#0000ff] inline-block w-[25px] text-center hover:bg-blue-50 outline-none cursor-text font-bold text-rose-600" contenteditable="true"></span> ដង<br>
         វិន័យសីលធម៌៖ <span class="border-b border-dotted border-[#0000ff] inline-block w-[80%] hover:bg-blue-50 outline-none cursor-text" contenteditable="true"></span><br>
         <div class="flex justify-between mt-1 px-4">
           <span>ថ្ងៃទី.......ខែ..........ឆ្នាំ២០.......</span>
           <span class="mr-4">ថ្ងៃទី.......ខែ..........ឆ្នាំ២០.......</span>
         </div>
         <div class="flex justify-between font-moul text-center mt-2 px-1">
           <span class="text-[9px]">បានឃើញ និងឯកភាព<br>នាយក/នាយិកាសាលា</span>
           <span class="text-[9px] mt-1">មតិរបស់មាតាបិតា ឬអាណាព្យាបាលសិស្ស</span>
           <span class="text-[9px]">គ្រូប្រចាំថ្នាក់</span>
         </div>
      </div>
    `;
  };

  const annualInstructions = `
    <h3 class="font-moul text-center text-[15px] mb-2 text-[#0000ff]">សេចក្តីណែនាំ</h3>
    <p class="text-[12px] text-justify leading-relaxed indent-4">
      សូមលោកគ្រូ/អ្នកគ្រូ មាតាបិតា ឬអាណាព្យាបាលសិស្ស មេត្តាអាននូវសេចក្តីណែនាំពីរបៀបបំពេញខាងក្រោម៖
    </p>
    <p class="text-[12px] text-justify leading-relaxed mt-2">
      <span class="font-bold">១. ខ្ទង់និទ្ទេស៖</span> សូមលោកគ្រូ-អ្នកគ្រូគូសសញ្ញា " ✔ " នៅក្នុងខ្ទង់និទ្ទេសតាមលទ្ធផលនៃការសិក្សារបស់សិស្ស។<br>
      <span class="font-bold">២. ខ្ទង់ចំណុចដែលត្រូវជួយបន្ថែម៖</span><br>
      <span class="font-bold ml-4">ក. ចំពោះគ្រូ៖</span> អាចសរសេរបញ្ជាក់ឱ្យបានច្បាស់ អំពីមេរៀនដែលសិស្សទទួលបានលទ្ធផលមិនល្អ "ខ្សោយ" ឧទាហរណ៍៖ ទទួលបានលទ្ធផលខ្សោយ ដូចនេះគួរសរសេរមេរៀនអ្វីខ្លះ? ឬអាចគ្រាន់តែគូសសញ្ញា " ✔ " នៅក្នុងខ្ទង់ដែលត្រូវជួយបន្ថែមចំពោះមុខវិជ្ជាណាដែលទទួលបានលទ្ធផលមិនល្អ "ខ្សោយ" ដូចជាសិស្សបាននិទ្ទេសខ្សោយ រៀនអាន-ពណ៌នាត្រា-វិទ្យាសាស្ត្រអនុវត្តកិច្ចដើម ។ល។<br>
      <span class="font-bold ml-4">ខ. ចំពោះមាតាបិតាសិស្ស ឬអាណាព្យាបាលសិស្ស៖</span> សូមយកចិត្តទុកដាក់អានលើខ្ទង់ "ចំណុចដែលត្រូវជួយបន្ថែម" នេះ ដែលជាការផ្តល់ព័ត៌មានពីលទ្ធផលនៃការសិក្សារបស់កូន ហើយលោកគ្រូ/អ្នកគ្រូ សូមធ្វើការចូលរួមជួយពីសំណាក់លោក/លោកស្រី មេត្តាជួយផ្តល់មតិយោបល់ផ្សេងៗ បើពុំមាននៃការសិក្សារបស់កូនអស់លោក/លោកស្រីផង។
    </p>
    <div class="mt-auto flex justify-center pb-4 opacity-70">
      <i class="fa-solid fa-book-open text-4xl"></i>
    </div>
  `;

  let resultsHtml = "";
  if (period === "ប្រចាំឆ្នាំ") {
    resultsHtml = `
      <div class="${pageClass}">
        <div class="${halfClass}">${buildResultTable("", true)}</div>
        <div class="${halfClass} text-[#0000ff]">${annualInstructions}</div>
      </div>
    `;
  } else {
    resultsHtml = `
      <div class="${pageClass}">
        <div class="${halfClass}">${buildResultTable(period, false)}</div>
        <div class="${halfClass} flex flex-col items-center justify-center bg-slate-50 border-dashed border-[#0000ff]">
           <i class="fa-solid fa-file-lines text-4xl text-slate-300 mb-2"></i>
           <span class="text-slate-400 font-bold text-sm">ទំព័រទំនេរ</span>
        </div>
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
  // ទាញយកក្រឡា Tick ទាំងអស់ក្នុងជួរដេកតែមួយ
  const allTickCells = row.querySelectorAll('.tb-tick-cell');
  
  const hasTick = cell.innerText.trim() === "✔";
  
  // លុប Tick ចាស់ចេញទាំងអស់ក្នុងជួរនោះសិន
  allTickCells.forEach(c => c.innerText = "");
  
  // ប្រសិនបើមិនទាន់មាន Tick ទេ ឱ្យដាក់ "✔" ចូល
  if (!hasTick) {
    cell.innerText = "✔";
  }
}

// ==========================================
// មុខងារ Print / Word Export 
// ==========================================
function executeTrackingBookPrint(actionType) {
  const container = document.getElementById("tbPreviewContainer");
  const studentSelect = document.getElementById("tbStudentSelect");
  
  if (!studentSelect.value || container.innerHTML.includes("គ្មានសិស្ស")) {
    alert("⚠️ សូមជ្រើសរើសសិស្សឱ្យបានត្រឹមត្រូវសិន!");
    return;
  }
  
  const studentName = studentSelect.options[studentSelect.selectedIndex].text.split('(')[0].trim();
  const pages = container.querySelectorAll('.printable-page');
  let cleanHtml = "";
  
  pages.forEach(p => {
    let pageHtml = p.outerHTML
        .replace(/scale-\[\d\.\d+\]/g, '')
        .replace(/sm:scale-\d+/g, '')
        .replace(/md:scale-\d+/g, '')
        .replace(/lg:scale-\d+/g, '')
        .replace(/shadow-xl/g, '')
        .replace(/mx-auto/g, '')
        .replace(/bg-slate-50/g, 'bg-white')
        .replace(/border-dashed/g, 'border-double')
        .replace(/mb-4/g, ''); // លុបគម្លាតពេល Print
    cleanHtml += pageHtml;
  });

  const printDocument = `
    <!DOCTYPE html>
    <html lang="km">
    <head>
      <meta charset="utf-8">
      <title>សៀវភៅតាមដាន - ${studentName}</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Moul&family=Siemreap&display=swap');
        @page { size: A4 landscape; margin: 0; }
        body { margin: 0; padding: 0; background: white; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; font-family: 'Siemreap', sans-serif; color: #0000ff; }
        .printable-page { page-break-after: always; break-after: page; }
      </style>
    </head>
    <body>
      ${cleanHtml}
    </body>
    </html>
  `;

  if (actionType === "print") {
    const printWindow = window.open('', '_blank', 'width=1200,height=800');
    printWindow.document.open();
    printWindow.document.write(printDocument);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 1200);
  } else if (actionType === "word") {
    const blob = new Blob(['\ufeff', printDocument], { type: 'application/msword' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `សៀវភៅតាមដាន_${studentName.replace(/ /g, '_')}.doc`;
    link.click();
  }
}

window.loadTrackingBookView = openTrackingBookModal;
window.openTrackingBookModal = openTrackingBookModal;
window.openReportCardsModal = openTrackingBookModal;
window.closeTrackingBookModal = closeTrackingBookModal;
