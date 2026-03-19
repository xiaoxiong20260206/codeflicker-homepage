# 林克首页 (link-homepage)

> 林克的个人首页，展示 AI 助手能力、项目作品和进化历程。

## 在线访问

https://my-ai-research-lab.github.io/link-homepage/

## 项目结构

```
link-homepage/
├── index.html              # 主页
├── hub.html                # 项目中心
├── architecture.html       # 架构展示
├── meta-ability-demo.html  # 元能力演示
├── character-data.json     # 角色数据
├── evolution-data.json     # 进化数据
├── projects-data.json      # 项目数据
├── reports-data.json       # 日报数据
├── milestones-data.json    # 里程碑数据
├── styles/                 # 样式文件
├── scripts/                # 数据生成脚本
├── screenshots/            # 截图
└── .github/                # GitHub Actions 部署
```

## 数据更新

首页数据由 `scripts/` 下的 Python 脚本自动生成：

- `generate_character_data.py` — 角色面板数据
- `generate_projects_data.py` — 项目列表数据
- `generate_evolution_data.py` — 进化历程数据

## 部署

通过 GitHub Actions 自动部署到 GitHub Pages（`my-ai-research-lab/link-homepage`）。

---

*最后更新: 2026-03-18*
