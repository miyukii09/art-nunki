"use client"

import * as React from "react"
import { getCurrentUser, logout as apiLogout, type User } from "./api"

type AuthContextValue = {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
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
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
          setUserState(JSON.parse(raw))
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY)
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
    setUserState(u)
    if (u) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const logout = React.useCallback(() => {
    void apiLogout().catch(() => undefined)
    setUser(null)
  }, [setUser])

  const value = React.useMemo(
    () => ({ user, isLoading, setUser, logout }),
    [user, isLoading, setUser, logout],
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
