import { useEffect, useState } from "react"
import { searchFiles } from "../api/search"
import SearchBox from "../components/search/SearchBox"
import SearchMessage from "../components/search/SearchMessage"
import SearchResults from "../components/search/SearchResults"

// How long to wait after the LAST keystroke before searching (milliseconds).
const DEBOUNCE_MS = 300

function Search() {
  // What is typed in the box right now (changes on every keystroke).
  const [query, setQuery] = useState("")
  // The same text, but only updated after the person pauses typing.
  const [debouncedQuery, setDebouncedQuery] = useState("")
  // The latest answer from the API, together with the query it answers.
  const [result, setResult] = useState({ query: "", files: [], error: null })

  // Spaces at the start or end are not part of a file name.
  const trimmedQuery = query.trim()

  // STEP 1 - debounce.
  // Every keystroke starts a timer. If the person types again before it
  // finishes, the cleanup function cancels the old timer, so only the pause
  // after the LAST keystroke gets through.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(trimmedQuery), DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [trimmedQuery])

  // STEP 2 - search. Runs only when debouncedQuery changes.
  useEffect(() => {
    if (debouncedQuery === "") return

    // If a newer search starts before this one answers, the cleanup below sets
    // `ignore` to true, so a slow OLD answer can never overwrite a newer one.
    let ignore = false

    async function runSearch() {
      try {
        const files = await searchFiles(debouncedQuery)
        if (!ignore) setResult({ query: debouncedQuery, files, error: null })
      } catch (err) {
        console.error("Search failed:", err)
        if (!ignore) {
          setResult({
            query: debouncedQuery,
            files: [],
            error: "Something went wrong while searching. Please try again.",
          })
        }
      }
    }

    runSearch()

    return () => {
      ignore = true
    }
  }, [debouncedQuery])

  // "Loading" means: something is typed, but we do not have the answer for
  // exactly that text yet (we are waiting for the pause, or for the API).
  const isLoading = trimmedQuery !== "" && result.query !== trimmedQuery

  function renderResults() {
    if (trimmedQuery === "") {
      return <SearchMessage>Start typing to search your files.</SearchMessage>
    }
    if (isLoading) {
      return <SearchMessage>Searching...</SearchMessage>
    }
    if (result.error) {
      return <SearchMessage tone="error">{result.error}</SearchMessage>
    }
    if (result.files.length === 0) {
      return (
        <SearchMessage>
          No files found with a name starting with "{result.query}".
        </SearchMessage>
      )
    }
    return <SearchResults query={result.query} files={result.files} />
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Search</h1>

      <SearchBox value={query} onChange={setQuery} />

      <div aria-live="polite">{renderResults()}</div>
    </div>
  )
}

export default Search
