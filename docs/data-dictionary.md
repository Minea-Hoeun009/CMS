# វចនានុក្រមទិន្នន័យប្រព័ន្ធ (CMS Data Dictionary)
**កំណែ (Version):** 2.4.0  
**កាលបរិច្ឆេទ:** 2026-10-24  

ឯកសារនេះកំណត់លម្អិតអំពីរចនាសម្ព័ន្ធទិន្នន័យ (Data Schemas) ទាំងលើ **Google Cloud Firestore Collections** និង **Google Sheets (តាមរយៈ Google Apps Script)**។

---

## ១. តារាងសិស្ស (Students / សិស្ស)
- **Firestore Collection:** `students`
- **Google Sheet Name:** `Students`
- **Primary Key:** `id` (ឧទាហរណ៍: `STU-001` ឬ Auto ID)

| ឈ្មោះ Field | ប្រភេទ (Type) | Required | ការពិពណ៌នា (Description) |
| :--- | :--- | :---: | :--- |
| `id` | String | Yes | លេខសម្គាល់សិស្ស (Unique Identifier) |
| `name` | String | Yes | ឈ្មោះពេញរបស់សិស្ស (ជាភាសាខ្មែរ) |
| `gender` | String | Yes | ភេទ (`ប្រុស` ឬ `ស្រី` / `M` / `F`) |
| `dob` | String (YYYY-MM-DD) | No | ថ្ងៃខែឆ្នាំកំណើត |
| `grade` | String | Yes | កម្រិតថ្នាក់ (ឧ. `ថ្នាក់ទី៧`, `ថ្នាក់ទី៨`, `7`, `8`) |
| `room` | String | Yes | បន្ទប់សិក្សា (ឧ. `ក`, `ខ`, `A`, `B`) |
| `academic_year` | String | Yes | ឆ្នាំសិក្សា (ឧ. `2025-2026`) |
| `school_id` | String | Yes | លេខសម្គាល់សាលារៀនសម្រាប់បែងចែក Multi-tenant |
| `teacher_id` | String | No | លេខសម្គាល់គ្រូទទួលបន្ទុកថ្នាក់ |
| `photo` | String (Base64/URL)| No | រូបថតសិស្ស |
| `phone` | String | No | លេខទូរស័ព្ទទំនាក់ទំនង |
| `parent_name` | String | No | ឈ្មោះអាណាព្យាបាល |
| `status` | String | Yes | ស្ថានភាព (`Active`, `Suspended`, `Graduated`, `Withdrawn`) |
| `poor_id` | String | No | ប័ណ្ណក្រីក្រ (សមធម៌) |
| `scholarship` | String | No | អាហារូបករណ៍ |
| `address` | String | No | អាសយដ្ឋានបច្ចុប្បន្ន |
| `created_at` | String (ISO 8601) | Yes | កាលបរិច្ឆេទបង្កើតកំណត់ត្រា |
| `updated_at` | String (ISO 8601) | Yes | កាលបរិច្ឆេទធ្វើបច្ចុប្បន្នភាពចុងក្រោយ |

---

## ២. តារាងគ្រូបង្រៀន និងអ្នកប្រើប្រាស់ (Teachers & Staff)
- **Firestore Collection:** `teachers`
- **Google Sheet Name:** `Teachers`
- **Primary Key:** `teacher_id`

| ឈ្មោះ Field | ប្រភេទ (Type) | Required | ការពិពណ៌នា (Description) |
| :--- | :--- | :---: | :--- |
| `teacher_id` | String | Yes | លេខសម្គាល់គ្រូ (ឧ. `TCH-001`) |
| `username` | String | Yes | ឈ្មោះសម្រាប់ចូលប្រព័ន្ធ (Unique) |
| `password_hash` | String | Yes | តម្លៃ Hash នៃពាក្យសម្ងាត់ (PBKDF2/SHA-256) |
| `salt` | String | Yes | Salt សម្រាប់បង្កើត Hash |
| `name` | String | Yes | ឈ្មោះពេញរបស់គ្រូ |
| `role` | String | Yes | តួនាទី (`system_admin`, `school_admin`, `teacher`, `viewer`) |
| `grade` | String | No | កម្រិតថ្នាក់ដែលទទួលបន្ទុក (ឬ `all`) |
| `room` | String | No | បន្ទប់ដែលទទួលបន្ទុក (ឬ `all`) |
| `school_id` | String | Yes | លេខសម្គាល់សាលារៀន |
| `phone` | String | No | លេខទូរស័ព្ទ |
| `email` | String | No | អ៊ីមែល |
| `status` | String | Yes | ស្ថានភាព (`Active`, `Inactive`) |
| `created_at` | String (ISO 8601) | Yes | កាលបរិច្ឆេទបង្កើត |
| `updated_at` | String (ISO 8601) | Yes | កាលបរិច្ឆេទធ្វើបច្ចុប្បន្នភាពចុងក្រោយ |

