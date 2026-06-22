# AI EVALUATION STRATEGY

The core value of the platform is accurate, unbiased, and highly actionable feedback. A single monolithic "Evaluate this interview" prompt will result in generic, fluffy outputs. We must utilize a "Chain of Evaluation" strategy.

## 1. Evidence-Based Philosophy
*   **The Rule**: The AI is forbidden from generating a criticism or praise without a direct quote.
*   **The Implementation**: Every generated `Evaluation` must include an `evidence_quote` array mapped directly to timestamps or specific `TranscriptLine` segments.

## 2. Parallel Evaluation Dimensions
The transcript is fed into distinct, isolated prompts simultaneously:

### A. Technical Evaluation
*   *Prompt Focus*: Correctness of algorithms, architecture decisions, and domain-specific knowledge (e.g., React hooks, SQL joins).
*   *Rubric*: Checks for "Optimal Solution", "Edge Cases Missed", "Debugging Speed".

### B. Behavioral Evaluation
*   *Prompt Focus*: Empathy, conflict resolution, ownership, and adherence to the STAR (Situation, Task, Action, Result) method.
*   *Rubric*: Checks for "Clear Result Quantification", "Avoidance of Blame".

### C. Communication Evaluation
*   *Prompt Focus*: Clarity, conciseness, filler words ("um", "like"), and pacing.
*   *Rubric*: Checks for "Rambling/Tangents", "Active Listening" (did they answer the specific question asked?).

## 3. The Confidence Model (Refusal to Score)
*   **The Problem**: If the user only spoke for 15 seconds, forcing the AI to evaluate their Technical abilities will result in a hallucinated, arbitrary score.
*   **The Solution**: The AI is instructed to return `confidence_score: 0` and `score: null` if the data is insufficient. The UI will render this as "Not Enough Data" rather than unfairly failing the candidate.

## 4. Scoring Philosophy
*   **No Flattery**: LLMs inherently default to polite flattery ("You did a great job answering this!"). System prompts must explicitly force a strict, objective, FAANG-level hiring bar.
*   **Absolute vs Relative**: Scores (0-100) are absolute against the specific Job Description's seniority level. A 90/100 for a Junior role requires vastly less depth than a 90/100 for a Principal role.
