import 'dotenv/config'

export const config = {
  port: Number(process.env.PORT) || 3001,
  jwtSecret: process.env.JWT_SECRET || 'eleganz-dev-secret-change-me',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eleganz_courses',
}
