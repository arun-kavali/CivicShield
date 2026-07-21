import { Router } from 'express';
import { generate } from '../controllers/demoAlert.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
export const demoAlertRouter = Router();
demoAlertRouter.post('/generate', authenticate, generate);
