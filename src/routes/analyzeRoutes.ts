import { Elysia } from 'elysia';
import { analyzeFileUsingAI } from '../controllers/analyzeController';
import { checkFileAccess } from '../controllers/accessController';

interface AnalyzeBody {
  fileID: string;
  userID: string;
  file: File;
}

export const analyzeRoute = new Elysia({ prefix: '/analyze' }).get(
  '/pdf',
  async ({ body }: { body: AnalyzeBody }) => {
    // Analyze the PDF file
    console.log('Analyze Route called');
    const { fileID, file, userID } = body;
    if (!fileID || !file || !userID) {
      return { error: 'FileID, userID and File are required' };
    }
    try {
      // Check file access
      const access = await checkFileAccess(fileID, userID);
      if (!access) {
        return {
          success: false,
          message: 'You do not have access to this file',
        };
      }

      console.log('File access granted');

      // Analyze the file using AI
      const response = await analyzeFileUsingAI(file, fileID);
      if (response) {
        return response;
      } else {
        return { error: 'Failed to analyze the file' };
      }
    } catch (error: any) {
      console.log(error);
      return { error: error.message };
    }
  },
);
