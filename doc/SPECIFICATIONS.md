# Detailed Specifications: NoteHub

## 1. Project Overview

NoteHub is a web-based application designed to help students organize their academic life. It allows users to take notes, organize them by course, attach files, and collaborate with peers in study groups. The application focuses on a clean, distraction-free markdown editing experience and integrates external resources to enhance the studying process.

### 1.1 Target Audience

University students, specifically those with institutional accounts (@stud.ase.ro), who need a centralized platform for lecture notes and collaborative study.

## 2. Architecture & Technologies

### 2.1 High-Level Architecture

The application follows a standard Single Page Application (SPA) architecture:

- **Client:** A React.js application running in the browser.
- **Server:** A RESTful API built with Node.js.
- **Database:** A relational database (MariaDB) accessed via an ORM.
- **External Service:** Integration with the YouTube Data API to fetch video metadata for video-based learning notes.

### 2.2 Technology Stack

- **Frontend:** React.js (Component-based framework)
- **Routing:** React Router
- **State Management:** React Context API or Redux
- **Styling:** CSS Modules / Bootstrap CSS
- **Backend:** Node.js with Express.js
- **Database:** MariaDB
- **ORM:** Sequelize (for relational data mapping)
- **Version Control:** Git (GitHub)
- **Deployment:** Render or Railway (Free Tier) -> to be decided

## 3. Data Model (Relational Schema)

The application uses a relational database. Below are the core entities:

- **Users**
	- id (PK), email (Unique, must match @stud.ase.ro), password_hash, full_name, created_at.

- **Courses**
	- id (PK), name (e.g., "Web Technologies"), semester, teacher_name.

- **Notes**
	- id (PK), user_id (FK), course_id (FK), title, content (Text/Markdown), tags (String/JSON), is_public (Boolean), created_at, updated_at.

- **Attachments**
	- id (PK), note_id (FK), file_url, file_type (image/pdf).

- **StudyGroups**
	- id (PK), name, admin_user_id (FK), description.

- **GroupMembers (Junction Table)**
	- group_id (FK), user_id (FK), joined_at.

## 4. Functional Requirements

### 4.1 User Authentication & Profile

- Registration: Users must register using a valid @stud.ase.ro email address.
- Login: Secure login using JWT (JSON Web Tokens).
- Profile: View and edit basic user details.

### 4.2 Note Management (CRUD)

- Create: Users can create notes using a Markdown editor.
- Read: Users can view a list of notes filtered by Course, Date, or Tags.
- Update: Real-time or save-button based editing of note content.
- Delete: Remove notes permanently.
- Formatting: Support for bold, italic, lists, code blocks, and headers.

### 4.3 Organization & Search

- Categorization: Assign notes to specific "Courses".
- Tagging: Add keywords (tags) to notes for quick filtering.
- Search: Full-text search through note titles and content.

### 4.4 External Service Integration (YouTube)

- Scenario: A student is watching a tutorial on YouTube and wants to take notes linked to that video.
- Functionality: The user pastes a YouTube URL into the note. The backend calls the YouTube Data API to fetch the video title, thumbnail, and channel name, embedding a "reference card" at the top of the note.

### 4.5 Collaboration (Study Groups)

- Create Group: A user can start a study group.
- Invite: Add other users to the group (by email).
- Share: Users can share specific notes with their groups.

## 5. External API Specification

- **API:** YouTube Data API
- **Endpoint used:** GET https://www.googleapis.com/youtube/v3/videos
- **Purpose:** To enrich notes with metadata when a student is summarizing a video lecture.
- **Data Flow:** Frontend sends Video ID -> Backend calls Google API -> Backend returns Title/Description -> Frontend displays embedded info.

## 6. Security & Quality Standards

- Validation: All inputs (email, note content) sanitized on the backend.
- Auth: Passwords hashed using bcrypt. Routes protected via Middleware.
- Code Style: CamelCase for variables, meaningful commit messages, documented functions.
