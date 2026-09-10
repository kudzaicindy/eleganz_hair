import { Package } from '../models/Package.js'
import { Course } from '../models/Course.js'

function mapPackage(doc) {
  return {
    id: doc.id,
    name: doc.name,
    price: doc.price,
    description: doc.description,
    featured: doc.featured,
    features: doc.features,
  }
}

function mapCourseSummary(doc) {
  return {
    id: doc.id,
    title: doc.title,
    description: doc.description,
    lessonCount: doc.lessonCount,
    duration: doc.duration,
    thumbnail: doc.thumbnail,
    packageIds: doc.packageIds,
  }
}

function mapCourseFull(doc, packageIdsOverride) {
  const lessons = [...(doc.lessons ?? [])].sort((a, b) => a.order - b.order)
  return {
    id: doc.id,
    title: doc.title,
    description: doc.description,
    lessonCount: doc.lessonCount,
    duration: doc.duration,
    thumbnail: doc.thumbnail,
    packageIds: packageIdsOverride ?? doc.packageIds,
    lessons,
  }
}

export async function getAllPackages() {
  const docs = await Package.find().sort({ price: 1 }).lean()
  return docs.map(mapPackage)
}

export async function getPackageById(id) {
  const doc = await Package.findOne({ id }).lean()
  return doc ? mapPackage(doc) : null
}

export async function getAllCoursesSummary() {
  const docs = await Course.find().sort({ title: 1 }).lean()
  return docs.map(mapCourseSummary)
}

export async function getCourseById(id) {
  const doc = await Course.findOne({ id }).lean()
  return doc ? mapCourseFull(doc) : null
}

export async function getAccessibleCoursesForPackage(packageId) {
  const docs = await Course.find({ packageIds: packageId }).sort({ title: 1 }).lean()
  return docs.map((doc) => mapCourseFull(doc, [packageId]))
}
