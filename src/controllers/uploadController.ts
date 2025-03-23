import { db } from "../database";
import { filesModel } from "../models/models";
import { appwriteEndpointURL, appwriteProjectID, appwriteStorageBucketID } from "../secrets";
import { uploadResumeFile } from "../storage";
import { analyzeFileUsingAI } from "./analyzeController";

export async function uploadFile(file:File, userID:string, projectName:string){ {
  try {
    // Uploading file to storage
    const response = await uploadResumeFile(file);
    if(response){
      console.log("upload file success");
    }
    // Uploading to database
    const dbResponse = await putFileInfoDB(response.$id, userID, projectName);
    if(dbResponse){
      const fileID = response?.$id;
      console.log("File Information uploaded to db");
      console.log("File ID: ", fileID);
    }
    else throw new Error("Failed to upload in db")

    // Return the response
    return { success: true, fileID: response?.$id };
  } catch (error: any) {
    console.log(error);
    return { error: error?.message };
  }
}

async function putFileInfoDB(fileID:string, userID:string, projectName:string){
  // Put file info to database
  try {
    const fileLink = `${appwriteEndpointURL}/storage/buckets/${appwriteStorageBucketID}/files/${fileID}/view?project=${appwriteProjectID}`;
    const response = await db
                            .insert(filesModel)
                            .values({fileID, userID, projectName, fileLink});
    return response
  } catch (error: any) {
    console.log("Uploading file failed");
    return {error : error?.message};
  }
}
}

export function getFileURL(fileID:string){
  // Get file URL
  const fileLink = `${appwriteEndpointURL}/storage/buckets/${appwriteStorageBucketID}/files/${fileID}/view?project=${appwriteProjectID}`;
  return fileLink;
}