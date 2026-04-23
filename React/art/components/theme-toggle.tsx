"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const current = theme === "system" ? resolvedTheme : theme
  const isDark = current === "dark"

  function toggleTheme() {
    const nextTheme = isDark ? "light" : "dark"
    const root = document.documentElement

    root.classList.add("theme-animating")

    window.setTimeout(() => {
      root.classList.remove("theme-animating")
    }, 500)

    if ("startViewTransition" in document) {
      // Use native view transitions when available for a softer theme swap.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(document as any).startViewTransition(() => {
        setTheme(nextTheme)
      })
      return
    }

    setTheme(nextTheme)
  }

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label={isDark ? "Ativar tema claro" : "Ativar tema escuro"}
      onClick={toggleTheme}
      className="group relative rounded-full border-2 overflow-hidden"
    >
      <span className="relative block h-4 w-4">
        <Sun
          className={`absolute inset-0 h-4 w-4 transition-all duration-500 ease-out ${
            mounted && isDark
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0"
          }`}
          aria-hidden="true"
        />
        <Moon
          className={`absolute inset-0 h-4 w-4 transition-all duration-500 ease-out ${
            mounted && !isDark
              ? "rotate-0 scale-100 opacity-100"
              : "rotate-90 scale-0 opacity-0"
          }`}
          aria-hidden="true"
        />
      </span>
    </Button>
  )
}
