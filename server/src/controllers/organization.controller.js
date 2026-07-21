import { Organization } from '../models/Organization.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getCurrentOrganization = asyncHandler(async (req, res) => {
  const organization = await Organization.findById(req.organizationId);
  if (!organization || organization.status !== 'active') throw new AppError('Organization is unavailable.', 404);
  return sendSuccess(res, { data: { organization } });
});

export const updateCurrentOrganization = asyncHandler(async (req, res) => {
  const organization = await Organization.findById(req.organizationId);
  if (!organization || organization.status !== 'active') throw new AppError('Organization is unavailable.', 404);

  const { name, sector } = req.body || {};
  if (typeof name === 'string' && name.trim()) organization.name = name.trim();
  if (typeof sector === 'string' || sector === null) organization.sector = sector ?? '';
  await organization.save();

  return sendSuccess(res, { message: 'Organization updated successfully.', data: { organization } });
});
