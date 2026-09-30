# FSL Workshop System - Official Specification & Reference (RAG Source)

## Overview & System Description
The FSL Workshop System is a centralized, integrated online platform designed for individuals who want to enroll in Filipino Sign Language (FSL) workshops. It provides learners, professors, and administrators with one unified system for managing classes, schedules, payments, learning materials, communication, and FSL community activities.

The platform serves not only for administration but also as an actual FSL learning resource, where professors and authorized admins can continuously build a library of signing tutorials for learners.

---

## 1. Learner / Participant

### Core Capabilities:
- Create an account and register.
- Enroll in FSL Level 1, Level 2, or Level 3.
- Choose their preferred available schedule.
- View workshop fees and make payments (simulated payments).
- View payment status, balances, and transaction history.
- View their classes, schedules, and meeting links.
- Attend online meetings (Zoom / Google Meet links).
- View announcements from their professors or administrators.
- Submit assignments.
- View their attendance and grades.
- Chat or communicate with their professors (direct messages).
- Access learning materials and resources.

### Tutorial Videos:
Learners can watch FSL tutorial and signing videos uploaded by professors or administrators, categorized and organized by FSL Level (Level 1, 2, 3):
- Alphabet / Fingerspelling
- Basic Greetings
- Numbers
- Common Expressions
- Everyday Conversations
- Vocabulary Lessons

### Learner User Flow:
1. Register
2. Choose FSL Level
3. Choose Schedule
4. Enroll & Pay (Simulated payment)
5. Access Class
6. Attend Meetings
7. Watch Tutorial Videos / Study Materials
8. Submit Assignments
9. View Attendance & Grades
10. Complete FSL Level
11. View Next Opportunities

---

## 2. Professor / Teacher

### Core Capabilities:
- View their assigned learners.
- Check and record attendance.
- Upload learning materials.
- Upload FSL tutorial/signing videos (with title, category, video URL / embed).
- Create and post assignments with due dates and instructions.
- Check submitted assignments.
- Give grades and written feedback.
- Set or update meeting schedules and links (Zoom / Google Meet).
- Post class announcements.
- Communicate with learners through chat.
- Monitor learner progress.

### Professor User Flow:
1. Login
2. Manage Class
3. Check Attendance
4. Upload Materials & Tutorial Videos
5. Post Assignments
6. Check Submissions
7. Give Grades & Feedback
8. Post Announcements / Set Meetings

---

## 3. Administrator

### Core Capabilities:
- Manage learners and professors (user profiles and roles).
- Create and manage FSL workshops (Level 1, Level 2, Level 3 offerings, fees, descriptions).
- Create available schedules and control class slots.
- Monitor enrollments.
- Monitor payments and balances.
- Verify transactions and payments (mark verified, confirm enrollment).
- View financial reports (total revenue, breakdown by workshop/schedule).
- Manage announcements and news.
- Upload FSL tutorial videos and other learning resources.
- Post upcoming events and activities.
- Manage FSL-related information and opportunities.
- View overall activities of the system.

### Admin User Flow:
1. Login
2. Manage Users & Workshops
3. Manage Schedules & Enrollment
4. Monitor Payments & Transactions
5. Manage News & Events
6. Upload Tutorial Videos
7. Generate Reports & Monitor Activities

---

## 4. FSL News and Community

Information hub for the FSL and Deaf community containing:
- SDEAS (School of Deaf Education and Applied Studies) news
- Deaf Festival announcements
- Upcoming FSL events
- Seminars and workshops
- Information about Deaf organizations
- Committee and officer profiles
- Profiles of Deaf teachers
- Community activities
- FSL-related opportunities

---

## 5. Merchandise

Simple merchandise showcase displaying:
- FSL shirts
- Bags
- Pins
- Other FSL-related products
Displays product name, price, availability, and stock.

---

## 6. FSL Progression

Tracks and displays learner journey:
- Progression roadmap: **FSL Level 1 → Level 2 → Level 3**
- Post-completion pathways: Information about possible next opportunities, such as:
  - **BSLI** (Bachelor in Sign Language Interpretation)
  - **Applied Deaf Studies** (subject to official program requirements)

---

## 7. Technical Guidelines & Shortcuts (from Project Rules)
- Next.js App Router, React, TypeScript, Tailwind CSS, Supabase (Auth, DB, Storage).
- Online meetings: Professor/admin pastes a Zoom or Google Meet link; learners see and click it.
- Chat with professor: Simple messages table (`sender_id`, `receiver_id`, `body`, `created_at`).
- Tutorial videos: Upload to Supabase Storage or paste video link (YouTube / video URL).
- Payments: Simulated "Pay" button recording a transaction, admin marks it "Verified".
- Financial reports: Dedicated page with total revenue and transaction breakdown table.
- Accessible UI: High contrast, readable typography, clear visual hierarchy suited for the Deaf and FSL community.
