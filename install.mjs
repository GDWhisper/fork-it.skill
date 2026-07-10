#!/usr/bin/env node
// fork-it universal installer (cross-platform, single source of truth)
//
// Replaces install.sh / install.ps1. Installs the fork-it skill into the
// skills/ directory of supported AI coding agents.
//
// By default the installer is INTERACTIVE: it detects which supported agent
// config directories exist on this machine, shows them in a menu, and asks
// the user which ones to install into. Nothing is installed without consent.
//
// Non-interactive flags (for scripts / CI):
//   --all       install into ALL known agent dirs (create if missing)
//   --agents a,b install into the named agents only (e.g. agents,claude)
//   --yes       install into detected agents only, no prompt
//   --project   target the current project (./.<agent>/skills) instead of $HOME
//   --list      only print which agent dirs were detected, install nothing
//   --dry-run   print what would be installed, change nothing
//   --help      show this help
//
// Also exposed as the `fork-it` bin, so `npx @gdwhisper/fork-it` (or
// `npx github:GDWhisper/fork-it`) runs this installer directly.

import { existsSync, mkdirSync, rmSync, cpSync, readdirSync, mkdtempSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;

// Directory prefixes (without leading dot) for every supported agent.
const AGENTS = ['agents', 'codex', 'cursor', 'claude', 'opencode', 'trae', 'pi', 'qoder', 'codebuddy'];
const SUPPORTED = AGENTS.map((a) => '.' + a).join(', ');

// ----- argument parsing -----
const opts = { all: false, project: false, list: false, dryRun: false, help: false, yes: false, agents: null };
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  const arg = argv[i];
  if (arg === '--all') opts.all = true;
  else if (arg === '--project') opts.project = true;
  else if (arg === '--list') opts.list = true;
  else if (arg === '--dry-run') opts.dryRun = true;
  else if (arg === '-h' || arg === '--help') opts.help = true;
  else if (arg === '-y' || arg === '--yes') opts.yes = true;
  else if (arg === '--agents') opts.agents = argv[++i];
  else if (arg.startsWith('--agents=')) opts.agents = arg.slice('--agents='.length);
  else {
    console.error(`Unknown option: ${arg}`);
    console.error("Run 'node install.mjs --help' for usage.");
    process.exit(1);
  }
}

const HELP = `fork-it installer

Installs the fork-it skill into the skills/ directory of supported AI coding
agents. By default this is interactive: it lists the agent config directories
found on this machine and asks which ones to install into.

Usage:
  node install.mjs                 interactive: choose which agents to install
  node install.mjs --all           install into ALL known agent dirs
  node install.mjs --agents a,b    install into the named agents only
  node install.mjs --yes           install into detected agents only, no prompt
  node install.mjs --project       install into the current project instead of $HOME
  node install.mjs --list          only show which agent dirs were detected
  node install.mjs --dry-run       show what would be installed, change nothing
  node install.mjs --help          show this help

Supported agents: ${SUPPORTED}
User-level target : ~/<agent>/skills/fork-it
Project-level target: .<agent>/skills/fork-it  (in the current dir)`;

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

// ----- resolve which agents to install into -----
function ask(question) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (ans) => {
      rl.close();
      resolve(ans);
    });
  });
}

async function interactiveSelect() {
  const items = AGENTS.map((a) => {
    const agentHome = join(BASE, '.' + a);
    return { name: a, path: join(agentHome, 'skills', 'fork-it'), exists: existsSync(agentHome) };
  });
  console.log('Detected agent config directories on this machine:');
  items.forEach((it, i) => {
    const status = it.exists ? 'installed' : 'not installed';
    console.log(`  [${i + 1}] .${it.name.padEnd(10)} ${it.path}  (${status})`);
  });
  const ans = await ask(
    '\nInstall fork-it into which directories?\n' +
      '  Enter numbers separated by commas (e.g. 1,3,5), "all" for everything, or "q" to quit: '
  );
  const trimmed = ans.trim().toLowerCase();
  if (trimmed === 'q' || trimmed === 'quit') return [];
  if (trimmed === 'all') return items.map((_, i) => i);
  const idx = trimmed
    .split(/[,\s]+/)
    .map((s) => parseInt(s, 10) - 1)
    .filter((n) => Number.isInteger(n) && n >= 0 && n < items.length);
  if (!idx.length) {
    console.log('No valid selection. Aborting.');
    process.exit(1);
  }
  return idx;
}

function resolveSelection() {
  if (opts.all) return AGENTS.map((_, i) => i);
  if (opts.agents) {
    const names = opts.agents.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
    const idx = [];
    for (const n of names) {
      const i = AGENTS.indexOf(n);
      if (i === -1) {
        console.error(`Unknown agent: ${n}. Supported: ${SUPPORTED}`);
        process.exit(1);
      }
      idx.push(i);
    }
    return idx;
  }
  if (opts.yes) {
    return AGENTS.map((a, i) => (existsSync(join(BASE, '.' + a)) ? i : -1)).filter((i) => i >= 0);
  }
  if (!process.stdin.isTTY) {
    console.log('Interactive selection requires a terminal.');
    console.log('Re-run in a terminal, or use --all / --agents <csv> / --yes.');
    process.exit(0);
  }
  return interactiveSelect();
}

const sel = await resolveSelection();
if (!sel.length) {
  console.log('Nothing selected. Aborting.');
  process.exit(0);
}

const modeLabel = opts.all
  ? 'all known agents'
  : opts.agents
    ? 'specified agents (' + opts.agents + ')'
    : opts.yes
      ? 'detected agents only'
      : 'selected ' + sel.length + ' agent(s)';

console.log('fork-it installer');
console.log(`  scope : ${opts.project ? 'project' : 'user'} (${BASE})`);
console.log(`  mode  : ${modeLabel}`);
console.log('');

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
for (const i of sel) {
  const a = AGENTS[i];
  const agentHome = join(BASE, '.' + a);
  const dest = join(agentHome, 'skills', 'fork-it');
  if (opts.dryRun) {
    console.log(`  (dry-run) would install -> ${dest}`);
    installed++;
    continue;
  }
  mkdirSync(join(agentHome, 'skills'), { recursive: true });
  rmSync(dest, { recursive: true, force: true });
  cpSync(STAGE, dest, { recursive: true });
  console.log(`  + installed -> ${dest}`);
  installed++;
}

// Clean up staging.
rmSync(STAGE_ROOT, { recursive: true, force: true });

console.log('');
if (opts.dryRun) {
  console.log(`Dry run complete. Would install fork-it into ${installed} agent(s).`);
} else if (!installed) {
  console.log(`No agents installed under ${BASE}.`);
  console.log('Tip: run with --all to install into all known agent dirs, or --project for the current project.');
} else {
  console.log(`Done. Installed fork-it into ${installed} agent(s).`);
}
