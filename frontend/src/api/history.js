// MOCK API for the History / Undo view.
//
// Nothing here talks to the C++ engine, and NOTHING here moves, renames or
// deletes a real file. The "log" is just a list kept in the browser's memory.
// Refreshing the page resets it. That is expected for a mock.
//
// What the engine has today (engine/src/api_server.cpp). It is NOT called yet,
// because its behaviour has not been confirmed:
//   GET  /api/history   -> { "entries": [ { id, path_before, path_after, timestamp, undone } ] }
//   POST /api/undo/{id} -> { "success": true } or { "success": false }
// Things to remember for when the real API is connected:
//   - A failed undo still answers with HTTP status 200 and success:false. So the
//     page must read `success`; `response.ok` alone is not enough.
//   - On Linux/macOS the engine's rename() can silently replace a file that is
//     already at the original location, and it never says WHY an undo failed.
//     These are for Amogh to fix or confirm first.
//
// The two functions below return exactly those shapes, so connecting the real
// API later only changes THIS file:
//   getHistory()    -> Promise of { entries: [...] }   (oldest first)
//   undoAction(id)  -> Promise of { success: boolean }

import { mockHistoryResponse } from "../mock/historyData"

// The "server-side" copy of the log. We copy each entry so changing it here
// never changes the original mock data.
let entries = mockHistoryResponse.entries.map((entry) => ({ ...entry }))

// Ids whose undo always FAILS in this mock. They stand for a file that was moved
// or changed after the action, so the engine cannot put it back. It lets you see
// how the page behaves when an undo does not work.
const MOCK_UNDO_FAILS = [6]

// Waits `ms` milliseconds (the fake network), then answers with `produce()`.
function respond(produce, ms = 500) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(produce()), ms)
  })
}

export function getHistory() {
  return respond(() => ({ entries: entries.map((entry) => ({ ...entry })) }))
}

// MOCK ONLY: pretends to put a file back. Only the "undone" flag in the in-memory
// list changes. It follows the engine's own rules: an unknown id, an id that is
// already undone, or a failing id all answer success:false.
export function undoAction(id) {
  return respond(() => {
    const entry = entries.find((item) => item.id === id)
    if (!entry || entry.undone || MOCK_UNDO_FAILS.includes(id)) {
      return { success: false }
    }
    entry.undone = true
    return { success: true }
  }, 600)
}
