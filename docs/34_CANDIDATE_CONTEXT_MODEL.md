# CANDIDATE CONTEXT MODEL

As the Candidate Memory graph grows over months or years, feeding the entire history into an LLM context window will cause "Lost in the Middle" hallucination, latency spikes, and severe bias. This document defines the strict context boundaries for the AI.

## 1. Interview Planning Context

The `InterviewPlan` is generated asynchronously before the interview starts. It has the luxury of time and token depth, but it must still be aggressively filtered.

### Allowed Information
*   **Target Rubric**: The active `JobDescription` (if provided).
*   **Candidate Baseline**: The active `Resume` parsed JSON (if provided).
*   **Active Weaknesses**: A strict subset of `CONFIRMED` MemoryItems.
*   **Recent Growth**: A strict subset of `RESOLVED` MemoryItems.

### Prohibited Information
*   Historical raw `TranscriptLines`.
*   Historical `Reports` or granular `Evaluations` (we only use the abstracted `MemoryItems`).
*   Old Resumes or JDs from previous unrelated sessions.

## 2. Live Interview Context

The `services/ai-interviewer` operates in real-time. Milliseconds matter. The Live Interviewer is computationally isolated from the database and relies entirely on a compiled payload injected at connection time.

### Allowed Information
*   **The Generated Syllabus**: The `InterviewPlan` created in Step 1.
*   **Candidate Persona**: High-level metadata (e.g., "Name: Alex", "Target Role: Senior Backend Engineer").
*   **Actionable Coaching Triggers**: Specific instructions derived from the plan (e.g., "If Alex uses the word 'like' more than 3 times, gently remind him to pause.").

### Prohibited Information
*   **No Database Access**: The live interviewer cannot query Postgres.
*   **No Raw Memory State**: It does not know what `CONFIRMED` or `OBSERVED` means. It only executes the `InterviewPlan`.

## 3. Context Budgeting Strategy

To prevent context explosion and AI anchoring (where the AI focuses *only* on weaknesses and ignores the actual mock interview topic), we enforce strict Payload Budgets during Planning:

*   **Prioritization**: MemoryItems are ranked by their vector-similarity to the current `JobDescription`. If the user is interviewing for a Frontend role, their `CONFIRMED` weakness in SQL indexing is silently ignored for this session.
*   **The "Rule of 3" (Weaknesses)**: The Interview Planner is allowed to inject a maximum of **3** relevant `CONFIRMED` weaknesses into the syllabus. 
*   **The "Rule of 1" (Strengths)**: The Interview Planner is allowed to inject a maximum of **1** relevant `RESOLVED` weakness to be used for positive reinforcement.
*   **Recency Decay**: Any MemoryItem older than 6 months that has not been re-validated is excluded from the active planning context.

## 4. Memory Selection Rules

The pipeline enforces strict filtering before data reaches the AI Planner:

*   **`OBSERVED` (Excluded)**: Never passed to the Planner. It is unverified and could be a hallucination.
*   **`CONFIRMED` (Included)**: Passed to the Planner (subject to the Rule of 3). It represents a verified area for improvement.
*   **`DISPUTED` (Excluded)**: Never passed to the Planner. The AI is intentionally blinded to this trait to prevent it from aggressively trying to "prove the user wrong."
*   **`RESOLVED` (Included)**: Passed to the Planner (subject to the Rule of 1). It allows the AI to acknowledge growth and build psychological safety.

## 5. Architecture Risks

*   **Stale Memories**: Even with the 6-month decay rule, a candidate might intensively study a framework over a weekend. If the AI aggressively attacks a 5-month-old weakness they have already fixed, it creates a frustrating experience. 
    *   *Mitigation*: The `CandidateProfile` UI must allow users to manually flag a weakness as "I've studied this, test me."
*   **Memory Bias (Unfair Interviews)**: If the Planner injects too many weaknesses, the AI might act excessively hostile, turning a standard HR screen into a grueling interrogation.
    *   *Mitigation*: The "Rule of 3" budget acts as a hard ceiling.
*   **Context Explosion**: System prompts that exceed 2,000 tokens often cause conversational AIs to forget the primary instruction (e.g., "Conduct a 15-minute interview") and fixate entirely on the context payload.
    *   *Mitigation*: The compiler that builds the system prompt must truncate text strictly, prioritizing the `JobDescription` over `CandidateMemory`.
