#!/usr/bin/env node
// fork-it universal installer (cross-platform, single source of truth)
//
// Replaces install.sh / install.ps1. Installs the fork-it skill into the
// skills/ directory of every mainstream AI coding agent detected on this
// machine. The skill is a single language-neutral SKILL.md (instructions for
// the AI); results are presented in the user's own language, so no --lang.
//
// Usage:
//   node install.mjs                 install into detected agents (under $HOME)
//   node install.mjs --all           install into ALL known agent dirs (create if missing)
//   node install.mjs --project       install into the current project (./.<agent>/skills) instead of $HOME
//   node install.mjs --list          only print which agents were detected, install nothing
//   node install.mjs --dry-run       print what would be installed, change nothing
//   node install.mjs --help          show this help
//
// Also exposed as the `fork-it` bin, so `npx @gdwhisper/fork-it` (or
// `npx github:GDWhisper/fork-it`) runs this installer directly.

import { existsSync, mkdirSync, rmSync, cpSync, readdirSync, mkdtempSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;

// Directory prefixes (without leading dot) for every supported agent.
const AGENTS = ['agents', 'codex', 'cursor', 'claude', 'opencode', 'trae', 'pi', 'qoder', 'codebuddy'];

const opts = { all: false, project: false, list: false, dryRun: false, help: false };
for (const arg of process.argv.slice(2)) {
  if (arg === '--all') opts.all = true;
  else if (arg === '--project') opts.project = true;
  else if (arg === '--list') opts.list = true;
  else if (arg === '--dry-run') opts.dryRun = true;
  else if (arg === '-h' || arg === '--help') opts.help = true;
  else {
    console.error(`Unknown option: ${arg}`);
    console.error("Run 'node install.mjs --help' for usage.");
    process.exit(1);
  }
}

const HELP = `fork-it installer

Installs the fork-it skill into the skills/ directory of every supported AI
coding agent.

Usage:
  node install.mjs                 install into detected agents (under $HOME)
  node install.mjs --all           install into ALL known agent dirs
  node install.mjs --project       install into the current project instead of $HOME
  node install.mjs --list          only show which agents were detected
  node install.mjs --dry-run       show what would be installed, change nothing
  node install.mjs --help          show this help

Supported agents: ${AGENTS.map((a) => '.' + a).join(', ')}
Project-level install target: .<agent>/skills/fork-it  (in the current dir)`;

if (opts.help) {
  console.log(HELP);
  process.exit(0);
}

const SRC_SKILL = join(ROOT, 'fork-it', 'SKILL.md');
const SRC_META = join(ROOT, '_meta.json');
const SRC_SCRIPTS = join(ROOT, 'scripts');
const SRC_REFS = join(ROOT, 'fork-it', 'references');

for (const p of [SRC_SKILL, SRC_META, SRC_SCRIPTS]) {
  if (!existsSync(p)) {
    console.error(`Error: missing source: ${p}`);
    process.exit(1);
  }
}

const BASE = opts.project ? process.cwd() : homedir();

console.log('fork-it installer');
console.log(`  scope : ${opts.project ? 'project' : 'user'} (${BASE})`);
console.log(`  mode  : ${opts.all ? 'all known agents' : 'detected agents only'}`);
console.log('');

// --list: just report detection and exit.
if (opts.list) {
  console.log(`Detected agents under ${BASE}:`);
  let found = 0;
  for (const a of AGENTS) {
    if (existsSync(join(BASE, '.' + a))) {
      console.log(`  + .${a}`);
      found++;
    }
  }
  if (!found) console.log('  (none)');
  process.exit(0);
}

// Build a staging fork-it/ folder that mirrors the released package layout.
const STAGE_ROOT = mkdtempSync(join(tmpdir(), 'fork-it-'));
const STAGE = join(STAGE_ROOT, 'fork-it');
mkdirSync(join(STAGE, 'scripts'), { recursive: true });
cpSync(SRC_SKILL, join(STAGE, 'SKILL.md'));
cpSync(SRC_META, join(STAGE, '_meta.json'));
for (const f of readdirSync(SRC_SCRIPTS)) {
  if (f.endsWith('.mjs')) cpSync(join(SRC_SCRIPTS, f), join(STAGE, 'scripts', f));
}
if (existsSync(SRC_REFS)) cpSync(SRC_REFS, join(STAGE, 'references'), { recursive: true });

let installed = 0;
for (const a of AGENTS) {
  const agentHome = join(BASE, '.' + a);
  if (opts.all || existsSync(agentHome)) {
    const dest = join(agentHome, 'skills', 'fork-it');
    if (opts.dryRun) {
      console.log(`  (dry-run) would install → ${dest}`);
      installed++;
      continue;
    }
    mkdirSync(join(agentHome, 'skills'), { recursive: true });
    rmSync(dest, { recursive: true, force: true });
    cpSync(STAGE, dest, { recursive: true });
    console.log(`  + installed → ${dest}`);
    installed++;
  }
}

// Clean up staging.
rmSync(STAGE_ROOT, { recursive: true, force: true });

console.log('');
if (!installed) {
  console.log(`No agents detected under ${BASE}.`);
  console.log('Tip: run with --all to install into all known agent dirs, or --project for the current project.');
} else {
  console.log(`Done. Installed fork-it into ${installed} agent(s).`);
}
