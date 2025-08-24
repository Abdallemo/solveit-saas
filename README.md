
# SolveIt – SaaS-Based Student Job Board for UTHM

**SolveIt** is a comprehensive SaaS platform designed exclusively for **UTHM students**, enabling academic collaboration and peer-to-peer task solving with secure payments, AI-powered moderation, and a structured workspace.  
<img width="1910" height="1023" alt="image" src="https://github.com/user-attachments/assets/f32c76d1-acba-4b37-ab0d-71ae2061e0f6" />
<img width="1900" height="1015" alt="image" src="https://github.com/user-attachments/assets/e4c08f6e-7d4f-45c4-8017-6be7d02a093e" />

---

## 🌟 Highlights

- [x] Multi-role platform: **Poster**, **Solver**, **Moderator**, **Admin**  
- [x] **Subscription-based access** via Stripe (Solver features gated by tier)  
- [x] **Real-time task updates and messaging** using WebSockets  
- [x] **AI-powered moderation** to prevent cheating and toxic content  
- [x] **Structured workspace** for solution uploads  
- [x] **Escrow-based payments** with automated release or moderator intervention  
- [x] Modular, maintainable folder structure for scalability  

---

## 🚀 Features Overview

### Task Management
- [x] Posters can create, edit, delete tasks (title, description, category, deadline, budget)  
- [x] Attach **files (PDFs, images)**  
- [x] Solvers can browse, search, filter, and request tasks  
- [x] Posters can assign tasks, monitor progress, and leave feedback  
- [x] Task status flow: `Open → In Progress → Completed`  

### Admin & Moderation
- [x] View users & roles  
- [x] Promote/demote to Moderator  
- [x] Suspend or soft-ban accounts  
- [ ] Moderators can review flagged tasks  
- [x] Analytics dashboards (task completion, platform usage, user activity)  

### Payments & Escrow
- [x] Hold payments in escrow until Poster approval  
- [x] Auto-release if Poster is unresponsive  
- [ ] Dispute resolution workflow via Moderators  
- [x] Subscription management via Stripe  

### Real-Time & Notifications
- [x] Live messaging between Posters and Solvers  
- [x] Task progress and deadline alerts  
- [ ] System error notifications to Admins  

### Mentoring (Future / PSM2)
- [ ] Solvers can offer mentoring/tutoring  
- [ ] Posters can book mentoring sessions (chat + video)  

### AI Integrations (PSM2)
- [ ] Automatic task category classification  
- [ ] Content moderation (toxicity & cheating detection)  
- [ ] AI mentoring guidance  

---

## 🗂 Tech Stack

| Layer           | Technology                           |
|-----------------|-------------------------------------|
| Frontend        | Next.js (App Router)                 |
| Backend         | Node.js, Go (WebSockets & APIs)     |
| Database        | PostgreSQL + Drizzle ORM             |
| Authentication  | NextAuth.js                          |
| Payments        | Stripe (Subscriptions & Escrow)     |
| AI              | OpenAI API (Moderation, Classification) |
| Deployment      | Railway                              |
| PM Tools        | Notion, Instagantt, GitHub Projects |

---

## 📂 Folder Structure (Simplified)

```

src/
├── app/
│   ├── marketing/
│   ├── dashboard/
│   ├── api/
│   │   ├── auth/
│   │   ├── tasks/
│   │   ├── payments/
├── components/
├── features/
│   ├── auth/
│   ├── tasks/
│   ├── ai/
│   ├── users/
│   ├── notifications/
├── lib/
├── db/ (Drizzle config + migrations)

````

---

## ⚙️ Development Status

### Core Modules
- [x] Authentication & Email Verification  
- [x] Role Management (Poster/Solver/Moderator/Admin)  
- [x] Subscription Module (Stripe)  
- [ ] Task Posting & Application  
- [ ] Task Assignment & Completion Workflow  
- [ ] Escrow & Refund Management (partial)  
- [x]/[ ] Real-time Chat & Notifications (partial)  
- [ ] AI Moderation & Classification  
- [ ] Mentoring System (Chat + Video)  
- [ ] Admin Analytics & Reporting  

> See `docs/progress.md` for detailed functional requirements tracking (PSM1 + PSM2).  

---

## 📋 Functional Scope

SolveIt implements **19 core functional requirements** for academic freelancing:

- [x] User accounts & role-based permissions  
- [x] Task posting with attachments  
- [x] Subscription-based Solver access  
- [x] Real-time notifications & messaging  
- [x] Structured workspace for solutions  
- [x] Escrow-based payments & dispute resolution  
- [ ] AI-powered moderation & classification (PSM2)  
- [ ] Admin dashboards & analytics  
- [ ] Mentoring features (future expansion)  

**Additional Enhancements:**
- [ ] Monaco editor integration (code viewer/editor)  
- [ ] PDF viewer & 3D model viewer  
- [ ] AI task guidance & mentoring assistance  

---

## ⚡ Usage

```bash
# Clone the repository
git clone https://github.com/yourusername/solveit.git

# Install dependencies
cd solveit
npm install

# Configure environment variables (.env)
cp .env.example .env

# Run development server
npm run dev

# Visit in browser
http://localhost:3000
````

---

Do you want me to do that next?
```
