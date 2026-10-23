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

// ២. ទិន្នន័យរចនាសម្ព័ន្ធការសិក្សាលំនាំដើម (Default Academic Structure)
window.defaultAcademicStructure = {
    academic_years: ["2024-2025", "2025-2026", "2026-2027", "2027-2028"],
    active_year: "2026-2027",
    semesters: {
        sem1: { start: "2026-10-01", end: "2027-02-28", name: "ឆមាសទី ១" },
        sem2: { start: "2027-03-01", end: "2027-07-31", name: "ឆមាសទី ២" }
    },
    grades: [
        { id: "g1", name: "ថ្នាក់ទី ១", rooms: ["«ក»", "«ខ»"], teacher: "TCH-001" },
        { id: "g2", name: "ថ្នាក់ទី ២", rooms: ["«ក»", "«ខ»"], teacher: "" },
        { id: "g3", name: "ថ្នាក់ទី ៣", rooms: ["«ក»", "«ខ»"], teacher: "" },
        { id: "g4", name: "ថ្នាក់ទី ៤", rooms: ["«ក»"], teacher: "" },
        { id: "g5", name: "ថ្នាក់ទី ៥", rooms: ["«ក»"], teacher: "" },
        { id: "g6", name: "ថ្នាក់ទី ៦", rooms: ["«ក»"], teacher: "" }
    ],
    primary_subjects: [
        { key: "khmer", name: "ភាសាខ្មែរ", max: 100, weight: 1, color: "#dbeafe" },
        { key: "math", name: "គណិតវិទ្យា", max: 100, weight: 1, color: "#ede9fe" },
        { key: "science", name: "វិទ្យាសាស្ត្រ", max: 50, weight: 1, color: "#dcfce7" },
        { key: "social", name: "សិក្សាសង្គម", max: 50, weight: 1, color: "#fef9c3" },
        { key: "pe_art", name: "អប់រំកាយ/សិល្បៈ", max: 50, weight: 1, color: "#ffe4e6" },
        { key: "foreign", name: "ភាសាបរទេស", max: 50, weight: 1, color: "#e0f2fe" }
    ],
    secondary_subjects: [
        { key: "khmer", name: "ភាសាខ្មែរ", max: 100, weight: 1, color: "#dbeafe" },
        { key: "math", name: "គណិតវិទ្យា", max: 100, weight: 1, color: "#ede9fe" },
        { key: "physics", name: "រូបវិទ្យា", max: 50, weight: 1, color: "#dcfce7" },
        { key: "chem", name: "គីមីវិទ្យា", max: 50, weight: 1, color: "#ede9fe" },
        { key: "bio", name: "ជីវវិទ្យា", max: 50, weight: 1, color: "#dcfce7" },
        { key: "history", name: "ប្រវត្តិវិទ្យា", max: 50, weight: 1, color: "#fef9c3" },
        { key: "geo", name: "ភូមិវិទ្យា", max: 50, weight: 1, color: "#fef9c3" },
        { key: "civics", name: "ពលរដ្ឋវិទ្យា", max: 50, weight: 1, color: "#ffe4e6" },
        { key: "earth", name: "ផែនដីវិទ្យា", max: 50, weight: 1, color: "#e0f2fe" },
        { key: "english", name: "ភាសាអង់គ្លេស", max: 50, weight: 1, color: "#e0f2fe" }
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
    return window.academicStructure;
};
window.loadAcademicStructure();

window.saveAcademicStructure = async function(structure) {
    window.academicStructure = structure;
    localStorage.setItem("academic_structure", JSON.stringify(structure));

    if (window.db) {
        try {
            await window.db.collection("schools_config").doc("academic_structure").set({
                ...structure,
                last_updated: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        } catch(e) {
            console.warn("Firestore academic_structure write note:", e.message);
        }
    }
};

// ៣. Tab State
window.currentSettingsTab = "school";

window.switchSettingsTab = function(tabName) {
    window.currentSettingsTab = tabName;
    const tabs = ["school", "academic", "users", "backup"];
    
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

    if (tabName === "users") {
        window.renderUserAccountsTab();
    } else if (tabName === "academic") {
        window.renderAcademicManagementTab();
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
                    ${isAdmin ? '👑 អ្នកគ្រប់គ្រងប្រព័ន្ធ (Admin)' : '👨‍🏫 គ្រូបង្រៀន (Teacher)'}
                </span>
             </div>
             <h2 class="text-2xl md:text-3xl font-black font-moul mb-2 tracking-wide drop-shadow-md">ការកំណត់ប្រព័ន្ធ និងរចនាសម្ព័ន្ធសាលា</h2>
             <p class="text-xs md:text-sm text-indigo-200 font-medium">គ្រប់គ្រងព័ត៌មានសាលារៀន ឆ្នាំសិក្សា ថ្នាក់រៀន មុខវិជ្ជា គណនីគ្រូ និងការបម្រុងទុកទិន្នន័យ</p>
           </div>
           <div class="w-14 h-14 md:w-16 md:h-16 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center text-2xl md:text-3xl shadow-inner relative z-10 backdrop-blur-md shrink-0">
             <i class="fa-solid fa-gears text-indigo-200"></i>
           </div>
        </div>

        <!-- Tab Navigation Bar -->
        <div class="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-wrap gap-1 shadow-sm">
            <button id="tabBtn_school" onclick="window.switchSettingsTab('school')" class="flex-1 min-w-[140px] px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition flex items-center justify-center gap-2 bg-white text-indigo-700 shadow-sm border border-indigo-200">
                <i class="fa-solid fa-school"></i> <span>ព័ត៌មានសាលារៀន</span>
            </button>
            <button id="tabBtn_academic" onclick="window.switchSettingsTab('academic')" class="flex-1 min-w-[140px] px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition flex items-center justify-center gap-2 text-slate-500 hover:text-slate-700">
                <i class="fa-solid fa-graduation-cap"></i> <span>គ្រប់គ្រងការសិក្សា</span>
            </button>
            <button id="tabBtn_users" onclick="window.switchSettingsTab('users')" class="flex-1 min-w-[140px] px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition flex items-center justify-center gap-2 text-slate-500 hover:text-slate-700">
                <i class="fa-solid fa-users-gear"></i> <span>គណនី & សិទ្ធិ</span>
            </button>
            <button id="tabBtn_backup" onclick="window.switchSettingsTab('backup')" class="flex-1 min-w-[140px] px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition flex items-center justify-center gap-2 text-slate-500 hover:text-slate-700">
                <i class="fa-solid fa-shield-halved"></i> <span>បម្រុងទុក & Audit</span>
            </button>
        </div>

        <!-- ============================================================= -->
        <!-- TAB 1: ព័ត៌មានសាលារៀន (School Settings & Official Info)        -->
        <!-- ============================================================= -->
        <div id="tabContent_school" class="space-y-6">
            
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
                                <span class="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-bold">${window.appSettings.teacher_level || 'ថ្នាក់ទី ១'} ${window.appSettings.teacher_room || '«ក»'}</span>
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

            <!-- ទម្រង់កំណត់ព័ត៌មានសាលារៀន (School Form) -->
            <form id="settingsForm" onsubmit="window.handleSaveSettings(event)" class="space-y-6">
               
               <div class="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200">
                   <h3 class="font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6 text-base md:text-lg flex items-center gap-3">
                       <div class="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-inner"><i class="fa-solid fa-school"></i></div>
                       ព័ត៌មានទូទៅនៃសាលារៀន (School Information)
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
                         <label class="block text-xs font-bold text-slate-600 mb-2">ទំនាក់ទំនងសាលា (ទូរស័ព្ទ)</label>
                         <input type="text" id="set_school_contact" placeholder="012 345 678" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-mono text-xs shadow-inner transition">
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
        <!-- TAB 2: ការគ្រប់គ្រងការសិក្សា (Academic Management)             -->
        <!-- ============================================================= -->
        <div id="tabContent_academic" class="space-y-6 hidden">
            <!-- Dynamic Content loaded by renderAcademicManagementTab() -->
        </div>

        <!-- ============================================================= -->
        <!-- TAB 3: គ្រប់គ្រងគណនី & សិទ្ធិ (User Accounts & Roles Manager)  -->
        <!-- ============================================================= -->
        <div id="tabContent_users" class="space-y-6 hidden">
            <!-- Dynamic Content loaded by renderUserAccountsTab() -->
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
};

// =========================================================================
// ៥. គ្រប់គ្រងការសិក្សា (Academic Management Tab Renderer)
// =========================================================================
window.renderAcademicManagementTab = function() {
    const container = document.getElementById("tabContent_academic");
    if (!container) return;

    const data = window.academicStructure || window.defaultAcademicStructure;
    const activeYear = data.active_year || "2026-2027";
    const years = data.academic_years || ["2024-2025", "2025-2026", "2026-2027", "2027-2028"];
    const grades = data.grades || [];
    const pSubjects = data.primary_subjects || [];
    const sSubjects = data.secondary_subjects || [];

    container.innerHTML = `
        <div class="space-y-6">
            
            <!-- ផ្នែកទី ១៖ គ្រប់គ្រងឆ្នាំសិក្សា & ឆមាស -->
            <div class="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4 mb-6">
                    <div>
                        <h3 class="font-bold text-slate-800 text-base flex items-center gap-2.5">
                            <i class="fa-solid fa-calendar-check text-indigo-600"></i> ១. គ្រប់គ្រងឆ្នាំសិក្សា និងកាលបរិច្ឆេទឆមាស
                        </h3>
                        <p class="text-xs text-slate-400 mt-1">កំណត់ឆ្នាំសិក្សាសកម្ម និងកាលបរិច្ឆេទចាប់ផ្តើម-បញ្ចប់នៃឆមាសនីមួយៗ</p>
                    </div>
                    <div class="flex items-center gap-2 w-full sm:w-auto">
                        <button onclick="window.openAddAcademicYearModal()" class="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-indigo-200">
                            <i class="fa-solid fa-plus"></i> បន្ថែមឆ្នាំសិក្សា
                        </button>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-5 text-sm">
                    <div>
                        <label class="block text-xs font-bold text-slate-600 mb-2">ឆ្នាំសិក្សាសកម្ម (Active Academic Year)</label>
                        <select id="acad_active_year" onchange="window.handleSelectActiveYear(this.value)" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-xs text-indigo-700 outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer">
                            ${years.map(y => `<option value="${y}" ${y === activeYear ? 'selected' : ''}>ឆ្នាំសិក្សា ${window.toKhmerNum(y)} ${y === activeYear ? '(សកម្ម)' : ''}</option>`).join("")}
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-600 mb-2">ឆមាសទី ១ (កាលបរិច្ឆេទ)</label>
                        <div class="grid grid-cols-2 gap-2">
                            <input type="date" id="acad_sem1_start" value="${data.semesters?.sem1?.start || '2026-10-01'}" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold outline-none">
                            <input type="date" id="acad_sem1_end" value="${data.semesters?.sem1?.end || '2027-02-28'}" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold outline-none">
                        </div>
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-600 mb-2">ឆមាសទី ២ (កាលបរិច្ឆេទ)</label>
                        <div class="grid grid-cols-2 gap-2">
                            <input type="date" id="acad_sem2_start" value="${data.semesters?.sem2?.start || '2027-03-01'}" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold outline-none">
                            <input type="date" id="acad_sem2_end" value="${data.semesters?.sem2?.end || '2027-07-31'}" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold outline-none">
                        </div>
                    </div>
                </div>
            </div>

            <!-- ផ្នែកទី ២៖ គ្រប់គ្រងកម្រិតថ្នាក់ និងបន្ទប់ -->
            <div class="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4 mb-6">
                    <div>
                        <h3 class="font-bold text-slate-800 text-base flex items-center gap-2.5">
                            <i class="fa-solid fa-door-open text-teal-600"></i> ២. គ្រប់គ្រងកម្រិតថ្នាក់ បន្ទប់ និងគ្រូបន្ទុកថ្នាក់
                        </h3>
                        <p class="text-xs text-slate-400 mt-1">កំណត់បញ្ជីថ្នាក់រៀន បន្ទប់ («ក», «ខ», «គ»...) និងចាត់តាំងគ្រូទទួលបន្ទុក</p>
                    </div>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs">
                        <thead>
                            <tr class="border-b border-slate-200 text-slate-500 font-bold bg-slate-50/70">
                                <th class="p-3">កម្រិតថ្នាក់</th>
                                <th class="p-3">បន្ទប់ / កម្រង</th>
                                <th class="p-3">គ្រូទទួលបន្ទុកថ្នាក់ (Assigned Teacher)</th>
                                <th class="p-3 text-right">សកម្មភាព</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            ${grades.map((g, idx) => `
                                <tr>
                                    <td class="p-3 font-bold text-slate-800">${g.name}</td>
                                    <td class="p-3 font-mono font-bold text-indigo-600">${g.rooms.join(", ")}</td>
                                    <td class="p-3 text-slate-600 font-bold">${g.teacher ? `គ្រូ ID: ${g.teacher}` : '<span class="text-slate-400 italic">មិនទាន់ចាត់តាំង</span>'}</td>
                                    <td class="p-3 text-right">
                                        <button onclick="window.openAssignTeacherClassModal('${g.id}')" class="px-3 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg font-bold transition">
                                            <i class="fa-solid fa-user-pen"></i> ចាត់តាំងគ្រូ
                                        </button>
                                    </td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- ផ្នែកទី ៣៖ គ្រប់គ្រងមុខវិជ្ជា និងពិន្ទុអតិបរមា (Subjects Config) -->
            <div class="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4 mb-6">
                    <div>
                        <h3 class="font-bold text-slate-800 text-base flex items-center gap-2.5">
                            <i class="fa-solid fa-book-open-reader text-amber-600"></i> ៣. កំណត់មុខវិជ្ជា និងពិន្ទុអតិបរមា (Subjects & Max Scores)
                        </h3>
                        <p class="text-xs text-slate-400 mt-1">កំណត់មុខវិជ្ជាផ្លូវការ ពិន្ទុអតិបរមា (Max) និងមេគុណ (Weight) សម្រាប់គណនាពិន្ទុ និងចំណាត់ថ្នាក់</p>
                    </div>
                    <button onclick="window.openAddCustomSubjectModal()" class="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-amber-200">
                        <i class="fa-solid fa-plus"></i> បន្ថែមមុខវិជ្ជា
                    </button>
                </div>

                <!-- Tabs: បឋមសិក្សា vs មធ្យមសិក្សា -->
                <div class="space-y-4">
                    <h4 class="font-bold text-xs uppercase tracking-wider text-slate-600 flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span> កម្រិតបឋមសិក្សា (Primary School Subjects)
                    </h4>
                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        ${pSubjects.map(sub => `
                            <div class="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                                <div class="flex items-center gap-2.5">
                                    <div class="w-3.5 h-3.5 rounded-full shrink-0" style="background-color: ${sub.color || '#dbeafe'};"></div>
                                    <div>
                                        <div class="font-bold text-slate-800 text-xs">${sub.name}</div>
                                        <div class="text-[10px] text-slate-400 font-mono">Key: ${sub.key} • មេគុណ: ${sub.weight || 1}</div>
                                    </div>
                                </div>
                                <span class="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-indigo-700 shadow-inner">
                                    Max: ${sub.max}
                                </span>
                            </div>
                        `).join("")}
                    </div>

                    <h4 class="font-bold text-xs uppercase tracking-wider text-slate-600 flex items-center gap-2 pt-4">
                        <span class="w-2.5 h-2.5 rounded-full bg-purple-500"></span> កម្រិតមធ្យមសិក្សា (Secondary School Subjects)
                    </h4>
                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        ${sSubjects.map(sub => `
                            <div class="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                                <div class="flex items-center gap-2.5">
                                    <div class="w-3.5 h-3.5 rounded-full shrink-0" style="background-color: ${sub.color || '#ede9fe'};"></div>
                                    <div>
                                        <div class="font-bold text-slate-800 text-xs">${sub.name}</div>
                                        <div class="text-[10px] text-slate-400 font-mono">Key: ${sub.key} • មេគុណ: ${sub.weight || 1}</div>
                                    </div>
                                </div>
                                <span class="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-purple-700 shadow-inner">
                                    Max: ${sub.max}
                                </span>
                            </div>
                        `).join("")}
                    </div>
                </div>

                <!-- Save Academic Structure Button -->
                <div class="flex justify-end pt-6 mt-6 border-t border-slate-100">
                    <button onclick="window.handleSaveAcademicStructure()" class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center gap-2">
                        <i class="fa-solid fa-floppy-disk"></i> រក្សាទុកការកំណត់ការសិក្សា
                    </button>
                </div>
            </div>
        </div>
    `;
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
                                        <td class="p-3 font-bold text-slate-700">${t.assigned_grade || 'ថ្នាក់ទី ១'} ${t.assigned_room || ''}</td>
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
        document.getElementById("addTeacherModal").classList.add("hidden");
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
        document.getElementById("editTeacherModal").classList.add("hidden");
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
// ៨. មុខងារជំនួយបំពេញទម្រង់ & Save Settings (Form Helpers)
// =========================================================================

window.fillSettingsForm = function() {
    const s = typeof appSettings !== 'undefined' ? appSettings : {};
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ""; };
    
    setVal("set_school_name", s.school_name);
    setVal("set_school_en", s.school_en);
    setVal("set_school_code", s.school_code);
    setVal("set_school_type", s.school_type || "បឋមសិក្សា");
    setVal("set_cluster", s.cluster || s.school_cluster); 
    setVal("set_principal_name", s.principal_name);
    setVal("set_academic_year", s.academic_year);
    setVal("set_school_contact", s.school_contact);
    
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
};

window.processSettingsImage = function(inputEl, previewImgId, hiddenInputId, iconId) {
    const file = inputEl.files[0];
    if (!file) return;

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

window.handleSaveSettings = async function(event) {
    event.preventDefault();
    const btn = document.getElementById("btnSaveSettings");
    const origHTML = btn.innerHTML;
    btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin text-xl"></i> <span>កំពុងរក្សាទុក...</span>`;
    btn.disabled = true;
    btn.classList.add("opacity-90", "cursor-not-allowed");

    const payload = {
        school_name: document.getElementById("set_school_name")?.value.trim() || "",
        school_en: document.getElementById("set_school_en")?.value.trim() || "",
        school_code: document.getElementById("set_school_code")?.value.trim() || "",
        school_type: document.getElementById("set_school_type")?.value || "បឋមសិក្សា",
        cluster: document.getElementById("set_cluster")?.value.trim() || "", 
        principal_name: document.getElementById("set_principal_name")?.value.trim() || "",
        academic_year: document.getElementById("set_academic_year")?.value.trim() || "",
        school_contact: document.getElementById("set_school_contact")?.value.trim() || "",
        
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
        window.appSettings = payload;
        localStorage.setItem("school_settings", JSON.stringify(window.appSettings));
        
        localStorage.setItem('selected_academic_year', payload.academic_year);
        const globalYearDrop = document.getElementById("globalAcademicYear");
        if (globalYearDrop) globalYearDrop.value = payload.academic_year;

        if (typeof window.updateUIWithSettings === "function") window.updateUIWithSettings();

        // រក្សាទុកក្នុង Firestore
        if (window.db) {
            try {
                let fsPayload = { ...payload };
                if (fsPayload.logo_url && fsPayload.logo_url.length > 500000) delete fsPayload.logo_url;
                if (fsPayload.signature_url && fsPayload.signature_url.length > 500000) delete fsPayload.signature_url;
                if (fsPayload.profile_avatar && fsPayload.profile_avatar.length > 500000) delete fsPayload.profile_avatar;

                window.db.collection("schools_config").doc("main_settings").set({
                    ...fsPayload,
                    last_updated: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true }).catch(console.warn);
            } catch(fsErr) {
                console.warn("Firestore settings save warning:", fsErr);
            }
        }
        
        if(typeof showToast === 'function') showToast("✅ រក្សាទុកការកំណត់បានជោគជ័យ!");
        else alert("✅ រក្សាទុកការកំណត់បានជោគជ័យ!");

        if (typeof window.logAudit === 'function') {
            window.logAudit('UPDATE_SETTINGS', 'settings', `បានកែប្រែការកំណត់សាលារៀន (${payload.school_name || 'សាលា'}) និងគ្រូបង្រៀន (${payload.teacher_name || 'គ្រូ'})`);
        }
        
    } catch (error) {
        console.error(error);
        alert("❌ មានបញ្ហាក្នុងការរក្សាទុកទិន្នន័យ។");
    } finally {
        btn.innerHTML = origHTML;
        btn.disabled = false;
        btn.classList.remove("opacity-90", "cursor-not-allowed");
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
