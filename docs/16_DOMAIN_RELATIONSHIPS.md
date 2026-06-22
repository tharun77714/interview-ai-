# DOMAIN RELATIONSHIPS

This document defines how the domain entities interact, ensuring we understand the blast radius of data changes and deletions.

## One-to-One (1:1) Relationships

*   **User ↔ CandidateProfile**: A `User` has exactly one `CandidateProfile`. The separation exists so that if we add a `RecruiterProfile` later, the authentication/billing logic (`User`) remains untouched.
*   **CandidateProfile ↔ CandidateMemory**: A candidate has exactly one continuous, evolving memory graph.
*   **Interview ↔ InterviewPlan**: Every interview has exactly one dynamically generated syllabus.
*   **Interview ↔ Report**: Every completed interview generates exactly one final aggregated scorecard.

## One-to-Many (1:N) Relationships

*   **CandidateProfile → Resumes**: A candidate can upload multiple versions of their resume over time.
*   **CandidateProfile → JobDescriptions**: A candidate can paste multiple different JDs for different target companies.
*   **CandidateProfile → Interviews**: A candidate will conduct multiple interviews over their lifecycle.
*   **Interview → TranscriptLines**: An interview contains hundreds of lines of dialogue.
*   **Interview → Evaluations**: An interview results in multiple granular evaluations (e.g., 1 for Clarity, 1 for Accuracy, 1 for Leadership).
*   **Evaluation → CoachingFeedbacks**: A single low score (e.g., "Depth: 40/100") might generate multiple distinct pieces of coaching feedback.

## Many-to-One (N:1) Relationships (Reference Links)

*   **Interview → Resume**: An interview is optionally based on one specific historical Resume.
*   **Interview → JobDescription**: An interview is optionally based on one specific historical JD.
*   *Note on Immutability*: If an `Interview` references `Resume A`, and the candidate deletes `Resume A` from their active profile, the `Interview` must retain a snapshot or soft-link so the historical context of that interview isn't destroyed.

## Bounded Contexts & Aggregate Roots
*   **Identity Context**: The `User` is the aggregate root.
*   **Candidate Context**: The `CandidateProfile` is the aggregate root. Deleting the `CandidateProfile` cascades to delete all `Resumes`, `JDs`, and `CandidateMemory`.
*   **Interview Context**: The `Interview` is the aggregate root. Deleting an `Interview` must cascade and delete all its `TranscriptLines`, `Evaluations`, `Reports`, and associated `CoachingFeedback`. It should also trigger a pruning of the S3 video recording.
