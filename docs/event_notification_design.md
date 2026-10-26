# Classroom Management System (CMS) - Event & Notification Design
**Version:** 4.0 Enterprise Architecture
**Component:** `window.CMSEventBus` & Server `EventQueue`
**Pattern:** Reactive Event-Driven Architecture with Immediate Client Optimism & Asynchronous Server Persistence

---

## 1. Design Overview

CMS Enterprise operates on a dual-plane event bus:
1. **Client-Side Event Plane (`window.CMSEventBus`):**
   - In-memory Pub/Sub messaging pattern.
   - 0ms visual reactivity (instant DOM updates, toast notifications, chart refreshes).
   - Keeps 100 recent event dispatches for live audit and diagnostics.
2. **Server-Side Event Plane (`SHEETS.EVENT_QUEUE` & `SHEETS.NOTIFICATIONS`):**
   - Asynchronous queuing in Google Sheets.
   - Long-term audit trail and multi-device notification delivery.
   - Ensures eventual consistency across offline and slow network conditions.

---

## 2. Event Types Catalog (`CMSEventTypes`)

| Event Type | Producer Modules | Primary Consumers | Downstream Effect & Business Rule |
| :--- | :--- | :--- | :--- |
| `STUDENT_ENROLLED` | `students.js` | Dashboard, Roster, Attendance | **Rule 1:** Syncs to active class roster, initializes monthly attendance matrix, updates demographics chart. |
| `STUDENT_TRANSFERRED` | `students.js`, `Code.gs` | Roster, Scores, Attendance | **Rule 2 & 8:** Preserves historical attendance & scores in old class; enrolls in new class; invalidates class rankings. |
| `STUDENT_WITHDRAWN` | `students.js` | Dashboard, Roster | **Rule 10:** Soft delete; flags status as `Withdrawn`; retains complete academic history for audit and verification. |
| `TEACHER_ASSIGNED` | `teachers.js`, `settings.js` | Timetable, Workspace | **Rule 7:** Binds teacher to classroom/subject; updates teacher workspace navigation and schedule. |
| `ATTENDANCE_RECORDED` | `attendance.js` | Dashboard, Analytics | **Rule 3:** Recalculates daily presence, absence (excused/unexcused) percentages, and dashboard alert badges. |
| `SCORE_UPDATED` | `scores.js`, `Code.gs` | Dashboard, Honor Roll | **Rule 4:** Triggers auto-recalculation of totals, GPA, rank (1..N), letter grades (A-F), and updates Top 5 Honor Roll. |
| `EXAM_PUBLISHED` | `scores.js`, `Code.gs` | Notifications, Students | Broadcasts urgent notification to enrolled students and homeroom teachers. |
| `TIMETABLE_CHANGED` | `timetable-homework.js` | Timetable, Dashboard | **Rule 7:** Alerts affected teachers, refreshes daily schedule cards in teacher and student dashboards. |
| `HOMEWORK_ASSIGNED` | `timetable-homework.js` | Dashboard, Students | Updates active homework badges and creates reminder notifications for due dates. |
| `ANNOUNCEMENT_POSTED` | `settings.js`, `Code.gs` | Notification Center | Generates personal notification records in `NOTIFICATIONS` table for target roles. |
| `ACCOUNT_APPROVED` | `auth.js`, `settings.js` | Auth, Dashboard | Decrements pending counter, permits login for affected user. |
| `ACCOUNT_SUSPENDED` | `auth.js`, `Code.gs` | Session Guard | **Rule 6:** Immediately revokes active session; displays Access Denied screen if the suspended user is currently logged in. |
| `ACADEMIC_YEAR_CHANGED`| Header / Filter Bar | All Modules | **Rule 5:** Switches active academic scope without mixing historical student records or rankings. |

---

## 3. Event Payload Specifications

### 3.1 `SCORE_UPDATED`
```json
{
  "event_type": "SCORE_UPDATED",
  "actor": "TCH-004",
  "payload": {
    "grade": "ថ្នាក់ទី ៧",
    "room": "«ក»",
    "month": "តុលា",
    "type": "monthly",
    "academic_year": "2026-2027",
    "total_students": 38
  }
}
```

### 3.2 `STUDENT_TRANSFERRED`
```json
{
  "event_type": "STUDENT_TRANSFERRED",
  "actor": "ADMIN-001",
  "payload": {
    "student_id": "STU-2026-089",
    "student_name": "ចាន់ សុខា",
    "old_grade": "ថ្នាក់ទី ៧",
    "old_room": "«ក»",
    "new_grade": "ថ្នាក់ទី ៧",
    "new_room": "«ខ»",
    "effective_date": "2026-10-26",
    "reason": "ផ្លាស់ប្តូរវេនសិក្សា"
  }
}
```

### 3.3 `ACCOUNT_SUSPENDED`
```json
{
  "event_type": "ACCOUNT_SUSPENDED",
  "actor": "SUPERADMIN",
  "payload": {
    "user_id": "USR-8812",
    "email": "teacher.suspended@school.edu.kh",
    "reason": "Security protocol violation"
  }
}
```

---

## 4. Notification Engine Specification

### Database Schema (`SHEETS.NOTIFICATIONS`)
- `notification_id` (PK, string, e.g. `NOTIF-1729940123-12`)
- `user_id` (FK to USERS, or `'ALL'` / role name)
- `title` (Khmer/English title)
- `message` (Content body)
- `priority` (`normal`, `important`, `urgent`)
- `is_read` (boolean, false on creation)
- `created_at` (ISO timestamp)

### Broadcast Algorithm
When an announcement is published:
1. Target audience is checked (`all`, `teachers`, `students`, or specific class).
2. For role/class targets, query matching active users.
3. Batch insert notifications with unique IDs into `NOTIFICATIONS` sheet.
4. Client notification bell animates and updates unread badge counter.
