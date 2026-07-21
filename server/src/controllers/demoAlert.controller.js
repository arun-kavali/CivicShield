import { DemoAlert } from '../models/DemoAlert.js';
import { generateDemoAlert } from '../services/demoAlertGenerator.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { generateDemoAlertsSchema } from '../validators/demoAlert.validators.js';

export const generate = asyncHandler(async (req, res) => {
  const options = generateDemoAlertsSchema.parse(req.body); const payloads = Array.from({ length: options.numberOfAlerts }, () => generateDemoAlert(req.organizationId, options));
  const alerts = await DemoAlert.insertMany(payloads.map((payload) => ({ organizationId: req.organizationId, payload })));
  return sendSuccess(res, { statusCode: 201, message: 'Demo alerts staged successfully.', data: { alerts } });
});
