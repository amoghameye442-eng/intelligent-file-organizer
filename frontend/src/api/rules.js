// MOCK API for the Rules view.
//
// There is no real backend connected yet, and the REST API contract (endpoint
// names, request/response shapes) has NOT been agreed. So no URLs are invented
// here. These functions keep the rules in a variable in memory and answer after
// a short delay, like a real network call would.
//
// IMPORTANT: because the rules live only in memory, any change is lost when you
// refresh the browser page. That is expected for a mock.
//
// The contract the page relies on (PROPOSED, to agree with Amogh):
//   getRules()                    -> Promise of the full list of rules, in priority order
//   createRule(rule)              -> Promise of the full list (new rule added at the END)
//   updateRule(id, rule)          -> Promise of the full list
//   deleteRule(id)                -> Promise of the full list
//   moveRule(id, "up" | "down")   -> Promise of the full list (priority changed)
// A rule is { id, field, condition, value, destination } - see utils/ruleHelpers.js.
//
// When the real API exists, ONLY this file changes: each function will call the
// real endpoint. Rules.jsx and the components keep working unchanged.

import { mockRules } from "../mock/rulesData"

// The "server-side" copy of the rules. We copy each object so editing here
// never changes the original mock data.
let rules = mockRules.map((rule) => ({ ...rule }))
let nextId = Math.max(...rules.map((rule) => rule.id)) + 1

// Waits `ms` milliseconds (the fake network), then runs `change` and answers
// with a fresh copy of the whole list.
function respond(change, ms = 300) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        if (change) change()
        resolve(rules.map((rule) => ({ ...rule })))
      } catch (err) {
        reject(err)
      }
    }, ms)
  })
}

export function getRules() {
  return respond()
}

export function createRule(newRule) {
  return respond(() => {
    rules.push({ ...newRule, id: nextId++ })
  })
}

export function updateRule(id, changes) {
  return respond(() => {
    const index = rules.findIndex((rule) => rule.id === id)
    if (index === -1) throw new Error(`Rule ${id} not found`)
    rules[index] = { ...changes, id }
  })
}

export function deleteRule(id) {
  return respond(() => {
    rules = rules.filter((rule) => rule.id !== id)
  })
}

export function moveRule(id, direction) {
  return respond(() => {
    const index = rules.findIndex((rule) => rule.id === id)
    if (index === -1) throw new Error(`Rule ${id} not found`)

    const target = direction === "up" ? index - 1 : index + 1
    if (target < 0 || target >= rules.length) return // already at the edge

    // Swap the two neighbours.
    const moving = rules[index]
    rules[index] = rules[target]
    rules[target] = moving
  })
}
