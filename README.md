# SkillNest – Open Course-ware and Technical Skill Development Platform

![Group](https://img.shields.io/badge/Group-Group%20B-blue)
![Course](https://img.shields.io/badge/Course-SWT22022-green)
![Stack](https://img.shields.io/badge/Stack-MERN-orange)
![Status](https://img.shields.io/badge/Project-CA1-indigo)

**SkillNest** is a web-based Open Course-ware and Technical Skill Development Platform developed using the MERN stack (MongoDB, Express.js, React.js, and Node.js).

The platform provides a centralized learning environment where learners can explore courses, access educational materials, practice programming, participate in hackathon challenges, complete quizzes, and engage in academic discussions.

This project is developed as the CA1 Group Assignment for **SWT22022 – Practical for Internet Application Development**.

---

## University Information

**South Eastern University of Sri Lanka**  
**Faculty of Technology**  
**Department of Information and Communication Technology**

| Detail | Information |
|---|---|
| Course Code | SWT22022 |
| Course Name | Practical for Internet Application Development |
| Assignment | CA1 Group Project |
| Group | Group B |
| Project Name | SkillNest |
| Project Type | MERN Stack Web Application |

---

## Project Objectives

The main objectives of SkillNest are:

- Provide an organized platform for open online learning.
- Allow instructors to create and manage educational courses.
- Support multiple learning material formats.
- Provide an interactive programming playground.
- Encourage practical learning through hackathon challenges.
- Evaluate learner knowledge through quizzes and assessments.
- Support communication through discussion forums and Q&A.
- Provide administrative course approval and management facilities.

---

## Main System Modules

SkillNest consists of six major functional areas.

### Module 01 – Course & Learning Material Management

**Main functionality:**

- Course creation, editing, and deletion.
- Course category and difficulty management.
- Curriculum and topic organization.
- Learning material management.
- Video lectures and external video links.
- Markdown-based lecture notes.
- Programming code snippets and solutions.
- PDF documents and external references.
- Course submission for administrator approval.
- Learner course catalog and course details.

### Module 02 – Instructor & Course Approval Management

**Main functionality:**

- Instructor application management.
- Instructor application review.
- Course approval and rejection.
- Administrator dashboard.
- Course review feedback.
- Approval history management.
- Role-based administrative access.

### Module 03 – Interactive Code Playground

**Main functionality:**

- Online programming environment.
- Interactive code editor.
- Programming practice.
- Code execution and output display.
- Support for programming exercises.
- Improve practical programming skills.

### Module 04 – Hackathon Challenge Management

**Main functionality:**

- Create and manage hackathon challenges.
- Display available challenges.
- View individual challenge details.
- Learner challenge participation.
- Submit challenge solutions.
- Manage learner submissions.
- Instructor challenge dashboard.

### Module 05 – Quiz & Assessment Management

**Main functionality:**

- Create and manage quizzes.
- Multiple-choice questions.
- Online assessments.
- Learner quiz participation.
- Automatic marking where supported.
- Display assessment results and scores.

### Module 06 – Discussion Forum & Q&A

**Main functionality:**

- Create academic discussions.
- Ask technical questions.
- Share knowledge and solutions.
- Reply to discussions.
- Support learner collaboration.
- Encourage peer-to-peer learning.

---

## Technology Stack

### Frontend

- React.js 18
- Vite
- Tailwind CSS
- JavaScript
- React Router DOM

### Backend

- Node.js
- Express.js
- RESTful API architecture
- JWT Authentication
- Role-Based Access Control (RBAC)

### Database

- MongoDB
- Mongoose ODM

### Development Tools

- Visual Studio Code
- Git
- GitHub
- Postman
- npm

---

## System Architecture

SkillNest follows the MERN stack architecture.

```text
              SkillNest Platform
                      |
              React.js Frontend
                      |
              React Router DOM
                      |
              Express.js REST API
                      |
                Node.js Backend
                      |
                Mongoose ODM
                      |
                 MongoDB
```

### User Roles

The platform supports three main user roles:

| Role | Responsibilities |
|---|---|
| Admin | Manage users, instructor applications, and course approvals |
| Instructor | Create courses, manage learning materials, and challenges |
| Learner | Explore courses, access materials, practice coding, and participate in activities |

---

## Database Overview

The application uses MongoDB to store platform information.

Main database entities include:

| Collection | Purpose |
|---|---|
| Users | User accounts, authentication, and roles |
| Courses | Course information and metadata |
| CourseStructures | Course topics and curriculum |
| LearningMaterials | Videos, notes, code, and documents |
| Challenges | Hackathon challenge information |
| Submissions | Learner challenge submissions |
| Quizzes | Quiz and assessment information |
| Questions | Assessment questions |
| Discussions | Forum discussions and Q&A |

*The final collection structure depends on the implemented backend modules.*

---

## Project Folder Structure

```text
SkillNest/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── seeders/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── .gitignore
├── README.md
└── package.json
```


---

## Installation and Setup

### Prerequisites

Install the following software:

- Node.js (v18 or higher)
- npm
- MongoDB (local installation or MongoDB Atlas)
- Git
- Visual Studio Code

### 1. Clone the Repository

```bash
git clone https://github.com/RusiruCH/skillnest.git
```

Navigate into the project directory:

```bash
cd skillnest
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Configure the backend environment variables in a `.env` file.

Example:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/skillnest
JWT_SECRET=your_secret_key
```

Run the backend server:

```bash
npm run dev
```

Backend server:

```text
http://localhost:5000
```

If the seed script is configured, sample data can be added using:

```bash
npm run seed
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the frontend application using the URL displayed by Vite.

Default URL:

```text
http://localhost:5173
```

Note: Vite may use another available port, such as 5174, if the default port is already occupied.

---

## GitHub Repository

**Main Repository:**

https://github.com/RusiruCH/skillnest

**Main Branch:**

`main`

The `main` branch contains the integrated project source code.

### Development Workflow

Group members should follow this workflow when contributing:

1. Create a separate feature branch.
2. Develop the assigned module.
3. Commit and push changes to GitHub.
4. Create a Pull Request into `main`.
5. Review and approve the changes.
6. Merge the completed contribution into the main branch.

Example feature branch:

```bash
git checkout -b feature/member-01-course-management
```

Push the branch:

```bash
git push -u skillnest feature/member-01-course-management
```

---

## Project Team

**Group B – SkillNest Development Team**

This project is developed collaboratively by the students of the Department of Information and Communication Technology, Faculty of Technology, South Eastern University of Sri Lanka.

| Member | Name / Registration |
|---|---|
| Member 01 – Group Leader | L.M.R.C. Bandara – SEU/IS/22/ICT/113 |
| Member 02 | Group Member 02 | W.M.A.P.S.ABEYRATHNE - SEU/IS/22/ICT/078 |
| Member 03 | Group Member 03 | B.S.D.P.WICKRAMASINGHA - SEU/IS/22/ICT/013|
| Member 04 | Group Member 04 | H.A.K.MADUSHAN - SEU/IS/22/ICT/022 |
| Member 05 | Group Member 05 | R.D.T.S.KARUNARATHNA - SEU/IS/22/ICT/087 |
| Member 06 | Group Member 06 | G.K.M.K.J.KAUSHALYA - SEU/IS/22/ICT/061 |

---

## Expected Project Outcomes

Through the development of SkillNest, the group aims to:

- Develop a practical MERN stack web application.
- Improve full-stack web development knowledge.
- Apply database design and REST API concepts.
- Implement authentication and authorization.
- Develop collaborative software engineering skills.
- Understand Git and GitHub version control.
- Create an integrated technical learning platform.

---

## Acknowledgement

We would like to express our sincere gratitude to the Department of Information and Communication Technology, Faculty of Technology, South Eastern University of Sri Lanka, and our lecturers for providing the guidance and opportunity to develop this group project.

---

## License

This project is developed for academic purposes as part of the SWT22022 – Practical for Internet Application Development CA1 Group Assignment.

**Developed by Group B – SkillNest Team.**
