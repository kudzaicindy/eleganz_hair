import mongoose from 'mongoose'
import { config } from '../config.js'

const cache = globalThis.__eleganzMongoose ?? { conn: null, promise: null }
globalThis.__eleganzMongoose = cache

const mongoOptions = {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 5000,
  socketTimeoutMS: 10000,
  maxPoolSize: 5,
}

function resetCache() {
  cache.conn = null
  cache.promise = null
}

export async function connectDatabase() {
  if (cache.conn && mongoose.connection.readyState === 1) {
    return cache.conn
  }

  if (!cache.promise) {
    mongoose.set('strictQuery', true)
    cache.promise = mongoose
      .connect(config.mongoUri, mongoOptions)
      .then((connection) => {
        cache.conn = connection
        return connection
      })
      .catch((err) => {
        resetCache()
        throw err
      })
  }

  try {
    cache.conn = await cache.promise
    return cache.conn
  } catch (err) {
    resetCache()
    throw err
  }
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
