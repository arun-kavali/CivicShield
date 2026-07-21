import { InvestigationReport } from '../models/InvestigationReport.js';
import { generateInvestigation } from '../services/investigationService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
export const generate=asyncHandler(async(req,res)=>sendSuccess(res,{statusCode:201,data:{report:await generateInvestigation(req.params.incidentId,req.organizationId)}}));
export const regenerate=asyncHandler(async(req,res)=>sendSuccess(res,{statusCode:201,data:{report:await generateInvestigation(req.params.incidentId,req.organizationId,true)}}));
export const get=asyncHandler(async(req,res)=>sendSuccess(res,{data:{report:await InvestigationReport.findOne({incidentId:req.params.incidentId,organizationId:req.organizationId}).sort({createdAt:-1})}}));
