/**
 * R-10. Refresh GitHub star counts in src/data/entries.json.
 *
 * Run with `npm run refresh-stars`. Entries whose lookup fails keep the numbers they
 * already have, so a flaky network can never silently zero the data. Set GITHUB_TOKEN
 * to raise the anonymous rate limit.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

// URL.pathname keeps non-ASCII path segments percent-encoded; fileURLToPath does not.
const here = dirname(fileURLToPath(import.meta.url));
export const DATA_PATH = resolve(here, '..', 'src', 'data', 'entries.json');

const GITHUB_REPO_PATTERN = /^https?:\/\/(?:www\.)?github\.com\/([^/]+)\/([^/#?]+)/i;

/** `owner/repo` for a GitHub repository URL, or null for anything else. */
export function parseRepo(url) {
  if (typeof url !== 'string') return null;
  const m = GITHUB_REPO_PATTERN.exec(url);
  if (!m) return null;
  const owner = m[1];
  const repo = m[2].replace(/\.git$/i, '');
  if (!owner || !repo) return null;
  return `${owner}/${repo}`;
}

/**
 * Merge freshly fetched counts into the entries.
 *
 * @param entries the parsed entries.json array
 * @param counts Map of `owner/repo` -> star count. A repo missing from the map, or
 *   mapped to a non-number, leaves that entry exactly as it was.
 * @param today YYYY-MM-DD written to `starsUpdatedAt` for the entries that changed
 */
export function applyStars(entries, counts, today) {
  let updated = 0;
  const out = entries.map((entry) => {
    const repo = parseRepo(entry.repoUrl);
    if (!repo) return entry;
    const stars = counts.get(repo);
    if (typeof stars !== 'number' || !Number.isFinite(stars) || stars < 0) return entry;
    if (entry.stars === stars && entry.starsUpdatedAt === today) return entry;
    updated += 1;
    return { ...entry, stars: Math.trunc(stars), starsUpdatedAt: today };
  });
  return { entries: out, updated };
}

async function fetchStars(repos) {
  const counts = new Map();
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'jev-hub-refresh-stars' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  for (const repo of repos) {
    try {
      const res = await fetch(`https://api.github.com/repos/${repo}`, { headers });
      if (!res.ok) {
        console.warn(`skip ${repo}: HTTP ${res.status}`);
        continue;
      }
      const body = await res.json();
      if (typeof body.stargazers_count === 'number') counts.set(repo, body.stargazers_count);
    } catch (error) {
      console.warn(`skip ${repo}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  return counts;
}

async function main() {
  const raw = await readFile(DATA_PATH, 'utf8');
  const entries = JSON.parse(raw);
  const repos = [...new Set(entries.map((e) => parseRepo(e.repoUrl)).filter(Boolean))];
  if (repos.length === 0) {
    console.log('no GitHub repositories to refresh');
    return;
  }
  const counts = await fetchStars(repos);
  const today = new Date().toISOString().slice(0, 10);
  const { entries: next, updated } = applyStars(entries, counts, today);
  if (updated === 0) {
    console.log(`checked ${repos.length} repositories, nothing to change`);
    return;
  }
  await writeFile(DATA_PATH, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
  console.log(`updated ${updated} of ${repos.length} repositories`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
