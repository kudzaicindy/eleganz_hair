import bcrypt from 'bcryptjs'
import { User } from '../models/User.js'
import { Subscription } from '../models/Subscription.js'
import { Package } from '../models/Package.js'
import { LessonProgress } from '../models/LessonProgress.js'
import { getPackageById } from './catalog.js'

function newId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function subscriptionIsActive(sub) {
  if (!sub || sub.status !== 'active') return false
  return new Date(sub.expiresAt) >= new Date()
}

export async function findUserByEmail(email) {
  return User.findOne({ email: email.toLowerCase().trim() }).lean()
}

export async function findUserById(id) {
  return User.findOne({ id }).lean()
}

async function getLatestSubscription(userId) {
  return Subscription.findOne({ userId }).sort({ createdAt: -1 }).lean()
}

export async function formatSubscription(sub) {
  if (!sub) return null

  const pkg = await Package.findOne({ id: sub.packageId }).lean()
  const isActive = subscriptionIsActive(sub)

  return {
    id: sub.id,
    packageId: sub.packageId,
    packageName: pkg?.name ?? sub.packageId,
    status: isActive ? 'active' : sub.status === 'active' ? 'expired' : sub.status,
    expiresAt: new Date(sub.expiresAt).toISOString(),
    price: pkg?.price ?? 0,
  }
}

export async function formatUserResponse(userDoc) {
  const sub = await getLatestSubscription(userDoc.id)
  return {
    id: userDoc.id,
    name: userDoc.name,
    email: userDoc.email,
    subscription: await formatSubscription(sub),
  }
}

export async function createUser({ name, email, password, packageId = 'premium' }) {
  const normalizedEmail = email.toLowerCase().trim()
  const existing = await findUserByEmail(normalizedEmail)
  if (existing) {
    const err = new Error('An account with this email already exists')
    err.status = 409
    throw err
  }

  const pkg = await getPackageById(packageId)
  if (!pkg) {
    const err = new Error('Invalid package selected')
    err.status = 400
    throw err
  }

  const userId = newId('user')
  const passwordHash = await bcrypt.hash(password, 10)
  const expires = new Date()
  expires.setDate(expires.getDate() + 30)

  await User.create({
    id: userId,
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
  })

  await Subscription.create({
    id: newId('sub'),
    userId,
    packageId,
    status: 'active',
    expiresAt: expires,
  })

  return formatUserResponse(await findUserById(userId))
}

export async function verifyLogin(email, password) {
  const user = await findUserByEmail(email)
  if (!user) {
    const err = new Error('Invalid email or password')
    err.status = 401
    throw err
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    const err = new Error('Invalid email or password')
    err.status = 401
    throw err
  }

  return formatUserResponse(user)
}

export async function getLessonProgress(userId) {
  const rows = await LessonProgress.find({ userId }).select('lessonId').lean()
  return rows.map((r) => r.lessonId)
}

export async function markLessonComplete(userId, lessonId) {
  await LessonProgress.findOneAndUpdate(
    { userId, lessonId },
    { userId, lessonId, completedAt: new Date() },
    { upsert: true, new: true },
  )
}
