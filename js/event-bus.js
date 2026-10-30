// =========================================================================
// ឯកសារ js/event-bus.js - Central Event Bus & Dynamic Relationship Orchestrator
// CMS Enterprise Architecture v4.0
// =========================================================================

window.CMSEventTypes = {
    STUDENT_ENROLLED: 'STUDENT_ENROLLED',
    STUDENT_TRANSFERRED: 'STUDENT_TRANSFERRED',
    STUDENT_WITHDRAWN: 'STUDENT_WITHDRAWN',
    TEACHER_ASSIGNED: 'TEACHER_ASSIGNED',
    ATTENDANCE_RECORDED: 'ATTENDANCE_RECORDED',
    SCORE_UPDATED: 'SCORE_UPDATED',
    EXAM_PUBLISHED: 'EXAM_PUBLISHED',
    TIMETABLE_CHANGED: 'TIMETABLE_CHANGED',
    HOMEWORK_ASSIGNED: 'HOMEWORK_ASSIGNED',
    ANNOUNCEMENT_POSTED: 'ANNOUNCEMENT_POSTED',
    ACCOUNT_APPROVED: 'ACCOUNT_APPROVED',
    ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
    ACADEMIC_YEAR_CHANGED: 'ACADEMIC_YEAR_CHANGED'
};

