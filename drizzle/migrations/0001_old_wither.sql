CREATE TABLE "user_notification_settings" (
	"userId" varchar PRIMARY KEY NOT NULL,
	"newJobEmailNotifications" boolean DEFAULT false NOT NULL,
	"aiPromtp" varchar,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_notification_settings" ADD CONSTRAINT "user_notification_settings_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;