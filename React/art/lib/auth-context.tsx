"use client"

import * as React from "react"
import {
  getCurrentUser,
  getStoredAuthToken,
  logout as apiLogout,
  normalizeUser,
  setStoredAuthToken,
  type User,
} from "./api"

type AuthContextValue = {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setSession: (user: User, token: string | null) => void
  logout: () => void
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

const STORAGE_KEY = "nunki.user"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = React.useState<User | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    let isMounted = true

    async function syncUser() {
      const token = getStoredAuthToken()

      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw && token) {
          setUserState(normalizeUser(JSON.parse(raw)))
        } else if (raw) {
          localStorage.removeItem(STORAGE_KEY)
          setUserState(null)
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY)
        setUserState(null)
      }

      if (!token) {
        if (isMounted) {
          setUserState(null)
          setIsLoading(false)
        }
        return
      }

      try {
        const currentUser = await getCurrentUser()
        if (!isMounted) return
        setUserState(currentUser)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser))
      } catch {
        if (!isMounted) return
        setUserState(null)
        localStorage.removeItem(STORAGE_KEY)
        setStoredAuthToken(null)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void syncUser()

    return () => {
      isMounted = false
    }
  }, [])

  const setUser = React.useCallback((u: User | null) => {
    const normalizedUser = normalizeUser(u)
    setUserState(normalizedUser)
    if (normalizedUser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedUser))
    } else {
      localStorage.removeItem(STORAGE_KEY)
      setStoredAuthToken(null)
    }
  }, [])

  const setSession = React.useCallback((u: User, token: string | null) => {
    const normalizedUser = normalizeUser(u)
    if (!normalizedUser) {
      setStoredAuthToken(null)
      setUserState(null)
      localStorage.removeItem(STORAGE_KEY)
      return
    }

    setStoredAuthToken(token)
    setUserState(normalizedUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedUser))
  }, [])

  const logout = React.useCallback(() => {
    void apiLogout().catch(() => undefined)
    setStoredAuthToken(null)
    setUserState(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const value = React.useMemo(
    () => ({ user, isLoading, setUser, setSession, logout }),
    [user, isLoading, setUser, setSession, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth precisa estar dentro de <AuthProvider>")
  }
  return ctx
}
