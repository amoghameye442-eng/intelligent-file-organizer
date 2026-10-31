// MOCK API for the Dashboard Home view.
//
// There is no real backend connected yet, and the REST API contract (endpoint
// names, request/response shapes) has NOT been agreed. So no URLs are invented
// here. These three functions just return the mock data after a short delay,
// the same way a real network call would (a Promise that resolves later).
//
// When the real API exists, ONLY this file changes: each function will call
// the real endpoint and return its JSON. Dashboard.jsx and the components
// keep working because they only ever call these three functions.

import {
  mockStorageSummary,
  mockLargestFiles,
  mockRecentActivity,
} from "../mock/dashboardData"

// Pretends to be a slow network: gives back `data` after `ms` milliseconds.
function fakeDelay(data, ms = 500) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), ms)
  })
}

export function getStorageSummary() {
  return fakeDelay(mockStorageSummary)
}

export function getLargestFiles() {
  return fakeDelay(mockLargestFiles)
}

export function getRecentActivity() {
  return fakeDelay(mockRecentActivity)
}
