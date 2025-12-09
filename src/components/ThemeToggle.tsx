"use client"

import { useTheme } from "@/components/providers/ThemeProvider"
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <SunIcon className="h-5 w-5 text-yellow-500" />
      ) : (
        <MoonIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
      )}
    </button>
  )
}
