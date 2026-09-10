import { connectDatabase, disconnectDatabase } from './connect.js'
import { seedWebsiteData } from './seed.js'

async function main() {
  console.log('Connecting to MongoDB…')
  await connectDatabase()
  console.log('Connected.')

  await seedWebsiteData()
  console.log('Website data seeded (packages, courses, lessons).')

  await disconnectDatabase()
  console.log('Database setup complete.')
}

main().catch((err) => {
  console.error('Database setup failed:', err.message)
  process.exit(1)
})
