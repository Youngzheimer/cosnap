CREATE TABLE `reftokens` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`used` integer DEFAULT false NOT NULL,
	`used_at` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`auth_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`auth_id`) REFERENCES `auths`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_cards` (
	`id` text PRIMARY KEY NOT NULL,
	`auth_id` text NOT NULL,
	`event_id` text NOT NULL,
	`index` integer NOT NULL,
	`submitted` integer DEFAULT false NOT NULL,
	`submitted_at` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`data` text,
	FOREIGN KEY (`auth_id`) REFERENCES `auths`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_cards`("id", "auth_id", "event_id", "index", "submitted", "submitted_at", "created_at", "data") SELECT "id", "auth_id", "event_id", "index", "submitted", "submitted_at", "created_at", "data" FROM `cards`;--> statement-breakpoint
DROP TABLE `cards`;--> statement-breakpoint
ALTER TABLE `__new_cards` RENAME TO `cards`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_events` (
	`id` text PRIMARY KEY NOT NULL,
	`auth_id` text NOT NULL,
	`name` text NOT NULL,
	`schema` text NOT NULL,
	`submit_expiry` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`auth_id`) REFERENCES `auths`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_events`("id", "auth_id", "name", "schema", "submit_expiry", "created_at") SELECT "id", "auth_id", "name", "schema", "submit_expiry", "created_at" FROM `events`;--> statement-breakpoint
DROP TABLE `events`;--> statement-breakpoint
ALTER TABLE `__new_events` RENAME TO `events`;