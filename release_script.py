#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fork-it 发布脚本
生成 dist 目录，包含单个技能包压缩文件 fork-it.skill

包结构（解压后即为可直接使用的技能目录）：
  fork-it/
  ├── SKILL.md          # 方法论（给 LLM 的指令）
  ├── _meta.json        # 元数据
  ├── references/       # 参考文档（按需读取，不进常驻 context）
  │   └── schema.md
  └── scripts/          # 共享脚本
      ├── github-search.mjs
      └── repo-detail.mjs

说明：技能只维护一份 SKILL.md（内容为给 LLM 看的指令），输出语言由 LLM
在呈现给用户前按用户语言处理，因此无需双语版本，也无需 --lang 参数。
"""

import os
import zipfile
from pathlib import Path


SKILL_DIR = "fork-it"          # 源目录：单份技能
PACKAGE_NAME = "fork-it.skill"  # 产物名（与 slug 一致）


def create_skill_package():
    """
    创建单个技能包。

    Returns:
        str: 生成的压缩包路径
    """
    root_dir = Path(__file__).parent

    skill_md_path = root_dir / SKILL_DIR / "SKILL.md"
    meta_json_path = root_dir / "_meta.json"
    scripts_dir = root_dir / "scripts"

    dist_dir = root_dir / "dist"
    dist_dir.mkdir(exist_ok=True)

    zip_path = dist_dir / PACKAGE_NAME

    print(f"正在打包 {SKILL_DIR}...")

    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # 包内统一放在 fork-it/ 下（与 slug 一致）
        if skill_md_path.exists():
            zipf.write(skill_md_path, f"{SKILL_DIR}/SKILL.md")
            print("  + 添加 fork-it/SKILL.md")
        else:
            raise FileNotFoundError(f"找不到文件: {skill_md_path}")

        if meta_json_path.exists():
            zipf.write(meta_json_path, f"{SKILL_DIR}/_meta.json")
            print("  + 添加 fork-it/_meta.json")
        else:
            raise FileNotFoundError(f"找不到文件: {meta_json_path}")

        if scripts_dir.exists() and scripts_dir.is_dir():
            for file_path in sorted(scripts_dir.iterdir()):
                if file_path.is_file() and file_path.suffix == ".mjs":
                    arc_name = f"{SKILL_DIR}/scripts/{file_path.name}"
                    zipf.write(file_path, arc_name)
                    print(f"  + 添加 fork-it/scripts/{file_path.name}")
        else:
            raise FileNotFoundError(f"找不到目录: {scripts_dir}")

        # 参考文档（按需读取，不进常驻 context）
        references_dir = root_dir / SKILL_DIR / "references"
        if references_dir.exists() and references_dir.is_dir():
            for file_path in sorted(references_dir.iterdir()):
                if file_path.is_file():
                    arc_name = f"{SKILL_DIR}/references/{file_path.name}"
                    zipf.write(file_path, arc_name)
                    print(f"  + 添加 fork-it/references/{file_path.name}")

    print(f"已生成: {zip_path}\n")
    return str(zip_path)


def main():
    """主函数"""
    print("=" * 60)
    print("fork-it 发布脚本")
    print("=" * 60)
    print()

    try:
        # 仅清理历史产物，不动 dist/ 下其它文件
        dist_dir = Path(__file__).parent / "dist"
        if dist_dir.exists():
            removed = [f.unlink() or f.name for f in dist_dir.glob("*.skill") if f.is_file()]
            if removed:
                print(f"清理旧产物: {', '.join(removed)}\n")

        pkg_path = create_skill_package()

        print("=" * 60)
        print("发布完成！")
        print("=" * 60)
        print("\n生成的文件:")
        print(f"  {pkg_path}")
        print("\n压缩包包含:")
        print("  - SKILL.md (技能文档，方法论)")
        print("  - _meta.json (元数据)")
        print("  - scripts/ (脚本目录)")
        print("  - references/ (参考文档，按需读取)")
        print()

    except Exception as e:
        print(f"\n错误: {e}")
        raise


if __name__ == "__main__":
    main()
