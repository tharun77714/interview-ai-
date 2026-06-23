import { pgTable, text, timestamp, uuid, boolean, unique, index } from "drizzle-orm/pg-core";
import { candidateProfiles } from "./profiles";
import { interviews } from "./interviews";
import { evaluations } from "./evaluations";
import { memoryStateEnum } from "./enums";

export const memoryItems = pgTable(
  "memory_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    candidateProfileId: uuid("candidate_profile_id")
      .notNull()
      .references(() => candidateProfiles.id, { onDelete: "cascade" }),
    trait: text("trait").notNull(),
    state: memoryStateEnum("state").default("OBSERVED").notNull(),
    priorityTest: boolean("priority_test").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => {
    return {
      candidateStateIdx: index("memory_items_candidate_state_idx").on(table.candidateProfileId, table.state), // P1-3 Patch
    };
  }
);

export const memoryDetections = pgTable(
  "memory_detections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    memoryItemId: uuid("memory_item_id")
      .notNull()
      .references(() => memoryItems.id, { onDelete: "cascade" }),
    interviewId: uuid("interview_id")
      .notNull()
      .references(() => interviews.id, { onDelete: "cascade" }),
    evaluationId: uuid("evaluation_id").references(() => evaluations.id, { onDelete: "set null" }),
    wasDetected: boolean("was_detected").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => {
    return {
      memoryInterviewUnique: unique("memory_detections_memory_item_interview_unique").on(
        table.memoryItemId,
        table.interviewId
      ),
      memoryItemCreatedAtIdx: index("memory_detections_memory_item_created_at_idx").on(
        table.memoryItemId,
        table.createdAt
      ), // P1-3 Patch
    };
  }
);
