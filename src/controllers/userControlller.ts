import jwt from 'jsonwebtoken';
import { db } from '../database';
import { filesModel, usersModel } from '../models/models';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { authPrivateKey } from '../secrets';

// DEPRECATED: use userController.ts instead
export async function signIn(email: string, password: string) {
  try {
    // Check if user exists
    const [user] = await db
      .select()
      .from(usersModel)
      .where(eq(usersModel.email, email));

    if (!user) {
      throw new Error('Invalid Email or Password');
    }

    // Verify password
    const isPasswordValid = await Bun.password.verify(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password.');
    }

    // Generate Access Token (Longer-lived for persistent login)
    const accessToken = jwt.sign(
      { userID: user.userID, email: user.email },
      authPrivateKey,
      { algorithm: 'HS256', expiresIn: '7d' }, // 7 days expiry
    );

    return {
      title: 'Authentication',
      message: 'Authentication successful',
      success: true,
      accessToken, // Short-lived token
      user: {
        userID: user.userID,
        name: user.name,
        email: user.email,
      }
    };
  } catch (error) {
    console.error('Error signing in:', error);
    throw new Error('Failed to sign in. Please check your credentials.');
  }
}

// DEPRECATED: use userController.ts instead
export async function signUp(name: string, email: string, password: string) {
  try {
    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(usersModel)
      .where(eq(usersModel.email, email));
    if (existingUser) {
      console.log('User already exists');
      throw new Error('Email already in use.');
    }

    const userID = uuidv4();

    // Hash password
    const hashedPassword = await Bun.password.hash(password);

    // Insert new user into database
    const newUser = await db
      .insert(usersModel)
      .values({ userID, name, email, password: hashedPassword })
      .returning();

    console.log('Inserted user with ID:', newUser[0].userID);
    console.log('User details:', newUser);

    // Generate Access Token (Longer-lived for persistent login)
    const accessToken = jwt.sign(
      { userID: newUser[0].userID, email: newUser[0].email },
      authPrivateKey,
      { algorithm: 'HS256', expiresIn: '7d' }, // 7 days expiry
    );

    return {
      title: 'Authentication',
      message: 'Authentication successful',
      success: true,
      data: {
        accessToken,
        user: {
          userID,
          name,
          email,
        }
      }
    };
  } catch (error) {
    console.error('Error signing up:', error);
    throw new Error('Failed to sign up. Please try again.');
  }
}

export async function getAllFiles(userID: string) {
  try {
    const res = await db
      .select({
        fileID: filesModel.fileID,
        projectName: filesModel.projectName, // Optional if you need it
      })
      .from(filesModel)
      .where(eq(filesModel.userID, userID));

    return res; // Returning JSON response
  } catch (error) {
    console.error('Error fetching files:', error);
    throw new Error('Failed to fetch files');
  }
}
