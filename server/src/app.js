import express from 'express'
import cors from 'cors'
import { connectDatabase, testConnection } from './db/connect.js'
import { requireAuth, signToken } from './middleware/auth.js'
import {
  getAllPackages,
  getPackageById,
  getAllCoursesSummary,
  getCourseById,
  getAccessibleCoursesForPackage,
} from './services/catalog.js'
import {
  createUser,
  verifyLogin,
  formatUserResponse,
  getLessonProgress,
  markLessonComplete,
} from './services/users.js'

export function createApp() {
  const app = express()

  app.use(cors())
  app.use(express.json())

  app.use(async (_req, res, next) => {
    try {
      await connectDatabase()
      next()
    } catch (err) {
      res.status(503).json({ error: 'Database unavailable', detail: err.message })
    }
  })

  app.get('/api/health', async (_req, res) => {
    try {
      await testConnection()
      res.json({ status: 'ok', service: 'eleganz-courses-api', database: 'connected' })
    } catch {
      res.status(503).json({ status: 'error', service: 'eleganz-courses-api', database: 'disconnected' })
    }
  })

  app.get('/api/packages', async (_req, res) => {
    try {
      res.json(await getAllPackages())
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  app.get('/api/packages/:id', async (req, res) => {
    try {
      const pkg = await getPackageById(req.params.id)
      if (!pkg) return res.status(404).json({ error: 'Package not found' })
      res.json(pkg)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  app.get('/api/courses', async (_req, res) => {
    try {
      res.json(await getAllCoursesSummary())
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  app.get('/api/courses/:id', async (req, res) => {
    try {
      const course = await getCourseById(req.params.id)
      if (!course) return res.status(404).json({ error: 'Course not found' })
      res.json(course)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  app.post('/api/auth/register', async (req, res) => {
    try {
      const { name, email, password, packageId } = req.body
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email and password are required' })
      }
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' })
      }

      const user = await createUser({ name, email, password, packageId })
      const token = signToken(user)
      res.status(201).json({ message: 'Account created successfully', user, token })
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message })
    }
  })

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' })
      }

      const user = await verifyLogin(email, password)
      const token = signToken(user)
      res.json({ message: 'Login successful', user, token })
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message })
    }
  })

  app.get('/api/me', requireAuth, async (req, res) => {
    try {
      const user = await formatUserResponse(req.user)
      res.json({ user })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  app.get('/api/dashboard', requireAuth, async (req, res) => {
    try {
      const user = await formatUserResponse(req.user)
      const subscription = user.subscription
      let courses = []

      if (subscription?.status === 'active') {
        courses = await getAccessibleCoursesForPackage(subscription.packageId)
      }

      const completedLessons = await getLessonProgress(req.user.id)

      res.json({ user, subscription, courses, completedLessons })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  app.post('/api/lessons/:id/complete', requireAuth, async (req, res) => {
    try {
      await markLessonComplete(req.user.id, req.params.id)
      res.json({ message: 'Lesson marked complete' })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  return app
}

export default createApp
