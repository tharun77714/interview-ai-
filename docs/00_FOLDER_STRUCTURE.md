# FOLDER STRUCTURE PROPOSAL

This document outlines the proposed monorepo folder structure for the AI Interview Platform. This structure is designed for modularity, scalability, and strict separation of concerns, ensuring that the platform can grow gracefully from MVP to a multi-service enterprise application.

```text
/
├── .github/                  # GitHub Actions CI/CD workflows and issue/PR templates
├── apps/                     # Primary deployable applications
│   ├── web-app/              # Candidate-facing Next.js web application
│   ├── recruiter-app/        # Future recruiter/admin Next.js dashboard
│   └── api-gateway/          # Main backend API gateway/server routing client requests
├── packages/                 # Shared libraries and internal dependencies
│   ├── shared-types/         # Common TypeScript interfaces, enums, and Zod validation schemas
│   ├── ui-components/        # Shared React component library (shadcn/ui, Radix)
│   ├── database/             # Database client, ORM schemas (e.g., Prisma/Drizzle), and migrations
│   └── core-utils/           # Shared utility functions (formatting, date handling, etc.)
├── services/                 # Independent backend microservices and asynchronous workers
│   ├── ai-interviewer/       # Real-time WebRTC/WebSocket service managing live AI voice sessions
│   ├── evaluation-engine/    # Async worker for post-interview analysis and score generation
│   ├── document-parser/      # Service dedicated to parsing Resumes (PDF/DOCX) and JDs
│   ├── coaching-engine/      # Service generating personalized feedback and learning paths
│   └── media-processor/      # Video/Audio transcoding, chunking, and storage service
├── infrastructure/           # Infrastructure as Code (Terraform/Pulumi) and Kubernetes manifests
├── docs/                     # Architecture, API, and product documentation
└── scripts/                  # Development, database seeding, build, and deployment utility scripts
```

## Purpose of Folders & Modules

### `apps/`
Contains the core applications that serve HTTP traffic directly to users or other systems.
*   **`web-app`**: The primary portal for candidates to upload resumes, schedule interviews, conduct non-voice interviews, and view reports.
*   **`recruiter-app`**: Kept separate to ensure candidate data isolation and tailored UX for B2B users in the future.
*   **`api-gateway`**: Acts as the central nervous system, handling authentication, rate-limiting, and routing requests to appropriate backend services.

### `packages/`
Contains code shared across multiple apps and services. This prevents duplicate business logic (Rule #3).
*   **`shared-types`**: Ensures the frontend, gateway, and microservices all speak the exact same data language.
*   **`ui-components`**: Ensures a consistent design system across `web-app` and `recruiter-app`.
*   **`database`**: Centralizes database connections and schemas so no service connects ad-hoc.

### `services/`
Contains scalable, domain-specific backend workers. These are separate from the `api-gateway` because they have vastly different scaling and compute requirements.
*   **`ai-interviewer`**: Requires high-bandwidth, low-latency, stateful connections (WebSockets/WebRTC) and GPU/LLM API integration. Scaled based on concurrent live interviews.
*   **`evaluation-engine`**: CPU/LLM intensive asynchronous processing. Does not need to be real-time. Pulls from a queue and scales based on backlog.
*   **`document-parser`**: Uses specific libraries for OCR and text extraction. Separated to prevent memory leaks in the main API.

### `infrastructure/`
Ensures that the server environments are reproducible, version-controlled, and documented. No manual server configuration is allowed.
