// MOCK DATA for the History / Undo view.
// None of this comes from the C++ engine, and no real file is involved.
//
// The shape copies what the engine code (engine/src/api_server.cpp) returns
// for GET /api/history today:
//
//   { "entries": [ { "id", "path_before", "path_after", "timestamp", "undone" } ] }
//
// - Entries come OLDEST FIRST (the id goes up by one for every action). The page
//   turns the list around to show the newest first.
// - "timestamp" is the engine's local time as text, with no time zone.
// - The engine does NOT send the kind of action (move / rename / delete), so the
//   page works it out from the two paths.
//
// The entries are chosen to show every situation the page has to handle:
//   #3 and #9  already undone
//   #4         cannot be undone yet: #5 moved the same file again later
//   #8         CAN be undone, because the newer action #9 on the same file was undone
//   #6         can be tried, but the mock undo fails for it (see api/history.js)
//   #7         only the file name changed (a rename)

export const mockHistoryResponse = {
  entries: [
    { id: 1, path_before: "C:/Users/Sampan/Downloads/invoice_march.pdf", path_after: "C:/Users/Sampan/Documents/Invoices/invoice_march.pdf", timestamp: "2026-10-16 09:12:04", undone: false },
    { id: 2, path_before: "C:/Users/Sampan/Downloads/holiday_001.jpg", path_after: "C:/Users/Sampan/Pictures/2026/holiday_001.jpg", timestamp: "2026-10-16 09:12:05", undone: false },
    { id: 3, path_before: "C:/Users/Sampan/Desktop/lecture_notes.txt", path_after: "C:/Users/Sampan/Documents/College/lecture_notes.txt", timestamp: "2026-10-16 09:12:06", undone: true },
    { id: 4, path_before: "C:/Users/Sampan/Downloads/report_final.docx", path_after: "C:/Users/Sampan/Documents/College/report_final.docx", timestamp: "2026-10-17 18:30:10", undone: false },
    { id: 5, path_before: "C:/Users/Sampan/Documents/College/report_final.docx", path_after: "C:/Users/Sampan/Documents/Archive/report_final.docx", timestamp: "2026-10-17 18:45:22", undone: false },
    { id: 6, path_before: "C:/Users/Sampan/Downloads/song_demo.mp3", path_after: "C:/Users/Sampan/Music/song_demo.mp3", timestamp: "2026-10-17 19:02:41", undone: false },
    { id: 7, path_before: "C:/Users/Sampan/Desktop/Screenshot 2026-10-09.png", path_after: "C:/Users/Sampan/Desktop/screenshot_2026-10-09.png", timestamp: "2026-10-18 08:15:00", undone: false },
    { id: 8, path_before: "C:/Users/Sampan/Desktop/notes_dsa.txt", path_after: "C:/Users/Sampan/Documents/College/notes_dsa.txt", timestamp: "2026-10-18 20:01:13", undone: false },
    { id: 9, path_before: "C:/Users/Sampan/Documents/College/notes_dsa.txt", path_after: "C:/Users/Sampan/Documents/DSA/notes_dsa.txt", timestamp: "2026-10-18 20:05:48", undone: true },
  ],
}
