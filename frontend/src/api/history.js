import { apiRequest } from "./client";

export function getHistory() {
  return apiRequest("/api/history");
}

export function undoAction(id) {
  return apiRequest(`/api/undo/${id}`, {
    method: "POST",
  });
}
