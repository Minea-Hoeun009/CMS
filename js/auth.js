// =========================================================================
// ឯកសារ js/auth.js - ប្រព័ន្ធគ្រប់គ្រងសុវត្ថិភាព និងគណនីគ្រូ (Firestore & Local Auth)
// =========================================================================

window.AppAuth = {
    state: {
        isLoggedIn: false,
        teacherId: null,
        name: null,
        username: null,
        role: "teacher"
    },

    // ១. ចាប់ផ្តើមដំណើរការ (Init on load)
    init: function() {
        this.checkSession();
    },

    // ២. ត្រួតពិនិត្យ Session ចាស់
    checkSession: function() {
        const savedId = localStorage.getItem('auth_teacher_id');
        const savedName = localStorage.getItem('auth_teacher_name');
        const savedUser = localStorage.getItem('auth_username');
        const savedRole = localStorage.getItem('auth_role') || "teacher";

        if (savedId && savedUser) {
            this.state = {
                isLoggedIn: true,
                teacherId: savedId,
                name: savedName || "លោកគ្រូ អ្នកគ្រូ",
                username: savedUser,
                role: savedRole
            };
            window.AuthState = { ...this.state, teacherName: this.state.name };
            window.AppState = window.AppState || {};
            window.AppState.isLoggedIn = true;
            window.AppState.teacherId = savedId;
            window.AppState.teacherName = this.state.name;

            this.showWorkspace();
        } else {
            this.showAuthScreen();
        }
    },

    // ៣. មុខងារចូលគណនី (Login)
    login: async function(e) {
        if (e && e.preventDefault) e.preventDefault();
        
        const userEl = document.getElementById('usernameOrPhone');
        const passEl = document.getElementById('password');
        const user = userEl ? userEl.value.trim() : "";
        const pass = passEl ? passEl.value.trim() : "";
        const btn = document.getElementById('btnLogin');
        const errDiv = document.getElementById("loginError");

        if (!user || !pass) {
            if (errDiv) {
                errDiv.textContent = "សូមវាយបញ្ចូលឈ្មោះគណនី និងលេខសម្ងាត់!";
                errDiv.classList.remove("hidden");
            } else {
                alert("សូមវាយបញ្ចូលឈ្មោះគណនី និងលេខសម្ងាត់!");
            }
            return;
        }

        const origBtnText = btn ? btn.innerHTML : "ចូលប្រព័ន្ធ";
        if (btn) {
            btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin mr-2"></i> កំពុងផ្ទៀងផ្ទាត់...';
            btn.disabled = true;
        }
        if (errDiv) errDiv.classList.add("hidden");

        try {
            let teacherData = null;

            // ជំហានទី ១៖ ផ្ទៀងផ្ទាត់ជាមួយ Cloud Firestore (បើមានការតភ្ជាប់)
            if (window.db) {
                try {
                    // ក. ស្វែងរកតាម username
                    const userSnap = await window.db.collection("teachers")
                        .where("username", "==", user.toLowerCase())
                        .limit(1)
                        .get();

                    if (!userSnap.empty) {
                        const doc = userSnap.docs[0].data();
                        if (doc.password === pass) {
                            teacherData = {
                                teacher_id: doc.teacher_id || userSnap.docs[0].id,
                                name: doc.name || doc.full_name || user,
                                username: doc.username,
                                role: doc.role || "teacher"
                            };
                        } else {
                            throw new Error("លេខសម្ងាត់មិនត្រឹមត្រូវទេ!");
                        }
                    } else {
                        // ខ. ស្វែងរកតាម teacher_id
                        const idSnap = await window.db.collection("teachers")
                            .where("teacher_id", "==", user.toUpperCase())
                            .limit(1)
                            .get();

                        if (!idSnap.empty) {
                            const doc = idSnap.docs[0].data();
                            if (doc.password === pass) {
                                teacherData = {
                                    teacher_id: doc.teacher_id,
                                    name: doc.name || doc.full_name || user,
                                    username: doc.username,
                                    role: doc.role || "teacher"
                                };
                            } else {
                                throw new Error("លេខសម្ងាត់មិនត្រឹមត្រូវទេ!");
                            }
                        }
                    }
                } catch (fsErr) {
                    if (fsErr.message === "លេខសម្ងាត់មិនត្រឹមត្រូវទេ!") throw fsErr;
                    console.warn("Firestore query note:", fsErr.message);
                }
            }

            // ជំហានទី ២៖ គណនីលំនាំដើម (Default Demo / First-run provision)
            if (!teacherData) {
                const uLower = user.toLowerCase();
                const uUpper = user.toUpperCase();

                if ((uLower === "admin" && pass === "admin123") ||
                    (uUpper === "TCH-001" && pass === "12345678") ||
                    (uLower === "teacher" && pass === "teacher123")) {
                    
                    const isAdmin = uLower === "admin";
                    teacherData = {
                        teacher_id: isAdmin ? "TCH-ADMIN" : "TCH-001",
                        name: isAdmin ? "លោកនាយកសាលា" : "លោកគ្រូ គំរូ",
                        username: uLower,
                        role: isAdmin ? "admin" : "teacher"
                    };

                    // រក្សាទុកចូល Firestore ដើម្បីប្រើលើកក្រោយ
                    if (window.db) {
                        window.db.collection("teachers").doc(teacherData.teacher_id).set({
                            ...teacherData,
                            password: pass,
                            created_at: firebase.firestore.FieldValue.serverTimestamp()
                        }, { merge: true }).catch(console.warn);
                    }
                }
            }

            // ជំហានទី ៣៖ ផ្ទៀងផ្ទាត់ជាមួយ Legacy Google Apps Script API (Fallback)
            if (!teacherData && typeof window.apiPost === 'function') {
                try {
                    const res = await window.apiPost("loginUser", { username: user, password: pass });
                    if (res && res.status === "success" && res.data) {
                        teacherData = res.data;
                        if (window.db) {
                            window.db.collection("teachers").doc(teacherData.teacher_id).set({
                                ...teacherData,
                                password: pass
                            }, { merge: true }).catch(console.warn);
                        }
                    }
                } catch (legacyErr) {
                    console.warn("Legacy login check failed:", legacyErr);
                }
            }

            // ប្រសិនបើនៅតែរកមិនឃើញ
            if (!teacherData) {
                throw new Error("ឈ្មោះគណនី ឬលេខសម្ងាត់មិនត្រឹមត្រូវទេ! (គណនីសាកល្បង៖ admin / admin123 ឬ TCH-001 / 12345678)");
            }

            // រក្សាទុក Session
            localStorage.setItem('auth_teacher_id', teacherData.teacher_id);
            localStorage.setItem('auth_teacher_name', teacherData.name);
            localStorage.setItem('auth_username', teacherData.username || user);
            localStorage.setItem('auth_role', teacherData.role || "teacher");

            this.state = {
                isLoggedIn: true,
                teacherId: teacherData.teacher_id,
                name: teacherData.name,
                username: teacherData.username || user,
                role: teacherData.role || "teacher"
            };

            window.AuthState = { ...this.state, teacherName: this.state.name };
            window.AppState = window.AppState || {};
            window.AppState.isLoggedIn = true;
            window.AppState.teacherId = teacherData.teacher_id;
            window.AppState.teacherName = teacherData.name;

            if (typeof showToast === 'function') showToast("ចូលប្រព័ន្ធបានជោគជ័យ! ✅");
            if (typeof window.logAudit === 'function') window.logAudit("LOGIN", "auth", `បានចូលប្រព័ន្ធ: ${teacherData.name} (${teacherData.teacher_id})`);
            this.showWorkspace();

        } catch (error) {
            console.error("Login Error:", error);
            if (errDiv) {
                errDiv.textContent = error.message;
                errDiv.classList.remove("hidden");
            } else {
                alert("❌ " + error.message);
            }
        } finally {
            if (btn) {
                btn.innerHTML = origBtnText;
                btn.disabled = false;
            }
        }
    },

    // ៤. មុខងារចុះឈ្មោះគណនីថ្មី (Register)
    register: async function(e) {
        if (e && e.preventDefault) e.preventDefault();

        const name = document.getElementById('regFullName')?.value.trim();
        const user = document.getElementById('regUsername')?.value.trim();
        const contact = document.getElementById('regContact')?.value.trim() || "";
        const pass = document.getElementById('regPassword')?.value;
        const confirmPass = document.getElementById('regConfirmPassword')?.value;
        const terms = document.getElementById('regTerms')?.checked;

        if (!terms) {
            alert("សូមយល់ព្រមលើលក្ខខណ្ឌប្រើប្រាស់ជាមុនសិន!");
            return;
        }
        if (pass !== confirmPass) {
            alert("❌ លេខសម្ងាត់ និងការបញ្ជាក់លេខសម្ងាត់មិនត្រូវគ្នាទេ!");
            return;
        }
        if (!pass || pass.length < 8) {
            alert("❌ លេខសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ ៨ តួអក្សរ!");
            return;
        }

        const btn = document.getElementById('btnRegister');
        const origBtnText = btn ? btn.innerHTML : "បង្កើតគណនី";
        if (btn) {
            btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin mr-2"></i> កំពុងចុះឈ្មោះ...';
            btn.disabled = true;
        }

        try {
            const randomSuffix = Math.floor(1000 + Math.random() * 9000);
            const teacherId = `TCH-${randomSuffix}`;

            const teacherDoc = {
                teacher_id: teacherId,
                name: name,
                username: user.toLowerCase(),
                password: pass,
                contact: contact,
                role: "teacher",
                created_at: new Date().toISOString()
            };

            // ១. រក្សាទុកក្នុង Firestore
            if (window.db) {
                await window.db.collection("teachers").doc(teacherId).set(teacherDoc);
            }

            // ២. រក្សាទុកក្នុង Google Apps Script (Backup)
            if (typeof window.apiPost === 'function') {
                try {
                    await window.apiPost("registerUser", teacherDoc);
                } catch(e) {
                    console.warn("Legacy register skipped:", e);
                }
            }

            if (typeof window.logAudit === 'function') window.logAudit("REGISTER", "auth", `បានចុះឈ្មោះគណនីគ្រូថ្មី: ${name} (${teacherId})`);
            alert(`🎉 អបអរសាទរ! ចុះឈ្មោះជោគជ័យ។\n\nលេខសម្គាល់គ្រូ (Teacher ID) របស់អ្នកគឺ: ${teacherId}\nឈ្មោះគណនី: ${user}\n\nសូមប្រើប្រាស់ព័ត៌មាននេះដើម្បីចូលគណនី។`);

            // ប្តូរមកផ្ទាំង Login វិញ
            window.toggleAuthBox('login');
            const userInput = document.getElementById('usernameOrPhone');
            const passInput = document.getElementById('password');
            if (userInput) userInput.value = user;
            if (passInput) passInput.value = pass;

        } catch (error) {
            console.error("Registration Error:", error);
            alert("❌ បរាជ័យក្នុងការចុះឈ្មោះ: " + error.message);
        } finally {
            if (btn) {
                btn.innerHTML = origBtnText;
                btn.disabled = false;
            }
        }
    },

    // ៥. មុខងារចាកចេញពីប្រព័ន្ធ (Logout)
    logout: function() {
        if (!confirm("តើលោកគ្រូ/អ្នកគ្រូពិតជាចង់ចាកចេញពីប្រព័ន្ធមែនទេ?")) return;
        if (typeof window.logAudit === 'function') window.logAudit("LOGOUT", "auth", "បានចាកចេញពីប្រព័ន្ធ");
        
        // សម្អាតតែ Auth Keys កុំឱ្យបាត់ Settings សាលា
        localStorage.removeItem('auth_teacher_id');
        localStorage.removeItem('auth_teacher_name');
        localStorage.removeItem('auth_username');
        localStorage.removeItem('auth_role');
        localStorage.removeItem('activeMenu');

        location.reload();
    },

    // ៦. បង្ហាញផ្ទាំង Auth
    showAuthScreen: function() {
        const appView = document.getElementById("appView");
        const landingScreen = document.getElementById("landing-screen");

        if (appView) appView.classList.add("hidden");
        if (landingScreen) {
            landingScreen.classList.remove("hidden");
            landingScreen.style.display = "flex";
        }
    },

    // ៧. បង្ហាញផ្ទាំង App Workspace
    showWorkspace: function() {
        const landingScreen = document.getElementById("landing-screen");
        const appView = document.getElementById("appView");

        if (landingScreen) {
            landingScreen.style.display = 'none';
            landingScreen.classList.add("hidden");
        }
        if (appView) {
            appView.classList.remove("hidden");
        }

        // ដាក់បញ្ចូលទិន្នន័យទៅក្នុង Sidebar
        const nameEl = document.getElementById("navUserName");
        const idEl = document.getElementById("navUserId");
        if (nameEl) nameEl.textContent = this.state.name || "លោកគ្រូ អ្នកគ្រូ";
        if (idEl) idEl.textContent = this.state.teacherId || "TCH-000";

        // បើក Dashboard ជា Default
        if (typeof window.switchView === 'function') {
            const lastMenu = localStorage.getItem('activeMenu') || "dashboard";
            window.switchView(lastMenu);
        }

        // បង្កើត Modal កែប្រែព័ត៌មានគណនី
        window.renderAccountModal();
    }
};

