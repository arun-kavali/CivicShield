import { Router } from 'express';
import { getCurrentOrganization, updateCurrentOrganization } from '../controllers/organization.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
export const organizationRouter = Router();
organizationRouter.get('/me', authenticate, getCurrentOrganization);
organizationRouter.put('/me', authenticate, updateCurrentOrganization);
