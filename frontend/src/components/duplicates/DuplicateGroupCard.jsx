import Panel from "../dashboard/Panel"
import { formatBytes } from "../../utils/formatBytes"

// Shows ONE group of files with identical content, and lets the person pick
// which copy to keep. Picking a copy only records a choice: nothing is deleted.
//
// Props:
//   group     { id, checksum, files: [{ path, filename, sizeBytes }] }
//   number    the group's number on screen (1, 2, 3...)
//   keptPath  the path of the copy chosen in THIS group, or null if none yet
//   onKeep    function(groupId, path). Passing null as the path clears the choice
//   disabled  true while the page is busy (switches the radio buttons off)
function DuplicateGroupCard({ group, number, keptPath, onKeep, disabled }) {
  const { files } = group

  // Identical content means identical size, so the first known size is the
  // size of every copy. It is null if no file in the group has a known size.
  const knownFile = files.find((file) => file.sizeBytes !== null)
  const copySize = knownFile ? knownFile.sizeBytes : null

  return (
    <Panel title={`Group ${number}`}>
      <div className="-mt-2 mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-gray-600">
          {files.length} identical copies
          {copySize !== null && (
            <>
              {" "}
              &middot; {formatBytes(copySize)} each &middot;{" "}
              {formatBytes(copySize * (files.length - 1))} of extra space
            </>
          )}
        </p>
        <div className="flex items-center gap-3">
          {/* Only the first 12 characters, to keep the card tidy. The full
              checksum is in the tooltip. */}
          <span className="font-mono text-xs text-gray-400" title={group.checksum}>
            {group.checksum.slice(0, 12)}…
          </span>
          {keptPath !== null && (
            <button
              type="button"
              onClick={() => onKeep(group.id, null)}
              disabled={disabled}
              className="rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Clear choice
            </button>
          )}
        </div>
      </div>

      {/* Every group has its OWN radio buttons: the `name` includes the group id,
          so choosing a copy here never changes any other group. */}
      <fieldset disabled={disabled}>
        <legend className="sr-only">
          Choose which copy to keep in group {number}
        </legend>
        <ul className="divide-y divide-gray-100 rounded-md border border-gray-200">
          {files.map((file) => {
            const isKept = keptPath === file.path
            const wouldBeRemoved = keptPath !== null && !isKept

            return (
              <li key={file.path}>
                <label
                  className={`flex cursor-pointer items-start gap-3 px-3 py-3 ${
                    isKept ? "bg-green-50" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name={`keep-group-${group.id}`}
                    checked={isKept}
                    onChange={() => onKeep(group.id, file.path)}
                    className="mt-1"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-800">
                      {file.filename}
                    </p>
                    <p className="break-all text-xs text-gray-500">{file.path}</p>
                  </div>
                  <span className="w-24 shrink-0 text-right text-sm text-gray-700">
                    {file.sizeBytes === null
                      ? "Unknown size"
                      : formatBytes(file.sizeBytes)}
                  </span>
                  {isKept && (
                    <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      Keep
                    </span>
                  )}
                  {wouldBeRemoved && (
                    <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                      Would be removed
                    </span>
                  )}
                </label>
              </li>
            )
          })}
        </ul>
      </fieldset>
    </Panel>
  )
}

export default DuplicateGroupCard
