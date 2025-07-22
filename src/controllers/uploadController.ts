import { db } from '../database';
import { filesModel } from '../models/models';
import {
  appwriteEndpointURL,
  appwriteProjectID,
  appwriteStorageBucketID,
} from '../secrets';
import { ID } from 'appwrite';
import { analyzeFileUsingAI } from './analyzeController';

export async function uploadFile(
  text: string,
  userID: string,
  projectName: string,
) {
  try {
    // Uploading file information to db
    console.log('Trying uploading file information to db');
    const fileID = ID.unique();
    const dbResponse = await putFileInfoDB(fileID, userID, projectName);

    if (dbResponse) {
      console.log('File Information uploaded to db');
      console.log('File ID: ', fileID);
    } else throw new Error('Failed to upload in db');
    const fileAnalysis = await analyzeFileUsingAI(text, fileID);
    if (fileAnalysis.error) {
      throw new Error(fileAnalysis.error);
    }
    console.log('File Analysis completed successfully');
    console.log('File Analysis Response: ', fileAnalysis);
    // Return the response
    return { success: true, fileID: fileID };
  } catch (error: any) {
    console.log(error);
    return { error: error?.message };
  }
}

async function putFileInfoDB(
  fileID: string,
  userID: string,
  projectName: string,
) {
  // Put file info to database
  try {
    const fileLink = `${appwriteEndpointURL}/storage/buckets/${appwriteStorageBucketID}/files/${fileID}/view?project=${appwriteProjectID}`;
    const response = await db
      .insert(filesModel)
      .values({ fileID, userID, projectName, fileLink });
    return response;
  } catch (error: any) {
    console.log('Uploading file failed');
    return { error: error?.message };
  }
}

export function getFileURL(fileID: string) {
  // Get file URL
  const fileLink = `${appwriteEndpointURL}/storage/buckets/${appwriteStorageBucketID}/files/${fileID}/view?project=${appwriteProjectID}`;
  return fileLink;
}
