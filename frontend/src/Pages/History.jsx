import { useEffect, useState } from "react"
import { getHistory, undoAction } from "../api/history"
import HistoryList from "../components/history/HistoryList"
import Panel from "../components/dashboard/Panel"
import SearchMessage from "../components/search/SearchMessage"

function History() {
  // The history entries, plus "are we still loading?" and "did loading fail?"
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  // True while a (mock) undo is running.
  const [busy, setBusy] = useState(false)
  // The message shown after an undo: { type: "success" | "error", text }
  const [notice, setNotice] = useState(null)

  // Load the history once, when the page opens.
  useEffect(() => {
    // If this effect is cleaned up before the answer arrives, ignore the answer.
    let ignore = false

    async function loadHistory() {
      try {
        const data = await getHistory()
        if (!ignore) setEntries(data.entries)
      } catch (err) {
        console.error("Loading history failed:", err)
        if (!ignore) setLoadError("Could not load the history. Please try again.")
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    loadHistory()

    return () => {
      ignore = true
    }
  }, [])

  async function handleUndo(entry) {
    const sure = window.confirm(
      `MOCK MODE: no real file will be moved or changed.\n\n` +
        `This only simulates undoing action #${entry.id}. Continue?`
    )
    if (!sure) return

    setBusy(true)
    setNotice(null)
    try {
      const result = await undoAction(entry.id)

      if (!result.success) {
        // Read `success`: the real engine also answers 200 when an undo fails.
        setNotice({
          type: "error",
          text: `Mock undo failed for action #${entry.id}. Nothing was changed.`,
        })
        return
      }

      // Undo worked, so ask the "server" for the fresh list instead of editing it ourselves.
      try {
        const data = await getHistory()
        setEntries(data.entries)
        setNotice({
          type: "success",
          text:
            `Mock only: action #${entry.id} was marked as undone. ` +
            `No real file was moved, renamed or changed.`,
        })
      } catch (err) {
        console.error("Refreshing history failed:", err)
        setNotice({
          type: "error",
          text:
            `Mock undo of action #${entry.id} succeeded, but the list could not be ` +
            `refreshed. Reload the page to see the new status.`,
        })
      }
    } catch (err) {
      console.error("Undo failed:", err)
      setNotice({ type: "error", text: "Something went wrong. Nothing was changed." })
    } finally {
      setBusy(false)
      // The message is at the TOP of the page, the button may be far below it.
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  if (loading) {
    return <SearchMessage>Loading history...</SearchMessage>
  }

  if (loadError) {
    return <SearchMessage tone="error">{loadError}</SearchMessage>
  }

  // The engine sends oldest first. Copy the list, then sort so the newest is on top.
  const newestFirst = [...entries].sort((a, b) => b.id - a.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">History</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Actions the organizer has done on your files, newest first.
        </p>
      </div>

      <p className="rounded-md border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950 p-3 text-sm text-amber-800 dark:text-amber-200">
        Mock mode: this list is sample data. Undo only updates a pretend list in
        memory and never moves, renames or deletes real files.
      </p>

      {notice && (
        <p
          role={notice.type === "error" ? "alert" : "status"}
          className={`rounded-md border p-3 text-sm ${
            notice.type === "error"
              ? "border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300"
              : "border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200"
          }`}
        >
          {notice.text}
        </p>
      )}

      {newestFirst.length === 0 ? (
        <SearchMessage>No automated actions yet.</SearchMessage>
      ) : (
        <Panel title={`Automated actions (${newestFirst.length})`}>
          <HistoryList entries={newestFirst} busy={busy} onUndo={handleUndo} />
        </Panel>
      )}
    </div>
  )
}

export default History
