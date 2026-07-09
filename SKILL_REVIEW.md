# fork-it Skill 审查报告

> 审查日期：2026-07-09 · 审查对象：`NoReinventWheel` 仓库（技能对外名与展示名均为 `fork-it`）
>
> 结论：**核心思路有价值，但工程成熟度低**，存在命名不一致、平台定位混乱、脚本安全隐患、i18n 实现与文档脱节、缺失许可证等问题。下面按优先级列出。

---

## 0. 一句话诊断：身份分裂

这个项目经历了一次 rebrand（git：`rebrand to Fork-It`），但只改了**表面**：

| 位置 | 当前值 | 应该是什么 |
|------|--------|-----------|
| 磁盘工作目录 | `NoReinventWheel` | 与对外品牌一致（如 `fork-it`） |
| `name:` 字段（SKILL.md） | `fork-it` | `fork-it`（已正确） |
| 源目录 | `Fork-It_en` / `Fork-It_zh` | `fork-it-en` / `fork-it-zh` |
| dist 产物 | `Fork-It_en.skill` / `Fork-It_zh.skill` | `fork-it_en.skill` / `fork-it_zh.skill` |
| README 标题 | `# Fork-It.skill` | 统一品牌，且结构图根目录别写 `Fork-It/` |
| `.skill` 包内目录 | `fork-it/`（正确） | 保持 |

**原则（已更新）**：所有场合一律使用 `fork-it`（kebab 小写）——标识符、URL、SKILL.md 标题、README 展示名等全部统一。展示标题不再保留 `Fork-It` 大写形式（用户已确认要彻底 kebab）。

---

## P0 — 必须修（影响可用性/安全/合规）

> 标记 = 已在此仓库落地修复。

### P0-1. 脚本用 `curl + execSync` 拼命令（注入风险 + 平台脆弱） 已修复
文件：`scripts/github-search.mjs:67-82`、`scripts/repo-detail.mjs:16-31`

```js
const cmd = `curl -s ${headers.join(' ')} "${url}"`;
// headers 里直接拼了： -H "Authorization: token ${process.env.GITHUB_TOKEN}"
```

问题：
1. **命令注入**：`GITHUB_TOKEN` 直接拼进 shell 字符串，含特殊字符即破坏/注入。
2. **依赖 curl**：Windows 上依赖系统 curl，且 `execSync` 走 `%COMSPEC%`（cmd），跨平台脆弱。
3. 错误处理把 GitHub 的真实错误（如 403 限流 `message`）吞掉，统一报 `API_ERROR`，排查困难。

**修复**：Node 18+ 已有全局 `fetch`（你环境是 Node 22/24），直接替换 curl：

```js
const res = await fetch(url, { headers });
const data = await res.json();
if (!res.ok) { /* 用 data.message 报错 */ }
```

零外部依赖、无注入、错误可定位。

**修复（已落地）**：两个脚本均改为 Node 原生 `fetch`，统一 `User-Agent: fork-it-skill`、用 `Bearer` 令牌，并保留 GitHub 真实错误 `message`。已用真实 API 调用验证可用；`node --check` 通过。

### P0-2. 缺失 LICENSE 文件（合规硬伤） 已修复
README.md:258 / README_zh.md:258 都写 `see the [LICENSE](LICENSE) file`，但仓库根目录**没有 LICENSE 文件** → 死链 + 许可声明不成立（MIT 需要附带 LICENSE 文本）。

**修复**：补一份 `LICENSE`（MIT 全文），或把 README 链接去掉/改为说明。

**修复（已落地）**：已新增 `LICENSE`（MIT，版权署名 GDWhisper），README 里 `[LICENSE](LICENSE)` 死链已成立。

### P0-3. 平台定位混乱（openclaw vs Claude Code） 已修复（改为通用 multi-agent）

原始问题：
- SKILL.md frontmatter 带 `metadata.openclaw`（emoji/category/tags）和 `invoke: /fork-it` —— 这是 **openclaw/clawhub 注册表**的格式。
- 但 README 安装指引写的是 **Claude Code**：`~/.claude/skills/fork-it`，且 `clawhub-publish` 技能自称 "Claude Code Skill"。
- Claude Code 原生 skill 只需 `name` + `description`，**没有 `invoke` 字段**，也没有 `metadata.openclaw`。

