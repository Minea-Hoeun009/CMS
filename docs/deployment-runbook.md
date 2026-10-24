# ដំណើរការដាក់ឱ្យប្រើប្រាស់ និងសង្គ្រោះប្រព័ន្ធ (CMS Deployment & Operations Runbook)
**កំណែ (Version):** 2.4.0  
**កាលបរិច្ឆេទ:** 2026-10-24  

ឯកសារនេះផ្តល់ការណែនាំជាជំហានៗសម្រាប់ការដាក់ឱ្យប្រើប្រាស់ (Deploy), ពិនិត្យផ្ទៀងផ្ទាត់ (Verification), បម្រុងទុក (Backup), និងការសង្គ្រោះបន្ទាន់ (Rollback & Disaster Recovery)។

---

## ១. បរិស្ថានដាក់ឱ្យប្រើប្រាស់ (Environments)

| បរិស្ថាន | Host / ទីតាំង | គោលបំណង |
| :--- | :--- | :--- |
| **Local / Dev** | `localhost:3000` ឬ Live Server | អភិវឌ្ឍន៍ និងសាកល្បងកូដក្នុងម៉ាស៊ីនផ្ទាល់ខ្លួន |
| **Staging / Preview** | Vercel Preview Deployment | ផ្ទៀងផ្ទាត់មុខងារមុនឡើង Production |
| **Production** | Vercel Production + Firebase + Google Sheets | បម្រើសេវាកម្មដល់សាលារៀនពិតប្រាកដ |

---

## ២. បញ្ជីត្រួតពិនិត្យមុនពេល Deploy (Pre-Deployment Checklist)

1. [x] **ដកចេញនូវ Default Passwords:** គ្មានពាក្យសម្ងាត់គំរូ ឬ default credentials ក្នុង README.md និង source code។
2. [x] **Syntax & Integrity Checks:** រាល់ file JavaScript ទាំងអស់ត្រូវតែឆ្លងកាត់ការពិនិត្យ syntax (`npm run test:syntax`)។
3. [x] **Automated Tests:** រាល់ unit tests, rbac tests, regression tests ទាំងអស់ត្រូវតែ PASS 100% (`npm test`)។
4. [x] **Firestore Security Rules:** ដាក់ពង្រាយ `firestore.rules` ដែលបានរឹតបន្តឹង `isSameSchool` និង Append-only audit logs។
5. [x] **Google Apps Script Backend:** Deploy Web App ជាមួយ Access: Anyone, Execute as Me, ព្រមទាំង verify sanitization នៃ passwords។

---

## ៣. ជំហានដាក់ឱ្យប្រើប្រាស់ (Deployment Steps)

### ៣.១ Deploy Web App (Frontend លើ Vercel)
```bash
# ១. ពិនិត្យស្ថានភាព Git
git status

# ២. ដំណើរការ Automated Tests
npm test
npm run test:syntax

# ៣. Push ទៅកាន់ GitHub Main Branch
git push origin main
```
*ចំណាំ:* ប្រសិនបើ Vercel ត្រូវបានភ្ជាប់ជាមួយ GitHub repo នោះ Vercel នឹងចាប់ផ្តើម Auto-deploy ភ្លាមៗ។

### ៣.២ Deploy Firestore Security Rules
```bash
firebase deploy --only firestore:rules
```

### ៣.៣ Deploy Google Apps Script Web App
1. បើក Google Sheets > Extensions > Apps Script។
2. បិទភ្ជាប់កូដពី `google-apps-script/Code.gs`។
3. ចុច **Deploy** > **Manage deployments** > កែប្រែ Version ទៅ New Version។
4. ជ្រើសរើស **Execute as: Me** និង **Who has access: Anyone**។
5. ចុច **Deploy** រួចផ្ទៀងផ្ទាត់ Web App URL។

---

## ៤. ជំហានផ្ទៀងផ្ទាត់ក្រោយ Deploy (Smoke Tests & Verification)

1. **ចូលប្រព័ន្ធ (Login):** សាកល្បង Login ជាមួយគណនី Admin និង Teacher។
2. **ពិនិត្យ Scope:** គណនី Teacher ត្រូវមើលឃើញតែសិស្ស និងថ្នាក់របស់ខ្លួន; Admin ឃើញទាំងអស់។
3. **បន្ថែមសិស្ស (Add Student):** បញ្ចូលសិស្សគំរូម្នាក់ > ពិនិត្យមើលថាតារាង Update ភ្លាមៗ (Instant Update) ហើយ Google Sheet ទទួលបានទិន្នន័យ។
4. **កត់ត្រាវត្តមាន (Attendance):** ស្រង់វត្តមានសិស្ស ១ ថ្នាក់ > រក្សាទុក > ពិនិត្យមើល toast និង record ក្នុង Sheets។
5. **បញ្ចូលពិន្ទុ (Scores):** វាយបញ្ចូលពិន្ទុ > ពិនិត្យមើលការគណនាមធ្យមភាគ និងចំណាត់ថ្នាក់។
6. **Responsive Layout:** សាកល្បងបើកលើទូរស័ព្ទដៃ > ពិនិត្យមើល Bottom Navigation Bar និង Sidebar Drawer។

---

## ៥. ផែនការបម្រុងទុក និងសង្គ្រោះបន្ទាន់ (Backup & Rollback)

### ៥.១ ការទាញយកទិន្នន័យបម្រុងទុក (Manual Backup)
- អ្នកគ្រប់គ្រងសាលា (Admin) អាចចូលទៅកាន់ **"ការកំណត់"** ឬ **"Backup"**។
- ចុចប៊ូតុង **"ទាញយកទិន្នន័យបម្រុងទុក (Export JSON/Excel)"**។
- ឯកសារបម្រុងទុកមានផ្ទុក metadata, students, attendance, scores, settings ទាំងអស់។

### ៥.២ ដំណើរការ Rollback ជាបន្ទាន់ (Rollback Procedure)
ប្រសិនបើមានបញ្ហាបច្ចេកទេសកើតឡើងលើ Production:
1. **Frontend Rollback:** ចូលទៅកាន់ Vercel Dashboard > Deployments > ជ្រើសរើស Deployment ចាស់ដែលដំណើរការល្អ > ចុច **Instant Rollback**។
2. **Firestore Rules Rollback:**
   ```bash
   firebase deploy --only firestore:rules
   ```
3. **Data Recovery:** ប្រើប្រាស់មុខងារ Restore ក្នុង Settings ដោយ Upload JSON Backup ចុងក្រោយបង្អស់។
