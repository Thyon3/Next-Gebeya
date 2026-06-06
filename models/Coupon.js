import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage',
    },
    discountValue: {
      type: Number,
      required: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    usedAt: {
      type: Date,
      default: null,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    couponType: {
      type: String,
      enum: ['welcome', 'general', 'seasonal', 'loyalty'],
      default: 'welcome',
    },
    maxUsagePerProduct: {
      type: Number,
      default: 1, // For welcome coupon: 1 product only
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
couponSchema.index({ code: 1 });
couponSchema.index({ userId: 1 });
couponSchema.index({ expiryDate: 1 });

// Method to check if coupon is valid
couponSchema.methods.isValid = function () {
  const now = new Date();
  return (
    this.isActive &&
    !this.isUsed &&
    this.expiryDate > now
  );
};

const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);

export default Coupon;
