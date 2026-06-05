import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
    },
    icon: {
      type: String,
      default: '📦',
    },
    gradient: {
      type: String,
      default: 'from-blue-500 to-cyan-500',
    },
    bgColor: {
      type: String,
      default: 'bg-blue-50 dark:bg-blue-900/20',
    },
    image: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
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

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

export default Category;
