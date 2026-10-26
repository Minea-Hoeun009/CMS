# Classroom Management System (CMS) - Architecture & Relationship Diagrams
**CMS Enterprise Architecture v4.0**
**Language:** Khmer & English (Bilingual Standard)

---

## 1. 8-Layer Core System Architecture

```mermaid
flowchart TD
    subgraph L1["Layer 1: Responsive UI & Presentation Layer"]
        A1["Tailwind CSS 3.4 & Custom Siemreap/Moul Typography"]
        A2["Role-Aware Dynamic Dashboard (Super Admin / Admin / Homeroom / Subject / Student)"]
        A3["Reusable Components (Modals, Toasts, Universal Print Manager, Breadcrumbs)"]
    end

    subgraph L2["Layer 2: Authentication & Identity Management"]
        B1["Firebase Auth (Google Sign-In)"]
        B2["Telegram Login Widget (HMAC-SHA256 Verification)"]
        B3["Session Token Manager (sessionStorage, 12h Expire, 2h Inactive)"]
        B4["MFA Engine (TOTP RFC 6238 & 8 Recovery Codes)"]
    end

    subgraph L3["Layer 3: Central Authorization & RBAC"]
        C1["DataServiceGuard & assertCan()"]
        C2["Role Evaluator (Super Admin, Admin, Homeroom Teacher, Subject Teacher, Student)"]
        C3["School & Classroom Scope Enforcement"]
    end

    subgraph L4["Layer 4: Application Service & Domain Logic"]
        D1["Student Enrollment & Historical Transfer Engine"]
        D2["Teacher Assignment & Timetable Scheduler"]
        D3["Attendance Tracking & Absence Summarizer"]
        D4["Examination, Grade & Automated Ranking Calculator (A-F)"]
        D5["Homework & Assignment Engine"]
        D6["KrouDigital 4.0 Standard Analytics & Reporting"]
    end

    subgraph L5["Layer 5: Central Event Bus & Orchestrator"]
        E1["window.CMSEventBus (Pub/Sub with In-Memory History)"]
        E2["window.CMSOrchestrator (10 Dynamic Business Rules & Cascades)"]
    end

    subgraph L6["Layer 6: Central API & Transport Layer"]
        F1["apiGet() & apiPost() Transport Bridge"]
        F2["Exponential Backoff & Offline IndexedDB/LocalStorage Cache"]
        F3["GAS REST Action Handlers (24 Dual Endpoints)"]
    end

    subgraph L7["Layer 7: Data Access & Concurrency Control"]
        G1["Google Apps Script LockService Concurrency Locks (30s)"]
        G2["Google Sheets Relational Database (24 Normalized Tables)"]
        G3["Firebase Firestore Realtime Cache"]
    end

    subgraph L8["Layer 8: Audit Logging, Event Queue & Monitoring"]
        H1["EventQueue Table (Asynchronous Event Persistence)"]
        H2["AuditLogs Table (Immutable, Secret-Redacted Audit Trail)"]
        H3["Security Rate Limiter (5 Attempts / 15-Min Lockout)"]
    end

    L1 --> L2
    L2 --> L3
    L3 --> L4
    L4 <--> L5
    L4 --> L6
    L6 --> L7
    L7 --> L8
```

---

## 2. Dynamic Module Relationship Diagram

