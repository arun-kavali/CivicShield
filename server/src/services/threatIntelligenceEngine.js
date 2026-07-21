import { ThreatIntelligence } from '../models/ThreatIntelligence.js';
export async function matchThreatIntelligence(alert) {
  const raw = alert.metadata?.rawPayload || {}; const candidates = [{ type: 'ip', value: alert.sourceIP }, { type: 'ip', value: alert.destinationIP }, { type: 'domain', value: raw.domain || raw.senderDomain }, { type: 'url', value: raw.url }, { type: 'hash', value: raw.hash || raw.fileHash }, { type: 'cve', value: raw.cve }].filter((x) => x.value);
  const matches = []; for (const item of candidates) { const intel = await ThreatIntelligence.findOne({ organizationId: alert.organizationId, indicatorType: item.type, indicator: String(item.value).toLowerCase(), status: 'active' }); if (intel) matches.push({ indicatorId: intel.id, type: item.type, indicator: item.value, confidenceContribution: Math.round((intel.confidence || 50) / 5), reason: intel.description || 'Matched active threat indicator.' }); }
  return matches;
}
