import { pgTable, text, timestamp, uuid, jsonb, integer } from "drizzle-orm/pg-core";
import { interviews } from "./interviews";

export const evaluations = pgTable("evaluations", {
  id: uuid("id").primaryKey().defaultRandom(),
  interviewId: uuid("interview_id")
    .notNull()
    .references(() => interviews.id, { onDelete: "cascade" }),
  dimension: text("dimension").notNull(),
  score: integer("score"), // nullable if confidence is too low
  confidenceScore: integer("confidence_score").notNull(), // P1 Patch
  evidenceQuote: jsonb("evidence_quote").notNull(), // Array of quotes or timestamps
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  interviewId: uuid("interview_id")
    .notNull()
    .references(() => interviews.id, { onDelete: "cascade" })
    .unique(),
  overallConfidenceScore: integer("overall_confidence_score").notNull(), // P1 Patch
  finalScore: integer("final_score"),
  executiveSummary: text("executive_summary"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const coachingFeedbacks = pgTable("coaching_feedbacks", {
  id: uuid("id").primaryKey().defaultRandom(),
  evaluationId: uuid("evaluation_id")
    .notNull()
    .references(() => evaluations.id, { onDelete: "cascade" })
    .unique(),
  whatWentWrong: text("what_went_wrong").notNull(),
  rewriteExample: text("rewrite_example").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
