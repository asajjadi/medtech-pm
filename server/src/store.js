import { readFile, writeFile, rename, access } from "fs/promises";
import { fileURLToPath } from "url";
import path from "path";
import { appendAudit } from "./audit.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, "../data/items.json");
const TMP_FILE = path.join(__dirname, "../data/items.json.tmp");
const SEED_FILE = path.join(__dirname, "../data/items.seed.json");

// Serialize all store operations so concurrent requests can't interleave a
// read-modify-write cycle on the JSON file. Each operation queues behind the
// previous one. (A real database removes the need for this — see roadmap.)
let queue = Promise.resolve();
function withLock(fn) {
  const run = queue.then(fn, fn);
  queue = run.then(
    () => {},
    () => {}
  );
  return run;
}

async function ensureDataFile() {
  try {
    await access(DATA_FILE);
  } catch {
    const seed = await readFile(SEED_FILE, "utf-8");
    await writeFile(DATA_FILE, seed);
  }
}

// Internal read — tolerant of an empty/corrupt file (never throws on parse).
async function readItems() {
  await ensureDataFile();
  const raw = await readFile(DATA_FILE, "utf-8");
  if (!raw.trim()) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// Internal write — atomic: write a temp file then rename over the real one,
// so a reader never observes a partially written file.
async function writeItems(items) {
  await writeFile(TMP_FILE, JSON.stringify(items, null, 2));
  await rename(TMP_FILE, DATA_FILE);
  return items;
}

export function getItems() {
  return withLock(readItems);
}

export function saveItems(items) {
  return withLock(() => writeItems(items));
}

export function addItem(item, actor = "system") {
  return withLock(async () => {
    const items = await readItems();
    items.push(item);
    await writeItems(items);
    await appendAudit({ actor, action: "create", itemId: item.id, after: item });
    return item;
  });
}

export function updateItem(id, patch, actor = "system") {
  return withLock(async () => {
    const items = await readItems();
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return null;
    const before = items[idx];
    const after = { ...before, ...patch, id };
    items[idx] = after;
    await writeItems(items);
    await appendAudit({ actor, action: "update", itemId: id, before, after });
    return after;
  });
}

export function deleteItem(id, actor = "system") {
  return withLock(async () => {
    const items = await readItems();
    const before = items.find((i) => i.id === id) || null;
    const next = items.filter((i) => i.id !== id);
    const removed = next.length !== items.length;
    await writeItems(next);
    if (removed) await appendAudit({ actor, action: "delete", itemId: id, before });
    return removed;
  });
}
