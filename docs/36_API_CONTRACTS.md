# API Contracts (V1)

All API endpoints are hosted by `apps/web`. The AI Interviewer service has separate WebRTC/WebSocket boundaries not covered by this REST API contract.

## Global Rules
*   **Base Path**: `/api/v1`
*   **Content-Type**: `application/json`
*   **Authentication**: Supabase JWT passed in `Authorization: Bearer <token>`.
*   **Authorization**: All routes explicitly verify `candidate_profile_id` ownership (Row Level Security or Application-level checks).

---

## 1. Candidate Profile

### `GET /profile`
*   **Description**: Fetch current user's profile.
*   **Request**: `None`
*   **Response**: `{ id, targetRole, createdAt }`
*   **Errors**: `401 Unauthorized`, `404 Not Found`

### `POST /profile`
*   **Description**: Create or update profile config.
*   **Request**: `{ targetRole: string }`
*   **Response**: `{ id, targetRole, createdAt }`
*   **Errors**: `400 Bad Request` (Zod validation), `401 Unauthorized`

---

## 2. Documents (Resumes & JDs)

### `POST /resumes`
*   **Description**: Upload a new resume.
*   **Request**: `multipart/form-data` containing `file`
*   **Response**: `{ id, fileUrl, parsedData, createdAt }`
*   **Errors**: `400 Bad Request` (Invalid file), `413 Payload Too Large`

### `GET /resumes`
*   **Description**: List candidate's active resumes.
*   **Request**: `None`
*   **Response**: `[{ id, fileUrl, parsedData, createdAt }]`

### `POST /job-descriptions`
*   **Description**: Upload a target job description.
*   **Request**: `{ rawText: string }`
*   **Response**: `{ id, rawText, parsedRequirements, createdAt }`
*   **Errors**: `400 Bad Request`

### `GET /job-descriptions`
*   **Description**: List active JDs.
*   **Request**: `None`
*   **Response**: `[{ id, rawText, parsedRequirements, createdAt }]`

---

## 3. Interviews

### `POST /interviews`
*   **Description**: Request a new interview configuration.
*   **Request**: `{ resumeId?: string, jobDescriptionId?: string }`
*   **Response**: `{ id, state: "REQUESTED", createdAt }`
*   **Errors**: `400 Bad Request` (Invalid IDs), `404 Not Found` (Resume/JD ownership failed)

### `GET /interviews`
*   **Description**: List past and current interviews.
*   **Request**: `None`
*   **Response**: `[{ id, state, startedAt, completedAt, createdAt }]`

### `GET /interviews/:id`
*   **Description**: Get specific interview status and details.
*   **Request**: `None`
*   **Response**: `{ id, state, videoUrl, startedAt, completedAt }`
*   **Errors**: `403 Forbidden` (Not owner), `404 Not Found`

### `GET /interviews/:id/plan`
*   **Description**: Get the generated syllabus and targeted memories.
*   **Request**: `None`
*   **Response**: `{ syllabus: object, targetedMemoryItemIds: string[] }`
*   **Errors**: `404 Not Found` (Plan not generated yet)

### `GET /interviews/:id/report`
*   **Description**: Get the final post-interview scorecard and coaching.
*   **Request**: `None`
*   **Response**: 
    ```json
    {
      "report": { "finalScore", "overallConfidenceScore", "executiveSummary" },
      "evaluations": [
        { "dimension", "score", "confidenceScore", "evidenceQuote", "coaching": { "whatWentWrong", "rewriteExample" } }
      ]
    }
    ```
*   **Errors**: `404 Not Found` (Report not generated yet)

---

## 4. Memory & Dashboard

### `GET /memory`
*   **Description**: Fetch all tracked candidate memories.
*   **Request**: `None`
*   **Response**: `[{ id, trait, state, priorityTest, updatedAt }]`

### `POST /memory/:id/dispute`
*   **Description**: Candidate explicitly disputes an AI evaluation trait.
*   **Request**: `None` (or `{ reason: string }` optionally)
*   **Response**: `{ id, state: "DISPUTED" }`
*   **Errors**: `403 Forbidden`, `404 Not Found`, `409 Conflict` (Cannot dispute RESOLVED memory)

### `GET /dashboard`
*   **Description**: Aggregated data for candidate dashboard.
*   **Request**: `None`
*   **Response**: 
    ```json
    {
      "recentInterviews": [],
      "activeWeaknesses": [],
      "resolvedStrengths": [],
      "averageScore": number
    }
    ```