// =========================================================================
// UI Helpers & Global Event Handlers
// =========================================================================

// ប្តូររវាង Login និង Register Boxes
window.toggleAuthBox = function(type) {
    const loginBox = document.getElementById('authLoginBox');
    const registerBox = document.getElementById('authRegisterBox');

    if (type === 'register') {
        if (loginBox) loginBox.classList.add('hidden');
        if (registerBox) registerBox.classList.remove('hidden');
    } else {
        if (loginBox) loginBox.classList.remove('hidden');
        if (registerBox) registerBox.classList.add('hidden');
    }
};

// ភ្ជាប់ Event Listeners ទៅ Form
window.handleLogin = (e) => window.AppAuth.login(e);
window.handleRegister = (e) => window.AppAuth.register(e);
window.handleLogout = () => window.AppAuth.logout();
window.setupWorkspace = () => window.AppAuth.showWorkspace();

// បិទ/បើកមើលលេខសម្ងាត់
window.togglePasswordVisibility = function(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (!input || !icon) return;

    if (input.type === "password") {
        input.type = "text";
        icon.classList.replace("fa-eye", "fa-eye-slash");
        icon.classList.add("text-indigo-600");
    } else {
        input.type = "password";
        icon.classList.replace("fa-eye-slash", "fa-eye");
        icon.classList.remove("text-indigo-600");
    }
};

