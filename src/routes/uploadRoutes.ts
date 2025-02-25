import { Elysia } from "elysia";

export const uploadRoute = new Elysia({prefix: '/file'})
  .post("/upload", () => {})
  .get("/:link", () => {});
