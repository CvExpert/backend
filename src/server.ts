import { Elysia } from "elysia";
import * as dotenv from "dotenv";
dotenv.config();

// Routes
import { userRoutes } from "./routes/userRoutes";
import { uploadRoute } from "./routes/uploadRoutes";
import { analyzeRoute } from "./routes/analyzeRoutes";
import cors from "@elysiajs/cors";
import { analyzeFileUsingAI } from "./controllers/analyzeController";

interface IBody {
  file : File;
}

const app = new Elysia()
  .use(
    cors({
      origin: "http://localhost:5173",
    }),
  )
  .use(userRoutes)
  .use(uploadRoute)
  .use(analyzeRoute)
  // .post('/tt', async ({ body } : {body : IBody}) => {
  //   const {file} = body;
  //   const response = await analyzeFileUsingAI(file);
  //   return { message: response};
  // })
  .listen(3000);

// Use swagger in development server
if (process.env.NODE_ENV != "production") {
  import("@elysiajs/swagger").then(({ default: swagger }) => {
    app.use(swagger());
  });
}

console.log(`Server running at http://localhost:3000`);
