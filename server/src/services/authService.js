import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { Organization } from '../models/Organization.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { createSlug } from '../utils/slug.js';
import { createAccessToken, createRefreshToken, verifyRefreshToken } from './tokenService.js';

export function publicUser(user) { return { id: user.id, organizationId: user.organizationId.toString(), name: user.name, email: user.email, role: user.role, active: user.active, lastLogin: user.lastLogin, createdAt: user.createdAt, updatedAt: user.updatedAt }; }

async function uniqueSlug(name) {
  const base = createSlug(name); let slug = base; let suffix = 2;
  while (await Organization.exists({ slug })) { slug = `${base}-${suffix}`; suffix += 1; }
  return slug;
}

export async function registerUser({ name, email, password, organizationName }) {
  if (await User.exists({ email: email.toLowerCase() })) throw new AppError('An account with this email already exists.', 409);
  const passwordHash = await bcrypt.hash(password, 12);
  const temporaryCreatorId = new mongoose.Types.ObjectId();
  const organization = await Organization.create({ name: organizationName, slug: await uniqueSlug(organizationName), createdBy: temporaryCreatorId });
  const user = await User.create({ organizationId: organization.id, name, email, passwordHash, role: 'organization_admin' });
  organization.createdBy = user.id;
  await organization.save();
  return { user: publicUser(user), organization, accessToken: createAccessToken(user), refreshToken: createRefreshToken(user) };
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash +refreshTokenVersion');
  if (!user || !user.active || !(await bcrypt.compare(password, user.passwordHash))) throw new AppError('Invalid email or password.', 401);
  user.lastLogin = new Date(); await user.save();
  return { user: publicUser(user), accessToken: createAccessToken(user), refreshToken: createRefreshToken(user) };
}

export async function rotateRefreshToken(token) {
  if (!token) throw new AppError('Refresh token is required.', 401);
  let payload; try { payload = verifyRefreshToken(token); } catch { throw new AppError('Refresh token is invalid or expired.', 401); }
  if (payload.tokenType !== 'refresh') throw new AppError('Invalid refresh token.', 401);
  const user = await User.findById(payload.sub).select('+refreshTokenVersion');
  if (!user || !user.active || user.refreshTokenVersion !== payload.tokenVersion) throw new AppError('Refresh token is no longer valid.', 401);
  user.refreshTokenVersion += 1; await user.save();
  return { user: publicUser(user), accessToken: createAccessToken(user), refreshToken: createRefreshToken(user) };
}

export async function invalidateRefreshTokens(user) { user.refreshTokenVersion += 1; await user.save(); }
