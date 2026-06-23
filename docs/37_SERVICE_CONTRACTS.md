# Service Contracts & Boundaries

This document defines the interaction rules between the monorepo packages and apps to enforce strict modularity.

## Boundary Definitions

### `apps/web` (Next.js Monolith)
*   **Role**: UI rendering, REST API, Auth, Orchestration.
*   **Allowed to Call**: `packages/database`, Message Broker (e.g., Redis/SQS for event emission).
*   **Forbidden**: MUST NOT invoke LLM prompts directly (`packages/ai`). MUST NOT process post-interview evaluations.
*   **Ownership**: Exclusively owns User, CandidateProfile, Resume, JobDescription, and Interview Config states.

### `apps/worker` (Node.js Background Async)
*   **Role**: Heavy-lifting async processor (Planning, Evaluation, Memory math).
*   **Allowed to Call**: `packages/database`, `packages/ai`.
*   **Forbidden**: MUST NOT serve HTTP requests or UI. MUST NOT handle live WebRTC audio.
*   **Ownership**: Exclusively owns InterviewPlan, Evaluation, Report, CoachingFeedback, and Memory state transitions.

### `services/ai-interviewer` (WebRTC/Socket Service)
*   **Role**: Ultra-low latency voice and text streaming with Candidate.
*   **Allowed to Call**: `packages/ai` (for immediate dialogue generation only), Redis Streams (to emit TranscriptLines), Message Broker (to emit Transcript.Finalized), internal API (to fetch InterviewPlan).
*   **Forbidden**: MUST NOT connect to `packages/database`. MUST NOT generate coaching or evaluations.
*   **Interaction Contract**: `apps/web` generates a secure short-lived token containing the `interviewId`. The Candidate connects using this token. The service securely calls `GET /api/internal/interviews/:id/plan` on `apps/web` to load the context. During the session, it streams `TranscriptLine` data to a Redis Stream, which `apps/worker` consumes to persist to the database.

### `packages/ai` (LLM Interface)
*   **Role**: Strict Zod-enforced prompting, vendor abstraction (OpenAI, Anthropic, Gemini).
*   **Allowed to Call**: External LLM APIs.
*   **Forbidden**: MUST NOT connect to `packages/database`. MUST NOT have domain-specific business logic outside of raw prompt formatting.
*   **Ownership**: Owns prompt templates and retry/backoff LLM logic.

### `packages/database` (Drizzle ORM)
*   **Role**: Schema definitions and typed query access.
*   **Allowed to Call**: PostgreSQL.
*   **Forbidden**: MUST NOT execute external HTTP requests. MUST NOT emit events directly.
*   **Ownership**: Source of truth for data shapes.

## Interaction Flow Rules

1.  **Read/Write Segregation**: The Web app reads Evaluation data for display but NEVER writes it. The Worker writes Evaluation data but NEVER renders it.
2.  **Live State Handoff**: `apps/web` -> changes `Interview` state to `STARTED` -> generates token -> Candidate browser connects to `services/ai-interviewer`.
3.  **End of Interview Handoff**: `services/ai-interviewer` -> Candidate disconnects -> emits `Transcript.Finalized` to broker -> `apps/worker` wakes up and begins evaluation.
