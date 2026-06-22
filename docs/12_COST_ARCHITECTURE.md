# COST ARCHITECTURE

Understanding unit economics is critical. We must track the Cost Per Interview (CPI).

## Cost Drivers per Interview (Estimated 30-minute session)

1.  **Speech-to-Text (Deepgram)**: ~$0.0043/min -> ~$0.13 per interview.
2.  **Text-to-Speech (ElevenLabs/Play.ht)**: ~$0.03/1000 chars. Assuming 15 AI responses of 300 chars -> ~$0.13 per interview.
3.  **LLM Reasoning (Live conversational + Async Evaluation)**:
    *   Live (Gemini 1.5 Flash / GPT-4o-mini): ~$0.05 per interview.
    *   Async Deep Evaluation (Gemini 1.5 Pro / GPT-4o): ~$0.15 per interview (heavy input context).
4.  **WebRTC Transit (LiveKit Cloud)**: ~$0.001/GB -> negligible per interview.
5.  **Video Storage (S3)**: 30 mins 720p = ~300MB. ~$0.007 per video/month.

**Estimated Cost Per Interview (CPI)**: ~$0.45 - $0.60.
*Let's aggressively budget $1.00 per interview to account for retries and prompt bloat.*

## Scaling Projections

### 100 Users (Assuming 4 interviews/user/month)
*   **Interviews**: 400
*   **API/Usage Costs**: ~$400
*   **Fixed Infra**: Vercel ($20) + DB ($30) + Redis ($15) = $65
*   **Total Cost**: ~$465 / month

### 1,000 Users (Assuming 4 interviews/user/month)
*   **Interviews**: 4,000
*   **API/Usage Costs**: ~$4,000
*   **Fixed Infra**: Scaled DB ($100) + Redis ($50) + App Servers ($100) = $250
*   **Total Cost**: ~$4,250 / month

### 10,000 Users (Assuming 4 interviews/user/month)
*   **Interviews**: 40,000
*   **API/Usage Costs**: ~$40,000 (At this scale, enterprise discounts apply, likely dropping unit costs by 20-30%)
*   **Fixed Infra**: High Availability Cluster ($1,000)
*   **Total Cost**: ~$30,000 - $40,000 / month

## Cost Control Strategies
1.  **Strict Context Windows**: Truncate conversational history for the live LLM (only keep the last 5 turns + a rolling summary) to save input tokens.
2.  **Tiered Evaluation**: Use smaller, cheaper models (GPT-4o-mini) for Communication scoring (filler words, structure), and only use expensive models (GPT-4o) for complex Technical Reasoning scoring.
3.  **S3 Lifecycle Policies**: Auto-delete videos beyond the last 10 per user.
