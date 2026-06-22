# DATABASE DOMAIN MAPPING

This document maps the theoretical Domain Entities to their future database persistence strategies.

## 1. User
*   **Ownership**: Root.
*   **Lifecycle**: Created on signup.
*   **Retention Policy**: Permanent until account deletion.
*   **Deletion Policy**: Hard delete cascades to all owned entities (CandidateProfile) due to privacy regulations.

## 2. CandidateProfile
*   **Ownership**: `User`
*   **Lifecycle**: Created immediately post-signup.
*   **Retention Policy**: Permanent.
*   **Deletion Policy**: Hard delete if `User` is deleted.

## 3. Resume
*   **Ownership**: `CandidateProfile`
*   **Lifecycle**: Uploaded by user. Parsed into structured JSON.
*   **Retention Policy**: S3 physical file retained indefinitely unless manually deleted by user.
*   **Deletion Policy**: Soft delete only if referenced by a historical `Interview`. Hard delete otherwise. S3 physical file is hard deleted upon user request.

## 4. JobDescription
*   **Ownership**: `CandidateProfile`
*   **Lifecycle**: Created pre-interview.
*   **Retention Policy**: Permanent.
*   **Deletion Policy**: Soft delete only if referenced by a historical `Interview`.

## 5. MemoryItem (Aggregate of CandidateMemory)
*   **Ownership**: `CandidateProfile`
*   **Lifecycle**: Created dynamically after interviews in the `OBSERVED` state. Mutates state to `CONFIRMED`, `DISPUTED`, `RESOLVED`, or `ARCHIVED` based on the 3-consecutive-detection reinstatement and double-dispute rules.
*   **Retention Policy**: Permanent. To track historical growth, even `ARCHIVED` or `RESOLVED` items are retained.
*   **Deletion Policy**: Hard delete only if `CandidateProfile` is deleted.

## 6. Interview
*   **Ownership**: `CandidateProfile`
*   **Lifecycle**: Created at request. Rapid mutation during session. Locked upon completion.
*   **Retention Policy**: Metadata retained permanently. 
*   **Deletion Policy**: Hard delete cascading to children if user explicitly deletes the interview record.

## 7. InterviewPlan
*   **Ownership**: `Interview`
*   **Lifecycle**: Generated before session. Immutable.
*   **Retention Policy**: Permanent.
*   **Deletion Policy**: Cascading hard delete from `Interview`.

## 8. TranscriptLine
*   **Ownership**: `Interview`
*   **Lifecycle**: Heavily inserted append-only log during live session. Immutable post-session.
*   **Retention Policy**: Permanent.
*   **Deletion Policy**: Cascading hard delete from `Interview`.

## 9. Evaluation
*   **Ownership**: `Interview`
*   **Lifecycle**: Generated asynchronously post-interview. Immutable.
*   **Retention Policy**: Permanent.
*   **Deletion Policy**: Cascading hard delete from `Interview`.

## 10. Report
*   **Ownership**: `Interview`
*   **Lifecycle**: Generated asynchronously post-interview. Immutable.
*   **Retention Policy**: Permanent.
*   **Deletion Policy**: Cascading hard delete from `Interview`.

## 11. CoachingFeedback
*   **Ownership**: `Evaluation`
*   **Lifecycle**: Generated asynchronously alongside Report. Immutable.
*   **Retention Policy**: Permanent.
*   **Deletion Policy**: Cascading hard delete from `Interview`.
