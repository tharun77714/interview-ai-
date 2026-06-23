# CANDIDATE MEMORY MODEL (SAFETY REVISION)

To prevent AI Hallucination Poisoning (where a single hallucinated evaluation permanently biases future interviews), Candidate Memory operates on a strict Confidence State Machine. 

## Part 1: Memory Confidence Model (The States)

Every `MemoryItem` exists in one of the following states:

1.  **`OBSERVED`**
    *   *Definition*: A trait or weakness detected in exactly one interview.
    *   *Trust Level*: Zero. It is treated as an anomaly or potential hallucination.
    *   *Usage*: It is **NEVER** shown to the user on their public coaching dashboard, and it is **NEVER** used to bias the AI's general behavior.
2.  **`CONFIRMED`**
    *   *Definition*: A trait detected repeatedly across multiple interviews.
    *   *Trust Level*: High.
    *   *Usage*: Added to the candidate's coaching dashboard. Actively used to generate future `InterviewPlans`.
3.  **`DISPUTED`**
    *   *Definition*: A `CONFIRMED` memory that the candidate has explicitly flagged as unfair or incorrect via the UI.
    *   *Trust Level*: Suspended.
    *   *Usage*: Hidden from active coaching. The AI Interview Planner is not allowed to actively attack or bias questions based on this. Used only for silent re-validation by the Evaluation Engine.
4.  **`RESOLVED`**
    *   *Definition*: A previously `CONFIRMED` weakness that the candidate has successfully overcome in recent interviews.
    *   *Trust Level*: Historic.
    *   *Usage*: Used strictly for positive reinforcement ("You used to struggle with this, but you nailed it today!").
5.  **`ARCHIVED`**
    *   *Definition*: A `DISPUTED` memory that failed to be reinstated, a memory older than 12 months, or a reinstated memory that was disputed a second time.
    *   *Trust Level*: Dead (Terminal state).

## Part 2: Repeated Detection Logic

To transition a `MemoryItem` from `OBSERVED` to `CONFIRMED`, it must satisfy the following strict criteria:
*   **Threshold**: The weakness must be detected in **2 out of the last 3 interviews**.
*   **Time Window**: These interviews must occur within a **6-month rolling window**.
*   **Confidence Logic**: If Interview #1 flags "Weakness in System Design", it enters `OBSERVED`. If Interview #2 is a Behavioral interview, the denominator is ignored (the trait wasn't relevant). If Interview #3 is a Technical interview and flags the same weakness, it is promoted to `CONFIRMED`.
*   **Single-Interview Aggregation Rule (P0 Patch)**: A single 45-minute interview might test "System Design" 3 separate times across 3 different questions, yielding 3 separate Evaluation quotes. The database MUST enforce a `UNIQUE(memory_item_id, interview_id)` constraint on detections. The Evaluation Worker must aggregate all evidence for a specific trait within a single interview into a *single* `was_detected` boolean before writing. This prevents a single interview from falsely fulfilling the "2 of 3" rule.

## Part 3: The Dispute & Reinstatement System

We prioritize Candidate Agency. However, the system must handle blind spots (candidates denying real weaknesses) without sparking an "AI vs. Candidate" war.

### Dispute Action
*   **Action**: Candidate clicks "I disagree with this assessment" on a `CONFIRMED` memory trait in their dashboard.
*   **State Change**: `CONFIRMED` ➔ `DISPUTED`.
*   **Visibility**: Hidden from active weaknesses. Ignored by Interview Planner.

### Reinstatement Logic (Silent Passive Testing)
If a memory is `DISPUTED`, the async Evaluation Engine continues to passively monitor for it during future interviews.
*   **The Reinstatement Threshold**: To overturn a user's dispute, the burden of proof is extraordinarily high. The weakness must be passively detected in **3 consecutive relevant interviews**.
*   **State Change**: `DISPUTED` ➔ `CONFIRMED` (Reinstated).
*   **The "Burden of Proof" Report**: When reinstated, the trait reappears on the dashboard with a specialized report quoting exact timestamps and transcripts from the 3 consecutive interviews, proving undeniable behavioral patterns.

### The "Double-Dispute" Kill Switch
To prevent the AI from repeatedly overriding user decisions and creating a toxic feedback loop:
*   If a candidate disputes a **reinstated** `CONFIRMED` memory a *second* time, the state instantly transitions to **`ARCHIVED`**.
*   The AI is permanently blocked from tracking this trait again. User trust and psychological safety supersede perfect assessment accuracy.

## Part 4: Complete Lifecycle State Machine

1. `[NEW]` ➔ **OBSERVED** (Detected once)
2. `OBSERVED` ➔ **CONFIRMED** (Detected in 2 of 3 interviews)
3. `CONFIRMED` ➔ **DISPUTED** (Candidate explicitly disagrees)
4. `DISPUTED` ➔ **CONFIRMED** (Reinstated: Passive detection in 3 consecutive interviews)
5. `CONFIRMED` (Reinstated) ➔ **ARCHIVED** (Double-Dispute Kill Switch. Permanent lock.)
6. `CONFIRMED` ➔ **RESOLVED** (Candidate overcomes weakness naturally)

## Part 5: Interview Planning Impact

The `CandidateMemory` explicitly drives the syllabus for future interviews.

### Impact of `CONFIRMED` Memories
*   **InterviewPlan**: The AI explicitly injects questions designed to test the weakness.
*   **Live Coaching**: The AI is authorized to give real-time hints if the candidate stumbles on this specific topic.

### Impact of `DISPUTED` Memories
*   **InterviewPlan**: The AI is completely blind to the `DISPUTED` memory. It will NOT explicitly plan questions to test it, preventing the AI from acting aggressively to "prove the user wrong."
*   **Evaluation Engine**: The engine retains the memory passively. If the candidate naturally encounters the topic and fails, the engine logs it internally toward the 3-consecutive-detection threshold for reinstatement.
