# ARCHITECTURE REVIEW (V2)

## The Premature Abstraction Trap

The initial V1 architecture proposed a heavily microservice-oriented design (5+ independent services). As the CTO correctly identified, this is "startup-killing complexity" for an application with 0 traffic. Over-engineering on Day 1 leads to immense DevOps overhead, difficult local development, and slow feature velocity.

## What Should Be Simplified & Removed (For Now)
*   **Remove: `services/evaluation-engine`**: Postponed. Evaluation is async, but it can run in a simple background worker queue (like Inngest, BullMQ, or standard Next.js background jobs) attached to the main API, rather than a completely standalone service.
*   **Remove: `services/coaching-engine`**: Postponed. Coaching generation is just another LLM prompt chain. It belongs in the same worker queue as the evaluation.
*   **Remove: `services/document-parser`**: Postponed. Parsing a PDF/DOCX does not require its own Kubernetes pod yet. A simple serverless function or API route using standard libraries is sufficient.
*   **Remove: `services/media-processor`**: Postponed. We do not need custom transcoding clusters. We will rely on our WebRTC provider's native recording & egress features to push MP4s directly to S3.

## What Remains (The Moats)
*   **Candidate Memory**: The core differentiator. Keeping this central to the architecture.
*   **Event-Driven Evaluation**: Even if it's in a monolith worker, the queue-based async nature remains. The user finishes an interview, the queue picks it up, the UI polls/subscribes for the result.
*   **LLM Provider Agnosticism**: Strict abstraction of AI APIs to prevent vendor lock-in.
*   **No Emotion AI**: Retained.

## The Consolidated V1 Strategy
We are moving to a **Modular Monolith** with a strictly separated Real-time AI Worker.

1.  **Web/API Monolith (`apps/web`)**: Next.js App Router. Handles UI, Auth, DB CRUD, and exposes background job endpoints.
2.  **Background Worker (`apps/worker`)**: A simple Node process consuming a queue (Redis/SQS) for Evaluations and Parsing.
3.  **Real-time AI Interviewer (`services/ai-interviewer`)**: The only true separate service needed. It maintains the WebRTC connections and rapid STT/LLM/TTS loops where latency is life or death.
