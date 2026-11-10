# SkillNest – Member 05 Integration Guide
## Quiz & Assessment Management Module
**Developer:** R.D.T.S. Karunarathna
**Registration:** SEU/IS/22/ICT/087
**Branch:** `feature/member-05-quiz`

---

## 1. Overview
This module implements the **Quiz & Assessment Management** feature of the SkillNest MERN platform. It enables Instructors to build assessments, configure MCQ questions, schedule availability dates, and set time limits, while giving Learners an interface to take timed assessments, receive instant automated scores, and review their performance without premature answer leakage.

---

## 2. Integration Contracts with Other Members

### Member 01: User Management & Authentication
Member 05 **does not** define duplicate User models, password hashing, login/register controllers, or custom token storage.
- **Backend Auth Middleware:** Member 05 routes expect the standard `protect` and `authorize` middleware (found at `backend/middleware/authMiddleware.js`), which populates:
  ```javascript
  req.user = {
    _id: "...",       // Mongoose ObjectId or string
    name: "...",      // User's name
    email: "...",     // User's email
    role: "..."       // "administrator" | "instructor" | "learner"
  };
  ```
- **Frontend API Client:** All quiz components use `frontend/src/api/apiClient.js`, which uses `withCredentials: true` and supports a dynamic token provider callback (`registerTokenProvider`) so Member 01 can link in-memory or cookie tokens without hardcoded storage keys.

### Member 02: Course Management
- `backend/models/Quiz.js` defines an optional `courseId` field referencing `'Course'`:
  ```javascript
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    default: null
  }
  ```
- Quizzes function seamlessly both standalone and linked to a course.

### Member 03: Student Enrollment
- Quizzes can filter access based on active course enrollments by querying `courseId` against Member 03's Enrollment model once merged.

### Member 04: Content & Lesson Management
- Lessons can embed or reference assessments via `quizId` to launch quizzes directly at the conclusion of a course module.

### Member 06: Progress Tracking & Certification
- `backend/models/QuizAttempt.js` records completed assessment metrics (`score`, `totalPossibleMarks`, `percentage`, `passed`, `timeExpired`, `submittedAt`).
- Member 06 can directly query `QuizAttempt` to calculate overall course completion and certificate generation criteria.

---

## 3. Database Models (Member 05)

| Model | File | Key Fields |
|---|---|---|
| **Quiz** | `backend/models/Quiz.js` | `title`, `description`, `instructions`, `courseId`, `instructor`, `duration` (mins), `passMark` (%), `totalMarks`, `availableFrom`, `availableUntil`, `isPublished` |
| **QuizQuestion** | `backend/models/QuizQuestion.js` | `quiz`, `questionText`, `options` (2–6), `correctOptionId` (`select: false`), `marks`, `explanation`, `order` |
| **QuizAttempt** | `backend/models/QuizAttempt.js` | `quiz`, `learner`, `startedAt`, `submittedAt`, `status`, `answers`, `score`, `totalPossibleMarks`, `percentage`, `passed`, `timeExpired` |

---

## 4. API Endpoints

### Quiz Management (`/api/quizzes`)
- `GET /api/quizzes` — List quizzes (filtered by role: learners see active/published; instructors see authored; admin sees all)
- `POST /api/quizzes` — Create a quiz (Instructor/Admin)
- `GET /api/quizzes/:id` — View quiz details and instructions (answer keys stripped)
- `PUT /api/quizzes/:id` — Update quiz settings (Instructor owner/Admin)
- `DELETE /api/quizzes/:id` — Delete quiz + cascade delete questions and attempts (Instructor owner/Admin)
- `PATCH /api/quizzes/:id/publish` — Toggle publish status (Instructor owner/Admin)

### Question Management (`/api/quizzes/:id/questions`)
- `GET /api/quizzes/:id/questions` — List questions (`correctOptionId` stripped for learners)
- `POST /api/quizzes/:id/questions` — Add MCQ question (2–6 options, marks, correct answer)
- `PUT /api/quizzes/:quizId/questions/:qId` — Update question
- `DELETE /api/quizzes/:quizId/questions/:qId` — Delete question

### Quiz Attempts & Auto-Grading (`/api/attempts`)
- `POST /api/attempts/start` — Start a quiz attempt (validates availability window, records server `startedAt`)
- `POST /api/attempts/:id/submit` — Submit answers (validates server duration, auto-grades against DB, computes percentage and pass/fail)
- `GET /api/attempts/:id` — Retrieve attempt details and review (exposes correct options and explanations only after submission)
- `GET /api/attempts/my` — List logged-in learner's attempts
- `GET /api/quizzes/:quizId/attempts` — Instructor view of all student submissions and score statistics

---

## 5. Security & Verification
1. **Zero Premature Answer Leakage:** `correctOptionId` in `QuizQuestion` is set to `{ select: false }`. Learner endpoints never return correct answers until after submission.
2. **Server-Side Timing Validation:** Quiz duration is enforced upon submission on the Express server (`Date.now() - startedAt <= duration + 1 min grace`).
3. **Availability Windows:** Quizzes outside `[availableFrom, availableUntil]` cannot be attempted.
4. **Instructor Ownership:** Mutating operations check `quiz.instructor.equals(req.user._id)`.