*ចំណាំ:* សមាសភាគ API `getTeachers` នឹងលុប `password`, `password_hash`, និង `salt` ដោយស្វ័យប្រវត្តិកុំឱ្យបញ្ជូនទៅ Client។

---

## ៣. តារាងថ្នាក់រៀន (Classes / ថ្នាក់)
- **Firestore Collection:** `classes`
- **Google Sheet Name:** `Classes`
- **Primary Key:** `class_id`

| ឈ្មោះ Field | ប្រភេទ (Type) | Required | ការពិពណ៌នា (Description) |
| :--- | :--- | :---: | :--- |
| `class_id` | String | Yes | លេខសម្គាល់ថ្នាក់ (ឧ. `2025-2026_7_A`) |
| `academic_year` | String | Yes | ឆ្នាំសិក្សា |
| `grade` | String | Yes | កម្រិតថ្នាក់ |
| `room` | String | Yes | បន្ទប់ |
| `teacher_id` | String | No | គ្រូទទួលបន្ទុក |
| `teacher_name` | String | No | ឈ្មោះគ្រូទទួលបន្ទុក |
| `school_id` | String | Yes | លេខសម្គាល់សាលារៀន |
| `updated_at` | String (ISO 8601) | Yes | កាលបរិច្ឆេទកែប្រែ |

---

## ៤. តារាងវត្តមាន (Attendance / វត្តមាន)
- **Firestore Collection:** `attendance`
- **Google Sheet Name:** `Attendance`
- **Primary Key:** `record_id` (ទម្រង់: `{student_id}_{date}_{academic_year}`)

| ឈ្មោះ Field | ប្រភេទ (Type) | Required | ការពិពណ៌នា (Description) |
| :--- | :--- | :---: | :--- |
| `record_id` | String | Yes | Unique Identifier នៃវត្តមាន |
| `student_id` | String | Yes | Foreign Key ទៅកាន់ `Students.id` |
| `student_name` | String | No | ឈ្មោះសិស្ស |
| `date` | String (YYYY-MM-DD) | Yes | កាលបរិច្ឆេទស្រង់វត្តមាន |
| `month` | String | Yes | ខែ (ឧ. `មករា`, `01`) |
| `status` | String | Yes | ស្ថានភាពវត្តមាន (`P`: មានវត្តមាន, `A`: អវត្តមានគ្មានច្បាប់, `L`: យឺត, `E`: មានច្បាប់) |
| `grade` | String | Yes | កម្រិតថ្នាក់ |
| `room` | String | Yes | បន្ទប់ |
| `academic_year` | String | Yes | ឆ្នាំសិក្សា |
| `school_id` | String | Yes | លេខសម្គាល់សាលារៀន |
| `recorded_by` | String | Yes | អ្នកកត់ត្រា |
| `updated_at` | String (ISO 8601) | Yes | ពេលវេលាកត់ត្រា |

---

## ៥. តារាងពិន្ទុ (Scores / ពិន្ទុ)
- **Firestore Collection:** `scores`
- **Google Sheet Name:** `Scores`
- **Primary Key:** `score_id` (ទម្រង់: `{student_id}_{academic_year}_{month}_{subject}`)

