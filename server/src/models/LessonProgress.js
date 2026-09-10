import mongoose from 'mongoose'

const lessonProgressSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    lessonId: { type: String, required: true },
    completedAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
)

lessonProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true })

export const LessonProgress = mongoose.model('LessonProgress', lessonProgressSchema)
