import { Router } from 'express';
import { getById, ingest, list } from '../controllers/alert.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
export const alertRouter = Router();
alertRouter.use(authenticate); alertRouter.post('/ingest', ingest); alertRouter.get('/', list); alertRouter.get('/:id', getById);
