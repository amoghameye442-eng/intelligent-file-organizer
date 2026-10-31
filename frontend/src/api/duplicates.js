import { apiRequest } from "./client";

export function getDuplicateGroups() {
  return apiRequest("/api/duplicates");
}

export function markForRemoval(paths) {
  if (!Array.isArray(paths) || paths.length === 0) {
    return Promise.reject(new Error("markForRemoval needs a list of paths"));
  }
  return apiRequest("/api/duplicates/remove", {
    method: "POST",
    body: JSON.stringify({ paths }),
  });
}
