// MOCK DATA for the Duplicate Files view.
// None of this comes from the C++ engine, and no real file is involved.
//
// The shapes below copy what the engine code (engine/src/api_server.cpp)
// currently returns, so that connecting the real API later is easy:
//
//   GET /api/duplicates  ->  { "groups": [ { "checksum": "...", "files": ["path", ...] } ] }
//   GET /api/scan        ->  { "count": N, "files": [ { path, filename, extension, size_bytes } ] }
//
// /api/duplicates only gives checksums and paths. It does NOT give sizes, so
// the sizes come from the second list (what /api/scan returns for every file).
// api/duplicates.js joins the two lists together.
//
// Files in the same group have identical content, so they always have the same
// size. Sizes are in BYTES (the UI converts them with formatBytes).

const KB = 1024
const MB = 1024 * KB

// What GET /api/duplicates would return.
export const mockDuplicatesResponse = {
  groups: [
    {
      checksum: "34236ed8ea167ba3149e0c42654c7c652764f55694c934c17956ead0afc24ed5",
      files: [
        "C:/Users/Sampan/Downloads/holiday_001.jpg",
        "C:/Users/Sampan/Pictures/2026/holiday_001.jpg",
        "C:/Users/Sampan/Desktop/holiday_001.jpg",
      ],
    },
    {
      checksum: "e0de53850ab7b8de122733232c5661dde4c21a60e5eb0c1c104ae05ace162017",
      files: [
        "C:/Users/Sampan/Documents/College/report_final.docx",
        "C:/Users/Sampan/Downloads/report_final.docx",
      ],
    },
    {
      checksum: "2474c5c17c5ea78d6f70bef0ff18d3c7dc16f0b9fa3f37db0fe696c4912cd046",
      files: [
        "C:/Users/Sampan/Videos/College/lecture_01_intro.mp4",
        "C:/Users/Sampan/Downloads/lecture_01_intro.mp4",
      ],
    },
    {
      checksum: "7b0dd390fa61aa0d820d60409933a137b7f7a510894c3c0d2880126014c1fdbe",
      files: [
        "C:/Users/Sampan/Music/song_demo.mp3",
        "C:/Users/Sampan/Downloads/song_demo.mp3",
        "D:/Backup/Music/song_demo.mp3",
      ],
    },
    {
      checksum: "b94fc4f499b553980694d09a9f6bc04fc50c182181fa785c712db43d48f1b21d",
      files: [
        "C:/Users/Sampan/Documents/College/notes_dsa.txt",
        "C:/Users/Sampan/Desktop/notes_dsa.txt",
      ],
    },
  ],
}

// What GET /api/scan would return for these files.
export const mockScannedFiles = [
  { path: "C:/Users/Sampan/Downloads/holiday_001.jpg", filename: "holiday_001.jpg", extension: "jpg", size_bytes: Math.round(4.1 * MB) },
  { path: "C:/Users/Sampan/Pictures/2026/holiday_001.jpg", filename: "holiday_001.jpg", extension: "jpg", size_bytes: Math.round(4.1 * MB) },
  { path: "C:/Users/Sampan/Desktop/holiday_001.jpg", filename: "holiday_001.jpg", extension: "jpg", size_bytes: Math.round(4.1 * MB) },

  { path: "C:/Users/Sampan/Documents/College/report_final.docx", filename: "report_final.docx", extension: "docx", size_bytes: 850 * KB },
  { path: "C:/Users/Sampan/Downloads/report_final.docx", filename: "report_final.docx", extension: "docx", size_bytes: 850 * KB },

  { path: "C:/Users/Sampan/Videos/College/lecture_01_intro.mp4", filename: "lecture_01_intro.mp4", extension: "mp4", size_bytes: 640 * MB },
  { path: "C:/Users/Sampan/Downloads/lecture_01_intro.mp4", filename: "lecture_01_intro.mp4", extension: "mp4", size_bytes: 640 * MB },

  { path: "C:/Users/Sampan/Music/song_demo.mp3", filename: "song_demo.mp3", extension: "mp3", size_bytes: Math.round(6.5 * MB) },
  { path: "C:/Users/Sampan/Downloads/song_demo.mp3", filename: "song_demo.mp3", extension: "mp3", size_bytes: Math.round(6.5 * MB) },
  { path: "D:/Backup/Music/song_demo.mp3", filename: "song_demo.mp3", extension: "mp3", size_bytes: Math.round(6.5 * MB) },

  { path: "C:/Users/Sampan/Documents/College/notes_dsa.txt", filename: "notes_dsa.txt", extension: "txt", size_bytes: 18 * KB },
  { path: "C:/Users/Sampan/Desktop/notes_dsa.txt", filename: "notes_dsa.txt", extension: "txt", size_bytes: 18 * KB },
]
