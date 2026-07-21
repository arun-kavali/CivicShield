import { AppError } from '../utils/AppError.js';
export function authorizeRoles(...roles) { return (req, _res, next) => roles.includes(req.user?.role) ? next() : next(new AppError('You do not have permission to perform this action.', 403)); }
