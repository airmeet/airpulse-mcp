#!/usr/bin/env node
// Dependency-free plugin checks: manifest JSON and versions, skill frontmatter,
// relative links, and no references to the removed local package.
import {readFileSync, readdirSync, existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {dirname, join} from 'node:path';

const problems = [];
const fail = (msg) => problems.push(msg);
const tracked = execFileSync('git', ['ls-files'], {encoding: 'utf8'}).split('\n').filter(Boolean);

const json = {};
for (const file of tracked.filter((f) => f.endsWith('.json'))) {
  try { json[file] = JSON.parse(readFileSync(file, 'utf8')); } catch (e) { fail(`${file}: invalid JSON (${e.message})`); }
}

const claude = json['.claude-plugin/plugin.json'];
const codex = json['.codex-plugin/plugin.json'];
const market = json['.claude-plugin/marketplace.json'];
const mcp = json['.mcp.json'];
if (claude && codex) {
  if (claude.name !== codex.name) fail('Claude and Codex manifests have different names.');
  if (claude.version !== codex.version) fail(`Manifest versions differ: ${claude.version} vs ${codex.version}.`);
  if (!readFileSync('CHANGELOG.md', 'utf8').includes(`## ${claude.version}`)) fail(`CHANGELOG.md has no ${claude.version} entry.`);
}
const cursor = json['.cursor-plugin/plugin.json'];
const registry = json['server.json'];
if (claude && cursor) {
  if (cursor.name !== claude.name) fail('Cursor and Claude manifests have different names.');
  if (cursor.version !== claude.version) fail(`Cursor manifest version ${cursor.version} differs from ${claude.version}.`);
}
if (claude && registry) {
  if (registry.version !== claude.version) fail(`server.json version ${registry.version} differs from ${claude.version}.`);
  if (registry.name !== 'ai.airpulse/airpulse') fail('server.json name must be ai.airpulse/airpulse (DNS-verified namespace).');
  if ((registry.description ?? '').length > 100) fail('server.json description must be at most 100 characters.');
  const remote = registry.remotes?.[0];
  if (!remote || remote.type !== 'streamable-http' || remote.url !== 'https://prod-api.airpulse.ai/mcp') fail('server.json must list the prod streamable-http remote.');
}
if (market && claude && !market.plugins?.some((p) => p.name === claude.name)) fail('marketplace.json does not list the plugin.');
const server = mcp?.mcpServers?.airpulse;
if (!server || server.type !== 'http' || server.url !== 'https://prod-api.airpulse.ai/mcp') fail('.mcp.json must be the prod remote HTTP entry.');
if (server?.headers) fail('.mcp.json must not set headers; OAuth runs on connect.');

const skillDirs = readdirSync('skills', {withFileTypes: true}).filter((d) => d.isDirectory()).map((d) => d.name);
for (const dir of skillDirs) {
  const file = join('skills', dir, 'SKILL.md');
  if (!existsSync(file)) { fail(`${file}: missing`); continue; }
  const text = readFileSync(file, 'utf8');
  const front = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!front) { fail(`${file}: missing frontmatter`); continue; }
  const fields = Object.fromEntries(front[1].split('\n').map((l) => l.match(/^([a-z_-]+):\s*(.*)$/)).filter(Boolean).map((m) => [m[1], m[2].trim()]));
  if (fields.name !== dir) fail(`${file}: name "${fields.name}" must match directory "${dir}"`);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(fields.name ?? '') || fields.name.length > 64) fail(`${file}: name must be kebab-case, at most 64 characters`);
  if (!fields.description || fields.description.length > 1024) fail(`${file}: description must be 1–1024 characters`);
  for (const [, target] of text.matchAll(/\]\(([^)#\s]+)\)/g)) {
    if (!/^[a-z]+:/.test(target) && !existsSync(join(dirname(file), target))) fail(`${file}: broken link ${target}`);
  }
  const cases = json[join('skills', dir, 'references', 'evaluation-cases.json')];
  if (!cases?.cases?.length) fail(`${file}: references/evaluation-cases.json missing or empty`);
  for (const c of cases?.cases ?? []) if (!c.id || !c.prompt || !c.reviewer_checks?.length) fail(`${dir}: evaluation case ${c.id ?? '?'} lacks id, prompt or reviewer_checks`);
}

const forbidden = /npx|@airpulse\/mcp|bridge|dist\/airpulse/i;
for (const file of tracked.filter((f) => f !== 'scripts/check-plugin.mjs')) {
  readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    if (forbidden.test(line)) fail(`${file}:${i + 1}: references the removed local package`);
  });
}

if (problems.length) { console.error(problems.map((p) => `✗ ${p}`).join('\n')); process.exit(1); }
console.log(`✓ ${Object.keys(json).length} JSON files, ${skillDirs.length} skills, manifests at ${claude?.version}`);
