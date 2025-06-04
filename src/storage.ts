import Appwriteclient from "./appwrite";
import { ID, Storage } from "appwrite";
import { appwriteStorageBucketID } from "./secrets";

const storage = new Storage(Appwriteclient);

export const uploadResumeFile = async (file: File) => {
  try {
    const fileDataPromise = await storage.createFile(
      appwriteStorageBucketID,
      ID.unique(),
      file
    );
    return fileDataPromise;
  } catch (error: any) {
    console.error("Error uploading file:", error);
    return { error: error.message };
  }
}