| ឈ្មោះ Field | ប្រភេទ (Type) | Required | ការពិពណ៌នា (Description) |
| :--- | :--- | :---: | :--- |
| `score_id` | String | Yes | Unique Identifier នៃកំណត់ត្រាពិន្ទុ |
| `student_id` | String | Yes | Foreign Key ទៅកាន់ `Students.id` |
| `student_name` | String | No | ឈ្មោះសិស្ស |
| `academic_year` | String | Yes | ឆ្នាំសិក្សា |
| `month` | String | Yes | ខែនៃការវាយតម្លៃ |
| `semester` | String | No | ឆមាស (`1` ឬ `2`) |
| `subject` | String | Yes | មុខវិជ្ជា (ឬ `TOTAL`) |
| `score` | Number | Yes | ពិន្ទុជាក់ស្តែង (ឧ. `0 - 100`) |
| `total` | Number | No | ពិន្ទុសរុប |
| `average` | Number | No | មធ្យមភាគពិន្ទុ |
| `rank` | Number | No | ចំណាត់ថ្នាក់ក្នុងថ្នាក់ |
| `grade_letter` | String | No | និទ្ទេស (`A`, `B`, `C`, `D`, `E`, `F`) |
| `grade` | String | Yes | កម្រិតថ្នាក់ |
| `room` | String | Yes | បន្ទប់ |
| `school_id` | String | Yes | លេខសម្គាល់សាលារៀន |
| `updated_at` | String (ISO 8601) | Yes | កាលបរិច្ឆេទធ្វើបច្ចុប្បន្នភាព |

---

## ៦. តារាងបណ្ណាល័យ (Library / សៀវភៅ)
- **Firestore Collection:** `library`
- **Google Sheet Name:** `Library`
- **Primary Key:** `transaction_id`

| ឈ្មោះ Field | ប្រភេទ (Type) | Required | ការពិពណ៌នា (Description) |
| :--- | :--- | :---: | :--- |
| `transaction_id` | String | Yes | លេខសម្គាល់ប្រតិបត្តិការខ្ចី-សង |
| `book_id` | String | Yes | លេខកូដសៀវភៅ |
| `book_title` | String | Yes | ចំណងជើងសៀវភៅ |
| `student_id` | String | Yes | Foreign Key ទៅកាន់ `Students.id` |
| `student_name` | String | No | ឈ្មោះសិស្សដែលខ្ចី |
| `borrow_date` | String (YYYY-MM-DD) | Yes | ថ្ងៃខែខ្ចី |
| `due_date` | String (YYYY-MM-DD) | Yes | ថ្ងៃខែកំណត់ត្រូវសង |
| `return_date` | String (YYYY-MM-DD) | No | ថ្ងៃខែបានសងជាក់ស្តែង |
| `status` | String | Yes | ស្ថានភាព (`Borrowed`, `Returned`, `Overdue`, `Lost`) |
| `academic_year` | String | Yes | ឆ្នាំសិក្សា |
| `updated_at` | String (ISO 8601) | Yes | ពេលវេលាកែប្រែ |

---

## ៧. តារាងកំណត់ត្រាសុវត្ថិភាព (AuditLogs / កំណត់ហេតុ)
- **Firestore Collection:** `audit_logs` (Strictly Append-Only)
- **Google Sheet Name:** `AuditLogs`
- **Primary Key:** `log_id`

| ឈ្មោះ Field | ប្រភេទ (Type) | Required | ការពិពណ៌នា (Description) |
| :--- | :--- | :---: | :--- |
| `log_id` | String | Yes | លេខសម្គាល់កំណត់ត្រា |
| `timestamp` | String (ISO 8601) | Yes | ពេលវេលានៃសកម្មភាព |
| `action` | String | Yes | ប្រភេទសកម្មភាព (`CREATE`, `UPDATE`, `DELETE`, `LOGIN`, `EXPORT`) |
| `entity_type` | String | Yes | ផ្នែកពាក់ព័ន្ធ (`STUDENT`, `SCORE`, `ATTENDANCE`, `AUTH`, `SETTINGS`) |
| `user_id` | String | Yes | អ្នកអនុវត្ត |
| `school_id` | String | Yes | លេខសម្គាល់សាលារៀន |
| `details` | String / Object | Yes | ព័ត៌មានលម្អិតនៃសកម្មភាព |
