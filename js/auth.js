// =========================================================================
// ឯកសារ js/auth.js - ប្រព័ន្ធគ្រប់គ្រងសុវត្ថិភាព និងគណនីគ្រូ (Firestore & Local Auth)
// =========================================================================

// =========================================================================
// AUTH-05: Web Crypto API Cryptographic Password Hashing (Salted SHA-256)
// =========================================================================
window.generateSalt = function() {
    const array = new Uint8Array(16);
    (window.crypto || window.msCrypto).getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
};

window.hashPassword = async function(password, salt) {
    if (!salt) salt = window.generateSalt();
    const encoder = new TextEncoder();
    const data = encoder.encode(salt + ":" + password);
    const hashBuffer = await (window.crypto || window.msCrypto).subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return `sha256$${salt}$${hashHex}`;
};

window.verifyPassword = async function(password, storedHashOrPlain) {
    if (!storedHashOrPlain) return false;
    // ករណីរក្សាទុកជា salted hash: sha256$salt$hash
    if (typeof storedHashOrPlain === 'string' && storedHashOrPlain.startsWith('sha256$')) {
        const parts = storedHashOrPlain.split('$');
        if (parts.length === 3) {
            const salt = parts[1];
            const computed = await window.hashPassword(password, salt);
            return computed === storedHashOrPlain;
        }
    }
    // ភាពត្រូវគ្នាជាមួយពាក្យសម្ងាត់ចាស់ដែលធ្លាប់ជា Plain Text ក្នុង Firestore
    return storedHashOrPlain === password;
};

