import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/user';
import Note from './models/note';
import cors from '@koa/cors';

dotenv.config();

const app = new Koa();
const router = new Router();


interface JwtPayload {
  id: number;
  username: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret' as string;;
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '15m';


interface LoginRequest {
  username: string;
  password: string;
}

interface CreateNoteRequest {
  title: string;
  content: string;
}

interface UpdateNoteRequest {
  title?: string;
  content?: string;
}


async function authenticate(ctx: any, next: any) {
  const authorizationHeader = ctx.headers['authorization'];

  if (!authorizationHeader) {
    ctx.status = 403;
    ctx.body = 'Token is required.';
    return;
  }

  const token = authorizationHeader.split(' ')[1];  // Get token from 'Bearer <token>'

  if (!token) {
    ctx.status = 403;
    ctx.body = 'Token is required.';
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    ctx.state.user = decoded; // Store user info in state
    await next();
  } catch (error) {
    console.log('error:', error);
    ctx.status = 401;
    ctx.body = 'Invalid or expired token.';
  }
}


// CORS configuration
const corsOptions: cors.Options = {
  origin: (ctx: Koa.Context) => {
    const origin = ctx.request.header.origin;
    // Allow both local and production domains
    if (origin === 'http://localhost:3000' || origin === 'http://localhost' || origin === 'https://your.domain.com') {
      return origin;
    }
    return 'undefined';
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  // Allow OPTIONS method for preflight requests
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
};

// Apply the CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests (OPTIONS method)
app.use(async (ctx, next) => {
  if (ctx.method === 'OPTIONS') {
    console.log('Handling preflight request');
    ctx.status = 200;
    return;
  }
  await next();
});


router.get('/api/test', async (ctx) => { //Simple endpont to test
  try {
    ctx.status = 200;
    ctx.body = { message: "Hello Planet", };
  } catch (err) {
    console.log('err:', err)
    ctx.status = 500;
    ctx.body = { error: err};
  }
});

// Create a new user (signup)
router.post('/api/signup', async (ctx) => {
  const { username, password }: LoginRequest = ctx.request.body as LoginRequest;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await User.create({ username, password: hashedPassword });
    ctx.status = 201;
    ctx.body = { message: 'User created', user: { username: user.username, id: user.id } };
  } catch (err) {
    console.log('err:', err)
    ctx.status = 500;
    ctx.body = { error: err};
  }
});

// Login route to generate JWT
router.post('/api/login', async (ctx) => {
  const { username, password }: LoginRequest = ctx.request.body as LoginRequest;

  const user = await User.findOne({ where: { username } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    ctx.status = 401;
    ctx.body = 'Invalid credentials';
    return;
  }

  // @ts-ignore: Ignore type error for jwt.sign method
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION,
  });

  ctx.body = { token };
});

// Create a new note (only authenticated users)
router.post('/api/notes', authenticate, async (ctx) => {
  const { title, content }: CreateNoteRequest = ctx.request.body as CreateNoteRequest;
  const { id } = ctx.state.user; // Authenticated user ID

  try {
    // Note creation without manually passing the ID (UUID is auto-generated)
    const note = await Note.create({
      title,
      content,
      userId: id,
    });

    // Send back the created note (including UUID for the `id`)
    ctx.status = 201;
    ctx.body = note;
  } catch (error) {
    console.log('error:', error);
    ctx.status = 500;
    ctx.body = { error: 'Error creating note' };
  }
});

// Get all notes for the logged-in user
router.get('api/notes', authenticate, async (ctx) => {
  const { id } = ctx.state.user;

  try {
    const notes = await Note.findAll({ where: { userId: id } });
    ctx.status = 200;
    ctx.body = notes;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: 'Error fetching notes' };
  }
});

// Update a note
router.put('/api/notes/:id', authenticate, async (ctx) => {
  const { id } = ctx.state.user;
  const noteId = ctx.params.id;
  const { title, content }: UpdateNoteRequest = ctx.request.body as UpdateNoteRequest;

  try {
    const note = await Note.findOne({ where: { id: noteId, userId: id } });
    if (!note) {
      ctx.status = 404;
      ctx.body = { error: 'Note not found' };
      return;
    }

    note.title = title || note.title;
    note.content = content || note.content;
    await note.save();

    ctx.status = 200;
    ctx.body = note;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: 'Error updating note' };
  }
});

// Delete a note
router.delete('/api/notes/:id', authenticate, async (ctx) => {
  const { id } = ctx.state.user;
  const noteId = ctx.params.id;

  try {
    const note = await Note.findOne({ where: { id: noteId, userId: id } });
    if (!note) {
      ctx.status = 404;
      ctx.body = { error: 'Note not found' };
      return;
    }

    await note.destroy();

    ctx.status = 200;
    ctx.body = { message: 'Note deleted' };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: 'Error deleting note' };
  }
});

// Apply routes to the app
app.use(bodyParser());
app.use(router.routes()).use(router.allowedMethods());

// Start the Koa server
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
