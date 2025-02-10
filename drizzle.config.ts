import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/models/models.ts", // Path to your Drizzle models
  out: "./drizzle", // Directory for migrations
  dialect: "postgresql", // ✅ Specify PostgreSQL dialect
  dbCredentials: {
    url: process.env.DATABASE_URL!, // Read from .env
  },
  migrations: {
    table: "my-migrations-table", // `__drizzle_migrations` by default
    schema: "public", // used in PostgreSQL only, `drizzle` by default
  },
});
