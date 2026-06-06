import mongoose from "mongoose";

const newsletterSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    discountCode: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    unsubscribeToken: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Newsletter = mongoose.models.Newsletter || mongoose.model("Newsletter", newsletterSchema);

export default Newsletter;
