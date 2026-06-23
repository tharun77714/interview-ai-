# Transcript Ingestion Architecture

This document evaluates the options for persisting `TranscriptLine` data from `services/ai-interviewer` into the database without violating architecture boundaries.

## The Problem
*   `services/ai-interviewer` handles live WebRTC and generates transcript lines at high velocity.
*   It is forbidden from directly importing or executing `packages/database` code.
*   The system faces a known "Transcript IOPS Explosion" risk if individual lines trigger raw DB inserts.

## Evaluated Options

### Option A: Internal Ingestion API
`apps/web` exposes a secure `POST /api/internal/transcripts/batch` route. The AI service buffers lines and posts them every 5 seconds.
*   **Latency**: Medium. HTTP handshake overhead.
*   **Complexity**: Low. Standard REST.
*   **Failure Handling**: Brittle. If the API returns 502, the AI service must manage complex retry queues in memory.
*   **Replayability**: None.
*   **Scaling**: Poor. Vercel/Next.js edge functions are not ideal for constant background polling.

### Option B: Redis Stream (Event-Sourced Ingestion)
The AI service appends lines directly to a Redis Stream (`XADD transcripts:stream`). `apps/worker` reads from the stream in a consumer group and executes batch inserts via `packages/database`.
*   **Latency**: Ultra-low. Redis is in-memory.
*   **Complexity**: Medium. Requires a persistent consumer loop.
*   **Failure Handling**: High. If the DB is down, messages remain in the stream.
*   **Replayability**: High. Streams support consumer groups and `XPENDING`/`XCLAIM`.
*   **Scaling**: Extremely High. Protects the DB by batching 100+ lines into a single `INSERT` statement.

### Option C: Cloud Message Queue (SQS)
*   **Latency**: High (relative to Redis).
*   **Complexity**: High. Requires polling mechanisms.
*   **Failure Handling**: High (DLQs).
*   **Replayability**: Low. Once deleted, it's gone.
*   **Scaling**: High, but expensive for millions of tiny string messages.

## Chosen V1 Architecture: Option B (Redis Stream)
**Why**: It specifically neutralizes the "Transcript IOPS Explosion" risk identified in the Master Architecture. It strictly enforces boundaries: the AI service only talks to Redis, and the Worker exclusively talks to the Database. It guarantees that a DB outage will not crash the live voice interview.

### Implementation Contract
1.  `services/ai-interviewer` executes `XADD transcripts:stream * interviewId <id> speaker <speaker> text <text>`.
2.  `apps/worker` consumes via `XREADGROUP`, buffers up to 50 items or 2 seconds, and executes a single batched `INSERT INTO transcript_lines`.
3.  Upon success, `apps/worker` executes `XACK`.
