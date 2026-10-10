// A small box for the non-result states: idle, loading, empty and error.
// Props: tone ("neutral" or "error"), children (the message text)
function SearchMessage({ tone = "neutral", children }) {
  const toneClasses =
    tone === "error"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-gray-200 bg-white text-gray-500"

  return (
    <p className={`rounded-lg border p-4 text-sm ${toneClasses}`}>{children}</p>
  )
}

export default SearchMessage
