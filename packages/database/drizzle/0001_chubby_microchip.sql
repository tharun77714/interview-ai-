CREATE TYPE "public"."speaker_enum" AS ENUM('AI', 'CANDIDATE');--> statement-breakpoint
ALTER TABLE "transcript_lines" ALTER COLUMN "speaker" SET DATA TYPE "public"."speaker_enum" USING "speaker"::"public"."speaker_enum";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "auth_provider_id" text;--> statement-breakpoint
ALTER TABLE "interview_plans" ADD COLUMN "targeted_memory_item_ids" uuid[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "coaching_feedbacks" ADD COLUMN "memory_item_id" uuid;--> statement-breakpoint
ALTER TABLE "coaching_feedbacks" ADD CONSTRAINT "coaching_feedbacks_memory_item_id_memory_items_id_fk" FOREIGN KEY ("memory_item_id") REFERENCES "public"."memory_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "memory_detections_memory_item_created_at_idx" ON "memory_detections" USING btree ("memory_item_id","created_at");--> statement-breakpoint
CREATE INDEX "memory_items_candidate_state_idx" ON "memory_items" USING btree ("candidate_profile_id","state");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_auth_provider_id_unique" UNIQUE("auth_provider_id");--> statement-breakpoint
ALTER TABLE "evaluations" ADD CONSTRAINT "score_range" CHECK ("evaluations"."score" >= 0 AND "evaluations"."score" <= 100);--> statement-breakpoint
ALTER TABLE "evaluations" ADD CONSTRAINT "confidence_range" CHECK ("evaluations"."confidence_score" >= 0 AND "evaluations"."confidence_score" <= 100);--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "final_score_range" CHECK ("reports"."final_score" >= 0 AND "reports"."final_score" <= 100);--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "overall_confidence_range" CHECK ("reports"."overall_confidence_score" >= 0 AND "reports"."overall_confidence_score" <= 100);