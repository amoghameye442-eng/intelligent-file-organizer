import { NavLink, Outlet } from "react-router-dom"
import ThemeToggle from "./ThemeToggle"

const navLinks = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/search", label: "Search" },
  { to: "/rules", label: "Rules" },
  { to: "/duplicates", label: "Duplicates" },
  { to: "/history", label: "History" },
  { to: "/settings", label: "Settings" },
]

function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <header className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-6 py-4">
        <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">File Organizer</h1>
        <div className="flex items-center gap-2">
          <nav className="flex gap-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `rounded-md px-3 py-1.5 text-sm font-medium ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </header>

      <main className="p-6">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
