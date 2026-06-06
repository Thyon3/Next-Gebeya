import mongoose from 'mongoose';

const socialProofStatSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      enum: ['users', 'star', 'heart', 'support', 'trophy', 'chart', 'shield', 'clock'],
      default: 'users',
    },
    color: {
      type: String,
      enum: ['primary', 'success', 'secondary', 'info', 'warning', 'danger'],
      default: 'primary',
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

const SocialProofStat =
  mongoose.models.SocialProofStat || mongoose.model('SocialProofStat', socialProofStatSchema);

export default SocialProofStat;
