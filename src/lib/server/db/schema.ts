import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const cards = sqliteTable("cards", {
    ID: text("id").primaryKey(), // uuid
    authID: text("auth_id").notNull(),
    eventID: text("event_id").notNull(),
    index: integer("index").notNull(),
    submitted: integer("submitted", { mode: "boolean" }).notNull().default(false),
    submittedAt: integer("submitted_at").notNull().default(0),
    createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
    data: text("data") // json string
});

export const auths = sqliteTable("auths", {
    ID: text("id").primaryKey(), // uuid
    name: text("name").notNull(),
    pfp: text("pfp").notNull(),
    info: text("info").notNull(), // json string
    createdAt: integer("created_at").notNull().$defaultFn(() => Date.now())
});

export const events = sqliteTable("events", {
    ID: text("id").primaryKey(), // uuid
    authID: text("auth_id").notNull(),
    name: text("name").notNull(),
    schema: text("schema").notNull(), // json schema for the card data & form
    submitExpiry: integer("submit_expiry").notNull(), // timestamp for when card submissions expire
    createdAt: integer("created_at").notNull().$defaultFn(() => Date.now())
});