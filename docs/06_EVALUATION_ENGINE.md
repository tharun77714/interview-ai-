# EVALUATION ENGINE

The Evaluation Engine is the core differentiator of the platform. It operates strictly on evidence-based scoring derived from the transcript, entirely avoiding "emotion detection" or pseudoscientific biometrics.

## 1. Communication Evaluation

**Purpose**: To assess *how* the candidate conveys information, ensuring they can be understood clearly and can structure complex thoughts logically.

*   **Clarity & Structure**
    *   *Why it exists*: Rambling or circular answers lose the listener's attention and fail to convey competence.
    *   *Conceptual Calculation*: LLM analyzes the answer for logical flow (e.g., Introduction -> Main Points -> Conclusion). It penalizes sudden topic switching without transitions.
    *   *Candidate Benefit*: Teaches them to outline their thoughts before speaking and use frameworks (like the Rule of Three).

*   **Filler Word Frequency**
    *   *Why it exists*: Excessive "ums," "uhs," and "likes" degrade perceived confidence.
    *   *Conceptual Calculation*: Simple regex/NLP count of filler words divided by total words spoken (Words Per Minute / Filler Ratio).
    *   *Candidate Benefit*: Creates awareness of verbal tics, allowing targeted practice to speak more deliberately.

*   **Vocabulary & Professional Tone**
    *   *Why it exists*: Different roles require varying levels of professional articulation.
    *   *Conceptual Calculation*: Semantic analysis checking for overly casual language vs. appropriate industry terminology.
    *   *Candidate Benefit*: Helps candidates align their speaking style with corporate expectations.

## 2. Technical Evaluation

**Purpose**: To assess *what* the candidate knows and their depth of expertise relative to the Job Description.

*   **Accuracy & Correctness**
    *   *Why it exists*: The fundamental requirement of a technical role is knowing the technology.
    *   *Conceptual Calculation*: The LLM acts as an expert judge. It extracts the technical claims made by the candidate and verifies them against its internal knowledge base and the specific JD requirements.
    *   *Candidate Benefit*: Identifies explicit knowledge gaps (e.g., "You stated HTTP is a transport layer protocol; it is actually an application layer protocol").

*   **Depth & Problem-Solving**
    *   *Why it exists*: Knowing definitions is surface-level; applying them to solve problems demonstrates seniority.
    *   *Conceptual Calculation*: Evaluates if the candidate explored edge cases, discussed trade-offs (e.g., Speed vs. Memory), or just provided the "happy path" solution.
    *   *Candidate Benefit*: Pushes candidates from Junior (definition regurgitation) to Senior (trade-off analysis) thinking.

*   **Experience Validation**
    *   *Why it exists*: To ensure the candidate actually possesses the skills claimed on their resume.
    *   *Conceptual Calculation*: Cross-references the answer against the Resume JSON. If they claim 5 years of AWS but cannot explain an S3 bucket policy, the score drops.
    *   *Candidate Benefit*: Highlights areas where their resume might over-promise, prompting them to revise the resume or study those areas.

## 3. Behavioral Evaluation

**Purpose**: To assess culture fit, past behavior, and situational judgment using established psychological interviewing frameworks.

*   **STAR Method Adherence**
    *   *Why it exists*: Situation, Task, Action, Result is the industry standard for answering behavioral questions.
    *   *Conceptual Calculation*: The LLM segments the candidate's answer to see if all four components exist. Heavy penalization if 'Result' is missing.
    *   *Candidate Benefit*: Drills the habit of always concluding stories with measurable impacts.

*   **Leadership & Ownership**
    *   *Why it exists*: Companies hire candidates who take responsibility, not those who blame others.
    *   *Conceptual Calculation*: Sentiment and semantic analysis looking for "I" vs "We" in appropriate contexts, and identifying proactive vs. reactive language during conflict scenarios.
    *   *Candidate Benefit*: Helps candidates frame their experiences to highlight their agency and positive impact, even in negative situations.
