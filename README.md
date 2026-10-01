# Filipino Sign Language (FSL) Workshop System

A modern, accessible full-stack web application designed for enrolling in and managing Filipino Sign Language (FSL) workshops. The platform provides unified class scheduling, simulated enrollment and payment verification, attendance tracking, coursework submissions, learning materials, community news, merchandise catalog, and learner progression pathways.

Built specifically with accessibility in mind for the Deaf and FSL community, featuring high-contrast WCAG AAA UI and specialized slow-motion video playback controls.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router) + React 18 + TypeScript
- **Styling:** Tailwind CSS (Accessible high-contrast palette)
- **Database:** Dual Engine — Embedded SQLite (`better-sqlite3` in `data/fsl_workshop.db`) + Supabase PostgreSQL support
- **State & Data Management:** Direct SQLite query repository (`src/lib/sqlite/`), Unified REST API (`/api/sqlite`), and reactive client store
- **Testing:** Native Node.js test runner + Comprehensive E2E Test Suite (48 unit/integration tests, 37 E2E tests)

---

## 🌟 Key Features by Role

### 1. 📚 Learner / Participant
- **Workshop Catalog:** Browse Level 1 (Foundations), Level 2 (Conversational Fluency), and Level 3 (Immersion) workshops with real-time slot tracking.
- **Simulated Checkout:** One-click simulated payment modal (GCash, Maya, Bank Transfer) with reference recording.
- **My Classes:** Active cohort view with direct Zoom / Google Meet join links, announcements, and personal attendance history.
- **Coursework:** Submit assignment files/video links and review professor grades (0–100) and written feedback.
- **Learning Hub & Video Library:** Study handouts and an accessible video player with 0.5x/0.75x slow motion and gesture looping across 6 official categories (*Alphabet/Fingerspelling, Greetings, Numbers, Common Expressions, Conversations, Vocabulary*).
- **FSL Progression:** Visual level roadmap with certificate readiness indicators and academic pathway cards for **Benilde SDEAS BSLI** (Bachelor in Sign Language Interpretation) and **Applied Deaf Studies**.

### 2. 🎓 Professor / Teacher
- **Class Schedules:** Assigned cohorts overview with editable Zoom and Google Meet links.
- **Session Attendance:** Roster grid with one-click attendance marking (`Present`, `Absent`, `Late`, `Excused`) and remarks.
- **Assignment Management:** Create assignments with instructions and deadlines; evaluate student submissions with numerical grades and feedback.
- **Materials & Videos:** Publish study resources and FSL tutorial signing videos organized by level.
- **Class Announcements:** Broadcast updates to enrolled students.

### 3. 💼 Administrator
- **Workshops & Schedules:** Create/edit workshops, set class capacity, schedule dates, assign professors, and set meeting links.
- **User Directory:** Filter and manage users by role (`learner`, `professor`, `admin`).
- **Payment Verification:** Review pending learner payments and verify transactions to automatically confirm enrollments.
- **Financial Reports:** Real-time revenue analytics (₱), level breakdown, and transaction ledgers.

### 4. 🌐 Community & Commerce
- **Direct Messaging (`/messages`):** Threaded chat between learners, professors, and admin with unread badges.
- **SDEAS News & Events (`/news`):** School of Deaf Education & Applied Studies news, Benilde Deaf Festival events, and FSL accessibility accommodation badges.
- **Merchandise Store (`/merchandise`):** FSL apparel, tote bags, pins, and hoodies with real-time stock counters and simulated inquiry modals.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or 20+
- npm

### Installation & Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/denricaisamson/cpe-laws-ni-den.git
   cd cpe-laws-ni-den
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Initialize SQLite Database (All 14 Tables + Demo Seed Data):**
   ```bash
   npm run db:init
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Demo Quick Sign-In:**
   Navigate to `/login` and use the **Demo Role Banner** to test any role (**Admin**, **Professor**, or **Learner**) with a single click.

---

## 🧪 Testing & Verification

- **Run all unit & integration tests:**
  ```bash
  npm test
  ```
- **Run the complete E2E test suite:**
  ```bash
  node tests/runner.js
  ```
- **Typecheck:**
  ```bash
  npm run typecheck
  ```
- **Build for production:**
  ```bash
  npm run build
  ```
