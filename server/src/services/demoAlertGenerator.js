import crypto from 'node:crypto';

const templates = [
  ['Malware Detection', 'EDR', 'High', 'T1204', 'Execution'], ['Phishing Email', 'Email Security Gateway', 'Medium', 'T1566', 'Initial Access'], ['Brute Force Login', 'Identity Provider', 'High', 'T1110', 'Credential Access'], ['Suspicious Login', 'Cloud IAM', 'Medium', 'T1078', 'Defense Evasion'], ['Privilege Escalation', 'EDR', 'Critical', 'T1068', 'Privilege Escalation'], ['PowerShell Execution', 'Microsoft Defender', 'High', 'T1059.001', 'Execution'], ['Command & Control', 'Firewall', 'Critical', 'T1071', 'Command and Control'], ['Lateral Movement', 'EDR', 'Critical', 'T1021', 'Lateral Movement'], ['Data Exfiltration', 'DLP Gateway', 'Critical', 'T1041', 'Exfiltration'], ['Ransomware Activity', 'EDR', 'Critical', 'T1486', 'Impact'],
];
const pick = (items) => items[Math.floor(Math.random() * items.length)];
const ip = () => `${10 + Math.floor(Math.random() * 180)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${1 + Math.floor(Math.random() * 254)}`;

export function generateDemoAlert(organizationId, options = {}) {
  const eligible = templates.filter(([type, , severity]) => (!options.severity || severity === options.severity) && (!options.alertTypes || options.alertTypes.includes(type)));
  const [alertType, source, templateSeverity, attackTechnique, mitreTactic] = pick(eligible.length ? eligible : templates);
  const hostname = `WS-${String(Math.floor(Math.random() * 900 + 100))}`;
  const username = `employee${Math.floor(Math.random() * 500)}@civicshield.demo`;
  const sourceIP = ip(); const destinationIP = ip(); const timestamp = new Date();
  return { alertId: `DEMO-${timestamp.getTime()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`, organizationId, source, severity: options.severity ?? templateSeverity, timestamp, sourceIP, destinationIP, hostname, endpoint: `${hostname}.civicshield.demo`, username, attackTechnique, mitreTactic, asset: hostname, assetCriticality: pick(['Medium', 'High', 'Critical']), description: `${alertType} detected on ${hostname}; security telemetry indicates activity associated with ${attackTechnique}.`, rawPayload: { eventId: crypto.randomUUID(), sourceIP, destinationIP, hostname, username, attackTechnique, mitreTactic, collector: source }, status: 'Staged', generatedBy: 'Demo Alert Source', alertType };
}
