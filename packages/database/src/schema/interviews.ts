import { pgTable, text, timestamp, uuid, jsonb, integer, index } from "drizzle-orm/pg-core";
import { candidateProfiles } from "./profiles";
import { resumes, jobDescriptions } from "./documents";
import { interviewStateEnum } from "./enums";

export const interviews = pgTable("interviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  candidateProfileId: uuid("candidate_profile_id")
    .notNull()
    .references(() => candidateProfiles.id, { onDelete: "cascade" }),
  resumeId: uuid("resume_id").references(() => resumes.id, { onDelete: "set null" }),
  jobDescriptionId: uuid("job_description_id").references(() => jobDescriptions.id, { onDelete: "set null" }),
  state: interviewStateEnum("state").default("REQUESTED").notNull(),
  videoUrl: text("video_url"),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const interviewPlans = pgTable("interview_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  interviewId: uuid("interview_id")
    .notNull()
    .references(() => interviews.id, { onDelete: "cascade" })
    .unique(),
  syllabus: jsonb("syllabus").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const transcriptLines = pgTable(
  "transcript_lines",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    interviewId: uuid("interview_id")
      .notNull()
      .references(() => interviews.id, { onDelete: "cascade" }),
    speaker: text("speaker").notNull(), // "AI" | "CANDIDATE"
    text: text("text").notNull(),
    timestampStartMs: integer("timestamp_start_ms"),
    timestampEndMs: integer("timestamp_end_ms"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => {
    return {
      interviewIdx: index("transcript_lines_interview_idx").on(table.interviewId, table.createdAt),
    };
  }
);
