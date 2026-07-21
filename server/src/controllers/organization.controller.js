import { Organization } from '../models/Organization.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getCurrentOrganization = asyncHandler(async (req, res) => {
  const organization = await Organization.findById(req.organizationId);
  if (!organization || organization.status !== 'active') throw new AppError('Organization is unavailable.', 404);
  return sendSuccess(res, { data: { organization } });
});
