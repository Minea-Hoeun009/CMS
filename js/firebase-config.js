// =========================================================================
// ឯកសារ js/firebase-config.js - ភ្ជាប់ទៅកាន់ Firebase Cloud Database & Auth
// =========================================================================

const firebaseConfig = {
  apiKey: "AIzaSyBOOAEgvGBAFw3eSvZU7Ebuejp1EA3XfCY",
  authDomain: "classroom-management-ed280.firebaseapp.com",
  projectId: "classroom-management-ed280",
  storageBucket: "classroom-management-ed280.firebasestorage.app",
  messagingSenderId: "414827617127",
  appId: "1:414827617127:web:c8ece6c5ca739176a76dc2",
  measurementId: "G-P56EXEQV00"
};

// ១. ចាប់ផ្តើមដំណើរការ Firebase (តែមួយដងគត់)
if (typeof firebase !== 'undefined') {
  if (!firebase.apps || !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
} else {
  console.error("Firebase SDK មិនទាន់ត្រូវបាន Load ចូលក្នុងទំព័រទេ!");
}

// ២. បង្កើត Instances សម្រាប់ Firestore និង Authentication
const db = typeof firebase !== 'undefined' && firebase.firestore ? firebase.firestore() : null;
const auth = typeof firebase !== 'undefined' && firebase.auth ? firebase.auth() : null;

// បញ្ចូលជា Global Variables សម្រាប់ប្រើប្រាស់គ្រប់ Module
window.firebase = typeof firebase !== 'undefined' ? firebase : null;
window.db = db;
window.auth = auth;

// ៣. បើកមុខងាររក្សាទុកទិន្នន័យពេលដាច់អ៊ីនធឺណិត (Offline Persistence)
if (db) {
  db.enablePersistence({ synchronizeTabs: true })
    .then(() => {
      console.log("✅ Firebase Offline Persistence ត្រូវបានបើកដោយជោគជ័យ (Multi-tab Enabled)");
    })
    .catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn("⚠️ Offline mode មិនដំណើរការលើ Tab នេះទេ ដោយសារមាន Tab ផ្សេងបើករួចហើយ។");
      } else if (err.code === 'unimplemented') {
        console.warn("⚠️ Browser នេះមិនគាំទ្រ Offline Persistence ទេ។");
      } else {
        console.warn("⚠️ Offline Persistence Warning:", err);
      }
    });
}

console.log("✅ Firebase Config Initialized: Connected to projectId 'classroom-management-ed280'");
