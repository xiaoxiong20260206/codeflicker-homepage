#!/usr/bin/env python3
"""
里程碑自动生成脚本
从 git commit 历史和日报数据中提取关键事件，生成 milestones-data.json
"""

import json
import os
import re
import subprocess
from datetime import datetime, timedelta
from pathlib import Path

# 配置
OUTPUT_DIR = Path(__file__).parent.parent
OUTPUT_FILE = OUTPUT_DIR / "milestones-data.json"
REPORTS_FILE = OUTPUT_DIR / "reports-data.json"
PROJECTS_FILE = OUTPUT_DIR / "projects-data.json"

# Git 仓库路径列表（扫描这些仓库的 commit 历史）
GIT_REPOS = [
    Path.home() / "Documents" / "Codeflicker" / "个人助理_V1" / "codeflicker-homepage",
    Path.home() / "Documents" / "Codeflicker" / "个人助理_V1",
    Path.home() / "Documents" / "Codeflicker" / "字节AI调研",
]

# 里程碑关键词（优先级从高到低）
MILESTONE_KEYWORDS = {
    "epic": ["重大", "里程碑", "v1.0", "v2.0", "v3.0", "发布", "上线", "部署成功"],
    "feature": ["新增", "实现", "完成", "添加", "支持"],
    "fix": ["修复", "解决", "修正", "优化"],
    "refactor": ["重构", "重写", "优化", "改进"]
}

# 里程碑类型配置
MILESTONE_TYPES = {
    "epic": {"icon": "🏆", "color": "#ffd700", "priority": 1},
    "feature": {"icon": "✨", "color": "#00d4ff", "priority": 2},
    "fix": {"icon": "🔧", "color": "#4ade80", "priority": 3},
    "refactor": {"icon": "♻️", "color": "#a78bfa", "priority": 4}
}


def get_git_commits(repo_path, days=30):
    """获取指定仓库的 git commit 历史"""
    commits = []
    
    if not repo_path.exists():
        return commits
    
    try:
        since_date = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
        result = subprocess.run(
            ["git", "log", f"--since={since_date}", "--pretty=format:%H|%ai|%s", "--no-merges"],
            cwd=repo_path,
            capture_output=True,
            text=True,
            timeout=10
        )
        
        if result.returncode == 0:
            for line in result.stdout.strip().split("\n"):
                if not line:
                    continue
                parts = line.split("|", 2)
                if len(parts) >= 3:
                    commits.append({
                        "hash": parts[0][:7],
                        "date": parts[1].split()[0],  # 只保留日期部分
                        "message": parts[2],
                        "repo": repo_path.name
                    })
    except Exception as e:
        print(f"⚠️ 读取 {repo_path} 的 git 历史失败: {e}")
    
    return commits


def classify_commit(message):
    """根据 commit 消息分类"""
    message_lower = message.lower()
    
    for type_name, keywords in MILESTONE_KEYWORDS.items():
        for kw in keywords:
            if kw in message_lower:
                return type_name
    
    return None


def is_milestone_worthy(commit):
    """判断 commit 是否值得作为里程碑"""
    message = commit["message"]
    
    # 排除自动提交
    if any(x in message.lower() for x in ["auto", "自动", "merge", "wip", "temp"]):
        return False
    
    # 排除太短的消息
    if len(message) < 5:
        return False
    
    # 分类
    milestone_type = classify_commit(message)
    if milestone_type:
        commit["type"] = milestone_type
        return True
    
    return False


def extract_milestones_from_commits(days=30):
    """从 git commit 历史中提取里程碑"""
    milestones = []
    
    for repo_path in GIT_REPOS:
        commits = get_git_commits(repo_path, days)
        
        for commit in commits:
            if is_milestone_worthy(commit):
                type_config = MILESTONE_TYPES.get(commit["type"], MILESTONE_TYPES["feature"])
                milestones.append({
                    "id": f"commit-{commit['hash']}",
                    "date": commit["date"],
                    "title": commit["message"][:50] + ("..." if len(commit["message"]) > 50 else ""),
                    "description": commit["message"],
                    "type": commit["type"],
                    "source": "git",
                    "repo": commit["repo"],
                    "icon": type_config["icon"],
                    "color": type_config["color"],
                    "priority": type_config["priority"]
                })
    
    return milestones


