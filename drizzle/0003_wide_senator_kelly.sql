ALTER TABLE `auths` ADD `display_id` text NOT NULL;--> statement-breakpoint
ALTER TABLE `auths` ADD `password_hash` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `auths_display_id_unique` ON `auths` (`display_id`);