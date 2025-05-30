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
  .post('/signin', async ({ body }: { body: SignInBody }) => {
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
      return signInOutput;
    } catch (error: any) {
      //return { error: error.message };
      return {
        ...signInReturnFailureSchema,
        error: error.message,
      }
    }
  })
  .post('/signup', async ({ body }: { body: SignUpBody }) => {
    console.log('userRoute/signup :: Signup Called');
    const { name, email, password } = body;
    if (!name || !email || !password) {
      return signInReturnFailureSchema;
    }
    try {
      console.log(`signup : ${email} , ${password}, ${name}`);
      return await signUp(name, email, password);
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
      const decoded = jwt.verify(authHeader, authPrivateKey) as {
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
  });
