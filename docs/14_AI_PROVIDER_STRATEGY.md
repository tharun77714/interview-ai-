# AI PROVIDER STRATEGY

As requested by the CTO, the platform must never be tightly coupled to a single AI vendor. The AI landscape changes weekly; our architecture must support hot-swapping providers.

## The AI Provider Abstraction Layer

Within `packages/ai/`, we will build an interface (e.g., `InterviewLLMClient`) that exposes generic methods:
*   `generateInterviewPlan(resume, jd) -> Syllabus`
*   `generateNextResponse(transcript, context) -> Audio & Text`
*   `evaluateTranscript(transcript, rubric) -> Scorecard`

## Vendor Strategy

### 1. Live Conversational Intelligence
*   **Requirement**: Speed, high rate limits, acceptable reasoning.
*   **Current Champion**: Gemini 1.5 Flash / Groq (Llama 3) / GPT-4o-mini.
*   **Strategy**: Use the fastest model available for real-time conversation. If OpenAI goes down, the abstraction layer instantly falls back to Anthropic or Gemini.

### 2. Async Deep Evaluation
*   **Requirement**: Maximum reasoning capability, strict adherence to JSON schemas, high context windows. Latency is secondary.
*   **Current Champion**: GPT-4o / Claude 3.5 Sonnet / Gemini 1.5 Pro.
*   **Strategy**: Route evaluation tasks to the smartest model. If costs spike, we can experiment with routing simpler rubrics (like filler word counting) to cheaper models.

### 3. Speech-to-Text (STT)
*   **Current Champion**: Deepgram (Nova-2).
*   **Why**: Unbeatable latency for streaming WebSockets/WebRTC.

### 4. Text-to-Speech (TTS)
*   **Current Champion**: ElevenLabs (Quality) or Play.ht / Cartesia (Speed).
*   **Why**: Need ultra-low latency streaming TTS to achieve the < 500ms response goal. Standard cloud providers (AWS Polly/GCP) sound too robotic for a natural interview.

## Implementation Rule
No direct SDK calls (e.g., `import { OpenAI } from 'openai'`) are allowed in application logic or API routes. All calls must go through our internal `packages/ai` wrapper, which handles API keys, retries, cost logging, and provider fallback logic.
