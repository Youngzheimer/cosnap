import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const cards = sqliteTable("cards", {
    ID: text("id").primaryKey(), // uuid
    authID: text("auth_id").notNull().references(() => auths.ID, { onDelete: "cascade" }),
    eventID: text("event_id").notNull().references(() => events.ID, { onDelete: "cascade" }),
    index: integer("index").notNull(),
    submitted: integer("submitted", { mode: "boolean" }).notNull().default(false),
    submittedAt: integer("submitted_at").notNull().default(0),
    createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
    data: text("data") // json string
});

export const auths = sqliteTable("auths", {
    ID: text("id").primaryKey(), // uuid
    displayID: text("display_id").notNull().unique(), // human readable unique id for login
    passwordHash: text("password_hash").notNull(),
    name: text("name").notNull(),
    pfp: text("pfp").notNull(),
    publicInfo: text("public_info").notNull(), // json string
    info: text("info").notNull(), // json string
    createdAt: integer("created_at").notNull().$defaultFn(() => Date.now())
});

export const events = sqliteTable("events", {
    ID: text("id").primaryKey(), // uuid
    authID: text("auth_id").notNull().references(() => auths.ID, { onDelete: "cascade" }),
    name: text("name").notNull(),
    schema: text("schema").notNull(), // json schema for the card data & form
    submitExpiry: integer("submit_expiry").notNull(), // timestamp for when card submissions expire
    createdAt: integer("created_at").notNull().$defaultFn(() => Date.now())
});

export const sessions = sqliteTable("sessions", {
    ID: text("id").primaryKey(), // uuid
    authID: text("auth_id").notNull().references(() => auths.ID, { onDelete: "cascade" }),
    createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
});

export const reftokens = sqliteTable("reftokens", {
    ID: text("id").primaryKey(), // uuid
    sessionID: text("session_id").notNull().references(() => sessions.ID, { onDelete: "cascade" }),
    createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
    expiresAt: integer("expires_at").notNull(), // timestamp for when the refresh token expires
    used: integer("used", { mode: "boolean" }).notNull().default(false),
    usedAt: integer("used_at").notNull().default(0)
});