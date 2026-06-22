# VOICE ARCHITECTURE

## WebRTC vs Alternatives

**Decision**: WebRTC is the mandatory protocol for Day 1.
*   **Why not WebSockets?** WebSockets run over TCP. If a packet drops, TCP pauses everything to re-transmit (Head-of-Line blocking), causing audio stuttering and massive latency spikes.
*   **Why WebRTC?** Runs over UDP. Built for real-time media. Native browser support (no plugins). Built-in echo cancellation, noise suppression, and automatic bitrate adaptation. Crucially, it sets the foundation for video, screen-sharing, and multi-party recruiter interviews later.

## Audio & Video Flow
We will use an SFU (Selective Forwarding Unit) WebRTC Provider (e.g., LiveKit or Daily.co) to avoid building complex STUN/TURN/ICE infrastructure.

1.  **Candidate -> SFU**: Candidate browser sends encrypted Opus (Audio) and VP8/H.264 (Video) to the SFU.
2.  **SFU -> AI Interviewer Service**: The SFU forwards the audio stream to our backend AI service.
3.  **AI Service -> SFU -> Candidate**: AI processes speech, generates a response, synthesizes audio (TTS), and pushes it back to the SFU, which routes it to the candidate.

## Recording Flow
*   **Requirement**: Keep the last 10 interview videos.
*   **Flow**: We configure the WebRTC provider (e.g., LiveKit Egress) to composite the audio/video streams on their servers and upload an `.mp4` file directly to our S3 bucket when the session ends.
*   **Pruning**: A daily background cron job scans the DB. If a user has > 10 recorded interviews, it hard-deletes the oldest `.mp4` from S3. Transcripts and reports are kept forever.

## Session Lifecycle & Dynamic Duration
1.  **Initialization**: User starts interview. `ai-interviewer` connects, gets the Personality profile (Friendly, Strict, etc.), and greets the user.
2.  **Dynamic Loop**: AI tracks time and question completion. If the candidate answers quickly and well, the AI may probe deeper or end early. If the candidate struggles, the AI may ask simpler fallback questions.
3.  **Termination**: The AI determines the interview is complete ("Thank you for your time..."). It sends a `SESSION_END` signal over the WebRTC data channel.
4.  **Handoff**: The WebRTC server triggers a webhook to our `worker`, passing the final transcript and S3 recording URL to begin Evaluation.

## Latency Targets
*   **Speech-to-Text (STT)**: < 300ms (Streaming STT like Deepgram).
*   **LLM Processing**: < 500ms (Using TTFT - Time To First Token streaming).
*   **Text-to-Speech (TTS)**: < 300ms (Streaming TTS like ElevenLabs or Play.ht).
*   **Total Conversational Delay Goal**: < 1.1 seconds from candidate stopping speaking to AI starting.

## Failure Handling
*   **Network Drops**: WebRTC automatically attempts ICE restarts.
*   **Fallback**: If video bandwidth drops, the SFU automatically downgrades or disables video, keeping the audio stream alive (Audio-First Degradation).
