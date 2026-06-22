# REPORT GENERATION

The Report is the candidate-facing aggregation of all backend AI operations. It translates raw data into human-readable growth metrics.

## 1. Report Synthesis
Once all parallel `Evaluations` are saved:
1.  A Synthesis LLM reads all granular evaluations.
2.  It generates a high-level `executive_summary` (e.g., "You demonstrated strong technical depth in React, but your behavioral answers lacked specific quantifiable results.").
3.  It calculates a weighted `final_score` (0-100). (e.g., For a Technical Interview, Technical Evaluation carries 70% weight, Communication 30%).

## 2. Coaching Generation (Targeted Feedback)
To avoid overwhelming the candidate, we do not provide coaching for every minor mistake.
1.  The system identifies the **2 lowest-scoring evaluations** where `score < 75`.
2.  An specialized Coaching LLM prompt is executed:
    *   *Input*: The bad evaluation + The specific transcript evidence.
    *   *Output*: A `CoachingFeedback` entity containing a "What went wrong" explanation and a "Rewrite this answer" example, demonstrating exactly what a 100/100 answer would have sounded like.

## 3. Progress Updates (Memory Interaction)
Once the Report and Coaching are locked, the pipeline executes the final Candidate Memory update:
1.  **Extract**: Identify the primary weaknesses highlighted in the Report.
2.  **Compare**: Check if these weaknesses map to existing `MemoryItems` (via embedding similarity search or strict categorical tags).
3.  **State Shift**: 
    *   New weakness -> `OBSERVED`.
    *   Repeated weakness -> `CONFIRMED`.
    *   Missed weakness (historically CONFIRMED, but candidate scored 90+ today) -> Logged toward `RESOLVED`.
4.  **Notification**: User receives the "Report Ready" email.