**决策（用户 2026-07-09 明确）**：不走"二选一绑定"，而是做成**通用 SKILL.md skill**——标准 Markdown 定义 + 共享 Node 脚本，凡是从 `skills/` 目录加载技能的 agent 都能用。因此目标从"选一个平台"升级为"**支持大部分主流 agent**"。

**修复（已落地）**：
- 保留 SKILL.md 的 `metadata.openclaw` 与 `invoke: /fork-it`（ClawHub 发布需要，Claude Code 等会忽略未知字段，无害）。
- README 安装章节改为**通用多 agent 表**（9 个 agent 的 `skills` 目录）：`.agents` / `.codex` / `.cursor` / `.claude` / `.opencode` / `.trae` / `.pi` / `.qoder` / `.codebuddy`，并说明项目级 `.<agent>/skills` 也支持。
- 去掉文档里 "in Claude" 等绑定措辞，改为通用"你的 AI agent"。
- 新增一键安装脚本 `install.sh` / `install.ps1`：按 `--lang` 组装 `fork-it/`，自动探测已安装的 agent 并铺入其 `skills/` 目录；支持 `--all`（全部，不存在则创建）、`--project`（装到当前项目）、`--list`（仅探测）。
- 已实测：`install.sh --all --project --lang zh` 在 9 个 agent 目录均正确生成 `fork-it/{SKILL.md,_meta.json,scripts/*.mjs}`。

---

## P1 — 应该修（正确性/一致性）

### P1-1. i18n 的 `lang` 字段：实现与文档脱节 已修复（改为单语言无关 skill）

原始问题：
- 两个脚本里 `lang` 永远硬编码 `"en"`。
- 但中文 SKILL.md 的"脚本返回值"示例写的是 `"lang": "zh"`，自相矛盾、误导维护者。

经讨论（用户 2026-07-09），**根本不需要双语版本的 skill**：SKILL.md 是给 LLM 看的指令，GitHub 返回的数据本就是英文，而"用什么语言呈现给用户"应该在 LLM 输出前由它按用户语言处理——所以 `lang` 字段本质多余，维护两份几乎相同的双语指令也是负担。

**修复（已落地，采用比原方案 A/B 更彻底的做法）**：
- **合并为单一 `fork-it` skill**：删除 `fork-it-en/` 与 `fork-it-zh/`，新建 `fork-it/SKILL.md`（一份文件）。触发示例**保留中英双语短语**，让 LLM 对中英用户都能正确识别；正文为清晰的英文指令。
- **明确语言规则**：SKILL.md 顶部加 "Language note"——始终用用户使用的语言回复，呈现时把仓库数据翻译过去。
- **脚本彻底去掉 `lang` 字段**：`github-search.mjs` / `repo-detail.mjs` 的成功与错误 JSON 均为语言无关，不再有 `lang` / `--lang` / `currentLang`。
- **打包/安装/文档统一为单包**：`release_script.py` 只产出 `dist/fork-it.skill`；`install.sh`/`install.ps1` 去掉 `--lang`；README 中英文的下载表、安装示例、结构图、输出格式均改为单包、去 `lang`。

### P1-2. 发布脚本 `release_script.py` 脏代码 已修复
文件：`release_script.py`

1. `create_skill_package(lang_code, lang_name)` 的 **`lang_code` 参数从未被使用**（死参数）。
2. 目录名 `'Fork-It_zh'` / `'Fork-It_en'` 硬编码 —— 一旦按 P0 重命名目录，脚本就崩。
3. zip 内部统一用 `fork-it/` 目录，en/zh 两个包解压会**互相覆盖**（虽是分开发，但容易误伤）。
4. 用 `shutil.rmtree(dist)` 整体删 `dist/` —— 若 `dist/` 里有别的重要文件会误删（当前还好，但脆弱）。

**修复（已落地）**：目录名改为从配置表 `LANG_DIRS` 读取（不再硬编码 `Fork-It_*`）；去掉未使用的 `lang_code` 死参；删除前只清 `dist/*.skill`，不动 `dist/` 其它文件；产物名跟随 slug（`fork-it_{lang}.skill`）。

