# SCALING STRATEGY

This document outlines how the platform's architecture will evolve to handle increasing load, ensuring cost-efficiency at every stage.

## Stage 1: 100 Users (MVP)
*   **Architecture**: "Majestic Monolith" or simple separated Frontend/Backend.
    *   Next.js App handles UI and API routes.
    *   Single PostgreSQL database instances.
    *   Synchronous external calls to LLM APIs (OpenAI/Anthropic).
*   **Cost Considerations**: Highly optimized for speed of development. Server costs < $50/month. LLM API costs are the primary variable expense.
*   **Bottlenecks**: HTTP timeouts if LLM generation takes too long. Real-time audio over simple WebSockets may degrade if the single Node.js process blocks.

## Stage 2: 1,000 Users (Product-Market Fit)
*   **Architecture Changes**:
    *   Extract the **Evaluation Engine** into an asynchronous background worker.
    *   Introduce **Redis** for managing WebSocket states, caching JD/Resume embeddings, and acting as the message broker for the Evaluation Engine.
    *   Deploy the AI Interviewer as a separate service to ensure real-time audio is never blocked by CRUD API operations.
*   **Cost Considerations**: Moderate infrastructure cost increases (adding Redis, separate worker dynos/pods).
*   **Bottlenecks**: Database read/write contention during peak interview hours.

## Stage 3: 10,000 Users (Scaling Up)
*   **Architecture Changes**:
    *   **Database Read Replicas**: Route all candidate dashboard analytics and historical report viewing to read replicas. Primary DB strictly handles writes and live interview state.
    *   **WebRTC Infrastructure**: Move from simple WebSockets to a dedicated WebRTC media server (e.g., LiveKit or custom mediasoup deployment) to handle reliable audio/video streaming at scale.
    *   **LLM Gateway**: Implement an internal proxy for LLM requests to handle fallback routing (e.g., OpenAI fails -> route to Anthropic), caching common responses, and strict cost-control rate limiting.
*   **Cost Considerations**: Significant LLM costs. Need to start exploring self-hosted smaller models (e.g., Llama 3 8B) for simple tasks like Document Parsing to save money.
*   **Bottlenecks**: Network bandwidth for audio/video storage and transit.

## Stage 4: 100,000 Users (Enterprise Scale)
*   **Architecture Changes**:
    *   **Database Sharding / Multi-Region**: Deploy infrastructure across multiple geographic regions (US, EU, Asia) to minimize audio latency for the AI Interviewer. Shard the database by User ID or Region.
    *   **Custom LLM Inference**: Move away from 3rd party APIs for core evaluation. Fine-tune open-source models specifically on our proprietary dataset of millions of interview transcripts to vastly reduce cost and increase speed.
    *   **Microservices Mesh**: Full Kubernetes deployment with Istio/Linkerd for service discovery, mutual TLS, and advanced observability.
*   **Cost Considerations**: Infrastructure becomes a major cost center. The focus shifts to compute optimization (GPU utilization for custom models, storage tiering for old interview videos).
*   **Bottlenecks**: Global state synchronization, managing huge volumes of unstructured object storage (video/audio archives).
