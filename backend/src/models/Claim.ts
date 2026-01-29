import mongoose from 'mongoose';

const claimSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    dealId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Deal',
      required: [true, 'Deal ID is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'claimed'],
      default: 'pending',
    },
    claimedAt: {
      type: Date,
      default: Date.now,
    },
    claimCode: {
      type: String,
      unique: true,
    },
    expiryDate: Date,
  },
  { timestamps: true }
);

// Composite index to ensure a user can only claim a deal once
claimSchema.index({ userId: 1, dealId: 1 }, { unique: true });

export default mongoose.model('Claim', claimSchema);
