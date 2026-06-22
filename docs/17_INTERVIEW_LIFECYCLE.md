# INTERVIEW LIFECYCLE

The `Interview` is the most complex state machine in the domain. It requires strict transition logic to prevent asynchronous race conditions.

## State Machine Overview

### 1. REQUESTED
*   **Trigger**: User clicks "Start Interview", providing optional Resume/JD IDs and selecting parameters (Type, Personality).
*   **Action**: System creates the `Interview` record.
*   **Transition**: Automatically moves to `PLANNED` once the AI Worker finishes generating the `InterviewPlan`.

### 2. PLANNED
*   **Trigger**: The `InterviewPlan` is saved.
*   **Action**: The UI displays "Ready to Start". WebRTC connection tokens are generated.
*   **Transition**: Moves to `STARTED` when the user connects their microphone/camera and the AI greets them.

### 3. STARTED (Live)
*   **Trigger**: WebRTC connection established.
*   **Action**: `TranscriptLines` are rapidly appended. Audio/Video is streamed. AI LLM loop is active.
*   **Transition**: Moves to `COMPLETED` when the AI ends the conversation or the user clicks "End Interview".
*   **Failure State**: Moves to `ABORTED` if the user drops connection for > 60 seconds without reconnecting.

### 4. COMPLETED
*   **Trigger**: WebRTC session terminates successfully.
*   **Action**: The WebRTC provider begins compositing the final `.mp4` and pushing it to S3.
*   **Transition**: Moves to `EVALUATING` once the S3 webhook confirms the media is safely stored and the final transcript is flushed to the DB.

### 5. EVALUATING (Async)
*   **Trigger**: Background worker picks up the job.
*   **Action**: AI runs prompt chains to generate `Evaluations`, `Report`, and `CoachingFeedback`.
*   **Transition**: Moves to `REPORT_GENERATED` when the worker completes successfully.
*   **Failure State**: Moves to `EVALUATION_FAILED` if the LLM API times out or hallucinates an invalid JSON schema. The job is placed in a Dead Letter Queue for retry.

### 6. REPORT_GENERATED
*   **Trigger**: All evaluations are saved to the DB.
*   **Action**: Push notification/email sent to Candidate. UI unlocks the report view.
*   **Transition**: Instantly moves to `PROGRESS_UPDATED`.

### 7. PROGRESS_UPDATED (Terminal State)
*   **Trigger**: The `CandidateMemory` worker finishes consuming the new `Report`.
*   **Action**: 
    1. Extracts traits and attempts to map them to existing `MemoryItem` entities.
    2. Any newly detected weakness is added as `OBSERVED` (not yet trusted).
    3. Any repeated weakness is promoted to `CONFIRMED`.
    4. Any resolved weakness is promoted to `RESOLVED`.
*   **Transition**: The lifecycle is fully complete.

---

## Failure Recovery Strategy
*   **`ABORTED`**: Interviews < 2 minutes long are hard-deleted to save DB space. Interviews > 2 minutes are kept, but no evaluation is run.
*   **`EVALUATION_FAILED`**: The UI shows "Evaluating... (Taking longer than expected)". The worker automatically retries 3 times with exponential backoff before alerting engineering.
