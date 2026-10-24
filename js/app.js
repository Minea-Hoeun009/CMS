// =====================================================================
// ឯកសារ js/app.js - គ្រប់គ្រងដំណើរការទូទៅរបស់ប្រព័ន្ធ (Master App Orchestrator)
// =====================================================================

document.addEventListener("DOMContentLoaded", async () => {
    console.log("🚀 App Started! Checking Login State...");
    
    // ១. ពិនិត្យមើលថាតើគ្រូបាន Login ឬនៅ?
    const savedId = localStorage.getItem('auth_teacher_id');
    const savedName = localStorage.getItem('auth_teacher_name');
    const savedUser = localStorage.getItem('auth_username');

    // Dark Mode Check
    if (localStorage.getItem('theme') === 'dark') {
        document.documentElement.classList.add('dark');
        const darkIcon = document.getElementById('darkModeIcon');
        if (darkIcon) darkIcon.className = 'fa-solid fa-sun';
    }

    if (savedId) {
        console.log(`✅ Teacher logged in (${savedId}). Preparing workspace...`);
        
        // ធានា AppState & AuthState មានទិន្នន័យ
        window.AppState = window.AppState || {};
        window.AppState.isLoggedIn = true;
        window.AppState.teacherId = savedId;
        window.AppState.teacherName = savedName || "លោកគ្រូ អ្នកគ្រូ";
        window.AppState.username = savedUser || savedId;

        window.AuthState = window.AuthState || {
            teacherId: savedId,
            teacherName: savedName || "លោកគ្រូ អ្នកគ្រូ",
            username: savedUser || savedId
        };

        if (window.AppAuth && window.AppAuth.state) {
            window.AppAuth.state = {
                isLoggedIn: true,
                teacherId: savedId,
                name: savedName || "លោកគ្រូ អ្នកគ្រូ",
                username: savedUser || savedId
            };
        }

        // រៀបចំ Workspace
        const landingScreen = document.getElementById("landing-screen");
        const appView = document.getElementById("appView");
        if (landingScreen) {
            landingScreen.style.display = 'none';
            landingScreen.classList.add('hidden');
        }
        if (appView) {
            appView.classList.remove('hidden');
        }

        // Update ឈ្មោះគ្រូនៅលើ Sidebar
        const nameEl = document.getElementById("navUserName");
        const idEl = document.getElementById("navUserId");
        if (nameEl) nameEl.textContent = window.AppState.teacherName;
        if (idEl) idEl.textContent = window.AppState.teacherId;

        // Restore ឆ្នាំសិក្សាចុងក្រោយ
        const savedYear = localStorage.getItem('selected_academic_year');
        if (savedYear) {
            const yearSelect = document.getElementById("globalAcademicYear");
            if (yearSelect) yearSelect.value = savedYear;
        }

        // ២. ទាញយកការកំណត់ (Settings) ពី LocalStorage
        if (typeof window.loadGlobalSettings === 'function') {
            window.loadGlobalSettings();
        }

        // ៣. អាប់ដេត Sidebar System Info (ឈ្មោះសាលា ឡូហ្គោ ឆ្នាំសិក្សា)
        if (typeof window.updateSidebarSystemInfo === 'function') {
            window.updateSidebarSystemInfo();
        }

        // ៤. អនុវត្តសិទ្ធិមើលម៉ឺនុយតាមតួនាទី (Admin vs Class Teacher)
        if (typeof window.applyRoleBasedNavigation === 'function') {
            window.applyRoleBasedNavigation();
        }

        // ៥. ចូលទៅកាន់ផ្ទាំង Dashboard ឬផ្ទាំងចុងក្រោយដែលបានបើក
        const lastView = localStorage.getItem('activeMenu') || 'dashboard';
        if (typeof window.switchView === 'function') {
            window.switchView(lastView);
        }

        // ៦. ស្តាប់ Event ពេលទិន្នន័យសិស្សត្រូវបាន Update ក្នុង Master Students (Single Source of Truth)
        window.addEventListener('masterStudentsUpdated', () => {
            console.log("📢 Master Students updated across system. Refreshing active view...");
            const activeMenu = localStorage.getItem('activeMenu') || 'dashboard';
            if (activeMenu === 'attendance' && typeof window.fetchMonthlyAttendance === 'function') {
                window.fetchMonthlyAttendance();
            } else if (activeMenu === 'scores' && typeof window.fetchStudentsForScores === 'function') {
                window.fetchStudentsForScores();
            } else if (activeMenu === 'dashboard' && typeof window.loadDashboard === 'function') {
                window.loadDashboard();
            } else if (activeMenu === 'library' && typeof window.fetchLibraryData === 'function') {
                window.fetchLibraryData();
            } else if (activeMenu === 'students' && typeof window.filterStudents === 'function') {
                window.filterStudents();
            }
        });

    } else {
        console.log("🔒 No teacher logged in. Showing login screen.");
        const landingScreen = document.getElementById("landing-screen");
        const appView = document.getElementById("appView");
        if (appView) appView.classList.add("hidden");
        if (landingScreen) {
            landingScreen.classList.remove("hidden");
            landingScreen.style.display = "flex";
        }
    }
});

// =====================================================================
// មុខងារសម្រាប់ពេលចុចលើ Menu នីមួយៗ (Sidebar Click Handlers)
// =====================================================================
window.navigateTo = async function(menuName) {
    if (typeof window.switchView === 'function') {
        window.switchView(menuName);
    }
};

// =====================================================================
// មុខងារទាញទិន្នន័យសាលា និងឆ្នាំសិក្សាមកបង្ហាញលើ Sidebar (Header/Logo Area)
// =====================================================================
window.updateSidebarSystemInfo = function() {
    const sInfo = typeof appSettings !== 'undefined' ? appSettings : (JSON.parse(localStorage.getItem('school_settings') || '{}'));
    
    let academicYear = document.getElementById("globalAcademicYear")?.value || localStorage.getItem('selected_academic_year') || sInfo.academic_year || "2026-2027";
    const khmerYear = typeof window.toKhmerNum === 'function' ? window.toKhmerNum(academicYear) : academicYear;

    const schoolNameEl = document.getElementById('sidebarSchoolName');
    if (schoolNameEl) {
        schoolNameEl.textContent = sInfo.school_name || "សាលាបឋមសិក្សា";
        schoolNameEl.title = sInfo.school_name || "សាលាបឋមសិក្សា";
    }

    const academicYearEl = document.getElementById('sidebarAcademicYear');
    if (academicYearEl) {
        academicYearEl.textContent = "ឆ្នាំសិក្សា " + khmerYear;
    }

    const logoEl = document.getElementById('sidebarLogo');
    if (logoEl) {
        const defaultIcon = logoEl.nextElementSibling;
        if (sInfo.logo_url && sInfo.logo_url.trim() !== "") {
            logoEl.src = sInfo.logo_url;
            logoEl.classList.remove('hidden');
            if (defaultIcon) defaultIcon.classList.add('hidden');
        } else {
            logoEl.classList.add('hidden');
            if (defaultIcon) defaultIcon.classList.remove('hidden');
        }
    }
};
