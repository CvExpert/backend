// import { db } from '../database';
// import { users } from '../models/user';
import { eq } from "drizzle-orm";

export async function getUsers() {
  return await "Get User ...";
}

export async function createUser(name: string, email: string) {
  return await "Create User ...";
}
