import { Elysia, t } from 'elysia';
import { analyzeFileUsingAI } from '../controllers/analyzeController';
import {
  checkFileAccess,
  checkValidation,
} from '../controllers/accessController';

export const analyzeRoute = new Elysia({ prefix: '/analyze' }).guard(
  {
    beforeHandle({ request, error }) {
      const authHeader = request.headers.get('authorization');
      if (!authHeader) {
        return error(400, 'Unauthorized');
      }
      // Check if the token is valid
      const valid = checkValidation(authHeader);

      // Return error if token is invalid
      if (!valid) {
        return error(400, 'Unauthorized');
      }
    },
  },
  app =>
    app.post(
      '/pdf',
      async ({ body, error }) => {
        console.log('Analyze Route called');

        const { fileID, file, userID } = body;

        try {
          // Check file access permissions
          const access = await checkFileAccess(fileID, userID);
          if (!access) {
            return error(403, 'You do not have access to this file'); // Better status code
          }

          console.log('File access granted');

          // Analyze the file using AI
          const response = await analyzeFileUsingAI(file, fileID);
          if (response) {
            return response;
          } else {
            return error(500, 'Failed to analyze the file');
          }
        } catch (err) {
          console.error(err);
          return error(
            500,
            'An internal error occurred while processing the file.',
          );
        }
      },
      {
        body: t.Object({
          fileID: t.String(),
          userID: t.String(),
          file: t.File({ type: 'application/pdf' }), // Ensure proper file validation
        }),
      },
    ),
);
