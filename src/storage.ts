import Appwriteclient from "./appwrite";
import { ID, Storage } from "appwrite";
import { appwriteStorageBucketID } from "./secrets";

const storage = new Storage(Appwriteclient);

export const uploadResumeFile = async (file: File) => {
  const fileDataPromise = await storage.createFile(appwriteStorageBucketID, ID.unique(), file);
  return fileDataPromise;
}