### P1-3. 默认搜索条件可能过苛
`github-search.mjs:18-23`：
- `minStars: 100` 默认过滤掉 <100 star 的优质新项目/小众库。
- `updatedWithin: 365` 默认强制 `pushed:>=近一年`，会排除"稳定但不常更新"的经典库。

**修复**：把默认 `minStars` 降为 0（或 10）、`updatedWithin` 改为可选（默认不限制），在 SKILL.md 里引导 AI 按需求调参，而非写死保守默认值。

### P1-4. README 结构图与真实目录不符
README.md:205-218 / README_zh.md:205-218 画的是：
```
Fork-It/                ← 根目录叫 Fork-It
├── Fork-It_zh/
├── Fork-It_en/
├── scripts/
├── _meta.json
...
```
实际根目录是 `NoReinventWheel`，且 `scripts/` 在根、`Fork-It_*` 是子目录 —— 图本身基本对，但**根标签 `Fork-It/` 是错的**。另外 `graph TD` 写在普通 ``` 代码块里（README.md:141-152），不会渲染成 Mermaid，若想渲染需改成 ```mermaid。

---

## P2 — 可选优化（质量/可维护性）

- **`clawhub-publish` 是孤儿技能** 已修复（定位为项目级 skill）
  原 `clawhub-publish/SKILL.md` 无 `_meta.json`、无版本、无脚本，混在仓库根目录。经用户确认：它是**维护者发布 fork-it 用的项目级辅助 skill**，**不随 fork-it 发布出去**。已移至 `.agents/skills/clawhub-publish/SKILL.md`（项目级 skills 目录，会被加载但不会被 `release_script.py` 打包进 `.skill`）。项目级 skill 本就无需 `_meta.json`，原"缺 _meta.json"的担忧随之消解。README 中两处引用已改为指向 `.agents/skills/clawhub-publish/`。
- **缺 `package.json`**：scripts 用 ES Module（`.mjs` 撑着）。加一个 `package.json`（`"type":"module"`、可选 `engines.node >=18`）能显式声明运行环境，也方便以后加依赖（如重试/限流库）。
- **SKILL.md 过于冗长**：两份 SKILL.md 近 200 行，大量"何时触发/何时安静"的重复枚举。Claude Code 的 SKILL.md 宜精简；可把长列表收敛为决策要点，细节放 README。
- **`query_string` 字段未文档化**：脚本返回里多带 `query_string`（`github-search.mjs:143`），但 SKILL.md 的 JSON 示例没它，易让维护者困惑。要么文档补、要么删掉。
- **`_meta.json` 与文档示例不一致**：fork-it 真实 `_meta.json` 有 `ownerId`/`publishedAt`，而 `.agents/skills/clawhub-publish/SKILL.md` 里的示例只有 `slug`/`version`。文档应同步（低优先级）。
- **品牌用词**：`ForkIt v2.0`（SKILL.md 页脚）、`User-Agent: ForkIt-Skill`（脚本）、`Fork-It`（标题）三处写法不一致，统一为 `fork-it`（UA 可用 `fork-it-skill`）。

---

## 建议的修复顺序

1. **P0-3** 先定平台（决定 frontmatter 怎么改）→ 已定为"通用 multi-agent"
2. **P0-1** 脚本改 `fetch`（最值钱、最安全的一改）→ 已修复
3. **P0-2** 补 LICENSE → 已修复
4. **P0 + P1-2** 统一命名（`Fork-It_*` → `fork-it-*`、dist 文件名、README 标题、发布脚本配置）→ 已修复（命名）+ 已修复（P1-2 发布脚本）
5. **P1-1** 修 i18n（合并为单语言无关 skill）→ 已修复
6. **P1-4 / P2** 打磨 → 待办

---

## 已修复状态汇总（截至 2026-07-09）

