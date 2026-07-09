# fork-it

## 找到它。Fork它。把它变成你的。

[English](./README.md)

---

## 目录

- [核心理念](#-核心理念)
- [这是什么？](#-这是什么)
- [快速开始](#-快速开始)
- [使用方法](#-使用方法)
- [工作原理](#-工作原理)
- [技术栈](#-技术栈)
- [为什么选择 fork-it？](#-为什么选择-fork-it)
- [贡献指南](#-贡献指南)
- [许可证](#-许可证)

---

## 核心理念

> [!IMPORTANT]
> 每个好项目都从某个起点开始。既然已经有了 80%，为什么要从零开始？

有了新想法？在敲第一行代码之前，先去 GitHub 搜一下。大概率已经有一个项目实现了你想要的七八成。**Fork 它。** 现在它是你的了。拆它、改它、注入你的想法——不需要 PR，不需要等待，不需要任何人点头。这就是开源的魅力。

你不是在"重复造轮子"。你是站巨人的肩膀上，去够更高的地方。

---

## 这是什么？

fork-it 是一个 **AI 助手技能（Skill）**，帮你在 GitHub 上找到最适合作为起点的开源项目——Fork 下来，然后改造成你自己的作品。

### 它做什么

| 步骤 | 描述 |
|------|------|
| **搜索** | 为你的想法找到最相关的开源项目 |
| **分析** | 检查活跃度、社区健康度、匹配程度 |
| **Fork & 开干** | 推荐最适合 Fork 的项目，没有附加条件 |

---

## 快速开始

### 安装

fork-it 是一个**纯 SKILL.md 技能**——标准 Markdown 定义 + 共享 Node 脚本，不绑定任何单一平台。凡是从 `skills/` 目录加载技能的 AI 编码 agent 都能用，一份包即可装遍整个生态。

#### 支持的 Agent

| Agent | Skills 目录 |
|-------|------------|
| 通用（`AGENTS.md`） | `~/.agents/skills/fork-it` |
| OpenAI Codex | `~/.codex/skills/fork-it` |
| Cursor | `~/.cursor/skills/fork-it` |
| Claude Code | `~/.claude/skills/fork-it` |
| OpenCode | `~/.opencode/skills/fork-it` |
| Trae | `~/.trae/skills/fork-it` |
| Pi | `~/.pi/skills/fork-it` |
| Qoder | `~/.qoder/skills/fork-it` |
| CodeBuddy | `~/.codebuddy/skills/fork-it` |

> 大多数 agent 也支持**项目级**技能：`<你的项目>/.<agent>/skills/fork-it`。

#### 方式 A — 一行命令安装（推荐）

最快捷的方式——无需克隆仓库：

```bash
# 直接从 npm 运行（自动装进每个已探测到的 agent）
npx @gdwhisper/fork-it

# 或从 GitHub 仓库直接运行，无需先发到 npm
npx github:GDWhisper/fork-it
```

两条命令都会自动探测你已安装的所有 agent，并把 `fork-it` 铺进每个 agent 的 `skills/` 目录。可用参数：

```bash
npx @gdwhisper/fork-it --all       # 装进所有已知 agent 目录（不存在则创建）
npx @gdwhisper/fork-it --project   # 装到当前项目而非 home 目录
npx @gdwhisper/fork-it --list      # 仅查看探测到哪些 agent
```

喜欢本地克隆？仓库自带跨平台安装器 `install.mjs`，并配了 `install.sh` / `install.ps1` 薄包装：

```bash
# 在克隆目录下
./install.sh                 # 或：node install.mjs
./install.sh --all           # 或：node install.mjs --all
./install.sh --project       # 或：node install.mjs --project
./install.sh --list          # 或：node install.mjs --list
```

#### 方式 B — 手动安装

从 [Release](https://github.com/GDWhisper/fork-it/releases) 下载最新包，解压后把 `fork-it/` 文件夹复制到上表任意 agent 的 `skills/` 目录：

| 文件 |
|------|
| `fork-it.skill` |

> `.skill` 文件就是普通 zip 压缩包——里面是可直接使用的 `fork-it/` 文件夹（`SKILL.md` + `scripts/`）。

> **同时支持 ClawHub：** 包内带 `_meta.json`，可通过 ClawHub 注册表发布/安装（见项目级技能 `.agents/skills/clawhub-publish/`）。

### 配置 GitHub Token（推荐）

> [!TIP]
> 配置个人访问令牌后，请求上限从每小时 60 次提升到 5000 次：

```bash
export GITHUB_TOKEN="ghp_your_token_here"
```

| 限制类型 | 请求次数/小时 |
|----------|---------------|
| 未认证 | 60 |
| 已认证 | 5,000 |

---

## 使用方法

### 如何触发

向你的 AI agent 自然地表达想法，fork-it 会自动识别：

- "我想做一个..." / "I want to build a..."
- "我在考虑开发..." / "I'm thinking of making..."
- "有没有人做过类似的..." / "Has anyone built something like..."
- 或者直接调用：`/fork-it`

### 使用示例

> **输入：**
> ```
> 我想做一个 Windows 缓存自动清理工具
> ```

> **输出：**
> ```
> 这里有几个不错的起点，Fork 下来就能开始改造：
>
> 搜索结果
>
> | 项目 | Stars | 语言 | 你能拿到什么 |
> |------|-------|------|-------------|
> | BleachBit | 4.7k | Python | 全功能跨平台清理器，Fork 后加自己的规则 |
> | Winapp2 | 905 | VB.NET | 丰富的清理规则库，Fork 来当规则引擎 |
> | WindowsCleanerUtility | 105 | Batch | 极简脚本，想要轻量起点就 Fork 它 |
>
> BleachBit 给了你最完整的基础。Fork 它，删掉不需要的部分，
> 在上面搭建你自己的清理工具。
> ```

---

## 工作原理

### 什么时候 fork-it 会介入

当你在酝酿一个新项目想法——而不是在修 Bug、学习、或者问某个具体函数用法的时候。

**适合触发 fork-it 的场景：**
- "我想做一个聊天应用..."
- "我想写一个 Markdown 编辑器..."
- "我想搭一个定时任务调度系统..."

**fork-it 保持安静的场景：**
- 你正在调试现有代码
- 你正在学习某个原理
- 你在问某个具体算法或正则
- 你在修改已有项目

### 决策指南

| 匹配 | 路径 | 含义 |
|------|------|------|
| 高度 | **Fork & 定制** | 项目基本满足需求，Fork 下来微调即可 |
| 部分 | **Fork & 扩展** | 核心不错但缺你想要的功能，Fork 后加上 |
| 参考 | **学习 & 自建** | 方向差异较大，借鉴思路后自己动手 |
| 没有 | **从零开始** | 你在做新东西，放手去建——别忘了开源出来！ |

### 输出格式

脚本返回统一的 JSON 结构：

```json
{
  "status": "ok",
  "query": "番茄钟",
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

**AI 展示规则**（始终用用户使用的语言回复——脚本输出与语言无关）：

| 字段 | 规则 |
|------|------|
| `pushed_days_ago: 3` | AI 转换成 "3天前" / "3 days ago" |
| `stars: 12300` | AI 格式化 "12.3k" |
| `status: "error"` | AI 根据 `code` 和 `message` 生成友好的错误提示 |
| 仓库数据 | AI 把 `description` 与解说翻译成用户语言 |

---

## 技术栈

| 组件 | 技术 |
|------|------|
| 语言 | JavaScript (ES Modules) |
| API | GitHub Search API v3, GitHub REST API |
| 运行时 | Node.js |

---

## 为什么选择 fork-it？

| 收益 | 描述 |
|------|------|
| **跳板启动** | 从能跑的代码开始，而不是空白文件 |
| **完全掌控** | Fork 下来就是你的——不需要 PR，不需要等审批 |
| **边看边学** | 即使不 Fork，读一读真实项目的代码也学得快 |
| **更快交付** | 把时间花在你的独特想法上，而不是别人写过的样板代码 |

---

## 贡献指南

欢迎所有形式的贡献：

| 方向 | 描述 |
|------|------|
| 修复 Bug | 修复问题，提高稳定性 |
| 添加新功能 | 增加新能力 |
| 完善文档 | 改进文档和示例 |
| 改进翻译 | 增强双语支持 |

---

## 许可证

本项目采用 **MIT 许可证** - 查看 [LICENSE](LICENSE) 文件了解详情

---

<div align="center">

**Made with love by [GDWhisper](https://github.com/GDWhisper)**

如果 fork-it 帮你更快启动项目，给我们一个 Star！

</div>
