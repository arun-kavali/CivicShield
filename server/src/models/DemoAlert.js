import mongoose from 'mongoose';
const schema = new mongoose.Schema({ organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true }, payload: { type: mongoose.Schema.Types.Mixed, required: true }, status: { type: String, enum: ['Staged', 'Ingested', 'Failed'], default: 'Staged' }, ingestedAt: Date }, { timestamps: true });
export const DemoAlert = mongoose.model('DemoAlert', schema);
