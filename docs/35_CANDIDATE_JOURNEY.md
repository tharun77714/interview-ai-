# Candidate Journey

This document defines the complete lifecycle of a candidate interacting with the platform.

## 1. Signup / Authentication
*   **Actor**: Unregistered User
*   **Input**: Email, Password / OAuth Provider Token
*   **Output**: Auth Session Token (Supabase JWT), `User` record
*   **State changes**: User created
*   **Events emitted**: `User.Created`
*   **Failure cases**: Email exists, weak password, auth provider down

## 2. Profile Creation
*   **Actor**: Registered User
*   **Input**: Target Role (e.g., "Senior Frontend Engineer")
*   **Output**: `CandidateProfile` record
*   **State changes**: Profile initialized
*   **Events emitted**: `Profile.Created`
*   **Failure cases**: Invalid payload, DB timeout

## 3. Resume Upload
*   **Actor**: Candidate
*   **Input**: PDF/Docx File
*   **Output**: `Resume` record (parsed data, S3 URL)
*   **State changes**: Resume added to profile context
*   **Events emitted**: `Resume.Uploaded`, `Resume.Parsed`
*   **Failure cases**: Unsupported file type, extraction failure, S3 upload fail

## 4. Job Description (JD) Upload
*   **Actor**: Candidate
*   **Input**: Raw text or URL of the JD
*   **Output**: `JobDescription` record (parsed requirements)
*   **State changes**: JD added to profile context
*   **Events emitted**: `JobDescription.Parsed`
*   **Failure cases**: Malformed text, extraction failure

## 5. Interview Configuration
*   **Actor**: Candidate
*   **Input**: Selected `Resume ID`, selected `JobDescription ID`
*   **Output**: `Interview` record in `REQUESTED` state
*   **State changes**: `Interview.state = REQUESTED`
*   **Events emitted**: `Interview.Requested`
*   **Failure cases**: Invalid IDs, missing profile

## 6. Interview Planning
*   **Actor**: Async Planner Worker (triggered by `Interview.Requested`)
*   **Input**: Active Resume, Active JD, Top `CONFIRMED` weaknesses (max 3), Top `RESOLVED` strengths (max 1)
*   **Output**: `InterviewPlan` record (syllabus, `targetedMemoryItemIds`)
*   **State changes**: `Interview.state = PLANNED`
*   **Events emitted**: `Interview.Planned`
*   **Failure cases**: LLM timeout, hallucinated schema, context window exceeded

## 7. Interview Session (Live)
*   **Actor**: Candidate & `services/ai-interviewer`
*   **Input**: Voice audio, Interview ID token
*   **Output**: Streamed WebRTC responses, appended `TranscriptLine` records
*   **State changes**: `Interview.state = STARTED` -> `Interview.state = COMPLETED` (or `ABORTED`)
*   **Events emitted**: `Interview.Started`, `Interview.Completed`, `Interview.Aborted`
*   **Failure cases**: Candidate disconnects (`ABORTED`), WebRTC failure, AI latency spikes

## 8. Post-Interview Processing & Evaluation
*   **Actor**: Async Evaluation Worker
*   **Input**: `Interview.Completed` event, `Media.Finalized` (or `Transcript.Finalized` fallback)
*   **Output**: `Evaluation` records (with `confidence_score` and `evidence_quote`), `CoachingFeedback`
*   **State changes**: `Interview.state = EVALUATING`
*   **Events emitted**: `Evaluation.Completed`, `Evaluation.Failed`
*   **Failure cases**: S3 sync hang (fallback to text), LLM hallucination, Context window limit

## 9. Report Generation
*   **Actor**: Async Evaluation Worker
*   **Input**: All `Evaluation` records for the interview
*   **Output**: `Report` record (final 0-100 score, executive summary)
*   **State changes**: `Interview.state = REPORT_GENERATED`
*   **Events emitted**: `Report.Generated`
*   **Failure cases**: Math failure, missing evaluations

## 10. Memory Update
*   **Actor**: Async Evaluation Worker
*   **Input**: `Evaluation` scores, previous `MemoryItem` states
*   **Output**: New/Updated `MemoryItem` and `MemoryDetection` records
*   **State changes**: `Interview.state = PROGRESS_UPDATED`. Memory items transition (e.g., `OBSERVED` -> `CONFIRMED`)
*   **Events emitted**: `Memory.ItemObserved`, `Memory.ItemConfirmed`, `Memory.ItemResolved`, `Memory.Updated`
*   **Failure cases**: Unique constraint violation (multiple detects), low confidence abort (Worker intentionally skips)

## 11. Dashboard Progress & Review
*   **Actor**: Candidate
*   **Input**: GET requests to APIs
*   **Output**: Dashboard UI showing trends, reports, and active memories
*   **State changes**: None (Read-only), unless Candidate disputes a memory (`DISPUTED`)
*   **Events emitted**: `Memory.ItemDisputed`
*   **Failure cases**: DB read timeout
