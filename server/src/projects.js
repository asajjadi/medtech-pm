import { readFile, writeFile, rename, access } from "fs/promises";
import { fileURLToPath } from "url";
import path from "path";
import { uid } from "./constants.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE = path.join(__dirname, "../data/projects.json");
const TMP = path.join(__dirname, "../data/projects.json.tmp");

export const DEFAULT_PROJECT_ID = "default";

let queue = Promise.resolve();
function withLock(fn) {
  const run = queue.then(fn, fn);
  queue = run.then(() => {}, () => {});
  return run;
}

async function read() {
  try {
    await access(FILE);
  } catch {
    // Seed with a default project so legacy items (no projectId) have a home.
    const seed = [{ id: DEFAULT_PROJECT_ID, name: "My first project", createdAt: new Date().toISOString() }];
    await writeFile(FILE, JSON.stringify(seed, null, 2));
    return seed;
  }
  const raw = await readFile(FILE, "utf-8");
  if (!raw.trim()) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function write(projects) {
  await writeFile(TMP, JSON.stringify(projects, null, 2));
  await rename(TMP, FILE);
  return projects;
}

export function getProjects() {
  return withLock(read);
}

export function addProject(name) {
  return withLock(async () => {
    const projects = await read();
    const project = { id: uid(), name: name || "Untitled project", createdAt: new Date().toISOString() };
    projects.push(project);
    await write(projects);
    return project;
  });
}

export function renameProject(id, name) {
  return withLock(async () => {
    const projects = await read();
    const p = projects.find((x) => x.id === id);
    if (!p) return null;
    p.name = name || p.name;
    await write(projects);
    return p;
  });
}
