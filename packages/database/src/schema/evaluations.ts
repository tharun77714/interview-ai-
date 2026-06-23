import { pgTable, text, timestamp, uuid, jsonb, integer, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { interviews } from "./interviews";
import { memoryItems } from "./memory";

export const evaluations = pgTable(
  "evaluations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    interviewId: uuid("interview_id")
      .notNull()
      .references(() => interviews.id, { onDelete: "cascade" }),
    dimension: text("dimension").notNull(),
    score: integer("score"), // nullable if confidence is too low
    confidenceScore: integer("confidence_score").notNull(), // P1 Patch
    evidenceQuote: jsonb("evidence_quote").notNull(), // Array of quotes or timestamps
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => {
    return {
      scoreRange: check("score_range", sql`${table.score} >= 0 AND ${table.score} <= 100`),
      confidenceRange: check("confidence_range", sql`${table.confidenceScore} >= 0 AND ${table.confidenceScore} <= 100`),
    };
  }
);

export const reports = pgTable(
  "reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    interviewId: uuid("interview_id")
      .notNull()
      .references(() => interviews.id, { onDelete: "cascade" })
      .unique(),
    overallConfidenceScore: integer("overall_confidence_score").notNull(), // P1 Patch
    finalScore: integer("final_score"),
    executiveSummary: text("executive_summary"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => {
    return {
      finalScoreRange: check("final_score_range", sql`${table.finalScore} >= 0 AND ${table.finalScore} <= 100`),
      overallConfidenceRange: check(
        "overall_confidence_range",
        sql`${table.overallConfidenceScore} >= 0 AND ${table.overallConfidenceScore} <= 100`
      ),
    };
  }
);

export const coachingFeedbacks = pgTable("coaching_feedbacks", {
  id: uuid("id").primaryKey().defaultRandom(),
  evaluationId: uuid("evaluation_id")
    .notNull()
    .references(() => evaluations.id, { onDelete: "cascade" })
    .unique(),
  memoryItemId: uuid("memory_item_id").references(() => memoryItems.id, { onDelete: "set null" }), // P1-2 Patch
  whatWentWrong: text("what_went_wrong").notNull(),
  rewriteExample: text("rewrite_example").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
