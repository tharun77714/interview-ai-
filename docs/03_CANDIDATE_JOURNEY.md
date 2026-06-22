# CANDIDATE JOURNEY

This document maps the end-to-end user experience, identifying the core technical interactions at each step.

## 1. Landing & Signup
*   **Action**: User visits platform, views value proposition, signs up.
*   **System**: Authentication provider handles OAuth (Google/LinkedIn) or Email/Password. A basic `User` record is created.

## 2. Profile Setup & Resume Upload
*   **Action**: User uploads their primary resume and fills out basic preferences (Target roles, years of experience).
*   **System**: Document Intelligence Service parses the resume. A `Profile` and `Resume` record are created, extracting structured skills and work history.

## 3. Interview Planning (Pre-Flight)
*   **Action**: User creates a new interview session. They provide a specific Job Description (URL or text) and select the interview type (Technical, Behavioral, Full Loop).
*   **System**: System compares the parsed Resume with the provided JD. The LLM generates a tailored `Interview Syllabus` (topics to cover, gaps to probe, strengths to validate).

## 4. Interview Session (The Core Loop)
*   **Action**: User enters the virtual interview room. Audio/Video permissions are verified. The AI introduces itself and begins the interview. The user answers questions dynamically.
*   **System**: Real-time bidirectional streaming begins. The AI Interviewer Service manages the conversational state, dynamically adjusting questions based on whether the candidate is struggling or excelling (Adaptive Questioning).

## 5. Evaluation Generation (Async)
*   **Action**: User concludes the interview and sees a "Generating Report..." state.
*   **System**: The session ends. Transcripts are locked. The Evaluation Engine pulls the data and runs multi-dimensional grading pipelines. Once complete, the UI updates.

## 6. Report & Coaching Review
*   **Action**: User views their detailed scorecard. They see their strengths, weaknesses, and a transcript annotated with specific feedback.
*   **System**: Data is served from the `Evaluations` and `Coaching` tables. The system presents evidence-based feedback (e.g., "At 04:12, your explanation of React hooks lacked mention of dependency arrays. Consider structuring your answer like...").

## 7. Progress Tracking
*   **Action**: User views their historical dashboard to see trendlines of their scores over multiple interviews.
*   **System**: Aggregation queries run against the `Progress_History` to visualize improvement over time.

## 8. Continuous Loop (Candidate Memory)
*   **Action**: User starts a *new* interview a week later for a different job.
*   **System**: The system retrieves the candidate's `Memory` (past weaknesses). The AI interviewer says, "I noticed in our last session you wanted to improve on system design. Let's focus a bit more on that today..."
