import { Router } from 'express';
import { generate, get, regenerate } from '../controllers/investigation.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
export const investigationRouter=Router();investigationRouter.use(authenticate);investigationRouter.post('/generate/:incidentId',generate);investigationRouter.post('/regenerate/:incidentId',regenerate);investigationRouter.get('/:incidentId',get);
