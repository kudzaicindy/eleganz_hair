import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { fetchMe } from '../api/dashboard'
import type { User } from '../types'

interface AuthContextValue {
  user: User | null
  token: string | null
  isLoading: boolean
  signIn: (user: User, token: string) => void
  signOut: () => void
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)
const USER_KEY = 'eleganz_user'
const TOKEN_KEY = 'eleganz_token'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(USER_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [isLoading, setIsLoading] = useState(!!localStorage.getItem(TOKEN_KEY))
  const syncedRef = useRef(false)

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(USER_KEY)
    }
  }, [user])

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
  }, [token])

  useEffect(() => {
    if (!token || syncedRef.current) {
      if (!token) setIsLoading(false)
      return
    }

    syncedRef.current = true

    fetchMe(token)
      .then((freshUser) => {
        if (freshUser) setUser(freshUser)
        else {
          setUser(null)
          setToken(null)
        }
      })
      .catch(() => {
        setUser(null)
        setToken(null)
      })
      .finally(() => setIsLoading(false))
  }, [token])

  const signIn = (nextUser: User, nextToken: string) => {
    syncedRef.current = true
    setUser(nextUser)
    setToken(nextToken)
    setIsLoading(false)
  }

  const signOut = () => {
    syncedRef.current = false
    setUser(null)
    setToken(null)
    setIsLoading(false)
  }

  const updateUser = useCallback((nextUser: User) => {
    setUser(nextUser)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, isLoading, signIn, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
