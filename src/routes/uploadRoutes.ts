import { Elysia } from 'elysia';
import { getFileURL, uploadFile } from '../controllers/uploadController';
import { getAllFiles } from '../controllers/userControlller';
import { checkFileAccess } from '../controllers/accessController';

interface UploadBody {
  file: File;
  projectName: string;
  userID: string;
  email: string;
}

interface GetFiles {
  userID: string;
  email: string;
}

interface GetFilesPDF {
  userID: string;
  fileID: string;
}

export const uploadRoute = new Elysia({ prefix: '/file' })
  .post('/upload', async ({ body }: { body: UploadBody }) => {
    console.log('upload called');
    const { file, userID, email, projectName } = body;
    if (!file) {
      return { error: 'File is required.' };
    }
    const response = await uploadFile(file, userID, projectName);

    if (response) {
      return response;
    } else {
      return { error: 'File upload failed or fileID is missing.' };
    }
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
  });
