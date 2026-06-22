# DATABASE ARCHITECTURE

This document outlines the core logical entities for the platform. This is a conceptual schema designed for a relational database (e.g., PostgreSQL) with JSONB support for unstructured AI outputs.

## Core Entities

### `users`
The root account for authentication and billing.
*   `id` (PK, UUID)
*   `email` (String, Unique)
*   `password_hash` (String)
*   `role` (Enum: CANDIDATE, RECRUITER, ADMIN)
*   `created_at` (Timestamp)

### `profiles`
The active state of a candidate's professional identity.
*   `id` (PK, UUID)
*   `user_id` (FK -> users.id)
*   `current_title` (String)
*   `years_experience` (Integer)
*   `target_roles` (Array[String])

### `resumes`
Historical record of uploaded documents.
*   `id` (PK, UUID)
*   `user_id` (FK -> users.id)
*   `file_url` (String)
*   `parsed_data` (JSONB) - *Extracted skills, history, education.*
*   `created_at` (Timestamp)

### `job_descriptions`
Target roles the candidate is interviewing for.
*   `id` (PK, UUID)
*   `user_id` (FK -> users.id)
*   `raw_text` (Text)
*   `parsed_requirements` (JSONB) - *Extracted must-haves and nice-to-haves.*

### `interviews`
The core session record.
*   `id` (PK, UUID)
*   `user_id` (FK -> users.id)
*   `resume_id` (FK -> resumes.id)
*   `job_description_id` (FK -> job_descriptions.id)
*   `status` (Enum: PLANNED, IN_PROGRESS, EVALUATING, COMPLETED)
*   `syllabus` (JSONB) - *The AI-generated plan for this session.*
*   `started_at` (Timestamp)
*   `ended_at` (Timestamp)

### `questions`
Individual questions asked during a session.
*   `id` (PK, UUID)
*   `interview_id` (FK -> interviews.id)
*   `category` (Enum: TECHNICAL, BEHAVIORAL, INTRO)
*   `asked_text` (Text)
*   `expected_signals` (Array[String]) - *What the AI was looking for.*
*   `sequence_order` (Integer)

### `answers`
The candidate's response to a specific question.
*   `id` (PK, UUID)
*   `question_id` (FK -> questions.id)
*   `audio_url` (String)
*   `transcript_text` (Text)
*   `duration_seconds` (Integer)

### `transcripts`
The unified, chronological record of the entire interview.
*   `id` (PK, UUID)
*   `interview_id` (FK -> interviews.id)
*   `full_text` (Text)
*   `speaker_diarization` (JSONB) - *Array of { speaker: 'AI' | 'CANDIDATE', text: '...', timestamp: ... }*

### `evaluations`
The granular scoring records.
*   `id` (PK, UUID)
*   `interview_id` (FK -> interviews.id)
*   `answer_id` (FK -> answers.id, Nullable) - *Can apply to a specific answer or the whole interview.*
*   `dimension` (Enum: COMMUNICATION, TECHNICAL, BEHAVIORAL)
*   `score` (Decimal, 0-100)
*   `evidence` (Text) - *The exact quote or reason justifying the score.*

### `reports`
The aggregated summary presented to the user.
*   `id` (PK, UUID)
*   `interview_id` (FK -> interviews.id, Unique)
*   `overall_score` (Decimal)
*   `summary_strengths` (Array[String])
*   `summary_weaknesses` (Array[String])

### `coaching`
Actionable feedback linked to evaluations.
*   `id` (PK, UUID)
*   `evaluation_id` (FK -> evaluations.id)
*   `feedback_type` (Enum: REFRAME, TECHNICAL_GAP, DELIVERY)
*   `actionable_advice` (Text)
*   `example_good_response` (Text)

### `progress_history`
Aggregated views for fast dashboard rendering (Candidate Memory).
*   `user_id` (FK -> users.id, PK)
*   `historical_scores` (JSONB) - *Time-series data of scores.*
*   `persistent_weaknesses` (Array[String]) - *Identified across multiple interviews.*
*   `last_updated` (Timestamp)