window.AppAuth = {
    state: {
        isLoggedIn: false,
        teacherId: null,
        name: null,
        username: null,
        role: "teacher",
        roles: ["teacher"],
        assigned_grade: "ថ្នាក់ទី ១",
        assigned_room: "«ក»",
        school_id: "SCH-001",
        status: "active",
        permissions_version: 1
    },

    permissionListenerUnsubscribe: null,

    // ១. ចាប់ផ្តើមដំណើរការ (Init on load)
    init: function() {
        this.checkSession();
        this.initInactivityTracker();
    },

    // ត្រួតពិនិត្យរយៈពេលអសកម្ម (AUTH-04: Session Security Inactivity Timeout)
    initInactivityTracker: function() {
        let inactivityTimer;
        const INACTIVITY_LIMIT_MS = 60 * 60 * 1000; // 60 minutes timeout

        const resetTimer = () => {
            if (!this.state.isLoggedIn) return;
            clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(() => {
                if (this.state.isLoggedIn) {
                    alert("⚠️ ការតភ្ជាប់ (Session) ត្រូវបានផុតកំណត់ដោយសារអសកម្មលើសពី ៦០ នាទី! សូមចូលប្រព័ន្ធម្តងទៀត។");
                    this.logout();
                }
            }, INACTIVITY_LIMIT_MS);
        };

        ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'].forEach(evt => {
            window.addEventListener(evt, resetTimer, { passive: true });
        });
        resetTimer();
    },

    // ត្រួតពិនិត្យ និងស្តាប់ការផ្លាស់ប្តូរសិទ្ធិជាបន្ទាន់ (Real-time Permission Invalidation - Chapter 2)
    startPermissionSyncListener: function(teacherId) {
        if (!teacherId || !window.db) return;
        if (typeof this.permissionListenerUnsubscribe === 'function') {
            this.permissionListenerUnsubscribe();
            this.permissionListenerUnsubscribe = null;
        }

        try {
            this.permissionListenerUnsubscribe = window.db.collection("teachers").doc(teacherId)
                .onSnapshot(docSnap => {
                    if (!docSnap.exists) return;
                    const data = docSnap.data();
                    if (!data) return;

                    // ១. ពិនិត្យស្ថានភាពគណនី (Inactive/Locked)
                    if (data.status && data.status.toLowerCase() !== "active") {
                        alert("⚠️ គណនីរបស់អ្នកត្រូវបានផ្អាក ឬចាក់សោ (Inactive/Locked) ដោយ Administrator! ប្រព័ន្ធនឹងចាកចេញដោយស្វ័យប្រវត្តិ។");
                        this.logout(true);
                        return;
                    }

                    // ២. ពិនិត្យការផ្លាស់ប្តូរសិទ្ធិ (Role / Permissions changes)
                    const currentRoles = window.getUserRoles();
                    const incomingRoles = window.normalizeRoles(data.roles || data.role, "teacher");
                    const currentScope = `${this.state.assigned_grade || ''}_${this.state.assigned_room || ''}`;
                    const incomingScope = `${data.assigned_grade || ''}_${data.assigned_room || ''}`;

                    const rolesChanged = JSON.stringify(currentRoles.sort()) !== JSON.stringify(incomingRoles.sort());
                    const scopeChanged = currentScope !== incomingScope;

                    if (rolesChanged || scopeChanged) {
                        console.log("🔄 [Auth] សិទ្ធិ ឬវិសាលភាពត្រូវបានផ្លាស់ប្តូរនៅលើ Cloud:", { incomingRoles, incomingScope });
                        
                        this.state.roles = incomingRoles;
                        this.state.role = incomingRoles[0] || "teacher";
                        this.state.assigned_grade = data.assigned_grade || this.state.assigned_grade;
                        this.state.assigned_room = data.assigned_room || this.state.assigned_room;
                        this.state.school_id = data.school_id || this.state.school_id;

                        localStorage.setItem('auth_role', this.state.role);
                        localStorage.setItem('auth_roles', JSON.stringify(this.state.roles));
                        localStorage.setItem('auth_assigned_grade', this.state.assigned_grade);
                        localStorage.setItem('auth_assigned_room', this.state.assigned_room);

                        window.AuthState = { 
                            ...this.state, 
                            teacherName: this.state.name,
                            teacher_level: this.state.assigned_grade,
                            teacher_room: this.state.assigned_room
                        };

                        if (typeof showToast === 'function') {
                            showToast("🔔 សិទ្ធិប្រើប្រាស់ ឬថ្នាក់ទទួលខុសត្រូវត្រូវបានធ្វើបច្ចុប្បន្នភាពភ្លាមៗ!", "info");
                        }

                        // ជូនដំណឹងដល់ Components ផ្សេងៗឱ្យ Render ឡើងវិញ
                        window.dispatchEvent(new CustomEvent('auth-permissions-updated', { detail: this.state }));
                    }
                }, err => {
                    console.warn("Permission sync listener note:", err.message);
                });
        } catch(e) {
            console.warn("Error starting permission listener:", e);
        }
    },

    // ២. ត្រួតពិនិត្យ Session ចាស់
    checkSession: function() {
        const savedId = localStorage.getItem('auth_teacher_id');
        const savedName = localStorage.getItem('auth_teacher_name');
        const savedUser = localStorage.getItem('auth_username');
        const savedRole = localStorage.getItem('auth_role') || "teacher";
        const savedRolesJson = localStorage.getItem('auth_roles');
        let savedRoles = [];
        try {
            savedRoles = savedRolesJson ? JSON.parse(savedRolesJson) : [];
        } catch(e) {}
        if (!Array.isArray(savedRoles) || savedRoles.length === 0) {
            savedRoles = window.normalizeRoles(savedRole, "teacher");
        }

        const savedGrade = localStorage.getItem('auth_assigned_grade') || "ថ្នាក់ទី ១";
        const savedRoom = localStorage.getItem('auth_assigned_room') || "«ក»";
        const savedSchool = localStorage.getItem('auth_school_id') || "SCH-001";
        const savedStatus = localStorage.getItem('auth_status') || "active";

        if (savedId && savedUser) {
            this.state = {
                isLoggedIn: true,
                teacherId: savedId,
                name: savedName || "លោកគ្រូ អ្នកគ្រូ",
                username: savedUser,
                role: savedRole,
                roles: savedRoles,
                assigned_grade: savedGrade,
                assigned_room: savedRoom,
                school_id: savedSchool,
                status: savedStatus
            };
            window.AuthState = { 
                ...this.state, 
                teacherName: this.state.name,
                teacher_level: savedGrade,
                teacher_room: savedRoom
            };
            window.AppState = window.AppState || {};
            window.AppState.isLoggedIn = true;
            window.AppState.teacherId = savedId;
            window.AppState.teacherName = this.state.name;

            this.showWorkspace();
            this.startPermissionSyncListener(savedId);
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

        // ត្រួតពិនិត្យការចាក់សោគណនីបណ្តោះអាសន្ន (AUTH-05: Rate Limiting)
        const lockedUntil = parseInt(localStorage.getItem('auth_locked_until') || '0', 10);
        if (Date.now() < lockedUntil) {
            const remainingMins = Math.ceil((lockedUntil - Date.now()) / 60000);
            const lockMsg = `⚠️ ការចូលត្រូវបានចាក់សោបណ្តោះអាសន្នដោយសារបញ្ចូលលេខសម្ងាត់ខុសច្រើនដង! សូមរង់ចាំ ${remainingMins} នាទីទៀត។`;
            if (btn) { btn.innerHTML = origBtnText; btn.disabled = false; }
            if (errDiv) { errDiv.textContent = lockMsg; errDiv.classList.remove("hidden"); }
            else alert(lockMsg);
            return;
        }

        try {
            let teacherData = null;

            // ជំហានទី ១៖ ផ្ទៀងផ្ទាត់ជាមួយ Cloud Firestore (Cryptographic Verification - AUTH-05)
            if (window.db) {
                try {
                    // ក. ស្វែងរកតាម username
                    const userSnap = await window.db.collection("teachers")
                        .where("username", "==", user.toLowerCase())
                        .limit(1)
                        .get();

                    let matchedDoc = null;
                    let matchedDocId = null;

                    if (!userSnap.empty) {
                        matchedDoc = userSnap.docs[0].data();
                        matchedDocId = userSnap.docs[0].id;
                    } else {
                        // ខ. ស្វែងរកតាម teacher_id
                        const idSnap = await window.db.collection("teachers")
                            .where("teacher_id", "==", user.toUpperCase())
                            .limit(1)
                            .get();
                        if (!idSnap.empty) {
                            matchedDoc = idSnap.docs[0].data();
                            matchedDocId = idSnap.docs[0].id;
                        }
                    }

                    if (matchedDoc) {
                        const storedCredential = matchedDoc.password_hash || matchedDoc.password;
                        const isPasswordValid = await window.verifyPassword(pass, storedCredential);

                        if (isPasswordValid) {
                            const normalizedRoles = window.normalizeRoles(matchedDoc.roles || matchedDoc.role, "teacher");
                            teacherData = {
                                teacher_id: matchedDoc.teacher_id || matchedDocId,
                                name: matchedDoc.name || matchedDoc.full_name || user,
                                username: matchedDoc.username || user.toLowerCase(),
                                role: normalizedRoles[0] || "teacher",
                                roles: normalizedRoles,
                                assigned_grade: matchedDoc.assigned_grade || "ថ្នាក់ទី ១",
                                assigned_room: matchedDoc.assigned_room || "«ក»",
                                school_id: matchedDoc.school_id || "SCH-001",
                                status: matchedDoc.status || "active"
                            };

                            // ការពារសុវត្ថិភាព (AUTH-05): បម្លែង Plaintext ទៅជា Salted Hash SHA-256 ដោយស្វ័យប្រវត្តិ
                            const migrationUpdates = {
                                last_login_at: firebase.firestore.FieldValue.serverTimestamp(),
                                updated_at: new Date().toISOString()
                            };
                            if (storedCredential && !storedCredential.startsWith("sha256$")) {
                                migrationUpdates.password_hash = await window.hashPassword(pass);
                                migrationUpdates.password = firebase.firestore.FieldValue.delete();
                            }
                            window.db.collection("teachers").doc(matchedDocId).update(migrationUpdates).catch(console.warn);
                        } else {
                            throw new Error("លេខសម្ងាត់មិនត្រឹមត្រូវទេ!");
                        }
                    }
                } catch (fsErr) {
                    if (fsErr.message === "លេខសម្ងាត់មិនត្រឹមត្រូវទេ!") throw fsErr;
                    console.warn("Firestore query note:", fsErr.message);
                }
            }

            // ជំហានទី ២៖ គណនីគំរូតួនាទីទាំង ៤ តាមជំពូកទី២ (Canonical Demo Roles with Salted Hashes - AUTH-05)
            if (!teacherData) {
                const uLower = user.toLowerCase();
                const DEMO_ACCOUNTS = [
                    {
                        usernames: ["admin", "sysadmin"],
                        hash: "sha256$a1b2c3d4e5f60718$6f090945bbac63e39704740bcae033f193d9ebccd14b1c8334dc48f9cebf68ef",
                        data: {
                            teacher_id: "TCH-SYSADMIN",
                            name: "អ្នកគ្រប់គ្រងប្រព័ន្ធ (System Administrator)",
                            username: "admin",
                            role: "system_admin",
                            roles: ["system_admin", "school_admin"],
                            assigned_grade: "គ្រប់ថ្នាក់",
                            assigned_room: "ទូទៅ",
                            school_id: "SCH-001",
                            status: "active"
                        }
                    },
                    {
                        usernames: ["schooladmin", "principal"],
                        hash: "sha256$b2c3d4e5f6a10729$dd76a574799fc27b2c45cd74d0d676a6a0bf46d307c26f676f4f94012346c58a",
                        data: {
                            teacher_id: "TCH-SCHADMIN",
                            name: "លោកនាយកសាលា (School Administrator)",
                            username: "schooladmin",
                            role: "school_admin",
                            roles: ["school_admin"],
                            assigned_grade: "គ្រប់ថ្នាក់",
                            assigned_room: "ទូទៅ",
                            school_id: "SCH-001",
                            status: "active"
                        }
                    },
                    {
                        usernames: ["teacher", "tch-001"],
                        hash: "sha256$c3d4e5f6a1b2073a$c7e76bad475902498e3af524dc854d54e5a6131cf6d1b9dfd17c7e0cca0da540",
                        altHash: "sha256$d4e5f6a1b2c3074b$4b11d66ade252336d09f9598732a9244ab3f2857f771e769a3ee204badcdfb94",
                        data: {
                            teacher_id: "TCH-001",
                            name: "លោកគ្រូ គំរូ (Teacher)",
                            username: "teacher",
                            role: "teacher",
                            roles: ["teacher"],
                            assigned_grade: "ថ្នាក់ទី ១",
                            assigned_room: "«ក»",
                            school_id: "SCH-001",
                            status: "active"
                        }
                    },
                    {
                        usernames: ["viewer", "inspector"],
                        hash: "sha256$e5f6a1b2c3d4075c$0ae1cd10bd20b1cf1c15fba068c3d69d2c0fb4e39ac29720005ac066157c6c4e",
                        data: {
                            teacher_id: "TCH-VIEWER",
                            name: "មន្ត្រីត្រួតពិនិត្យ (Report Viewer)",
                            username: "viewer",
                            role: "report_viewer",
                            roles: ["report_viewer"],
                            assigned_grade: "គ្រប់ថ្នាក់",
                            assigned_room: "ទូទៅ",
                            school_id: "SCH-001",
                            status: "active"
                        }
                    }
                ];

                for (const demo of DEMO_ACCOUNTS) {
                    if (demo.usernames.includes(uLower)) {
                        const isMatchPrimary = await window.verifyPassword(pass, demo.hash);
                        const isMatchAlt = demo.altHash ? await window.verifyPassword(pass, demo.altHash) : false;
                        if (isMatchPrimary || isMatchAlt) {
                            teacherData = { ...demo.data };
                            if (window.db) {
                                const demoHash = await window.hashPassword(pass);
                                window.db.collection("teachers").doc(teacherData.teacher_id).set({
                                    ...teacherData,
                                    password_hash: demoHash,
                                    created_at: firebase.firestore.FieldValue.serverTimestamp(),
                                    last_login_at: firebase.firestore.FieldValue.serverTimestamp()
                                }, { merge: true }).catch(console.warn);
                            }
                            break;
                        }
                    }
                }
            }

            // ជំហានទី ៣៖ ផ្ទៀងផ្ទាត់ជាមួយ Legacy Google Apps Script API (Fallback)
            if (!teacherData && typeof window.apiPost === 'function') {
                try {
                    const res = await window.apiPost("loginUser", { username: user, password: pass });
                    if (res && res.status === "success" && res.data) {
                        const legRoles = window.normalizeRoles(res.data.roles || res.data.role, "teacher");
                        teacherData = {
                            ...res.data,
                            roles: legRoles,
                            role: legRoles[0] || "teacher",
                            assigned_grade: res.data.assigned_grade || "ថ្នាក់ទី ១",
                            assigned_room: res.data.assigned_room || "«ក»",
                            school_id: res.data.school_id || "SCH-001",
                            status: res.data.status || "active"
                        };
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
                // កត់ត្រាចំនួនលើកដែលបញ្ចូលខុស
                let failedCount = parseInt(localStorage.getItem('auth_failed_attempts') || '0', 10) + 1;
                localStorage.setItem('auth_failed_attempts', failedCount.toString());

                if (failedCount >= 5) {
                    localStorage.setItem('auth_locked_until', (Date.now() + 5 * 60 * 1000).toString());
                    localStorage.removeItem('auth_failed_attempts');
                    throw new Error("⚠️ លោកគ្រូបានបញ្ចូលលេខសម្ងាត់ខុស ៥ ដង! ប្រព័ន្ធសូមចាក់សោ ៥ នាទីដើម្បីសុវត្ថិភាព។");
                }
                throw new Error(`ឈ្មោះគណនី ឬលេខសម្ងាត់មិនត្រឹមត្រូវទេ! (ព្យាយាមខុសលើកទី ${failedCount}/៥)`);
            }

            // ត្រួតពិនិត្យស្ថានភាពគណនី (AUTH-03: Account Status Active / Inactive / Locked)
            if (teacherData.status && teacherData.status.toLowerCase() !== "active") {
                throw new Error("⚠️ គណនីរបស់អ្នកត្រូវបានផ្អាក ឬចាក់សោ (Inactive/Locked)! សូមទាក់ទងអ្នកគ្រប់គ្រងសាលា។");
            }

            // ជោគជ័យ៖ សម្អាត Failed Attempts
            localStorage.removeItem('auth_failed_attempts');
            localStorage.removeItem('auth_locked_until');

            const normalizedRoles = window.normalizeRoles(teacherData.roles || teacherData.role, "teacher");

            // រក្សាទុក Session ពេញលេញ
            localStorage.setItem('auth_teacher_id', teacherData.teacher_id);
            localStorage.setItem('auth_teacher_name', teacherData.name);
            localStorage.setItem('auth_username', teacherData.username || user);
            localStorage.setItem('auth_role', normalizedRoles[0] || "teacher");
            localStorage.setItem('auth_roles', JSON.stringify(normalizedRoles));
            const isAdminRole = normalizedRoles.some(r => r === 'school_admin' || r === 'system_admin' || r === 'admin');
            localStorage.setItem('auth_assigned_grade', isAdminRole ? "all" : (teacherData.assigned_grade || "ថ្នាក់ទី ១"));
            localStorage.setItem('auth_assigned_room', isAdminRole ? "all" : (teacherData.assigned_room || "«ក»"));
            localStorage.setItem('auth_school_id', teacherData.school_id || "SCH-001");
            localStorage.setItem('auth_status', teacherData.status || "active");

            this.state = {
                isLoggedIn: true,
                teacherId: teacherData.teacher_id,
                name: teacherData.name,
                username: teacherData.username || user,
                role: normalizedRoles[0] || "teacher",
                roles: normalizedRoles,
                assigned_grade: teacherData.assigned_grade || "ថ្នាក់ទី ១",
                assigned_room: teacherData.assigned_room || "«ក»",
                school_id: teacherData.school_id || "SCH-001",
                status: teacherData.status || "active"
            };

            window.AuthState = { 
                ...this.state, 
                teacherName: this.state.name,
                teacher_level: this.state.assigned_grade,
                teacher_room: this.state.assigned_room
            };
            window.AppState = window.AppState || {};
            window.AppState.isLoggedIn = true;
            window.AppState.teacherId = teacherData.teacher_id;
            window.AppState.teacherName = teacherData.name;

            this.startPermissionSyncListener(teacherData.teacher_id);

            if (typeof showToast === 'function') showToast("ចូលប្រព័ន្ធបានជោគជ័យ! ✅");
            if (typeof window.logAudit === 'function') {
                window.logAudit("LOGIN", "auth", `បានចូលប្រព័ន្ធ: ${teacherData.name} (${teacherData.teacher_id}) | Roles: [${normalizedRoles.join(', ')}]`);
            }
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
            const passwordHash = await window.hashPassword(pass);

            const teacherDoc = {
                teacher_id: teacherId,
                name: name,
                username: user.toLowerCase(),
                password_hash: passwordHash,
                contact: contact,
                role: "teacher",
                roles: ["teacher"],
                assigned_grade: "ថ្នាក់ទី ១",
                assigned_room: "«ក»",
                school_id: "SCH-001",
                status: "active",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
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
    logout: function(silent = false) {
        if (!silent) {
            if (!confirm("តើលោកគ្រូ/អ្នកគ្រូពិតជាចង់ចាកចេញពីប្រព័ន្ធមែនទេ?")) return;
        }
        if (typeof window.logAudit === 'function') window.logAudit("LOGOUT", "auth", "បានចាកចេញពីប្រព័ន្ធ");

        if (typeof this.permissionListenerUnsubscribe === 'function') {
            try { this.permissionListenerUnsubscribe(); } catch(e) {}
            this.permissionListenerUnsubscribe = null;
        }
        
        // សម្អាតតែ Auth Keys កុំឱ្យបាត់ Settings សាលា
        localStorage.removeItem('auth_teacher_id');
        localStorage.removeItem('auth_teacher_name');
        localStorage.removeItem('auth_username');
        localStorage.removeItem('auth_role');
        localStorage.removeItem('auth_roles');
        localStorage.removeItem('auth_assigned_grade');
        localStorage.removeItem('auth_assigned_room');
        localStorage.removeItem('auth_school_id');
        localStorage.removeItem('auth_status');
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

        // អនុវត្តសិទ្ធិមើលម៉ឺនុយតាមតួនាទី (Admin vs Class Teacher)
        if (typeof window.applyRoleBasedNavigation === 'function') {
            window.applyRoleBasedNavigation();
        }

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
            last_updated: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        if (newPassword && newPassword.length >= 8) {
            updateData.password_hash = await window.hashPassword(newPassword);
        }

        // ១. Update លើ Firestore
        if (window.db && teacherId) {
            if (updateData.password_hash) {
                updateData.password = firebase.firestore.FieldValue.delete();
            }
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

// =========================================================================
// ៨. គ្រប់គ្រងគណនីគ្រូ និងកំណត់សិទ្ធិ (User Roles & RBAC - Chapter 2)
// =========================================================================

// កាតាឡុកតួនាទី និងសិទ្ធិផ្លូវការតាមជំពូកទី ២
window.ROLE_DEFINITIONS = {
    system_admin: {
        id: "system_admin",
        code: "SYS_ADMIN",
        titleKh: "System Administrator",
        nameKh: "អ្នកគ្រប់គ្រងប្រព័ន្ធ (System Administrator)",
        descKh: "គ្រប់គ្រងគណនី សិទ្ធិ ការកំណត់ប្រព័ន្ធ និងការបម្រុងទុក",
        badgeClass: "bg-rose-50 text-rose-700 border border-rose-200",
        icon: "fa-shield-halved"
    },
    school_admin: {
        id: "school_admin",
        code: "SCH_ADMIN",
        titleKh: "School Administrator",
        nameKh: "អ្នកគ្រប់គ្រងសាលា (School Administrator)",
        descKh: "គ្រប់គ្រងព័ត៌មានសាលា ឆ្នាំសិក្សា ថ្នាក់ សិស្ស និងរបាយការណ៍ដែលបានអនុញ្ញាត",
        badgeClass: "bg-indigo-50 text-indigo-700 border border-indigo-200",
        icon: "fa-school"
    },
    teacher: {
        id: "teacher",
        code: "TEACHER",
        titleKh: "Teacher",
        nameKh: "គ្រូបង្រៀន (Teacher)",
        descKh: "មើលថ្នាក់ដែលទទួលខុសត្រូវ កត់ត្រាវត្តមាន និងបញ្ចូលពិន្ទុតាមសិទ្ធិ",
        badgeClass: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        icon: "fa-chalkboard-user"
    },
    report_viewer: {
        id: "report_viewer",
        code: "VIEWER",
        titleKh: "Report Viewer",
        nameKh: "អ្នកមើលរបាយការណ៍ (Report Viewer)",
        descKh: "មើលរបាយការណ៍ដែលបានអនុញ្ញាត ដោយមិនអាចកែប្រែទិន្នន័យ",
        badgeClass: "bg-amber-50 text-amber-700 border border-amber-200",
        icon: "fa-chart-pie"
    }
};

// មុខងារជំនួយបំលែងតួនាទីជា Array (Multi-role Normalizer)
window.normalizeRoles = function(rolesInput, fallbackRole = "teacher") {
    if (Array.isArray(rolesInput) && rolesInput.length > 0) {
        return rolesInput.map(r => String(r).toLowerCase().trim()).filter(Boolean);
    }
    const single = String(rolesInput || fallbackRole || 'teacher').toLowerCase().trim();
    if (single === 'admin') return ['system_admin', 'school_admin'];
    if (single === 'sysadmin') return ['system_admin'];
    if (single === 'schooladmin') return ['school_admin'];
    if (single === 'viewer') return ['report_viewer'];
    return [single];
};

// ទាញយក Roles ទាំងអស់របស់អ្នកប្រើប្រាស់បច្ចុប្បន្ន
window.getUserRoles = function() {
    if (window.AuthState && Array.isArray(window.AuthState.roles) && window.AuthState.roles.length > 0) {
        return window.AuthState.roles;
    }
    if (window.AppAuth && window.AppAuth.state && window.AppAuth.state.isLoggedIn && Array.isArray(window.AppAuth.state.roles) && window.AppAuth.state.roles.length > 0) {
        return window.AppAuth.state.roles;
    }
    
    const storedRolesJson = localStorage.getItem('auth_roles');
    if (storedRolesJson) {
        try {
            const parsed = JSON.parse(storedRolesJson);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch(e) {}
    }
    const singleRole = localStorage.getItem('auth_role') || 'teacher';
    return window.normalizeRoles(singleRole, 'teacher');
};

// ពិនិត្យថាតើអ្នកប្រើប្រាស់មានតួនាទីជាក់លាក់ឬទេ
window.hasRole = function(role) {
    const roles = window.getUserRoles();
    const target = String(role).toLowerCase().trim();
    if (roles.includes("system_admin") && target !== "report_viewer") return true;
    return roles.includes(target);
};

// ពិនិត្យថាតើអ្នកប្រើប្រាស់មានតួនាទីណាមួយក្នុងចំណោម Roles បញ្ចូលឬទេ
window.hasAnyRole = function(rolesArray) {
    if (!Array.isArray(rolesArray)) return false;
    return rolesArray.some(r => window.hasRole(r));
};

// ពិនិត្យជា System Administrator
window.isSystemAdmin = function() {
    const roles = window.getUserRoles();
    return roles.includes("system_admin") || roles.includes("admin");
};

// ពិនិត្យជា School Administrator (System Admin ក៏មានសិទ្ធិដូច School Admin)
window.isSchoolAdmin = function() {
    const roles = window.getUserRoles();
    return roles.includes("school_admin") || roles.includes("system_admin") || roles.includes("admin");
};

// ពិនិត្យជា Teacher
window.isTeacher = function() {
    const roles = window.getUserRoles();
    return roles.includes("teacher");
};

// ពិនិត្យជា Report Viewer (គ្មានសិទ្ធិកែប្រែទិន្នន័យ)
window.isReportViewer = function() {
    const roles = window.getUserRoles();
    return roles.includes("report_viewer") || roles.includes("viewer");
};

// ភាពត្រូវគ្នាជាមួយ Function ចាស់
window.isCurrentUserAdmin = function() {
    return window.isSchoolAdmin() || window.isSystemAdmin();
};

// ពិនិត្យសិទ្ធិកែប្រែទិន្នន័យទូទៅ
window.canEditRecords = function() {
    const roles = window.getUserRoles();
    if (roles.includes("report_viewer") && roles.length === 1) return false;
    return window.hasAnyRole(["system_admin", "school_admin", "teacher"]);
};

// ទទួលព័ត៌មានវិសាលភាពទទួលខុសត្រូវ (Assigned Scope)
window.getAssignedScope = function() {
    const isAdmin = typeof window.isSchoolAdmin === 'function' ? window.isSchoolAdmin() : false;
    if (isAdmin) {
        return {
            school_id: localStorage.getItem('auth_school_id') || window.AuthState?.school_id || "SCH-001",
            grade: "all",
            room: "all"
        };
    }
    return {
        school_id: localStorage.getItem('auth_school_id') || window.AuthState?.school_id || "SCH-001",
        grade: (localStorage.getItem('auth_assigned_grade') || window.AuthState?.assigned_grade || "").trim(),
        room: (localStorage.getItem('auth_assigned_room') || window.AuthState?.assigned_room || "").trim()
    };
};

// =========================================================================
// ៩. DataServiceGuard - ត្រួតពិនិត្យសិទ្ធិនៅកម្រិតសេវាទិន្នន័យ (Backend & Data Layer)
// =========================================================================
window.DataServiceGuard = {
    // ត្រួតពិនិត្យសិទ្ធិអនុញ្ញាត
    can: function(action, context = {}) {
        const roles = window.getUserRoles();
        if (roles.includes("system_admin")) return true;

        // បើជា Report Viewer សុទ្ធសាធ មិនអនុញ្ញាតរាល់ Write Actions
        const isPureViewer = roles.includes("report_viewer") && roles.length === 1;

        switch (action) {
            case "manage_users":
            case "manage_roles":
            case "backup_restore":
            case "system_maintenance":
                return roles.includes("system_admin");

            case "manage_school_info":
            case "manage_academic_year":
            case "manage_classes":
            case "manage_all_students":
                return roles.includes("school_admin");

            case "view_student":
                if (roles.includes("school_admin") || roles.includes("report_viewer")) return true;
                if (roles.includes("teacher")) {
                    return this.isWithinAssignedScope(context.grade, context.room);
                }
                return false;

            case "create_student":
            case "edit_student":
                if (isPureViewer) return false;
                if (roles.includes("school_admin")) return true;
                if (roles.includes("teacher")) {
                    return this.isWithinAssignedScope(context.grade, context.room);
                }
                return false;

            case "delete_student":
                // មានតែ School Admin ឬ System Admin ប៉ុណ្ណោះដែលអាចលុបសិស្ស
                if (isPureViewer) return false;
                return roles.includes("school_admin");

            case "record_attendance":
            case "enter_scores":
                if (isPureViewer) return false;
                if (roles.includes("school_admin")) return true;
                if (roles.includes("teacher")) {
                    return this.isWithinAssignedScope(context.grade, context.room);
                }
                return false;

            case "view_reports":
                return true; // គ្រប់តួនាទីអាចមើលរបាយការណ៍ដែលបានអនុញ្ញាត

            default:
                return false;
        }
    },

    // ត្រួតពិនិត្យវិសាលភាពថ្នាក់ទទួលខុសត្រូវ
    isWithinAssignedScope: function(grade, room) {
        const roles = window.getUserRoles();
        if (roles.includes("system_admin") || roles.includes("school_admin")) return true;

        const scope = window.getAssignedScope();
        if (!scope.grade) return true; // ប្រសិនបើមិនទាន់កំណត់ថ្នាក់

        const normGrade = (typeof normalizeGrade === 'function' ? normalizeGrade(grade) : (grade || "")).trim();
        const normAssigned = (typeof normalizeGrade === 'function' ? normalizeGrade(scope.grade) : scope.grade).trim();

        if (normGrade && normGrade !== normAssigned) return false;
        if (room && scope.room && room.trim() !== scope.room.trim()) return false;
        return true;
    },

    // Assert សិទ្ធិ បើគ្មានសិទ្ធិ Throw Error និងកត់ត្រា Audit ភ្លាមៗ
    assertCan: function(action, context = {}, customKhmerMessage = "") {
        if (!this.can(action, context)) {
            const defaultMsg = `⚠️ សិទ្ធិត្រូវបានបដិសេធ (Access Denied)៖ អ្នកមិនមានសិទ្ធិអនុវត្តសកម្មភាព "${action}" លើវិសាលភាពនេះឡើយ!`;
            const finalMsg = customKhmerMessage || defaultMsg;
            if (typeof window.logAudit === 'function') {
                window.logAudit('SECURITY_BLOCKED', 'security', `សិទ្ធិត្រូវបានបដិសេធ៖ ${action} | Context: ${JSON.stringify(context)}`);
            }
            throw new Error(finalMsg);
        }
        return true;
    }
};

// =========================================================================
// ១០. គ្រប់គ្រងគណនីគ្រូ (CRUD Operations & Multi-role Management)
// =========================================================================

window.fetchTeacherAccounts = async function() {
    let teachers = [];

    // ១. ទាញពី Firestore បើមាន
    if (window.db) {
        try {
            const snap = await window.db.collection("teachers").get();
            if (!snap.empty) {
                teachers = snap.docs.map(doc => {
                    const data = doc.data();
                    const roles = window.normalizeRoles(data.roles || data.role, "teacher");
                    return {
                        teacher_id: data.teacher_id || doc.id,
                        name: data.name || data.full_name || "លោកគ្រូ អ្នកគ្រូ",
                        username: data.username || doc.id.toLowerCase(),
                        role: roles[0] || "teacher",
                        roles: roles,
                        contact: data.contact || data.phone || "",
                        assigned_grade: data.assigned_grade || data.teacher_level || "ថ្នាក់ទី ១",
                        assigned_room: data.assigned_room || data.teacher_room || "«ក»",
                        school_id: data.school_id || "SCH-001",
                        status: data.status || "active",
                        created_at: data.created_at || ""
                    };
                });
            }
        } catch (e) {
            console.warn("Firestore fetchTeacherAccounts error:", e.message);
        }
    }

    // ២. ប្រសិនបើគ្មានទិន្នន័យ ឬ Offline សូមផ្តល់ទិន្នន័យគំរូ / Cache
    if (!teachers || teachers.length === 0) {
        try {
            const cached = JSON.parse(localStorage.getItem('cached_teachers_list') || '[]');
            if (Array.isArray(cached) && cached.length > 0) {
                teachers = cached;
            }
        } catch(e) {}
    }

    if (!teachers || teachers.length === 0) {
        teachers = [
            {
                teacher_id: "TCH-SYSADMIN",
                name: "អ្នកគ្រប់គ្រងប្រព័ន្ធ (System Administrator)",
                username: "admin",
                role: "system_admin",
                roles: ["system_admin", "school_admin"],
                contact: "012 345 678",
                assigned_grade: "គ្រប់ថ្នាក់",
                assigned_room: "ទូទៅ",
                school_id: "SCH-001",
                status: "active",
                created_at: new Date().toISOString()
            },
            {
                teacher_id: "TCH-SCHADMIN",
                name: "លោកនាយកសាលា (School Administrator)",
                username: "schooladmin",
                role: "school_admin",
                roles: ["school_admin"],
                contact: "011 223 344",
                assigned_grade: "គ្រប់ថ្នាក់",
                assigned_room: "ទូទៅ",
                school_id: "SCH-001",
                status: "active",
                created_at: new Date().toISOString()
            },
            {
                teacher_id: "TCH-001",
                name: "លោកគ្រូ គំរូ (Teacher)",
                username: "teacher",
                role: "teacher",
                roles: ["teacher"],
                contact: "098 765 432",
                assigned_grade: "ថ្នាក់ទី ១",
                assigned_room: "«ក»",
                school_id: "SCH-001",
                status: "active",
                created_at: new Date().toISOString()
            },
            {
                teacher_id: "TCH-VIEWER",
                name: "មន្ត្រីត្រួតពិនិត្យ (Report Viewer)",
                username: "viewer",
                role: "report_viewer",
                roles: ["report_viewer"],
                contact: "088 999 888",
                assigned_grade: "គ្រប់ថ្នាក់",
                assigned_room: "ទូទៅ",
                school_id: "SCH-001",
                status: "active",
                created_at: new Date().toISOString()
            }
        ];
    }

    localStorage.setItem('cached_teachers_list', JSON.stringify(teachers));
    return teachers;
};

window.saveTeacherAccount = async function(teacherObj) {
    if (!teacherObj || !teacherObj.name || !teacherObj.username) {
        throw new Error("សូមបំពេញឈ្មោះ និងឈ្មោះគណនីគ្រូ!");
    }

    // ត្រួតពិនិត្យសិទ្ធិ Backend/Guard៖ មានតែ System Admin ប៉ុណ្ណោះដែលអាចបង្កើត ឬកែប្រែគណនី
    window.DataServiceGuard.assertCan('manage_users', {}, "🔒 មានតែ System Administrator ប៉ុណ្ណោះដែលអាចបង្កើត ឬកែប្រែគណនី និងសិទ្ធិប្រើប្រាស់!");

    const teacherId = teacherObj.teacher_id || `TCH-${Math.floor(1000 + Math.random() * 9000)}`;
    const normalizedRoles = window.normalizeRoles(teacherObj.roles || teacherObj.role, "teacher");

    // រក្សាទុក Cache ចាស់ដើម្បីផ្ទៀងផ្ទាត់ការផ្លាស់ប្តូរសិទ្ធិ (Audit)
    let cached = [];
    try { cached = JSON.parse(localStorage.getItem('cached_teachers_list') || '[]'); } catch(e) {}
    const existingTeacher = cached.find(t => t.teacher_id === teacherId);
    const isNew = !existingTeacher;

    const docData = {
        teacher_id: teacherId,
        name: teacherObj.name.trim(),
        username: teacherObj.username.toLowerCase().trim(),
        role: normalizedRoles[0] || "teacher",
        roles: normalizedRoles,
        contact: (teacherObj.contact || "").trim(),
        assigned_grade: teacherObj.assigned_grade || "ថ្នាក់ទី ១",
        assigned_room: teacherObj.assigned_room || "«ក»",
        school_id: teacherObj.school_id || "SCH-001",
        status: teacherObj.status || "active",
        permissions_version: Date.now(), // សម្រាប់ជំរុញឱ្យ Session របស់គាត់ Refresh ភ្លាមៗ
        updated_at: new Date().toISOString(),
        last_updated: new Date().toISOString()
    };

    if (isNew) {
        docData.created_at = new Date().toISOString();
    }

    if (teacherObj.password && teacherObj.password.length >= 6) {
        docData.password_hash = await window.hashPassword(teacherObj.password);
    }

    // ១. រក្សាទុកក្នុង Firestore (ធានាមិនផ្ទុក Plaintext Password - AUTH-05)
    if (window.db) {
        const firestorePayload = { ...docData };
        if (firestorePayload.password_hash) {
            firestorePayload.password = firebase.firestore.FieldValue.delete();
        }
        await window.db.collection("teachers").doc(teacherId).set(firestorePayload, { merge: true });
    }

    // ២. Update ក្នុង Local Cache (មិនផ្ទុក password ឬ password_hash ក្នុង cache បញ្ជី)
    const sanitizedCacheObj = { ...docData };
    delete sanitizedCacheObj.password;
    delete sanitizedCacheObj.password_hash;

    const existingIndex = cached.findIndex(t => t.teacher_id === teacherId);
    if (existingIndex >= 0) {
        cached[existingIndex] = { ...cached[existingIndex], ...sanitizedCacheObj };
    } else {
        cached.push(sanitizedCacheObj);
    }
    localStorage.setItem('cached_teachers_list', JSON.stringify(cached));

    // ៣. កត់ត្រាសវនកម្ម (Audit Log - Requirement 5)
    if (typeof window.logAudit === 'function') {
        if (isNew) {
            window.logAudit('CREATE_USER', 'auth', `បានបង្កើតគណនីថ្មី៖ ${docData.name} (${docData.teacher_id}) | Roles: [${normalizedRoles.join(', ')}] | ថ្នាក់៖ ${docData.assigned_grade} ${docData.assigned_room}`);
        } else {
            const oldRoles = existingTeacher.roles || [existingTeacher.role];
            const rolesChanged = JSON.stringify(oldRoles.sort()) !== JSON.stringify(normalizedRoles.sort());
            if (rolesChanged) {
                window.logAudit('CHANGE_ROLES', 'auth', `បានកែប្រែសិទ្ធិសម្រាប់៖ ${docData.name} (${docData.teacher_id}) ពី [${oldRoles.join(', ')}] ទៅ [${normalizedRoles.join(', ')}]`);
            } else {
                window.logAudit('UPDATE_USER', 'auth', `បានកែប្រែព័ត៌មានគណនីគ្រូ៖ ${docData.name} (${docData.teacher_id})`);
            }
        }
    }

    return docData;
};

// បិទ/បើក ឬផ្អាកដំណើរការគណនីគ្រូ (Toggle Account Status - AUTH-03 & Section 3.4)
window.toggleUserAccountStatus = async function(teacherId, currentStatus) {
    window.DataServiceGuard.assertCan('manage_users', {}, "🔒 មានតែ System Administrator ប៉ុណ្ណោះដែលអាចផ្អាក ឬបើកដំណើរការគណនី!");

    const currentId = localStorage.getItem('auth_teacher_id');
    if (teacherId === currentId) {
        throw new Error("មិនអាចផ្អាក ឬចាក់សោគណនីដែលកំពុងប្រើប្រាស់ផ្ទាល់ខ្លួនបានឡើយ!");
    }
    if (teacherId === "TCH-ADMIN" || teacherId === "TCH-SYSADMIN") {
        throw new Error("មិនអាចផ្អាកគណនី System Administrator ចម្បងរបស់ប្រព័ន្ធបានទេ!");
    }

    const newStatus = (currentStatus || 'active').toLowerCase() === 'active' ? 'inactive' : 'active';
    const statusLabel = newStatus === 'active' ? 'សកម្ម (Active)' : 'ផ្អាកដំណើរការ (Inactive)';

    if (window.db) {
        await window.db.collection("teachers").doc(teacherId).update({
            status: newStatus,
            permissions_version: Date.now(),
            updated_at: new Date().toISOString()
        });
    }

    let cached = [];
    try { cached = JSON.parse(localStorage.getItem('cached_teachers_list') || '[]'); } catch(e) {}
    const idx = cached.findIndex(t => t.teacher_id === teacherId);
    if (idx >= 0) {
        cached[idx].status = newStatus;
        localStorage.setItem('cached_teachers_list', JSON.stringify(cached));
    }

    if (typeof window.logAudit === 'function') {
        window.logAudit('TOGGLE_STATUS', 'auth', `បានប្តូរស្ថានភាពគណនី ID: ${teacherId} ទៅជា ${statusLabel}`);
    }

    if (typeof showToast === 'function') {
        showToast(`✅ បានប្តូរស្ថានភាពទៅជា ${statusLabel}!`);
    }

    if (typeof window.renderUserAccountsTab === 'function') {
        window.renderUserAccountsTab();
    }
};

window.deleteTeacherAccount = async function(teacherId) {
    window.DataServiceGuard.assertCan('manage_users', {}, "🔒 មានតែ System Administrator ប៉ុណ្ណោះដែលអាចលុបគណនីបាន!");

    const currentId = localStorage.getItem('auth_teacher_id');
    if (teacherId === currentId) {
        throw new Error("មិនអាចលុបគណនីដែលកំពុងដំណើរការឡើយ!");
    }
    if (teacherId === "TCH-ADMIN" || teacherId === "TCH-SYSADMIN") {
        throw new Error("មិនអាចលុបគណនី System Administrator ចម្បងរបស់ប្រព័ន្ធបានទេ!");
    }

    if (window.db) {
        await window.db.collection("teachers").doc(teacherId).delete();
    }

    let cached = [];
    try { cached = JSON.parse(localStorage.getItem('cached_teachers_list') || '[]'); } catch(e) {}
    const deletedUser = cached.find(t => t.teacher_id === teacherId);
    cached = cached.filter(t => t.teacher_id !== teacherId);
    localStorage.setItem('cached_teachers_list', JSON.stringify(cached));

    // កត់ត្រា Audit Log នៃការលុប (Requirement 5)
    if (typeof window.logAudit === 'function') {
        const uName = deletedUser ? deletedUser.name : "មិនស្គាល់";
        window.logAudit('DELETE_USER', 'auth', `បានលុបគណនីគ្រូជាអចិន្ត្រៃយ៍៖ ${uName} (ID: ${teacherId})`);
    }
};

window.resetTeacherPasswordByAdmin = async function(teacherId, newPassword) {
    window.DataServiceGuard.assertCan('manage_users', {}, "🔒 មានតែ System Administrator ប៉ុណ្ណោះដែលអាចកំណត់លេខសម្ងាត់ឡើងវិញ!");

    if (!newPassword || newPassword.length < 6) {
        throw new Error("លេខសម្ងាត់ថ្មីត្រូវមានយ៉ាងហោចណាស់ ៦ តួអក្សរ!");
    }

    const passwordHash = await window.hashPassword(newPassword);

    if (window.db) {
        await window.db.collection("teachers").doc(teacherId).set({
            password_hash: passwordHash,
            password: firebase.firestore.FieldValue.delete(),
            last_password_reset: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }, { merge: true });
    }

    if (typeof window.logAudit === 'function') {
        window.logAudit('RESET_PASSWORD', 'auth', `បានកំណត់លេខសម្ងាត់ឡើងវិញសម្រាប់គ្រូ ID៖ ${teacherId} (Salted SHA-256)`);
    }
};

// ដំណើរការពិនិត្យ Session ពេល Load ទំព័រ
document.addEventListener("DOMContentLoaded", () => {
    window.AppAuth.init();
});
