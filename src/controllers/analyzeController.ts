import { GoogleGenerativeAI } from '@google/generative-ai';
import { model } from '../gemini';
import { db } from '../database';
import { analyzeModel, filesModel } from '../models/models';
import { checkFileAccess } from './accessController';
import { eq } from 'drizzle-orm';
import pdfParse from 'pdf-parse';

export async function analyzeFile(fileId: string, userId: string) {
  const permission = await checkFileAccess(fileId, userId);
  if (permission) {
    console.log('User have permission');
  }
}

// Adds extra functionality to clean up the resume text, removed because it
// adds cost to output

// async function cleanUpResumeText(text: string) {
//   const promt = `
//   Clean up the given resume text by removing any unnecessary information,
//   formatting it properly, and ensuring it is clear and concise.
//   The cleaned resume should be easy to read and understand with proper headings and sections.
//   Remove any personal information such as name, address, phone number, and email.
//   The cleaned resume should be in plain text format without any special characters or formatting.

//   **Resume Content:**
//   ${text}
//   `;
//   try {
//     // Generate content using the model
//     const result = await model.generateContent(promt);

//     // Return the response text
//     return result?.response.text();
//   } catch (error: any) {
//     console.log(error);
//     return { error: error?.message };
//   }
// }


async function analyzeTextLLM(text: string) {
  try {
    // Construct the prompt properly
    // Clean up the resume text
    console.log('Cleaned resume text');
    console.log(text);
    // Analyze the cleaned resume text
    const prompt = `Analyze the given resume in detail and provide a comprehensive analysis in the following JSON format:
{
  "experience": "Detailed description of the candidate's work experience, including roles, responsibilities, and achievements.",
  "education": "Detailed description of the candidate's educational background, including degrees, institutions, and relevant coursework.",
  "achievements": "Notable achievements, awards, or recognitions the candidate has received.",
  "experienceScore": 0,
  "educationScore": 0,
  "achievementScore": 0,
  "resumeStyleScore": 0,
  "resumeScore": 0,
  "projectScore": 0,
  "strengths": ["List", "of", "key", "strengths", "and", "skills"],
  "weaknesses": ["List", "of", "potential", "areas", "for", "improvement"],
  "suggestions": ["Actionable", "suggestions", "for", "improvement"]
}

IMPORTANT INSTRUCTIONS:
1. Return ONLY valid JSON without any additional text or markdown formatting.
2. For strengths, include 5-8 key technical and soft skills that stand out.
3. For weaknesses, provide 3-5 areas where the candidate could improve (be constructive).
4. For suggestions, give 3-5 specific, actionable recommendations.
5. All scores should be integers between 0-10.
6. If a section is not applicable, use an empty string or empty array as appropriate.
7. Do not include any markdown formatting or backticks in the response.
8. Start with { and end with } - no other text should be included.
9. Be detailed but concise in your analysis.
10. For skills and technologies, be specific and include relevant frameworks/languages.
11. For weaknesses and suggestions, always provide meaningful feedback even if the resume is strong.
12. Ensure all arrays have at least 3 items, even if you need to be more general.

Resume Content:
${text}`;
    // Generate content using the model
    const result = await model.generateContent(prompt);

    // Return the response text
    if(result?.response.text().length === 0) {
      return { error: 'Falied to analyze.' };
    }

    console.log("analyzeTextLLM :: Successfully generated content.")

    // Ensure the response is a valid JSON object
    // Use regex to remove any unwanted characters

    const match = result?.response.text().match(/{[\s\S]*}/);
    if (!match || match.length === 0) {
      return { error: 'Failed to parse response.' };
    }
    console.log("analyzeTextLLM :: Successfully parsed text to JSON text.");
    // Return the first match
    const jsonResult = match[0];
    const jsonObject = JSON.parse(jsonResult);
    if(!jsonObject) {
      return { error: 'Failed to JSON text to JSON object' };
    }
    // Log the full AI output for debugging
    console.log('AI Output (raw):', result?.response.text());
    console.log('AI Output (parsed):', JSON.stringify(jsonObject, null, 2));
    return jsonObject;
  } catch (error: any) {
    console.log(error);
    return { error: error?.message };
  }
}


// import { getDocument } from 'pdfjs-dist/legacy/build/pdf.js';

// import { getDocument } from 'pdfjs-dist/legacy/build/pdf.js';



// import pdfParse from pdfParse

export const analyzeFileUsingAI = async (text: string, fileID: string) => {
  try {
    // Analyze text using your LLM
    const responseJSON = await analyzeTextLLM(text);

    // Store results in the database
    await db.insert(analyzeModel).values({
      fileID,
      experience: responseJSON.experience || '',
      education: responseJSON.education || '',
      achievements: responseJSON.achievements || '',
      experienceScore: responseJSON.experienceScore || 0,
      educationScore: responseJSON.educationScore || 0,
      achievementScore: responseJSON.achievementScore || 0,
      resumeStyleScore: responseJSON.resumeStyleScore || 0,
      resumeScore: responseJSON.resumeScore || 0,
      projectScore: responseJSON.projectScore || 0,
      strengths: responseJSON.strengths || [],
      weaknesses: responseJSON.weaknesses || [],
      suggestions: responseJSON.suggestions || []
    });

    console.log('Analysis inserted into DB');
    return { success: true, fileID, response: responseJSON };
  } catch (err: any) {
    console.error('Text analysis failed:', err);
    return { error: err?.message ?? 'Unknown error analyzing text' };
  }
}


// To Do: Implement the chatUsingAI function
export async function chatUsingAI(message: string) {
  try {
  } catch (error: any) {
    console.log(error);
    return { error: error?.message };
  }
}

export async function getUserFiles(userID : string){
  try{
    const res = await db
      .select({
      fileID: filesModel.fileID,
      projectName: filesModel.projectName
      })
      .from(filesModel)
      .where(eq(filesModel.userID, userID));
    return res;
  }
  catch (error: any) {
    console.log(error);
    return { error: error?.message };
  }
}