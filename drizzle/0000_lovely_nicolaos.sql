CREATE TABLE `auths` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`pfp` text NOT NULL,
	`info` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `cards` (
	`id` text PRIMARY KEY NOT NULL,
	`auth_id` text NOT NULL,
	`event_id` text NOT NULL,
	`index` integer NOT NULL,
	`submitted` integer DEFAULT false NOT NULL,
	`submitted_at` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`data` text
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`auth_id` text NOT NULL,
	`name` text NOT NULL,
	`schema` text NOT NULL,
	`submit_expiry` integer NOT NULL,
	`created_at` integer NOT NULL
);
