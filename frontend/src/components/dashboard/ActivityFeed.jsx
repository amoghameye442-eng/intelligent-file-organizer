import Panel from "./Panel"

// One label + colour per kind of automated action.
const actionStyles = {
  move: { label: "Moved", className: "bg-blue-100 text-blue-700" },
  rename: { label: "Renamed", className: "bg-amber-100 text-amber-700" },
  delete: { label: "Deleted", className: "bg-red-100 text-red-700" },
}

// Shows the latest automated actions, newest first.
// Props: activities = [{ id, action, fileName, from, to?, timestamp }]
function ActivityFeed({ activities }) {
  return (
    <Panel title="Recent automation activity">
      {activities.length === 0 ? (
        <p className="text-sm text-gray-500">No automated actions yet.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {activities.map((item) => {
            // If the backend ever sends an action we don't know, show it plainly.
            const style = actionStyles[item.action] || {
              label: item.action,
              className: "bg-gray-100 text-gray-700",
            }

            return (
              <li key={item.id} className="flex items-start gap-3 py-3">
                <span
                  className={`mt-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${style.className}`}
                >
                  {style.label}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-800">
                    {item.fileName}
                  </p>
                  <p className="truncate text-xs text-gray-500">
                    {item.to ? `${item.from} → ${item.to}` : item.from}
                  </p>
                </div>
                <time
                  dateTime={item.timestamp}
                  className="shrink-0 text-xs text-gray-400"
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
