import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { databaseURL } from "./secrets";

const sql = postgres(databaseURL);
export const db = drizzle(sql);
