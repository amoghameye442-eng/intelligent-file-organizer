// The text box. It does not remember the text itself: the Search page owns it
// (this is called a "controlled input"). It just shows `value` and tells the
// page about every change through `onChange`.
//
// Props: value (string), onChange (function that receives the new text)
function SearchBox({ value, onChange }) {
  return (
    <div>
      <label
        htmlFor="file-search"
        className="mb-2 block text-sm font-medium text-gray-700"
      >
        Search files by name
      </label>
      <input
        id="file-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="e.g. report, IMG_, lecture"
        autoComplete="off"
        className="w-full rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
      <p className="mt-2 text-xs text-gray-500">
        Prefix search: finds file names that start with what you type.
      </p>
    </div>
  )
}

export default SearchBox
