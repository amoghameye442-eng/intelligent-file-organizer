import { useState } from "react"
import {
  FIELD_OPTIONS,
  getField,
  describeCondition,
  buildRule,
} from "../../utils/ruleHelpers"

const inputClasses =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"

// The visual rule builder: "If [field] [condition] [value] then move to [folder]".
// It is used for BOTH adding a new rule and editing an existing one.
//
// Props:
//   initialRule  the rule to edit, or null when adding a new one
//   onSave       function(rule) -> Promise. The page does the real saving.
//   onCancel     function, only needed when editing
//   busy         true while the page is saving something (disables the buttons)
function RuleForm({ initialRule, onSave, onCancel, busy }) {
  const isEditing = initialRule !== null

  // The form owns the values being typed. They start from the rule being
  // edited, or from the first field option when adding.
  const [field, setField] = useState(initialRule ? initialRule.field : FIELD_OPTIONS[0].value)
  const [condition, setCondition] = useState(
    initialRule ? initialRule.condition : FIELD_OPTIONS[0].conditions[0].value
  )
  const [value, setValue] = useState(initialRule ? String(initialRule.value) : "")
  const [destination, setDestination] = useState(initialRule ? initialRule.destination : "")
  const [error, setError] = useState(null)

  // If we don't know this field (unexpected data), fall back to the first one
  // so the dropdowns still have something to show.
  const fieldInfo = getField(field) || FIELD_OPTIONS[0]

  function handleFieldChange(event) {
    const newField = getField(event.target.value)
    setField(newField.value)
    // The old condition and value belong to the OLD field, so reset them.
    setCondition(newField.conditions[0].value)
    setValue("")
  }

  function handleSubmit(event) {
    // Stop the browser from reloading the page, which is what a form does by default.
    event.preventDefault()

    const result = buildRule({ field, condition, value, destination })
    if (result.error) {
      setError(result.error)
      return
    }

    setError(null)
    onSave(result.rule)
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
    >
      <h2 className="mb-4 text-base font-semibold text-gray-800">
        {isEditing ? "Edit rule" : "Add rule"}
      </h2>

      <div className="grid gap-4 md:grid-cols-4">
        <div>
          <label htmlFor="rule-field" className="mb-1 block text-sm font-medium text-gray-700">
            If
          </label>
          <select id="rule-field" value={field} onChange={handleFieldChange} className={inputClasses}>
            {FIELD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="rule-condition" className="mb-1 block text-sm font-medium text-gray-700">
            Condition
          </label>
          <select
            id="rule-condition"
            value={condition}
            onChange={(event) => setCondition(event.target.value)}
            className={inputClasses}
          >
            {fieldInfo.conditions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="rule-value" className="mb-1 block text-sm font-medium text-gray-700">
            Value
          </label>
          <input
            id="rule-value"
            type={fieldInfo.inputType}
            min={fieldInfo.inputType === "number" ? 1 : undefined}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={fieldInfo.placeholder}
            autoComplete="off"
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="rule-destination" className="mb-1 block text-sm font-medium text-gray-700">
            Then move to folder
          </label>
          <input
            id="rule-destination"
            type="text"
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
            placeholder="e.g. /Documents/PDFs"
            autoComplete="off"
            className={inputClasses}
          />
        </div>
      </div>

      {/* A live sentence that updates as you type, so you can see the rule you are building. */}
      <p className="mt-4 text-sm text-gray-500" data-testid="rule-preview">
        Preview: If {describeCondition({ field, condition, value })} → move to{" "}
        {destination.trim() === "" ? "…" : destination.trim()}
      </p>

      {error && (
        <p role="alert" className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-4 flex gap-3">
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isEditing ? "Save changes" : "Add rule"}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

export default RuleForm
