import Panel from "../dashboard/Panel"

// Facts about the project, taken from the README and package.json.
// This is plain text: when the project changes, update it here.
const facts = [
  {
    label: "Project",
    value: "Intelligent File Organisation and Automation System",
  },
  {
    label: "Dashboard (frontend)",
    value: "React 19, Vite 8, Tailwind CSS 4, React Router 7",
  },
  {
    label: "Engine (backend)",
    value:
      "C++17 with custom data structures: Trie, hash table, SHA-256, min-heap, transaction log and a rules engine. A REST API layer exposes it to the dashboard.",
  },
  {
    label: "Content classifier",
    value: "Python module for reading inside PDFs and images (planned, not built yet)",
  },
  {
    label: "Team",
    value:
      "Amogh (C++ engine and system architecture), Sampan Sharma (React dashboard and frontend architecture)",
  },
]

function AboutProject() {
  return (
    <Panel title="About this project">
      <p className="mb-4 rounded-md border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950 p-3 text-sm text-amber-800 dark:text-amber-200">
        This dashboard currently shows mock (sample) data. It is not connected
        to the C++ engine yet.
      </p>

      <dl className="divide-y divide-gray-100 dark:divide-gray-800">
        {facts.map((fact) => (
          <div
            key={fact.label}
            className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:gap-6"
          >
            <dt className="shrink-0 text-sm font-medium text-gray-600 dark:text-gray-300 sm:w-44">
              {fact.label}
            </dt>
            <dd className="min-w-0 text-sm text-gray-800 dark:text-gray-100">{fact.value}</dd>
          </div>
        ))}
      </dl>
    </Panel>
  )
}

export default AboutProject
