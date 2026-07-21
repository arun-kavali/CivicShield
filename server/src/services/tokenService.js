import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function createAccessToken(user) {
  return jwt.sign({ sub: user.id, organizationId: user.organizationId.toString(), role: user.role, tokenType: 'access' }, env.JWT_ACCESS_SECRET, { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN });
}
export function createRefreshToken(user) {
  return jwt.sign({ sub: user.id, tokenVersion: user.refreshTokenVersion, tokenType: 'refresh' }, env.JWT_REFRESH_SECRET, { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN });
}
export function verifyAccessToken(token) { return jwt.verify(token, env.JWT_ACCESS_SECRET); }
export function verifyRefreshToken(token) { return jwt.verify(token, env.JWT_REFRESH_SECRET); }
export function authCookieOptions(maxAge) { return { httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax', path: '/', ...(maxAge ? { maxAge } : {}) }; }
