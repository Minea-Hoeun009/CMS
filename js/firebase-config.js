// =========================================================================
// ឯកសារ js/firebase-config.js - ភ្ជាប់ទៅកាន់ Firebase Cloud Database & Auth
// =========================================================================

const firebaseConfig = {
  apiKey: "AIzaSyBSb1n01ZsFWJWk3P9HzMkHgiPYm1VY714",
  authDomain: "cms-v01.firebaseapp.com",
  projectId: "cms-v01",
  storageBucket: "cms-v01.firebasestorage.app",
  messagingSenderId: "306883664792",
  appId: "1:306883664792:web:9681cc2610b235577169ed",
  measurementId: "G-N0FRVY8KSD"
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

// ៤. ចាប់ផ្តើម Analytics (ប្រសិនបើ Browser គាំទ្រ)
const analytics = typeof firebase !== 'undefined' && firebase.analytics ? firebase.analytics() : null;
window.analytics = analytics;

console.log("✅ Firebase Config Initialized: Connected to projectId 'cms-v01'");
