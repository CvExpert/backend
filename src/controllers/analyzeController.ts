import { GoogleGenerativeAI } from '@google/generative-ai';
import { getDocument } from 'pdfjs-dist';
import { model } from '../gemini';
import { db } from '../database';
import { analyzeModel } from '../models/models';

async function checkFilePermission(fileId: string, userId: string) {
  return true;
}

export async function analyzeFile(fileId: string, userId: string) {
  const permission = await checkFilePermission(fileId, userId);
  if (permission) {
    console.log('User have permission');
  }
}

async function analyzeTextLLM(text: string) {
  try {
    // Construct the prompt properly
    const prompt = `
    Analyze the given resume and return a structured JSON response with the following format:
    {
    "experience": string,
    "education": string,
    "achievements": string,
    "experienceScore": integer,
    "educationScore": integer,
    "achievementScore": integer,
    "resumeStyleScore": integer,
    "resumeScore": integer
    }

    Ensure the response is a valid JSON object without additional explanations.
    Don't include any additional information in the response.
    Don't include a \` symbol anywhere in the response.
    Start response from { and end with }.
    Don't write json or other things in the response
    Keep the response clean and simple, but informative and detailed.

    **Resume Content:**
    ${text}
  `;
    const result = await model.generateContent(prompt);

    // Return the response text
    return result?.response.text();
  } catch (error: any) {
    console.log(error);
    return { error: error?.message };
  }
}

export async function analyzeFileUsingAI(file: File, fileID: string) {
  console.log('Analyzing file using AI');
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const pdf = await getDocument({ data: new Uint8Array(buffer) }).promise;
    let text = '';

    // Loop through all pages and extract text
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map(item => ('str' in item ? item.str : ''))
        .join(' ');
      text += pageText + '\n';
    }
    console.log(text);

    // Analyze the text using LLM
    const responseText = await analyzeTextLLM(text);
    console.log(responseText);

    // Parse the response JSON
    const responseJSON =
      typeof responseText === 'string'
        ? JSON.parse(responseText)
        : responseText;

    // Insert the analysis into the database
    await db.insert(analyzeModel).values({
      fileID,
      experience: responseJSON.experience,
      education: responseJSON.education,
      achievements: responseJSON.achievements,
      experienceScore: responseJSON.experienceScore,
      educationScore: responseJSON.educationScore,
      achievementScore: responseJSON.achievementScore,
      resumeStyleScore: responseJSON.resumeStyleScore,
      resumeScore: responseJSON.resumeScore,
    });

    // Return the response
    return { success: true, fileID, response: responseJSON };
  } catch (error: any) {
    console.log('Error analyzing file');
    return { error: error?.message };
  }
}

export async function chatUsingAI(message: string) {
  try {
  } catch (error: any) {
    console.log(error);
    return { error: error?.message };
  }
}
