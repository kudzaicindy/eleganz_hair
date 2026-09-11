import 'dotenv/config'

const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL)

function requireEnv(name, devFallback) {
  const value = process.env[name]?.trim()
  if (value) return value
  if (!isProduction && devFallback) return devFallback
  throw new Error(`${name} is not configured. Add it in Vercel → Settings → Environment Variables.`)
}

export const config = {
  port: Number(process.env.PORT) || 3001,
  isProduction,
  get jwtSecret() {
    return requireEnv('JWT_SECRET', 'eleganz-dev-secret-change-me')
  },
  get mongoUri() {
    return requireEnv('MONGODB_URI', 'mongodb://127.0.0.1:27017/eleganz_courses')
  },
}
