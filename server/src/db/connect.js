import mongoose from 'mongoose'
import { config } from '../config.js'

const cache = globalThis.__eleganzMongoose ?? { conn: null, promise: null }
globalThis.__eleganzMongoose = cache

export async function connectDatabase() {
  if (cache.conn && mongoose.connection.readyState === 1) {
    return cache.conn
  }

  if (!cache.promise) {
    mongoose.set('strictQuery', true)
    cache.promise = mongoose.connect(config.mongoUri).then((connection) => {
      cache.conn = connection
      return connection
    })
  }

  cache.conn = await cache.promise
  return cache.conn
}

export async function testConnection() {
  await connectDatabase()
  await mongoose.connection.db.admin().ping()
}

export async function disconnectDatabase() {
  if (cache.conn) {
    await mongoose.disconnect()
    cache.conn = null
    cache.promise = null
  }
}
