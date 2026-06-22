# EVALUATION ORCHESTRATION

To ensure reliability at scale and prevent dropped evaluations, the pipeline relies on a robust Queue Worker architecture.

## Queue Architecture (BullMQ / Redis or SQS)
*   **EvaluationQueue**: The primary queue handling post-interview jobs.
*   **Concurrency**: Workers will process jobs concurrently but lock on a specific `interview_id` to prevent race conditions.

## Failure Handling & Retries
The pipeline interacts heavily with external LLM APIs (Gemini/OpenAI), which are prone to latency spikes, rate limits, and JSON schema hallucinations.

1.  **Rate Limits (HTTP 429)**
    *   *Action*: Re-queue immediately with an exponential backoff.
    *   *Limit*: Up to 5 retries.
2.  **LLM Timeout / Overload (HTTP 500/503)**
    *   *Action*: Re-queue with a flat 30-second delay.
    *   *Limit*: Up to 3 retries.
3.  **JSON Schema Hallucination (Parsing Failure)**
    *   *Action*: The LLM returned invalid JSON (e.g., missing required fields, hallucinated keys). The worker fails the job.
    *   *Limit*: Re-queue up to 2 times, injecting an explicit "Ensure strictly valid JSON" prefix.

## Dead Letter Queue (DLQ)
If a job exhausts all retries (e.g., 5 continuous schema hallucinations, or a permanent network failure), it is routed to the **Dead Letter Queue**.
*   **Action**: The `Interview` state is updated from `EVALUATING` to `EVALUATION_FAILED`.
*   **Visibility**: The user sees "Evaluation failed. Our engineering team has been notified."
*   **Recovery**: Engineers can manually inspect the DLQ payload, fix the prompt or data bug, and manually replay the DLQ back into the primary queue.

## Idempotency
Workers must be strictly idempotent. If a worker crashes mid-evaluation and a new worker picks up the job:
*   The system must guarantee that duplicate evaluations are not created and any partial state from a failed attempt is completely overwritten or discarded before recalculating.
