# Phase 7 Hostile Review

Acting as a hostile CTO, the following issues have been identified in the Phase 7 design contracts. These must be resolved before any code is written in Phase 8.

## P0 — Critical Gaps

### P0-1: The Transcript Ingestion Black Hole
*   **Conflict**: `docs/37_SERVICE_CONTRACTS.md` strictly forbids `services/ai-interviewer` from talking to the database. Yet `docs/35_CANDIDATE_JOURNEY.md` claims it outputs `TranscriptLine` records.
*   **Gap**: How do transcript lines get into the database? 
*   **Resolution Required**: We MUST define an internal API route on `apps/web` (e.g., `POST /api/internal/transcripts/batch`) OR introduce a specific stream event (e.g., `Transcript.Streamed`) that `apps/worker` consumes to batch-insert lines. Relying on "magic" persistence breaks the architecture.

## P1 — Important Deficiencies

### P1-1: Missing Internal API for Plan Handoff
*   **Conflict**: `docs/37_SERVICE_CONTRACTS.md` states the Web app generates a token containing the `InterviewPlan` to hand off to the WebRTC service. 
*   **Gap**: JWTs have strict size limits. An `InterviewPlan` contains a large LLM-generated syllabus and memory lists. It cannot fit in a token securely.
*   **Resolution Required**: The token should only contain the `interviewId`. We must define a secure internal API (`GET /api/internal/interviews/:id/plan`) that `services/ai-interviewer` can call to fetch the plan from `apps/web` at startup.

### P1-2: Dispute Propagation Logic Undefined
*   **Conflict**: `docs/36_API_CONTRACTS.md` defines `POST /api/memory/:id/dispute`.
*   **Gap**: When a candidate disputes a memory, does the UI update instantly, or does the worker process it? `docs/38_EVENT_CONTRACTS.md` says the UI fires the event and the Worker handles it. But changing a state from `CONFIRMED` to `DISPUTED` is a synchronous DB update. Pushing it to a worker is unnecessary complexity.
*   **Resolution Required**: The Web API should synchronously update the memory state to `DISPUTED` and simply emit the event for audit logging. No async worker needed for a direct user override.

## P2 — Improvements

### P2-1: 24-Hour Retention Trigger Missing
*   **Conflict**: The Master Architecture specifies that `ABORTED` interviews persist for 24 hours for safety review before deletion.
*   **Gap**: Who executes the deletion? There is no cron job or scheduled event defined in `docs/38_EVENT_CONTRACTS.md`.
*   **Resolution Required**: Add a `System.Housekeeping` cron event or use an SQS visibility delay to trigger deletion 24 hours after an `Interview.Aborted` event.

### P2-2: Missing Evaluation Retry Rules
*   **Gap**: If the LLM goes down during evaluation, how does the state transition from `EVALUATING` back to something safe, or does it hang?
*   **Resolution Required**: Define strict timeout limits on the worker and a DLQ (Dead Letter Queue) strategy.

## Summary Status
The Journey, API, Service, and Event contracts are 90% solid. However, the **P0-1** and **P1-1** gaps represent fundamental breaks in how the WebRTC service communicates with the rest of the stack. These must be patched in the design before we type `npm run dev`.
