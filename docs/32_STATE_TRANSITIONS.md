# STATE TRANSITIONS

This document consolidates the state machines that dictate the platform's behavior.

## 1. Interview State Machine
*   `REQUESTED`: Waiting for AI Planner.
*   `PLANNED`: Waiting for User to join.
*   `STARTED`: Live session.
*   `COMPLETED`: Session finished. Waiting for evaluation.
*   `ABORTED`: Network drop / User quit early. (Terminal)
*   `EVALUATING`: Background worker running.
*   `EVALUATION_FAILED`: LLM timeout / schema hallucination. (Retry loop)
*   `REPORT_GENERATED`: Scores ready.
*   `PROGRESS_UPDATED`: Memory updated. (Terminal)

## 2. MemoryItem Confidence State Machine
*   `OBSERVED`: Single detection. Untrusted.
*   `CONFIRMED`: Multiple detections. Trusted. Drives planning.
*   `DISPUTED`: User denied. Blinded from planning. Passively monitored.
*   `RESOLVED`: User overcame weakness. Positive reinforcement.
*   `ARCHIVED`: Double-dispute kill switch or 12-month decay. (Terminal)

## 3. Evaluation State Machine (Internal Queue Logic)
*   `QUEUED`: Waiting in BullMQ/SQS.
*   `PROCESSING`: Active LLM generation.
*   `COMPLETED`: Saved to DB.
*   `FAILED`: Sent to Dead Letter Queue for engineering review.

## 4. Report Generation Flow
*   `PENDING_EVALUATIONS`: Waiting for parallel granular evaluations to finish.
*   `SYNTHESIZING`: LLM is building the executive summary and weighted score.
*   `COACHING`: LLM is isolating the bottom 2 dimensions for actionable feedback.
*   `READY`: Exposed to the user via the Dashboard.
