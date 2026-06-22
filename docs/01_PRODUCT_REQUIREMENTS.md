# PRODUCT REQUIREMENTS DOCUMENT (PRD)

## Vision
To build a world-class, deeply personalized AI Interview Preparation Platform that simulates real-world interview conditions, providing actionable, evidence-based feedback to help candidates secure their desired roles.

## User Personas
1.  **College Students / Freshers**: Seeking entry-level roles, needing guidance on professional communication, basic technical concepts, and behavioral interview fundamentals.
2.  **Experienced Professionals**: Seeking mid-to-senior level roles, needing rigorous technical deep-dives, system design evaluation, and advanced behavioral (leadership/conflict) scenarios.
3.  **Technical Roles**: Software Engineers, Data Scientists, Product Managers needing domain-specific problem solving and architecture evaluations.
4.  **Non-Technical Roles**: Sales, Marketing, HR professionals needing communication, situational judgment, and strategy evaluations.

## Success Metrics
*   **Candidate Engagement**: Average interviews completed per active user per month.
*   **Skill Progression**: Average percentage increase in evaluation scores between a candidate's first and third interview.
*   **System Latency**: AI Voice Interviewer response time (< 800ms conversational delay).
*   **Evaluation Accuracy**: Candidate feedback rating on the accuracy and usefulness of post-interview reports.

## MVP Scope
*   User authentication and onboarding.
*   Resume upload and parsing.
*   Job Description (JD) text input/parsing.
*   Dynamic Interview Syllabus generation based on Resume + JD intersection.
*   Real-time AI Voice Interview session (audio-only for MVP to manage complexity, with video recording optional).
*   Post-interview transcript generation.
*   Comprehensive Evaluation Report (Technical, Behavioral, Communication).
*   Basic Progress Tracking dashboard.

## Non-Goals (Out of Scope for V1)
*   **Emotion Detection / Micro-expression Analysis**: No gimmicks; scoring must be evidence-based on *what* the candidate said and *how* they articulated it, not pseudoscience facial scanning.
*   **Guaranteed Job Placement**: The platform is an educational/preparation tool, not a recruiting agency.
*   **Complex Coding Environments (IDE integration)**: Initially, technical interviews will be conversational (verbalizing technical concepts) rather than live coding execution.
*   **B2B Recruiter Platform**: The architecture will support this, but the MVP UI/UX is strictly B2C Candidate-first.

## Future Roadmap
*   **Phase 2**: Deep video analysis (eye contact, lighting, professional framing - without emotion AI), Live shared-screen coding for SWE roles.
*   **Phase 3**: Recruiter Platform integration (allowing companies to use the AI for initial screening rounds).
*   **Phase 4**: Group interviews and multi-agent panel interviews (e.g., a "Technical Lead" AI and an "HR" AI interviewing simultaneously).
