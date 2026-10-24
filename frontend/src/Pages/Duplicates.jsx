import { useEffect, useState } from "react"
import { getDuplicateGroups, markForRemoval } from "../api/duplicates"
import { formatBytes } from "../utils/formatBytes"
import DuplicateGroupCard from "../components/duplicates/DuplicateGroupCard"
import SelectionSummary from "../components/duplicates/SelectionSummary"
import SearchMessage from "../components/search/SearchMessage"

// Works out what the current choices would do, WITHOUT changing anything.
// `choices` looks like { groupId: pathOfTheCopyToKeep }. For every group that
// has a choice, all the OTHER files in that group are the ones that would be
// removed. A group with no choice adds nothing.
function summarize(groups, choices) {
  let decidedGroups = 0
  let bytesToFree = 0
  let someSizesUnknown = false
  const pathsToRemove = []

  for (const group of groups) {
    const keptPath = choices[group.id]
    // Skip groups with no choice (and ignore a choice that is not in the group).
    if (!group.files.some((file) => file.path === keptPath)) continue

    decidedGroups += 1
    for (const file of group.files) {
      if (file.path === keptPath) continue // the kept copy is never removed
      pathsToRemove.push(file.path)
      if (file.sizeBytes === null) {
        someSizesUnknown = true
      } else {
        bytesToFree += file.sizeBytes
      }
    }
  }

  return { decidedGroups, bytesToFree, someSizesUnknown, pathsToRemove }
}

function Duplicates() {
  // The duplicate groups, plus "are we still loading?" and "did loading fail?"
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  // The copy chosen to keep in each group. One separate entry per group:
  //   { "<group id>": "<path of the copy to keep>" }
  // Changing one group's entry never touches the others.
  const [choices, setChoices] = useState({})

  // True while the (mock) removal is running.
  const [busy, setBusy] = useState(false)
  // The message shown after pressing the button: { type: "success" | "error", text }
  const [notice, setNotice] = useState(null)

  // Load the groups once, when the page opens.
  useEffect(() => {
    // If this effect is cleaned up before the answer arrives, ignore the answer.
    let ignore = false

    async function loadGroups() {
      try {
        const data = await getDuplicateGroups()
        if (!ignore) setGroups(data)
      } catch (err) {
        console.error("Loading duplicates failed:", err)
        if (!ignore) setLoadError("Could not load the duplicate files. Please try again.")
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    loadGroups()

    return () => {
      ignore = true
    }
  }, [])

  // Called by a group's radio buttons. `path` is null when "Clear choice" is pressed.
  function handleKeep(groupId, path) {
    const updated = { ...choices } // a copy, so we never edit the state directly
    if (path === null) {
      delete updated[groupId]
    } else {
      updated[groupId] = path
    }
    setChoices(updated)
    // The old message was about the old choices, so remove it.
    setNotice(null)
  }

  // The summary is recalculated on every render, so it is always up to date.
  const summary = summarize(groups, choices)

  async function handleMark() {
    const count = summary.pathsToRemove.length
    if (count === 0) return

    const sure = window.confirm(
      `MOCK MODE: no files will be deleted, moved or changed.\n\n` +
        `This only simulates marking ${count} ${count === 1 ? "file" : "files"} ` +
        `(${formatBytes(summary.bytesToFree)}) for removal. Continue?`
    )
    if (!sure) return

    setBusy(true)
    setNotice(null)
    try {
      const result = await markForRemoval(summary.pathsToRemove)
      setNotice({
        type: "success",
        text:
          `Mock only: ${result.markedCount} ${result.markedCount === 1 ? "file was" : "files were"} ` +
          `marked for removal. No files were deleted, moved or changed.`,
      })
    } catch (err) {
      console.error("Marking duplicates failed:", err)
      setNotice({
        type: "error",
        text: "Something went wrong. No files were changed.",
      })
    } finally {
      setBusy(false)
      // The message is at the TOP of the page, but the button is at the bottom.
      // Scroll up so the person actually sees what happened (the Edit button on
      // the Rules page does the same thing).
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  if (loading) {
    return <SearchMessage>Loading duplicates...</SearchMessage>
  }

  if (loadError) {
    return <SearchMessage tone="error">{loadError}</SearchMessage>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Duplicate files</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Files in the same group have identical content. Choose one copy to
          keep in each group.
        </p>
      </div>

      <p className="rounded-md border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950 p-3 text-sm text-amber-800 dark:text-amber-200">
        Mock mode: nothing on this page deletes or moves real files. Choosing a
        copy only records your selection.
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

      {groups.length === 0 ? (
        <SearchMessage>No duplicate files found.</SearchMessage>
      ) : (
        <>
          {groups.map((group, index) => (
            <DuplicateGroupCard
              key={group.id}
              group={group}
              number={index + 1}
              keptPath={choices[group.id] ?? null}
              onKeep={handleKeep}
              disabled={busy}
            />
          ))}

          <SelectionSummary
            totalGroups={groups.length}
            decidedGroups={summary.decidedGroups}
            filesToRemove={summary.pathsToRemove.length}
            bytesToFree={summary.bytesToFree}
            someSizesUnknown={summary.someSizesUnknown}
            busy={busy}
            onMark={handleMark}
          />
        </>
      )}
    </div>
  )
}

export default Duplicates
