import Panel from "./Panel"
import { formatBytes } from "../../utils/formatBytes"

// Shows: total files, total size, and a bar for each file type.
// Props: summary = { totalFiles, totalSizeBytes, byType: [{ type, count, sizeBytes }] }
function StorageOverview({ summary }) {
  const { totalFiles, totalSizeBytes, byType } = summary

  return (
    <Panel title="Storage overview">
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Total files</p>
          <p className="text-2xl font-semibold text-gray-800">
            {totalFiles.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Total size</p>
          <p className="text-2xl font-semibold text-gray-800">
            {formatBytes(totalSizeBytes)}
          </p>
        </div>
      </div>

      <h3 className="mb-3 text-sm font-medium text-gray-600">
        Breakdown by file type
      </h3>
      <ul className="space-y-3">
        {byType.map((item) => {
          // What share of the total storage does this file type use?
          const percent =
            totalSizeBytes === 0 ? 0 : (item.sizeBytes / totalSizeBytes) * 100

          return (
            <li key={item.type}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-gray-800">
                  {item.type}{" "}
                  <span className="text-gray-400">
                    ({item.count.toLocaleString()} files)
                  </span>
                </span>
                <span className="text-gray-600">
                  {formatBytes(item.sizeBytes)} &middot; {percent.toFixed(1)}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-gray-100">
                {/* The width changes with the data, so it is set with a style
                    instead of a Tailwind class (Tailwind classes are fixed text). */}
                <div
                  className="h-2 rounded-full bg-blue-600"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}

export default StorageOverview
