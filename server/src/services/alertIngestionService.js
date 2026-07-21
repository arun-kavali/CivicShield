import { DemoAlert } from '../models/DemoAlert.js';
import { ingestAlert } from './alertIngestionEngine.js';

export const normalizeDemoPayload = (payload) => payload;
export async function ingestDemoAlert(demoAlert) {
  const outcome = await ingestAlert(demoAlert.payload);
  demoAlert.status = 'Ingested';
  demoAlert.ingestedAt = new Date();
  await demoAlert.save();
  return outcome;
}
export async function transferStagedDemoAlerts(limit = 100) {
  const staged = await DemoAlert.find({ status: 'Staged' }).sort({ createdAt: 1 }).limit(limit);
  const result = { scanned: staged.length, transferred: 0, duplicates: 0, validationFailures: 0, failed: 0 };
  for (const item of staged) {
    try { const outcome = await ingestDemoAlert(item); outcome.duplicate ? result.duplicates++ : result.transferred++; }
    catch (error) { item.status = 'Failed'; await item.save(); result.failed++; result.validationFailures++; console.error(JSON.stringify({ event: 'demo_alert_validation_failure', demoAlertId: item.id, message: error.message })); }
  }
  return result;
}