// ពិនិត្យកម្រិតសុវត្ថិភាពលេខសម្ងាត់
window.checkPasswordStrength = function(password) {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (password.match(/[A-Z]/) || password.match(/[0-9]/)) strength += 1;
    if (password.match(/[^a-zA-Z0-9]/)) strength += 1;

    const bar1 = document.getElementById("strBar1");
    const bar2 = document.getElementById("strBar2");
    const bar3 = document.getElementById("strBar3");
    const strText = document.getElementById("strText");
    const defaultBg = "bg-slate-200 dark:bg-slate-600";

    if (bar1) bar1.className = "h-full w-1/3 transition-all duration-300 " + (strength >= 1 ? "bg-rose-500" : defaultBg);
    if (bar2) bar2.className = "h-full w-1/3 transition-all duration-300 " + (strength >= 2 ? "bg-amber-400" : defaultBg);
    if (bar3) bar3.className = "h-full w-1/3 transition-all duration-300 " + (strength >= 3 ? "bg-emerald-500" : defaultBg);

    if (strText) {
        if (password.length === 0) {
            strText.textContent = "កម្រិតសុវត្ថិភាព: មិនទាន់មាន";
            strText.className = "text-[10px] text-slate-400 mt-1 font-bold";
        } else if (strength === 1) {
            strText.textContent = "កម្រិតសុវត្ថិភាព: ខ្សោយ (គួរមានអក្សរធំ និងលេខ)";
            strText.className = "text-[10px] text-rose-500 mt-1 font-bold animate-pulse";
        } else if (strength === 2) {
            strText.textContent = "កម្រិតសុវត្ថិភាព: មធ្យម";
            strText.className = "text-[10px] text-amber-500 mt-1 font-bold";
        } else {
            strText.textContent = "កម្រិតសុវត្ថិភាព: ខ្លាំងល្អណាស់";
            strText.className = "text-[10px] text-emerald-500 mt-1 font-bold";
        }
    }
};

