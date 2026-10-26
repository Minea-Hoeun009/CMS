/* CMS Analytics: derives indicators only from locally available, existing records.
 * Does not write, migrate, or delete user data. Missing data is reported as unavailable.
 */
(function () {
  'use strict';
  const safeArray = (key) => {
    try { const v = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(v) ? v : []; }
    catch (_) { return []; }
  };
  const num = (v) => {
    if (v === null || v === undefined || String(v).trim() === '') return null;
    const n = Number(String(v).replace(/,/g, '').trim());
    return Number.isFinite(n) ? n : null;
  };
  const currentYear = () => document.getElementById('globalAcademicYear')?.value || localStorage.getItem('selected_academic_year') || '';
  const currentTeacher = () => window.AuthState?.teacherId || localStorage.getItem('auth_teacher_id') || '';
  const activeStudents = () => {
    const src = Array.isArray(window.allStudents) && window.allStudents.length ? window.allStudents : safeArray('academic_students');
    const teacher = currentTeacher(), year = currentYear();
    return src.filter(s => s && s.status !== 'Dropped' && (!teacher || !s.teacher_id || String(s.teacher_id) === String(teacher)) && (!year || !s.academic_year || String(s.academic_year) === String(year)));
  };
  const classifyAttendance = (r) => {
    const hasStatus = ['status', 'attendance', 'ស្ថានភាព'].some(k => Object.prototype.hasOwnProperty.call(r, k));
    if (!hasStatus) return 'unknown';
    const raw = String(r.status ?? r.attendance ?? r['ស្ថានភាព'] ?? '').trim().toUpperCase();
    if (['អច្ប', 'អត់ច្បាប់', 'ឥតច្បាប់', 'A', 'ABSENT', 'ABSENT_UNEXCUSED'].includes(raw)) return 'absent';
    if (['ច្ប', 'ច្បាប់', 'មានច្បាប់', 'C', 'EXCUSED'].includes(raw)) return 'excused';
    if (['ឈ', 'ឈឺ', 'ឈឺមានច្បាប់', 'S', 'SICK'].includes(raw)) return 'sick';
    if (['៖', ':', 'សម្រាក', 'ឈប់សម្រាក', 'HOLIDAY'].includes(raw)) return 'holiday';
    if (['P', 'វ', 'វត្តមាន', 'PRESENT', ''].includes(raw)) return 'present';
    return 'unknown';
  };
  function snapshot() {
    const students = activeStudents();
    const validIds = new Set(students.map(s => String(s.id)));
    const attendance = safeArray('academic_attendance').filter(r => r && typeof r === 'object' && validIds.has(String(r.student_id ?? r.studentId ?? r.id ?? '')));
    const countedAttendance = attendance.map(r => ({ r, status: classifyAttendance(r) })).filter(x => x.status !== 'unknown' && x.status !== 'holiday');
    const present = countedAttendance.filter(x => x.status === 'present').length;
    const absent = countedAttendance.filter(x => x.status === 'absent').length;
    const excused = countedAttendance.filter(x => x.status === 'excused').length;
    const sick = countedAttendance.filter(x => x.status === 'sick').length;
    const attendanceRate = countedAttendance.length ? (present / countedAttendance.length) * 100 : null;

    const allScores = safeArray('academic_scores').filter(s => s && typeof s === 'object' && validIds.has(String(s.student_id ?? s.studentId ?? '')));
    const monthly = allScores.filter(s => String(s.period_type || 'monthly').toLowerCase() === 'monthly' && num(s.average) !== null);
    const scoredLatest = new Map();
    // Latest stored record per student; when no sortable date exists, the last record in storage wins.
    monthly.forEach((s, index) => {
      const id = String(s.student_id ?? s.studentId);
      const stamp = String(s.updated_at || s.updatedAt || s.date || s.month || '').trim();
      const previous = scoredLatest.get(id);
      if (!previous || stamp >= previous.stamp || !stamp) scoredLatest.set(id, { score: num(s.average), grade: String(s.grade_letter || s.gradeLetter || '').toUpperCase(), month: String(s.month || ''), stamp, index });
    });
    const latestScores = Array.from(scoredLatest.values()).filter(x => x.score !== null);
    const averageScore = latestScores.length ? latestScores.reduce((a, x) => a + x.score, 0) / latestScores.length : null;
    const lowScoreAlerts = latestScores.filter(x => x.grade === 'F').length;
    const missingScores = Math.max(0, students.length - scoredLatest.size);

    const byMonth = new Map();
    monthly.forEach(s => {
      const month = String(s.month || '').trim();
      if (!month || month === 'ប្រចាំឆ្នាំ') return;
      if (!byMonth.has(month)) byMonth.set(month, []);
      byMonth.get(month).push(num(s.average));
    });
    const trend = Array.from(byMonth.entries()).map(([month, vals]) => ({ month, average: vals.filter(v => v !== null).reduce((a, v) => a + v, 0) / vals.filter(v => v !== null).length })).filter(x => Number.isFinite(x.average)).slice(-6);

    return { studentCount: students.length, attendance: { recorded: countedAttendance.length, present, absent, excused, sick, rate: attendanceRate }, scores: { average: averageScore, studentsWithScores: latestScores.length, missingScores, lowScoreAlerts, trend }, source: { attendance: attendance.length, scores: allScores.length } };
  }
  window.CMSAnalytics = { snapshot, classifyAttendance };
})();
