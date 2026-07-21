import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 160 },
  slug: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
  plan: { type: String, enum: ['free', 'standard', 'enterprise'], default: 'free' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  settings: { type: mongoose.Schema.Types.Mixed, default: {} },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' },
}, { timestamps: true });

export const Organization = mongoose.model('Organization', organizationSchema);
