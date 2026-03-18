# 林克 - AI 个人助理系统

> 支持自动日报、技能管理、知识库维护的 AI 个人助理

## 目录结构

```
个人助理_V1/
│
├── output/                         # 所有产出物（统一出口）
│   ├── promotion/                  # 晋升相关（PPT、评审报告）
│   ├── 晋升评审/                   # 晋升评审报告
│   ├── defense-coaching/           # 答辩辅导材料
│   ├── claw-exports/               # Claw 相关导出（架构图、能力包）
│   ├── rd-efficiency/              # 研发效能相关
│   ├── link-abilities-pack/        # 能力包导出
│   ├── brand/                      # 品牌素材
│   ├── articles/                   # 文章产出
│   └── misc/                       # 其他杂项
│
├── projects/                       # 项目工作区
│   ├── claw-strategy/              # Claw 策略项目
│   ├── column-yanglegeai/          # 专栏项目
│   ├── kuaishou-rd-efficiency-architecture/  # 研发效能架构
│   ├── promotion-wangjuan/         # 晋升辅导-王娟
│   └── promotion-wanchangfa/       # 晋升辅导-万长发
│
├── scripts/                        # 核心脚本
│   ├── constants.py                # 统一路径常量
│   ├── daily-routine.sh            # 每日任务入口
│   ├── daily_orchestrator.py       # 每日任务编排器
│   ├── generate_daily_report.py    # 日报生成
│   ├── sync-to-github.sh           # GitHub 同步
│   ├── update-homepage.sh          # 首页更新
│   ├── beiming_*.py                # 北冥神功系列脚本
│   ├── neigong_check.py            # 内功检查
│   └── ppt_latest/                 # PPT 生成模块
│
├── bots/                           # 机器人服务
│   ├── kim-ai-bot/                 # KIM 机器人
│   └── feishu-ai-bot/              # 飞书机器人
│
├── data/                           # 运行时数据
│   ├── logs/                       # 日志
│   ├── cultivation/                # 修炼数据
│   ├── self-drive/                 # 自驱数据
│   ├── night-task/                 # 夜间任务
│   └── *.json                      # 状态文件
│
├── reports/                        # 报告输出
│   ├── daily-*.md                  # 每日日报
│   ├── learning/                   # 学习报告
│   └── memory/                     # 记忆优化报告
│
├── knowledge/                      # 本地知识库
│   ├── ai-insight/                 # AI 洞察（软链接）
│   ├── rd-efficiency/              # 研发效能知识
│   └── self-evolution/             # 自进化相关
│
├── codeflicker-homepage/           # 首页项目（独立 git）
├── github-backup/                  # 备份仓库（独立 git）
├── references/                     # 参考资料（只读）
├── input/                          # 输入材料
├── docs/                           # 项目文档
├── archive/                        # 归档区（历史遗留）
│
├── README.md
├── package.json
└── .gitignore
```

## 🚀 快速开始

### 手动生成日报

```bash
cd /Users/shenlang/Documents/Codeflicker/个人助理_V1
python3 scripts/generate_daily_report.py
```

### 运行每日任务

```bash
./scripts/daily-routine.sh
```

### 同步到 GitHub

```bash
./scripts/sync-to-github.sh
```

### 启动本地预览

```bash
./scripts/start-preview.sh
# 访问 http://localhost:8091
```

## ⏰ 定时任务

每天早上 6:00 自动执行：
1. 生成日报
2. 运行自主学习
3. 优化记忆
4. 同步到 GitHub
5. 更新首页

```bash
# 查看定时任务状态
launchctl list | grep codeflicker

# 手动触发每日任务
./scripts/run-daily-routine.sh
```

## 产出物约定

**所有交付件统一放到 `output/` 目录**，按类型或项目名组织子目录。

## 在线访问

| 链接 | 说明 |
|:---|:---|
| [首页](https://my-ai-research-lab.github.io/codeflicker-homepage/) | 林克个人首页 |
| [AI日报](https://my-ai-research-lab.github.io/ai-daily-report/) | AI 日报系统 |

## 日志

日志统一存放在 `data/logs/`：`daily-routine.log`、`github-sync.log`、`homepage-update.log`

---

*最后更新: 2026-03-17*
