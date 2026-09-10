import { config } from './config.js'
import { createApp } from './app.js'
import { connectDatabase } from './db/connect.js'
import { seedWebsiteData } from './db/seed.js'

const app = createApp()

async function start() {
  try {
    await connectDatabase()
    console.log('MongoDB connected')
    await seedWebsiteData()
    console.log('Website catalog synced to database')
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message)
    console.error('Check server/.env — set MONGODB_URI to your MongoDB connection string.')
    process.exit(1)
  }

  app.listen(config.port, () => {
    console.log(`Eleganz API running on http://localhost:${config.port}`)
  })
}

start()
