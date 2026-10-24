# ស្ថាបត្យកម្មប្រព័ន្ធគ្រប់គ្រងសាលារៀន (CMS System Architecture Overview)
**កំណែ (Version):** 2.4.0 (Redesign Specification 1.0)  
**កាលបរិច្ឆេទ:** 2026-10-24  
**ស្ថានភាព:** Production-Ready Standard Architecture  

---

## ១. ទិដ្ឋភាពទូទៅ (System Overview)
ប្រព័ន្ធគ្រប់គ្រងសាលារៀន (Classroom Management System - CMS) ត្រូវបានរៀបចំឡើងជាស្ថាបត្យកម្មទំនើប Layered Multi-Tier Web Application ដែលគាំទ្រការងារលើទាំង Desktop និងឧបករណ៍ចល័ត (Mobile/Tablet)។ ប្រព័ន្ធនេះផ្តល់នូវការគ្រប់គ្រងទិន្នន័យសិស្ស វត្តមាន ពិន្ទុ កាលវិភាគ កិច្ចការផ្ទះ បណ្ណាល័យ របាយការណ៍ និងការកំណត់ទូទៅរបស់សាលារៀន។

ប្រព័ន្ធប្រើប្រាស់យុទ្ធសាស្ត្រ **Hybrid Cloud Persistence**:
1. **Google Cloud Firestore (NoSQL):** សម្រាប់ការផ្ទុកទិន្នន័យលើ Cloud ជាមួយ real-time sync, transaction security, និង fine-grained RBAC rules។
2. **Google Apps Script & Google Sheets (Relational Spreadsheet):** សម្រាប់ជាប្រព័ន្ធផ្ទុកទិន្នន័យស្របគ្នា (Spreadsheet Relational Backend) ដែលងាយស្រួលនាំចេញ ពិនិត្យ របាយការណ៍ និងចែករំលែកទៅថ្នាក់ដឹកនាំ និងក្រសួង។
3. **Local Storage / Memory Cache:** សម្រាប់ Optimistic UI Rendering (0ms latency) និង Offline Persistence Queue។

---

## ២. ស្ថាបត្យកម្មបែងចែកស្រទាប់កូដ (Target Layered Architecture)

```
┌────────────────────────────────────────────────────────────────────────┐
│                   PRESENTATION / UI LAYER                              │
│  - index.html (Responsive, Accessible Semantic Layout, Modal Dialogs)  │
│  - css/style.css (Design System, Khmer Typography, 44px Touch Targets) │
│  - Toast & Inline Notification System (stuModalErrorBanner, Alerts)    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                  VALIDATION & BUSINESS LOGIC LAYER                     │
│  - CMSValidator (js/validation.js): Strict Data & Boundary Checks      │
│  - Business Modules:                                                   │
│      • js/students.js   (Student Lifecycle & Enrollment)               │
│      • js/attendance.js (Daily/Monthly Tracking & Audit)               │
│      • js/scores.js     (Gradebook, Ranking & Evaluation)              │
│      • js/library.js    (Book Circulation & Statuses)                  │
│      • js/settings.js   (Academic Years, Subjects, School Scope)       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                    SECURITY & RBAC ACCESS LAYER                        │
│  - js/auth.js (AppAuth Context, RBAC Policy, Session Lifecycle)        │
│  - firestore.rules (Multi-tenant School Scoping, Immutable Audit Logs) │
│  - Role Matrix: System Admin, School Admin, Teacher, Report Viewer     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                    DATA PERSISTENCE & SYNC LAYER                       │
│  - js/config.js (apiPost & Direct Instant Sync to Apps Script Engine)  │
│  - Google Cloud Firestore (Collections: students, teachers, etc.)      │
│  - Google Apps Script (Code.gs with Relational Sheets Engine)          │
│  - Local Cache & Offline Sync Queue (window.syncQueue)                 │
└────────────────────────────────────────────────────────────────────────┘
```

---

## ៣. លំហូរទិន្នន័យ (Data Flow & Life Cycle)

