# SolveIt – Progress & Requirements (PSM1 + Planning)

This document tracks SolveIt’s progress. It distinguishes **core Functional/User/Model requirements** (must-have for FYP) from **additional enhancements** (nice-to-have/bonus).

**Status Legend**

- [x] Done
- [ ] ⏳ Partial / In progress
- [ ] Not started

---

## A) Core Functional/User/Model Requirements (FYP Scope)

### A.1 Task Management

- [x] **FR-TM-1**: Poster can create a task (title, description, category, deadline, budget).
- [x] ~~**FR-TM-2**: Auto-classify task category via AI.~~
- [x] **FR-TM-3**: Posters can attach files (PDFs, images).
- [x] **FR-TM-4**: Posters can view all their posted tasks.
- [x] **FR-TM-5**: Posters can update/delete an unassigned task.
- [x] **FR-TM-6**: Solvers (with active subscriptions) can browse public tasks.
- [x] **FR-TM-7**: Solvers can request/pitch to pick a task.
- [x] **FR-TM-8**: Posters can review requests and assign a solver.
- [x] **FR-TM-9**: Task status flow (Open → In Progress → Completed).
- [x] **FR-TM-10**: Posters can mark completed & leave feedback.
- [x] **FR-TM-11**: Solvers can view assigned tasks & track progress.

### A.2 Admin Management

- [x] **FR-AM-1**: Admin can view all users & roles.
- [x] **FR-AM-2**: Admin can promote/demote to Moderator.
- [x] **FR-AM-3**: Admin can soft-ban/suspend accounts.
- [x] **FR-AM-4**: Admin can view all tasks & statuses.
- [ ] ⏳ **FR-AM-5**: Moderators can view/manage flagged/reported tasks (basic stub present).

### A.3 Escrow & Refunds

- [x] **FR-ER-1**: Hold payments in escrow until Poster approves.
- [x] **FR-ER-2**: Auto-release if Poster is unresponsive after timeout.
- [x] **FR-ER-3**: Disputed payments held pending Moderator review (holding logic exists; review flow/UI not finished).
- [x] **FR-ER-4**: Posters can request a refund (basic implemented).
- [x] **FR-ER-5**: Moderators can issue **full/partial** refunds with final decision.

### A.4 Real-Time & Notifications

- [x] **FR-RN-1**: Real-time new message notifications.
- [x] **FR-RN-2**: Real-time task updates & deadline alerts.
- [x] **FR-RN-3**: Real-time system error push to Admins (Winston + API ~90%).

### A.5 Mentoring ()

- [x] **FR-ME-1**: Solvers can offer mentoring/tutoring services.
- [x] **FR-ME-2**: Posters can book mentoring sessions (chat + video).

### A.6 Subscription

- [x] **FR-SB-1**: Feature access gated by subscription tier.
- [x] **FR-SB-2**: Users can upgrade/downgrade plans.

### A.7 Authentication & Access Control

- [x] **FR-AU-1**: Secure registration & login.
- [x] **FR-AU-2**: Role-based permissions enforced post-login.

### A.8 Admin Moderation & Platform Health (PSM1/)

- [x] **FR-AP-1**: Admins can manage disputes & monitor activity (dispute finalization pending).
- [x] **FR-AP-2**: System settings & health monitoring (monitoring mostly done; settings basic).
- [x] **FR-AP-3**: Analytics/statistical reporting dashboards.

### A.9 Solver Dashboard

- [x] **FR-SD-1**: Browse available tasks.
- [x] **FR-SD-2**: Manage accepted tasks & track completion.
- [x] **FR-SD-3**: Search/sort/filter tasks.

### A.10 Workspace & Solution Management

- [x] **FR-WS-1**: Structured workspace for solution uploads.
- [x] **FR-WS-2**: File/version updates per task.

---

## B) “19-Point” Requirement List (Cross-check)

1. [x] All users must have an account (email/password).
2. [x] Posters can create, edit, delete tasks.
3. [x] Posters deposit funds to escrow when posting.
4. [x] AI category suggestions on posting.
5. [x] Posters can review submissions & **accept/dispute** within a timeframe (accept is done; dispute path partially wired).
6. [x] Posters can request refunds / escalate disputes to Admin.
7. [x] Posters choose public/private when creating tasks.
8. [x] Solvers can search/sort/filter tasks.
9. [x] Solvers can browse & accept tasks via dashboard.
10. [x] Solvers work in a structured workspace & upload solutions.
11. [x] Solvers monitor progress & earnings.
12. [x] Solvers receive payments to wallet after approval.
13. [x] Solvers can offer mentoring/guidance.
14. [x] All users get real-time notifications (progress, messages, deadlines).
15. [x] Admins manage users, monitor activity, handle disputes (dispute finalization pending).
16. [x] Admins process full/partial refunds based on dispute outcomes.
17. [x] Admins generate system reports/analytics.
18. [x] Admins can manually cancel/refund subscriptions.
19. [x] Admins can configure AI moderation rules.

---

## C) Additional Enhancements (My Add-Ons)

> These are **not** required by the FYP spec; they’re extra polish/engineering work.

### C.1 System Monitoring & DX

- [x] Winston logging integration.
- [x] ⏳ Real-time error streaming API to Admin (≈90% complete).
- [x] Auto-save to draft for task posting.
- [x] Full payment status handling (e.g., `hold`, `released`, timeout logic).

### C.2 Advanced Viewers & Tools

- [x] Monaco editor integration (code viewer/editor).
- [ ] PDF viewer.
- [ ] 3D model viewer.

### C.3 AI & Matching

- [x] AI task categorization & skill matching ( scope).
- [x] AI content moderation rule set + configurable thresholds.

### C.4 Comms & UX

- [x] Session logging/history for mentoring.
- [x] Call quality stats & reconnection logic.
- [x] Nice-to-have: email notifications alongside in-app.

---

## D) Snapshot Summary

- **Done:** Many PSM cores — Auth, Posting, Escrow (hold + auto-release), Workspace, Solver Dashboard, Subscriptions, most Admin basics, real-time notifications.
- **Partial:** Refund workflow (user request + hold done; mod decision UI/flow pending), Dispute handling, Admin monitoring/health, Error streaming (≈90%), Moderator tooling stubs.
- **Not Started:** Mentoring (chat/video), AI features (categorization/moderation/mentoring), Analytics reports, Admin subscription refunds/cancellations, full moderator refund decisions.

---

## E) Notes

- Mentoring (chat + video) and OpenAI integrations are ** priorities**; once done, you’ll have ample time to add Monaco/PDF/3D viewers and polish.
- Keep this file in the repo (e.g., `docs/progress.md`) and update checkboxes as you ship features.
