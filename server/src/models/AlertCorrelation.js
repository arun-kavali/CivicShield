import mongoose from 'mongoose';
const schema = new mongoose.Schema({ organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true }, alertId: { type: mongoose.Schema.Types.ObjectId, ref: 'Alert', required: true }, incidentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Incident', required: true }, matchedFields: [String], correlatedAt: { type: Date, default: Date.now } }, { timestamps: true });
schema.index({ alertId: 1, incidentId: 1 }, { unique: true });
export const AlertCorrelation = mongoose.model('AlertCorrelation', schema);
