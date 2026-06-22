# ARCHITECTURE GAPS

This is the final review of the architecture before proceeding to Database Implementation. While the domain and interactions are fully mapped, a few technical unknowns remain.

## 1. Real-Time Latency vs. Memory Awareness
*   **The Unknown**: The `services/ai-interviewer` manages the live conversation. For the AI to act as a "Strict Interviewer" or a "Friendly Coach", it needs access to the `CandidateMemory` state. 
*   **The Gap**: If the Real-Time engine makes a database query for `CandidateMemory` every time the user speaks, latency will spike.
*   **Future Requirement**: The memory payload and `InterviewPlan` must be injected into the initial System Prompt exactly once when the WebSocket connects, or managed via a rapid in-memory cache (Redis) for the duration of the session.

## 2. Token Limit Exhaustion on Transcripts
*   **The Unknown**: A 45-minute interview will generate a massive `TranscriptLine` history. 
*   **The Gap**: Feeding the *entire* transcript into the Evaluation Worker LLMs (e.g., Technical Evaluation, Behavioral Evaluation) simultaneously might exceed context windows or lead to "Lost in the Middle" hallucination.
*   **Future Requirement**: We may need to chunk the transcript during the evaluation phase, or use an LLM with a 1M+ token context window (e.g., Gemini 1.5 Pro) explicitly for the Evaluation Worker, which has higher latency but is perfectly acceptable for an async queue.

## 3. WebRTC Provider Vendor Lock-in
*   **The Unknown**: We have not explicitly chosen a WebRTC provider (e.g., LiveKit, Daily.co) in the architecture yet.
*   **The Gap**: If the WebRTC provider fails to successfully composite the audio/video stream into a final `.mp4` and push it to S3, the `Interview.Completed` event will be permanently blocked, and the evaluation will hang forever.
*   **Future Requirement**: The `EVALUATING` state transition logic must have a timeout fail-safe. If S3 upload fails, we must gracefully degrade and evaluate based purely on the `TranscriptLine` text saved in the database, setting `video_url` to null.

## 4. The Empty Dashboard Cold Start
*   **The Unknown**: A brand new user has no `CandidateMemory` and no past `Interviews`.
*   **The Gap**: The `InterviewPlanner` will have no `CONFIRMED` weaknesses to base the syllabus on.
*   **Future Requirement**: The system must have a "Baseline Mode" (e.g., a standard 15-minute diagnostic interview) that is automatically triggered for the very first session to populate the `OBSERVED` memory state.
