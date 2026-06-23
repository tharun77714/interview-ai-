# Phase 7 Patch Review (Hostile Audit)

Acting as the hostile CTO, I have audited the newly proposed **Redis Stream Ingestion** and **Internal Plan Handoff** mechanisms.

## Task 3: Breaking the Solutions

### 1. Attacking the Redis Stream Ingestion
*   **Vector**: Redis instance crashes during the interview.
*   **Result**: `services/ai-interviewer` attempts `XADD` and fails. 
*   **Risk (P1)**: The candidate keeps talking, but the transcript is lost. Without a transcript, there is no evidence. Without evidence, there is no evaluation.
*   **Mitigation Required**: `services/ai-interviewer` MUST maintain a local circular buffer in memory. If Redis drops, it buffers the lines locally and attempts a massive `XADD` burst when Redis reconnects. If Redis is down for > 3 minutes, the interview must be forcefully `ABORTED` with an apology to prevent unrecorded tests.

### 2. Attacking the Interview Plan Handoff
*   **Vector**: `apps/web` is under heavy load or cold-booting, causing the internal API `GET /api/internal/interviews/:id/plan` to take > 3 seconds.
*   **Result**: The candidate connects to the socket and says "Hello?", but the AI Interviewer is blocked waiting for the plan to arrive over HTTP.
*   **Risk (P1)**: Severe UX degradation. 3 seconds of dead air kills the illusion of a live conversational AI.
*   **Mitigation Required**: The Web App MUST trigger the plan generation and preemptively cache it in Redis under `plan:{interviewId}` *before* allowing the candidate to see the "Connect" button in the UI. The AI Interviewer service should fetch the plan from Redis instantly, falling back to the HTTP internal API only if Redis expires.

## Updated Readiness Score
*   **Phase 6 (DB)**: 100% Ready.
*   **Phase 7 (Contracts)**: 95% Ready.

## Output Requirements Addressed
1.  **Chosen V1 Architecture**: Redis Stream for transcript ingestion; Internal Secure HTTP (backed by Redis cache) for Plan Handoff.
2.  **Alternatives Rejected**: We rejected the "Internal API Polling" for transcripts due to massive IOPS scaling risks. We rejected "JWT payloads" for the plan due to strict header size limits.
3.  **Updated Risks**: Local memory buffering is now a strict requirement for the AI service. Pre-fetching is a strict UX requirement for the frontend.
4.  **Remaining Blockers**: None. The architecture is sufficiently patched to begin Phase 8 (Feature Implementation).
