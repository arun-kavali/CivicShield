import crypto from 'node:crypto';
import { Alert } from '../models/Alert.js';
import { AlertCorrelation } from '../models/AlertCorrelation.js';
export async function correlateAlert(alert) {
  const since = new Date(alert.createdAt.getTime() - 60 * 60 * 1000); const candidates = await Alert.find({ organizationId: alert.organizationId, _id: { $ne: alert.id }, createdAt: { $gte: since }, analysisStatus: 'COMPLETED' });
  const fields = ['sourceIP', 'destinationIP', 'hostname', 'username', 'deviceId']; const matched = candidates.filter((candidate) => fields.some((field) => candidate[field] && alert[field] && candidate[field] === alert[field]) || candidate.metadata?.attackTechnique === alert.metadata?.attackTechnique);
  const matchedFields = fields.filter((field) => matched.some((candidate) => candidate[field] && alert[field] && candidate[field] === alert[field])); const correlationId = crypto.createHash('sha256').update([alert.organizationId, ...matched.map((x) => x.id).sort(), alert.id].join('|')).digest('hex').slice(0, 24);
  return { correlationId, correlationConfidence: Math.min(100, matchedFields.length * 20 + (matched.length ? 30 : 0)), reason: matched.length ? `Matched ${matched.length} alert(s) on ${matchedFields.join(', ') || 'attack technique'}.` : 'No related alerts found.', matchedAlertIds: matched.map((x) => x.id), matchedFields };
}
