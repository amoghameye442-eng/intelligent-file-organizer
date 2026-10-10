import { formatBytes } from "../../utils/formatBytes"

// The list of matching files.
// Props:
//   query = the text these results were searched with
//   files = [{ id, name, path, sizeBytes, type }]
function SearchResults({ query, files }) {
  return (
    <div>
      <p className="mb-3 text-sm text-gray-500">
        {files.length} {files.length === 1 ? "result" : "results"} for "{query}"
      </p>

      <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
        {files.map((file) => (
          <li key={file.id} className="flex items-center gap-4 px-4 py-3">
            <div className="min-w-0 flex-1">
              {/* Every result starts with the query, so we can show that part
                  in bold: that is exactly the part the Trie matched. */}
              <p className="truncate text-sm text-gray-800">
                <span className="font-semibold">
                  {file.name.slice(0, query.length)}
                </span>
                {file.name.slice(query.length)}
              </p>
              <p className="truncate text-xs text-gray-500">{file.path}</p>
            </div>
            <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
              {file.type}
            </span>
            <span className="w-20 shrink-0 text-right text-sm text-gray-700">
              {formatBytes(file.sizeBytes)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default SearchResults
