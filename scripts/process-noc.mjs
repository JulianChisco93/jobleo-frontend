/**
 * NOC 2021 CSV → JSON processor
 * Run once: node scripts/process-noc.mjs
 * Output: lib/noc-data.json
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const csvPath = join(root, "noc_2021_version_1.0_-_elements.csv");
const outPath = join(root, "lib", "noc-data.json");

// Simple but robust CSV parser that handles quoted fields with commas/newlines
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        row.push(field);
        field = "";
      } else if (ch === "\r" && next === "\n") {
        row.push(field);
        field = "";
        rows.push(row);
        row = [];
        i++;
      } else if (ch === "\n") {
        row.push(field);
        field = "";
        rows.push(row);
        row = [];
      } else {
        field += ch;
      }
    }
  }
  // last field / row
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

console.log("Reading CSV...");
const raw = readFileSync(csvPath, "utf8");

console.log("Parsing CSV...");
const [header, ...dataRows] = parseCSV(raw);

// Find column indices
const COL_CODE  = header.findIndex(h => h.includes("Code"));
const COL_TITLE = header.findIndex(h => h.includes("Class title"));
const COL_TYPE  = header.findIndex(h => h.includes("Element Type Label English"));
const COL_DESC  = header.findIndex(h => h.includes("Element Description English"));

console.log(`Columns → code:${COL_CODE} title:${COL_TITLE} type:${COL_TYPE} desc:${COL_DESC}`);

const EXAMPLE_TYPES = new Set(["All examples"]);

// Group by code
const map = new Map();

for (const row of dataRows) {
  if (row.length < 5) continue;

  const type = row[COL_TYPE]?.trim();
  if (!EXAMPLE_TYPES.has(type)) continue;

  const code  = row[COL_CODE]?.trim();
  const title = row[COL_TITLE]?.trim();
  const desc  = row[COL_DESC]?.trim();

  if (!code || !title || !desc) continue;

  if (!map.has(code)) {
    // examplesMap: lowercase key → original-cased value (case-insensitive dedup, preserve casing)
    map.set(code, { code, title, examplesMap: new Map() });
  }

  // Each CSV row is one individual example title — preserve original casing
  const example = desc.trim();
  const key = example.toLowerCase();
  if (example && !map.get(code).examplesMap.has(key)) {
    map.get(code).examplesMap.set(key, example);
  }
}

// Convert to array, sort by title, drop the Map
const result = Array.from(map.values())
  .map(({ code, title, examplesMap }) => ({
    code,
    title,
    examples: Array.from(examplesMap.values()).sort((a, b) => a.localeCompare(b)),
  }))
  .filter(entry => entry.examples.length > 0)
  .sort((a, b) => a.title.localeCompare(b.title));

console.log(`Processed ${result.length} occupations with examples`);

writeFileSync(outPath, JSON.stringify(result, null, 2), "utf8");
console.log(`Written → ${outPath}`);
