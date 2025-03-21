import { Elysia } from "elysia";

export const analyzeRoute = new Elysia({prefix : '/analyze'})
  .get("/:fileID", () => {
    return { message: "Analyze route" };
  });
