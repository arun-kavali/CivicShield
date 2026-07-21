import { invalidateRefreshTokens, loginUser, publicUser, registerUser, rotateRefreshToken } from '../services/authService.js';
import { authCookieOptions } from '../services/tokenService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { loginSchema, registerSchema } from '../validators/auth.validators.js';

const accessMaxAge = 15 * 60 * 1000;
const refreshMaxAge = 7 * 24 * 60 * 60 * 1000;
function writeAuthCookies(res, accessToken, refreshToken) { res.cookie('civicshield_access_token', accessToken, authCookieOptions(accessMaxAge)); res.cookie('civicshield_refresh_token', refreshToken, authCookieOptions(refreshMaxAge)); }
function clearAuthCookies(res) { res.clearCookie('civicshield_access_token', authCookieOptions()); res.clearCookie('civicshield_refresh_token', authCookieOptions()); }
function authData(result) { return { user: result.user, accessToken: result.accessToken }; }

export const register = asyncHandler(async (req, res) => { const result = await registerUser(registerSchema.parse(req.body)); writeAuthCookies(res, result.accessToken, result.refreshToken); return sendSuccess(res, { statusCode: 201, message: 'Registration completed successfully.', data: { ...authData(result), organization: result.organization } }); });
export const login = asyncHandler(async (req, res) => { const result = await loginUser(loginSchema.parse(req.body)); writeAuthCookies(res, result.accessToken, result.refreshToken); return sendSuccess(res, { message: 'Login completed successfully.', data: authData(result) }); });
export const refresh = asyncHandler(async (req, res) => { const result = await rotateRefreshToken(req.cookies?.civicshield_refresh_token); writeAuthCookies(res, result.accessToken, result.refreshToken); return sendSuccess(res, { message: 'Session refreshed successfully.', data: authData(result) }); });
export const logout = asyncHandler(async (req, res) => { await invalidateRefreshTokens(req.user); clearAuthCookies(res); return sendSuccess(res, { message: 'Logout completed successfully.' }); });
export const profile = asyncHandler(async (req, res) => sendSuccess(res, { data: { user: publicUser(req.user) } }));
