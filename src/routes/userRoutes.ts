import { Elysia } from 'elysia';
import { signIn, signUp } from '../controllers/userControlller';
import jwt from 'jsonwebtoken';
import { authPrivateKey } from '../secrets';

interface SignInBody {
  email: string;
  password: string;
}

interface SignUpBody {
  name: string;
  email: string;
  password: string;
  terms: boolean;
}

const signInReturnFailureSchema = {
  title: 'Authentication',
  success: false,
  message: 'Authentication failed',
  error: 'Email and password are required.',
}

export const userRoutes = new Elysia({ prefix: '/user' })
  .post('/signin', async ({ body, set }: { body: SignInBody, set: any }) => {
    const { email, password } = body;
    console.log(`userRoute/signin :: Sign In called ${email}`)
    if (!email || !password) {
      console.log(`userRoute/signin :: Sign Failed due to non availiblity 
        of email or password.`)
        return signInReturnFailureSchema;
    }
    try {
      console.log(`userRoute/signin :: Trying Sign In ${email}`);
      const signInOutput = await signIn(email, password)
      console.log(`userRoute/signin :: Sign In Successfull ${email}`)
      console.log(signInOutput)
      // Set cookie if sign in is successful
      if (signInOutput && signInOutput.accessToken) {
        set.headers['Set-Cookie'] = `accessToken=${signInOutput.accessToken}; HttpOnly; Path=/; SameSite=None; Secure; Max-Age=604800;`;
      }
      return signInOutput;
    } catch (error: any) {
      //return { error: error.message };
      return {
        ...signInReturnFailureSchema,
        error: error.message,
      }
    }
  })
  .post('/signup', async ({ body, set }: { body: SignUpBody, set: any }) => {
    console.log('userRoute/signup :: Signup Called');
    const { name, email, password } = body;
    if (!name || !email || !password) {
      return signInReturnFailureSchema;
    }
    try {
      console.log(`signup : ${email} , ${password}, ${name}`);
      const signUpOutput = await signUp(name, email, password);
      // Set cookie if sign up is successful
      if (signUpOutput && signUpOutput.data && signUpOutput.data.accessToken) {
        set.headers['Set-Cookie'] = `accessToken=${signUpOutput.data.accessToken}; HttpOnly; Path=/; SameSite=None; Secure; Max-Age=604800;`;
      }
      return signUpOutput;
    } catch (error: any) {
      console.log(error);
      return {
        ...signInReturnFailureSchema,
        error: error.message,
      };
    }
  })
  .get('/userinfo', async ({ request }) => {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return {
        ...signInReturnFailureSchema,
        error: 'Unauthorized',
      };
    }
    try {
      // Remove 'Bearer ' prefix if present
      const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : authHeader;
      const decoded = jwt.verify(token, authPrivateKey) as {
        userID: string;
        email: string;
      };
      return {
        title: 'User Info',
        message: 'User information retrieved successfully',
        success: true,
        data: {
          userID: decoded.userID,
          email: decoded.email,
        },
      };
    } catch (error) {
      return { error: 'Invalid or expired token.' };
    }
  })
  .get('/checkauth', async ({ request }) => {
    // Read cookie from request.headers
    const cookie = request.headers.get('cookie');
    if (!cookie) {
      return { success: false, error: 'Unauthorized' };
    }
    // Parse cookie string to get accessToken
    const match = cookie.match(/accessToken=([^;]+)/);
    if (!match) {
      return { success: false, error: 'Unauthorized' };
    }
    const token = match[1];
    try {
      const decoded = jwt.verify(token, authPrivateKey) as {
        userID: string;
        email: string;
      };
      return {
        success: true,
        user: {
          userID: decoded.userID,
          email: decoded.email,
        },
      };
    } catch (error) {
      return { success: false, error: 'Invalid or expired token.' };
    }
  });
