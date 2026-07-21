import cron from 'node-cron';
import { transferStagedDemoAlerts } from '../services/alertIngestionService.js';

export function startDemoAlertScheduler() {
  console.info(JSON.stringify({ event: 'demo_alert_scheduler_started', timestamp: new Date().toISOString(), schedule: '* * * * *' }));
  return cron.schedule('* * * * *', async () => {
    const startedAt = Date.now();
    const timestamp = new Date().toISOString();
    console.info(JSON.stringify({ event: 'demo_alert_scheduler_execution_started', timestamp }));
    try {
      const result = await transferStagedDemoAlerts();
      console.info(JSON.stringify({ event: 'demo_alert_scheduler_completed', timestamp, alertsScanned: result.scanned, alertsTransferred: result.transferred, duplicatesSkipped: result.duplicates, validationFailures: result.validationFailures, processingTimeMs: Date.now() - startedAt }));
    } catch (error) {
      console.error(JSON.stringify({ event: 'demo_alert_scheduler_execution_failed', timestamp, message: error.message, processingTimeMs: Date.now() - startedAt }));
    }
  });
}