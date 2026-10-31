import { apiRequest } from "./client";

export function getRules() {
  return apiRequest("/api/rules");
}

export function createRule(newRule) {
  return apiRequest("/api/rules", {
    method: "POST",
    body: JSON.stringify(newRule),
  });
}

export function updateRule(id, changes) {
  return apiRequest(`/api/rules/${id}`, {
    method: "PUT",
    body: JSON.stringify(changes),
  });
}

export function deleteRule(id) {
  return apiRequest(`/api/rules/${id}`, {
    method: "DELETE",
  });
}

export function moveRule(id, direction) {
  return apiRequest(`/api/rules/${id}/move`, {
    method: "POST",
    body: JSON.stringify({ direction }),
  });
}
