import { db } from "../database";
import { filesModel } from "../models/models";
import { appwriteEndpointURL, appwriteProjectID, appwriteStorageBucketID } from "../secrets";
import { uploadResumeFile } from "../storage";

export async function uploadFile(file:File, userID:string, projectName:string){ {
  try {
    const response = await uploadResumeFile(file);
    if(response){
      console.log("upload file success");
    }
    // Uploading to database
    const dbResponse = await putFileInfoDB(response.$id, userID, projectName);
    if(dbResponse){
      return 
      {
        fileID: response?.$id
      };
    }
    throw new Error("Failed to upload in db")
  } catch (error: any) {
    console.log(error);
    return { error: error?.message };
  }
}

async function putFileInfoDB(fileID:string, userID:string, projectName:string){
  // Put file info to db
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

// await db
//       .insert(usersModel)
//       .values({ userID, name, email, password: hashedPassword })
//       .returning();

// export const filesModel = pgTable("files", {
//   fileID: varchar("file_id", { length: 255 }).primaryKey(),
//   userID: text("user_id")
//     .notNull()
//     .references(() => usersModel.userID, { onDelete: "cascade" }),
//   projectName : text("project_name").default("untitled"),
//   fileLink: text("file_link").notNull(),
// });