window.CMSEventBus = {
    listeners: {},
    history: [],

    /**
     * Subscribe to an event
     * @param {string} eventType 
     * @param {Function} callback 
     */
    on: function(eventType, callback) {
        if (!this.listeners[eventType]) {
            this.listeners[eventType] = [];
        }
        this.listeners[eventType].push(callback);
    },

    /**
     * Unsubscribe from an event
     * @param {string} eventType 
     * @param {Function} callback 
     */
    off: function(eventType, callback) {
        if (!this.listeners[eventType]) return;
        this.listeners[eventType] = this.listeners[eventType].filter(cb => cb !== callback);
    },

    /**
     * Dispatch an event to listeners, trigger downstream updates, and sync to backend
     * @param {string} eventType 
     * @param {Object} payload 
     * @param {boolean} syncServer 
     */
    emit: async function(eventType, payload = {}, syncServer = true) {
        const actor = window.AppState?.teacherId || window.AppAuth?.state?.teacherId || 'CURRENT_USER';
        const eventId = `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const timestamp = new Date().toISOString();

        const eventData = {
            event_id: eventId,
            event_type: eventType,
            timestamp: timestamp,
            actor: actor,
            payload: payload,
            status: 'PROCESSING'
        };

        this.history.unshift(eventData);
        if (this.history.length > 100) this.history.pop();

        console.log(`📡 [CMSEventBus] Event Dispatched: [${eventType}]`, payload);

        // 1. Run in-memory subscribed callbacks
        if (this.listeners[eventType]) {
            this.listeners[eventType].forEach(cb => {
                try { cb(payload, eventData); } catch (err) {
                    console.warn(`Error in listener for ${eventType}:`, err);
                }
            });
        }

        // 2. Execute central downstream business logic rules
        try {
            await window.CMSOrchestrator.handleDownstreamAction(eventType, payload);
            eventData.status = 'PROCESSED';
        } catch(orchestratorErr) {
            console.error(`Orchestrator error for ${eventType}:`, orchestratorErr);
            eventData.status = 'FAILED';
        }

        // 3. Asynchronously persist to server EventQueue & AuditLog
        if (syncServer && typeof window.apiPost === 'function') {
            try {
                window.apiPost('emitEvent', {
                    event_type: eventType,
                    affected_ids: payload.affected_ids || [payload.id || payload.student_id || payload.record_id || ''],
                    payload: payload
                }).catch(e => console.warn("Background server event sync note:", e));
            } catch(e) {}
        }

        return eventData;
    }
};

/**
 * Central Orchestrator for Dynamic Relationships & Business Rules
 */
window.CMSOrchestrator = {
    handleDownstreamAction: async function(eventType, payload) {
        switch (eventType) {

            // Rule 1: Student Enrolled -> Invalidate cache, update roster, bind to attendance & scores
            case window.CMSEventTypes.STUDENT_ENROLLED:
                console.log("🔗 [Orchestrator] Rule 1: Synchronizing newly enrolled student to class rosters...");
                if (typeof window.filterStudents === 'function') window.filterStudents();
                if (typeof window.updateAllClassDropdowns === 'function') window.updateAllClassDropdowns();
                if (typeof window.loadDashboard === 'function' && window.currentActiveView === 'dashboard') window.loadDashboard();
                break;

            // Rule 2 & 8: Student Transferred -> Preserve historical records, bind to new class
            case window.CMSEventTypes.STUDENT_TRANSFERRED:
                console.log("🔗 [Orchestrator] Rule 2 & 8: Student transferred. Preserving historical attendance/scores, updating active class roster...");
                if (typeof window.filterStudents === 'function') window.filterStudents();
                if (typeof showToast === 'function') {
                    showToast(`ℹ️ សិស្ស ${payload.student_name || ''} ត្រូវបានផ្ទេរទៅ ${payload.new_grade} ${payload.new_room} ដោយរក្សាប្រវត្តិពិន្ទុ និងវត្តមានចាស់!`);
                }
                break;

            // Rule 3: Attendance Recorded/Corrected -> Update daily summary, student absence tally, dashboard
            case window.CMSEventTypes.ATTENDANCE_RECORDED:
                console.log("🔗 [Orchestrator] Rule 3: Attendance updated. Recalculating attendance metrics & summaries...");
                if (typeof window.calculateAttendanceStats === 'function') window.calculateAttendanceStats();
                if (typeof window.loadDashboard === 'function' && window.currentActiveView === 'dashboard') window.loadDashboard();
                break;

            // Rule 4: Score Updated -> Recalculate totals, GPA, rankings, and update honor roll
            case window.CMSEventTypes.SCORE_UPDATED:
                console.log("🔗 [Orchestrator] Rule 4: Scores changed. Recalculating rankings, totals, and grade letters...");
                if (typeof window.calculateClassRankings === 'function') window.calculateClassRankings();
                if (typeof window.loadDashboard === 'function' && window.currentActiveView === 'dashboard') window.loadDashboard();
                break;

            // Rule 5: Academic Year Changed -> Synchronize all module views without mixing historical records
            case window.CMSEventTypes.ACADEMIC_YEAR_CHANGED:
                console.log(`🔗 [Orchestrator] Rule 5: Academic year switched to [${payload.academic_year}]. Isolating historical datasets...`);
                localStorage.setItem('selected_academic_year', payload.academic_year);
                localStorage.setItem('academic_year', payload.academic_year);
                if (typeof appSettings !== 'undefined') appSettings.academic_year = payload.academic_year;
                if (typeof window.fetchStudentsForScores === 'function') window.fetchStudentsForScores();
                if (typeof window.filterStudents === 'function') window.filterStudents();
                if (typeof window.fetchMonthlyAttendance === 'function') window.fetchMonthlyAttendance();
                if (typeof window.fetchLibraryData === 'function') window.fetchLibraryData();
                if (typeof window.loadDashboard === 'function' && window.currentActiveView === 'dashboard') window.loadDashboard();
                if (typeof window.updateAllClassDropdowns === 'function') window.updateAllClassDropdowns();
                const repView = document.getElementById("reportsView");
                if (repView && !repView.classList.contains("hidden") && typeof window.loadReportsView === 'function') {
                    window.loadReportsView();
                }
                const repModal = document.getElementById("reportDetailContent");
                if (repModal && !repModal.classList.contains("hidden") && window.currentActiveReportType && typeof window.openReportDetail === 'function') {
                    window.openReportDetail(window.currentActiveReportType);
                }
                break;

            // Rule 6: Account Suspended -> Immediate session revocation
            case window.CMSEventTypes.ACCOUNT_SUSPENDED:
                console.log(`🔗 [Orchestrator] Rule 6: Account suspended [${payload.user_id}].`);
                const currentUid = window.AppAuth?.state?.teacherId;
                if (currentUid && currentUid === payload.user_id) {
                    if (typeof window.showAccessDeniedScreen === 'function') {
                        window.showAccessDeniedScreen("គណនីរបស់អ្នកត្រូវបានផ្អាកដំណើរការដោយរដ្ឋបាលសាលា!");
                    }
                    if (typeof window.clearSession === 'function') window.clearSession();
                }
                break;

            // Rule 7: Timetable Changed -> Notify affected teachers & update schedule view
            case window.CMSEventTypes.TIMETABLE_CHANGED:
                console.log("🔗 [Orchestrator] Rule 7: Timetable changed. Alerting affected teachers & updating schedule views...");
                if (typeof window.TimetableHomeworkManager?.renderWeeklyTimetable === 'function') {
                    window.TimetableHomeworkManager.renderWeeklyTimetable();
                }
                if (window.NotificationCenter && typeof window.NotificationCenter.addAlert === 'function') {
                    window.NotificationCenter.addAlert({
                        title: "កាលវិភាគបង្រៀនត្រូវបានធ្វើបច្ចុប្បន្នភាព",
                        message: `មានការកែប្រែកាលវិភាគសម្រាប់ ${payload.grade || ''} ${payload.room || ''}`,
                        priority: "important"
                    });
                }
                break;

            // Examination Published
            case window.CMSEventTypes.EXAM_PUBLISHED:
                if (window.NotificationCenter && typeof window.NotificationCenter.addAlert === 'function') {
                    window.NotificationCenter.addAlert({
                        title: "ការប្រឡងត្រូវបានផ្សព្វផ្សាយ",
                        message: `ការប្រឡង ${payload.exam_name || ''} សម្រាប់ ${payload.grade || ''} ត្រូវបានបើកដំណើរការ`,
                        priority: "urgent"
                    });
                }
                break;

            default:
                break;
        }
    }
};
