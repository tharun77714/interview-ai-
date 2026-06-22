# DATABASE BOUNDARIES

To ensure the system scales efficiently, we must mentally partition the data into logical boundaries, even if they share the same physical Postgres instance in V1.

## 1. Transactional Data Boundary (OLTP)
*   **Definition**: Data that requires high availability, rapid reads, and strict ACID compliance.
*   **Entities**: `User`, `CandidateProfile`, `Interview` (metadata).
*   **Characteristics**: Updated frequently by users. Requires fast index lookups. State transitions on the `Interview` must be strictly locked to prevent asynchronous workers from duplicating evaluation jobs.

## 2. Stream / Log Data Boundary (Append-Only)
*   **Definition**: High-throughput data inserted rapidly during a live session.
*   **Entities**: `TranscriptLine`.
*   **Characteristics**: During a live 45-minute WebRTC interview, hundreds of lines of transcript will be flushed to the database. These rows are **append-only**. They are almost never updated. Separating this conceptually means we do not over-index the `TranscriptLine` table, which would cause brutal write-lock contention during live interviews.

## 3. Analytical / Report Data Boundary (OLAP-ish)
*   **Definition**: Complex nested JSON data generated asynchronously that powers dashboards.
*   **Entities**: `Evaluation`, `Report`, `CoachingFeedback`, `InterviewPlan`.
*   **Characteristics**: These rows are written exactly once by the Evaluation Worker and read heavily by the Candidate Dashboard. Because they represent complex LLM outputs, they heavily utilize `JSONB` columns in Postgres rather than rigid normalized tables, allowing the AI prompts to evolve without requiring constant database migrations.

## 4. Candidate Memory Data Boundary (Graph/State)
*   **Definition**: The evolving intelligence layer defining the candidate's core traits.
*   **Entities**: `MemoryItem`.
*   **Characteristics**: This boundary acts as a strict state machine (`OBSERVED` -> `CONFIRMED` -> `DISPUTED` -> `ARCHIVED`). It requires transactional integrity (so two concurrent workers don't both reinstate a memory simultaneously). It bridges the gap between historical analytics and future transactional routing.
