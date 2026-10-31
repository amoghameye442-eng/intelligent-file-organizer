import { apiRequest } from "./client";

export function searchFiles(prefix) {
  if (!prefix || !prefix.trim()) {
    return Promise.resolve([]);
  }
  return apiRequest(`/api/search?q=${encodeURIComponent(prefix.trim())}`);
}
