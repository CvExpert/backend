import { eq } from 'drizzle-orm';
import { db } from '../database';
import { filesModel } from '../models/models';

// Function to check file existence and access
export async function checkFileAccess(fileID: string, userID: string) {
  const file = await db
    .select()
    .from(filesModel)
    .where(eq(filesModel.fileID, fileID)) // Correct use of `eq`
    .limit(1); // Ensures only one record is retrieved

  if (!file.length) {
    // File does not exist
    return false;
  }

  // Check if the user has access to the file
  return file[0].userID === userID;
}
