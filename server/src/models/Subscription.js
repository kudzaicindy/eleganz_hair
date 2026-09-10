import mongoose from 'mongoose'

const subscriptionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    packageId: { type: String, required: true },
    status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true, versionKey: false },
)

export const Subscription = mongoose.model('Subscription', subscriptionSchema)
