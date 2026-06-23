import { pgEnum } from "drizzle-orm/pg-core";

export const memoryStateEnum = pgEnum("memory_state", [
  "OBSERVED",
  "CONFIRMED",
  "DISPUTED",
  "RESOLVED",
  "ARCHIVED",
]);

export const interviewStateEnum = pgEnum("interview_state", [
  "REQUESTED",
  "PLANNED",
  "STARTED",
  "COMPLETED",
  "ABORTED",
  "EVALUATING",
  "REPORT_GENERATED",
  "PROGRESS_UPDATED",
  "EVALUATION_FAILED",
]);

export const speakerEnum = pgEnum("speaker_enum", [
  "AI",
  "CANDIDATE",
]);
