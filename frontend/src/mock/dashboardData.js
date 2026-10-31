// MOCK DATA - hardcoded sample data for the Dashboard Home view.
// None of this comes from the C++ engine. The shapes below are PROPOSED shapes:
// agree on the real ones with Amogh when the REST API contract is written.
//
// Sizes are always in BYTES (the UI converts them to KB/MB/GB for display).

const MB = 1024 * 1024

// Storage overview (total files, total size, breakdown by file type)
export const mockStorageSummary = {
  totalFiles: 6315,
  totalSizeBytes: 44300 * MB,
  byType: [
    { type: "Videos", count: 210, sizeBytes: 21500 * MB },
    { type: "Archives", count: 95, sizeBytes: 11000 * MB },
    { type: "Images", count: 3560, sizeBytes: 6200 * MB },
    { type: "Audio", count: 480, sizeBytes: 2900 * MB },
    { type: "Documents", count: 1240, sizeBytes: 1800 * MB },
    { type: "Other", count: 730, sizeBytes: 900 * MB },
  ],
}

// "Largest files" panel (biggest first)
export const mockLargestFiles = [
  { id: 1, name: "ubuntu-24.04-desktop.iso", path: "/Downloads/ubuntu-24.04-desktop.iso", sizeBytes: 5800 * MB, type: "Archives" },
  { id: 2, name: "project_demo_recording.mp4", path: "/Videos/Recordings/project_demo_recording.mp4", sizeBytes: 4200 * MB, type: "Videos" },
  { id: 3, name: "backup_2025.zip", path: "/Downloads/backup_2025.zip", sizeBytes: 3100 * MB, type: "Archives" },
  { id: 4, name: "lecture_series_full.mkv", path: "/Videos/College/lecture_series_full.mkv", sizeBytes: 2650 * MB, type: "Videos" },
  { id: 5, name: "dataset_images.tar.gz", path: "/Documents/Projects/dataset_images.tar.gz", sizeBytes: 1480 * MB, type: "Archives" },
]

// "Recent automation activity" feed (newest first).
// action is one of: "move", "rename", "delete".  "to" is missing for deletes.
export const mockRecentActivity = [
  { id: 1, action: "move", fileName: "invoice_march.pdf", from: "/Downloads", to: "/Documents/Invoices", timestamp: "2026-10-10T09:42:00+05:30" },
  { id: 2, action: "move", fileName: "holiday_001.jpg", from: "/Downloads", to: "/Pictures/2026", timestamp: "2026-10-10T09:41:00+05:30" },
  { id: 3, action: "rename", fileName: "Screenshot 2026-10-09.png", from: "/Desktop", to: "/Desktop/screenshot_2026-10-09.png", timestamp: "2026-10-09T21:15:00+05:30" },
  { id: 4, action: "delete", fileName: "report_copy(1).docx", from: "/Documents/Reports", timestamp: "2026-10-09T18:30:00+05:30" },
  { id: 5, action: "move", fileName: "lecture_notes.txt", from: "/Downloads", to: "/Documents/College", timestamp: "2026-10-09T16:05:00+05:30" },
  { id: 6, action: "move", fileName: "song_demo.mp3", from: "/Downloads", to: "/Music", timestamp: "2026-10-08T20:50:00+05:30" },
]
