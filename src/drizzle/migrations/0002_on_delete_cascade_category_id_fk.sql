ALTER TABLE "announcements_to_categories" DROP CONSTRAINT "announcements_to_categories_category_id_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "announcements_to_categories" ADD CONSTRAINT "announcements_to_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;