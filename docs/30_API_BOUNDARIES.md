# API BOUNDARIES

This document enforces strict separation of concerns across the monorepo packages to prevent spaghetti architecture.

## 1. `apps/web` (The Monolith UI)
*   **Responsibilities**: Rendering the UI, managing user sessions, handling HTTP API routes for CRUD operations, handling the WebRTC client connection.
*   **MUST NOT**: Run heavy LLM batch processing. MUST NOT execute long-running background tasks. MUST NOT connect to WebRTC backend directly without passing through the auth layer.

## 2. `apps/worker` (The Async Brain)
*   **Responsibilities**: Processing the Evaluation Queue, executing heavy Prompt Chains, generating Reports, orchestrating Candidate Memory state transitions, pruning S3 media.
*   **MUST NOT**: Expose HTTP endpoints to the public internet. MUST NOT serve UI or HTML. MUST NOT process live audio/video streams.

## 3. `services/ai-interviewer` (The Real-Time Engine)
*   **Responsibilities**: Managing WebSocket/WebRTC connections, handling Voice-to-Text and Text-to-Voice streaming, appending `TranscriptLine` records in real-time, executing rapid conversational AI loops.
*   **MUST NOT**: Perform post-interview evaluations. MUST NOT interact with Candidate Memory directly. MUST NOT generate coaching feedback.

## 4. `packages/ai` (The Abstraction Layer)
*   **Responsibilities**: Providing a strictly typed, vendor-agnostic interface for all LLM operations. Normalizing prompts. Handling basic token limit counting.
*   **MUST NOT**: Connect to the database. MUST NOT be aware of `Interview` or `Report` domain entities (it only accepts strings/arrays and returns strings/JSON).

## 5. `packages/database` (The Persistence Layer)
*   **Responsibilities**: Exporting Drizzle schemas, managing connection pools, handling migrations, exposing strictly typed query helpers.
*   **MUST NOT**: Contain business logic. MUST NOT import `packages/ai`. MUST NOT execute HTTP requests to external services.
