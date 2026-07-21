import { Router } from 'express';
import { login, logout, profile, refresh, register } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
export const authRouter = Router();
authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/refresh', refresh);
authRouter.post('/logout', authenticate, logout);
authRouter.get('/profile', authenticate, profile);
