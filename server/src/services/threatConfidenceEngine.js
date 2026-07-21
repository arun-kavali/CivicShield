const severity = { Low: 15, Medium: 35, High: 60, Critical: 80 };
const criticality = { Low: 0, Medium: 5, High: 10, Critical: 15 };
export function evaluateThreatConfidence(alert, context = {}) {
  const asset = alert.metadata?.assetCriticality || 'Medium'; const base = severity[alert.severity] ?? 35;
  const intel = Math.min(20, (context.threatIntelMatches?.length || 0) * 10); const historical = Math.min(10, context.historicalAlerts || 0); const behavior = /brute|privilege|ransom|exfiltration|command/i.test(alert.alertType) ? 10 : 0;
  const falsePositive = Math.max(0, Math.min(100, 65 - base / 2 - intel - behavior)); const confidence = Math.max(0, Math.min(100, base + criticality[asset] + intel + historical + behavior)); const risk = Math.max(0, Math.min(100, Math.round(confidence * 0.7 + (100 - falsePositive) * 0.3)));
  const classification = confidence >= 85 ? 'Likely Genuine Threat' : confidence >= 60 ? 'Requires Analyst Review' : 'Likely False Positive';
  return { threatConfidenceScore: Math.round(confidence), riskScore: risk, falsePositiveLikelihood: Math.round(falsePositive), classification, evidence: [{ factor: 'severity', contribution: base }, { factor: 'assetCriticality', contribution: criticality[asset] }, { factor: 'threatIntelligence', contribution: intel }, { factor: 'behavior', contribution: behavior }] };
}
