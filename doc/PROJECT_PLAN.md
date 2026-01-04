# Project Plan: NoteHub

## Project Timeline & Milestones

### Phase 1: Planning & Repository Setup (Due: 16.11.2025)

**Objective:** Define scope, architecture, and initialize version control.

- [x] Create Git Repository.
- [x] Define Project Specifications (`SPECIFICATIONS.md`).
- [x] Create Project Plan (`PROJECT_PLAN.md`).
- [x] Initialize Node.js project structure (`package.json`, folder hierarchy).
- [x] Initialize React project structure.

### Phase 2: Backend Implementation (Due: 06.12.2025)

**Objective:** A fully functional RESTful API connected to the database.

#### Week 1: Database & Auth

- [x] Setup MariaDB database connection.
- [x] Configure Sequelize ORM.
- [x] Define User and Note models.
- [x] Implement Registration (with `@stud.ase.ro` regex validation).
- [x] Implement Login (JWT generation).

#### Week 2: Core Logic & API

- [x] Implement CRUD endpoints for Notes (GET, POST, PUT, DELETE).
- [x] Implement filtering logic (by course/tag).
- [x] External Service: Implement YouTube API integration route.

#### Week 3: Testing & Documentation

- [] Test all endpoints with Postman.
- [x] Write API documentation (simple README instructions).
- [x] Milestone Delivery: Submit repository link with functional Backend.

### Phase 3: Frontend Implementation (Dec 2025 - Jan 2026)

**Objective:** Develop the User Interface and connect it to the API.

#### Week 4: UI Skeleton

- [x] Setup React Router.
- [x] Create Login/Register pages.
- [x] Create Dashboard Layout (Sidebar + Main Content).

#### Week 5: The Editor

- [x] Implement Markdown Editor component.
- [x] Connect Frontend to Backend (`GET /notes` and `POST /notes`).
- [x] Implement Note viewing and deletion.

#### Week 6: Advanced Features

- [x] Add support for Tagging and Course selection.
- [x] Implement the "Add YouTube Reference" UI.
- [x] Implement Study Groups UI.

### Phase 4: Refinement & Deployment (Final Tutorial)

**Objective:** Polish the application and deploy to the cloud.

- [x] Bug Fixing: Ensure all edge cases are handled.
- [x] Styling: Finalize CSS/Bootstrap design for mobile responsiveness.
- [] Deployment:
  - Deploy Database
  - Deploy Backend
  - Deploy Frontend
- [ ] Demo Prep: Prepare presentation for the final laboratory.

## Risk Management

- **API Limits:** YouTube API has daily quotas. Mitigation: Cache results in our database to minimize external calls.
- **Complexity:** Group sharing logic can get complex. Mitigation: If time runs out, simplify to "Public/Private" notes instead of specific groups.
