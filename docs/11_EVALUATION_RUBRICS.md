# EVALUATION RUBRICS

This document defines the strict, evidence-based scoring framework. Scores are 0-100, calculated asynchronously using prompt-chained LLMs.

## 1. Communication (How they speak)

*   **Clarity**
    *   *Why*: Can the listener easily comprehend the point without mental gymnastics?
    *   *Evidence*: Ratio of coherent sentences vs. fragmented, restarted sentences.
    *   *Scoring*: 100 = perfectly formed sentences. Penalties for trailing off or abandoning thoughts mid-sentence.
*   **Structure**
    *   *Why*: Good communication follows a logical path (Beginning, Middle, End).
    *   *Evidence*: Use of transitional phrases ("First," "However," "Ultimately") and logical progression of ideas.
    *   *Scoring*: High score for chronological or deductive structuring. Low score for circular reasoning.
*   **Conciseness**
    *   *Why*: In a business setting, time is money. Rambling is a negative signal.
    *   *Evidence*: Word count relative to the complexity of the question.
    *   *Scoring*: Penalties applied if the answer exceeds optimal length without adding new information (repetition).
*   **Filler Words**
    *   *Why*: Excessive fillers reduce perceived confidence.
    *   *Evidence*: Exact count of "um," "uh," "like," "you know" from the STT transcript.
    *   *Scoring*: Calculated mathematically. (Total Words / Filler Words). < 1% fillers = 100. > 5% = severe penalty.
*   **Speaking Pace**
    *   *Why*: Speaking too fast induces anxiety; too slow loses attention.
    *   *Evidence*: Words Per Minute (WPM) calculated via transcript timestamps.
    *   *Scoring*: Sweet spot: 130-160 WPM. Scores decay exponentially outside this range.

## 2. Technical (What they know)

*   **Accuracy**
    *   *Why*: The baseline requirement. Are their statements factually correct?
    *   *Evidence*: Extraction of technical claims cross-referenced against the LLM's knowledge base.
    *   *Scoring*: Binary per claim. 100% if all claims are true. Deductions for factual errors.
*   **Depth**
    *   *Why*: Differentiates junior from senior candidates.
    *   *Evidence*: Mention of underlying mechanisms, edge cases, or historical context of a technology.
    *   *Scoring*: High score requires going beyond the dictionary definition to explain *how* something works under the hood.
*   **Reasoning**
    *   *Why*: Memorization isn't engineering. Can they deduce answers to unknowns?
    *   *Evidence*: "Think out loud" steps captured in the transcript. Identifying trade-offs (e.g., Space vs. Time complexity).
    *   *Scoring*: Evaluated on the logic of the approach, even if the final conclusion was slightly off.
*   **Project Understanding**
    *   *Why*: Verifies resume integrity.
    *   *Evidence*: Ability to explain the *business impact* and *architecture* of a past project.
    *   *Scoring*: Low score if candidate says "I just built the button." High score if they explain the API, the DB, and the user value.

## 3. Behavioral (Who they are)

*   **Ownership**
    *   *Why*: Accountability is the top trait companies hire for.
    *   *Evidence*: Use of "I" when discussing actions and outcomes, acknowledging mistakes without shifting blame.
    *   *Scoring*: High score for taking responsibility for failures and explaining learnings.
*   **Leadership**
    *   *Why*: Ability to influence without authority.
    *   *Evidence*: Mentions of mentoring, unblocking teammates, or proposing new processes.
    *   *Scoring*: Scales based on the scope of impact (Team level vs. Org level).
*   **Teamwork**
    *   *Why*: No one works in a vacuum.
    *   *Evidence*: Acknowledging contributions of others, successful cross-functional communication.
    *   *Scoring*: High score for demonstrating empathy and active listening in conflict resolution stories.
*   **Decision Making**
    *   *Why*: Ability to act with incomplete information.
    *   *Evidence*: Explanation of the variables considered before taking action.
    *   *Scoring*: Requires a clear framework (e.g., "I weighed X against Y, consulted Z, and chose X because...").
