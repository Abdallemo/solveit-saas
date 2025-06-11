
# Functional Requirements – SolveIt PSM1

This document lists the functional requirements for the modules currently under development in the SolveIt system (PSM1 scope).
---

## 📦 Module: Task Management

**FR-TM-1**: The system shall allow a user with the Poster role to create a new task including title, description, category, deadline, and budget.

~~**FR-TM-2**: The system shall automatically classify a task's category using AI (PSM2).~~

**FR-TM-3**: The system shall allow Posters to attach files to tasks (e.g., PDFs, images).

**FR-TM-4**: The system shall allow Posters to view a list of all their posted tasks.

**FR-TM-5**: The system shall allow Posters to update or delete a task if it has not yet been assigned.

**FR-TM-6**: The system shall allow Solvers with active subscriptions to browse a public list of available tasks.

**FR-TM-7**: The system shall allow Solvers to request to pick a task, optionally with a message or proposal.

**FR-TM-8**: The system shall allow Posters to view all incoming task requests and assign a Solver.

**FR-TM-9**: The system shall update task status based on progress (e.g., Open → In Progress → Completed).

**FR-TM-10**: The system shall allow Posters to mark a task as completed and leave feedback for the Solver.

**FR-TM-11**: The system shall allow Solvers to view assigned tasks and track progress.

---

## 🛠 Module: Admin Management

**FR-AM-1**: The system shall allow an Admin to view all registered users and their roles.

**FR-AM-2**: The system shall allow an Admin to promote or demote users to Moderator.

**FR-AM-3**: The system shall allow an Admin to soft-ban or suspend a user account.

**FR-AM-4**: The system shall allow an Admin to view all posted tasks and their statuses.

**FR-AM-5**: The system shall allow Moderators to view and manage flagged or reported tasks (basic stub in PSM1).

---

## 📝 Notes

- Each FR maps to a route/controller/component in the system.
- Deferred features (e.g., AI classification, advanced moderation) will be completed in PSM2.
