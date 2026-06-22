# AI ARCHITECTURE

This document outlines the AI models, data flows, and reasoning engines that power the platform's intelligence.

## 1. Resume Intelligence
*   **Mechanism**: A specialized LLM prompt or fine-tuned model extracts structured data from parsed text.
*   **Output**: JSON schema containing `skills` (categorized), `experience_timeline`, `education`, and `achievements`.
*   **Purpose**: To ground the AI interviewer in reality, preventing generic questions and enabling personalized deep-dives into the candidate's actual background.

## 2. Job Description (JD) Intelligence
*   **Mechanism**: LLM extraction focusing on requirements, nice-to-haves, company culture indicators, and domain-specific technologies.
*   **Output**: JSON schema of `required_skills`, `soft_skills`, `domain_knowledge`, and `role_responsibilities`.
*   **Purpose**: To define the target rubric. The interview questions will strictly evaluate the candidate against these extracted requirements.

## 3. Interview Planning (The Director)
*   **Mechanism**: An orchestrator LLM prompt that takes `Resume_JSON` + `JD_JSON` + `Platform_Rules`.
*   **Output**: An `Interview_Syllabus`. For example: "Topic 1: Validate React experience from Company X. Topic 2: Probe gap in Docker knowledge required by JD. Topic 3: Assess conflict resolution."
*   **Purpose**: Ensures the real-time AI stays on track and conducts a logically structured interview rather than wandering randomly.

## 4. Question Generation (Adaptive)
*   **Mechanism**: Real-time generation during the interview. The AI is given the `Syllabus`, the `Current_Transcript`, and a directive to "Generate the next response and question".
*   **Logic**: Adaptive. If a candidate nails a basic question, the next question automatically increases in complexity. If they fail, the AI may ask a clarifying, simpler question to find their baseline.

## 5. Evaluation Engines (LLM-as-a-Judge)
*   **Mechanism**: Asynchronous prompt chaining. We do not use one massive prompt.
*   *Pipeline*:
    1.  **Fact Extraction**: "What technical claims did the candidate make in this answer?"
    2.  **Verification**: "Are these claims technically accurate based on industry standards?"
    3.  **Rubric Grading**: "Grade this answer 1-5 based on clarity, accuracy, and completeness."
*   **Purpose**: Multi-step reasoning significantly reduces LLM hallucination and provides highly accurate, reproducible scoring.

## 6. Coaching Engines
*   **Mechanism**: Takes the outputs of the Evaluation Engine and generates constructive feedback.
*   **Logic**: Uses the formula: `Observation -> Impact -> Alternative`. (e.g., "You didn't mention indexes when discussing database slow down. This makes your solution unscalable. Next time, structure your troubleshooting steps starting with index analysis.")

## 7. Candidate Memory (Long-term Intelligence)
*   **Mechanism**: Vector Database (e.g., Pinecone, Qdrant or pgvector).
*   **Logic**: After every interview, key "learnings" about the candidate are embedded and stored.
*   **Usage**: When planning a future interview, the system runs a similarity search or simply retrieves the candidate's active profile summary to inform the new `Interview Planning` phase, creating a continuous coaching relationship.
