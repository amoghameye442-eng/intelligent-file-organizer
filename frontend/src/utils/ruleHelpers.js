// Everything the Rules view needs to know about what a rule can look like.
// The builder form and the rules list both import from here, so they always agree.
//
// A rule is an object: { id, field, condition, value, destination }
//   field        "extension" | "name" | "date"
//   condition    depends on the field (see FIELD_OPTIONS below)
//   value        text for extension/name, a number of DAYS for date
//   destination  the folder matching files get moved to
//
// This shape is PROPOSED, not agreed. tasks.md only says
// "if [extension/name/date] [condition] then move to [folder]".
// Confirm the real format with Amogh when the REST API contract is written.

export const FIELD_OPTIONS = [
  {
    value: "extension",
    label: "Extension",
    inputType: "text",
    placeholder: "e.g. pdf",
    conditions: [{ value: "is", label: "is" }],
  },
  {
    value: "name",
    label: "File name",
    inputType: "text",
    placeholder: "e.g. invoice",
    conditions: [
      { value: "startsWith", label: "starts with" },
      { value: "contains", label: "contains" },
      { value: "endsWith", label: "ends with" },
    ],
  },
  {
    value: "date",
    label: "Modified date",
    inputType: "number",
    placeholder: "days, e.g. 90",
    conditions: [
      { value: "olderThan", label: "is older than" },
      { value: "newerThan", label: "is newer than" },
    ],
  },
]

export function getField(fieldValue) {
  return FIELD_OPTIONS.find((field) => field.value === fieldValue)
}

// Turns a rule (or half-filled form values) into readable text.
// Example: { field: "extension", condition: "is", value: "pdf" } -> "extension is .pdf"
export function describeCondition({ field, condition, value }) {
  const fieldInfo = getField(field)
  // If the backend ever sends a field we don't know, show it plainly instead of crashing.
  if (!fieldInfo) return `${field} ${condition} ${value}`

  const conditionInfo = fieldInfo.conditions.find((c) => c.value === condition)
  const conditionText = conditionInfo ? conditionInfo.label : condition

  const shown = String(value ?? "").trim()
  let valueText = "…" // nothing typed yet
  if (shown !== "") {
    if (field === "extension") {
      // Lowercase, because buildRule() saves extensions in lowercase: the preview
      // must show what will actually be saved.
      valueText = `.${shown.replace(/^\.+/, "").toLowerCase()}`
    } else if (field === "date") {
      valueText = `${shown} ${Number(shown) === 1 ? "day" : "days"}`
    } else {
      valueText = `"${shown}"`
    }
  }

  return `${fieldInfo.label.toLowerCase()} ${conditionText} ${valueText}`
}

// Checks what the person typed and, if it is fine, builds the clean rule object.
// Returns { error: "message" } or { rule: { field, condition, value, destination } }.
export function buildRule({ field, condition, value, destination }) {
  const cleanValue = value.trim()
  const cleanDestination = destination.trim()

  if (cleanValue === "") {
    return { error: "Please fill in the value for the condition." }
  }

  let finalValue = cleanValue

  if (field === "extension") {
    // "  .PDF " -> "pdf"
    finalValue = cleanValue.replace(/^\.+/, "").toLowerCase()
    if (!/^[a-z0-9][a-z0-9.]*$/.test(finalValue)) {
      return {
        error: "An extension can only have letters, numbers and dots, like pdf or tar.gz.",
      }
    }
  } else if (field === "name") {
    if (cleanValue.includes("/") || cleanValue.includes("\\")) {
      return { error: "A file name cannot contain / or \\." }
    }
  } else if (field === "date") {
    if (!/^\d+$/.test(cleanValue) || Number(cleanValue) < 1) {
      return { error: "Enter a whole number of days (1 or more)." }
    }
    finalValue = Number(cleanValue)
  }

  if (cleanDestination === "") {
    return { error: "Please enter the folder to move matching files to." }
  }

  return {
    rule: { field, condition, value: finalValue, destination: cleanDestination },
  }
}
