# SkillNest – Member 05: REST API Documentation
## Module: Quiz & Assessment Management

**Student Name:** R.D.T.S. Karunarathna
**Student Registration Number:** `SEU/IS/22/ICT/087`
**Base URL:** `http://localhost:5000/api`
**Authentication Scheme:** HTTP Authorization Header: `Bearer <JWT_TOKEN>`

---

## Endpoint Summary Table

| Category | Method | Endpoint Path | Access / Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Quiz** | `GET` | `/quizzes` | Protected (All) | List quizzes (role-filtered catalog) |
| **Quiz** | `POST` | `/quizzes` | Protected (Instructor, Admin) | Create a new quiz |
| **Quiz** | `GET` | `/quizzes/:id` | Protected (All) | Get single quiz details with question count & populated course |
| **Quiz** | `PUT` | `/quizzes/:id` | Protected (Owner, Admin) | Update quiz metadata, timing, and course link |
| **Quiz** | `DELETE`| `/quizzes/:id` | Protected (Owner, Admin) | Delete quiz (cascades questions & attempts) |
| **Quiz** | `PATCH`| `/quizzes/:id/publish` | Protected (Owner, Admin) | Toggle published / draft status |
| **Questions**| `GET` | `/quizzes/:quizId/questions` | Protected (All) | Get ordered questions (sanitized for learners) |
| **Questions**| `POST`| `/quizzes/:quizId/questions` | Protected (Owner, Admin) | Add an MCQ question to quiz |
| **Questions**| `PATCH`| `/quizzes/:quizId/questions/reorder` | Protected (Owner, Admin) | Reorder questions via array of question IDs |
| **Questions**| `PUT` | `/quizzes/:quizId/questions/:questionId` | Protected (Owner, Admin) | Edit an existing question |
| **Questions**| `DELETE`| `/quizzes/:quizId/questions/:questionId` | Protected (Owner, Admin) | Delete question & update quiz total marks |
| **Attempts** | `POST`| `/attempts/start` | Protected (Learner, Owner) | Start new attempt or resume active in-progress attempt |
| **Attempts** | `POST`| `/attempts/:id/submit` | Protected (Attempt Owner) | Submit answers, auto-grade and finalize attempt |
| **Attempts** | `GET` | `/attempts/my` | Protected (Learner) | Retrieve authenticated learner's complete attempt history |
| **Attempts** | `GET` | `/attempts/:id` | Protected (Owner, Instructor) | Retrieve scored result breakdown and question review |
| **Analytics**| `GET` | `/quizzes/:quizId/attempts` | Protected (Owner, Admin) | Retrieve class analytics, KPIs, and submissions table |

---

## 1. Quiz Management Endpoints

### 1.1 List Quizzes
- **Method / Path:** `GET /quizzes`
- **Query Parameters:**
  - `scope=active`: Filters only currently open active quizzes.
  - `courseId=<id>`: Filters quizzes tied to a specific course.
- **Access:** Protected (Learners see published quizzes; Instructors see their own authored quizzes; Admins see all).
- **Response `200 OK`:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "6af0959cae094cf4cf724e5a",
      "title": "Fullstack React Architecture Assessment",
      "description": "Comprehensive evaluation of component lifecycles and backend APIs",
      "courseId": {
        "_id": "6af0959cae094cf4cf724e53",
        "title": "Fullstack React Architecture",
        "category": "Web Development",
        "level": "Advanced"
      },
      "instructor": "6af0959cae094cf4cf724e4f",
      "duration": 45,
      "passMark": 70,
      "maxAttempts": 2,
      "totalMarks": 25,
      "availableFrom": "2026-11-08T00:00:00.000Z",
      "availableUntil": "2026-11-15T23:59:59.000Z",
      "isPublished": true,
      "status": "active"
    }
  ]
}
```

### 1.2 Create Quiz
- **Method / Path:** `POST /quizzes`
- **Access:** Protected (`instructor`, `admin`, `administrator`)
- **Request Body:**
```json
{
  "title": "Node.js Microservices Assessment",
  "description": "Evaluating message queues, REST APIs, and Docker containerization",
  "instructions": "Answer all questions. Calculators and notes are strictly prohibited.",
  "courseId": "6af0959cae094cf4cf724e53",
  "duration": 30,
  "passMark": 60,
  "maxAttempts": 3,
  "availableFrom": "2026-11-08T10:00:00.000Z",
  "availableUntil": "2026-11-20T23:59:59.000Z"
}
```
- **Response `201 Created`:**
```json
{
  "success": true,
  "message": "Quiz created successfully",
  "data": {
    "_id": "6af0959cae094cf4cf724eb8",
    "title": "Node.js Microservices Assessment",
    "isPublished": false,
    "status": "draft"
  }
}
```

### 1.3 Toggle Publish State
- **Method / Path:** `PATCH /quizzes/:id/publish`
- **Access:** Protected (Quiz Owner, Administrator)
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Quiz published successfully",
  "data": {
    "_id": "6af0959cae094cf4cf724eb8",
    "isPublished": true,
    "status": "active"
  }
}
```

---

## 2. Question Bank & Reordering Endpoints

### 2.1 Reorder Questions (Task 1 Enhancement)
- **Method / Path:** `PATCH /quizzes/:quizId/questions/reorder`
- **Access:** Protected (Quiz Owner, Administrator)
- **Request Body:**
```json
{
  "questionIds": [
    "6af0959cae094cf4cf724e6e",
    "6af0959cae094cf4cf724e64",
    "6af0959cae094cf4cf724e68"
  ]
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Questions reordered successfully",
  "count": 3,
  "data": [
    {
      "_id": "6af0959cae094cf4cf724e6e",
      "questionText": "What is MongoDB ObjectId length?",
      "order": 0
    },
    {
      "_id": "6af0959cae094cf4cf724e64",
      "questionText": "What is React Virtual DOM?",
      "order": 1
    },
    {
      "_id": "6af0959cae094cf4cf724e68",
      "questionText": "What is Node.js Event Loop?",
      "order": 2
    }
  ]
}
```

