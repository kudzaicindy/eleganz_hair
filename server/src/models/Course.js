import mongoose from 'mongoose'

const lessonSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    duration: { type: String, required: true },
    order: { type: Number, required: true },
    videoUrl: { type: String, default: null },
  },
  { _id: false },
)

const courseSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    lessonCount: { type: Number, required: true },
    duration: { type: String, required: true },
    thumbnail: { type: String, default: null },
    packageIds: { type: [String], default: [] },
    lessons: { type: [lessonSchema], default: [] },
  },
  { timestamps: true, versionKey: false },
)

export const Course = mongoose.model('Course', courseSchema)
