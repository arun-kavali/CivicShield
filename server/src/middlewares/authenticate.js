import { User } from '../models/User.js';
import { verifyAccessToken } from '../services/tokenService.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authenticate = asyncHandler(async (req, _res, next) => {
  const authorization = req.get('authorization');
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : req.cookies?.civicshield_access_token;
  if (!token) throw new AppError('Authentication is required.', 401);
  let payload;
  try { payload = verifyAccessToken(token); } catch { throw new AppError('Access token is invalid or expired.', 401); }
  if (payload.tokenType !== 'access') throw new AppError('Invalid access token.', 401);
  const user = await User.findById(payload.sub).select('+refreshTokenVersion');
  if (!user || !user.active || user.organizationId.toString() !== payload.organizationId) throw new AppError('User account is unavailable.', 401);
  req.user = user;
  req.organizationId = user.organizationId.toString();
  next();
});