```mermaid
erDiagram
    ACADEMIC_YEARS ||--o{ CLASSES : "contains"
    ACADEMIC_YEARS ||--o{ ENROLLMENTS : "scopes"
    CLASSES ||--o{ ENROLLMENTS : "has_students"
    CLASSES ||--o{ TEACHER_ASSIGNMENTS : "has_teachers"
    CLASSES ||--o{ TIMETABLES : "scheduled_for"
    CLASSES ||--o{ HOMEWORK : "assigned_to"
    CLASSES ||--o{ ATTENDANCE : "recorded_for"
    CLASSES ||--o{ SCORES : "evaluated_for"
    
    STUDENTS ||--o{ ENROLLMENTS : "enrolled_in"
    STUDENTS ||--o{ ATTENDANCE : "daily_presence"
    STUDENTS ||--o{ SCORES : "monthly_grades"
    
    TEACHERS ||--o{ TEACHER_ASSIGNMENTS : "teaches"
    SUBJECTS ||--o{ TEACHER_ASSIGNMENTS : "subject_taught"
    SUBJECTS ||--o{ SCORES : "graded_subject"
    
    USERS ||--o{ SESSIONS : "authenticates"
    USERS ||--o{ AUDIT_LOGS : "performs_actions"
    
    EXAMINATIONS ||--o{ SCORES : "evaluates"
    ANNOUNCEMENTS ||--o{ NOTIFICATIONS : "broadcasts"
```

---

## 3. End-to-End Authentication & Authorization Data Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Teacher / Admin / Student
    participant Browser as CMS Web App (Client)
    participant Auth as Firebase / Telegram Auth
    participant GAS as Google Apps Script Backend
    participant Sheets as Google Sheets (Database)

    User->>Browser: Click Google Sign-In or Telegram Login
    alt Google OAuth2
        Browser->>Auth: firebase.auth().signInWithPopup(Google)
        Auth-->>Browser: ID Token (JWT)
        Browser->>GAS: doPost(action: 'verifyGoogleAuth', idToken)
        GAS->>Auth: GET oauth2.googleapis.com/tokeninfo
        Auth-->>GAS: email, email_verified: true
    else Telegram Login Widget
        Browser->>Auth: Telegram Web Login
        Auth-->>Browser: authData {id, hash, auth_date, ...}
        Browser->>GAS: doPost(action: 'verifyTelegramAuthData', authData)
        GAS->>GAS: HMAC-SHA256(botToken, dataCheckString)
    end

    GAS->>Sheets: Query Users Table for matched identity
    alt Account Not Found or Status == 'pending'
        GAS-->>Browser: { status: 'pending', message: 'រង់ចាំការអនុម័ត' }
        Browser->>User: Display Pending Approval Screen (#pendingApprovalScreen)
    else Account Status == 'suspended' or 'disabled'
        GAS-->>Browser: { status: 'denied', message: 'គណនីត្រូវបានផ្អាក' }
        Browser->>User: Display Access Denied Screen (#accessDeniedScreen)
    else Account Approved
        GAS->>Sheets: Create Session in SESSIONS Table (12h TTL)
        GAS->>Sheets: Write AUDIT_LOGS (LOGIN_SUCCESS)
        GAS-->>Browser: { status: 'success', sessionToken, userProfile, permissions }
        Browser->>Browser: Store sessionToken in sessionStorage
        Browser->>Browser: window.loadDashboard() (Render Role Dashboard)
        Browser->>User: Display Role-Specific Dashboard
    end
```

---

## 4. Event-Driven Dynamic Recalculation Flow

```mermaid
sequenceDiagram
    autonumber
    actor Teacher as Homeroom Teacher
    participant UI as Scores Entry Grid
    participant Bus as window.CMSEventBus
    participant Orch as window.CMSOrchestrator
    participant Dash as Dynamic Dashboard
    participant Backend as GAS & Google Sheets

    Teacher->>UI: Save Monthly Exam Scores
    UI->>Bus: emit(SCORE_UPDATED, { grade, room, month })
    Bus->>Orch: handleDownstreamAction(SCORE_UPDATED)
    Orch->>Orch: Recalculate Class Total, Average & GPA
    Orch->>Orch: Re-rank Students (1 to N) & Assign Letter Grades (A-F)
    Orch->>Dash: Invalidate Honor Roll & Refresh Top 5
    Bus->>Backend: apiPost('emitEvent', SCORE_UPDATED)
    Backend->>Backend: recalculateScoresAndRankings()
    Backend->>Backend: Write to EVENT_QUEUE & AUDIT_LOGS
    UI-->>Teacher: Instant UI update with toast confirmation (0ms latency)
```
