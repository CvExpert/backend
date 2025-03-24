import { eq } from 'drizzle-orm';
import { db } from '../database';
import { filesModel } from '../models/models';
import jwt from 'jsonwebtoken';
import { authPrivateKey } from '../secrets';

// Function to check file existence and access
export async function checkFileAccess(
  fileID: string,
  userID: string,
): Promise<boolean> {
  try {
    const file = await db
      .select()
      .from(filesModel)
      .where(eq(filesModel.fileID, fileID)) // Correct use of `eq`
      .limit(1); // Ensures only one record is retrieved

    if (file.length === 0) {
      // File does not exist
      return false;
    }

    // Check if the user has access to the file
    return file[0].userID === userID;
  } catch (error) {
    console.error('Error checking file access:', error);
    return false; // Return false in case of an error
  }
}

export async function checkValidation(authHeader: string) {
  try {
    const decoded = jwt.verify(authHeader, authPrivateKey) as {
      userID: string;
      email: string;
    };
    if(decoded) return true;
    return false;
  } catch (error) {
    return false;
  }
}
