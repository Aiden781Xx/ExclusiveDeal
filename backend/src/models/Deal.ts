import mongoose from 'mongoose';

const dealSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Deal title is required'],
    },
    description: {
      type: String,
      required: [true, 'Deal description is required'],
    },
    category: {
      type: String,
      enum: ['Cloud', 'Marketing', 'Analytics', 'Productivity', 'Design', 'Other'],
      required: [true, 'Category is required'],
    },
    partner: {
      name: {
        type: String,
        required: true,
      },
      logo: String,
      website: String,
    },
    discount: {
      type: Number,
      required: [true, 'Discount percentage is required'],
      min: 0,
      max: 100,
    },
    originalPrice: {
      type: String,
      required: true,
    },
    discountedPrice: String,
    isLocked: {
      type: Boolean,
      default: false,
    },
    requiredVerification: {
      type: String,
      enum: ['none', 'basic', 'detailed'],
      default: 'none',
    },
    eligibilityConditions: [String],
    features: [String],
    expiryDate: Date,
    claimsCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
);

// Index for faster searches and filters
dealSchema.index({ category: 1, isLocked: 1, status: 1 });

export default mongoose.model('Deal', dealSchema);
