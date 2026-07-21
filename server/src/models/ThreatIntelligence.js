import mongoose from 'mongoose';
const schema = new mongoose.Schema({ organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true }, indicatorType: { type: String, enum: ['ip', 'domain', 'url', 'hash', 'cve'], required: true }, indicator: { type: String, required: true, lowercase: true, trim: true }, source: String, confidence: Number, severity: String, description: String, firstSeen: Date, lastSeen: Date, status: { type: String, default: 'active' } }, { timestamps: true });
schema.index({ organizationId: 1, indicatorType: 1, indicator: 1 }, { unique: true });
export const ThreatIntelligence = mongoose.model('ThreatIntelligence', schema);
