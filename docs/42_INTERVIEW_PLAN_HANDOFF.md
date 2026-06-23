# Interview Plan Handoff Architecture

This document defines how the massive LLM-generated `InterviewPlan` is handed off from the Web App to the ultra-low-latency AI Interviewer service.

## The Problem
*   JWTs and connection string payloads have strict size limits (e.g., 4KB-8KB).
*   An `InterviewPlan` contains deep JSON structures (syllabus, rubrics, context) which exceed these limits.
*   Passing the payload directly from the client browser to the WebSocket service is insecure and open to manipulation.

## V1 Design: Secure Internal API Pull

### 1. Ownership & Boundary
*   `apps/web` exclusively owns the database connection and the generation of the `InterviewPlan`.
*   `services/ai-interviewer` acts as a pure dumb pipe that requires the syllabus to boot its local LLM context.

### 2. The Retrieval Flow
1.  **Client Token Issue**: Candidate requests to start the interview. `apps/web` issues a signed JWT containing ONLY the `userId` and `interviewId`.
2.  **Socket Connect**: Candidate connects to `services/ai-interviewer` via WebSocket, passing the JWT.
3.  **Verification**: The AI service verifies the JWT signature (using a shared secret).
4.  **Internal Fetch**: The AI service executes a secure HTTP request directly to `apps/web` over the private network: 
    *   `GET /api/internal/interviews/{interviewId}/plan`
    *   Headers: `Authorization: Bearer <INTERNAL_SERVICE_SECRET>`
5.  **Context Boot**: The AI service injects the returned plan into the LLM system prompt and begins the voice stream.

### 3. Failure Handling
*   If `apps/web` returns `404 Not Found`, the plan wasn't generated. The AI service immediately disconnects the socket with code `4004 (Plan Not Ready)`.
*   If `apps/web` times out (e.g., cold boot), the AI service attempts exactly 2 retries with 500ms backoff before dropping the connection.

### 4. Caching Strategy
*   The `InterviewPlan` is completely immutable once generated.
*   `services/ai-interviewer` MUST cache the plan in local memory (tied to the socket instance) for the duration of the connection.
*   Once the socket terminates, the plan is wiped from memory to prevent leaks.
