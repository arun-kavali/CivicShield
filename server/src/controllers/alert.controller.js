import mongoose from 'mongoose';
import { Alert } from '../models/Alert.js';
import { ingestAlert } from '../services/alertIngestionEngine.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const ingest = asyncHandler(async (req, res) => { const result = await ingestAlert({ ...req.body, organizationId: req.organizationId }); return sendSuccess(res, { statusCode: result.duplicate ? 200 : 201, message: result.duplicate ? 'Duplicate alert skipped.' : 'Alert ingested successfully.', data: result }); });
export const list = asyncHandler(async (req, res) => { const alerts = await Alert.find({ organizationId: req.organizationId }).sort({ createdAt: -1 }); return sendSuccess(res, { data: { alerts } }); });
export const getById = asyncHandler(async (req, res) => { if (!mongoose.isValidObjectId(req.params.id)) throw new AppError('Alert ID is invalid.', 400); const alert = await Alert.findOne({ _id: req.params.id, organizationId: req.organizationId }); if (!alert) throw new AppError('Alert was not found.', 404); return sendSuccess(res, { data: { alert } }); });