# Module 04 — Hackathon Challenge Management
**Developer:** H.A.K. Madushan  
**Branch:** `feature/member-04-hackathon`  
**Backend base path:** `/api/challenges` · `/api/submissions`  
**Frontend base path:** `/challenges`

---

## MongoDB Models

### `HackathonChallenge` (`server/models/HackathonChallenge.js`)
| Field | Type | Notes |
|---|---|---|
| `title` | String | Required |
| `description` | String | Required |
| `difficulty` | Enum | `Easy` / `Medium` / `Hard` / `Expert` |
| `status` | Enum | `upcoming` / `active` / `completed` |
| `deadline` | Date | Submission cutoff |
| `dayNumber` | Number | Day sequence (e.g. Day 1) |
| `instructorId` | ObjectId → User | Ref: shared User model |
| `tags` | [String] | e.g. `["arrays", "dp"]` |
| `inputRequirements` | String | Problem input spec |
| `outputRequirements` | String | Problem output spec |
| `constraints` | String | e.g. `1 ≤ A, B ≤ 1000` |
| `sampleTestCase` | `{ input, output, explanation }` | Optional |
| `starterCode` | `{ javascript, python, java, cpp }` | Language template snippets |
| `maxScore` | Number | Default 100 |

### `ChallengeSubmission` (`server/models/ChallengeSubmission.js`)
| Field | Type | Notes |
|---|---|---|
| `challengeId` | ObjectId → HackathonChallenge | Required |
| `learnerId` | ObjectId → User | Required |
| `sourceCode` | String | Required |
| `language` | Enum | `javascript` / `python` / `java` / `cpp` |
| `repoUrl` | String | Optional GitHub/Vercel URL |
| `status` | Enum | `Pending` / `Accepted` / `Needs Revision` / `Rejected` |
| `result.score` | Number | Instructor-assigned (0–100) |
| `result.feedback` | String | Instructor written feedback |
| `submissionDate` | Date | Auto `Date.now` |

---

## API Endpoints

### Challenge Routes — `/api/challenges`

| Method | Path | Auth Required | Role | Description |
|---|---|---|---|---|
| `GET` | `/api/challenges` | No (public) | Any | List all challenges (with optional `?status=active&difficulty=Hard`) |
| `POST` | `/api/challenges` | Yes | `instructor` / `admin` | Create new hackathon challenge |
| `GET` | `/api/challenges/:id` | No (public) | Any | Get single challenge by ID |
| `PUT` | `/api/challenges/:id` | Yes | `instructor` / `admin` | Update a challenge |
| `DELETE` | `/api/challenges/:id` | Yes | `instructor` / `admin` | Delete a challenge |
| `GET` | `/api/challenges/my-challenges` | Yes | `instructor` | Instructor's own challenges |
| `GET` | `/api/challenges/stats` | Yes | `instructor` / `admin` | Aggregated challenge statistics |
| `POST` | `/api/challenges/seed` | No | — | Seed 6 demo challenges (dev only) |

> **Route order note:** `/my-challenges` and `/stats` are mounted **before** `/:id` in `challengeRoutes.js` to avoid React Router treating `my-challenges` as a dynamic `:id` param.

### Submission Routes — `/api/submissions`

| Method | Path | Auth Required | Role | Description |
|---|---|---|---|---|
| `POST` | `/api/submissions` | Yes | `learner` | Submit a solution |
| `GET` | `/api/submissions/my` | Yes | `learner` | Learner's own submissions (all challenges) |
| `GET` | `/api/submissions/challenge/:challengeId` | Yes | `instructor` / `admin` | All submissions for a specific challenge |
| `PUT` | `/api/submissions/:id/grade` | Yes | `instructor` / `admin` | Grade a submission (score + feedback + status) |
| `GET` | `/api/submissions/:id` | Yes | `learner` / `instructor` / `admin` | Single submission by ID |

---

## Frontend Routes (`client/src/App.jsx`)

| Path | Component | Description |
|---|---|---|
| `/challenges` | `ChallengesPage` | Public challenge catalog |
| `/challenges/my-submissions` | `LearnerSubmissionsPage` | Learner's submission history (auth required) |
| `/challenges/:id` | `ChallengeDetailPage` | Challenge problem + code editor + submission form |
| `/instructor/challenges` | `InstructorChallengeDashboard` | Instructor dashboard (create/edit/grade) |

> **React Router order:** `/challenges/my-submissions` MUST appear before `/challenges/:id` in `App.jsx`. This is already enforced.

