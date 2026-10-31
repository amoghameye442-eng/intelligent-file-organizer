import { useEffect, useState } from "react"
import {
  getRules,
  createRule,
  updateRule,
  deleteRule,
  moveRule,
} from "../api/rules"
import { describeCondition } from "../utils/ruleHelpers"
import RuleForm from "../components/rules/RuleForm"
import RuleList from "../components/rules/RuleList"
import SearchMessage from "../components/search/SearchMessage"

function Rules() {
  // The list of rules, plus "are we still loading?" and "did loading fail?"
  const [rules, setRules] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  // Which rule is being edited? null means the form is in "add a new rule" mode.
  const [editingId, setEditingId] = useState(null)
  // Goes up by one after every successful save. It is only used in the form's
  // `key` below, to give the form a fresh, empty start.
  const [saveCount, setSaveCount] = useState(0)

  // True while a change (add/edit/delete/move) is being saved.
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState(null)

  // Load the rules once, when the page opens.
  useEffect(() => {
    // Same guard as on the Search page: if this effect is cleaned up before the
    // answer arrives, ignore the answer.
    let ignore = false

    async function loadRules() {
      try {
        const data = await getRules()
        if (!ignore) setRules(data)
      } catch (err) {
        console.error("Loading rules failed:", err)
        if (!ignore) setLoadError("Could not load the rules. Please try again.")
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    loadRules()

    return () => {
      ignore = true
    }
  }, [])

  // Every change goes through this ONE function, so busy/error handling is
  // written once. `action` is a function that calls the API and returns the
  // updated list of rules. Returns true if it worked, false if it failed.
  async function runAction(action) {
    setBusy(true)
    setActionError(null)
    try {
      const updatedRules = await action()
      setRules(updatedRules)
      return true
    } catch (err) {
      console.error("Rule change failed:", err)
      setActionError("Something went wrong while saving. Your rules were not changed.")
      return false
    } finally {
      setBusy(false)
    }
  }

  async function handleSave(ruleData) {
    const saved =
      editingId === null
        ? await runAction(() => createRule(ruleData))
        : await runAction(() => updateRule(editingId, ruleData))

    if (saved) {
      setEditingId(null)
      setSaveCount((count) => count + 1)
    }
  }

  function handleEdit(rule) {
    setActionError(null)
    setEditingId(rule.id)
    // The form is at the top of the page, so bring it into view.
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function handleCancelEdit() {
    setEditingId(null)
  }

  async function handleDelete(rule) {
    const sure = window.confirm(`Delete this rule?\n\nIf ${describeCondition(rule)} → move to ${rule.destination}`)
    if (!sure) return

    const deleted = await runAction(() => deleteRule(rule.id))
    // If we just deleted the rule being edited, leave edit mode.
    if (deleted && rule.id === editingId) setEditingId(null)
  }

  function handleMove(rule, direction) {
    runAction(() => moveRule(rule.id, direction))
  }

  if (loading) {
    return <SearchMessage>Loading rules...</SearchMessage>
  }

  if (loadError) {
    return <SearchMessage tone="error">{loadError}</SearchMessage>
  }

  // The rule object being edited (or null), so the form can start with its values.
  const editingRule = rules.find((rule) => rule.id === editingId) || null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Rules</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Rules decide where files get moved automatically.
        </p>
      </div>

      {/* `key` makes React throw the old form away and build a new one whenever it
          changes. That is how the form gets cleared after a save, and filled with
          the right values when you press Edit on a different rule. */}
      <RuleForm
        key={`${editingId ?? "new"}-${saveCount}`}
        initialRule={editingRule}
        onSave={handleSave}
        onCancel={handleCancelEdit}
        busy={busy}
      />

      {actionError && (
        <p role="alert" className="rounded-md border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 p-3 text-sm text-red-700 dark:text-red-300">
          {actionError}
        </p>
      )}

      <RuleList
        rules={rules}
        editingId={editingId}
        busy={busy}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onMove={handleMove}
      />
    </div>
  )
}

export default Rules
