import { GoogleGenerativeAI } from '@google/generative-ai';
import { geminiAPIKey } from './secrets';

const genAI = new GoogleGenerativeAI(geminiAPIKey);
export const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  generationConfig: {
    temperature: 0.2, // Low temperature for consistency
  },
});
