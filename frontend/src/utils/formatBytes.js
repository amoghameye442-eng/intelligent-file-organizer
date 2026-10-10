// Turns a raw byte count (what a backend usually sends) into text a person can read.
// Example: formatBytes(2400000) -> "2.3 MB"
export function formatBytes(bytes) {
  if (bytes === 0) return "0 B"

  const units = ["B", "KB", "MB", "GB", "TB"]
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  )
  const value = bytes / Math.pow(1024, index)

  // Plain bytes never need a decimal point; everything else gets one.
  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`
}
