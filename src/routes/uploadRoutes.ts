import { Elysia } from 'elysia';
import { getFileURL, uploadFile } from '../controllers/uploadController';
import { getAllFiles } from '../controllers/userController';
import {
  checkFileAccess,
  checkValidation,
} from '../controllers/accessController';
import jwt from 'jsonwebtoken';
import { authPrivateKey } from '../secrets';
import { db } from '../database';
import { analyzeModel } from '../models/models';
import { eq } from 'drizzle-orm';

interface UploadBody {
  file: File;
  projectName: string;
  userID: string;
}

interface GetFiles {
  userID: string;
  email: string;
}

interface GetFilesPDF {
  userID: string;
  fileID: string;
}

interface GetAllFilesInterface {
  userID: string;
}

export const uploadRoute = new Elysia({ prefix: '/file' }).guard(
  {
    beforeHandle({ request, error }) {
      const cookie = request.headers.get('cookie');
      if (!cookie) return error(400, 'Unauthorized');
      const match = cookie.match(/accessToken=([^;]+)/);
      if (!match) return error(400, 'Unauthorized');
      const token = match[1];
      try {
        jwt.verify(token, authPrivateKey);
        return;
      } catch {
        return error(400, 'Unauthorized');
      }
    },
  },
  app =>
    app
      .post('/upload', async ({ request }: { request: Request }) => {
        // Accept JSON body with text, userID, projectName
        const contentType = request.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          return { error: 'Content-Type must be application/json' };
        }
        const body = await request.json();
        const { text, userID, projectName } = body;
        if (!text || !userID) {
          return { error: 'Text and userID are required.' };
        }
        return await uploadFile(text, userID, projectName);
      })
      .get('/files', async ({ body }: { body: GetFiles }) => {
        console.log('get files called');
        const { userID, email } = body;
        if (!userID || !email) {
          return { error: 'User ID and email are required.' };
        }
        try {
          const response = await getAllFiles(userID);
          if (response) {
            return {
              data: {
                ...response,
              },
            };
          }
        } catch (error: any) {
          console.log(error);
          return { error: error.message };
        }
      })
      .get('/filepdf', async ({ query, set }) => {
        const { userID, fileID } = query;

        if (!userID || !fileID) {
          set.status = 400;
          return { error: 'User ID and File ID are required.' };
        }

        try {
          // Check file access
          const access = await checkFileAccess(fileID, userID);
          if (!access) {
            set.status = 403;
            return {
              success: false,
              message: 'You do not have access to this file',
            };
          }

          console.log('File access granted');

          // Get the file URL
          const fileURL = getFileURL(fileID);

          // Fetch the actual file
          const response = await fetch(fileURL);

          if (!response.ok) {
            set.status = response.status;
            return { error: 'Failed to fetch file' };
          }

          // Stream the file securely to the frontend
          set.headers['Content-Type'] =
            response.headers.get('Content-Type') || 'application/pdf';
          set.headers[
            'Content-Disposition'
          ] = `attachment; filename="${fileID}.pdf"`;

          return new Response(response.body); // Stream file
        } catch (error: any) {
          console.error('Error:', error);
          set.status = 500;
          return { error: 'Internal Server Error' };
        }
      })
      .get('/getallfiles', async ({ query }: { query: { userID?: string } }) => {
        console.log('Files:getallfiles :: Get all files called');
        const { userID } = query;

        if (!userID) {
          console.log('User ID not found');
          return { error: 'User ID is required.' };
        }

        try {
          const response = await getAllFiles(userID);
          if (response) {
            return {
              data: {
                ...response,
              },
            };
          }
        } catch (error: any) {
          console.log(error);
          return { error: error.message };
        }
      })
      // (analysis route moved to analyzeRoutes.ts)
);
