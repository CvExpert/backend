import { pgTable, text, serial, varchar } from "drizzle-orm/pg-core";

// User Table
export const users = pgTable("users", {
  userID: varchar("user_id", { length: 255 }).primaryKey().notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  password: text("password").notNull(),
});

// Files Table
export const files = pgTable("files", {
  fileID: varchar("file_id", { length: 255 }).primaryKey(),
  userID: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.userID),
  fileLink: text("file_link").notNull(),
});

// Analysis Table
export const analyze = pgTable("analyze", {
  fileID: varchar("file_id", { length: 255 })
    .primaryKey()
    .references(() => files.fileID),
  wordLength: text("word_length").notNull(),
  experience: text("experience").notNull(),
  education: text("education").notNull(),
  achievements: text("achievements").notNull(),
});
