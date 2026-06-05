import mongoose from 'mongoose';

const trustBadgeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
      enum: ['shipping', 'security', 'returns', 'support', 'quality', 'warranty'],
      default: 'shipping',
    },
    color: {
      type: String,
      default: 'primary',
      enum: ['primary', 'success', 'info', 'secondary', 'warning', 'danger'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const TrustBadge = mongoose.models.TrustBadge || mongoose.model('TrustBadge', trustBadgeSchema);

export default TrustBadge;
