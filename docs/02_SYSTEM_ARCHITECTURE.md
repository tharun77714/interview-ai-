# SYSTEM ARCHITECTURE

## High-Level Architecture

The platform utilizes a modular, microservices-oriented architecture to ensure scalability, fault tolerance, and clear separation of concerns. The system is divided into synchronous paths (user interactions, real-time interviews) and asynchronous paths (heavy AI evaluations, media processing).

## Services & Responsibilities

1.  **Client Application (Next.js Web App)**
    *   Candidate UI/UX.
    *   Client-side media capture (WebRTC/WebSockets for live interviews).
    *   Data visualization for evaluation reports.

2.  **API Gateway (Node.js/Go)**
    *   REST/GraphQL entry point for the frontend.
    *   Authentication and Authorization.
    *   Rate limiting and routing to internal services.
    *   CRUD operations for user profiles, history, and settings.

3.  **Real-time AI Interviewer Service (Python/Node.js)**
    *   Manages live WebSocket/WebRTC connections.
    *   Coordinates the STT (Speech-to-Text), LLM (Question Generation/Response Evaluation in real-time), and TTS (Text-to-Speech) pipeline.
    *   Maintains the short-term conversational context.

4.  **Evaluation Engine Worker (Python)**
    *   Asynchronous worker consuming events from a message broker (e.g., Redis/Kafka/RabbitMQ).
    *   Performs deep-dive prompt chaining to analyze transcripts against the JD and Resume.
    *   Generates final rubrics, scores, and coaching feedback.

5.  **Document Intelligence Service (Python)**
    *   Parses PDFs, DOCX, and raw text.
    *   Extracts entities (skills, experience, education) and structures them into JSON.

## Data Flow

**Pre-Interview:**
1.  User uploads Resume -> API Gateway -> Document Service -> Extracted JSON saved to DB.
2.  User inputs JD -> API Gateway -> Document Service -> Extracted JSON saved to DB.
3.  App requests Interview Plan -> API Gateway -> LLM generates dynamic syllabus -> Saved to DB.

**Live Interview:**
1.  App establishes WebSocket connection with AI Interviewer Service.
2.  User speaks -> Audio streamed to AI Service -> STT -> Transcript appended to context.
3.  AI Service queries LLM for next action/question based on syllabus and context -> TTS -> Audio streamed to App.
4.  Session ends -> Raw transcript and audio artifacts saved to Object Storage (S3) -> Event pushed to Message Broker.

**Post-Interview:**
1.  Message Broker triggers Evaluation Engine.
2.  Evaluation Engine pulls transcript, Resume, and JD from DB/S3.
3.  Engine runs parallel evaluation pipelines (Communication, Technical, Behavioral).
4.  Results aggregated and saved to DB.
5.  Notification sent to User -> User views report via API Gateway.

## Component Interactions
*   Services communicate synchronously via internal gRPC/REST APIs (e.g., API Gateway requesting a parsed document).
*   Services communicate asynchronously via Message Queues for heavy tasks (Evaluations, Video Processing) to prevent HTTP timeouts and allow horizontal scaling of workers.

## Scalability Considerations
*   **Stateful vs Stateless**: The AI Interviewer service is stateful during a session. We must use sticky sessions or maintain session state in a fast cache (Redis) so disconnects can be handled gracefully.
*   **LLM Latency**: The critical path in the live interview is the LLM response time. We will use streaming LLM outputs and pre-fetching/predictive generation where possible.
*   **Database Isolation**: Heavy reads (analytics, reports) should eventually be routed to read-replicas to protect the primary write database handling live interview states.
