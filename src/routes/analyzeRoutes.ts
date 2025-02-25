import { Elysia } from "elysia";

export const analyzeRoute = new Elysia({prefix : '/analyze'})
  .post("/:fileid", () => {})
  .get("/:fileid", () => {});
