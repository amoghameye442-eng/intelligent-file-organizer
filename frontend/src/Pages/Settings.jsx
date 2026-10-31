import AppearanceSettings from "../components/settings/AppearanceSettings"
import AboutProject from "../components/settings/AboutProject"

// The Settings page. It only has settings that really work: the theme.
// (Rules are managed on the Rules page.)
function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Settings</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Choose how the dashboard looks and read about the project.
        </p>
      </div>

      <AppearanceSettings />
      <AboutProject />
    </div>
  )
}

export default Settings
