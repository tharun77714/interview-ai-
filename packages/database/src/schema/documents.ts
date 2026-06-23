import { pgTable, text, timestamp, uuid, jsonb, boolean } from "drizzle-orm/pg-core";
import { candidateProfiles } from "./profiles";

export const resumes = pgTable("resumes", {
  id: uuid("id").primaryKey().defaultRandom(),
  candidateProfileId: uuid("candidate_profile_id")
    .notNull()
    .references(() => candidateProfiles.id, { onDelete: "cascade" }),
  fileUrl: text("file_url").notNull(),
  parsedData: jsonb("parsed_data"),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const jobDescriptions = pgTable("job_descriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  candidateProfileId: uuid("candidate_profile_id")
    .notNull()
    .references(() => candidateProfiles.id, { onDelete: "cascade" }),
  rawText: text("raw_text").notNull(),
  parsedRequirements: jsonb("parsed_requirements"),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
