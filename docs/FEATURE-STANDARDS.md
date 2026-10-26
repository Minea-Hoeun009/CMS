# CMS Feature Standards / ស្តង់ដារមុខងារប្រព័ន្ធ

## 1. Main navigation

1. Dashboard — school/class overview and quick actions.
2. Students — student profile, class/room, guardian/contact, status, and search.
3. Attendance — daily marking, correction history, monthly summaries, and absence alerts.
4. Scores & Grades — assessment setup, score entry, validation against maximum score, grade calculation, and ranking rules.
5. Study Tracking Book — individual student progress and print/export.
6. Library & Assets — learning resources and school/class assets.
7. Reports & Analytics — attendance, achievement, student lists, class comparisons, and export.
8. Settings — school profile, academic year, grading rules, users/roles, data backup, and integrations.

## 2. Data quality rules

- Use a stable unique ID for every student and teacher; never use a student's name as the primary key.
- Associate academic records with `student_id`, `class_id`, and `academic_year` where applicable.
- Store dates in ISO format (`YYYY-MM-DD`) in data; format them for Khmer/English display only in the UI.
- Distinguish absent, present, late, excused, and not-recorded states; do not count a blank record as an absence automatically.
- Validate score values (`0 <= score <= max_score`) before saving.
- Avoid duplicate attendance and score records for the same student/date or student/assessment.
- Record `created_at`, `updated_at`, and `updated_by` for important changes where the backend supports it.

## 3. Security and access

- Use server-side authorization for every read/write operation. Hiding a button is not access control.
- Define roles such as Administrator, School Leader, Teacher, and Read-only Viewer, each with least-privilege permissions.
- Keep student personal data private; do not place private keys or credentials in browser code.
- Review Firestore Rules and Apps Script endpoint validation before using real data.
- Make backup/export and destructive actions explicit, confirmed, and auditable.

## 4. Analytics definitions

- Attendance rate = present sessions / eligible scheduled sessions × 100. Define treatment of excused absences and holidays consistently.
- Average score = sum of valid scores / number of valid scores. Do not mix different maximum scores without normalization.
- Ranking must specify whether it uses raw totals, normalized averages, subject weights, or tie-break rules.
- Every chart should show the selected academic year, class/room, period, and sample size where relevant.
- Alerts should be explainable (e.g., repeated absences or declining scores), not opaque AI decisions.

## 5. Usability and accessibility

- Khmer-first UI with a consistent English translation layer as a planned enhancement.
- Consistent page title, active navigation state, loading/empty/error/success states, and confirmation before destructive changes.
- Responsive layouts for desktop, tablet, and phone; support keyboard focus and meaningful button labels.
- Forms should retain user input after validation errors and explain how to correct the error.
- Exports should state the chosen class, academic year, date range, and generation time.

## 6. Release checklist

- Test login/logout, CRUD, search/filter, academic-year switching, and role permissions.
- Test duplicate prevention, missing data, invalid scores, date boundaries, and empty classes.
- Verify sync conflict handling and backup restoration using a staging copy.
- Test Khmer text in print/PDF/Excel and common mobile screen sizes.
- Review browser console/network errors before each release.
