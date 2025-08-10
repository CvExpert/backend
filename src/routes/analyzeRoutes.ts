
import { db } from '../database';
import { analyzeModel } from '../models/models';
import { eq } from 'drizzle-orm';
import { Elysia, t } from 'elysia';
import { analyzeFileUsingAI } from '../controllers/analyzeController';
import { checkFileAccess, checkValidation } from '../controllers/accessController';


const analyzeRoute = new Elysia({ prefix: '/analyze' })
  .use((app) => {
    app.onBeforeHandle(({ request, error }) => {
      const authHeader = request.headers.get('authorization');
      if (!authHeader) {
        return error(400, 'Unauthorized');
      }
      const valid = checkValidation(authHeader);
      if (!valid) {
        return error(400, 'Unauthorized');
      }
    });
    return app;
  })
  .post(
    '/pdf',
    async ({ body, error }: any) => {
      console.log('Analyze Route called');
      const { fileID, file, userID } = body;
      let progress = 0;
      try {
        // Step 1: File Upload
        progress = 1;
        const access = await checkFileAccess(fileID, userID);
        if (!access) {
          return { error: 'You do not have access to this file', progress };
        }
        console.log('File access granted');
        // Step 2: Detecting Word Length
        progress = 2;
        // Simulate word length detection (replace with actual logic if needed)
        // Step 3: Parsing
        progress = 3;
        // Simulate parsing (replace with actual logic if needed)
        // Step 4: Scanning Fields
        progress = 4;
        // Simulate scanning fields (replace with actual logic if needed)
        // Step 5: Analyzing Content
        progress = 5;
        const response = await analyzeFileUsingAI(file, fileID);
        // Step 6: Generating Report
        progress = 6;
        if (response) {
          return { ...response, progress };
        } else {
          return { error: 'Failed to analyze the file', progress };
        }
      } catch (err) {
        console.error(err);
        return { error: 'An internal error occurred while processing the file.', progress };
      }
    },
    {
      body: t.Object({
        fileID: t.String(),
        userID: t.String(),
        file: t.File({ type: 'application/pdf' }),
      }),
    },
  )
  .get('/analysis', async ({ query }: { query: Record<string, string> }) => {
    const { fileID } = query;
    if (!fileID) return { error: 'fileID required' };
    const analysis = await db
      .select()
      .from(analyzeModel)
      .where(eq(analyzeModel.fileID, fileID));
    if (!analysis || analysis.length === 0) return { error: 'No analysis found' };
    return analysis[0];
  });

export { analyzeRoute };