### ៣.១ លំហូរនៃការកត់ត្រាទិន្នន័យ (Write Data Flow)
1. **User Action:** អ្នកប្រើប្រាស់បំពេញទិន្នន័យលើទម្រង់ (Form) រួចចុច Save។
2. **Form Validation:** `CMSValidator` ត្រួតពិនិត្យទិន្នន័យជាបន្ទាន់ (Fields, Limits, Formats)។ ប្រសិនបើខុស នឹងបង្ហាញ Error Banner លើ Modal ភ្លាមៗដោយមិនបិទ Dialog ឬបាត់ទិន្នន័យ។
3. **Optimistic Rendering:** ប្រព័ន្ធធ្វើបច្ចុប្បន្នភាពទិន្នន័យក្នុង Client State និង Table ភ្លាមៗ (0ms UI Latency) ដើម្បីឱ្យអ្នកប្រើប្រាស់បន្តការងារដោយមិនរង់ចាំ។
4. **Primary Cloud Write:** បញ្ជូនទិន្នន័យទៅកាន់ Firestore តាមរយៈ `db.collection(...).set(...)` ឬ `update(...)` ដោយភ្ជាប់ជាមួយ `school_id`, `created_at`, `updated_at`, និង `recorded_by`។
5. **Instant Apps Script Sync:** បញ្ជូនតាម `apiPost({ action, data, academic_year, teacher_id })` ទៅកាន់ Web App URL ផ្ទាល់ ដោយ LockService នៅខាង Sheets ធានាមិនឱ្យមានការជាន់ទិន្នន័យ (Concurrency Lock)។
6. **Notification Confirmation:** បង្ហាញ Toast ឬ Status Bar បញ្ជាក់ថាទិន្នន័យត្រូវបានបញ្ជាក់ដោយ Cloud និង Google Sheets រួចរាល់។

### ៣.២ លំហូរនៃការទាញយកទិន្នន័យ (Read Data Flow)
1. **Scope Checking:** `AppAuth` កំណត់សិទ្ធិ (Role, Assigned Grade, Room, School ID)។
2. **Scoping Query:** ទាញយកតែទិន្នន័យដែលស្ថិតក្នុង Scope របស់អ្នកប្រើ (ឧ. គ្រូបង្រៀនឃើញតែថ្នាក់ និងបន្ទប់ដែលខ្លួនទទួលបន្ទុក, Admin ឃើញទាំងអស់)។
3. **Synchronize Dropdowns:** ហៅ `window.updateAllClassDropdowns()` និង `window.notifyDataChanged()` ដើម្បីឱ្យ Select Options ទាំងអស់ក្នុងប្រព័ន្ធ Update ស្របគ្នាដោយមិនបាច់ Refresh ទំព័រ។

---

## ៤. គំរូសិទ្ធិអ្នកប្រើប្រាស់ (RBAC Matrix)

| សមាសភាគ / មុខងារ | System Admin | School Admin | Teacher | Report Viewer |
| :--- | :---: | :---: | :---: | :---: |
| មើលសិស្សទាំងអស់ | ✅ គ្រប់សាលា | ✅ ក្នុងសាលា | ❌ (តាមថ្នាក់) | ✅ ក្នុងសាលា |
| បន្ថែម/កែប្រែ/លុបសិស្ស | ✅ | ✅ | ⚠️ កែតែថ្នាក់ខ្លួន | ❌ |
| ស្រង់វត្តមាន | ✅ | ✅ | ✅ តាមថ្នាក់ខ្លួន | ❌ |
| បញ្ចូល/កែប្រែពិន្ទុ | ✅ | ✅ | ✅ តាមថ្នាក់ខ្លួន | ❌ |
| បណ្ណាល័យ | ✅ | ✅ | ✅ | ❌ |
| ការកំណត់សាលារៀន | ✅ | ✅ | ❌ | ❌ |
| ការកំណត់ប្រព័ន្ធ & Roles | ✅ | ❌ | ❌ | ❌ |
| ទាញយក Backup / Audit Logs | ✅ | ✅ | ❌ | ❌ |

---

## ៥. ការធានាសុវត្ថិភាព និងភាពត្រឹមត្រូវនៃទិន្នន័យ
- **គ្មានលេខកូដសម្ងាត់គំរូជាសាធារណៈ:** ព័ត៌មានសម្ងាត់លំនាំដើមត្រូវបានដកចេញពី README.md។
- **ការការពារពាក្យសម្ងាត់គ្រូ:** Google Apps Script `getTeachers` លុបចោល `password`, `password_hash`, និង `salt` មុននឹងបញ្ជូនទៅកាន់ Client។
- **LockService Concurrency:** Google Apps Script ប្រើ `LockService.getScriptLock()` (Timeout 15s) ការពារការសរសេរជាន់គ្នានៅពេលមានសំណើជាច្រើនក្នុងពេលតែមួយ។
- **Strict School Boundary:** Firestore Rules ការពារមិនឱ្យមាន Bypass តាមរយៈ `school_id` ទទេ ឬមិនត្រូវគ្នា។
