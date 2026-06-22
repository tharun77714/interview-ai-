# CANDIDATE MEMORY ARCHITECTURE

The moat of the platform is that the AI "remembers" the candidate. It shouldn't feel like a factory reset every time they log in.

## What is Remembered (The Candidate Graph)
*   **Persistent Weaknesses**: Identified gaps across multiple interviews (e.g., "Candidate consistently fails to mention trade-offs in System Design").
*   **Demonstrated Strengths**: Proven competencies (e.g., "Candidate scored 95/100 on React Hooks; no need to test basic state management again").
*   **Communication Quirks**: "High usage of 'like' as a filler word."
*   **Project Context**: The AI remembers the projects from the resume so it can reference them naturally: "Last time we talked about your E-commerce migration, let's dive into the database side of that today."

## What is Forgotten
*   **Raw Transcripts (from working memory)**: We store transcripts forever, but we do NOT feed entire past transcripts into the LLM for a new interview (costs too much, context limits).
*   **Generic Pleasantries**: Initial small talk is discarded.

## How Growth is Tracked
*   **Time-Series Scoring**: The DB stores evaluations with timestamps. The UI renders trend lines for every rubric dimension (e.g., "Clarity: +15% over 30 days").
*   **Milestone Achievements**: When a persistent weakness is finally overcome (scored > 80 twice in a row), it is marked "Resolved" in the memory graph.

## How Coaching Evolves (The Feedback Loop)
Before an interview starts, the `ai-interviewer` pulls a **Memory Summary Profile**.
*   *Interview 1*: AI asks standard behavioral question. Candidate fails to use the STAR method.
*   *Interview 2*: Memory injected. AI asks: "Tell me about a time you failed. And remember, last time we struggled with focusing on the 'Result'. Make sure to emphasize the business impact of how you fixed it."
*   *Interview 3*: If candidate succeeds, the AI praises them directly: "Excellent use of the STAR method, massive improvement from last week."

This turns the AI from an *evaluator* into a *mentor*.
