# Classroom Management System (CMS) - API Documentation
**Version:** 4.0 Enterprise Architecture
**Target Backend Endpoint:** Google Apps Script Web App
**URL:** `https://script.google.com/macros/s/AKfycby4WV8mIo0Q2YF05Sji3kasWycIGoGRJfWwfsjyMHUHnuol7Rcta1KGznIGh2hcon7W/exec`
**Format:** REST over HTTP GET/POST with JSON payloads

---

## 1. General Principles & Standards

### Authentication
All protected endpoints require a session token passed via:
- HTTP Header: `Authorization: Bearer <sessionId>` OR
- Query Parameter (GET): `?sessionToken=<sessionId>` OR
- Body Field (POST): `payload.sessionToken = <sessionId>`

### Standard Success Response Schema
```json
{
  "status": "success",
  "data": { ... },
  "message": "ប្រតិបត្តិការបានជោគជ័យ (Optional)",
  "timestamp": "2026-10-26T12:00:00.000Z"
}
```

### Standard Error Response Schema
```json
{
  "status": "error",
  "error": "Error description in Khmer and English",
  "code": 400,
  "timestamp": "2026-10-26T12:00:00.000Z"
}
```

---

## 2. HTTP GET Endpoints (`doGet`)

### 2.1 `getDashboardStats`
Aggregates real-time statistics tailored to the caller's RBAC role and academic year.
- **Parameters:**
  - `academic_year` (string, optional, default: `"2026-2027"`)
  - `sessionToken` (string, optional)
- **Response `data`:**
  - `role`: User role (`super_admin`, `admin`, `homeroom_teacher`, `subject_teacher`, `student`)
  - `total_students`: Active student count
  - `female_students`: Female student count
  - `male_students`: Male student count
  - `dropped_students`: Dropped or withdrawn count
  - `total_classes`: Active classroom count
  - `total_teachers`: Total registered teachers
  - `attendance_today`: `{ present, absent, late, excused, rate }`
  - `pending_approvals`: Number of pending user accounts (Admin only)
  - `recent_announcements`: Top 5 school notices

### 2.2 `getAcademicYears`
Retrieves academic year configuration and current active status.
- **Response `data`:** Array of `{ year_id, name, start_date, end_date, is_active }`

### 2.3 `getSubjects`
Retrieves school curriculum subjects, credit hours, and categories.
- **Response `data`:** Array of `{ subject_id, name_kh, name_en, code, credit_hours, category }`

### 2.4 `getEnrollments`
Retrieves student enrollments with class and status history.
- **Parameters:** `academic_year` (optional), `grade` (optional), `room` (optional)
- **Response `data`:** Array of `{ enrollment_id, student_id, academic_year, grade, room, status, enrolled_at }`

### 2.5 `getTeacherAssignments`
Retrieves teacher class and subject teaching assignments.
- **Parameters:** `academic_year` (optional), `teacher_id` (optional)
- **Response `data`:** Array of `{ assignment_id, teacher_id, academic_year, grade, room, subject_id, role }`

### 2.6 `getExaminations`
Retrieves scheduled or published examinations.
- **Parameters:** `academic_year` (optional), `grade` (optional)
- **Response `data`:** Array of `{ exam_id, academic_year, grade, exam_type, month, semester, is_published }`

### 2.7 `getTimetables`
Retrieves weekly class timetable schedules.
- **Parameters:** `grade` (required), `academic_year` (optional)
- **Response `data`:** Array of `{ timetable_id, academic_year, grade, room, schedule_json }`

### 2.8 `getHomework`
Retrieves assigned homework and due dates.
- **Parameters:** `grade` (optional), `subject_id` (optional)
- **Response `data`:** Array of `{ homework_id, grade, subject_id, title, description, due_date, max_score }`

### 2.9 `getAnnouncements`
Retrieves school announcements and notices.
- **Parameters:** `target_role` (optional)
- **Response `data`:** Array of `{ announcement_id, title, content, target_role, priority, created_at }`

### 2.10 `getNotifications`
Retrieves personal notifications for the authenticated user.
- **Parameters:** `user_id` (optional, inferred from session)
- **Response `data`:** Array of `{ notification_id, user_id, title, message, is_read, created_at }`

### 2.11 `getEvents`
Retrieves system event queue records.
- **Parameters:** `limit` (default: 50)
- **Response `data`:** Array of `{ event_id, event_type, actor_id, payload_json, status, created_at }`

### 2.12 Legacy Compatible Endpoints
- `getStudents`, `getTeachers`, `getScores`, `getAttendance`, `getAuditLogs`

---

## 3. HTTP POST Endpoints (`doPost`)

All POST actions must include `{ "action": "<actionName>", ...fields }` in JSON body.

