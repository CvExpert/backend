
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
      try {
        const access = await checkFileAccess(fileID, userID);
        if (!access) {
          return error(403, 'You do not have access to this file');
        }
        console.log('File access granted');
        const response = await analyzeFileUsingAI(file, fileID);
        if (response) {
          return response;
        } else {
          return error(500, 'Failed to analyze the file');
        }
      } catch (err) {
        console.error(err);
        return error(500, 'An internal error occurred while processing the file.');
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
