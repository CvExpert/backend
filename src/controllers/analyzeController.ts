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
    "resumeScore": integer,
    "strengths": [],
    "weaknesses": [],
    "suggestions": []
    }
    This is an backend app that analyzes resumes and I need only the structured JSON response.
    Only include the information that is requested in the response.
    Follow these guidelines properly : 

    - Ensure the response is a valid JSON object without additional explanations.
    - Don't include any additional information in the response.
    - Don't include a \` symbol anywhere in the response.
    - Start response from { and end with }.
    - Don't write json or other things in the response
    - Keep the response clean and simple, but informative and detailed.
    - Keep the output clean and detailed.
    - If there are any missing sections in the resume, return an empty string for that section.
    - If the resume is not well structured, return an empty string for all sections.

    **Resume Content:**
    ${text}
  `;
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

export async function analyzeFileUsingAI(text: string, fileID: string) {
  try {
    // Analyze text using your LLM
    const responseJSON = await analyzeTextLLM(text);

    // Store results in the database
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