// =========================================================================
// Modal សម្រាប់កែប្រែព័ត៌មានគណនីគ្រូ (Account Profile Modal)
// =========================================================================
window.renderAccountModal = function() {
    if (document.getElementById("accountProfileModal")) return;

    const modalHtml = `
        <div id="accountProfileModal" class="fixed inset-0 z-[7000] bg-slate-900/70 backdrop-blur-sm hidden items-center justify-center p-4 fade-in font-siemreap overflow-y-auto">
            <div class="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 dark:border-slate-700 relative transform transition-all my-auto">
                <button onclick="document.getElementById('accountProfileModal').classList.replace('flex','hidden')" class="absolute top-4 right-4 w-8 h-8 bg-black/10 dark:bg-white/10 hover:bg-rose-100 text-slate-500 hover:text-rose-600 rounded-full flex items-center justify-center transition z-20"><i class="fa-solid fa-xmark"></i></button>
                
                <div class="px-6 md:px-8 py-6 md:py-8 text-left">
                    <div class="flex items-center gap-4 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                        <div class="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl flex items-center justify-center text-2xl shadow-md"><i class="fa-solid fa-user-gear"></i></div>
                        <div>
                            <h3 class="text-xl font-moul text-slate-800 dark:text-white">ព័ត៌មានគណនី</h3>
                            <p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">កែប្រែប្រវត្តិរូបរបស់អ្នក</p>
                        </div>
                    </div>

                    <form id="accountUpdateForm" onsubmit="window.handleUpdateAccount(event)" class="space-y-4">
                        <div>
                            <label class="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">លេខសម្គាល់គ្រូ (Teacher ID)</label>
                            <input type="text" id="acc_teacher_id" readonly class="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-bold font-mono text-slate-500 dark:text-slate-300 cursor-not-allowed outline-none">
                        </div>
                        <div>
                            <label class="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">ឈ្មោះ និងនាមត្រកូល</label>
                            <input type="text" id="acc_name" required class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-600 transition text-slate-800 dark:text-white font-moul">
                        </div>
                        <div>
                            <label class="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">ឈ្មោះគណនី (Username)</label>
                            <input type="text" id="acc_username" required class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-600 transition text-slate-800 dark:text-white lowercase">
                        </div>
                        <div>
                            <label class="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">ប្តូរលេខសម្ងាត់ថ្មី (Password)</label>
                            <input type="password" id="acc_password" placeholder="ទុកចោលបើមិនចង់ប្តូរថ្មី" class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-600 transition text-slate-800 dark:text-white">
                        </div>
                        
                        <div class="pt-4 flex gap-3">
                            <button type="button" onclick="document.getElementById('accountProfileModal').classList.replace('flex','hidden')" class="flex-1 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 rounded-xl text-sm font-bold transition">បោះបង់</button>
                            <button type="submit" id="btnUpdateAccount" class="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-200 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2"><i class="fa-solid fa-floppy-disk"></i> រក្សាទុក</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.openAccountModal = function() {
    window.renderAccountModal();
    const modal = document.getElementById("accountProfileModal");
    if (!modal) return;

    const teacherId = window.AppAuth.state.teacherId || localStorage.getItem('auth_teacher_id') || "";
    const teacherName = window.AppAuth.state.name || localStorage.getItem('auth_teacher_name') || "";
    const username = window.AppAuth.state.username || localStorage.getItem('auth_username') || "";

    const idInput = document.getElementById("acc_teacher_id");
    const nameInput = document.getElementById("acc_name");
    const userInput = document.getElementById("acc_username");
    const passInput = document.getElementById("acc_password");

    if (idInput) idInput.value = teacherId;
    if (nameInput) nameInput.value = teacherName;
    if (userInput) userInput.value = username;
    if (passInput) passInput.value = "";

    modal.classList.remove("hidden");
    modal.classList.add("flex");
};

window.handleUpdateAccount = async function(e) {
    if (e && e.preventDefault) e.preventDefault();
    const newName = document.getElementById("acc_name")?.value.trim();
    const newUsername = document.getElementById("acc_username")?.value.trim();
    const newPassword = document.getElementById("acc_password")?.value.trim();
    const teacherId = document.getElementById("acc_teacher_id")?.value;
    const btn = document.getElementById("btnUpdateAccount");

    if (!newName || !newUsername) return alert("សូមបំពេញឈ្មោះ និងឈ្មោះគណនី!");

    const origBtnHtml = btn ? btn.innerHTML : "រក្សាទុក";
    if (btn) {
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> កំពុងរក្សាទុក...';
        btn.disabled = true;
    }

    try {
        const updateData = {
            name: newName,
            username: newUsername.toLowerCase(),
            last_updated: new Date().toISOString()
        };
        if (newPassword && newPassword.length >= 8) {
            updateData.password = newPassword;
        }

        // ១. Update លើ Firestore
        if (window.db && teacherId) {
            await window.db.collection("teachers").doc(teacherId).set(updateData, { merge: true });
        }

        // ២. Update LocalStorage
        localStorage.setItem('auth_teacher_name', newName);
        localStorage.setItem('auth_username', newUsername);
        window.AppAuth.state.name = newName;
        window.AppAuth.state.username = newUsername;
        if (window.AuthState) {
            window.AuthState.teacherName = newName;
            window.AuthState.username = newUsername;
        }

        // ៣. Update UI Sidebar
        const nameEl = document.getElementById("navUserName");
        if (nameEl) nameEl.textContent = newName;

        document.getElementById('accountProfileModal')?.classList.replace('flex','hidden');
        if (typeof showToast === 'function') showToast("✅ បានកែប្រែព័ត៌មានគណនីជោគជ័យ!");

    } catch (err) {
        console.error("Account update error:", err);
        alert("❌ ការកែប្រែមិនជោគជ័យ: " + err.message);
    } finally {
        if (btn) {
            btn.innerHTML = origBtnHtml;
            btn.disabled = false;
        }
    }
};

// ដំណើរការពិនិត្យ Session ពេល Load ទំព័រ
document.addEventListener("DOMContentLoaded", () => {
    window.AppAuth.init();
});
