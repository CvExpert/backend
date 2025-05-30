import { GoogleGenerativeAI } from '@google/generative-ai';
import { getDocument } from 'pdfjs-dist';
import { model } from '../gemini';
import { db } from '../database';
import { analyzeModel } from '../models/models';
import { checkFileAccess } from './accessController';

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
    console.log("analyzeTextLLM :: Successfully parsed text to JSON object.");
    console.log(
      `analyzeTextLLM :: Successfully parsed text to JSON object: 
      ${JSON.stringify(jsonObject)}
      `
    )
    return jsonObject;
  } catch (error: any) {
    console.log(error);
    return { error: error?.message };
  }
}


export async function analyzeFileUsingAI(file: File, fileID: string) {
  // Take input as a file and analyze it using AI
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
    console.log('Text extracted from the PDF');

    // Analyze the text using LLM
    const responseText = await analyzeTextLLM(text);
    console.log('LLM response text');
    console.log(responseText);

    // Parse the response JSON
    const responseJSON =jsonString
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
    console.log('Analysis inserted into the database');

    // Return the response
    return { success: true, fileID, response: responseJSON };
  } catch (error: any) {
    console.log('Error analyzing file');
    return { error: error?.message };
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