def extract_milestones_from_reports():
    """从日报数据中提取里程碑"""
    milestones = []
    
    if not REPORTS_FILE.exists():
        return milestones
    
    try:
        with open(REPORTS_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        reports = data.get("reports", [])
        
        for report in reports:
            date = report.get("date")
            deliveries = report.get("deliveries", [])
            
            for delivery in deliveries:
                # 只提取项目类型的交付
                if delivery.get("type") == "project":
                    title = delivery.get("title", "未命名项目")
                    commits = delivery.get("commitCount", 0)
                    files = delivery.get("fileChangeCount", 0)
                    
                    # 只有有实际提交的才算里程碑
                    if commits > 0:
                        milestones.append({
                            "id": f"delivery-{date}-{title[:10]}",
                            "date": date,
                            "title": f"📁 {title}: {commits}次提交",
                            "description": f"{title} 项目开发，{commits}次提交，{files}个文件变更",
                            "type": "feature",
                            "source": "report",
                            "icon": "📁",
                            "color": "#00d4ff",
                            "priority": 2
                        })
    except Exception as e:
        print(f"⚠️ 读取日报数据失败: {e}")
    
    return milestones


def extract_milestones_from_projects():
    """从项目数据中提取里程碑（项目完成事件）"""
    milestones = []
    
    if not PROJECTS_FILE.exists():
        return milestones
    
    try:
        with open(PROJECTS_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        projects = data.get("projects", [])
        
        for project in projects:
            if project.get("status") == "deployed" and project.get("completedAt"):
                milestones.append({
                    "id": f"project-{project['id']}",
                    "date": project["completedAt"],
                    "title": f"🚀 {project['name']} 上线",
                    "description": project.get("outcome") or project.get("goal") or "",
                    "type": "epic",
                    "source": "project",
                    "icon": "🚀",
                    "color": "#ffd700",
                    "priority": 1,
                    "url": project.get("url")
                })
    except Exception as e:
        print(f"⚠️ 读取项目数据失败: {e}")
    
    return milestones


def dedupe_and_sort(milestones):
    """去重并排序"""
    # 按 id 去重
    seen = set()
    unique = []
    for m in milestones:
        if m["id"] not in seen:
            seen.add(m["id"])
            unique.append(m)
    
    # 按日期降序、优先级升序排序
    unique.sort(key=lambda x: (-datetime.strptime(x["date"], "%Y-%m-%d").timestamp(), x.get("priority", 99)))
    
    return unique


def main():
    """主函数"""
    print("=" * 60)
    print("🎯 里程碑自动生成器")
    print("=" * 60)
    
    all_milestones = []
    
    # 1. 从 git 历史提取
    print("\n📊 扫描 Git 提交历史...")
    git_milestones = extract_milestones_from_commits(days=30)
    print(f"   发现 {len(git_milestones)} 个 Git 里程碑")
    all_milestones.extend(git_milestones)
    
    # 2. 从日报提取
    print("\n📋 扫描日报数据...")
    report_milestones = extract_milestones_from_reports()
    print(f"   发现 {len(report_milestones)} 个日报里程碑")
    all_milestones.extend(report_milestones)
    
    # 3. 从项目数据提取
    print("\n🚀 扫描项目数据...")
    project_milestones = extract_milestones_from_projects()
    print(f"   发现 {len(project_milestones)} 个项目里程碑")
    all_milestones.extend(project_milestones)
    
    # 4. 去重和排序
    milestones = dedupe_and_sort(all_milestones)
    
    # 5. 生成统计
    stats = {
        "total": len(milestones),
        "epic": len([m for m in milestones if m["type"] == "epic"]),
        "feature": len([m for m in milestones if m["type"] == "feature"]),
        "fix": len([m for m in milestones if m["type"] == "fix"]),
        "refactor": len([m for m in milestones if m["type"] == "refactor"])
    }
    
    # 6. 生成 JSON
    result = {
        "generatedAt": datetime.now().isoformat(),
        "stats": stats,
        "milestones": milestones[:50]  # 最多保留50个
    }
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ milestones-data.json 已生成")
    print(f"   📁 路径: {OUTPUT_FILE}")
    print(f"   📊 总计: {stats['total']} 个里程碑")
    print(f"      🏆 史诗级: {stats['epic']}")
    print(f"      ✨ 新功能: {stats['feature']}")
    print(f"      🔧 修复: {stats['fix']}")
    print(f"      ♻️ 重构: {stats['refactor']}")


if __name__ == "__main__":
    main()
