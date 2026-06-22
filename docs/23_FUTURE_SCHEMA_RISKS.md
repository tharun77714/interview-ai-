# FUTURE SCHEMA RISKS

Before implementing Drizzle schemas, we must acknowledge the physical database constraints that will hit us as we scale.

## 1. Transcript Growth Risk (Storage & IOPS)
*   **The Risk**: 1,000 users doing 10 interviews a month = 10,000 interviews. At 100 `TranscriptLine` rows per interview, that's 1 million rows a month. The table will rapidly explode into billions of rows.
*   **The Impact**: Database storage costs will skyrocket. If `TranscriptLine` shares a physical table space with `User`, querying `User` data might suffer from IOPS exhaustion.
*   **Mitigation for V1**: Do not heavily index `TranscriptLine`. Only index `interview_id`.
*   **Mitigation for V2**: Partition the `TranscriptLine` table by `created_at` (monthly partitions).

## 2. Indexing Risks in Candidate Memory
*   **The Risk**: To calculate the "3 consecutive passive detections" for Reinstatement, the database must query all recent `Evaluations` for a specific trait tied to a `CandidateProfile`.
*   **The Impact**: A missing index on `candidate_profile_id` combined with `created_at` will result in full-table scans every time the `CandidateMemory` worker runs, crippling the database.
*   **Mitigation**: We must explicitly design compound indexes for chronological querying of historical weaknesses.

## 3. Report Growth & JSONB Bloat
*   **The Risk**: Storing massive amounts of unstructured LLM output in `JSONB` columns on the `Evaluation` and `Report` tables.
*   **The Impact**: Postgres TOAST (The Oversized-Attribute Storage Technique) tables will bloat heavily. Fetching a list of past interviews could accidentally load megabytes of JSON data into memory if we use `SELECT *`.
*   **Mitigation**: The API layer must exclusively use strict `SELECT id, score, title` queries for list views, explicitly excluding the heavy `JSONB` payloads until the user requests the details of a single specific interview.

## 4. The "Missing Interview Constraint" Risk
*   **The Risk**: If an `Interview` references a `Resume_ID` via a strict foreign key, and a user deletes that Resume, Postgres will throw a foreign key constraint violation and block the deletion.
*   **The Impact**: Users cannot manage their active Resumes.
*   **Mitigation**: `Resume_ID` and `JD_ID` on the `Interview` table must use `ON DELETE SET NULL` or act as soft-links, and the crucial parsed data of the Resume must be deeply cloned into the `InterviewPlan` when the interview begins, so historical context is never destroyed.
