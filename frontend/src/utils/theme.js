// Helpers for the light/dark theme. They only touch the <html> element and
// localStorage; no React in here.
//
// The theme is "light" or "dark". Dark mode works by putting the class "dark"
// on <html>; Tailwind's `dark:` classes switch on when that class is there
// (see the @custom-variant line in index.css).
//
// NOTE: index.html has a tiny copy of this logic that runs before the page is
// drawn (so there is no white flash). Keep the storage key "theme" the same.

const STORAGE_KEY = "theme"

// The choice the user saved with the toggle, or null if they never used it.
export function getStoredTheme() {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === "light" || value === "dark" ? value : null
  } catch {
    // localStorage can be blocked (private mode, browser settings). Act as "no choice saved".
    return null
  }
}

// The light/dark setting of the operating system.
export function getSystemTheme() {
  const wantsDark = window.matchMedia("(prefers-color-scheme: dark)").matches
  return wantsDark ? "dark" : "light"
}

// Saved choice first; if there is none, follow the operating system.
export function getInitialTheme() {
  return getStoredTheme() ?? getSystemTheme()
}

// Switches the page to the given theme.
export function applyTheme(theme) {
  document.documentElement.classList.toggle("dark", theme === "dark")
  // Makes the browser's own controls (scrollbars, dropdown lists) match too.
  document.documentElement.style.colorScheme = theme
}

// Forgets the saved choice, so the theme follows the operating system again.
// (The caller should then apply getSystemTheme() so the page updates at once.)
export function clearStoredTheme() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Storage blocked: nothing was saved, so there is nothing to forget.
  }
}

// Remembers the user's choice for next time.
export function saveTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // Could not save (storage blocked). The theme still changes for this visit.
  }
}
