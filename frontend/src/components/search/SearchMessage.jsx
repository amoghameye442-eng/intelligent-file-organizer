// A small box for the non-result states: idle, loading, empty and error.
// Props: tone ("neutral" or "error"), children (the message text)
function SearchMessage({ tone = "neutral", children }) {
  const toneClasses =
    tone === "error"
      ? "border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300"
      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400"

  return (
    // role="alert" makes screen readers announce errors right away;
    // role="status" announces the calmer loading / empty messages politely.
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-lg border p-4 text-sm ${toneClasses}`}
    >
      {children}
    </p>
  )
}

export default SearchMessage
