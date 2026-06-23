# DATA RETENTION POLICY

This document defines exactly how data is preserved, pruned, or physically destroyed based on the Founder's approved policies.

## 1. Video Retention (Last 10 Interviews)
*   **Policy**: The platform must only retain the S3 video/audio recordings for the candidate's last 10 completed interviews.
*   **Pruning Logic**:
    *   Triggered asynchronously when an `Interview` moves to `COMPLETED`.
    *   The worker queries all completed interviews for the `CandidateProfile`, ordered by `created_at` DESC.
    *   Any interviews past row 10 will have their S3 physical files deleted via API.
    *   The `video_url` column on the `Interview` table is set to `null` to reflect the pruning.
*   **Warning**: The `Interview` record itself is **NOT** deleted. Only the heavy S3 media file is destroyed.

## 2. Report Retention (Forever)
*   **Policy**: The `Report`, `Evaluation`, and `CoachingFeedback` tables are retained forever.
*   **Rationale**: The candidate must be able to view their detailed feedback from an interview 3 years ago to appreciate their growth, even if the video of that interview has been pruned.
*   **Archival**: Since these tables will grow massively, we may eventually partition the database (e.g., partitioning by `created_at` year) so cold data doesn't slow down active queries.

## 3. Progress / Candidate Memory (Forever)
*   **Policy**: `MemoryItem` entities are never deleted unless the user completely deletes their account.
*   **Archival State vs Physical Deletion**:
    *   When a weakness is `RESOLVED` or permanently `ARCHIVED` via the Double-Dispute Kill Switch, the row is **not** deleted from the database.
    *   The `state` column simply changes.
    *   This is crucial for auditability and generating long-term "Look how far you've come" milestone reports.

## 4. GDPR / CCPA Total Deletion
*   If a user requests account deletion, a hard delete cascades from `User` -> `CandidateProfile` -> `Interview`. 
*   An asynchronous worker must be triggered to crawl S3 and destroy all remaining Resumes and Videos tied to that `CandidateProfile`.

## 5. Aborted Interviews (Trust & Safety Review - P2 Patch)
*   **Policy**: `ABORTED` interviews MUST NOT be hard-deleted instantly. They are retained for 24 hours before a cleanup worker hard-deletes them.
*   **Rationale**: If `ABORTED` interviews are instantly deleted, candidates can abuse the system by killing the session the moment they receive a difficult question they don't know the answer to, preventing the `Interview` from logging the failure and artificially padding their memory profile. The 24-hour retention window allows backend analytics to track excessive abort rates and apply rate limits or shadow-bans if abuse is detected.
