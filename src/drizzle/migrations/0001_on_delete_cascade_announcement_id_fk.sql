ALTER TABLE "announcements_to_categories" DROP CONSTRAINT "announcements_to_categories_announcement_id_announcements_id_fk";
--> statement-breakpoint
ALTER TABLE "announcements_to_categories" ADD CONSTRAINT "announcements_to_categories_announcement_id_announcements_id_fk" FOREIGN KEY ("announcement_id") REFERENCES "public"."announcements"("id") ON DELETE cascade ON UPDATE no action;