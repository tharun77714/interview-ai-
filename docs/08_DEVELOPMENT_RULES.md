# DEVELOPMENT RULES

These rules are the unbending laws of the engineering organization. They exist to maintain velocity, ensure system stability, and prevent technical debt.

## Rule 1: Architecture before implementation.
No code is written without a corresponding architectural design being updated or created. If a new feature requires a new table, a new service, or a new external API, it must be documented and reviewed before a single line of application code is committed.
*Why: Prevents "spaghetti code" and ensures the team builds systems, not just features.*

## Rule 2: Impact analysis before modification.
Before modifying any existing core service (especially the Database Schema, Shared Types, or Evaluation Engine), an engineer must document the blast radius. What other services rely on this data? Will this break historical reports?
*Why: In a microservices or heavily typed environment, a small change in a core utility can cascade into catastrophic failures across the platform.*

## Rule 3: No duplicate business logic.
If logic exists to calculate a "Communication Score" in the Evaluation Worker, the Web App must NEVER recalculate it. The Web App must only display it. If an interface is needed in both the frontend and backend, it must live in the `packages/shared-types` directory.
*Why: Ensures a single source of truth. Bugs only need to be fixed in one place.*

## Rule 4: No hidden dependencies.
Services must explicitly declare what they need to run. Do not rely on implicit environment state or global variables. If the Evaluation Engine requires the Document Parser, it should communicate via defined contracts (APIs/Queues), not by reading the Document Parser's internal database directly.
*Why: Maintains service boundaries. Services should be deployable and testable in isolation.*

## Rule 5: Every feature must have documentation.
A feature is not "Done" until the Product Requirements, API definitions (Swagger/OpenAPI), and user-facing documentation are updated.
*Why: Code explains *how*; documentation explains *why*. Future engineers need the *why*.*

## Rule 6: Every implementation must reference architecture docs.
Pull Requests must link to the specific section of the Architecture documents (e.g., `02_SYSTEM_ARCHITECTURE.md` or `05_DATABASE_ARCHITECTURE.md`) that justify the implementation. If the architecture is lacking, update the architecture first.
*Why: Keeps documentation living and breathing, ensuring it never becomes out of sync with the actual codebase.*
