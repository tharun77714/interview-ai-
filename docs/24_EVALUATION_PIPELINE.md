# EVALUATION PIPELINE

This document defines the exact sequential orchestration of events from the moment the WebRTC session drops to the final Candidate Memory update.

## Pipeline Sequence

### 1. Interview Termination
*   **Trigger**: WebRTC session ends.
*   **Action**: The `Interview` state is updated to `COMPLETED`. The real-time service signals the Media Processor.

### 2. Media Post-Processing & Transcript Finalization
*   **Trigger**: Media Processor completes S3 upload (`Media.UploadedToS3`) OR the 3-minute fail-safe timer triggered by `Transcript.Finalized` expires.
*   **Action**: The final buffered `TranscriptLine` records are flushed to the database. The `Interview` record is locked for evaluation. If triggered by the fail-safe, the pipeline is instructed to skip video analysis.
*   **Transition**: A job is pushed to the `Evaluation Queue`.

### 3. Granular Dimension Evaluation (Parallel)
*   **Trigger**: Worker picks up the Evaluation job.
*   **Action**: The AI evaluates the transcript against specific, isolated rubrics. Instead of one massive LLM call, we run parallel, focused LLM calls (e.g., Technical Accuracy, Communication Clarity, Behavioral STAR method). 
*   **Output**: Multiple `Evaluation` rows are saved to the database.

### 4. Report Aggregation
*   **Trigger**: All Granular Evaluations complete successfully.
*   **Action**: A synthesis LLM call is made to aggregate the granular scores into a single cohesive scorecard, smoothing out any inconsistencies and calculating the final 0-100 score.
*   **Output**: The `Report` row is saved.

### 5. Coaching Generation
*   **Trigger**: `Report` is saved.
*   **Action**: The AI targets the 2 lowest-scoring `Evaluation` dimensions and generates highly specific, actionable advice (e.g., "When asked X, you said Y. Instead, try Z.").
*   **Output**: `CoachingFeedback` rows are saved, explicitly linked to the `Evaluation` rows.

### 6. Candidate Memory Update (Terminal)
*   **Trigger**: `CoachingFeedback` is saved.
*   **Action**: The pipeline compares the newly generated `Evaluations` against the candidate's historical `MemoryItems`. It calculates transitions (e.g., `OBSERVED` -> `CONFIRMED`, or `CONFIRMED` -> `RESOLVED`).
*   **Output**: `CandidateMemory` is updated. 

### 7. Pruning & Notification
*   **Action**: The system fires an asynchronous "Prune Old Videos" job to respect the 10-video limit. Finally, a push notification/email is sent to the user indicating their Report is ready.