| 编号 | 问题 | 状态 |
|------|------|------|
| P0-1 | curl + execSync 注入风险 | 已修复（fetch） |
| P0-2 | 缺 LICENSE | 已修复 |
| P0-3 | 平台定位混乱 | 已修复（通用 multi-agent + install.mjs / npx） |
| P0 命名 | Fork-It 命名/标题分裂 | 已修复（fork-it-*；SKILL.md 标题 `# Fork-It` → `# fork-it` 已统一） |
| P1-2 | 发布脚本脏代码 | 已修复 |
| P1-1 | i18n lang 文档/实现脱节（合并为单语言无关 skill） | 已修复 |
| P1-3 | 默认搜索过苛（minStars:100 / updatedWithin:365） | 已修复（默认 0，靠 sort:stars 排序；需要时再用 flag 收紧） |
| P1-4 | README 结构图/图块不符 | 待办 |
| P2 | 孤儿技能(clawhub-publish 已归位项目级) / 缺 package.json / SKILL 冗长等 | 部分（孤儿已解决；SKILL 冗长已通过"方法论+参考"拆分解决；package.json 已补并接入 npx 安装） |

---

## 一句话总结

> 这不是"能不能用"的问题，是"像不像一个正经发布的 skill"的问题。先把**平台定位**和**命名一致性**定下来，再用 `fetch` 干掉 `curl` 这枚定时炸弹，补上 LICENSE，这个技能就算脱胎换骨了。现在前三项 P0 已落地——它是个能一键装进 9 个主流 agent 的通用 skill 了。

---

## 重构记录（2026-07-09 晚）：skill = 方法论，description = 加载门

用户核心判断：skill 正文应是**方法论**（加载后告诉 agent 怎么做），营销/参考内容不该塞进常驻 context；`description` 才是引导 agent 加载的触发器，且应言简意赅。

按此做了 **B 方案（方法/参考拆分）**：

- **`fork-it/SKILL.md`**（157 行 → 41 行）只留方法论：
  - frontmatter：`name` / `description`（已强化为"写代码前搜 GitHub；调试/学习/具体算法除外"）/ `metadata.openclaw` / `invoke`。
  - 正文：语言规则、何时用/不用、四步工作流（搜索→四标签分析→推荐→按需取详情）、两命令、展示与速率备注。
  - **删掉**的废话：开头营销段、"Find it. Fork it." 页脚、触发话术模板、完整 JSON 结构、完整参数表、Data Sources。
- **`fork-it/references/schema.md`**（新增）：承接移出的脚本 JSON 完整结构、全部参数表、展示规则、repo-detail 说明——agent 按需读取，不进常驻 context。
- **营销废话搬进 README**（中英文 README 本就含 Core Philosophy / Why fork-it 等，已对齐，无需重复添加）。
- **打包/安装同步**：`release_script.py`、`install.sh`、`install.ps1` 均新增 `fork-it/references/` 的打包与拷贝；已验证 `dist/fork-it.skill` 含 `references/schema.md`，安装到 9 个 agent 的产物树均含该文件。
- **P1-4（README 结构图）** 同步：项目结构图补充 `references/` 说明。

剩余待办：P1-4（README 结构图/图块待渲染）。

---

## npx 一键安装（2026-07-09 晚）：增强安装便捷度

- 新增 `package.json`（name `@gdwhisper/fork-it`，`bin.fork-it` → `./install.mjs`，`type: module`，`engines.node >=18`，`files` 含 `fork-it/ scripts/ _meta.json install.mjs`），使 `npx @gdwhisper/fork-it` 与 `npx github:GDWhisper/fork-it` 均可一行安装。
- 新增 `install.mjs` 作为**跨平台唯一安装器**（取代 install.sh/install.ps1 的重复逻辑），支持 `--all/--project/--list/--help/--dry-run`；`install.sh`/`install.ps1` 改为调用 `node install.mjs` 的薄包装。
- 已实测：`node install.mjs --list` 探测到 home 下 6 个 agent；`--all --project` 在 9 个 agent 目录均正确生成 `fork-it/{SKILL.md,_meta.json,references/schema.md,scripts/*.mjs}`；install.sh 薄包装在 Git Bash 下因 `pwd` 路径混叠报错，已改为先 `cd` 脚本目录再用相对路径 `./install.mjs` 修复。
- **待用户手动执行**：`npm publish`（使 `npx @gdwhisper/fork-it` 生效）；`npx github:GDWhisper/fork-it` 无需发布即可用。
