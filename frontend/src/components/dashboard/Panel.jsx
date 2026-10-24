// A white card with a title. All three dashboard sections use it, so they look
// the same and the card styling lives in ONE place.
//
// `children` is a special prop: it is whatever you write BETWEEN
// <Panel> and </Panel> when you use it.
function Panel({ title, children }) {
  return (
    <section className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
      {children}
    </section>
  )
}

export default Panel
