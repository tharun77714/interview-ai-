# SYSTEM INTERACTIONS

This document models the end-to-end data flow and component interactions for the platform's core workflows.

## 1. Signup Flow
*   **Entry Point**: User lands on `apps/web` and authenticates via Auth Provider (e.g., Clerk/NextAuth).
*   **Components**: `apps/web` -> `packages/database`.
*   **State Transitions**: `User` entity created.
*   **Outputs**: Authentication token, initialized `User` record.

## 2. Candidate Onboarding Flow
*   **Entry Point**: Post-signup redirect in `apps/web`.
*   **Components**: `apps/web` -> `packages/database`.
*   **State Transitions**: `CandidateProfile` created. `CandidateMemory` aggregate initialized.
*   **Outputs**: Target roles and experience levels captured.

## 3. Resume Upload Flow
*   **Entry Point**: Candidate dashboard in `apps/web`.
*   **Components**: `apps/web` -> S3 -> `apps/web` (Parse via `packages/ai`) -> `packages/database`.
*   **State Transitions**: `Resume` record created.
*   **Outputs**: Raw PDF in S3, parsed JSON skills/timeline in database.

## 4. Job Description Upload Flow
*   **Entry Point**: Candidate dashboard in `apps/web`.
*   **Components**: `apps/web` -> `packages/ai` (Parse) -> `packages/database`.
*   **State Transitions**: `JobDescription` record created.
*   **Outputs**: Parsed target rubric.

## 5. Interview Planning Flow
*   **Entry Point**: User clicks "Start Mock Interview".
*   **Components**: `apps/web` -> `packages/ai` -> `packages/database`.
*   **State Transitions**: `Interview` state becomes `REQUESTED` -> `PLANNED`.
*   **Outputs**: `InterviewPlan` syllabus generated based on Resume, JD, and `CONFIRMED` memory traits.

## 6. Interview Start Flow
*   **Entry Point**: User clicks "Join Room".
*   **Components**: `apps/web` <-> `services/ai-interviewer` (WebSocket/WebRTC).
*   **State Transitions**: `Interview` state becomes `STARTED`.
*   **Outputs**: Live audio stream established. AI greets the candidate based on the `InterviewPlan`.

## 7. Live Interview Flow
*   **Entry Point**: Live audio exchange.
*   **Components**: Candidate Audio -> `services/ai-interviewer` -> `packages/ai` -> Candidate Audio.
*   **State Transitions**: None (Maintains `STARTED`).
*   **Outputs**: `TranscriptLine` records continuously flushed to database.

## 8. Interview Completion Flow
*   **Entry Point**: User clicks "End" or AI concludes.
*   **Components**: `services/ai-interviewer` -> `packages/database`. WebRTC provider -> S3.
*   **State Transitions**: `Interview` state becomes `COMPLETED`.
*   **Outputs**: Socket disconnected. Final `TranscriptLine` buffer flushed. S3 upload completes. Job pushed to evaluation queue.

## 9. Evaluation Flow
*   **Entry Point**: Background queue picks up `COMPLETED` interview.
*   **Components**: `apps/worker` -> `packages/ai` -> `packages/database`.
*   **State Transitions**: `Interview` state becomes `EVALUATING` -> `REPORT_GENERATED`.
*   **Outputs**: Granular `Evaluation` rows, synthesized `Report` row, targeted `CoachingFeedback`.

## 10. Report Viewing Flow
*   **Entry Point**: User opens notification or dashboard link.
*   **Components**: `apps/web` -> `packages/database`.
*   **State Transitions**: None (Read-only).
*   **Outputs**: UI rendering of aggregated scores, transcript evidence, and coaching feedback.

## 11. Candidate Memory Update Flow
*   **Entry Point**: Evaluation worker completes Report Generation.
*   **Components**: `apps/worker` -> `packages/database`.
*   **State Transitions**: `Interview` becomes `PROGRESS_UPDATED`. `MemoryItem` entities transition (e.g., `OBSERVED` -> `CONFIRMED`).
*   **Outputs**: Graph of candidate strengths and weaknesses is permanently updated. Oldest video pruned from S3.
