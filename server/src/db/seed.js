import { packages, courses } from '../data.js'
import { Package } from '../models/Package.js'
import { Course } from '../models/Course.js'

export async function seedWebsiteData() {
  for (const pkg of packages) {
    await Package.findOneAndUpdate(
      { id: pkg.id },
      {
        id: pkg.id,
        name: pkg.name,
        price: pkg.price,
        description: pkg.description,
        featured: Boolean(pkg.featured),
        features: pkg.features,
      },
      { upsert: true, new: true },
    )
  }

  for (const course of courses) {
    await Course.findOneAndUpdate(
      { id: course.id },
      {
        id: course.id,
        title: course.title,
        description: course.description,
        lessonCount: course.lessonCount,
        duration: course.duration,
        thumbnail: course.thumbnail ?? null,
        packageIds: course.packageIds,
        lessons: course.lessons.map((l) => ({
          id: l.id,
          title: l.title,
          duration: l.duration,
          order: l.order,
          videoUrl: l.videoUrl ?? null,
        })),
      },
      { upsert: true, new: true },
    )
  }
}
