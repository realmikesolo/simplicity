CREATE TABLE "announcements" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "announcements_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"publication_date" timestamp (3) with time zone NOT NULL,
	"updated_at" timestamp (3) with time zone
);
--> statement-breakpoint
CREATE TABLE "announcements_to_categories" (
	"announcement_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	CONSTRAINT "announcements_to_categories_announcement_id_category_id_pk" PRIMARY KEY("announcement_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "categories_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(100) NOT NULL,
	CONSTRAINT "categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "announcements_to_categories" ADD CONSTRAINT "announcements_to_categories_announcement_id_announcements_id_fk" FOREIGN KEY ("announcement_id") REFERENCES "public"."announcements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcements_to_categories" ADD CONSTRAINT "announcements_to_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;