import { NavLink, Outlet } from "react-router-dom"

const navLinks = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/search", label: "Search" },
  { to: "/rules", label: "Rules" },
  { to: "/history", label: "History" },
  { to: "/settings", label: "Settings" },
]

function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-lg font-bold text-gray-800">File Organizer</h1>
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
                    : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="p-6">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
