import { useEffect, useState } from "react"
import Panel from "../dashboard/Panel"
import ThemeToggle from "../ThemeToggle"
import {
  applyTheme,
  clearStoredTheme,
  getStoredTheme,
  getSystemTheme,
} from "../../utils/theme"

// What the page looks like right now, and whether the user chose it themselves
// (saved) or it simply follows the operating system.
function readAppearance() {
  return {
    theme: document.documentElement.classList.contains("dark") ? "dark" : "light",
    saved: getStoredTheme() !== null,
  }
}

// The Appearance section. It does NOT have a theme system of its own: it uses
// the same ThemeToggle and the same helpers (utils/theme.js) as the header.
function AppearanceSettings() {
  const [appearance, setAppearance] = useState(readAppearance)

  // Re-read when the theme changes anywhere (for example the header button).
  useEffect(() => {
    const observer = new MutationObserver(() => setAppearance(readAppearance()))
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })
    return () => observer.disconnect()
  }, [])

  function handleUseSystem() {
    clearStoredTheme()
    applyTheme(getSystemTheme())
    // The page may already have looked right (so no class change happened),
    // but the "saved" part did change, so read it again.
    setAppearance(readAppearance())
  }

  return (
    <Panel title="Appearance">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
            Current theme: {appearance.theme === "dark" ? "Dark" : "Light"}{" "}
            <span className="font-normal text-gray-500 dark:text-gray-400">
              ({appearance.saved ? "your choice" : "following your device"})
            </span>
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            On your first visit the theme follows your device setting. Pressing
            the button saves your own choice in this browser.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={handleUseSystem}
            disabled={!appearance.saved}
            className="rounded-md ring-1 ring-inset ring-gray-300 dark:ring-gray-600 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Use device setting
          </button>
        </div>
      </div>
    </Panel>
  )
}

export default AppearanceSettings
