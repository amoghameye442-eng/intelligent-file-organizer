import SearchMessage from "../components/search/SearchMessage"

// Placeholder page: there are no settings to change yet.
function Settings() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Settings</h1>
      <SearchMessage>
        Settings are not available yet. This page is a placeholder; nothing here
        can be changed.
      </SearchMessage>
    </div>
  )
}

export default Settings
