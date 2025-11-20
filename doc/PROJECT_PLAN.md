# Project Plan: NoteHub

## Project Timeline & Milestones

### Phase 1: Planning & Repository Setup (Due: 16.11.2025)

**Objective:** Define scope, architecture, and initialize version control.

- [x] Create Git Repository.
- [x] Define Project Specifications (`SPECIFICATIONS.md`).
- [x] Create Project Plan (`PROJECT_PLAN.md`).
- [ ] Initialize Node.js project structure (`package.json`, folder hierarchy).
- [ ] Initialize React project structure.

### Phase 2: Backend Implementation (Due: 06.12.2025)

**Objective:** A fully functional RESTful API connected to the database.

#### Week 1: Database & Auth

- [ ] Setup MariaDB database connection.
- [ ] Configure Sequelize ORM.
- [ ] Define User and Note models.
- [ ] Implement Registration (with `@stud.ase.ro` regex validation).
- [ ] Implement Login (JWT generation).

#### Week 2: Core Logic & API

- [ ] Implement CRUD endpoints for Notes (GET, POST, PUT, DELETE).
- [ ] Implement filtering logic (by course/tag).
- [ ] External Service: Implement YouTube API integration route.

#### Week 3: Testing & Documentation

- [ ] Test all endpoints with Postman.
- [ ] Write API documentation (simple README instructions).
- [ ] Milestone Delivery: Submit repository link with functional Backend.

### Phase 3: Frontend Implementation (Dec 2025 - Jan 2026)

**Objective:** Develop the User Interface and connect it to the API.

#### Week 4: UI Skeleton

- [ ] Setup React Router.
- [ ] Create Login/Register pages.
- [ ] Create Dashboard Layout (Sidebar + Main Content).

#### Week 5: The Editor

- [ ] Implement Markdown Editor component.
- [ ] Connect Frontend to Backend (`GET /notes` and `POST /notes`).
- [ ] Implement Note viewing and deletion.

#### Week 6: Advanced Features

- [ ] Add support for Tagging and Course selection.
- [ ] Implement the "Add YouTube Reference" UI.
- [ ] Implement Study Groups UI.

### Phase 4: Refinement & Deployment (Final Tutorial)

**Objective:** Polish the application and deploy to the cloud.

- [ ] Bug Fixing: Ensure all edge cases are handled.
- [ ] Styling: Finalize CSS/Bootstrap design for mobile responsiveness.
- [ ] Deployment:
	- Deploy Database
	- Deploy Backend
	- Deploy Frontend
- [ ] Demo Prep: Prepare presentation for the final laboratory.

## Risk Management

- **API Limits:** YouTube API has daily quotas. Mitigation: Cache results in our database to minimize external calls.
- **Complexity:** Group sharing logic can get complex. Mitigation: If time runs out, simplify to "Public/Private" notes instead of specific groups.