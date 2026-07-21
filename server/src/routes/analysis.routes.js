import { Router } from 'express';
import { get, run, runAll } from '../controllers/analysis.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
export const analysisRouter=Router(); analysisRouter.use(authenticate); analysisRouter.post('/run-all',runAll); analysisRouter.post('/run/:alertId',run); analysisRouter.get('/:alertId',get);
