// =========================================================================
// ឯកសារ js/notifications.js - មជ្ឈមណ្ឌលដំណឹង & ការជូនដំណឹងឆ្លាតវៃ (Notification Center)
// =========================================================================

window.NotificationCenter = {
    unreadCount: 0,
    alerts: [],
    announcements: [],

    init: function() {
        this.loadAnnouncements();
        this.generateSmartAlerts();
        this.updateBadge();
    },

    getAnnouncements: function() {
        return JSON.parse(localStorage.getItem('system_announcements') || '[]');
    },

    saveAnnouncements: async function(list) {
        localStorage.setItem('system_announcements', JSON.stringify(list));

        if (window.db) {
            try {
                await window.db.collection("announcements").doc("recent_announcements").set({
                    items: list,
                    last_updated: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            } catch(e) { console.warn("Firestore announcements save warning:", e); }
        }
    },

    loadAnnouncements: function() {
        let list = this.getAnnouncements();
        if (list.length === 0) {
            list = [
                {
                    id: "ann_1",
                    title: "សេចក្តីជូនដំណឹង៖ ការប្រជុំគណៈគ្រប់គ្រងសាលាប្រចាំខែ",
                    content: "សូមគោរពអញ្ជើញលោកគ្រូ-អ្នកគ្រូទាំងអស់ចូលរួមការប្រជុំបូកសរុបការងារប្រចាំខែ នៅបន្ទប់ប្រជុំធំ វេលាម៉ោង ២:០០ រសៀល។",
                    priority: "important",
                    author: "នាយកសាលា",
                    date: new Date().toISOString().split('T')[0],
                    isRead: false
                },
                {
                    id: "ann_2",
                    title: "ការរៀបចំប្រឡងឆមាសលើកទី១",
                    content: "សូមលោកគ្រូ-អ្នកគ្រូបន្ទុកថ្នាក់ទាំងអស់ បញ្ចូលពិន្ទុប្រចាំខែឱ្យបានរួចរាល់មុនដំណាច់សប្តាហ៍នេះ ដើម្បីត្រៀមរៀបចំតារាងចំណាត់ថ្នាក់។",
                    priority: "urgent",
                    author: "ការិយាល័យសិក្សា",
                    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
                    isRead: false
                }
            ];
            this.saveAnnouncements(list);
        }
        this.announcements = list;
    },

    generateSmartAlerts: function() {
        this.alerts = [];
        const students = window.allStudents || JSON.parse(localStorage.getItem('academic_students') || '[]');
        const allScores = JSON.parse(localStorage.getItem('academic_scores') || '[]');
        const homework = JSON.parse(localStorage.getItem('school_homework_list') || '[]');

        // ១. ស្វែងរកសិស្សប្រឈមនឹងការធ្លាក់ (Score < 5.0)
        const lowScores = allScores.filter(s => parseFloat(s.average) > 0 && parseFloat(s.average) < 5.0);
        if (lowScores.length > 0) {
            this.alerts.push({
                id: "alert_scores",
                type: "warning",
                title: "ការជូនដំណឹងពីលទ្ធផលសិក្សា",
                message: `មានសិស្សចំនួន ${lowScores.length} នាក់ មានមធ្យមភាគពិន្ទុក្រោម ៥.០ ក្នុងខែនេះ។ គួរមានការបំប៉នបន្ថែម។`,
                icon: "fa-triangle-exclamation",
                color: "text-amber-500",
                bg: "bg-amber-50 dark:bg-amber-950/40",
                border: "border-amber-200 dark:border-amber-900/50"
            });
        }

        // ២. ក្រើនរំលឹកកិច្ចការផ្ទះជិតដល់ថ្ងៃកំណត់
        const todayStr = new Date().toISOString().split('T')[0];
        const upcomingHw = homework.filter(h => h.dueDate && h.dueDate >= todayStr);
        if (upcomingHw.length > 0) {
            this.alerts.push({
                id: "alert_hw",
                type: "info",
                title: "កិច្ចការផ្ទះជិតដល់កាលកំណត់",
                message: `មានកិច្ចការផ្ទះចំនួន ${upcomingHw.length} កំពុងដំណើរការ និងជិតដល់កាលបរិច្ឆេទប្រគល់។`,
                icon: "fa-clock",
                color: "text-indigo-500",
                bg: "bg-indigo-50 dark:bg-indigo-950/40",
                border: "border-indigo-200 dark:border-indigo-900/50"
            });
        }

        // ៣. ក្រើនរំលឹកបម្រុងទុកទិន្នន័យ (Backup Reminder)
        this.alerts.push({
            id: "alert_backup",
            type: "system",
            title: "ការបម្រុងទុកទិន្នន័យ (Backup Reminder)",
            message: "សូមកុំភ្លេចទាញយកឯកសារ Full Backup រៀងរាល់ចុងសប្តាហ៍ ដើម្បីការពារទិន្នន័យសិស្ស និងពិន្ទុ។",
            icon: "fa-shield-halved",
            color: "text-emerald-500",
            bg: "bg-emerald-50 dark:bg-emerald-950/40",
            border: "border-emerald-200 dark:border-emerald-900/50"
        });
    },

    updateBadge: function() {
        const unreadAnnouncements = this.announcements.filter(a => !a.isRead).length;
        this.unreadCount = unreadAnnouncements + this.alerts.length;

        const badge = document.getElementById("notifBadge");
        if (badge) {
            if (this.unreadCount > 0) {
                badge.textContent = this.unreadCount > 9 ? "9+" : this.unreadCount;
                badge.classList.remove("hidden");
            } else {
                badge.classList.add("hidden");
            }
        }
    },

    openModal: function() {
        let modal = document.getElementById("notificationCenterModal");
        if (!modal) {
            this.createModalDOM();
            modal = document.getElementById("notificationCenterModal");
        }
        this.renderModalContent();
        modal.classList.remove("hidden");
    },

    closeModal: function() {
        const modal = document.getElementById("notificationCenterModal");
        if (modal) modal.classList.add("hidden");
    },

    createModalDOM: function() {
        const div = document.createElement("div");
        div.id = "notificationCenterModal";
        div.className = "hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-siemreap";
        div.innerHTML = `
            <div class="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col animate-scale-up">
                
                <!-- Modal Header -->
                <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800/80 shrink-0">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center text-lg shadow-md">
                            <i class="fa-solid fa-bell"></i>
                        </div>
                        <div>
                            <h3 class="font-moul text-base text-slate-800 dark:text-white">មជ្ឈមណ្ឌលដំណឹង & ការជូនដំណឹង</h3>
                            <p class="text-xs text-slate-400 mt-0.5">សេចក្តីជូនដំណឹងសាលា និងការក្រើនរំលឹកប្រព័ន្ធ</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="window.NotificationCenter.markAllRead()" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition">
                            <i class="fa-solid fa-check-double mr-1"></i> អានទាំងអស់
                        </button>
                        <button onclick="window.NotificationCenter.closeModal()" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-400 flex items-center justify-center transition">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                </div>

                <!-- Modal Body -->
                <div class="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                    
                    <!-- Action: New Announcement Button -->
                    <div class="flex justify-between items-center bg-indigo-50/60 dark:bg-indigo-950/30 p-3.5 rounded-2xl border border-indigo-100 dark:border-indigo-900/40">
                        <span class="text-xs font-bold text-indigo-900 dark:text-indigo-300">
                            <i class="fa-solid fa-bullhorn text-indigo-500 mr-2"></i> ចង់ផ្សព្វផ្សាយដំណឹងថ្មីទៅកាន់សិស្ស និងថ្នាក់?
                        </span>
                        <button onclick="window.NotificationCenter.openNewAnnouncementForm()" class="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm">
                            <i class="fa-solid fa-plus mr-1"></i> បង្កើតដំណឹង
                        </button>
                    </div>

                    <!-- Create Announcement Form (Collapsible) -->
                    <div id="newAnnouncementBox" class="hidden bg-slate-50 dark:bg-slate-700/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-600 space-y-3">
                        <h4 class="font-bold text-xs text-slate-800 dark:text-white">សេចក្តីជូនដំណឹងថ្មី</h4>
                        <input type="text" id="annTitleInput" placeholder="ចំណងជើងសេចក្តីជូនដំណឹង..." class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl p-2.5 text-xs text-slate-800 dark:text-white outline-none">
                        <textarea id="annContentInput" rows="2" placeholder="ខ្លឹមសារលម្អិត..." class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl p-2.5 text-xs text-slate-800 dark:text-white outline-none"></textarea>
                        <div class="flex justify-between items-center">
                            <select id="annPrioritySelect" class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 outline-none">
                                <option value="normal">ធម្មតា (Normal)</option>
                                <option value="important">សំខាន់ (Important)</option>
                                <option value="urgent">បន្ទាន់ (Urgent)</option>
                            </select>
                            <div class="flex gap-2">
                                <button onclick="document.getElementById('newAnnouncementBox').classList.add('hidden')" class="px-3 py-1.5 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold">បោះបង់</button>
                                <button onclick="window.NotificationCenter.submitNewAnnouncement()" class="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm">បង្ហោះដំណឹង</button>
                            </div>
                        </div>
                    </div>

                    <!-- Smart System Alerts Section -->
                    <div>
                        <h4 class="font-moul text-xs text-slate-500 uppercase tracking-wider mb-3">ការជូនដំណឹងឆ្លាតវៃពីប្រព័ន្ធ</h4>
                        <div class="space-y-3" id="notifSmartAlertsList">
                            <!-- Populated dynamically -->
                        </div>
                    </div>

                    <!-- School Announcements Section -->
                    <div>
                        <h4 class="font-moul text-xs text-slate-500 uppercase tracking-wider mb-3">សេចក្តីជូនដំណឹងទូទៅ</h4>
                        <div class="space-y-3" id="notifAnnouncementsList">
                            <!-- Populated dynamically -->
                        </div>
                    </div>

                </div>
            </div>
        `;
        document.body.appendChild(div);
    },

    renderModalContent: function() {
        // Smart Alerts
        const alertsList = document.getElementById("notifSmartAlertsList");
        if (alertsList) {
            alertsList.innerHTML = this.alerts.map(a => `
                <div class="${a.bg} ${a.border} border rounded-2xl p-4 flex items-start gap-3.5">
                    <div class="${a.color} text-lg shrink-0 mt-0.5">
                        <i class="fa-solid ${a.icon}"></i>
                    </div>
                    <div class="flex-1">
                        <h5 class="font-bold text-slate-800 dark:text-white text-xs mb-1">${a.title}</h5>
                        <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">${a.message}</p>
                    </div>
                </div>
            `).join("");
        }

        // Announcements
        const annList = document.getElementById("notifAnnouncementsList");
        if (annList) {
            annList.innerHTML = this.announcements.map(a => {
                const badgeColor = a.priority === 'urgent' ? 'bg-rose-100 text-rose-700' :
                                   a.priority === 'important' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600';
                const badgeText = a.priority === 'urgent' ? 'បន្ទាន់' : a.priority === 'important' ? 'សំខាន់' : 'ធម្មតា';

                return `
                    <div class="bg-white dark:bg-slate-700/40 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 transition ${a.isRead ? 'opacity-70' : 'shadow-sm'}">
                        <div class="flex items-center justify-between mb-1.5">
                            <span class="px-2 py-0.5 rounded-lg text-[10px] font-bold ${badgeColor}">${badgeText}</span>
                            <span class="text-[10px] text-slate-400 font-mono">${a.date} • ${a.author}</span>
                        </div>
                        <h5 class="font-bold text-slate-800 dark:text-white text-xs mb-1">${a.title}</h5>
                        <p class="text-xs text-slate-500 dark:text-slate-300 leading-relaxed">${a.content}</p>
                    </div>
                `;
            }).join("");
        }
    },

    openNewAnnouncementForm: function() {
        const box = document.getElementById("newAnnouncementBox");
        if (box) box.classList.remove("hidden");
    },

    submitNewAnnouncement: function() {
        const title = document.getElementById("annTitleInput")?.value.trim();
        const content = document.getElementById("annContentInput")?.value.trim();
        const priority = document.getElementById("annPrioritySelect")?.value || "normal";
        const teacherName = localStorage.getItem('auth_teacher_name') || "គ្រូបង្រៀន";

        if (!title || !content) {
            alert("សូមបញ្ចូលចំណងជើង និងខ្លឹមសារសេចក្តីជូនដំណឹង!");
            return;
        }

        const newAnn = {
            id: "ann_" + Date.now(),
            title,
            content,
            priority,
            author: teacherName,
            date: new Date().toISOString().split('T')[0],
            isRead: false
        };

        this.announcements.unshift(newAnn);
        this.saveAnnouncements(this.announcements);

        if (typeof window.logAudit === 'function') {
            window.logAudit('POST_ANNOUNCEMENT', 'system', `បានផ្សាយដំណឹង «${title}» (${priority})`);
        }

        document.getElementById("annTitleInput").value = "";
        document.getElementById("annContentInput").value = "";
        document.getElementById("newAnnouncementBox")?.classList.add("hidden");

        this.updateBadge();
        this.renderModalContent();
        if (typeof showToast === 'function') showToast("✅ បានផ្សព្វផ្សាយដំណឹងដោយជោគជ័យ!");
    },

    markAllRead: function() {
        this.announcements.forEach(a => a.isRead = true);
        this.saveAnnouncements(this.announcements);
        this.alerts = [];
        this.updateBadge();
        this.renderModalContent();
        if (typeof showToast === 'function') showToast("បានសម្គាល់ថាបានអានទាំងអស់!");
    }
};

window.openNotificationCenter = function() {
    window.NotificationCenter.openModal();
};

// Auto initialize on load
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        window.NotificationCenter.init();
    }, 600);
});
