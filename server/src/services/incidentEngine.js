import { Incident } from '../models/Incident.js';
import { AlertCorrelation } from '../models/AlertCorrelation.js';
export async function createOrUpdateIncident(alert, correlation) {
  if (alert.classification === 'Likely False Positive') return null;
  let incident = await Incident.findOne({ organizationId: alert.organizationId, status: { $in: ['Open', 'Investigating', 'Contained'] }, $or: [{ 'alerts': alert.id }, { title: `${alert.alertType} — ${alert.hostname}` }] });
  const created = !incident; if (!incident) incident = await Incident.create({ organizationId: alert.organizationId, incidentId: `INC-${Date.now()}-${alert.id.slice(-6)}`, title: `${alert.alertType} — ${alert.hostname}`, priority: alert.severity, summary: 'Deterministically created from correlated security alert.', affectedAssets: [alert.asset || alert.hostname], alerts: [alert.id], riskScore: alert.riskScore, threatConfidenceScore: alert.threatConfidenceScore, classification: alert.classification });
  else if (!incident.alerts.some((id) => id.toString() === alert.id)) { incident.alerts.push(alert.id); incident.riskScore = Math.max(incident.riskScore || 0, alert.riskScore); await incident.save(); }
  await AlertCorrelation.updateOne({ alertId: alert.id, incidentId: incident.id }, { $setOnInsert: { organizationId: alert.organizationId, matchedFields: correlation.matchedFields } }, { upsert: true });
  return { incident, created };
}
