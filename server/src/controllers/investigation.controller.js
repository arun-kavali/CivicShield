import { InvestigationReport } from '../models/InvestigationReport.js';
import { Incident } from '../models/Incident.js';
import { createOpenAIChatResponse } from '../services/openaiService.js';
import { generateInvestigation } from '../services/investigationService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const generate = asyncHandler(async (req, res) =>
  sendSuccess(res, {
    statusCode: 201,
    data: { report: await generateInvestigation(req.params.incidentId, req.organizationId) },
  }),
);

export const regenerate = asyncHandler(async (req, res) =>
  sendSuccess(res, {
    statusCode: 201,
    data: { report: await generateInvestigation(req.params.incidentId, req.organizationId, true) },
  }),
);

export const get = asyncHandler(async (req, res) =>
  sendSuccess(res, {
    data: {
      report: await InvestigationReport.findOne({ incidentId: req.params.incidentId, organizationId: req.organizationId }).sort({ createdAt: -1 }),
    },
  }),
);

export const chat = asyncHandler(async (req, res) => {
  const { incidentId, messages } = req.body;
  if (!incidentId || !Array.isArray(messages)) {
    throw new AppError('incidentId and messages are required.', 400);
  }

  const incident = await Incident.findOne({ _id: incidentId, organizationId: req.organizationId }).populate('alerts');
  if (!incident) {
    throw new AppError('Incident was not found.', 404);
  }

  const incidentContext = {
    id: incident.id,
    title: incident.title,
    status: incident.status,
    priority: incident.priority,
    riskScore: incident.riskScore,
    threatConfidenceScore: incident.threatConfidenceScore,
    classification: incident.classification,
    alerts: incident.alerts.map((alert) => ({
      id: alert.id,
      type: alert.alertType,
      source: alert.source,
      severity: alert.severity,
      description: alert.description,
      timestamp: alert.timestamp,
    })),
  };

  const systemMessage = {
    role: 'system',
    content:
      'You are an evidence-bound SOC analyst. Answer questions about the incident using only the provided incident and alert evidence. Do not invent facts, do not hallucinate, and keep responses concise and technical.',
  };

  const contextMessage = {
    role: 'system',
    content: `Incident context: ${JSON.stringify(incidentContext)}`,
  };

  const chatMessages = [systemMessage, contextMessage, ...messages];
  const response = await createOpenAIChatResponse(chatMessages);

  return sendSuccess(res, { data: { reply: response.reply } });
});
