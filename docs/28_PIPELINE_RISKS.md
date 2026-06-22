# PIPELINE RISKS

The orchestrated evaluation pipeline introduces new distributed system risks that must be mitigated before coding begins.

## 1. Race Conditions & Duplicate Evaluations
*   **The Risk**: A user impatiently double-clicks the "End Interview" button, causing the WebRTC service to fire two identical "Interview Completed" webhook events.
*   **The Impact**: Two identical jobs enter the Queue. The AI runs twice. Two Reports are generated. Database constraints crash or Candidate Memory receives double-counted weaknesses.
*   **Mitigation**: The state transition mechanism must guarantee atomic, single-execution locks. The system must ensure that only the first request successfully transitions the interview state, and any concurrent duplicate requests are immediately rejected.

## 2. Memory Corruption Risks
*   **The Risk**: The user completes two interviews (Interview A and Interview B) back-to-back. The worker queues take a long time. Both evaluations finish at the exact same millisecond and attempt to update `CandidateMemory` concurrently.
*   **The Impact**: The "3 consecutive detections" rule calculates incorrectly because both workers read the same stale database state before writing their updates.
*   **Mitigation**: Memory state transitions must be strictly serialized to prevent concurrent modification. The architecture requires a pessimistic locking strategy or distributed lock on the Candidate entity to guarantee that multiple concurrent evaluation workers cannot calculate memory state transitions from stale data.

## 3. Transcript Flushing Failures
*   **The Risk**: The WebRTC session ends, but the final 10 seconds of the `TranscriptLine` buffer fails to write to the database due to network latency. The Evaluation Worker begins instantly.
*   **The Impact**: The AI evaluates an incomplete interview, potentially docking points for a "missing conclusion" that the candidate actually provided.
*   **Mitigation**: The Evaluation Queue job must wait for an explicit "Media/Transcript Finalized" webhook from the real-time service, rather than just relying on the WebRTC socket disconnect event.

## 4. Hallucination Feedback Loops
*   **The Risk**: The "Report Aggregation" LLM is tasked with synthesizing the granular evaluations. If it hallucinates, it might contradict the granular evidence (e.g., Granular says "Candidate failed SQL", but Report says "Great SQL skills!").
*   **The Impact**: Deeply confusing candidate experience. Loss of trust.
*   **Mitigation**: The Synthesis prompt must explicitly instruct the LLM to *never* introduce new facts or contradict the provided inputs, and we must utilize strict temperature (e.g., 0.1) for synthesis tasks to guarantee deterministic summarization.
