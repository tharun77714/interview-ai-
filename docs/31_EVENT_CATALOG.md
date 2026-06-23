# EVENT CATALOG

To decouple our architecture, cross-domain communication relies on the following Domain Events. 

## 1. Identity Events
*   `User.Created`: Emitted post-signup. Triggers `CandidateProfile` initialization.
*   `User.Deleted`: Emitted on account deletion. Triggers cascading hard delete and S3 wipe worker.

## 2. Document Events
*   `Resume.Uploaded`: Triggers async parsing logic if not handled synchronously.
*   `Resume.Deleted`: Emitted to warn the user if historical interviews are losing context.

## 3. Interview Lifecycle Events
*   `Interview.Requested`: Signals the Planner AI to generate the syllabus.
*   `Interview.Planned`: Signals the UI that the session is ready to join.
*   `Interview.Started`: Emitted when WebRTC establishes.
*   `Interview.Completed`: **CRITICAL EVENT**. Triggers the `Evaluation Queue` worker.
*   `Interview.Aborted`: Signals the pruning worker to instantly hard-delete the short session to save space.

## 4. Media Events
*   `Media.UploadedToS3`: Emitted via AWS/Cloudflare webhook. Acts as a safety gate before `Interview.Completed` can proceed to evaluation.
*   `Transcript.Finalized` (P0 Patch): Emitted when the real-time engine flushes the final text buffer. If `Media.UploadedToS3` is not received within 3 minutes of this event, a fail-safe cron job MUST force the state to `EVALUATING` and instruct the LLM to grade strictly on text, skipping audio analysis. This prevents the "Infinite Hang" bug if the WebRTC provider crashes.

## 5. Evaluation Events
*   `Evaluation.GranularCompleted`: Emitted as parallel LLM jobs finish.
*   `Evaluation.Failed`: Triggers Dead Letter Queue retry logic.
*   `Report.Generated`: Triggers push notification/email to the Candidate. Triggers Candidate Memory worker.

## 6. Memory Events
*   `Memory.ItemObserved`: Internal event logging a single detection.
*   `Memory.ItemConfirmed`: Triggers a "New Weakness Identified" UI badge.
*   `Memory.ItemDisputed`: Emitted by user action. Blinds the Interview Planner.
*   `Memory.ItemReinstated`: **CRITICAL EVENT**. Generates the specialized "Burden of Proof" report.
*   `Memory.ItemResolved`: Triggers a "Growth Milestone" celebration UI.
*   `Memory.ItemArchived`: Emitted upon double-dispute or timeout decay.
