import { Alert } from '../models/Alert.js';
import { runAnalysis } from '../services/analysisService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
export const run=asyncHandler(async(req,res)=>sendSuccess(res,{data:{alert:await runAnalysis(req.params.alertId,req.organizationId)}}));
export const runAll=asyncHandler(async(req,res)=>{const alerts=await Alert.find({organizationId:req.organizationId,processingStatus:'READY_FOR_ANALYSIS'});const result=[];for(const alert of alerts)result.push(await runAnalysis(alert.id,req.organizationId));return sendSuccess(res,{data:{alerts:result}})});
export const get=asyncHandler(async(req,res)=>{const alert=await Alert.findOne({_id:req.params.alertId,organizationId:req.organizationId});return sendSuccess(res,{data:{alert}})});
