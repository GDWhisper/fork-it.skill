---
name: clawhub-publish
description: 帮助你将 Claude Code Skill 发布到 ClawHub.ai。安装 CLI → 认证 → 准备目录 → 发布 → 排坑。
invoke: /clawhub-publish
---

# ClawHub 发布助手

指导你将 skill 发布到 [ClawHub.ai](https://clawhub.ai) 的完整流程。

---

## 工作流程

```
准备 → 安装CLI → 登录 → 准备目录 → 发布 → 验证
```

---

## 1. 安装 CLI

```bash
npm install -g clawhub
```

验证安装：
```bash
clawhub --version
```

## 2. 登录

```bash
clawhub login --device
```

会输出一个链接和验证码，打开浏览器访问并输入即可。验证登录：
```bash
clawhub whoami
```

## 3. 准备 skill 目录

发布目录结构示例：
```
my-skill/
├── SKILL.md          # 技能定义（必须有 name: 和 invoke:）
├── _meta.json        # 元数据（slug, version）
└── scripts/          # 配套脚本（可选但推荐）
    └── my-script.mjs
```

SKILL.md 示例：
```yaml
---
name: my-skill
description: 技能描述
invoke: /my-skill
---
```

_meta.json 示例：
```json
{
  "slug": "my-skill",
  "version": "1.0.0"
}
```

## 4. 发布

```bash
clawhub skill publish \
  --slug my-skill \
  --name "My Skill" \
  --version 1.0.0 \
  ./path/to/skill-dir
```

必传参数：
| 参数 | 说明 | 示例 |
|------|------|------|
| `--slug` | 全局唯一标识，安装时用这个 | `my-skill` |
| `--name` | 展示名称，**不传会乱生成** | `"My Skill"` |
| `--version` | 语义化版本号 | `1.0.0` |

可选参数：
| 参数 | 说明 |
|------|------|
| `--changelog` | 版本说明 |
| `--tags` | 标签，默认 `latest` |

## 5. 验证

```bash
clawhub inspect my-skill
```

确认 `Moderation: CLEAN` 表示通过安全扫描。

---

## 已知问题

### 展示名自动生成 bug
不传 `--name` 时 CLI 会从 slug 自动生成奇怪的名字（如 `fork-it` 变成 `Fork It Publish`）。
**解决**：发布时始终传 `--name`。

### 漏传脚本文件
skill 目录中如果有 scripts/ 等附属文件，CLI 会全部打包上传。确保发布前目录结构完整。

### 版本已存在
同一版本不能重复发布。更新内容时递增版本号即可。

---

## 常用命令速查

| 命令 | 用途 |
|------|------|
| `clawhub search <query>` | 搜索已有 skill |
| `clawhub inspect <slug>` | 查看 skill 详情 |
| `clawhub install <slug>` | 安装 skill |
| `clawhub list` | 查看已安装 skill |
| `clawhub whoami` | 查看当前登录 |
| `clawhub skill publish <path>` | 发布 skill |
| `clawhub login --device` | 设备码登录 |
