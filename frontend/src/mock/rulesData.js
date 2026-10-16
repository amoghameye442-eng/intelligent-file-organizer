// MOCK DATA - sample automation rules for the Rules view.
// None of this comes from the C++ engine's rules engine. The shape is PROPOSED
// (see utils/ruleHelpers.js); agree on the real one with Amogh.
//
// ORDER MATTERS: the list is in priority order. The first rule that matches a
// file wins. Notice that "invoice_march.pdf" matches rule 1 (name starts with
// "invoice") AND rule 4 (extension is .pdf). Rule 1 comes first, so it wins.
// These rules are consistent with the moves shown in the Dashboard activity feed.

export const mockRules = [
  { id: 1, field: "name", condition: "startsWith", value: "invoice", destination: "/Documents/Invoices" },
  { id: 2, field: "name", condition: "startsWith", value: "lecture", destination: "/Documents/College" },
  { id: 3, field: "extension", condition: "is", value: "jpg", destination: "/Pictures/2026" },
  { id: 4, field: "extension", condition: "is", value: "pdf", destination: "/Documents/PDFs" },
  { id: 5, field: "extension", condition: "is", value: "mp3", destination: "/Music" },
  { id: 6, field: "date", condition: "olderThan", value: 90, destination: "/Archive" },
]
