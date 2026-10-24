import { formatBytes } from "../../utils/formatBytes"

// The bar at the bottom: shows what the current choices would do, and has the
// button for the (mock) removal. It stays on screen while you scroll.
//
// IMPORTANT: this bar only describes a SELECTION. Nothing has been deleted,
// and in the mock version the button cannot delete anything either.
//
// Props:
//   totalGroups       how many duplicate groups there are
//   decidedGroups     in how many of them a copy to keep has been chosen
//   filesToRemove     how many files would be removed with the current choices
//   bytesToFree       the total size of those files (only the known sizes)
//   someSizesUnknown  true if at least one of those files has an unknown size
//   busy              true while the mock request is running
//   onMark            function, called when the button is pressed
function SelectionSummary({
  totalGroups,
  decidedGroups,
  filesToRemove,
  bytesToFree,
  someSizesUnknown,
  busy,
  onMark,
}) {
  return (
    <div className="sticky bottom-4 z-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
            {decidedGroups} of {totalGroups} groups decided
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {filesToRemove} {filesToRemove === 1 ? "file" : "files"} would be
            removed &middot; {formatBytes(bytesToFree)} could be freed
            {someSizesUnknown ? " (some sizes unknown)" : ""}
          </p>
          <p className="mt-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
            Selection only: nothing has been deleted or moved.
          </p>
        </div>

        <button
          type="button"
          onClick={onMark}
          disabled={busy || filesToRemove === 0}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Working..." : "Mark selected copies for removal (mock)"}
        </button>
      </div>
    </div>
  )
}

export default SelectionSummary
