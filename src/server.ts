import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import * as dotenv from "dotenv";
dotenv.config();

const app = new Elysia()
  .use(swagger())
  // .use(userRoutes)
  .listen(3000)
  .get("/", "Hello World")
  .get("/hello", () => {
    return {
      name: "hello",
    };
  });

if (process.env.NODE_ENV != "production") {
  import("@elysiajs/swagger").then(({ default: swagger }) => {
    app.use(swagger());
  });
}

console.log(`🚀 Server running at http://localhost:3000`);
