# MASTER ARCHITECTURE CONSTITUTION

*This document serves as the single source of truth for the AI Interview Platform prior to database and implementation phases.*

---

## 1. Product Vision
*   **Mission**: Build a world-class AI Interview Preparation Platform that provides objective, actionable, and highly personalized coaching.
*   **Users**: College Students, Freshers, Experienced Professionals (Technical & Non-Technical).
*   **Core Value Proposition**: The platform does not just assess; it remembers. The Candidate Memory model allows the AI to act as a long-term coach, tracking growth and adapting its strictness over time.
*   **Non-Goals**: No B2B Recruiter features (in V1). No emotion AI/facial analysis. No generic "fluffy" feedback without direct transcript evidence.

---

## 2. System Architecture
A modular monolith deployed via Turborepo:
*   `apps/web`: Next.js 15 App Router monolith serving the UI, Auth, and HTTP API layer.
*   `apps/worker`: Node.js async worker processing LLM evaluation queues and memory state transitions.
*   `services/ai-interviewer`: Node.js/WebRTC real-time engine handling low-latency voice streaming.
*   `packages/ai`: Strict, vendor-agnostic LLM interface (OpenAI/Gemini abstraction).
*   `packages/database`: Drizzle ORM schema and strict query helpers.
*   `packages/shared`: Zod schemas and constants utilized across all boundaries.

---

## 3. Domain Architecture
*   **User**: Root identity & billing.
*   **CandidateProfile**: Demographic target info. (Aggregate root for Candidate context).
*   **Resume**: Parsed structured experience (Soft-linked to interviews).
*   **JobDescription (JD)**: Target rubric (Soft-linked to interviews).
*   **MemoryItem**: A specific behavioral/technical trait tracked over time.
*   **Interview**: The core event. (Aggregate root for Session context).
*   **InterviewPlan**: The AI's dynamically generated syllabus.
*   **TranscriptLine**: Highly denormalized append-only log of the conversation.
*   **Evaluation**: An LLM-generated score against a specific dimension, with exact quote evidence.
*   **Report**: The aggregated 0-100 scorecard.
*   **CoachingFeedback**: Targeted advice explicitly linked to the bottom 2 Evaluations.

---

## 4. Interview Lifecycle
1.  **REQUESTED**: User triggers interview creation.
2.  **PLANNED**: Async AI generates `InterviewPlan`.
3.  **STARTED**: Live WebRTC audio stream connects.
4.  **COMPLETED**: User ends session.
5.  *(Transient)*: Awaiting S3 Upload & Transcript Flush.
6.  **EVALUATING**: Async Evaluation Worker runs Prompt Chains.
7.  **REPORT_GENERATED**: Scores and Coaching generated. User notified.
8.  **PROGRESS_UPDATED**: Candidate Memory updated. (Terminal State).
*(Failure States: `ABORTED` if dropped live. `EVALUATION_FAILED` if worker DLQ'd).*

---

## 5. Candidate Memory Architecture
Strict Confidence State Machine protecting user agency:
*   `OBSERVED`: Detected once. Hidden.
*   `CONFIRMED`: Detected in 2 of 3 relevant interviews within 6 months. Active.
*   `DISPUTED`: User explicitly disagreed. Hidden from Planner.
*   `CONFIRMED` (Reinstated): Passively detected in 3 consecutive relevant interviews. "Burden of Proof" report shown.
*   `RESOLVED`: Candidate successfully overcame weakness. Used for praise.
*   `ARCHIVED`: Double-Dispute Kill Switch triggered, or decayed past 12 months. Dead.

---

## 6. Candidate Context Model
*   **Planning Context**: Active Resume + Active JD + Top `CONFIRMED` weaknesses + `RESOLVED` strengths.
*   **Context Budgeting**: Rule of 3 (Max 3 Weaknesses). Rule of 1 (Max 1 Strength). Semantic prioritization based on current JD.
*   **Live Context**: The WebRTC service cannot query the database. It only sees the compiled `InterviewPlan` injected upon socket connection.

---

## 7. Evaluation Architecture
*   **Parallel Dimensions**: Technical (Correctness/Edge cases), Behavioral (STAR method), Communication (Pacing/Clarity).
*   **Evidence-Based**: No feedback is generated without a `TranscriptLine` quote.
*   **Confidence Model**: Short interviews (< 2 mins data) trigger `confidence_score: 0` instead of a hallucinated failure.

---

## 8. Event Architecture
*   `Interview.Requested`, `Interview.Planned`, `Interview.Started`, `Interview.Completed`, `Interview.Aborted`.
*   `Media.Finalized`: The true trigger for evaluation queues.
*   `Evaluation.Failed`, `Report.Generated`.
*   `Memory.ItemObserved`, `Memory.ItemConfirmed`, `Memory.ItemDisputed`, `Memory.ItemReinstated`, `Memory.ItemResolved`, `Memory.ItemArchived`.

---

## 9. Database Architecture
*   **Transactional**: `User`, `CandidateProfile`, `Interview`.
*   **Append-Only**: `TranscriptLine` (flushed in batches, minimal indexing).
*   **JSONB/Analytical**: `Evaluation`, `Report`, `CoachingFeedback` (LLM schema evolution).
*   **Retention**: Last 10 COMPLETED interview `.mp4` S3 files. Reports and Progress kept forever. `ABORTED` interviews hard-deleted instantly.

---

## 10. API Boundaries
*   `apps/web`: MUST NOT run LLM batches.
*   `apps/worker`: MUST NOT serve UI or HTTP endpoints.
*   `services/ai-interviewer`: MUST NOT perform post-evaluations or generate coaching.
*   `packages/ai`: MUST NOT connect to the database.
*   `packages/database`: MUST NOT execute external HTTP requests.

---

## 11. Consolidated Risk Register
1.  **Memory Corruption (Concurrency)**: Requires strict distributed locking or `SELECT FOR UPDATE` when calculating Memory State transitions.
2.  **Transcript IOPS Explosion**: Millions of lines risk DB starvation. V1 limits indexing. V2 requires table partitioning.
3.  **JSONB Bloat**: API layer must avoid `SELECT *` on reports to prevent RAM saturation.
4.  **Stubborn User (False Negatives)**: Users hitting the "Double Dispute Kill Switch" on all feedback blind the AI. Mitigated via a "Coaching Bias" metric that pivots the UI to gentler "Alternative Perspectives."
5.  **S3 Vendor Lock-in / Hangs**: If S3 upload hangs, the pipeline must timeout and evaluate solely on text transcripts to prevent frozen states.
