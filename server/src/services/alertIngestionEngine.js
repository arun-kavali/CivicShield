import crypto from 'node:crypto';
import { Alert } from '../models/Alert.js';
import { AppError } from '../utils/AppError.js';

const severityMap = new Map([['critical', 'Critical'], ['high', 'High'], ['medium', 'Medium'], ['low', 'Low']]);
const sourceMap = new Map([['microsoft defender', 'Microsoft Defender'], ['crowdstrike', 'CrowdStrike'], ['sentinelone', 'SentinelOne'], ['palo alto', 'Palo Alto'], ['cisco', 'Cisco'], ['splunk', 'Splunk'], ['microsoft sentinel', 'Microsoft Sentinel'], ['aws guardduty', 'AWS GuardDuty'], ['google scc', 'Google SCC']]);
const log = (event, data) => console.info(JSON.stringify({ event, timestamp: new Date().toISOString(), ...data }));
const cleanIp = (value) => String(value || '').trim().replace(/^::ffff:/, '');
const normalizedSource = (value) => sourceMap.get(String(value).trim().toLowerCase()) || String(value).trim();

export function validateIncomingAlert(payload) {
  const required = ['organizationId', 'source', 'severity', 'timestamp', 'hostname', 'description'];
  const missing = required.filter((field) => !payload?.[field] || !String(payload[field]).trim());
  if (missing.length || !payload?.rawPayload || typeof payload.rawPayload !== 'object' || Array.isArray(payload.rawPayload) || Object.keys(payload.rawPayload).length === 0) throw new AppError(`Alert validation failed: ${missing.length ? `missing ${missing.join(', ')}` : 'rawPayload must be a non-empty object'}.`, 400);
  if (!severityMap.has(String(payload.severity).toLowerCase())) throw new AppError('Alert validation failed: unsupported severity.', 400);
  if (Number.isNaN(new Date(payload.timestamp).getTime())) throw new AppError('Alert validation failed: malformed timestamp.', 400);
}

export function normalizeIncomingAlert(payload) {
  const timestamp = new Date(payload.timestamp);
  const normalized = { ...payload, source: normalizedSource(payload.source), severity: severityMap.get(String(payload.severity).toLowerCase()), timestamp, hostname: String(payload.hostname).trim().toUpperCase(), username: String(payload.username || '').trim().toLowerCase(), sourceIP: cleanIp(payload.sourceIP), destinationIP: cleanIp(payload.destinationIP), attackTechnique: String(payload.attackTechnique || 'UNKNOWN').trim().toUpperCase(), description: String(payload.description).trim().replace(/\s+/g, ' ') };
  log('alert_normalized', { organizationId: normalized.organizationId, source: normalized.source, hostname: normalized.hostname });
  return normalized;
}

export function createAlertFingerprint(alert) {
  const window = new Date(alert.timestamp); window.setSeconds(0, 0);
  return crypto.createHash('sha256').update([alert.source, window.toISOString(), alert.hostname, alert.sourceIP, alert.attackTechnique, alert.description.toLowerCase()].join('|')).digest('hex');
}

export async function ingestAlert(payload) {
  log('alert_received', { organizationId: payload?.organizationId, source: payload?.source });
  try { validateIncomingAlert(payload); log('alert_validation_passed', { organizationId: payload.organizationId }); } catch (error) { log('alert_validation_failed', { organizationId: payload?.organizationId, message: error.message }); throw error; }
  const normalized = normalizeIncomingAlert(payload); const fingerprint = createAlertFingerprint(normalized); log('alert_fingerprint_created', { organizationId: normalized.organizationId, fingerprint });
  const existing = await Alert.findOne({ organizationId: normalized.organizationId, fingerprint });
  if (existing) { existing.duplicateCount = (existing.duplicateCount || 0) + 1; existing.ingestionHistory.push({ event: 'DUPLICATE_SKIPPED', timestamp: new Date(), details: { reason: 'matching_fingerprint', fingerprint } }); await existing.save(); log('alert_duplicate_skipped', { organizationId: normalized.organizationId, fingerprint, reason: 'matching_fingerprint' }); return { alert: existing, duplicate: true }; }
  const now = new Date();
  const alert = await Alert.create({ organizationId: normalized.organizationId, alertId: normalized.alertId || `ING-${now.getTime()}-${fingerprint.slice(0, 8)}`, source: normalized.source, severity: normalized.severity, alertType: normalized.alertType || 'Security Alert', hostname: normalized.hostname, deviceId: normalized.endpoint, username: normalized.username, sourceIP: normalized.sourceIP, destinationIP: normalized.destinationIP, asset: normalized.asset || normalized.hostname, description: normalized.description, metadata: { rawPayload: normalized.rawPayload, mitreTactic: normalized.mitreTactic, assetCriticality: normalized.assetCriticality, generatedBy: normalized.generatedBy, attackTechnique: normalized.attackTechnique }, normalized, normalizedSource: normalized.source, normalizedSeverity: normalized.severity, fingerprint, receivedAt: now, ingestedAt: now, validationStatus: 'PASSED', status: 'READY_FOR_ANALYSIS', processingStatus: 'READY_FOR_ANALYSIS', ingestionHistory: [{ event: 'RECEIVED', timestamp: now }, { event: 'VALIDATION_PASSED', timestamp: now }, { event: 'NORMALIZED', timestamp: now }, { event: 'FINGERPRINT_CREATED', timestamp: now, details: { fingerprint } }, { event: 'STORED', timestamp: now }, { event: 'QUEUED_READY_FOR_ANALYSIS', timestamp: now }] });
  log('alert_stored', { alertId: alert.id, organizationId: normalized.organizationId }); log('alert_queued', { alertId: alert.id, processingStatus: alert.processingStatus });
  queueMicrotask(() => import('./analysisService.js').then(({ runAnalysis }) => runAnalysis(alert.id, alert.organizationId.toString())).catch((error) => console.error(JSON.stringify({ event: 'analysis_queue_failed', alertId: alert.id, message: error.message }))));
  return { alert, duplicate: false };
}
