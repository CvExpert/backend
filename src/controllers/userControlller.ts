import jwt from "jsonwebtoken";
import { db } from "../database";
import { usersModel } from "../models/models";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

const PRIVATE_KEY = process.env.PRIVATE_KEY as string;
const REFRESH_PRIVATE_KEY = process.env.REFRESH_PRIVATE_KEY as string;

export async function signIn(email: string, password: string) {
  try {
    // Check if user exists
    const [user] = await db
      .select()
      .from(usersModel)
      .where(eq(usersModel.email, email));

    if (!user) {
      throw new Error("Invalid Email or Password");
    }

    // Verify password
    const isPasswordValid = await Bun.password.verify(password, user.password);

    if (!isPasswordValid) {
      throw new Error("Invalid email or password.");
    }

    // Generate Access Token (Short-lived)
    const accessToken = jwt.sign(
      { userID: user.userID, email: user.email },
      PRIVATE_KEY,
      { algorithm: "HS256", expiresIn: "15m" }, // Shorter expiry for security
    );

    // Generate Refresh Token (Longer-lived)
    const refreshToken = jwt.sign(
      { userID: user.userID },
      REFRESH_PRIVATE_KEY,
      { algorithm: "HS256", expiresIn: "7d" }, // Longer expiry for refresh token
    );

    return {
      accessToken, // Short-lived token
      refreshToken, // Long-lived token
      user: {
        userID: user.userID,
        name: user.name,
        email: user.email,
      },
    };
  } catch (error) {
    console.error("Error signing in:", error);
    throw new Error("Failed to sign in. Please check your credentials.");
  }
}

export async function signUp(name: string, email: string, password: string) {
  try {
    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(usersModel)
      .where(eq(usersModel.email, email));
    if (existingUser) {
      console.log("User already exists");
      throw new Error("Email already in use.");
    }

    const userID = uuidv4();

    // Hash password
    const hashedPassword = await Bun.password.hash(password);

    // Insert new user into database
    const newUser = await db
      .insert(usersModel)
      .values({ userID, name, email, password: hashedPassword })
      .returning();

    console.log("Inserted user with ID:", newUser[0].userID);
    console.log("User details:", newUser);

    // Generate Access Token
    const accessToken = jwt.sign(
      { userID: newUser[0].userID, email: newUser[0].email },
      PRIVATE_KEY,
      { algorithm: "HS256", expiresIn: "15m" },
    );

    // Generate Refresh Token
    const refreshToken = jwt.sign(
      { userID: newUser[0].userID },
      REFRESH_PRIVATE_KEY,
      { algorithm: "HS256", expiresIn: "7d" },
    );

    return {
      accessToken,
      refreshToken,
      user: {
        userID,
        name,
        email,
      },
    };
  } catch (error) {
    console.error("Error signing up:", error);
    throw new Error("Failed to sign up. Please try again.");
  }
}
