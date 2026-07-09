# fork-it

## Find it. Fork it. Make it yours.

[简体中文](./README_zh.md)

---

## Table of Contents

- [Core Philosophy](#-core-philosophy)
- [What is this?](#-what-is-this)
- [Quick Start](#-quick-start)
- [Usage](#-usage)
- [How It Works](#-how-it-works)
- [Tech Stack](#-tech-stack)
- [Why fork-it?](#-why-fork-it)
- [Contributing](#-contributing)
- [License](#-license)

---

## Core Philosophy

> [!IMPORTANT]
> Every great project starts somewhere. Why start from zero when you can start from 80%?

Got an idea? Before you type a single line of code, search GitHub first. There's probably a project that already does a big chunk of what you want. **Fork it.** Now it's yours. Tear it apart, reshape it, inject your own ideas — no PRs, no waiting, no asking permission. That's the beauty of open source.

You're not "reinventing the wheel." You're standing on it to reach higher.

---

## What is this?

fork-it is an **AI Assistant Skill** that helps you discover the best open-source starting points on GitHub — projects you can fork then customize into your own vision.

### What It Does

| Step | Description |
|------|-------------|
| **Search** | Finds the most relevant open-source projects for your idea |
| **Analyze** | Checks activity, community health, and how close the match is |
| **Fork & Go** | Points you to the best fork-worthy candidates, no strings attached |

---

## Quick Start

fork-it is a **plain SKILL.md skill** — a standard Markdown definition plus shared Node scripts. It works with any AI coding agent that loads skills from a `skills/` directory, so a single package installs across the whole ecosystem.

#### Supported agents

| Agent | Skills directory |
|-------|------------------|
| Universal (`AGENTS.md`) | `~/.agents/skills/fork-it` |
| OpenAI Codex | `~/.codex/skills/fork-it` |
| Cursor | `~/.cursor/skills/fork-it` |
| Claude Code | `~/.claude/skills/fork-it` |
| OpenCode | `~/.opencode/skills/fork-it` |
| Trae | `~/.trae/skills/fork-it` |
| Pi | `~/.pi/skills/fork-it` |
| Qoder | `~/.qoder/skills/fork-it` |
| CodeBuddy | `~/.codebuddy/skills/fork-it` |

> Most agents also accept **project-level** skills at `<your-project>/.<agent>/skills/fork-it`.

#### Option A — One-line installer (recommended)

The fastest way — no clone needed:

```bash
# Run directly from npm (installs into every detected agent)
npx @gdwhisper/fork-it

# Or run straight from the GitHub repo, no npm publish required
npx github:GDWhisper/fork-it
```

Both commands auto-detect every agent you have installed and drop `fork-it` into each one's `skills/` directory. Flags:

```bash
npx @gdwhisper/fork-it --all       # install into ALL known agent dirs (create if missing)
npx @gdwhisper/fork-it --project   # install into the current project instead of your home dir
npx @gdwhisper/fork-it --list      # just show which agents were detected
```

Prefer a local clone? The repo ships a cross-platform installer (`install.mjs`) with thin `install.sh` / `install.ps1` wrappers:

```bash
# from a clone
./install.sh                 # or:  node install.mjs
./install.sh --all           # or:  node install.mjs --all
./install.sh --project       # or:  node install.mjs --project
./install.sh --list          # or:  node install.mjs --list
```

#### Option B — Manual install

Download the latest package from [Release](https://github.com/GDWhisper/fork-it/releases), extract it, and copy the `fork-it/` folder into any agent's `skills/` directory from the table above.

| File |
|------|
| `fork-it.skill` |

> `.skill` files are plain zip archives — each contains a ready-to-use `fork-it/` folder (`SKILL.md` + `scripts/`).

> **Also on ClawHub:** the package ships `_meta.json`, so it can be published/installed via the ClawHub registry too (see the project-level `clawhub-publish` skill at `.agents/skills/clawhub-publish/`).

### Configure GitHub Token (Recommended)

> [!TIP]
> A personal access token gives you 5,000 requests/hour instead of 60:

```bash
export GITHUB_TOKEN="ghp_your_token_here"
```

| Rate Limit | Requests/hour |
|------------|---------------|
| Unauthenticated | 60 |
| Authenticated | 5,000 |

---

## Usage

### How to Trigger

Just describe your idea to your AI agent. fork-it picks up on it naturally:

- "I want to build a..." / 「我想做一个…」
- "I'm thinking of making..." / 「我在考虑开发…」
- "Has anyone built something like..." / 「有没有人做过类似的…」
- Or invoke directly: `/fork-it`

### Example

> **Input:**
> ```
> I want to build a Windows cache auto-cleanup tool
> ```

> **Output:**
> ```
> Here are some solid starting points you can fork and make your own:
>
> Results
>
> | Project | Stars | Language | What It Gives You |
> |---------|-------|----------|-------------------|
> | BleachBit | 4.7k | Python | Full-featured cross-platform cleaner, fork it and add your own rules |
> | Winapp2 | 905 | VB.NET | Rich cleaning rules database, fork it as your rule engine |
> | WindowsCleanerUtility | 105 | Batch | Minimal script, fork it if you want a lightweight starting point |
>
> BleachBit gives you the most complete foundation. Fork it, strip what you
> don't need, and build your own cleaner on top.
> ```

---

## How It Works

### When fork-it Chimes In

When you're forming a new project idea — not when you're fixing bugs, learning, or asking about specific functions.

**Good candidates for fork-it:**
- "I want to build a chat app..."
- "I want to create a markdown editor..."
- "I want to make a cron job scheduler..."

**fork-it stays quiet when:**
- You're debugging existing code
- You're learning how something works
- You're asking about a specific algorithm or regex
- You're modifying an existing project

### Decision Guide

| Match | Path | What This Means |
|-------|------|-----------------|
| Great | **Fork & Customize** | The project does most of what you need. Fork it, tweak it, ship it. |
| Partial | **Fork & Extend** | Core is solid but missing your feature. Fork it and add your piece. |
| Reference | **Learn, Then Build** | Different enough that forking isn't the shortcut. Study the approach. |
| None | **Build Fresh** | You're doing something new. Go build it — and consider open-sourcing it! |

### Output Format

Scripts return a unified JSON structure:

```json
{
  "status": "ok",
  "query": "pomodoro timer",
  "total_count": 1234,
  "returned_count": 10,
  "items": [
    {
      "rank": 1,
      "full_name": "user/repo",
      "description": "A pomodoro timer app",
      "url": "https://github.com/user/repo",
      "stars": 12300,
      "forks": 1200,
      "language": "TypeScript",
      "pushed_days_ago": 3,
      "created_at": "2024-01-01",
      "topics": ["productivity", "timer"],
      "license": "MIT"
    }
  ]
}
```

**AI Display Rules** (always reply in the user's language — the script output is language-neutral):

| Field | Rule |
|-------|------|
| `pushed_days_ago: 3` | AI converts to "3 days ago" / "3天前" |
| `stars: 12300` | AI formats as "12.3k" / "1.23万" |
| `status: "error"` | AI generates a friendly error message from `code` and `message` |
| repo data | AI translates `description` and commentary into the user's language |

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Language | JavaScript (ES Modules) |
| API | GitHub Search API v3, GitHub REST API |
| Runtime | Node.js |

---

## Why fork-it?

| Benefit | Description |
|---------|-------------|
| **Jump Start** | Start from a working codebase instead of a blank file |
| **Full Creative Control** | Fork it and it's yours — no PRs, no waiting, no gatekeepers |
| **Learn by Reading** | Even if you don't fork, studying real projects teaches you fast |
| **Ship Faster** | Spend time on YOUR ideas, not on boilerplate someone already wrote |

---

## Contributing

We welcome contributions of all kinds:

| Area | Description |
|------|-------------|
| Bug fixes | Fix issues and improve stability |
| New features | Add new capabilities |
| Documentation | Improve docs and examples |
| Translation | Enhance bilingual support |

---

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details

---

<div align="center">

**Made with love by [GDWhisper](https://github.com/GDWhisper)**

If fork-it helps you launch faster, give us a star!

</div>
