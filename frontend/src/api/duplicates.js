// MOCK API for the Duplicate Files view.
//
// Nothing here talks to the C++ engine, and NOTHING here deletes or moves a
// file. The page works like this:
//   1. getDuplicateGroups()  - gives the duplicate groups to show.
//   2. markForRemoval(paths) - a pretend "delete". It only checks its input and
//      answers after a short delay. It never touches any file.
//
// What the engine has today (engine/src/api_server.cpp):
//   - GET /api/duplicates exists, but it only returns checksums and paths.
//   - There is NO endpoint that deletes files, so real deletion cannot be built
//     yet. (Also note: its CORS header only allows GET, POST and OPTIONS, so a
//     browser DELETE request would be blocked until that is changed.)
// The delete contract still has to be agreed with Amogh.
//
// When the real API exists, ONLY this file changes. Duplicates.jsx and the
// components keep working because they only use these two functions and the
// shapes they return:
//   getDuplicateGroups() -> Promise of
//     [{ id, checksum, files: [{ path, filename, sizeBytes }] }]
//   markForRemoval(paths) -> Promise of { markedCount }

import { mockDuplicatesResponse, mockScannedFiles } from "../mock/duplicatesData"

// Waits `ms` milliseconds (the fake network), then answers with `data`.
function fakeDelay(data, ms = 500) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), ms)
  })
}

// "C:/Users/me/a.txt" or "C:\Users\me\a.txt" -> "a.txt"
function fileNameFromPath(path) {
  const parts = path.split(/[\\/]/)
  return parts[parts.length - 1]
}

// Joins the two lists: for every path in a group, look up its details.
function buildGroups() {
  const scannedByPath = {}
  for (const file of mockScannedFiles) {
    scannedByPath[file.path] = file
  }

  return mockDuplicatesResponse.groups.map((group) => ({
    id: group.checksum, // a checksum is unique per group, so it works as an id
    checksum: group.checksum,
    files: group.files.map((path) => {
      const scanned = scannedByPath[path]
      return {
        path,
        filename: scanned ? scanned.filename : fileNameFromPath(path),
        // null means "size unknown" (the file was not in the scan list).
        sizeBytes: scanned ? scanned.size_bytes : null,
      }
    }),
  }))
}

export function getDuplicateGroups() {
  return fakeDelay(buildGroups())
}

// MOCK ONLY: pretends to remove the given files. No file is deleted or moved.
export function markForRemoval(paths) {
  if (!Array.isArray(paths) || paths.length === 0) {
    return Promise.reject(new Error("markForRemoval needs a list of paths"))
  }
  return fakeDelay({ markedCount: paths.length }, 600)
}
