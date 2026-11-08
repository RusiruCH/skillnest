# SkillNest – Member 05: Evaluation & Demonstration Guide
## Module: Quiz & Assessment Management

**Student Name:** R.D.T.S. Karunarathna
**Student Registration Number:** `SEU/IS/22/ICT/087`
**Purpose:** Step-by-step procedural manual for academic evaluators and project viva demonstration.

---

## 1. Prerequisites & Environment Setup

Ensure the following prerequisites are met before starting the demonstration:
1. **Database:** MongoDB running locally on `mongodb://127.0.0.1:27017/skillnest_db`.
2. **Backend Server:** Run `npm --prefix server run dev` (starts on port `5000`).
3. **Frontend Client:** Run `npm --prefix client run dev` (starts on port `5173`).
4. **Browser:** Google Chrome or Firefox with Developer Tools available.

---

## 2. Test User Accounts

For seamless demonstration across roles, the following accounts can be registered or used via JWT authentication:

| Role | Email Address | Password | Intended Demonstration Usage |
| :--- | :--- | :--- | :--- |
| **Instructor A** | `instructor.a@skillnest.lk` | `SkillNest@2026` | Quiz authoring, question reordering, preview, and analytics |
| **Instructor B** | `instructor.b@skillnest.lk` | `SkillNest@2026` | Demonstrates authorization rejection (`403`) on Instructor A's quizzes |
| **Learner 1** | `learner1@skillnest.lk` | `SkillNest@2026` | Attempts quizzes, views My Attempts, submits on time |
| **Learner 2** | `learner2@skillnest.lk` | `SkillNest@2026` | Demonstrates retake attempts, pass/fail grading, and analytics population |

---

## 3. Demonstration Scenario Walkthroughs

### SCENARIO 1: Instructor Quiz Authoring & Course Linkage
**Goal:** Show how an instructor creates a structured assessment linked to an existing course.

1. **Login:** Log in as `instructor.a@skillnest.lk`.
2. **Navigate:** Click **"Quizzes"** in the top navigation bar, then click **"+ Create Quiz"**.
3. **Fill Quiz Form:**
   - **Title:** `MERN Stack Architecture & Best Practices`
   - **Description:** `Assessing React hooks, Express middlewares, and Mongoose indexing.`
   - **Linked Course:** Select an existing course from the **Linked Course** dropdown (e.g. *Fullstack Web Development*).
   - **Duration:** Set to `20` minutes.
   - **Pass Mark:** Set to `60`%.
   - **Max Attempts:** Set to `2` attempts.
   - **Schedule Window:** Set *Available From* to current time and *Available Until* to 7 days ahead.
4. **Submit:** Click **"Save Quiz Details"**.
5. **Observation:**
   - Quiz is created in **DRAFT** status.
   - User is redirected to the **Quiz Edit Page** (`/quizzes/:id/edit`).
   - The selected course name appears linked to the quiz.

---

### SCENARIO 2: Question Bank Creation & Question Ordering (Task 1)
**Goal:** Show how questions are added, validated, and reordered via drag-and-drop.

1. **Add Question 1:**
   - Click **"+ Add MCQ Question"**.
   - **Question Text:** `Which React hook is used to perform side effects in functional components?`
   - **Options:**
     - Option 1: `useState`
     - Option 2: `useEffect` (Select as Correct Answer)
     - Option 3: `useReducer`
     - Option 4: `useMemo`
   - **Marks:** `2`
   - **Explanation:** `useEffect serves the purpose of componentDidMount and componentDidUpdate combined.`
   - Click **"Save Question"**.
2. **Add Question 2:**
   - Add a second question: `In Node.js, what is the role of the Event Loop?`
   - Add options and mark option `To handle non-blocking asynchronous operations` as correct.
   - **Marks:** `3`.
3. **Add Question 3:**
   - Add a third question: `What is the default index type created on MongoDB _id field?`
   - Mark `Unique B-Tree index` as correct.
   - **Marks:** `5`. Total quiz marks automatically sum to `10`.
4. **Demonstrate Reordering:**
   - Drag Question 3 to the top of the list, OR click the **▲ (Move Up)** button twice.
   - **Observation:** Notice the instant feedback notice: `"Question order saved!"`.
   - Refresh the page to demonstrate that the new order (Question 3 $\rightarrow$ Question 1 $\rightarrow$ Question 2) persisted in MongoDB.

---

