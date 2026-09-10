import mongoose from 'mongoose'

const packageSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    featured: { type: Boolean, default: false },
    features: { type: [String], default: [] },
  },
  { timestamps: true, versionKey: false },
)

export const Package = mongoose.model('Package', packageSchema)
