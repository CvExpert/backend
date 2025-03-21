import { pgTable, text, varchar, integer } from 'drizzle-orm/pg-core';

// User Table
export const usersModel = pgTable('users', {
  userID: text('user_id').notNull().primaryKey(), // No need for unique()
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(), // Use varchar for security
});

// Files Table
export const filesModel = pgTable('files', {
  fileID: varchar('file_id', { length: 255 }).primaryKey(),
  userID: text('user_id')
    .notNull()
    .references(() => usersModel.userID, { onDelete: 'cascade' }),
  projectName: text('project_name').default('untitled'),
  fileLink: text('file_link').notNull(),
});

// Analysis Table
export const analyzeModel = pgTable('analyze', {
  fileID: varchar('file_id', { length: 255 })
    .primaryKey()
    .references(() => filesModel.fileID, { onDelete: 'cascade' }),
  experience: text('experience').notNull(),
  education: text('education').notNull(),
  achievements: text('achievements').notNull(),
  experienceScore: integer('experience_score').notNull(),
  educationScore: integer('education_score').notNull(),
  achievementScore: integer('achievement_score').notNull(),
  resumeStyleScore: integer('resume_style_score').notNull(),
  resumeScore: integer('resume_score').notNull(),
});
