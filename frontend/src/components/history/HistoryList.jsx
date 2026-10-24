import { canUndo, describeChange, findBlockingEntry, getFileName } from "../../utils/historyHelpers"

// Shows the history rows. It only DISPLAYS; the page decides what Undo does.
//   entries : the list to show, already in the order to display (newest first)
//   busy    : true while a (mock) undo is running, so no second one can start
//   onUndo  : called with the entry when "Undo (mock)" is pressed
//
// `canUndo` and `findBlockingEntry` need the WHOLE list to decide, so we pass them
// `entries` (not just one row).
function HistoryList({ entries, busy, onUndo }) {
  return (
    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
      {entries.map((entry) => {
        const blocker = findBlockingEntry(entry, entries)

        return (
          <li
            key={entry.id}
            className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="min-w-0 space-y-1 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-gray-500 dark:text-gray-400">#{entry.id}</span>
                <span className="break-all font-medium text-gray-800 dark:text-gray-100">
                  {getFileName(entry.path_after)}
                </span>
                <span className="rounded-full bg-blue-50 dark:bg-blue-950 px-2 py-0.5 text-xs text-blue-700 dark:text-blue-300">
                  {describeChange(entry)}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    entry.undone ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300" : "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300"
                  }`}
                >
                  {entry.undone ? "Undone" : "Applied"}
                </span>
              </div>
              <p className="break-all text-gray-600 dark:text-gray-300">
                <span className="text-gray-500 dark:text-gray-400">From:</span> {entry.path_before}
              </p>
              <p className="break-all text-gray-600 dark:text-gray-300">
                <span className="text-gray-500 dark:text-gray-400">To:</span> {entry.path_after}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{entry.timestamp}</p>
            </div>

            <div className="shrink-0 sm:max-w-xs sm:text-right">
              {canUndo(entry, entries) && (
                <button
                  type="button"
                  onClick={() => onUndo(entry)}
                  disabled={busy}
                  aria-label={`Undo action ${entry.id} (mock)`}
                  className="rounded-md border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950 px-3 py-1.5 text-sm text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Undo (mock)
                </button>
              )}
              {blocker && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Undo the newer action #{blocker.id} on this file first.
                </p>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export default HistoryList
