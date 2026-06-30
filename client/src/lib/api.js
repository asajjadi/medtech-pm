const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  getItems: (projectId) => request(projectId ? `/items?projectId=${encodeURIComponent(projectId)}` : "/items"),
  createItem: (item) => request("/items", { method: "POST", body: JSON.stringify(item) }),
  getProjects: () => request("/projects"),
  createProject: (name) => request("/projects", { method: "POST", body: JSON.stringify({ name }) }),
  renameProject: (id, name) => request(`/projects/${id}`, { method: "PATCH", body: JSON.stringify({ name }) }),
  updateItem: (id, patch) =>
    request(`/items/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
  deleteItem: (id) => request(`/items/${id}`, { method: "DELETE" }),
  generate: (prompt) =>
    request("/ai/generate", { method: "POST", body: JSON.stringify({ prompt }) }),
  analyze: () => request("/ai/analyze", { method: "POST" }),
  coach: (question) => request("/ai/coach", { method: "POST", body: JSON.stringify({ question }) }),
};
