// Small helpers for the History view. They only READ data and never change it.
//
// A history entry looks like: { id, path_before, path_after, timestamp, undone }
// (the shape of the engine's GET /api/history).

// Windows paths can use \ or /, so treat both the same way.
function normalizePath(path) {
  return path.replace(/\\/g, "/")
}

// "C:/Users/me/a.txt" or "C:\Users\me\a.txt" -> "a.txt"
export function getFileName(path) {
  const parts = normalizePath(path).split("/")
  return parts[parts.length - 1]
}

// "C:/Users/me/a.txt" -> "C:/Users/me"
export function getFolder(path) {
  const normalized = normalizePath(path)
  return normalized.slice(0, normalized.lastIndexOf("/"))
}

// The engine does not say what kind of action an entry is, so we work it out
// from the two paths:
//   different folder, same name  -> Moved
//   same folder, different name  -> Renamed
//   both different               -> Moved & renamed
export function describeChange(entry) {
  const sameFolder = getFolder(entry.path_before) === getFolder(entry.path_after)
  const sameName = getFileName(entry.path_before) === getFileName(entry.path_after)

  if (sameFolder && sameName) return "Changed"
  if (sameFolder) return "Renamed"
  if (sameName) return "Moved"
  return "Moved & renamed"
}

// Undoing puts the file back from path_after to path_before. That only makes
// sense if the file is still at path_after. If a NEWER action (that has not been
// undone) moved the same file away from path_after, undoing this older action
// first would break things. This finds that newer action, or returns null.
export function findBlockingEntry(entry, entries) {
  if (entry.undone) return null

  const target = normalizePath(entry.path_after)
  const blockers = entries.filter(
    (other) =>
      !other.undone &&
      other.id > entry.id &&
      normalizePath(other.path_before) === target
  )
  if (blockers.length === 0) return null

  // If there are several, the oldest one has to be undone first.
  return blockers.reduce((oldest, other) => (other.id < oldest.id ? other : oldest))
}

// An action can be undone only if it is not undone yet AND no newer, not-yet-undone
// action is in its way.
export function canUndo(entry, entries) {
  return !entry.undone && findBlockingEntry(entry, entries) === null
}
