import { apiRequest } from "./client";

export function getStorageSummary() {
  return apiRequest("/api/dashboard/summary");
}

export function getLargestFiles() {
  return apiRequest("/api/dashboard/largest");
}

export function getRecentActivity() {
  return apiRequest("/api/dashboard/activity");
}
