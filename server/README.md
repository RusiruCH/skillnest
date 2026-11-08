# SkillNest Backend API - Module 1: Course & Learning Material Management

**Developed by:** L.M.R.C.BANDARA (Registration No: `SEU/IS/22/ICT/113`)  
**Department of Interdisciplinary Studies, Faculty of Applied Sciences, South Eastern University of Sri Lanka**  
**Course:** SWT22022 Practical for Internet Application Development  

---

## 📌 Module Overview
Module 1 provides full-stack functionality for:
1. **Course Lifecycle Management**: Creating, updating, deleting courses, and managing their status (`draft`, `pending_approval`, `approved`, `rejected`).
2. **Curriculum & Structure Organization**: Organizing courses into sequential topics/units with estimated study durations.
3. **Multi-format Learning Materials**: Attaching videos (streaming/external), PDF documents, rich markdown lecture notes, and source code exercises to topics.
4. **Approval Workflow Integration**: Enables instructors to submit completed courses for administrator review (integrates with Module 02).
5. **Learner Discovery & Access**: Public catalogue search, category filtering, syllabus breakdown, and reading/viewing room.

---

## ⚙️ Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens) & bcryptjs
- **File Uploads:** Multer with file type & size validation

---

## 🚀 Quick Setup & Installation

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/skillnest_db
JWT_SECRET=skillnest_jwt_secret_key_member01_bandara_2026
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### 3. Seed Sample Data
Populate the database with pre-configured users (Instructor, Learner, Admin) and comprehensive courses with topics and materials:
```bash
npm run seed
```

### 4. Start the Server
```bash
# Development mode with nodemon
npm run dev

# Or standard production start
npm start
```

---

## 📡 REST API Documentation

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new Learner or Instructor |
| POST | `/api/auth/login` | Public | Authenticate user & retrieve JWT token |
| GET | `/api/auth/me` | Private | Retrieve logged-in user profile |

### 📚 Course Management (`/api/courses`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/courses` | Public | List approved courses with search, category, and level filters |
| GET | `/api/courses/categories` | Public | Get available categories with approved course counts |
| GET | `/api/courses/my-courses` | Instructor | List all courses owned by current instructor |
| GET | `/api/courses/stats/summary`| Instructor | Get metrics summary for instructor dashboard |
| GET | `/api/courses/:id` | Public/Private | Retrieve course syllabus, topics, and materials |
| POST | `/api/courses` | Instructor | Create new course in `draft` mode |
| PUT | `/api/courses/:id` | Instructor/Admin | Update course metadata |
| DELETE | `/api/courses/:id` | Instructor/Admin | Delete course and cascade delete topics & materials |
| PATCH | `/api/courses/:id/submit` | Instructor | Submit course for administrator approval |
| PATCH | `/api/courses/:id/status` | Admin | Approve or reject course (Module 02 contract) |

### 📑 Course Structures / Topics (`/api/courses/:courseId/topics` & `/api/topics`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/courses/:courseId/topics` | Public | List all topics ordered by syllabus order |
| POST | `/api/courses/:courseId/topics` | Instructor | Add topic to course |
| PUT | `/api/courses/:courseId/topics/reorder` | Instructor | Batch reorder syllabus topics |
| PUT | `/api/topics/:id` | Instructor | Update topic title and description |
| DELETE | `/api/topics/:id` | Instructor | Delete topic and its materials |

### 📂 Learning Materials (`/api/topics/:topicId/materials` & `/api/materials`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/topics/:topicId/materials` | Public | Get materials for a topic |
| POST | `/api/topics/:topicId/materials` | Instructor | Add material (video, document, notes, code) |
| GET | `/api/materials/:id` | Public | Get single material details |
| PUT | `/api/materials/:id` | Instructor | Update material details or file |
| DELETE | `/api/materials/:id` | Instructor | Delete material |

