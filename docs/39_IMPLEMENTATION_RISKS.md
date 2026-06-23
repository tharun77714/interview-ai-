# Phase 7 Implementation Risks

This document highlights critical technical risks specific to the API and Event contracts defined in Phase 7.

## 1. WebRTC to Database Gap (Resolved via Redis Stream)
The architecture explicitly forbids `services/ai-interviewer` from connecting directly to the database.
*   **Risk**: If it cannot write to the DB, and it cannot call the Web API (too slow for streams), how does the transcript persist?
*   **Mitigation**: (Implemented Phase 7 Patch) Introduced a Redis Stream `transcripts:stream`. `services/ai-interviewer` pushes lightweight messages (`XADD`), and `apps/worker` consumes them in batches to write to the DB.

## 2. Event Payload Sizes (Medium Risk)
*   **Risk**: If `Transcript.Finalized` or `Interview.Planned` attempts to pass the *entire* transcript or syllabus in the event payload, message brokers will choke or hit size limits (e.g., SQS 256KB limit).
*   **Mitigation Requirement**: Event payloads MUST remain strictly ID-based reference pointers. Consumers must fetch the actual data from the database.

## 3. Distributed Transaction Failure (High Risk)
*   **Risk**: `apps/worker` calculates evaluations, generates reports, and updates memory sequentially. If the worker crashes *after* saving evaluations but *before* saving memory updates, the state machine is left hanging (`EVALUATING` forever).
*   **Mitigation Requirement**: Drizzle transactions must wrap the entire report generation and memory update phase. If memory math fails, the report should not be marked `REPORT_GENERATED`.

## 4. Polling vs WebSockets for UI Updates (Medium Risk)
*   **Risk**: `apps/web` consumes `Interview.Planned` and `Report.Generated` to update the candidate UI. If built with HTTP polling, it will DDoS the database.
*   **Mitigation Requirement**: Use Supabase Realtime or custom WebSockets tied to the `interview_id` channel.

## 5. Idempotency in Memory Math (Critical Risk)
*   **Risk**: Event retries (e.g., SQS delivery at-least-once) could cause `apps/worker` to process `Media.Finalized` twice for the same interview, double-counting memory detections.
*   **Mitigation**: The Phase 6 Database constraint `UNIQUE(memory_item_id, interview_id)` physically prevents this at the database layer. This risk is effectively mitigated by the schema.