---

## Role Permissions Summary

| Action | Learner | Instructor | Admin |
|---|---|---|---|
| View challenge list | ✅ (public) | ✅ | ✅ |
| View challenge detail | ✅ (public) | ✅ | ✅ |
| Submit a solution | ✅ | ❌ | ❌ |
| View own submissions | ✅ | ❌ | ❌ |
| Create / edit challenge | ❌ | ✅ (own) | ✅ |
| View all submissions | ❌ | ✅ (own challenges) | ✅ |
| Grade a submission | ❌ | ✅ | ✅ |

---

## Frontend Components

| Component | File | Purpose |
|---|---|---|
| `ChallengeCard` | `client/src/components/ChallengeCard.jsx` | Card used in challenge catalog list |
| `ChallengeModal` | `client/src/components/ChallengeModal.jsx` | Create / Edit challenge form modal |
| `GradeSubmissionModal` | `client/src/components/GradeSubmissionModal.jsx` | Instructor grading form modal |
| `CodeEditor` | `client/src/components/CodeEditor.jsx` | Monaco-style code editor with language tabs |
| `DifficultyBadge` | `client/src/components/DifficultyBadge.jsx` | Colour-coded difficulty pill |
| `CountdownTimer` | `client/src/components/CountdownTimer.jsx` | Real-time deadline countdown |

## Service Files

| Service | File | Purpose |
|---|---|---|
| `challengeService` | `client/src/services/challengeService.js` | Axios wrappers for `/api/challenges` |
| `submissionService` | `client/src/services/submissionService.js` | Axios wrappers for `/api/submissions` |

---

## Integration Contracts with Other Modules

### Shared: `User` model (`server/models/User.js`)
- **Do NOT modify.** Owned by Module 01.
- Module 04 reads `User._id` as `instructorId` (on challenges) and `learnerId` (on submissions).
- Roles used: `learner`, `instructor`, `admin` — all defined in the shared model.

### Shared: Auth Middleware (`server/middleware/authMiddleware.js`)
- `protect` — validates JWT, sets `req.user`. Used on all protected submission and challenge routes.
- `optionalProtect` — sets `req.user` if token present but does NOT block unauthenticated requests. Used on public challenge list/detail routes.
- `authorize(...roles)` — restricts by role. Used on instructor/admin-only endpoints.

### Shared: `api.js` Axios instance (`client/src/services/api.js`)
- Base URL: `http://localhost:5000/api`
- Automatically reads JWT from `localStorage` (`skillnest_token`).
- **Important:** Tokens starting with `demo_` are stripped before the request is sent — demo users cannot call protected API endpoints.

### Navbar (`client/src/components/Navbar.jsx`)
- Module 04 nav links (`Challenges`, `My Submissions`) are already present in the shared Navbar.
- **Do NOT duplicate** these links.

### AuthContext (`client/src/context/AuthContext.jsx`)
- `isAuthenticated` — `true` only when a **real JWT** (not `demo_`, not `null`) is in state.
- On mount, `syncAuthSession()` auto-attempts login with the stored user's email and `password123` against the live backend. If backend is offline, falls back to demo user with `token = null`.

---

## Seeder (Dev / Demo)

**File:** `server/utils/challengeSeeder.js`

Seeds 6 sample hackathon challenges + 1 sample submission into MongoDB.

**Trigger via API:**
```
POST http://localhost:5000/api/challenges/seed
```
Or run directly:
```powershell
cd server
node -e "require('./utils/challengeSeeder')()"
```

---

## Running the Full Stack (Development)

```powershell
# Terminal 1 — Backend
cd "c:\Users\Kavishka Madushan\skillnest\skillnest\server"
node server.js

# Terminal 2 — Frontend
cd "c:\Users\Kavishka Madushan\skillnest\skillnest\client"
npm run dev
```

Then open `http://localhost:5173/challenges` in your browser.  
The app auto-logs in with `learner@skillnest.edu / password123` when the backend is reachable.

---

## Known Behaviour Notes

| Scenario | Behaviour |
|---|---|
| Backend offline, demo user | `isAuthenticated = false` → Submit button disabled, blue hint shown |
| Real JWT present, role = learner | Submit button active, submissions load from `/api/submissions/my` |
| Challenge deadline passed | Submit button disabled, deadline banner shown, code editor read-only |
| Instructor visits `/challenges/:id` | Page renders fine but Submit button is disabled (role guard) |

