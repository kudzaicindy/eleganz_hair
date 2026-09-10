import mongoose from 'mongoose'
import { config } from '../config.js'

export async function connectDatabase() {
  mongoose.set('strictQuery', true)
  await mongoose.connect(config.mongoUri)
}

export async function testConnection() {
  if (mongoose.connection.readyState !== 1) {
    await connectDatabase()
  }
  await mongoose.connection.db.admin().ping()
}

export async function disconnectDatabase() {
  await mongoose.disconnect()
}
