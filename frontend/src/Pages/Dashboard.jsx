import { useEffect, useState } from "react"
import {
  getStorageSummary,
  getLargestFiles,
  getRecentActivity,
} from "../api/dashboard"
import StorageOverview from "../components/dashboard/StorageOverview"
import LargestFilesPanel from "../components/dashboard/LargestFilesPanel"
import ActivityFeed from "../components/dashboard/ActivityFeed"

function Dashboard() {
  // State: the data we load, plus "are we still loading?" and "did it fail?"
  const [summary, setSummary] = useState(null)
  const [largestFiles, setLargestFiles] = useState([])
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // useEffect runs this code AFTER the page first appears on screen.
  // The empty [] at the end means: "run it only once, when the page opens".
  useEffect(() => {
    async function loadDashboard() {
      try {
        // Promise.all starts all three requests together and waits for all of them.
        const [summaryData, filesData, activityData] = await Promise.all([
          getStorageSummary(),
          getLargestFiles(),
          getRecentActivity(),
        ])

        // Saving into state is what makes React redraw the page with the data.
        setSummary(summaryData)
        setLargestFiles(filesData)
        setActivity(activityData)
      } catch (err) {
        // The technical details go to the browser console (for you, the developer);
        // the person using the dashboard sees a friendly message instead.
        console.error("Dashboard load failed:", err)
        setError("Could not load the dashboard data. Please try again.")
      } finally {
        // Runs whether it worked or failed: we are no longer loading.
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  if (loading) {
    return <p className="text-gray-500">Loading dashboard...</p>
  }

  if (error) {
    return (
      <p className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
        {error}
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>

      <StorageOverview summary={summary} />

      <div className="grid gap-6 lg:grid-cols-2">
        <LargestFilesPanel files={largestFiles} />
        <ActivityFeed activities={activity} />
      </div>
    </div>
  )
}

export default Dashboard
