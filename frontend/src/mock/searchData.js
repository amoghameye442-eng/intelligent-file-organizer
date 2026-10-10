// MOCK DATA - a small pretend file index for the Search view.
// None of this comes from the C++ engine. Each file uses the same shape as the
// "largest files" mock on the Dashboard: { id, name, path, sizeBytes, type }.
// That shape is PROPOSED, not agreed: confirm it with Amogh when the REST API
// contract is written. Sizes are in BYTES (the UI converts them for display).

const KB = 1024
const MB = 1024 * KB

export const mockSearchFiles = [
  // Documents
  { id: 1, name: "report_final.docx", path: "/Documents/College/report_final.docx", sizeBytes: 850 * KB, type: "Documents" },
  { id: 2, name: "Report_draft_v2.docx", path: "/Documents/College/Report_draft_v2.docx", sizeBytes: 620 * KB, type: "Documents" },
  { id: 3, name: "resume_2026.pdf", path: "/Documents/Personal/resume_2026.pdf", sizeBytes: 210 * KB, type: "Documents" },
  { id: 4, name: "receipt_amazon_oct.pdf", path: "/Documents/Receipts/receipt_amazon_oct.pdf", sizeBytes: 95 * KB, type: "Documents" },
  { id: 5, name: "receipt_electricity_sep.pdf", path: "/Documents/Receipts/receipt_electricity_sep.pdf", sizeBytes: 120 * KB, type: "Documents" },
  { id: 6, name: "README.md", path: "/Projects/file-organizer/README.md", sizeBytes: 4 * KB, type: "Documents" },
  { id: 7, name: "notes_dsa.txt", path: "/Documents/College/notes_dsa.txt", sizeBytes: 18 * KB, type: "Documents" },
  { id: 8, name: "lecture_notes.txt", path: "/Documents/College/lecture_notes.txt", sizeBytes: 32 * KB, type: "Documents" },
  { id: 9, name: "invoice_march.pdf", path: "/Documents/Invoices/invoice_march.pdf", sizeBytes: 180 * KB, type: "Documents" },
  { id: 10, name: "project_proposal.docx", path: "/Documents/College/project_proposal.docx", sizeBytes: 1.2 * MB, type: "Documents" },

  // Images
  { id: 11, name: "IMG_0012.jpg", path: "/Pictures/2026/IMG_0012.jpg", sizeBytes: 3.4 * MB, type: "Images" },
  { id: 12, name: "IMG_0013.jpg", path: "/Pictures/2026/IMG_0013.jpg", sizeBytes: 3.1 * MB, type: "Images" },
  { id: 13, name: "IMG_0014.png", path: "/Pictures/2026/IMG_0014.png", sizeBytes: 5.2 * MB, type: "Images" },
  { id: 14, name: "holiday_001.jpg", path: "/Pictures/2026/holiday_001.jpg", sizeBytes: 4.1 * MB, type: "Images" },
  { id: 15, name: "holiday_002.jpg", path: "/Pictures/2026/holiday_002.jpg", sizeBytes: 3.8 * MB, type: "Images" },
  { id: 16, name: "screenshot_2026-10-09.png", path: "/Desktop/screenshot_2026-10-09.png", sizeBytes: 1.1 * MB, type: "Images" },

  // Videos
  { id: 17, name: "project_demo_recording.mp4", path: "/Videos/Recordings/project_demo_recording.mp4", sizeBytes: 4200 * MB, type: "Videos" },
  { id: 18, name: "lecture_series_full.mkv", path: "/Videos/College/lecture_series_full.mkv", sizeBytes: 2650 * MB, type: "Videos" },
  { id: 19, name: "lecture_01_intro.mp4", path: "/Videos/College/lecture_01_intro.mp4", sizeBytes: 640 * MB, type: "Videos" },
  { id: 20, name: "lecture_02_arrays.mp4", path: "/Videos/College/lecture_02_arrays.mp4", sizeBytes: 710 * MB, type: "Videos" },

  // Audio
  { id: 21, name: "song_demo.mp3", path: "/Music/song_demo.mp3", sizeBytes: 6.5 * MB, type: "Audio" },
  { id: 22, name: "lecture_recording.m4a", path: "/Music/Recordings/lecture_recording.m4a", sizeBytes: 48 * MB, type: "Audio" },

  // Archives
  { id: 23, name: "backup_2025.zip", path: "/Downloads/backup_2025.zip", sizeBytes: 3100 * MB, type: "Archives" },
  { id: 24, name: "ubuntu-24.04-desktop.iso", path: "/Downloads/ubuntu-24.04-desktop.iso", sizeBytes: 5800 * MB, type: "Archives" },
  { id: 25, name: "dataset_images.tar.gz", path: "/Documents/Projects/dataset_images.tar.gz", sizeBytes: 1480 * MB, type: "Archives" },
  { id: 26, name: "report_assets.zip", path: "/Documents/College/report_assets.zip", sizeBytes: 75 * MB, type: "Archives" },

  // Other
  { id: 27, name: "main.cpp", path: "/Projects/file-organizer/engine/main.cpp", sizeBytes: 12 * KB, type: "Other" },
  { id: 28, name: "trie.cpp", path: "/Projects/file-organizer/engine/trie.cpp", sizeBytes: 8 * KB, type: "Other" },
  { id: 29, name: "hash_table.cpp", path: "/Projects/file-organizer/engine/hash_table.cpp", sizeBytes: 9 * KB, type: "Other" },
  { id: 30, name: "package.json", path: "/Projects/file-organizer/frontend/package.json", sizeBytes: 1.2 * KB, type: "Other" },
]