### SCENARIO 3: Instructor Quiz Preview & Self-Test (Task 2)
**Goal:** Demonstrate the real-time student-facing preview interface without answer leakage or data pollution.

1. **Launch Preview:**
   - On the Quiz Edit Page (with quiz still in **DRAFT** state), click **"Preview as Learner"** (with Eye icon).
2. **Verify Preview Screen:**
   - Notice the amber notification banner:
     > *👁️ Instructor Preview Mode: This is a test attempt. It will not count toward learner statistics, attempt limits, or class pass rates.*
   - Inspect the questions: notice that correct answers and explanations are **completely hidden**.
   - Open Developer Tools $\rightarrow$ Network tab $\rightarrow$ Inspect `/api/attempts/start` response: verify `correctOptionId` is not present in the JSON payload.
3. **Submit Preview:**
   - Select answers and click **"Submit Quiz"**.
   - Review the scored result: score (e.g. 70%), pass badge, and detailed question-by-question review with correct answers and explanations revealed.
4. **Publish Quiz:**
   - Navigate back to the Quiz Edit Page and click **"Publish Quiz"**. Badge transitions to green **PUBLISHED**.

---

### SCENARIO 4: Learner Assessment & Countdown Timer
**Goal:** Demonstrate learner attempt lifecycle, time enforcement, and auto-grading.

1. **Login as Learner:** Log out and log in as `learner1@skillnest.lk`.
2. **Browse Catalog:**
   - Navigate to `/quizzes`. Notice the published quiz appears with duration, pass mark, and linked course badge.
   - Draft quizzes are completely hidden from the learner.
3. **Launch Assessment:**
   - Click **"View Quiz Details"** $\rightarrow$ Click **"Start Quiz Attempt"**.
   - Notice the sticky top bar displaying the **Countdown Timer**, answered question count, and live progress bar.
4. **Complete Assessment:**
   - Select answers for all questions and click **"Submit Answers"**.
   - The learner is immediately directed to the scored **Result Review** page showing their final score, percentage, and detailed feedback.

---

### SCENARIO 5: My Attempts Page
**Goal:** Demonstrate learner attempt tracking and retake limitations.

1. **View My Attempts:**
   - Click **"My Attempts"** in the top navigation bar (or navigate to `/my-attempts`).
   - Notice the attempt table listing: Quiz Title, Attempt Date, Score, Percentage, Pass/Fail badge, and a **"View Results"** button.
2. **Demonstrate Maximum Attempts Ceiling:**
   - Return to the quiz and start Attempt 2.
   - Complete Attempt 2.
   - Now click **"Start Quiz Attempt"** again:
   - **Observation:** System halts the action with notice:
     > *"Maximum attempt limit reached. You have completed 2 of 2 allowed attempt(s)."*

---

### SCENARIO 6: Instructor Quiz Analytics Dashboard (Task 4)
**Goal:** Demonstrate comprehensive class analytics and test attempt exclusion.

1. **Login as Instructor:** Log back in as `instructor.a@skillnest.lk`.
2. **Open Analytics:**
   - Navigate to `/quizzes` $\rightarrow$ Click the **Users (Submissions)** icon on the quiz card.
3. **Verify Dashboard KPIs:**
   - **Total Submissions Card:** Accurately reflects only genuine learner submissions (Instructor preview attempts are strictly excluded).
   - **Pass Rate Card:** Displays percentage of passing students.
   - **Average Score Card:** Displays mean points and percentage.
   - **Highest Marks Card:** Highlights top student marks.
   - **Lowest Marks Card:** Highlights bottom student marks.
4. **Demonstrate Search & Filters:**
   - Type `Sarah` in the learner search box: table filters in real time.
   - Click **"Passed"** or **"Failed"** filter pills: table toggles accordingly.
   - Click **"View Review"** on any student row to inspect their submitted answers.

---

### SCENARIO 7: Security & Authorization Verification
**Goal:** Demonstrate that instructors cannot tamper with other instructors' assessments.

1. **Login as Instructor B:** Log in as `instructor.b@skillnest.lk`.
2. **Attempt Unauthorized Access:**
   - Try to directly access Instructor A's quiz edit URL: `/quizzes/<instructor_a_quiz_id>/edit`.
   - **Observation:** Server responds with `403 Forbidden` (`"Forbidden: You can only edit your own quizzes"`).
   - Try to access analytics: `/quizzes/<instructor_a_quiz_id>/submissions`.
   - **Observation:** Server responds with `403 Forbidden` (`"Forbidden: You can only view submissions for your own quizzes"`).
