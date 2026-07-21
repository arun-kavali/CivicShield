import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['organization_admin', 'security_officer', 'security_analyst'], default: 'organization_admin' },
  active: { type: Boolean, default: true },
  lastLogin: { type: Date, default: null },
  refreshTokenVersion: { type: Number, default: 0, select: false },
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
