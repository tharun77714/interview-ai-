# Event Contracts

This document defines the asynchronous events that drive the platform's state machines.

## 1. Interview Events

### `Interview.Requested`
*   **Producer**: `apps/web`
*   **Consumer**: `apps/worker`
*   **Payload**: `{ interviewId, candidateProfileId, resumeId, jobDescriptionId }`
*   **Retry Behavior**: Exponential backoff up to 3 times.
*   **Failure Handling**: Transitions interview state to `ABORTED` if Planner fails.

### `Interview.Planned`
*   **Producer**: `apps/worker`
*   **Consumer**: `apps/web` (WebSockets/UI update)
*   **Payload**: `{ interviewId }`
*   **Retry Behavior**: Fire and forget. UI polls fallback.

### `Interview.Started`
*   **Producer**: `services/ai-interviewer`
*   **Consumer**: `apps/web`
*   **Payload**: `{ interviewId, startedAt }`

### `Interview.Completed`
*   **Producer**: `services/ai-interviewer`
*   **Consumer**: `apps/web`
*   **Payload**: `{ interviewId, completedAt }`
*   **Note**: This is purely a UI signal. It does NOT trigger evaluation.

### `Interview.Aborted`
*   **Producer**: `services/ai-interviewer` (on drop) or `apps/worker` (on fatal error)
*   **Consumer**: `apps/web`
*   **Payload**: `{ interviewId, reason }`

---

## 2. Media & Processing Events

### `TranscriptLine.Streamed`
*   **Producer**: `services/ai-interviewer` (appends to Redis Stream)
*   **Consumer**: `apps/worker` (reads via XREADGROUP)
*   **Payload**: `{ interviewId, speaker, text, timestampStartMs, timestampEndMs }`
*   **Retry Behavior**: Redis Streams hold the message until `XACK`ed. The worker fetches pending messages on restart.
*   **Role**: Safely buffers massive DB inserts, averting IOPS explosion.

### `Transcript.Finalized`
*   **Producer**: `services/ai-interviewer` (flushes remaining buffer to DB)
*   **Consumer**: `apps/worker`
*   **Payload**: `{ interviewId, lineCount }`
*   **Retry Behavior**: Critical. Must succeed. Retries indefinitely with jitter.
*   **Role**: Fallback evaluation trigger. If `Media.Finalized` doesn't arrive within 3 minutes of this event, the worker evaluates based solely on text.

### `Media.Finalized`
*   **Producer**: S3 Webhook / `apps/web` media processor
*   **Consumer**: `apps/worker`
*   **Payload**: `{ interviewId, videoUrl }`
*   **Role**: Primary trigger for the Evaluation pipeline.

---

## 3. Evaluation Events

### `Evaluation.Completed`
*   **Producer**: `apps/worker`
*   **Consumer**: `apps/worker` (Internal orchestration)
*   **Payload**: `{ interviewId }`
*   **Role**: Signals that all dimension prompts have finished.

### `Report.Generated`
*   **Producer**: `apps/worker`
*   **Consumer**: `apps/web` (UI Notification)
*   **Payload**: `{ interviewId, reportId }`
*   **Failure Handling**: If report generation fails, emit `Evaluation.Failed`.

### `Evaluation.Failed`
*   **Producer**: `apps/worker`
*   **Consumer**: `apps/web`
*   **Payload**: `{ interviewId, errorReason }`

---

## 4. Memory Events

### `Memory.ItemObserved` / `Memory.ItemConfirmed` / `Memory.ItemResolved`
*   **Producer**: `apps/worker`
*   **Consumer**: `apps/web` (Notification)
*   **Payload**: `{ memoryItemId, oldState, newState, interviewId }`

### `Memory.ItemDisputed`
*   **Producer**: `apps/web` (Candidate clicks dispute)
*   **Consumer**: `apps/worker`
*   **Payload**: `{ memoryItemId, interviewId, reason }`
*   **Role**: Instantly sets state to `DISPUTED`. Removes memory from future `InterviewPlan` generation.

### `Memory.Updated`
*   **Producer**: `apps/worker`
*   **Consumer**: `apps/web`
*   **Payload**: `{ candidateProfileId }`
*   **Role**: Batch event emitted after all memory math for an interview concludes. Signals the UI to refresh the dashboard.
