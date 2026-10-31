import Panel from "./Panel"
import { formatBytes } from "../../utils/formatBytes"

// Shows a ranked list of the biggest files.
// Props: files = [{ id, name, path, sizeBytes, type }]
function LargestFilesPanel({ files }) {
  return (
    <Panel title="Largest files">
      {files.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No files to show yet.</p>
      ) : (
        <ol className="divide-y divide-gray-100 dark:divide-gray-800">
          {files.map((file, index) => (
            <li key={file.id} className="flex items-center gap-3 py-3">
              <span className="w-5 text-sm text-gray-400 dark:text-gray-400">{index + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-100">
                  {file.name}
                </p>
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">{file.path}</p>
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {formatBytes(file.sizeBytes)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  )
}

export default LargestFilesPanel
