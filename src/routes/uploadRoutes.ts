import { Elysia } from 'elysia';
import { uploadFile } from '../controllers/uploadController';

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

export const uploadRoute = new Elysia({ prefix: '/file' })
  .post('/upload', async ({ body }: { body: UploadBody }) => {
    console.log('upload called');
    const { file, userID, email, projectName } = body;
    if (!file) {
      return { error: 'File is required.' };
    }
    const response = await uploadFile(file, userID, projectName);

    if (response && 'fileID' in response) {
      return {
        data: {
          msg: 'File Uploaded successfully',
          fileID: response.fileID,
        },
      };
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
      console.log(`get files : ${userID} , ${email}`);
      return { message: 'Get files' };
    } catch (error: any) {
      console.log(error);
      return { error: error.message };
    }
  });
