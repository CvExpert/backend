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

export const userRoutes = new Elysia({ prefix: '/user' })
  .post('/signin', async ({ body }: { body: SignInBody }) => {
    const { email, password } = body;
    if (!email || !password) {
      return { error: 'Email and password are required.' };
    }
    try {
      console.log(`signin : ${email} , ${password}`);
      return await signIn(email, password);
    } catch (error: any) {
      return { error: error.message };
    }
  })
  .post('/signup', async ({ body }: { body: SignUpBody }) => {
    console.log('signup called');
    const { name, email, password } = body;
    if (!name || !email || !password) {
      return { error: 'All fields are required.' };
    }
    try {
      console.log(`signup : ${email} , ${password}, ${name}`);
      return await signUp(name, email, password);
    } catch (error: any) {
      console.log(error);
      return { error: error.message };
    }
  })
  .get('/userinfo', async ({ request }) => {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return { error: 'Authorization token is required.' };
    }
    try {
      const decoded = jwt.verify(authHeader, authPrivateKey) as {
        userID: string;
        email: string;
      };
      return { user: decoded };
    } catch (error) {
      return { error: 'Invalid or expired token.' };
    }
  });
