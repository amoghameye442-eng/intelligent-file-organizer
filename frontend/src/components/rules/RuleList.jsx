import { describeCondition } from "../../utils/ruleHelpers"
import SearchMessage from "../search/SearchMessage"

const buttonClasses =
  "rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-2.5 py-1 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"

// The list of active rules, in priority order (top = checked first).
// Props:
//   rules       [{ id, field, condition, value, destination }]
//   editingId   id of the rule being edited right now, or null
//   busy        true while the page is saving something (disables the buttons)
//   onEdit, onDelete   function(rule)
//   onMove             function(rule, "up" | "down")
function RuleList({ rules, editingId, busy, onEdit, onDelete, onMove }) {
  if (rules.length === 0) {
    return <SearchMessage>No rules yet. Add your first rule above.</SearchMessage>
  }

  return (
    <div>
      <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
        Rules are checked from top to bottom. If a file matches more than one
        rule, the <strong>first</strong> matching rule wins.
      </p>

      <ol className="divide-y divide-gray-100 dark:divide-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        {rules.map((rule, index) => (
          <li
            key={rule.id}
            className={`flex flex-wrap items-center gap-3 px-4 py-3 ${
              rule.id === editingId ? "bg-blue-50 dark:bg-blue-950" : ""
            }`}
          >
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-300"
              title="Priority"
            >
              {index + 1}
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-gray-800 dark:text-gray-100">
                <span className="font-medium">If</span> {describeCondition(rule)}
              </p>
              <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                then move to <span className="font-mono">{rule.destination}</span>
              </p>
            </div>

            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => onMove(rule, "up")}
                disabled={busy || index === 0}
                aria-label={`Move rule ${index + 1} up`}
                className={buttonClasses}
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => onMove(rule, "down")}
                disabled={busy || index === rules.length - 1}
                aria-label={`Move rule ${index + 1} down`}
                className={buttonClasses}
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => onEdit(rule)}
                disabled={busy}
                aria-label={`Edit rule ${index + 1}`}
                className={buttonClasses}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => onDelete(rule)}
                disabled={busy}
                aria-label={`Delete rule ${index + 1}`}
                className={`${buttonClasses} text-red-700 dark:text-red-300`}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

export default RuleList
