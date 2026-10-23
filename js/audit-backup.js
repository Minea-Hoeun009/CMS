// =========================================================================
// ឯកសារ js/audit-backup.js - ប្រព័ន្ធកត់ត្រាសកម្មភាព និងបម្រុងទុកទិន្នន័យ (Audit Log & Backup)
// =========================================================================

window.AuditBackup = {
    // =====================================================================
    // ១. ប្រព័ន្ធកត់ត្រាសកម្មភាពសវនកម្ម (Audit Logging)
    // =====================================================================
    logAction: async function(action, category, details) {
        try {
            const currentTeacherId = window.AuthState?.teacherId || localStorage.getItem('auth_teacher_id') || "TCH-SYSTEM";
            const currentTeacherName = window.AuthState?.teacherName || localStorage.getItem('auth_teacher_name') || "ប្រព័ន្ធ";
            const currentYear = document.getElementById("globalAcademicYear")?.value || localStorage.getItem('selected_academic_year') || "2026-2027";

            const logEntry = {
                id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
                action: action, // ឧ. LOGIN, SAVE_SCORES, ADD_STUDENT, DELETE_STUDENT, BACKUP, RESTORE
                category: category || "general", // ឧ. auth, student, attendance, score, system
                details: details || "",
                teacher_id: currentTeacherId,
                teacher_name: currentTeacherName,
                academic_year: currentYear,
                timestamp: new Date().toISOString(),
                device: navigator.userAgent.substring(0, 80)
            };

            // ក. រក្សាទុកក្នុង LocalStorage (រក្សាទុក 150 កំណត់ត្រាចុងក្រោយ)
            let localLogs = [];
            try {
                localLogs = JSON.parse(localStorage.getItem('system_audit_logs') || '[]');
                if (!Array.isArray(localLogs)) localLogs = [];
            } catch(e) { localLogs = []; }

            localLogs.unshift(logEntry);
            if (localLogs.length > 150) localLogs = localLogs.slice(0, 150);
            localStorage.setItem('system_audit_logs', JSON.stringify(localLogs));

            // ខ. រក្សាទុកក្នុង Cloud Firestore (បើមានការតភ្ជាប់)
            if (window.db) {
                window.db.collection("audit_logs").doc(logEntry.id).set(logEntry).catch(e => {
                    console.warn("Audit Log Firestore write skipped:", e.message);
                });
            }

            console.log(`📝 [Audit Log] ${action} (${category}):`, details);
        } catch (err) {
            console.warn("Audit log error:", err);
        }
    },

    getLogs: function() {
        try {
            const logs = JSON.parse(localStorage.getItem('system_audit_logs') || '[]');
            return Array.isArray(logs) ? logs : [];
        } catch(e) {
            return [];
        }
    },

    // =====================================================================
    // ២. មុខងារបង្កើតឯកសារបម្រុងទុកពេញលេញ (Full System Backup Export)
    // =====================================================================
    exportFullBackup: function() {
        try {
            const currentYear = document.getElementById("globalAcademicYear")?.value || "2026-2027";
            const teacherId = localStorage.getItem('auth_teacher_id') || "TCH-001";
            const teacherName = localStorage.getItem('auth_teacher_name') || "គ្រូបង្រៀន";

            const backupData = {
                metadata: {
                    version: "2.5",
                    app_name: "Classroom Management System (CMS)",
                    exported_at: new Date().toISOString(),
                    exported_by_id: teacherId,
                    exported_by_name: teacherName,
                    academic_year: currentYear
                },
                students: JSON.parse(localStorage.getItem('academic_students') || '[]'),
                scores: JSON.parse(localStorage.getItem('academic_scores') || '[]'),
                attendance: JSON.parse(localStorage.getItem('academic_attendance') || '[]'),
                settings: JSON.parse(localStorage.getItem('school_settings') || '{}'),
                audit_logs: this.getLogs()
            };

            // បន្ថែម Library Data
            const libKeys = Object.keys(localStorage).filter(k => k.startsWith('lib_data_') || k.startsWith('lib_subjects_'));
            backupData.library = {};
            libKeys.forEach(k => {
                try { backupData.library[k] = JSON.parse(localStorage.getItem(k)); } catch(e) {}
            });

            // បង្កើត និងទាញយក JSON File
            const jsonStr = JSON.stringify(backupData, null, 2);
            const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            const dateStr = new Date().toISOString().split('T')[0];
            a.href = url;
            a.download = `CMS_Full_Backup_${dateStr}_${currentYear}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.logAction("BACKUP_EXPORT", "system", `បានទាញយកឯកសារបម្រុងទុកប្រព័ន្ធពេញលេញ (${backupData.students.length} សិស្ស)`);
            if (typeof showToast === 'function') showToast("✅ បានទាញយកឯកសារបម្រុងទុកពេញលេញជោគជ័យ!");

        } catch (error) {
            console.error("Backup Export Error:", error);
            alert("❌ បរាជ័យក្នុងការទាញយកឯកសារបម្រុងទុក: " + error.message);
        }
    },

    // =====================================================================
    // ៣. មុខងារទាញទិន្នន័យពីឯកសារបម្រុងទុកមកវិញ (Full System Restore)
    // =====================================================================
    restoreFromBackup: function(fileInput) {
        const file = fileInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target.result);

                // ពិនិត្យសុពលភាពនៃឯកសារបម្រុងទុក
                if (!data || !data.metadata || (!data.students && !data.scores && !data.settings)) {
                    throw new Error("ឯកសារនេះមិនមែនជាទម្រង់ Backup ត្រឹមត្រូវរបស់ប្រព័ន្ធ CMS ទេ!");
                }

                const stuCount = Array.isArray(data.students) ? data.students.length : 0;
                const scoreCount = Array.isArray(data.scores) ? data.scores.length : 0;
                const exportDate = data.metadata.exported_at ? new Date(data.metadata.exported_at).toLocaleString('km-KH') : "មិនស្គាល់";

                const confirmMsg = `⚠️ សូមបញ្ជាក់៖ តើអ្នកពិតជាចង់ Restore ទិន្នន័យពីឯកសារនេះមែនទេ?\n\n` +
                                   `• កាលបរិច្ឆេទបង្កើត Backup: ${exportDate}\n` +
                                   `• ចំនួនសិស្ស: ${stuCount} នាក់\n` +
                                   `• ចំនួនកំណត់ត្រាពិន្ទុ: ${scoreCount}\n\n` +
                                   `ចំណាំ៖ ទិន្នន័យបច្ចុប្បន្ននឹងត្រូវបានជំនួសដោយទិន្នន័យពីឯកសារនេះ!`;

                if (!confirm(confirmMsg)) {
                    fileInput.value = "";
                    return;
                }

                // ក. ស្តារទិន្នន័យក្នុង LocalStorage
                if (data.students) {
                    localStorage.setItem('academic_students', JSON.stringify(data.students));
                    window.allStudents = data.students;
                }
                if (data.scores) {
                    localStorage.setItem('academic_scores', JSON.stringify(data.scores));
                }
                if (data.attendance) {
                    localStorage.setItem('academic_attendance', JSON.stringify(data.attendance));
                }
                if (data.settings) {
                    localStorage.setItem('school_settings', JSON.stringify(data.settings));
                    window.appSettings = data.settings;
                }
                if (data.library) {
                    Object.entries(data.library).forEach(([k, v]) => {
                        localStorage.setItem(k, JSON.stringify(v));
                    });
                }

                // ខ. ស្តារទិន្នន័យទៅ Cloud Firestore (បើមានការតភ្ជាប់)
                if (window.db && Array.isArray(data.students)) {
                    try {
                        const batch = window.db.batch();
                        data.students.slice(0, 50).forEach(stu => {
                            if (stu.id) {
                                const ref = window.db.collection("students").doc(String(stu.id));
                                batch.set(ref, stu, { merge: true });
                            }
                        });
                        await batch.commit();
                    } catch(bErr) {
                        console.warn("Batch Firestore restore warning:", bErr);
                    }
                }

                this.logAction("BACKUP_RESTORE", "system", `បានស្តារទិន្នន័យពីឯកសារបម្រុងទុក (${stuCount} សិស្ស)`);
                alert("🎉 ការស្តារទិន្នន័យ (Restore) ទទួលបានជោគជ័យ! ប្រព័ន្ធនឹង Refresh ដើម្បីអនុវត្តការផ្លាស់ប្តូរ។");
                location.reload();

            } catch (err) {
                console.error("Restore Error:", err);
                alert("❌ បរាជ័យក្នុងការស្តារទិន្នន័យ៖ " + err.message);
            } finally {
                fileInput.value = "";
            }
        };

        reader.readAsText(file, "UTF-8");
    },

    // =====================================================================
    // ៤. ផ្ទាំង Modal បង្ហាញ Audit Log (Audit Log Viewer UI)
    // =====================================================================
    openAuditLogModal: function() {
        let modal = document.getElementById("auditLogModal");
        if (!modal) {
            const html = `
                <div id="auditLogModal" class="fixed inset-0 z-[8000] bg-slate-900/80 backdrop-blur-sm hidden items-center justify-center p-3 md:p-6 font-siemreap fade-in overflow-y-auto">
                    <div class="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-100 dark:border-slate-700">
                        <!-- Header -->
                        <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-xl shadow-inner">
                                    <i class="fa-solid fa-clock-rotate-left"></i>
                                </div>
                                <div>
                                    <h3 class="font-moul text-lg text-slate-800 dark:text-white">ប្រវត្តិកត់ត្រាសកម្មភាព (Audit Log)</h3>
                                    <p class="text-xs text-slate-400 font-bold">តាមដានរាល់ការកែប្រែទិន្នន័យ ការចូលប្រព័ន្ធ និងសកម្មភាពរដ្ឋបាល</p>
                                </div>
                            </div>
                            <button onclick="document.getElementById('auditLogModal').classList.replace('flex','hidden')" class="w-9 h-9 bg-slate-200 dark:bg-slate-700 hover:bg-rose-500 hover:text-white rounded-full flex items-center justify-center transition">
                                <i class="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        <!-- Action Bar -->
                        <div class="p-4 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex flex-wrap justify-between items-center gap-3">
                            <input type="text" id="auditSearchInput" oninput="window.AuditBackup.filterLogRows()" placeholder="ស្វែងរកសកម្មភាព ឬឈ្មោះគ្រូ..." class="px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold outline-none w-64">
                            <div class="flex gap-2">
                                <button onclick="window.AuditBackup.renderLogRows()" class="px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5">
                                    <i class="fa-solid fa-arrows-rotate"></i> Refresh
                                </button>
                                <button onclick="window.AuditBackup.clearLocalLogs()" class="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition flex items-center gap-1.5">
                                    <i class="fa-solid fa-trash-can"></i> សម្អាត Log
                                </button>
                            </div>
                        </div>

                        <!-- Log Table Body -->
                        <div class="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            <table class="w-full text-left text-xs font-siemreap">
                                <thead>
                                    <tr class="border-b border-slate-200 dark:border-slate-700 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                                        <th class="py-2.5 px-3">ពេលវេលា</th>
                                        <th class="py-2.5 px-3">អ្នកប្រើប្រាស់</th>
                                        <th class="py-2.5 px-3">សកម្មភាព</th>
                                        <th class="py-2.5 px-3">ព័ត៌មានលម្អិត</th>
                                    </tr>
                                </thead>
                                <tbody id="auditLogTableRows" class="divide-y divide-slate-100 dark:divide-slate-700">
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', html);
            modal = document.getElementById("auditLogModal");
        }

        modal.classList.remove("hidden");
        modal.classList.add("flex");
        this.renderLogRows();
    },

    renderLogRows: function() {
        const tbody = document.getElementById("auditLogTableRows");
        if (!tbody) return;

        const logs = this.getLogs();
        if (logs.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="py-12 text-center text-slate-400 font-bold">គ្មានប្រវត្តិកត់ត្រាសកម្មភាពនៅឡើយទេ</td></tr>`;
            return;
        }

        tbody.innerHTML = logs.map(l => {
            const timeStr = l.timestamp ? new Date(l.timestamp).toLocaleString('km-KH') : "-";
            const badgeColor = l.category === "auth" ? "bg-blue-100 text-blue-700" :
                               l.category === "score" ? "bg-amber-100 text-amber-700" :
                               l.category === "attendance" ? "bg-rose-100 text-rose-700" :
                               l.category === "student" ? "bg-emerald-100 text-emerald-700" : "bg-purple-100 text-purple-700";

            return `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                    <td class="py-2.5 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap font-mono text-[11px]">${timeStr}</td>
                    <td class="py-2.5 px-3 font-bold text-slate-800 dark:text-white whitespace-nowrap">${l.teacher_name} <span class="text-[10px] text-slate-400 font-mono">(${l.teacher_id})</span></td>
                    <td class="py-2.5 px-3"><span class="px-2 py-0.5 rounded-lg text-[10px] font-bold ${badgeColor}">${l.action}</span></td>
                    <td class="py-2.5 px-3 text-slate-600 dark:text-slate-300">${l.details}</td>
                </tr>
            `;
        }).join("");
    },

    filterLogRows: function() {
        const q = (document.getElementById("auditSearchInput")?.value || "").toLowerCase();
        const rows = document.querySelectorAll("#auditLogTableRows tr");
        rows.forEach(r => {
            const text = r.textContent.toLowerCase();
            r.style.display = text.includes(q) ? "" : "none";
        });
    },

    clearLocalLogs: function() {
        if (!confirm("តើអ្នកពិតជាចង់សម្អាត Audit Log ទាំងអស់ក្នុងម៉ាស៊ីននេះមែនទេ?")) return;
        localStorage.removeItem('system_audit_logs');
        this.renderLogRows();
        if (typeof showToast === 'function') showToast("បានសម្អាត Audit Log ជោគជ័យ!");
    }
};

// Global shortcuts
window.logAudit = (action, category, details) => window.AuditBackup.logAction(action, category, details);
window.exportFullSystemBackup = () => window.AuditBackup.exportFullBackup();
window.restoreFullSystemBackup = (el) => window.AuditBackup.restoreFromBackup(el);
window.openAuditLogModal = () => window.AuditBackup.openAuditLogModal();
