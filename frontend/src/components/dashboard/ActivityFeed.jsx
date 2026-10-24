import Panel from "./Panel"

// One label + colour per kind of automated action.
const actionStyles = {
  move: { label: "Moved", className: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300" },
  rename: { label: "Renamed", className: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300" },
  delete: { label: "Deleted", className: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300" },
}

// Shows the latest automated actions, newest first.
// Props: activities = [{ id, action, fileName, from, to?, timestamp }]
function ActivityFeed({ activities }) {
  return (
    <Panel title="Recent automation activity">
      {activities.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No automated actions yet.</p>
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          {activities.map((item) => {
            // If the backend ever sends an action we don't know, show it plainly.
            const style = actionStyles[item.action] || {
              label: item.action,
              className: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200",
            }

            return (
              <li key={item.id} className="flex items-start gap-3 py-3">
                <span
                  className={`mt-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${style.className}`}
                >
                  {style.label}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-100">
                    {item.fileName}
                  </p>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                    {item.to ? `${item.from} → ${item.to}` : item.from}
                  </p>
                </div>
                <time
                  dateTime={item.timestamp}
                  className="shrink-0 text-xs text-gray-400 dark:text-gray-400"
                >
                  {new Date(item.timestamp).toLocaleString()}
                </time>
              </li>
            )
          })}
        </ul>
      )}
    </Panel>
  )
}

export default ActivityFeed
