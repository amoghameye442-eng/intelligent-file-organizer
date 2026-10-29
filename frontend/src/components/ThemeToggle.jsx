import { useEffect, useState } from "react"
import { applyTheme, getStoredTheme, saveTheme } from "../utils/theme"

// A button that switches between light and dark.
// - On the first visit the theme follows the operating system.
// - Pressing the button overrides that and the choice is saved.
// The script in index.html has already set the right theme before React starts,
// so we just read what the page currently shows.
function ThemeToggle() {
  const [theme, setTheme] = useState(() =>
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  )

  // While the user has NOT picked a theme, follow the operating system if it changes.
  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)")

    function handleSystemChange(event) {
      if (getStoredTheme() !== null) return // the user's choice wins
      const next = event.matches ? "dark" : "light"
      applyTheme(next)
      setTheme(next)
    }

    query.addEventListener("change", handleSystemChange)
    return () => query.removeEventListener("change", handleSystemChange)
  }, [])

  // There can be more than one toggle on screen (the header and the Settings
  // page). Whenever ANY of them changes the class on <html>, every toggle
  // re-reads it, so all the labels stay correct.
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light")
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })
    return () => observer.disconnect()
  }, [])

  function handleClick() {
    const next = theme === "dark" ? "light" : "dark"
    applyTheme(next)
    saveTheme(next)
    setTheme(next)
  }

  const goingTo = theme === "dark" ? "light" : "dark"

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Switch to ${goingTo} theme`}
      className="rounded-md ring-1 ring-inset ring-gray-300 dark:ring-gray-600 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
    >
      {theme === "dark" ? "Light mode" : "Dark mode"}
    </button>
  )
}

export default ThemeToggle
