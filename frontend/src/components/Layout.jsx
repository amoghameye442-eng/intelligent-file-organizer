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
      {/* Small screens: title and theme button on the first line, the links on
          their own line below (they may wrap). From "sm" up: one single row,
          with the links and the button pushed to the right. `order-*` only
          changes the visual order, not the order of the HTML. */}
      <header className="flex flex-wrap items-center gap-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 sm:px-6 sm:py-4">
        <h1 className="order-1 text-lg font-bold text-gray-800 dark:text-gray-100">File Organizer</h1>
        <nav className="order-3 flex w-full flex-wrap gap-2 sm:order-2 sm:ml-auto sm:w-auto">
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
        <div className="order-2 ml-auto sm:order-3 sm:ml-0">
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-4 sm:p-6">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
