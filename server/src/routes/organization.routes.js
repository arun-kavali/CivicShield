import { Router } from 'express';
import { getCurrentOrganization } from '../controllers/organization.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
export const organizationRouter = Router();
organizationRouter.get('/me', authenticate, getCurrentOrganization);