### 2.2 Get Quiz Questions (Zero Leakage Delivery)
- **Method / Path:** `GET /quizzes/:quizId/questions`
- **Access:** Protected (Learners receive sanitized questions; Instructors receive answer keys)
- **Learner Response `200 OK` (Answers completely hidden):**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "6af0959cae094cf4cf724e6e",
      "quiz": "6af0959cae094cf4cf724e5a",
      "questionText": "What is MongoDB ObjectId length?",
      "options": [
        { "_id": "6af0959cae094cf4cf724e6c", "text": "12-byte BSON / 24 hex characters" },
        { "_id": "6af0959cae094cf4cf724e6d", "text": "64-byte string" }
      ],
      "marks": 5,
      "order": 0
    }
  ]
}
```

---

## 3. Assessment & Attempt Execution Endpoints

### 3.1 Start Attempt (Or Resume Active Session)
- **Method / Path:** `POST /attempts/start`
- **Access:** Protected (Learners for published quizzes; Instructors for preview self-tests)
- **Request Body:**
```json
{
  "quizId": "6af0959cae094cf4cf724e5a"
}
```
- **Response `201 Created` (New Attempt):**
```json
{
  "success": true,
  "message": "Quiz attempt started successfully",
  "data": {
    "attempt": {
      "_id": "6af0959dae094cf4cf724ecb",
      "quiz": "6af0959cae094cf4cf724e5a",
      "learner": "6af0959cae094cf4cf724e50",
      "attemptNumber": 1,
      "isTestAttempt": false,
      "startedAt": "2026-11-08T15:30:37.000Z",
      "status": "in_progress"
    },
    "quiz": {
      "_id": "6af0959cae094cf4cf724e5a",
      "title": "Fullstack React Architecture Assessment",
      "duration": 45,
      "passMark": 70,
      "maxAttempts": 2
    },
    "questions": [ /* Sanitized question array sorted by order */ ]
  }
}
```

### 3.2 Submit Attempt (Auto-Grading)
- **Method / Path:** `POST /attempts/:id/submit`
- **Access:** Protected (Attempt Owner)
- **Request Body:**
```json
{
  "answers": [
    { "question": "6af0959cae094cf4cf724e6e", "selectedOptionId": "6af0959cae094cf4cf724e6c" },
    { "question": "6af0959cae094cf4cf724e64", "selectedOptionId": "6af0959cae094cf4cf724e62" }
  ]
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Quiz submitted and auto-graded successfully",
  "data": {
    "attempt": {
      "_id": "6af0959dae094cf4cf724ecb",
      "score": 7,
      "totalPossibleMarks": 10,
      "percentage": 70,
      "passed": true,
      "status": "submitted"
    },
    "quiz": {
      "_id": "6af0959cae094cf4cf724e5a",
      "title": "Fullstack React Architecture Assessment",
      "passMark": 70
    },
    "questionsReview": [
      {
        "_id": "6af0959cae094cf4cf724e6e",
        "questionText": "What is MongoDB ObjectId length?",
        "correctOptionId": "6af0959cae094cf4cf724e6c",
        "explanation": "MongoDB ObjectId consists of 12 bytes.",
        "userSelectedOptionId": "6af0959cae094cf4cf724e6c",
        "isCorrect": true,
        "marksAwarded": 5
      }
    ]
  }
}
```

### 3.3 My Attempts History
- **Method / Path:** `GET /attempts/my`
- **Access:** Protected (`learner`)
- **Response `200 OK`:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "6af0959dae094cf4cf724ecb",
      "quiz": {
        "_id": "6af0959cae094cf4cf724e5a",
        "title": "Fullstack React Architecture Assessment",
        "passMark": 70,
        "duration": 45
      },
      "attemptNumber": 1,
      "score": 7,
      "totalPossibleMarks": 10,
      "percentage": 70,
      "passed": true,
      "status": "submitted",
      "createdAt": "2026-11-08T15:30:37.000Z"
    }
  ]
}
```

---

## 4. Instructor Analytics Endpoints

### 4.1 Quiz Submissions & Analytics Dashboard
- **Method / Path:** `GET /quizzes/:quizId/attempts`
- **Access:** Protected (Quiz Owner Instructor, Administrator)
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "quiz": {
      "_id": "6af0959cae094cf4cf724e5a",
      "title": "Fullstack React Architecture Assessment",
      "passMark": 70,
      "totalMarks": 10
    },
    "stats": {
      "totalSubmissions": 2,
      "passedCount": 1,
      "failedCount": 1,
      "passRate": "50.0",
      "avgScore": "6.0",
      "avgPercentage": "60.0",
      "highestScore": 10,
      "lowestScore": 2,
      "highestPercentage": 100,
      "lowestPercentage": 20
    },
    "submissions": [
      {
        "_id": "6af0959dae094cf4cf724ecc",
        "learner": {
          "_id": "6af0959cae094cf4cf724e50",
          "name": "Sarah Connor",
          "email": "sarah.connor@example.com"
        },
        "score": 10,
        "totalPossibleMarks": 10,
        "percentage": 100,
        "passed": true,
        "status": "submitted",
        "createdAt": "2026-11-08T15:30:37.000Z"
      }
    ]
  }
}
```