### 3.1 Authentication & User Lifecycle

#### `verifyGoogleAuth`
Validates Google Firebase ID token server-side via Google OAuth2 tokeninfo.
- **Body:** `{ "action": "verifyGoogleAuth", "idToken": "<jwt>" }`
- **Logic:**
  1. Calls `oauth2.googleapis.com/tokeninfo?id_token=<jwt>`
  2. Confirms `email_verified == true`
  3. Matches email against `USERS` table
  4. Returns `sessionToken` if approved; prompts pending screen if new

#### `linkTelegramIdentity`
Validates official Telegram Login Widget authData via HMAC-SHA256 signature and links Telegram ID.
- **Body:** `{ "action": "linkTelegramIdentity", "authData": { id, first_name, hash, auth_date, ... }, "userId": "<uid>" }`
- **Validation:** 24h freshness check, HMAC-SHA256 verification against `TELEGRAM_BOT_TOKEN`.

#### `approveUser`
Super Admin / Admin approves pending user account.
- **Body:** `{ "action": "approveUser", "sessionToken": "<adminToken>", "userId": "<targetUserId>", "assignedRole": "<role>" }`

#### `updateUserStatus`
Updates user status (`approved`, `suspended`, `disabled`) and immediately revokes all active sessions.
- **Body:** `{ "action": "updateUserStatus", "sessionToken": "<adminToken>", "userId": "<targetUserId>", "status": "suspended" }`

### 3.2 Academic Structure & Cascades

#### `saveAcademicYear`
Creates or activates academic year.
- **Body:** `{ "action": "saveAcademicYear", "name": "2026-2027", "start_date": "2026-10-01", "end_date": "2027-08-31", "is_active": true }`

#### `saveSubject`
Registers or updates a curriculum subject.
- **Body:** `{ "action": "saveSubject", "name_kh": "គណិតវិទ្យា", "code": "MATH-01", "credit_hours": 4 }`

#### `enrollStudent`
Enrolls student into class for given academic year.
- **Body:** `{ "action": "enrollStudent", "student_id": "STU-001", "academic_year": "2026-2027", "grade": "ថ្នាក់ទី ៧", "room": "«ក»" }`

#### `transferStudent`
Transfers student from one class to another while strictly preserving all historical scores and attendance in previous class.
- **Body:** `{ "action": "transferStudent", "student_id": "STU-001", "new_grade": "ថ្នាក់ទី ៧", "new_room": "«ខ»", "reason": "ផ្លាស់ប្តូរបន្ទប់" }`
- **Data Integrity Rule:** Old enrollment record status updated to `transferred`; new enrollment created as `active`.

#### `assignTeacher`
Assigns teacher to class or subject.
- **Body:** `{ "action": "assignTeacher", "teacher_id": "TCH-001", "grade": "ថ្នាក់ទី ៧", "room": "«ក»", "subject_id": "MATH-01" }`

### 3.3 Dynamic Calculations & Events

#### `saveScores` / `saveScoresBatch`
Saves student scores, triggers automated ranking recalculation, GPA, and letter grades (A-F), and emits `SCORE_UPDATED` event.
- **Body:** `{ "action": "saveScoresBatch", "data": [ { student_id, grade, room, month, score, average, ... } ] }`

#### `saveAttendance` / `saveAttendanceBatch`
Saves daily or monthly student attendance, recalculates daily summaries, and emits `ATTENDANCE_RECORDED` event.
- **Body:** `{ "action": "saveAttendanceBatch", "data": [ { student_id, grade, room, date, status, ... } ] }`

#### `saveTimetable`
Saves weekly class schedule and emits `TIMETABLE_CHANGED` event.
- **Body:** `{ "action": "saveTimetable", "grade": "ថ្នាក់ទី ៧", "room": "«ក»", "academic_year": "2026-2027", "schedule": { ... } }`

#### `saveHomework`
Creates homework assignment and emits `HOMEWORK_ASSIGNED` event.
- **Body:** `{ "action": "saveHomework", "grade": "ថ្នាក់ទី ៧", "title": "លំហាត់ប្រភាគ", "due_date": "2026-10-30" }`

#### `saveAnnouncement`
Posts school announcement and broadcasts instant notifications to target users.
- **Body:** `{ "action": "saveAnnouncement", "title": "ដំណឹងប្រឡងឆមាស", "content": "...", "target_role": "all" }`

#### `emitEvent`
Client dispatches system event into backend `EVENT_QUEUE` and `AUDIT_LOGS`.
- **Body:** `{ "action": "emitEvent", "event_type": "STUDENT_ENROLLED", "affected_ids": ["STU-001"], "payload": { ... } }`
