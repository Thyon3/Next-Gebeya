import mongoose from 'mongoose';

const stockNotificationSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    notified: {
      type: Boolean,
      default: false,
    },
    notifiedAt: {
      type: Date,
      default: null,
    },
    unsubscribeToken: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate subscriptions
stockNotificationSchema.index({ product: 1, email: 1 }, { unique: true });

// Index for faster queries
stockNotificationSchema.index({ notified: 1 });
stockNotificationSchema.index({ unsubscribeToken: 1 });

const StockNotification =
  mongoose.models.StockNotification ||
  mongoose.model('StockNotification', stockNotificationSchema);

export default StockNotification;
