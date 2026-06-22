# DOMAIN RISKS

Even with a refined architecture and strict Confidence Memory models, certain domain modeling decisions carry inherent risks. We must document these to prevent future technical debt.

## 1. Memory Poisoning vs. False Negatives (The "Stubborn User" Risk)
*   **The Risk**: The Confidence Model prevents "Hallucination Poisoning" (AI permanently biasing a user over a mistake). However, it introduces the risk of **False Negatives**. If a candidate has a fragile ego or is stubbornly blind to their own faults, they might `DISPUTE` every valid weakness they receive.
*   **The Impact**: The platform devolves into a generic question bank. The AI attempts to reinstate memories via passive testing, but the "Double-Dispute Kill Switch" permanently `ARCHIVE`s the trait. The candidate loses all personalized coaching value.
*   **Mitigation**: We must implement a "Coaching Bias" metric. If a user triggers the Double-Dispute Kill Switch on > 50% of their critical feedback, the platform UI should pivot to present feedback as "Alternative Perspectives" rather than "Weaknesses," and suggest lowering the "Interviewer Strictness" setting to reduce defensive friction.

## 2. Data Ownership Risks (Soft Delete vs Hard Delete)
*   **The Risk**: If a candidate deletes their account or deletes a `Resume`, but we have generated `Reports` based on that resume, do we delete the reports?
*   **The Impact**: Hard deleting breaks the `Interview` context. Keeping it violates GDPR/CCPA if the user requested total deletion.
*   **Mitigation**: The domain must support cascading hard deletes for user-requested account deletion. For simple `Resume` deletion, we must retain the *parsed JSON extract* attached to the `Interview` entity, while deleting the actual file URL from S3, ensuring the historical report remains readable but the physical document is gone.

## 3. Future Recruiter-Platform Conflicts
*   **The Risk**: We are currently designing a B2C candidate-first platform. If we pivot to B2B (Recruiters paying to interview candidates), the ownership of the `Interview` changes. 
*   **The Impact**: If an `Interview` is currently owned by a `CandidateProfile`, what happens when a Recruiter initiates it? Who owns the `Report`?
*   **Mitigation**: We must ensure the `Interview` entity has an optional `Initiator_ID` or `Organization_ID`. For V1 B2C, this is null. When B2B launches, we can safely grant read-access to the Organization without fundamentally breaking the candidate's ownership of the data.

## 4. Modeling Mistakes: The "Transcript" Bottleneck
*   **The Risk**: If we model `TranscriptLine` as heavily relational (e.g., tying every single word to a specific foreign key), database inserts during a live WebRTC session will cause extreme lock contention.
*   **The Impact**: Live interview latency spikes.
*   **Mitigation**: `TranscriptLine` should be treated as a highly denormalized append-only log, or even batched and flushed to the DB in chunks, rather than executing an `INSERT` statement for every single sentence the user speaks.

## 5. User Trust Risks (The "Creepy" Factor)
*   **The Risk**: The AI's ability to recall past projects and reinstate disputed weaknesses is powerful, but if presented poorly, it feels dystopian, intrusive, and combative.
*   **The Impact**: Users feel attacked and abandon the platform.
*   **Mitigation**: Reinstated memories must be presented via a specialized "Burden of Proof" UI that clearly, calmly cites transcript evidence from the last 3 interviews. The system prompts generating the AI's live dialogue must be heavily fine-tuned to use psychological safety framing.
